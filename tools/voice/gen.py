import json, wave, subprocess, base64, os, hashlib
from piper import PiperVoice
from piper.config import SynthesisConfig
from tashkeel import T
v = PiperVoice.load('/home/claude/models/kareem/ar_JO-kareem-medium.onnx')
S = json.load(open('segs.json'))
os.makedirs('/tmp/vo2', exist_ok=True)
out, tot = {}, 0
for i, seg in enumerate(S):
    h = hashlib.md5(seg.encode()).hexdigest()[:10]; raw = f'/tmp/vo2/{h}.wav'; mp3 = f'/tmp/vo2/{h}.mp3'
    with wave.open(raw, 'wb') as w: v.synthesize_wav(T[seg], w, syn_config=SynthesisConfig(length_scale=1.04, noise_scale=0.6, noise_w_scale=0.7))
    af = 'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.02,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse,highpass=f=80,acompressor=threshold=-20dB:ratio=2.5:attack=5:release=80,loudnorm=I=-15:TP=-1.5'
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', raw, '-af', af, '-ac', '1', '-ar', '24000', '-b:a', '40k', mp3], check=True)
    b = open(mp3, 'rb').read(); tot += len(b); out[seg] = base64.b64encode(b).decode()
json.dump(out, open('clips.json', 'w'))
print(len(out), 'clips', tot // 1024, 'KB')
