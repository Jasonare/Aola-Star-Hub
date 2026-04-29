import re
import json
from pathlib import Path
from urllib.request import Request, urlopen

import pandas as pd

ROOT = Path(r"C:\工作娱乐\Aola-Star-Hub")
IN_XLSX = ROOT / "原系亚比_100bt_编号_技能_种族值.xlsx"
OUT_XLSX = ROOT / "原系亚比_100bt_编号_技能_种族值_skill_retry_v2.xlsx"
REPORT = ROOT / "__skill_retry_report_v2.json"
ZERO_LIST = ROOT / "__zero_skill_id_list.txt"

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"


def norm_html_text(s: str) -> str:
    s = re.sub(r"<[^>]+>", " ", s)
    s = s.replace("\xa0", " ")
    s = re.sub(r"\s+", " ", s)
    return s.strip()


def fetch_html(url: str) -> str:
    req = Request(url, headers={"User-Agent": UA, "Referer": "http://aola.100bt.com/"})
    with urlopen(req, timeout=25) as resp:
        raw = resp.read()
    for enc in ("utf-8", "utf-8-sig", "gb18030", "gbk"):
        try:
            return raw.decode(enc, errors="ignore")
        except Exception:
            pass
    return raw.decode("utf-8", errors="ignore")


def parse_title(html: str, fallback: str) -> str:
    m = re.search(r"<h1[^>]*>([\s\S]*?)</h1>", html, flags=re.I)
    return norm_html_text(m.group(1)) if m else fallback


def parse_id_from_url(url: str) -> str:
    m = re.search(r"/tujian/(\d+)\.html", url)
    return m.group(1) if m else ""


def parse_skill_rows_by_tr(html: str):
    rows = []
    tr_blocks = re.findall(r"<tr[^>]*>([\s\S]*?)</tr>", html, flags=re.I)

    in_skill_section = False
    for tr in tr_blocks:
        tds = re.findall(r"<t[dh][^>]*>([\s\S]*?)</t[dh]>", tr, flags=re.I)
        vals = [norm_html_text(x) for x in tds]
        if not vals:
            continue
        line = " ".join(vals)

        # 进入技能段
        if ("技能表" in line and len(vals) <= 3) or (
            set(["技能名", "攻击类型", "技能属性", "威力", "使用次数", "学习等级"]).issubset(set(vals))
        ):
            in_skill_section = True
            continue

        if not in_skill_section:
            continue

        # 结束技能段
        if vals[0] in ("获取方式", "推荐性格", "学习力", "推荐配招", "配招推荐", "种族值"):
            break

        # 典型技能行：7列
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

    # 去重
    out = []
    seen = set()
    for r in rows:
        k = (
            r["技能名称"],
            r["技能类型"],
            r["技能属性"],
            r["威力"],
            r["PP值"],
            r["获取等级"],
            r["技能描述"],
        )
        if k in seen:
            continue
        seen.add(k)
        out.append(r)
    return out


s0 = pd.read_excel(IN_XLSX, sheet_name=0)
s1 = pd.read_excel(IN_XLSX, sheet_name=1)
s2 = pd.read_excel(IN_XLSX, sheet_name=2)

c_skill = next(c for c in s0.columns if "技能行数" in str(c))
c_url = next(c for c in s0.columns if "详情链接" in str(c))
c_idset = next(c for c in s0.columns if "编号集合" in str(c))
c_name = next(c for c in s0.columns if "亚比名" in str(c))
c_title = next(c for c in s0.columns if "页面标题" in str(c))

# 防止后续写字符串到int列报错
s0[c_idset] = s0[c_idset].astype(str)

zero_df = s0[pd.to_numeric(s0[c_skill], errors="coerce").fillna(0) == 0].copy()
zero_ids = [str(x).strip() for x in zero_df[c_idset].tolist()]
ZERO_LIST.write_text("\n".join(zero_ids), encoding="utf-8")

recovered = []
still_zero = []
new_skill_rows = []

for idx in zero_df.index.tolist():
    url = str(s0.at[idx, c_url]).strip()
    name = str(s0.at[idx, c_name]).strip()
    fallback_title = str(s0.at[idx, c_title]).strip()
    try:
        html = fetch_html(url)
        title = parse_title(html, fallback_title)
        sid = parse_id_from_url(url)
        skill_rows = parse_skill_rows_by_tr(html)

        if skill_rows:
            for r in skill_rows:
                r2 = {
                    "亚比名": name,
                    "页面标题": title,
                    "详情链接": url,
                    "编号集合": sid,
                    "表格序号": 1,
                    "表格标题": "技能表",
                }
                r2.update(r)
                new_skill_rows.append(r2)
            s0.at[idx, c_skill] = len(skill_rows)
            s0.at[idx, c_idset] = sid
            recovered.append({"idx": int(idx), "id": sid, "url": url, "skill_rows": len(skill_rows)})
        else:
            still_zero.append({"idx": int(idx), "id": sid, "url": url, "reason": "no_skill_rows"})
    except Exception as e:
        still_zero.append({"idx": int(idx), "id": parse_id_from_url(url), "url": url, "reason": str(e)})

if new_skill_rows:
    replace_urls = {x["url"] for x in recovered}
    if "详情链接" in s1.columns:
        s1_keep = s1[~s1["详情链接"].astype(str).isin(replace_urls)].copy()
    else:
        s1_keep = s1.copy()
    s1_new = pd.concat([s1_keep, pd.DataFrame(new_skill_rows)], ignore_index=True)
else:
    s1_new = s1

with pd.ExcelWriter(OUT_XLSX, engine="openpyxl") as w:
    s0.to_excel(w, sheet_name="亚比总表", index=False)
    s1_new.to_excel(w, sheet_name="技能表", index=False)
    s2.to_excel(w, sheet_name="种族值表", index=False)

report = {
    "zero_before": int(len(zero_df)),
    "recovered_count": int(len(recovered)),
    "still_zero_count": int(len(still_zero)),
    "recovered": recovered,
    "still_zero": still_zero,
    "output_xlsx": str(OUT_XLSX),
    "zero_id_list": str(ZERO_LIST),
}
REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
print(json.dumps({
    "zero_before": len(zero_df),
    "recovered_count": len(recovered),
    "still_zero_count": len(still_zero),
    "output_xlsx": str(OUT_XLSX)
}, ensure_ascii=False))
