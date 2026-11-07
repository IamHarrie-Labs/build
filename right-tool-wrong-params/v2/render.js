// Renders index.html → right-tool-wrong-parameters-v2.mp4 (1080x1920, 30fps) with voice + SFX + music.
// node render.js [--stills 1,2,3]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const FPS = 30, dir = __dirname;
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  page.on('pageerror', e => { console.error('PAGE ERROR', e.message); process.exit(1); });
  await page.goto('file://' + path.join(dir, 'index.html') + '?render');
  await page.waitForFunction(() => window.READY);
  const TOTAL = await page.evaluate(() => window.TOTAL);
  const si = process.argv.indexOf('--stills');
  if (si > -1) {
    const out = process.env.STILLS || dir;
    // render sequentially up to each still so stateful tweens match the real render
    const ts = process.argv[si + 1].split(',').map(Number);
    for (const t of ts) {
      for (let x = 0; x <= t; x += 0.25) await page.evaluate(x => render(x), x);
      await page.evaluate(t => render(t), t);
      await page.screenshot({ path: path.join(out, `s-${t}.png`) });
    }
    return browser.close();
  }
  const out = path.join(dir, 'video_only.mp4');
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const frames = Math.ceil(TOTAL * FPS);
  for (let f = 0; f < frames; f++) {
    await page.evaluate(t => render(t), f / FPS);
    const buf = await page.screenshot({ type: 'png' });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 300 === 0) console.log(`frame ${f}/${frames}`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
  await browser.close(); console.log('video', TOTAL.toFixed(2) + 's');
})();
