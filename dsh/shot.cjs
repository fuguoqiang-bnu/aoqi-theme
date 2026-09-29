/**
 * 给 DSH 里的奥奇传说主题截图（只截右下角插件区域，不含聊天内容）
 *   node dsh/shot.cjs   →  docs/dsh-preview.png
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const { createHash, createHmac } = require('crypto');

const EDGE = process.env.DSH_EDGE || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = Number(process.env.DSH_CDP_PORT || 9344);
const DSH = process.env.DSH_WEB_URL || 'http://127.0.0.1:19387';
const AUTHORITY = process.env.DSH_AUTHORITY || '127.0.0.1:19387';
const OUT = path.join(__dirname, '..', 'docs', 'dsh-preview.png');

const b64url = (b) => Buffer.from(b).toString('base64').replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
const unb64url = (t) => Buffer.from(t.replaceAll('-', '+').replaceAll('_', '/') + '='.repeat((4 - (t.length % 4)) % 4), 'base64');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function connect(url) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url); let id = 0; const pending = new Map();
    ws.addEventListener('message', (ev) => {
      const m = JSON.parse(ev.data);
      if (m.id !== undefined && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(new Error(JSON.stringify(m.error))) : p.resolve(m.result); }
    });
    ws.addEventListener('open', () => resolve({
      send(me, p) { const mid = ++id; return new Promise((res, rej) => { pending.set(mid, { resolve: res, reject: rej }); ws.send(JSON.stringify({ id: mid, method: me, params: p || {} })); }); },
      close() { ws.close(); },
    }));
    ws.addEventListener('error', () => reject(new Error('ws error')));
  });
}

(async () => {
  const cred = fs.readFileSync(path.join(os.homedir(), '.dsh', '.credentials.yaml'), 'utf8');
  const secret = unb64url(cred.match(/client-connection\/browser-session:[\s\S]*?secret:\s*(\S+)/)[1]);
  const cookieName = 'dsh-auth-' + b64url(createHash('sha256').update(AUTHORITY).digest());
  const now = Date.now();
  const body = b64url(Buffer.from(JSON.stringify({ version: 1, authority: AUTHORITY, issuedAt: now, expiresAt: now + 3600e3 }), 'utf8'));
  const cookieValue = 'v1.' + body + '.' + b64url(createHmac('sha256', secret).update(body).digest());

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  const ud = path.join(os.tmpdir(), 'dsh-shot-aoqi-' + Date.now());
  const edge = spawn(EDGE, ['--headless=new', '--remote-debugging-port=' + PORT, '--user-data-dir=' + ud, '--no-first-run', '--disable-gpu', '--window-size=1400,940', '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });
  try {
    let up = null;
    for (let i = 0; i < 60; i++) { try { up = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json(); break; } catch { await sleep(500); } }
    if (!up) throw new Error('devtools 未就绪');
    const page = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find((t) => t.type === 'page');
    const cdp = await connect(page.webSocketDebuggerUrl);
    await cdp.send('Page.enable'); await cdp.send('Runtime.enable'); await cdp.send('Network.enable');
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1400, height: 940, deviceScaleFactor: 2, mobile: false });
    const ev = async (e) => { const r = await cdp.send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails.exception)); return r.result.value; };
    await cdp.send('Network.setCookie', { name: cookieName, value: cookieValue, domain: '127.0.0.1', path: '/', httpOnly: true, sameSite: 'Strict' });
    await cdp.send('Page.navigate', { url: DSH + '/' });

    let ok = false;
    for (let i = 0; i < 45; i++) {
      await sleep(1000);
      try {
        await ev(`(() => { const d = document.querySelector('[aria-label="预览版说明"]'); if (d) { const b = d.querySelector('button'); if (b) b.click(); } })()`);
        if ((await ev('document.querySelectorAll(".aoqi-character-decoration").length')) > 0) { ok = true; break; }
      } catch {}
    }
    if (!ok) throw new Error('角色动画条未出现');
    await sleep(1200);
    // 让面板里的开关展示为「已开启」状态更直观
    const clip = JSON.parse(await ev(`(() => {
      const d = document.querySelector('.aoqi-character-decoration').getBoundingClientRect();
      // 控制面板外层是普通容器（position:fixed 在其子元素上），量它会把区域算歪
      const inner = document.querySelector('.aoqi-control-panel > div') || document.querySelector('.aoqi-control-panel');
      const p = inner.getBoundingClientRect();
      const left = Math.max(0, Math.min(d.left, p.left) - 24);
      const top = Math.max(0, Math.min(d.top, p.top) - 24);
      const right = Math.min(window.innerWidth, Math.max(d.right, p.right) + 24);
      const bottom = Math.min(window.innerHeight, Math.max(d.bottom, p.bottom) + 24);
      return JSON.stringify({ x: Math.round(left), y: Math.round(top), width: Math.round(right - left), height: Math.round(bottom - top), deco: [Math.round(d.left), Math.round(d.top), Math.round(d.width), Math.round(d.height)], panel: [Math.round(p.left), Math.round(p.top), Math.round(p.width), Math.round(p.height)] });
    })()`));
    const shot = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false, clip: { x: clip.x, y: clip.y, width: clip.width, height: clip.height, scale: 2 } });
    fs.writeFileSync(OUT, Buffer.from(shot.data, 'base64'));
    console.log(`saved ${OUT}  ${clip.width}x${clip.height}@2x  ${Math.round(fs.statSync(OUT).size / 1024)} KB`);
    console.log('  角色条 rect:', JSON.stringify(clip.deco), ' 面板 rect:', JSON.stringify(clip.panel));
    cdp.close();
  } finally { try { edge.kill(); } catch {} }
})().catch((e) => { console.error('FATAL ' + e.message); process.exitCode = 2; });
