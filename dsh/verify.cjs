/**
 * 奥奇传说主题插件 —— DSH 端到端验证（真实 Edge + CDP）
 *   node dsh/verify.cjs
 * 判据：宿主被 DSH 加载 / 浏览器适配层启动 / 原 content.js 真的执行 /
 *       角色动画条与控制面板挂载 / 点击特效出粒子 / 通知走系统 toast
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const { createHash, createHmac } = require('crypto');

const EDGE = process.env.DSH_EDGE || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = Number(process.env.DSH_CDP_PORT || 9342);
const DSH = process.env.DSH_WEB_URL || 'http://127.0.0.1:19387';
const AUTHORITY = process.env.DSH_AUTHORITY || '127.0.0.1:19387';

const b64url = (b) => Buffer.from(b).toString('base64').replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
const unb64url = (t) => Buffer.from(t.replaceAll('-', '+').replaceAll('_', '/') + '='.repeat((4 - (t.length % 4)) % 4), 'base64');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function mintCookie() {
  const cred = fs.readFileSync(path.join(os.homedir(), '.dsh', '.credentials.yaml'), 'utf8');
  const secret = unb64url(cred.match(/client-connection\/browser-session:[\s\S]*?secret:\s*(\S+)/)[1]);
  const name = 'dsh-auth-' + b64url(createHash('sha256').update(AUTHORITY).digest());
  const now = Date.now();
  const body = b64url(Buffer.from(JSON.stringify({ version: 1, authority: AUTHORITY, issuedAt: now, expiresAt: now + 3600e3 }), 'utf8'));
  return { name, value: 'v1.' + body + '.' + b64url(createHmac('sha256', secret).update(body).digest()) };
}

function connect(url) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    let id = 0;
    const pending = new Map();
    ws.addEventListener('message', (ev) => {
      const m = JSON.parse(ev.data);
      if (m.id !== undefined && pending.has(m.id)) {
        const p = pending.get(m.id); pending.delete(m.id);
        m.error ? p.reject(new Error(JSON.stringify(m.error))) : p.resolve(m.result);
      }
    });
    ws.addEventListener('open', () => resolve({
      send(me, p) { const mid = ++id; return new Promise((res, rej) => { pending.set(mid, { resolve: res, reject: rej }); ws.send(JSON.stringify({ id: mid, method: me, params: p || {} })); }); },
      close() { ws.close(); },
    }));
    ws.addEventListener('error', () => reject(new Error('ws error')));
  });
}

const results = [];
const say = (ok, label, detail) => { results.push(ok); console.log((ok ? 'PASS' : 'FAIL') + '  ' + label + (detail ? '  — ' + detail : '')); };
async function get(p) {
  try { const r = await fetch(DSH + p, { cache: 'no-store' }); return { status: r.status, json: await r.json().catch(() => null) }; }
  catch (e) { return { status: 0, json: null, error: String(e && e.message) }; }
}

(async () => {
  // ── 宿主侧 ────────────────────────────────────────────────────────────
  const ping = await get('/aoqi/ping');
  say(ping.status === 200 && ping.json && ping.json.name === 'aoqi-legend-theme', '宿主半边已被 DSH 加载', JSON.stringify(ping.json));
  const status = await get('/aoqi/status');
  const st = status.json || {};
  say(st.recognized === true, 'DSH 侧自证接口可用（/aoqi/status）', 'root=' + st.root);
  say(st.mainParses === 'ok', '原 src/content.js 语法正确（可被浏览器执行）', 'mainParses=' + st.mainParses);
  const filesOk = st.files && Object.values(st.files).every(Boolean);
  say(filesOk === true, '插件文件齐全（src + assets 都能被宿主读到）', JSON.stringify(st.files));

  // ── 浏览器侧 ──────────────────────────────────────────────────────────
  const ud = path.join(os.tmpdir(), 'dsh-aoqi-' + Date.now());
  const edge = spawn(EDGE, ['--headless=new', '--remote-debugging-port=' + PORT, '--user-data-dir=' + ud,
    '--no-first-run', '--no-default-browser-check', '--disable-gpu', '--window-size=1400,940', '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });
  let cdp = null;
  try {
    let up = null;
    for (let i = 0; i < 60; i++) { try { up = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json(); break; } catch { await sleep(500); } }
    if (!up) throw new Error('devtools 未就绪');
    const page = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find((t) => t.type === 'page');
    cdp = await connect(page.webSocketDebuggerUrl);
    await cdp.send('Page.enable'); await cdp.send('Runtime.enable'); await cdp.send('Network.enable');
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1400, height: 940, deviceScaleFactor: 1, mobile: false });
    const cookie = mintCookie();
    await cdp.send('Network.setCookie', { name: cookie.name, value: cookie.value, domain: '127.0.0.1', path: '/', httpOnly: true, sameSite: 'Strict' });

    const errors = [];
    cdp.send('Log.enable').catch(() => {});
    const ev = async (expr) => {
      const r = await cdp.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
      if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails.exception || r.exceptionDetails));
      return r.result.value;
    };

    await cdp.send('Page.navigate', { url: DSH + '/' });
    let ready = false;
    for (let i = 0; i < 45; i++) {
      await sleep(1000);
      try {
        await ev(`(() => { const d = document.querySelector('[aria-label="预览版说明"]'); if (d) { const b = d.querySelector('button'); if (b) b.click(); } })()`);
        if (await ev('typeof window.__AOQI_DSH__ === "object"')) { ready = true; break; }
      } catch {}
    }
    say(ready, '浏览器适配层已注入（window.__AOQI_DSH__）', ready ? 'load=' + await ev('window.__AOQI_DSH__.load') : '超时');
    if (!ready) throw new Error('适配层未启动');

    // 原插件的 UI 是在 init() 里 setTimeout(..., 1000) 之后才挂的，这里等它一下
    for (let i = 0; i < 20; i++) {
      if ((await ev('document.querySelectorAll(".aoqi-control-panel").length')) > 0) break;
      await sleep(500);
    }

    const boot = await ev('JSON.stringify({run: window.__AOQI_DSH__.originalRan, panel: window.__AOQI_DSH__.panel(), deco: window.__AOQI_DSH__.decoration(), cfg: window.__AOQI_DSH__.config()})');
    const bootObj = JSON.parse(boot);
    say(bootObj.run === true, '原插件 content.js 真的执行了（它自己挂的调试句柄在）', 'originalRan=' + bootObj.run);
    say(bootObj.deco === 1, '角色动画条已挂到底层（用的就是你的 characters.gif）', 'decoration=' + bootObj.deco);
    say(bootObj.panel === 1, '控制面板已挂载（任务完成通知 / 点击特效 / 自动滚动）', 'panel=' + bootObj.panel);

    const decoInfo = JSON.parse(await ev(`(() => {
      const d = document.querySelector('.aoqi-character-decoration');
      const cs = getComputedStyle(d);
      return JSON.stringify({ w: cs.width, h: cs.height, img: cs.backgroundImage.slice(0, 90), anim: cs.animationName, pos: cs.position });
    })()`));
    say(/characters\.gif/.test(decoInfo.img), '动画条背景指向宿主的素材路由（走 /aoqi/assets）', decoInfo.img);
    say(decoInfo.w === '300px' && decoInfo.anim === 'float', '动画条尺寸与漂浮动画生效（原 CSS 120×120 会挤成一条缝）', decoInfo.w + ' × ' + decoInfo.h + ' / ' + decoInfo.anim);

    const checkboxes = await ev(`document.querySelectorAll('.aoqi-control-panel input[type=checkbox]').length`);
    say(checkboxes === 3, '控制面板三个开关齐备', 'checkboxes=' + checkboxes);

    // 点击特效
    await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: 700, y: 500, button: 'left', clickCount: 1 });
    await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 700, y: 500, button: 'left', clickCount: 1 });
    await sleep(300);
    const particles = await ev('window.__AOQI_DSH__.particles()');
    say(particles > 0, '点击真的出特效粒子（原 createClickEffect 逻辑）', 'particles=' + particles);

    // 页面内通知（原 createInPageNotification）
    await ev(`window.__AOQI_THEME__.showNotification('验证通知', '这句话应该出现在页面右上角', '小诺')`);
    await sleep(400);
    const notif = await ev(`document.querySelectorAll('.aoqi-notification').length`);
    say(notif > 0, '页面内通知会弹出（原 showNotification 逻辑）', '.aoqi-notification=' + notif);

    // 系统 toast
    const before = (await get('/aoqi/status')).json.stats.notified;
    const fire = await fetch(DSH + '/aoqi/notify', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ title: '奥奇传说 · 验证', message: '系统通知测试', sound: true }) }).then((r) => r.json());
    say(fire.ok === true && fire.fired === true, '系统 toast 真的发出去了（最小化也看得见）', JSON.stringify(fire));
    const after = (await get('/aoqi/status')).json.stats.notified;
    say(after === before + 1, '通知计数在宿主侧累加', `${before} → ${after}`);

    cdp.close();
  } finally {
    try { edge.kill(); } catch {}
  }
  const passed = results.filter(Boolean).length;
  console.log('\nAOQI DSH E2E: ' + passed + '/' + results.length + ' checks passed');
  process.exitCode = passed === results.length ? 0 : 1;
})().catch((e) => { console.error('FATAL ' + e.message); process.exitCode = 2; });
