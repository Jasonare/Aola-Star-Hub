import re
from urllib.request import Request, urlopen

UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
ATTACK_TYPES={'普通攻击','特殊攻击','属性攻击'}
STOP_KEYS={'获取方式','推荐性格','学习力','推荐配招','配招推荐','种族值'}


def norm_html_text(s: str) -> str:
    s = re.sub(r"<[^>]+>", " ", s)
    s = s.replace("\xa0", " ")
    s = re.sub(r"\s+", " ", s)
    return s.strip()


def parse_skill_rows_by_tr(html: str):
    rows = []
    tr_blocks = re.findall(r"<tr[^>]*>([\s\S]*?)</tr>", html, flags=re.I)
    in_skill_section = False
    saw_skill_title = False

    for tr in tr_blocks:
        tds = re.findall(r"<t[dh][^>]*>([\s\S]*?)</t[dh]>", tr, flags=re.I)
        vals = [norm_html_text(x) for x in tds]
        if not vals:
            continue

        # 单元格恰好“技能表”才视为段落标题
        if len(vals) == 1 and vals[0] == '技能表':
            saw_skill_title = True
            continue

        is_header = set(['技能名','攻击类型','技能属性','威力','使用次数','学习等级']).issubset(set(vals))
        if is_header:
            in_skill_section = True
            continue

        if not in_skill_section:
            continue

        if vals[0] in STOP_KEYS and rows:
            break

        if len(vals) >= 7:
            name = vals[0]
            atk_type = vals[1]
            if not name or name in ('技能名','技能名称','亚比技能'):
                continue
            # 优先要求攻击类型合法，兜底放开
            if (atk_type in ATTACK_TYPES) or saw_skill_title:
                rows.append({
                    '技能名称': vals[0],
                    '技能类型': vals[1],
                    '技能属性': vals[2],
                    '威力': vals[3],
                    'PP值': vals[4],
                    '获取等级': vals[5],
                    '技能描述': vals[6],
                })

    out=[]; seen=set()
    for r in rows:
        k=(r['技能名称'],r['技能类型'],r['技能属性'],r['威力'],r['PP值'],r['获取等级'],r['技能描述'])
        if k in seen: continue
        seen.add(k); out.append(r)
    return out


def fetch(u):
    req=Request(u,headers={'User-Agent':UA,'Referer':'http://aola.100bt.com/'})
    with urlopen(req,timeout=25) as r: raw=r.read()
    return raw.decode('utf-8',errors='ignore')

urls=[
'http://aola.100bt.com/tujian/4474.html',
'http://aola.100bt.com/tujian/4549.html',
'http://aola.100bt.com/tujian/4612.html',
'http://aola.100bt.com/tujian/4966.html',
]
for u in urls:
    h=fetch(u)
    rows=parse_skill_rows_by_tr(h)
    print(u, 'rows=',len(rows), 'first=', (rows[0]['技能名称'] if rows else 'NONE'))
