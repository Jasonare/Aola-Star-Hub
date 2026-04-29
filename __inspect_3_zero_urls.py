import re
from urllib.request import Request, urlopen

def norm(s):
    s=re.sub(r'<[^>]+>',' ',s)
    s=s.replace('\xa0',' ')
    s=re.sub(r'\s+',' ',s).strip()
    return s

UA='Mozilla/5.0'
urls=['http://aola.100bt.com/tujian/4531.html','http://aola.100bt.com/tujian/4615.html','http://aola.100bt.com/tujian/4957.html']
for u in urls:
    req=Request(u,headers={'User-Agent':UA,'Referer':'http://aola.100bt.com/'})
    with urlopen(req,timeout=25) as r: h=r.read().decode('utf-8','ignore')
    trs=re.findall(r'<tr[^>]*>([\s\S]*?)</tr>',h,flags=re.I)
    print('\n====',u,'tr=',len(trs))
    for i,tr in enumerate(trs,1):
        vals=[norm(x) for x in re.findall(r'<t[dh][^>]*>([\s\S]*?)</t[dh]>',tr,flags=re.I)]
        if not vals: continue
        line=' | '.join(vals)
        if any(k in line for k in ['技能表','技能名','攻击类型','技能属性','威力','使用次数','学习等级','获取方式','推荐配招']) or i<8:
            print(i,len(vals),line[:300])
