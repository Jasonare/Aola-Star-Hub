#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""批量下载亚比状态动画 SWF 文件。

默认下载：
http://aola.100bt.com/play/petfightstatusmovie/statemovie{X}.swf
其中 X 为 1-100，保存到 pet-state/swf 目录。
"""

from __future__ import annotations

import argparse
import time
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


DEFAULT_URL_TEMPLATE = (
    "http://aola.100bt.com/play/petfightstatusmovie/statemovie{index}.swf"
)
DEFAULT_OUTPUT_DIR = Path("pet-state") / "swf"
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36"
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="批量下载 petfightstatusmovie/statemovie{X}.swf 文件。"
    )
    parser.add_argument("--start", type=int, default=1, help="起始 X，默认 1。")
    parser.add_argument("--end", type=int, default=100, help="结束 X，默认 100。")
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=DEFAULT_OUTPUT_DIR,
        help="SWF 保存目录，默认 pet-state/swf。",
    )
    parser.add_argument(
        "--url-template",
        default=DEFAULT_URL_TEMPLATE,
        help="下载地址模板，使用 {index} 作为编号占位符。",
    )
    parser.add_argument("--timeout", type=int, default=20, help="单个文件超时秒数。")
    parser.add_argument("--retries", type=int, default=2, help="失败重试次数。")
    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="已存在文件时重新下载；默认跳过。",
    )
    return parser.parse_args()


def download_file(url: str, output_path: Path, timeout: int, retries: int) -> None:
    last_error: Exception | None = None
    for attempt in range(retries + 1):
        try:
            request = Request(url, headers={"User-Agent": USER_AGENT})
            with urlopen(request, timeout=timeout) as response:
                data = response.read()
            if not data:
                raise RuntimeError("响应内容为空")
            output_path.write_bytes(data)
            return
        except (HTTPError, URLError, TimeoutError, RuntimeError) as exc:
            last_error = exc
            if attempt < retries:
                time.sleep(0.8 * (attempt + 1))
    raise RuntimeError(str(last_error))


def main() -> int:
    args = parse_args()
    if args.start > args.end:
        raise SystemExit("--start 不能大于 --end")

    output_dir = args.output_dir.resolve()
    output_dir.mkdir(parents=True, exist_ok=True)

    success_count = 0
    skipped_count = 0
    failed: list[tuple[int, str]] = []

    print(f"保存目录: {output_dir}")
    for index in range(args.start, args.end + 1):
        url = args.url_template.format(index=index)
        output_path = output_dir / f"statemovie{index}.swf"

        if output_path.exists() and not args.overwrite:
            skipped_count += 1
            print(f"[跳过] {output_path.name} 已存在")
            continue

        try:
            download_file(url, output_path, args.timeout, args.retries)
            success_count += 1
            print(f"[成功] {output_path.name}")
        except RuntimeError as exc:
            failed.append((index, str(exc)))
            print(f"[失败] statemovie{index}.swf: {exc}")

    print(
        f"完成：成功 {success_count} 个，跳过 {skipped_count} 个，失败 {len(failed)} 个。"
    )
    if failed:
        print("失败列表：")
        for index, reason in failed:
            print(f"  - statemovie{index}.swf: {reason}")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
