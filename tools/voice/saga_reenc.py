import json, subprocess, base64, os, hashlib
os.chdir('/home/claude/voices2')
D = json.load(open('saga_T.json')); story = json.load(open('clips_story.json'))
AF = 'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.02,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse,highpass=f=80,acompressor=threshold=-20dB:ratio=2.5:attack=5:release=80,loudnorm=I=-15:TP=-1.5'
out, miss = {}, 0
for k, b64 in story.items():
    voc = D['story'].get(k)
    raw = '/tmp/vo3/%s.wav' % hashlib.md5((voc + '32k').encode()).hexdigest()[:12] if voc else None
    if not raw or not os.path.exists(raw): out[k] = b64; miss += 1; continue
    mp3 = '/tmp/vo4/%s.mp3' % hashlib.md5(k.encode()).hexdigest()[:12]
    if not os.path.exists(mp3): subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', raw, '-af', AF, '-ac', '1', '-ar', '22050', '-b:a', '40k', '-compression_level', '0', mp3], check=True)
    out[k] = base64.b64encode(open(mp3, 'rb').read()).decode()
json.dump(out, open('clips_story40.json', 'w'))
print('done', len(out), 'missing raw', miss, 'KB', sum(len(x) for x in out.values()) // 1024, 'old KB', sum(len(x) for x in story.values()) // 1024)
