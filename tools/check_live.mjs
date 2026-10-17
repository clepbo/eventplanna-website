// Browser checks for the EventPlanna site.
//
//   python -m http.server 3000      (in the repo root, in another shell)
//   node tools/check_live.mjs
//
// Port 3000 matters: it is on the API's CORS allowlist, so this is the only
// way to exercise the live content path before the site is at eventplanna.com.
//
// Two things here are deliberate, both learned the hard way:
//   * caching is disabled, because a stale stylesheet in the headless profile
//     makes a fix look like it did not work;
//   * every screenshot passes an explicit clip, because a plain
//     captureScreenshot drops compositor-promoted layers (.col carries
//     will-change:transform) and the hero photos come out as flat tints.
import { pathToFileURL } from 'node:url';
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';

const WS = 'C:/Users/Teasoo Consulting 3/Downloads/figma-cli-main/figma-cli-main/figma-cli-main/node_modules/ws/index.js';
const { default: WebSocket } = await import(pathToFileURL(WS).href);

const BASE = 'http://localhost:3000/';
const OUT  = process.env.TEMP + '/ep-shots';
const PORT = 9501;
const PAGES = [
  ['index',       'index.html'],
  ['marketplace', 'marketplace.html'],
  ['about',       'about.html'],
  ['blog',        'blog.html'],
  ['events',      'events.html'],
  ['pricing',     'pricing.html'],
  ['faq',         'faq.html'],
  ['post',        'post.html?slug=festive-season-event-planning-tips'],
  ['event',       'event.html?slug=the-future-of-event-planning'],
];

if (existsSync(OUT)) rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',
  ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${process.env.TEMP}/ep-prof`,
   '--no-first-run', '--disable-gpu', '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });
for (let i = 0; i < 80; i++) {
  try { if ((await fetch(`http://127.0.0.1:${PORT}/json/version`)).ok) break; } catch {}
  await new Promise(r => setTimeout(r, 250));
}

async function open(url, dark) {
  const t = await (await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' })).json();
  const ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise(r => ws.on('open', r));
  let id = 0; const cbs = new Map(); const ev = []; const errs = [];
  const send = (m, p = {}) => new Promise(r => { const i = ++id; cbs.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
  ws.on('message', d => {
    const m = JSON.parse(d);
    if (m.id && cbs.has(m.id)) { cbs.get(m.id)(m.result); cbs.delete(m.id); return; }
    if (m.method === 'Runtime.exceptionThrown') errs.push(m.params.exceptionDetails.text || 'error');
    if (m.method) ev.push(m);
  });
  const ex = async e => (await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true })).result?.value;
  await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable');
  await send('Network.setCacheDisabled', { cacheDisabled: true });
  await send('Emulation.setDeviceMetricsOverride', { width: 1400, height: 1000, deviceScaleFactor: 1, mobile: false });
  // Set it either way. The profile directory survives between runs, so a stored
  // 'dark' from the previous pass otherwise makes every light-mode check a
  // second dark-mode check, and light mode is the default nobody then sees.
  await send('Page.addScriptToEvaluateOnNewDocument',
    { source: `try{localStorage.setItem('ep-theme','${dark ? 'dark' : 'light'}')}catch(e){}` });
  await send('Page.navigate', { url });
  for (let i = 0; i < 900; i++) {
    const k = ev.findIndex(e => e.method === 'Page.loadEventFired');
    if (k >= 0) { ev.splice(k, 1); break; }
    await new Promise(r => setTimeout(r, 25));
  }
  // Wait for the live slots to actually fill rather than sleeping a fixed
  // guess. A fixed wait reported an empty blog page that five traced loads
  // showed filling in 1.6s, so the number was never the thing to tune.
  // Stop early once every slot is filled, and also once the count stops moving:
  // a slot like event-past stays empty on purpose when the API has no past
  // events, and waiting the full timeout for it on every run is pure delay.
  let waited = 0, last = -1, stable = 0;
  for (; waited < 15000; waited += 200) {
    const pending = await ex(`[...document.querySelectorAll('[data-slot]')].filter(s => !s.innerHTML.trim()).length`);
    if (pending === 0) break;
    stable = pending === last ? stable + 200 : 0;
    last = pending;
    if (stable >= 2000) break;
    await new Promise(r => setTimeout(r, 200));
  }
  await new Promise(r => setTimeout(r, 1200));
  // Cover photos arrive as --img custom properties, not <img> elements, so the
  // load event says nothing about them and a slice near the top of the page can
  // catch a tile that has not painted. Preload every one before shooting.
  await ex(`new Promise(res => {
    const urls = [...document.querySelectorAll('[style*="--img"]')]
      .map(e => (e.getAttribute('style').match(/url\\(([^)]+)\\)/) || [])[1]).filter(Boolean);
    let left = urls.length; if (!left) return res(0);
    const done = () => { if (--left <= 0) res(urls.length); };
    urls.forEach(u => { const i = new Image(); i.onload = i.onerror = done; i.src = u; });
    setTimeout(() => res(-1), 8000);
  })`);
  await new Promise(r => setTimeout(r, 300));
  return { send, ex, errs, waited, close: () => { ws.close(); fetch(`http://127.0.0.1:${PORT}/json/close/${t.id}`).catch(() => {}); } };
}

let fails = 0;
console.log('='.repeat(76));
console.log('LIVE CONTENT + RUNTIME   (localhost:3000, the allowlisted origin)');
console.log('='.repeat(76));

for (const [name, path] of PAGES) {
  const c = await open(BASE + path);
  const info = await c.ex(`(() => {
    const slots = [...document.querySelectorAll('[data-slot]')].map(s => ({
      k: s.getAttribute('data-slot'),
      n: s.innerHTML.trim().length,
      // Count what was actually built, not how many characters came back. A
      // real card is the signal; a byte count called the one-post blog empty.
      cards: s.querySelectorAll('.bcard, .ecard, .article, .ec-media').length,
      note: /live-note/.test(s.innerHTML) }));
    // anything comfortably inside the viewport must actually be painted
    const vh = innerHeight, hidden = [];
    for (const el of document.querySelectorAll('body *')) {
      // .ttrack covers both fade carousels: the slides that are not showing
      // sit at opacity 0 by design, which is not the same as a broken reveal.
      if (el.closest('.ttrack,.tcar,.faq-a,.nav-toggle,.progress,.live-slot:empty')) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) continue;
      if (r.top < vh * 0.12 || r.bottom > vh * 0.88) continue;
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      if (parseFloat(cs.opacity) < 0.05) hidden.push(el.tagName.toLowerCase() + '.' + (el.className || ''));
    }
    return { h: document.documentElement.scrollHeight, slots, hidden: hidden.slice(0, 4),
             sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth,
             theme: document.documentElement.getAttribute('data-theme') || 'light' };
  })()`);
  const over = info.sw !== info.cw;
  const state = s => s.note ? 'OFFLINE' : s.cards ? `LIVE:${s.cards}` : s.n > 40 ? 'COPY' : 'empty';
  const slotTxt = info.slots.map(s => `${s.k}=${state(s)}`).join(' ');
  const ok = c.errs.length === 0 && !over && info.hidden.length === 0;
  if (!ok) fails++;
  console.log(`  ${name.padEnd(13)} ${String(info.h).padStart(6)}px  ${over ? 'OVERFLOW' : 'no-overflow'}  errs:${c.errs.length}  ${String(c.waited).padStart(5)}ms  ${slotTxt}`);
  c.errs.slice(0, 2).forEach(e => console.log('      ERR ' + String(e).slice(0, 110)));
  info.hidden.forEach(h => console.log('      INVISIBLE ' + h.slice(0, 80)));

  // slices, with the explicit clip the compositor needs
  const H = Math.min(info.h, 9000);
  for (let y = 0, i = 0; y < H; y += 1000, i++) {
    await c.ex(`scrollTo(0,${y})`);
    await new Promise(r => setTimeout(r, 450));
    const sy = await c.ex('Math.round(scrollY)');
    const shot = await c.send('Page.captureScreenshot',
      { format: 'png', clip: { x: 0, y: sy, width: 1400, height: 1000, scale: 1 } });
    if (shot?.data) writeFileSync(`${OUT}/${name}-${String(i).padStart(2, '0')}.png`, Buffer.from(shot.data, 'base64'));
  }
  c.close();
}

// one dark-mode pass, to confirm the toggle and the logo swap
{
  const c = await open(BASE + 'index.html', true);
  const r = await c.ex(`(() => {
    const l = document.querySelector('.logo .l-light'), d = document.querySelector('.logo .l-dark');
    const btn = document.querySelector('.theme-toggle');
    return { theme: document.documentElement.getAttribute('data-theme'),
             lightShown: getComputedStyle(l).display, darkShown: getComputedStyle(d).display,
             btnLabel: btn && btn.getAttribute('aria-label'),
             bodyBg: getComputedStyle(document.body).backgroundColor }; })()`);
  const ok = r.theme === 'dark' && r.lightShown === 'none' && r.darkShown !== 'none';
  if (!ok) fails++;
  console.log('');
  console.log('='.repeat(76));
  console.log('DARK MODE');
  console.log('='.repeat(76));
  console.log('  ' + JSON.stringify(r) + '  ' + (ok ? 'OK' : 'FAIL'));
  const shot = await c.send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: 1400, height: 1000, scale: 1 } });
  if (shot?.data) writeFileSync(`${OUT}/dark-00.png`, Buffer.from(shot.data, 'base64'));
  c.close();
}

console.log('');
console.log(fails === 0 ? 'RESULT: live checks pass' : `RESULT: ${fails} pages with problems`);
console.log('shots in ' + OUT);
chrome.kill();
process.exit(fails ? 1 : 0);
