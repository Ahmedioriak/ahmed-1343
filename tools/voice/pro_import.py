# Bring the ElevenLabs recordings into the game:  python3 tools/voice/pro_import.py pro-voices-recorded.zip
# The zip comes from /record.html (Fish Audio or ElevenLabs) or record.ps1: 0001.mp3 … plus lines.json (key per clip).
# Each clip is trimmed, levelled and re-encoded small, then written to src/v1/voices_pro.js (→ pro-voices.js on build).
import sys, os, json, zipfile, subprocess, base64, tempfile
R = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
AF = 'silenceremove=start_periods=1:start_threshold=-48dB:start_silence=0.03,areverse,silenceremove=start_periods=1:start_threshold=-48dB:start_silence=0.06,areverse,highpass=f=70,acompressor=threshold=-22dB:ratio=2:attack=8:release=120,loudnorm=I=-16:TP=-1.5'
z = zipfile.ZipFile(sys.argv[1]); T = tempfile.mkdtemp(); z.extractall(T)
L = json.load(open(os.path.join(T, 'lines.json'), encoding='utf-8-sig'))
import concurrent.futures as cf
KBPS = os.environ.get('KBPS', '32k')
def one(a):
    i, ln = a
    src = os.path.join(T, '%04d.mp3' % i)
    if not os.path.exists(src) or os.path.getsize(src) < 800: return ln['k'], None
    dst = os.path.join(T, 'o%04d.mp3' % i)
    pre, tg = '', ln['tag']
    if ln.get('prov') == 'fish':
        if tg in ('c23', 'dark'): pre = 'aresample=44100,asetrate=44100*0.84,aresample=44100,atempo=1.10,aecho=0.8:0.5:55:0.22,'   # Malali: deeper and darker
        elif tg == 'c17': pre = 'aresample=44100,asetrate=44100*0.88,aresample=44100,atempo=1.07,aecho=0.8:0.4:40:0.18,'        # the winged President
        elif tg == 'myst': pre = 'aresample=44100,asetrate=44100*0.93,aresample=44100,atempo=1.04,aecho=0.8:0.6:90:0.25,'       # the unknown voice
        elif tg == 'old': pre = 'aresample=44100,asetrate=44100*0.95,aresample=44100,atempo=1.03,'                              # a little older for the grandpa
    cap = max(3.0, 0.22 * len(ln.get('t', '')) + 1.5)   # a voice model sometimes rambles (long laughs): cut it to a sane length
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', src, '-af', pre + AF + ',afade=t=out:st=%.2f:d=0.25' % (cap - 0.25), '-t', '%.2f' % cap, '-ac', '1', '-ar', '22050', '-b:a', KBPS, '-compression_level', '0', dst], check=True)
    return ln['k'], base64.b64encode(open(dst, 'rb').read()).decode()
out, miss = {}, []
with cf.ThreadPoolExecutor(8) as ex:
    for k, v in ex.map(one, enumerate(L, 1)):
        if v is None: miss.append(k)
        else: out[k] = v
open(os.path.join(R, 'src', 'v1', 'voices_pro.js'), 'w', encoding='utf-8').write('window.VOICE_PRO=' + json.dumps(out, ensure_ascii=False) + ';if(window.__proVoices)window.__proVoices();')
print('clips', len(out), 'missing', len(miss), 'KB', sum(len(v) for v in out.values()) // 1024); [print(' -', m) for m in miss[:20]]
