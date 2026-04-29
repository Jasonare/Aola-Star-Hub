#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
批量下载奥拉星 SWF 资源：
URL 模板: http://aola.100bt.com/play/fightassets/bitmap/pet{id}_{x}.swf
保存路径: ./swf/{id}/pet{id}_{x}.swf

默认范围：
- id: 1..796
- x : 0..1210

支持断点续跑：已存在且文件大小>0的文件会自动跳过。
"""

from __future__ import annotations

import argparse
import concurrent.futures
import os
import threading
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, List, Optional, Tuple

import urllib.error
import urllib.request


URL_TEMPLATE = "http://aola.100bt.com/play/fightassets/bitmap/pet{id}_{x}.swf"


@dataclass(frozen=True)
class Task:
    pet_id: int
    x: int

    @property
    def url(self) -> str:
        return URL_TEMPLATE.format(id=self.pet_id, x=self.x)

    @property
    def filename(self) -> str:
        return f"pet{self.pet_id}_{self.x}.swf"


class Counter:
    def __init__(self) -> None:
        self.lock = threading.Lock()
        self.total = 0
        self.ok = 0
        self.skip = 0
        self.not_found = 0
        self.fail = 0
        self.last_log = 0.0

    def add(self, field: str, n: int = 1) -> None:
        with self.lock:
            setattr(self, field, getattr(self, field) + n)
            self.total += n

    def maybe_log(self, force: bool = False) -> None:
        now = time.time()
        with self.lock:
            if not force and now - self.last_log < 3.0:
                return
            self.last_log = now
            print(
                f"[进度] total={self.total} ok={self.ok} skip={self.skip} "
                f"404={self.not_found} fail={self.fail}"
            )


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="下载 pet{id}_{x}.swf 到 ./swf/{id}/")
    p.add_argument("--id-min", type=int, default=1, help="起始 id（含）")
    p.add_argument("--id-max", type=int, default=796, help="结束 id（含）")
    p.add_argument("--x-min", type=int, default=0, help="起始 x（含）")
    p.add_argument("--x-max", type=int, default=1210, help="结束 x（含）")
    p.add_argument("--workers", type=int, default=16, help="并发线程数")
    p.add_argument("--timeout", type=float, default=10.0, help="单请求超时秒")
    p.add_argument("--retries", type=int, default=2, help="失败重试次数")
    p.add_argument(
        "--out-dir",
        type=str,
        default="swf",
        help="输出根目录（会创建 ./swf/{id}/）",
    )
    p.add_argument(
        "--dry-run",
        action="store_true",
        help="仅打印任务数量，不执行下载",
    )
    return p.parse_args()


def build_tasks(id_min: int, id_max: int, x_min: int, x_max: int) -> List[Task]:
    tasks: List[Task] = []
    for pet_id in range(id_min, id_max + 1):
        for x in range(x_min, x_max + 1):
            tasks.append(Task(pet_id=pet_id, x=x))
    return tasks


def ensure_parent(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)


def is_valid_existing(path: Path) -> bool:
    return path.exists() and path.is_file() and path.stat().st_size > 0


def try_download(task: Task, out_root: Path, timeout: float, retries: int) -> Tuple[str, Optional[str]]:
    out_file = out_root / str(task.pet_id) / task.filename
    ensure_parent(out_file)

    if is_valid_existing(out_file):
        return "skip", None

    last_err: Optional[str] = None
    for _ in range(retries + 1):
        try:
            req = urllib.request.Request(
                task.url,
                headers={
                    "User-Agent": (
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                        "AppleWebKit/537.36 (KHTML, like Gecko) "
                        "Chrome/124.0.0.0 Safari/537.36"
                    ),
                    "Accept": "*/*",
                    "Connection": "keep-alive",
                },
                method="GET",
            )
            # 一些无效响应可能是空文件，过滤掉
            size = 0
            tmp_file = out_file.with_suffix(".swf.part")
            with urllib.request.urlopen(req, timeout=timeout) as resp, open(tmp_file, "wb") as f:
                status = int(getattr(resp, "status", 200) or 200)
                if status == 404:
                    return "not_found", None
                if status != 200:
                    last_err = f"HTTP {status}"
                    continue
                while True:
                    chunk = resp.read(64 * 1024)
                    if not chunk:
                        break
                    f.write(chunk)
                    size += len(chunk)
            if size <= 0:
                try:
                    tmp_file.unlink(missing_ok=True)
                except Exception:
                    pass
                return "not_found", "empty body"
            os.replace(tmp_file, out_file)
            return "ok", None
        except urllib.error.HTTPError as e:
            if int(e.code) == 404:
                return "not_found", None
            last_err = f"HTTP {e.code}"
            time.sleep(0.15)
        except urllib.error.URLError as e:
            last_err = f"URLError: {e.reason}"
            time.sleep(0.15)
        except Exception as e:  # noqa: BLE001
            last_err = str(e)
            time.sleep(0.15)
    return "fail", last_err


def worker(
    task: Task,
    out_root: Path,
    timeout: float,
    retries: int,
    counter: Counter,
) -> None:
    status, err = try_download(task, out_root, timeout, retries)
    if status == "ok":
        counter.add("ok")
    elif status == "skip":
        counter.add("skip")
    elif status == "not_found":
        counter.add("not_found")
    else:
        counter.add("fail")
        if err:
            # 仅在失败时少量打印，避免刷屏
            if counter.fail <= 20:
                print(f"[失败] id={task.pet_id} x={task.x} err={err}")
    counter.maybe_log()


def main() -> None:
    args = parse_args()

    if args.id_min > args.id_max:
        raise SystemExit("--id-min 不能大于 --id-max")
    if args.x_min > args.x_max:
        raise SystemExit("--x-min 不能大于 --x-max")
    if args.workers < 1:
        raise SystemExit("--workers 必须 >= 1")

    out_root = Path(args.out_dir).resolve()
    out_root.mkdir(parents=True, exist_ok=True)

    tasks = build_tasks(args.id_min, args.id_max, args.x_min, args.x_max)
    print(
        f"[开始] tasks={len(tasks)} id={args.id_min}-{args.id_max} "
        f"x={args.x_min}-{args.x_max} workers={args.workers}"
    )
    print(f"[目录] {out_root}")

    if args.dry_run:
        print("[dry-run] 不执行下载。")
        return

    counter = Counter()
    start = time.time()
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as ex:
        futures = [
            ex.submit(worker, t, out_root, args.timeout, args.retries, counter)
            for t in tasks
        ]
        for fut in concurrent.futures.as_completed(futures):
            _ = fut.result()

    elapsed = time.time() - start
    counter.maybe_log(force=True)
    print(
        f"[完成] elapsed={elapsed:.1f}s ok={counter.ok} skip={counter.skip} "
        f"404={counter.not_found} fail={counter.fail}"
    )


if __name__ == "__main__":
    main()
