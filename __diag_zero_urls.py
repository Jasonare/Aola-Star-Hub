import re
from urllib.request import Request, urlopen

urls=[
'http://aola.100bt.com/tujian/4474.html',
'http://aola.100bt.com/tujian/4549.html',
'http://aola.100bt.com/tujian/4564.html',
'http://aola.100bt.com/tujian/4594.html',
'http://aola.100bt.com/tujian/4612.html',
'http://aola.100bt.com/tujian/4639.html',
'http://aola.100bt.com/tujian/4642.html',
'http://aola.100bt.com/tujian/4645.html',
'http://aola.100bt.com/tujian/4648.html',
'http://aola.100bt.com/tujian/4666.html',
'http://aola.100bt.com/tujian/4690.html',
'http://aola.100bt.com/tujian/4696.html',
'http://aola.100bt.com/tujian/4786.html',
'http://aola.100bt.com/tujian/4801.html',
'http://aola.100bt.com/tujian/4861.html',
'http://aola.100bt.com/tujian/4891.html',
'http://aola.100bt.com/tujian/4966.html',
'http://aola.100bt.com/tujian/4981.html',
]
UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

def fetch(u):
 req=Request(u,headers={'User-Agent':UA,'Referer':'http://aola.100bt.com/'})
 with urlopen(req,timeout=20) as r: b=r.read()
 for e in ('utf-8','utf-8-sig','gb18030','gbk'):
  try:return b.decode(e,errors='ignore')
  except:pass
 return b.decode('utf-8',errors='ignore')

for u in urls:
 try:
  h=fetch(u)
  low=h.lower()
  has_prop='yabi_table_propTable'.lower() in low
  tr_cnt=len(re.findall(r'<tr',low))
  td_cnt=len(re.findall(r'<td',low))
  has_skill_kw=('亚比技能' in h) or ('技能表' in h) or ('技能属性/类型' in h)
  has_script_pet=('peticon' in low) or ('tablecontainer' in low)
  print(u, 'propTable',has_prop,'tr',tr_cnt,'td',td_cnt,'skillkw',has_skill_kw,'petStruct',has_script_pet)
 except Exception as e:
  print(u,'ERR',e)
