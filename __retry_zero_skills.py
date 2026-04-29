import re
import json
from pathlib import Path
from urllib.request import Request, urlopen

import pandas as pd
from bs4 import BeautifulSoup

from crawl_4399_original_yabi import (
    normalize_text,
    table_to_matrix,
    rows_to_dicts_with_header_scan,
    looks_like_skill_table,
    nearest_title_for_table,
)

ROOT = Path(r"C:\工作娱乐\Aola-Star-Hub")
IN_XLSX = ROOT / "原系亚比_100bt_编号_技能_种族值.xlsx"
OUT_XLSX = ROOT / "原系亚比_100bt_编号_技能_种族值_skill_retry.xlsx"
REPORT = ROOT / "__skill_retry_report.json"

s0 = pd.read_excel(IN_XLSX, sheet_name=0)
s1 = pd.read_excel(IN_XLSX, sheet_name=1)
s2 = pd.read_excel(IN_XLSX, sheet_name=2)

c_skill = next(c for c in s0.columns if '技能行数' in str(c))
c_url = next(c for c in s0.columns if '详情链接' in str(c))
c_idset = next(c for c in s0.columns if '编号集合' in str(c))
c_name = next(c for c in s0.columns if '亚比名' in str(c))
c_title = next(c for c in s0.columns if '页面标题' in str(c))

zero_idx = s0[pd.to_numeric(s0[c_skill], errors='coerce').fillna(0) == 0].index.tolist()

all_new_skill_rows = []
recovered = []
still_zero = []

UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

def fetch_html(url):
    req = Request(url, headers={'User-Agent': UA, 'Referer': 'http://aola.100bt.com/'})
    with urlopen(req, timeout=20) as resp:
        raw = resp.read()
    for enc in ('utf-8', 'utf-8-sig', 'gb18030', 'gbk'):
        try:
            return raw.decode(enc, errors='ignore')
        except Exception:
            pass
    return raw.decode('utf-8', errors='ignore')


def parse_ids(text, url):
    ids = re.findall(r"(?:序号|编号)\s*[:：]\s*([0-9]{1,8})", text)
    if ids:
        seen=[]
        for x in ids:
            if x not in seen:
                seen.append(x)
        return seen
    m = re.search(r"/tujian/(\d+)\.html", url)
    return [m.group(1)] if m else []

for idx in zero_idx:
    url = str(s0.at[idx, c_url])
    name = str(s0.at[idx, c_name])
    title0 = str(s0.at[idx, c_title])
    try:
        html_text = fetch_html(url)
        soup = BeautifulSoup(html_text, 'lxml')

        h1 = soup.select_one('h1')
        title = normalize_text(h1.get_text(' ', strip=True)) if h1 else title0

        main = soup.select_one('.main-con') or soup.select_one('.wz-con') or soup.select_one('.main') or soup
        all_text = normalize_text(main.get_text(' ', strip=True))
        ids = parse_ids(all_text, url)

        tables = main.select('table')
        if not tables:
            tables = soup.select('table')

        skill_rows = []
        t_index = 0
        for tb in tables:
            t_index += 1
            matrix = table_to_matrix(tb)
            if not matrix:
                continue
            if not looks_like_skill_table(matrix):
                continue
            block_title = nearest_title_for_table(tb)
            recs = rows_to_dicts_with_header_scan(matrix, 'skill')
            for rec in recs:
                rec.update({
                    '亚比名': name,
                    '页面标题': title,
                    '详情链接': url,
                    '编号集合': ','.join(ids),
                    '表格序号': t_index,
                    '表格标题': block_title,
                })
                skill_rows.append(rec)

        clean = []
        for rec in skill_rows:
            nm = normalize_text(rec.get('技能名称') or rec.get('技能名') or rec.get('技能') or '')
            if not nm:
                continue
            if nm in ('技能名称', '技能名', '亚比技能'):
                continue
            clean.append(rec)

        if clean:
            recovered.append({'url':url, 'count':len(clean), 'title':title})
            all_new_skill_rows.extend(clean)
            s0.at[idx, c_skill] = len(clean)
            if ids:
                s0.at[idx, c_idset] = ','.join(ids)
        else:
            still_zero.append({'url':url, 'reason':'no skill rows parsed'})

    except Exception as e:
        still_zero.append({'url':url, 'reason':str(e)})

if len(all_new_skill_rows):
    replace_urls = {x['url'] for x in recovered}
    s1_keep = s1[~s1['详情链接'].astype(str).isin(replace_urls)].copy() if '详情链接' in s1.columns else s1.copy()
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
print(json.dumps({
    'zero_before': len(zero_idx),
    'recovered_count': len(recovered),
    'still_zero_count': len(still_zero),
    'output': str(OUT_XLSX)
}, ensure_ascii=False))
