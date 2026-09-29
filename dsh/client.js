// aoqi-legend-theme-plugin —— DSH 浏览器半边（client bundle）
// License: MIT
/**
 * 原插件是 Chrome 扩展：content.js 里用了 chrome.runtime.getURL / chrome.storage /
 * chrome.notifications，还直接 new Notification(...)。浏览器里没有这些 API，
 * 所以这一层做三件事：
 *   1. 注入原插件的 src/styles.css，并加少量 DSH 专用覆盖（原 CSS 把 580×122 的
 *      角色动画条塞进 120×120 的方块，contain 之后几乎看不见；这里按原始比例放大）
 *   2. 提供 chrome.* 兼容层（资源地址走宿主 /aoqi 路由、storage 落 localStorage、
 *      通知转发到宿主的 Windows 原生 toast）
 *   3. 以 <script> 方式加载原插件 src/content.js —— **原文件不经过任何改写**，
 *      你改完 src/content.js 刷新页面就生效
 */
window.__ModuleLoader__.load({
  // 必须与 package.json 的包名完全一致：DSH 会把这个包按包名加载一次，
  // 若这里的 id 不同（例如只写 aoqi-legend-theme），模块系统会认为
  // 「同一个包注册了两个工厂」并抛 duplicate factory registration，
  // 结果就是整个插件激活失败（web boot: 1 entry did not activate）。
  id: 'aoqi-legend-theme-plugin',
  factory: function () {
    var module = { exports: {} }
    var exports = module.exports
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })

    var VERSION = '1.0.0-dsh.1'
    var BASE = '/aoqi/'
    var DONE = false

    // DSH 专用覆盖：让角色动画条按原始比例显示出来（原 CSS 只有 120×120 方块）
    var OVERRIDE_CSS = [
      '/* DSH 适配覆盖（只影响本插件的元素，不动 DSH 自己的样式） */',
      '.aoqi-character-decoration {',
      '  width: 300px !important;',
      '  height: 63px !important;',
      '  bottom: 14px !important;',
      '  right: 14px !important;',
      '  background-size: contain !important;',
      '  background-position: center bottom !important;',
      '  filter: drop-shadow(0 6px 14px rgba(80, 60, 140, 0.28));',
      '}',
      '.aoqi-control-panel { font-family: inherit; }',
      '.aoqi-control-panel input[type="checkbox"] { width: 14px; height: 14px; vertical-align: -2px; }',
    ].join('\n')

    function toast(title, body, sound) {
      try {
        fetch(BASE + 'notify', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ title: title, message: body, sound: sound !== false }),
        }).catch(function () {})
      } catch (error) {
        console.warn('[aoqi] 通知转发失败：', error)
      }
    }

    /** chrome.* 兼容层：让原 content.js 一行不改也能跑 */
    function installChromeShim() {
      var store = {
        get: function (keys, cb) {
          var out = {}
          var list = Array.isArray(keys) ? keys : Object.keys(keys || {})
          for (var i = 0; i < list.length; i++) {
            var raw = window.localStorage.getItem('aoqi.' + list[i])
            if (raw !== null) {
              try { out[list[i]] = JSON.parse(raw) } catch { out[list[i]] = raw }
            }
          }
          if (typeof cb === 'function') cb(out)
          return Promise.resolve(out)
        },
        set: function (values, cb) {
          for (var key in values) {
            if (Object.prototype.hasOwnProperty.call(values, key)) {
              window.localStorage.setItem('aoqi.' + key, JSON.stringify(values[key]))
            }
          }
          if (typeof cb === 'function') cb()
          return Promise.resolve()
        },
      }
      var chromeShim = {
        runtime: {
          id: 'aoqi-legend-theme',
          getURL: function (relative) { return BASE + String(relative).replace(/^\/+/, '') },
          sendMessage: function (message, cb) {
            if (message && (message.type === 'TASK_COMPLETED' || message.title)) {
              toast(message.title || '奥奇传说 · 任务完成！', message.message || 'DeepSeek 已完成你的请求')
            }
            if (typeof cb === 'function') cb({ ok: true })
            return Promise.resolve({ ok: true })
          },
          onMessage: { addListener: function () {} },
          lastError: null,
        },
        storage: { sync: store, local: store },
        notifications: {
          create: function (id, options) {
            var opts = options || id || {}
            toast(opts.title || '奥奇传说', opts.message || '')
            return id
          },
          clear: function () {},
        },
        windows: { WINDOW_ID_NONE: -1, onFocusChanged: { addListener: function () {} } },
        tabs: { onUpdated: { addListener: function () {} } },
        permissions: { request: function () {}, contains: function () {} },
      }
      if (typeof window.chrome === 'undefined' || !window.chrome.runtime) {
        window.chrome = chromeShim
      } else {
        // 已有的 chrome 对象（Electron 里可能只提供一部分）按需补齐
        for (var group in chromeShim) {
          if (Object.prototype.hasOwnProperty.call(chromeShim, group) && !window.chrome[group]) {
            window.chrome[group] = chromeShim[group]
          }
        }
      }
      return chromeShim
    }

    /** 用系统 toast 顶掉页面 Notification：窗口最小化时也收得到 */
    function installNotificationBridge() {
      var Native = window.Notification
      function Bridged(title, options) {
        var opts = options || {}
        toast(title, opts.body || '')
        return { close: function () {}, onclick: null, onclose: null }
      }
      Bridged.permission = 'granted'
      Bridged.requestPermission = function (cb) {
        if (typeof cb === 'function') cb('granted')
        return Promise.resolve('granted')
      }
      try {
        Object.defineProperty(Bridged, 'maxActions', { value: 0 })
      } catch {}
      Bridged.__aoqiNative = Native
      try {
        window.Notification = Bridged
      } catch (error) {
        console.warn('[aoqi] 无法接管 Notification：', error)
      }
    }

    function injectStyles() {
      if (document.getElementById('aoqi-theme-css') === null) {
        var link = document.createElement('link')
        link.id = 'aoqi-theme-css'
        link.rel = 'stylesheet'
        link.href = BASE + 'src/styles.css'
        document.head.appendChild(link)
      }
      if (document.getElementById('aoqi-theme-override') === null) {
        var style = document.createElement('style')
        style.id = 'aoqi-theme-override'
        style.textContent = OVERRIDE_CSS
        document.head.appendChild(style)
      }
    }

    function loadOriginal() {
      return new Promise(function (resolve) {
        if (document.getElementById('aoqi-theme-main') !== null) return resolve('already')
        var script = document.createElement('script')
        script.id = 'aoqi-theme-main'
        script.defer = true
        script.src = BASE + 'src/content.js'
        script.onload = function () { resolve('loaded') }
        script.onerror = function () { resolve('error') }
        document.head.appendChild(script)
      })
    }

    function boot() {
      if (DONE) return Promise.resolve('already-booted')
      DONE = true
      installChromeShim()
      installNotificationBridge()
      injectStyles()
      return loadOriginal().then(function (how) {
        var ok = typeof window.__AOQI_THEME__ === 'object'
        window.__AOQI_DSH__ = {
          version: VERSION,
          load: how,
          originalRan: ok,
          panel: function () { return document.querySelectorAll('.aoqi-control-panel').length },
          decoration: function () { return document.querySelectorAll('.aoqi-character-decoration').length },
          particles: function () { return document.querySelectorAll('.click-effect').length },
          config: function () { return window.__AOQI_THEME__ ? window.__AOQI_THEME__.CONFIG : null },
          notify: function (title, body) { toast(title || '奥奇传说', body || '测试通知') },
          ping: function () { return fetch(BASE + 'ping').then(function (r) { return r.json() }) },
          status: function () { return fetch(BASE + 'status').then(function (r) { return r.json() }) },
        }
        console.log('[aoqi-legend-theme] DSH 适配层就绪：' + how + '，原插件已运行=' + ok)
        return how
      })
    }

    exports.inject = ['theme', 'slots']
    exports.apply = function (ctx) {
      ctx.effect(function () {
        boot()
        return function () {
          DONE = false
        }
      }, 'aoqi-legend-theme: boot')
    }

    exports.VERSION = VERSION
    return module.exports
  },
})
