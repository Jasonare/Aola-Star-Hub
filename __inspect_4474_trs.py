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
print('tr_count',len(trs))
for i,tr in enumerate(trs[:80],start=1):
    vals=[norm(x) for x in re.findall(r'<t[dh][^>]*>([\s\S]*?)</t[dh]>',tr,flags=re.I)]
    if not vals: continue
    line=' | '.join(vals)
    if any(k in line for k in ['技能表','技能名','攻击类型','技能属性','学习等级','使用次数','获取方式','推荐配招']) or i<8:
        print(i, len(vals), line[:260])
