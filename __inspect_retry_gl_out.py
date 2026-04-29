import pandas as pd
from pathlib import Path
p=Path(r"C:\工作娱乐\Aola-Star-Hub\yabi_info_regenerated_from_100bt_skill_retry_v3_gl.xlsx")
xl=pd.ExcelFile(p)
print('sheets',xl.sheet_names)
for i,s in enumerate(xl.sheet_names):
    df=pd.read_excel(p,sheet_name=i)
    print(i,s,'rows',len(df),'cols',list(df.columns))
