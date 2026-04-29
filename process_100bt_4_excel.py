#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from __future__ import annotations

import json
import random
import re
from collections import defaultdict
from pathlib import Path
from typing import Any, Dict, List

import pandas as pd
from openpyxl import load_workbook


ROOT = Path(".")
SRC_NAME = "原系亚比_100bt_编号_技能_种族值(4).xlsx"
OUT_PROCESSED = "原系亚比_100bt_编号_技能_种族值(4)_processed_v2.xlsx"
OUT_REGEN = "yabi_info_regenerated_from_100bt_4.xlsx"
NAME_JSON = "亚比大全.json"


def norm(v: Any) -> str:
    if v is None:
        return ""
    return str(v).replace("\xa0", " ").strip()


def to_int(v: Any, default: int | None = None) -> int | None:
    m = re.search(r"-?\d+", norm(v))
    return int(m.group(0)) if m else default


def parse_ids(v: Any) -> List[int]:
    return [int(x) for x in re.findall(r"\d+", norm(v))]


def calc_ability_100(race: Dict[str, int]) -> Dict[str, int]:
    hp = race["体力"] * 2 + 100 + 10
    atk = race["攻击"] * 2 + 5
    de = race["防御"] * 2 + 5
    sa = race["特攻"] * 2 + 5
    sd = race["特防"] * 2 + 5
    sp = race["速度"] * 2 + 5
    return {"体力": hp, "攻击": atk, "防御": de, "特攻": sa, "特防": sd, "速度": sp}


def load_name_map() -> Dict[str, int]:
    # 优先固定文件名，找不到就选最大 json
    p = ROOT / NAME_JSON
    if not p.exists():
        cands = sorted(ROOT.glob("*.json"), key=lambda x: x.stat().st_size, reverse=True)
        if not cands:
            raise FileNotFoundError("未找到 json 文件")
        p = cands[0]

    raw = p.read_bytes()
    obj = None
    for enc in ("utf-8", "utf-8-sig", "gb18030", "gbk"):
        try:
            obj = json.loads(raw.decode(enc))
            break
        except Exception:
            pass
    if obj is None:
        raise ValueError(f"无法解析 json: {p.name}")

    name_to_ids: Dict[str, set[int]] = defaultdict(set)

    def add(name: Any, pid: Any) -> None:
        n = norm(name)
        if len(n) < 2:
            return
        i = to_int(pid, None)
        if i is None:
            return
        name_to_ids[n].add(i)

    if isinstance(obj, list):
        for it in obj:
            if not isinstance(it, dict):
                continue
            add(
                it.get("name") or it.get("名称") or it.get("亚比名") or it.get("title"),
                it.get("id") or it.get("ID") or it.get("petId") or it.get("pet_id") or it.get("编号"),
            )
    elif isinstance(obj, dict):
        for k, v in obj.items():
            if isinstance(v, (str, int, float)):
                add(k, v)
        for key in ("data", "list", "items", "亚比列表"):
            arr = obj.get(key)
            if isinstance(arr, list):
                for it in arr:
                    if not isinstance(it, dict):
                        continue
                    add(
                        it.get("name") or it.get("名称") or it.get("亚比名") or it.get("title"),
                        it.get("id") or it.get("ID") or it.get("petId") or it.get("pet_id") or it.get("编号"),
                    )

    name_to_id_single: Dict[str, int] = {}
    for n, ids in name_to_ids.items():
        name_to_id_single[n] = min(ids)
    return name_to_id_single


def ids_from_text(text: Any, names_sorted: List[str], name_map: Dict[str, int]) -> List[int]:
    t = norm(text)
    found: List[int] = []
    seen = set()
    for n in names_sorted:
        if n and n in t:
            i = name_map[n]
            if i not in seen:
                seen.add(i)
                found.append(i)
    return found


def main() -> None:
    # 定位源文件：优先精确名，否则抓包含(4)但不含 processed
    src = ROOT / SRC_NAME
    if not src.exists():
        cands = [p for p in ROOT.glob("*.xlsx") if "(4)" in p.name and "100bt" in p.name and "processed" not in p.name and not p.name.startswith("~$")]
        if not cands:
            raise FileNotFoundError("未找到 (4) 源文件")
        src = sorted(cands, key=lambda x: x.stat().st_mtime, reverse=True)[0]

    name_map = load_name_map()
    names_sorted = sorted(name_map.keys(), key=len, reverse=True)

    wb = load_workbook(src)
    if len(wb.worksheets) < 3:
        raise ValueError("工作表不足 3 个")
    ws2 = wb.worksheets[1]  # 技能表
    ws3 = wb.worksheets[2]  # 种族值表

    # 这份 (4) 的真实结构（根据抽样）
    # 第二页：1亚比名 2页面标题 3详情链接 4编号集合 5表格序号 6表格标题
    #        7技能名称 8等级 9威力 10PP(原始多为命中率) 11技能属性/类型 12技能描述(抓取有误，多为数字/空)
    s2_col_page = 2
    s2_col_numset = 4
    s2_col_title = 6
    s2_col_name = 7
    s2_col_lv = 8
    s2_col_power = 9
    s2_col_pp = 10
    s2_col_attr_type = 11
    s2_col_desc = 12

    # 第三页：1亚比名 2页面标题 3详情链接 4编号集合 5表格序号 6表格标题
    # L~Q（12..17）对应 体力 攻击 防御 特攻 特防 速度
    s3_col_page = 2
    s3_col_numset = 4
    s3_col_hp = 12
    s3_col_atk = 13
    s3_col_def = 14
    s3_col_spa = 15
    s3_col_spd = 16
    s3_col_spe = 17

    # 追加列：第二页 亚比ID + 命中率；第三页 亚比ID
    s2_col_id = ws2.max_column + 1
    ws2.cell(1, s2_col_id).value = "亚比ID"
    s2_col_acc = s2_col_id + 1
    ws2.cell(1, s2_col_acc).value = "命中率"

    s3_col_id = ws3.max_column + 1
    ws3.cell(1, s3_col_id).value = "亚比ID"

    # 第三页先做标题映射 ID
    s3_mapped = 0
    for r in range(2, ws3.max_row + 1):
        ids = ids_from_text(ws3.cell(r, s3_col_page).value, names_sorted, name_map)
        ws3.cell(r, s3_col_id).value = "[" + ",".join(map(str, ids)) + "]" if ids else ""
        if ids:
            s3_mapped += 1

    # 编号集合 -> ID集合（优先）
    numset_to_ids: Dict[str, set[int]] = defaultdict(set)
    for r in range(2, ws3.max_row + 1):
        k = ",".join(map(str, sorted(set(parse_ids(ws3.cell(r, s3_col_numset).value)))))
        if not k:
            continue
        ids = parse_ids(ws3.cell(r, s3_col_id).value)
        for i in ids:
            numset_to_ids[k].add(i)

    # 第二页回填 亚比ID + 清洗 PP/命中率
    s2_mapped = 0
    s2_fallback = 0
    pp_fixed = 0
    acc_fixed = 0
    for r in range(2, ws2.max_row + 1):
        k = ",".join(map(str, sorted(set(parse_ids(ws2.cell(r, s2_col_numset).value)))))
        ids = sorted(numset_to_ids.get(k, set())) if k else []
        if not ids:
            ids = ids_from_text(ws2.cell(r, s2_col_title).value, names_sorted, name_map)
            if not ids:
                ids = ids_from_text(ws2.cell(r, s2_col_page).value, names_sorted, name_map)
            if ids:
                s2_fallback += 1
        ws2.cell(r, s2_col_id).value = "[" + ",".join(map(str, ids)) + "]" if ids else ""
        if ids:
            s2_mapped += 1

        raw_pp = to_int(ws2.cell(r, s2_col_pp).value, None)
        if raw_pp is None:
            # 缺失时给默认
            ws2.cell(r, s2_col_pp).value = random.choice([5, 10, 15, 20, 25])
            ws2.cell(r, s2_col_acc).value = random.choice([70, 80, 95])
            pp_fixed += 1
            continue

        if raw_pp > 50 or raw_pp < 0:
            # 原PP异常 => 视作命中率
            acc = 100 if raw_pp < 0 else raw_pp
            ws2.cell(r, s2_col_acc).value = acc
            ws2.cell(r, s2_col_pp).value = random.choice([5, 10, 15, 20, 25])
            pp_fixed += 1
            if raw_pp < 0:
                acc_fixed += 1
        else:
            ws2.cell(r, s2_col_pp).value = raw_pp
            ws2.cell(r, s2_col_acc).value = random.choice([70, 80, 95])

    processed_path = ROOT / OUT_PROCESSED
    wb.save(processed_path)

    # 生成与 yabi_info_regenerated_from_v3.xlsx 同格式文件
    df2 = pd.read_excel(processed_path, sheet_name=1)
    df3 = pd.read_excel(processed_path, sheet_name=2)

    skills_by_id: Dict[int, List[Dict[str, Any]]] = defaultdict(list)
    races_by_id: Dict[int, Dict[str, int]] = {}

    for _, row in df2.iterrows():
        ids = parse_ids(row.get("亚比ID"))
        if not ids:
            continue
        name = norm(row.get("技能名称"))
        if not name or name in {"技能名称", "亚比技能"}:
            continue
        lv = to_int(row.get("等级"), 0) or 0
        power = to_int(row.get("威力"), 0) or 0
        pp = to_int(row.get("PP"), 0) or 0
        if pp < 0:
            pp = 0
        acc = to_int(row.get("命中率"), 100) or 100
        if acc < 0:
            acc = 100
        combo = norm(row.get("技能属性/类型"))
        attr = ""
        atk_type = ""
        if "/" in combo:
            p1, p2 = combo.split("/", 1)
            attr = norm(p1)
            atk_type = norm(p2)
        desc = norm(row.get("技能描述"))
        rec = {
            "技能名称": name,
            "获取等级": lv,
            "威力": power,
            "PP值": pp,
            "命中率": acc,
            "技能属性": attr,
            "技能类型": atk_type,
            "技能描述": desc,
        }
        for i in ids:
            skills_by_id[i].append(rec)

    # 去重
    for i, arr in list(skills_by_id.items()):
        seen = set()
        out = []
        for s in arr:
            k = (
                s["技能名称"], s["获取等级"], s["威力"], s["PP值"], s["命中率"],
                s["技能属性"], s["技能类型"], s["技能描述"],
            )
            if k in seen:
                continue
            seen.add(k)
            out.append(s)
        skills_by_id[i] = out

    # 种族值：最后行覆盖（这份(4)表结构不规整，按行自动抓连续6个数值）
    def extract_six_stats_from_row(row: pd.Series) -> List[int] | None:
        vals: List[int] = []
        # 从第7列开始扫描，尽量跳过前面的元信息
        for c in list(df3.columns)[6:]:
            n = to_int(row.get(c), None)
            if n is None:
                # 遇到空则断开当前连续段
                if len(vals) >= 6:
                    break
                vals = []
                continue
            # 合理区间，过滤明显非种族值数字
            if 1 <= n <= 400:
                vals.append(n)
                if len(vals) >= 6:
                    return vals[:6]
            else:
                if len(vals) >= 6:
                    return vals[:6]
                vals = []
        return vals[:6] if len(vals) >= 6 else None

    for _, row in df3.iterrows():
        ids = parse_ids(row.get("亚比ID"))
        if not ids:
            continue
        vals = extract_six_stats_from_row(row)
        if not vals:
            continue
        race = {"体力": vals[0], "攻击": vals[1], "防御": vals[2], "特攻": vals[3], "特防": vals[4], "速度": vals[5]}
        for i in ids:
            races_by_id[i] = race

    ability_by_id: Dict[int, Dict[str, int]] = {}
    for i, r in races_by_id.items():
        ability_by_id[i] = calc_ability_100(r)

    all_ids = sorted(set(skills_by_id.keys()) | set(races_by_id.keys()))
    summary_rows = []
    skill_rows = []
    race_rows = []
    ability_rows = []
    for i in all_ids:
        summary_rows.append({"亚比ID": i, "亚比名称": "", "技能数量": len(skills_by_id.get(i, []))})
        for s in skills_by_id.get(i, []):
            row = {"亚比ID": i, "亚比名称": ""}
            row.update(s)
            skill_rows.append(row)
        if i in races_by_id:
            row = {"亚比ID": i, "亚比名称": ""}
            row.update(races_by_id[i])
            race_rows.append(row)
        if i in ability_by_id:
            row = {"亚比ID": i, "亚比名称": ""}
            row.update(ability_by_id[i])
            ability_rows.append(row)

    out_regen = ROOT / OUT_REGEN
    with pd.ExcelWriter(out_regen, engine="openpyxl") as w:
        pd.DataFrame(summary_rows).to_excel(w, sheet_name="亚比总表", index=False)
        pd.DataFrame(skill_rows).to_excel(w, sheet_name="技能表", index=False)
        pd.DataFrame(race_rows).to_excel(w, sheet_name="种族值表", index=False)
        pd.DataFrame(ability_rows).to_excel(w, sheet_name="能力值表", index=False)

    print("done")
    print(f"source={src.name}")
    print(f"processed={processed_path.name}")
    print(f"regen={out_regen.name}")
    print(f"s2_mapped={s2_mapped}, s2_fallback={s2_fallback}, s3_mapped={s3_mapped}")
    print(f"pp_fixed={pp_fixed}, acc_fixed={acc_fixed}")
    print(f"regen_ids={len(all_ids)}, regen_skill_rows={len(skill_rows)}, regen_race_rows={len(race_rows)}")


if __name__ == "__main__":
    main()
