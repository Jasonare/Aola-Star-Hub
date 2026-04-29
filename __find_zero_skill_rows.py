import pandas as pd
from pathlib import Path

p=Path(r"C:\工作娱乐\Aola-Star-Hub\原系亚比_100bt_编号_技能_种族值.xlsx")
xl=pd.ExcelFile(p)
print('sheets',xl.sheet_names)
s0=pd.read_excel(p,sheet_name=0)
print('cols',list(s0.columns))

c_skill=next((c for c in s0.columns if '技能行数' in str(c)), None)
c_id=next((c for c in s0.columns if '编号集合' in str(c)), None)
c_url=next((c for c in s0.columns if '详情链接' in str(c)), None)
c_title=next((c for c in s0.columns if '页面标题' in str(c)), None)
print('picked',c_skill,c_id,c_url,c_title)

if c_skill is None:
    raise SystemExit('no skill column')

z=s0[pd.to_numeric(s0[c_skill],errors='coerce').fillna(0)==0].copy()
print('zero_rows',len(z))
if len(z):
    print(z[[c_id,c_url,c_title,c_skill]].head(20).to_string(index=False))

out=Path(r"C:\工作娱乐\Aola-Star-Hub\__zero_skill_rows.csv")
z.to_csv(out,index=False,encoding='utf-8-sig')
print('saved',out)
