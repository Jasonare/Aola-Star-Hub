from pathlib import Path
import re

p = Path(r'C:\工作娱乐\Aola-Star-Hub\crawl_4399_original_yabi.py')
text = p.read_text(encoding='utf-8')
pat = re.compile(r'ELEMENT_PATH_HINTS\s*=\s*\{.*?\n\}', re.S)
new_block = '''ELEMENT_PATH_HINTS = {
    "木系": ["muxi"],
    "火系": ["huoxi"],
    "水系": ["shuixi"],
    "冰系": ["bingxi"],
    "土系": ["tuxi"],
    "电系": ["dianxi"],
    "光明系": ["guangmingxi"],
    "暗黑系": ["anheixi", "anxi"],
    "神秘系": ["shenmixi"],
    "机械系": ["jixiexi"],
    "飞行系": ["feixingxi", "feixing"],
    "龙系": ["longxi"],
    "上古系": ["shangguxi", "shanggu"],
    "数码系": ["shumaxi"],
    "格斗系": ["gedouxi"],
    "王系": ["wangxi"],
    "神兵系": ["shenbingxi", "shenbing"],
    "圣灵系": ["shenglingxi", "shengling"],
    "爬行系": ["paxingxi", "paxing"],
    "普通系": ["putongxi", "putong"],
    "毒系": ["duxi"],
}
'''
text2 = pat.sub(new_block.rstrip('\n'), text, count=1)
if text2 == text:
    raise RuntimeError('ELEMENT_PATH_HINTS block not replaced')
p.write_text(text2, encoding='utf-8')
print('replaced')
