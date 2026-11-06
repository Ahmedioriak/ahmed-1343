import json, re, difflib, sys
from saga_tash import VT, EXTRA
from tashkeel import T as T0
NAMES = ['الزعيم','الوحش','الكابتن','الدكتور','الحارس','البلدوزر','المعلّم','التنين','أبو الدجاج','أبو الأسود','البوب','الطالب','العبد','القيمر','وحش التيرسل','الطباخ','المبرمج','المروض','الصياد','القنّاص']
NAMES.sort(key=len, reverse=True)
EMO = re.compile('[\U0001F300-\U0001FAFF☀-➿️]')
def norm(t): t = EMO.sub('', t); t = re.sub(r'[!؟?.,،:؛—"«»]', ' ', t); return re.sub(r'\s+', ' ', t).strip()
def segs(text):
    out = []
    for part in text.split('…'):
        S = [norm(part)]
        for n in NAMES:
            nS = []
            for sg in S:
                if sg == n or n not in sg: nS.append(sg); continue
                i = sg.index(n); a, b = sg[:i].strip(), sg[i + len(n):].strip(); nS += [x for x in (a, n, b) if x]
            S = nS
        out += [x for x in S if x]
    return out
DIA = re.compile('[ً-ْٰ]')
plain = []
for x in json.load(open('saga_texts.json')):
    t = x.split('|', 1)[1]
    if t not in plain: plain.append(t)
assert len(plain) == len(VT), (len(plain), len(VT))
POOL = ['الزعيم', 'الوحش', 'الكابتن', 'الدكتور', 'الحارس', 'البوب']
def tok(s):
    it = iter(POOL)
    return re.sub(r'\{\w+\}', lambda m: next(it), s)
story, bad = {}, []
pairs = [(p, v) for p, v in zip(plain, VT)]
for p, v in pairs:
    a, b = segs(tok(p)), segs(tok(v))
    if len(a) != len(b): bad.append(('COUNT', p, a, b)); continue
    for x, y in zip(a, b):
        if x in NAMES: continue
        r = difflib.SequenceMatcher(None, DIA.sub('', x), DIA.sub('', y)).ratio()
        if r < 0.8: bad.append(('DIFF %.2f' % r, x, y))
        story.setdefault(x, y)
extra = {}
for p, v in EXTRA.items():
    a, b = segs(p), segs(v)
    if len(a) != len(b): bad.append(('COUNT', p, a, b)); continue
    for x, y in zip(a, b): extra.setdefault(x, y)
for b in bad: print(*b)
json.dump({'story': story, 'extra': extra}, open('saga_T.json', 'w'), ensure_ascii=False)
print('story segs', len(story), 'extra', len(extra), 'bad', len(bad))
