// Renders index.html to a 1080x1920 MP4 with the voiceover.
// Usage: node render.js [--stills t1,t2,...]   (needs playwright + ffmpeg)
// Voice clips in audio/ were made with free Microsoft Edge TTS:
//   edge-tts --voice en-US-AvaNeural --rate=+6% --text "..." --write-media audio/sN.mp3
const { chromium } = require('playwright');
const { spawn, execFileSync } = require('child_process');
const path = require('path');

const FPS = 30;
const dir = __dirname;
const out = path.join(dir, 'right-tool-wrong-parameters.mp4');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  await page.goto('file://' + path.join(dir, 'index.html') + '?render');
  await page.evaluate(() => document.fonts.ready);
  const { START, TOTAL } = await page.evaluate(() => window.TIMING);

  const si = process.argv.indexOf('--stills');
  if (si > -1) {
    for (const t of process.argv[si + 1].split(',').map(Number)) {
      await page.evaluate(t => render(t), t);
      await page.screenshot({ path: path.join(process.env.STILLS || dir, `still-${t}.png`) });
    }
    await browser.close();
    return;
  }

  // Audio: place each clip at its scene start, pad to full length.
  const wav = path.join(dir, 'vo.wav');
  const inputs = [], filters = [];
  START.forEach((s, i) => {
    inputs.push('-i', path.join(dir, 'audio', `s${i + 1}.mp3`));
    const ms = Math.round(s * 1000);
    filters.push(`[${i}:a]aresample=48000,adelay=${ms}|${ms}[a${i}]`);
  });
  const mix = START.map((_, i) => `[a${i}]`).join('') +
    `amix=inputs=${START.length}:normalize=0,apad,atrim=0:${TOTAL.toFixed(3)},loudnorm=I=-14:TP=-1.5:LRA=11[out]`;
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...inputs, '-filter_complex',
    filters.join(';') + ';' + mix, '-map', '[out]', '-ac', '2', '-ar', '48000', wav]);

  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS),
    '-i', '-', '-i', wav, '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p',
    '-profile:v', 'high', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', '-shortest', out],
    { stdio: ['pipe', 'inherit', 'inherit'] });

  const frames = Math.ceil(TOTAL * FPS);
  for (let f = 0; f < frames; f++) {
    await page.evaluate(t => render(t), f / FPS);
    const buf = await page.screenshot({ type: 'png' });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 150 === 0) console.log(`frame ${f}/${frames}`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  await browser.close();
  console.log('wrote', out);
})();
