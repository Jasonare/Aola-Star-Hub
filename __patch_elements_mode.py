from pathlib import Path
import re

p = Path(r'C:\工作娱乐\Aola-Star-Hub\crawl_4399_original_yabi.py')
text = p.read_text(encoding='utf-8')
orig = text

# 1) add default output for element-only mode
if 'DEFAULT_ELEMENT_OUTPUT' not in text:
    text = re.sub(
        r'(^DEFAULT_OUTPUT\s*=\s*.+$)',
        r"\1\nDEFAULT_ELEMENT_OUTPUT = \"original_yabi_elements.xlsx\"",
        text,
        flags=re.M,
        count=1,
    )

# 2) add parse_detail_elements_only before _ordered_columns
if 'def parse_detail_elements_only(' not in text:
    anchor = 'def _ordered_columns('
    idx = text.find(anchor)
    if idx == -1:
        raise RuntimeError('anchor _ordered_columns not found')
    insert = '''\n\ndef parse_detail_elements_only(session: requests.Session, item: YabiItem) -> dict:
    resp = session.get(item.detail_url)
    resp.raise_for_status()
    html = decode_response(resp)
    soup = BeautifulSoup(html, "lxml")

    h1 = soup.select_one("h1")
    title = normalize_text(h1.get_text(" ", strip=True)) if h1 else normalize_text(item.name)
    if not title:
        title = normalize_text(item.name)

    main = (
        soup.select_one(".main-con")
        or soup.select_one(".wz-con")
        or soup.select_one(".main")
        or soup
    )
    all_text = normalize_text(main.get_text(" ", strip=True))
    ids = extract_ids_from_text(all_text)
    if not ids:
        bt_id = extract_bt_id_from_url(item.detail_url)
        if bt_id:
            ids = [bt_id]
    elements = extract_elements_from_text(all_text)

    return {
        "item_name": item.name,
        "page_title": title,
        "detail_url": item.detail_url,
        "id_set": ",".join(ids),
        "id_count": len(ids),
        "elements": ",".join(elements),
        "element_count": len(elements),
        "source": item.source,
        "status": "ok" if (ids or elements) else "empty",
        "error": "",
    }
'''
    text = text[:idx] + insert + text[idx:]

# 3) add write_elements_excel_streaming after write_excel_streaming
if 'def write_elements_excel_streaming(' not in text:
    anchor = 'def crawl_all('
    idx = text.find(anchor)
    if idx == -1:
        raise RuntimeError('anchor crawl_all not found')
    insert = '''\n\ndef write_elements_excel_streaming(
    output_path: str,
    rows: Sequence[Dict[str, object]],
) -> None:
    wb = Workbook(write_only=True)
    cols = _ordered_columns(
        rows,
        preferred=[
            "item_name",
            "page_title",
            "detail_url",
            "elements",
            "element_count",
            "id_set",
            "id_count",
            "source",
            "status",
            "error",
        ],
    )
    ws = wb.create_sheet(title="element_table")
    ws.append(cols)
    for r in rows:
        ws.append([_safe_cell(r.get(c, "")) for c in cols])
    wb.save(output_path)
'''
    text = text[:idx] + insert + text[idx:]

# 4) update crawl_all signature
if 'parse_elements_only:' not in text:
    text = text.replace(
        '    source_mode: str,\n) -> None:',
        '    source_mode: str,\n    parse_elements_only: bool,\n) -> None:',
        1,
    )

# 5) inject element-only branch near start of crawl_all body
if 'if parse_elements_only:' not in text:
    marker = '    summaries: List[dict] = []\n    all_skills: List[dict] = []\n    all_races: List[dict] = []\n'
    pos = text.find(marker)
    if pos == -1:
        raise RuntimeError('crawl_all list init marker not found')
    insert = marker + '''\n    if parse_elements_only:\n        element_rows: List[dict] = []\n        for idx, item in enumerate(items, start=1):\n            try:\n                rec = parse_detail_elements_only(session, item)\n                element_rows.append(rec)\n                print(\n                    f"[{idx}/{len(items)}] element: {rec.get('page_title', '')[:36]} "\n                    f"(id={rec.get('id_count', 0)} / elements={rec.get('element_count', 0)})"\n                )\n            except Exception as e:\n                element_rows.append(\n                    {\n                        "item_name": item.name,\n                        "page_title": "",\n                        "detail_url": item.detail_url,\n                        "id_set": "",\n                        "id_count": 0,\n                        "elements": "",\n                        "element_count": 0,\n                        "source": item.source,\n                        "status": "error",\n                        "error": str(e),\n                    }\n                )\n                print(f"[{idx}/{len(items)}] failed: {item.name} -> {e}")\n\n            if idx < len(items):\n                time.sleep(random.uniform(delay_min, delay_max))\n\n        if req_elements:\n            req_set = set(req_elements)\n            element_rows = [\n                r\n                for r in element_rows\n                if any(normalize_element_name(x) in req_set for x in str(r.get("elements", "")).split(",") if x)\n            ]\n        elif allowed_elements:\n            allowed_set = set(allowed_elements)\n            element_rows = [\n                r\n                for r in element_rows\n                if any(normalize_element_name(x) in allowed_set for x in str(r.get("elements", "")).split(",") if x)\n            ]\n\n        write_elements_excel_streaming(output_path=output_path, rows=element_rows)\n        print("\\nDone (element-only mode)")\n        print(f"- candidate pages: {len(items)}")\n        print(f"- element rows: {len(element_rows)}")\n        print(f"- output file: {output_path}")\n        return\n\n'''
    text = text.replace(marker, insert, 1)

# 6) add parser arg
if '--parse-elements-only' not in text:
    anchor = '    p.add_argument(\n        "--source-mode",'
    idx = text.find(anchor)
    if idx == -1:
        raise RuntimeError('parser source-mode anchor not found')
    insert = '''    p.add_argument(\n        "--parse-elements-only",\n        action="store_true",\n        help=f"element-only mode: parse and export elements only (default output: {DEFAULT_ELEMENT_OUTPUT})",\n    )\n'''
    text = text[:idx] + insert + text[idx:]

# 7) default output switch in main
if 'if args.parse_elements_only and args.output == DEFAULT_OUTPUT:' not in text:
    marker = 'def main():\n    args = build_parser().parse_args()\n'
    repl = 'def main():\n    args = build_parser().parse_args()\n    if args.parse_elements_only and args.output == DEFAULT_OUTPUT:\n        args.output = DEFAULT_ELEMENT_OUTPUT\n'
    if marker not in text:
        raise RuntimeError('main args marker not found')
    text = text.replace(marker, repl, 1)

# 8) pass new arg into crawl_all call
if 'parse_elements_only=args.parse_elements_only' not in text:
    text = text.replace(
        '        source_mode=args.source_mode,\n    )',
        '        source_mode=args.source_mode,\n        parse_elements_only=args.parse_elements_only,\n    )',
        1,
    )

if text != orig:
    p.write_text(text, encoding='utf-8')
    print('patched')
else:
    print('no_change')
