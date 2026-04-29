from pathlib import Path
import re

p = Path(r'C:\工作娱乐\Aola-Star-Hub\crawl_4399_original_yabi.py')
text = p.read_text(encoding='utf-8')


def replace_func(src: str, name: str, new_def: str) -> str:
    pat = re.compile(rf'def {name}\([^\n]*\):\n(?:    .*\n)*?(?=\ndef |\Z)', re.M)
    out = pat.sub(new_def.strip('\n') + '\n\n', src, count=1)
    if out == src:
        raise RuntimeError(f'failed to replace {name}')
    return out

text = replace_func(
    text,
    'looks_like_race_table',
    '''def looks_like_race_table(rows: List[List[str]]) -> bool:
    if not rows:
        return False
    head = " ".join(" ".join(r) for r in rows[:6])
    keys = ["体力", "攻击", "防御", "特攻", "特防", "速度"]
    if sum(1 for k in keys if k in head) >= 4:
        return True
    joined = " ".join(" ".join(r) for r in rows[:14])
    return ("种族值" in joined) and ("体力" in joined) and ("速度" in joined)
''',
)

text = replace_func(
    text,
    'looks_like_skill_table',
    '''def looks_like_skill_table(rows: List[List[str]]) -> bool:
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
''',
)

text = replace_func(
    text,
    'rows_to_dicts_with_header_scan',
    '''def rows_to_dicts_with_header_scan(rows: List[List[str]], kind: str) -> List[Dict[str, str]]:
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
''',
)

p.write_text(text, encoding='utf-8')
print('replaced 3 funcs')
