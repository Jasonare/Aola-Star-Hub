from pathlib import Path
import re

p = Path(r'C:\工作娱乐\Aola-Star-Hub\crawl_4399_original_yabi.py')
text = p.read_text(encoding='utf-8')
pat = re.compile(r'def normalize_element_name\(raw: str\) -> str:\n(?:    .*\n){1,12}', re.M)
new_func = '''def normalize_element_name(raw: str) -> str:
    t = normalize_text(raw)
    t = t.replace("属性", "").replace("亚比", "").strip()
    if not t:
        return ""
    if not t.endswith("系"):
        t = f"{t}系"
    return t
'''
text2 = pat.sub(new_func, text, count=1)
if text2 == text:
    raise RuntimeError('normalize_element_name not replaced')
p.write_text(text2, encoding='utf-8')
print('replaced normalize_element_name')
