from pathlib import Path
import re

p=Path(r'C:\工作娱乐\Aola-Star-Hub\__retry_zero_skills_v3.py')
s=p.read_text(encoding='utf-8')
old='''def fetch_html(url: str) -> str:
    req = Request(url, headers={"User-Agent": UA, "Referer": "http://aola.100bt.com/"})
    with urlopen(req, timeout=25) as resp:
        raw = resp.read()
    for enc in ("utf-8", "utf-8-sig", "gb18030", "gbk"):
        try:
            return raw.decode(enc, errors="ignore")
        except Exception:
            pass
    return raw.decode("utf-8", errors="ignore")
'''
new='''def fetch_html(url: str) -> str:
    req = Request(url, headers={"User-Agent": UA, "Referer": "http://aola.100bt.com/"})
    with urlopen(req, timeout=25) as resp:
        raw = resp.read()

    head = raw[:5000].decode("ascii", errors="ignore").lower()
    m = re.search(r"charset\\s*=\\s*[\"']?\\s*([a-z0-9\\-_]+)", head)
    encs = []
    if m:
        encs.append(m.group(1))
    encs += ["utf-8", "utf-8-sig", "gb18030", "gbk"]

    best = ""
    best_score = -1
    for enc in encs:
        try:
            txt = raw.decode(enc, errors="ignore")
        except Exception:
            continue
        score = 0
        for kw in ("技能表", "技能名", "攻击类型", "亚比技能", "学习等级", "获取方式"):
            if kw in txt:
                score += 1
        if score > best_score:
            best_score = score
            best = txt
        if score >= 3:
            return txt

    return best or raw.decode("utf-8", errors="ignore")
'''
if old not in s:
    raise SystemExit('old fetch_html block not found')
s=s.replace(old,new,1)
p.write_text(s,encoding='utf-8')
print('patched fetch_html')
