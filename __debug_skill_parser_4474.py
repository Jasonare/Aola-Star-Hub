import re
from urllib.request import Request, urlopen

UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64)'

def norm_html_text(s: str) -> str:
    s = re.sub(r"<[^>]+>", " ", s)
    s = s.replace("\xa0", " ")
    s = re.sub(r"\s+", " ", s)
    return s.strip()


def parse_skill_rows_by_tr(html: str):
    rows = []
    tr_blocks = re.findall(r"<tr[^>]*>([\s\S]*?)</tr>", html, flags=re.I)
    print('tr_blocks', len(tr_blocks))

    in_skill_section = False
    for i, tr in enumerate(tr_blocks, start=1):
        tds = re.findall(r"<t[dh][^>]*>([\s\S]*?)</t[dh]>", tr, flags=re.I)
        vals = [norm_html_text(x) for x in tds]
        if not vals:
            continue
        line = " ".join(vals)

        if ("技能表" in line and len(vals) <= 3) or (
            set(["技能名", "攻击类型", "技能属性", "威力", "使用次数", "学习等级"]).issubset(set(vals))
        ):
            in_skill_section = True
            print('enter skill at', i, vals)
            continue

        if not in_skill_section:
            continue

        if vals[0] in ("获取方式", "推荐性格", "学习力", "推荐配招", "配招推荐", "种族值"):
            print('break at', i, vals[:3])
            break

        if len(vals) >= 7:
            name = vals[0]
            if name in ("技能名", "技能名称", "亚比技能"):
                continue
            if not name:
                continue
            rows.append(
                {
                    "技能名称": vals[0],
                    "技能类型": vals[1],
                    "技能属性": vals[2],
                    "威力": vals[3],
                    "PP值": vals[4],
                    "获取等级": vals[5],
                    "技能描述": vals[6],
                }
            )

    print('raw rows', len(rows))
    return rows

u='http://aola.100bt.com/tujian/4474.html'
req=Request(u,headers={'User-Agent':UA,'Referer':'http://aola.100bt.com/'})
with urlopen(req,timeout=25) as r:
    raw=r.read()
html = raw.decode('utf-8', errors='ignore')
rows=parse_skill_rows_by_tr(html)
print('rows',len(rows))
if rows:
    print(rows[0])
