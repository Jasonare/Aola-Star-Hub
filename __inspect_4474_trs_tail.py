import re
from urllib.request import Request, urlopen

def norm(s):
    s=re.sub(r'<[^>]+>',' ',s)
    s=s.replace('\xa0',' ')
    s=re.sub(r'\s+',' ',s).strip()
    return s
u='http://aola.100bt.com/tujian/4474.html'
req=Request(u,headers={'User-Agent':'Mozilla/5.0','Referer':'http://aola.100bt.com/'})
with urlopen(req,timeout=20) as r: h=r.read().decode('utf-8','ignore')
trs=re.findall(r'<tr[^>]*>([\s\S]*?)</tr>',h,flags=re.I)
for i,tr in enumerate(trs[10:28],start=11):
    vals=[norm(x) for x in re.findall(r'<t[dh][^>]*>([\s\S]*?)</t[dh]>',tr,flags=re.I)]
    print(i,len(vals),' | '.join(vals)[:300])
