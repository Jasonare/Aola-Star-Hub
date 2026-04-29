import re
import json
from pathlib import Path
from urllib.request import Request, urlopen

import pandas as pd

ROOT = Path(r"C:\工作娱乐\Aola-Star-Hub")
IN_XLSX = ROOT / "原系亚比_100bt_编号_技能_种族值.xlsx"
OUT_XLSX = ROOT / "原系亚比_100bt_编号_技能_种族值_skill_retry.xlsx"
REPORT = ROOT / "__skill_retry_report.json"

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"


def norm(s):
    s = "" if s is None else str(s)
    s = re.sub(r"<[^>]+>", "", s)
    s = s.replace("\xa0", " ")
    s = re.sub(r"\s+", " ", s).strip()
    return s


def fetch_html(url: str) -> str:
    req = Request(url, headers={"User-Agent": UA, "Referer": "http://aola.100bt.com/"})
    with urlopen(req, timeout=20) as resp:
        raw = resp.read()
    for enc in ("utf-8", "utf-8-sig", "gb18030", "gbk"):
        try:
            return raw.decode(enc, errors="ignore")
        except Exception:
            pass
    return raw.decode("utf-8", errors="ignore")


def parse_title(html: str, fallback: str) -> str:
    m = re.search(r"<h1[^>]*>(.*?)</h1>", html, flags=re.I | re.S)
    return norm(m.group(1)) if m else fallback


def parse_ids(html: str, url: str):
    ids = re.findall(r"(?:序号|编号)\s*[:：]\s*([0-9]{1,8})", html)
    if ids:
        out = []
        for x in ids:
            if x not in out:
                out.append(x)
        return out
    m = re.search(r"/tujian/(\d+)\.html", url)
    return [m.group(1)] if m else []


def rows_from_pd_tables(html: str):
    out = []
    try:
        tables = pd.read_html(html)
    except Exception:
        return out
    for i, df in enumerate(tables, start=1):
        if df is None or df.empty:
            continue
        df = df.fillna("")
        header_txt = " ".join([norm(c) for c in df.columns])
        body_txt = " ".join([norm(x) for x in df.astype(str).values.flatten().tolist()[:80]])
        maybe_skill = any(k in (header_txt + " " + body_txt) for k in ["技能", "PP", "威力", "学习等级", "技能属性", "攻击类型", "技能属性/类型"])
        if not maybe_skill:
            continue

        # normalize columns
        cols = [norm(c) for c in df.columns]
        # handle unnamed columns
        if all((not c or c.lower().startswith('unnamed')) for c in cols):
            if len(df.columns) >= 6:
                cols = ["技能名称", "学习等级", "威力", "PP值", "技能属性/类型", "技能描述"] + [f"col_{k}" for k in range(7, len(df.columns)+1)]
        df.columns = cols

        for _, r in df.iterrows():
            vals = [norm(v) for v in r.tolist()]
            if not any(vals):
                continue
            joined = " ".join(vals)
            if "技能名称" in joined and "威力" in joined and "PP" in joined:
                continue

            rec = {str(df.columns[j]): vals[j] if j < len(vals) else "" for j in range(len(df.columns))}
            nm = norm(rec.get("技能名称") or rec.get("技能名") or rec.get("技能") or (vals[0] if vals else ""))
            if not nm or nm in ("技能名称", "技能名", "亚比技能"):
                continue
            # if no explicit skill name column, assign first column
            if "技能名称" not in rec:
                rec["技能名称"] = nm
            out.append((i, rec))
    return out


def rows_from_regex_table(html: str):
    out = []
    m = re.search(r"<table[^>]*id=[\"']yabi_table_propTable[\"'][\s\S]*?</table>", html, flags=re.I)
    if not m:
        return out
    table = m.group(0)
    trs = re.findall(r"<tr[^>]*>([\s\S]*?)</tr>", table, flags=re.I)
    for tr in trs:
        if "<th" in tr.lower():
            continue
        tds = re.findall(r"<td[^>]*>([\s\S]*?)</td>", tr, flags=re.I)
        vals = [norm(x) for x in tds]
        if len(vals) < 5:
            continue
        nm = vals[0]
        if not nm or nm in ("技能名称", "技能名"):
            continue
        rec = {
            "技能名称": vals[0],
            "学习等级": vals[1] if len(vals) > 1 else "",
            "威力": vals[2] if len(vals) > 2 else "",
            "PP值": vals[3] if len(vals) > 3 else "",
            "技能属性/类型": vals[4] if len(vals) > 4 else "",
            "技能描述": vals[5] if len(vals) > 5 else "",
        }
        out.append((1, rec))
    return out


s0 = pd.read_excel(IN_XLSX, sheet_name=0)
s1 = pd.read_excel(IN_XLSX, sheet_name=1)
s2 = pd.read_excel(IN_XLSX, sheet_name=2)

c_skill = next(c for c in s0.columns if '技能行数' in str(c))
c_url = next(c for c in s0.columns if '详情链接' in str(c))
c_idset = next(c for c in s0.columns if '编号集合' in str(c))
c_name = next(c for c in s0.columns if '亚比名' in str(c))
c_title = next(c for c in s0.columns if '页面标题' in str(c))

zero_idx = s0[pd.to_numeric(s0[c_skill], errors='coerce').fillna(0) == 0].index.tolist()

recovered = []
still_zero = []
all_new_skill_rows = []

for idx in zero_idx:
    url = str(s0.at[idx, c_url])
    name = str(s0.at[idx, c_name])
    title0 = str(s0.at[idx, c_title])
    try:
        html = fetch_html(url)
        title = parse_title(html, title0)
        ids = parse_ids(html, url)

        rows = rows_from_pd_tables(html)
        if not rows:
            rows = rows_from_regex_table(html)

        skill_rows = []
        for t_index, rec in rows:
            rec2 = dict(rec)
            rec2.update({
                '亚比名': name,
                '页面标题': title,
                '详情链接': url,
                '编号集合': ','.join(ids),
                '表格序号': t_index,
                '表格标题': '技能表',
            })
            skill_rows.append(rec2)

        # dedup by name+level+power+pp+type
        seen = set()
        clean = []
        for r in skill_rows:
            key = (
                norm(r.get('技能名称')),
                norm(r.get('学习等级') or r.get('获取等级')),
                norm(r.get('威力')),
                norm(r.get('PP值') or r.get('使用次数')),
                norm(r.get('技能属性/类型') or r.get('技能属性')),
            )
            if not key[0]:
                continue
            if key in seen:
                continue
            seen.add(key)
            clean.append(r)

        if clean:
            recovered.append({'idx': int(idx), 'url': url, 'count': len(clean), 'title': title})
            all_new_skill_rows.extend(clean)
            s0.at[idx, c_skill] = len(clean)
            if ids:
                s0.at[idx, c_idset] = ','.join(ids)
        else:
            still_zero.append({'idx': int(idx), 'url': url, 'reason': 'no skill rows parsed'})
    except Exception as e:
        still_zero.append({'idx': int(idx), 'url': url, 'reason': str(e)})

if len(all_new_skill_rows):
    replace_urls = {x['url'] for x in recovered}
    if '详情链接' in s1.columns:
        s1_keep = s1[~s1['详情链接'].astype(str).isin(replace_urls)].copy()
    else:
        s1_keep = s1.copy()
    s1_new = pd.concat([s1_keep, pd.DataFrame(all_new_skill_rows)], ignore_index=True)
else:
    s1_new = s1

with pd.ExcelWriter(OUT_XLSX, engine='openpyxl') as w:
    s0.to_excel(w, sheet_name='亚比总表', index=False)
    s1_new.to_excel(w, sheet_name='技能表', index=False)
    s2.to_excel(w, sheet_name='种族值表', index=False)

rep = {
    'zero_before': len(zero_idx),
    'recovered_count': len(recovered),
    'still_zero_count': len(still_zero),
    'recovered': recovered,
    'still_zero': still_zero,
    'output': str(OUT_XLSX),
}
REPORT.write_text(json.dumps(rep, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps({'zero_before': len(zero_idx), 'recovered_count': len(recovered), 'still_zero_count': len(still_zero), 'output': str(OUT_XLSX)}, ensure_ascii=False))
