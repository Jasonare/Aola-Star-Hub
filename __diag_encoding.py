import re
from urllib.request import Request, urlopen

u='http://aola.100bt.com/tujian/4474.html'
req=Request(u,headers={'User-Agent':'Mozilla/5.0','Referer':'http://aola.100bt.com/'})
with urlopen(req,timeout=20) as r:
    raw=r.read()

head=raw[:5000].decode('ascii',errors='ignore').lower()
m=re.search(r'charset\s*=\s*[\"\']?\s*([a-z0-9\-_]+)', head)
print('meta',m.group(1) if m else None)
for enc in ['utf-8','utf-8-sig','gb18030','gbk']:
    try:
        t=raw.decode(enc,errors='ignore')
        print(enc, '技能表' in t, '亚比技能' in t, '技能名' in t, '攻击类型' in t)
    except Exception:
        print(enc,'err')
