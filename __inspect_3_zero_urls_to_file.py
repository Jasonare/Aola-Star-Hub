import re, json
from urllib.request import Request, urlopen

def norm(s):
    s=re.sub(r'<[^>]+>',' ',s)
    s=s.replace('\xa0',' ').replace('\ufeff','')
    s=re.sub(r'\s+',' ',s).strip()
    return s

UA='Mozilla/5.0'
urls=['http://aola.100bt.com/tujian/4531.html','http://aola.100bt.com/tujian/4615.html','http://aola.100bt.com/tujian/4957.html']
out=[]
for u in urls:
    req=Request(u,headers={'User-Agent':UA,'Referer':'http://aola.100bt.com/'})
    with urlopen(req,timeout=25) as r: h=r.read().decode('utf-8','ignore')
    trs=re.findall(r'<tr[^>]*>([\s\S]*?)</tr>',h,flags=re.I)
    rows=[]
    for i,tr in enumerate(trs,1):
        vals=[norm(x) for x in re.findall(r'<t[dh][^>]*>([\s\S]*?)</t[dh]>',tr,flags=re.I)]
        if not vals: continue
        line=' | '.join(vals)
        if any(k in line for k in ['技能表','技能名','攻击类型','技能属性','威力','使用次数','学习等级','获取方式','推荐配招']) or i<12:
            rows.append({'i':i,'len':len(vals),'line':line[:500]})
    out.append({'url':u,'tr_count':len(trs),'rows':rows})

open(r'C:\工作娱乐\Aola-Star-Hub\__inspect_3_zero_urls.json','w',encoding='utf-8').write(json.dumps(out,ensure_ascii=False,indent=2))
print('saved')
