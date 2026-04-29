import re
import pandas as pd
from pathlib import Path

def ids(v):
    return [int(x) for x in re.findall(r"\d+", '' if v is None else str(v))]

root=Path(r"C:\工作娱乐\Aola-Star-Hub")
ref=root/'原系亚比_100bt_编号_技能_种族值.xlsx'
inp=root/'yabi_info_regenerated_from_100bt_10.xlsx'

r2=pd.read_excel(ref,sheet_name=1)
r3=pd.read_excel(ref,sheet_name=2)
ref_ids=set()
for df in (r2,r3):
    for _,row in df.iterrows():
        if len(row)>3:
            ref_ids.update(ids(row.iloc[3]))

s0=pd.read_excel(inp,sheet_name=0)
cur_ids=set()
for v in s0['亚比ID'].tolist():
    cur_ids.update(ids(v))

ov=sorted(cur_ids & ref_ids)
print('current_ids',len(cur_ids),'minmax',min(cur_ids),max(cur_ids))
print('ref_ids',len(ref_ids),'minmax',min(ref_ids),max(ref_ids))
print('overlap',len(ov),'sample',ov[:20])
