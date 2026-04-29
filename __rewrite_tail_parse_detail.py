from pathlib import Path

p = Path(r'C:\工作娱乐\Aola-Star-Hub\crawl_4399_original_yabi.py')
text = p.read_text(encoding='utf-8')
start = text.find('def parse_detail(session: requests.Session, item: YabiItem) -> Tuple[dict, List[dict], List[dict]]:')
if start < 0:
    raise RuntimeError('parse_detail anchor not found')

new_tail = '''def parse_detail(session: requests.Session, item: YabiItem) -> Tuple[dict, List[dict], List[dict]]:
    resp = session.get(item.detail_url)
    resp.raise_for_status()
    html_text = decode_response(resp)
    soup = BeautifulSoup(html_text, "lxml")

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

    skill_rows: List[dict] = []
    race_rows: List[dict] = []
    table_index = 0
    tables = main.select("table")
    if not tables:
        tables = soup.select("table")

    for table in tables:
        table_index += 1
        matrix = table_to_matrix(table)
        if not matrix:
            continue
        block_title = nearest_title_for_table(table)

        race_like = looks_like_race_table(matrix)
        skill_like = looks_like_skill_table(matrix)

        if race_like:
            for rec in rows_to_dicts_with_header_scan(matrix, "race"):
                rec.update(
                    {
                        "亚比名": item.name,
                        "页面标题": title,
                        "详情链接": item.detail_url,
                        "编号集合": ",".join(ids),
                        "表格序号": table_index,
                        "表格标题": block_title,
                    }
                )
                race_rows.append(rec)

        if skill_like:
            for rec in rows_to_dicts_with_header_scan(matrix, "skill"):
                rec.update(
                    {
                        "亚比名": item.name,
                        "页面标题": title,
                        "详情链接": item.detail_url,
                        "编号集合": ",".join(ids),
                        "表格序号": table_index,
                        "表格标题": block_title,
                    }
                )
                skill_rows.append(rec)

    summary = {
        "亚比名": item.name,
        "页面标题": title,
        "详情链接": item.detail_url,
        "系别集合": ",".join(elements),
        "编号集合": ",".join(ids),
        "编号数量": len(ids),
        "技能行数": len(skill_rows),
        "种族值行数": len(race_rows),
        "来源": item.source,
        "状态": "成功" if (ids or skill_rows or race_rows) else "疑似非目标页面",
        "错误": "",
        "解析表格数": len(tables),
    }
    return summary, skill_rows, race_rows


def parse_detail_elements_only(session: requests.Session, item: YabiItem) -> dict:
    resp = session.get(item.detail_url)
    resp.raise_for_status()
    html_text = decode_response(resp)
    soup = BeautifulSoup(html_text, "lxml")

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
        "elements": ",".join(elements),
        "element_count": len(elements),
        "id_set": ",".join(ids),
        "id_count": len(ids),
        "source": item.source,
        "status": "ok" if (ids or elements) else "empty",
        "error": "",
    }


def _ordered_columns(records: Sequence[Dict[str, object]], preferred: Optional[Sequence[str]] = None) -> List[str]:
    cols: List[str] = []
    seen = set()
    for c in (preferred or []):
        if c and c not in seen:
            seen.add(c)
            cols.append(c)
    for r in records:
        for k in r.keys():
            if k not in seen:
                seen.add(k)
                cols.append(k)
    return cols


def _safe_cell(v):
    if v is None:
        return ""
    if isinstance(v, (list, tuple, set)):
        return ",".join(str(x) for x in v)
    if isinstance(v, dict):
        return str(v)
    return v


def write_excel_streaming(
    output_path: str,
    summaries: Sequence[Dict[str, object]],
    all_skills: Sequence[Dict[str, object]],
    all_races: Sequence[Dict[str, object]],
) -> None:
    wb = Workbook(write_only=True)

    summary_cols = _ordered_columns(
        summaries,
        preferred=[
            "亚比名",
            "页面标题",
            "详情链接",
            "系别集合",
            "编号集合",
            "编号数量",
            "技能行数",
            "种族值行数",
            "来源",
            "状态",
            "错误",
            "解析表格数",
        ],
    )
    ws_summary = wb.create_sheet(title="亚比总表")
    ws_summary.append(summary_cols)
    for r in summaries:
        ws_summary.append([_safe_cell(r.get(c, "")) for c in summary_cols])

    skill_cols = _ordered_columns(
        all_skills,
        preferred=["亚比名", "页面标题", "详情链接", "编号集合", "表格序号", "表格标题"],
    )
    ws_skill = wb.create_sheet(title="技能表")
    ws_skill.append(skill_cols)
    for r in all_skills:
        ws_skill.append([_safe_cell(r.get(c, "")) for c in skill_cols])

    race_cols = _ordered_columns(
        all_races,
        preferred=["亚比名", "页面标题", "详情链接", "编号集合", "表格序号", "表格标题"],
    )
    ws_race = wb.create_sheet(title="种族值表")
    ws_race.append(race_cols)
    for r in all_races:
        ws_race.append([_safe_cell(r.get(c, "")) for c in race_cols])

    wb.save(output_path)


def write_elements_excel_streaming(
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


def crawl_all(
    output_path: str,
    delay_min: float,
    delay_max: float,
    max_items: Optional[int],
    timeout: int,
    strict_legacy: bool,
    type_dir: str,
    elements_text: str,
    start_ym: int,
    end_ym: int,
    scan_by_template: bool,
    id_min: int,
    id_max: int,
    id_step: int,
    probe_timeout: float,
    max_attempts_per_id: int,
    progress_every_ids: int,
    source_mode: str,
    parse_elements_only: bool,
) -> None:
    referer = BT_BASE_URL if source_mode == "100bt-tujian" else BASE_URL
    session = mk_session(timeout=timeout, referer=referer)
    allowed_elements = load_allowed_elements(type_dir)
    req_elements = parse_requested_elements(elements_text)
    req_or_all = req_elements if req_elements else list(ELEMENT_PATH_HINTS.keys())

    if source_mode == "100bt-tujian":
        items = build_bt_tujian_items(id_min=id_min, id_max=id_max, id_step=id_step)
        if max_items is not None:
            items = items[:max_items]
        print(f"100bt candidate pages: {len(items)} (id={id_min}-{id_max}, step={id_step})")
    elif scan_by_template:
        items = build_template_scan_items_stateful(
            session=session,
            elements=req_or_all,
            start_ym=start_ym,
            end_ym=end_ym,
            id_min=id_min,
            id_max=id_max,
            id_step=id_step,
            probe_timeout=probe_timeout,
            max_attempts_per_id=max_attempts_per_id,
            progress_every_ids=progress_every_ids,
        )
        print(
            f"template candidates: {len(items)} "
            f"(elements={len(req_or_all)}, ym={start_ym}-{end_ym}, id={id_min}-{id_max}, step={id_step})"
        )
    else:
        items = fetch_original_yabi_list(session)
        if strict_legacy:
            items = [x for x in items if re.search(r"/\d{6}-\d{2}-\d+\.html$", urlparse(x.detail_url).path or "")]
        if max_items is not None:
            items = items[:max_items]
        print(f"candidate detail pages: {len(items)}")
        before_year = len(items)
        items = [it for it in items if in_ym_range(it.detail_url, start_ym, end_ym)]
        print(f"after ym filter: {before_year} -> {len(items)} ({start_ym}-{end_ym})")

    if allowed_elements:
        print(f"loaded allowed elements: {len(allowed_elements)} -> {', '.join(allowed_elements)}")
    else:
        print("no allowed elements loaded from type-dir")

    if req_elements and not scan_by_template:
        before = len(items)
        items = [it for it in items if item_matches_requested_elements(it, req_elements)]
        rank = {e: i for i, e in enumerate(req_elements)}

        def sort_rank(it: YabiItem) -> int:
            r = [rank.get(normalize_element_name(x), 10**6) for x in (it.element_hints or [])]
            if r:
                return min(r)
            path = (urlparse(it.detail_url).path or "").lower()
            for e, i in rank.items():
                if any(f"/{t}/" in path for t in ELEMENT_PATH_HINTS.get(e, [])):
                    return i
            return 10**6

        items.sort(key=sort_rank)
        print(f"after --elements filter: {before} -> {len(items)} ({', '.join(req_elements)})")

    if parse_elements_only:
        element_rows: List[dict] = []
        for idx, item in enumerate(items, start=1):
            try:
                rec = parse_detail_elements_only(session, item)
                element_rows.append(rec)
                print(
                    f"[{idx}/{len(items)}] element: {rec.get('page_title', '')[:36]} "
                    f"(id={rec.get('id_count', 0)} / elements={rec.get('element_count', 0)})"
                )
            except Exception as e:
                element_rows.append(
                    {
                        "item_name": item.name,
                        "page_title": "",
                        "detail_url": item.detail_url,
                        "elements": "",
                        "element_count": 0,
                        "id_set": "",
                        "id_count": 0,
                        "source": item.source,
                        "status": "error",
                        "error": str(e),
                    }
                )
                print(f"[{idx}/{len(items)}] failed: {item.name} -> {e}")

            if idx < len(items):
                time.sleep(random.uniform(delay_min, delay_max))

        if req_elements:
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

        write_elements_excel_streaming(output_path=output_path, rows=element_rows)
        print("\nDone (element-only mode)")
        print(f"- candidate pages: {len(items)}")
        print(f"- element rows: {len(element_rows)}")
        print(f"- output file: {output_path}")
        return

    summaries: List[dict] = []
    all_skills: List[dict] = []
    all_races: List[dict] = []

    for idx, item in enumerate(items, start=1):
        try:
            summary, skills, races = parse_detail(session, item)
            summaries.append(summary)
            all_skills.extend(skills)
            all_races.extend(races)
            if summary["编号数量"] == 0 and summary["技能行数"] == 0 and summary["种族值行数"] == 0:
                print(
                    f"[{idx}/{len(items)}] no-hit: {summary['页面标题'][:36]} "
                    f"(tables={summary.get('解析表格数', 0)} / id=0 / skill=0 / race=0)"
                )
            else:
                print(
                    f"[{idx}/{len(items)}] ok: {summary['页面标题'][:36]} "
                    f"(id={summary['编号数量']} / skill={summary['技能行数']} / race={summary['种族值行数']})"
                )
        except Exception as e:
            summaries.append(
                {
                    "亚比名": item.name,
                    "页面标题": "",
                    "详情链接": item.detail_url,
                    "系别集合": "",
                    "编号集合": "",
                    "编号数量": 0,
                    "技能行数": 0,
                    "种族值行数": 0,
                    "来源": item.source,
                    "状态": "失败",
                    "错误": str(e),
                    "解析表格数": 0,
                }
            )
            print(f"[{idx}/{len(items)}] failed: {item.name} -> {e}")

        if idx < len(items):
            time.sleep(random.uniform(delay_min, delay_max))

    valid_urls = {
        s["详情链接"]
        for s in summaries
        if (s.get("编号数量", 0) or s.get("技能行数", 0) or s.get("种族值行数", 0))
    }
    has_any_extracted_elements = any(bool(str(s.get("系别集合", "")).strip()) for s in summaries)

    if req_elements:
        req_set = set(req_elements)
        valid_urls = {
            s["详情链接"]
            for s in summaries
            if s["详情链接"] in valid_urls
            and any(normalize_element_name(x) in req_set for x in str(s.get("系别集合", "")).split(",") if x)
        }
    elif source_mode == "100bt-tujian":
        pass
    elif allowed_elements and has_any_extracted_elements:
        allowed_set = set(allowed_elements)
        valid_urls = {
            s["详情链接"]
            for s in summaries
            if s["详情链接"] in valid_urls
            and any(normalize_element_name(x) in allowed_set for x in str(s.get("系别集合", "")).split(",") if x)
        }

    summaries = [s for s in summaries if s.get("详情链接") in valid_urls]
    all_skills = [r for r in all_skills if r.get("详情链接") in valid_urls]
    all_races = [r for r in all_races if r.get("详情链接") in valid_urls]

    write_excel_streaming(
        output_path=output_path,
        summaries=summaries,
        all_skills=all_skills,
        all_races=all_races,
    )

    print("\nDone")
    print(f"- candidate pages: {len(items)}")
    print(f"- valid pages: {len(summaries)}")
    print(f"- skill rows: {len(all_skills)}")
    print(f"- race rows: {len(all_races)}")
    print(f"- output file: {output_path}")


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        description="抓取奥拉星亚比编号、技能表和种族值表，并导出Excel"
    )
    p.add_argument(
        "-o",
        "--output",
        default=DEFAULT_OUTPUT,
        help=f"输出Excel路径（默认：{DEFAULT_OUTPUT}）",
    )
    p.add_argument("--delay-min", type=float, default=0.25, help="两次请求最小间隔秒数")
    p.add_argument("--delay-max", type=float, default=0.65, help="两次请求最大间隔秒数")
    p.add_argument("--max-items", type=int, default=None, help="仅抓取前N个（调试）")
    p.add_argument("--timeout", type=int, default=20, help="HTTP超时秒数")
    p.add_argument(
        "--strict-legacy",
        action="store_true",
        help="仅保留旧版详情页URL（/yyyymm-dd-id.html）",
    )
    p.add_argument("--type-dir", default="./type", help="系别白名单目录")
    p.add_argument("--elements", default="", help='只抓指定系别，逗号分隔，例如 --elements "木系,火系"')
    p.add_argument("--start-ym", type=int, default=201008, help="起始年月 YYYYMM")
    p.add_argument("--end-ym", type=int, default=201412, help="结束年月 YYYYMM")
    p.add_argument(
        "--parse-elements-only",
        action="store_true",
        help=f"仅解析系别并导出（默认输出：{DEFAULT_ELEMENT_OUTPUT}）",
    )
    p.add_argument(
        "--source-mode",
        choices=["4399-index", "4399-template", "100bt-tujian"],
        default="4399-index",
        help="数据来源模式",
    )
    p.add_argument(
        "--scan-by-template",
        action="store_true",
        help="按URL模板扫描候选（/aolaxing/yabi/<目录>/<年月-日-编号>.html）",
    )
    p.add_argument("--id-min", type=int, default=75836, help="模板扫描起始编号")
    p.add_argument("--id-max", type=int, default=462005, help="模板扫描结束编号")
    p.add_argument("--id-step", type=int, default=20, help="模板扫描编号步长")
    p.add_argument("--probe-timeout", type=float, default=1.2, help="模板探测单请求超时")
    p.add_argument("--max-attempts-per-id", type=int, default=500, help="每个ID最大探测URL数")
    p.add_argument("--progress-every-ids", type=int, default=10, help="每N个ID打印一次进度")
    return p


def main():
    args = build_parser().parse_args()
    if args.parse_elements_only and args.output == DEFAULT_OUTPUT:
        args.output = DEFAULT_ELEMENT_OUTPUT

    if not hasattr(args, "source_mode"):
        args.source_mode = "4399-template" if args.scan_by_template else "4399-index"

    if args.delay_min < 0 or args.delay_max < 0:
        raise ValueError("delay不能为负数")
    if args.delay_max < args.delay_min:
        raise ValueError("delay-max不能小于delay-min")
    if args.start_ym > args.end_ym:
        raise ValueError("start-ym不能大于end-ym")
    if args.id_step <= 0:
        raise ValueError("id-step必须 > 0")
    if args.max_attempts_per_id <= 0:
        raise ValueError("max-attempts-per-id必须 > 0")

    crawl_all(
        output_path=args.output,
        delay_min=args.delay_min,
        delay_max=args.delay_max,
        max_items=args.max_items,
        timeout=args.timeout,
        strict_legacy=args.strict_legacy,
        type_dir=args.type_dir,
        elements_text=args.elements,
        start_ym=args.start_ym,
        end_ym=args.end_ym,
        scan_by_template=args.scan_by_template,
        id_min=args.id_min,
        id_max=args.id_max,
        id_step=args.id_step,
        probe_timeout=args.probe_timeout,
        max_attempts_per_id=args.max_attempts_per_id,
        progress_every_ids=args.progress_every_ids,
        source_mode=args.source_mode,
        parse_elements_only=args.parse_elements_only,
    )


if __name__ == "__main__":
    main()
'''

p.write_text(text[:start] + new_tail, encoding='utf-8')
print('tail_rewritten')
