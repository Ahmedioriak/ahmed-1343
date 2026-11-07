# Bring the ElevenLabs recordings into the game:  python3 tools/voice/pro_import.py pro-voices-recorded.zip
# The zip comes from «تسجيل أصوات ElevenLabs» (record.ps1): 0001.mp3 … plus lines.json (key per clip).
# Each clip is trimmed, levelled and re-encoded small, then written to src/v1/voices_pro.js (→ pro-voices.js on build).
import sys, os, json, zipfile, subprocess, base64, tempfile
R = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
AF = 'silenceremove=start_periods=1:start_threshold=-48dB:start_silence=0.03,areverse,silenceremove=start_periods=1:start_threshold=-48dB:start_silence=0.06,areverse,highpass=f=70,acompressor=threshold=-22dB:ratio=2:attack=8:release=120,loudnorm=I=-16:TP=-1.5'
z = zipfile.ZipFile(sys.argv[1]); T = tempfile.mkdtemp(); z.extractall(T)
L = json.load(open(os.path.join(T, 'lines.json'), encoding='utf-8-sig'))
out, miss = {}, []
for i, ln in enumerate(L, 1):
    src = os.path.join(T, '%04d.mp3' % i)
    if not os.path.exists(src) or os.path.getsize(src) < 800: miss.append(ln['k']); continue
    dst = os.path.join(T, 'o%04d.mp3' % i)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', src, '-af', AF, '-ac', '1', '-ar', '22050', '-b:a', '40k', '-compression_level', '0', dst], check=True)
    out[ln['k']] = base64.b64encode(open(dst, 'rb').read()).decode()
open(os.path.join(R, 'src', 'v1', 'voices_pro.js'), 'w', encoding='utf-8').write('window.VOICE_PRO=' + json.dumps(out, ensure_ascii=False) + ';if(window.__proVoices)window.__proVoices();')
print('clips', len(out), 'missing', len(miss), 'KB', sum(len(v) for v in out.values()) // 1024); [print(' -', m) for m in miss[:20]]
