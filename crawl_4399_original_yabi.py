#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
鎶撳彇 4399 濂ユ媺鏄熲€滃師绯讳簹姣斺€濊鎯咃紝鎻愬彇锛?
1) 浜氭瘮缂栧彿锛堣鎯呴〉涓殑鈥滃簭鍙凤細xxx鈥濓級
2) 鎶€鑳借〃鏍?
3) 绉嶆棌鍊艰〃鏍?

杈撳嚭 Excel锛堥粯璁わ細鍘熺郴浜氭瘮_缂栧彿_鎶€鑳絖绉嶆棌鍊?xlsx锛夛紝鍖呭惈 3 涓伐浣滆〃锛?
- 浜氭瘮鎬昏〃
- 鎶€鑳借〃
- 绉嶆棌鍊艰〃

渚濊禆锛?
  pip install requests beautifulsoup4 openpyxl lxml
"""

from __future__ import annotations

import argparse
import calendar
import html
import os
import random
import re
import time
from datetime import date, timedelta
from dataclasses import dataclass
from typing import Dict, List, Optional, Sequence, Tuple
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup, Tag
from openpyxl import Workbook


BASE_URL = "https://news.4399.com/aolaxing/yabi/"
BT_BASE_URL = "http://aola.100bt.com/"
DEFAULT_OUTPUT = "鍘熺郴浜氭瘮_缂栧彿_鎶€鑳絖绉嶆棌鍊?xlsx"
DEFAULT_ELEMENT_OUTPUT = "original_yabi_elements.xlsx"
ELEMENT_PATH_HINTS = {
    "木系": ["muxi"],
    "火系": ["huoxi"],
    "水系": ["shuixi"],
    "冰系": ["bingxi"],
    "土系": ["tuxi"],
    "电系": ["dianxi"],
    "光明系": ["guangmingxi"],
    "暗黑系": ["anheixi", "anxi"],
    "神秘系": ["shenmixi"],
    "机械系": ["jixiexi"],
    "飞行系": ["feixingxi", "feixing"],
    "龙系": ["longxi"],
    "上古系": ["shangguxi", "shanggu"],
    "数码系": ["shumaxi"],
    "格斗系": ["gedouxi"],
    "王系": ["wangxi"],
    "神兵系": ["shenbingxi", "shenbing"],
    "圣灵系": ["shenglingxi", "shengling"],
    "爬行系": ["paxingxi", "paxing"],
    "普通系": ["putongxi", "putong"],
    "毒系": ["duxi"],
}

UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/124.0.0.0 Safari/537.36"
)


@dataclass
class YabiItem:
    name: str
    detail_url: str
    source: str
    element_hints: Optional[List[str]] = None


def parse_ymd_from_url(url: str) -> Optional[date]:
    path = (urlparse(url).path or "").lower()
    m = re.search(r"/(\d{6})-(\d{2})-(\d+)\.html$", path)
    if not m:
        return None
    yyyymm = m.group(1)
    yyyy = int(yyyymm[:4])
    mm = int(yyyymm[4:6])
    dd = int(m.group(2))
    try:
        return date(yyyy, mm, dd)
    except Exception:
        return None


def mk_session(timeout: int, referer: str = BASE_URL) -> requests.Session:
    s = requests.Session()
    s.headers.update(
        {
            "User-Agent": UA,
            "Referer": referer,
            "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        }
    )
    s.request = _with_timeout(s.request, timeout)  # type: ignore[assignment]
    return s


def _with_timeout(request_func, timeout: int):
    def wrapped(method, url, **kwargs):
        if "timeout" not in kwargs:
            kwargs["timeout"] = timeout
        return request_func(method, url, **kwargs)

    return wrapped


def decode_response(resp: requests.Response) -> str:
    # 4399 椤甸潰缂栫爜涓嶇ǔ瀹氾紝浼樺厛浠?meta charset 璇嗗埆锛屽啀鍥為€€
    raw = resp.content or b""
    head = raw[:4096].decode("ascii", errors="ignore").lower()
    m = re.search(r'charset\s*=\s*["\']?\s*([a-z0-9\-_]+)', head)
    meta_enc = (m.group(1).strip() if m else "")
    if meta_enc in ("gb2312", "gbk", "gb18030", "utf-8"):
        try:
            return raw.decode(meta_enc, errors="ignore")
        except Exception:
            pass
    # requests 鐚滄祴
    if resp.encoding:
        try:
            return raw.decode(resp.encoding, errors="ignore")
        except Exception:
            pass
    # 甯歌涓枃绔欏厹搴曢『搴?
    for enc in ("gb18030", "gbk", "gb2312", "utf-8"):
        try:
            return raw.decode(enc, errors="ignore")
        except Exception:
            continue
    return raw.decode("utf-8", errors="ignore")


def is_original_link(url: str) -> bool:
    """
    鍘熺郴璇︽儏椤佃繃婊わ細
    1) 蹇呴』鏄?news.4399.com /aolaxing/yabi/ 涓嬮〉闈?
    2) 璺緞缁撴瀯蹇呴』鍍忚鎯呴〉锛堜互 .html 缁撳熬锛?
    3) 杩囨护鏄庢樉闈炶鎯呴〉鍏ュ彛
    """
    p = urlparse(url)
    host = (p.netloc or "").lower()
    path = (p.path or "").lower()
    if "news.4399.com" not in host:
        return False
    if "/aolaxing/yabi/" not in path:
        return False
    if not path.endswith(".html"):
        return False
    # 鍘熺郴缁忓吀璇︽儏椤碉細/aolaxing/yabi/<type>/<yyyymm-dd-id>.html
    if not re.search(r"^/aolaxing/yabi/[^/]+/\d{6}-\d{2}-\d+\.html$", path):
        return False
    # 闈炶鎯呭叆鍙ｏ紙鍒楄〃椤?鎼滅储椤碉級鎺掗櫎
    bad_suffix = ("/index.html", "/default.html")
    if path.endswith(bad_suffix):
        return False
    return True


def extract_date_from_url(url: str) -> Optional[str]:
    path = (urlparse(url).path or "").lower()
    m = re.search(r"/(\d{6})-(\d{2})-(\d+)\.html$", path)
    if not m:
        return None
    yyyymm = m.group(1)
    dd = m.group(2)
    yyyy = yyyymm[:4]
    mm = yyyymm[4:6]
    return f"{yyyy}-{mm}-{dd}"


def extract_year_from_url(url: str) -> Optional[int]:
    d = extract_date_from_url(url)
    if not d:
        return None
    try:
        return int(d[:4])
    except Exception:
        return None


def extract_ym_from_url(url: str) -> Optional[int]:
    path = (urlparse(url).path or "").lower()
    m = re.search(r"/(\d{6})-\d{2}-\d+\.html$", path)
    if not m:
        return None
    try:
        return int(m.group(1))
    except Exception:
        return None


def in_ym_range(url: str, start_ym: int, end_ym: int) -> bool:
    ym = extract_ym_from_url(url)
    if ym is None:
        return False
    return start_ym <= ym <= end_ym


def ym_int_to_year_month(ym: int) -> Tuple[int, int]:
    y = ym // 100
    m = ym % 100
    if y < 1900 or m < 1 or m > 12:
        raise ValueError(f"闈炴硶骞存湀: {ym}")
    return y, m


def next_year_month(y: int, m: int) -> Tuple[int, int]:
    if m == 12:
        return y + 1, 1
    return y, m + 1


def probe_article_url(session: requests.Session, url: str) -> bool:
    try:
        r = session.get(url, allow_redirects=True)
        if r.status_code != 200:
            return False
        final_url = r.url or url
        if not is_original_link(final_url):
            return False
        text = decode_response(r)
        # 璇︽儏椤靛熀鏈兘鏈?h1 + main-con
        return ("<h1" in text.lower()) and ("main-con" in text.lower())
    except Exception:
        return False


def build_template_scan_items_stateful(
    session: requests.Session,
    elements: Sequence[str],
    start_ym: int,
    end_ym: int,
    id_min: int,
    id_max: int,
    id_step: int,
    probe_timeout: float,
    max_attempts_per_id: int,
    progress_every_ids: int,
) -> List[YabiItem]:
    """
    鎸夌敤鎴疯姹傛壂鎻忥細
    - id 澶栧眰
    - 骞存湀鍐呭眰
    - 鏃ユ湡鏈€鍐呭眰
    鍛戒腑鍚?id+1锛屽勾鏈?鏃ユ湡浠庝笂娆″懡涓殑浣嶇疆缁х画锛堝崟璋冧笉鍥為€€锛夈€?
    """
    sy, sm = ym_int_to_year_month(start_ym)
    ey, em = ym_int_to_year_month(end_ym)
    if (sy, sm) > (ey, em):
        sy, sm, ey, em = ey, em, sy, sm
    if id_min > id_max:
        id_min, id_max = id_max, id_min
    if id_step <= 0:
        id_step = 1

    token_pairs: List[Tuple[str, str]] = []
    for e in elements:
        en = normalize_element_name(e)
        for tk in ELEMENT_PATH_HINTS.get(en, []):
            token_pairs.append((en, tk))
    if not token_pairs:
        return []

    cursor_y, cursor_m, cursor_d = sy, sm, 1
    items: List[YabiItem] = []

    total_ids = ((id_max - id_min) // id_step) + 1
    checked_ids = 0
    for cur_id in range(id_min, id_max + 1, id_step):
        checked_ids += 1
        if progress_every_ids > 0 and (checked_ids == 1 or checked_ids % progress_every_ids == 0):
            print(
                f"[妯℃澘鎺㈡祴] id杩涘害 {checked_ids}/{total_ids} "
                f"褰撳墠ID={cur_id} 娓告爣={cursor_y:04d}{cursor_m:02d}-{cursor_d:02d} 宸插懡涓?{len(items)}"
            )
        found = None
        attempts = 0
        y, m = cursor_y, cursor_m
        while (y, m) <= (ey, em) and not found:
            d_start = cursor_d if (y == cursor_y and m == cursor_m) else 1
            d_end = calendar.monthrange(y, m)[1]
            for d in range(d_start, d_end + 1):
                ymd = f"{y:04d}{m:02d}"
                dd = f"{d:02d}"
                for en, token in token_pairs:
                    u = f"https://news.4399.com/aolaxing/yabi/{token}/{ymd}-{dd}-{cur_id}.html"
                    attempts += 1
                    if attempts > max_attempts_per_id:
                        break
                    # 妯℃澘鎺㈡祴鐢ㄧ煭瓒呮椂锛岄伩鍏嶉暱鏃堕棿鏃犲弽棣?
                    old_req = session.request
                    session.request = _with_timeout(old_req, max(0.2, probe_timeout))  # type: ignore[assignment]
                    ok = probe_article_url(session, u)
                    session.request = old_req  # type: ignore[assignment]
                    if ok:
                        found = (u, en, y, m, d)
                        break
                if attempts > max_attempts_per_id:
                    break
                if found:
                    break
            if attempts > max_attempts_per_id:
                break
            if not found:
                y, m = next_year_month(y, m)
                d_start = 1
        if not found:
            # 杩欎釜 id 鍦ㄥ墿浣欐棩鏈熷尯闂存病鏈夊懡涓紝缁х画涓嬩竴涓?id
            continue

        u, en, fy, fm, fd = found
        items.append(YabiItem(name=f"{en}-{cur_id}", detail_url=u, source="template", element_hints=[en]))
        # 鍏抽敭锛歝ursor 浠庝笂娆″懡涓綅缃户缁紝涓嶅洖閫€
        cursor_y, cursor_m, cursor_d = fy, fm, fd
        if (cursor_y, cursor_m) > (ey, em):
            break

    return dedup_items(items)


def parse_requested_elements(text: str) -> List[str]:
    if not text:
        return []
    parts = [normalize_element_name(x) for x in re.split(r"[锛?\s]+", text) if x.strip()]
    out: List[str] = []
    seen = set()
    for p in parts:
        if p and p not in seen:
            seen.add(p)
            out.append(p)
    return out


def item_matches_requested_elements(item: YabiItem, req_elements: Sequence[str]) -> bool:
    if not req_elements:
        return True
    req_set = {normalize_element_name(x) for x in req_elements if normalize_element_name(x)}
    if not req_set:
        return True

    # 鐩存帴鎸夎鎯?URL 鐩綍鍚嶅尮閰嶏紙濡?/yabi/muxi/锛夛紝閬垮厤棣栭〉娣峰悎鏁版嵁姹℃煋
    path = (urlparse(item.detail_url).path or "").lower()
    for e in req_set:
        for token in ELEMENT_PATH_HINTS.get(e, []):
            if f"/{token}/" in path:
                return True
    # 鍏滃簳锛氬垪琛ㄩ〉鎻愮ず绯诲埆鍖归厤
    hints = [normalize_element_name(x) for x in (item.element_hints or [])]
    if any(h in req_set for h in hints if h):
        return True
    return False


def fetch_original_yabi_list(session: requests.Session) -> List[YabiItem]:
    """
    浠庝簹姣斿ぇ鍏ㄩ〉璇诲彇鏉＄洰锛屽厛瀹芥敹闆嗚鎯呴〉閾炬帴銆?
    鍚庣画鍦?parse_detail 涓寜鈥滄槸鍚﹀懡涓紪鍙?鎶€鑳?绉嶆棌鍊尖€濆仛鍐呭绾у垽瀹氥€?
    """
    items: List[YabiItem] = []
    r = session.get(BASE_URL)
    r.raise_for_status()
    soup = BeautifulSoup(decode_response(r), "lxml")

    # data-xl -> 绯诲埆鍚嶏紙鏉ヨ嚜鍒楄〃椤碘€滅郴鍒瓫閫夆€濓級
    xl_to_element: Dict[str, str] = {}
    for a in soup.select("#g_tab li a[rel]"):
        rel_raw = a.get("rel")
        if isinstance(rel_raw, (list, tuple)):
            rel_raw = ",".join(str(x) for x in rel_raw)
        rel = normalize_text(rel_raw or "")
        name = normalize_element_name("".join(a.stripped_strings))
        if rel and name and rel.isdigit():
            xl_to_element[rel] = name

    for a in soup.select("#tabs_all li a.m-pic, .tbContainer li a.ybitem"):
        href = (a.get("href") or "").strip()
        if not href:
            continue
        detail = urljoin(BASE_URL, href)
        if not is_original_link(detail):
            continue
        txt = " ".join(a.stripped_strings).strip()
        li = a.find_parent("li")
        hints: List[str] = []
        if li:
            xl_raw = normalize_text(li.get("data-xl") or "")
            ttt_raw = normalize_text(li.get("data-ttt") or "")
            rel_keys = [x for x in re.split(r"[锛?\s]+", ",".join([xl_raw, ttt_raw])) if x]
            for k in rel_keys:
                e = xl_to_element.get(k)
                if e and e not in hints:
                    hints.append(e)
        if txt:
            items.append(YabiItem(name=txt, detail_url=detail, source="index", element_hints=hints))
    return dedup_items(items)


def dedup_items(items: Sequence[YabiItem]) -> List[YabiItem]:
    seen = set()
    out = []
    for it in items:
        key = it.detail_url.rstrip("/")
        if key in seen:
            continue
        seen.add(key)
        out.append(it)
    return out


def is_bt_tujian_link(url: str) -> bool:
    p = urlparse(url)
    host = (p.netloc or "").lower()
    path = (p.path or "").lower()
    if "aola.100bt.com" not in host:
        return False
    return bool(re.search(r"^/tujian/\d+\.html$", path))


def extract_bt_id_from_url(url: str) -> Optional[str]:
    m = re.search(r"/tujian/(\d+)\.html$", (urlparse(url).path or "").lower())
    if not m:
        return None
    return m.group(1)


def build_bt_tujian_items(id_min: int, id_max: int, id_step: int) -> List[YabiItem]:
    if id_min > id_max:
        id_min, id_max = id_max, id_min
    if id_step <= 0:
        id_step = 1
    items: List[YabiItem] = []
    for i in range(id_min, id_max + 1, id_step):
        u = f"{BT_BASE_URL}tujian/{i}.html"
        items.append(YabiItem(name=f"tujian-{i}", detail_url=u, source="100bt-id", element_hints=[]))
    return items


def table_to_matrix(table: Tag) -> List[List[str]]:
    rows: List[List[str]] = []
    for tr in table.select("tr"):
        cells = tr.select("th,td")
        vals = [normalize_text(c.get_text(" ", strip=True)) for c in cells]
        if any(vals):
            rows.append(vals)
    return rows


def normalize_text(s) -> str:
    if isinstance(s, (list, tuple)):
        s = " ".join(str(x) for x in s if x is not None)
    if s is None:
        s = ""
    if not isinstance(s, str):
        s = str(s)
    s = html.unescape(s)
    s = s.replace("\xa0", " ")
    s = re.sub(r"\s+", " ", s).strip()
    return s


def normalize_element_name(raw: str) -> str:
    t = normalize_text(raw)
    t = t.replace("属性", "").replace("亚比", "").strip()
    if not t:
        return ""
    if not t.endswith("系"):
        t = f"{t}系"
    return t


def load_allowed_elements(type_dir: str) -> List[str]:
    out: List[str] = []
    if not type_dir or not os.path.isdir(type_dir):
        return out
    for fn in os.listdir(type_dir):
        stem, ext = os.path.splitext(fn)
        if ext.lower() not in (".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp"):
            continue
        name = normalize_element_name(stem)
        if name:
            out.append(name)
    return sorted(set(out))


def extract_elements_from_text(text: str) -> List[str]:
    txt = normalize_text(text)
    out: List[str] = []
    seen = set()

    # 1) 标签式提取：系别/属性/主属性：木系
    label_hits = re.findall(
        r"(?:系别|属性|主属性|亚比系别)\s*[:：]\s*([^\s,，。；;<>/|]{1,8})",
        txt,
    )
    for h in label_hits:
        e = normalize_element_name(h)
        if e and e not in seen:
            seen.add(e)
            out.append(e)

    # 2) 全文兜底：直接扫描已知系别词
    for e in ELEMENT_PATH_HINTS.keys():
        if e in txt and e not in seen:
            seen.add(e)
            out.append(e)

    # 3) 100bt 常见格式兜底：技能属性/类型中的“木 /普通攻击”
    # 从“X /普通攻击|特殊攻击|属性攻击”抽取 X，并归一化为“X系”
    attr_hits = re.findall(
        r"([^\s,，。；;<>/|]{1,6})\s*/\s*(?:普通攻击|特殊攻击|属性攻击)",
        txt,
    )
    if attr_hits:
        freq: Dict[str, int] = {}
        for h in attr_hits:
            e = normalize_element_name(h)
            if not e:
                continue
            freq[e] = freq.get(e, 0) + 1
        # 若存在非普通系，去掉普通系，避免“普通/普通攻击”干扰主系别判断
        non_normal = [k for k in freq.keys() if k != "普通系"]
        if non_normal and "普通系" in freq:
            freq.pop("普通系", None)
        for e, _ in sorted(freq.items(), key=lambda kv: (-kv[1], kv[0])):
            if e not in seen:
                seen.add(e)
                out.append(e)

    return out


def _element_from_attr_type_text(s: str) -> str:
    t = normalize_text(s).replace("／", "/")
    if not t:
        return ""
    # 兼容 “木/普通攻击” 或 “普通攻击/木”
    if "/" in t:
        a, b = [normalize_text(x) for x in t.split("/", 1)]
        atk_types = {"普通攻击", "特殊攻击", "属性攻击"}
        if a in atk_types and b:
            return normalize_element_name(b)
        if b in atk_types and a:
            return normalize_element_name(a)
        # 两侧都不是攻击类型时，优先取左侧
        return normalize_element_name(a)
    return normalize_element_name(t)


def infer_elements_from_skill_tables(main: Tag, soup: BeautifulSoup) -> List[str]:
    tables = main.select("table")
    if not tables:
        tables = soup.select("table")

    freq: Dict[str, int] = {}
    for table in tables:
        matrix = table_to_matrix(table)
        if not matrix or not looks_like_skill_table(matrix):
            continue

        for rec in rows_to_dicts_with_header_scan(matrix, "skill"):
            attr_type = ""
            attr = ""
            atk_type = ""
            for k, v in rec.items():
                kk = normalize_text(k)
                vv = normalize_text(v)
                if not vv:
                    continue
                if ("技能属性/类型" in kk) or ("属性/类型" in kk):
                    attr_type = vv
                elif ("技能属性" in kk) or (kk == "属性"):
                    attr = vv
                elif ("攻击类型" in kk) or ("技能类型" in kk) or (kk == "类型"):
                    atk_type = vv

            cand = ""
            if attr_type:
                cand = _element_from_attr_type_text(attr_type)
            elif attr:
                cand = normalize_element_name(attr)
            elif atk_type:
                # 极少数页面“类型”字段可能塞的是系别
                cand = normalize_element_name(atk_type)

            if cand and cand in ELEMENT_PATH_HINTS:
                freq[cand] = freq.get(cand, 0) + 1

    if not freq:
        return []

    # 若存在非普通系，移除普通系干扰“主系别”判断
    non_normal = [k for k in freq.keys() if k != "普通系"]
    if non_normal and "普通系" in freq:
        freq.pop("普通系", None)

    return [k for k, _ in sorted(freq.items(), key=lambda kv: (-kv[1], kv[0]))]


def infer_element_freq_from_skill_tables(main: Tag, soup: BeautifulSoup) -> Dict[str, int]:
    tables = main.select("table")
    if not tables:
        tables = soup.select("table")

    freq: Dict[str, int] = {}
    for table in tables:
        matrix = table_to_matrix(table)
        if not matrix or not looks_like_skill_table(matrix):
            continue

        for rec in rows_to_dicts_with_header_scan(matrix, "skill"):
            attr_type = ""
            attr = ""
            atk_type = ""
            for k, v in rec.items():
                kk = normalize_text(k)
                vv = normalize_text(v)
                if not vv:
                    continue
                if ("技能属性/类型" in kk) or ("属性/类型" in kk):
                    attr_type = vv
                elif ("技能属性" in kk) or (kk == "属性"):
                    attr = vv
                elif ("攻击类型" in kk) or ("技能类型" in kk) or (kk == "类型"):
                    atk_type = vv

            cand = ""
            if attr_type:
                cand = _element_from_attr_type_text(attr_type)
            elif attr:
                cand = normalize_element_name(attr)
            elif atk_type:
                cand = normalize_element_name(atk_type)

            if cand and cand in ELEMENT_PATH_HINTS:
                freq[cand] = freq.get(cand, 0) + 1

    # 若存在非普通系，移除普通系干扰“主系别”判断
    non_normal = [k for k in freq.keys() if k != "普通系"]
    if non_normal and "普通系" in freq:
        freq.pop("普通系", None)

    return freq


def format_element_ratio(freq: Dict[str, int]) -> str:
    if not freq:
        return ""
    total = sum(max(0, int(v)) for v in freq.values())
    if total <= 0:
        return ""
    ordered = sorted(freq.items(), key=lambda kv: (-kv[1], kv[0]))
    parts = []
    for e, c in ordered:
        ratio = (c / total) * 100.0
        parts.append(f"{e}:{ratio:.2f}%")
    return "; ".join(parts)


def looks_like_race_table(rows: List[List[str]]) -> bool:
    if not rows:
        return False
    head = " ".join(" ".join(r) for r in rows[:6])
    keys = ["体力", "攻击", "防御", "特攻", "特防", "速度"]
    if sum(1 for k in keys if k in head) >= 4:
        return True
    joined = " ".join(" ".join(r) for r in rows[:14])
    return ("种族值" in joined) and ("体力" in joined) and ("速度" in joined)

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

def nearest_title_for_table(table: Tag) -> str:
    # 鍚戝墠鎵炬渶杩戠殑鏍囬鑺傜偣
    prev = table.find_previous(["p", "h1", "h2", "h3", "h4", "strong", "b", "div"])
    if not prev:
        return ""
    txt = normalize_text(prev.get_text(" ", strip=True))
    return txt[:120]


def rows_to_dicts(rows: List[List[str]]) -> List[Dict[str, str]]:
    if not rows:
        return []
    header = rows[0]
    header = [h if h else f"col_{i+1}" for i, h in enumerate(header)]
    max_len = max(len(r) for r in rows)
    if len(header) < max_len:
        header += [f"col_{i+1}" for i in range(len(header), max_len)]
    out = []
    for r in rows[1:]:
        if not any(r):
            continue
        rr = r + [""] * (len(header) - len(r))
        out.append({header[i]: rr[i] for i in range(len(header))})
    return out


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

def extract_ids_from_text(text: str) -> List[str]:
    # 璇︽儏椤靛父瑙侊細搴忓彿锛?01
    ids = re.findall(r"搴忓彿[锛?]\s*([0-9]{1,6})", text)
    # 鍘婚噸涓斾繚搴?
    seen = set()
    out = []
    for x in ids:
        if x not in seen:
            seen.add(x)
            out.append(x)
    return out


def parse_detail(session: requests.Session, item: YabiItem) -> Tuple[dict, List[dict], List[dict]]:
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
    # 系别优先从技能表推断，再用全文兜底
    table_elements = infer_elements_from_skill_tables(main, soup)
    text_elements = extract_elements_from_text(all_text)
    elements = table_elements + [e for e in text_elements if e not in table_elements]

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
    # 系别优先从技能表推断，再用全文兜底
    table_freq = infer_element_freq_from_skill_tables(main, soup)
    table_elements = [k for k, _ in sorted(table_freq.items(), key=lambda kv: (-kv[1], kv[0]))]
    text_elements = extract_elements_from_text(all_text)
    elements = table_elements + [e for e in text_elements if e not in table_elements]
    primary_element = table_elements[0] if table_elements else (elements[0] if elements else "")
    element_ratio = format_element_ratio(table_freq)

    return {
        "item_name": item.name,
        "page_title": title,
        "detail_url": item.detail_url,
        "primary_element": primary_element,
        "elements": ",".join(elements),
        "element_count": len(elements),
        "element_ratio": element_ratio,
        "element_hits_total": sum(table_freq.values()) if table_freq else 0,
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
            "primary_element",
            "elements",
            "element_count",
            "element_ratio",
            "element_hits_total",
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
    if parse_elements_only:
        source_mode = "100bt-tujian"

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

    if req_elements and not scan_by_template and not parse_elements_only:
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

        write_elements_excel_streaming(output_path=output_path, rows=element_rows)
        print("\\nDone (element-only mode)")
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

    print("\\nDone")
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
