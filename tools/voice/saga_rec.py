import json, wave, subprocess, base64, os, hashlib, sys
from piper import PiperVoice
from piper.config import SynthesisConfig
v = PiperVoice.load('/home/claude/models/kareem/ar_JO-kareem-medium.onnx')
D = json.load(open('saga_T.json')); main = json.load(open('clips.json'))
story = json.load(open('clips_story.json')) if os.path.exists('clips_story.json') else {}
os.makedirs('/tmp/vo3', exist_ok=True)
AF = 'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.02,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse,highpass=f=80,acompressor=threshold=-20dB:ratio=2.5:attack=5:release=80,loudnorm=I=-15:TP=-1.5'
def rec(text, voc, kbps):
    h = hashlib.md5((voc + kbps).encode()).hexdigest()[:12]; raw = f'/tmp/vo3/{h}.wav'; mp3 = f'/tmp/vo3/{h}.mp3'
    if not os.path.exists(mp3):
        with wave.open(raw, 'wb') as w: v.synthesize_wav(voc, w, syn_config=SynthesisConfig(length_scale=1.04, noise_scale=0.6, noise_w_scale=0.7))
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', raw, '-af', AF, '-ac', '1', '-ar', '22050', '-b:a', kbps, mp3], check=True)
    return base64.b64encode(open(mp3, 'rb').read()).decode()
todo_main = dict(D['extra']); todo_main.update({'القنّاص': 'القَنّاص', 'و': 'وَ'})
n = 0
for k, voc in todo_main.items():
    if k not in main: main[k] = rec(k, voc, '40k'); n += 1
json.dump(main, open('clips.json', 'w'))
for k, voc in D['story'].items():
    if k in main or k in story: continue
    story[k] = rec(k, voc, '32k'); n += 1
    if n % 50 == 0: json.dump(story, open('clips_story.json', 'w')); print(n, flush=True)
json.dump(story, open('clips_story.json', 'w'))
print('done', n, 'main', len(main), 'story', len(story), 'story KB', sum(len(x) for x in story.values()) // 1024)
