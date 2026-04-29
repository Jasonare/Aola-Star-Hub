import pandas as pd
from pathlib import Path
p=Path(r"C:\工作娱乐\Aola-Star-Hub\原系亚比_100bt_编号_技能_种族值(10).xlsx")
xl=pd.ExcelFile(p)
print('sheets',xl.sheet_names)
for i,s in enumerate(xl.sheet_names[:3]):
    df=pd.read_excel(p,sheet_name=i)
    print('---',i,s,'rows',len(df),'cols',len(df.columns))
    print(list(df.columns)[:22])
    if i in (1,2):
        for r in range(min(2,len(df))):
            print('row',r,[df.iloc[r,c] if c < len(df.columns) else None for c in range(min(18,len(df.columns)))])
