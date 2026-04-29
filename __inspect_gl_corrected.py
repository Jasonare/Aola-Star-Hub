import pandas as pd
from pathlib import Path
p=Path(r"C:\工作娱乐\Aola-Star-Hub\原系亚比_100bt_编号_技能_种族值_skill_retry_v3_GL校正.xlsx")
xl=pd.ExcelFile(p)
print(xl.sheet_names)
s1=pd.read_excel(p,sheet_name=1)
print('rows',len(s1),'cols',len(s1.columns))
print('columns',list(s1.columns)[:20])
print('has 编号集合',any('编号集合' in str(c) for c in s1.columns))
