import re
from urllib.request import Request, urlopen

u='http://aola.100bt.com/tujian/4474.html'
UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
req=Request(u,headers={'User-Agent':UA,'Referer':'http://aola.100bt.com/'})
with urlopen(req,timeout=20) as r: b=r.read()
h=b.decode('utf-8',errors='ignore')

tables=re.findall(r'<table[^>]*>[\s\S]*?</table>', h, flags=re.I)
print('table_count',len(tables))
for i,t in enumerate(tables[:12],start=1):
    txt=re.sub(r'<[^>]+>',' ',t)
    txt=re.sub(r'\s+',' ',txt).strip()
    mark=('亚比技能' in txt) or ('技能属性/类型' in txt) or ('技能名称' in txt) or ('学习等级' in txt) or ('使用次数' in txt)
    if mark or i<=4:
        print('\n#',i,'len',len(t),'mark',mark)
        print(txt[:260])
