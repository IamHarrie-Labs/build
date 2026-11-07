"""Builds the sound design (synthesised SFX, no samples needed) and the final mix.
python3 mix.py  ->  sfx.wav, then right-tool-wrong-parameters-v2.mp4
Voice dominates (loudnorm -16 LUFS), music at 6%, SFX under the animation hits.
Set MUSIC=/path/track.m4a to swap the music.
"""
import json, os, subprocess, wave
import numpy as np

SR = 48000
W = json.load(open('words_tight.json'))
T = lambda i: W[i]['s']
DUR = W[-1]['e'] + 0.6
rng = np.random.default_rng(3)

def env(n, a=0.004, r=None):
    e = np.ones(n); ai = max(1, int(a * SR)); e[:ai] = np.linspace(0, 1, ai)
    if r: e *= np.exp(-np.arange(n) / (r * SR))
    return e

def lp(x, k):  # one-pole low-pass
    y = np.zeros_like(x); a = k
    for i in range(1, len(x)): y[i] = y[i-1] + a * (x[i] - y[i-1])
    return y

def tick():
    n = int(.03 * SR); t = np.arange(n) / SR
    return .5 * np.sin(2*np.pi*3200*t) * env(n, .001, .006) + .3 * rng.standard_normal(n) * env(n, .0005, .003)

def pop():
    n = int(.14 * SR); t = np.arange(n) / SR
    f = 520 + 900 * np.exp(-t * 40)
    return .8 * np.sin(2*np.pi*np.cumsum(f)/SR) * env(n, .002, .045)

def errpop():
    n = int(.22 * SR); t = np.arange(n) / SR
    return .6 * (np.sin(2*np.pi*220*t) + .5*np.sign(np.sin(2*np.pi*233*t))) * env(n, .002, .07) * .7

def whoosh(d=.45, rev=False):
    n = int(d * SR); x = rng.standard_normal(n)
    sweep = np.linspace(.02, .25, n)
    y = np.zeros(n)
    for i in range(1, n): y[i] = y[i-1] + sweep[i] * (x[i] - y[i-1])
    y -= lp(y, .01)
    e = np.sin(np.linspace(0, np.pi, n)) ** 2
    y = y * e * .9
    return y[::-1] if rev else y

def thud():
    n = int(.45 * SR); t = np.arange(n) / SR
    f = 110 * np.exp(-t * 6) + 45
    body = np.sin(2*np.pi*np.cumsum(f)/SR) * env(n, .001, .12)
    click = lp(rng.standard_normal(n), .3) * env(n, .0005, .012)
    return 1.1 * body + .5 * click

def glitch(d=.32):
    n = int(d * SR); x = rng.standard_normal(n)
    gate = (np.floor(np.arange(n) / (SR * .022)) % 3 != 1).astype(float)
    q = np.round(x * 3) / 3
    bz = np.sign(np.sin(2*np.pi*90*np.arange(n)/SR)) * .5
    return .45 * (q * .6 + bz) * gate * env(n, .001)

def ding(f=1318.5):
    n = int(.9 * SR); t = np.arange(n) / SR
    return .35 * (np.sin(2*np.pi*f*t) + .6*np.sin(2*np.pi*f*1.5*t) + .25*np.sin(2*np.pi*f*2*t)) * env(n, .002, .22)

def scan(d=.8):
    n = int(d * SR); t = np.arange(n) / SR
    f = 300 + 1600 * (t / d)
    s = np.sin(2*np.pi*np.cumsum(f)/SR) * .12 + lp(rng.standard_normal(n), .2) * .25
    return s * np.sin(np.linspace(0, np.pi, n)) ** 1.5

track = np.zeros(int((DUR + 1) * SR))
def at(t, snd, vol):
    i = int(max(0, t) * SR); track[i:i+len(snd)] += snd[:len(track)-i] * vol

# cue map (time, sound, volume) — each cue sits on an animation hit
for k in range(16): at(0.05 + k * 2.75 / 16, tick(), .10)          # typing the request
at(T(13) - .05, pop(), .30)                                        # agent replies
at(T(14) - .1, whoosh(), .32)                                      # receipt slides up
at(T(21) - .03, glitch(), .32)                                     # recipient glitches to the hacker
at(T(23) - .1, whoosh(.6, rev=True), .35)                          # rewind
for k in range(8): at(T(23) + k * .11, tick(), .08)                # clock rolling back
at(T(26) - .15, whoosh(.35), .2)                                   # email in
at(T(31) - .15, scan(), .30)                                       # scanner
at(T(34), pop(), .2)                                               # "to" slot
at(T(37), whoosh(.5), .3); at(T(37) + .55, pop(), .3)              # 5512 flies in
at(T(44), pop(), .28); at(T(46), pop(), .28); at(T(48), errpop(), .3)
at(T(50) - .1, whoosh(.5), .3); at(T(50) + .42, thud(), .25)       # paper drops
at(T(56), tick(), .15); at(T(58), tick(), .15)                     # highlighter
at(T(60) - .15, whoosh(.35), .2)
for k in range(14): at(T(60) + k * .07, tick(), .07)               # terminal typing
for i in (65, 68, 74, 77, 79): at(T(i), tick(), .14)
at(T(81) - .1, thud(), .45)                                        # PASS stamp
at(T(82) - .15, whoosh(.35), .2)
for k in range(24): at(T(83) + k * (T(91) - T(83)) / 24, tick(), .07)  # waffle fills
at(T(95) - .15, whoosh(.35), .2)
at(T(101), ding(), .30); at(T(102), pop(), .25)                    # AuthorityFlow
at(T(104) - .05, whoosh(.4), .22); at(T(106), pop(), .18); at(T(106) + .15, pop(), .18)
at(T(120), ding(1568), .22)                                        # ALLOWED
at(T(130), glitch(.2), .18)                                        # stranger shake
at(T(135), errpop(), .28)                                          # NO AUTHORITY
at(T(138) - .1, thud(), .5)                                        # BLOCKED
at(T(143) - .15, whoosh(.35), .2)
for k in range(20): at(T(148) + k * (T(153) - T(148)) / 20, tick(), .07)
at(T(153), ding(1760), .28)                                        # 9%
at(T(154) - .15, whoosh(.35), .2)
at(T(161), pop(), .15); at(T(169) - .1, whoosh(.3), .15)
at(T(170), pop(), .18); at(T(171), pop(), .18); at(T(173), errpop(), .22)
at(T(175) - .15, whoosh(.4), .25); at(T(176), pop(), .3)
for k in range(5): at(T(176) + .1 + k * .09, tick(), .1)
at(T(178), ding(), .22)

track = np.clip(track, -1, 1)
with wave.open('sfx.wav', 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((track * 32767).astype(np.int16).tobytes())

music = os.environ.get('MUSIC', '/tmp/claude-0/-home-user-build/cea2c33d-6c98-5d90-a4f1-2401afeef288/scratchpad/skillzip/famous-reel-editor/assets/bg-music.m4a')
fout = DUR - 2
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', 'video_only.mp4', '-i', 'vo_tight.wav', '-i', 'sfx.wav', '-i', music,
  '-filter_complex',
  f'[1:a]loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000[vo];'
  f'[2:a]aresample=48000,volume=1.0[sx];'
  f'[3:a]atrim=start=4,asetpts=PTS-STARTPTS,volume={os.environ.get("MUSIC_VOL","0.06")},afade=in:st=0:d=0.5,afade=out:st={fout:.2f}:d=2[m];'
  f'[vo][sx][m]amix=inputs=3:duration=first:normalize=0,alimiter=limit=0.891:level=false[a]',
  '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-ac', '2',
  '-movflags', '+faststart', '-t', f'{DUR:.3f}', 'right-tool-wrong-parameters-v2.mp4'], check=True)
print('done', round(DUR, 2), 's')
