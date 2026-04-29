from pathlib import Path

p = Path(r'C:\工作娱乐\Aola-Star-Hub\crawl_4399_original_yabi.py')
text = p.read_text(encoding='utf-8')
orig = text

# 1) force source_mode in element-only mode
old = 'def crawl_all(\n'
if 'if parse_elements_only:\n        source_mode = "100bt-tujian"' not in text:
    text = text.replace(
        'def crawl_all(\n',
        'def crawl_all(\n',
        1,
    )
    text = text.replace(
        ') -> None:\n    referer = BT_BASE_URL if source_mode == "100bt-tujian" else BASE_URL\n',
        ') -> None:\n    if parse_elements_only:\n        source_mode = "100bt-tujian"\n\n    referer = BT_BASE_URL if source_mode == "100bt-tujian" else BASE_URL\n',
        1,
    )

# 2) skip elements filter in element-only mode
text = text.replace(
    'if req_elements and not scan_by_template:\n',
    'if req_elements and not scan_by_template and not parse_elements_only:\n',
    1,
)

# 3) remove element_rows filtering block in parse-elements-only branch
block = '''        if req_elements:
            req_set = set(req_elements)
            element_rows = [
                r
                for r in element_rows
                if any(normalize_element_name(x) in req_set for x in str(r.get("elements", "")).split(",") if x)
            ]
        elif allowed_elements:
            allowed_set = set(allowed_elements)
            element_rows = [
                r
                for r in element_rows
                if any(normalize_element_name(x) in allowed_set for x in str(r.get("elements", "")).split(",") if x)
            ]

'''
if block in text:
    text = text.replace(block, '', 1)

if text != orig:
    p.write_text(text, encoding='utf-8')
    print('patched_logic')
else:
    print('no_change')
