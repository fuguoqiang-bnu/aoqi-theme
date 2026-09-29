// aoqi-legend-theme-plugin —— DSH 宿主半边（host half）
// License: MIT
/**
 * 原插件是 Chrome MV3 扩展（manifest.json + content_scripts + service worker），
 * DSH 是 Electron 应用，没有任何加载 Chrome 扩展的入口，所以它永远「识别不到」。
 *
 * 这个宿主半边把原插件接进 DSH 的插件系统，同时**不改动 src/ 里的原始代码**：
 *   1. /aoqi/src/*、/aoqi/assets/*  → 把插件自己的文件喂给浏览器（改完刷新即生效）
 *   2. /aoqi/status                 → 「已被 DSH 识别」的自证接口（含 content.js 编译检查）
 *   3. /aoqi/notify                 → Windows 原生 toast（最小化也看得见）
 *   4. agent/turn-stopping          → 一轮对话结束自动提醒（原插件的「任务完成通知」）
 */
import { readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'

export const name = 'aoqi-legend-theme'
export const VERSION = '1.0.0-dsh.1'
export const inject = ['webServer']

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const STATE_PATH = path.join(ROOT, 'dsh-state.json')
const DEFAULT_STATE = { notify: true, notifySubagents: false, clickEffects: true, autoScroll: true }
const CHARACTERS = ['小舞王', '小天', '小严', '阿瑞斯', '阿修', '小诺']
const SERVED = [
  'src/content.js',
  'src/styles.css',
  'src/background.js',
  'assets/images/characters.gif',
  'assets/images/characters.png',
]
const TYPES = {
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.md': 'text/plain; charset=utf-8',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
}

let state = { ...DEFAULT_STATE }
let stats = { notified: 0, lastNotifyAt: 0, lastNotifyTitle: '', lastTurn: null, turns: 0 }
let logging = () => {}

function sendJson(res, code, value) {
  const body = JSON.stringify(value)
  res.writeHead(code, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'content-length': Buffer.byteLength(body),
  })
  res.end(body)
}

function readBody(req, limit = 64 * 1024) {
  return new Promise((resolve) => {
    const chunks = []
    let size = 0
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > limit) {
        req.destroy()
        resolve('')
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', () => resolve(''))
  })
}

function safeJoin(relative) {
  const abs = path.resolve(ROOT, relative)
  if (abs !== ROOT && !abs.startsWith(ROOT + path.sep)) return null
  return abs
}

/** Windows 原生 toast（PowerShell WinRT，零依赖）；标题/正文走环境变量，避免转义地狱 */
function showToast(title, body) {
  if (process.platform !== 'win32') return false
  const script = [
    "$ErrorActionPreference='Stop'",
    '$null=[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType=WindowsRuntime]',
    '$t=[Windows.UI.Notifications.ToastNotificationManager]::GetTemplateContent([Windows.UI.Notifications.ToastTemplateType]::ToastText02)',
    '$x=$t.GetElementsByTagName("text")',
    '$x.Item(0).AppendChild($t.CreateTextNode($env:AOQI_TITLE))|Out-Null',
    '$x.Item(1).AppendChild($t.CreateTextNode($env:AOQI_BODY))|Out-Null',
    '$toast=[Windows.UI.Notifications.ToastNotification]::new($t)',
    '$id="{1AC14E77-02E7-4E5D-B744-2EB1AE5198B7}\\WindowsPowerShell\\v1.0\\powershell.exe"',
    '[Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier($id).Show($toast)',
  ].join('; ')
  try {
    const encoded = Buffer.from(script, 'utf16le').toString('base64')
    const child = spawn('powershell.exe', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-EncodedCommand', encoded], {
      detached: true,
      stdio: 'ignore',
      windowsHide: true,
      env: { ...process.env, AOQI_TITLE: String(title).slice(0, 120), AOQI_BODY: String(body).slice(0, 220) },
    })
    child.on('error', () => {})
    child.unref()
    return true
  } catch {
    return false
  }
}

function notify(title, body) {
  const fired = showToast(title, body)
  stats.notified += 1
  stats.lastNotifyAt = Date.now()
  stats.lastNotifyTitle = String(title)
  logging(`notify fired=${fired} title=${title}`)
  return fired
}

function isSubagent(agent) {
  try {
    if (agent === null || typeof agent !== 'object') return false
    if (agent.parent !== undefined && agent.parent !== null) return true
    if (agent.parentId) return true
    if (typeof agent.depth === 'number' && agent.depth > 0) return true
    if (typeof agent.isSubagent === 'boolean') return agent.isSubagent
    if (typeof agent.kind === 'string' && /sub|child/i.test(agent.kind)) return true
  } catch {}
  return false
}

async function loadState() {
  try {
    const raw = await readFile(STATE_PATH, 'utf8')
    const parsed = JSON.parse(raw)
    state = { ...DEFAULT_STATE, ...parsed }
  } catch {
    state = { ...DEFAULT_STATE }
  }
  return state
}

async function saveState() {
  try {
    await writeFile(STATE_PATH, JSON.stringify(state, null, 2), 'utf8')
  } catch {}
}

async function status() {
  const files = {}
  for (const file of SERVED) files[file] = existsSync(path.join(ROOT, file))
  let mainParses = 'ok'
  try {
    const code = await readFile(path.join(ROOT, 'src/content.js'), 'utf8')
    // 只编译不执行：把「原文件语法就是坏的」这种事在状态里直接暴露出来
    new Function(code)
  } catch (error) {
    mainParses = String((error && error.message) || error)
  }
  let pkg = {}
  try {
    pkg = JSON.parse(await readFile(path.join(ROOT, 'package.json'), 'utf8'))
  } catch {}
  return {
    ok: true,
    plugin: 'aoqi-legend-theme-plugin',
    id: name,
    version: VERSION,
    pkgVersion: pkg.version,
    recognized: true,
    host: 'dsh',
    pid: process.pid,
    root: ROOT,
    files,
    mainParses,
    state,
    stats,
    assetBase: '/aoqi/',
  }
}

export async function apply(ctx) {
  await loadState()
  try {
    const dir = path.join(ROOT, 'logs')
    const { mkdir, appendFile } = await import('node:fs/promises')
    await mkdir(dir, { recursive: true })
    logging = (line) => {
      appendFile(path.join(dir, 'aoqi-host.log'), `${new Date().toISOString()}  ${line}\n`, 'utf8').catch(() => {})
    }
  } catch {
    logging = () => {}
  }
  logging(`apply pid=${process.pid} version=${VERSION}`)

  // ── HTTP 路由：静态资源 + 通知 + 状态 ────────────────────────────────
  ctx.effect(() =>
    ctx.webServer.register({
      kind: 'prefix',
      path: '/aoqi',
      handler: async (req, res) => {
        let pathname = '/'
        try {
          pathname = decodeURIComponent(new URL(req.url ?? '/', 'http://dsh.invalid').pathname)
        } catch {}
        const rel = pathname.replace(/^\/aoqi\/?/, '')

        if (rel === '' || rel === 'ping') {
          return sendJson(res, 200, { ok: true, name, version: VERSION, pid: process.pid, time: Date.now() })
        }
        if (rel === 'status') return sendJson(res, 200, await status())

        if (rel === 'state' || rel === 'config') {
          if (req.method === 'POST') {
            const raw = await readBody(req)
            try {
              const patch = JSON.parse(raw || '{}')
              state = { ...state, ...patch }
              await saveState()
            } catch {}
          }
          return sendJson(res, 200, { ok: true, state })
        }

        if (rel === 'notify' || rel === 'notify-test') {
          let payload = {}
          if (req.method === 'POST') {
            try {
              payload = JSON.parse((await readBody(req)) || '{}')
            } catch {}
          }
          const title = payload.title || '奥奇传说 · 任务完成！'
          const body = payload.message || payload.body || 'DeepSeek 已经完成了你的请求，快来查看吧！'
          const fired = state.notify === false ? false : notify(title, body)
          return sendJson(res, 200, { ok: true, fired, sound: asBool(payload.sound, true), notifyEnabled: state.notify !== false })
        }

        // 静态资源：只允许 src/ 与 assets/
        if (rel.startsWith('src/') || rel.startsWith('assets/')) {
          const abs = safeJoin(rel)
          if (abs === null || !existsSync(abs)) {
            res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
            return res.end(`aoqi: not found: ${rel}\n`)
          }
          const body = await readFile(abs)
          res.writeHead(200, {
            'content-type': TYPES[path.extname(abs).toLowerCase()] || 'application/octet-stream',
            'cache-control': 'no-cache',
            'content-length': body.length,
          })
          return res.end(body)
        }

        res.writeHead(404, { 'content-type': 'application/json; charset=utf-8' })
        return res.end(JSON.stringify({ ok: false, error: 'not-found', path: pathname }))
      },
    }),
  )

  // ── 任务完成提醒（原插件的「任务完成通知」，这里用系统 toast 才能最小化也看到）──
  try {
    ctx.on('agent/turn-stopping', (payload) => {
      try {
        const agent = payload && payload.agent
        stats.turns += 1
        stats.lastTurn = payload && typeof payload.turn === 'number' ? payload.turn : null
        if (state.notify === false) return
        if (isSubagent(agent) && state.notifySubagents !== true) return
        const who = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)]
        notify('奥奇传说 · 任务完成！', `DeepSeek 已完成本轮请求，${who} 来提醒你啦～`)
      } catch (error) {
        logging(`notify hook error: ${String((error && error.message) || error)}`)
      }
      // 注意：这里绝对不能 return 任何值——cordis 的 serial 派发会因此短路掉后续监听器
    })
  } catch (error) {
    logging(`event unavailable: agent/turn-stopping (${String((error && error.message) || error)})`)
  }
}

function asBool(value, fallback) {
  return typeof value === 'boolean' ? value : fallback
}
