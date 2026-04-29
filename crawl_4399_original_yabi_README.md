# 4399 原系亚比爬虫说明

## 功能
抓取 https://news.4399.com/aolaxing/yabi/ 的原系亚比详情，提取：
- 亚比编号（序号）
- 技能表格
- 种族值表格

并支持按 `type` 目录中的系别白名单过滤（例如 `木系.png`、`火系.png` 等文件名）。

并导出 Excel（3 个工作表）：
- 亚比总表
- 技能表
- 种族值表

## 安装依赖
```bash
py -3 -m pip install requests beautifulsoup4 pandas openpyxl lxml
```

## 运行
```bash
py -3 crawl_4399_original_yabi.py --strict-legacy
```

默认输出：`原系亚比_编号_技能_种族值.xlsx`

## 常用参数
```bash
# 指定输出文件
py -3 crawl_4399_original_yabi.py -o out.xlsx

# 仅抓前 20 个（调试）
py -3 crawl_4399_original_yabi.py --max-items 20

# 强制仅抓旧版原系详情页（推荐，结果更准）
py -3 crawl_4399_original_yabi.py --strict-legacy

# 指定系别白名单目录（默认 ./type）
py -3 crawl_4399_original_yabi.py --type-dir "./type"

# 仅抓指定系别（会在抓详情前预筛选，日志按系别跑）
py -3 crawl_4399_original_yabi.py --elements "木系"
py -3 crawl_4399_original_yabi.py --elements "木系,火系,水系"

# 按详情页URL日期筛选年月（默认就是 201008-201412）
py -3 crawl_4399_original_yabi.py --start-ym 201008 --end-ym 201412

# URL模板扫描模式（按系别目录+年份+编号拼接URL）
# 先粗扫（推荐）
py -3 crawl_4399_original_yabi.py --scan-by-template --elements "木系,火系,水系,冰系,土系,电系,光明系,暗黑系,神秘系,机械系,飞行系,龙系,上古系,数码系,格斗系,王系,神兵系,圣灵系,爬行系" --start-ym 201008 --end-ym 201412 --id-min 75836 --id-max 462005 --id-step 20

python crawl_4399_original_yabi.py --scan-by-template --elements "木系,火系,水系,冰系,土系,电系,光明系,暗黑系,神秘系,机械系,飞行系,上古系,数码系,格斗系,爬行系" --start-ym 201008 --end-ym 201108 --id-min 75836 --id-max 108161 --id-step 1

python crawl_4399_original_yabi.py --scan-by-template --elements "木系" --start-ym 201008 --end-ym 201108 --id-min 75836 --id-max 108161 --id-step 10

# 再细扫（耗时大）
py -3 crawl_4399_original_yabi.py --scan-by-template --elements "木系" --start-ym 201008 --end-ym 201412 --id-min 75836 --id-max 462005 --id-step 1

# 如果看起来“长时间没日志”，加上这组参数（推荐）
python crawl_4399_original_yabi.py --scan-by-template --elements "木系,火系,水系,冰系,土系,电系,光明系,暗黑系,神秘系,机械系,飞行系,上古系,数码系,格斗系,爬行系" --start-ym 201008 --end-ym 201108 --id-min 75855 --id-max 75856 --id-step 1 --probe-timeout 1.0 --max-attempts-per-id 500 --progress-every-ids 1

python crawl_4399_original_yabi.py --scan-by-template --elements "木系,火系,水系,冰系,土系,电系,光明系,暗黑系,神秘系,机械系,飞行系,上古系,数码系,格斗系,爬行系" --start-ym 201008 --end-ym 201108 --id-min 75856 --id-max 108161 --id-step 8 --probe-timeout 1.0 --max-attempts-per-id 300 --progress-every-ids 1

# 调整请求间隔与超时
py -3 crawl_4399_original_yabi.py --delay-min 0.3 --delay-max 0.8 --timeout 30
```
