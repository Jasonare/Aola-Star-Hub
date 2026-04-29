import re
from urllib.request import Request, urlopen


def norm(s):
    s = '' if s is None else str(s)
    s = re.sub(r'<[^>]+>', ' ', s)
    s = s.replace('\xa0', ' ')
    s = re.sub(r'\s+', ' ', s).strip()
    return s


def normalize_element_name(raw: str) -> str:
    t = norm(raw).replace('属性', '').replace('亚比', '').strip()
    if not t:
        return ''
    if not t.endswith('系'):
        t = f'{t}系'
    return t


def element_from_attr_type(s: str) -> str:
    t = norm(s).replace('／', '/')
    if not t:
        return ''
    if '/' in t:
        a, b = [norm(x) for x in t.split('/', 1)]
        atk_types = {'普通攻击', '特殊攻击', '属性攻击'}
        if a in atk_types and b:
            return normalize_element_name(b)
        if b in atk_types and a:
            return normalize_element_name(a)
        return normalize_element_name(a)
    return normalize_element_name(t)


def infer_from_html(html: str):
    # 直接按技能行模式提取 “属性/类型”
    # 兼容：<td>技能名</td><td>等级</td><td>威力</td><td>PP</td><td>冰 /特殊攻击</td>
    hits = re.findall(r'<tr[^>]*>\s*(?:<td[^>]*>[\s\S]*?</td>\s*){4}<td[^>]*>([\s\S]*?)</td>', html, flags=re.I)
    freq = {}
    for h in hits:
        e = element_from_attr_type(h)
        if not e:
            continue
        freq[e] = freq.get(e, 0) + 1
    non_normal = [k for k in freq if k != '普通系']
    if non_normal and '普通系' in freq:
        freq.pop('普通系', None)
    return [k for k,_ in sorted(freq.items(), key=lambda kv:(-kv[1], kv[0]))]


urls = [
    'http://aola.100bt.com/tujian/4333.html',
    'http://aola.100bt.com/tujian/4474.html',
    'http://aola.100bt.com/tujian/4615.html',
]
UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
for u in urls:
    req = Request(u, headers={'User-Agent': UA, 'Referer': 'http://aola.100bt.com/'})
    with urlopen(req, timeout=25) as r:
        raw = r.read()
    html = raw.decode('utf-8', errors='ignore')
    es = infer_from_html(html)
    print(u, '=>', es[:5], 'count', len(es))
