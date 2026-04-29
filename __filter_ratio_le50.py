import re
import pandas as pd
from pathlib import Path

p = Path(r"C:\工作娱乐\Aola-Star-Hub\original_yabi_elements.xlsx")
if not p.exists():
    print('NOT_FOUND')
    raise SystemExit

# 读第一张表
xl = pd.ExcelFile(p)
df = pd.read_excel(p, sheet_name=0)

# 容错列名
c_name = next((c for c in df.columns if str(c) in ('item_name','亚比名','name')), None)
c_title = next((c for c in df.columns if str(c) in ('page_title','页面标题','title')), None)
c_idset = next((c for c in df.columns if str(c) in ('id_set','编号集合')), None)
c_ratio = next((c for c in df.columns if str(c) in ('element_ratio','系别占比')), None)

if c_ratio is None:
    print('NO_ELEMENT_RATIO_COLUMN')
    print('cols=', list(df.columns))
    raise SystemExit


def norm(v):
    if v is None:
        return ''
    s = str(v).replace('\ufeff','').replace('\xa0',' ').strip()
    return '' if s.lower() == 'nan' else s


def max_ratio_percent(s):
    t = norm(s)
    if not t:
        return None
    nums = [float(x) for x in re.findall(r'([0-9]+(?:\.[0-9]+)?)\s*%', t)]
    if nums:
        return max(nums)
    # 兜底：如果是 0~1 小数占比（很少见）
    nums2 = [float(x) for x in re.findall(r'([0-9]+(?:\.[0-9]+)?)', t)]
    if nums2:
        m = max(nums2)
        return m*100 if m <= 1 else m
    return None

rows = []
for _, r in df.iterrows():
    mr = max_ratio_percent(r.get(c_ratio))
    if mr is None:
        continue
    if mr <= 50.0:
        rows.append({
            'name': norm(r.get(c_name)) if c_name else '',
            'title': norm(r.get(c_title)) if c_title else '',
            'id_set': norm(r.get(c_idset)) if c_idset else '',
            'element_ratio': norm(r.get(c_ratio)),
            'max_ratio': mr,
        })

rows.sort(key=lambda x: (x['max_ratio'], x['name'] or x['title']))

print('total_filtered=', len(rows))
for x in rows:
    n = x['name'] or x['title'] or '(unknown)'
    print(f"{n}\tID={x['id_set']}\tmax={x['max_ratio']:.2f}%\t{x['element_ratio']}")
