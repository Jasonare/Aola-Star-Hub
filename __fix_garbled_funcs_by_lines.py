from pathlib import Path

p = Path(r'C:\工作娱乐\Aola-Star-Hub\crawl_4399_original_yabi.py')
lines = p.read_text(encoding='utf-8').splitlines()


def find_idx(prefix):
    for i,l in enumerate(lines):
        if l.startswith(prefix):
            return i
    raise RuntimeError(f'not found: {prefix}')

# replace block utility [start, end)
def replace_block(start_prefix, end_prefix, new_block):
    s = find_idx(start_prefix)
    e = find_idx(end_prefix)
    if e <= s:
        raise RuntimeError(f'bad range: {start_prefix} -> {end_prefix}')
    new_lines = new_block.strip('\n').split('\n')
    return lines[:s] + new_lines + [''] + lines[e:]

# 1) looks_like_race_table -> before looks_like_skill_table
race_block = '''
def looks_like_race_table(rows: List[List[str]]) -> bool:
    if not rows:
        return False
    head = " ".join(" ".join(r) for r in rows[:6])
    keys = ["体力", "攻击", "防御", "特攻", "特防", "速度"]
    if sum(1 for k in keys if k in head) >= 4:
        return True
    joined = " ".join(" ".join(r) for r in rows[:14])
    return ("种族值" in joined) and ("体力" in joined) and ("速度" in joined)
'''
lines2 = replace_block('def looks_like_race_table(', 'def looks_like_skill_table(', race_block)
lines = lines2

# 2) looks_like_skill_table -> before nearest_title_for_table
skill_block = '''
def looks_like_skill_table(rows: List[List[str]]) -> bool:
    if not rows:
        return False
    head = " ".join(" ".join(r) for r in rows[:10])
    keys = [
        "技能", "技能名", "技能名称", "威力", "PP", "使用次数", "属性", "技能属性",
        "特效", "类型", "攻击类型", "学习等级", "等级",
    ]
    if sum(1 for k in keys if k in head) >= 2:
        return True
    joined = " ".join(" ".join(r) for r in rows[:20])
    return ("技能表" in joined) or (("技能名称" in joined) and ("技能描述" in joined))
'''
lines2 = replace_block('def looks_like_skill_table(', 'def nearest_title_for_table(', skill_block)
lines = lines2

# 3) rows_to_dicts_with_header_scan -> before extract_ids_from_text
scan_block = '''
def rows_to_dicts_with_header_scan(rows: List[List[str]], kind: str) -> List[Dict[str, str]]:
    if not rows:
        return []
    header_idx = None
    for i, r in enumerate(rows[:40]):
        t = " ".join(r)
        if kind == "skill" and (
            (("技能" in t or "技能名" in t) and ("威力" in t or "PP" in t or "使用次数" in t))
            or (("攻击类型" in t or "技能属性" in t) and "学习等级" in t)
        ):
            header_idx = i
            break
        if kind == "race":
            keys = ["体力", "攻击", "防御", "特攻", "特防", "速度"]
            if sum(1 for k in keys if k in t) >= 4:
                header_idx = i
                break
    if header_idx is None:
        header_idx = 0
    end_idx = len(rows)
    if kind == "race":
        for j in range(header_idx + 1, len(rows)):
            t = " ".join(rows[j])
            if "技能表" in t and len(rows[j]) <= 2:
                end_idx = j
                break
    return rows_to_dicts(rows[header_idx:end_idx])
'''
lines2 = replace_block('def rows_to_dicts_with_header_scan(', 'def extract_ids_from_text(', scan_block)
lines = lines2

p.write_text('\n'.join(lines) + '\n', encoding='utf-8')
print('replaced_blocks_ok')
