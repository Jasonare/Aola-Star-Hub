if (!window.Vue) {
  const app = document.getElementById("app");
  if (app) {
    app.innerHTML = "<div style='padding:24px;font-weight:700;color:#dc2626'>Vue 加载失败，请检查 ./vendor/vue.global.prod.js 是否存在。</div>";
  }
  throw new Error("Vue failed to load from local vendor file");
}
const { createApp, ref, computed, watch, onMounted, onBeforeUnmount, nextTick } = window.Vue;
const isAndroidWebViewRuntime = () => {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;
  return /Android/i.test(navigator.userAgent || "") || String(window.location && window.location.href || "").includes("android_asset");
};
const loadLocalAssetBuffer = (url, responseType = "arraybuffer") => new Promise((resolve, reject) => {
  if (typeof XMLHttpRequest === "undefined") {
    reject(new Error("XMLHttpRequest is not available"));
    return;
  }
  const xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.responseType = responseType;
  xhr.onload = () => {
    const status = Number(xhr.status) || 0;
    if ((status >= 200 && status < 300) || status === 0) resolve(xhr.response);
    else reject(new Error(`Asset load failed: ${status}`));
  };
  xhr.onerror = () => reject(new Error("Asset load failed"));
  xhr.send();
});
const loadLocalAssetText = async (url) => {
  const data = await loadLocalAssetBuffer(url, "text");
  return typeof data === "string" ? data : String(data || "");
};
const encodeAssetSrc = (src) => {
  const raw = String(src || "");
  if (!raw) return "";
  try { return encodeURI(raw); } catch { return raw; }
};
const assetSrcWithQuery = (src, key, value) => {
  const raw = String(src || "");
  if (!raw) return "";
  const safeKey = encodeURIComponent(String(key || "v"));
  const safeValue = encodeURIComponent(String(value || Date.now()));
  return `${raw}${raw.includes("?") ? "&" : "?"}${safeKey}=${safeValue}`;
};

const cleanupOrphanTemplateOverlays = () => {
  if (!document || !document.body) return;
  const app = document.getElementById("app");
  if (!app) return;
  const children = Array.prototype.slice.call(document.body.children || []);
  children.forEach((el) => {
    if (!el || el === app || el.tagName === "SCRIPT") return;
    const txt = String(el.textContent || "");
    const attrs = el.getAttributeNames ? el.getAttributeNames() : [];
    const hasVueAttr = attrs.some((a) => a.startsWith("v-") || a.startsWith(":") || a.startsWith("@"));
    const hasMustache = txt.includes("{{") || txt.includes("}}");
    const hit = hasVueAttr || hasMustache;
    if (hit && el.parentNode === document.body) {
      app.appendChild(el);
    }
  });
};

cleanupOrphanTemplateOverlays();

const STORAGE_KEY = "aola_battle_platform_v2_ascii";
const SESSION_MODE_KEY = "aola_star_session_mode_v1";
const AUTH_TOKEN_KEY = "aola_star_auth_token_v1";
const REMEMBER_LOGIN_KEY = "aola_star_remember_login_v1";
const LOGIN_CAPTCHA_VERIFIED_KEY = "aola_star_login_captcha_verified_v1";
const LOGIN_CAPTCHA_NOTICE = "验证码加群776802444获取，本游戏完全免费游玩，任何付费获取的玩家请在相应平台申请退款";
const LOGIN_CAPTCHA_TEXT = "谨防闲鱼倒钩战神12等其他司马";
const BGM_VOLUME_KEY = "aola_star_bgm_volume_v1";
const BATTLE_SPEED_KEY = "aola_star_battle_speed_v1";
const RELEASE_NOTES_V040 = {
  title: "Aola Star Hub-debug-V0.5.0版本更新内容：",
  items: [
    "修复部分技能生效不准确的问题：糖衣穿甲弹、糖衣能量炮、激发魔力、圆月之誓、天之锁、古炎无双、无限圣裁、月影无踪、圣疗、辉之斩魄、光之斩魄、乾坤斗转、神圣光爆、盗神之火等；",
    "修复手机端在对战时跳出红色报错弹窗的问题；",
    "修复桌面端无法批量使用道具的问题；",
    "自动战斗仪支持选择使用次数；",
    "将守护者挑战和BOSS挑战合并为“挑战之路”，分为五个梯度，按梯度开放挑战，增加已经击败的图标；",
    "挑战之路新增：狂战暗影兽、亚力山大、圣羽凌风、噬星白虎、夜雨银风、飓焰朱雀、断空翼皇；",
    "亚比图鉴编号开放至2020；",
    "20:00—22:00开放双倍h币和双倍经验时间（可以和双倍经验器叠加）；",
    "当周BOSS源上场！同步调整当周BOSS挑战模式，开放普通、困难、噩梦三个难度；",
    "战斗界面UI改造成怀旧版本；",
    "启星转盘按两个阶段开放；",
    "手机端/桌面端同步支持存档文件的导出和导入；",
    "时空隧道开放至第20层；",
    "增加挑战录像功能；",
    "骰子大王和no.14加强，新增技能石：超级骰子炸弹（在原有的骰子炸弹的伤害基础上面提升伤害，最终的伤害数值的区间100-600）；",
    "拉贝尔的幻影，法老王，机械木乃伊等原版不可获得的亚比进行回收，喜欢这些亚比的玩家不用失望，这些亚比可能会在后续的版本中得到体验游玩的机会哦；",
    "为了补偿回收亚比的资源，本期提供了补偿兑换码，兑换码可从Hub交流群获取；",
    "适当削弱启星之印的效果"
  ]
};
const SAVE_FILE_PREFIX = "aola_battle_save_";
const SHOP_REDEEM_CODE_ALHUB666 = "ALHUB666";
const SHOP_REDEEM_CODE_ALHUB666_DEX_ID = 1782;
const SHOP_REDEEM_CODE_ALHUB666_PET_NAME = "迷雾龙";
const SHOP_REDEEM_CODE_ALHUB666_LEGACY_DEX_IDS = new Set([2072]);
const SHOP_REDEEM_CODE_ALHUB666_SOURCE = "redeem:ALHUB666";
const SHOP_REDEEM_CODE_ALHUB666_BACKFILL_MIGRATION_KEY = "redeem_alhub666_mist_dragon_backfill_v1";
const STARTER_DEX_IDS = [1, 4, 7];
const BASE_GUARDIAN_NAMES = ["冰拳艾司", "沙麒麟", "金刚库巴", "木面侠", "火花龙"];
const EXTRA_GUARDIAN_NAMES = [
  "烈焰鸟", "合金猛将", "利刺大黄蜂", "雷纳瑞", "魂斗鱼", "浮云尊者", "神武月", "影刃", "年兽", "麦斗司令",
  "山脉之魂", "星光角斗士", "时间之神", "天使莱特", "战无炎", "极速威锋", "满月巨灵", "天之巨灵", "黑夜童心", "远古灵龟",
  "暴雪山神", "赤影飞狐", "赤魔导士", "天女若希", "神罗麦提", "超T兔", "猪猪超人", "翡冷翠", "鬼王", "岩波斗魂者",
  "友人契约书", "多古拉伯爵", "伊泽", "迦娜", "蓝羽灵者", "剑圣太白", "猎空", "奥弗", "赫提", "狂战暗影兽", "亚历山大"
];
const EXTRA_GUARDIAN_ALIAS = {
  "浮云尊者兄弟": "浮云尊者",
  "终极麦斗猪": "麦斗司令",
  "麦斗元帅": "麦斗司令",
  "天使菜特": "天使莱特"
};
const GUARDIAN_NAMES = Array.from(new Set([...BASE_GUARDIAN_NAMES, ...EXTRA_GUARDIAN_NAMES]));
const BOSS_CHALLENGE_REQUIRED_GUARDIAN_NAMES = [
  "冰拳艾司", "沙麒麟", "木面侠", "金刚库巴", "火花龙",
  "合金猛将", "神武月", "利刺大黄蜂", "战无炎", "时间之神",
  "影刃", "烈焰鸟", "天使莱特", "山脉之魂", "星光角斗士"
];
const BOSS_CHALLENGE_LOCKED_MESSAGE = "请先通关挑战之路第一梯度，才能开放后续挑战。";
const BOSS_NAMES = [
  "骰子大王", "龙族大法师", "七星神龙", "青龙灵兽", "玄武灵兽", "白虎灵兽", "朱雀灵兽", "念", "凯撒", "修罗",
  "奇灵王", "音爵卡卡", "烈焰凤凰", "魔焰吉拉", "古渊露龙", "终结兔", "飞天独角兽", "熊猫大侠", "帝皇龙",
  "霜炎法神", "赤翼魔龙王", "苍穹圣龙", "尤莱亚", "张飞", "曹操", "诸葛亮", "赵云", "吕布", "阿尔法",
  "白羽公主", "极冰海牙", "焚浪", "鲁曼", "拉诺斯", "纳兹", "岩战", "施瓦辛格", "塞娅", "幻冥",
  "金刚虎王", "千年瑞兽", "震天金刚", "太阳星诺", "月亮星诺", "疾影侠", "啸天侠", "炼狱战狮", "巨角剑龙",
  "天怒", "天煞", "雷霆", "万钧", "星皇", "幻极", "波塞冬", "魔洛", "暗影凯撒", "黑炎龙",
  "圣光修罗", "噬月武神", "苍炎战神", "阿波罗", "九尾冰狐", "金银尊者", "雷钢侠", "炼狱狮王", "菲尔", "可兰",
  "雷霆青龙", "惊涛玄武", "炎王", "阿尔萨斯", "帝卡", "冥焰夜王", "斗罗明王", "光暗弑神", "龙刃",
  "君焰狼王", "魂战", "炽燎天", "擎霸空", "冰晶凤凰", "擎战", "帝王奇灵", "真·苍炎战神", "真·噬月武神",
  "真·烈焰凤凰", "龙·炎王", "真·赤色梦魇", "圣王麒麟", "圣·天伊", "冰罗皇", "奥天",
  "圣羽凌风", "噬星白虎", "夜羽银风", "飓焰朱雀", "断空翼皇",
  "天苍霜龙", "创世星灵", "克劳斯", "斗焰吉拉", "皇极兔", "圣渊露龙", "星宇侠X"
];
const BOSS_DEX_ENTRIES = [
  { dexId: 177, name: "骰子大王" }, { dexId: 215, name: "青龙灵兽" }, { dexId: 290, name: "七星神龙" }, { dexId: 305, name: "龙族大法师" },
  { dexId: 383, name: "音爵卡卡" }, { dexId: 388, name: "玄武灵兽" }, { dexId: 500, name: "终结兔" }, { dexId: 501, name: "魔焰吉拉" },
  { dexId: 502, name: "古渊露龙" }, { dexId: 506, name: "烈焰凤凰" }, { dexId: 604, name: "念" }, { dexId: 624, name: "白虎灵兽" },
  { dexId: 653, name: "飞天独角兽" }, { dexId: 725, name: "熊猫大侠" }, { dexId: 728, name: "凯撒" }, { dexId: 731, name: "修罗" },
  { dexId: 741, name: "朱雀灵兽" }, { dexId: 775, name: "帝皇龙" }, { dexId: 794, name: "奇灵王" },
  { dexId: 1767, name: "霜炎法神" }, { dexId: 1350, name: "赤翼魔龙王" }, { dexId: 1479, name: "苍穹圣龙" }, { dexId: 249, name: "尤莱亚" },
  { dexId: 955, name: "张飞" },
  { dexId: 1605, name: "曹操" }, { dexId: 976, name: "诸葛亮" }, { dexId: 931, name: "赵云" }, { dexId: 1108, name: "吕布" }, { dexId: 1590, name: "阿尔法" },
  { dexId: 1792, name: "天怒" }, { dexId: 1794, name: "天煞" }, { dexId: 1808, name: "瞳灵" }, { dexId: 1823, name: "星皇" },
  { dexId: 1830, name: "雷霆" }, { dexId: 1832, name: "万钧" }, { dexId: 1845, name: "光暗弑神" }, { dexId: 1716, name: "奥天" },
  { dexId: 1749, name: "雷霆青龙" }, { dexId: 1752, name: "惊涛玄武" }, { dexId: 1861, name: "龙刃" }, { dexId: 1754, name: "炎王" },
  { dexId: 1777, name: "帝卡" }, { dexId: 1825, name: "斗罗明王" }, { dexId: 1873, name: "冰罗皇" }, { dexId: 1896, name: "圣·天伊" },
  { dexId: 1362, name: "阿波罗" }, { dexId: 1869, name: "圣王麒麟" }, { dexId: 1414, name: "九尾冰狐" }, { dexId: 1450, name: "千年瑞兽" },
  { dexId: 1496, name: "震天金刚" }, { dexId: 1514, name: "战魂猛犸" }, { dexId: 1619, name: "巨角剑龙" }, { dexId: 891, name: "刀锋" },
  { dexId: 901, name: "星宇侠" }, { dexId: 1118, name: "幻影" }, { dexId: 1426, name: "黑炎龙" }, { dexId: 1756, name: "阿尔萨斯" },
  { dexId: 1911, name: "炽燎天" }, { dexId: 1912, name: "擎霸空" }, { dexId: 1898, name: "擎空" }, { dexId: 946, name: "紫渊" },
  { dexId: 973, name: "红魔" }, { dexId: 1086, name: "绿焰" }, { dexId: 1124, name: "夜王狄米特" }, { dexId: 1170, name: "夜兰" },
  { dexId: 1232, name: "鲁曼" }, { dexId: 1250, name: "纳兹" }, { dexId: 1291, name: "塞娅" }, { dexId: 1347, name: "魔洛" }, { dexId: 1706, name: "暗影凯撒" },
  { dexId: 1122, name: "狼王迪洛斯" }, { dexId: 1309, name: "幻冥" }, { dexId: 1328, name: "幻极" }, { dexId: 1134, name: "白羽公主" },
  { dexId: 1159, name: "极冰海牙" }, { dexId: 1380, name: "金刚虎王" }, { dexId: 1423, name: "噬月武神" }, { dexId: 1451, name: "金银尊者" },
  { dexId: 1461, name: "苍炎战神" }, { dexId: 1538, name: "炼狱战狮" }, { dexId: 1539, name: "炼狱狮王" }, { dexId: 1639, name: "圣光修罗" },
  { dexId: 1806, name: "冥焰夜王" },
  { dexId: 1905, name: "君焰狼王" }, { dexId: 1925, name: "龙·炎王" }, { dexId: 1926, name: "帝王奇灵" }, { dexId: 1915, name: "真·苍炎战神" },
  { dexId: 1916, name: "真·噬月武神" }, { dexId: 1917, name: "真·烈焰凤凰" }, { dexId: 1927, name: "真·赤色梦魇" }, { dexId: 1526, name: "雷钢侠" },
  { dexId: 1528, name: "疾影侠" }, { dexId: 1530, name: "啸天侠" }, { dexId: 1501, name: "太阳星诺" }, { dexId: 1503, name: "月亮星诺" },
  { dexId: 1181, name: "焚浪" }, { dexId: 1274, name: "岩战" }, { dexId: 1910, name: "魂战" }, { dexId: 1648, name: "菲尔" },
  { dexId: 1649, name: "可兰" }, { dexId: 1234, name: "拉诺斯" }, { dexId: 1282, name: "施瓦辛格" }, { dexId: 1336, name: "波塞冬" },
  { dexId: 1938, name: "冰晶凤凰" }, { dexId: 1950, name: "擎战" },
  { dexId: 1962, name: "圣羽凌风" }, { dexId: 1963, name: "噬星白虎" }, { dexId: 1972, name: "夜羽银风" },
  { dexId: 1975, name: "飓焰朱雀" }, { dexId: 1985, name: "断空翼皇" },
  { dexId: 1994, name: "天苍霜龙" }, { dexId: 1999, name: "创世星灵" }, { dexId: 2001, name: "克劳斯" },
  { dexId: 2006, name: "斗焰吉拉" }, { dexId: 2010, name: "皇极兔" }, { dexId: 2011, name: "圣渊露龙" },
  { dexId: 2019, name: "星宇侠X" }
];
const BOSS_DEX_ID_TO_NAME = new Map(BOSS_DEX_ENTRIES.map((entry) => [entry.dexId, entry.name]));
const CHALLENGE_ROAD_COVER_SRC_1 = "./boss-level/1-first.png";
const CHALLENGE_ROAD_COVER_SRC_2 = "./boss-level/2-second.png";
const CHALLENGE_ROAD_COVER_SRC_3 = "./boss-level/3-third.png";
const CHALLENGE_ROAD_COVER_SRC_4 = "./boss-level/4-forth.png";
const CHALLENGE_ROAD_COVER_SRC_5 = "./boss-level/5-fifth.png";

const CHALLENGE_ROAD_NAME_ALIAS = {
  "青龙": "青龙灵兽",
  "玄武": "玄武灵兽",
  "朱雀": "朱雀灵兽",
  "塞妊": "塞娅",
  "雷刚侠": "雷钢侠",
  "擎霸天": "擎霸空",
  "真苍炎": "真·苍炎战神",
  "真苍炎战神": "真·苍炎战神",
  "真噬月武神": "真·噬月武神",
  "真烈焰凤凰": "真·烈焰凤凰",
  "龙炎王": "龙·炎王",
  "圣天伊": "圣·天伊",
  "真赤色梦魇": "真·赤色梦魇",
  "天霜苍龙": "天苍霜龙"
};
const CHALLENGE_ROAD_STAGE_COVER_DIRS = ["第一阶段", "第二阶段", "第三阶段", "第四阶段", "第五阶段"];
const CHALLENGE_ROAD_STAGE_COVER_NAME_ALIAS = {
  "白虎灵兽": "白虎",
  "魔焰吉拉": "魔焰基拉",
  "疾影侠": "极影侠",
  "雷刚侠": "雷钢侠",
  "帝王奇灵": "帝王麒麟",
  "真苍炎": "真 苍炎战神",
  "真·苍炎战神": "真 苍炎战神",
  "真噬月武神": "真 噬月武神",
  "真·噬月武神": "真 噬月武神",
  "真烈焰凤凰": "真 烈焰凤凰",
  "真·烈焰凤凰": "真 烈焰凤凰",
  "龙炎王": "龙 炎王",
  "龙·炎王": "龙 炎王",
  "圣天伊": "圣天伊",
  "圣·天伊": "圣天伊",
  "真赤色梦魇": "真 赤色梦魇",
  "真·赤色梦魇": "真 赤色梦魇"
};
const CHALLENGE_ROAD_TIER3_GUARDIAN_NAMES = EXTRA_GUARDIAN_NAMES
  .slice(
    Math.max(0, EXTRA_GUARDIAN_NAMES.indexOf("雷纳瑞")),
    EXTRA_GUARDIAN_NAMES.indexOf("赫提") >= 0 ? EXTRA_GUARDIAN_NAMES.indexOf("赫提") + 1 : EXTRA_GUARDIAN_NAMES.length
  )
  .filter((name) => !BOSS_CHALLENGE_REQUIRED_GUARDIAN_NAMES.includes(name))
  .concat(["狂战暗影兽", "亚历山大"]);
const CHALLENGE_ROAD_TIERS = [
  {
    key: "tier_1",
    title: "第一梯度",
    subtitle: "前15个守护者",
    cover: CHALLENGE_ROAD_COVER_SRC_1,
    guardianNames: BOSS_CHALLENGE_REQUIRED_GUARDIAN_NAMES.slice(),
    bossNames: []
  },
  {
    key: "tier_2",
    title: "第二梯度",
    subtitle: "初阶BOSS挑战",
    cover: CHALLENGE_ROAD_COVER_SRC_2,
    guardianNames: [],
    bossNames: [
      "骰子大王", "青龙", "七星神龙", "龙族大法师", "音爵卡卡", "玄武", "终结兔", "魔焰吉拉", "古渊露龙", "烈焰凤凰",
      "白虎灵兽", "飞天独角兽", "熊猫大侠", "修罗", "凯撒", "尤莱亚", "奇灵王", "刀锋", "星宇侠", "赵云",
      "诸葛亮", "吕布", "幻影", "狼王迪洛斯", "夜王狄米特", "夜兰", "绿焰", "紫渊", "红魔"
    ]
  },
  {
    key: "tier_3",
    title: "第三梯度",
    subtitle: "进阶守护者与BOSS",
    cover: CHALLENGE_ROAD_COVER_SRC_3,
    guardianNames: CHALLENGE_ROAD_TIER3_GUARDIAN_NAMES,
    bossNames: [
      "白羽公主", "极冰海牙", "焚浪", "鲁曼", "拉诺斯", "纳兹", "岩战", "施瓦辛格", "塞妊", "幻冥",
      "金刚虎王", "千年瑞兽", "震天金刚", "太阳星诺", "月亮星诺", "疾影侠", "啸天侠", "炼狱战狮", "曹操", "巨角剑龙",
      "天怒", "天煞", "雷霆", "万钧", "星皇", "张飞"
    ]
  },
  {
    key: "tier_4",
    title: "第四梯度",
    subtitle: "高阶BOSS挑战",
    cover: CHALLENGE_ROAD_COVER_SRC_4,
    guardianNames: [],
    bossNames: [
      "幻极", "波塞冬", "赤翼魔龙王", "魔洛", "暗影凯撒", "黑炎龙", "霜炎法神", "朱雀", "念", "苍穹圣龙",
      "圣光修罗", "噬月武神", "苍炎战神", "帝皇龙", "阿波罗", "九尾冰狐", "金银尊者", "雷刚侠", "炼狱狮王", "阿尔法",
      "菲尔", "可兰", "雷霆青龙", "惊涛玄武", "炎王", "阿尔萨斯", "帝卡", "冥焰夜王", "斗罗明王", "光暗弑神",
      "龙刃", "君焰狼王", "魂战", "炽燎天", "擎霸空", "冰晶凤凰", "擎战", "帝王奇灵",
      "圣羽凌风", "噬星白虎", "夜羽银风", "飓焰朱雀", "断空翼皇",
      "天苍霜龙", "克劳斯", "斗焰吉拉", "皇极兔", "圣渊露龙"
    ]
  },
  {
    key: "tier_5",
    title: "第五梯度",
    subtitle: "终阶BOSS挑战",
    cover: CHALLENGE_ROAD_COVER_SRC_5,
    guardianNames: [],
    bossNames: ["真苍炎", "真噬月武神", "真烈焰凤凰", "龙炎王", "真赤色梦魇", "圣王麒麟", "圣天伊", "冰罗皇", "奥天", "创世星灵", "星宇侠X"]
  }
];
const QIXING_SEAL_ITEM_ID = "qixing_seal";
const QIXING_FRAGMENT_ITEM_ID = "qixing_fragment";
const ZONGZI_ITEM_ID = "zongzi";
const QIXING_SEAL_MAX_LEVEL = 4;
const QIXING_SEAL_IMAGE_SRC = "./ui/qixing-seal.png?v=20260602";
const BATTLE_MORALE_FX_SRC = encodeAssetSrc("./fight-ui/斗志.gif");
const BATTLE_FIERCE_MORALE_FX_SRC = encodeAssetSrc("./fight-ui/狂暴斗志.gif");
const BATTLE_SKIN_TRANSFORM_FX_SRC = encodeAssetSrc("./fight-ui/变身.gif");
const BATTLE_STAGE_UP_FX_SRC = encodeAssetSrc("./ui/提升.png");
const BATTLE_STAGE_DOWN_FX_SRC = encodeAssetSrc("./ui/下降.png");
const CHALLENGE_CLEARED_MARK_SRC = encodeAssetSrc("./小图标/已战胜（1）.png");
const CHALLENGE_CLEARED_MINI_MARK_SRC = encodeAssetSrc("./小图标/已战胜（2）.png");
const QIXING_TRAIT_KEYS = {
  LEGACY: "qixing_seal",
  LIANGYI: "liangyi",
  SHOUYU: "shouyu",
  JILAN: "jilan"
};
const QIXING_TRAIT_META = {
  [QIXING_TRAIT_KEYS.LEGACY]: {
    key: QIXING_TRAIT_KEYS.LEGACY,
    name: "启星之印",
    image: QIXING_SEAL_IMAGE_SRC,
    battle: {
      1: { chance: 0.1, count: 2, label: "Lv.1：每回合10%概率提升随机2个属性1级" },
      2: { chance: 0.15, count: 3, label: "Lv.2：每回合15%概率提升随机3个属性1级" },
      3: { chance: 0.18, count: 4, label: "Lv.3：每回合18%概率提升随机4个属性1级" },
      4: { chance: 0.2, count: 8, label: "Lv.4：每回合20%概率提升全属性1级" }
    }
  },
  [QIXING_TRAIT_KEYS.LIANGYI]: {
    key: QIXING_TRAIT_KEYS.LIANGYI,
    name: "两仪之印",
    image: "./ui/两仪.png",
    battle: {
      1: { damageBonus: 0.03, chance: 0.15, keys: ["atk", "spAtk"], label: "Lv.1：伤害加成+3%，15%概率提升自身双攻1级" },
      2: { damageBonus: 0.05, chance: 0.2, keys: ["atk", "spAtk"], label: "Lv.2：伤害加成+5%，20%概率提升自身双攻1级" },
      3: { damageBonus: 0.07, chance: 0.25, keys: ["atk", "spAtk"], label: "Lv.3：伤害加成+7%，25%概率提升自身双攻1级" },
      4: { damageBonus: 0.1, chance: 0.35, keys: ["atk", "spAtk"], label: "Lv.4：伤害加成+10%，35%概率提升自身双攻1级" }
    }
  },
  [QIXING_TRAIT_KEYS.SHOUYU]: {
    key: QIXING_TRAIT_KEYS.SHOUYU,
    name: "守御之印",
    image: "./ui/守御.png",
    battle: {
      1: { resistance: 0.03, chance: 0.15, keys: ["def", "spDef"], label: "Lv.1：伤害抗性+3%，15%概率提升自身双防1级" },
      2: { resistance: 0.05, chance: 0.2, keys: ["def", "spDef"], label: "Lv.2：伤害抗性+5%，20%概率提升自身双防1级" },
      3: { resistance: 0.07, chance: 0.25, keys: ["def", "spDef"], label: "Lv.3：伤害抗性+7%，25%概率提升自身双防1级" },
      4: { resistance: 0.1, chance: 0.35, keys: ["def", "spDef"], label: "Lv.4：伤害抗性+10%，35%概率提升自身双防1级" }
    }
  },
  [QIXING_TRAIT_KEYS.JILAN]: {
    key: QIXING_TRAIT_KEYS.JILAN,
    name: "疾岚之瞳",
    image: "./ui/疾岚.png",
    battle: {
      1: { damageBonus: 0.01, resistance: 0.01, chance: 0.15, keys: ["speed", "accuracy"], label: "Lv.1：伤害加成+1%，伤害抗性+1%，15%概率提升自身速度和命中各1级" },
      2: { damageBonus: 0.02, resistance: 0.02, chance: 0.2, keys: ["speed", "accuracy"], label: "Lv.2：伤害加成+2%，伤害抗性+2%，20%概率提升自身速度和命中各1级" },
      3: { damageBonus: 0.03, resistance: 0.03, chance: 0.25, keys: ["speed", "accuracy"], label: "Lv.3：伤害加成+3%，伤害抗性+3%，25%概率提升自身速度和命中各1级" },
      4: { damageBonus: 0.05, resistance: 0.05, chance: 0.35, keys: ["speed", "accuracy"], label: "Lv.4：伤害加成+5%，伤害抗性+5%，35%概率提升自身速度和命中各1级" }
    }
  }
};
const normalizeQixingTraitKey = (key) => {
  const raw = String(key || "").replace(/[\u200b\u00a0]/g, "").trim();
  return Object.prototype.hasOwnProperty.call(QIXING_TRAIT_META, raw) ? raw : QIXING_TRAIT_KEYS.LEGACY;
};
const getBattleMoraleFxSrcByLabel = (labelOrKey) => {
  const key = String(labelOrKey || "").replace(/[\u200b\u00a0]/g, "").trim();
  const label = normalize(labelOrKey);
  if (key === QIXING_TRAIT_KEYS.LEGACY || key === QIXING_TRAIT_KEYS.JILAN) return BATTLE_FIERCE_MORALE_FX_SRC;
  if (label === "狂暴斗志" || label === "启星之印" || label === "疾岚之瞳" || label === "源力涌动") return BATTLE_FIERCE_MORALE_FX_SRC;
  return BATTLE_MORALE_FX_SRC;
};
const getQixingTraitMetaByKey = (key) => QIXING_TRAIT_META[normalizeQixingTraitKey(key)] || QIXING_TRAIT_META[QIXING_TRAIT_KEYS.LEGACY];
const getQixingTraitBattleRuleByKey = (key, level) => {
  const meta = getQixingTraitMetaByKey(key);
  const safeLevel = Math.max(1, Math.min(QIXING_SEAL_MAX_LEVEL, Math.floor(Number(level) || 1)));
  return (meta.battle && meta.battle[safeLevel]) || {};
};
const QIXING_SEAL_LEVEL_RULES = {
  1: { chance: 0.1, count: 2, upgradeCost: 20, label: "Lv.1：每回合10%概率提升随机2个属性1级" },
  2: { chance: 0.15, count: 3, upgradeCost: 40, label: "Lv.2：每回合15%概率提升随机3个属性1级" },
  3: { chance: 0.18, count: 4, upgradeCost: 80, label: "Lv.3：每回合18%概率提升随机4个属性1级" },
  4: { chance: 0.2, count: 8, upgradeCost: 0, label: "Lv.4：每回合20%概率提升全属性1级" }
};
const QIXING_SEAL_DECOMPOSE_FRAGMENT_BY_LEVEL = {
  1: 10,
  2: 25,
  3: 50,
  4: 100
};
const QIXING_SEAL_UPGRADE_RULES = {
  1: { fragmentCost: 20, hcoinCost: 2000, rates: [0.5, 0.75, 0.9], guaranteedAttempt: 4 },
  2: { fragmentCost: 40, hcoinCost: 5000, rates: [0.3, 0.45, 0.6, 0.75, 0.9], guaranteedAttempt: 6 },
  3: { fragmentCost: 80, hcoinCost: 10000, rates: [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9], guaranteedAttempt: 9 }
};
const QIXING_GACHA_ICE_PRINCESS_PITY_LIMIT = 150;
const QIXING_GACHA_QIANKUN_SKIN_PITY_LIMIT = 500;
const QIANKUN_XIULUOSHEN_SKIN_ITEM_ID = "qiankun_xiuluoshen_skin";
const QIANKUN_XIULUOSHEN_SKIN_KEY = "qiankun_xiuluoshen";
const QIANKUN_XIULUOSHEN_SKIN_NAME = "未来计划·黯帝修罗皮肤";
const QIANKUN_XIULUOSHEN_SKIN_DEX_ID = 4036;
const QIANKUN_XIULUOSHEN_SKIN_ALLOWED_DEX_IDS = new Set([1639, 731]);
const QIANKUN_XIULUOSHEN_SKIN_DAMAGE_BONUS = 0.1;
const QIANKUN_XIULUOSHEN_SKIN_RESISTANCE_BONUS = 0.1;
const QIANKUN_XIULUOSHEN_SKIN_BATTLE_BONUS_TEXT = "造成伤害+10%，受到普通/特殊攻击伤害-10%";
const QIXING_ANCIENT_STAR_DRAGON_DEX = {
  dexId: 2387,
  rootDexId: 2386,
  name: "源星之归引-上古星龙",
  image: "./pet-img/pet2387_1_1_cropped.png",
  element: "上古系",
  subElement: "",
  sourceUrl: ""
};
const NORMAL_HARD_CHALLENGE_FORBIDDEN_DEX_IDS = new Set([QIXING_ANCIENT_STAR_DRAGON_DEX.rootDexId, QIXING_ANCIENT_STAR_DRAGON_DEX.dexId]);
const QIXING_GACHA_PHASES = [
  {
    key: "phase1",
    label: "第一阶段",
    unlockText: "通关挑战之路第一梯度后解锁",
    pityKey: "phase1_ice_princess",
    pityLabel: "寒冰公主亚比蛋保底",
    pityLimit: QIXING_GACHA_ICE_PRINCESS_PITY_LIMIT,
    pityPrizeKey: "ice_princess_egg",
    pityPrizes: [
      { pityKey: "phase1_ice_princess", pityLabel: "寒冰公主亚比蛋保底", pityLimit: QIXING_GACHA_ICE_PRINCESS_PITY_LIMIT, prizeKey: "ice_princess_egg" }
    ],
    pool: [
      { key: "hcoin_500", type: "hcoin", label: "500H币", amount: 500, probability: 29.4 },
      { key: "hcoin_1000", type: "hcoin", label: "1000H币", amount: 1000, probability: 15 },
      { key: "hcoin_1500", type: "hcoin", label: "1500H币", amount: 1500, probability: 10 },
      { key: "fragment_1", type: "item", itemId: QIXING_FRAGMENT_ITEM_ID, label: "启星碎片1个", amount: 1, probability: 20 },
      { key: "fragment_2", type: "item", itemId: QIXING_FRAGMENT_ITEM_ID, label: "启星碎片2个", amount: 2, probability: 15 },
      { key: "fragment_5", type: "item", itemId: QIXING_FRAGMENT_ITEM_ID, label: "启星碎片5个", amount: 5, probability: 10 },
      { key: "shouyu", type: "trait", traitKey: QIXING_TRAIT_KEYS.SHOUYU, label: "守御之印", amount: 1, probability: 0.2 },
      { key: "liangyi", type: "trait", traitKey: QIXING_TRAIT_KEYS.LIANGYI, label: "两仪之印", amount: 1, probability: 0.2 },
      { key: "ice_princess_egg", type: "egg", dexId: 505, label: "寒冰公主亚比蛋", amount: 1, probability: 0.2, limitedKey: "phase1_ice_princess" }
    ]
  },
  {
    key: "phase2",
    label: "第二阶段",
    unlockText: "拥有第五梯度任意一个BOSS亚比或亚比蛋后解锁",
    pityKey: "phase2_qiankun_skin",
    pityLabel: `${QIANKUN_XIULUOSHEN_SKIN_NAME}保底`,
    pityLimit: QIXING_GACHA_QIANKUN_SKIN_PITY_LIMIT,
    pityPrizeKey: "qiankun_xiuluoshen_skin",
    pityPrizes: [
      { pityKey: "phase2_qiankun_skin", pityLabel: `${QIANKUN_XIULUOSHEN_SKIN_NAME}保底`, pityLimit: QIXING_GACHA_QIANKUN_SKIN_PITY_LIMIT, prizeKey: "qiankun_xiuluoshen_skin" }
    ],
    pool: [
      { key: "hcoin_500", type: "hcoin", label: "500H币", amount: 500, probability: 29.5 },
      { key: "hcoin_1000", type: "hcoin", label: "1000H币", amount: 1000, probability: 20 },
      { key: "fragment_1", type: "item", itemId: QIXING_FRAGMENT_ITEM_ID, label: "启星碎片1个", amount: 1, probability: 20 },
      { key: "fragment_2", type: "item", itemId: QIXING_FRAGMENT_ITEM_ID, label: "启星碎片2个", amount: 2, probability: 15 },
      { key: "fragment_5", type: "item", itemId: QIXING_FRAGMENT_ITEM_ID, label: "启星碎片5个", amount: 5, probability: 10 },
      { key: "fragment_10", type: "item", itemId: QIXING_FRAGMENT_ITEM_ID, label: "启星碎片10个", amount: 10, probability: 5 },
      { key: "jilan", type: "trait", traitKey: QIXING_TRAIT_KEYS.JILAN, label: "疾岚之瞳", amount: 1, probability: 0.2 },
      { key: "ice_princess_egg", type: "egg", dexId: 505, label: "寒冰公主亚比蛋", amount: 1, probability: 0.2, limitedKey: "phase2_ice_princess" },
      { key: "qiankun_xiuluoshen_skin", type: "item", itemId: QIANKUN_XIULUOSHEN_SKIN_ITEM_ID, label: QIANKUN_XIULUOSHEN_SKIN_NAME, amount: 1, probability: 0.1, limitedKey: "phase2_qiankun_skin" }
    ]
  }
];
const QIXING_GACHA_PHASE_BY_KEY = new Map(QIXING_GACHA_PHASES.map((phase) => [phase.key, phase]));
const WEEKLY_BOSS_CONFIG = {
  key: "source_1977",
  dexId: 1977,
  name: "源",
  level: 100,
  hpRaceMultiplier: 15,
  statBoostRatio: 0.6,
  dailyAttempts: 5,
  rewardHCoins: 5000,
  itemId: QIXING_SEAL_ITEM_ID,
  itemName: "启星之印",
  fixedHp: 15000,
  damageReductionRatio: 0,
  qixingSealLevel: 4,
  honorBadgeId: "weekly_boss_source_1977_honor",
  honorBadgeName: "源启星荣耀徽章"
};
const WEEKLY_BOSS_HISTORY_CONFIGS = [
  {
    key: "emperor_holy_dragon_1953",
    dexId: 1953,
    name: "帝皇圣龙",
    honorBadgeId: "weekly_boss_emperor_holy_dragon_1953_honor",
    honorBadgeName: "帝皇圣龙启星荣耀徽章"
  },
  {
    key: WEEKLY_BOSS_CONFIG.key,
    dexId: WEEKLY_BOSS_CONFIG.dexId,
    name: WEEKLY_BOSS_CONFIG.name,
    honorBadgeId: WEEKLY_BOSS_CONFIG.honorBadgeId,
    honorBadgeName: WEEKLY_BOSS_CONFIG.honorBadgeName
  }
];
const WEEKLY_BOSS_MEDAL_ITEM_ID = "weekly_boss_medal_source_1977";
const WEEKLY_BOSS_MEDAL_MAX = 50;
const WEEKLY_BOSS_EGG_EXCHANGE_COST = 50;
const WEEKLY_BOSS_DIFFICULTY_OPTIONS = [
  { key: "normal", label: "普通", tone: "normal", fixedHp: 15000, damageReductionRatio: 0.1, randomStageDelta: 2, rewardMedals: [5, 15], rewardHCoins: 2000, divinePetKeyCount: 5, blackgoldBadge: false },
  { key: "hard", label: "困难", tone: "hard", fixedHp: 20000, damageReductionRatio: 0.2, randomStageDelta: 4, rewardMedals: [15, 25], rewardHCoins: 5000, divinePetKeyCount: 10, blackgoldBadge: false },
  { key: "nightmare", label: "噩梦", tone: "nightmare", fixedHp: 30000, damageReductionRatio: 0.3, randomStageDelta: 4, rewardMedals: [50, 50], rewardHCoins: 8000, divinePetKeyCount: 15, blackgoldBadge: true }
];
const WEEKLY_BOSS_DIFFICULTY_BY_KEY = new Map(WEEKLY_BOSS_DIFFICULTY_OPTIONS.map((option) => [option.key, option]));
const EXCLUDED_BOSS_DEX_IDS = new Set([1808, 1898]);
const BOSS_FIXED_SKILL_BY_TURN = {
  624: { 1: "寒冰之镜" },
  1122: { 1: "怒嚎", 2: "远古记忆" },
  1124: { 1: "夜之域" },
  1426: { 1: "三重影分身" },
  1861: { 1: "苍雷" }
};
const BOSS_FIXED_SKILL_CYCLE_BY_DEX_ID = {
  1905: ["远古怒嚎", "狼王剑诀", "天堂圣焰", "天地无极", "远古怒嚎", "天堂圣焰", "狼王剑诀", "弦月之斩"],
  1953: ["万世主宰", "龙皇制裁", "龙皇制裁", "帝皇能量炮", "万世主宰", "傲世龙啸", "帝皇能量炮", "帝皇能量炮", "万世主宰", "傲世龙啸", "龙皇制裁", "帝皇能量炮", "万世主宰", "龙皇制裁", "龙皇制裁", "傲世龙啸"],
  1977: ["禅定印", "原初之一", "双龙集光咒", "原初之一", "灵魂吸收"]
};
const BOSS_FIXED_SKILL_INTERVAL_BY_DEX_ID = {
  1926: { interval: 5, skillName: "玄雷甲" }
};
const BOSS_RANDOM_SKILL_POOL_BY_DEX_ID = {
  775: ["灭世飓风", "龙神霸绝击", "龙啸九天", "龙腾四海"],
  1362: ["破灵碎无双", "众神之力", "烈阳涤尘", "爆阳天变"],
  1639: ["上古战魂", "修罗流星", "横扫八荒", "修罗裂空破", "明镜止水"],
  1706: ["魔影交错", "噩梦咒", "终焉之翼", "赎罪之境", "无尽黑洞"],
  1716: ["回光返照", "曙光初现", "灵魂燃烧", "天羽斩", "无坚不摧", "光之耀", "光之剑", "混沌吸收"],
  1806: ["无尽恐惧", "圣王之域", "断罪十字", "天堂契约"],
  1869: ["君临天下", "麒麟怒雷", "王之裁决", "万界必破", "威吓", "庇护"],
  1873: ["绝凌之星", "魂封", "冰魄·八极式", "牙突·零式", "光之耀", "冰之梦镜"],
  1896: ["神圣之星", "光·魂耀", "无限圣裁", "光之意志", "星辰闪烁", "光之耀", "恢复性睡眠", "南瓜炸弹"],
  1915: ["真战无落日", "落日吞天", "战武遗魂", "炎芒傲日", "恢复性睡眠"],
  1916: ["真神武噬月", "噬月啸天", "星舞残月", "战武遗魂", "月影无踪", "恢复性睡眠"],
  1917: ["凤凰涅槃", "真舞八重击", "烈焰力量", "丹凤朝阳", "凤舞九天", "神圣涅槃"],
  1925: ["光之耀", "天火噬", "红莲双击", "龙·魂爆", "龙之煌炎"],
  1926: ["玄雷甲", "瞬灵逆转", "飓风·雷电", "追云逐电", "巨兽之力"],
  1927: ["真·血印", "暗能", "催眠曲", "冰封禁制", "巨兽之力"],
  1938: ["冰魂轰击", "冰晶涅槃", "凤凰双重奏", "极空之舞", "凤凰涅槃"],
  1994: ["虎破天穹", "霜魂爆裂", "苍月龙凝", "天地玄霜"],
  1999: ["创星制裁", "光圣穹炮", "翼皇天斩", "星·创世", "星之光辉"],
  2001: ["光明圣佑", "神翼净化", "圣继界限", "无坚不摧", "光之耀", "光之剑"],
  2006: ["日冕爆破", "远古燃烧拳", "不灭神焰", "威吓"],
  2010: ["春木之歌", "永恒之力", "星辰破", "乾坤炮"],
  2011: ["应龙沧海", "古渊巨啸", "怒涛咆哮"],
  2019: ["星宇X斩", "星宇魂魄", "光之斩魄", "乾坤斗转", "光之耀"]
};
const BOSS_CHAIN_CHALLENGE_BY_FINAL_DEX_ID = {
  1915: { firstDexId: 1461, firstName: "苍炎战神", finalName: "真·苍炎战神", finalDamageReduction: 0.3, finalDamageReductionTurns: 3 },
  1916: { firstDexId: 1423, firstName: "噬月武神", finalName: "真·噬月武神", finalDamageReduction: 0.3, finalDamageReductionTurns: 3 },
  1917: { firstDexId: 506, firstName: "烈焰凤凰", finalName: "真·烈焰凤凰", finalDamageReduction: 0.3, finalDamageReductionTurns: 3 },
  1927: { firstDexId: 478, firstName: "赤色梦魇", finalName: "真·赤色梦魇", finalDamageReduction: 0.3, finalDamageReductionTurns: 3 }
};
const BOSS_LOW_HP_FIXED_SKILL = {
  604: { hpRatio: 0.1, skillName: "意念无限" }
};
const BOSS_LOW_HP_FORBIDDEN_SKILLS = {
  1905: [{ hpRatio: 0.5, skillName: "天堂之光" }]
};
const BOSS_WEIGHTED_PREFERRED_SKILL = {
  1927: { skillName: "真·血印", weightMultiplier: 12 }
};
const LEGACY_BOSS_DEX_IDS = new Set([1953]);
const LEGACY_BOSS_NAMES = new Set(["帝皇圣龙"]);
const EXCLUDED_GUARDIAN_NAMES = ["魔灯鬼王"];
const EXCLUDED_BOSS_NAMES = ["冰山修罗", "神照修罗王", "黯天凯撒皇"];
const SHOP_EGG_NAMES = [
  "阿努比斯", "寒冰公主", "花冠公主", "燕尾怪盗", "黑暗守卫", "变异库斯特", "星云大圣", "暗影夜蝠",
  "宇宙侠", "冰霜射手", "爆裂侠", "怒风侠", "天辉侠", "霸气侠", "圣盾奇凌王"
];
const SHOP_EGG_EXCLUDED_NAMES = new Set(["爆裂侠X", "天辉侠X"]);
const SHOP_EGG_EXCLUDED_DEX_IDS = new Set([1767]);
const SHOP_EGG_DEX_IDS = new Set([1736,1746,1782,1834,1645,1678,1680,1728,1881,948,1296,1298,1300,1307,1662]);
const STUDY_BATTLEFIELDS = [
  { key: "atk", label: "攻击", guardianName: "朵朵兔" },
  { key: "spAtk", label: "特攻", guardianName: "闪光河豚" },
  { key: "hp", label: "体力", guardianName: "小花苞" },
  { key: "def", label: "防御", guardianName: "扭扭" },
  { key: "spDef", label: "特防", guardianName: "盼盼" },
  { key: "speed", label: "速度", guardianName: "毛毛球" }
];
const TIME_TUNNEL_OPEN_MAX_FLOOR = 25;
const TIME_TUNNEL_FLOORS = [
  { floor: 1, enemies: [{ dexId: 33, level: 62 }, { dexId: 36, level: 64 }] },
  { floor: 2, enemies: [{ dexId: 54, level: 66 }, { dexId: 60, level: 68 }] },
  { floor: 3, enemies: [{ dexId: 63, level: 70 }, { dexId: 66, level: 72 }] },
  { floor: 4, enemies: [{ dexId: 69, level: 74 }, { dexId: 72, level: 76 }] },
  { floor: 5, enemies: [{ dexId: 81, level: 78 }, { dexId: 461, level: 80 }] },
  { floor: 6, enemies: [{ dexId: 15, level: 82 }, { dexId: 84, level: 84 }] },
  { floor: 7, enemies: [{ dexId: 129, level: 86 }, { dexId: 132, level: 88 }] },
  { floor: 8, enemies: [{ dexId: 141, level: 90 }, { dexId: 153, level: 92 }] },
  { floor: 9, enemies: [{ dexId: 147, level: 94 }, { dexId: 162, level: 96 }] },
  { floor: 10, enemies: [{ dexId: 183, level: 98 }, { dexId: 240, level: 100 }] },
  { floor: 11, enemies: [{ dexId: 168, level: 100 }, { dexId: 180, level: 100 }] },
  { floor: 12, enemies: [{ dexId: 192, level: 100 }, { dexId: 230, level: 100 }] },
  { floor: 13, enemies: [{ dexId: 189, level: 100 }, { dexId: 207, level: 100 }] },
  { floor: 14, enemies: [{ dexId: 208, level: 100 }, { dexId: 212, level: 100 }] },
  { floor: 15, enemies: [{ dexId: 201, level: 100 }, { dexId: 293, level: 100 }] },
  { floor: 16, enemies: [{ dexId: 213, level: 100 }, { dexId: 218, level: 100 }] },
  { floor: 17, enemies: [{ dexId: 220, level: 100 }, { dexId: 221, level: 100 }] },
  { floor: 18, enemies: [{ dexId: 222, level: 100 }, { dexId: 223, level: 100 }] },
  { floor: 19, enemies: [{ dexId: 224, level: 100 }, { dexId: 227, level: 100 }] },
  { floor: 20, enemies: [{ dexId: 249, level: 100 }, { dexId: 296, level: 100 }] },
  { floor: 21, enemies: [{ dexId: 339, level: 100 }, { dexId: 349, level: 100 }] },
  { floor: 22, enemies: [{ dexId: 352, level: 100 }, { dexId: 355, level: 100 }] },
  { floor: 23, enemies: [{ dexId: 346, level: 100 }, { dexId: 358, level: 100 }] },
  { floor: 24, enemies: [{ dexId: 366, level: 100 }, { dexId: 367, level: 100 }] },
  { floor: 25, enemies: [{ dexId: 369, level: 100 }, { dexId: 382, level: 100 }] }
];
const TIME_TUNNEL_FLOOR_20_BONUS_DEX_IDS = new Set([249, 296]);
const TIME_TUNNEL_FLOOR_25_BONUS_DEX_IDS = new Set([369, 382]);
const TIME_TUNNEL_SELECT_FLOORS = Array.from({ length: TIME_TUNNEL_OPEN_MAX_FLOOR }, (_, i) => i + 1);
const TIME_TUNNEL_REWARDS_BY_FLOOR = {
  5: {
    hCoins: 1000,
    items: [
      { id: "double_exp_device", count: 10, label: "双倍经验器" },
      { id: "auto_battle_device", count: 10, label: "自动战斗仪" },
      { id: "time_tunnel_big_exp_fruit", count: 1, label: "大经验果" }
    ]
  },
  10: {
    hCoins: 1500,
    items: [
      { id: "auto_battle_device", count: 10, label: "自动战斗仪" },
      { id: "double_exp_device", count: 10, label: "双倍经验器" },
      { id: "talent_boost_capsule", count: 10, label: "天赋增强胶囊" }
    ]
  },
  15: {
    hCoins: 2000,
    items: [
      { id: "auto_battle_device", count: 20, label: "自动战斗仪" },
      { id: "double_exp_device", count: 20, label: "双倍经验器" },
      { id: "time_tunnel_big_exp_fruit", count: 5, label: "大经验果" },
      { id: "study_reset_fruit", count: 2, label: "学习力清空果实" }
    ]
  },
  20: {
    hCoins: 3000,
    items: [
      { id: "auto_battle_device", count: 20, label: "自动战斗仪" },
      { id: "double_exp_device", count: 20, label: "双倍经验器" },
      { id: "time_tunnel_big_exp_fruit", count: 8, label: "大经验果" },
      { id: "talent_boost_capsule", count: 5, label: "天赋增强胶囊" }
    ]
  },
  25: {
    hCoins: 3500,
    items: [
      { id: "auto_battle_device", count: 25, label: "自动战斗仪" },
      { id: "double_exp_device", count: 25, label: "双倍经验器" },
      { id: "talent_grade_wanzhong_fruit", count: 2, label: "万众瞩目果实" },
      { id: "talent_boost_capsule", count: 6, label: "天赋增强胶囊" }
    ]
  }
};
const TIME_TUNNEL_FIXED_SKILL_CYCLE_BY_DEX_ID = {
  249: ["冰封禁制", "霜冻十里", "寒冰结晶", "天寒地冻", "狂涛骇浪", "龟息"],
  293: ["火之辉耀", "火之净化", "火龙咆哮", "替身术"],
  296: ["寄生种子", "魔高一丈", "魔高一丈", "生命海洋", "肉弹战车", "春木之歌"],
  369: ["虚幻心焰", "火神祝福", "爆炎掌", "巨兽之力", "威吓", "火牙拳"],
  382: ["沙林毒气", "寄生种子", "无双箭", "聚气凝神", "十字四重击", "梦之轮回"]
};
const TIME_TUNNEL_EXTRA_SKILLS_BY_DEX_ID = {
  461: [
    {
      skillId: 17208,
      name: "病毒入侵",
      element: "暗黑系",
      attackTypeCode: 2,
      attackTypeLabel: "属性攻击",
      power: 0,
      pp: 10,
      accuracy: 100,
      desc: "令对手害怕1回合；另外每回合扣除对方单体最大体力值的1/16，无限回合，直至病毒死亡"
    },
    {
      skillId: 17211,
      name: "魔狂暴",
      element: "暗黑系",
      attackTypeCode: 2,
      attackTypeLabel: "属性攻击",
      power: 0,
      pp: 10,
      accuracy: 100,
      desc: "扣除对方剩余体力值的1/2来转化回复自己的体力值"
    },
    {
      skillId: 17212,
      name: "黑洞",
      element: "暗黑系",
      attackTypeCode: 2,
      attackTypeLabel: "属性攻击",
      power: 0,
      pp: 10,
      accuracy: 100,
      desc: "每回合回复自己最大体力值的1/8，无限回合"
    }
  ]
};
const SHOP_EGG_PRICE = 5000;
const LOGIN_BGM_SRC = "./BGM/小k橘子 - 主题公园3.ogg";
const HOME_BGM_SRC = "./BGM/小k橘子 - 神宠殿堂.ogg";
const TIME_TUNNEL_BGM_SRC = "./BGM/小k橘子 - 时空隧道.ogg";
const WAREHOUSE_BGM_SRC = "./BGM/小k橘子 - 家园.ogg";
const SHOP_BGM_SRC = "./BGM/小k橘子 - 经验战场.ogg";
const STUDY_BGM_SRC = "./BGM/小k橘子 - 欢乐岛.ogg";
const DEFAULT_BATTLE_BG_SRC = "./ui/aola-battle-background-default.png";
const STAR_DOMAIN_BATTLE_BG_SRC = "./ui/star_domain.png";
const GUARDIAN_LEVELS = [30, 40, 50, 60, 70, 80, 90, 100];
const EXTRA_GUARDIAN_LEVELS = [100];
const MAX_OPEN_CHALLENGE_DEX_ID = 2020;
const EXTRA_PERSIST_DEX_IDS = new Set([QIXING_ANCIENT_STAR_DRAGON_DEX.rootDexId, QIXING_ANCIENT_STAR_DRAGON_DEX.dexId]);
const canPersistPetDexId = (dexId) => {
  const id = Number(dexId) || 0;
  return (id > 0 && id <= MAX_OPEN_CHALLENGE_DEX_ID) || EXTRA_PERSIST_DEX_IDS.has(id);
};
const isRedeemCodeBonusPetRow = (row) => {
  const id = Number(row && row.dexId) || 0;
  return (id === SHOP_REDEEM_CODE_ALHUB666_DEX_ID || SHOP_REDEEM_CODE_ALHUB666_LEGACY_DEX_IDS.has(id))
    && normalize(row && row.source) === SHOP_REDEEM_CODE_ALHUB666_SOURCE;
};
const isAlhub666CurrentRewardRow = (row) => {
  const id = Number(row && row.dexId) || 0;
  return id === SHOP_REDEEM_CODE_ALHUB666_DEX_ID && normalize(row && row.source) === SHOP_REDEEM_CODE_ALHUB666_SOURCE;
};
const canPersistPetRow = (row) => {
  if (!row) return false;
  return canPersistPetDexId(row.dexId) || isRedeemCodeBonusPetRow(row);
};
const NO_EGG_ACTION_DEX_IDS = new Set([
  116,117,118,119,210,213,216,217,218,219,222,223,224,225,227,237,239,240,241,242,243,244,245,246,247,248,250,251,252,
  269,270,272,301,304,306,307,308,318,319,321,322,324,325,326,327,329,330,331,332,333,334,340,359,360,361,369,399,400,
  401,402,403,404,405,415,419,420,446,447,448,461,462,464,465,466,523,527,609,716,717,735,791,792,808,809,869,888,889,
  892,893,998,999,1000,1001,1087,1088,1089,1090,1283,1310,1617,1835,1836,1885,1886,1929,1930,1979
]);
const canObtainEggByActionDexId = (dexId) => {
  const id = Number(dexId) || 0;
  if (EXTRA_PERSIST_DEX_IDS.has(id)) return true;
  return id > 0 && id <= MAX_OPEN_CHALLENGE_DEX_ID && (!NO_EGG_ACTION_DEX_IDS.has(id) || SHOP_EGG_DEX_IDS.has(id));
};
const canDropEggByActionDexId = (dexId) => {
  const id = Number(dexId) || 0;
  return id > 0 && id <= MAX_OPEN_CHALLENGE_DEX_ID && !NO_EGG_ACTION_DEX_IDS.has(id);
};
const isNoEggActionDexId = (dexId) => NO_EGG_ACTION_DEX_IDS.has(Number(dexId) || 0);
const BATTLE_BGM_SRC = "./BGM/小k橘子 - 战斗 (2015).ogg";
const HATCH_MS = 5 * 60 * 1000;
const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Crect width='120' height='120' rx='24' fill='%23f1f5f9'/%3E%3Ccircle cx='60' cy='48' r='22' fill='%2394a3b8' opacity='0.35'/%3E%3Crect x='24' y='78' width='72' height='14' rx='7' fill='%2394a3b8' opacity='0.35'/%3E%3C/svg%3E";
const ELEMENT_RELATION_IMAGE = "./属性克制.jpg";
const BATTLE_FLOAT_TEXT_DURATION_MS_GLOBAL = 2000;
const BATTLE_PREPARE_MIN_MS = 320;
const BATTLE_PREPARE_STEP_MS = 16;
const ADVANCED_GUARDIAN_STAT_BOOST_RATIO = 0.3;
const BOSS_STAT_BOOST_RATIO = 0.6;
const BOSS_DIFFICULTY_OPTIONS = [
  { key: "normal", label: "普通", fixedHp: 12000, damageReductionRatio: 0.2, statBoostRatio: 0.5, moraleDelta: 0, moraleLabel: "" },
  { key: "hard", label: "困难", fixedHp: 20000, damageReductionRatio: 0.3, statBoostRatio: 0.6, moraleDelta: 1, moraleLabel: "斗志" },
  { key: "nightmare", label: "噩梦", fixedHp: 30000, damageReductionRatio: 0.4, statBoostRatio: 0.8, moraleDelta: 2, moraleLabel: "狂暴斗志" }
];
const BOSS_DIFFICULTY_FIRST_WIN_REWARDS = {
  normal: {
    medalSuffix: "青铜勋章",
    tone: "amber",
    items: [
      { id: "medium_exp_fruit", count: 10, label: "中经验果" },
      { id: "divine_pet_key", count: 5, label: "神宠之匙" }
    ]
  },
  hard: {
    medalSuffix: "白银勋章",
    tone: "slate",
    items: [
      { id: "time_tunnel_big_exp_fruit", count: 10, label: "大经验果" },
      { id: "divine_pet_key", count: 10, label: "神宠之匙" }
    ]
  },
  nightmare: {
    medalSuffix: "黄金勋章",
    tone: "yellow",
    items: [
      { id: "auto_battle_device", count: 10, label: "自动战斗仪" },
      { id: "double_exp_device", count: 10, label: "双倍经验器" },
      { id: "divine_pet_key", count: 15, label: "神宠之匙" }
    ]
  }
};
const SUPER_DICE_BOMB_SKILL_STONE_ITEM_ID = "super_dice_bomb_skill_stone";
const SUPER_DICE_BOMB_STONE_BACKFILL_MIGRATION_KEY = "superDiceBombStoneBackfillV1";
const DICE_KING_DEX_ID = 177;
const NO14_DEX_ID = 1713;
const DICE_BOMB_SKILL_EFFECT_ID = 9204;
const SUPER_DICE_BOMB_SKILL = {
  skillId: 900314,
  skillKey: "超级骰子炸弹#机械系",
  name: "超级骰子炸弹",
  element: "机械系",
  attackType: "属性攻击",
  attackTypeCode: 2,
  attackTypeLabel: "属性攻击",
  type: "机械系/属性攻击",
  power: 0,
  pp: 10,
  accuracy: 70,
  desc: "投掷点数1-6，每回合扣除对方点数×100的体力值，自身回复点数×100的体力值，持续5回合。"
};
const CHALLENGE_MORALE_INTERVAL_TURNS = 10;
const GAMEPLAY_GUIDE_LINES = [
  "欢迎来到Aola Star Hub！",
  "为了欢迎你加入我们，我们为你准备了40级亚比经验果，请去亚比背包的道具栏查看哦~",
  "如果你不知道怎么提升亚比等级，可以打开亚比图鉴，在那里你可以自定义亚比等级，击败选中的亚比就可以获取到经验值和宝贵的H币！",
  "H币可以在亚比商店购买各种功能的道具，你可以按照你的需求购买。",
  "进入学习力战场，你可以通过击败守卫获取对应的学习力值，学习力可以提升亚比的综合能力！",
  "进入时空隧道，你可以开始时空之旅，每过5层可以获得丰厚的奖励！",
  "如果你想挑战更强大的亚比，可以前往挑战之路，在那里有强大的亚比等着你，如果你能击败他们，就可以获得他们的亚比蛋和专属徽章！",
  "现在你应该了解如何游玩Hub了，那么现在，就开始你的Hub之旅吧！"
];
const sceneBattleSpeedFactor = (scene) => 1 / clampBattleSpeed(scene && scene.battleSpeed);
const battleSceneDelayMs = (scene, ms, minMs = 60) => Math.max(minMs, Math.round(Math.max(0, Number(ms) || 0) * sceneBattleSpeedFactor(scene)));

const uid = () => `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const normalize = (s) => String(s || "").replace(/[\u200b\u00a0]/g, "").trim();
const STATIC_PET_IMAGE_FALLBACK = "./pet-img/pet1_1_1_cropped.png";
const petCroppedStaticImage = (dexId) => {
  const id = Math.max(0, Math.floor(Number(dexId) || 0));
  return id > 0 ? `./pet-img/pet${id}_1_1_cropped.png` : STATIC_PET_IMAGE_FALLBACK;
};
const PET_ACTION_SVG_ROOT = "./pet-action";
const petBattleStateCodeByKey = (stateKey) => (
  stateKey === "idle" ? "1" : (stateKey === "hit" ? "2" : (stateKey === "status" ? "6" : "4"))
);
const petBattleSvgImage = (dexId, side = "target", stateKey = "idle") => {
  const id = Math.max(0, Math.floor(Number(dexId) || 0));
  if (id <= 0) return "";
  const sideCode = side === "attacker" || side === "2" ? "2" : "1";
  const stateCode = /^\d+$/.test(String(stateKey || "")) ? String(stateKey) : petBattleStateCodeByKey(stateKey);
  return `${PET_ACTION_SVG_ROOT}/${id}/pet${id}_${sideCode}_${stateCode}.svg`;
};
const WEEKLY_BOSS_HISTORY_BY_KEY = new Map(WEEKLY_BOSS_HISTORY_CONFIGS.map((config) => [normalize(config.key), config]));
const WEEKLY_BOSS_HISTORY_BY_NAME = new Map(WEEKLY_BOSS_HISTORY_CONFIGS.map((config) => [normalize(config.name), config]));
const resolveWeeklyBossHistoryConfig = (rawKey = "", rawRow = null) => {
  const key = normalize(rawKey);
  const row = rawRow && typeof rawRow === "object" ? rawRow : {};
  const bossName = normalize(row.bossName) || normalize(row.guardianName);
  const badgeName = normalize(row.name);
  const byBossName = WEEKLY_BOSS_HISTORY_BY_NAME.get(bossName);
  if (byBossName) return byBossName;
  const byBadgeName = WEEKLY_BOSS_HISTORY_CONFIGS.find((config) => {
    const configName = normalize(config.name);
    return badgeName === normalize(config.honorBadgeName) || (configName.length >= 2 && badgeName.includes(configName));
  });
  return byBadgeName || WEEKLY_BOSS_HISTORY_BY_KEY.get(key) || null;
};
const ensureHttps = (url) => String(url || "").replace(/^http:\/\//i, "https://");
const clampBattleSpeed = (value) => clamp(Math.floor(Number(value) || 1), 1, 4);
const TIME_TUNNEL_ENVIRONMENT_IMAGE_BY_ELEMENT = {
  "木系": "./time-tunnel-environments/木系.png",
  "水系": "./time-tunnel-environments/水系.png",
  "火系": "./time-tunnel-environments/火系.png",
  "土系": "./time-tunnel-environments/土系.png",
  "冰系": "./time-tunnel-environments/冰系.png",
  "电系": "./time-tunnel-environments/电系.png",
  "数码系": "./time-tunnel-environments/数码系.png",
  "机械系": "./time-tunnel-environments/机械系.png",
  "神秘系": "./time-tunnel-environments/神秘系.png",
  "飞行系": "./time-tunnel-environments/飞行系.png",
  "爬行系": "./time-tunnel-environments/爬行系.png",
  "上古系": "./time-tunnel-environments/上古系.png",
  "格斗系": "./time-tunnel-environments/格斗系.png",
  "暗黑系": "./time-tunnel-environments/暗黑系.png",
  "光明系": "./time-tunnel-environments/光明系.png",
  "龙系": "./time-tunnel-environments/龙系.png",
  "圣灵系": "./time-tunnel-environments/圣灵系.png",
  "神兵系": "./time-tunnel-environments/神兵系.png",
  "王系": "./time-tunnel-environments/王系.png"
};
const getTimeTunnelEnvironmentImage = (element) => TIME_TUNNEL_ENVIRONMENT_IMAGE_BY_ELEMENT[normalize(element)] || TIME_TUNNEL_ENVIRONMENT_IMAGE_BY_ELEMENT["木系"];
let TIME_TUNNEL_ENVIRONMENT_BY_ELEMENT = null;
const randomTimeTunnelEnvironment = () => {
  const pool = TIME_TUNNEL_ENVIRONMENTS_ACTIVE.filter((env) => env.element !== "未知系");
  const cfg = pool[Math.floor(Math.random() * pool.length)] || pool[0];
  if (!TIME_TUNNEL_ENVIRONMENT_BY_ELEMENT) {
    TIME_TUNNEL_ENVIRONMENT_BY_ELEMENT = Object.fromEntries(TIME_TUNNEL_ENVIRONMENTS_ACTIVE.map((env) => [env.element, { ...env, image: getTimeTunnelEnvironmentImage(env.element) }]));
  }
  return TIME_TUNNEL_ENVIRONMENT_BY_ELEMENT[cfg.element] || { ...cfg, image: getTimeTunnelEnvironmentImage(cfg.element) };
};
const getTimeTunnelBattleAnimSrc = (dexId) => {
  const id = Number(dexId) || 0;
  return id > 0 ? petBattleSvgImage(id, "target", "idle") : PLACEHOLDER;
};
const clearBattleFloatTextIfExpired = (scene, force = false) => {
  if (!scene) return false;
  if (!force && Date.now() < (Number(scene._floatTextUntil) || 0)) return false;
  scene.fxDamageText = "";
  scene.damageOnAttacker = "";
  scene.damageOnTarget = "";
  scene.healOnAttacker = "";
  scene.healOnTarget = "";
  scene.damageTagOnAttacker = "";
  scene.damageTagOnTarget = "";
  scene.actionNoticeOnAttacker = "";
  scene.actionNoticeOnTarget = "";
  scene.critOnAttacker = false;
  scene.critOnTarget = false;
  scene.ppOnAttacker = "";
  scene.ppOnTarget = "";
  scene.comboHitsOnAttacker = [];
  scene.comboHitsOnTarget = [];
  scene.comboTotalOnAttacker = "";
  scene.comboTotalOnTarget = "";
  scene.comboTotalDelayOnAttacker = 0;
  scene.comboTotalDelayOnTarget = 0;
  scene._floatTextUntil = 0;
  if (scene._floatTextTimer) {
    clearTimeout(scene._floatTextTimer);
    scene._floatTextTimer = null;
  }
  return true;
};
    const showBattleActionNotice = (scene, side, text) => {
  if (!scene || !text) return;
  clearBattleFloatTextIfExpired(scene, true);
  if (side === "attacker") scene.actionNoticeOnAttacker = text;
  else scene.actionNoticeOnTarget = text;
  markBattleFloatText(scene);
};
const markBattleFloatText = (scene) => {
  if (!scene) return;
  const duration = battleSceneDelayMs(scene, BATTLE_FLOAT_TEXT_DURATION_MS_GLOBAL);
  scene._floatTextUntil = Date.now() + duration;
  if (scene._floatTextTimer) clearTimeout(scene._floatTextTimer);
  scene._floatTextTimer = setTimeout(() => {
    clearBattleFloatTextIfExpired(scene);
  }, duration + 60);
};
const markBattleDefeatVisualHold = (scene, ratio = 0.72) => {
  if (!scene) return;
  const duration = battleSceneDelayMs(scene, BATTLE_FLOAT_TEXT_DURATION_MS_GLOBAL * ratio);
  scene._defeatVisualHoldUntil = Math.max(Number(scene._defeatVisualHoldUntil) || 0, Date.now() + duration);
};
const markBattleDefeatVisualHoldMs = (scene, ms) => {
  if (!scene) return;
  const duration = battleSceneDelayMs(scene, ms);
  scene._defeatVisualHoldUntil = Math.max(Number(scene._defeatVisualHoldUntil) || 0, Date.now() + duration);
};
const markBattleVisualHoldMs = (scene, ms) => {
  if (!scene) return;
  const duration = battleSceneDelayMs(scene, ms);
  const until = Date.now() + duration;
  scene._battleVisualUntil = Math.max(Number(scene._battleVisualUntil) || 0, until);
  scene._defeatVisualHoldUntil = Math.max(Number(scene._defeatVisualHoldUntil) || 0, until);
};
const markBattleVisualHoldFrom = (scene, startedAt, ms) => {
  if (!scene) return;
  const base = Number(startedAt) || Date.now();
  const until = base + battleSceneDelayMs(scene, ms);
  scene._battleVisualUntil = Math.max(Number(scene._battleVisualUntil) || 0, until);
  scene._defeatVisualHoldUntil = Math.max(Number(scene._defeatVisualHoldUntil) || 0, until);
};
const showBattleStageChangeFx = (scene, side, direction, delayMs = 0) => {
  if (!scene || scene.ended) return;
  const safeSide = side === "target" ? "target" : "attacker";
  const safeDirection = direction === "down" ? "down" : "up";
  const seq = Date.now() + Math.random();
  const durationMs = 1550;
  const applyFx = () => {
    if (!scene || scene.ended) return;
    const current = scene.stageChangeFx && typeof scene.stageChangeFx === "object" ? scene.stageChangeFx : {};
    scene.stageChangeFx = {
      ...current,
      [safeSide]: {
        side: safeSide,
        direction: safeDirection,
        src: safeDirection === "down" ? BATTLE_STAGE_DOWN_FX_SRC : BATTLE_STAGE_UP_FX_SRC,
        seq
      }
    };
    setTimeout(() => {
      if (!scene || !scene.stageChangeFx || !scene.stageChangeFx[safeSide] || scene.stageChangeFx[safeSide].seq !== seq) return;
      scene.stageChangeFx = { ...scene.stageChangeFx, [safeSide]: null };
    }, battleSceneDelayMs(scene, durationMs, 500) + 80);
  };
  const delay = battleSceneDelayMs(scene, Math.max(0, Number(delayMs) || 0), 0);
  markBattleVisualHoldMs(scene, delay + durationMs);
  if (delay > 0) setTimeout(applyFx, delay);
  else applyFx();
};
const showBattleStageTotalChangeFx = (scene, beforeTotals, delayMs = 0) => {
  if (!scene || !beforeTotals) return;
  const afterTotals = battleStageTotalsSnapshot(scene);
  ["attacker", "target"].forEach((side) => {
    const before = Math.floor(Number(beforeTotals[side]) || 0);
    const after = Math.floor(Number(afterTotals[side]) || 0);
    if (after > before) showBattleStageChangeFx(scene, side, "up", delayMs);
    else if (after < before) showBattleStageChangeFx(scene, side, "down", delayMs);
  });
};
const showBattleMoraleStatusFx = (scene, side, labelOrKey, displayLabel = "", durationMs = 1400) => {
  if (!scene || scene.ended) return false;
  const safeSide = side === "target" ? "target" : "attacker";
  const label = normalize(displayLabel) || normalize(labelOrKey) || "斗志";
  const seq = Date.now() + Math.random();
  if (scene.statusEffectFx && scene.statusEffectFx.side === safeSide) scene.statusEffectFx = null;
  scene.moraleEffectFx = {
    side: safeSide,
    src: assetSrcWithQuery(getBattleMoraleFxSrcByLabel(labelOrKey || label), "fx", seq),
    label,
    morale: true,
    seq,
    durationMs: battleSceneDelayMs(scene, durationMs, 240)
  };
  scene._battleMoraleUntil = Date.now() + scene.moraleEffectFx.durationMs + 120;
  markBattleFloatText(scene);
  markBattleVisualHoldMs(scene, scene.moraleEffectFx.durationMs);
  setTimeout(() => {
    if (!scene || !scene.moraleEffectFx || scene.moraleEffectFx.seq !== seq) return;
    scene.moraleEffectFx = null;
  }, scene.moraleEffectFx.durationMs + 120);
  return true;
};
const battleVisualHoldUntil = (scene) => Math.max(
  Number(scene && scene._battleVisualUntil) || 0,
  Number(scene && scene._defeatVisualHoldUntil) || 0,
  Number(scene && scene._skillEffectUntil) || 0,
  Number(scene && scene._floatTextUntil) || 0
);
const runAfterBattleVisuals = (scene, fn, minDelayMs = 0) => {
  if (!scene || typeof fn !== "function") return;
  const earliestAt = Date.now() + battleSceneDelayMs(scene, minDelayMs, 0);
  const wait = () => {
    if (!scene || scene.ended) return;
    const delay = Math.max(0, earliestAt - Date.now(), battleVisualHoldUntil(scene) - Date.now());
    if (delay > 0) {
      setTimeout(wait, delay);
      return;
    }
    fn();
  };
  wait();
};
const resetBattleVisualHold = (scene) => {
  if (!scene) return;
  scene._battleVisualUntil = 0;
  scene._defeatVisualHoldUntil = 0;
  scene._skillEffectUntil = 0;
};
const queueAfterDamageFloat = (scene, fn) => {
  if (!scene || typeof fn !== "function") return;
  if (!Array.isArray(scene._afterDamageFloatQueue)) scene._afterDamageFloatQueue = [];
  scene._afterDamageFloatQueue.push(fn);
};
const flushAfterDamageFloat = (scene) => {
  if (!scene || !Array.isArray(scene._afterDamageFloatQueue) || scene._afterDamageFloatQueue.length === 0) return;
  const queue = scene._afterDamageFloatQueue.splice(0);
  setTimeout(() => {
    if (!scene || scene.ended) return;
    queue.forEach((fn) => {
      try { fn(); } catch (_) {}
    });
  }, battleSceneDelayMs(scene, BATTLE_FLOAT_TEXT_DURATION_MS_GLOBAL * 0.35, 60));
};
const resolveGuardianName = (name) => EXTRA_GUARDIAN_ALIAS[normalize(name)] || normalize(name);
const isExtraGuardianName = (name) => EXTRA_GUARDIAN_NAMES.includes(resolveGuardianName(name));
const isExcludedGuardianName = (name) => EXCLUDED_GUARDIAN_NAMES.includes(resolveGuardianName(name));
const isGuardianName = (name) => !isExcludedGuardianName(name) && GUARDIAN_NAMES.includes(resolveGuardianName(name));
const resolveBossName = (name) => {
  const raw = normalize(name);
  if (EXCLUDED_BOSS_NAMES.includes(raw)) return raw;
  if (BOSS_NAMES.includes(raw)) return raw;
  return BOSS_NAMES.find((boss) => boss.length >= 2 && raw.includes(boss)) || raw;
};
const isExcludedBossName = (name) => EXCLUDED_BOSS_NAMES.includes(normalize(name));
const isBossName = (name) => !isExcludedBossName(name) && BOSS_NAMES.includes(resolveBossName(name));
const isBossDexId = (dexId) => {
  const id = Number(dexId) || 0;
  return !EXCLUDED_BOSS_DEX_IDS.has(id) && BOSS_DEX_ID_TO_NAME.has(id);
};
const isBossEntry = (entry) => {
  if (!entry) return false;
  if (EXCLUDED_BOSS_DEX_IDS.has(Number(entry.dexId) || 0)) return false;
  if (isBossDexId(entry.dexId)) return true;
  return isBossName(entry.name);
};
const isLegacyBossEntry = (entry) => {
  if (!entry) return false;
  return LEGACY_BOSS_DEX_IDS.has(Number(entry.dexId) || 0) || LEGACY_BOSS_NAMES.has(normalize(entry.name));
};
const isWeeklyBossEntry = (entry) => {
  if (!entry) return false;
  return Number(entry.dexId) === Number(WEEKLY_BOSS_CONFIG.dexId) || normalize(entry.name) === normalize(WEEKLY_BOSS_CONFIG.name);
};
const resolveShopEggName = (name) => {
  const raw = normalize(name);
  if (SHOP_EGG_NAMES.includes(raw)) return raw;
  return SHOP_EGG_NAMES.find((pet) => pet.length >= 2 && raw.includes(pet)) || raw;
};
const isShopEggName = (name) => SHOP_EGG_NAMES.includes(resolveShopEggName(name));
const isShopEggEntry = (entry) => {
  if (!entry) return false;
  const id = Number(entry.dexId) || 0;
  if (SHOP_EGG_EXCLUDED_DEX_IDS.has(id)) return false;
  if (SHOP_EGG_EXCLUDED_NAMES.has(normalize(entry.name))) return false;
  return SHOP_EGG_DEX_IDS.has(id) || isShopEggName(entry.name);
};
const STUDY_FRUIT_KEY_BY_ITEM_ID = {
  study_hp_fruit: "hp",
  study_atk_fruit: "atk",
  study_spAtk_fruit: "spAtk",
  study_def_fruit: "def",
  study_spDef_fruit: "spDef",
  study_speed_fruit: "speed"
};
const normalizeElementName = (element) => {
  let raw = normalize(element);
  if (raw) {
    raw = raw.replace(/\uFFFD/g, "系");
    raw = raw.replace(/^\?$/, "?系");
    raw = raw.replace(/(木|水|火|土|冰|电|机械|数码|神秘|飞行|爬行|上古|格斗|暗黑|光明|龙|圣灵|神兵|王|普通|毒)$/, "$1系");
    raw = raw.replace(/系系$/g, "系");
  }
  if (!raw) return "";
  if (PET_TYPE_ICON[raw]) return raw;
  const alias = {
    "木": "木系",
    "水": "水系",
    "火": "火系",
    "土": "土系",
    "冰": "冰系",
    "电": "电系",
    "神秘": "神秘系",
    "机械": "机械系",
    "飞行": "飞行系",
    "爬行": "爬行系",
    "上古": "上古系",
    "格斗": "格斗系",
    "暗黑": "暗黑系",
    "光明": "光明系",
    "龙": "龙系",
    "圣灵": "圣灵系",
    "神兵": "神兵系",
    "王": "王系",
    "普通": "普通系",
    "毒": "毒系",
    "超暗系": "暗黑系",
    "超木系": "木系",
    "超水系": "水系",
    "超火系": "火系",
    "超土系": "土系",
    "超电系": "电系",
    "超上古系": "上古系"
  };
  if (alias[raw]) return alias[raw];
  if (raw === "超光系") return "光明系";
  if (!raw.endsWith("系")) {
    const withXi = `${raw}系`;
    if (PET_TYPE_ICON[withXi]) return withXi;
  }
  return raw;
};

const PET_TYPE_ICON = {
  "木系": "./type/木系.png",
  "水系": "./type/水系.png",
  "火系": "./type/火系.png",
  "土系": "./type/土系.png",
  "冰系": "./type/冰系.png",
  "电系": "./type/电系.png",
  "数码系": "./type/数码系.png",
  "机械系": "./type/机械系.png",
  "神秘系": "./type/神秘系.png",
  "飞行系": "./type/飞行系.png",
  "爬行系": "./type/爬行系.png",
  "上古系": "./type/上古系.png",
  "格斗系": "./type/格斗系.png",
  "暗黑系": "./type/暗黑系.png",
  "光明系": "./type/光明系.png",
  "龙系": "./type/龙系.png",
  "圣灵系": "./type/圣灵系.png",
  "神兵系": "./type/神兵系.png",
  "王系": "./type/王系.png",
  "普通系": "./type/普通系.png",
  "毒系": "./type/毒系.png",
  "?系": "",
  "未知系": ""
};
const PET_TYPE_TRANSPARENT_ICON = Object.fromEntries(
  Object.entries(PET_TYPE_ICON).map(([key, src]) => [key, String(src || "").replace("./type/", "./type-transparent/")])
);

const ELEMENT_CHART = {
  "水系": { strong: ["火系", "土系", "爬行系"], weak: ["上古系", "木系"] },
  "火系": { strong: ["冰系", "机械系", "木系"], weak: ["水系", "上古系", "光明系"] },
  "木系": { strong: ["土系", "水系", "爬行系", "光明系"], weak: ["火系", "上古系", "飞行系", "机械系"] },
  "冰系": { strong: ["上古系", "飞行系", "木系"], weak: ["火系", "水系", "机械系"] },
  "土系": { strong: ["火系", "冰系", "飞行系"], weak: ["机械系", "爬行系", "格斗系"] },
  "电系": { strong: ["水系", "飞行系"], weak: ["木系", "上古系", "光明系"], immune: ["爬行系"] },
  "爬行系": { strong: ["火系", "机械系", "土系", "电系"], weak: ["木系"], immune: ["飞行系"] },
  "飞行系": { strong: ["木系", "格斗系"], weak: ["电系", "土系", "机械系"] },
  "机械系": { strong: ["冰系", "土系"], weak: ["水系", "火系"] },
  "数码系": { strong: ["神秘系"], weak: ["机械系", "暗黑系", "光明系"] },
  "上古系": { strong: ["上古系"], weak: ["机械系"] },
  "神秘系": { strong: ["格斗系"], weak: ["机械系", "神秘系"], immune: ["暗黑系"] },
  "格斗系": { strong: ["冰系", "土系", "机械系", "暗黑系"], weak: ["飞行系", "神秘系"], immune: ["数码系"] },
  "暗黑系": { strong: ["神秘系", "数码系"], weak: ["格斗系", "光明系"] },
  "光明系": { strong: ["神秘系", "数码系", "暗黑系"], weak: ["木系", "土系", "冰系", "机械系"] }
};
// 仅补充圣灵、神兵、王三系相关格子，现有系别之间的倍率继续由 ELEMENT_CHART 决定。
const ELEMENT_CHART_ADDITION = {
  "格斗系": { weak: ["圣灵系"] },
  "爬行系": { strong: ["神兵系"] },
  "土系": { weak: ["王系"] },
  "数码系": { strong: ["圣灵系", "王系"] },
  "机械系": { weak: ["圣灵系", "神兵系", "王系"] },
  "火系": { strong: ["圣灵系"], weak: ["王系"] },
  "水系": { weak: ["王系"] },
  "木系": { weak: ["王系"] },
  "电系": { strong: ["王系"] },
  "暗黑系": { strong: ["神兵系"] },
  "光明系": { weak: ["圣灵系"] },
  "龙系": { weak: ["神兵系"] },
  "圣灵系": { strong: ["机械系", "光明系"], weak: ["电系", "神秘系"] },
  "神兵系": { strong: ["格斗系", "火系", "龙系"], weak: ["爬行系"] },
  "王系": { strong: ["上古系", "神兵系"], weak: ["数码系", "光明系"] }
};
const readElementChartFactor = (chart, defenderElement) => {
  if (!chart) return null;
  if ((chart.immune || []).includes(defenderElement)) return 0;
  if ((chart.strong || []).includes(defenderElement)) return 2;
  if ((chart.weak || []).includes(defenderElement)) return 0.5;
  return null;
};
const getElementFactor = (attackerElement, defenderElement) => {
  const atk = normalize(attackerElement) || "未知系";
  const def = normalize(defenderElement) || "未知系";
  const additionFactor = readElementChartFactor(ELEMENT_CHART_ADDITION[atk], def);
  if (additionFactor !== null) return additionFactor;
  const originalFactor = readElementChartFactor(ELEMENT_CHART[atk], def);
  return originalFactor === null ? 1 : originalFactor;
};
const getElementList = (mainElement, subElement = "") => {
  const out = [];
  [mainElement, subElement].forEach((element) => {
    const normalized = normalizeElementName(element);
    if (normalized && normalized !== "未知系" && !out.includes(normalized)) out.push(normalized);
  });
  return out;
};
const getElementFactorAgainstElements = (attackerElement, defenderElements) => {
  const elements = Array.isArray(defenderElements) ? defenderElements : [defenderElements];
  const list = getElementList(elements[0], elements[1]);
  if (list.length <= 0) return getElementFactor(attackerElement, "");
  return list.reduce((factor, element) => factor * getElementFactor(attackerElement, element), 1);
};
const getBattleHitRateBoostFactor = (scene, side, targetSide, skillElement) => {
  let factor = 1;
  const targetElements = side === "attacker"
    ? getElementList(scene.targetElement, scene.targetSubElement)
    : getElementList(scene.attackerElement, scene.attackerSubElement);
  if (targetElements.includes("飞行系")) factor *= 0.95;
  return factor;
};

const expRequired = (level) => (level >= 100 ? Infinity : Math.floor(60 + level * 18 + Math.pow(level, 1.45) * 8));
const calcWinExp = (targetLevel) => {
  const lv = clamp(Number(targetLevel) || 1, 1, 100);
  return Math.floor(80 + lv * 28 + lv * lv * 1.9);
};
const calcLoseExp = () => 0;

const normalizeBagIds = (rawIds, activePets) => {
  const validIds = new Set(activePets.map((p) => p.id));
  const out = [];
  const seen = new Set();
  (Array.isArray(rawIds) ? rawIds : []).forEach((id) => {
    const sid = String(id || "");
    if (!sid || !validIds.has(sid) || seen.has(sid)) return;
    seen.add(sid);
    out.push(sid);
  });
  while (out.length < 6) out.push("");
  return out.slice(0, 6);
};

const sanitizeBattleLog = (rawList) => {
  if (!Array.isArray(rawList)) return [];
  return rawList.map((row) => {
    const item = row && typeof row === "object" ? row : {};
    return {
      id: String(item.id || uid()),
      win: Boolean(item.win),
      attacker: normalize(item.attacker),
      attackerLevel: clamp(Number(item.attackerLevel) || 1, 1, 100),
      target: normalize(item.target),
      targetLevel: clamp(Number(item.targetLevel) || 1, 1, 100),
      expGain: Math.max(0, Number(item.expGain) || 0),
      time: normalize(item.time)
    };
  }).filter((row) => row.attacker || row.target).slice(0, 50);
};

const buildFallbackSpecies = (dexEntry) => {
  const name = dexEntry.name;
  const img = ensureHttps(dexEntry.image);
  return {
    forms: [
      { name: `${name}·初阶`, img },
      { name: `${name}·进阶`, img },
      { name, img }
    ],
    skills: [
      { name: `${name}冲击`, level: 1, power: 95, pp: 20, type: "普通系/普通攻击", desc: "基础伤害。" },
      { name: `${name}能量炮`, level: 8, power: 120, pp: 15, type: "神秘系/特殊攻击", desc: "攻击敌方单体。" },
      { name: `${name}守护`, level: 16, power: -1, pp: 10, type: "普通系/属性攻击", desc: "提升自身防御。" },
      { name: `${name}裂风斩`, level: 32, power: 180, pp: 8, type: "飞行系/普通攻击", desc: "中高威力输出。" },
      { name: `${name}终焰星陨`, level: 56, power: 300, pp: 4, type: "神秘系/特殊攻击", desc: "终结技能。" }
    ]
  };
};

const petId = (pet) => String((pet && pet.id) || "");
const eggId = (egg) => String((egg && egg.id) || "");
const rowId = (row) => String((row && row.id) || uid());
const safeSkillName = (skill) => String((skill && skill.name) || "");
const safeSkillType = (skill) => String((skill && skill.type) || "");
const safeSkillPower = (skill) => (skill && Number.isFinite(Number(skill.power)) ? Number(skill.power) : 0);
const safeSkillPP = (skill) => (skill && Number.isFinite(Number(skill.pp)) ? Number(skill.pp) : 0);
const safeSkillPPMax = (skill) => {
  const max = Number(skill && (skill.maxPp ?? skill.maxPP ?? skill.ppMax ?? skill.pp));
  return Number.isFinite(max) ? max : 0;
};
const safeSkillAccuracy = (skill) => {
  const n = skill && Number.isFinite(Number(skill.accuracy)) ? Number(skill.accuracy) : 100;
  return n < 0 ? 100 : n;
};
const skillAttackTypeLabel = (skillOrType) => {
  const skill = skillOrType && typeof skillOrType === "object" ? skillOrType : null;
  if (skill) {
    skillAttackTypeVersion.value;
    const indexedCode = lookupAttackTypeCode(skill, skill.dexId);
    const explicit = attackTypeLabelFromCode(skill.attackTypeCode) || attackTypeLabelFromCode(indexedCode) || normalize(skill.attackTypeLabel) || normalize(skill.attackType);
    if (explicit) return explicit;
    const parsed = parseSkillTypeMeta(skill.type).attackType || "";
    const power = Number(skill.power);
    const desc = normalize(skill.desc);
    if (Number.isFinite(power) && power <= 0 && !/(固定伤害|伤害\s*=|点伤害|威力|造成伤害)/.test(desc)) return "属性攻击";
    return parsed || "普通攻击";
  }
  return parseSkillTypeMeta(skillOrType).attackType || "普通攻击";
};
const skillDisplayDesc = (skill) => {
  const name = normalize(skill && skill.name).replace(/决/g, "诀");
  if (name === "锁神诀") return "100％命中，每回合减血1/16，持续5回合，并且令敌方1体速度下降1级，对BOSS有效；一场战斗只能使用一次，使用PP豆无法再次使用。";
  if (name === "激发力量") return "攻击对方单体，若自己中毒、麻痹或烧伤时，则发动2倍威力。";
  if (name === "闇月马戏团") return "50%的概率削弱对方单体攻击和特攻各1级。";
  if (name === "超级骰子炸弹") return SUPER_DICE_BOMB_SKILL.desc;
  return normalize(skill && skill.desc) || "暂无技能描述";
};
const normalizeSkillKey = (name) => normalize(name);
const oncePerBattleSkillKey = (skillOrName) => {
  const name = normalize(typeof skillOrName === "string" ? skillOrName : (skillOrName && skillOrName.name)).replace(/决/g, "诀");
  return name === "锁神诀" ? "锁神诀" : "";
};
const hasUsedOncePerBattleSkill = (scene, side, skillOrName) => {
  const key = oncePerBattleSkillKey(skillOrName);
  if (!scene || !key) return false;
  const used = Array.isArray(scene.oncePerBattleSkillKeys) ? scene.oncePerBattleSkillKeys : [];
  return used.includes(`${side}:${key}`);
};
const markOncePerBattleSkillUsed = (scene, side, skillOrName) => {
  const key = oncePerBattleSkillKey(skillOrName);
  if (!scene || !key) return;
  if (!Array.isArray(scene.oncePerBattleSkillKeys)) scene.oncePerBattleSkillKeys = [];
  const scoped = `${side}:${key}`;
  if (!scene.oncePerBattleSkillKeys.includes(scoped)) scene.oncePerBattleSkillKeys.push(scoped);
};
const DIMINISHING_SKILL_SUCCESS_CHANCES = [1, 0.4, 0.1, 0];
const rollDiminishingSkillSuccess = (scene, side, skillOrName) => {
  const key = normalizeSkillKey(typeof skillOrName === "string" ? skillOrName : (skillOrName && skillOrName.name));
  if (!scene || !key) return { success: true, chance: 1, useNo: 1 };
  if (!scene.diminishingSkillUseCounts || typeof scene.diminishingSkillUseCounts !== "object") scene.diminishingSkillUseCounts = {};
  const scoped = `${side}:${key}`;
  const used = Math.max(0, Math.floor(Number(scene.diminishingSkillUseCounts[scoped]) || 0));
  const chance = DIMINISHING_SKILL_SUCCESS_CHANCES[Math.min(used, DIMINISHING_SKILL_SUCCESS_CHANCES.length - 1)];
  scene.diminishingSkillUseCounts[scoped] = used + 1;
  return { success: Math.random() <= chance, chance, useNo: used + 1 };
};
const safeNonNegInt = (v, fallback = 0) => {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) return fallback;
  return Math.floor(n);
};
const STAT_KEYS = ["atk", "hp", "spAtk", "def", "spDef", "speed"];
const createZeroStats = () => ({ hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, speed: 0 });
const randInt = (min, max) => {
  const a = Math.floor(Number(min) || 0);
  const b = Math.floor(Number(max) || 0);
  if (b <= a) return a;
  return a + Math.floor(Math.random() * (b - a + 1));
};
const createRandomHatchTalent = () => ({
  hp: randInt(1, 52),
  atk: randInt(1, 52),
  def: randInt(1, 52),
  spAtk: randInt(1, 52),
  spDef: randInt(1, 52),
  speed: randInt(1, 52)
});
const createBiasedRandomTalent = (useCount = 0) => {
  const bonus = clamp(Math.floor(Number(useCount) || 0), 0, 40);
  const floor = clamp(1 + Math.floor(bonus / 2), 1, 42);
  const boostChance = clamp(0.15 + bonus * 0.025, 0.15, 0.85);
  const roll = () => {
    const base = randInt(floor, 52);
    if (Math.random() >= boostChance) return base;
    return clamp(base + randInt(1, 10 + Math.floor(bonus / 2)), 1, 62);
  };
  return { hp: roll(), atk: roll(), def: roll(), spAtk: roll(), spDef: roll(), speed: roll() };
};
const talentTotal = (talent) => STAT_KEYS.reduce((sum, key) => sum + (Math.max(0, Number(talent && talent[key]) || 0)), 0);
const createTalentRerollByTotalDelta = (rawTalent, useCount = 1) => {
  const before = normalizeTalent(rawTalent);
  const useNo = Math.max(1, Math.floor(Number(useCount) || 1));
  const improveChance = useNo <= 1 ? 0.6 : (useNo === 2 ? 0.8 : 1);
  const preferImprove = Math.random() <= improveChance;
  let desiredDelta = preferImprove ? randInt(1, 8) : randInt(-5, 0);
  const currentTotal = talentTotal(before);
  desiredDelta = clamp(desiredDelta, -Math.min(5, currentTotal), Math.min(8, 62 * STAT_KEYS.length - currentTotal));
  const targetTotal = clamp(currentTotal + desiredDelta, 0, 62 * STAT_KEYS.length);
  const next = createZeroStats();
  const keys = STAT_KEYS.slice();
  for (let i = keys.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = keys[i];
    keys[i] = keys[j];
    keys[j] = tmp;
  }
  let remaining = targetTotal;
  keys.forEach((key, idx) => {
    const slotsLeft = keys.length - idx - 1;
    const minVal = Math.max(0, remaining - slotsLeft * 62);
    const maxVal = Math.min(62, remaining);
    const value = idx === keys.length - 1 ? remaining : randInt(minVal, maxVal);
    next[key] = clamp(value, 0, 62);
    remaining -= next[key];
  });
  if (talentTotal(next) !== targetTotal) {
    let fix = targetTotal - talentTotal(next);
    while (fix !== 0) {
      const candidates = STAT_KEYS.filter((key) => fix > 0 ? next[key] < 62 : next[key] > 0);
      if (candidates.length === 0) break;
      const key = candidates[Math.floor(Math.random() * candidates.length)];
      next[key] = clamp(next[key] + (fix > 0 ? 1 : -1), 0, 62);
      fix += fix > 0 ? -1 : 1;
    }
  }
  return normalizeTalent(next);
};
const raiseTalentTotalToAtLeast = (rawTalent, targetTotal) => {
  const next = normalizeTalent(rawTalent);
  const goal = clamp(Math.floor(Number(targetTotal) || 0), 0, 62 * STAT_KEYS.length);
  let remaining = Math.max(0, goal - talentTotal(next));
  let cursor = 0;
  while (remaining > 0) {
    const candidates = STAT_KEYS.filter((key) => Number(next[key]) < 62);
    if (candidates.length === 0) break;
    const key = candidates[cursor % candidates.length];
    const room = Math.max(0, 62 - Number(next[key]));
    const add = Math.min(room, remaining);
    next[key] = clamp(Number(next[key]) + add, 0, 62);
    remaining -= add;
    cursor += 1;
  }
  return normalizeTalent(next);
};
const talentGradeByTotal = (total) => {
  const t = Math.max(0, Number(total) || 0);
  if (t >= 372) return "唯我独尊";
  if (t >= 360) return "天下无双";
  if (t >= 300) return "王者无敌";
  if (t >= 240) return "万众瞩目";
  if (t >= 180) return "千载难逢";
  if (t >= 120) return "百里挑一";
  if (t >= 60) return "十分常见";
  return "一无是处";
};
const TALENT_GRADE_IMAGE_NAMES = ["一无是处", "十分常见", "百里挑一", "千载难逢", "万众瞩目", "王者无敌", "天下无双", "唯我独尊"];
const talentGradeImageSrc = (grade) => {
  const name = TALENT_GRADE_IMAGE_NAMES.includes(normalize(grade)) ? normalize(grade) : "一无是处";
  return `./ui/${name}.png`;
};
const createUniformTalent30 = () => ({ hp: 30, atk: 30, def: 30, spAtk: 30, spDef: 30, speed: 30 });
const createUniformTalent50 = () => ({ hp: 50, atk: 50, def: 50, spAtk: 50, spDef: 50, speed: 50 });
const createUniformTalent60 = () => ({ hp: 60, atk: 60, def: 60, spAtk: 60, spDef: 60, speed: 60 });
const createGuardianStudy = () => ({ hp: 0, atk: 102, def: 102, spAtk: 102, spDef: 102, speed: 102 });
const normalizeTalent = (raw) => {
  const s = raw && typeof raw === "object" ? raw : {};
  return {
    hp: clamp(safeNonNegInt(s.hp), 0, 62),
    atk: clamp(safeNonNegInt(s.atk), 0, 62),
    def: clamp(safeNonNegInt(s.def), 0, 62),
    spAtk: clamp(safeNonNegInt(s.spAtk), 0, 62),
    spDef: clamp(safeNonNegInt(s.spDef), 0, 62),
    speed: clamp(safeNonNegInt(s.speed), 0, 62)
  };
};
const normalizeStudy = (raw, protectKey = "") => {
  const s = raw && typeof raw === "object" ? raw : {};
  const protectedKey = STAT_KEYS.includes(protectKey) ? protectKey : "";
  const out = {
    hp: clamp(safeNonNegInt(s.hp), 0, 255),
    atk: clamp(safeNonNegInt(s.atk), 0, 255),
    def: clamp(safeNonNegInt(s.def), 0, 255),
    spAtk: clamp(safeNonNegInt(s.spAtk), 0, 255),
    spDef: clamp(safeNonNegInt(s.spDef), 0, 255),
    speed: clamp(safeNonNegInt(s.speed), 0, 255)
  };
  let total = out.hp + out.atk + out.def + out.spAtk + out.spDef + out.speed;
  if (total <= 510) return out;
  // 官方学习力总和上限 510；有当前编辑项时优先保留它，避免新学习力把旧学习力挤回退。
  for (const k of ["speed", "spDef", "def", "spAtk", "atk", "hp"]) {
    if (total <= 510) break;
    if (k === protectedKey) continue;
    const cut = Math.min(out[k], total - 510);
    out[k] -= cut;
    total -= cut;
  }
  if (total > 510 && protectedKey) {
    const cut = Math.min(out[protectedKey], total - 510);
    out[protectedKey] -= cut;
  }
  return out;
};
const studyTotal = (study) => {
  const s = normalizeStudy(study);
  return STAT_KEYS.reduce((sum, key) => sum + (Number(s[key]) || 0), 0);
};
const calcAbilityStat = (base, talent, study, level, nature = 1) => {
  const b = safeNonNegInt(base);
  const t = clamp(safeNonNegInt(talent), 0, 62);
  const ev = clamp(safeNonNegInt(study), 0, 255);
  const lv = clamp(safeNonNegInt(level, 1), 1, 100);
  const n = Number(nature);
  const natureVal = Number.isFinite(n) ? n : 1;
  // 对齐 4399 奥拉星计算器：floor( floor(core * 2) * nature )
  const core = ((b * 2 + t + Math.floor(ev / 4)) * lv) / 100 + 5;
  return Math.floor(Math.floor(core * 2) * natureVal);
};
const calcAbilityHp = (base, talent, study, level) => {
  const b = safeNonNegInt(base);
  const t = clamp(safeNonNegInt(talent), 0, 62);
  const ev = clamp(safeNonNegInt(study), 0, 255);
  const lv = clamp(safeNonNegInt(level, 1), 1, 100);
  // 对齐 4399 奥拉星计算器：floor((core + level + 10) * 2)
  const core = ((b * 2 + t + Math.floor(ev / 4)) * lv) / 100 + lv + 10;
  return Math.floor(core * 2);
};
const BATTLE_STAGE_KEYS = ["atk", "def", "spAtk", "spDef", "speed", "accuracy", "evasion"];
const BATTLE_BASE_STAGE_KEYS = ["atk", "def", "spAtk", "spDef", "speed"];
const ALL_ABILITY_STAGE_KEYS = ["atk", "def", "spAtk", "spDef", "speed", "accuracy", "evasion", "critStage"];
const ELEMENT_NAMES = Object.keys(PET_TYPE_ICON || {});
const BATTLE_ABILITY_KEYS = ["hp", "atk", "def", "spAtk", "spDef", "speed"];
const TIME_TUNNEL_ENVIRONMENTS = [
  { element: "木系", name: "星萤森林", tone: "#22c55e", accent: "#bef264", ground: "#14532d", motif: "forest" },
  { element: "水系", name: "镜湖星湾", tone: "#0ea5e9", accent: "#67e8f9", ground: "#075985", motif: "lake" },
  { element: "火系", name: "熔火星渊", tone: "#f97316", accent: "#fde047", ground: "#7f1d1d", motif: "lava" },
  { element: "土系", name: "晶岩峡谷", tone: "#a16207", accent: "#facc15", ground: "#422006", motif: "crystal" },
  { element: "冰系", name: "极光冰原", tone: "#38bdf8", accent: "#e0f2fe", ground: "#0c4a6e", motif: "ice" },
  { element: "电系", name: "雷霆星塔", tone: "#facc15", accent: "#a78bfa", ground: "#312e81", motif: "storm" },
  { element: "数码系", name: "数码矩阵", tone: "#22d3ee", accent: "#34d399", ground: "#042f2e", motif: "grid" },
  { element: "机械系", name: "钢铁轨道城", tone: "#94a3b8", accent: "#38bdf8", ground: "#334155", motif: "mecha" },
  { element: "神秘系", name: "星占秘境", tone: "#a855f7", accent: "#f0abfc", ground: "#3b0764", motif: "mystic" },
  { element: "飞行系", name: "云海天廊", tone: "#60a5fa", accent: "#f8fafc", ground: "#1d4ed8", motif: "sky" },
  { element: "爬行系", name: "古藤沙蜥谷", tone: "#84cc16", accent: "#fbbf24", ground: "#365314", motif: "vine" },
  { element: "上古系", name: "太古遗迹", tone: "#f59e0b", accent: "#fde68a", ground: "#78350f", motif: "ruin" },
  { element: "格斗系", name: "斗魂擂台", tone: "#ef4444", accent: "#fed7aa", ground: "#7f1d1d", motif: "arena" },
  { element: "暗黑系", name: "暗月深域", tone: "#6366f1", accent: "#c084fc", ground: "#111827", motif: "dark" },
  { element: "光明系", name: "圣光穹庭", tone: "#fef08a", accent: "#ffffff", ground: "#b45309", motif: "light" },
  { element: "龙系", name: "龙息星崖", tone: "#14b8a6", accent: "#fb7185", ground: "#134e4a", motif: "dragon" },
  { element: "圣灵系", name: "圣灵星殿", tone: "#f9a8d4", accent: "#fef3c7", ground: "#831843", motif: "holy" },
  { element: "神兵系", name: "神兵剑冢", tone: "#eab308", accent: "#e5e7eb", ground: "#44403c", motif: "blade" },
  { element: "王系", name: "星王御座", tone: "#f59e0b", accent: "#fef3c7", ground: "#581c87", motif: "royal" },
  { element: "普通系", name: "晨星草原", tone: "#38bdf8", accent: "#bbf7d0", ground: "#166534", motif: "plain" },
  { element: "毒系", name: "幽毒沼泽", tone: "#a3e635", accent: "#c084fc", ground: "#3f6212", motif: "swamp" }
];
const TIME_TUNNEL_ENVIRONMENTS_ACTIVE = TIME_TUNNEL_ENVIRONMENTS.filter((env) => env.element !== "普通系" && env.element !== "毒系");
const TIME_TUNNEL_ENVIRONMENT_BUFF_ELEMENTS = new Set(["木系", "水系", "火系", "土系", "冰系", "电系", "数码系", "机械系", "神秘系", "飞行系", "爬行系", "上古系", "格斗系", "暗黑系", "光明系", "龙系", "圣灵系", "神兵系", "王系"]);
const TIME_TUNNEL_MIN_CLEAR_FLOOR = 1;
const TIME_TUNNEL_REWARD_INTERVAL = 5;
const TIME_TUNNEL_REWARD_FLOOR = 5;
const STATUS_LABEL_MAP = { poison: "中毒", burn: "烧伤", sleep: "睡眠", paralyze: "麻痹", freeze: "冰冻", leech: "寄生", bind: "束缚", weak: "衰弱", confuse: "混乱", fear: "害怕" };
const STATUS_ANIM_FILE_MAP = { poison: "中毒", burn: "烧伤", sleep: "睡眠", paralyze: "麻痹", freeze: "冰冻", leech: "寄生", bind: "束缚", weak: "衰弱", confuse: "混乱", fear: "害怕" };
const STATUS_ANIM_DURATION_MS = 1400;
const DEFAULT_STATUS_TURNS_BY_KEY = {
  poison: 5,
  burn: 5,
  freeze: 5,
  leech: 5,
  bind: 5,
  weak: 5,
  paralyze: 3,
  fear: 1,
  sleep: 2,
  confuse: 3
};
const SKILL_STATUS_HINT = ["属性攻击", "属性"];
const ATTACK_TYPE_HINT = ["普通攻击", "特殊攻击", "属性攻击"];
const ATTACK_TYPE_LABEL_BY_CODE = { 0: "普通攻击", 1: "特殊攻击", 2: "属性攻击" };
const skillAttackTypeVersion = ref(0);
const skillAttackTypeIndexBySkillId = new Map();
const skillAttackTypeIndexByNameLevel = new Map();
const syncSkillMasterAttackTypeIndex = (rows) => {
  (Array.isArray(rows) ? rows : []).forEach((row) => {
    const skillId = Number(row && row.skill_id);
    const attackTypeCode = Number(row && row.attack_type);
    if (!Number.isFinite(skillId) || skillId <= 0 || !Number.isFinite(attackTypeCode)) return;
    skillAttackTypeIndexBySkillId.set(skillId, { dexId: 0, skillId, name: normalize((row && row.cn_name) || (row && row.new_cn_name)), level: null, attackTypeCode });
  });
  skillAttackTypeVersion.value += 1;
};
const attackTypeLabelFromCode = (code) => {
  const n = Number(code);
  return Object.prototype.hasOwnProperty.call(ATTACK_TYPE_LABEL_BY_CODE, n) ? ATTACK_TYPE_LABEL_BY_CODE[n] : "";
};
const syncSkillAttackTypeIndex = (rows) => {
  skillAttackTypeIndexBySkillId.clear();
  skillAttackTypeIndexByNameLevel.clear();
  (Array.isArray(rows) ? rows : []).forEach((row) => {
    const dexId = Number(row && row.race_id);
    if (!Number.isFinite(dexId) || dexId <= 0) return;
    const skills = Array.isArray(row && row.skills) ? row.skills : [];
    skills.forEach((s) => {
      const attackTypeCode = Number(s && s.attack_type);
      if (!Number.isFinite(attackTypeCode)) return;
      const skillId = Number(s && s.skill_id);
      const name = normalize(s && s.name);
      const level = Number(s && s.level);
      const payload = { dexId, skillId: Number.isFinite(skillId) ? skillId : null, name, level: Number.isFinite(level) ? level : null, attackTypeCode };
      if (payload.skillId) skillAttackTypeIndexBySkillId.set(payload.skillId, payload);
      if (name) {
        skillAttackTypeIndexByNameLevel.set(`${dexId}#${name}#${Number.isFinite(level) ? level : ""}`, payload);
        skillAttackTypeIndexByNameLevel.set(`${name}#${Number.isFinite(level) ? level : ""}`, payload);
      }
    });
  });
  skillAttackTypeVersion.value += 1;
};
const lookupAttackTypeCode = (skill, dexId = 0) => {
  const sid = Number(skill && skill.skillId);
  if (Number.isFinite(sid) && sid > 0 && skillAttackTypeIndexBySkillId.has(sid)) {
    return Number(skillAttackTypeIndexBySkillId.get(sid).attackTypeCode);
  }
  const name = normalize(skill && skill.name);
  const level = Number(skill && skill.level);
  if (name && Number.isFinite(level)) {
    const hit = skillAttackTypeIndexByNameLevel.get(`${Number(dexId) || 0}#${name}#${level}`) || skillAttackTypeIndexByNameLevel.get(`${name}#${level}`);
    if (hit) return Number(hit.attackTypeCode);
  }
  return null;
};
const buildSkillTypeText = (typeText, attackTypeCode = null, attackTypeText = "") => {
  const raw = normalizeLegacySkillElementText(typeText);
  const parsed = parseSkillTypeMeta(raw);
  const attackType = attackTypeLabelFromCode(attackTypeCode) || normalize(attackTypeText) || parsed.attackType || "普通攻击";
  return `${parsed.element || "未知系"}/${attackType}`;
};
const normalizeLegacySkillElementText = (text) => normalize(text)
  .replace(/超火系/g, "火系")
  .replace(/超火/g, "火")
  .replace(/超上古系/g, "上古系")
  .replace(/超上古/g, "上古");
const cnNumToInt = (text, fallback = 1) => {
  const t = normalize(text);
  if (!t) return fallback;
  const n = Number(t);
  if (Number.isFinite(n)) return Math.max(0, Math.floor(n));
  const map = { "零": 0, "一": 1, "二": 2, "两": 2, "三": 3, "四": 4, "五": 5, "六": 6 };
  if (map[t] !== undefined) return map[t];
  return fallback;
};
const parseRatioFromText = (text, fallback = null) => {
  const t = normalize(text).replace(/％/g, "%");
  if (!t) return fallback;
  if (t.includes("一半")) return 0.5;
  if (t.includes("三分之一")) return 1 / 3;
  if (t.includes("四分之一")) return 1 / 4;
  if (t.includes("五分之一")) return 1 / 5;
  if (t.includes("六分之一")) return 1 / 6;
  if (t.includes("八分之一")) return 1 / 8;
  if (t.includes("十六分之一")) return 1 / 16;
  const frac = t.match(/(\d+)\s*\/\s*(\d+)/);
  if (frac) {
    const a = Number(frac[1]);
    const b = Number(frac[2]);
    if (a > 0 && b > 0) return a / b;
  }
  const pct = t.match(/(\d+(?:\.\d+)?)\s*%/);
  if (pct) return Number(pct[1]) / 100;
  return fallback;
};
const createBattleState = () => ({
  stages: { atk: 0, def: 0, spAtk: 0, spDef: 0, speed: 0, accuracy: 0, evasion: 0 },
  baseBoost: { atk: 0, def: 0, spAtk: 0, spDef: 0, speed: 0 },
  critStage: 0,
  statuses: { poison: 0, burn: 0, sleep: 0, paralyze: 0, freeze: 0, leech: 0, bind: 0, weak: 0, confuse: 0, fear: 0 },
  skipTurns: 0,
  elementShelter: false,
  timedEffects: [],
  onDamagedEffects: []
});
const createTeamTimedEffect = (effect, ownerId = "") => ({
  kind: normalize(effect && effect.kind),
  turns: Math.max(0, Math.floor(Number(effect && effect.turns) || 0)),
  data: effect && typeof effect.data === "object" ? { ...effect.data } : {},
  ownerId: normalize(String(ownerId || ""))
});
const normalizeBattleState = (state) => {
  const s = state && typeof state === "object" ? state : createBattleState();
  const out = createBattleState();
  BATTLE_STAGE_KEYS.forEach((k) => {
    out.stages[k] = clamp(Number(s.stages && s.stages[k]) || 0, -6, 6);
  });
  ["atk", "def", "spAtk", "spDef", "speed"].forEach((k) => {
    out.baseBoost[k] = Math.max(0, Math.floor(Number(s.baseBoost && s.baseBoost[k]) || 0));
  });
  Object.keys(out.statuses).forEach((k) => {
    out.statuses[k] = Math.max(0, Math.floor(Number(s.statuses && s.statuses[k]) || 0));
  });
  out.critStage = clamp(Math.floor(Number(s.critStage) || 0), -6, 6);
  out.skipTurns = Math.max(0, Math.floor(Number(s.skipTurns) || 0));
  out.elementShelter = Boolean(s.elementShelter);
  out.timedEffects = Array.isArray(s.timedEffects) ? s.timedEffects.map((e) => ({
    kind: normalize(e && e.kind),
    turns: Math.max(1, Math.floor(Number(e && e.turns) || 1)),
    data: e && typeof e.data === "object" ? { ...e.data } : {}
  })) : [];
  out.onDamagedEffects = Array.isArray(s.onDamagedEffects) ? s.onDamagedEffects.map((e) => ({
    kind: normalize(e && e.kind) || "stage",
    turns: Math.max(1, Math.floor(Number(e && e.turns) || 1)),
    chance: clamp(Number(e && e.chance) || 0, 0, 1),
    label: normalize(e && e.label),
    status: normalize(e && e.status),
    statusTurns: Math.max(1, Math.floor(Number(e && e.statusTurns) || Number(e && e.turns) || 1)),
    allStatsDelta: clamp(Math.floor(Number(e && e.allStatsDelta) || 0), -6, 6),
    keys: Array.isArray(e && e.keys) ? e.keys.filter((k) => typeof k === "string") : [],
    delta: clamp(Math.floor(Number(e && e.delta) || 0), -6, 6),
    applyTo: normalize(e && e.applyTo) === "self" ? "self" : "attacker",
    trigger: normalize(e && e.trigger) === "attacked" ? "attacked" : "damaged",
    triggerOncePerTurn: Boolean(e && e.triggerOncePerTurn),
    persistUntilTrigger: Boolean(e && e.persistUntilTrigger),
    consumeOnTrigger: Boolean(e && e.consumeOnTrigger),
    lastTriggeredTurn: Math.max(0, Math.floor(Number(e && e.lastTriggeredTurn) || 0))
  })) : [];
  return out;
};
const clearBattleStatuses = (state) => {
  const next = normalizeBattleState(state);
  Object.keys(next.statuses).forEach((key) => {
    next.statuses[key] = 0;
  });
  return next;
};
const parseSkillTypeMeta = (typeText) => {
  const raw = normalize(typeText);
  const tokens = raw.split(/[\/｜|]/g).map((x) => normalize(x)).filter(Boolean);
  let element = "";
  let attackType = "";
  tokens.forEach((t) => {
    if (!attackType && ATTACK_TYPE_HINT.some((k) => t.includes(k))) attackType = ATTACK_TYPE_HINT.find((k) => t.includes(k)) || "";
    if (!element) {
      if (t.endsWith("系")) element = t;
      else if (ELEMENT_NAMES.includes(`${t}系`)) element = `${t}系`;
      else if (ELEMENT_NAMES.includes(t)) element = t;
    }
  });
  if (!attackType && SKILL_STATUS_HINT.some((k) => raw.includes(k))) attackType = "属性攻击";
  if (!attackType && raw.includes("特殊")) attackType = "特殊攻击";
  if (!attackType && raw.includes("普通")) attackType = "普通攻击";
  if (!element) {
    const hit = ELEMENT_NAMES.find((el) => normalize(el) && raw.includes(normalize(el)));
    if (hit) element = hit;
  }
  if (!element) element = "未知系";
  if (!attackType) attackType = "普通攻击";
  return { element, attackType };
};
const parseSkillAttackKind = (skillOrType) => {
  if (skillOrType && typeof skillOrType === "object" && (Number(skillOrType.skillId) === 22031 || normalize(skillOrType.name) === "无毁湖光")) return "physical";
  if (skillOrType && typeof skillOrType === "object" && (normalize(skillOrType.name) === "无锋巨刃" || normalize(skillOrType.name) === "刺骨之刃")) return "physical";
  if (skillOrType && typeof skillOrType === "object" && ["糖衣火箭炮", "糖衣能量炮"].includes(normalize(skillOrType.name))) return "special";
  const meta = skillOrType && typeof skillOrType === "object"
    ? { attackType: skillAttackTypeLabel(skillOrType) }
    : parseSkillTypeMeta(skillOrType);
  if (meta.attackType.includes("特殊攻击")) return "special";
  if (meta.attackType.includes("普通攻击")) return "physical";
  return "status";
};
const defaultStatusTurns = (status) => DEFAULT_STATUS_TURNS_BY_KEY[normalize(status)] || 1;
const applyStatusTurns = (state, status, turns) => {
  const key = normalize(status);
  if (!key) return 0;
  if (key === "fear") {
    state.statuses[key] = 1;
    return state.statuses[key];
  }
  const baseTurns = defaultStatusTurns(key);
  const nextTurns = Math.max(baseTurns, Math.floor(Number(turns) || baseTurns));
  state.statuses[key] = Math.max(Number(state.statuses[key]) || 0, nextTurns);
  return state.statuses[key];
};
const parseSkillElement = (typeText) => parseSkillTypeMeta(typeText).element || "未知系";
const getSkillBattleElement = (skill) => {
  const hit = parseSkillEffects(skill).find((e) => normalize(e && e.kind) === "overrideElement" && normalizeElementName(e && e.element));
  return hit ? normalizeElementName(hit.element) : parseSkillElement(skill && skill.type);
};
const parseFixedDamageAmount = (skill, actorLevel = 1) => {
  const desc = normalize(skill && skill.desc).replace(/％/g, "%");
  if (!desc) return 0;
  const levelMul = desc.match(/(?:造成)?伤害\s*=\s*(?:自己|自身|我方)?等级\s*[×xX*]\s*(\d+(?:\.\d+)?)/);
  if (levelMul) return Math.max(1, Math.floor((Number(actorLevel) || 1) * (Number(levelMul[1]) || 0)));
  const flatRules = [
    /(?:造成|给予|给)[^。；，\n]{0,18}?(\d+)\s*点(?:固定)?(?:伤害值?|伤害)/g,
    /(\d+)\s*点(?:固定)?(?:伤害值?|伤害)/g
  ];
  for (const re of flatRules) {
    let m = null;
    while ((m = re.exec(desc))) {
      const ctx = desc.slice(Math.max(0, (m.index || 0) - 12), (m.index || 0) + m[0].length + 4);
      if (/(附加|额外|追加|另加|并附带)/.test(ctx)) continue;
      return Math.max(1, Math.floor(Number(m[1]) || 0));
    }
  }
  return 0;
};
const parseBonusFixedDamagePerHit = (skill) => {
  const desc = normalize(skill && skill.desc).replace(/％/g, "%");
  if (!desc) return null;
  const m = desc.match(/(?:每次攻击|每段攻击|每次打击)[^。；，\n]{0,16}?(\d+)%[^。；，\n]{0,12}(?:机率|几率|概率)[^。；，\n]{0,12}(?:附加|额外|追加|另加)[^。；，\n]{0,8}?(\d+)\s*点(?:固定)?(?:伤害值?|伤害)/)
    || desc.match(/(?:附加|额外|追加|另加)[^。；，\n]{0,8}?(\d+)\s*点(?:固定)?(?:伤害值?|伤害)[^。；，\n]{0,16}?(\d+)%[^。；，\n]{0,12}(?:机率|几率|概率)/);
  if (!m) return null;
  const firstIsChance = /%/.test(m[0].slice(0, m[0].indexOf(m[2])));
  const chance = firstIsChance ? Number(m[1]) / 100 : Number(m[2]) / 100;
  const amount = firstIsChance ? Number(m[2]) : Number(m[1]);
  if (!Number.isFinite(chance) || !Number.isFinite(amount) || amount <= 0) return null;
  return { amount: Math.max(1, Math.floor(amount)), chance: clamp(chance, 0, 1) };
};
const calcBattleFixedDamageAmount = (scene, actorSide, skill, actorLevel = 1, defenderLevel = 1) => {
  const name = normalize(skill && skill.name);
  if (name === "圣灵") {
    const speed = getBattleAbilityStat(scene, actorSide === "target" ? "target" : "attacker", "speed");
    return Math.max(1, Math.floor(speed * 2 / 3));
  }
  const effects = parseSkillEffects(skill);
  const fixedByEffect = effects.find((e) => normalize(e && e.kind) === "fixedDamageByLevel");
  if (fixedByEffect) {
    const base = Math.max(1, Math.floor((Number(actorLevel) || 1) * (Number(fixedByEffect.factor) || 1)));
    const bonus = effects
      .filter((e) => normalize(e && e.kind) === "bonusFixedDamage" && (!Number.isFinite(Number(e.chance)) || Math.random() <= clamp(Number(e.chance) || 1, 0, 1)))
      .reduce((sum, e) => sum + Math.max(0, Math.floor(Number(e.amount) || 0)), 0);
    return Math.max(1, base + bonus);
  }
  const targetLevelEffect = effects.find((e) => normalize(e && e.kind) === "fixedDamageByTargetLevel");
  if (targetLevelEffect) {
    const base = Math.max(1, Math.floor((Number(defenderLevel) || 1) * (Number(targetLevelEffect.factor) || 1)));
    const bonus = effects
      .filter((e) => normalize(e && e.kind) === "bonusFixedDamage" && (!Number.isFinite(Number(e.chance)) || Math.random() <= clamp(Number(e.chance) || 1, 0, 1)))
      .reduce((sum, e) => sum + Math.max(0, Math.floor(Number(e.amount) || 0)), 0);
    return Math.max(1, base + bonus);
  }
  const selfLevelEffect = effects.find((e) => normalize(e && e.kind) === "fixedDamageBySelfLevel");
  if (selfLevelEffect) {
    const base = Math.max(1, Math.floor((Number(actorLevel) || 1) * (Number(selfLevelEffect.factor) || 1)));
    const bonus = effects
      .filter((e) => normalize(e && e.kind) === "bonusFixedDamage" && (!Number.isFinite(Number(e.chance)) || Math.random() <= clamp(Number(e.chance) || 1, 0, 1)))
      .reduce((sum, e) => sum + Math.max(0, Math.floor(Number(e.amount) || 0)), 0);
    return Math.max(1, base + bonus);
  }
  const statRatioEffect = effects.find((e) => normalize(e && e.kind) === "fixedDamageByStatRatio")
    || effects.find((e) => normalize(e && e.kind) === "fixedDamageBySpeedRatio");
  if (statRatioEffect) {
    const statKey = normalize(statRatioEffect.statKey) || (normalize(statRatioEffect.kind) === "fixedDamageBySpeedRatio" ? "speed" : "speed");
    const actorStat = getBattleAbilityStat(scene, actorSide === "target" ? "target" : "attacker", statKey);
    const defenderSide = actorSide === "target" ? "attacker" : "target";
    const defenderStat = getBattleAbilityStat(scene, defenderSide, statKey);
    const factor = Math.max(1, Number(statRatioEffect.factor) || 500);
    return Math.max(1, Math.floor((actorStat / Math.max(1, defenderStat)) * factor));
  }
  const baseFixed = parseFixedDamageAmount(skill, actorLevel);
  if (baseFixed > 0) {
    const bonus = effects
      .filter((e) => normalize(e && e.kind) === "bonusFixedDamage" && (!Number.isFinite(Number(e.chance)) || Math.random() <= clamp(Number(e.chance) || 1, 0, 1)))
      .reduce((sum, e) => sum + Math.max(0, Math.floor(Number(e.amount) || 0)), 0);
    return Math.max(1, baseFixed + bonus);
  }
  return 0;
};
const critChanceByStage = (stage) => {
  const s = clamp(Math.floor(Number(stage) || 0), -6, 6);
  if (s <= 0) return 1 / 16;
  if (s === 1) return 1 / 8;
  if (s === 2) return 1 / 2;
  return 1;
};
const stageMultiplier = (stage) => {
  const s = clamp(Math.floor(Number(stage) || 0), -6, 6);
  return s >= 0 ? (2 + s) / 2 : 2 / (2 - s);
};
const stageHitRateFactor = (accuracyStage, evasionStage) => {
  const diff = clamp(Math.floor(Number(accuracyStage) || 0) - Math.floor(Number(evasionStage) || 0), -6, 6);
  return clamp(1 + diff * 0.1, 0.4, 1.6);
};
const getSideState = (scene, side) => {
  if (!scene) return createBattleState();
  if (side === "attacker") {
    if (!scene.attackerState || typeof scene.attackerState !== "object") scene.attackerState = createBattleState();
    return scene.attackerState;
  }
  if (!scene.targetState || typeof scene.targetState !== "object") scene.targetState = createBattleState();
  return scene.targetState;
};
const battleStageTotal = (scene, side) => {
  const state = getSideState(scene, side);
  const stages = state && state.stages ? state.stages : {};
  return BATTLE_STAGE_KEYS.reduce((sum, key) => sum + (Math.floor(Number(stages[key]) || 0)), 0)
    + Math.floor(Number(state && state.critStage) || 0);
};
const battleStageTotalsSnapshot = (scene) => ({
  attacker: battleStageTotal(scene, "attacker"),
  target: battleStageTotal(scene, "target")
});
const getBattleAbilityStat = (scene, side, key, options = {}) => {
  const ability = side === "attacker" ? scene.attackerAbility : scene.targetAbility;
  const state = getSideState(scene, side);
  const base = Math.max(1, Number(ability && ability[key]) || 1);
  const boost = state.baseBoost && typeof state.baseBoost === "object" ? Math.max(0, Number(state.baseBoost[key]) || 0) : 0;
  const rawStage = Number(state.stages[key]) || 0;
  const effectiveStage = options && options.ignorePositiveStage ? Math.min(0, rawStage) : rawStage;
  const m = stageMultiplier(effectiveStage);
  let val = Math.max(1, Math.floor((base + boost) * m));
  (state.timedEffects || []).forEach((e) => {
    if (normalize(e && e.kind) !== "abilityStatFactor") return;
    const d = e.data || {};
    const keys = Array.isArray(d.keys) ? d.keys : [];
    if (!keys.includes(key)) return;
    val = Math.max(1, Math.floor(val * clamp(Number(d.factor) || 1, 0.01, 3)));
  });
  if (key === "def") {
    const hasDefenseHalve = (state.timedEffects || []).some((e) => normalize(e && e.kind) === "defenseHalve");
    if (hasDefenseHalve) val = Math.max(1, Math.floor(val * 0.5));
  }
  return val;
};
const getBattleActionSpeed = (scene, side) => getBattleAbilityStat(scene, side, "speed");
const hasStageGuard = (scene, side, delta) => {
  const state = getSideState(scene, side);
  return (state.timedEffects || []).some((e) => {
    if (normalize(e && e.kind) !== "stageGuard") return false;
    const mode = normalize(e.data && e.data.mode) || "debuff";
    if (mode === "all") return true;
    if (mode === "buff") return Number(delta) > 0;
    return Number(delta) < 0;
  });
};
const hasGlobalStageGuard = (scene, delta) => {
  if (!scene) return false;
  return (Array.isArray(scene.globalTimedEffects) ? scene.globalTimedEffects : []).some((e) => {
    if (normalize(e && e.kind) !== "globalStageGuard") return false;
    if (Math.max(0, Number(e && e.turns) || 0) <= 0) return false;
    const mode = normalize(e.data && e.data.mode) || "all";
    if (mode === "all") return true;
    if (mode === "buff") return Number(delta) > 0;
    return Number(delta) < 0;
  });
};
const isStageChangeBlocked = (scene, side, delta) => {
  const n = Number(delta) || 0;
  return n !== 0 && (hasStageGuard(scene, side, n) || hasGlobalStageGuard(scene, n));
};
const hasActiveStageGuardBuff = (scene, side) => {
  const state = getSideState(scene, side);
  if ((state.timedEffects || []).some((e) => normalize(e && e.kind) === "stageGuard" && Math.max(0, Number(e && e.turns) || 0) > 0)) return true;
  return (Array.isArray(scene && scene.globalTimedEffects) ? scene.globalTimedEffects : [])
    .some((e) => normalize(e && e.kind) === "globalStageGuard" && Math.max(0, Number(e && e.turns) || 0) > 0);
};
const mirrorOpponentStageBoosts = (scene, boostedSide, changedKeys, delta) => {
  if (!scene || !Array.isArray(changedKeys) || changedKeys.length <= 0 || Number(delta) <= 0) return [];
  const ownerSide = boostedSide === "attacker" ? "target" : "attacker";
  const ownerState = getSideState(scene, ownerSide);
  const effects = (ownerState.timedEffects || []).filter((e) => normalize(e && e.kind) === "mirrorOpponentStageBoost");
  const mirrored = [];
  effects.forEach((e) => {
    const d = e.data || {};
    const multiplier = Math.max(1, Math.floor(Number(d.multiplier) || 1));
    const changed = applyStageDelta(scene, ownerSide, changedKeys, Number(delta) * multiplier, { skipStageMirror: true });
    if (changed.length <= 0) return;
    mirrored.push(...changed);
    const ownerName = ownerSide === "attacker" ? scene.attackerName : scene.targetName;
    const boostedName = boostedSide === "attacker" ? scene.attackerName : scene.targetName;
    const suffix = multiplier > 1 ? `${multiplier}倍` : "";
    pushBattleLog(scene, `${ownerName}同步${suffix}获得${boostedName}提升的能力等级：${changed.map((k) => battleStatLabel(k)).join("、")}`);
  });
  return mirrored;
};
const applyStageDelta = (scene, side, keys, delta, options = {}) => {
  const state = getSideState(scene, side);
  const n = clamp(Math.floor(Number(delta) || 0), -6, 6);
  if (isStageChangeBlocked(scene, side, n)) {
    const who = side === "attacker" ? scene.attackerName : scene.targetName;
    pushBattleLog(scene, `${who}的能力等级保护生效，属性变化被阻止。`);
    return [];
  }
  const list = Array.isArray(keys) ? keys : [keys];
  const changed = [];
  list.forEach((k) => {
    if (k === "critStage") {
      const prevCrit = state.critStage || 0;
      state.critStage = clamp(prevCrit + n, -6, 6);
      if (state.critStage !== prevCrit) changed.push("critStage");
      return;
    }
    if (!BATTLE_STAGE_KEYS.includes(k)) return;
    const prev = state.stages[k];
    state.stages[k] = clamp(prev + n, -6, 6);
    if (state.stages[k] !== prev) changed.push(k);
  });
  if (n > 0 && !options.skipStageMirror) mirrorOpponentStageBoosts(scene, side, changed, n);
  return changed;
};
const clearStageByMode = (scene, side, mode = "positive", keys = null) => {
  const state = getSideState(scene, side);
  const list = Array.isArray(keys) && keys.length > 0 ? keys : ALL_ABILITY_STAGE_KEYS;
  const changed = [];
  list.forEach((k) => {
    if (k === "critStage") {
      const prev = Math.floor(Number(state.critStage) || 0);
      const shouldClear = mode === "all" || (mode === "negative" ? prev < 0 : prev > 0);
      const clearDelta = prev === 0 ? 0 : -prev;
      if (shouldClear && (hasStageGuard(scene, side, clearDelta) || hasGlobalStageGuard(scene, clearDelta))) return;
      if (shouldClear) {
        state.critStage = 0;
        changed.push(k);
      }
      return;
    }
    if (!BATTLE_STAGE_KEYS.includes(k)) return;
    const prev = Math.floor(Number(state.stages[k]) || 0);
    const shouldClear = mode === "all" || (mode === "negative" ? prev < 0 : prev > 0);
    const clearDelta = prev === 0 ? 0 : -prev;
    if (shouldClear && (hasStageGuard(scene, side, clearDelta) || hasGlobalStageGuard(scene, clearDelta))) return;
    if (shouldClear) {
      state.stages[k] = 0;
      changed.push(k);
    }
  });
  return changed;
};
const getRestoreStageResetMode = (resetStages) => {
  if (resetStages === false) return "";
  if (resetStages === true || resetStages === undefined || resetStages === null) return "all";
  const mode = normalize(resetStages);
  return mode === "negative" || mode === "positive" || mode === "all" ? mode : "all";
};
const copyPositiveStages = (scene, fromSide, toSide, keys = null) => {
  const from = getSideState(scene, fromSide);
  const to = getSideState(scene, toSide);
  const list = Array.isArray(keys) && keys.length > 0 ? keys : ALL_ABILITY_STAGE_KEYS;
  const changed = [];
  list.forEach((k) => {
    if (k === "critStage") {
      const n = Math.max(0, Math.floor(Number(from.critStage) || 0));
      const prev = Math.floor(Number(to.critStage) || 0);
      const next = clamp(prev + n, -6, 6);
      if (n > 0 && (hasStageGuard(scene, toSide, next - prev) || hasGlobalStageGuard(scene, next - prev))) return;
      if (n > 0 && next !== prev) {
        to.critStage = next;
        changed.push(k);
      }
      return;
    }
    if (!BATTLE_STAGE_KEYS.includes(k)) return;
    const n = Math.max(0, Math.floor(Number(from.stages[k]) || 0));
    const prev = Math.floor(Number(to.stages[k]) || 0);
    const next = clamp(prev + n, -6, 6);
    if (n > 0 && (hasStageGuard(scene, toSide, next - prev) || hasGlobalStageGuard(scene, next - prev))) return;
    if (n > 0 && next !== prev) {
      to.stages[k] = next;
      changed.push(k);
    }
  });
  return changed;
};
const applyBattleStagesSnapshot = (scene, side, snapshot = {}, options = {}) => {
  const state = getSideState(scene, side);
  const ignoreStageGuard = Boolean(options && options.ignoreStageGuard);
  const changed = [];
  ALL_ABILITY_STAGE_KEYS.forEach((k) => {
    const next = clamp(Math.floor(Number(snapshot[k]) || 0), -6, 6);
    if (k === "critStage") {
      const prev = clamp(Math.floor(Number(state.critStage) || 0), -6, 6);
      if (next !== prev) {
        if (!ignoreStageGuard && (hasStageGuard(scene, side, next - prev) || hasGlobalStageGuard(scene, next - prev))) return;
        state.critStage = next;
        changed.push(k);
      }
      return;
    }
    if (!BATTLE_STAGE_KEYS.includes(k)) return;
    const prev = clamp(Math.floor(Number(state.stages[k]) || 0), -6, 6);
    if (next !== prev) {
      if (!ignoreStageGuard && (hasStageGuard(scene, side, next - prev) || hasGlobalStageGuard(scene, next - prev))) return;
      state.stages[k] = next;
      changed.push(k);
    }
  });
  return changed;
};
const invertBattleStages = (scene, side, keys = null, options = {}) => {
  const state = getSideState(scene, side);
  const list = Array.isArray(keys) && keys.length > 0 ? keys : ALL_ABILITY_STAGE_KEYS;
  const snapshot = {};
  ALL_ABILITY_STAGE_KEYS.forEach((k) => {
    if (k === "critStage") snapshot[k] = Math.floor(Number(state.critStage) || 0);
    else if (BATTLE_STAGE_KEYS.includes(k)) snapshot[k] = Math.floor(Number(state.stages[k]) || 0);
  });
  list.forEach((k) => {
    if (!ALL_ABILITY_STAGE_KEYS.includes(k)) return;
    snapshot[k] = -clamp(Math.floor(Number(snapshot[k]) || 0), -6, 6);
  });
  return applyBattleStagesSnapshot(scene, side, snapshot, options);
};
const swapBattleStages = (scene, leftSide, rightSide, keys = null) => {
  const left = getSideState(scene, leftSide);
  const right = getSideState(scene, rightSide);
  const list = Array.isArray(keys) && keys.length > 0 ? keys : ALL_ABILITY_STAGE_KEYS;
  const changed = [];
  list.forEach((k) => {
    if (k === "critStage") {
      const lv = clamp(Math.floor(Number(left.critStage) || 0), -6, 6);
      const rv = clamp(Math.floor(Number(right.critStage) || 0), -6, 6);
      if (lv !== rv) {
        if (hasStageGuard(scene, leftSide, rv - lv) || hasStageGuard(scene, rightSide, lv - rv) || hasGlobalStageGuard(scene, rv - lv) || hasGlobalStageGuard(scene, lv - rv)) return;
        left.critStage = rv;
        right.critStage = lv;
        changed.push(k);
      }
      return;
    }
    if (!BATTLE_STAGE_KEYS.includes(k)) return;
    const lv = clamp(Math.floor(Number(left.stages[k]) || 0), -6, 6);
    const rv = clamp(Math.floor(Number(right.stages[k]) || 0), -6, 6);
    if (lv !== rv) {
      if (hasStageGuard(scene, leftSide, rv - lv) || hasStageGuard(scene, rightSide, lv - rv) || hasGlobalStageGuard(scene, rv - lv) || hasGlobalStageGuard(scene, lv - rv)) return;
      left.stages[k] = rv;
      right.stages[k] = lv;
      changed.push(k);
    }
  });
  return changed;
};
const transferStagesByMode = (scene, fromSide, toSide, mode = "negative", keys = null) => {
  const from = getSideState(scene, fromSide);
  const list = Array.isArray(keys) && keys.length > 0 ? keys : ALL_ABILITY_STAGE_KEYS;
  const changed = [];
  list.forEach((k) => {
    let value = 0;
    if (k === "critStage") {
      value = clamp(Math.floor(Number(from.critStage) || 0), -6, 6);
    } else if (BATTLE_STAGE_KEYS.includes(k)) {
      value = clamp(Math.floor(Number(from.stages[k]) || 0), -6, 6);
    } else {
      return;
    }
    const shouldMove = mode === "all" || (mode === "positive" ? value > 0 : value < 0);
    if (!shouldMove || value === 0) return;
    const moved = applyStageDelta(scene, toSide, [k], value);
    if (moved.length <= 0) return;
    if (k === "critStage") from.critStage = 0;
    else from.stages[k] = 0;
    changed.push(k);
  });
  return changed;
};
const transferStatusesByMode = (scene, fromSide, toSide, status = "all") => {
  const from = getSideState(scene, fromSide);
  const to = getSideState(scene, toSide);
  const keys = normalize(status) === "all"
    ? Object.keys(from.statuses || {})
    : [normalize(status)].filter(Boolean);
  const changed = [];
  keys.forEach((key) => {
    const turns = Math.max(0, Math.floor(Number(from.statuses && from.statuses[key]) || 0));
    if (turns <= 0) return;
    if (isGuardianBossProtectedTarget(scene, toSide)) return;
    if (isStatusImmuneByElement(scene, toSide, key) || hasStatusShield(scene, toSide, key)) return;
    to.statuses[key] = Math.max(Math.max(0, Number(to.statuses[key]) || 0), turns);
    from.statuses[key] = 0;
    changed.push(key);
  });
  return changed;
};
const applyInstantKoToSide = (scene, side) => {
  if (!scene) return false;
  const hpKey = side === "attacker" ? "attackerHp" : "targetHp";
  const before = Math.max(0, Number(scene[hpKey]) || 0);
  if (before <= 0) return false;
  scene[hpKey] = 0;
  if (side === "attacker" && Array.isArray(scene.team)) {
    const idx = scene.team.findIndex((u) => u && u.id === scene.currentAttackerId);
    if (idx >= 0) {
      scene.team[idx].hp = 0;
      scene.team[idx].battleState = normalizeBattleState(scene.attackerState);
    }
  }
  syncBattleUiHpForSide(scene, side);
  return true;
};
const showBattleInstantKoDamage = (scene, side, damageValue = 999999) => {
  if (!scene) return;
  const shown = Math.max(1, Math.floor(Number(damageValue) || 999999));
  if (side === "attacker") scene.damageOnAttacker = `-${shown}`;
  else scene.damageOnTarget = `-${shown}`;
  markBattleFloatText(scene);
};
const applyBattleHitRateFactor = (scene, actorSide, targetSide, skillElement) => {
  let factor = 1;
  const actorState = getSideState(scene, actorSide);
  (actorState.timedEffects || []).forEach((e) => {
    if (normalize(e && e.kind) !== "hitRateBoost") return;
    factor *= 1 + clamp(Number(e.data && e.data.ratio) || 0, 0, 9);
  });
  const targetElements = targetSide === "attacker"
    ? getElementList(scene.attackerElement, scene.attackerSubElement)
    : getElementList(scene.targetElement, scene.targetSubElement);
  if (targetElements.includes("飞行系")) factor *= 0.95;
  return factor;
};
const battleStatLabel = (k) => (
  k === "atk" ? "攻击" :
  k === "def" ? "防御" :
  k === "spAtk" ? "特攻" :
  k === "spDef" ? "特防" :
  k === "speed" ? "速度" :
  k === "accuracy" ? "命中" :
  k === "evasion" ? "闪避" :
  k === "critStage" ? "暴击" : k
);
const healSideByRatio = (scene, side, ratio) => {
  const keyHp = side === "attacker" ? "attackerHp" : "targetHp";
  const keyMax = side === "attacker" ? "attackerMaxHp" : "targetMaxHp";
  const maxHp = Math.max(1, Number(scene[keyMax]) || 1);
  const hp = Math.max(0, Number(scene[keyHp]) || 0);
  const heal = Math.max(1, Math.floor(maxHp * clamp(Number(ratio) || 0, 0, 1)));
  const next = clamp(hp + heal, 0, maxHp);
  scene[keyHp] = next;
  return Math.max(0, next - hp);
};
const calcHealAmountByRatio = (scene, side, ratio) => {
  const keyMax = side === "attacker" ? "attackerMaxHp" : "targetMaxHp";
  const maxHp = Math.max(1, Number(scene && scene[keyMax]) || 1);
  return Math.max(1, Math.floor(maxHp * clamp(Number(ratio) || 0, 0, 1)));
};
const syncBattleUiHpForSide = (scene, side) => {
  if (!scene) return;
  if (side === "attacker") {
    scene.uiAttackerHp = clamp(Number(scene.attackerHp) || 0, 0, Number(scene.attackerMaxHp) || 1);
  } else {
    scene.uiTargetHp = clamp(Number(scene.targetHp) || 0, 0, Number(scene.targetMaxHp) || 1);
  }
};
const syncActivePetFromBattleScene = (scene) => {
  if (!scene || !Array.isArray(scene.team)) return;
  const idx = scene.team.findIndex((u) => u && u.id === scene.currentAttackerId);
  if (idx < 0) return;
  scene.team[idx].hp = clamp(Number(scene.attackerHp) || 0, 0, Number(scene.team[idx].maxHp) || 1);
  scene.team[idx].battleState = normalizeBattleState(scene.attackerState);
};
const battleUnitStaticImage = (unit) => petCroppedStaticImage(unit && (unit.battleStaticDexId || unit.staticDexId || unit.dexId || unit.baseDexId));
const battleUnitOriginalStaticImage = (unit) => petCroppedStaticImage(unit && (unit.staticDexId || unit.dexId || unit.baseDexId));
const battleUnitOriginalBattleImage = (unit) => normalize(unit && (unit.originalBattleImage || unit.image || unit.originalStaticImage)) || battleUnitOriginalStaticImage(unit);
const battleUnitSkinBattleImage = (unit) => normalize(unit && (unit.skinBattleImage || unit.skinStaticImage)) || battleUnitStaticImage(unit);
const battleUnitBattleImage = (unit) => (
  unit && unit.skinActivated && Number(unit.skinBattleVisualDexId) > 0
    ? battleUnitSkinBattleImage(unit)
    : (normalize(unit && unit.battleImage) || battleUnitOriginalBattleImage(unit))
);
const isQiankunXiuluoshenSkinBattleActive = (scene, side) => {
  if (!scene) return false;
  const safeSide = side === "target" ? "target" : "attacker";
  const activeKey = safeSide === "target" ? "targetSkinActivated" : "attackerSkinActivated";
  const skinKey = safeSide === "target" ? "targetSkinKey" : "attackerSkinKey";
  const visualKey = safeSide === "target" ? "targetSkinBattleVisualDexId" : "attackerSkinBattleVisualDexId";
  return Boolean(
    scene[activeKey]
    && normalize(scene[skinKey]) === QIANKUN_XIULUOSHEN_SKIN_KEY
    && Number(scene[visualKey]) === QIANKUN_XIULUOSHEN_SKIN_DEX_ID
  );
};
const applyBattleUnitToAttackerSide = (scene, unit) => {
  if (!scene || !unit) return false;
  if (scene._attackerTransformTimer) {
    clearTimeout(scene._attackerTransformTimer);
    scene._attackerTransformTimer = null;
  }
  scene.currentAttackerId = unit.id;
  scene.attackerDexId = Number(unit.dexId) || 0;
  scene.attackerBaseDexId = Number(unit.baseDexId) || Number(unit.dexId) || 0;
  scene.attackerName = unit.name;
  scene.attackerImage = battleUnitBattleImage(unit);
  scene.attackerStaticImage = unit.skinActivated ? battleUnitStaticImage(unit) : battleUnitOriginalStaticImage(unit);
  scene.attackerLevel = unit.level;
  scene.attackerElement = unit.element;
  scene.attackerSubElement = unit.subElement;
  scene.attackerBattleItemId = normalize(unit.battleItemId);
  scene.attackerQixingSealLevel = normalize(unit.battleItemId) === QIXING_SEAL_ITEM_ID ? clamp(Math.floor(Number(unit.qixingSealLevel) || 1), 1, QIXING_SEAL_MAX_LEVEL) : 1;
  scene.attackerQixingSealTraitKey = normalize(unit.qixingSealTraitKey);
  scene.attackerBattleVisualDexId = Number(unit.battleVisualDexId) || Number(unit.dexId) || 0;
  scene.attackerOriginalBattleVisualDexId = Number(unit.originalBattleVisualDexId) || Number(unit.battleVisualDexId) || Number(unit.dexId) || 0;
  scene.attackerSkinBattleVisualDexId = Number(unit.skinBattleVisualDexId) || 0;
  scene.attackerSkinActivated = Boolean(unit.skinActivated && Number(unit.skinBattleVisualDexId) > 0);
  scene.attackerSkinKey = normalize(unit.skinKey);
  scene.attackerPreSkinDexId = 0;
  scene.attackerTransformingSkin = false;
  scene.attackerTransformFx = "";
  scene.attackerTransformUnitId = "";
  scene.attackerAbility = unit.ability;
  scene.attackerHp = unit.hp;
  scene.attackerMaxHp = unit.maxHp;
  scene.uiAttackerHp = unit.hp;
  scene.uiAttackerMaxHp = unit.maxHp;
  scene.attackerState = normalizeBattleState(unit.battleState);
  scene.skills = unit.skills;
  return true;
};
const resetBattleAnimIdle = (scene) => {
  if (!scene) return;
  if (scene._petAnimTargetAutoIdleTimer) {
    clearTimeout(scene._petAnimTargetAutoIdleTimer);
    scene._petAnimTargetAutoIdleTimer = null;
  }
  if (scene._petAnimAttackerAutoIdleTimer) {
    clearTimeout(scene._petAnimAttackerAutoIdleTimer);
    scene._petAnimAttackerAutoIdleTimer = null;
  }
  scene._petAnimTargetPlayLock = false;
  scene._petAnimAttackerPlayLock = false;
  scene._petAnimActionMarks = {};
  const curId = String(scene.currentAttackerId || "");
  const current = Array.isArray(scene.team)
    ? scene.team.find((u) => u && String(u.id || "") === curId)
    : null;
  const attackerIdle = current ? battleUnitBattleImage(current) : (scene.attackerImage || scene.attackerStaticImage);
  if (attackerIdle) scene.attackerImage = attackerIdle;
  if (scene.targetStaticImage) scene.targetImage = scene.targetStaticImage;
};
const forceRandomBattleSwitch = (scene, side) => {
  if (!scene) return false;
  if (side !== "attacker") {
    pushBattleLog(scene, `${side === "target" ? scene.targetName : "对方"}没有可替换的存活亚比。`);
    return false;
  }
  if (!Array.isArray(scene.team)) return false;
  syncActivePetFromBattleScene(scene);
  const candidates = scene.team.filter((u) => u && u.id && u.id !== scene.currentAttackerId && Number(u.hp) > 0);
  if (candidates.length === 0) {
    pushBattleLog(scene, `${scene.attackerName}没有可替换的存活亚比。`);
    return false;
  }
  const next = candidates[Math.floor(Math.random() * candidates.length)];
  if (!applyBattleUnitToAttackerSide(scene, next)) return false;
  scene.fxAttackerDefeated = false;
  resetBattleAnimIdle(scene);
  pushBattleLog(scene, `威吓生效，${next.name}被强制替换上场。`);
  return true;
};
const TIMED_EFFECT_REFRESH_BY_KIND = new Set(["diceDrain", "defenseHalve", "destinyBond", "damageShield", "lastStand", "mirrorOpponentStageBoost", "lifestealBuff", "fullRestoreOnDefeatThisTurn"]);
const addTimedEffect = (scene, side, effect) => {
  const state = getSideState(scene, side);
  const next = {
    kind: normalize(effect && effect.kind),
    turns: Math.max(1, Math.floor(Number(effect && effect.turns) || 1)),
    data: effect && typeof effect.data === "object" ? { ...effect.data } : {}
  };
  const keyOf = (fx) => `${normalize(fx && fx.kind)}|${JSON.stringify(fx && fx.data ? fx.data : {})}`;
  const allowsStacks = next.kind === "abilityStatFactor";
  if (next.kind === "diceDrain") {
    state.timedEffects = (state.timedEffects || []).filter((fx) => normalize(fx && fx.kind) !== "diceDrain");
    state.timedEffects.push(next);
    return;
  }
  const idx = allowsStacks ? -1 : state.timedEffects.findIndex((fx) => TIMED_EFFECT_REFRESH_BY_KIND.has(next.kind)
    ? normalize(fx && fx.kind) === next.kind
    : keyOf(fx) === keyOf(next));
  if (idx >= 0) {
    state.timedEffects[idx] = next;
  } else {
    state.timedEffects.push(next);
  }
};
const getTurnSequenceAttackEffect = (scene, side) => {
  const state = getSideState(scene, side);
  cleanupExpiredEffects(state);
  return (state.timedEffects || []).find((e) => normalize(e && e.kind) === "turnSequenceAttack" && Math.max(0, Number(e && e.turns) || 0) > 0) || null;
};
const consumeTurnSequenceAttackSkill = (scene, side, skillPool) => {
  const fx = getTurnSequenceAttackEffect(scene, side);
  if (!fx) return null;
  const d = fx.data || {};
  const storedSkill = d.skill && typeof d.skill === "object" ? d.skill : {};
  const skillName = normalize(storedSkill.name);
  const skill = (Array.isArray(skillPool) ? skillPool : []).find((s) => normalize(s && s.name) === skillName) || storedSkill;
  if (!skill || !skillName) return null;
  const sourcePp = Math.max(0, Number(skill && skill.pp) || 0);
  if (sourcePp <= 0) return null;
  const currentTurns = Math.max(1, Math.floor(Number(fx.turns) || 1));
      const doneTurns = Math.max(2, Math.floor(Number(d.doneTurns) || 1) + 1);
  const basePower = Math.max(1, Math.floor(Number(d.initialPower) || Number(storedSkill.power) || Number(skill.power) || 1));
  const add = Math.max(0, Math.floor(Number(d.powerAdd) || 0));
  const multiplier = Math.max(1, Number(d.powerFactor) || 1);
  const nextPower = add > 0 ? basePower + add * (doneTurns - 1) : Math.max(1, Math.floor(basePower * multiplier));
  const next = {
    ...skill,
    power: nextPower,
    pp: sourcePp,
    _turnSequenceAuto: true,
    _turnSequenceSourceSkill: skill,
    _turnSequenceEffect: fx,
    _turnSequenceOriginalPower: Number(skill.power)
  };
  return next;
};
const advanceTurnSequenceAttackEffect = (scene, side, skill, didApply) => {
  const fx = skill && skill._turnSequenceEffect;
  if (!fx || normalize(fx.kind) !== "turnSequenceAttack") return;
  const d = fx.data || {};
  const keepOnMiss = Boolean(d.keepOnMiss);
  const failed = !didApply;
  if (failed && d.resetOnFail) {
    d.powerFactor = Math.max(1, Number(d.powerMultiplier) || 2);
  } else if (!failed || keepOnMiss) {
    d.powerFactor = Math.max(1, Number(d.powerFactor) || 1) * Math.max(1, Number(d.powerMultiplier) || 2);
  }
  d.doneTurns = Math.max(1, Math.floor(Number(d.doneTurns) || 1)) + 1;
  fx.turns = Math.max(0, Math.floor(Number(fx.turns) || 0) - 1);
  cleanupExpiredEffects(getSideState(scene, side));
};
const damageSideByMaxHpRatio = (scene, side, ratio) => {
  const hpKey = side === "attacker" ? "attackerHp" : "targetHp";
  const maxHpKey = side === "attacker" ? "attackerMaxHp" : "targetMaxHp";
  const maxHp = Math.max(1, Number(scene && scene[maxHpKey]) || 1);
  const before = Math.max(0, Number(scene && scene[hpKey]) || 0);
  const damage = Math.max(1, Math.floor(maxHp * clamp(Number(ratio) || 0, 0.01, 1)));
  scene[hpKey] = Math.max(0, before - damage);
  const actual = Math.max(0, before - (Number(scene[hpKey]) || 0));
  recordBattleDamageTakenThisTurn(scene, side, actual);
  if (side === "attacker" && Array.isArray(scene.team)) {
    const idx = scene.team.findIndex((u) => u && u.id === scene.currentAttackerId);
    if (idx >= 0) scene.team[idx].hp = clamp(Number(scene.attackerHp) || 0, 0, Number(scene.team[idx].maxHp) || 1);
  }
  syncBattleUiHpForSide(scene, side);
  return { damage, actual };
};
const healSideByFlatAmount = (scene, side, amount) => {
  const hpKey = side === "attacker" ? "attackerHp" : "targetHp";
  const maxHpKey = side === "attacker" ? "attackerMaxHp" : "targetMaxHp";
  const before = Math.max(0, Number(scene && scene[hpKey]) || 0);
  const maxHp = Math.max(1, Number(scene && scene[maxHpKey]) || 1);
  const val = Math.max(1, Math.floor(Number(amount) || 0));
  scene[hpKey] = clamp(before + val, 0, maxHp);
  if (side === "attacker" && Array.isArray(scene.team)) {
    const idx = scene.team.findIndex((u) => u && u.id === scene.currentAttackerId);
    if (idx >= 0) scene.team[idx].hp = clamp(Number(scene.attackerHp) || 0, 0, Number(scene.team[idx].maxHp) || 1);
  }
  syncBattleUiHpForSide(scene, side);
  return { shown: val, actual: Math.max(0, (Number(scene[hpKey]) || 0) - before) };
};
const battleSkillListForSide = (scene, side) => (
  side === "attacker" ? (Array.isArray(scene.skills) ? scene.skills : []) : (Array.isArray(scene.targetSkills) ? scene.targetSkills : [])
);
const changeSideAllSkillPp = (scene, side, amount) => {
  const delta = Math.floor(Number(amount) || 0);
  if (!delta) return 0;
  let changed = 0;
  battleSkillListForSide(scene, side).forEach((s) => {
    if (!s) return;
    const before = Math.max(0, Number(s.pp) || 0);
    const max = Math.max(before, Number(s.ppMax) || before || 0);
    const next = delta > 0 ? Math.min(max, before + delta) : Math.max(0, before + delta);
    s.pp = next;
    changed += Math.abs(next - before);
  });
  return changed;
};
const addOnDamagedEffect = (scene, side, effect) => {
  const state = getSideState(scene, side);
  state.onDamagedEffects.push({
    turns: Math.max(1, Math.floor(Number(effect && effect.turns) || 1)),
    chance: clamp(Number(effect && effect.chance) || 0, 0, 1),
    kind: normalize(effect && effect.kind) || "stage",
    label: normalize(effect && effect.label),
    status: normalize(effect && effect.status),
    statusTurns: Math.max(1, Math.floor(Number(effect && effect.statusTurns) || Number(effect && effect.turns) || 1)),
    allStatsDelta: clamp(Math.floor(Number(effect && effect.allStatsDelta) || 0), -6, 6),
    keys: Array.isArray(effect && effect.keys) ? effect.keys.filter((k) => typeof k === "string") : [],
    delta: clamp(Math.floor(Number(effect && effect.delta) || 0), -6, 6),
    applyTo: normalize(effect && effect.applyTo) === "self" ? "self" : "attacker",
    trigger: normalize(effect && effect.trigger) === "attacked" ? "attacked" : "damaged",
    triggerOncePerTurn: Boolean(effect && effect.triggerOncePerTurn),
    persistUntilTrigger: Boolean(effect && effect.persistUntilTrigger),
    consumeOnTrigger: Boolean(effect && effect.consumeOnTrigger),
    lastTriggeredTurn: 0
  });
};
const cleanupExpiredEffects = (state) => {
  if (!state) return;
  state.timedEffects = (state.timedEffects || []).filter((e) => Number(e.turns) > 0);
  state.onDamagedEffects = (state.onDamagedEffects || []).filter((e) => e && (e.persistUntilTrigger || Number(e.turns) > 0));
};
const cleanupTeamTimedEffects = (scene) => {
  if (!scene || !Array.isArray(scene.teamTimedEffects)) return;
  scene.teamTimedEffects = scene.teamTimedEffects.filter((e) => e && normalize(e.kind) && Math.max(0, Number(e.turns) || 0) > 0);
};
const pushBattleLog = (scene, text) => {
  if (!scene || !text) return;
  if (!Array.isArray(scene.logs)) scene.logs = [];
  scene.logs.push(String(text));
};
const restoreSkillListPpFull = (skills) => {
  let changed = 0;
  (Array.isArray(skills) ? skills : []).forEach((s) => {
    if (!s) return;
    const before = Math.max(0, Number(s.pp) || 0);
    const max = Math.max(1, Number(s.ppMax) || before || Number(s.pp) || 1);
    s.ppMax = Math.max(max, before);
    s.pp = s.ppMax;
    changed += Math.max(0, s.pp - before);
  });
  return changed;
};
const restoreSidePpFull = (scene, side) => {
  const primary = battleSkillListForSide(scene, side);
  let changed = restoreSkillListPpFull(primary);
  if (side === "attacker" && Array.isArray(scene && scene.team)) {
    const idx = scene.team.findIndex((u) => u && u.id === scene.currentAttackerId);
    const teamSkills = idx >= 0 && Array.isArray(scene.team[idx].skills) ? scene.team[idx].skills : null;
    if (teamSkills && teamSkills !== primary) changed += restoreSkillListPpFull(teamSkills);
  }
  return changed;
};
const restoreSideFullStatus = (scene, side, options = {}) => {
  if (!scene) return { healed: 0, ppChanged: 0, clearedStatuses: [], clearedStages: [] };
  const hpKey = side === "attacker" ? "attackerHp" : "targetHp";
  const maxHpKey = side === "attacker" ? "attackerMaxHp" : "targetMaxHp";
  const before = Math.max(0, Number(scene[hpKey]) || 0);
  const maxHp = Math.max(1, Number(scene[maxHpKey]) || 1);
  scene[hpKey] = maxHp;
  if (side === "attacker" && Array.isArray(scene.team)) {
    const petIdx = scene.team.findIndex((u) => u && u.id === scene.currentAttackerId);
    if (petIdx >= 0) {
      scene.team[petIdx].hp = clamp(maxHp, 0, Number(scene.team[petIdx].maxHp) || maxHp);
      scene.team[petIdx].battleState = normalizeBattleState(scene.attackerState);
    }
  }
  const state = getSideState(scene, side);
  const clearedStatuses = Object.keys(state.statuses || {}).filter((key) => Math.max(0, Number(state.statuses[key]) || 0) > 0);
  clearedStatuses.forEach((key) => { state.statuses[key] = 0; });
  const ppChanged = restoreSidePpFull(scene, side);
  const resetStageMode = getRestoreStageResetMode(options.resetStages);
  const clearedStages = resetStageMode ? clearStageByMode(scene, side, resetStageMode, ALL_ABILITY_STAGE_KEYS.slice()) : [];
  syncBattleUiHpForSide(scene, side);
  return { healed: Math.max(0, maxHp - before), ppChanged, clearedStatuses, clearedStages };
};
const tryFullRestoreOnDefeatThisTurn = (scene, side) => {
  if (!scene) return false;
  if (scene.forceDefeatSide === side && normalize(scene.forceDefeatReason) === "selfKo") return false;
  const hpKey = side === "attacker" ? "attackerHp" : "targetHp";
  const maxHpKey = side === "attacker" ? "attackerMaxHp" : "targetMaxHp";
  if ((Number(scene[hpKey]) || 0) > 0 && scene.forceDefeatSide !== side) return false;
  const state = getSideState(scene, side);
  cleanupExpiredEffects(state);
  const idx = (state.timedEffects || []).findIndex((e) => normalize(e && e.kind) === "fullRestoreOnDefeatThisTurn" && Math.max(0, Number(e && e.turns) || 0) > 0);
  if (idx < 0) return false;
  state.timedEffects.splice(idx, 1);
  const maxHp = Math.max(1, Number(scene[maxHpKey]) || 1);
  const before = Math.max(0, Number(scene[hpKey]) || 0);
  scene[hpKey] = maxHp;
  if (side === "attacker" && Array.isArray(scene.team)) {
    const petIdx = scene.team.findIndex((u) => u && u.id === scene.currentAttackerId);
    if (petIdx >= 0) {
      scene.team[petIdx].hp = clamp(maxHp, 0, Number(scene.team[petIdx].maxHp) || maxHp);
      scene.team[petIdx].battleState = normalizeBattleState(scene.attackerState);
    }
  }
  const ppChanged = restoreSidePpFull(scene, side);
  syncBattleUiHpForSide(scene, side);
  if (side === "attacker") {
    scene.fxAttackerDefeated = false;
    scene.healOnAttacker = `+${Math.max(0, maxHp - before)}`;
    if (ppChanged > 0) scene.ppOnAttacker = `PP+${ppChanged}`;
  } else {
    scene.fxTargetDefeated = false;
    scene.healOnTarget = `+${Math.max(0, maxHp - before)}`;
    if (ppChanged > 0) scene.ppOnTarget = `PP+${ppChanged}`;
  }
  if (scene.forceDefeatSide === side) scene.forceDefeatSide = "";
  if (!scene.forceDefeatSide) scene.forceDefeatReason = "";
  markBattleFloatText(scene);
  pushBattleLog(scene, `${side === "attacker" ? scene.attackerName : scene.targetName}的意念无限生效，体力值和PP值全部回复。`);
  return true;
};
const statusLabel = (k) => STATUS_LABEL_MAP[k] || k;
const buildStatusBadges = (state) => {
  const s = normalizeBattleState(state);
  const out = [];
  Object.keys(STATUS_LABEL_MAP).forEach((k) => {
    const turns = Math.max(0, Number(s.statuses[k]) || 0);
    if (turns > 0) out.push({ key: k, label: statusLabel(k), turns, desc: `${statusLabel(k)}，剩余${turns}回合` });
  });
  if (s.skipTurns > 0) out.push({ key: "skip", label: "停行动", turns: s.skipTurns, desc: `无法行动，剩余${s.skipTurns}回合` });
  return out;
};
const isElementSide = (scene, side, elementName) => {
  const target = normalizeElementName(elementName);
  if (!scene || !target) return false;
  const main = normalizeElementName(side === "attacker" ? scene.attackerElement : scene.targetElement);
  const sub = normalizeElementName(side === "attacker" ? scene.attackerSubElement : scene.targetSubElement);
  return main === target || sub === target;
};
const isStatusImmuneByElement = (scene, side, status) => {
  if (status === "burn") return isElementSide(scene, side, "火系");
  if (status === "freeze") return isElementSide(scene, side, "冰系");
  if (status === "poison") return isElementSide(scene, side, "机械系");
  if (status === "leech") return isElementSide(scene, side, "木系") || isElementSide(scene, side, "机械系");
  return false;
};
const DAMAGE_STATUS_KEYS = ["poison", "burn", "freeze", "leech", "bind", "weak"];
const clearSleepIfDamageStatusExists = (state) => {
  if (!state || !state.statuses) return false;
  const hasDamageStatus = DAMAGE_STATUS_KEYS.some((k) => Math.max(0, Number(state.statuses[k]) || 0) > 0);
  if (hasDamageStatus && Math.max(0, Number(state.statuses.sleep) || 0) > 0) {
    state.statuses.sleep = 0;
    return true;
  }
  return false;
};
const timedEffectBadgeMeta = (e) => {
  const kind = normalize(e && e.kind);
  const turns = Math.max(0, Number(e && e.turns) || 0);
  const d = e && e.data ? e.data : {};
  const status = normalize(d.status || e.status);
  if (STATUS_LABEL_MAP[status]) {
    return { key: `status_fx_${status}`, label: STATUS_LABEL_MAP[status], turns, desc: `${STATUS_LABEL_MAP[status]}，剩余${turns}回合`, tone: "debuff" };
  }
  if (kind === "damageReduction") {
    const ratio = Math.round((Number(d.ratio) || 0) * 100);
    return { key: `dr_${ratio}`, label: `减伤${ratio}%`, turns, desc: d.permanent ? `受到伤害降低${ratio}%，整场有效` : `受到伤害降低${ratio}%，剩余${turns}回合`, tone: "buff" };
  }
  if (kind === "hitRateBoost") {
    const ratio = Math.round((Number(d.ratio) || 0) * 100);
    return { key: `hit_rate_boost_${ratio}`, label: `命中+${ratio}%`, turns, desc: d.permanent ? `命中率提升${ratio}%，整场有效` : `命中率提升${ratio}%，剩余${turns}回合`, tone: "buff" };
  }
  if (kind === "typedDamageReduction") {
    const ratio = Math.round((Number(d.ratio) || 0) * 100);
    const attackKind = normalize(d.attackKind) || "all";
    const attackLabel = attackKind === "physical" ? "普攻" : (attackKind === "special" ? "特攻" : "攻击");
    return { key: `tdr_${attackKind}_${ratio}`, label: `${attackLabel}减伤${ratio}%`, turns, desc: `受到${attackLabel}伤害降低${ratio}%，剩余${turns}回合`, tone: "buff" };
  }
  if (kind === "elementPowerBuff") {
    const factorRaw = Number(d.factor) || 1;
    const factor = Math.round(factorRaw * 100);
    const deltaPct = Math.round((factorRaw - 1) * 100);
    const sign = deltaPct >= 0 ? "+" : "";
    const element = normalize(d.element) || "未知系";
    const action = deltaPct >= 0 ? "提升" : "降低";
    return {
      key: `ep_${element}_${factor}`,
      label: `${element}威力${sign}${deltaPct}%`,
      turns,
      desc: `${element}技能威力${action}${Math.abs(deltaPct)}%（当前${factor}%），剩余${turns}回合`,
      tone: deltaPct >= 0 ? "buff" : "debuff"
    };
  }
  if (kind === "damageBoost") {
    const factorRaw = Number(d.factor) || 1;
    const deltaPct = Math.round((factorRaw - 1) * 100);
    const sign = deltaPct >= 0 ? "+" : "";
    const descTail = d.permanent ? "整场有效" : `剩余${turns}回合`;
    return { key: `damage_boost_${Math.round(factorRaw * 100)}`, label: `伤害${sign}${deltaPct}%`, turns, desc: `造成伤害提升${Math.abs(deltaPct)}%，${descTail}`, tone: deltaPct >= 0 ? "buff" : "debuff" };
  }
  if (kind === "targetElementDamageBoost") {
    const factorRaw = Number(d.factor) || 1;
    const deltaPct = Math.round((factorRaw - 1) * 100);
    const sign = deltaPct >= 0 ? "+" : "";
    const element = normalize(d.targetElement) || "指定系别";
    const descTail = d.permanent ? "整场有效" : `剩余${turns}回合`;
    return { key: `target_element_damage_boost_${element}_${Math.round(factorRaw * 100)}`, label: `对${element}伤害${sign}${deltaPct}%`, turns, desc: `攻击${element}目标时造成伤害提升${Math.abs(deltaPct)}%，${descTail}`, tone: deltaPct >= 0 ? "buff" : "debuff" };
  }
  if (kind === "damagePowerTransfer") {
    const ratio = Math.round((Number(d.ratio) || 0) * 100);
    return { key: `damage_power_transfer_${ratio}`, label: `伤害吸取${ratio}%`, turns, desc: `每回合吸取对方伤害能力${ratio}%，剩余${turns}回合`, tone: "buff" };
  }
  if (kind === "damagePowerDrainStack") {
    const ratio = Math.round((Number(d.ratio) || 0) * 100);
    return { key: `damage_power_drain_${ratio}`, label: `伤害-${ratio}%`, turns, desc: `造成伤害降低${ratio}%，剩余${turns}回合`, tone: "debuff" };
  }
  if (kind === "fatalDragonShadow") {
    return { key: "fatal_dragon_shadow", label: "致命龙影", turns, desc: `对方使用攻击技能时继续吸取5%伤害抗性，剩余${turns}回合`, tone: "buff" };
  }
  if (kind === "healOverTime") {
    const ratio = Number(d.ratio) || 0;
    const pct = Math.max(1, Math.round(ratio * 100));
    return { key: `hot_${pct}`, label: `回血${pct}%`, turns, desc: `每回合回复最大体力${pct}%，剩余${turns}回合`, tone: "buff" };
  }
  if (kind === "endTurnHealFlat") {
    const amount = Math.max(1, Math.floor(Number(d.amount) || 1));
    return { key: `flat_hot_${amount}`, label: `回血${amount}`, turns, desc: `回合结束回复${amount}点体力，剩余${turns}回合`, tone: "buff" };
  }
  if (kind === "endTurnHealFlatRange") {
    const min = Math.max(1, Math.floor(Number(d.min) || 1));
    const max = Math.max(min, Math.floor(Number(d.max) || min));
    return { key: `flat_hot_range_${min}_${max}`, label: `回血${min}-${max}`, turns, desc: `回合结束回复${min}-${max}点体力，剩余${turns}回合`, tone: "buff" };
  }
  if (kind === "endTurnSetHpToOne") {
    return { key: "end_turn_set_hp_to_one", label: "回合末濒死", turns, desc: `回合结束时体力降至1点，剩余${turns}回合`, tone: "debuff" };
  }
  if (kind === "endTurnHealByLostHp") {
    return { key: "lost_hp_hot", label: "战魂回血", turns, desc: `回合结束按已损失体力回复，剩余${turns}回合`, tone: "buff" };
  }
  if (kind === "lifestealBuff") {
    const amount = Math.max(0, Math.floor(Number(d.amount) || 0));
    const ratio = Math.round((Number(d.ratio) || 0) * 100);
    const label = amount > 0 ? `攻击回血${amount}` : `嗜血${ratio}%`;
    const desc = amount > 0 ? `攻击造成伤害后回复${amount}点体力，剩余${turns}回合` : `攻击造成伤害后回复${ratio}%体力，剩余${turns}回合`;
    return { key: amount > 0 ? `attack_heal_${amount}` : `lifesteal_${ratio}`, label, turns, desc, tone: "buff" };
  }
  if (kind === "fullRestoreOnDefeatThisTurn") {
    return { key: "full_restore_on_defeat", label: "意念无限", turns, desc: `本回合被击败时体力和PP全部恢复，剩余${turns}回合`, tone: "buff" };
  }
  if (kind === "damageShield") {
    const amount = Math.max(1, Math.floor(Number(d.amount) || 1));
    return { key: `damage_shield_${amount}`, label: `护盾${amount}`, turns, desc: `每次被攻击减少${amount}点伤害，剩余${turns}回合`, tone: "buff" };
  }
  if (kind === "damageShieldByDamage") {
    const amount = Math.max(1, Math.floor(Number(d.amount) || 1));
    return { key: `damage_shield_by_damage_${amount}`, label: `伤害护盾${amount}`, turns, desc: `由伤害转化的护盾，可抵抗${amount}点伤害，剩余${turns}回合`, tone: "buff" };
  }
  if (kind === "timedStage") {
    const delta = Number(d.delta) || 0;
    const keys = Array.isArray(d.keys) ? d.keys : [];
    const act = delta >= 0 ? "提升" : "降低";
    return { key: `timed_stage_${keys.join("_")}_${delta}`, label: `每回合${act}`, turns, desc: `每回合${act}${Math.abs(delta)}级：${keys.map((k) => battleStatLabel(k)).join("、") || "能力等级"}，剩余${turns}回合`, tone: delta >= 0 ? "buff" : "debuff" };
  }
  if (kind === "abilityStatFactor") {
    const factor = clamp(Number(d.factor) || 1, 0.01, 3);
    const keys = Array.isArray(d.keys) ? d.keys : [];
    const ratio = Math.round(Math.max(0, 1 - factor) * 100);
    const label = `${keys.map((k) => battleStatLabel(k)).join("") || "能力"}-${ratio}%`;
    return { key: `ability_factor_${keys.join("_")}_${factor}`, label, turns, desc: `${keys.map((k) => battleStatLabel(k)).join("、") || "能力数值"}降低${ratio}%，剩余${turns}回合，可叠加`, tone: "debuff" };
  }
  if (kind === "elementDamageReduction") {
    const element = normalize(d.element) || "全系";
    const ratio = Math.round((Number(d.ratio) || 0) * 100);
    return { key: `element_dr_${element}_${ratio}`, label: `${element}减伤${ratio}%`, turns, desc: d.permanent ? `${element}攻击伤害降低${ratio}%，整场有效` : `${element}攻击伤害降低${ratio}%，剩余${turns}回合`, tone: "buff" };
  }
  if (kind === "elementChange") {
    const element = normalize(d.element) || "未知系";
    return { key: `element_change_${element}`, label: `变为${element}`, turns, desc: `当前临时变为${element}，剩余${turns}回合`, tone: "buff" };
  }
  if (kind === "lastStand") {
    return { key: "last_stand", label: "不灭意志", turns, desc: `受到致命伤害时至少保留1点体力，剩余${turns}回合`, tone: "buff" };
  }
  if (kind === "attackImmunity") {
    const attackKind = normalize(d.attackKind) || "all";
    const chance = Math.round((Number(d.chance) || 1) * 100);
    const exceptElements = Array.isArray(d.exceptElements) ? d.exceptElements.map(normalize).filter(Boolean) : [];
    const exceptText = exceptElements.length > 0 ? `（${exceptElements.join("、")}除外）` : "";
    const label = attackKind === "physical" ? "免疫普攻" : (attackKind === "special" ? "免疫特攻" : "攻击免疫");
    const desc = `${chance}%概率免受${attackKind === "physical" ? "普通攻击" : (attackKind === "special" ? "特殊攻击" : "攻击")}伤害${exceptText}，剩余${turns}回合`;
    return { key: `immune_${attackKind}_${chance}`, label, turns, desc, tone: "buff" };
  }
  if (kind === "damageAbsorb") {
    return { key: "damage_absorb", label: "伤害吸收", turns, desc: `完全吸收受到的伤害并回复体力，剩余${turns}回合`, tone: "buff" };
  }
  if (kind === "damageReflect") {
    const ratio = Number(d.ratio) || 1;
    const attackKind = normalize(d.attackKind) || "all";
    const label = attackKind === "physical" ? "反弹普攻" : (attackKind === "special" ? "反弹特攻" : "伤害反弹");
    return { key: `reflect_${attackKind}_${Math.round(ratio * 100)}`, label, turns, desc: `受到${attackKind === "physical" ? "普通攻击" : (attackKind === "special" ? "特殊攻击" : "攻击")}伤害后反弹${Math.round(ratio * 100)}%，剩余${turns}回合`, tone: "buff" };
  }
  if (kind === "damageReflectFlat") {
    const amount = Math.max(1, Math.floor(Number(d.amount) || 1));
    return { key: `reflect_flat_${amount}`, label: `反弹${amount}`, turns, desc: `受到攻击后反弹${amount}点伤害，剩余${turns}回合`, tone: "buff" };
  }
  if (kind === "statusShield") {
    return { key: "status_shield", label: "异常免疫", turns, desc: `免疫异常状态，剩余${turns}回合`, tone: "buff" };
  }
  if (kind === "skillSealChance") {
    const chance = Math.round((Number(d.chance) || 0) * 100);
    return { key: `skill_seal_${chance}`, label: "无法使用技能", turns, desc: `${chance}%概率无法使用技能，剩余${turns}回合`, tone: "debuff" };
  }
  if (kind === "stageGuard") {
    const mode = normalize(d.mode) || "debuff";
    const label = mode === "buff" ? "防止提升" : (mode === "all" ? "能力保护" : "防止削弱");
    const desc = mode === "buff"
      ? `属性能力等级不能被提升，剩余${turns}回合`
      : (mode === "all" ? `属性能力等级不会变化，剩余${turns}回合` : `属性能力等级不会被削弱，剩余${turns}回合`);
    return { key: `stage_guard_${mode}`, label, turns, desc, tone: "buff" };
  }
  if (kind === "mirrorOpponentStageBoost") {
    const multiplier = Math.max(1, Math.floor(Number(d.multiplier) || 1));
    const label = multiplier > 1 ? "翻倍同步" : "同步强化";
    const desc = multiplier > 1
      ? `对方提升能力等级时，自己翻倍同步提升，剩余${turns}回合`
      : `对方提升能力等级时，自己同步提升，剩余${turns}回合`;
    return { key: `mirror_stage_boost_${multiplier}`, label, turns, desc, tone: "buff" };
  }
  if (kind === "delayedStage") {
    const delta = Number(d.delta) || 0;
    const keys = Array.isArray(d.keys) ? d.keys : [];
    const action = delta >= 0 ? "提升" : "降低";
    return {
      key: `ds_${keys.join("_")}_${delta}`,
      label: `延时${action}`,
      turns,
      desc: `${turns}回合后${action}${Math.abs(delta)}级：${keys.map((k) => battleStatLabel(k)).join("、") || "能力等级"}`,
      tone: delta >= 0 ? "buff" : "debuff"
    };
  }
  if (kind === "defenseHalve") {
    return { key: "def_halve", label: "防御减半", turns, desc: "防御值减半（不可叠加）", tone: "debuff" };
  }
  if (kind === "diceDrain") {
    const amount = Math.max(1, Number(e && e.data && e.data.amountPerPip) || 30);
    const pip = clamp(Math.floor(Number(e && e.data && e.data.pip) || 1), 1, 6);
    const label = normalize(e && e.data && e.data.label) || "骰子炸弹";
    return { key: `dice_drain_${label}`, label, turns, desc: `本次投掷${pip}点，每回合被吸取${pip * amount}体力，剩余${turns}回合`, tone: "debuff" };
  }
  if (kind === "lockGodDrain") {
    const label = normalize(d.label) || "锁神诀";
    const flat = Math.floor(Number(d.flat) || 0);
    const ratio = Number(d.ratio) || (1 / 16);
    const desc = flat > 0 ? `每回合扣除${flat}点体力，剩余${turns}回合` : `每回合扣除最大体力值的${Math.round(ratio * 10000) / 100}%，剩余${turns}回合`;
    return { key: `lock_god_drain_${label}`, label, turns, desc, tone: "debuff" };
  }
  if (kind === "flatDrain") {
    const label = normalize(d.label) || "吸附";
    const amount = Math.max(1, Math.floor(Number(d.amount) || 1));
    return { key: `flat_drain_${label}`, label, turns, desc: `每回合被吸取${amount}点体力，剩余${turns}回合`, tone: "debuff" };
  }
  if (kind === "mutualEndTurnDamageFlat") {
    const amount = Math.max(1, Math.floor(Number(d.amount) || 1));
    return { key: `mutual_flat_${amount}`, label: "腐蚀酸云", turns, desc: `每回合受到${amount}点伤害，剩余${turns}回合`, tone: "debuff" };
  }
  if (kind === "destinyBond") {
    return { key: "destiny_bond", label: "同归于尽", turns, desc: `本回合若被对手打败则双方同归于尽，剩余${turns}回合`, tone: "buff" };
  }
  if (kind === "globalStageGuard") {
    const mode = normalize(d.mode) || "all";
    const label = mode === "buff" ? "全场防提升" : (mode === "debuff" ? "全场防削弱" : "全场属性保护");
    const desc = mode === "buff"
      ? `全场能力等级不能被提升，剩余${turns}回合`
      : (mode === "debuff" ? `全场能力等级不能被削弱，剩余${turns}回合` : `全场能力等级不会变化，剩余${turns}回合`);
    return { key: `global_stage_guard_${mode}`, label, turns, desc, tone: "buff" };
  }
  if (kind === "battleBackgroundOverride") {
    const label = normalize(d.label) || "星神之域";
    return { key: "battle_background_override", label, turns, desc: `${label}改变战斗背景，剩余${turns}回合`, tone: "buff" };
  }
  if (kind === "turnSequenceAttack") {
    const skill = d.skill && typeof d.skill === "object" ? d.skill : {};
    const skillName = normalize(skill.name) || "连续攻击";
    return { key: `turn_sequence_${skillName}`, label: skillName, turns, desc: `${skillName}延续攻击，剩余${turns}回合`, tone: "buff" };
  }
  const fallbackLabels = {
    critStageHold: { label: "暴击锁定", tone: "buff" },
    endTurnDamageByMaxHpChance: { label: "回合末扣血", tone: "debuff" },
    endTurnStageChance: { label: "回合末能力变化", tone: "debuff" },
    endTurnClearStageChance: { label: "回合末清除属性", tone: "debuff" },
    endTurnStageAndStatusChance: { label: "回合末能力异常", tone: "debuff" },
    timedRandomStage: { label: "随机能力变化", tone: "buff" },
    delayedKo: { label: "延迟击倒", tone: "debuff" }
  };
  if (fallbackLabels[kind]) {
    const meta = fallbackLabels[kind];
    return { key: kind, label: meta.label, turns, desc: `${meta.label}剩余${turns}回合`, tone: meta.tone };
  }
  const fallbackLabel = normalize(d.label || e.label || kind) || "效果";
  return { key: kind || fallbackLabel || "effect", label: fallbackLabel, turns, desc: `${fallbackLabel}剩余${turns}回合`, tone: "buff" };
};
const onDamagedBadgeMeta = (e) => {
  const turns = Math.max(0, Number(e && e.turns) || 0);
  if (turns <= 0 && !(e && e.persistUntilTrigger)) return null;
  const trigger = normalize(e && e.trigger) === "attacked" ? "受击后" : "受伤后";
  const applyTo = normalize(e && e.applyTo) === "self" ? "自身" : "攻击方";
  const delta = Number(e && e.delta) || Number(e && e.allStatsDelta) || 0;
  const keys = Array.isArray(e && e.keys) ? e.keys : [];
  const what = keys.length > 0 ? keys.map((k) => battleStatLabel(k)).join("、") : "全属性";
  const act = delta >= 0 ? "提升" : "降低";
  const label = normalize(e && e.label) || "受击反制";
  const durationText = e && e.persistUntilTrigger ? (trigger === "受击后" ? "受到攻击前有效" : "受到伤害前有效") : `剩余${turns}回合`;
  return {
    key: `od_${trigger}_${applyTo}_${what}_${delta}`,
    label,
    turns,
    durationLabel: e && e.persistUntilTrigger ? (trigger === "受击后" ? "受击前有效" : "受伤前有效") : undefined,
    desc: `${trigger}使${applyTo}${act}${Math.abs(delta)}级：${what}，${durationText}`,
    tone: delta >= 0 ? "buff" : "debuff"
  };
};
const buildQixingPassiveEffectBadges = (scene, side) => {
  if (!scene) return [];
  const itemId = side === "attacker" ? scene.attackerBattleItemId : scene.targetBattleItemId;
  if (normalize(itemId) !== QIXING_SEAL_ITEM_ID) return [];
  const traitKey = side === "attacker" ? scene.attackerQixingSealTraitKey : scene.targetQixingSealTraitKey;
  const level = clamp(Math.floor(Number(side === "attacker" ? scene.attackerQixingSealLevel : scene.targetQixingSealLevel) || 1), 1, QIXING_SEAL_MAX_LEVEL);
  const meta = getQixingTraitMetaByKey(traitKey);
  const rule = getQixingTraitBattleRuleByKey(traitKey, level);
  const key = normalizeQixingTraitKey(meta && meta.key);
  const out = [];
  const damageBonus = clamp(Number(rule.damageBonus) || 0, 0, 9);
  if (damageBonus > 0) {
    const pct = Math.round(damageBonus * 100);
    out.push({
      key: `qixing_damage_bonus_${key}_${level}_${pct}`,
      label: `伤害+${pct}%`,
      turns: 1,
      durationLabel: "整场有效",
      desc: `${meta.name}Lv.${level}：造成伤害提升${pct}%，整场有效`,
      tone: "buff"
    });
  }
  const resistance = clamp(Number(rule.resistance) || 0, 0, 0.95);
  if (resistance > 0) {
    const pct = Math.round(resistance * 100);
    out.push({
      key: `qixing_resistance_${key}_${level}_${pct}`,
      label: `伤抗+${pct}%`,
      turns: 1,
      durationLabel: "整场有效",
      desc: `${meta.name}Lv.${level}：伤害抗性提升${pct}%，整场有效`,
      tone: "buff"
    });
  }
  return out;
};
const buildTimedEffectBadges = (scene, side) => {
  const sideState = getSideState(scene, side);
  const own = sideState.timedEffects || [];
  const global = Array.isArray(scene && scene.globalTimedEffects) ? scene.globalTimedEffects : [];
  const fxBadges = own.concat(global).map((e) => timedEffectBadgeMeta(e)).filter((x) => x && x.turns > 0);
  if (side === "target") {
    const challengeRatio = clamp(Number(scene && scene.targetChallengeDamageReductionRatio) || 0, 0, 0.95);
    if (challengeRatio > 0) {
      const pct = Math.round(challengeRatio * 100);
      fxBadges.unshift({
        key: `challenge_damage_reduction_${pct}`,
        label: `挑战减伤${pct}%`,
        turns: 1,
        durationLabel: "整场有效",
        desc: `普通/特殊攻击造成的伤害减少${pct}%`,
        tone: "buff"
      });
    }
  }
  const passiveBadges = buildQixingPassiveEffectBadges(scene, side);
  const onDamagedBadges = (sideState.onDamagedEffects || []).map((e) => onDamagedBadgeMeta(e)).filter(Boolean);
  const out = [];
  const seen = new Set();
  fxBadges.concat(passiveBadges, onDamagedBadges).forEach((badge) => {
    const key = `${badge.key}|${badge.label}|${badge.tone}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push(badge);
  });
  return out;
};
const statusChanceFromDesc = (desc, statusKeyword = "", fallback = 1) => {
  const t = normalize(desc);
  const norm = t.replace(/％/g, "%");
  if (statusKeyword) {
    const s = String(statusKeyword).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const nearFront = norm.match(new RegExp(`((?:\\d+(?:\\.\\d+)?\\s*%)|(?:\\d+\\s*\\/\\s*\\d+)|(?:一半))[^。；，\\n]{0,18}${s}`));
    if (nearFront) {
      const ratio = parseRatioFromText(nearFront[1], null);
      if (Number.isFinite(ratio)) return clamp(Number(ratio), 0, 1);
    }
    const nearBack = norm.match(new RegExp(`${s}[^。；，\\n]{0,18}((?:\\d+(?:\\.\\d+)?\\s*%)|(?:\\d+\\s*\\/\\s*\\d+)|(?:一半))`));
    if (nearBack) {
      const ratio = parseRatioFromText(nearBack[1], null);
      if (Number.isFinite(ratio)) return clamp(Number(ratio), 0, 1);
    }
  }
  const ratio = parseRatioFromText(norm, null);
  if (!Number.isFinite(ratio)) return clamp(Number(fallback) || 1, 0, 1);
  return clamp(Number(ratio), 0, 1);
};
const tickSideEffects = (scene, side) => {
  const state = getSideState(scene, side);
  (state.timedEffects || []).forEach((e) => {
    if (normalize(e && e.kind) === "turnSequenceAttack") return;
    if (normalize(e && e.kind) === "nextAttackMustHit") return;
    if (normalize(e && e.kind) === "lifestealBuff" && e.data && e.data.consumeOnAttack) return;
    e.turns = Math.max(0, Number(e.turns) - 1);
    if (normalize(e && e.kind) === "critStageHold" && Number(e.turns) <= 0 && Number.isFinite(Number(e.data && e.data.previousValue))) {
      state.critStage = clamp(Math.floor(Number(e.data.previousValue) || 0), -6, 6);
      pushBattleLog(scene, `${side === "attacker" ? scene.attackerName : scene.targetName}的暴击等级恢复至${state.critStage}级。`);
    }
  });
  (state.onDamagedEffects || []).forEach((e) => {
    if (e && e.persistUntilTrigger) return;
    e.turns = Math.max(0, Number(e.turns) - 1);
  });
  cleanupExpiredEffects(state);
};
const getDamageReductionFactor = (scene, side, atkKind = "all") => {
  const state = getSideState(scene, side);
  const challengeBaseRatio = side === "target" ? clamp(Number(scene && scene.targetChallengeDamageReductionRatio) || 0, 0, 0.95) : 0;
  const traitKey = side === "attacker" ? scene && scene.attackerQixingSealTraitKey : scene && scene.targetQixingSealTraitKey;
  const traitLevel = side === "attacker" ? scene && scene.attackerQixingSealLevel : scene && scene.targetQixingSealLevel;
  const traitRule = getQixingTraitBattleRuleByKey(traitKey, traitLevel);
  const traitResistance = normalize(side === "attacker" ? scene && scene.attackerBattleItemId : scene && scene.targetBattleItemId) === QIXING_SEAL_ITEM_ID
    ? clamp(Number(traitRule.resistance) || 0, 0, 0.95)
    : 0;
  const skinResistance = isQiankunXiuluoshenSkinBattleActive(scene, side)
    ? clamp(QIANKUN_XIULUOSHEN_SKIN_RESISTANCE_BONUS, 0, 0.95)
    : 0;
  let regularRatio = 0;
  let stackRatio = traitResistance + skinResistance;
  (state.timedEffects || []).forEach((e) => {
    if (e.kind === "damageReduction") {
      const value = clamp(Number(e.data && e.data.ratio) || 0, 0, 0.95);
      if (e.data && (e.data.stackWithChallenge || e.data.stackable)) stackRatio += value;
      else regularRatio = Math.max(regularRatio, value);
    }
    if (normalize(e && e.kind) === "typedDamageReduction") {
      const guardKind = normalize(e.data && e.data.attackKind) || "all";
      if (guardKind === "all" || guardKind === normalize(atkKind)) {
        const value = clamp(Number(e.data && e.data.ratio) || 0, 0, 0.95);
        if (e.data && e.data.stackWithChallenge) stackRatio += value;
        else regularRatio = Math.max(regularRatio, value);
      }
    }
  });
  const ratio = clamp(Math.max(challengeBaseRatio, regularRatio) + stackRatio, 0, 0.95);
  return 1 - ratio;
};
const getDamageShieldAmount = (scene, side) => {
  const state = getSideState(scene, side);
  let amount = 0;
  (state.timedEffects || []).forEach((e) => {
    if (normalize(e && e.kind) !== "damageShield" && normalize(e && e.kind) !== "damageShieldByDamage") return;
    amount = Math.max(amount, Math.floor(Number(e.data && e.data.amount) || 0));
  });
  return amount;
};
const useDamageShieldAmount = (scene, side, incomingDamage) => {
  const state = getSideState(scene, side);
  const candidates = (state.timedEffects || []).filter((e) => {
    const kind = normalize(e && e.kind);
    return (kind === "damageShield" || kind === "damageShieldByDamage") && Math.max(0, Number(e && e.turns) || 0) > 0;
  });
  if (candidates.length === 0) return { amount: 0, label: "银光护盾" };
  let best = null;
  let bestRemain = 0;
  candidates.forEach((e) => {
    if (!e.data || typeof e.data !== "object") e.data = {};
    const kind = normalize(e.kind);
    const amount = Math.max(0, Math.floor(Number(e.data.amount) || 0));
    const remain = kind === "damageShield" ? amount : Math.max(0, amount);
    if (remain > bestRemain) {
      best = e;
      bestRemain = remain;
    }
  });
  if (!best || bestRemain <= 0) return { amount: 0, label: "银光护盾" };
  const used = Math.min(bestRemain, Math.max(0, Math.floor(Number(incomingDamage) || 0)));
  const kind = normalize(best.kind);
  if (kind === "damageShieldByDamage") {
    best.data.amount = Math.max(0, Math.floor(Number(best.data.amount) || 0) - used);
  }
  const label = kind === "damageShieldByDamage" ? "伤害护盾" : "银光护盾";
  return { amount: used, label };
};
const hasActiveSilverLightShield = (scene, side) => {
  const state = getSideState(scene, side);
  return (state.timedEffects || []).some((e) => {
    return normalize(e && e.kind) === "damageShield"
      && Math.max(0, Number(e && e.turns) || 0) > 0
      && Math.max(0, Number(e.data && e.data.amount) || 0) > 0;
  });
};
const getElementDamageReductionFactor = (scene, side, skillElement) => {
  const state = getSideState(scene, side);
  let ratio = 0;
  (state.timedEffects || []).forEach((e) => {
    if (normalize(e && e.kind) !== "elementDamageReduction") return;
    const element = normalize(e.data && e.data.element);
    if (element && element !== "all" && element !== normalize(skillElement)) return;
    ratio = Math.max(ratio, clamp(Number(e.data && e.data.ratio) || 0, 0, 0.95));
  });
  (Array.isArray(scene && scene.globalTimedEffects) ? scene.globalTimedEffects : []).forEach((e) => {
    if (normalize(e && e.kind) !== "elementDamageReduction") return;
    const element = normalize(e.data && e.data.element);
    if (element && element !== "all" && element !== normalize(skillElement)) return;
    ratio = Math.max(ratio, clamp(Number(e.data && e.data.ratio) || 0, 0, 0.95));
  });
  return 1 - ratio;
};
const hasLastStandEffect = (scene, side) => {
  const state = getSideState(scene, side);
  return (state.timedEffects || []).some((e) => normalize(e && e.kind) === "lastStand" && Math.max(0, Number(e && e.turns) || 0) > 0);
};
const getAttackImmunityEffect = (scene, side, atkKind, skillElement = "") => {
  if (atkKind !== "physical" && atkKind !== "special") return null;
  const state = getSideState(scene, side);
  const kind = atkKind === "special" ? "special" : "physical";
  const element = normalize(skillElement);
  cleanupExpiredEffects(state);
  const effects = (state.timedEffects || []).filter((e) => {
    if (normalize(e && e.kind) !== "attackImmunity") return false;
    if (Math.max(0, Number(e && e.turns) || 0) <= 0) return false;
    const d = e.data || {};
    const guardKind = normalize(d.attackKind) || "all";
    const exceptElements = Array.isArray(d.exceptElements) ? d.exceptElements.map(normalize).filter(Boolean) : [];
    if (element && exceptElements.includes(element)) return false;
    return guardKind === "all" || guardKind === kind;
  });
  if (effects.length === 0) return null;
  return effects.reduce((best, cur) => {
    const bp = clamp(Number(best.data && best.data.chance) || 1, 0, 1);
    const cp = clamp(Number(cur.data && cur.data.chance) || 1, 0, 1);
    return cp > bp ? cur : best;
  }, effects[0]);
};
const getDamageAbsorbEffect = (scene, side) => {
  const state = getSideState(scene, side);
  cleanupExpiredEffects(state);
  return (state.timedEffects || []).find((e) => normalize(e && e.kind) === "damageAbsorb" && Math.max(0, Number(e && e.turns) || 0) > 0) || null;
};
const getEffectiveBattleElement = (scene, side) => {
  const state = getSideState(scene, side);
  cleanupExpiredEffects(state);
  const fx = [...(state.timedEffects || [])].reverse().find((e) => normalize(e && e.kind) === "elementChange" && Math.max(0, Number(e && e.turns) || 0) > 0);
  if (fx && normalize(fx.data && fx.data.element)) return normalize(fx.data.element);
  return side === "attacker" ? scene.attackerElement : scene.targetElement;
};
const getEffectiveBattleElements = (scene, side) => {
  const state = getSideState(scene, side);
  cleanupExpiredEffects(state);
  const fx = [...(state.timedEffects || [])].reverse().find((e) => normalize(e && e.kind) === "elementChange" && Math.max(0, Number(e && e.turns) || 0) > 0);
  if (fx && normalize(fx.data && fx.data.element)) return getElementList(fx.data.element);
  return side === "attacker"
    ? getElementList(scene.attackerElement, scene.attackerSubElement)
    : getElementList(scene.targetElement, scene.targetSubElement);
};
const getBattleElementFactor = (scene, skillElement, defenderSide) => (
  getElementFactorAgainstElements(skillElement, getEffectiveBattleElements(scene, defenderSide))
);
const getBattleSideStateSnapshot = (scene, side) => {
  if (!scene) return null;
  const state = side === "attacker" ? scene.attackerState : scene.targetState;
  return state && typeof state === "object" ? state : null;
};
const getEffectiveBattleElementsSnapshot = (scene, side) => {
  const state = getBattleSideStateSnapshot(scene, side);
  const effects = Array.isArray(state && state.timedEffects) ? state.timedEffects : [];
  const fx = [...effects].reverse().find((e) => normalize(e && e.kind) === "elementChange" && Math.max(0, Number(e && e.turns) || 0) > 0);
  if (fx && normalize(fx.data && fx.data.element)) return getElementList(fx.data.element);
  return side === "attacker"
    ? getElementList(scene && scene.attackerElement, scene && scene.attackerSubElement)
    : getElementList(scene && scene.targetElement, scene && scene.targetSubElement);
};
const getBattleElementFactorSnapshot = (scene, skillElement, defenderSide) => (
  getElementFactorAgainstElements(skillElement, getEffectiveBattleElementsSnapshot(scene, defenderSide))
);
const getDamageReflectEffects = (scene, side, atkKind) => {
  const state = getSideState(scene, side);
  cleanupExpiredEffects(state);
  return (state.timedEffects || []).filter((e) => {
    if (normalize(e && e.kind) !== "damageReflect") return false;
    if (Math.max(0, Number(e && e.turns) || 0) <= 0) return false;
    const guardKind = normalize(e.data && e.data.attackKind) || "all";
    return guardKind === "all" || guardKind === normalize(atkKind);
  });
};
const getDamageReflectFlatEffects = (scene, side, atkKind) => {
  const state = getSideState(scene, side);
  cleanupExpiredEffects(state);
  return (state.timedEffects || []).filter((e) => {
    if (normalize(e && e.kind) !== "damageReflectFlat") return false;
    if (Math.max(0, Number(e && e.turns) || 0) <= 0) return false;
    const guardKind = normalize(e.data && e.data.attackKind) || "all";
    return guardKind === "all" || guardKind === normalize(atkKind);
  });
};
const applyDirectHpDamage = (scene, side, amount) => {
  const hpKey = side === "attacker" ? "attackerHp" : "targetHp";
  const before = Math.max(0, Number(scene[hpKey]) || 0);
  scene[hpKey] = Math.max(hasLastStandEffect(scene, side) && before > 0 ? 1 : 0, before - Math.max(1, Math.floor(Number(amount) || 1)));
  const actual = Math.max(0, before - (Number(scene[hpKey]) || 0));
  recordBattleDamageTakenThisTurn(scene, side, actual);
  if (side === "attacker" && Array.isArray(scene.team)) {
    syncActivePetFromBattleScene(scene);
  }
  if (actual > 0) clearSleepAfterDamage(scene, side);
  syncBattleUiHpForSide(scene, side);
  return actual;
};
const recordBattleDamageTakenThisTurn = (scene, side, amount) => {
  if (!scene) return;
  const actual = Math.max(0, Math.floor(Number(amount) || 0));
  if (actual <= 0) return;
  const turnNo = Math.max(1, Math.floor(Number(scene.turnCount) || 1));
  const turnKey = side === "attacker" ? "attackerDamageTakenTurn" : "targetDamageTakenTurn";
  const amountKey = side === "attacker" ? "attackerDamageTakenThisTurn" : "targetDamageTakenThisTurn";
  if (Math.max(0, Math.floor(Number(scene[turnKey]) || 0)) !== turnNo) scene[amountKey] = 0;
  scene[turnKey] = turnNo;
  scene[amountKey] = Math.max(0, Math.floor(Number(scene[amountKey]) || 0)) + actual;
};
const getBattleDamageTakenThisTurn = (scene, side) => {
  if (!scene) return 0;
  const turnNo = Math.max(1, Math.floor(Number(scene.turnCount) || 1));
  const turnKey = side === "attacker" ? "attackerDamageTakenTurn" : "targetDamageTakenTurn";
  if (Math.max(0, Math.floor(Number(scene[turnKey]) || 0)) !== turnNo) return 0;
  return Math.max(0, Math.floor(Number(scene[side === "attacker" ? "attackerDamageTakenThisTurn" : "targetDamageTakenThisTurn"]) || 0));
};
const applyBattleMaxHpDrain = (scene, fromSide, toSide, ratio, label = "吸取") => {
  const fromHpKey = fromSide === "attacker" ? "attackerHp" : "targetHp";
  const fromMaxHpKey = fromSide === "attacker" ? "attackerMaxHp" : "targetMaxHp";
  const toHpKey = toSide === "attacker" ? "attackerHp" : "targetHp";
  const toMaxHpKey = toSide === "attacker" ? "attackerMaxHp" : "targetMaxHp";
  const amount = Math.max(1, Math.floor((Math.max(1, Number(scene[fromMaxHpKey]) || 1)) * clamp(Number(ratio) || 0.1, 0.01, 1)));
  const before = Math.max(0, Number(scene[fromHpKey]) || 0);
  scene[fromHpKey] = Math.max(hasLastStandEffect(scene, fromSide) && before > 0 ? 1 : 0, before - amount);
  const actual = Math.max(0, before - (Number(scene[fromHpKey]) || 0));
  recordBattleDamageTakenThisTurn(scene, fromSide, actual);
  const toBefore = Math.max(0, Number(scene[toHpKey]) || 0);
  const toMax = Math.max(1, Number(scene[toMaxHpKey]) || 1);
  const healed = Math.max(0, Math.min(actual, toMax - toBefore));
  scene[toHpKey] = clamp(toBefore + healed, 0, toMax);
  if (fromSide === "attacker" || toSide === "attacker") syncActivePetFromBattleScene(scene);
  syncBattleUiHpForSide(scene, fromSide);
  syncBattleUiHpForSide(scene, toSide);
  if (actual > 0) clearSleepAfterDamage(scene, fromSide);
  const fromName = fromSide === "attacker" ? scene.attackerName : scene.targetName;
  const toName = toSide === "attacker" ? scene.attackerName : scene.targetName;
  pushBattleLog(scene, `${label}：${toName}吸取${fromName}${actual}点体力。`);
  return { actual, healed };
};
const hasStatusShield = (scene, side, status = "") => {
  const state = getSideState(scene, side);
  cleanupExpiredEffects(state);
  return (state.timedEffects || []).some((e) => {
    if (normalize(e && e.kind) !== "statusShield") return false;
    if (Math.max(0, Number(e && e.turns) || 0) <= 0) return false;
    const guard = normalize(e.data && e.data.status) || "all";
    return guard === "all" || guard === normalize(status);
  });
};
const getElementPowerFactorFromState = (state, skillElement) => {
  let mul = 1;
  (state && Array.isArray(state.timedEffects) ? state.timedEffects : []).forEach((e) => {
    if (e.kind !== "elementPowerBuff") return;
    const em = normalize(e.data && e.data.element);
    const me = normalize(skillElement);
    if (!em || !me || em !== me) return;
    const factor = Number(e.data && e.data.factor);
    if (Number.isFinite(factor) && factor > 0) mul *= factor;
  });
  return mul;
};
const getElementPowerFactor = (scene, side, skillElement) => {
  const state = getSideState(scene, side);
  const own = getElementPowerFactorFromState(state, skillElement);
  const global = getElementPowerFactorFromState({ timedEffects: scene.globalTimedEffects || [] }, skillElement);
  return own * global;
};
const getDamageBoostFactor = (scene, side) => {
  const state = getSideState(scene, side);
  let mul = 1;
  if (isQiankunXiuluoshenSkinBattleActive(scene, side)) {
    mul *= 1 + clamp(QIANKUN_XIULUOSHEN_SKIN_DAMAGE_BONUS, 0, 9);
  }
  (state && Array.isArray(state.timedEffects) ? state.timedEffects : []).forEach((e) => {
    if (normalize(e && e.kind) !== "damageBoost") return;
    const factor = Number(e.data && e.data.factor);
    if (Number.isFinite(factor) && factor > 0) mul *= factor;
  });
  return mul;
};
const getTargetElementDamageBoostFactor = (scene, actorSide, defenderSide) => {
  const state = getSideState(scene, actorSide);
  const targetElements = getEffectiveBattleElements(scene, defenderSide);
  let mul = 1;
  (state && Array.isArray(state.timedEffects) ? state.timedEffects : []).forEach((e) => {
    if (normalize(e && e.kind) !== "targetElementDamageBoost") return;
    const targetElement = normalizeElementName(e.data && e.data.targetElement) || normalize(e.data && e.data.targetElement);
    if (!targetElement || !targetElements.includes(targetElement)) return;
    const factor = Number(e.data && e.data.factor);
    if (Number.isFinite(factor) && factor > 0) mul *= factor;
  });
  return mul;
};
const getDamagePowerTransferFactor = (scene, side) => {
  const state = getSideState(scene, side);
  let delta = 0;
  (state && Array.isArray(state.timedEffects) ? state.timedEffects : []).forEach((e) => {
    const kind = normalize(e && e.kind);
    if (kind !== "damagePowerTransfer" && kind !== "damagePowerDrainStack") return;
    delta += Number(e.data && e.data.ratio) || 0;
  });
  return clamp(1 + delta, 0.05, 3);
};
const wasBattleSideDamagedThisTurn = (scene, side) => {
  const turnNo = Math.max(1, Math.floor(Number(scene && scene.turnCount) || 1));
  const damagedTurnKey = side === "target" ? "targetDamagedTurn" : "attackerDamagedTurn";
  return Math.max(0, Math.floor(Number(scene && scene[damagedTurnKey]) || 0)) === turnNo;
};
const getUnharmedPowerMultiplier = (scene, side, skill) => {
  const effects = parseSkillEffects(skill).filter((e) => normalize(e && e.kind) === "unharmedPowerMultiplier");
  if (effects.length <= 0) return 1;
  const wasDamaged = wasBattleSideDamagedThisTurn(scene, side);
  let factor = 1;
  effects.forEach((e) => {
    if (!wasDamaged) factor *= Math.max(1, Number(e.factor) || 2);
  });
  return factor;
};
const getStatusPowerMultiplier = (scene, actorSide, targetSide, skill) => {
  const effects = parseSkillEffects(skill).filter((e) => normalize(e && e.kind) === "statusPowerMultiplier");
  if (effects.length <= 0) return 1;
  let factor = 1;
  effects.forEach((e) => {
    const side = normalize(e && e.target) === "self" ? actorSide : targetSide;
    const statuses = Array.isArray(e && e.statuses) ? e.statuses.map(normalize).filter(Boolean) : [normalize(e && e.status)].filter(Boolean);
    if (statuses.length <= 0) return;
    const current = getSideState(scene, side).statuses || {};
    if (statuses.some((status) => Math.max(0, Number(current[status]) || 0) > 0)) factor *= Math.max(0.01, Number(e.factor) || 1);
  });
  return factor;
};
const rollSkillChancePowerMultiplier = (skill) => {
  const effects = parseSkillEffects(skill).filter((e) => normalize(e && e.kind) === "chancePowerMultiplier");
  let factor = 1;
  const hits = [];
  effects.forEach((e) => {
    const list = Array.isArray(e && e.chances) ? e.chances.slice() : [{ chance: e && e.chance, factor: e && e.factor }];
    const sorted = list
      .map((x) => ({ chance: clamp(Number(x && x.chance) || 0, 0, 1), factor: Math.max(0.01, Number(x && x.factor) || 1) }))
      .filter((x) => x.chance > 0 && x.factor > 0)
      .sort((a, b) => b.factor - a.factor);
    const roll = Math.random();
    const hit = sorted.find((x) => roll <= x.chance);
    if (hit) {
      factor *= hit.factor;
      hits.push(hit.factor);
    }
  });
  if (skill && typeof skill === "object") skill.__lastChancePowerMultiplierHits = hits;
  return factor;
};
const triggerFatalDragonShadowEffects = (scene, actorSide, skill) => {
  if (!scene || !skill) return;
  const actorState = getSideState(scene, actorSide);
  const effects = (actorState.timedEffects || []).filter((e) => normalize(e && e.kind) === "fatalDragonShadow" && Math.max(0, Number(e && e.turns) || 0) > 0);
  if (effects.length <= 0) return;
  const ownerSide = actorSide === "attacker" ? "target" : "attacker";
  const ownerName = ownerSide === "attacker" ? scene.attackerName : scene.targetName;
  const actorName = actorSide === "attacker" ? scene.attackerName : scene.targetName;
  const atkKind = parseSkillAttackKind(skill);
  if (atkKind !== "physical" && atkKind !== "special") return;
  effects.forEach((e) => {
    const ratio = clamp(Number(e.data && e.data.ratio) || 0.05, 0.01, 1);
    const maxStacks = Math.max(1, Math.floor(Number(e.data && e.data.maxStacks) || 3));
    const stackKey = normalize(e.data && e.data.stackKey) || "fatalDragonShadow";
    const ownerState = getSideState(scene, ownerSide);
    const activeStacks = (ownerState.timedEffects || []).filter((fx) => normalize(fx && fx.kind) === "damageReduction" && normalize(fx.data && fx.data.stackKey) === stackKey && Math.max(0, Number(fx && fx.turns) || 0) > 0);
    if (activeStacks.length >= maxStacks) {
      pushBattleLog(scene, `致命龙影：${ownerName}吸取的伤害抗性已达到${maxStacks}层上限。`);
      return;
    }
    addTimedEffect(scene, ownerSide, { kind: "damageReduction", turns: Math.max(1, Math.floor(Number(e.turns) || 1)), data: { ratio, stackable: true, stackKey, stackIndex: activeStacks.length + 1 } });
    pushBattleLog(scene, `致命龙影：${actorName}使用攻击技能，${ownerName}继续吸取其伤害抗性${Math.round(ratio * 100)}%。`);
  });
};
const applyActiveLifestealBuff = (scene, side, damageAmount) => {
  const damage = Math.max(0, Math.floor(Number(damageAmount) || 0));
  if (!scene || damage <= 0) return 0;
  const state = getSideState(scene, side);
  const effects = (state.timedEffects || []).filter((e) => normalize(e && e.kind) === "lifestealBuff" && Math.max(0, Number(e && e.turns) || 0) > 0);
  if (effects.length <= 0) return 0;
  const flatAmount = effects.reduce((best, e) => Math.max(best, Math.floor(Number(e.data && e.data.amount) || 0)), 0);
  const ratio = effects.reduce((best, e) => Math.max(best, clamp(Number(e.data && e.data.ratio) || 0, 0, 3)), 0);
  if (flatAmount <= 0 && ratio <= 0) return 0;
  const hpKey = side === "attacker" ? "attackerHp" : "targetHp";
  const maxHpKey = side === "attacker" ? "attackerMaxHp" : "targetMaxHp";
  const before = Math.max(0, Number(scene[hpKey]) || 0);
  const maxHp = Math.max(1, Number(scene[maxHpKey]) || 1);
  const heal = flatAmount > 0 ? flatAmount : Math.max(1, Math.floor(damage * ratio));
  scene[hpKey] = clamp(before + heal, 0, maxHp);
  const healed = Math.max(0, (Number(scene[hpKey]) || 0) - before);
  syncBattleUiHpForSide(scene, side);
  if (side === "attacker") syncActivePetFromBattleScene(scene);
  const who = side === "attacker" ? scene.attackerName : scene.targetName;
  queueAfterDamageFloat(scene, () => {
    if (!scene || scene.ended) return;
    clearBattleFloatTextIfExpired(scene, true);
    if (side === "attacker") scene.healOnAttacker = `+${heal}`;
    else scene.healOnTarget = `+${heal}`;
    markBattleFloatText(scene);
    pushBattleLog(scene, `${who}通过嗜血效果回复 ${heal} 点体力（实际恢复 ${healed}）`);
  });
  return healed;
};
const countBattleStatuses = (scene, side) => {
  const st = getSideState(scene, side);
  return Object.keys(st.statuses || {}).filter((key) => Math.max(0, Number(st.statuses[key]) || 0) > 0).length;
};
const hasSkillEffectFlag = (skill, kind) => parseSkillEffects(skill).some((e) => {
  const key = normalize(kind);
  return normalize(e && e.kind) === key || (normalize(e && e.kind) === "flag" && normalize(e && e.flag) === key);
});
const hasActiveNextAttackMustHit = (scene, side) => {
  const state = getSideState(scene, side);
  cleanupExpiredEffects(state);
  return (state.timedEffects || []).some((e) => normalize(e && e.kind) === "nextAttackMustHit" && Math.max(0, Number(e && e.turns) || 0) > 0);
};
const hasConsumableNextAttackEffect = (scene, side) => {
  const state = getSideState(scene, side);
  cleanupExpiredEffects(state);
  return (state.timedEffects || []).some((e) => {
    const kind = normalize(e && e.kind);
    if (Math.max(0, Number(e && e.turns) || 0) <= 0) return false;
    return kind === "nextAttackMustHit" || (kind === "lifestealBuff" && e.data && e.data.consumeOnAttack);
  });
};
const consumeNextAttackEffects = (scene, side) => {
  const state = getSideState(scene, side);
  (state.timedEffects || []).forEach((e) => {
    const kind = normalize(e && e.kind);
    if (kind === "nextAttackMustHit") e.turns = 0;
    if (kind === "lifestealBuff" && e.data && e.data.consumeOnAttack) e.turns = 0;
  });
  cleanupExpiredEffects(state);
};
const getSkillActionPriority = (skill) => {
  const effects = parseSkillEffects(skill).filter((e) => normalize(e && e.kind) === "priority");
  if (effects.length > 0) {
    return effects.reduce((best, e) => {
      const val = Math.floor(Number(e.value) || 0);
      return Math.abs(val) > Math.abs(best) ? val : best;
    }, 0);
  }
  const desc = normalize(skill && skill.desc);
  if (/先至\s*\+?\s*(\d+)/.test(desc)) {
    const m = desc.match(/先至\s*\+?\s*(\d+)/);
    return Math.max(1, Math.floor(Number(m && m[1]) || 1));
  }
  if (/后至\s*\+?\s*(\d+)/.test(desc)) {
    const m = desc.match(/后至\s*\+?\s*(\d+)/);
    return -Math.max(1, Math.floor(Number(m && m[1]) || 1));
  }
  if (/(先发后至|后发|后至|最后出手)/.test(desc)) return -1;
  if (/(先发|先制|优先出手|先出手)/.test(desc)) return 1;
  return 0;
};
const getSkillDynamicPower = (scene, actorSide, targetSide, skill) => {
  const effects = parseSkillEffects(skill).filter((e) => normalize(e && e.kind) === "dynamicPower");
  const isSilverLightShine = Number(skill && skill.skillId) === 19026 || normalize(skill && skill.name) === "银光照耀";
  if (effects.length === 0 && !isSilverLightShine) return null;
  let power = null;
  effects.forEach((e) => {
    const mode = normalize(e.mode);
    let next = null;
    if (mode === "selfHpLost") {
      const hp = Math.max(0, Number(actorSide === "attacker" ? scene.attackerHp : scene.targetHp) || 0);
      const maxHp = Math.max(1, Number(actorSide === "attacker" ? scene.attackerMaxHp : scene.targetMaxHp) || 1);
      const lostRatio = clamp(1 - hp / maxHp, 0, 1);
      const min = Math.max(1, Number(e.minPower) || 20);
      const max = Math.max(min, Number(e.maxPower) || 200);
      next = Math.floor(min + (max - min) * lostRatio);
    } else if (mode === "selfHpHigh") {
      const hp = Math.max(0, Number(actorSide === "attacker" ? scene.attackerHp : scene.targetHp) || 0);
      const maxHp = Math.max(1, Number(actorSide === "attacker" ? scene.attackerMaxHp : scene.targetMaxHp) || 1);
      const ratio = clamp(hp / maxHp, 0, 1);
      const min = Math.max(1, Number(e.minPower) || Number(skill.power) || 1);
      const max = Math.max(min, Number(e.maxPower) || min * 2);
      next = Math.floor(min + (max - min) * ratio);
    } else if (mode === "targetHpHigh") {
      const hp = Math.max(0, Number(targetSide === "attacker" ? scene.attackerHp : scene.targetHp) || 0);
      const maxHp = Math.max(1, Number(targetSide === "attacker" ? scene.attackerMaxHp : scene.targetMaxHp) || 1);
      const ratio = clamp(hp / maxHp, 0, 1);
      const min = Math.max(1, Number(e.minPower) || Number(skill.power) || 1);
      const max = Math.max(min, Number(e.maxPower) || 120);
      next = Math.floor(min + (max - min) * ratio);
    } else if (mode === "ppLow") {
      const pp = Math.max(0, Number(skill && skill.pp) || 0);
      next = pp <= 1 ? 120 : (pp <= 2 ? 80 : (pp <= 3 ? 60 : (pp <= 4 ? 50 : 40)));
    } else if (mode === "randomRange") {
      const min = Math.max(1, Math.floor(Number(e.minPower) || 1));
      const max = Math.max(min, Math.floor(Number(e.maxPower) || min));
      next = min + Math.floor(Math.random() * (max - min + 1));
    } else if (mode === "selfToTargetStatRatio") {
      const statKey = normalize(e.statKey) || "spAtk";
      const actorStat = Math.max(1, getBattleAbilityStat(scene, actorSide, statKey));
      const targetStat = Math.max(1, getBattleAbilityStat(scene, targetSide, statKey));
      const base = Math.max(1, Number(e.basePower) || 120);
      const min = Math.max(1, Number(e.minPower) || 1);
      const max = Math.max(min, Number(e.maxPower) || 300);
      next = clamp(Math.floor(base * actorStat / targetStat), min, max);
    } else if (mode === "selfStatScaled") {
      const statKey = normalize(e.statKey) || "spAtk";
      const stat = Math.max(1, getBattleAbilityStat(scene, actorSide, statKey));
      const factor = Math.max(0.01, Number(e.factor) || 0.5);
      const min = Math.max(1, Number(e.minPower) || 1);
      const max = Math.max(min, Number(e.maxPower) || 300);
      next = clamp(Math.floor(stat * factor), min, max);
    } else if (mode === "targetPositiveStageScaled") {
      const keys = Array.isArray(e.keys) && e.keys.length > 0 ? e.keys.map(normalize).filter(Boolean) : ["atk", "spAtk"];
      const targetState = getSideState(scene, targetSide);
      const stages = targetState && targetState.stages ? targetState.stages : {};
      const stageTotal = keys.reduce((sum, key) => sum + Math.max(0, Math.floor(Number(stages[key]) || 0)), 0);
      const base = Math.max(1, Number(e.basePower) || Number(skill.power) || 120);
      const perStage = Math.max(0, Number(e.perStage) || 30);
      const min = Math.max(1, Number(e.minPower) || base);
      const max = Math.max(min, Number(e.maxPower) || base + perStage * 12);
      next = clamp(Math.floor(base + stageTotal * perStage), min, max);
    } else if (mode === "selfHpHighStep") {
      const hp = Math.max(0, Number(actorSide === "attacker" ? scene.attackerHp : scene.targetHp) || 0);
      const maxHp = Math.max(1, Number(actorSide === "attacker" ? scene.attackerMaxHp : scene.targetMaxHp) || 1);
      const lost = Math.max(0, maxHp - hp);
      const step = Math.max(1, Math.floor(Number(e.step) || 100));
      const drop = Math.max(0, Math.floor(Number(e.drop) || 20));
      const max = Math.max(1, Number(e.maxPower) || 280);
      const min = Math.max(1, Number(e.minPower) || 1);
      next = Math.max(min, max - Math.floor(lost / step) * drop);
    } else if (mode === "selfHpHighPercentStep") {
      const hp = Math.max(0, Number(actorSide === "attacker" ? scene.attackerHp : scene.targetHp) || 0);
      const maxHp = Math.max(1, Number(actorSide === "attacker" ? scene.attackerMaxHp : scene.targetMaxHp) || 1);
      const lostRatio = clamp(1 - hp / maxHp, 0, 1);
      const stepRatio = clamp(Number(e.stepRatio) || 0.1, 0.01, 1);
      const drop = Math.max(0, Math.floor(Number(e.drop) || 10));
      const max = Math.max(1, Number(e.maxPower) || Number(skill.power) || 1);
      const min = Math.max(1, Number(e.minPower) || 1);
      next = Math.max(min, max - Math.floor(lostRatio / stepRatio) * drop);
    } else if (mode === "selfHpHighPercentMultiplierStep") {
      const hp = Math.max(0, Number(actorSide === "attacker" ? scene.attackerHp : scene.targetHp) || 0);
      const maxHp = Math.max(1, Number(actorSide === "attacker" ? scene.attackerMaxHp : scene.targetMaxHp) || 1);
      const lostRatio = clamp(1 - hp / maxHp, 0, 1);
      const stepRatio = clamp(Number(e.stepRatio) || 0.2, 0.01, 1);
      const dropRatio = clamp(Number(e.dropRatio) || 0.1, 0, 1);
      const max = Math.max(1, Number(e.maxPower) || Number(skill.power) || 1);
      const multiplier = Math.max(0.01, 1 - Math.floor(lostRatio / stepRatio) * dropRatio);
      next = Math.max(1, Math.floor(max * multiplier));
    }
    if (Number.isFinite(next) && next > 0) power = Math.max(power || 0, Math.floor(next));
  });
  if (isSilverLightShine && hasActiveSilverLightShield(scene, actorSide)) {
    power = Math.max(power || 0, Math.max(0, Number(skill && skill.power) || 0) + 30);
  }
  return power;
};
const getSkillPowerOverride = (skill) => {
  const effects = parseSkillEffects(skill);
  const hit = effects.find((e) => normalize(e && e.kind) === "fixedPowerOverride" && Number(e && e.power) > 0);
  return hit ? Math.max(1, Number(hit.power) || 0) : null;
};
const getSkillIgnoreDefenseRatio = (skill, atkKind) => {
  const effects = parseSkillEffects(skill).filter((e) => normalize(e && e.kind) === "ignoreDefense");
  let ratio = 0;
  effects.forEach((e) => {
    if (normalize(e && e.mode) === "positiveStage") return;
    const kind = normalize(e.attackKind) || "all";
    if (kind !== "all" && kind !== normalize(atkKind)) return;
    if (Number.isFinite(Number(e.chance)) && Math.random() > clamp(Number(e.chance), 0, 1)) return;
    ratio = Math.max(ratio, clamp(Number(e.ratio) || 1, 0, 1));
  });
  return ratio;
};
const shouldIgnorePositiveDefenseStage = (skill, atkKind) => {
  const effects = parseSkillEffects(skill).filter((e) => normalize(e && e.kind) === "ignoreDefense" && normalize(e && e.mode) === "positiveStage");
  return effects.some((e) => {
    const kind = normalize(e.attackKind) || "all";
    if (kind !== "all" && kind !== normalize(atkKind)) return false;
    const chance = Number.isFinite(Number(e.chance)) ? Number(e.chance) : 1;
    return Math.random() <= clamp(chance, 0, 1);
  });
};
const hasSkillEffectKind = (skill, kind) => parseSkillEffects(skill).some((e) => normalize(e && e.kind) === normalize(kind));
const averageSkillEffectPower = (skill, scene = null, actorSide = "attacker", targetSide = "target") => {
  if (!skill) return 0;
  const dynamicPower = scene ? getSkillDynamicPower(scene, actorSide, targetSide, skill) : 0;
  const power = Math.max(0, Number(getSkillPowerOverride(skill)) || Number(dynamicPower) || Number(skill.power) || 0);
  const multi = parseSkillEffects(skill).find((e) => normalize(e && e.kind) === "multiHit");
  if (!multi) return power;
  const min = Math.max(1, Math.floor(Number(multi.min) || 1));
  const max = Math.max(min, Math.floor(Number(multi.max) || min));
  const avgHits = (min + max) / 2;
  const list = Array.isArray(multi.powerList) ? multi.powerList.map((n) => Math.max(0, Number(n) || 0)).filter((n) => n > 0) : [];
  if (list.length > 0) return list.reduce((sum, n) => sum + n, 0);
  return power * avgHits * Math.max(1, Number(multi.powerMultiplier) || 1);
};
const getSkillBaseAccuracy = (skill, fallback = 100) => {
  const name = normalize(skill && skill.name);
  if (name === "玄冥绝灭" || name === "光明漩涡") return 50;
  return clamp(Number(fallback) || 100, 1, 100);
};
const hasDirectDamageSuppressedEffect = (skill) => parseSkillEffects(skill).some((e) => [
  "equalizeOpponentHpToSelf",
  "averageHp",
  "drainRemainingHpRatio"
].includes(normalize(e && e.kind)));
const hasDiminishingGateEffect = (skill) => parseSkillEffects(skill).some((e) => normalize(e && e.kind) === "diminishingSuccessGate");
const isGuardianBossProtectedTarget = (scene, side) => scene && (scene.mode === "guardian" || scene.mode === "boss" || scene.mode === "weeklyBoss" || scene.mode === "timeTunnel") && side === "target";
const GUARDIAN_BOSS_FATAL_EFFECT_KINDS = new Set([
  "instantKo",
  "damageByMaxHpRatio",
  "equalizeOpponentHpToSelf",
  "averageHp",
  "drainRemainingHpRatio",
  "delayedKo",
  "coinFlipHalfHp"
]);
const GUARDIAN_BOSS_FLAGGED_PROTECTED_EFFECT_KINDS = new Set([
  ...GUARDIAN_BOSS_FATAL_EFFECT_KINDS,
  "flatDrain",
  "lockGodDrain"
]);
const isGuardianBossProtectedEffect = (effect) => {
  if (!effect) return false;
  const kind = normalize(effect.kind);
  return GUARDIAN_BOSS_FATAL_EFFECT_KINDS.has(kind)
    || (Boolean(effect.guardianBossImmune) && GUARDIAN_BOSS_FLAGGED_PROTECTED_EFFECT_KINDS.has(kind));
};
const isFatalOnlyGuardianBossProtectedEffect = (effect) => {
  if (!effect) return false;
  return GUARDIAN_BOSS_FATAL_EFFECT_KINDS.has(normalize(effect.kind));
};
const isEffectBlockedByGuardianBoss = (scene, actor, effect) => {
  if (!isGuardianBossProtectedEffect(effect)) return false;
  const side = effect.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
  return isGuardianBossProtectedTarget(scene, side);
};
const isSkillBlockedByGuardianBoss = (scene, actor, skill) => {
  if (!scene || actor !== "attacker" || !isGuardianBossProtectedTarget(scene, "target")) return false;
  const isPureProtectedEffect = (effect) => {
    if (!effect) return false;
    const kind = normalize(effect.kind);
    if (kind === "chanceExclusive") {
      return isPureProtectedEffect(effect.success) || isPureProtectedEffect(effect.fail);
    }
    return isGuardianBossProtectedEffect(effect) && !isFatalOnlyGuardianBossProtectedEffect(effect) && isEffectBlockedByGuardianBoss(scene, actor, effect);
  };
  return parseSkillEffects(skill).some((e) => isPureProtectedEffect(e));
};
const isSelfDestructiveSkillForChallengeAi = (skill) => {
  const name = normalize(skill && skill.name);
  if (name === "恶魔遗言") return true;
  const isSelfDestructiveEffect = (effect) => {
    if (!effect) return false;
    const kind = normalize(effect.kind);
    const target = normalize(effect.target) || "self";
    if (kind === "chanceExclusive") return isSelfDestructiveEffect(effect.success) || isSelfDestructiveEffect(effect.fail);
    if (target !== "self") return false;
    if (kind === "selfKo") return true;
    if (kind === "recoilByMaxHp" && clamp(Number(effect.ratio) || 0, 0, 1) >= 1) return true;
    if (kind === "recoilFlat" && Math.floor(Number(effect.amount) || 0) >= 999999) return true;
    return false;
  };
  return parseSkillEffects(skill).some((e) => isSelfDestructiveEffect(e));
};
const calcBattleDirectDamage = ({
  scene,
  actorSide,
  defenderSide,
  actorLevel,
  skill,
  atkKind,
  skillElement,
  power,
  powerFactor = 1,
  powerConditionFactor = 1,
  elementFactor = 1,
  randomFactor = 1,
  reduceFactor = 1
}) => {
  const actorElement = actorSide === "attacker" ? scene.attackerElement : scene.targetElement;
  const isNoEdgeBlade = normalize(skill && skill.name) === "无锋巨刃";
  const ignorePositiveDefenseStage = shouldIgnorePositiveDefenseStage(skill, atkKind);
  const atkStat = atkKind === "special"
    ? getBattleAbilityStat(scene, actorSide, "spAtk")
    : getBattleAbilityStat(scene, actorSide, "atk");
  const defStat = isNoEdgeBlade
    ? 1
    : (ignorePositiveDefenseStage
      ? getBattleAbilityStat(scene, defenderSide, atkKind === "special" ? "spDef" : "def", { ignorePositiveStage: true })
      : (atkKind === "special"
        ? getBattleAbilityStat(scene, defenderSide, "spDef")
        : getBattleAbilityStat(scene, defenderSide, "def")));
  const ignoreDefenseRatio = getSkillIgnoreDefenseRatio(skill, atkKind);
  const effectiveDefStat = ignoreDefenseRatio > 0 ? Math.max(1, Math.floor(defStat * (1 - ignoreDefenseRatio))) : defStat;
  const stab = normalize(actorElement) === normalize(skillElement) ? 1.5 : 1;
  const one = calcSkillDamageByOfficialStyle({
    level: actorLevel,
    power: Math.max(1, Number(power) || 1) * powerFactor * powerConditionFactor,
    atkStat,
    defStat: effectiveDefStat,
    stab,
    elementFactor,
    randomFactor
  });
  const traitKey = actorSide === "attacker" ? scene && scene.attackerQixingSealTraitKey : scene && scene.targetQixingSealTraitKey;
  const traitLevel = actorSide === "attacker" ? scene && scene.attackerQixingSealLevel : scene && scene.targetQixingSealLevel;
  const traitRule = getQixingTraitBattleRuleByKey(traitKey, traitLevel);
  const traitDamageFactor = normalize(actorSide === "attacker" ? scene && scene.attackerBattleItemId : scene && scene.targetBattleItemId) === QIXING_SEAL_ITEM_ID
    ? 1 + clamp(Number(traitRule.damageBonus) || 0, 0, 9)
    : 1;
  return Math.max(1, Math.floor(one * reduceFactor * traitDamageFactor));
};
const cloneSkillEffectList = (effects) => JSON.parse(JSON.stringify(Array.isArray(effects) ? effects : []));
const manualHardcodedSkillEffects = (skill) => {
  if (skill && Array.isArray(skill.__manualEffects)) return cloneSkillEffectList(skill.__manualEffects);
  const name = normalize(skill && skill.name);
  const canonicalSkillName = name.replace(/决/g, "诀");
  const compactSkillName = name.replace(/[·.\s]/g, "");
  const skillDesc = normalize(skill && skill.desc).replace(/％/g, "%");
  const skillId = Number(skill && skill.skillId) || 0;
  if (skillId === 1247 || (name === "浑天盾" && /1\.5/.test(skillDesc))) {
    return [
      { kind: "damageReflect", target: "self", attackKind: "physical", ratio: 1.5, turns: 5, consumeOnTrigger: true, label: "浑天盾" }
    ];
  }
  if (canonicalSkillName === "锁神诀") {
    return [
      { kind: "lockGodSeal", target: "opponent", turns: 5, ratio: 1 / 16, speedDelta: -1, label: "锁神诀" }
    ];
  }
  if (name === "元素庇护") {
    return [
      { kind: "elementShelter", target: "self" },
      { kind: "stage", target: "self", keys: ["def"], delta: 1, chance: 1, requireHit: false }
    ];
  }
  if (name === "风神附体") {
    return [
      { kind: "windGodPossession", target: "self", ratio: 0.5, boostDelta: 3, accuracyDelta: -3 }
    ];
  }
  if (name === "远古记忆" || skillId === 19060) {
    return [
      { kind: "priority", target: "self", value: 1 },
      { kind: "mirrorOpponentStageBoost", target: "self", turns: 5, multiplier: 1 }
    ];
  }
  if (name === "远古怒嚎" || skillId === 19110) {
    return [
      { kind: "priority", target: "self", value: 1 },
      { kind: "mirrorOpponentStageBoost", target: "self", turns: 4, multiplier: 1 },
      { kind: "stageGuard", target: "self", mode: "debuff", turns: 4, requireHit: false }
    ];
  }
  if (name === "神秘仪式" || skillId === 14018) {
    return [
      { kind: "selfKo", target: "self" },
      { kind: "nextPetFullRestore", target: "self" }
    ];
  }
  if (name === "烈阳涤尘" || skillId === 21011) {
    return [
      { kind: "priority", target: "self", value: 1 },
      { kind: "mustHit", target: "self" },
      { kind: "clearStage", target: "opponent", mode: "positive", keys: ALL_ABILITY_STAGE_KEYS.slice(), chance: 1, requireHit: true }
    ];
  }
  if (name === "九尾灵能" || skillId === 15284) {
    return [
      { kind: "stage", target: "self", keys: ["spAtk", "spDef"], delta: 1, chance: 1, requireHit: false },
      { kind: "stage", target: "self", keys: ["spAtk", "spDef"], delta: 1, chance: 0.3, requireHit: false }
    ];
  }
  if (name === "修罗裂空破" || skillId === 19078) {
    return [
      { kind: "status", target: "opponent", status: "bind", turns: 5, chance: 1, requireHit: true },
      { kind: "clearStage", target: "opponent", mode: "positive", keys: ALL_ABILITY_STAGE_KEYS.slice(), chance: 0.4, requireHit: true }
    ];
  }
  if (name === "终焉之翼" || skillId === 16297) {
    return [
      { kind: "multiHit", target: "opponent", min: 4, max: 8 },
      { kind: "status", target: "opponent", status: "bind", turns: 5, chance: 0.2, requireHit: true },
      { kind: "stage", target: "opponent", keys: ALL_ABILITY_STAGE_KEYS.slice(), delta: -1, chance: 0.2, requireHit: true }
    ];
  }
  if (name === "灭世飓风" || skillId === 20016) {
    return [
      { kind: "randomStatus", target: "opponent", count: 1, turns: 3, chance: 0.3, requireHit: true },
      { kind: "skip", target: "self", turns: 1, chance: 0.1, requireHit: true }
    ];
  }
  if (name === "魔焰无极" || skillId === 10254 || skillId === 10406) {
    return [{ kind: "chancePowerMultiplier", target: "self", chances: [{ chance: 0.1, factor: 3 }, { chance: 0.5, factor: 1.5 }] }];
  }
  if (name === "落日吞天" || skillId === 16277 || skillId === 16411) {
    return [
      { kind: "stage", target: "opponent", keys: ALL_ABILITY_STAGE_KEYS.slice(), delta: -1, chance: 1, requireHit: true },
      { kind: "status", target: "opponent", status: "bind", minTurns: 2, maxTurns: 5, chance: 1, requireHit: true },
      { kind: "skip", target: "self", turns: 1, chance: 0.25, requireHit: true }
    ];
  }
  if (name === "战武遗魂" || skillId === 16273) {
    return [
      { kind: "stage", target: "self", keys: ALL_ABILITY_STAGE_KEYS.slice(), delta: 1, chance: 1, requireHit: false },
      { kind: "skip", target: "self", turns: 1, chance: 0.3, requireHit: false }
    ];
  }
  if (name === "上古战魂" && skillId === 19077) {
    return [
      { kind: "stage", target: "self", keys: ["atk", "accuracy", "critStage", "def", "spDef", "speed"], delta: 1, chance: 1, requireHit: false },
      { kind: "endTurnHealByLostHp", target: "self", lostAdd: 100, multiplier: 300, turns: 5 }
    ];
  }
  if (name === "万物皆明" || skillId === 193 || skillId === 16221 || skillId === 16234) {
    return [
      { kind: "stage", target: "opponent", keys: ALL_ABILITY_STAGE_KEYS.slice(), delta: -1, chance: 1, requireHit: true },
      { kind: "status", target: "opponent", status: "bind", minTurns: 2, maxTurns: 5, chance: 1, requireHit: true },
      { kind: "skip", target: "self", turns: 1, chance: 1, requireHit: true }
    ];
  }
  if (name === "玄王甲") {
    return [
      { kind: "damageReduction", target: "self", ratio: 0.5, turns: 3 },
      { kind: "onDamagedStage", target: "self", applyTo: "attacker", keys: ALL_ABILITY_STAGE_KEYS.slice(), delta: -1, turns: 3, chance: 0.7, trigger: "damaged" }
    ];
  }
  if (name === "玄雷甲" || skillId === 16312) {
    return [
      { kind: "priority", target: "self", value: 2 },
      { kind: "damageReduction", target: "self", ratio: 0.5, turns: 3 },
      { kind: "onDamagedStage", target: "self", applyTo: "attacker", keys: ALL_ABILITY_STAGE_KEYS.slice(), delta: -1, turns: 3, chance: 0.5, trigger: "damaged" },
      { kind: "onDamagedStatus", target: "self", applyTo: "attacker", status: "paralyze", statusTurns: 3, turns: 3, chance: 0.2, trigger: "damaged" }
    ];
  }
  if (name === "闇月马戏团") {
    return [
      { kind: "stage", target: "opponent", keys: ["atk", "spAtk"], delta: -1, chance: 0.5, requireHit: false }
    ];
  }
  if (name === "威吓") {
    return [
      { kind: "forceRandomSwitch", target: "opponent", chance: 1, requireHit: true }
    ];
  }
  if (name === "君临天下" || skillId === 23006) {
    return [
      { kind: "stage", target: "self", keys: ALL_ABILITY_STAGE_KEYS.slice(), delta: 1, chance: 1, requireHit: false },
      { kind: "endTurnStageAndStatusChance", target: "self", keys: ALL_ABILITY_STAGE_KEYS.slice(), delta: 1, chance: 0.3, status: "confuse", statusTurns: 3, turns: 1 }
    ];
  }
  if (name === "王之裁决" || skillId === 23007) {
    return [
      { kind: "clearStage", target: "opponent", mode: "all", keys: ALL_ABILITY_STAGE_KEYS.slice(), chance: 0.4, requireHit: true }
    ];
  }
  if (name === "万界必破" || skillId === 23008) {
    return [
      { kind: "multiHit", target: "opponent", min: 5, max: 10 },
      { kind: "perHitRandomAbilityStatFactor", target: "opponent", groups: [["atk", "spAtk"], ["def", "spDef"]], factor: 0.85, turns: 3, chance: 0.08 }
    ];
  }
  if (name === "麒麟怒雷" || skillId === 13298) {
    return [
      { kind: "multiHit", target: "opponent", min: 3, max: 3 },
      { kind: "perHitStatus", target: "opponent", status: "paralyze", turns: 3, chance: 0.15 }
    ];
  }
  if (name === "数码世界") {
    return [
      { kind: "stage", target: "both", keys: ["atk", "spAtk"], delta: -2, chance: 1, requireHit: false }
    ];
  }
  if (name === "火海焚烧") {
    return [
      { kind: "lockGodDrain", target: "opponent", turns: 2, ratio: 1 / 16, label: "火海焚烧" }
    ];
  }
  if (name === "光刃") return [{ kind: "fixedDamageByStatRatio", target: "opponent", statKey: "speed", factor: 500 }];
  if (name === "七十二变") {
    return [
      { kind: "stage", target: "self", keys: ["def", "spDef", "evasion"], delta: 1, chance: 0.9, failEffectKey: "seventyTwoFail" },
      { kind: "recoilFlatOnChanceFail", target: "self", amount: 50, effectKey: "seventyTwoFail" }
    ];
  }
  if (name === "消失") return [{ kind: "diminishingSuccessGate", target: "self" }, { kind: "attackImmunity", target: "self", turns: 1, attackKind: "all" }];
  if (name === "替身术") return [{ kind: "priority", target: "self", value: 1 }, { kind: "diminishingSuccessGate", target: "self" }, { kind: "attackImmunity", target: "self", turns: 1, attackKind: "all" }];
  if (name === "庇护") return [{ kind: "priority", target: "self", value: 1 }, { kind: "diminishingSuccessGate", target: "self" }, { kind: "attackImmunity", target: "self", turns: 1, attackKind: "all" }];
  if (name === "混沌吸收") return [{ kind: "diminishingSuccessGate", target: "self" }, { kind: "damageAbsorb", target: "self", turns: 1 }];
  if (skillId === 10301 || name === "光与火之歌") {
    return [
      { kind: "stage", target: "self", keys: ALL_ABILITY_STAGE_KEYS.slice(), delta: 1, chance: 1, requireHit: false },
      { kind: "chanceExclusive", target: "self", chance: 0.5, success: { kind: "status", target: "self", status: "confuse", turns: 3, chance: 1 }, fail: { kind: "status", target: "self", status: "bind", turns: 5, chance: 1 } }
    ];
  }
  if (skillId === 10302 || name === "炎击长空") {
    return [
      { kind: "status", target: "opponent", status: "burn", turns: 5, chance: 0.3, requireHit: true },
      { kind: "statusPowerMultiplier", target: "opponent", status: "burn", factor: 1.5 },
      { kind: "selfStatusLifesteal", target: "self", status: "bind", ratio: 0.5, requireHit: true }
    ];
  }
  if (name === "恶魔遗言") {
    return [
      { kind: "selfKo", target: "self" },
      { kind: "stage", target: "opponent", keys: ["atk", "spAtk"], delta: -2, chance: 1, requireHit: false }
    ];
  }
  if (name === "善恶天秤" || skillId === 16203 || skillId === 16204) {
    const chance = skillId === 16203 ? 0.5 : 0.25;
    return [
      { kind: "chanceExclusive", target: "opponent", chance, success: { kind: "instantKo", target: "opponent", guardianBossImmune: true, requireHit: true }, fail: { kind: "stage", target: "opponent", keys: ALL_ABILITY_STAGE_KEYS.slice(), delta: 1, requireHit: true } }
    ];
  }
  if (name === "梦嗜" || compactSkillName === "梦嗜" || skillId === 17274) {
    return [
      { kind: "healFlat", target: "self", amount: 200, chance: 1, requireHit: true },
      { kind: "status", target: "self", status: "sleep", turns: 2, chance: 0.5, requireHit: true }
    ];
  }
  if (name === "吸收漩涡" || compactSkillName === "吸收漩涡" || skillId === 11308) {
    return [{ kind: "lifestealBuff", target: "self", amount: 50, turns: 3, requireHit: false }];
  }
  if (name === "明镜止水" || skillId === 19028) {
    return [
      { kind: "clearStage", target: "opponent", mode: "positive", keys: ALL_ABILITY_STAGE_KEYS.slice(), chance: 1, requireHit: false },
      { kind: "clearStage", target: "self", mode: "negative", keys: ALL_ABILITY_STAGE_KEYS.slice(), chance: 1, requireHit: false },
      { kind: "skip", target: "self", turns: 1, chance: 1, requireHit: false }
    ];
  }
  const isShuraClearBoostVersion = skillId === 19031
    || (name === "修罗流光斩" && /30%/.test(skillDesc) && /(清除|解除|消除)/.test(skillDesc) && /(提升|增益)/.test(skillDesc));
  if (isShuraClearBoostVersion) {
    return [
      { kind: "status", target: "opponent", status: "bind", turns: 5, chance: 1, requireHit: true },
      { kind: "clearStage", target: "opponent", mode: "positive", keys: ALL_ABILITY_STAGE_KEYS.slice(), chance: 0.3, requireHit: true }
    ];
  }
  if (name === "肉弹战车" || skillId === 628) {
    return [
      { kind: "dynamicPower", target: "self", mode: "selfHpHighPercentMultiplierStep", minPower: 1, maxPower: 40, stepRatio: 0.2, dropRatio: 0.1 },
      { kind: "multiHit", target: "opponent", min: 5, max: 10 }
    ];
  }
  if (name === "诱惑" || skillId === 1128) return [{ kind: "stage", target: "opponent", keys: ["spAtk"], delta: -2, chance: 1, requireHit: false }];
  if (name === "炫纹锁链" || skillId === 19029) {
    return [
      { kind: "status", target: "opponent", status: "weak", turns: 5, chance: 0.1, requireHit: true },
      { kind: "clearStage", target: "opponent", mode: "positive", keys: ALL_ABILITY_STAGE_KEYS.slice(), chance: 0.2, requireHit: true },
      { kind: "clearStage", target: "self", mode: "negative", keys: ALL_ABILITY_STAGE_KEYS.slice(), chance: 0.2, requireHit: false }
    ];
  }
  if (name === "冰灵新星" || skillId === 21037) {
    return [
      { kind: "healFlat", target: "self", amount: 80, requireHit: true },
      { kind: "ppChange", target: "self", amount: 2, requireHit: true }
    ];
  }
  if (name === "生命海洋" || skillId === 12203) return [{ kind: "lifesteal", target: "self", ratio: 0.5 }];
  if (name === "泡沫空间" || skillId === 11223) return [{ kind: "flatDrain", target: "opponent", turns: 5, ratio: 1 / 8, label: "泡沫空间", guardianBossImmune: true }];
  if (name === "欢乐之铃" || skillId === 1209) return [{ kind: "endTurnHealFlat", target: "self", amount: 80, turns: 5, teamWide: true }];
  if (name === "永恒之力" || skillId === 12295) {
    return [
      { kind: "stage", target: "self", keys: ["spAtk", "accuracy", "critStage", "speed"], delta: 1, chance: 1, requireHit: false },
      { kind: "unharmedBranch", target: "self", ifUnharmed: { kind: "stage", keys: ["def", "spDef"], delta: 1 }, ifDamaged: { kind: "healFlat", amount: 300 } }
    ];
  }
  if (name === "猩红之魔眼" || name === "猩红之眼" || skillId === 3272) return [{ kind: "setCritStage", target: "self", value: 6, turns: 2, requireHit: false }];
  if (name === "众神之力" || skillId === 21012) {
    return [
      { kind: "stage", target: "self", keys: ALL_ABILITY_STAGE_KEYS.slice(), delta: 1, chance: 1, requireHit: false },
      { kind: "randomStatus", target: "self", count: 1, turns: 3, chance: 0.2, requireHit: false }
    ];
  }
  if (name === "传说的传说" || name === "传说中的传说" || skillId === 11276) {
    return [{ kind: "instantKo", target: "opponent", chance: 1, requireHit: true, selfHpBelowRatio: 0.35, guardianBossImmune: true }];
  }
  if (name === "死神镰刀" || skillId === 16206) return [{ kind: "coinFlipHalfHp", target: "opponent", ratio: 0.5, selfRatio: 0.5, requireHit: true, guardianBossImmune: true }];
  if (compactSkillName === "流水灯" || compactSkillName === "原流水灯" || skillId === 11206 || skillId === 26240) {
    return [{ kind: "damageByMaxHpRatio", target: "opponent", ratio: skillId === 26240 ? 0.3 : 0.5, requireHit: true, guardianBossImmune: true }];
  }
  if (name === "南瓜炸弹") {
    return [
      { kind: "defenseHalve", target: "opponent", turns: 10 }
    ];
  }
  if (name === "原能暴风圈" || name === "同归于尽") {
    return [
      { kind: "selfKo", target: "self" },
      { kind: "defenseHalve", target: "opponent", turns: 10 }
    ];
  }
  if (name === "鲁莽") return [{ kind: "equalizeOpponentHpToSelf", target: "opponent", guardianBossImmune: true }];
  if (name === "痛苦之源") return [{ kind: "averageHp", target: "opponent", guardianBossImmune: true }];
  if (name === "浴火凤凰") {
    return [
      { kind: "recoilByMaxHp", target: "self", ratio: 1 / 3, requireHit: false },
      { kind: "endTurnHealFlat", target: "self", amount: 350, turns: 3 }
    ];
  }
  if (name === "数码干涉") {
    return [
      { kind: "recoilByMaxHp", target: "self", ratio: 0.5, requireHit: false },
      { kind: "lockGodDrain", target: "opponent", turns: 99, ratio: 1 / 4, label: "数码干涉", guardianBossImmune: true }
    ];
  }
  if (name === "时之虫洞") return [{ kind: "delayedKo", target: "opponent", turns: 6, guardianBossImmune: true }];
  if (name === "千变万化") return [{ kind: "randomStatus", target: "opponent", turns: 3, chance: 0.3 }];
  if (name === "病毒入侵") {
    return [
      { kind: "status", target: "opponent", status: "fear", turns: 3, chance: 1 },
      { kind: "lockGodDrain", target: "opponent", turns: 99, ratio: 1 / 16, label: "病毒入侵" }
    ];
  }
  if (name === "魔狂暴") return [{ kind: "drainRemainingHpRatio", target: "opponent", ratio: 0.5, guardianBossImmune: true }];
  if (name === "黑洞") return [{ kind: "timedHeal", target: "self", turns: 99, ratio: 1 / 8 }];
  if (name === "腐蚀酸云") return [{ kind: "mutualEndTurnDamageFlat", target: "both", turns: 5, amount: skillId === 2213 ? 300 : 200 }];
  if (name === "血印") {
    return [
      { kind: "dynamicPower", target: "self", mode: "selfHpHighStep", minPower: 1, maxPower: 280, step: 100, drop: 20 },
      { kind: "recoilFlat", target: "self", amount: 100 },
      { kind: "heal", target: "self", ratio: 0.5, chance: 0.25 }
    ];
  }
  if (name === "天尊法身" || skillId === 16284) {
    return [
      { kind: "priority", target: "self", value: 1 },
      { kind: "onDamagedStage", target: "self", applyTo: "self", keys: ["def", "spDef"], delta: 1, turns: 5, chance: 1, trigger: "damaged", triggerOncePerTurn: true }
    ];
  }
  if (name === "地破天穹" || skillId === 16285) {
    return [
      { kind: "randomStage", target: "opponent", keys: BATTLE_STAGE_KEYS.slice(), min: 1, max: 2, delta: -1, chance: 1, requireHit: true }
    ];
  }
  if (name === "传说的瀑布" || skillId === 11275 || skillId === 1646) {
    return [
      { kind: "dynamicPower", target: "self", mode: "selfHpHighPercentStep", minPower: 1, maxPower: 260, stepRatio: 0.1, drop: 10 }
    ];
  }
  if (name === "暗能") {
    return [
      { kind: "ppChange", target: "opponent", amount: -3, chance: 1, requireHit: false },
      { kind: "ppChange", target: "self", amount: 2, chance: 1, requireHit: false }
    ];
  }
  if (name === "苍雷") {
    return [
      { kind: "priority", target: "self", value: 1 },
      { kind: "clearStage", target: "opponent", mode: "positive", keys: ALL_ABILITY_STAGE_KEYS.slice(), chance: 0.4, requireHit: true },
      { kind: "stageGuard", target: "self", mode: "debuff", turns: 3, requireHit: true }
    ];
  }
  if (name === "龙战玄黄") {
    return [
      { kind: "stage", target: "self", keys: ["atk", "spAtk", "def", "spDef", "accuracy"], delta: 1, chance: 1, requireHit: false },
      { kind: "damageReduction", target: "self", ratio: 0.4, turns: 3 }
    ];
  }
  if (name === "冰封禁制") {
    return [
      { kind: "skillSealChance", target: "opponent", turns: 3, chance: 1 / 3, requireHit: true }
    ];
  }
  if (name === "灵之逆转" && skillId === 16250) {
    return [
      { kind: "priority", target: "self", value: 1 },
      { kind: "transferStage", target: "self", from: "opponent", to: "self", mode: "positive", keys: ALL_ABILITY_STAGE_KEYS.slice(), chance: 0.3, requireHit: false, clearStageOnTransferSuccess: true }
    ];
  }
  if (name === "灵之逆转" && skillId === 16253) {
    return [
      { kind: "priority", target: "self", value: 1 },
      { kind: "transferStage", target: "self", from: "opponent", to: "self", mode: "positive", keys: ALL_ABILITY_STAGE_KEYS.slice(), chance: 0.15, requireHit: false },
      { kind: "clearStage", target: "opponent", mode: "positive", keys: ALL_ABILITY_STAGE_KEYS.slice(), chance: 0.4, requireHit: false },
      { kind: "clearStage", target: "self", mode: "negative", keys: ALL_ABILITY_STAGE_KEYS.slice(), chance: 0.2, requireHit: false }
    ];
  }
  if (skillId === 16313 || name === "瞬灵逆转") {
    return [
      { kind: "priority", target: "self", value: 1 },
      { kind: "flag", flag: "mustHit" },
      { kind: "copyStage", target: "opponent", copyTo: "self", keys: ALL_ABILITY_STAGE_KEYS.slice(), chance: 0.3, requireHit: false, clearStageAfterCopyRoll: true }
    ];
  }
  if (name === "飓风·雷电") {
    const effects = [
      { kind: "lifesteal", target: "self", ratio: 1 / 3, selfHpBelowRatio: 0.5 }
    ];
    if (skillId === 16254) effects.push({ kind: "stage", target: "self", keys: ["accuracy"], delta: 1, chance: 1, requireHit: false });
    if (skillId === 16314) effects.push({ kind: "stage", target: "self", keys: ["accuracy", "critStage"], delta: 1, chance: 1, requireHit: false });
    return effects;
  }
  if (name === "噬灵雷电") return [{ kind: "lifesteal", target: "self", ratio: 1 / 3, selfHpBelowRatio: 0.5 }];
  if (name === "真·血印" || name === "真血印" || skillId === 17294) {
    return [
      { kind: "dynamicPower", target: "self", mode: "selfHpHighPercentStep", minPower: 1, maxPower: 300, stepRatio: 0.1, drop: 10 },
      { kind: "recoilFlat", target: "self", amount: 100 },
      { kind: "heal", target: "self", ratio: 0.5, chance: 0.5 },
      { kind: "status", target: "opponent", status: "fear", turns: 3, chance: 0.25 }
    ];
  }
  if (name === "究极血印") {
    return [
      { kind: "dynamicPower", target: "self", mode: "selfHpHigh", minPower: 1, maxPower: 140 },
      { kind: "recoilFlat", target: "self", amount: 100 },
      { kind: "heal", target: "self", ratio: 0.5, chance: 0.5 },
      { kind: "stage", target: "opponent", keys: ["def"], delta: -1, chance: 0.3 }
    ];
  }
  if (name === "★究极血印") {
    return [
      { kind: "flag", flag: "mustHit" },
      { kind: "dynamicPower", target: "self", mode: "selfHpHigh", minPower: 1, maxPower: 140 },
      { kind: "recoilFlat", target: "self", amount: 100 },
      { kind: "heal", target: "self", ratio: 0.5, chance: 0.5 },
      { kind: "stage", target: "opponent", keys: ["def"], delta: -1, chance: 0.5 }
    ];
  }
  if (name === "召唤雪崩") {
    return [
      { kind: "turnSequenceAttack", target: "opponent", turns: 5, powerMultiplier: 2, elementShelterMultiplier: 2 }
    ];
  }
  if (["蛇缠身", "石轮回旋击"].includes(name)) {
    return [
      { kind: "turnSequenceAttack", target: "opponent", turns: 5, powerMultiplier: 2, elementShelterMultiplier: 2 }
    ];
  }
  if (name === "狂沙吞噬") {
    return [
      { kind: "turnSequenceAttack", target: "opponent", turns: 3, powerMultiplier: 2, elementShelterMultiplier: 2 }
    ];
  }
  if (name === "密宗拳") {
    return [
      { kind: "turnSequenceAttack", target: "opponent", turns: 5, powerMultiplier: 2, elementShelterMultiplier: 2, resetOnFail: true }
    ];
  }
  if (name === "巨刃破邪") {
    return [
      { kind: "turnSequenceAttack", target: "opponent", turns: 5, powerMultiplier: 2, elementShelterMultiplier: 2 }
    ];
  }
  if (name === "麦斗巨炮") {
    return [
      { kind: "turnSequenceAttack", target: "opponent", turns: 5, powerMultiplier: 2 },
      { kind: "stage", target: "self", keys: ["atk"], delta: 1, chance: 0.5 }
    ];
  }
  if (name === "链式反应") {
    return [
      { kind: "turnSequenceAttack", target: "opponent", turns: 4, powerAdd: 60 }
    ];
  }
  if (name === "星诺火纹") {
    return [
      { kind: "turnSequenceAttack", target: "opponent", turns: 5, powerAdd: 30, keepOnMiss: true }
    ];
  }
  if (name === "叮叮顶") {
    return [
      { kind: "turnSequenceAttack", target: "opponent", turns: 5, powerMultiplier: 2 }
    ];
  }
  if (name === "狂暴炎冰") {
    return [
      { kind: "multiHit", target: "opponent", min: 3, max: 3, powerList: [60, 80, 120] }
    ];
  }
  if (name === "不灭的意志") return [{ kind: "lastStand", target: "self", turns: 1 }];
  if (name === "意念无限" || skillId === 1226) return [{ kind: "fullRestoreOnDefeatThisTurn", target: "self", turns: 1 }];
  if (name === "极寒之拥" || skillId === 15301) {
    return [
      { kind: "stage", target: "self", keys: ["atk", "def", "spDef"], delta: 1, chance: 1, requireHit: false },
      { kind: "lifestealBuff", target: "self", ratio: 0.4, turns: 3 }
    ];
  }
  if (name === "刺骨之刃" || skillId === 21036) {
    return [
      { kind: "fixedPowerOverride", power: 1 },
      { kind: "ignoreDefense", target: "opponent", attackKind: "physical", ratio: 1 }
    ];
  }
  if (name === "寒冬诅咒" || skillId === 15303) {
    return [
      { kind: "stealStage", target: "opponent", keys: ["def"], delta: 1, chance: 0.4, requireHit: true }
    ];
  }
  if (name === "意念之盾") return [{ kind: "typedDamageReduction", target: "self", attackKind: "physical", ratio: 0.5, turns: 5 }];
  if (name === "念力壁") return [{ kind: "typedDamageReduction", target: "self", attackKind: "special", ratio: 0.5, turns: 5 }];
  if (name === "闪电护盾" || skillId === 13205) return [
    { kind: "typedDamageReduction", target: "self", attackKind: "special", ratio: 0.5, turns: 5 },
    { kind: "damageReflect", target: "self", attackKind: "physical", ratio: 0.25, turns: 5 }
  ];
  if (name === "银光护盾") return [{ kind: "damageShield", target: "self", turns: 5, amount: 50 }];
  if (name === "冰雾海") return [
    { kind: "status", target: "opponent", status: "bind", turns: 5, chance: 1, requireHit: true },
    { kind: "lockGodDrain", target: "opponent", turns: 5, ratio: 1 / 16, label: "冰雾海" }
  ];
  if (name === "无锋巨刃") return [
    { kind: "fixedPowerOverride", power: 1 },
    { kind: "forceAttackKind", attackKind: "physical" },
    { kind: "ignoreDefense", target: "opponent", attackKind: "physical", ratio: 1 }
  ];
  if (name === "腐蚀酸云") return [{ kind: "mutualEndTurnDamageFlat", target: "both", turns: 5, amount: skillId === 2213 ? 300 : 200 }];
  if (name === "一击必杀") return [{ kind: "fixedPowerOverride", power: 1 + Math.floor(Math.random() * 500) }];
  if (name === "火之净化" || name === "★火之净化") {
    const out = [{ kind: "ppChange", target: "opponent", amount: -5, chance: 1, requireHit: true }];
    if (name === "★火之净化") out.push({ kind: "damageReduction", target: "self", ratio: 0.2, turns: 3 });
    return out;
  }
  if (name === "吸附") return [{ kind: "flatDrain", target: "opponent", turns: 20, amount: 50, label: "吸附" }];
  if (name === "降龙有悔") return [{ kind: "leaveOneHp", target: "opponent" }];
  if (name === "平沙落雁") return [{ kind: "fixedDamageByLevel", target: "opponent", factor: 2.5 }];
  if (name === "龙啸九天") {
    return [
      { kind: "stage", target: "self", keys: ALL_ABILITY_STAGE_KEYS.slice(), delta: 1, chance: 1, requireHit: false },
      { kind: "recoilFlat", target: "self", amount: 100, chance: 0.5 }
    ];
  }
  if (name === "龙腾四海") {
    if (skillId === 29386 || skillId === 29387 || skillId === 29388) {
      return [{ kind: "damageBoost", target: "self", turns: 3, factor: skillId === 29386 ? 1.25 : 1.5 }];
    }
    return [{ kind: "dragonBaseBoost", target: "self", ratio: 0.1, maxStacks: 5 }];
  }
  if (name === "玄冥绝灭") {
    return [{ kind: "instantKo", target: "opponent", chance: 0.5, requireHit: true, damageValue: 999999, stopSelfOnSuccess: 1, guardianBossImmune: true }];
  }
  if (name === "光明漩涡") {
    return [
      { kind: "priority", value: 1 },
      { kind: "instantKo", target: "opponent", chance: 0.3, requireHit: true, damageValue: 999999, guardianBossImmune: true },
      { kind: "transferStage", target: "self", from: "opponent", to: "self", mode: "positive", keys: ALL_ABILITY_STAGE_KEYS.slice(), chance: 1, requireHit: true, doubleWhenSelfHpBelowHalf: true }
    ];
  }
  if (name === "火之辉耀") return [{ kind: "lockGodDrain", target: "opponent", turns: 99, flat: 80, label: "火之辉耀" }];
  if (name === "障眼法") {
    return [
      { kind: "diminishingSuccessGate", target: "self" },
      { kind: "attackImmunity", target: "self", turns: 1, attackKind: "all" },
      { kind: "healFlatOnDiminishingFail", target: "self", amount: 100 }
    ];
  }
  return [];
};
const findHardcodedSkillEffects = (skill) => {
  const source = typeof window !== "undefined" && window.AOLA_SKILL_EFFECTS_HARDCODED
    ? window.AOLA_SKILL_EFFECTS_HARDCODED
    : null;
  if (!source || typeof source !== "object") return [];
  const byId = source.byId && typeof source.byId === "object" ? source.byId : {};
  const maxSkillId = Math.max(0, Number(source.maxSkillId) || 24000);
  const sid = Number(skill && skill.skillId);
  if (!Number.isFinite(sid) || sid <= 0) return [];
  if (Array.isArray(byId[String(sid)])) return cloneSkillEffectList(byId[String(sid)]);
  if (Number.isFinite(sid) && sid > maxSkillId) return [];
  return [];
};
const parseSkillEffectsFromDesc = (skill) => {
  const name = normalize(skill && skill.name);
  const desc = normalize(skill && skill.desc).replace(/％/g, "%");
  const effects = [];
  const add = (x) => effects.push(x);
  const hasEffect = (kind, target = "", keys = null) => effects.some((e) => {
    if (normalize(e && e.kind) !== kind) return false;
    if (target && normalize(e && e.target) !== target) return false;
    if (!Array.isArray(keys)) return true;
    const cur = Array.isArray(e && e.keys) ? e.keys.map(normalize).sort().join("|") : "";
    return cur === keys.map(normalize).sort().join("|");
  });
  const canonicalSkillName = name.replace(/决/g, "诀");
  const skillIdForDesc = Number(skill && skill.skillId) || 0;
  const addEffectOnce = (effect) => {
    const key = [
      normalize(effect && effect.kind),
      normalize(effect && effect.target),
      normalize(effect && effect.mode),
      normalize(effect && effect.attackKind),
      normalize(effect && effect.status),
      Array.isArray(effect && effect.keys) ? effect.keys.map(normalize).sort().join(",") : "",
      Number(effect && effect.delta) || 0,
      Number(effect && effect.chance) || 0,
      Number(effect && effect.turns) || 0,
      Number(effect && effect.factor) || 0,
      Number(effect && effect.amount) || 0,
      Number(effect && effect.ratio) || 0
    ].join("|");
    const exists = effects.some((e) => [
      normalize(e && e.kind),
      normalize(e && e.target),
      normalize(e && e.mode),
      normalize(e && e.attackKind),
      normalize(e && e.status),
      Array.isArray(e && e.keys) ? e.keys.map(normalize).sort().join(",") : "",
      Number(e && e.delta) || 0,
      Number(e && e.chance) || 0,
      Number(e && e.turns) || 0,
      Number(e && e.factor) || 0,
      Number(e && e.amount) || 0,
      Number(e && e.ratio) || 0
    ].join("|") === key);
    if (!exists) add(effect);
  };
  const elementNamePattern = "(木系|火系|水系|冰系|土系|电系|光明系|暗黑系|神秘系|机械系|飞行系|龙系|上古系|数码系|格斗系|王系|神兵系|圣灵系|爬行系|普通系|毒系|雷系)";
  if (skillIdForDesc > 0 && skillIdForDesc < 24000 && desc.includes("一场战斗使用次数越多，成功率越低")) {
    add({ kind: "diminishingSuccessGate", target: "self" });
  }
  const priorityMatch = desc.match(/先至\s*\+?\s*(\d+)/);
  const latePriorityMatch = desc.match(/后至\s*\+?\s*(\d+)/);
  if (priorityMatch) {
    addEffectOnce({ kind: "priority", target: "self", value: Math.max(1, Math.floor(Number(priorityMatch[1]) || 1)) });
  } else if (latePriorityMatch) {
    addEffectOnce({ kind: "priority", target: "self", value: -Math.max(1, Math.floor(Number(latePriorityMatch[1]) || 1)) });
  } else if (/(先发后至|后发|后至|最后出手)/.test(desc)) {
    addEffectOnce({ kind: "priority", target: "self", value: -1 });
  } else if (/(先发|先制|优先出手|先出手)/.test(desc)) {
    addEffectOnce({ kind: "priority", target: "self", value: 1 });
  }
  if (canonicalSkillName === "锁神诀") {
    return [
      { kind: "lockGodSeal", target: "opponent", turns: 5, ratio: 1 / 16, speedDelta: -1, label: "锁神诀" }
    ];
  }
  if (name === "风神附体") {
    return [
      { kind: "windGodPossession", target: "self", ratio: 0.5, boostDelta: 3, accuracyDelta: -3 }
    ];
  }
  const MANUAL_STAGE_SKILL_NAMES = new Set();
  const hasStatusApplyIntent = (fullDesc, keyword) => {
    const t = normalize(fullDesc).replace(/％/g, "%");
    if (!t || !keyword) return false;
    const cureClause = new RegExp(`(?:解除|清除|治愈|消除)[^。；，\\n]{0,18}${keyword}`);
    if (cureClause.test(t)) return false;
    // 仅在“施加异常”语义下触发，避免“若目标睡眠时/对中毒目标…”误判
    // 条件语义（判定条件）优先排除，除非同句存在明确施加动作词。
    const applyVerb = "(?:令|使|附加|造成|进入|陷入|触发)";
    const hasDirectApply = new RegExp(`${applyVerb}[^。；，\\n]{0,16}${keyword}`).test(t);
    const conditionalOnly = [
      new RegExp(`(?:若|如果|当)[^。；，\\n]{0,16}${keyword}(?:时|则|的)`),
      new RegExp(`(?:对|针对)[^。；，\\n]{0,6}${keyword}(?:状态|目标)?`),
      new RegExp(`${keyword}(?:状态)?时`)
    ].some((r) => r.test(t));
    if (conditionalOnly && !hasDirectApply) return false;
    const rules = [
      new RegExp(`${applyVerb}[^。；，\\n]{0,16}${keyword}`),
      new RegExp(`(?:概率|几率|机率|\\d+%|必定)[^。；，\\n]{0,12}${applyVerb}?[^。；，\\n]{0,12}${keyword}`),
      new RegExp(`${keyword}[^。；，\\n]{0,8}(?:状态|效果)`),
      new RegExp(`(?:命中后|命中则|命中时|若命中)[^。；，\\n]{0,16}(?:自身|自己|我方|对方|敌方|目标)?[^。；，\\n]{0,8}${keyword}`),
      new RegExp(`(?:自身|自己|我方|对方|敌方|目标)[^。；，\\n]{0,8}${keyword}`)
    ];
    if (rules.some((r) => r.test(t))) return true;
    return false;
  };
  const parseStatusCureEffects = (fullDesc) => {
    const t = normalize(fullDesc).replace(/％/g, "%");
    if (!t) return;
    const map = [
      { key: "中毒", status: "poison" },
      { key: "烧伤", status: "burn" },
      { key: "睡眠", status: "sleep" },
      { key: "麻痹", status: "paralyze" },
      { key: "冰冻", status: "freeze" }
    ];
    map.forEach((x) => {
      // “解除/清除/治愈/消除 + 异常”默认按解除自身异常处理，避免被后续异常施加解析误判。
      const re = new RegExp(`(?:解除|清除|治愈|消除)[^。；，\\n]{0,12}(?:自身|自己|我方)?[^。；，\\n]{0,12}${x.key}|(?:解除|清除|治愈|消除)[^。；，\\n]{0,12}${x.key}[^。；，\\n]{0,8}(?:状态|异常)?`);
      if (!re.test(t)) return;
      const chance = statusChanceFromDesc(t, x.key, 1);
      add({ kind: "statusCure", target: "self", status: x.status, chance });
    });
  };
  const parseTurns = (fallback = 3) => {
    const m = desc.match(/持续\s*([0-9一二三四五六])\s*回合/);
    return m ? Math.max(1, cnNumToInt(m[1], fallback)) : fallback;
  };
  const stageKeywordsPattern = "全属性|全能力|双攻|双防|攻防|攻击和特攻|防御和特防|攻击和速度|攻速|命中和闪避|命中率和闪避率|普攻|物攻|魔攻|攻击|防御|特攻|特防|速度|命中率|命中|闪避率|闪避|回避率|回避|暴击等级|暴击率|会心一击率|会心|暴击";
  const parseChanceNear = (text, idx) => {
    const t = normalize(text).replace(/％/g, "%");
    const left = Math.max(0, idx - 24);
    const right = Math.min(t.length, idx + 24);
    const seg = t.slice(left, right);
    if (seg.includes("极大概率")) return 0.9;
    if (seg.includes("较高概率") || seg.includes("较高几率") || seg.includes("较高机率")) return 0.7;
    if (seg.includes("一定概率") || seg.includes("一定几率") || seg.includes("一定机率") || seg.includes("有概率")) return 0.3;
    const m = seg.match(/(\d+(?:\.\d+)?)\s*%\s*(?:概率|几率|机率)?|(?:概率|几率|机率)\s*(\d+(?:\.\d+)?)\s*%/);
    if (!m) return 1;
    const n = Number(m[1] || m[2]);
    return Number.isFinite(n) ? clamp(n / 100, 0, 1) : 1;
  };
  const parseChanceInText = (text, fallback = 1) => {
    const t = normalize(text).replace(/％/g, "%");
    if (t.includes("极大概率")) return 0.9;
    if (t.includes("较高概率")) return 0.7;
    if (t.includes("一定概率") || t.includes("有概率")) fallback = 0.3;
    const m = t.match(/(\d+(?:\.\d+)?)\s*%\s*(?:概率|几率|机率)?|(?:概率|几率|机率)\s*(\d+(?:\.\d+)?)\s*%/);
    if (!m) return fallback;
    const n = Number(m[1] || m[2]);
    return Number.isFinite(n) ? clamp(n / 100, 0, 1) : fallback;
  };
  const hasHitGateNear = (text, idx) => {
    const t = normalize(text);
    const left = Math.max(0, idx - 20);
    const seg = t.slice(left, idx + 6);
    return /(命中后|命中则|命中时|若命中|命中敌方|命中对方)/.test(seg);
  };
  const parseGeneralTurns = (text, fallback = 3) => {
    const t = normalize(text);
    const m = t.match(/(?:持续|有效|存在)?\s*([0-9一二三四五六七八九十两]+)\s*回合|([0-9一二三四五六七八九十两]+)\s*回合(?:内|中|里)?/);
    return m ? Math.max(1, cnNumToInt(m[1] || m[2], fallback)) : fallback;
  };
  const parseElementPowerEffects = (text) => {
    const t = normalize(text).replace(/％/g, "%").replace(/[“”"']/g, "");
    if (!t) return;
    const elementName = "(?:木系|火系|水系|冰系|土系|电系|光明系|暗黑系|神秘系|机械系|飞行系|龙系|上古系|数码系|格斗系|王系|神兵系|圣灵系|爬行系|普通系|毒系)";
    const opWord = "(增加|提升|提高|上升|增强|降低|下降|减少|削弱|减小)";
    const turnM = t.match(/(?:持续|回合内)\s*([0-9一二三四五六十百两]+)\s*回合|([0-9一二三四五六十百两]+)\s*回合内/);
    const turns = turnM ? Math.max(1, cnNumToInt(turnM[1] || turnM[2], 3)) : 3;
    const seen = new Set();
    // 句式1：火系技能威力增加50%
    const r1 = new RegExp(`(${elementName})\\s*技能\\s*威力\\s*${opWord}\\s*(\\d+(?:\\.\\d+)?)\\s*%`, "g");
    let m = null;
    while ((m = r1.exec(t))) {
      const el = normalizeElementName(m[1]);
      const op = m[2];
      const pct = Number(m[3]);
      if (!el || !Number.isFinite(pct)) continue;
      const factor = /增加|提升|提高|上升|增强/.test(op) ? (1 + pct / 100) : Math.max(0, 1 - pct / 100);
      const k = `${el}|${factor.toFixed(4)}|${turns}`;
      if (seen.has(k)) continue;
      seen.add(k);
      add({ kind: "globalElementPower", element: el, factor, turns });
    }
    // 句式2：增加50%火系技能威力 / 降低30%水系技能威力
    const r2 = new RegExp(`${opWord}\\s*(\\d+(?:\\.\\d+)?)\\s*%\\s*(${elementName})\\s*技能\\s*威力`, "g");
    let m2 = null;
    while ((m2 = r2.exec(t))) {
      const op = m2[1];
      const pct = Number(m2[2]);
      const el = normalizeElementName(m2[3]);
      if (!el || !Number.isFinite(pct)) continue;
      const factor = /增加|提升|提高|上升|增强/.test(op) ? (1 + pct / 100) : Math.max(0, 1 - pct / 100);
      const k = `${el}|${factor.toFixed(4)}|${turns}`;
      if (seen.has(k)) continue;
      seen.add(k);
      add({ kind: "globalElementPower", element: el, factor, turns });
    }
    // 句式3：全场火系威力增加50% / 冰系威力减小20%
    const r3 = new RegExp(`(${elementName})\\s*威力\\s*${opWord}\\s*(\\d+(?:\\.\\d+)?)\\s*(?:%|百分比)?`, "g");
    let m3 = null;
    while ((m3 = r3.exec(t))) {
      const el = normalizeElementName(m3[1]);
      const op = m3[2];
      const pct = Number(m3[3]);
      if (!el || !Number.isFinite(pct)) continue;
      const factor = /增加|提升|提高|上升|增强/.test(op) ? (1 + pct / 100) : Math.max(0, 1 - pct / 100);
      const k = `${el}|${factor.toFixed(4)}|${turns}`;
      if (seen.has(k)) continue;
      seen.add(k);
      add({ kind: "globalElementPower", element: el, factor, turns });
    }
    // 句式4：提升水系、火系技能威力30%
    const multiElement = `${elementName}(?:[、,，和与]\\s*${elementName})+`;
    const r4 = new RegExp(`(${opWord})\\s*(${multiElement})\\s*技能\\s*威力\\s*(\\d+(?:\\.\\d+)?)\\s*(?:%|百分比)?`, "g");
    let m4 = null;
    while ((m4 = r4.exec(t))) {
      const op = m4[1];
      const elsRaw = normalize(m4[2]);
      const pct = Number(m4[3]);
      if (!elsRaw || !Number.isFinite(pct)) continue;
      const factor = /增加|提升|提高|上升|增强/.test(op) ? (1 + pct / 100) : Math.max(0, 1 - pct / 100);
      const parts = elsRaw.split(/[、,，和与]/g).map((x) => normalizeElementName(x)).filter(Boolean);
      parts.forEach((el) => {
        const k = `${el}|${factor.toFixed(4)}|${turns}`;
        if (seen.has(k)) return;
        seen.add(k);
        add({ kind: "globalElementPower", element: el, factor, turns });
      });
    }
  };
  parseElementPowerEffects(desc);
  if (/(?:必定命中|必定击中|必中|一定命中|100%\s*命中)|(?:命中率)[^。；，\n]{0,8}(?:100%|百分百)/.test(desc)) {
    addEffectOnce({ kind: "mustHit", target: "self" });
  }
  if (/(?:解除|清除|治愈|消除|净化)[^。；，\n]{0,18}(?:自身|自己|我方)?[^。；，\n]{0,12}(?:异常状态|不良状态|所有异常|全部异常)|(?:净化|解除|清除|治愈|消除)[^。；，\n]{0,18}(?:自身|自己|我方)?[^。；，\n]{0,12}所有[^。；，\n]{0,8}(?:异常|不良)/.test(desc)) {
    addEffectOnce({ kind: "statusCure", target: "self", status: "all", chance: 1 });
  }
  if (/(?:异常状态|不良状态)[^。；，\n]{0,18}(?:不会|不能|无法|免疫|不出现)|(?:不会|不能|无法|免疫|不出现)[^。；，\n]{0,18}(?:异常状态|不良状态)/.test(desc)) {
    addEffectOnce({ kind: "statusShield", target: "self", status: "all", turns: parseGeneralTurns(desc, 3) });
  }
  if (/(?:无视|闪避|免受|免疫)[^。；，\n]{0,18}(?:对手|对方|敌方)?[^。；，\n]{0,8}(?:本回合)?[^。；，\n]{0,8}(?:攻击|伤害)/.test(desc)) {
    let attackKind = "all";
    if (/(普通攻击|普攻|物理攻击)/.test(desc) && !/(特殊攻击|特攻|魔攻)/.test(desc)) attackKind = "physical";
    else if (/(特殊攻击|特攻|魔攻)/.test(desc) && !/(普通攻击|普攻|物理攻击)/.test(desc)) attackKind = "special";
    addEffectOnce({ kind: "attackImmunity", target: "self", turns: parseGeneralTurns(desc, /(本回合|当回合)/.test(desc) ? 1 : 3), chance: statusChanceFromDesc(desc, "", 1), attackKind });
  }
  const damageReductionClause = desc.split(/[。；，\n]/).find((part) => /伤害抗性|伤害抵抗|伤害抵抗能力|受到伤害减少|承受伤害减少|减伤/.test(part));
  if (damageReductionClause) {
    const keywordMatch = damageReductionClause.match(/伤害抗性|伤害抵抗|伤害抵抗能力|受到伤害减少|承受伤害减少|减伤/);
    const afterKeyword = keywordMatch ? damageReductionClause.slice((keywordMatch.index || 0) + keywordMatch[0].length) : damageReductionClause;
    const afterPct = afterKeyword.match(/([0-9]+(?:\.[0-9]+)?)\s*%/);
    const beforePct = !afterPct ? damageReductionClause.slice(0, keywordMatch ? keywordMatch.index || 0 : damageReductionClause.length).match(/([0-9]+(?:\.[0-9]+)?)\s*%[^%]*$/) : null;
    const pct = Number((afterPct && afterPct[1]) || (beforePct && beforePct[1]));
    if (Number.isFinite(pct) && pct > 0) addEffectOnce({ kind: "damageReduction", target: "self", ratio: clamp(pct / 100, 0.01, 1), turns: parseGeneralTurns(desc, /(本回合|当回合)/.test(desc) ? 1 : 3) });
  }
  const halfDamageReduction = desc.match(/(?:受到|承受|受)[^。；，\n]{0,18}(?:伤害|攻击)?[^。；，\n]{0,12}(?:减少一半|降低一半|减半)|(?:伤害|攻击)[^。；，\n]{0,12}(?:减少一半|降低一半|减半)/);
  if (halfDamageReduction) {
    addEffectOnce({ kind: "damageReduction", target: "self", ratio: 0.5, turns: parseGeneralTurns(desc, /(本回合|当回合)/.test(desc) ? 1 : 3) });
  }
  if (/(?:容易|更容易|较容易)[^。；，\n]{0,8}(?:暴击|会心)|(?:暴击|会心)[^。；，\n]{0,8}(?:容易|更容易|较容易)/.test(desc)) {
    addEffectOnce({ kind: "critStage", target: "self", delta: 1 });
  }
  if (/(?:较高|很高|高)[^。；，\n]{0,8}(?:暴击|会心)|(?:暴击|会心)[^。；，\n]{0,8}(?:较高|很高|高)/.test(desc)) {
    addEffectOnce({ kind: "critStage", target: "self", delta: 2 });
  }
  if (/(?:自身体力|自己体力|自身HP|自己HP|自身生命|自己生命)[^。；，\n]{0,18}(?:越少|越低|越小)[^。；，\n]{0,24}(?:威力|伤害)|(?:威力|伤害)[^。；，\n]{0,24}(?:自身体力|自己体力|自身HP|自己HP|自身生命|自己生命)[^。；，\n]{0,18}(?:越少|越低|越小)/.test(desc)) {
    addEffectOnce({ kind: "dynamicPower", target: "self", mode: "selfHpLost", minPower: 20, maxPower: 200 });
  }
  const chancePowerMultiplierMatches = Array.from(desc.matchAll(/(\d+(?:\.\d+)?)\s*%\s*(?:概率|几率|机率)?[^。；，\n]{0,10}(?:发动|造成|打出|发挥|伤害提升至|将伤害提升至)?[^。；，\n]{0,8}([0-9]+(?:\.[0-9]+)?)\s*倍(?:威力|伤害)?/g));
  if (chancePowerMultiplierMatches.length > 0) {
    addEffectOnce({
      kind: "chancePowerMultiplier",
      target: "self",
      chances: chancePowerMultiplierMatches.map((m) => ({
        chance: clamp(Number(m[1]) / 100, 0, 1),
        factor: Math.max(0.01, Number(m[2]) || 1)
      }))
    });
  }
  if (/(?:自身体力|自己体力|自身HP|自己HP|自身生命|自己生命)[^。；，\n]{0,18}(?:越多|越高)[^。；，\n]{0,24}(?:威力|伤害)|(?:威力|伤害)[^。；，\n]{0,24}(?:自身体力|自己体力|自身HP|自己HP|自身生命|自己生命)[^。；，\n]{0,18}(?:越多|越高)/.test(desc)) {
    const base = Math.max(1, Number(skill && skill.power) || 20);
    addEffectOnce({ kind: "dynamicPower", target: "self", mode: "selfHpHigh", minPower: base, maxPower: base * 2 });
  }
  if (/(?:对方|敌方|目标)[^。；，\n]{0,12}(?:剩余)?(?:体力|HP|生命)[^。；，\n]{0,18}(?:越多|越高)[^。；，\n]{0,24}(?:威力|伤害)|(?:威力|伤害)[^。；，\n]{0,24}(?:对方|敌方|目标)[^。；，\n]{0,12}(?:剩余)?(?:体力|HP|生命)[^。；，\n]{0,18}(?:越多|越高)/.test(desc)) {
    const maxPower = Math.max(1, Number(skill && skill.power) || 120);
    addEffectOnce({ kind: "dynamicPower", target: "self", mode: "targetHpHigh", minPower: 1, maxPower });
  }
  if (/(?:PP|pp)[^。；，\n]{0,18}(?:越少|减少|降低)[^。；，\n]{0,24}(?:威力|伤害)|(?:威力|伤害)[^。；，\n]{0,24}(?:随着|随)[^。；，\n]{0,8}(?:PP|pp)[^。；，\n]{0,12}(?:减少|降低)/.test(desc)) {
    addEffectOnce({ kind: "dynamicPower", target: "self", mode: "ppLow" });
  }
  const damageShieldByDamageMatch = desc.match(/(?:伤害|伤害值|造成伤害)(?:的)?\s*((?:\d+\s*\/\s*\d+)|(?:\d+(?:\.\d+)?\s*%)|一半|三分之一|四分之一|五分之一|六分之一|八分之一|十六分之一)[^。；，\n]{0,18}(?:作为|转化为|形成|制造)[^。；，\n]{0,12}(?:护盾)|(?:护盾)[^。；，\n]{0,18}(?:吸收|抵抗)[^。；，\n]{0,18}(?:伤害|伤害值)(?:的)?\s*((?:\d+\s*\/\s*\d+)|(?:\d+(?:\.\d+)?\s*%)|一半|三分之一|四分之一|五分之一|六分之一|八分之一|十六分之一)/);
  if (damageShieldByDamageMatch) {
    const ratio = parseRatioFromText(damageShieldByDamageMatch[1] || damageShieldByDamageMatch[2], null);
    if (Number.isFinite(ratio) && ratio > 0) {
      addEffectOnce({ kind: "damageShieldByDamage", target: "self", ratio: clamp(ratio, 0.01, 3), turns: parseGeneralTurns(desc, 3), requireHit: /命中/.test(desc) });
    }
  }
  const flatShieldMatch = desc.match(/(?:吸取|夺取|扣除|减少)[^。；，\n]{0,12}(?:对方|敌方|目标)[^。；，\n]{0,12}([0-9]+)\s*点(?:体力值?|生命值?|HP|hp)[^。；，\n]{0,18}(?:作为|转化为|形成|制造)[^。；，\n]{0,12}护盾|护盾[^。；，\n]{0,18}(?:吸收|抵抗|承受)[^0-9。；，\n]{0,12}([0-9]+)\s*点(?:直接攻击)?伤害/);
  if (flatShieldMatch) {
    addEffectOnce({ kind: "damageShield", target: "self", amount: Math.max(1, Math.floor(Number(flatShieldMatch[1] || flatShieldMatch[2]) || 1)), turns: parseGeneralTurns(desc, 3), requireHit: /命中/.test(desc) });
  }
  const delayedAbsorbMatch = desc.match(/(?:下回合|下一回合)[^。；，\n]{0,16}(?:吸收|完全吸收)[^。；，\n]{0,20}(?:伤害|对方造成的伤害)[^。；，\n]{0,16}(?:转化为|回复|恢复)[^。；，\n]{0,12}(?:体力|生命|HP|hp)/);
  if (delayedAbsorbMatch) {
    addEffectOnce({ kind: "damageAbsorb", target: "self", turns: 1, chance: statusChanceFromDesc(desc, "", 1) });
  }
  const elementReductionMatch = desc.match(new RegExp(`(?:全场)?[^。；，\\n]{0,8}受(${elementNamePattern})(?:攻击)?伤害(?:减半|降低\\s*(\\d+(?:\\.\\d+)?)\\s*%)|(${elementNamePattern})(?:攻击)?伤害(?:减半|降低\\s*(\\d+(?:\\.\\d+)?)\\s*%)`));
  if (elementReductionMatch) {
    const element = normalizeElementName(elementReductionMatch[1] || elementReductionMatch[3]);
    const pct = Number(elementReductionMatch[2] || elementReductionMatch[4]);
    const ratio = Number.isFinite(pct) && pct > 0 ? clamp(pct / 100, 0.01, 0.95) : 0.5;
    ["self", "opponent"].forEach((target) => addEffectOnce({ kind: "elementDamageReduction", target, element, ratio, turns: parseGeneralTurns(desc, 3) }));
  }
  const elementChangeMatch = desc.match(new RegExp(`(?:自己|自身|我方)?[^。；，\\n]{0,12}(?:变成|变为|转化为|改变为)(${elementNamePattern})(?:属性|系别)?`));
  if (elementChangeMatch) {
    addEffectOnce({ kind: "elementChange", target: "self", element: normalizeElementName(elementChangeMatch[1]), turns: parseGeneralTurns(desc, 3) });
  }
  const ignoreDefenseMatch = desc.match(/无视[^。；，\n]{0,12}(?:对方|敌方|目标)?[^。；，\n]{0,8}(防御和特防|双防|防御|特防)[^。；，\n]{0,8}(?:数值)?(?:的)?\s*([0-9]+(?:\.[0-9]+)?)?\s*%?/);
  if (ignoreDefenseMatch) {
    const statText = normalize(ignoreDefenseMatch[1]);
    const ratio = ignoreDefenseMatch[2] ? clamp(Number(ignoreDefenseMatch[2]) / 100, 0.01, 1) : 1;
    let attackKind = "all";
    if (statText === "防御") attackKind = "physical";
    else if (statText === "特防") attackKind = "special";
    addEffectOnce({ kind: "ignoreDefense", target: "opponent", attackKind, ratio, requireHit: false });
  }
  const instantKoChance = (() => {
    const m = desc.match(/(\d+(?:\.\d+)?)\s*%\s*(?:概率|几率|机率)?[^。；，\n]{0,8}(?:秒杀|直接击败|直接死亡|失去战斗能力)|(?:概率|几率|机率)\s*(\d+(?:\.\d+)?)\s*%[^。；，\n]{0,8}(?:秒杀|直接击败|直接死亡|失去战斗能力)/);
    if (m) return clamp(Number(m[1] || m[2]) / 100, 0, 1);
    if (/(一定概率|概率|几率|机率)[^。；，\n]{0,16}(?:秒杀|一击必杀|直接击败|直接死亡|失去战斗能力)/.test(desc)) return 0.3;
    if (/(?:100%|必定)[^。；，\n]{0,16}(?:秒杀|一击必杀|直接击败|直接死亡|失去战斗能力)|(?:秒杀|一击必杀|直接击败|直接死亡|失去战斗能力)/.test(desc)) return 1;
    return null;
  })();
  if (Number.isFinite(instantKoChance)) {
    addEffectOnce({ kind: "instantKo", target: "opponent", chance: instantKoChance, requireHit: /攻击|命中/.test(desc), guardianBossImmune: true });
  }
    if (/(?:复制|拷贝)[^。；，\n]{0,24}(?:对方|敌方|目标)[^。；，\n]{0,24}(?:提升|增益|强化)[^。；，\n]{0,24}(?:属性能力等级|属性等级|能力等级|属性)|(?:对方|敌方|目标)[^。；，\n]{0,24}(?:提升|增益|强化)[^。；，\n]{0,24}(?:属性能力等级|属性等级|能力等级|属性|效果)[^。；，\n]{0,24}(?:复制|拷贝)/.test(desc)) {
    addEffectOnce({ kind: "copyStage", target: "opponent", copyTo: "self", keys: ALL_ABILITY_STAGE_KEYS.slice(), chance: statusChanceFromDesc(desc, "", 1), requireHit: /命中/.test(desc) });
  } else if (/(?:复制|拷贝)[^。；，\n]{0,16}(?:对方|敌方|目标)[^。；，\n]{0,16}(?:属性能力等级|属性等级|能力等级)|(?:消耗|扣除)[^。；，\n]{0,20}PP[^。；，\n]{0,16}(?:复制|拷贝)[^。；，\n]{0,16}(?:对方|敌方|目标)[^。；，\n]{0,16}(?:能力等级|属性等级)/.test(desc)) {
    addEffectOnce({ kind: "copyStage", target: "opponent", copyTo: "self", keys: ALL_ABILITY_STAGE_KEYS.slice(), chance: statusChanceFromDesc(desc, "", 1), requireHit: /命中/.test(desc) });
  }
  const clearPositiveStageMatch = desc.match(/(?:(\d+(?:\.\d+)?)\s*%\s*)?(?:概率|几率|机率)?[^。；，\n]{0,8}(?:清除|解除|消除|清空)[^。；，\n]{0,18}(?:对方|敌方|目标)[^。；，\n]{0,18}(?:提升|增益|强化)[^。；，\n]{0,18}(?:属性能力等级|属性等级|能力等级|能力效果|属性等级效果|能力等级效果)|(?:清除|解除|消除|清空)[^。；，\n]{0,18}(?:对方|敌方|目标)[^。；，\n]{0,18}(?:提升|增益|强化)[^。；，\n]{0,18}(?:属性能力等级|属性等级|能力等级|能力效果|属性等级效果|能力等级效果)[^。；，\n]{0,10}(?:(\d+(?:\.\d+)?)\s*%)/);
  if (clearPositiveStageMatch) {
    const pct = Number(clearPositiveStageMatch[1] || clearPositiveStageMatch[2]);
    addEffectOnce({
      kind: "clearStage",
      target: "opponent",
      mode: "positive",
      keys: ALL_ABILITY_STAGE_KEYS.slice(),
      chance: Number.isFinite(pct) ? clamp(pct / 100, 0, 1) : statusChanceFromDesc(desc, "", 1),
      requireHit: /命中|攻击/.test(desc)
    });
  }
  const mirrorOpponentBoostText = /(?:对方|敌方|目标)[^。；，\n]{0,18}(?:提升|提高|上升|强化)[^。；，\n]{0,20}(?:属性能力等级|属性等级|能力等级|属性)[^。；，\n]{0,28}(?:也会|同样|自动|复制)[^。；，\n]{0,18}(?:给|加给|提升|复制给|获得|我方|自己|自身)|(?:对方|敌方|目标)[^。；，\n]{0,18}属性提升的效果[^。；，\n]{0,18}(?:复制|加给|给)[^。；，\n]{0,12}(?:我方|自己|自身)/.test(desc);
  if (mirrorOpponentBoostText) {
    addEffectOnce({
      kind: "mirrorOpponentStageBoost",
      target: "self",
      turns: parseGeneralTurns(desc, /(本回合|当回合)/.test(desc) ? 1 : 3),
      multiplier: /翻倍/.test(desc) ? 2 : 1
    });
  }
  if (/(?:将|把)[^。；，\n]{0,12}(?:自身|自己|我方)[^。；，\n]{0,18}(?:被削弱|削弱|减益|降低|下降)[^。；，\n]{0,18}(?:属性能力等级|属性等级|能力等级)[^。；，\n]{0,16}(?:转移|转嫁|传递)[^。；，\n]{0,12}(?:给|至|到)[^。；，\n]{0,8}(?:对方|敌方|目标)/.test(desc)) {
    addEffectOnce({ kind: "transferStage", target: "opponent", from: "self", to: "opponent", mode: "negative", keys: ALL_ABILITY_STAGE_KEYS.slice(), chance: statusChanceFromDesc(desc, "", 1), requireHit: /命中/.test(desc) });
  }
  if (/(?:将|把)[^。；，\n]{0,12}(?:对方|敌方|目标)[^。；，\n]{0,18}(?:提升|增益|强化)[^。；，\n]{0,18}(?:属性能力等级|属性等级|能力等级)[^。；，\n]{0,16}(?:转移|吸取|夺取)[^。；，\n]{0,12}(?:给|至|到)?[^。；，\n]{0,8}(?:自身|自己|我方)?/.test(desc)) {
    addEffectOnce({ kind: "transferStage", target: "self", from: "opponent", to: "self", mode: "positive", keys: ALL_ABILITY_STAGE_KEYS.slice(), chance: statusChanceFromDesc(desc, "", 1), requireHit: /命中/.test(desc) });
  }
  if (/(?:吸取|夺取)[^。；，\n]{0,12}(?:对方|敌方|目标)[^。；，\n]{0,12}(?:全属性|属性能力等级|属性等级|能力等级)/.test(desc)) {
    addEffectOnce({ kind: "transferStage", target: "self", from: "opponent", to: "self", mode: "positive", keys: ALL_ABILITY_STAGE_KEYS.slice(), chance: statusChanceFromDesc(desc, "", 1), requireHit: /命中/.test(desc) });
  }
  if (/(?:将|把)[^。；，\n]{0,12}(?:自身|自己|我方)[^。；，\n]{0,18}(?:不良状态|异常状态|异常|不良)[^。；，\n]{0,16}(?:转移|转嫁|传递)[^。；，\n]{0,12}(?:给|至|到)[^。；，\n]{0,8}(?:对方|敌方|目标)/.test(desc)) {
    addEffectOnce({ kind: "transferStatus", target: "opponent", from: "self", to: "opponent", status: "all", chance: statusChanceFromDesc(desc, "", 1), requireHit: /命中/.test(desc) });
  }
  if (/(?:防御与攻击|攻击与防御|防御和攻击)[^。；\n]{0,18}(?:特防与特攻|特攻与特防)[^。；\n]{0,24}(?:交换|互换)|(?:交换|互换)[^。；\n]{0,24}(?:防御与攻击|攻击与防御|防御和攻击)[^。；\n]{0,18}(?:特防与特攻|特攻与特防)/.test(desc)) {
    addEffectOnce({ kind: "swapStagePairs", target: "self", pairs: [["atk", "def"], ["spAtk", "spDef"]], chance: 1 });
  }
  if (/(?:任意一种|随机|各种)[^。；，\n]{0,12}(?:不良|异常)状态|(?:附加|给对方附加|令对方附加)\s*([0-9]+)\s*种(?:不良|异常)状态/.test(desc)) {
    const countM = desc.match(/(?:附加|给对方附加|令对方附加)\s*([0-9]+)\s*种(?:不良|异常)状态/);
    addEffectOnce({ kind: "randomStatus", target: "opponent", turns: 3, count: Math.max(1, Math.floor(Number(countM && countM[1]) || 1)), chance: statusChanceFromDesc(desc, "", /(一定概率|概率|几率|机率)/.test(desc) ? 0.3 : 1), requireHit: /命中|攻击/.test(desc) });
  }
  const statusCountDamageMatch = desc.match(/(?:对方|敌方|目标)[^。；，\n]{0,12}(?:身上)?(?:每个|每种)[^。；，\n]{0,8}(?:不良状态|异常状态)[^。；，\n]{0,20}(?:伤害|威力)[^。；，\n]{0,10}(?:增加|提升|提高|附加)\s*([0-9]+)\s*点|(?:每个|每种)[^。；，\n]{0,8}(?:不良状态|异常状态)[^。；，\n]{0,20}(?:令|使)?(?:对方|敌方|目标)?[^。；，\n]{0,10}(?:受到)?\s*([0-9]+)\s*点伤害/);
  if (statusCountDamageMatch) {
    addEffectOnce({ kind: "statusCountBonusDamage", target: "opponent", amountPerStatus: Math.max(1, Math.floor(Number(statusCountDamageMatch[1] || statusCountDamageMatch[2]) || 1)), requireHit: /攻击|命中/.test(desc) });
  }
  const targetLevelDamage = desc.match(/(?:伤害|伤害值)[^。；，\n]{0,12}(?:为|是|等于)?[^。；，\n]{0,8}(?:对方|敌方|目标)[^。；，\n]{0,8}等级[^。；，\n]{0,8}(?:的)?\s*([0-9]+(?:\.[0-9]+)?)\s*倍|(?:对方|敌方|目标)[^。；，\n]{0,8}等级[^。；，\n]{0,8}(?:的)?\s*([0-9]+(?:\.[0-9]+)?)\s*倍[^。；，\n]{0,12}(?:伤害|伤害值)/);
  if (targetLevelDamage) {
    addEffectOnce({ kind: "fixedDamageByTargetLevel", target: "opponent", factor: Number(targetLevelDamage[1] || targetLevelDamage[2]) || 1 });
  }
  const selfLevelDamage = desc.match(/(?:伤害|伤害值)[^。；，\n]{0,12}(?:为|是|等于|=)?[^。；，\n]{0,8}(?:自身|自己|我方)?[^。；，\n]{0,8}等级[^。；，\n]{0,8}[×xX*]\s*([0-9]+(?:\.[0-9]+)?)|(?:自身|自己|我方)?[^。；，\n]{0,8}等级[^。；，\n]{0,8}[×xX*]\s*([0-9]+(?:\.[0-9]+)?)[^。；，\n]{0,12}(?:伤害|伤害值)/);
  if (selfLevelDamage && !/(?:对方|敌方|目标)[^。；，\n]{0,8}等级/.test(selfLevelDamage[0])) {
    addEffectOnce({ kind: "fixedDamageBySelfLevel", target: "opponent", factor: Number(selfLevelDamage[1] || selfLevelDamage[2]) || 1 });
  }
  const statRatioDamageRules = [
    { statKey: "atk", re: /(?:自身|自己|我方)[^。；，\n]{0,12}?(?:攻击|普攻|普通攻击)[^。；，\n]{0,12}?(?:与|和|\/)[^。；，\n]{0,12}?(?:对方|敌方|目标|对手)[^。；，\n]{0,12}?(?:攻击|普攻|普通攻击)[^。；，\n]{0,20}?比值越大[\s\S]{0,16}?(?:威力|伤害)[\s\S]{0,4}?(?:越大|越高)/ },
    { statKey: "spAtk", re: /(?:自身|自己|我方)[^。；，\n]{0,12}?(?:特攻|特功|特殊攻击)[^。；，\n]{0,12}?(?:与|和|\/)[^。；，\n]{0,12}?(?:对方|敌方|目标|对手)[^。；，\n]{0,12}?(?:特攻|特功|特殊攻击)[^。；，\n]{0,20}?比值越大[\s\S]{0,16}?(?:威力|伤害)[\s\S]{0,4}?(?:越大|越高)/ },
    { statKey: "speed", re: /(?:自身|自己|我方)[^。；，\n]{0,12}?(?:速度)[^。；，\n]{0,12}?(?:与|和|\/)[^。；，\n]{0,12}?(?:对方|敌方|目标|对手)[^。；，\n]{0,12}?(?:速度)[^。；，\n]{0,20}?比值越大[\s\S]{0,16}?(?:威力|伤害)[\s\S]{0,4}?(?:越大|越高)/ },
    { statKey: "def", re: /(?:自身|自己|我方)[^。；，\n]{0,12}?(?:防御|普防|普通防御)[^。；，\n]{0,12}?(?:与|和|\/)[^。；，\n]{0,12}?(?:对方|敌方|目标|对手)[^。；，\n]{0,12}?(?:防御|普防|普通防御)[^。；，\n]{0,20}?比值越大[\s\S]{0,16}?(?:威力|伤害)[\s\S]{0,4}?(?:越大|越高)/ },
    { statKey: "spDef", re: /(?:自身|自己|我方)[^。；，\n]{0,12}?(?:特防|特殊防御)[^。；，\n]{0,12}?(?:与|和|\/)[^。；，\n]{0,12}?(?:对方|敌方|目标|对手)[^。；，\n]{0,12}?(?:特防|特殊防御)[^。；，\n]{0,20}?比值越大[\s\S]{0,16}?(?:威力|伤害)[\s\S]{0,4}?(?:越大|越高)/ }
  ];
  const statRatioDamageRule = statRatioDamageRules.find((rule) => rule.re.test(desc));
  if (statRatioDamageRule) {
    addEffectOnce({ kind: "fixedDamageByStatRatio", target: "opponent", statKey: statRatioDamageRule.statKey, factor: 500 });
  }
  const bonusDamageRule = /(?:额外|附加|追加|另加|并附带)[^。；，\n]{0,10}([0-9]+)\s*点(?:固定)?(?:伤害值?|伤害)/g;
  let bonusDamageMatch = null;
  while ((bonusDamageMatch = bonusDamageRule.exec(desc))) {
    addEffectOnce({ kind: "bonusFixedDamage", target: "opponent", amount: Math.max(1, Math.floor(Number(bonusDamageMatch[1]) || 0)), chance: parseChanceNear(desc, bonusDamageMatch.index || 0), requireHit: hasHitGateNear(desc, bonusDamageMatch.index || 0) });
  }
  const directFlatDamageRule = /(?:造成|扣除|减少|损失|给予|给)[^。；，\n]{0,14}(?:对方|敌方|目标|对手|对方全体|敌方全体)?[^。；，\n]{0,10}([0-9]+)\s*点(?:固定)?(?:伤害值?|伤害|体力值?|生命值?|HP|hp)|(?:对方|敌方|目标|对手)[^。；，\n]{0,10}(?:受到|承受)[^。；，\n]{0,10}([0-9]+)\s*点(?:固定)?(?:伤害值?|伤害)/g;
  let directFlatDamageMatch = null;
  while ((directFlatDamageMatch = directFlatDamageRule.exec(desc))) {
    const seg = directFlatDamageMatch[0];
    if (/(每回合|持续|回复|恢复|护盾|PP|pp|反弹|返还|返击|反击|额外|附加|追加|另加|并附带)/.test(seg)) continue;
    addEffectOnce({ kind: "bonusFixedDamage", target: "opponent", amount: Math.max(1, Math.floor(Number(directFlatDamageMatch[1] || directFlatDamageMatch[2]) || 0)), chance: parseChanceNear(desc, directFlatDamageMatch.index || 0), requireHit: hasHitGateNear(desc, directFlatDamageMatch.index || 0) });
  }
  const reflectMatch = desc.match(/(?:反弹|返还|返击|反击)[^。；，\n]{0,24}(?:受到|承受|所受)?[^。；，\n]{0,16}(?:普通攻击|普攻|物理攻击|特殊攻击|特攻|魔攻|攻击)?[^。；，\n]{0,16}(?:伤害|伤害值)[^。；，\n]{0,8}(?:的)?\s*([0-9]+(?:\.[0-9]+)?)\s*倍|(?:受到|承受|所受|本回合受到|本回合承受)[^。；，\n]{0,24}(?:伤害|伤害值)?[^。；，\n]{0,8}(?:的)?\s*([0-9]+(?:\.[0-9]+)?)\s*倍[^。；，\n]{0,16}(?:反弹|返还|返击|反击)|(?:将|把)[^。；，\n]{0,16}(?:受到|承受|所受)[^。；，\n]{0,12}(?:伤害|伤害值)?[^。；，\n]{0,8}([0-9]+(?:\.[0-9]+)?)\s*倍[^。；，\n]{0,16}(?:反弹|返还|返击|反击)|(?:反弹|返还|返击|反击)?[^。；，\n]{0,12}(?:受到|承受|所受)[^。；，\n]{0,14}(?:普通攻击|普攻|物理攻击|特殊攻击|特攻|魔攻|攻击)?[^。；，\n]{0,12}(?:的)?\s*([0-9]+(?:\.[0-9]+)?)\s*倍[^。；，\n]{0,8}(?:伤害|伤害值)[^。；，\n]{0,12}(?:给对方|给对手|反弹|返还|返击|反击)/);
  if (reflectMatch) {
    let attackKind = "all";
    if (/(普通攻击|普攻|物理攻击)/.test(desc) && !/(特殊攻击|特攻|魔攻)/.test(desc)) attackKind = "physical";
    else if (/(特殊攻击|特攻|魔攻)/.test(desc) && !/(普通攻击|普攻|物理攻击)/.test(desc)) attackKind = "special";
    addEffectOnce({ kind: "damageReflect", target: "self", attackKind, ratio: Math.max(0.01, Number(reflectMatch[1] || reflectMatch[2] || reflectMatch[3] || reflectMatch[4]) || 1), turns: parseGeneralTurns(desc, /(本回合|当回合)/.test(desc) ? 1 : 3) });
  }
  const flatReflectMatch = desc.match(/(?:受到|承受|所受)[^。；，\n]{0,16}(?:攻击|伤害)[^。；，\n]{0,12}(?:则|后|时)?[^。；，\n]{0,12}(?:反弹|返还|返击|反击)[^0-9。；，\n]{0,8}([0-9]+)\s*点(?:伤害|伤害值)?|(?:反弹|返还|返击|反击)[^0-9。；，\n]{0,8}([0-9]+)\s*点(?:伤害|伤害值)?[^。；，\n]{0,12}(?:给对方|给对手|给敌方|伤害给对方|伤害给对手)/);
  if (flatReflectMatch) {
    addEffectOnce({ kind: "damageReflectFlat", target: "self", attackKind: "all", amount: Math.max(1, Math.floor(Number(flatReflectMatch[1] || flatReflectMatch[2]) || 1)), turns: parseGeneralTurns(desc, /(本回合|当回合)/.test(desc) ? 1 : 3) });
  }
  const flatDrainMatch = desc.match(/每回合[^。；，\n]{0,20}(?:扣除|减少|损失|造成)[^。；，\n]{0,12}(?:对方|敌方|目标|对手)?[^。；，\n]{0,8}([0-9]+)\s*点(?:体力值?|生命值?|HP|hp|伤害值?|伤害)/);
  if (flatDrainMatch && !/(双方|全场)/.test(flatDrainMatch[0])) {
    const amount = Math.max(1, Math.floor(Number(flatDrainMatch[1]) || 1));
    if (/(回复|恢复|吸取)/.test(desc.slice(flatDrainMatch.index || 0, (flatDrainMatch.index || 0) + 50))) {
      addEffectOnce({ kind: "flatDrain", target: "opponent", amount, turns: parseGeneralTurns(desc, 3), label: name });
    } else {
      addEffectOnce({ kind: "lockGodDrain", target: "opponent", flat: amount, turns: parseGeneralTurns(desc, 3), label: name });
    }
  }
  const mutualFlatDrainMatch = desc.match(/(?:双方|全场)[^。；，\n]{0,16}每回合[^。；，\n]{0,16}(?:扣除|减少|损失)[^。；，\n]{0,8}([0-9]+)\s*点(?:体力值?|生命值?|HP|hp|伤害值?|伤害)|每回合[^。；，\n]{0,16}(?:扣除|减少|损失)[^。；，\n]{0,8}(?:双方|全场)[^。；，\n]{0,8}(?:体力值?|生命值?|HP|hp)?\s*([0-9]+)\s*点/);
  if (mutualFlatDrainMatch) {
    addEffectOnce({ kind: "mutualEndTurnDamageFlat", target: "both", amount: Math.max(1, Math.floor(Number(mutualFlatDrainMatch[1] || mutualFlatDrainMatch[2]) || 1)), turns: parseGeneralTurns(desc, 3) });
  }
  if (name === "欢乐之铃") add({ kind: "endTurnHealFlat", target: "self", turns: 5, amount: 80, teamWide: true });
  if (/(免疫|免受|抵抗)[^。；，\n]{0,24}(攻击|伤害)|(?:普通攻击|特殊攻击)[^。；，\n]{0,16}(?:免疫|免受|抵抗)/.test(desc)) {
    const turns = parseGeneralTurns(desc, 3);
    const chance = statusChanceFromDesc(desc, "", 1);
    let attackKind = "all";
    if (/(普通攻击|普攻|物理攻击)/.test(desc) && !/(特殊攻击|特攻|魔攻)/.test(desc)) attackKind = "physical";
    else if (/(特殊攻击|特攻|魔攻)/.test(desc) && !/(普通攻击|普攻|物理攻击)/.test(desc)) attackKind = "special";
    else if (/(普通攻击|普攻|物理攻击).*(特殊攻击|特攻|魔攻)|(特殊攻击|特攻|魔攻).*(普通攻击|普攻|物理攻击)/.test(desc)) attackKind = "all";
    add({ kind: "attackImmunity", target: "self", turns, chance, attackKind });
  }
  if (/(属性能力等级|能力等级|属性等级)[^。；，\n]{0,12}(不会|不能|无法|不可)[^。；，\n]{0,8}(被)?(削弱|降低|下降|提升|提高|上升|变化)|(不会|不能|无法|不可)[^。；，\n]{0,8}(被)?(削弱|降低|下降|提升|提高|上升)[^。；，\n]{0,12}(属性能力等级|能力等级|属性等级)/.test(desc)) {
    const turns = parseGeneralTurns(desc, 3);
    let mode = "debuff";
    if (/(提升|提高|上升)/.test(desc) && !/(削弱|降低|下降)/.test(desc)) mode = "buff";
    else if (/(变化|提升|提高|上升).*(削弱|降低|下降)|(削弱|降低|下降).*(提升|提高|上升)/.test(desc)) mode = "all";
    add({ kind: "stageGuard", target: "self", turns, mode });
  }
  let hasExplicitSelfSkip = false;
  if (name.includes("寄生种子") || desc.includes("寄生")) {
    const mTurns = desc.match(/([0-9一二三四五六])\s*回合/);
    const turns = mTurns ? cnNumToInt(mTurns[1], 5) : 5;
    add({ kind: "status", target: "opponent", status: "leech", turns, chance: 1 });
  }

  // 回血类技能文本解析：回复x点/一半/x%/最大生命值的x%
  const isPeriodicLeechText = /每回合[^。；，\n]{0,40}吸取/.test(desc)
    || /吸取[^。；，\n]{0,30}(?:回复|恢复)[^。；，\n]{0,12}(?:自己|自身|我方)/.test(desc);
  if (name !== "欢乐之铃" && !isPeriodicLeechText && /(回复|恢复)/.test(desc) && /(体力|生命|HP|hp)/.test(desc)) {
    const teamFlat = desc.match(/(?:回复|恢复)[^。；，\n]{0,20}(?:我方全体|我方全场|全体|全场)[^\d。；，\n]{0,12}(\d+)\s*点(?:体力值?|生命值?|HP|hp)?/)
      || desc.match(/(?:回复|恢复)[^。；，\n]{0,20}(?:我方全体|我方全场|全体|全场)[^\d。；，\n]{0,12}(?:体力值?|生命值?|HP|hp)\s*(\d+)\s*点?/);
    if (teamFlat) {
      const amount = Math.max(1, Number(teamFlat[1]) || 0);
      add({ kind: "healFlatTeam", target: "self", amount });
    }
    const hasSelfIntent = /(自身|自己|我方)/.test(desc) || !/(对方|敌方)/.test(desc);
    if (hasSelfIntent && !teamFlat) {
      const fullHit = /(?:回复|恢复)[^。；，\n]{0,18}(?:全部|所有|全额|满)[^。；，\n]{0,6}(?:体力|生命|HP|hp)/.test(desc)
        || /(?:完全|全部|所有|满状态)[^。；，\n]{0,8}(?:回复|恢复)[^。；，\n]{0,8}(?:体力|生命|HP|hp)/.test(desc);
      if (fullHit) {
        add({ kind: "heal", target: "self", ratio: 1 });
      } else {
        const endTurnFlat = desc.match(/每回合[^。；，\n]{0,16}(?:回复|恢复)[^。；，\n]{0,12}(?:自身|自己|我方)?[^。；，\n]{0,8}(\d+)\s*点?(?:体力值?|生命值?|HP|hp)/);
        if (endTurnFlat) {
          const amount = Math.max(1, Number(endTurnFlat[1]) || 0);
          add({ kind: "endTurnHealFlat", target: "self", amount, turns: parseGeneralTurns(desc, 3), teamWide: /替换亚比有效|换宠.*有效|替换.*有效/.test(desc) });
        }
        const ratioText =
          desc.match(/(?:回复|恢复)[^。；，\n]{0,18}(?:自身|自己|我方)?[^。；，\n]{0,8}((?:\d+\s*\/\s*\d+)|(?:\d+(?:\.\d+)?\s*%)|一半|三分之一|四分之一|五分之一|六分之一|八分之一|十六分之一)(?:的)?\s*(?:最大)?(?:体力值?|生命值?|HP|hp)/) ||
          desc.match(/(?:回复|恢复)[^。；，\n]{0,18}(?:自身|自己|我方)?[^。；，\n]{0,8}(?:最大)?(?:体力值?|生命值?|HP|hp)(?:的)?\s*((?:\d+\s*\/\s*\d+)|(?:\d+(?:\.\d+)?\s*%)|一半|三分之一|四分之一|五分之一|六分之一|八分之一|十六分之一)/) ||
          desc.match(/(?:回复|恢复)[^。；，\n]{0,18}(?:自身|自己|我方)?[^。；，\n]{0,8}(?:体力|生命|HP|hp)最大值(?:的)?\s*((?:\d+\s*\/\s*\d+)|(?:\d+(?:\.\d+)?\s*%)|一半|三分之一|四分之一|五分之一|六分之一|八分之一|十六分之一)/) ||
          desc.match(/(?:体力|生命|HP|hp)最大值(?:的)?\s*((?:\d+\s*\/\s*\d+)|(?:\d+(?:\.\d+)?\s*%)|一半|三分之一|四分之一|五分之一|六分之一|八分之一|十六分之一)/) ||
          desc.match(/(?:最大)?(?:体力值?|生命值?|HP|hp)(?:的)?\s*((?:\d+\s*\/\s*\d+)|(?:\d+(?:\.\d+)?\s*%)|一半|三分之一|四分之一|五分之一|六分之一|八分之一|十六分之一)/) ||
          desc.match(/((?:\d+\s*\/\s*\d+)|(?:\d+(?:\.\d+)?\s*%)|一半|三分之一|四分之一|五分之一|六分之一|八分之一|十六分之一)(?:的)?\s*(?:最大)?(?:体力值?|生命值?|HP|hp)/);
        if (ratioText) {
          const ratio = clamp(parseRatioFromText(ratioText[1], 0.5), 0.01, 1);
          add({ kind: "heal", target: "self", ratio });
        } else if (!endTurnFlat) {
          const flat = desc.match(/(?:回复|恢复)[^。；，\n]{0,16}(\d+)\s*点?(?:体力值?|生命值?|HP|hp)?/)
            || desc.match(/(?:回复|恢复)[^。；，\n]{0,16}(?:体力值?|生命值?|HP|hp)\s*(\d+)\s*点?/);
          if (flat) {
            const amount = Math.max(1, Number(flat[1]) || 0);
            add({ kind: "healFlat", target: "self", amount });
          } else {
            // 无明确数值的“回复体力”无法严格换算，保守不自动套用比例。
          }
        }
      }
    }
  }
  // 嗜血类：按“本次造成伤害”的一定比例回血
  const hasLifeStealText = /(?:吸取|回复|恢复|转化)[^。；，\n]{0,28}(?:伤害值|造成伤害)|(?:伤害值|造成伤害)[^。；，\n]{0,28}(?:吸取|回复|恢复|转化)/.test(desc);
  const hasLifeStealSelfTarget = /(自己|自身|我方)/.test(desc);
  if (hasLifeStealText && hasLifeStealSelfTarget) {
    let ratio = null;
    const ratioText =
      desc.match(/(?:伤害值|造成伤害)(?:的)?\s*((?:\d+\s*\/\s*\d+)|(?:\d+(?:\.\d+)?\s*%)|一半|三分之一|四分之一|五分之一|六分之一|八分之一|十六分之一)/) ||
      desc.match(/((?:\d+\s*\/\s*\d+)|(?:\d+(?:\.\d+)?\s*%)|一半|三分之一|四分之一|五分之一|六分之一|八分之一|十六分之一)(?:的)?(?:伤害值|造成伤害)/);
    if (ratioText) ratio = parseRatioFromText(ratioText[1], null);
    if (!Number.isFinite(ratio)) {
      const mMul = desc.match(/(?:伤害值|造成伤害)(?:的)?\s*([0-9]+(?:\.[0-9]+)?)\s*倍/);
      if (mMul) ratio = Number(mMul[1]) || 0;
    }
    if (!Number.isFinite(ratio) && /(全部|所有|完全)?(?:伤害值|造成伤害)[^。；，\n]{0,16}(?:转化|回复|恢复|吸取)/.test(desc)) {
      ratio = 1;
    }
    if (Number.isFinite(ratio) && ratio > 0) {
      add({ kind: "lifesteal", target: "self", ratio: clamp(ratio, 0.01, 3) });
    }
  }

  // 舍命类：按本次造成伤害的一定比例反扣自身体力。
  const maxHpCost = desc.match(/(?:消耗|扣除|损失|失去)[^。；，\n]{0,12}(?:自身|自己|我方)?[^。；，\n]{0,8}(?:最大)?(?:体力值?|生命值?|HP|hp)(?:的)?\s*((?:\d+\s*\/\s*\d+)|(?:\d+(?:\.\d+)?\s*%)|一半|三分之一|四分之一|五分之一|六分之一|八分之一|十六分之一)/)
    || desc.match(/(?:消耗|扣除|损失|失去)[^。；，\n]{0,12}(?:自身|自己|我方)?[^。；，\n]{0,8}((?:\d+\s*\/\s*\d+)|(?:\d+(?:\.\d+)?\s*%)|一半|三分之一|四分之一|五分之一|六分之一|八分之一|十六分之一)(?:的)?(?:最大)?(?:体力值?|生命值?|HP|hp)/);
  if (maxHpCost) {
    const ratio = parseRatioFromText(maxHpCost[1], null);
    if (Number.isFinite(ratio) && ratio > 0) add({ kind: "recoilByMaxHp", target: "self", ratio: clamp(ratio, 0.01, 1) });
  }

  if (/(自己|自身|我方)[^。；，\n]{0,16}(?:承受|受到)[^。；，\n]{0,16}(?:伤害值|造成伤害)|(?:承受|受到)[^。；，\n]{0,16}(?:伤害值|造成伤害)/.test(desc)) {
    const ratioText =
      desc.match(/(?:承受|受到)[^。；，\n]{0,10}(?:伤害值|造成伤害)(?:的)?\s*((?:\d+\s*\/\s*\d+)|(?:\d+(?:\.\d+)?\s*%)|一半|三分之一|四分之一|五分之一|六分之一|八分之一|十六分之一)/) ||
      desc.match(/(?:承受|受到)[^。；，\n]{0,10}((?:\d+\s*\/\s*\d+)|(?:\d+(?:\.\d+)?\s*%)|一半|三分之一|四分之一|五分之一|六分之一|八分之一|十六分之一)(?:的)?(?:伤害值|造成伤害)/);
    const ratio = ratioText ? parseRatioFromText(ratioText[1], null) : null;
    if (Number.isFinite(ratio) && ratio > 0) {
      add({ kind: "recoilByDamage", target: "self", ratio: clamp(ratio, 0.01, 1) });
    }
  }

  // 停行动副作用/控制
  // 这里必须精准识别“谁停止行动”，避免把“对方无法替换”误判成“对方无法行动”。
  const stopHandledByInstantKo = /(秒杀|一击必杀|直接击败|直接死亡|失去战斗能力)[^。；，\n]{0,12}(?:后|成功后|且)?[^。；，\n]{0,12}(?:停止行动|无法行动)|(?:停止行动|无法行动)[^。；，\n]{0,12}(?:秒杀|一击必杀|直接击败|直接死亡|失去战斗能力)/.test(desc);
  if ((desc.includes("停止行动") || desc.includes("无法行动")) && !hasExplicitSelfSkip && !stopHandledByInstantKo) {
    const stopIdx = desc.search(/停止行动|无法行动/);
    const leftStop = stopIdx >= 0 ? Math.max(0, desc.lastIndexOf("，", stopIdx), desc.lastIndexOf("；", stopIdx), desc.lastIndexOf("。", stopIdx), desc.lastIndexOf("\n", stopIdx)) : 0;
    const rightCandidates = ["，", "；", "。", "\n"].map((mark) => desc.indexOf(mark, stopIdx >= 0 ? stopIdx : 0)).filter((idx) => idx >= 0);
    const rightStop = rightCandidates.length ? Math.min(...rightCandidates) : desc.length;
    const stopCtx = stopIdx >= 0 ? desc.slice(leftStop, Math.min(desc.length, rightStop + 1)) : desc;
    const turnsM = stopCtx.match(/([0-9一二三四五六])\s*(?:~|-|～)\s*([0-9一二三四五六])\s*回合/) || stopCtx.match(/([0-9一二三四五六])\s*回合/);
    const turns = turnsM ? cnNumToInt(turnsM[2] || turnsM[1], 1) : 1;
    const selfStop = /(?:自身|自己|自身体?|本回合)[^。；，\n]{0,12}(?:停止行动|无法行动)/.test(desc);
    const oppStop = /(?:对方|敌方)[^。；，\n]{0,12}(?:停止行动|无法行动)/.test(desc);
    let target = "self";
    if (selfStop && !oppStop) target = "self";
    else if (!selfStop && oppStop) target = "opponent";
    else if (selfStop && oppStop) {
      // 同时出现时优先使用“更近的动作短语”
      const selfIdx = desc.search(/(?:自身|自己|自身体?|本回合)[^。；，\n]{0,12}(?:停止行动|无法行动)/);
      const oppIdx = desc.search(/(?:对方|敌方)[^。；，\n]{0,12}(?:停止行动|无法行动)/);
      target = (selfIdx >= 0 && (oppIdx < 0 || selfIdx <= oppIdx)) ? "self" : "opponent";
    }
    add({ kind: "skip", target, turns: Math.max(1, turns), chance: parseChanceInText(stopCtx, 1), requireHit: hasHitGateNear(desc, stopIdx >= 0 ? stopIdx : 0) });
  }
  const ppChangeRules = [
    { re: /(?:回复|恢复|增加)[^。；，\n]{0,20}(?:自身|自己|我方|我方全体|全体)?[^。；，\n]{0,12}(?:所有技能|全部技能|技能)?\s*PP(?:值)?\s*([0-9]+)\s*点?|(?:回复|恢复|增加)[^。；，\n]{0,20}(?:自身|自己|我方|我方全体|全体)?[^。；，\n]{0,12}([0-9]+)\s*点?\s*PP/gi, target: "self", sign: 1 },
    { re: /(?:扣除|减少|降低|消耗)[^。；，\n]{0,20}(?:对方|敌方|目标|对手)?[^。；，\n]{0,12}(?:所有技能|全部技能|技能)?\s*PP(?:值)?\s*([0-9]+)\s*点?|(?:扣除|减少|降低|消耗)[^。；，\n]{0,20}(?:对方|敌方|目标|对手)?[^。；，\n]{0,12}([0-9]+)\s*点?\s*PP/gi, target: "opponent", sign: -1 },
    { re: /(?:扣除|减少|降低|消耗)[^。；，\n]{0,20}(?:自身|自己|我方)?[^。；，\n]{0,12}(?:所有技能|全部技能|技能)?\s*PP(?:值)?\s*([0-9]+)\s*点?|(?:扣除|减少|降低|消耗)[^。；，\n]{0,20}(?:自身|自己|我方)?[^。；，\n]{0,12}([0-9]+)\s*点?\s*PP/gi, target: "self", sign: -1 }
  ];
  ppChangeRules.forEach(({ re, target, sign }) => {
    let pm = null;
    while ((pm = re.exec(desc))) {
      const amount = Math.max(1, Math.floor(Number(pm[1] || pm[2]) || 0)) * sign;
      addEffectOnce({ kind: "ppChange", target, amount, chance: parseChanceNear(desc, pm.index || 0), requireHit: hasHitGateNear(desc, pm.index || 0) });
    }
  });

  // 自灭类副作用
  if (desc.includes("自身死亡") || desc.includes("自己死亡") || desc.includes("自爆") || desc.includes("濒死") || /牺牲自身|牺牲自己|献祭自己|自我牺牲/.test(desc)) {
    add({ kind: "selfKo", target: "self" });
  }
  if (
    /(物防减半|物防降低一半|防御值?减半|防御减半|防御值降低一半|防御降低一半)/.test(desc) &&
    /(自己以外|对方|敌方|敌人|目标|单体)/.test(desc)
  ) {
    add({ kind: "defenseHalve", target: "opponent", turns: 10 });
  }
  if (name === "骰子炸弹" || name === "超级骰子炸弹") {
    add({ kind: "diceDrain", target: "opponent", turns: 5, amountPerPip: name === "超级骰子炸弹" ? 100 : 30, label: name });
  }
  if (name === "圣灵") {
    add({ kind: "healByStatRatio", target: "self", statKey: "speed", ratio: 1 / 6 });
  }
  // 暴击等级（会心一击率/暴击率）
  let explicitCritParsed = false;
  const hasListedStageSyntax = new RegExp(`(提升|提高|上升|增加|增强|降低|下降|削弱|减少)(自身|自己|我方|敌方|对方)?(?:的)?(?:单体|1体|一体|全体|1只|一只)?((?:${stageKeywordsPattern})(?:[、,，和与]\\s*(?:${stageKeywordsPattern})){1,8})[^。；，\\n]{0,12}?(?:等级)?(?:各|均|都)\\s*(\\d+|一|二|两|三|四|五|六)\\s*级`).test(desc);
  if (!hasListedStageSyntax && (desc.includes("会心一击率") || desc.includes("暴击率") || desc.includes("暴击等级") || desc.includes("较高暴击") || desc.includes("会心"))) {
    const levelM =
      desc.match(/(?:会心一击率|暴击率|暴击等级|会心)[^。；，\n]{0,12}?(提升|提高|上升|降低|下降|增加|减少)[^。；，\n]{0,6}?(\d+|一|二|两|三|四|五|六)\s*级/) ||
      desc.match(/(提升|提高|上升|降低|下降|增加|减少)[^。；，\n]{0,12}?(?:会心一击率|暴击率|暴击等级|会心)[^。；，\n]{0,6}?(\d+|一|二|两|三|四|五|六)\s*级/) ||
      desc.match(/(?:会心一击率|暴击率|暴击等级|会心)[^。；，\n]{0,12}(提升|提高|上升|降低|下降|增加|减少)/) ||
      desc.match(/(提升|提高|上升|降低|下降|增加|减少)[^。；，\n]{0,12}(?:会心一击率|暴击率|暴击等级|会心)/);
    let delta = 1;
    if (levelM) {
      const op = levelM[1] || "提升";
      const lv = levelM[2] ? cnNumToInt(levelM[2], 1) : 1;
      delta = (op === "降低" || op === "下降" || op === "减少") ? -lv : lv;
    }
    if (!levelM && (desc.includes("较高暴击") || /会心[^。；，\n]{0,8}(?:提高|提升|上升|增强)/.test(desc))) delta = 2;
    add({ kind: "critStage", target: "self", delta });
    explicitCritParsed = true;
  }

  const stageTextToKeys = (text) => {
    const t = normalize(text);
    if (!t) return [];
    const hasAnySpecificStageKeyword = /(双攻|双防|攻防|攻速|攻击|普攻|物攻|魔攻|特攻|防御|特防|速度|命中|闪避|回避|暴击|会心)/.test(t);
    if ((t.includes("全属性") || t.includes("全能力")) && !hasAnySpecificStageKeyword) return ALL_ABILITY_STAGE_KEYS.slice();
    if (t.includes("双攻") || ((t.includes("攻击") || t.includes("普攻") || t.includes("物攻")) && (t.includes("特攻") || t.includes("魔攻")))) return ["atk", "spAtk"];
    if (t.includes("双防") || (t.includes("防御") && t.includes("特防"))) return ["def", "spDef"];
    if (t.includes("攻击和速度") || t.includes("攻速") || t.includes("普攻和速度") || t.includes("物攻和速度")) return ["atk", "speed"];
    if (t.includes("攻防")) return ["atk", "def"];
    if ((t.includes("命中") || t.includes("命中率")) && (t.includes("暴击") || t.includes("会心"))) return ["accuracy", "critStage"];
    if ((t.includes("暴击") || t.includes("会心")) && (t.includes("命中") || t.includes("命中率"))) return ["accuracy", "critStage"];
    if ((t.includes("命中") || t.includes("命中率")) && (t.includes("闪避") || t.includes("闪避率") || t.includes("回避") || t.includes("回避率"))) return ["accuracy", "evasion"];
    const keys = [];
    if (t.includes("普攻") || t.includes("物攻") || t.includes("攻击")) keys.push("atk");
    if (t.includes("防御")) keys.push("def");
    if (t.includes("魔攻") || t.includes("特攻")) keys.push("spAtk");
    if (t.includes("特防")) keys.push("spDef");
    if (t.includes("速度")) keys.push("speed");
    if (t.includes("命中") || t.includes("命中率")) keys.push("accuracy");
    if (t.includes("闪避") || t.includes("闪避率") || t.includes("回避") || t.includes("回避率")) keys.push("evasion");
    if (t.includes("暴击") || t.includes("会心")) keys.push("critStage");
    return Array.from(new Set(keys));
  };
  const addListedStageEffects = (sourceText) => {
    let added = 0;
    const listStageRule = new RegExp(`(提升|提高|上升|增加|增强|降低|下降|削弱|减少)(自身|自己|我方|敌方|对方)?(?:的)?(?:单体|1体|一体|全体|1只|一只)?((?:${stageKeywordsPattern})(?:[、,，和与]\\s*(?:${stageKeywordsPattern})){1,8})[^。；，\\n]{0,12}?(?:等级)?(?:各|均|都)\\s*(\\d+|一|二|两|三|四|五|六)\\s*级`, "g");
    let lm = null;
    while ((lm = listStageRule.exec(sourceText))) {
      if (MANUAL_STAGE_SKILL_NAMES.has(name)) continue;
      const op = lm[1];
      const sideHint = lm[2];
      const stat = lm[3];
      const lv = cnNumToInt(lm[4], 1);
      const delta = /提升|提高|上升|增加|增强/.test(op) ? lv : -lv;
      const target = (!sideHint || sideHint.includes("自身") || sideHint.includes("自己") || sideHint.includes("我方")) ? "self" : "opponent";
      if (shouldSkipImmediateStage(sourceText, lm.index || 0)) continue;
      const keys = stat.split(/[、,，和与]/g).map((x) => stageTextToKeys(x)).flat();
      const uniqKeys = Array.from(new Set(keys)).filter((k) => !(explicitCritParsed && k === "critStage"));
      if (uniqKeys.length > 0) {
        add({ kind: "stage", target, keys: uniqKeys, delta, chance: parseChanceNear(sourceText, lm.index || 0), requireHit: hasHitGateNear(sourceText, lm.index || 0) });
        added += 1;
      }
    }
    return added;
  };
  parseStatusCureEffects(desc);
  // 句式1：提升/降低/下降 + (自身/对方) + 属性 + X级
  const shouldSkipImmediateStage = (sourceText, idx) => {
    const start = Math.max(0, idx - 18);
    const ctx = sourceText.slice(start, idx + 4);
    return /(受到伤害|受击|每回合|回合后)/.test(ctx);
  };
  const listedStageEffectCount = addListedStageEffects(desc);
  if (/(?:清除|解除|消除|重置|恢复)[^。；，\n]{0,24}(?:双方|全场)[^。；，\n]{0,18}(?:属性能力等级|属性等级|能力等级)|(?:双方|全场)[^。；，\n]{0,18}(?:属性能力等级|属性等级|能力等级)[^。；，\n]{0,24}(?:清除|解除|消除|重置|恢复)/.test(desc)) {
    addEffectOnce({ kind: "clearStage", target: "self", mode: "all", keys: ALL_ABILITY_STAGE_KEYS.slice(), chance: 1 });
    addEffectOnce({ kind: "clearStage", target: "opponent", mode: "all", keys: ALL_ABILITY_STAGE_KEYS.slice(), chance: 1 });
  } else {
    if (/(?:清除|解除|消除|重置|恢复)[^。；，\n]{0,24}(?:对方|敌方|目标)[^。；，\n]{0,18}(?:属性能力等级|属性等级|能力等级)|(?:对方|敌方|目标)[^。；，\n]{0,18}(?:属性能力等级|属性等级|能力等级)[^。；，\n]{0,24}(?:清除|解除|消除|重置|恢复)/.test(desc)) {
      const clearIdx = desc.search(/清除|解除|消除|重置|恢复/);
      const clearText = desc.slice(Math.max(0, clearIdx), Math.min(desc.length, (clearIdx >= 0 ? clearIdx : 0) + 56));
      addEffectOnce({ kind: "clearStage", target: "opponent", mode: /提升|增益|强化/.test(clearText) ? "positive" : "all", keys: stageTextToKeys(clearText).length > 0 ? stageTextToKeys(clearText) : ALL_ABILITY_STAGE_KEYS.slice(), chance: parseChanceNear(desc, clearIdx >= 0 ? clearIdx : 0), requireHit: /命中/.test(clearText) });
    }
    if (/(?:清除|解除|消除|重置|恢复)[^。；，\n]{0,24}(?:自身|自己|我方)[^。；，\n]{0,18}(?:属性能力等级|属性等级|能力等级)|(?:自身|自己|我方)[^。；，\n]{0,18}(?:属性能力等级|属性等级|能力等级)[^。；，\n]{0,24}(?:清除|解除|消除|重置|恢复)/.test(desc)) {
      const clearIdx = desc.search(/清除|解除|消除|重置|恢复/);
      const clearText = desc.slice(Math.max(0, clearIdx), Math.min(desc.length, (clearIdx >= 0 ? clearIdx : 0) + 56));
      addEffectOnce({ kind: "clearStage", target: "self", mode: /削弱|降低|下降|减益/.test(clearText) ? "negative" : "all", keys: stageTextToKeys(clearText).length > 0 ? stageTextToKeys(clearText) : ALL_ABILITY_STAGE_KEYS.slice(), chance: parseChanceNear(desc, clearIdx >= 0 ? clearIdx : 0), requireHit: /命中/.test(clearText) });
    }
  }
    const stageRule = new RegExp(`(提升|提高|上升|增加|增强|降低|下降|削弱|减少)(自身|自己|我方|敌方|对方)?(?:的)?(?:单体|1体|一体|全体|1只|一只)?(${stageKeywordsPattern}(?:[、,，和与]\\s*${stageKeywordsPattern})*)[^\\d一二三四五六两]*(\\d+|一|二|两|三|四|五|六)级`, "g");
  let sm = null;
  while ((sm = stageRule.exec(desc))) {
    if (MANUAL_STAGE_SKILL_NAMES.has(name)) continue;
    if (listedStageEffectCount > 0 && /(?:各|均|都)\s*(?:\d+|一|二|两|三|四|五|六)\s*级/.test(desc)) continue;
    const op = sm[1];
    const sideHint = sm[2];
    const stat = sm[3];
    const lv = cnNumToInt(sm[4], 1);
    const delta = /提升|提高|上升|增加|增强/.test(op) ? lv : -lv;
    const target = (!sideHint || sideHint.includes("自身") || sideHint.includes("自己") || sideHint.includes("我方")) ? "self" : "opponent";
    if (shouldSkipImmediateStage(desc, sm.index || 0)) continue;
      const keys = stat.split(/[、,，和与]/g).map((x) => stageTextToKeys(x)).flat()
        .concat(stageTextToKeys(sm[0]));
      const uniqKeys = Array.from(new Set(keys)).filter((k) => !(explicitCritParsed && k === "critStage"));
      if (uniqKeys.length > 0) add({ kind: "stage", target, keys: uniqKeys, delta, chance: parseChanceNear(desc, sm.index || 0), requireHit: hasHitGateNear(desc, sm.index || 0) });
    }
  // 句式2：令/使 + (对方/自身) + 属性 + 等级 + 提升/降低 + X级
  const stageRule2 = new RegExp(`(?:令|使)(对方|敌方|自身|自己|我方)?(?:的)?(?:单体|1体|一体|全体|1只|一只)?(${stageKeywordsPattern}(?:[、,，和与]\\s*${stageKeywordsPattern})*)[^。；，\\n]{0,10}等级[^。；，\\n]{0,6}(提升|提高|上升|增加|增强|降低|下降|削弱|减少)(\\d+|一|二|两|三|四|五|六)级`, "g");
  let sm2 = null;
  while ((sm2 = stageRule2.exec(desc))) {
    if (MANUAL_STAGE_SKILL_NAMES.has(name)) continue;
    const sideHint = sm2[1] || "";
    const stat = sm2[2];
    const op = sm2[3];
    const lv = cnNumToInt(sm2[4], 1);
    const delta = /提升|提高|上升|增加|增强/.test(op) ? lv : -lv;
    const target = (sideHint.includes("对方") || sideHint.includes("敌方")) ? "opponent" : "self";
    if (shouldSkipImmediateStage(desc, sm2.index || 0)) continue;
      const keys = stat.split(/[、,，和与]/g).map((x) => stageTextToKeys(x)).flat()
        .concat(stageTextToKeys(sm2[0]));
      const uniqKeys = Array.from(new Set(keys)).filter((k) => !(explicitCritParsed && k === "critStage"));
      if (uniqKeys.length > 0) add({ kind: "stage", target, keys: uniqKeys, delta, chance: parseChanceNear(desc, sm2.index || 0), requireHit: hasHitGateNear(desc, sm2.index || 0) });
    }
  // 句式3：削弱/降低 + 对方 + 属性 + 等级X级（如“削弱对方攻击等级1级”）
  const stageRule3 = new RegExp(`(削弱|降低|下降|减少)(对方|敌方|自身|自己|我方)?(?:的)?(?:单体|1体|一体|全体|1只|一只)?(${stageKeywordsPattern}(?:[、,，和与]\\s*${stageKeywordsPattern})*)等级[^。；，\\n]{0,6}(\\d+|一|二|两|三|四|五|六)级`, "g");
  let sm3 = null;
  while ((sm3 = stageRule3.exec(desc))) {
    if (MANUAL_STAGE_SKILL_NAMES.has(name)) continue;
    const sideHint = sm3[2] || "";
    const stat = sm3[3];
    const lv = cnNumToInt(sm3[4], 1);
    const delta = -lv;
    const target = (sideHint.includes("对方") || sideHint.includes("敌方")) ? "opponent" : "self";
    if (shouldSkipImmediateStage(desc, sm3.index || 0)) continue;
      const keys = stat.split(/[、,，和与]/g).map((x) => stageTextToKeys(x)).flat()
        .concat(stageTextToKeys(sm3[0]));
      const uniqKeys = Array.from(new Set(keys)).filter((k) => !(explicitCritParsed && k === "critStage"));
      if (uniqKeys.length > 0) add({ kind: "stage", target, keys: uniqKeys, delta, chance: parseChanceNear(desc, sm3.index || 0), requireHit: hasHitGateNear(desc, sm3.index || 0) });
    }
  // 句式4：令/使 + 目标 + 属性 + 下降/提升 + X级（无“等级”字样，如“令敌方1体特攻下降两级”）
  const stageRule4 = new RegExp(`(?:令|使)(对方|敌方|自身|自己|我方)?(?:的)?(?:单体|1体|一体|全体|1只|一只)?(${stageKeywordsPattern}(?:[、,，和与]\\s*${stageKeywordsPattern})*)[^。；，\\n]{0,8}(提升|提高|上升|增加|增强|降低|下降|削弱|减少)(\\d+|一|二|两|三|四|五|六)级`, "g");
  let sm4 = null;
  while ((sm4 = stageRule4.exec(desc))) {
    if (MANUAL_STAGE_SKILL_NAMES.has(name)) continue;
    const sideHint = sm4[1] || "";
    const stat = sm4[2];
    const op = sm4[3];
    const lv = cnNumToInt(sm4[4], 1);
    const delta = /提升|提高|上升|增加|增强/.test(op) ? lv : -lv;
    const target = (sideHint.includes("对方") || sideHint.includes("敌方")) ? "opponent" : "self";
    if (shouldSkipImmediateStage(desc, sm4.index || 0)) continue;
      const keys = stat.split(/[、,，和与]/g).map((x) => stageTextToKeys(x)).flat()
        .concat(stageTextToKeys(sm4[0]));
      const uniqKeys = Array.from(new Set(keys)).filter((k) => !(explicitCritParsed && k === "critStage"));
      if (uniqKeys.length > 0) add({ kind: "stage", target, keys: uniqKeys, delta, chance: parseChanceNear(desc, sm4.index || 0), requireHit: hasHitGateNear(desc, sm4.index || 0) });
    }
  const stageRule5 = new RegExp(`(?:但|并且|同时|且|，|,)?(自身|自己|我方|敌方|对方)?(?:的)?(?:单体|1体|一体|全体|1只|一只)?(${stageKeywordsPattern}(?:[、,，和与]\\s*${stageKeywordsPattern})*)[^。；，\\n]{0,4}(提升|提高|上升|增加|增强|降低|下降|削弱|减少)(\\d+|一|二|两|三|四|五|六)级`, "g");
  let sm5 = null;
  while ((sm5 = stageRule5.exec(desc))) {
    if (MANUAL_STAGE_SKILL_NAMES.has(name)) continue;
    const sideHint = sm5[1] || "";
    const stat = sm5[2];
    const op = sm5[3];
    const lv = cnNumToInt(sm5[4], 1);
    const delta = /提升|提高|上升|增加|增强/.test(op) ? lv : -lv;
    const target = (sideHint.includes("对方") || sideHint.includes("敌方")) ? "opponent" : "self";
    if (shouldSkipImmediateStage(desc, sm5.index || 0)) continue;
    const keys = stat.split(/[、,，和与]/g).map((x) => stageTextToKeys(x)).flat().concat(stageTextToKeys(sm5[0]));
    const uniqKeys = Array.from(new Set(keys)).filter((k) => !(explicitCritParsed && k === "critStage"));
    if (uniqKeys.length > 0) add({ kind: "stage", target, keys: uniqKeys, delta, chance: parseChanceNear(desc, sm5.index || 0), requireHit: hasHitGateNear(desc, sm5.index || 0) });
  }
  // 条件型能力等级变化：回合后触发（如“2回合后提升全属性3级”）
  const delayedStageRule = new RegExp(`([0-9一二三四五六两]+)\\s*回合后[^。；，\\n]{0,20}(提升|提高|上升|增加|增强|降低|下降|削弱|减少)(自身|自己|我方|敌方|对方)?(?:的)?(?:单体|1体|一体|全体|1只|一只)?(${stageKeywordsPattern}(?:[、,，和与]\\s*${stageKeywordsPattern})*)[^\\d一二三四五六两]*(\\d+|一|二|两|三|四|五|六)级`, "g");
  let dm = null;
  while ((dm = delayedStageRule.exec(desc))) {
    let turns = Math.max(1, cnNumToInt(dm[1], 1));
    if (name === "潜龙勿用") turns = 3;
    const op = dm[2];
    const sideHint = dm[3] || "";
    const stat = dm[4];
    const lv = cnNumToInt(dm[5], 1);
    const delta = /提升|提高|上升|增加|增强/.test(op) ? lv : -lv;
    const target = (!sideHint || sideHint.includes("自身") || sideHint.includes("自己") || sideHint.includes("我方")) ? "self" : "opponent";
    const keys = stat.split(/[、,，和与]/g).map((x) => stageTextToKeys(x)).flat().concat(stageTextToKeys(dm[0]));
    const uniqKeys = Array.from(new Set(keys));
    if (uniqKeys.length > 0) add({ kind: "delayedStage", target, keys: uniqKeys, delta, turns });
  }
  // 条件型能力等级变化：受击后触发（如“受到攻击后，令对方普攻和特攻下降3级”）
  const onDamagedTurns = (() => {
    const m = desc.match(/持续\s*([0-9一二三四五六])\s*回合/);
    if (m) return Math.max(1, cnNumToInt(m[1], 1));
    if (/(当回合|本回合)/.test(desc)) return 1;
    return 1;
  })();
  const onDamagedRuleA = new RegExp(`(?:每回合)?受到(?:攻击|伤害)[^。；\\n]{0,8}(?:后|时|则)?[，,、\\s]*[^。；\\n]{0,20}(提升|提高|上升|增加|增强|降低|下降|削弱|减少)(自身|自己|我方|敌方|对方)?(?:的)?(?:单体|1体|一体|全体|1只|一只)?(${stageKeywordsPattern}(?:[、,，和与]\\s*${stageKeywordsPattern})*)[^\\d一二三四五六两]*(\\d+|一|二|两|三|四|五|六)级`, "g");
  let omA = null;
  while ((omA = onDamagedRuleA.exec(desc))) {
    const op = omA[1];
    const sideHint = omA[2] || "self";
    const stat = omA[3];
    const lv = cnNumToInt(omA[4], 1);
    const delta = /提升|提高|上升|增加|增强/.test(op) ? lv : -lv;
    const applyTo = (sideHint.includes("对方") || sideHint.includes("敌方")) ? "attacker" : "self";
    const keys = stat.split(/[、,，和与]/g).map((x) => stageTextToKeys(x)).flat().concat(stageTextToKeys(omA[0]));
    const uniqKeys = Array.from(new Set(keys));
    const trigger = "damaged";
    if (uniqKeys.length > 0) add({ kind: "onDamagedStage", target: "self", applyTo, keys: uniqKeys, delta, turns: onDamagedTurns, chance: parseChanceNear(desc, omA.index || 0), trigger });
  }
  const onDamagedRuleB = new RegExp(`(?:每回合)?受到(?:攻击|伤害)[^。；\\n]{0,8}(?:后|时|则)?[，,、\\s]*[^。；\\n]{0,20}(?:令|使)(对方|敌方|自身|自己|我方)?(?:的)?(?:单体|1体|一体|全体|1只|一只)?(${stageKeywordsPattern}(?:[、,，和与]\\s*${stageKeywordsPattern})*)[^。；\\n]{0,8}(提升|提高|上升|增加|增强|降低|下降|削弱|减少)(\\d+|一|二|两|三|四|五|六)级`, "g");
  let omB = null;
  while ((omB = onDamagedRuleB.exec(desc))) {
    const sideHint = omB[1] || "attacker";
    const stat = omB[2];
    const op = omB[3];
    const lv = cnNumToInt(omB[4], 1);
    const delta = /提升|提高|上升|增加|增强/.test(op) ? lv : -lv;
    const applyTo = (sideHint.includes("自身") || sideHint.includes("自己") || sideHint.includes("我方")) ? "self" : "attacker";
    const keys = stat.split(/[、,，和与]/g).map((x) => stageTextToKeys(x)).flat().concat(stageTextToKeys(omB[0]));
    const uniqKeys = Array.from(new Set(keys));
    const trigger = "damaged";
    if (uniqKeys.length > 0) add({ kind: "onDamagedStage", target: "self", applyTo, keys: uniqKeys, delta, turns: onDamagedTurns, chance: parseChanceNear(desc, omB.index || 0), trigger });
  }
  // 兜底：处理“受到攻击后，令对方普攻和特攻下降3级”这类中间有逗号/停顿词的写法
  const onDamagedFallback = desc.match(/受到(?:攻击|伤害)[^。；\n]{0,16}(?:后|时|则)[，,、\s]*(?:令|使)(对方|敌方|自身|自己|我方)?[^。；\n]{0,10}(普攻和特攻|攻击和特攻|双攻)[^。；\n]{0,8}(提升|提高|上升|增加|增强|降低|下降|削弱|减少)(\d+|一|二|两|三|四|五|六)级/);
  if (onDamagedFallback) {
    const sideHint = onDamagedFallback[1] || "对方";
    const stat = onDamagedFallback[2] || "攻击和特攻";
    const op = onDamagedFallback[3];
    const lv = cnNumToInt(onDamagedFallback[4], 1);
    const delta = /提升|提高|上升|增加|增强/.test(op) ? lv : -lv;
    const applyTo = (sideHint.includes("自身") || sideHint.includes("自己") || sideHint.includes("我方")) ? "self" : "attacker";
    const keys = stageTextToKeys(stat);
    if (keys.length > 0) add({ kind: "onDamagedStage", target: "self", applyTo, keys, delta, turns: onDamagedTurns, chance: 1, trigger: "damaged" });
  }
  if (name === "迷光镜") {
    for (let i = effects.length - 1; i >= 0; i -= 1) {
      const fx = effects[i];
      if (
        normalize(fx && fx.kind) === "onDamagedStage" &&
        normalize(fx && fx.applyTo) === "attacker" &&
        Number(fx && fx.delta) === -3 &&
        Array.isArray(fx && fx.keys) &&
        fx.keys.includes("atk") &&
        fx.keys.includes("spAtk")
      ) {
        effects.splice(i, 1);
      }
    }
    add({
      kind: "onDamagedStage",
      target: "self",
      applyTo: "attacker",
      keys: ["atk", "spAtk"],
      delta: -3,
      turns: 1,
      chance: 1,
      trigger: "attacked",
      persistUntilTrigger: true,
      consumeOnTrigger: true,
      label: "迷光镜"
    });
  }
  if (name === "角斗") {
    add({ kind: "status", target: "opponent", status: "bind", turns: 5, chance: 1, requireHit: true });
  }
  const timedStageRule = new RegExp(`每回合(?:结束时|末)?[^。；，\\n]{0,18}(提升|提高|上升|增加|增强|降低|下降|削弱|减少)(自身|自己|我方|对方|敌方|目标)?(?:的)?(?:全场|全体|单体|1体|一体)?(${stageKeywordsPattern}(?:[、,，和与]\\s*${stageKeywordsPattern})*)[^\\d一二三四五六两]*(\\d+|一|二|两|三|四|五|六)级`, "g");
  let tsm = null;
  while ((tsm = timedStageRule.exec(desc))) {
    const op = tsm[1];
    const sideHint = tsm[2] || "self";
    const stat = tsm[3];
    const lv = cnNumToInt(tsm[4], 1);
    const delta = /提升|提高|上升|增加|增强/.test(op) ? lv : -lv;
    const target = (sideHint.includes("对方") || sideHint.includes("敌方") || sideHint.includes("目标")) ? "opponent" : "self";
    const keys = stat.split(/[、,，和与]/g).map((x) => stageTextToKeys(x)).flat().concat(stageTextToKeys(tsm[0]));
    const uniqKeys = Array.from(new Set(keys));
    if (uniqKeys.length > 0) addEffectOnce({ kind: "timedStage", target, keys: uniqKeys, delta, turns: parseGeneralTurns(desc, 3) });
  }
  const statusMap = [
    { key: "中毒", status: "poison", turns: 5 },
    { key: "烧伤", status: "burn", turns: 5 },
    { key: "睡眠", status: "sleep", turns: 2 },
    { key: "麻痹", status: "paralyze", turns: 3 },
    { key: "冰冻", status: "freeze", turns: 5 },
    { key: "寄生", status: "leech", turns: 5 },
    { key: "束缚", status: "bind", turns: 5 },
    { key: "衰弱", status: "weak", turns: 5 },
    { key: "混乱", status: "confuse", turns: 3 },
    { key: "害怕", status: "fear", turns: 3 }
  ];
  statusMap.forEach((x) => {
    if (!desc.includes(x.key)) return;
    if (!hasStatusApplyIntent(desc, x.key)) return;
    const m = desc.match(new RegExp(`${x.key}\\s*([0-9一二三四五六])\\s*回合`));
    let turns = m ? cnNumToInt(m[1], x.turns) : x.turns;
    const selfStatus = new RegExp(`(?:自身|自己|我方)[^。；，\\n]{0,10}${x.key}|${x.key}[^。；，\\n]{0,10}(?:自身|自己|我方)`).test(desc);
    const opponentStatus = new RegExp(`(?:对方|敌方|目标)[^。；，\\n]{0,14}${x.key}|${x.key}[^。；，\\n]{0,14}(?:对方|敌方|目标)`).test(desc);
    const recoverySleep = x.status === "sleep" && (name === "恢复性睡眠" || /睡眠[^。；，\n]{0,18}(?:回复|恢复)|(?:回复|恢复)[^。；，\n]{0,18}睡眠/.test(desc));
    const target = (recoverySleep || (selfStatus && !opponentStatus)) ? "self" : "opponent";
    const chance = statusChanceFromDesc(desc, x.key, 1);
    add({ kind: "status", target, status: x.status, turns, chance });
  });
  const hasHalfDamageReduction = /(受到|承受)[^。；，\n]{0,8}(?:攻击|伤害)?[^。；，\n]{0,8}(?:则|时|后)?[^。；，\n]{0,8}(?:伤害)?减半|(?:伤害抗性|伤害抵抗|抗性)[^。；，\n]{0,12}(?:提升|提高|增加)?[^。；，\n]{0,6}50\s*%/.test(desc);
  if (name === "玄灵甲" || name === "玄雷甲" || name === "玄王甲" || hasHalfDamageReduction) {
    const turns = parseTurns(3);
    add({ kind: "damageReduction", target: "self", ratio: 0.5, turns });
    // 兜底：仅当通用解析未识别“受击后全属性下降”时再补，避免双触发
    const hasFullOnDamagedDebuff = effects.some((e) =>
      normalize(e && e.kind) === "onDamagedStage" &&
      Array.isArray(e && e.keys) &&
      e.keys.length >= ALL_ABILITY_STAGE_KEYS.length &&
      ALL_ABILITY_STAGE_KEYS.every((k) => e.keys.includes(k))
    );
    if (!hasFullOnDamagedDebuff) {
      add({
        kind: "onDamagedStage",
        target: "self",
        applyTo: "attacker",
        keys: ALL_ABILITY_STAGE_KEYS.slice(),
        delta: -1,
        turns: parseTurns(3),
        chance: 1,
        trigger: "damaged"
      });
    }
  }
  // 玄灵甲的“受伤后降全属性”走通用文本解析分支，避免重复挂载反制效果。
  const dedup = [];
  const seen = new Set();
  effects.forEach((e) => {
    const key = [
      normalize(e.kind),
      normalize(e.target),
      Array.isArray(e.keys) ? e.keys.join(",") : "",
      Number(e.delta) || 0,
      normalize(e.status),
      Number(e.turns) || 0,
      Number(e.ratio) || 0,
      normalize(e.element),
      Number(e.factor) || 0
      ,
      Number(e.amount) || 0,
      Number(e.requireHit ? 1 : 0),
      Number(e.chance) || 0,
      normalize(e.applyTo),
      normalize(e.from),
      normalize(e.to),
      normalize(e.mode),
      normalize(e.attackKind),
      Number(e.count) || 0,
      Number(e.multiplier) || 0
    ].join("|");
    if (seen.has(key)) return;
    seen.add(key);
    dedup.push(e);
  });
  return dedup;
};
const dedupeSkillEffects = (effects) => {
  const out = [];
  const seen = new Set();
  (Array.isArray(effects) ? effects : []).forEach((e) => {
    const kind = normalize(e && e.kind);
    const keyParts = [
      kind,
      normalize(e && e.target),
      Array.isArray(e && e.keys) ? e.keys.map(normalize).sort().join(",") : "",
      Number(e && e.delta) || 0,
      normalize(e && e.status),
      Number(e && e.turns) || 0,
      Number(e && e.ratio) || 0,
      normalize(e && e.element),
      Number(e && e.factor) || 0,
      Number(e && e.amount) || 0,
      Number(e && e.chance) || 0,
      normalize(e && e.applyTo),
      normalize(e && e.from),
      normalize(e && e.to),
      normalize(e && e.mode),
      normalize(e && e.attackKind),
      Number(e && e.count) || 0,
      Number(e && e.power) || 0,
      Number(e && e.value) || 0,
      Number(e && e.multiplier) || 0
    ];
    if (kind !== "stage" && kind !== "critStage" && kind !== "clearStage") {
      keyParts.push(Number(e && e.requireHit ? 1 : 0));
    }
    const key = keyParts.join("|");
    if (seen.has(key)) return;
    seen.add(key);
    out.push(e);
  });
  const critStageEffects = out.filter((e) => normalize(e && e.kind) === "critStage");
  const shouldRemoveStageCritKey = (stageEffect) => critStageEffects.some((critEffect) => (
    normalize(critEffect && critEffect.target) === normalize(stageEffect && stageEffect.target)
    && (Number(critEffect && critEffect.delta) || 0) === (Number(stageEffect && stageEffect.delta) || 0)
    && (Number(critEffect && critEffect.chance) || 0) === (Number(stageEffect && stageEffect.chance) || 0)
    && Boolean(critEffect && critEffect.requireHit) === Boolean(stageEffect && stageEffect.requireHit)
  ));
  return out.map((e) => {
    if (normalize(e && e.kind) !== "stage") return e;
    if (!Array.isArray(e.keys) || !e.keys.map(normalize).includes("critStage")) return e;
    if (!shouldRemoveStageCritKey(e)) return e;
    return { ...e, keys: e.keys.filter((key) => normalize(key) !== "critStage") };
  }).filter((e) => normalize(e && e.kind) !== "stage" || (Array.isArray(e.keys) && e.keys.length > 0));
};
const correctedKnownSkillEffects = (skill, effects = []) => {
  const skillId = Number(skill && skill.skillId) || 0;
  const name = normalize(skill && skill.name);
  if (skillId === 1028 || name === "激发力量") return [];
  if (skillId === 2316 || name === "虎视眈眈") {
    return [{ kind: "stage", target: "self", keys: ["atk", "accuracy", "critStage"], delta: 1, chance: 1, requireHit: false }];
  }
  if (skillId === 6004 || name === "石锁") {
    return [{ kind: "stage", target: "opponent", keys: ["speed"], delta: -1, chance: 1, requireHit: false }];
  }
  if (skillId === 21039 || name === "断罪十字") {
    return [
      { kind: "multiHit", target: "opponent", min: 2, max: 2 },
      { kind: "onHitRandomStage", target: "self", keys: ["atk", "accuracy", "critStage", "speed"], pick: 2, delta: 1, chance: 1 }
    ];
  }
  if (skillId === 17289 || name === "圣王之域") {
    return [
      { kind: "priority", target: "self", value: 1 },
      { kind: "clearStage", target: "self", mode: "all", keys: ALL_ABILITY_STAGE_KEYS.slice(), chance: 1 },
      { kind: "clearStage", target: "opponent", mode: "all", keys: ALL_ABILITY_STAGE_KEYS.slice(), chance: 1 },
      { kind: "status", target: "self", status: "bind", turns: 3, chance: 1 },
      { kind: "status", target: "opponent", status: "bind", turns: 3, chance: 1 },
      { kind: "onDamagedStage", target: "self", applyTo: "self", keys: ["speed", "evasion"], delta: 1, turns: 3, chance: 1, trigger: "damaged" }
    ];
  }
  if (skillId === 2317 || name === "虎咆") {
    return [{ kind: "speedConditionalStage", target: "opponent", keys: ["def"], delta: -1, fastChance: 1, slowChance: 0.35, requireHit: true }];
  }
  if (skillId === 2318 || name === "龙虎乱舞") {
    return [
      { kind: "multiHit", target: "opponent", min: 4, max: 7 },
      { kind: "onCritHealMaxHp", target: "self", ratio: 0.1 }
    ];
  }
  if (skillId === 20069 || name === "傲世龙啸") {
    return [
      { kind: "stage", target: "self", keys: ALL_ABILITY_STAGE_KEYS.slice(), delta: 1, chance: 1, requireHit: false },
      { kind: "endTurnStageChance", target: "self", turns: 1, chance: 0.3, changes: [
        { keys: ["atk"], delta: 1 },
        { keys: ["speed"], delta: -1 }
      ] }
    ];
  }
  if (skillId === 3322 || name === "极空之舞") {
    return [
      { kind: "stage", target: "self", keys: ["spAtk", "evasion"], delta: 2, chance: 1, requireHit: false },
      { kind: "onDamagedStage", target: "self", applyTo: "self", keys: ["critStage", "speed"], delta: 1, turns: 3, chance: 1, trigger: "attacked" }
    ];
  }
  if (skillId === 15315 || name === "冰晶涅槃") {
    return [
      { kind: "stage", target: "self", keys: ["def", "spDef"], delta: 1, chance: 1, requireHit: false },
      { kind: "endTurnHealFlatRange", target: "self", min: 80, max: 200, turns: 3 }
    ];
  }
  if (skillId === 3323 || name === "凤凰双重奏") {
    return [
      { kind: "multiHit", target: "opponent", min: 2, max: 2 },
      { kind: "onCritHealMaxHp", target: "self", ratio: 1 / 3 }
    ];
  }
  if (skillId === 15316 || name === "冰魂轰击") {
    return [
      { kind: "onCritStatus", target: "opponent", status: "freeze", turns: 3, requireHit: true },
      { kind: "stage", target: "self", keys: ["critStage"], delta: 1, chance: 1, requireHit: true }
    ];
  }
  if (skillId === 22034 || name === "帝王翔龙刃") {
    return [
      { kind: "priority", target: "self", value: -1 },
      { kind: "unharmedPowerMultiplier", target: "self", factor: 2 },
      { kind: "stage", target: "self", keys: ALL_ABILITY_STAGE_KEYS.slice(), delta: 1, chance: 0.25, requireHit: false }
    ];
  }
  if (skillId === 20070 || name === "龙皇制裁") {
    return [
      { kind: "multiHit", target: "opponent", min: 5, max: 10 },
      { kind: "perHitStage", target: "opponent", keys: ALL_ABILITY_STAGE_KEYS.slice(), delta: -1, chance: 0.06 },
      { kind: "perHitStage", target: "self", keys: ["critStage"], delta: 1, chance: 0.06 }
    ];
  }
  if (skillId === 21038 || name === "天堂契约") {
    return [
      { kind: "stage", target: "opponent", keys: ["def", "evasion", "speed"], delta: -1, chance: 1, requireHit: false },
      { kind: "stage", target: "opponent", keys: ["def", "evasion", "speed"], delta: -1, chance: 0.3, requireHit: false },
      { kind: "status", target: "opponent", status: "fear", turns: 1, chance: 0.3 }
    ];
  }
  if (skillId === 17290 || name === "无尽恐惧") {
    return [
      { kind: "status", target: "opponent", status: "fear", turns: 1, chance: 0.25, requireHit: true },
      { kind: "onCritLifesteal", target: "self", ratio: 0.5, requireHit: true },
      { kind: "onCritStage", target: "opponent", keys: ALL_ABILITY_STAGE_KEYS.slice(), delta: -1, chance: 1, requireHit: true }
    ];
  }
  if (skillId === 3249 || name === "天空邪霸") {
    return [{ kind: "endTurnDamageByMaxHpChance", target: "opponent", ratio: 0.15, chance: 0.5, turns: 3 }];
  }
  if (skillId === 14241 || name === "禁龙咒") {
    return [
      { kind: "bonusFixedDamage", target: "opponent", amount: 200, chance: 1, forceChance: true, requireHit: false, condition: { dexIds: [215], baseDexIds: [215], nameIncludes: ["青龙灵兽", "青龙守护"], multiplier: 2 } },
      { kind: "status", target: "opponent", status: "poison", turns: 5, chance: 0.3, condition: { dexIds: [215], baseDexIds: [215], nameIncludes: ["青龙灵兽", "青龙守护"], multiplier: 2 } },
      { kind: "status", target: "opponent", status: "freeze", turns: 3, chance: 0.3, condition: { dexIds: [215], baseDexIds: [215], nameIncludes: ["青龙灵兽", "青龙守护"], multiplier: 2 } },
      { kind: "status", target: "opponent", status: "burn", turns: 5, chance: 0.3, condition: { dexIds: [215], baseDexIds: [215], nameIncludes: ["青龙灵兽", "青龙守护"], multiplier: 2 } }
    ];
  }
  if (name === "转乾坤") {
    return [{ kind: "damagePowerTransfer", target: "self", ratio: 0.05, turns: 5 }];
  }
  if (name === "致命龙影") {
    return [
      { kind: "priority", target: "self", value: 1 },
      { kind: "drainMaxHpRatio", target: "opponent", ratio: 0.05, healRatio: 1, requireHit: false },
      { kind: "damageReduction", target: "self", ratio: 0.05, turns: 3, stackable: true, maxStacks: 3, stackKey: "fatalDragonShadow" },
      { kind: "fatalDragonShadow", target: "opponent", ratio: 0.05, turns: 3, maxStacks: 3, stackKey: "fatalDragonShadow" }
    ];
  }
  if (name === "元魂斩杀") {
    return [
      { kind: "mustHit", target: "self" },
      { kind: "stage", target: "self", keys: ["spAtk"], delta: 1, chance: 1, requireHit: false },
      { kind: "bonusFixedDamage", target: "opponent", amount: 400, chance: 1, requireHit: true, targetHpAbove: 800, splitDamageDisplay: true }
    ];
  }
  if (skillId === 8235 || name === "糖衣火箭炮" || name === "糖衣能量炮") {
    return [
      { kind: "ignoreDefense", target: "opponent", attackKind: "special", mode: "positiveStage", chance: 0.5, requireHit: false }
    ];
  }
  if (skillId === 8236 || name === "糖衣穿甲弹") {
    return [
      { kind: "ignoreDefense", target: "opponent", attackKind: "physical", mode: "positiveStage", chance: 0.5, requireHit: false }
    ];
  }
  if (skillId === 15223 || name === "激发魔力") {
    return [
      { kind: "statusPowerMultiplier", target: "self", statuses: ["poison", "paralyze", "burn"], factor: 2 }
    ];
  }
  if (skillId === 14218 || name === "迷光镜") {
    return [
      { kind: "onDamagedStage", target: "self", applyTo: "attacker", keys: ["atk", "spAtk"], delta: -3, turns: 1, chance: 1, trigger: "attacked", persistUntilTrigger: true, consumeOnTrigger: true, label: "迷光镜" }
    ];
  }
  if (skillId === 16294 || (name === "天之锁" && /恢复\s*30%/.test(normalize(skill && skill.desc)))) {
    return [
      { kind: "priority", target: "self", value: 1 },
      { kind: "heal", target: "self", ratio: 0.3, requireHit: false },
      { kind: "onDamagedStage", target: "self", applyTo: "attacker", keys: ["speed", "evasion"], delta: -2, turns: 1, chance: 1, trigger: "attacked", triggerOncePerTurn: true }
    ];
  }
  if (skillId === 19027) {
    return [
      { kind: "endTurnHealFlat", target: "self", amount: 60, turns: 10 },
      { kind: "endTurnClearStageChance", target: "self", targets: ["self", "opponent"], mode: "all", keys: ALL_ABILITY_STAGE_KEYS.slice(), chance: 0.3, turns: 10 }
    ];
  }
  if (skillId === 19025 || name === "圣疗") {
    return [{ kind: "endTurnHealFlat", target: "self", amount: 60, turns: 10 }];
  }
  if (skillId === 22015 || name === "神兵逆袭") {
    return [
      { kind: "priority", target: "self", value: 1 },
      { kind: "onDamagedStage", target: "self", applyTo: "self", keys: ["speed"], delta: 1, turns: 3, chance: 1, trigger: "attacked" },
      { kind: "endTurnHealFlat", target: "self", amount: 120, turns: 3 }
    ];
  }
  if (skillId === 22031 || name === "无毁湖光") {
    return [
      { kind: "mustHit", target: "self" },
      { kind: "dynamicPower", target: "self", mode: "targetPositiveStageScaled", keys: ["atk", "spAtk"], basePower: 160, perStage: 40, minPower: 160, maxPower: 520 }
    ];
  }
  if (skillId === 30257 || name === "无限圣裁") {
    return [
      { kind: "mustHit", target: "self" },
      { kind: "stealStage", target: "opponent", keys: ["atk"], delta: 1, chance: 1, requireHit: true },
      { kind: "scalingLifesteal", target: "self", baseRatio: 0.3, stepRatio: 0.1, maxRatio: 0.8, counterKey: "infiniteHolyJudgement", requireHit: true }
    ];
  }
  if (skillId === 19083 || name === "圆月之誓") {
    return [
      { kind: "stage", target: "self", keys: ["spAtk", "spDef", "speed"], delta: 1, chance: 1, requireHit: false },
      { kind: "stage", target: "self", keys: ["spAtk"], delta: 1, chance: 0.2, requireHit: false }
    ];
  }
  if (skillId === 16235 || name === "月影无踪") {
    return [
      { kind: "stage", target: "opponent", keys: ALL_ABILITY_STAGE_KEYS.slice(), delta: -1, chance: 1 / 3, requireHit: true },
      { kind: "status", target: "opponent", status: "fear", turns: 1, chance: 1 / 3, requireHit: true }
    ];
  }
  if (skillId === 19047 || name === "辉之斩魄") {
    return [
      { kind: "dynamicPower", target: "self", mode: "selfStatScaled", statKey: "spAtk", factor: 0.8, minPower: 120, maxPower: 320 },
      { kind: "ignoreDefense", target: "opponent", attackKind: "special", ratio: 1, requireHit: false },
      { kind: "overrideElement", element: "光明系" }
    ];
  }
  if (skillId === 2276 || name === "光之斩魄") {
    return [
      { kind: "randomHpAndPpDrain", target: "opponent", minRatio: 0.2, maxRatio: 0.35, requireHit: false }
    ];
  }
  if (skillId === 2206 || name === "乾坤斗转") {
    return [
      { kind: "priority", target: "self", value: -5 },
      { kind: "damageTakenCounter", target: "opponent", multiplier: 2, requireHit: false }
    ];
  }
  if (skillId === 19068 || name === "神圣光暴" || name === "神圣光爆") {
    return [
      { kind: "dynamicPower", target: "self", mode: "randomRange", minPower: 220, maxPower: 280 },
      { kind: "stage", target: "self", keys: ["critStage"], delta: 1, chance: 1, requireHit: true },
      { kind: "overrideElement", element: "光明系" }
    ];
  }
  if (skillId === 10344 || name === "盗神之火") {
    return [
      { kind: "stage", target: "self", keys: ["atk", "evasion"], delta: 1, chance: 1, requireHit: false },
      { kind: "nextAttackMustHit", target: "self", turns: 1, requireHit: false },
      { kind: "lifestealBuff", target: "self", ratio: 0.5, turns: 1, consumeOnAttack: true, requireHit: false }
    ];
  }
  if (skillId === 2313 || skillId === 2383 || name === "炎芒傲日" || name === "炎茫傲日") {
    return [
      { kind: "dynamicPower", target: "self", mode: "selfToTargetStatRatio", statKey: "spAtk", basePower: 180, minPower: 80, maxPower: 320 },
      { kind: "overrideElement", element: "格斗系" }
    ];
  }
  if (skillId === 12209 || name === "奇光异彩") {
    return [
      { kind: "stage", target: "self", keys: ["def", "spDef"], delta: 1, chance: 1, requireHit: false },
      { kind: "timedHeal", target: "self", ratio: 0.1, turns: 10 }
    ];
  }
  if (name === "古炎无双") {
    return [
      { kind: "unharmedStageGuard", target: "self", selfMode: "debuff", opponentMode: "all", turns: 4 }
    ];
  }
  if (skillId === 9280 || name === "银龙领域") {
    return [
      { kind: "timedRandomStage", target: "self", keys: ["accuracy", "critStage", "speed"], pick: 2, delta: 1, turns: 3 },
      { kind: "damageReduction", target: "self", ratio: 0.3, turns: 3 }
    ];
  }
  if (skillId === 9281 || name === "时空割裂") {
    return [
      { kind: "stageGuard", target: "opponent", mode: "buff", turns: 2, requireHit: true },
      { kind: "stageGuard", target: "self", mode: "debuff", turns: 2, requireHit: false }
    ];
  }
  if (skillId === 1279 || name === "神之庇护") {
    return [
      { kind: "priority", target: "self", value: 1 },
      { kind: "heal", target: "self", ratio: 1 / 3, requireHit: false },
      { kind: "attackImmunity", target: "self", turns: 1, attackKind: "all", chance: 1, requireHit: false }
    ];
  }
  if (skillId === 15290 || name === "时空锁定") {
    return [
      { kind: "priority", target: "self", value: 1 },
      { kind: "globalStageGuard", target: "all", mode: "all", turns: 5, requireHit: false }
    ];
  }
  if (skillId === 2228 || name === "斗气护甲") {
    return [{ kind: "damageReduction", target: "self", ratio: 0.5, turns: 3 }];
  }
  if (name === "星诺力量") {
    return [
      { kind: "priority", target: "self", value: 1 },
      { kind: "damageReduction", target: "self", ratio: 0.3, turns: 3 },
      { kind: "endTurnHealFlat", target: "self", amount: 150, turns: 3 }
    ];
  }
  if (skillId === 17234 || (!skillId && name === "魔神之域")) {
    return [
      { kind: "stage", target: "self", keys: ["spAtk", "speed", "accuracy"], delta: 1, chance: 1, requireHit: false },
      { kind: "damageReduction", target: "self", ratio: 0.25, turns: 5 }
    ];
  }
  if (skillId === 17238) {
    return [
      { kind: "stage", target: "self", keys: ["spAtk", "speed", "accuracy"], delta: 1, chance: 1, requireHit: false },
      { kind: "damageReduction", target: "self", ratio: 0.25, turns: 10 }
    ];
  }
  if (skillId === 23013 || name === "万世主宰") {
    return [
      { kind: "priority", target: "self", value: 2 },
      { kind: "heal", target: "self", ratio: 0.25 },
      { kind: "stageGuard", target: "self", mode: "debuff", turns: 4, requireHit: false }
    ];
  }
  if (skillId === 23014 || name === "帝皇能量炮") {
    return [
      { kind: "stage", target: "self", keys: ["atk", "speed"], delta: 1, chance: 0.3, requireHit: true },
      { kind: "onCritLifesteal", target: "self", ratio: 0.5, requireHit: true }
    ];
  }
  if (skillId === 19097 || name === "魂破") {
    return [
      { kind: "stage", target: "self", keys: ["atk", "def", "spDef"], delta: 1, chance: 1, requireHit: false },
      { kind: "onDamagedStage", target: "self", applyTo: "self", keys: ["critStage", "accuracy"], delta: 1, turns: 4, chance: 1, trigger: "damaged" }
    ];
  }
  if (skillId === 3296 || name === "碎灵咆哮") {
    return [
      { kind: "priority", target: "self", value: 2 },
      { kind: "mustHit", target: "self" },
      { kind: "invertStage", target: "opponent", keys: ALL_ABILITY_STAGE_KEYS.slice(), requireHit: false, ignoreStageGuard: true },
      { kind: "endTurnSetHpToOne", target: "self", turns: 1 }
    ];
  }
  if (skillId === 21027 || name === "复苏之轮") {
    return [
      { kind: "stage", target: "self", keys: ["spAtk"], delta: 1, chance: 1, requireHit: false },
      { kind: "timedHeal", target: "self", ratio: 1 / 6, turns: 3 }
    ];
  }
  if (skillId === 20028 || name === "无懈可击") {
    return [
      { kind: "priority", target: "self", value: -1 },
      { kind: "typedDamageReduction", target: "self", attackKind: "physical", ratio: 0.5, turns: 4 }
    ];
  }
  if (skillId === 21041 || name === "涤罪之焰") {
    return [
      { kind: "clearStage", target: "opponent", mode: "positive", keys: ["atk", "spAtk"], chance: 0.4, requireHit: true }
    ];
  }
  if (skillId === 1775 || name === "精神置换") {
    return [
      { kind: "swapStage", target: "opponent", keys: ALL_ABILITY_STAGE_KEYS.slice(), chance: 1, requireHit: false, blockedByOpponentStageGuard: true }
    ];
  }
  if (skillId === 21045 || name === "原初之一") {
    return [
      { kind: "fullRestoreAfterTargetDefeat", target: "self", requireHit: true, resetStages: "negative" }
    ];
  }
  if (skillId === 21044 || name === "灵魂吸收") {
    return [
      { kind: "stage", target: "self", keys: ["spAtk", "def", "spDef", "speed"], delta: 1, chance: 1, requireHit: false },
      { kind: "ppChange", target: "opponent", amount: -1, chance: 1, requireHit: false },
      { kind: "ppChange", target: "self", amount: 1, chance: 1, requireHit: false }
    ];
  }
  if (skillId === 20065 || name === "双龙集光咒") {
    return [
      { kind: "chancePowerMultiplier", target: "self", chances: [{ chance: 0.3, factor: 2 }] },
      { kind: "ppChangeOnPowerMultiplier", target: "self", amount: -3, factor: 2, requireHit: true }
    ];
  }
  if (skillId === 20063 || skillId === 20064 || name === "禅定印") {
    return [
      { kind: "priority", target: "self", value: skillId === 20064 ? 5 : 2 },
      { kind: "recoilFlat", target: "self", amount: 300, chance: 1, requireHit: false },
      { kind: "diminishingSuccessGate", target: "self" },
      { kind: "skip", target: "opponent", turns: 2, chance: 1, requireHit: false },
      ...(skillId === 20064 ? [{ kind: "status", target: "opponent", status: "bind", turns: 5, chance: 1, requireHit: false }] : [])
    ];
  }
  return cloneSkillEffectList(effects);
};
const parseSkillEffects = (skill) => {
  const appendContextEffects = (effects) => {
    const out = cloneSkillEffectList(effects);
    if (normalize(skill && skill.name) === "星神之域") {
      for (let i = out.length - 1; i >= 0; i -= 1) {
        if (normalize(out[i] && out[i].kind) === "attackImmunity") out.splice(i, 1);
      }
      out.push({ kind: "attackImmunity", target: "self", turns: 4, chance: 0.45, attackKind: "all", exceptElements: ["上古系"] });
      out.push({ kind: "battleBackgroundOverride", target: "self", turns: 4, src: STAR_DOMAIN_BATTLE_BG_SRC, label: "星神之域" });
    }
    return out;
  };
  const manual = manualHardcodedSkillEffects(skill);
  if (manual.length > 0) return dedupeSkillEffects(correctedKnownSkillEffects(skill, appendContextEffects(manual)));
  const hardcoded = findHardcodedSkillEffects(skill);
  const descEffects = parseSkillEffectsFromDesc(skill);
  const hasDiminishingGate = descEffects.some((e) => normalize(e && e.kind) === "diminishingSuccessGate");
  if (hardcoded.length > 0) {
    const effects = hasDiminishingGate && !hardcoded.some((e) => normalize(e && e.kind) === "diminishingSuccessGate")
      ? [{ kind: "diminishingSuccessGate", target: "self" }].concat(cloneSkillEffectList(hardcoded))
      : cloneSkillEffectList(hardcoded);
    return dedupeSkillEffects(correctedKnownSkillEffects(skill, appendContextEffects(effects)));
  }
  return dedupeSkillEffects(correctedKnownSkillEffects(skill, appendContextEffects(descEffects)));
};
if (typeof window !== "undefined") {
  window.AOLA_PARSE_SKILL_EFFECTS_FROM_DESC = parseSkillEffectsFromDesc;
}
  const shouldApplySkillEffectByCondition = (scene, actor, effect) => {
  if (!scene || !effect) return true;
  const hpBelow = Number(effect.selfHpBelowRatio);
  if (Number.isFinite(hpBelow) && hpBelow > 0) {
    const hpKey = actor === "attacker" ? "attackerHp" : "targetHp";
    const maxHpKey = actor === "attacker" ? "attackerMaxHp" : "targetMaxHp";
    const hp = Math.max(0, Number(scene[hpKey]) || 0);
    const maxHp = Math.max(1, Number(scene[maxHpKey]) || 1);
    if (!(hp / maxHp < hpBelow)) return false;
  }
  return true;
};
const getBattleSideDexIdentity = (scene, side) => {
  if (!scene) return { dexId: 0, baseDexId: 0, name: "" };
  if (side === "target") {
    return {
      dexId: Number(scene.targetDexId) || 0,
      baseDexId: Number(scene.targetBaseDexId) || Number(scene.targetDexId) || 0,
      name: normalize(scene.targetName)
    };
  }
  const curId = String(scene.currentAttackerId || "");
  const current = Array.isArray(scene.team)
    ? scene.team.find((u) => u && String(u.id || "") === curId)
    : null;
  return {
    dexId: Number((current && current.dexId) || scene.attackerDexId) || 0,
    baseDexId: Number((current && current.baseDexId) || scene.attackerBaseDexId || (current && current.dexId) || scene.attackerDexId) || 0,
    name: normalize((current && current.name) || scene.attackerName)
  };
};
const battleSideMatchesDexCondition = (scene, side, condition = {}) => {
  const identity = getBattleSideDexIdentity(scene, side);
  const dexIds = Array.isArray(condition.dexIds) ? condition.dexIds.map((id) => Number(id) || 0) : [];
  const baseDexIds = Array.isArray(condition.baseDexIds) ? condition.baseDexIds.map((id) => Number(id) || 0) : [];
  const nameIncludes = Array.isArray(condition.nameIncludes) ? condition.nameIncludes.map(normalize).filter(Boolean) : [];
  return (dexIds.length > 0 && dexIds.includes(identity.dexId))
    || (baseDexIds.length > 0 && baseDexIds.includes(identity.baseDexId))
    || (nameIncludes.length > 0 && nameIncludes.some((part) => identity.name.includes(part)));
};
const applySkillEffects = (scene, actor, skill, didHit) => {
  const effects = parseSkillEffects(skill);
  if (!effects.length) return [];
  const logs = [];
  const actorName = actor === "attacker" ? scene.attackerName : scene.targetName;
  const targetName = actor === "attacker" ? scene.targetName : scene.attackerName;
  const isGuardianImmuneSide = (side) => isGuardianBossProtectedTarget(scene, side);
  const sideByTarget = (target) => target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
  let diminishingGateChecked = false;
  let diminishingGateSuccess = true;
  const chanceFailKeys = new Set();
  effects.forEach((e) => {
    if (!shouldApplySkillEffectByCondition(scene, actor, e)) return;
    if (normalize(e && e.kind) === "diminishingSuccessGate") {
      if (!diminishingGateChecked) {
        const gate = rollDiminishingSkillSuccess(scene, actor, skill);
        diminishingGateChecked = true;
        diminishingGateSuccess = gate.success;
        logs.push(`${actorName}使用${skill.name}第${gate.useNo}次，成功率${Math.round(gate.chance * 100)}%。`);
        if (!gate.success) logs.push(`${skill.name}发动失败。`);
      }
      return;
    }
    if (diminishingGateChecked && !diminishingGateSuccess && normalize(e && e.kind) !== "healFlatOnDiminishingFail") return;
    if (normalize(e && e.kind) !== "chanceExclusive" && isEffectBlockedByGuardianBoss(scene, actor, e)) {
      logs.push(`${targetName}对${skill.name}的特殊效果免疫。`);
      return;
    }
    if (!didHit) return;
    if (e.kind === "elementShelter") {
      const side = sideByTarget(e.target || "self");
      getSideState(scene, side).elementShelter = true;
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      logs.push(`${who}进入元素庇护状态，特定连续攻击技能威力翻倍。`);
      return;
    }
    if (e.kind === "stage") {
      if (e.requireHit && !didHit) return;
      const chance = clamp(Number(e.chance) || 1, 0, 1);
      if (Math.random() > chance) {
        const failKey = normalize(e.failEffectKey);
        if (failKey) chanceFailKeys.add(failKey);
        return;
      }
      const sides = e.target === "both" ? ["attacker", "target"] : [e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker")];
      sides.forEach((side) => {
        const changed = applyStageDelta(scene, side, e.keys, e.delta);
        if (changed.length > 0) {
          const who = side === "attacker" ? scene.attackerName : scene.targetName;
          const act = e.delta > 0 ? "提升" : "降低";
          logs.push(`${who}${act}${Math.abs(e.delta)}级：${changed.map((k) => battleStatLabel(k)).join("、")}${chance < 1 ? `（概率${Math.round(chance * 100)}%）` : ""}`);
        }
      });
      return;
    }
    if (e.kind === "unharmedBranch") {
      const side = sideByTarget(e.target || "self");
      const wasDamaged = wasBattleSideDamagedThisTurn(scene, side);
      const branch = wasDamaged ? (e.ifDamaged || null) : (e.ifUnharmed || null);
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      if (!branch) return;
      if (normalize(branch.kind) === "stage") {
        const changed = applyStageDelta(scene, side, branch.keys || [], Number(branch.delta) || 0);
        if (changed.length > 0) {
          logs.push(`${who}${wasDamaged ? "本回合已受到伤害" : "本回合未受到伤害"}，额外提升${Math.abs(Number(branch.delta) || 0)}级：${changed.map((k) => battleStatLabel(k)).join("、")}`);
        }
        return;
      }
      if (normalize(branch.kind) === "healFlat") {
        const amount = Math.max(1, Math.floor(Number(branch.amount) || 1));
        const { actual } = healSideByFlatAmount(scene, side, amount);
        if (side === "attacker") scene.healOnAttacker = `+${amount}`;
        else scene.healOnTarget = `+${amount}`;
        markBattleFloatText(scene);
        logs.push(`${who}本回合已受到伤害，回复 ${amount} 点体力（实际恢复 ${actual}）`);
      }
      return;
    }
    if (e.kind === "randomStage") {
      if (e.requireHit && !didHit) return;
      const condition = e.condition || null;
      const multiplier = condition && battleSideMatchesDexCondition(scene, side, condition)
        ? Math.max(1, Number(condition.multiplier) || 1)
        : 1;
      const chance = clamp((Number(e.chance) || 1) * multiplier, 0, 1);
      if (Math.random() > chance) return;
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const pool = (Array.isArray(e.keys) && e.keys.length > 0 ? e.keys : BATTLE_STAGE_KEYS)
        .map((key) => normalize(key))
        .filter((key, idx, arr) => key && arr.indexOf(key) === idx);
      const min = Math.max(1, Math.floor(Number(e.min) || 1));
      const max = Math.max(min, Math.floor(Number(e.max) || min));
      const count = clamp(randInt(min, max), 1, pool.length);
      const picked = [];
      const rest = pool.slice();
      while (picked.length < count && rest.length > 0) {
        const idx = Math.floor(Math.random() * rest.length);
        picked.push(rest.splice(idx, 1)[0]);
      }
      const delta = Math.floor(Number(e.delta) || -1);
      const changed = applyStageDelta(scene, side, picked, delta);
      if (changed.length > 0) {
        const who = side === "attacker" ? scene.attackerName : scene.targetName;
        logs.push(`${who}${delta > 0 ? "提升" : "降低"}${Math.abs(delta)}级：${changed.map((k) => battleStatLabel(k)).join("、")}`);
      }
      return;
    }
    if (e.kind === "speedConditionalStage") {
      if (e.requireHit && !didHit) return;
      const actorSpeed = getBattleActionSpeed(scene, actor);
      const targetSide = actor === "attacker" ? "target" : "attacker";
      const targetSpeed = getBattleActionSpeed(scene, targetSide);
      const chance = actorSpeed > targetSpeed
        ? clamp(Number(e.fastChance) || 1, 0, 1)
        : clamp(Number(e.slowChance) || Number(e.chance) || 0, 0, 1);
      if (Math.random() > chance) return;
      const side = sideByTarget(e.target || "opponent");
      const changed = applyStageDelta(scene, side, e.keys, e.delta);
      if (changed.length > 0) {
        const who = side === "attacker" ? scene.attackerName : scene.targetName;
        logs.push(`${who}${Number(e.delta) > 0 ? "提升" : "降低"}${Math.abs(Number(e.delta) || 1)}级：${changed.map((k) => battleStatLabel(k)).join("、")}（速度判定概率${Math.round(chance * 100)}%）`);
      }
      return;
    }
    if (e.kind === "onCritStage") {
      if (!didHit) return;
      const critTargetKey = actor === "attacker" ? "critOnTarget" : "critOnAttacker";
      if (!scene[critTargetKey]) return;
      const chance = clamp(Number(e.chance) || 1, 0, 1);
      if (Math.random() > chance) return;
      const side = sideByTarget(e.target || "opponent");
      const changed = applyStageDelta(scene, side, e.keys, e.delta);
      if (changed.length > 0) {
        const who = side === "attacker" ? scene.attackerName : scene.targetName;
        const delta = Math.floor(Number(e.delta) || 0);
        logs.push(`${skill.name}暴击触发，${who}${delta > 0 ? "提升" : "降低"}${Math.abs(delta)}级：${changed.map((k) => battleStatLabel(k)).join("、")}${chance < 1 ? `（概率${Math.round(chance * 100)}%）` : ""}`);
      }
      return;
    }
    if (e.kind === "clearStage") {
      if (e.requireHit && !didHit) return;
      const chance = clamp(Number(e.chance) || 1, 0, 1);
      if (Math.random() > chance) return;
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const mode = normalize(e.mode) || "positive";
      const changed = clearStageByMode(scene, side, mode, e.keys);
      if (changed.length > 0) {
        const who = side === "attacker" ? scene.attackerName : scene.targetName;
        const label = mode === "negative" ? "被削弱的能力等级" : (mode === "all" ? "能力等级" : "提升的能力等级");
        logs.push(`${who}清除了${label}：${changed.map((k) => battleStatLabel(k)).join("、")}${chance < 1 ? `（概率${Math.round(chance * 100)}%）` : ""}`);
      }
      return;
    }
    if (e.kind === "stealStage") {
      if (e.requireHit && !didHit) return;
      const chance = clamp(Number(e.chance) || 1, 0, 1);
      if (Math.random() > chance) return;
      const fromSide = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const toSide = actor;
      const keys = Array.isArray(e.keys) && e.keys.length > 0 ? e.keys : ["def"];
      const delta = Math.abs(Math.floor(Number(e.delta) || 1));
      const changed = [];
      keys.forEach((key) => {
        const lowered = applyStageDelta(scene, fromSide, [key], -delta);
        if (lowered.length > 0) {
          changed.push(key);
          applyStageDelta(scene, toSide, [key], delta);
        }
      });
      if (changed.length > 0) {
        const fromWho = fromSide === "attacker" ? scene.attackerName : scene.targetName;
        const toWho = toSide === "attacker" ? scene.attackerName : scene.targetName;
        logs.push(`${skill.name}转化了${fromWho}的${changed.map((k) => battleStatLabel(k)).join("、")}给${toWho}${chance < 1 ? `（概率${Math.round(chance * 100)}%）` : ""}`);
      }
      return;
    }
    if (e.kind === "copyStage") {
      if (e.requireHit && !didHit) return;
      const chance = clamp(Number(e.chance) || 1, 0, 1);
      if (Math.random() > chance) return;
      const fromSide = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const toSide = e.copyTo === "opponent" ? (actor === "attacker" ? "target" : "attacker") : actor;
      const fromWho = fromSide === "attacker" ? scene.attackerName : scene.targetName;
      const changed = copyPositiveStages(scene, fromSide, toSide, e.keys);
      if (changed.length > 0) {
        const toWho = toSide === "attacker" ? scene.attackerName : scene.targetName;
        logs.push(`${toWho}复制了${fromWho}提升的能力等级：${changed.map((k) => battleStatLabel(k)).join("、")}${chance < 1 ? `（概率${Math.round(chance * 100)}%）` : ""}`);
        if (e.clearStageOnCopySuccess) {
          const cleared = clearStageByMode(scene, fromSide, "positive", e.keys);
          if (cleared.length > 0) logs.push(`${fromWho}被清除了提升的能力等级：${cleared.map((k) => battleStatLabel(k)).join("、")}`);
        }
      }
      if (e.clearStageAfterCopyRoll) {
        const cleared = clearStageByMode(scene, fromSide, "positive", e.keys);
        if (cleared.length > 0) logs.push(`${fromWho}被清除了提升的能力等级：${cleared.map((k) => battleStatLabel(k)).join("、")}`);
      }
      return;
    }
    if (e.kind === "transferStage") {
      if (e.requireHit && !didHit) return;
      const chance = clamp(Number(e.chance) || 1, 0, 1);
      if (Math.random() > chance) return;
      const fromSide = e.from === "opponent" ? (actor === "attacker" ? "target" : "attacker") : actor;
      const toSide = e.to === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const mode = normalize(e.mode) || "negative";
      const changed = transferStagesByMode(scene, fromSide, toSide, mode, e.keys);
      if (changed.length > 0) {
        const fromWho = fromSide === "attacker" ? scene.attackerName : scene.targetName;
        const toWho = toSide === "attacker" ? scene.attackerName : scene.targetName;
        const label = mode === "positive" ? "增益能力等级" : (mode === "all" ? "能力等级" : "减益能力等级");
        logs.push(`${fromWho}将${label}转移给${toWho}：${changed.map((k) => battleStatLabel(k)).join("、")}${chance < 1 ? `（概率${Math.round(chance * 100)}%）` : ""}`);
        if (e.clearStageOnTransferSuccess) {
          const cleared = clearStageByMode(scene, fromSide, mode, e.keys);
          if (cleared.length > 0) logs.push(`${fromWho}被清除了${label}：${cleared.map((k) => battleStatLabel(k)).join("、")}`);
        }
      }
      return;
    }
    if (e.kind === "battleBackgroundOverride") {
      const turns = Math.max(1, Math.floor(Number(e.turns) || 1));
      const src = String(e.src || STAR_DOMAIN_BATTLE_BG_SRC);
      const name = normalize(e.label || skill.name) || "临时战斗背景";
      const next = { kind: "battleBackgroundOverride", turns, data: { src, name } };
      const idx = scene.globalTimedEffects.findIndex((fx) => normalize(fx && fx.kind) === "battleBackgroundOverride");
      if (idx >= 0) scene.globalTimedEffects[idx] = next;
      else scene.globalTimedEffects.push(next);
      logs.push(`${skill.name}展开，战斗背景临时切换为${name}，持续${turns}回合。`);
      return;
    }
    if (e.kind === "transferStatus") {
      if (e.requireHit && !didHit) return;
      const chance = clamp(Number(e.chance) || 1, 0, 1);
      if (Math.random() > chance) return;
      const fromSide = e.from === "opponent" ? (actor === "attacker" ? "target" : "attacker") : actor;
      const toSide = e.to === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const changed = transferStatusesByMode(scene, fromSide, toSide, e.status || "all");
      if (changed.length > 0) {
        const fromWho = fromSide === "attacker" ? scene.attackerName : scene.targetName;
        const toWho = toSide === "attacker" ? scene.attackerName : scene.targetName;
        logs.push(`${fromWho}将异常状态转移给${toWho}：${changed.map((s) => statusLabel(s)).join("、")}${chance < 1 ? `（概率${Math.round(chance * 100)}%）` : ""}`);
      }
      return;
    }
    if (e.kind === "swapStage") {
      if (e.requireHit && !didHit) return;
      const chance = clamp(Number(e.chance) || 1, 0, 1);
      if (Math.random() > chance) return;
      if (e.blockedByOpponentStageGuard) {
        const opponentSide = actor === "attacker" ? "target" : "attacker";
        if (hasActiveStageGuardBuff(scene, opponentSide)) {
          logs.push(`${targetName}的能力等级保护生效，${skill.name}置换无效。`);
          return;
        }
      }
      const changed = swapBattleStages(scene, actor, actor === "attacker" ? "target" : "attacker", e.keys);
      if (changed.length > 0) {
        logs.push(`${actorName}与${targetName}交换了能力等级：${changed.map((k) => battleStatLabel(k)).join("、")}${chance < 1 ? `（概率${Math.round(chance * 100)}%）` : ""}`);
      }
      return;
    }
    if (e.kind === "swapStagePairs") {
      if (e.requireHit && !didHit) return;
      const chance = clamp(Number(e.chance) || 1, 0, 1);
      if (Math.random() > chance) return;
      const side = sideByTarget(e.target || "self");
      const pairs = Array.isArray(e.pairs) ? e.pairs : [];
      const state = getSideState(scene, side);
      const snapshot = {};
      ALL_ABILITY_STAGE_KEYS.forEach((k) => {
        snapshot[k] = k === "critStage" ? (Number(state.critStage) || 0) : (Number(state.stages[k]) || 0);
      });
      pairs.forEach((pair) => {
        const a = normalize(pair && pair[0]);
        const b = normalize(pair && pair[1]);
        if (!ALL_ABILITY_STAGE_KEYS.includes(a) || !ALL_ABILITY_STAGE_KEYS.includes(b)) return;
        const temp = snapshot[a];
        snapshot[a] = snapshot[b];
        snapshot[b] = temp;
      });
      const changed = applyBattleStagesSnapshot(scene, side, snapshot);
      if (changed.length > 0) {
        const who = side === "attacker" ? scene.attackerName : scene.targetName;
        logs.push(`${who}交换了自身能力等级：${changed.map((k) => battleStatLabel(k)).join("、")}${chance < 1 ? `（概率${Math.round(chance * 100)}%）` : ""}`);
      }
      return;
    }
    if (e.kind === "invertStage") {
      if (e.requireHit && !didHit) return;
      const chance = clamp(Number(e.chance) || 1, 0, 1);
      if (Math.random() > chance) return;
      const side = sideByTarget(e.target || "opponent");
      const changed = invertBattleStages(scene, side, e.keys, { ignoreStageGuard: Boolean(e.ignoreStageGuard) });
      if (changed.length > 0) {
        const who = side === "attacker" ? scene.attackerName : scene.targetName;
        logs.push(`${who}的能力等级被倒置：${changed.map((k) => battleStatLabel(k)).join("、")}${chance < 1 ? `（概率${Math.round(chance * 100)}%）` : ""}`);
      }
      return;
    }
    if (e.kind === "skillSealChance") {
      if (e.requireHit && !didHit) return;
      const chance = clamp(Number(e.chance) || 0, 0, 1);
      const side = sideByTarget(e.target || "opponent");
      const turns = Math.max(1, Math.floor(Number(e.turns) || defaultStatusTurns(e.status)));
      addTimedEffect(scene, side, { kind: "skillSealChance", turns, data: { chance } });
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      logs.push(`${who}受到冰封禁制影响，${Math.round(chance * 100)}%概率在${turns}回合内无法使用技能。`);
      return;
    }
    if (e.kind === "ppChange") {
      if (e.requireHit && !didHit) return;
      const chance = clamp(Number(e.chance) || 1, 0, 1);
      if (Math.random() > chance) return;
      const side = sideByTarget(e.target);
      const amount = Math.floor(Number(e.amount) || 0);
      const changed = changeSideAllSkillPp(scene, side, amount);
      if (changed > 0) {
        const who = side === "attacker" ? scene.attackerName : scene.targetName;
        const sign = amount > 0 ? "+" : "-";
        if (side === "attacker") scene.ppOnAttacker = `PP${sign}${changed}`;
        else scene.ppOnTarget = `PP${sign}${changed}`;
        markBattleFloatText(scene);
        logs.push(`${who}所有技能PP${amount > 0 ? "回复" : "减少"}${changed}点${chance < 1 ? `（概率${Math.round(chance * 100)}%）` : ""}`);
      }
      return;
    }
    if (e.kind === "ppChangeOnPowerMultiplier") {
      if (e.requireHit && !didHit) return;
      const factor = Math.max(1, Number(e.factor) || 2);
      const hits = Array.isArray(skill && skill.__lastChancePowerMultiplierHits) ? skill.__lastChancePowerMultiplierHits : [];
      if (!hits.some((x) => Math.abs((Number(x) || 1) - factor) < 0.001)) return;
      const side = sideByTarget(e.target || "self");
      const amount = Math.floor(Number(e.amount) || 0);
      const changed = changeSideAllSkillPp(scene, side, amount);
      if (changed > 0) {
        const who = side === "attacker" ? scene.attackerName : scene.targetName;
        const sign = amount > 0 ? "+" : "-";
        if (side === "attacker") scene.ppOnAttacker = `PP${sign}${changed}`;
        else scene.ppOnTarget = `PP${sign}${changed}`;
        markBattleFloatText(scene);
        logs.push(`${skill.name}触发威力翻倍，${who}所有技能PP减少${changed}点。`);
      }
      return;
    }
    if (e.kind === "randomHpAndPpDrain") {
      if (e.requireHit && !didHit) return;
      const side = sideByTarget(e.target || "opponent");
      const minRatio = clamp(Number(e.minRatio) || 0.1, 0.01, 1);
      const maxRatio = clamp(Number(e.maxRatio) || minRatio, minRatio, 1);
      const ratio = minRatio + Math.random() * (maxRatio - minRatio);
      const hpKey = side === "attacker" ? "attackerHp" : "targetHp";
      const before = Math.max(0, Number(scene[hpKey]) || 0);
      const amount = Math.max(1, Math.floor(before * ratio));
      const actual = applyDirectHpDamage(scene, side, amount);
      const ppChanged = changeSideAllSkillPp(scene, side, -9999);
      if (side === "attacker") {
        scene.damageOnAttacker = `-${actual}`;
        scene.ppOnAttacker = ppChanged > 0 ? `PP-${ppChanged}` : scene.ppOnAttacker;
      } else {
        scene.damageOnTarget = `-${actual}`;
        scene.ppOnTarget = ppChanged > 0 ? `PP-${ppChanged}` : scene.ppOnTarget;
      }
      markBattleFloatText(scene);
      logs.push(`${side === "attacker" ? scene.attackerName : scene.targetName}被${skill.name}随机扣除体力 ${actual} 点，所有技能PP被扣除${ppChanged}点。`);
      return;
    }
    if (e.kind === "damageTakenCounter") {
      if (e.requireHit && !didHit) return;
      const side = sideByTarget(e.target || "opponent");
      const base = getBattleDamageTakenThisTurn(scene, actor);
      if (base <= 0) {
        logs.push(`${actorName}本回合没有承受伤害，${skill.name}未能反击。`);
        return;
      }
      const multiplier = Math.max(0.01, Number(e.multiplier) || 2);
      const damage = Math.max(1, Math.floor(base * multiplier));
      const actual = applyDirectHpDamage(scene, side, damage);
      if (side === "attacker") scene.damageOnAttacker = `-${actual}`;
      else scene.damageOnTarget = `-${actual}`;
      markBattleFloatText(scene);
      logs.push(`${actorName}将本回合承受的 ${base} 点伤害加倍反击给${side === "attacker" ? scene.attackerName : scene.targetName}，造成 ${actual} 点伤害。`);
      return;
    }
    if (e.kind === "chanceExclusive") {
      if (e.requireHit && !didHit) return;
      const picked = Math.random() <= clamp(Number(e.chance) || 0, 0, 1) ? e.success : e.fail;
      if (!picked || typeof picked !== "object") return;
      const nestedLogs = applySkillEffects(scene, actor, { ...skill, __manualEffects: [{ ...picked, requireHit: false }] }, didHit);
      nestedLogs.forEach((line) => logs.push(line));
      return;
    }
    if (e.kind === "coinFlipHalfHp") {
      if (e.requireHit && !didHit) return;
      const targetSide = sideByTarget(e.target || "opponent");
      if (isEffectBlockedByGuardianBoss(scene, actor, e)) {
        logs.push(`${targetSide === "attacker" ? scene.attackerName : scene.targetName}对${skill.name}的特殊效果免疫。`);
        return;
      }
      const hitTarget = Math.random() < 0.5;
      const side = hitTarget ? targetSide : actor;
      const ratio = hitTarget ? clamp(Number(e.ratio) || 0.5, 0.01, 1) : clamp(Number(e.selfRatio) || 0.5, 0.01, 1);
      const { damage, actual } = damageSideByMaxHpRatio(scene, side, ratio);
      if (side === "attacker") scene.damageOnAttacker = `-${damage}`;
      else scene.damageOnTarget = `-${damage}`;
      markBattleFloatText(scene);
      if (actual > 0) clearSleepAfterDamage(scene, side);
      logs.push(`${side === "attacker" ? scene.attackerName : scene.targetName}被${skill.name}扣除最大体力值的${Math.round(ratio * 100)}%，损失 ${actual} 点体力。`);
      return;
    }
    if (e.kind === "damageByMaxHpRatio") {
      if (e.requireHit && !didHit) return;
      const chance = clamp(Number(e.chance) || 1, 0, 1);
      if (Math.random() > chance) return;
      const side = sideByTarget(e.target);
      const ratio = clamp(Number(e.ratio) || 0, 0.01, 1);
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      const { damage, actual } = damageSideByMaxHpRatio(scene, side, ratio);
      if (side === "attacker") scene.damageOnAttacker = `-${damage}`;
      else scene.damageOnTarget = `-${damage}`;
      markBattleFloatText(scene);
      if (actual > 0) clearSleepAfterDamage(scene, side);
      logs.push(`${who}被扣除最大体力值的${Math.round(ratio * 100)}%，损失 ${actual} 点体力${chance < 1 ? `（概率${Math.round(chance * 100)}%）` : ""}`);
      return;
    }
    if (e.kind === "endTurnDamageByMaxHpChance") {
      if (e.requireHit && !didHit) return;
      const side = sideByTarget(e.target || "opponent");
      const turns = Math.max(1, Math.floor(Number(e.turns) || 1));
      const chance = clamp(Number(e.chance) || 1, 0, 1);
      const ratio = clamp(Number(e.ratio) || 0.1, 0.01, 1);
      addTimedEffect(scene, side, { kind: "endTurnDamageByMaxHpChance", turns, data: { chance, ratio, label: normalize(skill.name) } });
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      logs.push(`${who}受到${skill.name}影响，${turns}回合内回合末${Math.round(chance * 100)}%概率损失最大体力${Math.round(ratio * 100)}%。`);
      return;
    }
    if (e.kind === "recoilFlatOnChanceFail") {
      const effectKey = normalize(e.effectKey);
      if (!effectKey || !chanceFailKeys.has(effectKey)) return;
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const amount = Math.max(1, Math.floor(Number(e.amount) || 1));
      const hpKey = side === "attacker" ? "attackerHp" : "targetHp";
      const before = Math.max(0, Number(scene[hpKey]) || 0);
      scene[hpKey] = Math.max(0, before - amount);
      const actual = Math.max(0, before - (Number(scene[hpKey]) || 0));
      if (side === "attacker") syncActivePetFromBattleScene(scene);
      syncBattleUiHpForSide(scene, side);
      if (side === "attacker") scene.damageOnAttacker = `-${actual}`;
      else scene.damageOnTarget = `-${actual}`;
      markBattleFloatText(scene);
      logs.push(`${side === "attacker" ? scene.attackerName : scene.targetName}因${skill.name}失败扣除 ${actual} 点体力。`);
      return;
    }
    if (e.kind === "drainRemainingHpRatio") {
      if (e.requireHit && !didHit) return;
      const side = sideByTarget(e.target || "opponent");
      const ratio = clamp(Number(e.ratio) || 0, 0.01, 1);
      const hpKey = side === "attacker" ? "attackerHp" : "targetHp";
      const before = Math.max(0, Number(scene[hpKey]) || 0);
      const amount = Math.max(1, Math.floor(before * ratio));
      const actual = Math.min(amount, before);
      scene[hpKey] = Math.max(0, before - amount);
      syncBattleUiHpForSide(scene, side);
      clearSleepAfterDamage(scene, side);
      const actorHpKey = actor === "attacker" ? "attackerHp" : "targetHp";
      const actorMaxHpKey = actor === "attacker" ? "attackerMaxHp" : "targetMaxHp";
      const healed = Math.min(actual, Math.max(0, (Number(scene[actorMaxHpKey]) || 0) - (Number(scene[actorHpKey]) || 0)));
      scene[actorHpKey] = clamp((Number(scene[actorHpKey]) || 0) + healed, 0, Number(scene[actorMaxHpKey]) || 0);
      syncBattleUiHpForSide(scene, actor);
      if (actor === "attacker") {
        syncActivePetFromBattleScene(scene);
      }
      if (side === "attacker") scene.damageOnAttacker = `-${actual}`;
      else scene.damageOnTarget = `-${actual}`;
      if (actor === "attacker") scene.healOnAttacker = `+${healed}`;
      else scene.healOnTarget = `+${healed}`;
      markBattleFloatText(scene);
      logs.push(`${targetName}被扣除剩余体力的${Math.round(ratio * 100)}%，${actorName}回复 ${healed} 点体力。`);
      return;
    }
    if (e.kind === "drainMaxHpRatio") {
      if (e.requireHit && !didHit) return;
      const side = sideByTarget(e.target || "opponent");
      const ratio = clamp(Number(e.ratio) || 0, 0.01, 1);
      const { actual, healed } = applyBattleMaxHpDrain(scene, side, actor, ratio, skill.name);
      queueAfterDamageFloat(scene, () => {
        if (!scene || scene.ended) return;
        clearBattleFloatTextIfExpired(scene, true);
        if (side === "attacker") scene.damageOnAttacker = actual > 0 ? `-${actual}` : (scene.damageOnAttacker || "");
        else scene.damageOnTarget = actual > 0 ? `-${actual}` : (scene.damageOnTarget || "");
        if (actor === "attacker") scene.healOnAttacker = `+${healed}`;
        else scene.healOnTarget = `+${healed}`;
        markBattleFloatText(scene);
      });
      return;
    }
    if (e.kind === "equalizeOpponentHpToSelf") {
      if (e.requireHit && !didHit) return;
      const side = sideByTarget(e.target || "opponent");
      const hpKey = side === "attacker" ? "attackerHp" : "targetHp";
      const actorHp = Math.max(0, Number(actor === "attacker" ? scene.attackerHp : scene.targetHp) || 0);
      const before = Math.max(0, Number(scene[hpKey]) || 0);
      if (before <= actorHp) return;
      scene[hpKey] = actorHp;
      syncBattleUiHpForSide(scene, side);
      clearSleepAfterDamage(scene, side);
      if (side === "attacker") scene.damageOnAttacker = `-${before - actorHp}`;
      else scene.damageOnTarget = `-${before - actorHp}`;
      markBattleFloatText(scene);
      logs.push(`${targetName}的体力被降至与${actorName}相同。`);
      return;
    }
    if (e.kind === "averageHp") {
      if (e.requireHit && !didHit) return;
      const side = sideByTarget(e.target || "opponent");
      const hpKeyA = actor === "attacker" ? "attackerHp" : "targetHp";
      const hpKeyB = side === "attacker" ? "attackerHp" : "targetHp";
      const maxHpKeyA = actor === "attacker" ? "attackerMaxHp" : "targetMaxHp";
      const maxHpKeyB = side === "attacker" ? "attackerMaxHp" : "targetMaxHp";
      const beforeA = Math.max(0, Number(scene[hpKeyA]) || 0);
      const beforeB = Math.max(0, Number(scene[hpKeyB]) || 0);
      const avg = Math.floor((beforeA + beforeB) / 2);
      scene[hpKeyA] = clamp(avg, 0, Number(scene[maxHpKeyA]) || avg);
      scene[hpKeyB] = clamp(avg, 0, Number(scene[maxHpKeyB]) || avg);
      syncBattleUiHpForSide(scene, actor);
      syncBattleUiHpForSide(scene, side);
      if (actor === "attacker") {
        syncActivePetFromBattleScene(scene);
      }
      if (beforeA > avg) clearSleepAfterDamage(scene, actor);
      if (beforeB > avg) clearSleepAfterDamage(scene, side);
      markBattleFloatText(scene);
      logs.push(`${actorName}与${targetName}平分当前体力值。`);
      return;
    }
    if (e.kind === "delayedKo") {
      const side = sideByTarget(e.target || "opponent");
      addTimedEffect(scene, side, { kind: "delayedStage", turns: Math.max(1, Math.floor(Number(e.turns) || 6)), data: { ko: true, label: skill.name } });
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      logs.push(`${who}被时间吞噬标记，${Math.max(1, Math.floor(Number(e.turns) || 6))}回合后将失去战斗能力。`);
      return;
    }
    if (e.kind === "randomStatus") {
      if (e.requireHit && !didHit) return;
      const side = sideByTarget(e.target || "opponent");
      if (isGuardianImmuneSide(side)) {
        logs.push(`${side === "attacker" ? scene.attackerName : scene.targetName}免疫异常状态。`);
        return;
      }
      if (hasStatusShield(scene, side)) {
        logs.push(`${side === "attacker" ? scene.attackerName : scene.targetName}的异常免疫生效。`);
        return;
      }
      const chance = clamp(Number(e.chance) || 1, 0, 1);
      if (Math.random() > chance) return;
      let options = ["poison", "burn", "freeze", "weak", "leech", "bind", "paralyze", "fear", "sleep", "confuse"].filter((s) => !isStatusImmuneByElement(scene, side, s));
      if (options.length === 0) return;
      const st = getSideState(scene, side);
      const count = Math.max(1, Math.floor(Number(e.count) || 1));
      const applied = [];
      for (let i = 0; i < count && options.length > 0; i += 1) {
        const idx = Math.floor(Math.random() * options.length);
        const status = options.splice(idx, 1)[0];
        applyStatusTurns(st, status, e.turns);
        applied.push(status);
      }
      if (applied.length > 0) logs.push(`${side === "attacker" ? scene.attackerName : scene.targetName}陷入${applied.map((s) => statusLabel(s)).join("、")}状态。`);
      return;
    }
    if (e.kind === "instantKo") {
      if (e.requireHit && !didHit) return;
      const chance = clamp(Number(e.chance) || 1, 0, 1);
      if (Math.random() > chance) return;
      const side = sideByTarget(e.target || "opponent");
      if (isGuardianImmuneSide(side)) {
        logs.push(`${side === "attacker" ? scene.attackerName : scene.targetName}免疫秒杀效果。`);
        return;
      }
      if (applyInstantKoToSide(scene, side)) {
        const damageValue = Math.max(1, Math.floor(Number(e.damageValue) || 999999));
        showBattleInstantKoDamage(scene, side, damageValue);
        logs.push(`${skill.name}秒杀成功，对${side === "attacker" ? scene.attackerName : scene.targetName}造成 ${damageValue} 点伤害${chance < 1 ? `（概率${Math.round(chance * 100)}%）` : ""}。`);
        if (Number(e.stopSelfOnSuccess) > 0) {
          const actorState = getSideState(scene, actor);
          actorState.skipTurns = Math.max(actorState.skipTurns, Math.floor(Number(e.stopSelfOnSuccess) || 1));
          logs.push(`${actorName}因${skill.name}命中效果，下回合停止行动。`);
        }
        scene.forceDefeatSide = side;
        scene.forceDefeatReason = "instantKo";
      }
      return;
    }
    if (e.kind === "destinyBond") {
      const side = sideByTarget(e.target);
      addTimedEffect(scene, side, { kind: "destinyBond", turns: Math.max(1, Math.floor(Number(e.turns) || 1)), data: {} });
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      logs.push(`${who}进入同归于尽状态，本回合若被对手打败则双方同归于尽。`);
      return;
    }
  if (e.kind === "status") {
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      if (isGuardianImmuneSide(side)) {
        logs.push(`${side === "attacker" ? scene.attackerName : scene.targetName}免疫异常状态。`);
        return;
      }
      if (isStatusImmuneByElement(scene, side, e.status)) {
        logs.push(`${side === "attacker" ? scene.attackerName : scene.targetName}因系别免疫${statusLabel(e.status)}。`);
        return;
      }
      if (hasStatusShield(scene, side, e.status)) {
        logs.push(`${side === "attacker" ? scene.attackerName : scene.targetName}的异常免疫生效。`);
        return;
      }
      const chance = clamp(Number(e.chance) || 1, 0, 1);
      if (Math.random() > chance) return;
      const st = getSideState(scene, side);
      if (DAMAGE_STATUS_KEYS.includes(e.status) && Math.max(0, Number(st.statuses.sleep) || 0) > 0) {
        st.statuses.sleep = 0;
        logs.push(`${side === "attacker" ? scene.attackerName : scene.targetName}因扣血类状态解除睡眠。`);
      }
      const minTurns = Math.max(1, Math.floor(Number(e.minTurns) || 0));
      const maxTurns = Math.max(minTurns, Math.floor(Number(e.maxTurns) || 0));
      const turns = maxTurns > 0
        ? (minTurns + Math.floor(Math.random() * (maxTurns - minTurns + 1)))
        : Math.max(1, Math.floor(Number(e.turns) || defaultStatusTurns(e.status)));
      applyStatusTurns(st, e.status, turns);
      if (e.status === "sleep" && clearSleepIfDamageStatusExists(st)) {
        logs.push(`${side === "attacker" ? scene.attackerName : scene.targetName}已有扣血类状态，睡眠被解除。`);
      }
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      const stLabel = statusLabel(e.status);
      logs.push(`${who}陷入${stLabel}${st.statuses[e.status]}回合（概率${Math.round(chance * 100)}%）`);
      if (e.status === "leech") {
        logs.push(`${who}被寄生，回合结束时将被吸取体力`);
      }
      return;
    }
    if (e.kind === "statusCure") {
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const chance = clamp(Number(e.chance) || 1, 0, 1);
      if (Math.random() > chance) return;
      const st = getSideState(scene, side);
      if (normalize(e.status) === "all") {
        const cleared = Object.keys(st.statuses || {}).filter((key) => Math.max(0, Number(st.statuses[key]) || 0) > 0);
        if (cleared.length <= 0) return;
        cleared.forEach((key) => { st.statuses[key] = 0; });
        const who = side === "attacker" ? scene.attackerName : scene.targetName;
        logs.push(`${who}解除了所有异常状态${chance < 1 ? `（概率${Math.round(chance * 100)}%）` : ""}`);
        return;
      }
      const prev = Math.max(0, Number(st.statuses[e.status]) || 0);
      if (prev <= 0) return;
      st.statuses[e.status] = 0;
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      const stLabel = statusLabel(e.status);
      logs.push(`${who}解除了${stLabel}状态${chance < 1 ? `（概率${Math.round(chance * 100)}%）` : ""}`);
      return;
    }
    if (e.kind === "windGodPossession") {
      const side = actor;
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      const ratio = clamp(Number(e.ratio) || 0.5, 0.01, 1);
      const { damage, actual } = damageSideByMaxHpRatio(scene, side, ratio);
      const boostDelta = Math.max(1, Math.floor(Number(e.boostDelta) || 3));
      const accuracyDelta = -Math.max(1, Math.floor(Math.abs(Number(e.accuracyDelta) || 3)));
      const boosted = applyStageDelta(scene, side, ["speed", "evasion"], boostDelta);
      const lowered = applyStageDelta(scene, side, ["accuracy"], accuracyDelta);
      if (side === "attacker") scene.damageOnAttacker = `-${damage}`;
      else scene.damageOnTarget = `-${damage}`;
      markBattleFloatText(scene);
      logs.push(`${who}使用风神附体，消耗最大体力值的1/2，损失 ${actual} 点体力。`);
      if (boosted.length > 0) logs.push(`${who}提升${boostDelta}级：${boosted.map((k) => battleStatLabel(k)).join("、")}`);
      if (lowered.length > 0) logs.push(`${who}降低${Math.abs(accuracyDelta)}级：${lowered.map((k) => battleStatLabel(k)).join("、")}`);
      return;
    }
    if (e.kind === "skip") {
      const chance = clamp(Number(e.chance) || 1, 0, 1);
      if (Math.random() > chance) return;
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const st = getSideState(scene, side);
      st.skipTurns = Math.max(st.skipTurns, Math.max(1, Math.floor(Number(e.turns) || 1)));
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      logs.push(`${who}将停止行动${st.skipTurns}回合${chance < 1 ? `（概率${Math.round(chance * 100)}%）` : ""}`);
      return;
    }
    if (e.kind === "heal") {
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const chance = clamp(Number(e.chance) || 1, 0, 1);
      if (Math.random() > chance) return;
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      const shownHeal = calcHealAmountByRatio(scene, side, e.ratio);
      const healed = healSideByRatio(scene, side, e.ratio);
      syncBattleUiHpForSide(scene, side);
      if (side === "attacker") scene.healOnAttacker = `+${shownHeal}`;
      else scene.healOnTarget = `+${shownHeal}`;
      markBattleFloatText(scene);
      if (side === "attacker" && Array.isArray(scene.team)) {
        syncActivePetFromBattleScene(scene);
      }
      logs.push(`${who}回复了 ${shownHeal} 点体力（实际恢复 ${healed}）`);
      return;
    }
    if (e.kind === "healByStatRatio") {
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const chance = clamp(Number(e.chance) || 1, 0, 1);
      if (Math.random() > chance) return;
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      const statKey = normalize(e.statKey) || "speed";
      const amount = Math.max(1, Math.floor(getBattleAbilityStat(scene, side, statKey) * clamp(Number(e.ratio) || 0, 0.01, 3)));
      const { actual: healed } = healSideByFlatAmount(scene, side, amount);
      if (side === "attacker") scene.healOnAttacker = `+${amount}`;
      else scene.healOnTarget = `+${amount}`;
      markBattleFloatText(scene);
      logs.push(`${who}回复了 ${amount} 点体力（实际恢复 ${healed}）`);
      return;
    }
    if (e.kind === "recoilFlat") {
      const chance = clamp(Number(e.chance) || 1, 0, 1);
      if (Math.random() > chance) return;
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const amount = Math.max(1, Math.floor(Number(e.amount) || 1));
      const hpKey = side === "attacker" ? "attackerHp" : "targetHp";
      const before = Math.max(0, Number(scene[hpKey]) || 0);
      scene[hpKey] = Math.max(0, before - amount);
      const actual = Math.max(0, before - (Number(scene[hpKey]) || 0));
      if (side === "attacker") syncActivePetFromBattleScene(scene);
      syncBattleUiHpForSide(scene, side);
      if (side === "attacker") scene.damageOnAttacker = `-${actual}`;
      else scene.damageOnTarget = `-${actual}`;
      markBattleFloatText(scene);
      logs.push(`${side === "attacker" ? scene.attackerName : scene.targetName}消耗 ${actual} 点体力。`);
      return;
    }
    if (e.kind === "healFlat") {
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      const val = Math.max(1, Number(e.amount) || 0);
      const { actual: healed } = healSideByFlatAmount(scene, side, val);
      if (side === "attacker") scene.healOnAttacker = `+${val}`;
      else scene.healOnTarget = `+${val}`;
      markBattleFloatText(scene);
      logs.push(`${who}回复了 ${val} 点体力（实际恢复 ${healed}）`);
      return;
    }
    if (e.kind === "healFlatOnDiminishingFail") {
      if (!diminishingGateChecked || diminishingGateSuccess) return;
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const amount = Math.max(1, Math.floor(Number(e.amount) || 1));
      const { actual } = healSideByFlatAmount(scene, side, amount);
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      if (side === "attacker") scene.healOnAttacker = `+${actual}`;
      else scene.healOnTarget = `+${actual}`;
      markBattleFloatText(scene);
      logs.push(`${who}因${skill.name}失败回复 ${actual} 点体力。`);
      return;
    }
    if (e.kind === "healFlatTeam") {
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      const val = Math.max(1, Number(e.amount) || 0);
      if (side === "attacker" && Array.isArray(scene.team)) {
        let healedActive = 0;
        scene.team.forEach((u) => {
          const before = clamp(Number(u.hp) || 0, 0, Number(u.maxHp) || 1);
          if (before <= 0) return;
          u.hp = clamp(before + val, 0, Number(u.maxHp) || 1);
          if (u.id === scene.currentAttackerId) {
            scene.attackerHp = clamp(Number(u.hp) || 0, 0, Number(scene.attackerMaxHp) || 1);
            healedActive = Math.max(0, (Number(u.hp) || 0) - before);
          }
        });
        if (healedActive > 0) {
          syncBattleUiHpForSide(scene, "attacker");
          scene.healOnAttacker = `+${healedActive}`;
          markBattleFloatText(scene);
        }
        logs.push(`${who}使我方全体回复 ${val} 点体力`);
      } else {
        const hpKey = side === "attacker" ? "attackerHp" : "targetHp";
        const maxHpKey = side === "attacker" ? "attackerMaxHp" : "targetMaxHp";
        const before = Number(scene[hpKey]) || 0;
        const maxHp = Math.max(1, Number(scene[maxHpKey]) || 1);
        scene[hpKey] = clamp(before + val, 0, maxHp);
      const healed = Math.max(0, (Number(scene[hpKey]) || 0) - before);
      syncBattleUiHpForSide(scene, side);
      if (side === "attacker") scene.healOnAttacker = `+${val}`;
      else scene.healOnTarget = `+${val}`;
      markBattleFloatText(scene);
      logs.push(`${who}回复了 ${val} 点体力（实际恢复 ${healed}）`);
      }
      return;
    }
    if (e.kind === "lifesteal") {
      if (!didHit) return;
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      const baseDamage = Math.max(0, Number(scene.lastDamage) || 0);
      if (baseDamage <= 0) return;
      const ratio = clamp(Number(e.ratio) || 0, 0.01, 3);
      const heal = Math.max(1, Math.floor(baseDamage * ratio));
      const hpKey = side === "attacker" ? "attackerHp" : "targetHp";
      const maxHpKey = side === "attacker" ? "attackerMaxHp" : "targetMaxHp";
      const before = Number(scene[hpKey]) || 0;
      const maxHp = Math.max(1, Number(scene[maxHpKey]) || 1);
      scene[hpKey] = clamp(before + heal, 0, maxHp);
      const healed = Math.max(0, (Number(scene[hpKey]) || 0) - before);
      syncBattleUiHpForSide(scene, side);
      if (side === "attacker" && Array.isArray(scene.team)) {
        syncActivePetFromBattleScene(scene);
      }
      queueAfterDamageFloat(scene, () => {
        if (!scene || scene.ended) return;
        clearBattleFloatTextIfExpired(scene, true);
        if (side === "attacker") scene.healOnAttacker = `+${heal}`;
        else scene.healOnTarget = `+${heal}`;
        markBattleFloatText(scene);
        pushBattleLog(scene, `${who}通过嗜血效果回复 ${heal} 点体力（实际恢复 ${healed}）`);
      });
      return;
    }
    if (e.kind === "scalingLifesteal") {
      if (e.requireHit && !didHit) return;
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      const baseDamage = Math.max(0, Number(scene.lastDamage) || 0);
      if (baseDamage <= 0) return;
      if (!scene.skillEffectUseCounts || typeof scene.skillEffectUseCounts !== "object") scene.skillEffectUseCounts = {};
      const countKey = normalize(e.counterKey) || `skill_${Number(skill && skill.skillId) || normalize(skill && skill.name) || "unknown"}`;
      const useCount = Math.max(1, Math.floor(Number(scene.skillEffectUseCounts[countKey]) || 0) + 1);
      scene.skillEffectUseCounts[countKey] = useCount;
      const ratio = clamp((Number(e.baseRatio) || 0.3) + Math.max(0, useCount - 1) * (Number(e.stepRatio) || 0.1), 0.01, Number(e.maxRatio) || 3);
      const heal = Math.max(1, Math.floor(baseDamage * ratio));
      const hpKey = side === "attacker" ? "attackerHp" : "targetHp";
      const maxHpKey = side === "attacker" ? "attackerMaxHp" : "targetMaxHp";
      const before = Number(scene[hpKey]) || 0;
      const maxHp = Math.max(1, Number(scene[maxHpKey]) || 1);
      scene[hpKey] = clamp(before + heal, 0, maxHp);
      const healed = Math.max(0, (Number(scene[hpKey]) || 0) - before);
      syncBattleUiHpForSide(scene, side);
      if (side === "attacker" && Array.isArray(scene.team)) {
        syncActivePetFromBattleScene(scene);
      }
      queueAfterDamageFloat(scene, () => {
        if (!scene || scene.ended) return;
        clearBattleFloatTextIfExpired(scene, true);
        if (side === "attacker") scene.healOnAttacker = `+${heal}`;
        else scene.healOnTarget = `+${heal}`;
        markBattleFloatText(scene);
        pushBattleLog(scene, `${who}通过${skill.name}回复 ${heal} 点体力（实际恢复 ${healed}，第${useCount}次使用）`);
      });
      return;
    }
    if (e.kind === "onCritLifesteal") {
      if (!didHit) return;
      const critTargetKey = actor === "attacker" ? "critOnTarget" : "critOnAttacker";
      if (!scene[critTargetKey]) return;
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      const baseDamage = Math.max(0, Number(scene.lastDamage) || 0);
      if (baseDamage <= 0) return;
      const ratio = clamp(Number(e.ratio) || 0.5, 0.01, 3);
      const heal = Math.max(1, Math.floor(baseDamage * ratio));
      const hpKey = side === "attacker" ? "attackerHp" : "targetHp";
      const maxHpKey = side === "attacker" ? "attackerMaxHp" : "targetMaxHp";
      const before = Number(scene[hpKey]) || 0;
      const maxHp = Math.max(1, Number(scene[maxHpKey]) || 1);
      scene[hpKey] = clamp(before + heal, 0, maxHp);
      const healed = Math.max(0, (Number(scene[hpKey]) || 0) - before);
      syncBattleUiHpForSide(scene, side);
      if (side === "attacker") syncActivePetFromBattleScene(scene);
      queueAfterDamageFloat(scene, () => {
        if (!scene || scene.ended) return;
        clearBattleFloatTextIfExpired(scene, true);
        if (side === "attacker") scene.healOnAttacker = `+${heal}`;
        else scene.healOnTarget = `+${heal}`;
        markBattleFloatText(scene);
        pushBattleLog(scene, `${who}的暴击触发伤害转化，回复 ${heal} 点体力（实际恢复 ${healed}）。`);
      });
      return;
    }
    if (e.kind === "lifestealBuff") {
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const turns = Math.max(1, Math.floor(Number(e.turns) || 1));
      const amount = Math.max(0, Math.floor(Number(e.amount) || 0));
      const ratio = amount > 0 ? 0 : clamp(Number(e.ratio) || 0, 0.01, 3);
      addTimedEffect(scene, side, { kind: "lifestealBuff", turns, data: { ratio, amount, consumeOnAttack: Boolean(e.consumeOnAttack) } });
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      logs.push(amount > 0 ? `${who}获得攻击回血效果，每次攻击回复${amount}点体力，持续${turns}回合` : `${who}获得嗜血效果，持续${turns}回合`);
      return;
    }
    if (e.kind === "nextAttackMustHit") {
      const side = sideByTarget(e.target || "self");
      const turns = Math.max(1, Math.floor(Number(e.turns) || 1));
      addTimedEffect(scene, side, { kind: "nextAttackMustHit", turns, data: {} });
      logs.push(`${side === "attacker" ? scene.attackerName : scene.targetName}下次攻击必定命中。`);
      return;
    }
    if (e.kind === "selfStatusLifesteal") {
      if (e.requireHit && !didHit) return;
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const status = normalize(e.status);
      if (!status || Math.max(0, Number(getSideState(scene, side).statuses && getSideState(scene, side).statuses[status]) || 0) <= 0) return;
      const baseDamage = Math.max(0, Number(scene.lastDamage) || 0);
      if (baseDamage <= 0) return;
      const ratio = clamp(Number(e.ratio) || 0.5, 0.01, 3);
      const hpKey = side === "attacker" ? "attackerHp" : "targetHp";
      const maxHpKey = side === "attacker" ? "attackerMaxHp" : "targetMaxHp";
      const before = Number(scene[hpKey]) || 0;
      const maxHp = Math.max(1, Number(scene[maxHpKey]) || 1);
      const heal = Math.max(1, Math.floor(baseDamage * ratio));
      scene[hpKey] = clamp(before + heal, 0, maxHp);
      const healed = Math.max(0, (Number(scene[hpKey]) || 0) - before);
      syncBattleUiHpForSide(scene, side);
      if (side === "attacker") syncActivePetFromBattleScene(scene);
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      queueAfterDamageFloat(scene, () => {
        if (!scene || scene.ended) return;
        clearBattleFloatTextIfExpired(scene, true);
        if (side === "attacker") scene.healOnAttacker = `+${heal}`;
        else scene.healOnTarget = `+${heal}`;
        markBattleFloatText(scene);
        pushBattleLog(scene, `${who}处于${statusLabel(status)}状态，${skill.name}将伤害的${Math.round(ratio * 100)}%转化为体力，回复 ${heal} 点（实际恢复 ${healed}）。`);
      });
      return;
    }
    if (e.kind === "fullRestoreOnDefeatThisTurn") {
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      addTimedEffect(scene, side, { kind: "fullRestoreOnDefeatThisTurn", turns: Math.max(1, Math.floor(Number(e.turns) || 1)), data: {} });
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      logs.push(`${who}进入意念无限状态，本回合被击败时体力和PP将全部恢复。`);
      return;
    }
    if (e.kind === "fullRestoreAfterTargetDefeat") {
      if (e.requireHit && !didHit) return;
      const defeatedSide = actor === "attacker" ? "target" : "attacker";
      const hpKey = defeatedSide === "attacker" ? "attackerHp" : "targetHp";
      const defeated = Math.max(0, Number(scene[hpKey]) || 0) <= 0 || scene.forceDefeatSide === defeatedSide;
      if (!defeated) return;
      const side = sideByTarget(e.target || "self");
      const resetStages = e.resetStages === undefined ? true : e.resetStages;
      const result = restoreSideFullStatus(scene, side, { resetStages });
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      if (side === "attacker") {
        scene.healOnAttacker = `+${result.healed}`;
        if (result.ppChanged > 0) scene.ppOnAttacker = `PP+${result.ppChanged}`;
        syncActivePetFromBattleScene(scene);
      } else {
        scene.healOnTarget = `+${result.healed}`;
        if (result.ppChanged > 0) scene.ppOnTarget = `PP+${result.ppChanged}`;
      }
      markBattleFloatText(scene);
      const resetStageMode = getRestoreStageResetMode(resetStages);
      const stageText = resetStageMode === "negative"
        ? "并清除自身削弱能力等级"
        : (resetStageMode ? "并清空自身能力等级" : "");
      logs.push(`${skill.name}击败对手后，${who}回复满状态${stageText}。`);
      return;
    }
    if (e.kind === "recoilByDamage") {
      if (!didHit) return;
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      const baseDamage = Math.max(0, Number(scene.lastDamage) || 0);
      if (baseDamage <= 0) return;
      const ratio = clamp(Number(e.ratio) || 0, 0.01, 1);
      const recoil = Math.max(1, Math.floor(baseDamage * ratio));
      const hpKey = side === "attacker" ? "attackerHp" : "targetHp";
      const before = Number(scene[hpKey]) || 0;
      scene[hpKey] = Math.max(0, before - recoil);
      const actual = Math.max(0, before - (Number(scene[hpKey]) || 0));
      if (side === "attacker") {
        syncActivePetFromBattleScene(scene);
      }
      queueAfterDamageFloat(scene, () => {
        if (!scene || scene.ended) return;
        clearBattleFloatTextIfExpired(scene, true);
        syncBattleUiHpForSide(scene, side);
        if (side === "attacker") scene.damageOnAttacker = `-${recoil}`;
        else scene.damageOnTarget = `-${recoil}`;
        markBattleFloatText(scene);
        pushBattleLog(scene, `${who}承受舍命反伤 ${recoil} 点体力（实际损失 ${actual}）`);
      });
      return;
    }
    if (e.kind === "recoilByMaxHp") {
      if (e.requireHit && !didHit) return;
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      const hpKey = side === "attacker" ? "attackerHp" : "targetHp";
      const maxHpKey = side === "attacker" ? "attackerMaxHp" : "targetMaxHp";
      const maxHp = Math.max(1, Number(scene[maxHpKey]) || 1);
      const recoil = Math.max(1, Math.floor(maxHp * clamp(Number(e.ratio) || 0, 0.01, 1)));
      const before = Number(scene[hpKey]) || 0;
      scene[hpKey] = Math.max(0, before - recoil);
      const actual = Math.max(0, before - (Number(scene[hpKey]) || 0));
      if (side === "attacker") syncActivePetFromBattleScene(scene);
      syncBattleUiHpForSide(scene, side);
      if (side === "attacker") {
        syncActivePetFromBattleScene(scene);
      }
      if (side === "attacker") scene.damageOnAttacker = `-${recoil}`;
      else scene.damageOnTarget = `-${recoil}`;
      markBattleFloatText(scene);
      logs.push(`${who}消耗最大体力的${Math.round(clamp(Number(e.ratio) || 0, 0.01, 1) * 100)}%，损失 ${actual} 点体力`);
      return;
    }
    if (e.kind === "selfKo") {
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      if (side === "attacker") {
        scene.attackerHp = 0;
        if (Array.isArray(scene.team)) {
          const idx = scene.team.findIndex((u) => u.id === scene.currentAttackerId);
          if (idx >= 0) scene.team[idx].hp = 0;
        }
      } else {
        scene.targetHp = 0;
      }
      logs.push(`${who}承受反噬，失去战斗能力`);
      scene.forceDefeatSide = side;
      scene.forceDefeatReason = "selfKo";
      return;
    }
    if (e.kind === "critStage") {
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const st = getSideState(scene, side);
      const prev = st.critStage || 0;
      const delta = Number(e.delta) || 0;
      if (delta !== 0 && hasStageGuard(scene, side, delta)) {
        const who = side === "attacker" ? scene.attackerName : scene.targetName;
        logs.push(`${who}的能力等级保护生效，属性变化被阻止。`);
        return;
      }
      st.critStage = clamp(prev + delta, -6, 6);
      if (st.critStage !== prev) {
        const who = side === "attacker" ? scene.attackerName : scene.targetName;
        logs.push(`${who}${delta >= 0 ? "提升" : "降低"}暴击等级${Math.abs(delta)}级`);
      }
      return;
    }
    if (e.kind === "setCritStage") {
      const side = sideByTarget(e.target || "self");
      const st = getSideState(scene, side);
      const value = clamp(Math.floor(Number(e.value) || 0), -6, 6);
      const previousValue = clamp(Math.floor(Number(st.critStage) || 0), -6, 6);
      if (value !== previousValue && hasStageGuard(scene, side, value - previousValue)) {
        const who = side === "attacker" ? scene.attackerName : scene.targetName;
        logs.push(`${who}的能力等级保护生效，属性变化被阻止。`);
        return;
      }
      st.critStage = value;
      const turns = Math.max(0, Math.floor(Number(e.turns) || 0));
      if (turns > 0) addTimedEffect(scene, side, { kind: "critStageHold", turns, data: { value, previousValue } });
      logs.push(`${side === "attacker" ? scene.attackerName : scene.targetName}暴击等级提升至${value}级${turns > 0 ? `，持续${turns}回合` : ""}`);
      return;
    }
    if (e.kind === "damageReduction") {
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const stackKey = normalize(e.stackKey);
      const maxStacks = Math.max(1, Math.floor(Number(e.maxStacks) || 0));
      if (e.stackable && stackKey && maxStacks > 0) {
        const state = getSideState(scene, side);
        const activeStacks = (state.timedEffects || []).filter((fx) => normalize(fx && fx.kind) === "damageReduction" && normalize(fx.data && fx.data.stackKey) === stackKey && Math.max(0, Number(fx && fx.turns) || 0) > 0);
        if (activeStacks.length >= maxStacks) {
          const who = side === "attacker" ? scene.attackerName : scene.targetName;
          logs.push(`${who}的减伤层数已达到${maxStacks}层上限。`);
          return;
        }
        addTimedEffect(scene, side, { kind: "damageReduction", turns: e.turns, data: { ratio: e.ratio, stackable: true, stackWithChallenge: !!e.stackWithChallenge, stackKey, stackIndex: activeStacks.length + 1 } });
      } else {
        addTimedEffect(scene, side, { kind: "damageReduction", turns: e.turns, data: { ratio: e.ratio, stackable: !!e.stackable, stackWithChallenge: !!e.stackWithChallenge } });
      }
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      logs.push(`${who}获得减伤${Math.round((Number(e.ratio) || 0) * 100)}%，持续${e.turns}回合`);
      return;
    }
    if (e.kind === "typedDamageReduction") {
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const turns = Math.max(1, Math.floor(Number(e.turns) || 1));
      const ratio = clamp(Number(e.ratio) || 0, 0.01, 0.95);
      const attackKind = normalize(e.attackKind) || "all";
      addTimedEffect(scene, side, { kind: "typedDamageReduction", turns, data: { ratio, attackKind } });
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      const attackLabel = attackKind === "physical" ? "普通攻击" : (attackKind === "special" ? "特殊攻击" : "攻击");
      logs.push(`${who}获得${attackLabel}减伤${Math.round(ratio * 100)}%，持续${turns}回合`);
      return;
    }
    if (e.kind === "damageBoost") {
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const turns = Math.max(1, Math.floor(Number(e.turns) || 1));
      const factor = Math.max(0.01, Number(e.factor) || 1);
      addTimedEffect(scene, side, { kind: "damageBoost", turns, data: { factor } });
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      logs.push(`${who}造成伤害提升${Math.round((factor - 1) * 100)}%，持续${turns}回合`);
      return;
    }
    if (e.kind === "damagePowerTransfer") {
      const selfSide = e.target === "opponent" ? (actor === "attacker" ? "target" : "attacker") : actor;
      const opponentSide = selfSide === "attacker" ? "target" : "attacker";
      const turns = Math.max(1, Math.floor(Number(e.turns) || 1));
      const ratio = clamp(Number(e.ratio) || 0.05, 0.01, 1);
      for (let i = 0; i < turns; i += 1) {
        addTimedEffect(scene, selfSide, { kind: "damagePowerTransfer", turns, data: { ratio, stack: i + 1 } });
        addTimedEffect(scene, opponentSide, { kind: "damagePowerDrainStack", turns, data: { ratio: -ratio, stack: i + 1 } });
      }
      logs.push(`${actorName}发动${skill.name}，每回合吸取对方伤害能力${Math.round(ratio * 100)}%，持续${turns}回合。`);
      return;
    }
    if (e.kind === "fatalDragonShadow") {
      const side = sideByTarget(e.target || "opponent");
      const turns = Math.max(1, Math.floor(Number(e.turns) || 1));
      const ratio = clamp(Number(e.ratio) || 0.05, 0.01, 1);
      const maxStacks = Math.max(1, Math.floor(Number(e.maxStacks) || 3));
      const stackKey = normalize(e.stackKey) || "fatalDragonShadow";
      addTimedEffect(scene, side, { kind: "fatalDragonShadow", turns, data: { ratio, owner: actor, maxStacks, stackKey } });
      logs.push(`${side === "attacker" ? scene.attackerName : scene.targetName}受到致命龙影影响，持续${turns}回合。`);
      return;
    }
    if (e.kind === "unharmedStageGuard") {
      const turnNo = Math.max(1, Math.floor(Number(scene && scene.turnCount) || 1));
      const damagedTurnKey = actor === "target" ? "targetDamagedTurn" : "attackerDamagedTurn";
      const wasDamaged = Math.max(0, Math.floor(Number(scene && scene[damagedTurnKey]) || 0)) === turnNo;
      if (wasDamaged) {
        logs.push(`${actorName}本回合已受到伤害，${skill.name}的保护效果未触发。`);
        return;
      }
      const turns = Math.max(1, Math.floor(Number(e.turns) || 1));
      const opponentSide = actor === "attacker" ? "target" : "attacker";
      addTimedEffect(scene, actor, { kind: "stageGuard", turns, data: { mode: normalize(e.selfMode) || "debuff" } });
      addTimedEffect(scene, opponentSide, { kind: "stageGuard", turns, data: { mode: normalize(e.opponentMode) || "buff" } });
      logs.push(`${actorName}出手时未受伤害，保护自身属性并锁定对方属性${turns}回合。`);
      return;
    }
    if (e.kind === "chancePowerMultiplier") {
      return;
    }
    if (e.kind === "nextPetFullRestore") {
      scene.nextPetFullRestore = true;
      logs.push(`${actorName}的下一只出场亚比将满状态回复。`);
      return;
    }
    if (e.kind === "damageShield") {
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const turns = Math.max(1, Math.floor(Number(e.turns) || 1));
      const amount = Math.max(1, Math.floor(Number(e.amount) || 1));
      addTimedEffect(scene, side, { kind: "damageShield", turns, data: { amount } });
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      logs.push(`${who}获得银光护盾，每次被攻击减少${amount}点伤害，持续${turns}回合`);
      return;
    }
    if (e.kind === "turnSequenceAttack") {
      const totalTurns = Math.max(1, Math.floor(Number(e.turns) || 1));
      if (totalTurns <= 1) return;
      const targetSide = sideByTarget(e.target || "opponent");
      addTimedEffect(scene, actor, {
        kind: "turnSequenceAttack",
        turns: totalTurns - 1,
        data: {
          targetSide,
          initialPower: Math.max(1, Number(skill.power) || 1),
          skill: {
            name: skill.name,
            type: skill.type,
            power: Math.max(1, Number(skill.power) || 1),
            accuracy: skill.accuracy,
            attackTypeCode: skill.attackTypeCode,
            attackTypeLabel: skill.attackTypeLabel
          },
          powerFactor: Math.max(1, Number(e.powerMultiplier) || 2),
          powerMultiplier: Math.max(1, Number(e.powerMultiplier) || 2),
          powerAdd: Math.max(0, Math.floor(Number(e.powerAdd) || 0)),
          elementShelterMultiplier: Math.max(1, Number(e.elementShelterMultiplier) || 1),
          resetOnFail: Boolean(e.resetOnFail),
          keepOnMiss: Boolean(e.keepOnMiss),
          doneTurns: 1
        }
      });
      logs.push(`${actorName}发动${skill.name}，接下来${totalTurns - 1}回合将自动继续使用该技能。`);
      return;
    }
    if (e.kind === "damageShieldByDamage") {
      if (!didHit) return;
      const baseDamage = Math.max(0, Number(scene.lastDamage) || 0);
      if (baseDamage <= 0) return;
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const turns = Math.max(1, Math.floor(Number(e.turns) || 1));
      const ratio = clamp(Number(e.ratio) || 0, 0.01, 3);
      const amount = Math.max(1, Math.floor(baseDamage * ratio));
      addTimedEffect(scene, side, { kind: "damageShieldByDamage", turns, data: { amount } });
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      logs.push(`${who}将本次伤害的${Math.round(ratio * 100)}%转化为护盾，可抵抗${amount}点伤害，持续${turns}回合`);
      return;
    }
    if (e.kind === "timedStage") {
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const turns = Math.max(1, Math.floor(Number(e.turns) || 1));
      const keys = Array.isArray(e.keys) ? e.keys.slice() : [];
      const delta = Math.floor(Number(e.delta) || 0);
      if (keys.length <= 0 || delta === 0) return;
      addTimedEffect(scene, side, { kind: "timedStage", turns, data: { keys, delta } });
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      logs.push(`${who}获得每回合${delta > 0 ? "提升" : "降低"}能力等级效果，持续${turns}回合`);
      return;
    }
    if (e.kind === "timedRandomStage") {
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const turns = Math.max(1, Math.floor(Number(e.turns) || 1));
      const keys = Array.isArray(e.keys) ? e.keys.slice() : [];
      const pick = Math.max(1, Math.floor(Number(e.pick) || 1));
      const delta = Math.floor(Number(e.delta) || 0);
      if (keys.length <= 0 || delta === 0) return;
      addTimedEffect(scene, side, { kind: "timedRandomStage", turns, data: { keys, pick, delta } });
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      logs.push(`${who}获得每回合随机${delta > 0 ? "提升" : "降低"}能力等级效果，持续${turns}回合`);
      return;
    }
    if (e.kind === "endTurnStageAndStatusChance") {
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const turns = Math.max(1, Math.floor(Number(e.turns) || 1));
      const keys = Array.isArray(e.keys) ? e.keys.slice() : [];
      const delta = Math.floor(Number(e.delta) || 0);
      const chance = clamp(Number(e.chance) || 0, 0, 1);
      const status = normalize(e.status);
      const statusTurns = Math.max(1, Math.floor(Number(e.statusTurns) || defaultStatusTurns(status)));
      addTimedEffect(scene, side, { kind: "endTurnStageAndStatusChance", turns, data: { keys, delta, chance, status, statusTurns } });
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      logs.push(`${who}获得回合末概率强化效果，持续${turns}回合`);
      return;
    }
    if (e.kind === "endTurnStageChance") {
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const turns = Math.max(1, Math.floor(Number(e.turns) || 1));
      const chance = clamp(Number(e.chance) || 0, 0, 1);
      const changes = Array.isArray(e.changes) ? e.changes.map((row) => ({
        keys: Array.isArray(row && row.keys) ? row.keys.slice() : [],
        delta: Math.floor(Number(row && row.delta) || 0)
      })).filter((row) => row.keys.length > 0 && row.delta !== 0) : [];
      if (changes.length <= 0) return;
      addTimedEffect(scene, side, { kind: "endTurnStageChance", turns, data: { chance, changes } });
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      logs.push(`${who}获得回合末概率能力变化效果，持续${turns}回合`);
      return;
    }
    if (e.kind === "endTurnClearStageChance") {
      const side = e.target === "opponent" ? (actor === "attacker" ? "target" : "attacker") : actor;
      const turns = Math.max(1, Math.floor(Number(e.turns) || 1));
      const chance = clamp(Number(e.chance) || 0, 0, 1);
      const targets = Array.isArray(e.targets) && e.targets.length > 0 ? e.targets.map(normalize).filter(Boolean) : [normalize(e.target) || "self"];
      const mode = normalize(e.mode) || "all";
      const keys = Array.isArray(e.keys) && e.keys.length > 0 ? e.keys.slice() : ALL_ABILITY_STAGE_KEYS.slice();
      addTimedEffect(scene, side, { kind: "endTurnClearStageChance", turns, data: { chance, targets, mode, keys, owner: actor } });
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      logs.push(`${who}获得回合末概率清除属性效果，持续${turns}回合`);
      return;
    }
    if (e.kind === "lastStand") {
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      addTimedEffect(scene, side, { kind: "lastStand", turns: Math.max(1, Math.floor(Number(e.turns) || 1)), data: {} });
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      logs.push(`${who}获得不灭的意志，本回合受到致命伤害时至少保留1点体力。`);
      return;
    }
    if (e.kind === "timedHeal") {
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      addTimedEffect(scene, side, { kind: "healOverTime", turns: e.turns, data: { ratio: e.ratio } });
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      logs.push(`${who}获得持续回血效果，持续${e.turns}回合`);
      return;
    }
    if (e.kind === "endTurnHealFlat") {
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const amount = Math.max(1, Math.floor(Number(e.amount) || 1));
      const turns = Math.max(1, Math.floor(Number(e.turns) || defaultStatusTurns("sleep")));
      if (side === "attacker" && e.teamWide && Array.isArray(scene.team)) {
        if (!Array.isArray(scene.teamTimedEffects)) scene.teamTimedEffects = [];
        scene.teamTimedEffects.push(createTeamTimedEffect({ kind: "endTurnHealFlat", turns, data: { amount } }, scene.currentAttackerId));
      } else {
        addTimedEffect(scene, side, { kind: "endTurnHealFlat", turns, data: { amount } });
      }
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      logs.push(`${who}获得回合结束回复效果：回复${amount}点体力，持续${turns}回合${e.teamWide ? "，替换亚比有效" : ""}`);
      return;
    }
    if (e.kind === "endTurnHealFlatRange") {
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const min = Math.max(1, Math.floor(Number(e.min) || 1));
      const max = Math.max(min, Math.floor(Number(e.max) || min));
      const turns = Math.max(1, Math.floor(Number(e.turns) || 1));
      addTimedEffect(scene, side, { kind: "endTurnHealFlatRange", turns, data: { min, max } });
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      logs.push(`${who}获得回合结束回复效果：回复${min}~${max}点体力，持续${turns}回合`);
      return;
    }
    if (e.kind === "endTurnSetHpToOne") {
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const turns = Math.max(1, Math.floor(Number(e.turns) || 1));
      addTimedEffect(scene, side, { kind: "endTurnSetHpToOne", turns, data: {} });
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      logs.push(`${who}将在回合结束时体力降至1点。`);
      return;
    }
    if (e.kind === "endTurnHealByLostHp") {
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const lostAdd = Math.max(0, Math.floor(Number(e.lostAdd) || 0));
      const multiplier = Math.max(1, Math.floor(Number(e.multiplier) || 1));
      const turns = Math.max(1, Math.floor(Number(e.turns) || 1));
      addTimedEffect(scene, side, { kind: "endTurnHealByLostHp", turns, data: { lostAdd, multiplier } });
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      logs.push(`${who}获得战魂回血效果，持续${turns}回合`);
      return;
    }
    if (e.kind === "attackImmunity") {
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const attackKind = normalize(e.attackKind) || "all";
      const chance = clamp(Number(e.chance) || 1, 0, 1);
      const exceptElements = Array.isArray(e.exceptElements) ? e.exceptElements.map(normalize).filter(Boolean) : [];
      addTimedEffect(scene, side, { kind: "attackImmunity", turns: e.turns, data: { attackKind, chance, exceptElements } });
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      const attackLabel = attackKind === "physical" ? "普通攻击" : (attackKind === "special" ? "特殊攻击" : "攻击");
      const exceptText = exceptElements.length > 0 ? `（${exceptElements.join("、")}除外）` : "";
      logs.push(`${who}获得${Math.round(chance * 100)}%概率免受${attackLabel}伤害${exceptText}，持续${e.turns}回合`);
      return;
    }
    if (e.kind === "damageReflect") {
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const turns = Math.max(1, Math.floor(Number(e.turns) || 1));
      const attackKind = normalize(e.attackKind) || "all";
      const ratio = Math.max(0.01, Number(e.ratio) || 1);
      addTimedEffect(scene, side, {
        kind: "damageReflect",
        turns,
        data: { attackKind, ratio, consumeOnTrigger: Boolean(e.consumeOnTrigger), label: normalize(e.label) }
      });
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      const attackLabel = attackKind === "physical" ? "普通攻击" : (attackKind === "special" ? "特殊攻击" : "攻击");
      logs.push(`${who}获得${attackLabel}伤害反弹效果，持续${turns}回合`);
      return;
    }
    if (e.kind === "damageReflectFlat") {
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const turns = Math.max(1, Math.floor(Number(e.turns) || 1));
      const attackKind = normalize(e.attackKind) || "all";
      const amount = Math.max(1, Math.floor(Number(e.amount) || 1));
      addTimedEffect(scene, side, { kind: "damageReflectFlat", turns, data: { attackKind, amount } });
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      logs.push(`${who}获得固定伤害反弹效果，持续${turns}回合`);
      return;
    }
    if (e.kind === "statusShield") {
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const turns = Math.max(1, Math.floor(Number(e.turns) || 1));
      addTimedEffect(scene, side, { kind: "statusShield", turns, data: { status: normalize(e.status) || "all" } });
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      logs.push(`${who}获得异常状态免疫，持续${turns}回合`);
      return;
    }
    if (e.kind === "diminishingAttackImmunity") {
      const gate = rollDiminishingSkillSuccess(scene, actor, skill);
      const who = actor === "attacker" ? scene.attackerName : scene.targetName;
      logs.push(`${who}使用${skill.name}第${gate.useNo}次，成功率${Math.round(gate.chance * 100)}%。`);
      if (!gate.success) {
        logs.push(`${skill.name}发动失败。`);
        return;
      }
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const attackKind = normalize(e.attackKind) || "all";
      addTimedEffect(scene, side, { kind: "attackImmunity", turns: Math.max(1, Math.floor(Number(e.turns) || 1)), data: { attackKind, chance: 1 } });
      logs.push(`${who}进入消失状态，本回合免受攻击伤害。`);
      return;
    }
    if (e.kind === "diminishingDamageAbsorb") {
      const gate = rollDiminishingSkillSuccess(scene, actor, skill);
      const who = actor === "attacker" ? scene.attackerName : scene.targetName;
      logs.push(`${who}使用${skill.name}第${gate.useNo}次，成功率${Math.round(gate.chance * 100)}%。`);
      if (!gate.success) {
        logs.push(`${skill.name}发动失败。`);
        return;
      }
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      addTimedEffect(scene, side, { kind: "damageAbsorb", turns: Math.max(1, Math.floor(Number(e.turns) || 1)), data: {} });
      logs.push(`${who}进入混沌吸收状态，本回合吸收受到的伤害并回复体力。`);
      return;
    }
    if (e.kind === "stageGuard") {
      if (e.requireHit && !didHit) return;
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const mode = normalize(e.mode) || "debuff";
      addTimedEffect(scene, side, { kind: "stageGuard", turns: e.turns, data: { mode } });
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      const label = mode === "buff" ? "提升" : (mode === "all" ? "变化" : "削弱");
      logs.push(`${who}获得能力等级保护，属性能力等级不会被${label}，持续${e.turns}回合`);
      return;
    }
    if (e.kind === "globalStageGuard") {
      if (e.requireHit && !didHit) return;
      const turns = Math.max(1, Math.floor(Number(e.turns) || 1));
      const mode = normalize(e.mode) || "all";
      if (!Array.isArray(scene.globalTimedEffects)) scene.globalTimedEffects = [];
      const next = { kind: "globalStageGuard", turns, data: { mode } };
      const idx = scene.globalTimedEffects.findIndex((fx) => normalize(fx && fx.kind) === "globalStageGuard");
      if (idx >= 0) scene.globalTimedEffects[idx] = next;
      else scene.globalTimedEffects.push(next);
      const label = mode === "buff" ? "提升" : (mode === "debuff" ? "降低" : "提升或降低");
      logs.push(`全场属性等级被锁定，无法${label}，持续${turns}回合`);
      return;
    }
    if (e.kind === "mirrorOpponentStageBoost") {
      if (e.requireHit && !didHit) return;
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const turns = Math.max(1, Math.floor(Number(e.turns) || 1));
      const multiplier = Math.max(1, Math.floor(Number(e.multiplier) || 1));
      addTimedEffect(scene, side, { kind: "mirrorOpponentStageBoost", turns, data: { multiplier } });
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      const action = multiplier > 1 ? "翻倍同步对方提升的能力等级" : "同步对方提升的能力等级";
      logs.push(`${who}获得${action}效果，持续${turns}回合`);
      return;
    }
    if (e.kind === "onDamagedAllStatDown") {
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      addOnDamagedEffect(scene, side, { turns: e.turns, chance: e.chance, allStatsDelta: e.delta });
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      logs.push(`${who}获得受击反制效果，持续${e.turns}回合`);
      return;
    }
    if (e.kind === "onDamagedStage" || e.kind === "onDamagedStatus") {
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      addOnDamagedEffect(scene, side, {
        kind: e.kind === "onDamagedStatus" ? "status" : "stage",
        turns: e.turns,
        chance: e.chance,
        status: e.status,
        statusTurns: e.statusTurns,
        keys: Array.isArray(e.keys) ? e.keys.slice() : [],
        delta: Number(e.delta) || 0,
        applyTo: normalize(e.applyTo) === "self" ? "self" : "attacker",
        trigger: normalize(e.trigger) === "attacked" ? "attacked" : "damaged",
        triggerOncePerTurn: Boolean(e.triggerOncePerTurn),
        persistUntilTrigger: Boolean(e.persistUntilTrigger),
        consumeOnTrigger: Boolean(e.consumeOnTrigger),
        label: normalize(e.label)
      });
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      const applyToWho = normalize(e.applyTo) === "self" ? "自身" : "攻击方";
      const durationText = e.persistUntilTrigger ? (normalize(e.trigger) === "attacked" ? "直到受到攻击后触发" : "直到受到伤害后触发") : `持续${e.turns}回合`;
      logs.push(`${who}获得${normalize(e.label) || "受击触发效果"}，受击时使${applyToWho}${(Number(e.delta) || 0) >= 0 ? "提升" : "降低"}能力，${durationText}`);
      return;
    }
    if (e.kind === "delayedStage") {
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      addTimedEffect(scene, side, {
        kind: "delayedStage",
        turns: Math.max(1, Math.floor(Number(e.turns) || 1)),
        data: {
          keys: Array.isArray(e.keys) ? e.keys.slice() : [],
          delta: Number(e.delta) || 0
        }
      });
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      logs.push(`${who}进入延时强化状态：${e.turns}回合后触发能力变化`);
      return;
    }
    if (e.kind === "globalElementPower") {
      if (!Array.isArray(scene.globalTimedEffects)) scene.globalTimedEffects = [];
      const next = {
        kind: "elementPowerBuff",
        turns: Math.max(1, Math.floor(Number(e.turns) || 1)),
        data: { element: e.element, factor: Number(e.factor) || 1 }
      };
      const idx = scene.globalTimedEffects.findIndex((fx) => normalize(fx && fx.kind) === next.kind
        && normalize(fx && fx.data && fx.data.element) === normalize(next.data.element)
        && Number(fx && fx.data && fx.data.factor) === Number(next.data.factor));
      if (idx >= 0) scene.globalTimedEffects[idx] = next;
      else scene.globalTimedEffects.push(next);
      logs.push(`全场${e.element}技能威力调整为${Math.round((Number(e.factor) || 1) * 100)}%，持续${e.turns}回合`);
      return;
    }
    if (e.kind === "elementDamageReduction") {
      const side = sideByTarget(e.target || "self");
      const turns = Math.max(1, Math.floor(Number(e.turns) || 1));
      const ratio = clamp(Number(e.ratio) || 0.5, 0, 0.95);
      const element = normalizeElementName(e.element) || "all";
      addTimedEffect(scene, side, { kind: "elementDamageReduction", turns, data: { element, ratio } });
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      const label = element === "all" ? "受到的技能伤害" : `受到的${element}系攻击伤害`;
      logs.push(`${who}${label}降低${Math.round(ratio * 100)}%，持续${turns}回合`);
      return;
    }
    if (e.kind === "elementChange") {
      const side = sideByTarget(e.target || "self");
      const turns = Math.max(1, Math.floor(Number(e.turns) || 1));
      const element = normalizeElementName(e.element);
      if (!element) return;
      addTimedEffect(scene, side, { kind: "elementChange", turns, data: { element } });
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      logs.push(`${who}临时变为${element}系，持续${turns}回合`);
      return;
    }
    if (e.kind === "mutualEndTurnDamageFlat") {
      const amount = Math.max(1, Math.floor(Number(e.amount) || 1));
      const turns = Math.max(1, Math.floor(Number(e.turns) || 1));
      ["attacker", "target"].forEach((side) => {
        addTimedEffect(scene, side, { kind: "mutualEndTurnDamageFlat", turns, data: { amount, label: skill.name } });
      });
      logs.push(`${skill.name}弥漫全场，双方每回合受到${amount}点伤害，持续${turns}回合。`);
      return;
    }
    if (e.kind === "defenseHalve") {
      if (!didHit) return;
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const st = getSideState(scene, side);
      const exists = (st.timedEffects || []).some((fx) => normalize(fx && fx.kind) === "defenseHalve");
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      if (exists) {
        logs.push(`${who}已处于防御减半状态（不可叠加）`);
        return;
      }
      addTimedEffect(scene, side, { kind: "defenseHalve", turns: Math.max(1, Math.floor(Number(e.turns) || 10)), data: {} });
      logs.push(`${who}陷入防御减半状态（不可叠加）`);
      return;
    }
    if (e.kind === "diceDrain") {
      if (!didHit) return;
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const caster = actor;
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      const casterName = caster === "attacker" ? scene.attackerName : scene.targetName;
      const pip = 1 + Math.floor(Math.random() * 6);
      const amountPerPip = Math.max(1, Math.floor(Number(e.amountPerPip) || 30));
      const label = normalize(e.label) || normalize(skill && skill.name) || "骰子炸弹";
      const turns = Math.max(1, Math.floor(Number(e.turns) || 5));
      addTimedEffect(scene, side, {
        kind: "diceDrain",
        turns,
        data: {
          caster,
          pip,
          amountPerPip,
          label
        }
      });
      logs.push(`${casterName}使用${label}投掷出${pip}点，${who}将在${turns}回合内每回合被吸取${pip * amountPerPip}点体力。`);
    }
    if (e.kind === "forceRandomSwitch") {
      if (!didHit && e.requireHit !== false) return;
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const chance = Number.isFinite(Number(e.chance)) ? Number(e.chance) : 1;
      if (Math.random() > chance) return;
      forceRandomBattleSwitch(scene, side);
    }
    if (e.kind === "lockGodSeal") {
      if (!didHit) return;
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const caster = actor;
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      const turns = Math.max(1, Math.floor(Number(e.turns) || 5));
      const ratio = clamp(Number(e.ratio) || (1 / 16), 0.01, 1);
      const speedDelta = -Math.max(1, Math.floor(Math.abs(Number(e.speedDelta) || 1)));
      const label = normalize(e.label) || "锁神诀";
      addTimedEffect(scene, side, {
        kind: "lockGodDrain",
        turns,
        data: { caster, ratio, label }
      });
      const changed = applyStageDelta(scene, side, ["speed"], speedDelta);
      logs.push(`${who}受到${label}影响，${turns}回合内每回合扣除最大体力值的1/16。`);
      if (changed.length > 0) logs.push(`${who}降低${Math.abs(speedDelta)}级：${changed.map((k) => battleStatLabel(k)).join("、")}`);
      return;
    }
    if (e.kind === "lockGodDrain") {
      if (!didHit) return;
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const caster = actor;
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      const turns = Math.max(1, Math.floor(Number(e.turns) || 5));
      const ratio = clamp(Number(e.ratio) || (1 / 16), 0.01, 1);
      const label = normalize(e.label) || "锁神诀";
      addTimedEffect(scene, side, {
        kind: "lockGodDrain",
        turns,
        data: { caster, ratio, flat: Math.max(0, Math.floor(Number(e.flat) || 0)), label }
      });
      if (Math.max(0, Math.floor(Number(e.flat) || 0)) > 0) {
        logs.push(`${who}受到${label}影响，${turns}回合内每回合扣除${Math.max(1, Math.floor(Number(e.flat) || 0))}点体力。`);
      } else {
        logs.push(`${who}受到${label}影响，${turns}回合内每回合扣除最大体力值的${Math.round(ratio * 10000) / 100}%。`);
      }
    }
    if (e.kind === "flatDrain") {
      if (!didHit) return;
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const ratio = Number(e.ratio) || 0;
      const maxHp = Math.max(1, side === "attacker" ? Number(scene.attackerMaxHp) || 1 : Number(scene.targetMaxHp) || 1);
      const amount = ratio > 0 ? Math.max(1, Math.floor(maxHp * clamp(ratio, 0.01, 1))) : Math.max(1, Math.floor(Number(e.amount) || 1));
      const turns = Math.max(1, Math.floor(Number(e.turns) || 1));
      const label = normalize(e.label) || skill.name;
      addTimedEffect(scene, side, { kind: "flatDrain", turns, data: { caster: actor, amount, ratio, label } });
      logs.push(`${side === "attacker" ? scene.attackerName : scene.targetName}受到${label}影响，${turns}回合内每回合被吸取${amount}点体力。`);
    }
    if (e.kind === "leaveOneHp") {
      if (!didHit) return;
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const hpKey = side === "attacker" ? "attackerHp" : "targetHp";
      if (Number(scene[hpKey]) <= 0) scene[hpKey] = 1;
      logs.push(`${side === "attacker" ? scene.attackerName : scene.targetName}因${skill.name}至少保留1点体力。`);
    }
    if (e.kind === "dragonBaseBoost") {
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const st = getSideState(scene, side);
      const maxStacks = Math.max(1, Math.floor(Number(e.maxStacks) || 5));
      const currentStacks = clamp(Math.floor(Number(st.dragonBaseBoostStacks) || 0), 0, maxStacks);
      if (currentStacks >= maxStacks) {
        logs.push(`${side === "attacker" ? scene.attackerName : scene.targetName}的龙腾四海强化已达到上限（${maxStacks}/${maxStacks}）。`);
        return;
      }
      st.dragonBaseBoostStacks = currentStacks + 1;
      if (!st.baseBoost || typeof st.baseBoost !== "object") st.baseBoost = { atk: 0, def: 0, spAtk: 0, spDef: 0, speed: 0 };
      const ability = side === "attacker" ? scene.attackerAbility : scene.targetAbility;
      const ratio = Math.max(0.01, Number(e.ratio) || 0.1);
      const keys = ["atk", "def", "spAtk", "spDef", "speed"];
      const changed = [];
      keys.forEach((key) => {
        const base = Math.max(1, Number(ability && ability[key]) || 1);
        const add = Math.max(1, Math.floor(base * ratio));
        st.baseBoost[key] = Math.max(0, Math.floor(Number(st.baseBoost[key]) || 0) + add);
        changed.push(`${battleStatLabel(key)}+${add}`);
      });
      logs.push(`${side === "attacker" ? scene.attackerName : scene.targetName}获得龙腾四海基础数值强化（${st.dragonBaseBoostStacks}/${maxStacks}）：${changed.join("、")}。`);
    }
  });
  if (logs.length > 0) {
    logs.forEach((line) => pushBattleLog(scene, line));
  }
  return logs;
};
const runOnDamagedEffects = (scene, damagedSide, attackerSide, options = {}) => {
  const reason = normalize(options && options.reason) || "damaged";
  if (scene && reason === "attacked") {
    const turnNo = Math.max(1, Math.floor(Number(scene.turnCount) || 1));
    if (damagedSide === "target") scene.targetAttackedTurn = turnNo;
    else scene.attackerAttackedTurn = turnNo;
  }
  if (scene && reason === "damaged") {
    const turnNo = Math.max(1, Math.floor(Number(scene.turnCount) || 1));
    if (damagedSide === "target") scene.targetDamagedTurn = turnNo;
    else scene.attackerDamagedTurn = turnNo;
  }
  const state = getSideState(scene, damagedSide);
  const effects = Array.isArray(state.onDamagedEffects) ? state.onDamagedEffects : [];
  const consumeTriggeredEffect = (effect) => {
    if (!effect || !effect.consumeOnTrigger) return;
    effect.turns = 0;
    const idx = effects.indexOf(effect);
    if (idx >= 0) effects.splice(idx, 1);
  };
  effects.slice().forEach((e) => {
    const trigger = normalize(e && e.trigger) || "damaged";
    if (trigger === "attacked" && reason !== "attacked") return;
    if (trigger === "damaged" && reason !== "damaged") return;
    const turnNo = Math.max(1, Math.floor(Number(scene && scene.turnCount) || 1));
    if (e.triggerOncePerTurn && Math.max(0, Math.floor(Number(e.lastTriggeredTurn) || 0)) === turnNo) return;
    if (Math.random() > (Number(e.chance) || 0)) return;
    if (e.triggerOncePerTurn) e.lastTriggeredTurn = turnNo;
    if (normalize(e.kind) === "status") {
      const status = normalize(e.status);
      if (!status) return;
      const appliedSide = normalize(e.applyTo) === "self" ? damagedSide : attackerSide;
      if (isGuardianBossProtectedTarget(scene, appliedSide)) {
        const victim = appliedSide === "attacker" ? scene.attackerName : scene.targetName;
        pushBattleLog(scene, `${victim}免疫异常状态。`);
        return;
      }
      if (isStatusImmuneByElement(scene, appliedSide, status) || hasStatusShield(scene, appliedSide, status)) return;
      const targetState = getSideState(scene, appliedSide);
      applyStatusTurns(targetState, status, e.statusTurns);
      const owner = damagedSide === "attacker" ? scene.attackerName : scene.targetName;
      const victim = appliedSide === "attacker" ? scene.attackerName : scene.targetName;
      pushBattleLog(scene, `${owner}触发反制效果，${victim}陷入${statusLabel(status)}${targetState.statuses[status]}回合`);
      consumeTriggeredEffect(e);
      return;
    }
    let changed = [];
    let appliedSide = attackerSide;
    if (Array.isArray(e.keys) && e.keys.length > 0 && Number(e.delta) !== 0) {
      appliedSide = normalize(e.applyTo) === "self" ? damagedSide : attackerSide;
      changed = applyStageDelta(scene, appliedSide, e.keys, Number(e.delta));
    } else if ((Number(e.allStatsDelta) || 0) !== 0) {
      appliedSide = attackerSide;
      changed = applyStageDelta(scene, attackerSide, ALL_ABILITY_STAGE_KEYS, Number(e.allStatsDelta));
    } else {
      return;
    }
    if (changed.length === 0) {
      consumeTriggeredEffect(e);
      return;
    }
    const owner = damagedSide === "attacker" ? scene.attackerName : scene.targetName;
    const victim = appliedSide === "attacker" ? scene.attackerName : scene.targetName;
    const d = Array.isArray(e.keys) && e.keys.length > 0 ? Number(e.delta) : Number(e.allStatsDelta);
    const label = normalize(e && e.label) || "反制效果";
    pushBattleLog(scene, `${owner}触发${label}，${victim}${d < 0 ? "下降" : "提升"}${Math.abs(d)}级：${changed.map((k) => battleStatLabel(k)).join("、")}`);
    consumeTriggeredEffect(e);
  });
  cleanupExpiredEffects(state);
};
const beforeActionCheck = (scene, side) => {
  const state = getSideState(scene, side);
  const actorName = side === "attacker" ? scene.attackerName : scene.targetName;
  if (state.statuses.fear > 0) {
    state.statuses.fear = Math.max(0, Number(state.statuses.fear) - 1);
    return { canAct: false, log: `${actorName}陷入害怕，本回合无法行动。` };
  }
  if (state.skipTurns > 0) {
    state.skipTurns -= 1;
    return { canAct: false, log: `${actorName}本回合无法行动。` };
  }
  const seal = (state.timedEffects || []).find((e) => normalize(e && e.kind) === "skillSealChance" && Math.max(0, Number(e && e.turns) || 0) > 0);
  if (seal) {
    const chance = clamp(Number(seal.data && seal.data.chance) || 0, 0, 1);
    if (Math.random() <= chance) {
      return { canAct: false, log: `${actorName}受冰封禁制影响，本回合无法使用技能。` };
    }
  }
  if (state.statuses.sleep > 0) {
    state.statuses.sleep -= 1;
    return { canAct: false, log: `${actorName}陷入睡眠，无法行动。` };
  }
  if (state.statuses.freeze > 0) {
    return { canAct: true, log: "" };
  }
  if (state.statuses.paralyze > 0) {
    state.statuses.paralyze = Math.max(0, state.statuses.paralyze - 1);
    if (Math.random() < 0.5) return { canAct: false, log: `${actorName}麻痹，行动失败。` };
  }
  return { canAct: true, log: "" };
};
const clearSleepAfterDamage = (scene, side) => {
  const state = getSideState(scene, side);
  if (Math.max(0, Number(state.statuses.sleep) || 0) <= 0) return false;
  state.statuses.sleep = 0;
  const actorName = side === "attacker" ? scene.attackerName : scene.targetName;
  pushBattleLog(scene, `${actorName}受到伤害，睡眠解除。`);
  return true;
};
const applyTurnSequenceAttackEffects = (scene, side) => {
  return 0;
};
const getQixingSealLevelFromScene = (scene, side) => {
  const levelKey = side === "attacker" ? "attackerQixingSealLevel" : "targetQixingSealLevel";
  return clamp(Math.floor(Number(scene && scene[levelKey]) || 1), 1, QIXING_SEAL_MAX_LEVEL);
};
const getQixingSealTraitKeyFromScene = (scene, side) => {
  const key = side === "attacker" ? scene && scene.attackerQixingSealTraitKey : scene && scene.targetQixingSealTraitKey;
  return normalizeQixingTraitKey(key);
};
const pushQixingSealBattleEntryLog = (scene, side) => {
  if (!scene) return false;
  const itemId = side === "attacker" ? scene.attackerBattleItemId : scene.targetBattleItemId;
  if (normalize(itemId) !== QIXING_SEAL_ITEM_ID) return false;
  const level = getQixingSealLevelFromScene(scene, side);
  const traitKey = getQixingSealTraitKeyFromScene(scene, side);
  const meta = getQixingTraitMetaByKey(traitKey);
  const rule = getQixingTraitBattleRuleByKey(traitKey, level);
  const actorName = side === "attacker" ? scene.attackerName : scene.targetName;
  const chanceText = `${Math.round(clamp(Number(rule.chance) || 0, 0, 1) * 100)}%`;
  const fixedEffects = [];
  if (Number(rule.damageBonus) > 0) fixedEffects.push(`伤害加成+${Math.round(Number(rule.damageBonus) * 100)}%`);
  if (Number(rule.resistance) > 0) fixedEffects.push(`伤害抗性+${Math.round(Number(rule.resistance) * 100)}%`);
  const stageKeys = Array.isArray(rule.keys) && rule.keys.length > 0 ? rule.keys.filter((k) => ALL_ABILITY_STAGE_KEYS.includes(k)) : [];
  const stageText = stageKeys.length > 0
    ? `${chanceText}概率提升${stageKeys.map((k) => battleStatLabel(k)).join("、")}各1级`
    : `${chanceText}概率提升${Math.max(1, Math.floor(Number(rule.count) || 1))}项能力1级`;
  pushBattleLog(scene, `${actorName}装配${meta.name}Lv.${level}：${fixedEffects.concat(stageText).join("，")}。`);
  return true;
};
const applyQixingSealEffect = (scene, side) => {
  if (!scene) return false;
  const itemId = side === "attacker" ? scene.attackerBattleItemId : scene.targetBattleItemId;
  if (normalize(itemId) !== QIXING_SEAL_ITEM_ID) return false;
  const level = getQixingSealLevelFromScene(scene, side);
  const traitKey = getQixingSealTraitKeyFromScene(scene, side);
  const meta = getQixingTraitMetaByKey(traitKey);
  const rule = getQixingTraitBattleRuleByKey(traitKey, level);
  const chance = clamp(Number(rule.chance) || 0, 0, 1);
  if (chance <= 0 || Math.random() >= chance) return false;
  const stageKeys = Array.isArray(rule.keys) && rule.keys.length > 0 ? rule.keys.filter((k) => ALL_ABILITY_STAGE_KEYS.includes(k)) : [];
  const keys = stageKeys.length > 0 ? stageKeys : ALL_ABILITY_STAGE_KEYS.slice();
  const picked = stageKeys.length > 0
    ? keys
    : (Number(rule.count) >= ALL_ABILITY_STAGE_KEYS.length
      ? keys
      : keys.sort(() => Math.random() - 0.5).slice(0, Math.max(1, Math.floor(Number(rule.count) || 1))));
  const changed = applyStageDelta(scene, side, picked, 1);
  const actorName = side === "attacker" ? scene.attackerName : scene.targetName;
  showBattleMoraleStatusFx(scene, side, traitKey, meta.name);
  showBattleActionNotice(scene, side, meta.name);
  if (changed.length <= 0) {
    const targetText = picked.map((k) => battleStatLabel(k)).filter(Boolean).join("、") || "对应能力";
    pushBattleLog(scene, `${actorName}的${meta.name}Lv.${level}发动，但${targetText}已达上限或受保护，能力等级未变化。`);
    return true;
  }
  pushBattleLog(scene, `${actorName}的${meta.name}Lv.${level}发动，提升1级：${changed.map((k) => battleStatLabel(k)).join("、")}。`);
  return true;
};
const applyEndTurnStatus = (scene, side) => {
  const state = getSideState(scene, side);
  const actorName = side === "attacker" ? scene.attackerName : scene.targetName;
  const hpKey = side === "attacker" ? "attackerHp" : "targetHp";
  const maxHpKey = side === "attacker" ? "attackerMaxHp" : "targetMaxHp";
  const oppSide = side === "attacker" ? "target" : "attacker";
  const oppName = side === "attacker" ? scene.targetName : scene.attackerName;
  const oppHpKey = side === "attacker" ? "targetHp" : "attackerHp";
  const oppMaxHpKey = side === "attacker" ? "targetMaxHp" : "attackerMaxHp";
  let totalDamage = 0;
  let totalHealSelf = 0;
  let totalHealOpp = 0;
  let damageStatusTriggered = false;
  const triggeredStatuses = [];
  const maxHp = Math.max(1, Number(scene[maxHpKey]) || 1);
  applyTurnSequenceAttackEffects(scene, side);
  ["sleep", "paralyze", "confuse", "fear"].forEach((status) => {
    if (Math.max(0, Number(state.statuses[status]) || 0) > 0) {
      triggeredStatuses.push({ status, label: STATUS_LABEL_MAP[status] || status });
    }
  });
  if (state.statuses.confuse > 0) {
    state.statuses.confuse = Math.max(0, Number(state.statuses.confuse) - 1);
  }
  const applyDot = (status, ratio, label) => {
    if (state.statuses[status] <= 0) return 0;
    triggeredStatuses.push({ status, label });
    const dmg = Math.max(1, Math.floor(maxHp * ratio));
    const actual = Math.min(dmg, Math.max(0, Number(scene[hpKey]) || 0));
    scene[hpKey] = Math.max(0, (Number(scene[hpKey]) || 0) - dmg);
    state.statuses[status] = Math.max(0, state.statuses[status] - 1);
    totalDamage += actual;
    if (actual > 0) damageStatusTriggered = true;
    pushBattleLog(scene, `${actorName}受到${label}伤害 ${actual}`);
    return actual;
  };
  if (state.statuses.poison > 0) {
    applyDot("poison", 1 / 8, "中毒");
  }
  if (state.statuses.burn > 0) {
    applyDot("burn", 1 / 8, "烧伤");
  }
  if (state.statuses.freeze > 0) {
    applyDot("freeze", 1 / 8, "冰冻");
  }
  if (state.statuses.bind > 0) {
    applyDot("bind", 1 / 16, "束缚");
  }
  if (state.statuses.weak > 0) {
    const elapsed = clamp(4 - Math.max(1, Number(state.statuses.weak) || 1), 0, 3);
    const ratios = [0.25, 0.18, 0.12, 0.07];
    applyDot("weak", ratios[elapsed] || 0.07, "衰弱");
  }
  if (state.statuses.leech > 0) {
    triggeredStatuses.push({ status: "leech", label: "寄生" });
    const dmg = Math.max(1, Math.floor(maxHp * 0.1));
    const actual = Math.min(dmg, Math.max(0, Number(scene[hpKey]) || 0));
    scene[hpKey] = Math.max(0, (Number(scene[hpKey]) || 0) - dmg);
    state.statuses.leech = Math.max(0, state.statuses.leech - 1);
    totalDamage += actual;
    if (actual > 0) damageStatusTriggered = true;
    pushBattleLog(scene, `${actorName}受到寄生吸取 ${actual}`);
    if (side === "attacker") scene.damageOnAttacker = `-${actual}`;
    else scene.damageOnTarget = `-${actual}`;
    if (actual > 0) {
      const healToOpp = Math.min(actual, Math.max(0, (Number(scene[oppMaxHpKey]) || 0) - (Number(scene[oppHpKey]) || 0)));
      scene[oppHpKey] = clamp((Number(scene[oppHpKey]) || 0) + healToOpp, 0, Number(scene[oppMaxHpKey]) || 0);
      if (healToOpp > 0) {
        totalHealOpp += healToOpp;
        pushBattleLog(scene, `寄生生效：${actorName}成功被扣取 ${actual}，${oppName}回复 ${healToOpp}`);
      }
    }
  }
  (state.timedEffects || []).forEach((e) => {
    if (normalize(e.kind) !== "healOverTime") return;
    const ratio = clamp(Number(e.data && e.data.ratio) || 0, 0.01, 1);
    const healed = Math.max(1, Math.floor((Number(scene[maxHpKey]) || 1) * ratio));
    const before = Number(scene[hpKey]) || 0;
    scene[hpKey] = clamp(before + healed, 0, Number(scene[maxHpKey]) || 0);
    const actual = Math.max(0, (Number(scene[hpKey]) || 0) - before);
    if (actual > 0) {
      totalHealSelf += actual;
      pushBattleLog(scene, `${actorName}持续回复 ${actual}`);
    }
  });
  (state.timedEffects || []).forEach((e) => {
    if (normalize(e.kind) !== "endTurnHealFlat") return;
    const amount = Math.max(1, Math.floor(Number(e.data && e.data.amount) || 1));
    const { actual } = healSideByFlatAmount(scene, side, amount);
    if (actual > 0) {
      totalHealSelf += actual;
      pushBattleLog(scene, `${actorName}回合结束回复 ${actual}`);
    }
  });
  (state.timedEffects || []).forEach((e) => {
    if (normalize(e.kind) !== "endTurnHealFlatRange") return;
    const min = Math.max(1, Math.floor(Number(e.data && e.data.min) || 1));
    const max = Math.max(min, Math.floor(Number(e.data && e.data.max) || min));
    const amount = min + Math.floor(Math.random() * (max - min + 1));
    const { actual } = healSideByFlatAmount(scene, side, amount);
    if (actual > 0) {
      totalHealSelf += actual;
      pushBattleLog(scene, `${actorName}回合结束回复 ${actual}`);
    }
  });
  (state.timedEffects || []).forEach((e) => {
    if (normalize(e.kind) !== "endTurnHealByLostHp") return;
    const maxHp = Math.max(1, Number(scene[maxHpKey]) || 1);
    const hp = Math.max(0, Number(scene[hpKey]) || 0);
    const lostHp = Math.max(0, maxHp - hp);
    const lostAdd = Math.max(0, Math.floor(Number(e.data && e.data.lostAdd) || 0));
    const multiplier = Math.max(1, Math.floor(Number(e.data && e.data.multiplier) || 1));
    const amount = Math.max(1, Math.floor(((lostHp + lostAdd) / maxHp) * multiplier));
    const { actual } = healSideByFlatAmount(scene, side, amount);
    if (actual > 0) {
      totalHealSelf += actual;
      pushBattleLog(scene, `${actorName}上古战魂回复 ${actual}`);
    }
  });
  (state.timedEffects || []).forEach((e) => {
    if (normalize(e.kind) !== "endTurnDamageByMaxHpChance") return;
    const d = e && e.data ? e.data : {};
    const chance = clamp(Number(d.chance) || 1, 0, 1);
    if (Math.random() > chance) return;
    const ratio = clamp(Number(d.ratio) || 0.1, 0.01, 1);
    const amount = Math.max(1, Math.floor(maxHp * ratio));
    const actual = Math.min(amount, Math.max(0, Number(scene[hpKey]) || 0));
    scene[hpKey] = Math.max(0, (Number(scene[hpKey]) || 0) - amount);
    totalDamage += actual;
    if (actual > 0) damageStatusTriggered = true;
    const label = normalize(d.label) || "持续伤害";
    if (side === "attacker") scene.damageOnAttacker = `-${actual}`;
    else scene.damageOnTarget = `-${actual}`;
    pushBattleLog(scene, `${label}：${actorName}回合结束损失最大体力${Math.round(ratio * 100)}%，受到${actual}点伤害。`);
  });
  (state.timedEffects || []).forEach((e) => {
    if (normalize(e.kind) !== "diceDrain") return;
    const pip = clamp(Math.floor(Number(e.data && e.data.pip) || 1), 1, 6);
    const amountPerPip = Math.max(1, Math.floor(Number(e.data && e.data.amountPerPip) || 30));
    const label = normalize(e.data && e.data.label) || "骰子炸弹";
    const dmg = pip * amountPerPip;
    const actual = Math.min(dmg, Math.max(0, Number(scene[hpKey]) || 0));
    scene[hpKey] = Math.max(0, (Number(scene[hpKey]) || 0) - dmg);
    totalDamage += actual;
    if (actual > 0) damageStatusTriggered = true;
    const casterSide = normalize(e.data && e.data.caster) === "target" ? "target" : "attacker";
    const casterName = casterSide === "attacker" ? scene.attackerName : scene.targetName;
    const casterHpKey = casterSide === "attacker" ? "attackerHp" : "targetHp";
    const casterMaxHpKey = casterSide === "attacker" ? "attackerMaxHp" : "targetMaxHp";
    const healToCaster = Math.min(actual, Math.max(0, (Number(scene[casterMaxHpKey]) || 0) - (Number(scene[casterHpKey]) || 0)));
    scene[casterHpKey] = clamp((Number(scene[casterHpKey]) || 0) + healToCaster, 0, Number(scene[casterMaxHpKey]) || 0);
    totalHealOpp += casterSide === oppSide ? healToCaster : 0;
    if (casterSide === side) totalHealSelf += healToCaster;
    pushBattleLog(scene, `${label}：本次投掷点数为${pip}点，${casterName}吸取${actorName}${actual}点体力。`);
    if (healToCaster > 0) pushBattleLog(scene, `${label}：${casterName}回复${healToCaster}点体力。`);
  });
  (state.timedEffects || []).forEach((e) => {
    if (normalize(e.kind) !== "lockGodDrain") return;
    const flat = Math.floor(Number(e.data && e.data.flat) || 0);
    const ratio = flat > 0 ? 0 : clamp(Number(e.data && e.data.ratio) || (1 / 16), 0.01, 1);
    const label = normalize(e.data && e.data.label) || "锁神诀";
    const dmg = flat > 0 ? flat : Math.max(1, Math.floor(maxHp * ratio));
    const actual = Math.min(dmg, Math.max(0, Number(scene[hpKey]) || 0));
    scene[hpKey] = Math.max(0, (Number(scene[hpKey]) || 0) - dmg);
    totalDamage += actual;
    if (actual > 0) damageStatusTriggered = true;
    pushBattleLog(scene, `${label}：${actorName}受到${actual}点持续伤害。`);
  });
  (state.timedEffects || []).forEach((e) => {
    if (normalize(e.kind) !== "flatDrain") return;
    const drainRatio = Number(e.data && e.data.ratio) || 0;
    const amount = drainRatio > 0 ? Math.max(1, Math.floor(maxHp * clamp(drainRatio, 0.01, 1))) : Math.max(1, Math.floor(Number(e.data && e.data.amount) || 1));
    const label = normalize(e.data && e.data.label) || "吸附";
    const actual = Math.min(amount, Math.max(0, Number(scene[hpKey]) || 0));
    scene[hpKey] = Math.max(0, (Number(scene[hpKey]) || 0) - amount);
    totalDamage += actual;
    if (actual > 0) damageStatusTriggered = true;
    const casterSide = normalize(e.data && e.data.caster) === "target" ? "target" : "attacker";
    const casterName = casterSide === "attacker" ? scene.attackerName : scene.targetName;
    const casterHpKey = casterSide === "attacker" ? "attackerHp" : "targetHp";
    const casterMaxHpKey = casterSide === "attacker" ? "attackerMaxHp" : "targetMaxHp";
    const healToCaster = Math.min(actual, Math.max(0, (Number(scene[casterMaxHpKey]) || 0) - (Number(scene[casterHpKey]) || 0)));
    scene[casterHpKey] = clamp((Number(scene[casterHpKey]) || 0) + healToCaster, 0, Number(scene[casterMaxHpKey]) || 0);
    totalHealOpp += casterSide === oppSide ? healToCaster : 0;
    if (casterSide === side) totalHealSelf += healToCaster;
    pushBattleLog(scene, `${label}：${casterName}吸取${actorName}${actual}点体力。`);
  });
  (state.timedEffects || []).forEach((e) => {
    if (normalize(e.kind) !== "mutualEndTurnDamageFlat") return;
    const amount = Math.max(1, Math.floor(Number(e.data && e.data.amount) || 1));
    const label = normalize(e.data && e.data.label) || "腐蚀酸云";
    const actual = Math.min(amount, Math.max(0, Number(scene[hpKey]) || 0));
    scene[hpKey] = Math.max(0, (Number(scene[hpKey]) || 0) - amount);
    totalDamage += actual;
    if (actual > 0) damageStatusTriggered = true;
    pushBattleLog(scene, `${label}：${actorName}受到${actual}点伤害。`);
  });
  (state.timedEffects || []).forEach((e) => {
    if (normalize(e.kind) !== "timedStage") return;
    const d = e && e.data ? e.data : {};
    const keys = Array.isArray(d.keys) ? d.keys : [];
    const delta = Math.floor(Number(d.delta) || 0);
    if (keys.length <= 0 || delta === 0) return;
    const changed = applyStageDelta(scene, side, keys, delta);
    if (changed.length <= 0) return;
    pushBattleLog(scene, `${actorName}持续${delta > 0 ? "提升" : "降低"}${Math.abs(delta)}级：${changed.map((k) => battleStatLabel(k)).join("、")}`);
  });
  (state.timedEffects || []).forEach((e) => {
    if (normalize(e.kind) !== "timedRandomStage") return;
    const d = e && e.data ? e.data : {};
    const keys = Array.isArray(d.keys) ? d.keys.slice() : [];
    const delta = Math.floor(Number(d.delta) || 0);
    const pick = Math.min(keys.length, Math.max(1, Math.floor(Number(d.pick) || 1)));
    if (keys.length <= 0 || delta === 0 || pick <= 0) return;
    const pool = keys.slice();
    const picked = [];
    while (pool.length > 0 && picked.length < pick) {
      const idx = Math.floor(Math.random() * pool.length);
      picked.push(pool.splice(idx, 1)[0]);
    }
    const changed = applyStageDelta(scene, side, picked, delta);
    if (changed.length <= 0) return;
    pushBattleLog(scene, `${actorName}持续随机${delta > 0 ? "提升" : "降低"}${Math.abs(delta)}级：${changed.map((k) => battleStatLabel(k)).join("、")}`);
  });
  (state.timedEffects || []).forEach((e) => {
    if (normalize(e.kind) !== "endTurnSetHpToOne") return;
    const before = Math.max(0, Number(scene[hpKey]) || 0);
    if (before <= 1) return;
    scene[hpKey] = 1;
    totalDamage += before - 1;
    damageStatusTriggered = true;
    if (side === "attacker") scene.damageOnAttacker = `-${before - 1}`;
    else scene.damageOnTarget = `-${before - 1}`;
    pushBattleLog(scene, `${actorName}回合结束消耗体力至1点。`);
  });
  (state.timedEffects || []).forEach((e) => {
    if (normalize(e.kind) !== "endTurnStageAndStatusChance") return;
    const d = e && e.data ? e.data : {};
    const chance = clamp(Number(d.chance) || 0, 0, 1);
    if (Math.random() > chance) return;
    const keys = Array.isArray(d.keys) ? d.keys : [];
    const delta = Math.floor(Number(d.delta) || 0);
    const changed = keys.length > 0 && delta !== 0 ? applyStageDelta(scene, side, keys, delta) : [];
    const status = normalize(d.status);
    if (status) {
      applyStatusTurns(state, status, d.statusTurns);
      triggeredStatuses.push({ status, label: STATUS_LABEL_MAP[status] || status });
      pushBattleLog(scene, `${actorName}回合末效果触发，陷入${statusLabel(status)}${state.statuses[status]}回合。`);
    }
    if (changed.length > 0) {
      pushBattleLog(scene, `${actorName}回合末效果触发：${delta > 0 ? "提升" : "降低"}${Math.abs(delta)}级：${changed.map((k) => battleStatLabel(k)).join("、")}`);
    }
  });
  (state.timedEffects || []).forEach((e) => {
    if (normalize(e.kind) !== "endTurnStageChance") return;
    const d = e && e.data ? e.data : {};
    const chance = clamp(Number(d.chance) || 0, 0, 1);
    if (Math.random() > chance) return;
    const changes = Array.isArray(d.changes) ? d.changes : [];
    const changedLabels = [];
    changes.forEach((row) => {
      const keys = Array.isArray(row && row.keys) ? row.keys : [];
      const delta = Math.floor(Number(row && row.delta) || 0);
      if (keys.length <= 0 || delta === 0) return;
      const changed = applyStageDelta(scene, side, keys, delta);
      if (changed.length > 0) changedLabels.push(`${delta > 0 ? "提升" : "降低"}${Math.abs(delta)}级：${changed.map((k) => battleStatLabel(k)).join("、")}`);
    });
    if (changedLabels.length > 0) pushBattleLog(scene, `${actorName}回合末效果触发，${changedLabels.join("；")}`);
  });
  (state.timedEffects || []).forEach((e) => {
    if (normalize(e.kind) !== "endTurnClearStageChance") return;
    const d = e && e.data ? e.data : {};
    const chance = clamp(Number(d.chance) || 0, 0, 1);
    if (Math.random() > chance) return;
    const owner = normalize(d.owner) === "target" ? "target" : "attacker";
    const targets = Array.isArray(d.targets) && d.targets.length > 0 ? d.targets : ["self"];
    const mode = normalize(d.mode) || "all";
    const keys = Array.isArray(d.keys) && d.keys.length > 0 ? d.keys : ALL_ABILITY_STAGE_KEYS.slice();
    const changedLabels = [];
    targets.forEach((target) => {
      const targetKey = normalize(target);
      const targetSide = targetKey === "opponent" ? (owner === "attacker" ? "target" : "attacker") : owner;
      const changed = clearStageByMode(scene, targetSide, mode, keys);
      if (changed.length <= 0) return;
      const who = targetSide === "attacker" ? scene.attackerName : scene.targetName;
      changedLabels.push(`${who}：${changed.map((k) => battleStatLabel(k)).join("、")}`);
    });
    if (changedLabels.length > 0) pushBattleLog(scene, `${actorName}回合末清除属性效果触发，${changedLabels.join("；")}`);
  });
  const delayedStageToApply = [];
  (state.timedEffects || []).forEach((e) => {
    if (normalize(e.kind) !== "delayedStage") return;
    if (Number(e.turns) !== 1) return;
    const d = e && e.data ? e.data : {};
    if (d.ko) {
      const before = Math.max(0, Number(scene[hpKey]) || 0);
      scene[hpKey] = 0;
      totalDamage += before;
      pushBattleLog(scene, `${normalize(d.label) || "延时效果"}触发：${actorName}失去战斗能力。`);
      return;
    }
    const keys = Array.isArray(d.keys) ? d.keys.filter((k) => typeof k === "string") : [];
    const delta = Number(d.delta) || 0;
    if (keys.length === 0 || delta === 0) return;
    delayedStageToApply.push({ keys, delta });
  });
  delayedStageToApply.forEach((x) => {
    const changed = applyStageDelta(scene, side, x.keys, x.delta);
    if (changed.length <= 0) return;
    const act = x.delta > 0 ? "提升" : "降低";
    pushBattleLog(scene, `${actorName}的延时效果触发：${act}${Math.abs(x.delta)}级：${changed.map((k) => battleStatLabel(k)).join("、")}`);
  });
  if (totalDamage > 0) {
    if (side === "attacker") scene.uiAttackerHp = scene.attackerHp;
    else scene.uiTargetHp = scene.targetHp;
    if (side === "attacker") scene.damageOnAttacker = `-${totalDamage}`;
    else scene.damageOnTarget = `-${totalDamage}`;
    markBattleFloatText(scene);
  }
  if (damageStatusTriggered && Math.max(0, Number(state.statuses.sleep) || 0) > 0) {
    state.statuses.sleep = 0;
    pushBattleLog(scene, `${actorName}因扣血类状态解除睡眠。`);
  } else {
    clearSleepIfDamageStatusExists(state);
  }
  if (totalHealSelf > 0) {
    if (side === "attacker") scene.uiAttackerHp = scene.attackerHp;
    else scene.uiTargetHp = scene.targetHp;
    if (side === "attacker") scene.healOnAttacker = `+${totalHealSelf}`;
    else scene.healOnTarget = `+${totalHealSelf}`;
    markBattleFloatText(scene);
  }
  if (totalHealOpp > 0) {
    if (oppSide === "attacker") scene.uiAttackerHp = scene.attackerHp;
    else scene.uiTargetHp = scene.targetHp;
    if (oppSide === "attacker") scene.healOnAttacker = `+${totalHealOpp}`;
    else scene.healOnTarget = `+${totalHealOpp}`;
    markBattleFloatText(scene);
  }
  applyTeamEndTurnEffects(scene, side);
  tickSideEffects(scene, side);
  applyQixingSealEffect(scene, side);
  const uniqueStatuses = [];
  const seenStatusFx = new Set();
  triggeredStatuses.forEach((item) => {
    const key = normalize(item && item.status) || normalize(item && item.label);
    if (!key || seenStatusFx.has(key)) return;
    seenStatusFx.add(key);
    uniqueStatuses.push(item);
  });
  return { totalDamage, statuses: uniqueStatuses };
};
const applyTeamEndTurnEffects = (scene, side) => {
  if (!scene || side !== "attacker" || !Array.isArray(scene.teamTimedEffects)) return 0;
  cleanupTeamTimedEffects(scene);
  if (Math.max(0, Number(scene.attackerHp) || 0) <= 0) return 0;
  let totalHeal = 0;
  (scene.teamTimedEffects || []).forEach((e) => {
    if (normalize(e.kind) !== "endTurnHealFlat") return;
    const amount = Math.max(1, Math.floor(Number(e.data && e.data.amount) || 1));
    const { actual } = healSideByFlatAmount(scene, "attacker", amount);
    if (actual > 0) {
      totalHeal += actual;
      pushBattleLog(scene, `${scene.attackerName}通过队伍持续效果回合结束回复 ${actual}`);
    }
  });
  if (totalHeal > 0) {
    syncBattleUiHpForSide(scene, "attacker");
    syncActivePetFromBattleScene(scene);
    scene.healOnAttacker = `+${totalHeal}`;
    markBattleFloatText(scene);
  }
  (scene.teamTimedEffects || []).forEach((e) => { e.turns = Math.max(0, Number(e.turns) - 1); });
  cleanupTeamTimedEffects(scene);
  return totalHeal;
};
const tickGlobalTimedEffects = (scene) => {
  if (!scene || !Array.isArray(scene.globalTimedEffects)) return;
  scene.globalTimedEffects.forEach((e) => { e.turns = Math.max(0, Number(e.turns) - 1); });
  scene.globalTimedEffects = scene.globalTimedEffects.filter((e) => Number(e.turns) > 0);
};
const tickTeamTimedEffects = (scene) => {
  if (!scene || !Array.isArray(scene.teamTimedEffects)) return;
  scene.teamTimedEffects.forEach((e) => { e.turns = Math.max(0, Number(e.turns) - 1); });
  cleanupTeamTimedEffects(scene);
};
const consumeBattleTurnDurations = (scene) => {
  if (!scene) return;
  tickSideEffects(scene, "attacker");
  tickSideEffects(scene, "target");
  tickGlobalTimedEffects(scene);
  tickTeamTimedEffects(scene);
};
const calcSkillDamageByOfficialStyle = ({
  level,
  power,
  atkStat,
  defStat,
  stab = 1,
  elementFactor = 1,
  randomFactor = 1
}) => {
  const lv = clamp(Number(level) || 1, 1, 100);
  const p = Math.max(0, Number(power) || 0);
  if (p <= 0) return 0;
  const atk = Math.max(1, Number(atkStat) || 1);
  const def = Math.max(1, Number(defStat) || 1);
  const rf = clamp(Number(randomFactor) || 1, 0.85, 1);
  if (Number(elementFactor) <= 0) return 0;
  // 参考奥拉星常用公开结算写法：先算基础伤害，再乘 STAB、克制与随机系数
  const base = Math.floor(((((2 * lv) / 5 + 2) * p * (atk / def)) / 50) + 2);
  const dmg = Math.floor(base * Math.max(0, Number(stab) || 1) * Math.max(0, Number(elementFactor) || 1) * rf);
  return Math.max(1, dmg);
};
const compareElementLabel = (factor) => (factor <= 0 ? "无效" : (factor >= 2 ? "克制" : (factor <= 0.5 ? "微弱" : "正常")));
const compareElementDesc = (attackerElement, defenderElement, factor) => {
  const atk = normalize(attackerElement) || "未知系";
  const def = normalize(defenderElement) || "未知系";
  const label = compareElementLabel(factor);
  return `${atk} 对 ${def}：${label}，${factor.toFixed(2)}x`;
};
const parseMultiHitRangeFromDesc = (skill) => {
  const hardcoded = parseSkillEffects(skill).find((e) => normalize(e && e.kind) === "multiHit");
  if (hardcoded) {
    const min = Math.max(1, Math.floor(Number(hardcoded.min) || 1));
    const max = Math.max(min, Math.floor(Number(hardcoded.max) || min));
    const powerMultiplier = Math.max(1, Number(hardcoded.powerMultiplier) || 1);
    const elementShelterMultiplier = Math.max(1, Number(hardcoded.elementShelterMultiplier) || 1);
    const powerList = Array.isArray(hardcoded.powerList)
      ? hardcoded.powerList.map((x) => Math.max(1, Math.floor(Number(x) || 0))).filter((x) => x > 0)
      : [];
    return { min, max, powerMultiplier, elementShelterMultiplier, powerList };
  }
  const desc = normalize(skill && skill.desc);
  if (!desc) return null;
  const patterns = [
    /一回合内\s*([0-9]+)\s*[~～-]\s*([0-9]+)\s*次连续攻击/,
    /爆发\s*([0-9]+)\s*[~～-]\s*([0-9]+)\s*次的连续打击/,
    /1回合内攻击对方单体\s*([0-9]+)\s*[~～-]\s*([0-9]+)\s*次/,
    /1回合爆发\s*([0-9]+)\s*[~～-]\s*([0-9]+)\s*次攻击对方单体/,
    /(?:一|1)回合(?:内)?[^。；，\n]{0,12}?(?:攻击|打击)[^。；，\n]{0,12}?([0-9]+)\s*[~～-]\s*([0-9]+)\s*次/,
    /([0-9]+)\s*[~～-]\s*([0-9]+)\s*次(?:连续)?(?:攻击|打击)/
  ];
  for (const re of patterns) {
    const m = desc.match(re);
    if (!m) continue;
    const a = Math.max(1, Number(m[1]) || 1);
    const b = Math.max(a, Number(m[2]) || a);
    return { min: a, max: b, powerMultiplier: 1 };
  }
  return null;
};
const normalizeEquippedSkillsBySpecies = (species, rawSkills, level = null) => {
  const maxLv = Number.isFinite(Number(level)) ? Number(level) : null;
  const valid = new Set((species && Array.isArray(species.skills) ? species.skills : [])
    .filter((s) => maxLv === null || Number(s && s.level) <= maxLv)
    .map((s) => normalizeSkillKey(s && s.name))
    .filter(Boolean));
  const out = [];
  const seen = new Set();
  (Array.isArray(rawSkills) ? rawSkills : []).forEach((name) => {
    const key = normalizeSkillKey(name);
    if (!key || seen.has(key) || (valid.size > 0 && !valid.has(key))) return;
    seen.add(key);
    out.push(key);
  });
  return out.slice(0, 4);
};
const sanitizePetExtraSkills = (rawSkills) => {
  const out = [];
  const seen = new Set();
  (Array.isArray(rawSkills) ? rawSkills : []).forEach((skill) => {
    const src = skill && typeof skill === "object" ? skill : null;
    const name = normalizeSkillKey(src && src.name);
    if (!name || seen.has(name)) return;
    seen.add(name);
    out.push({
      skillId: Number(src.skillId) || null,
      skillKey: normalize(src.skillKey) || `${name}#额外技能`,
      name,
      element: normalize(src.element),
      attackType: normalize(src.attackType),
      attackTypeCode: Number.isFinite(Number(src.attackTypeCode)) ? Number(src.attackTypeCode) : null,
      attackTypeLabel: normalize(src.attackTypeLabel),
      type: normalize(src.type) || "未知系/属性攻击",
      power: Number(src.power) > 0 ? Number(src.power) : 0,
      pp: Math.max(1, Math.floor(Number(src.pp) || 10)),
      accuracy: safeSkillAccuracy(src),
      level: 0,
      desc: normalize(src.desc)
    });
  });
  return out;
};
const petExtraSkills = (pet) => sanitizePetExtraSkills(pet && pet.extraSkills);
const skillNameSetFromList = (skills) => new Set((Array.isArray(skills) ? skills : [])
  .map((s) => normalizeSkillKey(s && (s.name || s)))
  .filter(Boolean));
const normalizeEquippedSkillsBySkillList = (availableSkills, rawSkills) => {
  const valid = skillNameSetFromList(availableSkills);
  const out = [];
  const seen = new Set();
  (Array.isArray(rawSkills) ? rawSkills : []).forEach((name) => {
    const key = normalizeSkillKey(name);
    if (!key || seen.has(key) || (valid.size > 0 && !valid.has(key))) return;
    seen.add(key);
    out.push(key);
  });
  return out.slice(0, 4);
};
const mergeUnlockedEquippedSkillsBySpecies = (species, rawSkills, level = null, extraSkills = []) => {
  const maxLv = Number.isFinite(Number(level)) ? Number(level) : null;
  const baseSkills = (species && Array.isArray(species.skills) ? species.skills : [])
    .filter((s) => maxLv === null || Number(s && s.level) <= maxLv);
  const fullSkills = baseSkills.concat(sanitizePetExtraSkills(extraSkills));
  const kept = normalizeEquippedSkillsBySkillList(fullSkills, rawSkills);
  const seen = new Set(kept.map((name) => normalizeSkillKey(name)).filter(Boolean));
  const fillers = baseSkills.map((s) => normalizeSkillKey(s && s.name)).filter(Boolean)
    .filter((name) => {
      const key = normalizeSkillKey(name);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  return kept.concat(fillers).slice(0, 4);
};
const currentEquippedSkillNamesBySpecies = (species, rawSkills, level = null, extraSkills = []) => mergeUnlockedEquippedSkillsBySpecies(species, rawSkills, level, extraSkills);
const fallbackEquippedSkillNamesBySpecies = (species, level = null) => {
  const maxLv = Number.isFinite(Number(level)) ? Number(level) : null;
  return (species && Array.isArray(species.skills) ? species.skills : [])
    .filter((s) => maxLv === null || Number(s && s.level) <= maxLv)
    .sort((a, b) => Number(b && b.level || 0) - Number(a && a.level || 0))
    .slice(0, 4)
    .map((s) => normalizeSkillKey(s && s.name))
    .filter(Boolean)
    .reverse();
};
const speciesSkillNameSet = (species, level = null) => new Set(
  (species && Array.isArray(species.skills) ? species.skills : [])
    .filter((s) => {
      if (!Number.isFinite(Number(level))) return true;
      return Number(s && s.level) <= Number(level);
    })
    .map((s) => normalizeSkillKey(s && s.name))
    .filter(Boolean)
);

const getNodeRuntime = () => {
  try {
    if (typeof window !== "undefined" && typeof window.require === "function") {
      const fs = window.require("fs");
      const path = window.require("path");
      if (fs && path) return { fs, path };
    }
  } catch {
    return null;
  }
  return null;
};

const resolveWorkspaceDir = (pathApi) => {
  try {
    if (typeof window !== "undefined" && window.location && window.location.protocol === "file:") {
      let pathname = decodeURIComponent(window.location.pathname || "");
      if (/^\/[A-Za-z]:\//.test(pathname)) pathname = pathname.slice(1);
      return pathApi.dirname(pathname);
    }
  } catch {
    return ".";
  }
  return ".";
};

const createStorageAdapter = () => {
  const runtime = getNodeRuntime();
  if (runtime) {
    const { fs, path } = runtime;
    const backupDir = path.join(resolveWorkspaceDir(path), "backup");
    const ensureDir = () => {
      if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
    };
    const listJsonFiles = () => {
      ensureDir();
      return fs.readdirSync(backupDir)
        .filter((f) => String(f).toLowerCase().endsWith(".json"))
        .map((name) => {
          const full = path.join(backupDir, name);
          let mtimeMs = 0;
          try { mtimeMs = Number(fs.statSync(full).mtimeMs) || 0; } catch {}
          return { name, full, mtimeMs };
        })
        .sort((a, b) => b.mtimeMs - a.mtimeMs);
    };
    return {
      mode: "file",
      loadRaw: () => {
        try {
          const files = listJsonFiles();
          if (files.length === 0) return null;
          return fs.readFileSync(files[0].full, "utf8");
        } catch {
          return null;
        }
      },
      saveRaw: (text) => {
        try {
          const files = listJsonFiles();
          files.forEach((f) => {
            try { fs.unlinkSync(f.full); } catch {}
          });
          const stamp = new Date().toISOString().replace(/[:.]/g, "-");
          const fileName = `${SAVE_FILE_PREFIX}${stamp}.json`;
          fs.writeFileSync(path.join(backupDir, fileName), text, "utf8");
          return true;
        } catch {
          return false;
        }
      }
    };
  }

  return {
    mode: "localStorage",
    loadRaw: () => {
      try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
    },
    saveRaw: (text) => {
      try { localStorage.setItem(STORAGE_KEY, text); return true; } catch { return false; }
    }
  };
};

createApp({
  setup() {
    const rawDex = Array.isArray(window.AOLA_DEX_1_100) ? window.AOLA_DEX_1_100 : [];
    const dexEntries = rawDex.map((item, idx) => ({
      dexId: Number(item.dexId) || idx + 1,
      name: normalize(item.name) || `未知亚比${idx + 1}`,
      image: ensureHttps(item.image) || PLACEHOLDER,
      element: normalizeElementName(item.element) || "未知系",
      subElement: normalizeElementName(item.subElement || item.element2 || ""),
      sourceUrl: String(item.sourceUrl || "")
    }));
    [
      {
        dexId: QIXING_ANCIENT_STAR_DRAGON_DEX.rootDexId,
        name: "上古星龙",
        image: "./pet-img/pet2386_1_1_cropped.png",
        element: QIXING_ANCIENT_STAR_DRAGON_DEX.element,
        subElement: QIXING_ANCIENT_STAR_DRAGON_DEX.subElement,
        sourceUrl: ""
      },
      QIXING_ANCIENT_STAR_DRAGON_DEX
    ].forEach((extra) => {
      if (dexEntries.some((entry) => entry.dexId === Number(extra.dexId))) return;
      dexEntries.push({
        dexId: Number(extra.dexId),
        name: normalize(extra.name),
        image: ensureHttps(extra.image) || PLACEHOLDER,
        element: normalizeElementName(extra.element) || "未知系",
        subElement: normalizeElementName(extra.subElement || ""),
        sourceUrl: String(extra.sourceUrl || "")
      });
    });
    const dexImageBelongsToEntry = (entry) => {
      const dexId = Number(entry && entry.dexId) || 0;
      const image = normalize(entry && entry.image);
      if (!dexId || !image || image === PLACEHOLDER) return false;
      const hit = image.match(/(?:^|\/|\\)pet(\d+)_/i);
      return Boolean(hit && Number(hit[1]) === dexId);
    };
    const visibleDexEntries = dexEntries.filter(dexImageBelongsToEntry);

    const speciesRaw = window.AOLA_SPECIES_DATA && typeof window.AOLA_SPECIES_DATA === "object" ? window.AOLA_SPECIES_DATA : {};
    const speciesRawByDex = window.AOLA_SPECIES_DATA_BY_DEX && typeof window.AOLA_SPECIES_DATA_BY_DEX === "object" ? window.AOLA_SPECIES_DATA_BY_DEX : {};
    const skillRawById = window.AOLA_SKILL_DATA_BY_ID && typeof window.AOLA_SKILL_DATA_BY_ID === "object" ? window.AOLA_SKILL_DATA_BY_ID : {};
    const skillRawList = Array.isArray(window.AOLA_SKILL_DATA_LIST) ? window.AOLA_SKILL_DATA_LIST : [];
    const skillExtractReady = ref(!isAndroidWebViewRuntime());
    const skillExtractLoadPromise = ref(null);
    const skillMasterById = new Map();
    const skillMasterByKey = new Map();
    skillRawList.forEach((row) => {
      const item = row && typeof row === "object" ? row : {};
      const sid = Number(item.skillId);
      const name = normalize(item.name);
      const key = normalize(item.skillKey);
      const element = normalize(item.element);
      if (Number.isFinite(sid) && sid > 0) skillMasterById.set(sid, item);
      if (key) skillMasterByKey.set(key, item);
      if (!key && name && element) skillMasterByKey.set(`${name}#${element}`, item);
    });
    Object.keys(skillRawById).forEach((k) => {
      const item = skillRawById[k];
      const sid = Number(item && item.skillId);
      const name = normalize(item && item.name);
      const key = normalize(item && item.skillKey);
      const element = normalize(item && item.element);
      if (Number.isFinite(sid) && sid > 0 && !skillMasterById.has(sid)) skillMasterById.set(sid, item);
      if (key && !skillMasterByKey.has(key)) skillMasterByKey.set(key, item);
      if (!key && name && element) {
        const k2 = `${name}#${element}`;
        if (!skillMasterByKey.has(k2)) skillMasterByKey.set(k2, item);
      }
    });
    const speciesMap = new Map();
    const speciesByDexMap = new Map();
    const dexById = new Map(dexEntries.map((d) => [d.dexId, d]));
    const dexByName = new Map(dexEntries.map((d) => [d.name, d]));
    const pickSkillMaster = (rawSkill) => {
      const sid = Number(rawSkill && rawSkill.skillId);
      if (Number.isFinite(sid) && sid > 0 && skillMasterById.has(sid)) return skillMasterById.get(sid);
      const name = normalize(rawSkill && rawSkill.name);
      const type = normalize(rawSkill && rawSkill.type);
      const parsed = parseSkillTypeMeta(type);
      const key = name && parsed.element ? `${name}#${parsed.element}` : "";
      if (key && skillMasterByKey.has(key)) return skillMasterByKey.get(key);
      return null;
    };
    const bossPoolSkillByDexAndName = new Map();
    const bossPoolSkillByName = new Map();
    const indexBossPoolExtractSkills = (petRows, skillRows) => {
      const descBySkillId = new Map();
      (Array.isArray(skillRows) ? skillRows : []).forEach((row) => {
        const sid = Number(row && row.skill_id);
        if (!Number.isFinite(sid) || sid <= 0) return;
        const name = normalizeSkillKey(row && (row.new_cn_name || row.cn_name));
        const desc = normalizeLegacySkillElementText((row && row.client_desc) || (row && row.new_effect_desc) || (row && row.old_effect_desc) || "");
        if (desc) descBySkillId.set(sid, desc);
        if (name && !bossPoolSkillByName.has(name)) {
          bossPoolSkillByName.set(name, {
            skillId: sid,
            name,
            type: normalizeLegacySkillElementText((row && row.client_desc) || (row && row.old_effect_desc) || ""),
            power: Number(row && row.power) > 0 ? Number(row.power) : 0,
            pp: Math.max(1, Number(row && row.all_pp) || 10),
            attackTypeCode: Number.isFinite(Number(row && row.attack_type)) ? Number(row.attack_type) : null,
            attackTypeLabel: attackTypeLabelFromCode(row && row.attack_type),
            desc
          });
        }
      });
      (Array.isArray(petRows) ? petRows : []).forEach((row) => {
        const dexId = Number(row && row.race_id);
        if (!Number.isFinite(dexId) || dexId <= 0) return;
        const pool = BOSS_RANDOM_SKILL_POOL_BY_DEX_ID[dexId];
        if (!Array.isArray(pool) || pool.length === 0) return;
        const poolNames = new Set(pool.map((name) => normalizeSkillKey(name)).filter(Boolean));
        (Array.isArray(row && row.skills) ? row.skills : []).forEach((skill) => {
          const name = normalizeSkillKey(skill && skill.name);
          if (!poolNames.has(name)) return;
          const sid = Number(skill && skill.skill_id);
          const attackTypeCode = Number(skill && skill.attack_type);
          const item = {
            skillId: Number.isFinite(sid) && sid > 0 ? sid : null,
            dexId,
            skillKey: `${name}#${dexId}`,
            name,
            type: "",
            power: Number(skill && skill.power) > 0 ? Number(skill.power) : 0,
            pp: Math.max(1, Number(skill && skill.pp) || 10),
            level: Math.max(0, Number(skill && skill.level) || 0),
            attackTypeCode: Number.isFinite(attackTypeCode) ? attackTypeCode : null,
            attackTypeLabel: attackTypeLabelFromCode(attackTypeCode),
            desc: Number.isFinite(sid) && sid > 0 ? normalize(descBySkillId.get(sid)) : ""
          };
          bossPoolSkillByDexAndName.set(`${dexId}:${name}`, item);
          if (!bossPoolSkillByName.has(name)) bossPoolSkillByName.set(name, item);
        });
      });
    };
    const pickBossPoolSkillSource = (dexId, skillName, species) => {
      const name = normalizeSkillKey(skillName);
      if (!name) return null;
      const speciesHit = (species && Array.isArray(species.skills) ? species.skills : [])
        .find((s) => normalizeSkillKey(s && s.name) === name);
      return speciesHit || bossPoolSkillByDexAndName.get(`${Number(dexId) || 0}:${name}`) || bossPoolSkillByName.get(name) || null;
    };
    const extractSkillMetaByDex = (() => {
      const out = new Map();
      const runtime = getNodeRuntime();
      if (!runtime) return out;
      try {
        const { fs, path } = runtime;
        const full = path.join(resolveWorkspaceDir(path), "aola_pet_skill_extract.json");
        const rows = JSON.parse(fs.readFileSync(full, "utf8"));
        if (!Array.isArray(rows)) return out;
        syncSkillAttackTypeIndex(rows);
        rows.forEach((row) => {
          const dexId = Number(row && row.race_id);
          if (!Number.isFinite(dexId) || dexId <= 0) return;
          const skills = Array.isArray(row && row.skills) ? row.skills : [];
          const bySkillId = new Map();
          const byName = new Map();
          const byNameLevel = new Map();
          skills.forEach((s) => {
            const skillId = Number(s && s.skill_id);
            const name = normalize(s && s.name);
            const level = Number(s && s.level);
            const attackTypeCode = Number(s && s.attack_type);
            if (!Number.isFinite(attackTypeCode)) return;
            const meta = {
              skillId: Number.isFinite(skillId) && skillId > 0 ? skillId : null,
              name,
              level: Number.isFinite(level) ? level : null,
              attackTypeCode
            };
            if (meta.skillId) bySkillId.set(meta.skillId, meta);
            if (name) {
              byName.set(name, meta);
              if (Number.isFinite(level)) byNameLevel.set(`${name}#${level}`, meta);
            }
          });
          out.set(dexId, { bySkillId, byName, byNameLevel });
        });
      } catch (err) {
        console.warn("[AolaStar] build extractSkillMetaByDex failed:", err);
      }
      return out;
    })();
    const pickExtractSkillMeta = (dexId, skill) => {
      const bucket = extractSkillMetaByDex.get(Number(dexId));
      if (!bucket) return null;
      const sid = Number(skill && skill.skillId);
      if (Number.isFinite(sid) && sid > 0 && bucket.bySkillId.has(sid)) return bucket.bySkillId.get(sid);
      const name = normalize(skill && skill.name);
      const level = Number(skill && skill.level);
      if (name && Number.isFinite(level) && bucket.byNameLevel.has(`${name}#${level}`)) return bucket.byNameLevel.get(`${name}#${level}`);
      if (name && bucket.byName.has(name)) return bucket.byName.get(name);
      return null;
    };
    const applySkillDescFromExtractJson = async () => {
      const loadJsonAsset = async (fileName) => {
        const runtime = getNodeRuntime();
        if (runtime) {
          const { fs, path } = runtime;
          const full = path.join(resolveWorkspaceDir(path), fileName);
          return JSON.parse(fs.readFileSync(full, "utf8"));
        }
        if (isAndroidWebViewRuntime() || (window.location && window.location.protocol === "file:")) {
          try {
            return JSON.parse(await loadLocalAssetText(`./${fileName}`));
          } catch (err) {
            console.warn("[AolaStar] local json asset load failed:", fileName, err);
            return null;
          }
        }
        if (typeof fetch !== "function") return null;
        const res = await fetch(`./${fileName}`, { cache: "no-store" });
        return res && res.ok ? res.json() : null;
      };
      try {
        const [petRows, skillRows] = await Promise.all([
          loadJsonAsset("aola_pet_skill_extract.json"),
          loadJsonAsset("aola_pet_skill_extract_skills.json")
        ]);
        if (!Array.isArray(petRows)) return;
        syncSkillAttackTypeIndex(petRows);
        syncSkillMasterAttackTypeIndex(skillRows);
        indexBossPoolExtractSkills(petRows, skillRows);

        const descBySkillId = new Map();
        (Array.isArray(skillRows) ? skillRows : []).forEach((row) => {
          const sid = Number(row && row.skill_id);
          if (!Number.isFinite(sid) || sid <= 0) return;
          const desc = normalizeLegacySkillElementText((row && row.client_desc) || (row && row.new_effect_desc) || (row && row.old_effect_desc) || "");
          if (desc) descBySkillId.set(sid, desc);
        });

        const raceSkillsById = new Map();
        petRows.forEach((row) => {
          const rid = Number(row && row.race_id);
          if (!Number.isFinite(rid) || rid <= 0) return;
          const skills = Array.isArray(row && row.skills) ? row.skills : [];
          raceSkillsById.set(rid, skills);
        });

        speciesByDexMap.forEach((species, dexId) => {
          const raceSkills = raceSkillsById.get(Number(dexId));
          if (!species || !Array.isArray(species.skills) || !Array.isArray(raceSkills)) return;
          const sidByName = new Map();
          const sidByNameLevel = new Map();
          const metaBySkillId = new Map();
          const metaByName = new Map();
          const metaByNameLevel = new Map();
          raceSkills.forEach((s) => {
            const nm = normalize(s && s.name);
            const sid = Number(s && s.skill_id);
            const lv = Number(s && s.level);
            const attackTypeCode = Number(s && s.attack_type);
            const meta = {
              skillId: Number.isFinite(sid) && sid > 0 ? sid : null,
              attackTypeCode: Number.isFinite(attackTypeCode) ? attackTypeCode : null
            };
            if (nm && Number.isFinite(sid) && sid > 0) {
              sidByName.set(nm, sid);
              if (Number.isFinite(lv)) sidByNameLevel.set(`${nm}#${lv}`, sid);
            }
            if (meta.skillId) metaBySkillId.set(meta.skillId, meta);
            if (nm) {
              metaByName.set(nm, meta);
              if (Number.isFinite(lv)) metaByNameLevel.set(`${nm}#${lv}`, meta);
            }
          });
          species.skills = species.skills.map((s) => {
            const cur = s && typeof s === "object" ? s : {};
            const nm = normalize(cur.name);
            const lv = Number(cur.level);
            const sidByPair = (nm && Number.isFinite(lv)) ? Number(sidByNameLevel.get(`${nm}#${lv}`)) : NaN;
            let meta = (nm && Number.isFinite(lv) ? metaByNameLevel.get(`${nm}#${lv}`) : null) || null;
            let desc = Number.isFinite(sidByPair) && sidByPair > 0 ? normalize(descBySkillId.get(sidByPair)) : "";
            if (!desc) {
              const sidByNm = nm ? Number(sidByName.get(nm)) : NaN;
              if (Number.isFinite(sidByNm) && sidByNm > 0) desc = normalize(descBySkillId.get(sidByNm));
              if (!meta && Number.isFinite(sidByNm) && sidByNm > 0) meta = metaBySkillId.get(sidByNm) || null;
            }
            if (!desc) {
              const sid = Number(cur.skillId);
              if (Number.isFinite(sid) && sid > 0) desc = normalize(descBySkillId.get(sid));
              if (!meta && Number.isFinite(sid) && sid > 0) meta = metaBySkillId.get(sid) || null;
            }
            if (!meta && nm) meta = metaByName.get(nm) || null;
            const attackTypeCode = Number(meta && meta.attackTypeCode);
            const patch = {};
            if (desc) patch.desc = desc;
            if (Number.isFinite(attackTypeCode)) {
              patch.attackTypeCode = attackTypeCode;
              patch.attackTypeLabel = attackTypeLabelFromCode(attackTypeCode);
              patch.type = buildSkillTypeText(cur.type, attackTypeCode);
            }
            return Object.keys(patch).length > 0 ? { ...cur, ...patch } : cur;
          });
        });
      } catch (err) {
        console.warn("[AolaStar] applySkillDescFromExtractJson failed:", err);
      } finally {
        skillExtractReady.value = true;
      }
    };

    const normalizeSpeciesSource = (source, entry) => {
      const fallback = buildFallbackSpecies(entry);
      if (!source || typeof source !== "object") return { ...fallback, raceStats: null, formCount: 1, stageIndex: 0 };

      let forms = [];
      let formCount = 1;
      let stageIndex = 0;
      if (Array.isArray(source.forms) && source.forms.length > 0) {
        const normalizedForms = source.forms.map((f) => ({
          name: normalize(f && f.name) || entry.name,
          img: ensureHttps(f && f.img) || entry.image
        })).filter((f) => f.img);
        if (normalizedForms.length > 0) {
          const uniqueStageByName = new Map();
          const stageForms = [];
          normalizedForms.forEach((f) => {
            const key = normalize(f.name) || entry.name;
            if (!uniqueStageByName.has(key)) {
              uniqueStageByName.set(key, uniqueStageByName.size);
              stageForms.push({ name: key, img: ensureHttps(f.img) || entry.image });
            }
          });

          let rawAnchorIndex = normalizedForms.findIndex((f) => normalize(f.name) === entry.name);
          if (rawAnchorIndex < 0) {
            const imageKey = normalize(entry.image);
            rawAnchorIndex = imageKey ? normalizedForms.findIndex((f) => normalize(f.img) === imageKey) : -1;
          }
          if (rawAnchorIndex < 0) rawAnchorIndex = 0;

          // 形态数按“有效去重后名称”计算，避免 1/2 形态被重复第三格误判成 3 形态。
          formCount = Math.max(1, Math.min(3, uniqueStageByName.size));
          const anchorKey = normalize((normalizedForms[rawAnchorIndex] && normalizedForms[rawAnchorIndex].name) || entry.name);
          const dedupStage = uniqueStageByName.get(anchorKey);
          stageIndex = clamp(Number.isFinite(dedupStage) ? dedupStage : 0, 0, formCount - 1);
          const f0 = stageForms[0] || normalizedForms[0];
          const f1 = stageForms[Math.min(1, stageForms.length - 1)] || f0;
          const f2 = stageForms[Math.min(2, stageForms.length - 1)] || f1 || f0;
          forms = [
            { name: normalize(f0 && f0.name) || entry.name, img: ensureHttps(f0 && f0.img) || entry.image },
            { name: normalize(f1 && f1.name) || entry.name, img: ensureHttps(f1 && f1.img) || entry.image },
            { name: normalize(f2 && f2.name) || entry.name, img: ensureHttps(f2 && f2.img) || entry.image }
          ];
        }
      }
      if (forms.length === 0) {
        forms = fallback.forms;
      }

      let skills = Array.isArray(source.skills)
        ? source.skills.map((s) => ({
            skillId: (() => {
              const n = Number(s && s.skillId);
              return Number.isFinite(n) && n > 0 ? n : null;
            })(),
            skillKey: normalize(s && s.skillKey),
            name: normalize(s && s.name),
            level: Number(s && s.level) || 0,
            power: Number(s && s.power),
            pp: Number(s && s.pp),
            accuracy: (() => {
              const n = Number(s && s.accuracy);
              if (!Number.isFinite(n) || n < 0) return 100;
              return n;
            })(),
            attackTypeCode: (() => {
              const n = Number(s && (s.attackTypeCode ?? s.attack_type));
              return Number.isFinite(n) ? n : null;
            })(),
            attackTypeLabel: normalize(s && (s.attackTypeLabel || s.attackType)),
            type: normalize(s && s.type),
            desc: normalize(s && s.desc)
          })).map((s) => {
            const master = pickSkillMaster(s);
            const extractMeta = pickExtractSkillMeta(entry.dexId, s);
            const sid = Number(s.skillId) || Number(master && master.skillId) || null;
            const mPower = Number(master && master.power);
            const mPp = Number(master && master.pp);
            const mAcc = Number(master && master.accuracy);
            const attackTypeCode = Number.isFinite(Number(s.attackTypeCode)) ? Number(s.attackTypeCode) : (Number.isFinite(Number(extractMeta && extractMeta.attackTypeCode)) ? Number(extractMeta.attackTypeCode) : (Number.isFinite(Number(master && master.attackTypeCode)) ? Number(master.attackTypeCode) : null));
            const attackTypeLabel = attackTypeLabelFromCode(attackTypeCode) || normalize(s.attackTypeLabel) || normalize(master && (master.attackTypeLabel || master.attackType));
            return {
              skillId: sid,
              dexId: Number(entry && entry.dexId) || 0,
              skillKey: normalize(s.skillKey) || normalize(master && master.skillKey),
              name: normalize(s.name) || normalize(master && master.name),
              level: Number(s.level) || 0,
              power: Number.isFinite(Number(s.power)) ? Number(s.power) : (Number.isFinite(mPower) ? mPower : 0),
              pp: Number.isFinite(Number(s.pp)) ? Number(s.pp) : (Number.isFinite(mPp) ? mPp : 10),
              accuracy: (() => {
                const a = Number(s.accuracy);
                if (Number.isFinite(a) && a >= 0) return a;
                if (Number.isFinite(mAcc) && mAcc >= 0) return mAcc;
                return 100;
              })(),
              attackTypeCode,
              attackTypeLabel,
              type: buildSkillTypeText(normalize(s.type) || normalize(master && master.type), attackTypeCode, attackTypeLabel),
              desc: normalize(s.desc) || normalize(master && master.desc)
            };
          }).filter((s) => s.name).sort((a, b) => a.level - b.level)
        : [];
      if (skills.length === 0) skills = fallback.skills;

      const race = source.raceStats && typeof source.raceStats === "object"
        ? {
            id: String(entry.dexId),
            name: entry.name,
            hp: safeNonNegInt(source.raceStats.hp),
            atk: safeNonNegInt(source.raceStats.atk),
            def: safeNonNegInt(source.raceStats.def),
            spAtk: safeNonNegInt(source.raceStats.spAtk),
            spDef: safeNonNegInt(source.raceStats.spDef),
            speed: safeNonNegInt(source.raceStats.speed),
            total: safeNonNegInt(
              source.raceStats.total,
              safeNonNegInt(source.raceStats.hp) +
              safeNonNegInt(source.raceStats.atk) +
              safeNonNegInt(source.raceStats.def) +
              safeNonNegInt(source.raceStats.spAtk) +
              safeNonNegInt(source.raceStats.spDef) +
              safeNonNegInt(source.raceStats.speed)
            )
          }
        : null;

      const element = normalizeElementName(source.element) || normalizeElementName(entry.element) || "未知系";
      const subElement = normalizeElementName(source.subElement || source.element2 || "");
      return { forms, skills, raceStats: race, formCount, stageIndex, element, subElement };
    };

    dexEntries.forEach((entry) => {
      const sourceByDex = speciesRawByDex[String(entry.dexId)] || speciesRawByDex[entry.dexId];
      const sourceByName = speciesRaw[entry.name];
      const species = normalizeSpeciesSource(sourceByDex || sourceByName, entry);
      const fromSpeciesMain = normalizeElementName(species.element);
      const fromSpeciesSub = normalizeElementName(species.subElement);
      // 只在 species 给出有效系别时覆盖，避免把图鉴原始系别覆盖成“未知系”
      if (fromSpeciesMain && fromSpeciesMain !== "未知系" && PET_TYPE_ICON[fromSpeciesMain]) {
        entry.element = fromSpeciesMain;
      }
      entry.subElement = fromSpeciesSub && fromSpeciesSub !== entry.element ? fromSpeciesSub : "";
      speciesByDexMap.set(entry.dexId, species);
      if (!speciesMap.has(entry.name)) speciesMap.set(entry.name, species);
    });
    skillExtractLoadPromise.value = applySkillDescFromExtractJson();

    const formNameToDexIds = new Map();
    dexEntries.forEach((entry) => {
      const species = speciesByDexMap.get(entry.dexId);
      if (!species || !Array.isArray(species.forms)) return;
      species.forms.forEach((f) => {
        const key = normalize(f && f.name);
        if (!key) return;
        const arr = formNameToDexIds.get(key) || [];
        if (!arr.includes(entry.dexId)) arr.push(entry.dexId);
        formNameToDexIds.set(key, arr);
      });
    });
    const chainRootByDex = new Map();
    const chainDexIdsByRoot = new Map();
    const evoLevelsByRoot = new Map();
    const evoData = (typeof window !== "undefined" && window.AOLA_EVOLUTION_CHAINS && Array.isArray(window.AOLA_EVOLUTION_CHAINS.chains))
      ? window.AOLA_EVOLUTION_CHAINS.chains
      : [];
    evoData.forEach((chain) => {
      const members = Array.isArray(chain && chain.members) ? chain.members : [];
      const ids = [];
      const levels = [];
      members.forEach((m) => {
        const id = Number(m && m.race_id) || 0;
        if (id <= 0) return;
        ids.push(id);
        const lv = Number(m && m.evo_level);
        levels.push(Number.isFinite(lv) && lv >= 0 ? lv : null);
      });
      const uniqIds = Array.from(new Set(ids)).filter((n) => n > 0);
      if (uniqIds.length <= 0) return;
      const rootId = uniqIds[0];
      chainDexIdsByRoot.set(rootId, uniqIds);
      evoLevelsByRoot.set(rootId, levels.slice(0, uniqIds.length));
      uniqIds.forEach((id) => chainRootByDex.set(id, rootId));
    });
    chainRootByDex.set(QIXING_ANCIENT_STAR_DRAGON_DEX.rootDexId, QIXING_ANCIENT_STAR_DRAGON_DEX.rootDexId);
    chainRootByDex.set(QIXING_ANCIENT_STAR_DRAGON_DEX.dexId, QIXING_ANCIENT_STAR_DRAGON_DEX.rootDexId);
    chainDexIdsByRoot.set(QIXING_ANCIENT_STAR_DRAGON_DEX.rootDexId, [QIXING_ANCIENT_STAR_DRAGON_DEX.rootDexId, QIXING_ANCIENT_STAR_DRAGON_DEX.dexId]);
    evoLevelsByRoot.set(QIXING_ANCIENT_STAR_DRAGON_DEX.rootDexId, [0, 40]);
    // CSV 中缺失的条目回退为单形态
    dexEntries.forEach((entry) => {
      if (chainRootByDex.has(entry.dexId)) return;
      chainRootByDex.set(entry.dexId, entry.dexId);
      chainDexIdsByRoot.set(entry.dexId, [entry.dexId]);
      evoLevelsByRoot.set(entry.dexId, [null]);
    });
    const rootDexByFormName = new Map();
    formNameToDexIds.forEach((ids, name) => {
      const root = Array.isArray(ids) && ids.length > 0 ? Math.min(...ids.map((n) => Number(n) || 0).filter(Boolean)) : 0;
      if (root > 0) rootDexByFormName.set(name, root);
    });

    const getSpeciesByDexId = (dexId, fallbackName = "") => {
      const id = Number(dexId) || 0;
      if (id > 0 && speciesByDexMap.has(id)) return speciesByDexMap.get(id);
      if (fallbackName && speciesMap.has(fallbackName)) return speciesMap.get(fallbackName);
      const dex = (id > 0 && dexById.get(id)) || dexEntries.find((d) => d.name === fallbackName);
      return dex ? buildFallbackSpecies(dex) : null;
    };
    const resolveEvolutionDexIdByPetAndStage = (pet, stage) => {
      const anchorDexId = Number((pet && pet.baseDexId) || (pet && pet.dexId)) || 0;
      const rootDexId = chainRootByDex.get(anchorDexId) || anchorDexId || 0;
      if (!rootDexId) return anchorDexId;
      const chainIds = chainDexIdsByRoot.get(rootDexId) || [rootDexId];
      const count = Math.max(1, chainIds.length || 1);
      const s = clamp(Number(stage) || 0, 0, count - 1);
      return Number(chainIds[s]) || rootDexId;
    };
    const shouldRecycleNoActionOwnedDex = (dexId) => {
      const id = Number(dexId) || 0;
      if (!id || EXTRA_PERSIST_DEX_IDS.has(id)) return false;
      const rootDexId = chainRootByDex.get(id) || id;
      const chainIds = chainDexIdsByRoot.get(rootDexId) || [id];
      return [id, rootDexId, ...chainIds].some((n) => isNoEggActionDexId(n));
    };
    const shouldRecycleOwnedPetRow = (row) => {
      if (isRedeemCodeBonusPetRow(row)) return false;
      return shouldRecycleNoActionOwnedDex(row && row.dexId);
    };

    const stageIndexByLevelAndCount = (level, formCount, evoLevels = null) => {
      const lv = clamp(Number(level) || 1, 1, 100);
      const count = clamp(Number(formCount) || 1, 1, 9999);
      if (count <= 1) return 0;
      const levels = Array.isArray(evoLevels) ? evoLevels : [];
      if (levels.length >= count && levels.some((x) => Number.isFinite(Number(x)))) {
        let idx = 0;
        for (let i = 1; i < count; i += 1) {
          const needLv = Number(levels[i]);
          if (Number.isFinite(needLv) && lv >= needLv) idx = i;
        }
        return clamp(idx, 0, count - 1);
      }
      if (count === 2) return lv >= 40 ? 1 : 0;
      if (lv >= 40) return Math.min(2, count - 1);
      if (lv >= 20) return Math.min(1, count - 1);
      return 0;
    };
    const getChainStageInfoByDexId = (dexId, fallbackName = "") => {
      const id = Number(dexId) || 0;
      const rootDexId = chainRootByDex.get(id) || id || 0;
      if (!rootDexId) return { rootDexId: id, formCount: 1, stageIndex: 0 };
      const chainIds = chainDexIdsByRoot.get(rootDexId) || [rootDexId];
      const evoLevels = evoLevelsByRoot.get(rootDexId) || [];
      const formCount = Math.max(1, chainIds.length || 1);
      const idx = chainIds.indexOf(id);
      const stageIndex = idx >= 0 ? idx : 0;
      return {
        rootDexId: Number(chainIds[0]) || rootDexId,
        formCount,
        stageIndex: clamp(stageIndex, 0, formCount - 1),
        evoLevels: evoLevels.slice(0, formCount)
      };
    };
    const levelStageIndexForPet = (pet, chainInfo = null) => {
      const anchorDexId = Number((pet && pet.baseDexId) || (pet && pet.dexId)) || 0;
      const chain = chainInfo || getChainStageInfoByDexId(anchorDexId, pet && pet.speciesName);
      return stageIndexByLevelAndCount(pet && pet.level, chain.formCount, chain.evoLevels);
    };
    const resolvePetStageIndex = (pet, chainInfo = null) => {
      if (!pet || typeof pet !== "object") return 0;
      const anchorDexId = Number((pet && pet.baseDexId) || (pet && pet.dexId)) || 0;
      const chain = chainInfo || getChainStageInfoByDexId(anchorDexId, pet && pet.speciesName);
      const levelStage = levelStageIndexForPet(pet, chain);
      const fixedStage = Number(pet.fixedStageIndex);
      if (Number.isFinite(fixedStage)) {
        return clamp(Math.max(levelStage, fixedStage), 0, Math.max(1, Number(chain.formCount) || 1) - 1);
      }
      return levelStage;
    };
    const skillLevelForPet = (pet) => {
      if (!pet) return null;
      const level = clamp(Math.floor(Number(pet.level) || 1), 1, 100);
      const unlocked = clamp(Math.floor(Number(pet.skillUnlockLevel) || level), 1, 100);
      return Math.max(level, unlocked);
    };
    const expectedStageByLevel = (level, formCount = 3, evoLevels = null) => stageIndexByLevelAndCount(level, formCount, evoLevels);
    const resolveDexFromSaved = ({ dexId, speciesName, level }) => {
      const sid = Number(dexId) || 0;
      const name = normalize(speciesName);
      const lv = clamp(Number(level) || 1, 1, 100);
      const byId = sid > 0 ? (dexById.get(sid) || null) : null;

      if (byId) return byId;
      if (!name) return dexEntries[0] || null;

      // 存档里可能保存的是“当前形态名”，先回推到该进化链根ID，确保20/40级进化规则稳定生效。
      const rootId = Number(rootDexByFormName.get(name)) || 0;
      if (rootId > 0 && dexById.has(rootId)) return dexById.get(rootId);

      const byFormCandidates = formNameToDexIds.get(name) || [];
      if (byFormCandidates.length > 0) {
        const stage = expectedStageByLevel(lv, 3);
        let hit = null;
        for (const id of byFormCandidates) {
          const species = speciesByDexMap.get(id);
          const count = Math.max(1, Number(species && species.formCount) || 1);
          const idx = expectedStageByLevel(lv, count);
          const form = species && Array.isArray(species.forms) ? species.forms[idx] : null;
          if (normalize(form && form.name) === name) {
            hit = dexById.get(id) || null;
            break;
          }
        }
        if (!hit) hit = dexById.get(byFormCandidates[0]) || null;
        if (hit) return hit;
      }

      const byExactName = dexByName.get(name) || null;
      if (byExactName) return byExactName;

      return byId || dexEntries[0] || null;
    };

    const findDexByName = (name) => dexEntries.find((d) => d.name === name);
    const starterPets = STARTER_DEX_IDS.map((dexId) => {
      const dex = dexById.get(Number(dexId)) || null;
      if (!dex) return null;
      const species = getSpeciesByDexId(dex.dexId, dex.name) || buildFallbackSpecies(dex);
      const equipped = normalizeEquippedSkillsBySpecies(
        species,
        species.skills.filter((s) => s.level <= 10).slice(0, 4).map((s) => s.name),
        10
      );
      return {
        id: uid(),
        dexId: dex.dexId,
        baseDexId: dex.dexId,
        speciesName: dex.name,
        element: normalize(dex.element) || "未知系",
        subElement: normalize(dex.subElement),
        level: 10,
        exp: 0,
        totalExp: 0,
        talent: createRandomHatchTalent(),
        study: createZeroStats(),
        equippedSkills: equipped,
        createdAt: Date.now()
      };
    }).filter(Boolean);

    const createInitialState = () => {
      const bagSeed = starterPets.slice(0, 6).map((p) => p.id);
      while (bagSeed.length < 6) bagSeed.push("");
      const starterActivated = Array.from(new Set(starterPets.map((p) => resolveEvolutionDexIdByPetAndStage(p, 0))));
      return {
        activatedDexIds: starterActivated,
        defeatedDexIds: [],
        obtainedEggDexIds: [],
        activePets: starterPets,
        bagPetIds: bagSeed,
        eggs: [],
        redeemedCodes: [],
        selectedDexId: null,
        challengeFormIndex: 0,
        selectedAttackerId: bagSeed[0] || "",
        selectedPetId: (starterPets[0] && starterPets[0].id) || "",
        items: { level_40_fruit: 1 },
        hCoins: 200,
        guardianWinCounts: {},
        bossFirstWinRewardV1: null,
        bossDifficultyFirstWinRewards: {},
        weeklyBossAttempts: { bossKey: WEEKLY_BOSS_CONFIG.key, date: "", used: 0 },
        weeklyBossHonorRewards: {},
        weeklyBossRewardState: { bossKey: WEEKLY_BOSS_CONFIG.key, divinePetKeyClaimed: false, exchangedEgg: false },
        qixingSeals: [],
        qixingGacha: { pity: 0, pityByKey: { phase1_ice_princess: 0, phase2_qiankun_skin: 0 }, limitedEggs: {} },
        equippedBadgeId: "",
        targetLevel: 10,
        timeTunnelMaxClearedFloor: 0,
        timeTunnelRewardClaimedFloors: [],
        battleLog: [],
        showDexPanel: false,
        maxBagBattlePower: 0,
        battleSpeed: 1,
        battleBackground: {
          mode: "default",
          src: DEFAULT_BATTLE_BG_SRC,
          name: "默认战斗背景"
        }
      };
    };
    const createBootState = () => ({
      ...createInitialState(),
      activatedDexIds: [],
      activePets: [],
      bagPetIds: ["", "", "", "", "", ""],
      selectedAttackerId: "",
      selectedPetId: ""
    });

    const sanitizeState = (loaded) => {
      if (!loaded || typeof loaded !== "object") return createInitialState();
      const activePets = Array.isArray(loaded.activePets) ? loaded.activePets.map((p) => {
        const nameInSave = normalize(p.speciesName);
        const dex = resolveDexFromSaved({ dexId: p.dexId, speciesName: nameInSave, level: p.level });
        if (!dex) return null;
        const species = getSpeciesByDexId(dex.dexId, dex.name);
        if (!species) return null;
        const level = clamp(Number(p.level) || 1, 1, 100);
        const skillUnlockLevel = clamp(Math.max(level, Number(p.skillUnlockLevel) || level), 1, 100);
        const savedBase = Number(p.baseDexId) || 0;
        const anchor = savedBase || dex.dexId;
        const chain = getChainStageInfoByDexId(anchor, nameInSave || dex.name);
        const rootDexId = chain.rootDexId || chainRootByDex.get(anchor) || anchor;
        const savedDexChain = getChainStageInfoByDexId(dex.dexId, nameInSave || dex.name);
        const levelStage = stageIndexByLevelAndCount(level, chain.formCount, chain.evoLevels);
        const savedFixedStage = Number(p.fixedStageIndex);
        const fixedStageIndex = Number.isFinite(savedFixedStage)
          ? clamp(savedFixedStage, 0, Math.max(1, Number(chain.formCount) || 1) - 1)
          : (savedDexChain.stageIndex > levelStage ? clamp(savedDexChain.stageIndex, 0, Math.max(1, Number(chain.formCount) || 1) - 1) : null);
        const currentDexId = fixedStageIndex !== null
          ? resolveEvolutionDexIdByPetAndStage({ dexId: rootDexId, baseDexId: rootDexId, speciesName: nameInSave || dex.name }, fixedStageIndex)
          : Number(dex.dexId);
        const currentDex = dexById.get(Number(currentDexId) || 0) || dex;
        const currentSpecies = getSpeciesByDexId(currentDex.dexId, currentDex.name) || species;
        const extraSkills = sanitizePetExtraSkills(p.extraSkills);
        const sanitizedPet = {
          id: String(p.id || uid()),
          dexId: currentDex.dexId,
          baseDexId: rootDexId,
          speciesName: currentDex.name,
          element: normalize(currentDex.element) || normalize(p.element) || normalize(dex.element) || "未知系",
          subElement: normalize(currentDex.subElement) || normalize(p.subElement) || normalize(dex.subElement),
          level,
          exp: Math.max(0, Number(p.exp) || 0),
          totalExp: Math.max(0, Number(p.totalExp) || 0),
          talent: normalizeTalent(p.talent),
          study: normalizeStudy(p.study),
          skillUnlockLevel,
          extraSkills,
          equippedSkills: currentEquippedSkillNamesBySpecies(currentSpecies, p.equippedSkills, skillUnlockLevel, extraSkills),
          talentRerollCount: Math.max(0, Math.floor(Number(p.talentRerollCount) || 0)),
          equippedItemId: normalize(p.equippedItemId),
          equippedItemInstanceId: normalize(p.equippedItemInstanceId),
          skinKey: normalize(p.skinKey) === QIANKUN_XIULUOSHEN_SKIN_KEY ? QIANKUN_XIULUOSHEN_SKIN_KEY : "",
          source: normalize(p.source),
          createdAt: Number(p.createdAt) || Date.now()
        };
        if (fixedStageIndex !== null) sanitizedPet.fixedStageIndex = fixedStageIndex;
        return sanitizedPet;
      }).filter((pet) => pet && canPersistPetRow(pet) && !shouldRecycleOwnedPetRow(pet)) : [];

      const eggs = Array.isArray(loaded.eggs) ? loaded.eggs.map((e) => {
        const nameInSave = normalize(e.speciesName);
        const dex = resolveDexFromSaved({ dexId: e.dexId, speciesName: nameInSave, level: 1 });
        if (!dex) return null;
        const species = getSpeciesByDexId(dex.dexId, dex.name);
        if (!species) return null;
        return {
          id: String(e.id || uid()),
          dexId: dex.dexId,
          speciesName: dex.name,
          source: normalize(e.source),
          startAt: Number(e.startAt) || Date.now(),
          hatchAt: Number(e.hatchAt) || (Date.now() + HATCH_MS)
        };
      }).filter((egg) => egg && (canPersistPetRow(egg) || canObtainEggByActionDexId(egg.dexId)) && !shouldRecycleOwnedPetRow(egg)) : [];

      const activated = new Set(Array.isArray(loaded.activatedDexIds) ? loaded.activatedDexIds.map((n) => Number(n)).filter(Boolean) : []);
      const defeated = new Set(Array.isArray(loaded.defeatedDexIds) ? loaded.defeatedDexIds.map((n) => Number(n)).filter((n) => n > 0) : []);
      activePets.forEach((p) => {
        const chain = getChainStageInfoByDexId(p.dexId, p.speciesName);
        const stage = resolvePetStageIndex(p, chain);
        const evoDexId = resolveEvolutionDexIdByPetAndStage(p, stage);
        if (evoDexId > 0) activated.add(evoDexId);
        const baseDexId = resolveEvolutionDexIdByPetAndStage(p, 0);
        if (baseDexId > 0) activated.add(baseDexId);
      });
      eggs.forEach((e) => activated.add(e.dexId));
      if (activePets.length === 0) {
        starterPets.forEach((s) => {
          activePets.push({ ...s, id: uid() });
          const baseDexId = resolveEvolutionDexIdByPetAndStage(s, 0);
          if (baseDexId > 0) activated.add(baseDexId);
        });
      }

      const fallbackBag = activePets.slice(0, 6).map((p) => p.id);
      let bagPetIds = normalizeBagIds(Array.isArray(loaded.bagPetIds) ? loaded.bagPetIds : fallbackBag, activePets);
      if (!bagPetIds.some((id) => normalize(id))) {
        bagPetIds = normalizeBagIds(fallbackBag, activePets);
      }
      const selectedAttackerId = bagPetIds[0] || "";
      const qixingSeals = (() => {
        const out = [];
        const seen = new Set();
        const legacyLevel = clamp(Math.floor(Number(loaded.qixingSealLevel) || 1), 1, QIXING_SEAL_MAX_LEVEL);
        const pushSeal = (raw = {}) => {
          const id = normalize(raw.id) || uid();
          if (seen.has(id)) return null;
          seen.add(id);
          const equippedPetId = normalize(raw.equippedPetId);
          const seal = {
            id,
            level: clamp(Math.floor(Number(raw.level) || legacyLevel), 1, QIXING_SEAL_MAX_LEVEL),
            traitKey: normalizeQixingTraitKey(raw.traitKey || raw.key),
            upgradeFailCount: Math.max(0, Math.floor(Number(raw.upgradeFailCount) || 0)),
            equippedPetId: equippedPetId && activePets.some((p) => p.id === equippedPetId) ? equippedPetId : ""
          };
          out.push(seal);
          return seal;
        };
        if (Array.isArray(loaded.qixingSeals)) {
          loaded.qixingSeals.forEach((seal) => pushSeal(seal && typeof seal === "object" ? seal : {}));
        }
        activePets.forEach((pet) => {
          if (normalize(pet.equippedItemId) !== QIXING_SEAL_ITEM_ID) return;
          let seal = out.find((row) => normalize(row.equippedPetId) === pet.id);
          if (!seal) seal = out.find((row) => !normalize(row.equippedPetId));
          if (!seal) seal = pushSeal({ level: legacyLevel });
          if (seal) {
            seal.equippedPetId = pet.id;
            pet.equippedItemInstanceId = seal.id;
          }
        });
        const legacyCount = Math.max(0, Math.floor(Number(loaded.items && loaded.items[QIXING_SEAL_ITEM_ID]) || 0));
        while (out.filter((seal) => !normalize(seal.equippedPetId)).length < legacyCount) pushSeal({ level: 1 });
        return out;
      })();
      const obtainedEggDexIds = Array.isArray(loaded.obtainedEggDexIds) ? loaded.obtainedEggDexIds.map((n) => Number(n)).filter((n) => n > 0 && canObtainEggByActionDexId(n) && !shouldRecycleNoActionOwnedDex(n)) : [];
      const redeemedCodes = Array.isArray(loaded.redeemedCodes) ? Array.from(new Set(loaded.redeemedCodes.map((code) => normalize(code).toUpperCase()).filter(Boolean))) : [];
      const items = (() => {
        const source = (loaded.items && typeof loaded.items === "object") ? { ...loaded.items } : {};
        if (!Object.prototype.hasOwnProperty.call(loaded, "items")) source.level_40_fruit = Math.max(1, Number(source.level_40_fruit) || 0);
        source[QIXING_SEAL_ITEM_ID] = 0;
        return source;
      })();
      const migrations = (() => {
        const source = loaded.migrations && typeof loaded.migrations === "object" ? loaded.migrations : {};
        return {
          ...source,
          [SUPER_DICE_BOMB_STONE_BACKFILL_MIGRATION_KEY]: Boolean(source[SUPER_DICE_BOMB_STONE_BACKFILL_MIGRATION_KEY])
        };
      })();
      const ownsDiceKing = activePets.some((pet) => {
        const ids = [pet && pet.dexId, pet && pet.baseDexId, resolveEvolutionDexIdByPetAndStage(pet, 0)]
          .map((id) => Number(id) || 0);
        return ids.includes(DICE_KING_DEX_ID) || normalize(pet && pet.speciesName) === "骰子大王";
      });
      const ownsDiceKingEgg = eggs.some((egg) => Number(egg && egg.dexId) === DICE_KING_DEX_ID || normalize(egg && egg.speciesName) === "骰子大王")
        || obtainedEggDexIds.includes(DICE_KING_DEX_ID);
      const alreadyLearnedSuperDiceBomb = activePets.some((pet) => skillNameSetFromList(petExtraSkills(pet)).has(normalizeSkillKey(SUPER_DICE_BOMB_SKILL.name)));
      const hasSuperDiceBombStone = Math.max(0, Math.floor(Number(items[SUPER_DICE_BOMB_SKILL_STONE_ITEM_ID]) || 0)) > 0;
      if (!migrations[SUPER_DICE_BOMB_STONE_BACKFILL_MIGRATION_KEY]) {
        if ((ownsDiceKing || ownsDiceKingEgg) && !alreadyLearnedSuperDiceBomb && !hasSuperDiceBombStone) {
          items[SUPER_DICE_BOMB_SKILL_STONE_ITEM_ID] = 1;
        }
        migrations[SUPER_DICE_BOMB_STONE_BACKFILL_MIGRATION_KEY] = true;
      }
      if (redeemedCodes.includes(SHOP_REDEEM_CODE_ALHUB666) && !migrations[SHOP_REDEEM_CODE_ALHUB666_BACKFILL_MIGRATION_KEY]) {
        const alreadyHasCurrentReward = activePets.some(isAlhub666CurrentRewardRow) || eggs.some(isAlhub666CurrentRewardRow);
        const entry = dexById.get(SHOP_REDEEM_CODE_ALHUB666_DEX_ID) || findDexByName(SHOP_REDEEM_CODE_ALHUB666_PET_NAME);
        if (!alreadyHasCurrentReward && entry) {
          eggs.unshift({
            id: uid(),
            dexId: entry.dexId,
            speciesName: entry.name,
            source: SHOP_REDEEM_CODE_ALHUB666_SOURCE,
            startAt: Date.now(),
            hatchAt: Date.now() + HATCH_MS
          });
          activated.add(entry.dexId);
        }
        migrations[SHOP_REDEEM_CODE_ALHUB666_BACKFILL_MIGRATION_KEY] = true;
      }
      return {
        activatedDexIds: Array.from(activated),
        defeatedDexIds: Array.from(defeated),
        obtainedEggDexIds,
        activePets,
        bagPetIds,
        eggs,
        redeemedCodes,
        items,
        migrations,
        hCoins: Object.prototype.hasOwnProperty.call(loaded, "hCoins") ? Math.max(0, Math.floor(Number(loaded.hCoins) || 0)) : 200,
        battleSpeed: clampBattleSpeed(loaded.battleSpeed || 1),
        guardianWinCounts: (() => {
          const source = loaded.guardianWinCounts && typeof loaded.guardianWinCounts === "object" ? loaded.guardianWinCounts : {};
          const out = {};
          Object.keys(source).forEach((name) => {
            const key = resolveGuardianName(name);
            const count = Math.max(0, Math.floor(Number(source[name]) || 0));
            if (key && count > 0) out[key] = Math.max(0, Math.floor(Number(out[key]) || 0)) + count;
          });
          return out;
        })(),
        bossFirstWinRewardV1: loaded.bossFirstWinRewardV1 && typeof loaded.bossFirstWinRewardV1 === "object" && normalize(loaded.bossFirstWinRewardV1.bossName)
          ? { bossName: normalize(loaded.bossFirstWinRewardV1.bossName) }
          : null,
        bossDifficultyFirstWinRewards: (() => {
          const source = loaded.bossDifficultyFirstWinRewards && typeof loaded.bossDifficultyFirstWinRewards === "object" ? loaded.bossDifficultyFirstWinRewards : {};
          const out = {};
          Object.keys(source).forEach((rawKey) => {
            const row = source[rawKey] && typeof source[rawKey] === "object" ? source[rawKey] : {};
            const bossName = normalize(row.bossName);
            const difficulty = normalize(row.difficulty);
            if (!bossName || !BOSS_DIFFICULTY_FIRST_WIN_REWARDS[difficulty]) return;
            out[`${bossName}::${difficulty}`] = {
              bossName,
              difficulty,
              claimedAt: Math.max(0, Math.floor(Number(row.claimedAt) || 0))
            };
          });
          return out;
        })(),
        weeklyBossAttempts: (() => {
          const source = loaded.weeklyBossAttempts && typeof loaded.weeklyBossAttempts === "object" ? loaded.weeklyBossAttempts : {};
          const bossKey = normalize(source.bossKey);
          if (bossKey !== WEEKLY_BOSS_CONFIG.key) return { bossKey: WEEKLY_BOSS_CONFIG.key, date: "", used: 0 };
          return {
            bossKey: WEEKLY_BOSS_CONFIG.key,
            date: normalize(source.date),
            used: Math.max(0, Math.floor(Number(source.used) || 0))
          };
        })(),
        weeklyBossHonorRewards: (() => {
          const source = loaded.weeklyBossHonorRewards && typeof loaded.weeklyBossHonorRewards === "object" ? loaded.weeklyBossHonorRewards : {};
          const out = {};
          Object.keys(source).forEach((rawKey) => {
            const row = source[rawKey] && typeof source[rawKey] === "object" ? source[rawKey] : {};
            const config = resolveWeeklyBossHistoryConfig(rawKey, row);
            const name = normalize(row.name) || (config && config.honorBadgeName) || "";
            if (!name) return;
            const key = (config && config.key) || normalize(rawKey) || WEEKLY_BOSS_CONFIG.key;
            out[key] = {
              name,
              bossName: normalize(row.bossName) || normalize(row.guardianName) || (config && config.name) || key,
              badgeId: normalize(row.badgeId) || (config && config.honorBadgeId) || "",
              claimedAt: Math.max(0, Math.floor(Number(row.claimedAt) || 0))
            };
          });
          return out;
        })(),
        weeklyBossRewardState: (() => {
          const source = loaded.weeklyBossRewardState && typeof loaded.weeklyBossRewardState === "object" ? loaded.weeklyBossRewardState : {};
          const bossKey = normalize(source.bossKey);
          const clearedSource = source.clearedDifficulties && typeof source.clearedDifficulties === "object" ? source.clearedDifficulties : {};
          const clearedDifficulties = {};
          WEEKLY_BOSS_DIFFICULTY_OPTIONS.forEach((option) => {
            if (clearedSource[option.key]) clearedDifficulties[option.key] = true;
          });
          return {
            bossKey: bossKey === WEEKLY_BOSS_CONFIG.key ? WEEKLY_BOSS_CONFIG.key : WEEKLY_BOSS_CONFIG.key,
            divinePetKeyClaimed: Boolean(source.divinePetKeyClaimed),
            exchangedEgg: Boolean(source.exchangedEgg),
            clearedDifficulties
          };
        })(),
        qixingSeals,
        qixingGacha: (() => {
          const source = loaded.qixingGacha && typeof loaded.qixingGacha === "object" ? loaded.qixingGacha : {};
          const limitedEggs = source.limitedEggs && typeof source.limitedEggs === "object" ? source.limitedEggs : {};
          const pityByKey = source.pityByKey && typeof source.pityByKey === "object" ? source.pityByKey : {};
          const legacyPity = Math.max(0, Math.floor(Number(source.pity) || 0));
          return {
            pity: legacyPity,
            pityByKey: {
              ice_princess: Math.max(0, Math.floor(Number(pityByKey.ice_princess ?? legacyPity) || 0)),
              ancient_star_dragon: Math.max(0, Math.floor(Number(pityByKey.ancient_star_dragon ?? legacyPity) || 0)),
              phase1_ice_princess: Math.max(0, Math.floor(Number(pityByKey.phase1_ice_princess ?? pityByKey.ice_princess ?? legacyPity) || 0)),
              phase2_ancient_star_dragon: Math.max(0, Math.floor(Number(pityByKey.phase2_ancient_star_dragon ?? pityByKey.ancient_star_dragon ?? legacyPity) || 0)),
              phase2_qiankun_skin: Math.max(0, Math.floor(Number(pityByKey.phase2_qiankun_skin ?? pityByKey.phase2_ancient_star_dragon ?? pityByKey.ancient_star_dragon ?? legacyPity) || 0))
            },
            limitedEggs: {
              ice_princess: Boolean(limitedEggs.ice_princess),
              emperor_holy_dragon: Boolean(limitedEggs.emperor_holy_dragon),
              ice_crystal_phoenix: Boolean(limitedEggs.ice_crystal_phoenix),
              qingzhan: Boolean(limitedEggs.qingzhan),
              ancient_star_dragon: Boolean(limitedEggs.ancient_star_dragon),
              phase1_ice_princess: Boolean(limitedEggs.phase1_ice_princess || limitedEggs.ice_princess),
              phase2_ice_princess: Boolean(limitedEggs.phase2_ice_princess),
              phase2_ancient_star_dragon: Boolean(limitedEggs.phase2_ancient_star_dragon || limitedEggs.ancient_star_dragon),
              phase2_qiankun_skin: Boolean(limitedEggs.phase2_qiankun_skin || activePets.some((pet) => normalize(pet && pet.skinKey) === QIANKUN_XIULUOSHEN_SKIN_KEY))
            }
          };
        })(),
        equippedBadgeId: normalize(loaded.equippedBadgeId),
        selectedDexId: dexEntries.some((d) => d.dexId === Number(loaded.selectedDexId)) ? Number(loaded.selectedDexId) : null,
        challengeFormIndex: clamp(Number(loaded.challengeFormIndex) || 0, 0, 2),
        selectedAttackerId,
        selectedPetId: activePets.some((p) => p.id === loaded.selectedPetId) ? loaded.selectedPetId : ((activePets[0] && activePets[0].id) || ""),
        targetLevel: clamp(Number(loaded.targetLevel) || 10, 1, 100),
        timeTunnelMaxClearedFloor: clamp(Math.floor(Number(loaded.timeTunnelMaxClearedFloor) || 0), 0, TIME_TUNNEL_OPEN_MAX_FLOOR),
        timeTunnelRewardClaimedFloors: Array.isArray(loaded.timeTunnelRewardClaimedFloors)
          ? Array.from(new Set(loaded.timeTunnelRewardClaimedFloors.map((n) => Math.floor(Number(n) || 0)).filter((n) => n > 0 && n <= TIME_TUNNEL_OPEN_MAX_FLOOR && n % TIME_TUNNEL_REWARD_INTERVAL === 0))).sort((a, b) => a - b)
          : [],
        battleLog: sanitizeBattleLog(loaded.battleLog),
        showDexPanel: false,
        maxBagBattlePower: Math.max(0, Math.floor(Number(loaded.maxBagBattlePower) || 0)),
        battleBackground: (() => {
          const source = loaded.battleBackground && typeof loaded.battleBackground === "object" ? loaded.battleBackground : {};
          const mode = normalize(source.mode) === "custom" ? "custom" : "default";
          const src = mode === "custom" && normalize(source.src) ? String(source.src) : DEFAULT_BATTLE_BG_SRC;
          const name = mode === "custom" && normalize(source.name) ? normalize(source.name) : "默认战斗背景";
          return { mode, src, name };
        })()
      };
    };

    const extractSavePayload = (raw) => {
      let cur = raw;
      for (let i = 0; i < 4; i += 1) {
        if (!cur || typeof cur !== "object" || Array.isArray(cur)) return cur;
        if (cur.save && typeof cur.save === "object") {
          cur = cur.save.save && typeof cur.save.save === "object" ? cur.save.save : cur.save;
          continue;
        }
        if (cur.state && typeof cur.state === "object") { cur = cur.state; continue; }
        if (cur.data && typeof cur.data === "object") { cur = cur.data; continue; }
        if (cur.payload && typeof cur.payload === "object") { cur = cur.payload; continue; }
        return cur;
      }
      return cur;
    };
    const looksLikeGameSave = (raw) => {
      const obj = extractSavePayload(raw);
      if (!obj || typeof obj !== "object" || Array.isArray(obj)) return false;
      const arrayFields = ["activePets", "bagPetIds", "activatedDexIds", "defeatedDexIds", "obtainedEggDexIds", "eggs", "battleLog"];
      if (arrayFields.some((key) => Array.isArray(obj[key]))) return true;
      if (obj.items && typeof obj.items === "object") return true;
      if (obj.guardianWinCounts && typeof obj.guardianWinCounts === "object") return true;
      if (Object.prototype.hasOwnProperty.call(obj, "hCoins")) return true;
      if (Object.prototype.hasOwnProperty.call(obj, "timeTunnelMaxClearedFloor")) return true;
      return false;
    };
    const parseLocalSaveText = (text) => {
      const rawText = String(text || "").trim();
      if (!rawText) throw new Error("本地存档文件为空。");
      let parsed = null;
      try {
        parsed = JSON.parse(rawText);
      } catch {
        throw new Error("本地存档不是有效的 JSON 文件。");
      }
      if (!looksLikeGameSave(parsed)) throw new Error("本地存档格式不正确，未覆盖当前进度。");
      return extractSavePayload(parsed);
    };

    const storageAdapter = createStorageAdapter();
    const loadLocalState = () => {
      try {
        const text = storageAdapter.loadRaw();
        if (!text) return createInitialState();
        return sanitizeState(JSON.parse(text));
      } catch {
        return createInitialState();
      }
    };
    const readSessionMode = () => {
      try {
        const mode = localStorage.getItem(SESSION_MODE_KEY);
        return mode === "guest" || mode === "user" ? mode : "";
      } catch {
        return "";
      }
    };
    const writeSessionMode = (mode) => {
      try {
        if (mode) localStorage.setItem(SESSION_MODE_KEY, mode);
        else localStorage.removeItem(SESSION_MODE_KEY);
      } catch {}
    };
    const readAuthToken = () => {
      try { return localStorage.getItem(AUTH_TOKEN_KEY) || ""; } catch { return ""; }
    };
    const writeAuthToken = (token) => {
      try {
        if (token) localStorage.setItem(AUTH_TOKEN_KEY, token);
        else localStorage.removeItem(AUTH_TOKEN_KEY);
      } catch {}
    };
    const readRememberLogin = () => {
      try {
        const raw = JSON.parse(localStorage.getItem(REMEMBER_LOGIN_KEY) || "{}");
        return {
          remember: Boolean(raw && raw.remember),
          username: normalize(raw && raw.username),
          password: String((raw && raw.password) || "")
        };
      } catch {
        return { remember: false, username: "", password: "" };
      }
    };
    const writeRememberLogin = (username, password) => {
      try {
        if (!rememberPassword.value) {
          localStorage.removeItem(REMEMBER_LOGIN_KEY);
          return;
        }
        localStorage.setItem(REMEMBER_LOGIN_KEY, JSON.stringify({
          remember: true,
          username: normalize(username),
          password: String(password || "")
        }));
      } catch {}
    };
    const readLoginCaptchaVerified = () => {
      try { return localStorage.getItem(LOGIN_CAPTCHA_VERIFIED_KEY) === "1"; } catch { return false; }
    };
    const writeLoginCaptchaVerified = () => {
      loginCaptchaVerified.value = true;
      try { localStorage.setItem(LOGIN_CAPTCHA_VERIFIED_KEY, "1"); } catch {}
    };
    const readBgmVolume = () => {
      try {
        const raw = Number(localStorage.getItem(BGM_VOLUME_KEY));
        return Number.isFinite(raw) ? clamp(raw, 0, 1) : 0.55;
      } catch {
        return 0.55;
      }
    };
    const writeBgmVolume = (value) => {
      try { localStorage.setItem(BGM_VOLUME_KEY, String(clamp(Number(value) || 0, 0, 1))); } catch {}
    };
    const readBattleSpeed = () => {
      try {
        const raw = Number(localStorage.getItem(BATTLE_SPEED_KEY));
        return Number.isFinite(raw) ? clampBattleSpeed(raw) : 1;
      } catch {
        return 1;
      }
    };
    const writeBattleSpeed = (value) => {
      try { localStorage.setItem(BATTLE_SPEED_KEY, String(clampBattleSpeed(value))); } catch {}
    };
    const saveState = (nextState) => {
      if (playMode.value !== "guest" && storageAdapter.mode === "localStorage") return;
      try { storageAdapter.saveRaw(JSON.stringify(nextState)); } catch {}
    };

    const state = ref(createBootState());
    const playMode = ref("");
    const authReady = ref(false);
    const authUser = ref(null);
    const authUsername = ref("");
    const authPassword = ref("");
    const authCaptcha = ref("");
    const rememberPassword = ref(false);
    const authMode = ref("login");
    const authLoading = ref(false);
    const saveLoading = ref(false);
    const lastServerSavedAt = ref("");
    const guestImportInput = ref(null);
    const userImportInput = ref(null);
    const bgmVolume = ref(readBgmVolume());
    const battleSpeed = ref(readBattleSpeed());
    const settingsTab = ref("sound");
    const isAndroidWebView = isAndroidWebViewRuntime();
    const battlePrepare = ref({ open: false, progress: 0, label: "", target: null, targets: [], teamSlots: [] });
    const dexSearch = ref("");
    const dexElementFilter = ref("全部系别");
    const dexDefeatFilter = ref("全部战绩");
    const warehouseSearch = ref("");
    const warehouseElementFilter = ref("全部系别");
    const warehouseSortMode = ref("created");
    const nowTs = ref(Date.now());
    const isDoubleRewardTimeAt = (ts = Date.now()) => {
      const d = new Date(ts);
      const hour = d.getHours();
      return hour >= 20 && hour < 22;
    };
    const isDoubleRewardTime = computed(() => isDoubleRewardTimeAt(nowTs.value));
    const doubleRewardNotice = "20:00—22:00开放双倍h币和双倍经验，可以和双倍经验器叠加！";
    const viewportSize = ref({
      width: typeof window === "undefined" ? 1700 : Math.max(1, Number(window.innerWidth) || 1700),
      height: typeof window === "undefined" ? 765 : Math.max(1, Number(window.innerHeight) || 765)
    });
    const battleResult = ref(null);
    const timeTunnelDoorScene = ref(null);
    const evolutionQueue = ref([]);
    const activeEvolution = ref(null);
    const battleScene = ref(null);
    const battleLogCollapsed = ref(isAndroidWebView);
    const battleStageHoverSide = ref("");
    const battleStagePinnedSide = ref("");
    const showChallengeRoadPanel = ref(false);
    const showGuardianPanel = showChallengeRoadPanel;
    const showBossPanel = showChallengeRoadPanel;
    const selectedChallengeRoadTierIndex = ref(0);
    const challengeRoadDefeatFilter = ref("全部战绩");
    const showChallengeRoadTierPanel = ref(false);
    const showWeeklyBossPanel = ref(false);
    const showQixingGachaPanel = ref(false);
    const showStudyPanel = ref(false);
    const showTimeTunnelPanel = ref(false);
    const showTimeTunnelEnvironmentPanel = ref(false);
    const timeTunnelEnvironmentScene = ref(null);
    const showTargetPanel = ref(false);
    const showGuardianChallengePanel = ref(false);
    const showBossChallengePanel = ref(false);
    const showSwitchPanel = ref(false);
    const showGlobalSettingsPanel = ref(false);
    const showReleaseNotesModal = ref(false);
    const showGameplayGuideModal = ref(false);
    const loginCaptchaVerified = ref(false);
    const selectedWarehousePetId = ref("");
    const showWarehouseActionModal = ref(false);
    const skillLongPressTimer = ref(null);
    const switchPanelMode = ref("manual");
    const selectedGuardianDexId = ref(null);
    const selectedBossDexId = ref(null);
    const selectedBossDifficulty = ref("normal");
    const selectedWeeklyBossDifficulty = ref("normal");
    const battleReturnContext = ref(null);
    const selectedAutoBattleCount = ref(10);
    const timeTunnelSelectedFloor = ref(1);
    const toast = ref({ show: false, message: "" });
    const rewardFlyToast = ref({ show: false, message: "", seq: 0 });
    const rewardFlyToastQueue = [];
    let rewardFlyToastRunning = false;
    const evolvingIds = ref([]);
    const selectedSkillName = ref("");
    const selectedInfoTab = ref("skills");
    const selectedQixingSealId = ref("");
    const replaceSkillCtx = ref(null);
    const bagReplaceCtx = ref(null);
    const showElementPanel = ref(false);
    const showBagPanel = ref(false);
    const showWarehousePanel = ref(false);
    const showShopPanel = ref(false);
    const showBadgePanel = ref(false);
    const showEggHatchPanel = ref(false);
    const showLeaderboardPanel = ref(false);
    const leaderboardMetric = ref("battlePower");
    const leaderboardPage = ref(1);
    const leaderboardRows = ref([]);
    const leaderboardTotalPages = ref(1);
    const leaderboardLoading = ref(false);
    const leaderboardError = ref("");
    const leaderboardTabs = [
      { key: "battlePower", label: "战斗力" },
      { key: "activatedDexCount", label: "激活图鉴" },
      { key: "hCoins", label: "H币" }
    ];
    const shopTab = ref("shop");
    const battleActionTab = ref("skills");
    const showPetDetailModal = ref(false);
    const detailPreviewPet = ref(null);
    const shopTargetPetId = ref("");
    const shopBuyQuantities = ref({});
    const shopRedeemCodeInput = ref("");
    const itemUseQuantities = ref({});
    const bagItemUseCtx = ref(null);
    const qixingGachaDrawing = ref(false);
    const selectedQixingGachaPhaseKey = ref(QIXING_GACHA_PHASES[0].key);
    const autoBattleRun = ref(null);
    const challengeRecordingEnabled = ref(false);
    const showChallengeRecordPanel = ref(false);
    const challengeRecordings = ref([]);
    const challengeRecordingBusy = ref(false);
    const activeChallengeRecording = ref(null);
    const autoBattleCountOptions = [10, 20, 50];
    const releaseNotes = RELEASE_NOTES_V040;
    const gameplayGuideLines = GAMEPLAY_GUIDE_LINES;
    const initialOnlyItems = [
      {
        id: "level_40_fruit",
        name: "40级经验果",
        price: 0,
        desc: "初始一次性道具，只能给低于 Lv.40 的亚比使用，使用后直接升至 Lv.40"
      },
      {
        id: "divine_pet_key",
        name: "神宠之匙",
        price: 0,
        desc: "用于启星转盘抽奖"
      },
      {
        id: ZONGZI_ITEM_ID,
        name: "粽子",
        price: 0,
        desc: "活动道具：通过图鉴挑战、挑战之路和时空隧道获得"
      },
      {
        id: WEEKLY_BOSS_MEDAL_ITEM_ID,
        name: "当周BOSS勋章",
        price: 0,
        desc: "当周BOSS挑战奖励，50个可兑换当周BOSS亚比蛋"
      },
      {
        id: QIXING_FRAGMENT_ITEM_ID,
        name: "特性碎片",
        price: 0,
        desc: "用于升级启星之印，也可由分解特性获得"
      },
      {
        id: QIXING_SEAL_ITEM_ID,
        name: "启星之印",
        price: 0,
        desc: "亚比道具：可使用特性碎片升级，强化每回合属性提升效果"
      },
      {
        id: QIANKUN_XIULUOSHEN_SKIN_ITEM_ID,
        name: QIANKUN_XIULUOSHEN_SKIN_NAME,
        price: 0,
        desc: `限圣光修罗/修罗使用：对战动画替换为${QIANKUN_XIULUOSHEN_SKIN_NAME.replace(/皮肤$/, "")}，并提升战斗能力`
      },
      {
        id: SUPER_DICE_BOMB_SKILL_STONE_ITEM_ID,
        name: "超级骰子炸弹技能石",
        price: 0,
        desc: "亚比道具：使用后可学习技能超级骰子炸弹"
      },
    ];
    const shopItems = ref([
      {
        id: "pp_bean_s",
        name: "初级PP豆",
        price: 50,
        desc: "回复目标亚比全部已装备技能 5PP"
      },
      {
        id: "pp_bean_m",
        name: "中级PP豆",
        price: 100,
        desc: "回复目标亚比全部已装备技能 10PP"
      },
      {
        id: "pp_bean_l",
        name: "高级PP豆",
        price: 200,
        desc: "回复目标亚比全部已装备技能 20PP"
      },
      {
        id: "hp_candy_s",
        name: "初级体力糖",
        price: 50,
        desc: "回复目标亚比 50 点体力"
      },
      {
        id: "hp_candy_m",
        name: "中级体力糖",
        price: 100,
        desc: "回复目标亚比 100 点体力"
      },
      {
        id: "hp_candy_l",
        name: "高级体力糖",
        price: 200,
        desc: "回复目标亚比 200 点体力"
      },
      {
        id: "purify_potion",
        name: "净化药剂",
        price: 200,
        desc: "清除目标亚比的异常状态"
      },
      {
        id: "double_exp_device",
        name: "双倍经验器",
        price: 1000,
        desc: "购买后获得 10 次战斗双倍经验次数，每场非学习力战斗开始时自动消耗 1 次"
      },
      {
        id: "auto_battle_device",
        name: "自动战斗仪",
        price: 1000,
        desc: "购买后获得 10 次图鉴自动挑战次数，可连续挑战同一图鉴目标"
      },
      {
        id: "study_reset_fruit",
        name: "学习力清空果实",
        price: 1000,
        desc: "将指定亚比的学习力恢复为全 0"
      },
      {
        id: "study_hp_fruit",
        name: "体力学习力果实",
        price: 10,
        desc: "指定亚比体力学习力 +1"
      },
      {
        id: "study_atk_fruit",
        name: "攻击学习力果实",
        price: 10,
        desc: "指定亚比攻击学习力 +1"
      },
      {
        id: "study_spAtk_fruit",
        name: "特攻学习力果实",
        price: 10,
        desc: "指定亚比特攻学习力 +1"
      },
      {
        id: "study_def_fruit",
        name: "防御学习力果实",
        price: 10,
        desc: "指定亚比防御学习力 +1"
      },
      {
        id: "study_spDef_fruit",
        name: "特防学习力果实",
        price: 10,
        desc: "指定亚比特防学习力 +1"
      },
      {
        id: "study_speed_fruit",
        name: "速度学习力果实",
        price: 10,
        desc: "指定亚比速度学习力 +1"
      },
      {
        id: "small_exp_fruit",
        name: "小经验果",
        price: 200,
        desc: "指定亚比获得 10000 经验"
      },
      {
        id: "medium_exp_fruit",
        name: "中经验果",
        price: 800,
        desc: "指定亚比获得 50000 经验"
      },
      {
        id: "time_tunnel_big_exp_fruit",
        name: "大经验果",
        price: 1500,
        desc: "指定亚比获得 100000 经验"
      },
      {
        id: "level_down_spray",
        name: "降级喷雾",
        price: 2000,
        desc: "指定亚比等级降为 Lv.1，技能栏、学习力、天赋不变"
      },
      {
        id: "talent_reroll_capsule",
        name: "天赋重组胶囊",
        price: 1000,
        desc: "重新随机生成各项天赋值，总和变化区间为[-5,+8]，前三次提升概率依次为60%、80%、100%"
      },
      {
        id: "talent_boost_capsule",
        name: "天赋增强胶囊",
        price: 2000,
        desc: "随机单项天赋值增加 6-10 点"
      },
      {
        id: "talent_grade_wanzhong_fruit",
        name: "万众瞩目果实",
        price: 20000,
        desc: "使指定亚比天赋总值直接达到万众瞩目"
      },
      {
        id: "talent_grade_wangzhe_fruit",
        name: "王者无敌果实",
        price: 50000,
        desc: "使指定亚比天赋总值直接达到王者无敌"
      },
      {
        id: "talent_grade_tianxia_fruit",
        name: "天下无双果实",
        price: 80000,
        desc: "使指定亚比天赋总值直接达到天下无双"
      }
    ]);
    const itemCatalog = computed(() => initialOnlyItems.concat(shopItems.value));
    const getTimeTunnelRewardInfo = (floor) => {
      const safeFloor = Math.max(1, Math.floor(Number(floor) || 1));
      const nextRewardFloor = Math.ceil(safeFloor / TIME_TUNNEL_REWARD_INTERVAL) * TIME_TUNNEL_REWARD_INTERVAL;
      const remain = Math.max(0, nextRewardFloor - safeFloor);
      return {
        nextRewardFloor,
        remain,
        isRewardFloor: safeFloor > 0 && safeFloor % TIME_TUNNEL_REWARD_INTERVAL === 0
      };
    };
    const battleBgmAudio = ref(null);
    const sceneBgmAudio = ref(null);
    const currentSceneBgmSrc = ref("");
    const bgmVolumePercent = computed(() => Math.round(clamp(Number(bgmVolume.value) || 0, 0, 1) * 100));
    const applyBgmVolume = () => {
      const volume = clamp(Number(bgmVolume.value) || 0, 0, 1);
      [sceneBgmAudio.value, battleBgmAudio.value].forEach((audio) => {
        if (!audio) return;
        try {
          audio.volume = volume;
          audio.muted = volume <= 0;
        } catch {}
      });
    };
    const setBgmVolume = (value) => {
      bgmVolume.value = clamp(Number(value) || 0, 0, 1);
      writeBgmVolume(bgmVolume.value);
      applyBgmVolume();
    };
    const battleBackground = computed(() => {
      const scene = battleScene.value;
      const starDomain = scene && Array.isArray(scene.globalTimedEffects)
        ? scene.globalTimedEffects.find((fx) => normalize(fx && fx.kind) === "battleBackgroundOverride" && Math.max(0, Number(fx && fx.turns) || 0) > 0)
        : null;
      if (starDomain) {
        const src = String((starDomain.data && starDomain.data.src) || STAR_DOMAIN_BATTLE_BG_SRC);
        const name = normalize(starDomain.data && starDomain.data.name) || "星神之域";
        return { mode: "temporary", src, name };
      }
      const source = state.value && state.value.battleBackground && typeof state.value.battleBackground === "object"
        ? state.value.battleBackground
        : {};
      const mode = normalize(source.mode) === "custom" ? "custom" : "default";
      const src = mode === "custom" && normalize(source.src) ? String(source.src) : DEFAULT_BATTLE_BG_SRC;
      const name = mode === "custom" && normalize(source.name) ? normalize(source.name) : "默认战斗背景";
      return { mode, src, name };
    });
    const applyBattleBackground = (bg) => {
      const next = bg && typeof bg === "object" ? bg : {};
      const mode = normalize(next.mode) === "custom" ? "custom" : "default";
      const src = mode === "custom" && normalize(next.src) ? String(next.src) : DEFAULT_BATTLE_BG_SRC;
      const name = mode === "custom" && normalize(next.name) ? normalize(next.name) : "默认战斗背景";
      state.value.battleBackground = { mode, src, name };
      saveState(state.value);
      showToast(mode === "custom" ? "已应用自定义战斗背景。" : "已恢复默认战斗背景。");
    };
    const resetBattleBackground = () => applyBattleBackground({ mode: "default", src: DEFAULT_BATTLE_BG_SRC, name: "默认战斗背景" });
    const applyBattleSpeed = (value) => {
      const next = clampBattleSpeed(value);
      battleSpeed.value = next;
      if (state.value && typeof state.value === "object") state.value.battleSpeed = next;
      if (battleScene.value && typeof battleScene.value === "object") battleScene.value.battleSpeed = next;
      writeBattleSpeed(next);
      showToast(`战斗速度已切换为 ${next}x。`);
      return next;
    };
    const buildBattlePrepareTarget = (targetEntry, targetLevel) => targetEntry ? {
        dexId: Number(targetEntry.dexId) || 0,
        name: normalize(targetEntry.name) || "挑战目标",
        level: clamp(Number(targetLevel) || 1, 1, 100),
        image: petCroppedStaticImage(targetEntry.dexId) || ensureHttps(targetEntry.image) || PLACEHOLDER,
        staticImage: petCroppedStaticImage(targetEntry.dexId) || ensureHttps(targetEntry.image) || PLACEHOLDER,
        animated: false,
        element: normalize(targetEntry.element),
        subElement: normalize(targetEntry.subElement)
      } : null;
    const buildBattlePreparePayload = (targetEntry, targetLevel, extra = {}) => {
      const target = buildBattlePrepareTarget(targetEntry, targetLevel);
      const targets = Array.isArray(extra.targets) && extra.targets.length > 0
        ? extra.targets.map((x) => buildBattlePrepareTarget(x.entry, x.level)).filter(Boolean)
        : (target ? [target] : []);
      const pets = bagSlots.value.map((slot, idx) => {
        const pet = slot && slot.pet;
        if (!pet) return { idx, empty: true };
        const visual = battlePrepareBagPetVisual(pet);
        return {
          idx,
          empty: false,
          dexId: Number(resolvePetCurrentDexId(pet)) || Number(pet.dexId) || 0,
          name: petDisplayName(pet),
          level: clamp(Number(pet.level) || 1, 1, 100),
          image: visual.src,
          staticImage: visual.staticImage,
          animated: visual.animated,
          element: normalize(pet.element),
          subElement: normalize(pet.subElement)
        };
      });
      while (pets.length < 6) pets.push({ idx: pets.length, empty: true });
      return { target, targets, teamSlots: pets.slice(0, 6) };
    };
    const openBattlePrepare = (label, targetEntry = null, targetLevel = 1, extra = {}) => {
      const payload = buildBattlePreparePayload(targetEntry, targetLevel, extra);
      battlePrepare.value = {
        open: true,
        progress: 0,
        label: normalize(label) || "战斗准备中",
        target: payload.target,
        targets: payload.targets,
        teamSlots: payload.teamSlots
      };
    };
    const closeBattlePrepare = () => {
      battlePrepare.value = { open: false, progress: 0, label: "", target: null, targets: [], teamSlots: [] };
    };
    const startBattlePrepare = async (label, targetEntry, targetLevel, fn, extra = {}) => {
      battlePrepareTrace("open", { label: normalize(label), targetDexId: Number(targetEntry && targetEntry.dexId) || 0, targetLevel });
      try {
        openBattlePrepare(label, targetEntry, targetLevel, extra);
        if (!skillExtractReady.value && skillExtractLoadPromise.value && typeof skillExtractLoadPromise.value.then === "function") {
          battlePrepareTrace("wait-skill-extract");
          await skillExtractLoadPromise.value;
          battlePrepareTrace("skill-extract-ready");
        }
        const total = BATTLE_PREPARE_MIN_MS + battleDelayMs(800, 120);
        const steps = Math.max(20, Math.ceil(total / BATTLE_PREPARE_STEP_MS));
        for (let i = 1; i <= steps; i += 1) {
          await new Promise((resolve) => setTimeout(resolve, Math.max(16, Math.round(total / steps))));
          battlePrepare.value.progress = Math.min(100, Math.round((i / steps) * 100));
        }
        battlePrepareTrace("progress-done");
        closeBattlePrepare();
        battlePrepareTrace("close");
        await nextTick();
        battlePrepareTrace("after-nextTick");
        await new Promise((resolve) => {
          if (typeof requestAnimationFrame === "function") requestAnimationFrame(() => resolve());
          else setTimeout(resolve, 16);
        });
        battlePrepareTrace("before-start-battle");
        const result = typeof fn === "function" ? fn() : undefined;
        battlePrepareTrace("start-battle-done", { result: result === false ? false : true });
        return result;
      } catch (err) {
        battlePrepareTrace("error", err && (err.stack || err.message || String(err)));
        throw err;
      }
    };
    const onBattleBackgroundFilePick = async (event) => {
      const input = event && event.target;
      const file = input && input.files && input.files[0];
      if (!file) return;
      if (!/^image\//.test(file.type || "")) {
        showToast("请选择图片或动图文件。");
        if (input) input.value = "";
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const src = String(reader.result || "");
        if (!src) {
          showToast("背景读取失败。");
          if (input) input.value = "";
          return;
        }
        applyBattleBackground({ mode: "custom", src, name: file.name || "自定义背景" });
        if (input) input.value = "";
      };
      reader.onerror = () => {
        showToast("背景读取失败。");
        if (input) input.value = "";
      };
      reader.readAsDataURL(file);
    };
    const battleSpeedLabel = computed(() => `${clampBattleSpeed(battleSpeed.value)}x`);
    const battleSpeedFactor = computed(() => 1 / clampBattleSpeed(battleSpeed.value));
    const battleDelayMs = (ms, minMs = 60) => Math.max(minMs, Math.round(Math.max(0, Number(ms) || 0) * battleSpeedFactor.value));
    const localDateKey = () => {
      const d = new Date();
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };
    const guardianBadgeThresholds = [
      { count: 1, suffix: "斗士", tone: "amber" },
      { count: 10, suffix: "的克星", tone: "rose" },
      { count: 100, suffix: "的噩梦", tone: "violet" }
    ];
    const guardianBadgeImageNameAlias = {
      "魂斗鱼": "魂多鱼",
      "多古拉伯爵": "德古拉伯爵",
      "麦斗司令": "麦斗元帅",
      "狂战暗影兽": "狂战暗影兽斗士",
      "亚历山大": "亚历山大斗士"
    };
    const guardianBadgeImageSrc = (guardianName) => {
      const name = normalize(guardianName);
      if (!name) return "";
      const fileName = guardianBadgeImageNameAlias[name] || name;
      return `./hub 守护者联盟勋章/${fileName}.png`;
    };
    const allGuardianNightmareBadgeImageSrc = guardianBadgeImageSrc("守护者的噩梦");
    const badgeIdOf = (guardianName, threshold) => `guardian_${normalize(guardianName)}_${threshold}`;
    const bossBadgeIdOf = (bossName) => `boss_${normalize(bossName)}_first_v1`;
    const bossDifficultyRewardKey = (bossName, difficultyKey) => `${normalize(bossName)}::${normalize(difficultyKey)}`;
    const bossDifficultyBadgeIdOf = (bossName, difficultyKey) => `boss_${normalize(bossName)}_${normalize(difficultyKey)}_first`;
    const weeklyBossHonorBadgeIdOf = (bossKey = WEEKLY_BOSS_CONFIG.key, row = null) => {
      const config = resolveWeeklyBossHistoryConfig(bossKey, row);
      return normalize(row && row.badgeId) || (config && config.honorBadgeId) || `weekly_boss_${normalize(bossKey)}_honor`;
    };
    const allGuardianNightmareBadgeId = "guardian_all_nightmare";
    const allGuardianBadgeNames = () => GUARDIAN_NAMES.map(resolveGuardianName).filter((name, idx, arr) => name && !isExcludedGuardianName(name) && arr.indexOf(name) === idx);
    const hasClearedAllGuardiansByCounts = (counts) => {
      const names = allGuardianBadgeNames();
      return names.length > 0 && names.every((name) => Math.max(0, Math.floor(Number(counts && counts[name]) || 0)) > 0);
    };
    const findGuardianCollectionDexEntry = (guardianName) => {
      const raw = resolveGuardianName(guardianName);
      const candidates = [raw, guardianBadgeImageNameAlias[raw]].map(normalize).filter((name, idx, arr) => name && arr.indexOf(name) === idx);
      for (const resolved of candidates) {
        const normalizedResolved = normalize(resolved).replace(/[·・]/g, "");
        const hit = dexEntries.find((d) => normalize(d.name) === resolved)
          || dexEntries.find((d) => normalize(d.name).replace(/[·・]/g, "") === normalizedResolved)
          || dexEntries.find((d) => {
            const dexName = normalize(d.name).replace(/[·・]/g, "");
            return normalizedResolved.length >= 2 && (dexName.includes(normalizedResolved) || normalizedResolved.includes(dexName));
          })
          || null;
        if (hit) return hit;
      }
      return null;
    };
    const hasGuardianDexInCollection = (dexId) => {
      const id = Number(dexId) || 0;
      if (!id) return false;
      const targetRoot = chainRootByDex.get(id) || id;
      const eggIds = Array.isArray(state.value.obtainedEggDexIds) ? state.value.obtainedEggDexIds : [];
      if (eggIds.some((eggId) => {
        const eid = Number(eggId) || 0;
        return eid === id || (chainRootByDex.get(eid) || eid) === targetRoot;
      })) return true;
      if ((Array.isArray(state.value.eggs) ? state.value.eggs : []).some((egg) => {
        const eid = Number(egg && egg.dexId) || 0;
        return eid === id || (chainRootByDex.get(eid) || eid) === targetRoot;
      })) return true;
      return (Array.isArray(state.value.activePets) ? state.value.activePets : []).some((pet) => {
        const petDexId = Number(pet && pet.dexId) || 0;
        const petBaseDexId = Number(pet && pet.baseDexId) || 0;
        const petRoot = chainRootByDex.get(petDexId) || chainRootByDex.get(petBaseDexId) || petBaseDexId || petDexId;
        return petDexId === id || petBaseDexId === id || petRoot === targetRoot;
      });
    };
    const hasAllGuardianCollectionBadgeUnlock = (counts) => {
      if (hasClearedAllGuardiansByCounts(counts)) return true;
      const names = allGuardianBadgeNames();
      return names.length > 0 && names.every((name) => {
        const entry = findGuardianCollectionDexEntry(name);
        return entry && hasGuardianDexInCollection(entry.dexId);
      });
    };
    const ownedBadges = computed(() => {
      const counts = state.value.guardianWinCounts && typeof state.value.guardianWinCounts === "object" ? state.value.guardianWinCounts : {};
      const rows = [];
      Object.keys(counts).sort((a, b) => a.localeCompare(b, "zh-Hans-CN")).forEach((name) => {
        const count = Math.max(0, Math.floor(Number(counts[name]) || 0));
        guardianBadgeThresholds.forEach((rule) => {
          if (count >= rule.count) {
            const imageSrc = rule.count === 1 ? guardianBadgeImageSrc(name) : "";
            rows.push({
              id: badgeIdOf(name, rule.count),
              name: `${name}${rule.suffix}`,
              guardianName: name,
              count: rule.count,
              currentCount: count,
              tone: rule.tone,
              imageSrc,
              description: `${name} 已挑战成功 ${count} 次`
            });
          }
        });
      });
      if (hasAllGuardianCollectionBadgeUnlock(counts)) {
        rows.push({
          id: allGuardianNightmareBadgeId,
          name: "守护者的噩梦",
          guardianName: "全部守护者",
          count: 1,
          currentCount: allGuardianBadgeNames().length,
          tone: "violet",
          special: "guardianAllNightmare",
          imageSrc: allGuardianNightmareBadgeImageSrc,
          description: "通关所有守护者后获得"
        });
      }
      const bossFirstWinReward = state.value.bossFirstWinRewardV1 && typeof state.value.bossFirstWinRewardV1 === "object" ? state.value.bossFirstWinRewardV1 : null;
      const bossName = normalize(bossFirstWinReward && bossFirstWinReward.bossName);
      if (bossName) {
        rows.push({
          id: bossBadgeIdOf(bossName),
          name: `${bossName}BOSS勋章`,
          guardianName: bossName,
          count: 1,
          currentCount: 1,
          tone: "rose",
          description: "本版本首次挑战 BOSS 成功奖励"
        });
      }
      const bossDifficultyRewards = state.value.bossDifficultyFirstWinRewards && typeof state.value.bossDifficultyFirstWinRewards === "object" ? state.value.bossDifficultyFirstWinRewards : {};
      Object.keys(bossDifficultyRewards).sort((a, b) => a.localeCompare(b, "zh-Hans-CN")).forEach((key) => {
        const row = bossDifficultyRewards[key] && typeof bossDifficultyRewards[key] === "object" ? bossDifficultyRewards[key] : {};
        const name = normalize(row.bossName);
        const difficulty = normalize(row.difficulty);
        const reward = BOSS_DIFFICULTY_FIRST_WIN_REWARDS[difficulty];
        if (!name || !reward) return;
        rows.push({
          id: bossDifficultyBadgeIdOf(name, difficulty),
          name: `${name}BOSS${reward.medalSuffix}`,
          guardianName: name,
          count: 1,
          currentCount: 1,
          tone: reward.tone || "rose",
          description: `首次通过${(BOSS_DIFFICULTY_OPTIONS.find((x) => x.key === difficulty) || {}).label || ""}难度 BOSS 挑战奖励`
        });
      });
      const weeklyRewards = state.value.weeklyBossHonorRewards && typeof state.value.weeklyBossHonorRewards === "object" ? state.value.weeklyBossHonorRewards : {};
      Object.keys(weeklyRewards).sort((a, b) => a.localeCompare(b, "zh-Hans-CN")).forEach((key) => {
        const weekly = weeklyRewards[key] && typeof weeklyRewards[key] === "object" ? weeklyRewards[key] : {};
        const config = resolveWeeklyBossHistoryConfig(key, weekly);
        const name = normalize(weekly.name) || (config && config.honorBadgeName) || "当周BOSS荣耀徽章";
        if (!name) return;
        const guardianName = normalize(weekly.bossName) || (config && config.name) || normalize(key);
        rows.push({
          id: weeklyBossHonorBadgeIdOf(key, weekly),
          name,
          guardianName,
          count: 1,
          currentCount: 1,
          tone: "blackgold",
          special: "weeklyHonor",
          description: "当周BOSS挑战荣耀奖励，拥有炫彩黑金特效"
        });
      });
      return rows;
    });
    const imageBadges = computed(() => ownedBadges.value.filter((badge) => badge && badge.imageSrc));
    const textBadges = computed(() => ownedBadges.value.filter((badge) => badge && !badge.imageSrc));
    const equippedBadge = computed(() => ownedBadges.value.find((b) => b.id === state.value.equippedBadgeId) || null);
    const recordGuardianBadgeWin = (guardianName) => {
      const name = resolveGuardianName(guardianName);
      if (!name) return;
      if (!state.value.guardianWinCounts || typeof state.value.guardianWinCounts !== "object") state.value.guardianWinCounts = {};
      const hadAllGuardianBadge = hasAllGuardianCollectionBadgeUnlock(state.value.guardianWinCounts);
      state.value.guardianWinCounts[name] = Math.max(0, Math.floor(Number(state.value.guardianWinCounts[name]) || 0)) + 1;
      const count = state.value.guardianWinCounts[name];
      const unlocked = guardianBadgeThresholds.filter((rule) => count === rule.count);
      unlocked.forEach((rule) => showToast(`激活徽章：${name}${rule.suffix}`));
      if (!hadAllGuardianBadge && hasAllGuardianCollectionBadgeUnlock(state.value.guardianWinCounts)) showToast("激活徽章：守护者的噩梦");
    };
    const grantBossFirstWinRewardV1 = (defeatedBossName, difficultyKey = "normal") => {
      const bossName = normalize(defeatedBossName);
      const difficulty = BOSS_DIFFICULTY_FIRST_WIN_REWARDS[normalize(difficultyKey)] ? normalize(difficultyKey) : "normal";
      const reward = BOSS_DIFFICULTY_FIRST_WIN_REWARDS[difficulty];
      const recordKey = bossDifficultyRewardKey(bossName, difficulty);
      if (!bossName || !reward) return false;
      if (!state.value.bossDifficultyFirstWinRewards || typeof state.value.bossDifficultyFirstWinRewards !== "object") state.value.bossDifficultyFirstWinRewards = {};
      if (state.value.bossDifficultyFirstWinRewards[recordKey]) return false;
      state.value.bossDifficultyFirstWinRewards[recordKey] = { bossName, difficulty, claimedAt: Date.now() };
      const medalName = `${bossName}BOSS${reward.medalSuffix}`;
      const rewardItems = reward.items.slice();
      if (bossName === "骰子大王" && difficulty === "nightmare") {
        rewardItems.push({ id: SUPER_DICE_BOMB_SKILL_STONE_ITEM_ID, count: 1, label: "超级骰子炸弹技能石" });
      }
      rewardItems.forEach((item) => addItemCount(item.id, item.count));
      const difficultyLabel = (BOSS_DIFFICULTY_OPTIONS.find((x) => x.key === difficulty) || {}).label || "";
      const rewardText = rewardItems.map((item) => `${item.label} x${item.count}`).join("、");
      pushBattleLog(battleScene.value, `首次通过${difficultyLabel}难度 BOSS 挑战，额外获得 ${medalName}${rewardText ? `、${rewardText}` : ""}。`);
      queueRewardFlyToasts([
        `获取${medalName}！`,
        ...rewardItems.map((item) => `获取${item.label}×${item.count}！`)
      ]);
      return true;
    };
    const ensureItemInventory = () => {
      if (!state.value.items || typeof state.value.items !== "object") state.value.items = {};
    };
    const getItemCount = (itemId) => {
      ensureItemInventory();
      const id = normalize(String(itemId || ""));
      if (id === QIXING_SEAL_ITEM_ID) {
        return (Array.isArray(state.value.qixingSeals) ? state.value.qixingSeals : []).filter((seal) => !normalize(seal && seal.equippedPetId)).length;
      }
      return Math.max(0, Number(state.value.items[id]) || 0);
    };
    const itemNameById = (itemId, fallback = "道具") => {
      const id = normalize(String(itemId || ""));
      const item = itemCatalog.value.find((x) => normalize(x.id) === id);
      return item ? item.name : fallback;
    };
    const ensureQixingSeals = () => {
      if (!Array.isArray(state.value.qixingSeals)) state.value.qixingSeals = [];
      let changed = false;
      const normalized = state.value.qixingSeals.map((seal) => {
        const next = {
          id: normalize(seal && seal.id) || uid(),
          level: clamp(Math.floor(Number(seal && seal.level) || 1), 1, QIXING_SEAL_MAX_LEVEL),
          traitKey: normalizeQixingTraitKey(seal && seal.traitKey),
          upgradeFailCount: Math.max(0, Math.floor(Number(seal && seal.upgradeFailCount) || 0)),
          equippedPetId: normalize(seal && seal.equippedPetId)
        };
        const sealChanged = !seal
          || next.id !== seal.id
          || next.level !== seal.level
          || next.traitKey !== seal.traitKey
          || next.upgradeFailCount !== seal.upgradeFailCount
          || next.equippedPetId !== seal.equippedPetId;
        if (sealChanged) changed = true;
        return sealChanged ? next : seal;
      });
      if (changed) state.value.qixingSeals = normalized;
      return state.value.qixingSeals;
    };
    const qixingSealMeta = (sealOrKey) => {
      const key = typeof sealOrKey === "string" ? sealOrKey : sealOrKey && sealOrKey.traitKey;
      return QIXING_TRAIT_META[normalizeQixingTraitKey(key)] || QIXING_TRAIT_META[QIXING_TRAIT_KEYS.LEGACY];
    };
    const qixingSealBattleRule = (sealOrKey, level) => {
      const meta = qixingSealMeta(sealOrKey);
      const safeLevel = clamp(Math.floor(Number(level) || 1), 1, QIXING_SEAL_MAX_LEVEL);
      return (meta.battle && meta.battle[safeLevel]) || (QIXING_TRAIT_META[QIXING_TRAIT_KEYS.LEGACY].battle || {})[safeLevel] || {};
    };
    const qixingSealUpgradeRule = (level, failCount = 0) => {
      const safeLevel = clamp(Math.floor(Number(level) || 1), 1, QIXING_SEAL_MAX_LEVEL);
      const rule = QIXING_SEAL_UPGRADE_RULES[safeLevel] || null;
      if (!rule) return { fragmentCost: 0, hcoinCost: 0, successRate: 1, guaranteed: true, attemptNo: 0 };
      const fails = Math.max(0, Math.floor(Number(failCount) || 0));
      const attemptNo = fails + 1;
      const guaranteed = attemptNo >= Math.max(1, Math.floor(Number(rule.guaranteedAttempt) || 1));
      const rates = Array.isArray(rule.rates) ? rule.rates : [];
      const successRate = guaranteed ? 1 : clamp(Number(rates[Math.min(fails, Math.max(0, rates.length - 1))]) || 0, 0, 1);
      return {
        fragmentCost: Math.max(0, Math.floor(Number(rule.fragmentCost) || 0)),
        hcoinCost: Math.max(0, Math.floor(Number(rule.hcoinCost) || 0)),
        successRate,
        guaranteed,
        attemptNo
      };
    };
    const qixingSealById = (sealId) => ensureQixingSeals().find((seal) => normalize(seal.id) === normalize(sealId)) || null;
    const qixingSealForPet = (pet) => {
      if (!pet || normalize(pet.equippedItemId) !== QIXING_SEAL_ITEM_ID) return null;
      return qixingSealById(pet.equippedItemInstanceId) || ensureQixingSeals().find((seal) => normalize(seal.equippedPetId) === pet.id) || null;
    };
    const grantQixingSeal = (traitKey = QIXING_TRAIT_KEYS.LEGACY, count = 1) => {
      const seals = ensureQixingSeals();
      const safeCount = Math.max(1, Math.floor(Number(count) || 1));
      const key = normalizeQixingTraitKey(traitKey);
      const created = [];
      for (let i = 0; i < safeCount; i += 1) {
        const seal = { id: uid(), level: 1, traitKey: key, upgradeFailCount: 0, equippedPetId: "" };
        seals.push(seal);
        created.push(seal);
      }
      return created;
    };
    const canUseSuperDiceBombSkillStoneOnPet = (pet) => {
      if (!pet) return false;
      const ids = [pet.dexId, pet.baseDexId, resolveEvolutionDexIdByPetAndStage(pet, 0)].map((id) => Number(id) || 0);
      const names = [pet.speciesName, pet.fixedName, petDisplayName(pet)].map((name) => normalize(name).toUpperCase()).filter(Boolean);
      return ids.includes(DICE_KING_DEX_ID)
        || ids.includes(NO14_DEX_ID)
        || names.includes("骰子大王")
        || names.includes("NO.14");
    };
    const firstAvailableQixingSeal = () => ensureQixingSeals().find((seal) => !normalize(seal.equippedPetId)) || null;
    const qixingSealRows = computed(() => ensureQixingSeals().map((seal) => {
      const pet = safeActivePets.value.find((p) => p && p.id === normalize(seal.equippedPetId)) || null;
      const selectedPetId = petId(selectedPet.value);
      const level = clamp(Math.floor(Number(seal.level) || 1), 1, QIXING_SEAL_MAX_LEVEL);
      const meta = qixingSealMeta(seal);
      const rule = qixingSealBattleRule(seal, level);
      const upgrade = qixingSealUpgradeRule(level, seal.upgradeFailCount);
      return {
        ...seal,
        level,
        name: meta.name,
        image: meta.image,
        isLegacy: normalizeQixingTraitKey(seal.traitKey) === QIXING_TRAIT_KEYS.LEGACY,
        rule,
        upgrade,
        upgradeFailCount: Math.max(0, Math.floor(Number(seal.upgradeFailCount) || 0)),
        upgradeSuccessText: level >= QIXING_SEAL_MAX_LEVEL ? "已满级" : `${Math.round(upgrade.successRate * 100)}%`,
        nextFragmentCost: level >= QIXING_SEAL_MAX_LEVEL ? 0 : upgrade.fragmentCost,
        nextHcoinCost: level >= QIXING_SEAL_MAX_LEVEL ? 0 : upgrade.hcoinCost,
        equippedPetName: pet ? petDisplayName(pet) : "",
        equippedOnSelectedPet: Boolean(selectedPetId && normalize(seal.equippedPetId) === selectedPetId),
        selected: normalize(selectedQixingSealId.value) === normalize(seal.id) || Boolean(selectedPetId && normalize(seal.equippedPetId) === selectedPetId)
      };
    }));
    const selectedQixingSeal = computed(() => qixingSealById(selectedQixingSealId.value) || qixingSealForPet(selectedPet.value) || firstAvailableQixingSeal());
    const selectedQixingSealLevel = computed(() => clamp(Math.floor(Number(selectedQixingSeal.value && selectedQixingSeal.value.level) || 1), 1, QIXING_SEAL_MAX_LEVEL));
    const selectedQixingSealMeta = computed(() => qixingSealMeta(selectedQixingSeal.value));
    const selectedQixingSealRule = computed(() => qixingSealBattleRule(selectedQixingSeal.value, selectedQixingSealLevel.value));
    const selectedQixingSealUpgradeRule = computed(() => qixingSealUpgradeRule(selectedQixingSealLevel.value, selectedQixingSeal.value && selectedQixingSeal.value.upgradeFailCount));
    const selectedQixingSealNextCost = computed(() => selectedQixingSealLevel.value >= QIXING_SEAL_MAX_LEVEL ? 0 : selectedQixingSealUpgradeRule.value.fragmentCost);
    const selectedQixingSealNextHcoinCost = computed(() => selectedQixingSealLevel.value >= QIXING_SEAL_MAX_LEVEL ? 0 : selectedQixingSealUpgradeRule.value.hcoinCost);
    const selectedQixingSealUpgradeSuccessText = computed(() => selectedQixingSealLevel.value >= QIXING_SEAL_MAX_LEVEL ? "已满级" : `${Math.round(selectedQixingSealUpgradeRule.value.successRate * 100)}%`);
    const selectedQixingSealDecomposeGain = computed(() => {
      const seal = selectedQixingSeal.value;
      if (!seal) return 0;
      const level = clamp(Math.floor(Number(seal.level) || 1), 1, QIXING_SEAL_MAX_LEVEL);
      return Math.max(0, Math.floor(Number(QIXING_SEAL_DECOMPOSE_FRAGMENT_BY_LEVEL[level]) || 0));
    });
    const selectedPetEquippedQixingSeal = computed(() => qixingSealForPet(selectedPet.value));
    const canEquipSelectedQixingSeal = computed(() => {
      const seal = selectedQixingSeal.value;
      const pet = selectedPet.value;
      if (!seal || !pet || !bagPets.value.some((p) => p && p.id === pet.id)) return false;
      return true;
    });
    const canDecomposeSelectedQixingSeal = computed(() => {
      const seal = selectedQixingSeal.value;
      return Boolean(seal && !normalize(seal.equippedPetId) && selectedQixingSealDecomposeGain.value > 0);
    });
    const selectedQixingSealEquippedOnSelectedPet = computed(() => {
      const seal = selectedQixingSeal.value;
      const pet = selectedPet.value;
      return Boolean(seal && pet && normalize(seal.equippedPetId) === pet.id);
    });
    const selectQixingSeal = (sealId) => {
      const seal = qixingSealById(sealId);
      if (!seal) return;
      selectedQixingSealId.value = seal.id;
    };
    const ensureQixingGachaState = () => {
      if (!state.value.qixingGacha || typeof state.value.qixingGacha !== "object") state.value.qixingGacha = { pity: 0, pityByKey: {}, limitedEggs: {} };
      if (!state.value.qixingGacha.limitedEggs || typeof state.value.qixingGacha.limitedEggs !== "object") state.value.qixingGacha.limitedEggs = {};
      if (!state.value.qixingGacha.pityByKey || typeof state.value.qixingGacha.pityByKey !== "object") state.value.qixingGacha.pityByKey = {};
      state.value.qixingGacha.limitedEggs.ice_princess = Boolean(state.value.qixingGacha.limitedEggs.ice_princess);
      state.value.qixingGacha.limitedEggs.emperor_holy_dragon = Boolean(state.value.qixingGacha.limitedEggs.emperor_holy_dragon);
      state.value.qixingGacha.limitedEggs.ice_crystal_phoenix = Boolean(state.value.qixingGacha.limitedEggs.ice_crystal_phoenix);
      state.value.qixingGacha.limitedEggs.qingzhan = Boolean(state.value.qixingGacha.limitedEggs.qingzhan);
      state.value.qixingGacha.limitedEggs.ancient_star_dragon = Boolean(state.value.qixingGacha.limitedEggs.ancient_star_dragon);
      state.value.qixingGacha.limitedEggs.phase1_ice_princess = Boolean(state.value.qixingGacha.limitedEggs.phase1_ice_princess || state.value.qixingGacha.limitedEggs.ice_princess);
      state.value.qixingGacha.limitedEggs.phase2_ice_princess = Boolean(state.value.qixingGacha.limitedEggs.phase2_ice_princess);
      state.value.qixingGacha.limitedEggs.phase2_ancient_star_dragon = Boolean(state.value.qixingGacha.limitedEggs.phase2_ancient_star_dragon || state.value.qixingGacha.limitedEggs.ancient_star_dragon);
      state.value.qixingGacha.limitedEggs.phase2_qiankun_skin = Boolean(
        state.value.qixingGacha.limitedEggs.phase2_qiankun_skin
        || getItemCount(QIANKUN_XIULUOSHEN_SKIN_ITEM_ID) > 0
        || (Array.isArray(state.value.activePets) ? state.value.activePets : []).some((pet) => normalize(pet && pet.skinKey) === QIANKUN_XIULUOSHEN_SKIN_KEY)
      );
      if (hasObtainedEggDex(QIXING_ANCIENT_STAR_DRAGON_DEX.dexId) || hasObtainedEggDex(QIXING_ANCIENT_STAR_DRAGON_DEX.rootDexId)) {
        state.value.qixingGacha.limitedEggs.phase2_ancient_star_dragon = true;
      }
      const legacyPity = Math.max(0, Math.floor(Number(state.value.qixingGacha.pity) || 0));
      state.value.qixingGacha.pity = legacyPity;
      state.value.qixingGacha.pityByKey.ice_princess = Math.max(0, Math.floor(Number(state.value.qixingGacha.pityByKey.ice_princess ?? legacyPity) || 0));
      state.value.qixingGacha.pityByKey.ancient_star_dragon = Math.max(0, Math.floor(Number(state.value.qixingGacha.pityByKey.ancient_star_dragon ?? legacyPity) || 0));
      state.value.qixingGacha.pityByKey.phase1_ice_princess = Math.max(0, Math.floor(Number(state.value.qixingGacha.pityByKey.phase1_ice_princess ?? state.value.qixingGacha.pityByKey.ice_princess ?? legacyPity) || 0));
      state.value.qixingGacha.pityByKey.phase2_ancient_star_dragon = Math.max(0, Math.floor(Number(state.value.qixingGacha.pityByKey.phase2_ancient_star_dragon ?? state.value.qixingGacha.pityByKey.ancient_star_dragon ?? legacyPity) || 0));
      state.value.qixingGacha.pityByKey.phase2_qiankun_skin = Math.max(0, Math.floor(Number(state.value.qixingGacha.pityByKey.phase2_qiankun_skin ?? state.value.qixingGacha.pityByKey.phase2_ancient_star_dragon ?? legacyPity) || 0));
      return state.value.qixingGacha;
    };
    const isQixingGachaPhaseUnlocked = (phaseKey) => {
      if (phaseKey === "phase1") return challengeRoadFirstTierCompleted.value;
      if (phaseKey === "phase2") return challengeRoadFifthTierBossObtained.value;
      return false;
    };
    const qixingGachaPhaseOptions = computed(() => QIXING_GACHA_PHASES.map((phase) => ({
      ...phase,
      unlocked: isQixingGachaPhaseUnlocked(phase.key)
    })));
    const selectedQixingGachaPhase = computed(() => {
      const selected = QIXING_GACHA_PHASE_BY_KEY.get(selectedQixingGachaPhaseKey.value) || QIXING_GACHA_PHASES[0];
      return selected || QIXING_GACHA_PHASES[0];
    });
    const selectedQixingGachaPhaseUnlocked = computed(() => isQixingGachaPhaseUnlocked(selectedQixingGachaPhase.value && selectedQixingGachaPhase.value.key));
    const qixingGachaCurrentPity = computed(() => {
      const gacha = ensureQixingGachaState();
      const phase = selectedQixingGachaPhase.value;
      const pityPrizes = Array.isArray(phase.pityPrizes) && phase.pityPrizes.length > 0 ? phase.pityPrizes : [{ pityKey: phase.pityKey, pityLimit: phase.pityLimit }];
      const current = pityPrizes
        .map((pity) => ({
          current: Math.max(0, Math.floor(Number(gacha.pityByKey && gacha.pityByKey[pity.pityKey]) || 0)),
          limit: Math.max(1, Math.floor(Number(pity.pityLimit) || 1))
        }))
        .sort((a, b) => (a.limit - a.current) - (b.limit - b.current))[0];
      return current ? current.current : 0;
    });
    const qixingGachaCurrentPityLimit = computed(() => {
      const phase = selectedQixingGachaPhase.value;
      const pityPrizes = Array.isArray(phase.pityPrizes) && phase.pityPrizes.length > 0 ? phase.pityPrizes : [{ pityLimit: phase.pityLimit }];
      const gacha = ensureQixingGachaState();
      const current = pityPrizes
        .map((pity) => ({
          label: pity.pityLabel || phase.pityLabel,
          current: Math.max(0, Math.floor(Number(gacha.pityByKey && gacha.pityByKey[pity.pityKey]) || 0)),
          limit: Math.max(1, Math.floor(Number(pity.pityLimit) || 1))
        }))
        .sort((a, b) => (a.limit - a.current) - (b.limit - b.current))[0];
      return current ? current.limit : 1;
    });
    const qixingGachaCurrentPityLabel = computed(() => {
      const phase = selectedQixingGachaPhase.value;
      const pityPrizes = Array.isArray(phase.pityPrizes) && phase.pityPrizes.length > 0 ? phase.pityPrizes : [{ pityKey: phase.pityKey, pityLabel: phase.pityLabel, pityLimit: phase.pityLimit }];
      const gacha = ensureQixingGachaState();
      const current = pityPrizes
        .map((pity) => ({
          label: pity.pityLabel || phase.pityLabel || "保底",
          current: Math.max(0, Math.floor(Number(gacha.pityByKey && gacha.pityByKey[pity.pityKey]) || 0)),
          limit: Math.max(1, Math.floor(Number(pity.pityLimit) || 1))
        }))
        .sort((a, b) => (a.limit - a.current) - (b.limit - b.current))[0];
      return current ? current.label : "保底";
    });
    const qixingGachaPhaseLockText = computed(() => selectedQixingGachaPhaseUnlocked.value ? "" : ((selectedQixingGachaPhase.value && selectedQixingGachaPhase.value.unlockText) || "阶段未解锁"));
    const qixingGachaPoolRows = computed(() => {
      const gacha = ensureQixingGachaState();
      return (selectedQixingGachaPhase.value.pool || []).map((row) => ({
        ...row,
        disabled: Boolean(row.limitedKey && gacha.limitedEggs[row.limitedKey])
      }));
    });
    const petItemInventoryRows = computed(() => itemCatalog.value
      .filter((it) => ![QIXING_SEAL_ITEM_ID, QIXING_FRAGMENT_ITEM_ID].includes(normalize(it.id)))
      .map((it) => {
        const count = getItemCount(it.id);
        return {
          ...it,
          count,
          useQuantity: Math.min(itemUseQuantity(it.id), bagItemMaxUseQuantity(it.id)),
          maxUseQuantity: bagItemMaxUseQuantity(it.id),
          supportsUseQuantity: supportsBagItemUseQuantity(it.id),
          canUse: count > 0,
          countLabel: it.id === "double_exp_device" || it.id === "auto_battle_device" ? `${count} 次` : `× ${count}`,
          equipped: safeActivePets.value.filter((pet) => normalize(pet && pet.equippedItemId) === normalize(it.id)).length
        };
      }));
    const selectedPetFeatureText = computed(() => {
      if (!selectedPet.value) return "";
      const seal = selectedPetEquippedQixingSeal.value || null;
      if (seal) {
        const level = clamp(Math.floor(Number(seal.level) || 1), 1, QIXING_SEAL_MAX_LEVEL);
        const meta = qixingSealMeta(seal);
        const rule = qixingSealBattleRule(seal, level);
        return `当前亚比装配${meta.name}Lv.${level}，特性：${rule.label}`;
      }
      return "当前亚比未装配特性";
    });
    const hasObtainedEggDex = (dexId) => {
      const id = Number(dexId) || 0;
      if (!id) return false;
      const got = Array.isArray(state.value.obtainedEggDexIds) ? state.value.obtainedEggDexIds : [];
      if (got.includes(id)) return true;
      const isRedeemCodeBonusPet = (row) => isRedeemCodeBonusPetRow(row) && Number(row && row.dexId) === id;
      if (state.value.eggs.some((e) => Number(e && e.dexId) === id && !isRedeemCodeBonusPet(e))) return true;
      const targetRoot = chainRootByDex.get(id) || id;
      const owned = (Array.isArray(state.value.activePets) ? state.value.activePets : []).some((p) => {
        if (isRedeemCodeBonusPet(p)) return false;
        const petDexId = Number(p && p.dexId) || 0;
        const petBaseDexId = Number(p && p.baseDexId) || 0;
        const petRoot = chainRootByDex.get(petDexId) || chainRootByDex.get(petBaseDexId) || petBaseDexId || petDexId;
        return petDexId === id || petBaseDexId === id || petRoot === targetRoot;
      });
      return owned;
    };
    const resolveChallengeRoadName = (name) => CHALLENGE_ROAD_NAME_ALIAS[normalize(name)] || normalize(name);
    const findChallengeRoadDexEntry = (name) => {
      const resolved = resolveChallengeRoadName(name);
      if (!resolved) return null;
      return dexEntries.find((d) => normalize(d.name) === resolved)
        || dexEntries.find((d) => normalize(d.name).replace(/[·・]/g, "") === resolved.replace(/[·・]/g, ""))
        || dexEntries.find((d) => resolved.length >= 2 && normalize(d.name).includes(resolved))
        || null;
    };
    const isBossDifficultyCleared = (bossName, difficultyKey = "normal") => {
      const difficulty = normalize(difficultyKey) || "normal";
      const reward = BOSS_DIFFICULTY_FIRST_WIN_REWARDS[difficulty];
      const name = normalize(bossName);
      if (!name || !reward) return false;
      const badgeId = bossDifficultyBadgeIdOf(name, difficulty);
      const badgeName = `${name}BOSS${reward.medalSuffix}`;
      return ownedBadges.value.some((badge) => {
        if (!badge) return false;
        return normalize(badge.id) === badgeId || normalize(badge.name) === badgeName;
      });
    };
    const weeklyBossClearedDifficultyMap = () => {
      const rewardState = ensureWeeklyBossRewardState();
      const source = rewardState.clearedDifficulties && typeof rewardState.clearedDifficulties === "object" ? rewardState.clearedDifficulties : {};
      const out = {};
      Object.keys(source).forEach((key) => {
        const normalizedKey = normalize(key);
        if (WEEKLY_BOSS_DIFFICULTY_BY_KEY.has(normalizedKey) && source[key]) out[normalizedKey] = true;
      });
      const honorRewards = state.value.weeklyBossHonorRewards && typeof state.value.weeklyBossHonorRewards === "object" ? state.value.weeklyBossHonorRewards : {};
      const honor = honorRewards[WEEKLY_BOSS_CONFIG.key];
      if (honor) {
        const honorDifficulty = normalize(honor.difficulty || honor.difficultyKey) || "nightmare";
        if (WEEKLY_BOSS_DIFFICULTY_BY_KEY.has(honorDifficulty)) out[honorDifficulty] = true;
      }
      return out;
    };
    const isWeeklyBossDifficultyCleared = (difficultyKey = "normal") => {
      return Boolean(weeklyBossClearedDifficultyMap()[normalize(difficultyKey)]);
    };
    const isChallengeRoadEntryDefeated = (entry, kind) => {
      if (!entry || !Number(entry.dexId)) return false;
      if (kind === "boss") {
        return BOSS_DIFFICULTY_OPTIONS.some((option) => isBossDifficultyCleared(entry.name, option.key)) || hasDefeatedDex(entry.dexId);
      }
      return hasDefeatedDex(entry.dexId);
    };
    const buildChallengeRoadItem = (tierIndex, kind, name, order) => {
      const entry = findChallengeRoadDexEntry(name);
      const resolvedName = entry ? entry.name : (resolveChallengeRoadName(name) || normalize(name));
      const stageDir = CHALLENGE_ROAD_STAGE_COVER_DIRS[tierIndex] || "";
      const coverName = CHALLENGE_ROAD_STAGE_COVER_NAME_ALIAS[resolvedName] || CHALLENGE_ROAD_STAGE_COVER_NAME_ALIAS[name] || resolvedName;
      const stageCover = stageDir && coverName ? `./地台boss/${stageDir}/${coverName}.png` : "";
      if (!entry) return {
        tierIndex,
        kind,
        order,
        sourceName: name,
        name: resolvedName,
        stageCover,
        missing: true,
        completed: false
      };
      return {
        ...entry,
        tierIndex,
        kind,
        order,
        sourceName: name,
        stageCover,
        defeated: isChallengeRoadEntryDefeated(entry, kind),
        completed: hasObtainedEggDex(entry.dexId) || isChallengeRoadEntryDefeated(entry, kind),
        missing: false
      };
    };
    const challengeRoadTiers = computed(() => {
      const rows = [];
      CHALLENGE_ROAD_TIERS.forEach((tier, tierIndex) => {
        const guardianNames = Array.isArray(tier.guardianNames) ? tier.guardianNames : [];
        const bossNames = Array.isArray(tier.bossNames) ? tier.bossNames : [];
        const items = []
          .concat(guardianNames.map((name, idx) => buildChallengeRoadItem(tierIndex, "guardian", name, idx)))
          .concat(bossNames.map((name, idx) => buildChallengeRoadItem(tierIndex, "boss", name, guardianNames.length + idx)));
        const total = items.length;
        const current = items.filter((item) => item.completed).length;
        const previous = rows[tierIndex - 1] || null;
        rows.push({
          ...tier,
          tierIndex,
          items,
          total,
          current,
          percent: total > 0 ? Math.round((current / total) * 100) : 0,
          unlocked: tierIndex === 0 || Boolean(previous && previous.completed),
          completed: total > 0 && current >= total,
          lockText: previous ? `通关${previous.title}后开启` : ""
        });
      });
      return rows;
    });
    const challengeRoadEntryByDexId = (dexId) => {
      const id = Number(dexId) || 0;
      if (!id) return null;
      for (const tier of challengeRoadTiers.value) {
        const found = (tier.items || []).find((item) => Number(item && item.dexId) === id);
        if (found) return { item: found, tier };
      }
      return null;
    };
    const challengeRoadFirstTierCompleted = computed(() => Boolean(challengeRoadTiers.value[0] && challengeRoadTiers.value[0].completed));
    const challengeRoadFifthTierBossObtained = computed(() => {
      const tier = challengeRoadTiers.value[4] || null;
      return Boolean(tier && Array.isArray(tier.items) && tier.items.some((item) => item.kind === "boss" && item.completed));
    });
    const isChallengeRoadEntryUnlocked = (entry) => {
      const row = challengeRoadEntryByDexId(entry && entry.dexId);
      return !row || Boolean(row.tier && row.tier.unlocked);
    };
    const challengeRoadLockMessage = (entry) => {
      const row = challengeRoadEntryByDexId(entry && entry.dexId);
      if (!row || !row.tier || row.tier.unlocked) return "";
      return row.tier.lockText || "请先通关上一梯度。";
    };
    const selectedChallengeRoadTier = computed(() => {
      const rows = challengeRoadTiers.value;
      if (!rows.length) return null;
      const index = clamp(Math.floor(Number(selectedChallengeRoadTierIndex.value) || 0), 0, rows.length - 1);
      return rows[index] || rows[0] || null;
    });
    const filteredChallengeRoadItems = computed(() => {
      const tier = selectedChallengeRoadTier.value;
      const items = tier && Array.isArray(tier.items) ? tier.items : [];
      const filter = normalize(challengeRoadDefeatFilter.value);
      if (filter === "已战胜") return items.filter((item) => item && item.completed);
      if (filter === "未战胜") return items.filter((item) => item && !item.completed);
      return items;
    });
    const markObtainedEggDex = (dexId) => {
      const id = Number(dexId) || 0;
      if (!id) return;
      if (!Array.isArray(state.value.obtainedEggDexIds)) state.value.obtainedEggDexIds = [];
      if (!state.value.obtainedEggDexIds.includes(id)) state.value.obtainedEggDexIds.push(id);
    };
    const hasDefeatedDex = (dexId) => {
      const id = Number(dexId) || 0;
      if (!id) return false;
      return Array.isArray(state.value.defeatedDexIds) && state.value.defeatedDexIds.includes(id);
    };
    const markDefeatedDex = (dexId) => {
      const id = Number(dexId) || 0;
      if (!id) return;
      if (!Array.isArray(state.value.defeatedDexIds)) state.value.defeatedDexIds = [];
      if (!state.value.defeatedDexIds.includes(id)) state.value.defeatedDexIds.push(id);
    };
    const addItemCount = (itemId, delta) => {
      ensureItemInventory();
      const id = normalize(String(itemId || ""));
      if (!id) return;
      if (id === QIXING_SEAL_ITEM_ID) {
        const count = Math.floor(Number(delta) || 0);
        if (count > 0) grantQixingSeal(QIXING_TRAIT_KEYS.LEGACY, count);
        return;
      }
      const cur = Math.max(0, Number(state.value.items[id]) || 0);
      state.value.items[id] = Math.max(0, cur + (Number(delta) || 0));
    };
    const grantZongziReward = (scene, amount, sourceLabel) => {
      const count = Math.max(0, Math.floor(Number(amount) || 0));
      if (count <= 0) return "";
      addItemCount(ZONGZI_ITEM_ID, count);
      const text = `${sourceLabel || "挑战成功"}，获得粽子×${count}。`;
      if (scene) pushBattleLog(scene, text);
      queueRewardFlyToasts(`获取粽子×${count}！`);
      return text;
    };
    const ensureWeeklyBossRewardState = () => {
      if (!state.value.weeklyBossRewardState || typeof state.value.weeklyBossRewardState !== "object" || normalize(state.value.weeklyBossRewardState.bossKey) !== WEEKLY_BOSS_CONFIG.key) {
        state.value.weeklyBossRewardState = { bossKey: WEEKLY_BOSS_CONFIG.key, divinePetKeyClaimed: false, exchangedEgg: false, clearedDifficulties: {} };
      }
      if (!state.value.weeklyBossRewardState.clearedDifficulties || typeof state.value.weeklyBossRewardState.clearedDifficulties !== "object") {
        state.value.weeklyBossRewardState.clearedDifficulties = {};
      }
      return state.value.weeklyBossRewardState;
    };
    const weeklyBossMedalCount = computed(() => Math.min(WEEKLY_BOSS_MEDAL_MAX, getItemCount(WEEKLY_BOSS_MEDAL_ITEM_ID)));
    const addWeeklyBossMedals = (amount) => {
      const current = weeklyBossMedalCount.value;
      const gain = Math.max(0, Math.min(WEEKLY_BOSS_MEDAL_MAX - current, Math.floor(Number(amount) || 0)));
      if (gain > 0) addItemCount(WEEKLY_BOSS_MEDAL_ITEM_ID, gain);
      return gain;
    };
    const rollWeeklyBossMedalReward = (difficulty) => {
      const range = Array.isArray(difficulty && difficulty.rewardMedals) ? difficulty.rewardMedals : [0, 0];
      const min = Math.max(0, Math.floor(Number(range[0]) || 0));
      const max = Math.max(min, Math.floor(Number(range[1]) || min));
      return min + Math.floor(Math.random() * (max - min + 1));
    };
    const weeklyBossEggExchangeAvailable = computed(() => weeklyBossMedalCount.value >= WEEKLY_BOSS_EGG_EXCHANGE_COST && !ensureWeeklyBossRewardState().exchangedEgg && !hasObtainedEggDex(WEEKLY_BOSS_CONFIG.dexId));
    const consumeItemCount = (itemId, amount = 1) => {
      const id = normalize(String(itemId || ""));
      const need = Math.max(1, Math.floor(Number(amount) || 1));
      if (!id || getItemCount(id) < need) return false;
      addItemCount(id, -need);
      return true;
    };
    const shopBuyQuantity = (itemId) => {
      const id = normalize(String(itemId || ""));
      return clamp(Math.floor(Number(shopBuyQuantities.value[id]) || 1), 1, 999);
    };
    const setShopBuyQuantity = (itemId, value) => {
      const id = normalize(String(itemId || ""));
      if (!id) return;
      shopBuyQuantities.value[id] = clamp(Math.floor(Number(value) || 1), 1, 999);
    };
    const shopItemTotalPrice = (item) => {
      if (!item) return 0;
      return Math.max(0, Math.floor(Number(item.price) || 0)) * shopBuyQuantity(item.id);
    };
    const isStudyFruitItem = (itemId) => Boolean(STUDY_FRUIT_KEY_BY_ITEM_ID[normalize(String(itemId || ""))]);
    const isRepeatableBagUseItem = (itemId) => {
      const id = normalize(String(itemId || ""));
      return Boolean(
        isStudyFruitItem(id)
        || ["small_exp_fruit", "medium_exp_fruit", "time_tunnel_big_exp_fruit"].includes(id)
        || ["pp_bean_s", "pp_bean_m", "pp_bean_l"].includes(id)
        || ["hp_candy_s", "hp_candy_m", "hp_candy_l"].includes(id)
        || ["talent_reroll_capsule", "talent_boost_capsule"].includes(id)
      );
    };
    const isSingleUseBagItem = (itemId) => {
      const id = normalize(String(itemId || ""));
      return ["max_level_fruit", "level_40_fruit", "study_reset_fruit", "level_down_spray", "purify_potion"].includes(id);
    };
    const supportsBagItemUseQuantity = (itemId) => isRepeatableBagUseItem(itemId) || isSingleUseBagItem(itemId);
    const bagItemMaxUseQuantity = (itemId) => {
      const id = normalize(String(itemId || ""));
      if (!supportsBagItemUseQuantity(id)) return 1;
      if (isSingleUseBagItem(id)) return 1;
      return clamp(getItemCount(id), 1, 999);
    };
    const itemUseQuantity = (itemId) => {
      const id = normalize(String(itemId || ""));
      return clamp(Math.floor(Number(itemUseQuantities.value[id]) || 1), 1, 999);
    };
    const setItemUseQuantity = (itemId, value) => {
      const id = normalize(String(itemId || ""));
      if (!id) return;
      itemUseQuantities.value[id] = clamp(Math.floor(Number(value) || 1), 1, bagItemMaxUseQuantity(id));
    };
    const openBagItemUseDialog = (item) => {
      const id = normalize(item && item.id);
      const pet = selectedPet.value;
      if (!pet) return showToast("请先选择背包亚比。");
      if (!id) return;
      if (getItemCount(id) <= 0) return showToast("该道具数量不足。");
      const max = bagItemMaxUseQuantity(id);
      const quantity = clamp(itemUseQuantity(id), 1, max);
      itemUseQuantities.value[id] = quantity;
      bagItemUseCtx.value = {
        itemId: id,
        targetPetId: pet.id,
        name: (item && item.name) || itemNameById(id, "道具"),
        count: getItemCount(id),
        max,
        quantity: String(quantity)
      };
    };
    const setBagItemUseDialogQuantity = (value) => {
      const ctx = bagItemUseCtx.value;
      if (!ctx) return;
      const max = bagItemMaxUseQuantity(ctx.itemId);
      const quantity = String(value ?? "").trim();
      bagItemUseCtx.value = {
        ...ctx,
        count: getItemCount(ctx.itemId),
        max,
        quantity
      };
    };
    const bagItemUseValidationText = computed(() => {
      const ctx = bagItemUseCtx.value;
      if (!ctx) return "";
      const max = bagItemMaxUseQuantity(ctx.itemId);
      const text = String(ctx.quantity ?? "").trim();
      if (!text) return `请输入1-${max}之间的使用数量`;
      const n = Number(text);
      if (!Number.isInteger(n) || n < 1 || n > max) return `使用数量必须是1-${max}之间的整数`;
      return "";
    });
    const cancelBagItemUseDialog = () => {
      bagItemUseCtx.value = null;
    };
    const confirmBagItemUseDialog = () => {
      const ctx = bagItemUseCtx.value;
      if (!ctx) return;
      const max = bagItemMaxUseQuantity(ctx.itemId);
      const text = String(ctx.quantity ?? "").trim();
      const amount = Number(text);
      if (!text || !Number.isInteger(amount) || amount < 1 || amount > max) {
        bagItemUseCtx.value = { ...ctx, count: getItemCount(ctx.itemId), max, quantity: text };
        return showToast(`使用数量必须是1-${max}之间的整数`);
      }
      itemUseQuantities.value[ctx.itemId] = amount;
      const targetPetId = normalize(ctx.targetPetId);
      bagItemUseCtx.value = null;
      return useShopItem(ctx.itemId, amount, { targetPetId });
    };

    const showToast = (message) => {
      toast.value = { show: true, message };
      setTimeout(() => { toast.value.show = false; }, 2200);
    };
    const playNextRewardFlyToast = () => {
      if (rewardFlyToastRunning) return;
      const next = rewardFlyToastQueue.shift();
      if (!next) {
        rewardFlyToast.value = { show: false, message: "", seq: rewardFlyToast.value.seq };
        return;
      }
      rewardFlyToastRunning = true;
      rewardFlyToast.value = {
        show: true,
        message: next,
        seq: Math.max(0, Number(rewardFlyToast.value.seq) || 0) + 1
      };
      setTimeout(() => {
        rewardFlyToast.value = { show: false, message: "", seq: rewardFlyToast.value.seq };
        rewardFlyToastRunning = false;
        playNextRewardFlyToast();
      }, 3300);
    };
    const queueRewardFlyToasts = (messages) => {
      (Array.isArray(messages) ? messages : [messages]).forEach((message) => {
        const text = normalize(message);
        if (text) rewardFlyToastQueue.push(text);
      });
      playNextRewardFlyToast();
    };
    const apiBaseUrl = () => {
      const protocol = String(window.location && window.location.protocol || "");
      if (protocol === "http:" || protocol === "https:") return "";
      return "http://127.0.0.1:3030";
    };
    const apiJson = async (url, options = {}) => {
      const targetUrl = `${apiBaseUrl()}${url}`;
      let res = null;
      const token = readAuthToken();
      const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
      if (token) headers.Authorization = `Bearer ${token}`;
      try {
        res = await fetch(targetUrl, {
          credentials: "include",
          headers,
          ...options
        });
      } catch {
        throw new Error("无法连接后端服务，请先运行 npm run server 后再登录/注册。");
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.ok === false) throw new Error(data.message || `请求失败：${res.status}`);
      return data;
    };
    const leaderboardCurrentLabel = computed(() => {
      const tab = leaderboardTabs.find((x) => x.key === leaderboardMetric.value);
      return tab ? tab.label : "战斗力";
    });
    const applyLeaderboardData = (data, fallbackMetric = "battlePower", fallbackPage = 1) => {
      if (!data || typeof data !== "object") return false;
      leaderboardMetric.value = data.metric || fallbackMetric;
      leaderboardPage.value = Math.max(1, Math.floor(Number(data.page) || fallbackPage));
      leaderboardTotalPages.value = Math.max(1, Math.floor(Number(data.totalPages) || 1));
      leaderboardRows.value = Array.isArray(data.rows) ? data.rows : [];
      return true;
    };
    const consumePreloadedLeaderboard = (metric) => {
      const bucket = (typeof window !== "undefined" && window.__aolaPreloadedLeaderboards && typeof window.__aolaPreloadedLeaderboards === "object")
        ? window.__aolaPreloadedLeaderboards
        : null;
      const data = bucket && bucket[metric];
      return data && applyLeaderboardData(data, metric, 1);
    };
    const fetchLeaderboard = async () => {
      leaderboardLoading.value = true;
      leaderboardError.value = "";
      try {
        const page = clamp(Math.floor(Number(leaderboardPage.value) || 1), 1, 999999);
        const metric = leaderboardTabs.some((x) => x.key === leaderboardMetric.value) ? leaderboardMetric.value : "battlePower";
        const data = await apiJson(`/api/leaderboard?metric=${encodeURIComponent(metric)}&page=${page}`);
        applyLeaderboardData(data, metric, page);
      } catch (err) {
        leaderboardRows.value = [];
        leaderboardTotalPages.value = 1;
        leaderboardError.value = err && err.message ? err.message : "排行榜加载失败。";
      } finally {
        leaderboardLoading.value = false;
      }
    };
    const loadServerSave = async () => {
      if (!authUser.value) return false;
      const data = await apiJson("/api/save");
      if (data && data.save && data.save.save) {
        state.value = sanitizeState(data.save.save);
        lastServerSavedAt.value = data.save.savedAt || "";
        showToast("已读取服务器存档。");
        return true;
      }
      state.value = createInitialState();
      lastServerSavedAt.value = "";
      showToast("当前用户暂无服务器存档，已初始化新进度。");
      return false;
    };
    const checkAuthSession = async () => {
      if (isAndroidWebView) {
        authUser.value = null;
        lastServerSavedAt.value = "";
        writeAuthToken("");
        writeSessionMode("guest");
        playMode.value = "guest";
        state.value = loadLocalState();
        authReady.value = true;
        refreshSceneBgm();
        return;
      }
      const remembered = readRememberLogin();
      rememberPassword.value = remembered.remember;
      loginCaptchaVerified.value = readLoginCaptchaVerified();
      if (remembered.remember) {
        authUsername.value = remembered.username;
        authPassword.value = remembered.password;
      }
      const mode = readSessionMode();
      if (mode === "guest") {
        writeAuthToken("");
        playMode.value = "guest";
        state.value = loadLocalState();
        authReady.value = true;
        refreshSceneBgm();
        return;
      }
      if (mode !== "user") {
        writeAuthToken("");
        playMode.value = "";
        state.value = createInitialState();
        authReady.value = true;
        refreshSceneBgm();
        return;
      }
      try {
        const data = await apiJson("/api/auth/me");
        authUser.value = data.user || null;
        if (authUser.value) {
          playMode.value = "user";
          await loadServerSave();
        } else {
          playMode.value = "";
          state.value = createInitialState();
          writeAuthToken("");
          writeSessionMode("");
        }
      } catch {
        authUser.value = null;
        playMode.value = "";
        state.value = createInitialState();
        writeAuthToken("");
        writeSessionMode("");
      } finally {
        authReady.value = true;
        refreshSceneBgm();
      }
    };
    const normalizeCaptchaText = (text) => normalize(text).replace(/\s+/g, " ");
    const validateLoginCaptcha = (options = {}) => {
      const force = Boolean(options && options.force);
      if (!force && loginCaptchaVerified.value) return true;
      if (normalizeCaptchaText(authCaptcha.value) === normalizeCaptchaText(LOGIN_CAPTCHA_TEXT)) {
        if (!force) writeLoginCaptchaVerified();
        return true;
      }
      showToast("验证码不正确，请按页面提示完整输入。");
      return false;
    };
    const enterGuestMode = () => {
      if (!validateLoginCaptcha()) return;
      authUser.value = null;
      lastServerSavedAt.value = "";
      writeAuthToken("");
      playMode.value = "guest";
      writeSessionMode("guest");
      state.value = loadLocalState();
      authCaptcha.value = "";
      showToast("已以游客身份进入，进度将保存到本机。");
      refreshSceneBgm();
    };
    const importGuestLocalSaveText = async (text) => {
      const imported = sanitizeState(parseLocalSaveText(text));
      authUser.value = null;
      lastServerSavedAt.value = "";
      writeAuthToken("");
      playMode.value = "guest";
      writeSessionMode("guest");
      state.value = imported;
      saveState(state.value);
      showToast("已导入本地存档并进入游客模式。");
      refreshSceneBgm();
    };
    const importGuestLocalSave = async (eventOrFile = null) => {
      const file = eventOrFile && eventOrFile.target
        ? eventOrFile.target.files && eventOrFile.target.files[0]
        : (eventOrFile || (guestImportInput.value && guestImportInput.value.files && guestImportInput.value.files[0]));
      if (!file) return;
      try {
        await importGuestLocalSaveText(await file.text());
      } catch (err) {
        showToast(err && err.message ? err.message : "本地存档导入失败。");
      } finally {
        if (guestImportInput.value) guestImportInput.value.value = "";
      }
    };
    const exportLocalSave = () => {
      try {
        if (!state.value || typeof state.value !== "object") {
          showToast("当前没有可导出的存档。");
          return;
        }
        if (playMode.value === "guest") saveState(state.value);
        const payload = sanitizeState(state.value);
        const text = JSON.stringify(payload, null, 2);
        const date = new Date();
        const pad = (n) => String(n).padStart(2, "0");
        const stamp = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}_${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
        const filename = `aola_battle_save_${stamp}.json`;
        if (window.AolaAndroid && typeof window.AolaAndroid.exportSaveJson === "function") {
          const result = String(window.AolaAndroid.exportSaveJson(filename, text) || "");
          if (result.startsWith("OK|")) {
            showToast(`已导出JSON存档文件：${result.slice(3)}`);
          } else if (result.startsWith("ERR|")) {
            showToast(`存档导出失败：${result.slice(4)}`);
          } else {
            showToast("已请求导出JSON存档文件。");
          }
          return;
        }
        const blob = new Blob([text], { type: "application/json;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.rel = "noopener";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        showToast("已导出JSON存档文件。");
      } catch (err) {
        showToast(err && err.message ? err.message : "存档导出失败。");
      }
    };
    const persistUserSave = async (options = {}) => {
      const force = Boolean(options && options.force);
      if (!authUser.value || (saveLoading.value && !force)) return false;
      const silent = Boolean(options && options.silent);
      const wasLoading = Boolean(saveLoading.value);
      const syncMaxBagBattlePower = () => {
        state.value.maxBagBattlePower = Math.max(
          Math.floor(Number(state.value.maxBagBattlePower) || 0),
          Math.floor(Number(maxBagBattlePower.value) || 0)
        );
      };
      saveLoading.value = true;
      try {
        syncMaxBagBattlePower();
        const data = await apiJson("/api/save", {
          method: "POST",
          body: JSON.stringify({ save: state.value })
        });
        lastServerSavedAt.value = data.savedAt || new Date().toISOString();
        saveState(state.value);
        if (!silent) showToast(`已保存到 ${data.saveDir || "用户存档目录"}`);
        return true;
      } catch (err) {
        if (!silent) showToast(err && err.message ? err.message : "服务器存档失败。");
        return false;
      } finally {
        if (!wasLoading) saveLoading.value = false;
      }
    };
    const saveUserBeforeUnload = () => {
      if (!authUser.value || playMode.value !== "user") return false;
      try {
        state.value.maxBagBattlePower = Math.max(
          Math.floor(Number(state.value.maxBagBattlePower) || 0),
          Math.floor(Number(maxBagBattlePower.value) || 0)
        );
        const token = readAuthToken();
        const body = JSON.stringify({ save: state.value });
        const tokenQuery = token ? `?token=${encodeURIComponent(token)}` : "";
        const url = `${apiBaseUrl()}/api/save${tokenQuery}`;
        if (navigator && typeof navigator.sendBeacon === "function") {
          const blob = new Blob([body], { type: "application/json" });
          if (navigator.sendBeacon(url, blob)) return true;
        }
        fetch(url, {
          method: "POST",
          credentials: "include",
          keepalive: true,
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body
        }).catch(() => {});
        return true;
      } catch {
        return false;
      }
    };
    const saveBeforeDesktopClose = async () => {
      if (playMode.value === "guest") {
        saveState(state.value);
        return true;
      }
      if (playMode.value === "user") {
        saveUserBeforeUnload();
        return await persistUserSave({ silent: true, force: true });
      }
      return false;
    };
    const importUserLocalSaveText = async (text) => {
      if (!authUser.value) {
        showToast("请先登录后再导入存档。");
        return;
      }
      const imported = sanitizeState(parseLocalSaveText(text));
      state.value = imported;
      const saved = await persistUserSave({ silent: true });
      showToast(saved ? "已导入本地存档并绑定到当前用户。" : "已导入本地存档，但服务器保存失败，请稍后手动存档。");
      refreshSceneBgm();
    };
    const importUserLocalSave = async (eventOrFile = null) => {
      const file = eventOrFile && eventOrFile.target
        ? eventOrFile.target.files && eventOrFile.target.files[0]
        : (eventOrFile || (userImportInput.value && userImportInput.value.files && userImportInput.value.files[0]));
      if (!file) return;
      if (!authUser.value) {
        showToast("请先登录后再导入存档。");
        if (userImportInput.value) userImportInput.value.value = "";
        return;
      }
      try {
        await importUserLocalSaveText(await file.text());
      } catch (err) {
        showToast(err && err.message ? err.message : "本地存档导入失败。");
      } finally {
        if (userImportInput.value) userImportInput.value.value = "";
      }
    };
    const triggerLocalSaveImport = () => {
      if (isAndroidWebView && window.AolaAndroid && typeof window.AolaAndroid.importSaveJson === "function") {
        window.AolaAndroid.importSaveJson();
        return;
      }
      if (authUser.value) {
        if (userImportInput.value && typeof userImportInput.value.click === "function") userImportInput.value.click();
        else showToast("导入入口尚未准备好，请稍后重试。");
        return;
      }
      if (guestImportInput.value && typeof guestImportInput.value.click === "function") guestImportInput.value.click();
      else showToast("导入入口尚未准备好，请稍后重试。");
    };
    const triggerUserLocalSaveImport = () => {
      if (isAndroidWebView && window.AolaAndroid && typeof window.AolaAndroid.importSaveJson === "function") {
        window.AolaAndroid.importSaveJson();
        return;
      }
      if (userImportInput.value && typeof userImportInput.value.click === "function") userImportInput.value.click();
      else showToast("导入入口尚未准备好，请稍后重试。");
    };
    const submitAuth = async () => {
      if (authLoading.value) return;
      const username = normalize(authUsername.value);
      const password = String(authPassword.value || "");
      if (!username || !password) {
        showToast("请输入用户名和密码。");
        return;
      }
      if (!validateLoginCaptcha({ force: authMode.value === "register" })) return;
      authLoading.value = true;
      try {
        const path = authMode.value === "register" ? "/api/auth/register" : "/api/auth/login";
        const data = await apiJson(path, {
          method: "POST",
          body: JSON.stringify({ username, password })
        });
        authUser.value = data.user || null;
        writeAuthToken(data.token || "");
        writeLoginCaptchaVerified();
        writeRememberLogin(username, password);
        if (!rememberPassword.value) authPassword.value = "";
        authCaptcha.value = "";
        playMode.value = "user";
        writeSessionMode("user");
        state.value = createInitialState();
        lastServerSavedAt.value = "";
        showToast(authMode.value === "register" ? "注册并登录成功。" : "登录成功。");
        if (authUser.value) await loadServerSave();
      } catch (err) {
        showToast(err && err.message ? err.message : "登录失败。");
      } finally {
        authLoading.value = false;
        refreshSceneBgm();
      }
    };
    const logoutUser = async () => {
      if (authUser.value) await persistUserSave({ silent: true });
      try { await apiJson("/api/auth/logout", { method: "POST", body: "{}" }); } catch {}
      authUser.value = null;
      writeAuthToken("");
      playMode.value = "";
      writeSessionMode("");
      state.value = createInitialState();
      lastServerSavedAt.value = "";
      showToast("已退出登录。");
      refreshSceneBgm();
    };
    const logoutGuest = () => {
      if (playMode.value === "guest") saveState(state.value);
      authUser.value = null;
      writeAuthToken("");
      playMode.value = "";
      writeSessionMode("");
      state.value = createInitialState();
      lastServerSavedAt.value = "";
      showToast("已退出游客登录。");
      refreshSceneBgm();
    };
    const saveToServer = async () => {
      if (!authUser.value) {
        showToast("请先登录后再存档。");
        return;
      }
      await persistUserSave();
    };
    const setBattleReturnContext = (ctx) => {
      battleReturnContext.value = ctx && typeof ctx === "object" ? { ...ctx } : null;
    };
    const restoreBattleReturnContext = () => {
      const ctx = battleReturnContext.value;
      battleReturnContext.value = null;
      if (!ctx) return;
      if (ctx.panel === "challengeRoad") {
        selectedChallengeRoadTierIndex.value = clamp(Math.floor(Number(ctx.tierIndex) || 0), 0, Math.max(0, challengeRoadTiers.value.length - 1));
        showChallengeRoadPanel.value = true;
        showChallengeRoadTierPanel.value = true;
      } else if (ctx.panel === "weeklyBoss") {
        showWeeklyBossPanel.value = true;
      } else if (ctx.panel === "dex") {
        state.value.showDexPanel = true;
        state.value.selectedDexId = null;
      }
    };
    const closeBattleResult = () => {
      battleResult.value = null;
      restoreBattleReturnContext();
      scheduleNextAutoBattle();
    };
    const challengeRecordingDb = () => new Promise((resolve, reject) => {
      if (typeof indexedDB === "undefined") return reject(new Error("IndexedDB unavailable"));
      const req = indexedDB.open("aola-star-challenge-recordings", 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains("videos")) {
          const store = db.createObjectStore("videos", { keyPath: "id" });
          store.createIndex("createdAt", "createdAt");
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error || new Error("IndexedDB open failed"));
    });
    const runChallengeRecordingStore = async (mode, payload = null) => {
      const db = await challengeRecordingDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction("videos", mode === "read" ? "readonly" : "readwrite");
        const store = tx.objectStore("videos");
        let req = null;
        if (mode === "read") req = store.getAll();
        else if (mode === "put") req = store.put(payload);
        else if (mode === "delete") req = store.delete(payload);
        tx.oncomplete = () => {
          db.close();
          resolve(req ? req.result : null);
        };
        tx.onerror = () => {
          db.close();
          reject(tx.error || new Error("IndexedDB transaction failed"));
        };
      });
    };
    const revokeChallengeRecordingUrls = () => {
      challengeRecordings.value.forEach((row) => {
        if (row && row.url && typeof URL !== "undefined") URL.revokeObjectURL(row.url);
      });
    };
    const loadChallengeRecordings = async () => {
      try {
        const rows = await runChallengeRecordingStore("read");
        revokeChallengeRecordingUrls();
        challengeRecordings.value = (Array.isArray(rows) ? rows : [])
          .sort((a, b) => (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0))
          .map((row) => ({
            ...row,
            url: row.blob && typeof URL !== "undefined" ? URL.createObjectURL(row.blob) : ""
          }));
      } catch (err) {
        console.warn("load challenge recordings failed", err);
        showToast("挑战录像读取失败。");
      }
    };
    const openChallengeRecordPanel = async () => {
      showChallengeRecordPanel.value = true;
      await loadChallengeRecordings();
    };
    const closeChallengeRecordPanel = () => {
      showChallengeRecordPanel.value = false;
    };
    const nativeChallengeRecordingSupported = () => Boolean(
      typeof navigator !== "undefined"
      && navigator.mediaDevices
      && typeof navigator.mediaDevices.getDisplayMedia === "function"
      && typeof MediaRecorder !== "undefined"
    );
    const bestChallengeRecordingMimeType = () => {
      const list = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"];
      return list.find((type) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(type)) || "";
    };
    const makeChallengeRecordingTitle = (meta = {}) => `${meta.targetName || "图鉴挑战"} Lv.${meta.targetLevel || ""}`.trim();
    const blobToBase64 = (blob) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const text = String(reader.result || "");
        resolve(text.includes(",") ? text.slice(text.indexOf(",") + 1) : text);
      };
      reader.onerror = () => reject(reader.error || new Error("Blob read failed"));
      reader.readAsDataURL(blob);
    });
    const exportBlobViaAndroid = async (filename, mimeType, blob) => {
      if (!window.AolaAndroid || typeof window.AolaAndroid.beginBlobExport !== "function") return false;
      const base64 = await blobToBase64(blob);
      let result = String(window.AolaAndroid.beginBlobExport(filename, mimeType || blob.type || "application/octet-stream") || "");
      if (!result.startsWith("OK")) throw new Error(result.startsWith("ERR|") ? result.slice(4) : "Android 导出初始化失败。");
      const chunkSize = 512 * 1024;
      for (let i = 0; i < base64.length; i += chunkSize) {
        result = String(window.AolaAndroid.appendBlobExportBase64(base64.slice(i, i + chunkSize)) || "");
        if (!result.startsWith("OK")) throw new Error(result.startsWith("ERR|") ? result.slice(4) : "Android 导出写入失败。");
      }
      result = String(window.AolaAndroid.finishBlobExportBase64() || "");
      if (result.startsWith("OK|")) {
        showToast(`录像已导出：${result.slice(3)}`);
        return true;
      }
      throw new Error(result.startsWith("ERR|") ? result.slice(4) : "Android 导出失败。");
    };
    const makeChallengeReplayFrame = () => {
      const scene = battleScene.value || {};
      const attackerMaxHp = Math.max(1, Number(scene.attackerMaxHp) || Number(scene.attackerHp) || 1);
      const targetMaxHp = Math.max(1, Number(scene.targetMaxHp) || Number(scene.targetHp) || 1);
      return {
        at: Date.now(),
        attackerName: scene.attackerName || "",
        attackerHp: Math.max(0, Number(scene.attackerHp) || 0),
        attackerMaxHp,
        attackerImage: scene.attackerStaticImage || scene.attackerImage || "",
        targetName: scene.targetName || "",
        targetHp: Math.max(0, Number(scene.targetHp) || 0),
        targetMaxHp,
        targetImage: scene.targetStaticImage || scene.targetImage || "",
        background: battleBackground.value && battleBackground.value.src ? battleBackground.value.src : "",
        log: Array.isArray(scene.logs) ? scene.logs.slice(-6) : []
      };
    };
    const drawChallengeCanvasFrame = (ctx, canvas, imageCache) => {
      const frame = makeChallengeReplayFrame();
      const w = canvas.width;
      const h = canvas.height;
      const bg = imageCache.get(frame.background);
      if (bg && bg.complete && bg.naturalWidth > 0) {
        ctx.drawImage(bg, 0, 0, w, h);
        ctx.fillStyle = "rgba(2, 6, 23, .54)";
        ctx.fillRect(0, 0, w, h);
      } else {
        const grd = ctx.createLinearGradient(0, 0, w, h);
        grd.addColorStop(0, "#07142f");
        grd.addColorStop(1, "#0f766e");
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, w, h);
      }
      ctx.fillStyle = "rgba(15, 23, 42, .72)";
      ctx.fillRect(24, 24, w - 48, h - 48);
      ctx.strokeStyle = "rgba(125, 211, 252, .55)";
      ctx.lineWidth = 3;
      ctx.strokeRect(24, 24, w - 48, h - 48);

      const drawPet = (src, x, y, maxW, maxH, flip = false) => {
        const img = imageCache.get(src);
        if (img && img.complete && img.naturalWidth > 0) {
          const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight);
          const iw = img.naturalWidth * scale;
          const ih = img.naturalHeight * scale;
          ctx.save();
          if (flip) {
            ctx.translate(x + maxW, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(img, (maxW - iw) / 2, y + (maxH - ih) / 2, iw, ih);
          } else {
            ctx.drawImage(img, x + (maxW - iw) / 2, y + (maxH - ih) / 2, iw, ih);
          }
          ctx.restore();
        }
      };
      const drawHp = (name, hp, maxHp, x, y, color) => {
        const pct = clamp((Number(hp) || 0) / Math.max(1, Number(maxHp) || 1), 0, 1);
        ctx.fillStyle = "rgba(2, 6, 23, .82)";
        ctx.fillRect(x, y, 360, 76);
        ctx.fillStyle = "#e0f2fe";
        ctx.font = "700 24px sans-serif";
        ctx.fillText(name || "亚比", x + 16, y + 30);
        ctx.fillStyle = "rgba(148, 163, 184, .55)";
        ctx.fillRect(x + 16, y + 48, 328, 14);
        ctx.fillStyle = color;
        ctx.fillRect(x + 16, y + 48, 328 * pct, 14);
      };

      drawPet(frame.targetImage, w - 430, 160, 300, 260, true);
      drawPet(frame.attackerImage, 120, 245, 340, 300, false);
      drawHp(frame.targetName, frame.targetHp, frame.targetMaxHp, w - 420, 60, "#fb7185");
      drawHp(frame.attackerName, frame.attackerHp, frame.attackerMaxHp, 60, h - 125, "#22c55e");
      ctx.fillStyle = "rgba(2, 6, 23, .68)";
      ctx.fillRect(520, h - 145, w - 1040, 112);
      ctx.fillStyle = "#f8fafc";
      ctx.font = "700 20px sans-serif";
      (frame.log || []).slice(-4).forEach((line, idx) => ctx.fillText(String(line).slice(0, 44), 544, h - 110 + idx * 24));
    };
    const cacheChallengeFrameImages = (imageCache) => {
      const frame = makeChallengeReplayFrame();
      [frame.background, frame.attackerImage, frame.targetImage].filter(Boolean).forEach((src) => {
        if (imageCache.has(src)) return;
        const img = new Image();
        img.decoding = "async";
        img.src = src;
        imageCache.set(src, img);
      });
    };
    const saveChallengeVideoRecording = async (active, blob, mimeType) => {
      const title = makeChallengeRecordingTitle(active.meta || {});
      await runChallengeRecordingStore("put", {
        id: uid(),
        kind: "video",
        title,
        targetName: active.meta && active.meta.targetName || "",
        targetLevel: active.meta && active.meta.targetLevel || "",
        createdAt: active.startedAt,
        durationMs: Date.now() - active.startedAt,
        mimeType: blob.type || mimeType || "video/webm",
        blob
      });
      await loadChallengeRecordings();
      showToast("挑战录像已保存。");
    };
    const startCanvasChallengeRecording = (meta = {}) => {
      if (typeof document === "undefined" || typeof MediaRecorder === "undefined") {
        showToast("当前环境不支持挑战录像录制。");
        return false;
      }
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 1280;
        canvas.height = 720;
        const ctx = canvas.getContext("2d");
        if (!ctx || typeof canvas.captureStream !== "function") {
          showToast("当前环境不支持挑战录像录制。");
          return false;
        }
        const stream = canvas.captureStream(12);
        const mimeType = bestChallengeRecordingMimeType();
        const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
        const chunks = [];
        const startedAt = Date.now();
        const imageCache = new Map();
        cacheChallengeFrameImages(imageCache);
        const timer = setInterval(() => {
          cacheChallengeFrameImages(imageCache);
          drawChallengeCanvasFrame(ctx, canvas, imageCache);
        }, 1000 / 12);
        drawChallengeCanvasFrame(ctx, canvas, imageCache);
        activeChallengeRecording.value = { mode: "canvas", recorder, stream, timer, chunks, startedAt, meta, canvas };
        recorder.ondataavailable = (event) => {
          if (event && event.data && event.data.size > 0) chunks.push(event.data);
        };
        recorder.onstop = async () => {
          const current = activeChallengeRecording.value;
          activeChallengeRecording.value = null;
          challengeRecordingBusy.value = true;
          try {
            clearInterval(timer);
            stream.getTracks().forEach((track) => track.stop());
            const blob = new Blob(chunks, { type: mimeType || "video/webm" });
            if (blob.size <= 0) return showToast("挑战录像为空，未保存。");
            await saveChallengeVideoRecording(current || { meta, startedAt }, blob, mimeType);
          } catch (err) {
            console.warn("save canvas challenge recording failed", err);
            showToast("挑战录像保存失败。");
          } finally {
            challengeRecordingBusy.value = false;
          }
        };
        recorder.start(1000);
        showToast("挑战录像录制已开始。");
        return true;
      } catch (err) {
        console.warn("start canvas challenge recording failed", err);
        showToast("当前环境不支持挑战录像录制。");
        return false;
      }
    };
    const startChallengeRecording = async (meta = {}) => {
      if (!challengeRecordingEnabled.value || activeChallengeRecording.value) return false;
      if (isAndroidWebView || !nativeChallengeRecordingSupported()) return startCanvasChallengeRecording(meta);
      try {
        challengeRecordingBusy.value = true;
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: { frameRate: 30 },
          audio: false
        });
        const mimeType = bestChallengeRecordingMimeType();
        const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
        const chunks = [];
        const startedAt = Date.now();
        activeChallengeRecording.value = { recorder, stream, chunks, startedAt, meta };
        recorder.ondataavailable = (event) => {
          if (event && event.data && event.data.size > 0) chunks.push(event.data);
        };
        recorder.onstop = async () => {
          const current = activeChallengeRecording.value;
          activeChallengeRecording.value = null;
          challengeRecordingBusy.value = true;
          try {
            stream.getTracks().forEach((track) => track.stop());
            const blob = new Blob(chunks, { type: mimeType || "video/webm" });
            if (blob.size <= 0) {
              showToast("挑战录像为空，未保存。");
              return;
            }
            const title = makeChallengeRecordingTitle(meta);
            await runChallengeRecordingStore("put", {
              id: uid(),
              kind: "video",
              title,
              targetName: meta.targetName || "",
              targetLevel: meta.targetLevel || "",
              createdAt: startedAt,
              durationMs: Date.now() - startedAt,
              mimeType: blob.type || "video/webm",
              blob
            });
            await loadChallengeRecordings();
            showToast("挑战录像已保存。");
          } catch (err) {
            console.warn("save challenge recording failed", err);
            showToast("挑战录像保存失败。");
          } finally {
            if (current && current.stream && current.stream !== stream) {
              current.stream.getTracks().forEach((track) => track.stop());
            }
            challengeRecordingBusy.value = false;
          }
        };
        recorder.start(1000);
        showToast("挑战录像录制已开始。");
        return true;
      } catch (err) {
        console.warn("start challenge recording failed", err);
        return startCanvasChallengeRecording(meta);
      } finally {
        challengeRecordingBusy.value = false;
      }
    };
    const stopChallengeRecording = async () => {
      const active = activeChallengeRecording.value;
      if (!active) return;
      if (active.timer) clearInterval(active.timer);
      if (!active.recorder) return;
      try {
        if (active.recorder.state !== "inactive") {
          challengeRecordingBusy.value = true;
          if (typeof active.recorder.requestData === "function") active.recorder.requestData();
          active.recorder.stop();
        }
      } catch (err) {
        console.warn("stop challenge recording failed", err);
        active.stream && active.stream.getTracks().forEach((track) => track.stop());
        activeChallengeRecording.value = null;
        challengeRecordingBusy.value = false;
      }
    };
    const exportChallengeRecording = async (row) => {
      if (!row || !row.blob) return showToast("录像文件不可导出。");
      const safeTitle = normalize(row.title || "挑战录像").replace(/[\\/:*?"<>|]/g, "_");
      const ext = row.kind === "replay" ? "json" : "webm";
      const filename = `${safeTitle}_${new Date(Number(row.createdAt) || Date.now()).toISOString().replace(/[:.]/g, "-")}.${ext}`;
      if (isAndroidWebView && window.AolaAndroid && typeof window.AolaAndroid.beginBlobExport === "function") {
        try {
          await exportBlobViaAndroid(filename, row.mimeType || row.blob.type || "video/webm", row.blob);
          return;
        } catch (err) {
          showToast(err && err.message ? err.message : "录像导出失败。");
          return;
        }
      }
      if (typeof URL === "undefined" || typeof document === "undefined") return showToast("录像文件不可导出。");
      const url = URL.createObjectURL(row.blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    };
    const deleteChallengeRecording = async (row) => {
      if (!row || !row.id) return;
      await runChallengeRecordingStore("delete", row.id);
      await loadChallengeRecordings();
      showToast("挑战录像已删除。");
    };
    const formatChallengeRecordingTime = (ts) => {
      const d = new Date(Number(ts) || Date.now());
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    };
    const restoreTimeTunnelEnvironmentAfterBattle = (scene, win) => {
      if (!scene || scene.mode !== "timeTunnel" || !scene.timeTunnelMeta) return;
      const floor = Math.max(1, Math.floor(Number(scene.timeTunnelMeta.floor) || 1));
      const envElement = normalizeElementName(scene.timeTunnelMeta.environmentElement);
      const envName = normalize(scene.timeTunnelMeta.environmentName);
      let envScene = timeTunnelEnvironmentScene.value;
      if (!envScene || Number(envScene.floor) !== floor) {
        envScene = buildTimeTunnelFloorScene(floor);
        timeTunnelEnvironmentScene.value = envScene;
      }
      if (envScene && envElement) {
        envScene.environment = {
          ...(envScene.environment || {}),
          element: envElement,
          name: envName || (envScene.environment && envScene.environment.name) || "",
          image: getTimeTunnelEnvironmentImage(envElement)
        };
      }
      showTimeTunnelPanel.value = false;
      showTimeTunnelEnvironmentPanel.value = true;
      if (!win) timeTunnelDoorScene.value = null;
      playSceneBgm(TIME_TUNNEL_BGM_SRC);
    };
    const stopAutoBattleRun = (message = "") => {
      if (!autoBattleRun.value) return;
      autoBattleRun.value = null;
      if (message) showToast(message);
    };
    const scheduleNextAutoBattle = () => {
      const run = autoBattleRun.value;
      if (!run || battleResult.value || battleScene.value) return;
      if (activeEvolution.value || evolutionQueue.value.length > 0) return;
      const remaining = Math.max(0, Math.floor(Number(run.remaining) || 0));
      if (remaining <= 0) {
        stopAutoBattleRun(`自动战斗已完成 ${Math.max(1, Math.floor(Number(run.total) || 10))} 次。`);
        return;
      }
      if (getItemCount("auto_battle_device") <= 0) {
        stopAutoBattleRun("自动战斗仪次数已用完。");
        return;
      }
      setTimeout(() => {
        const live = autoBattleRun.value;
        if (!live || battleResult.value || battleScene.value || activeEvolution.value || evolutionQueue.value.length > 0) return;
        startAutoBattleChallenge();
      }, 300);
    };
    const tryOpenNextEvolution = () => {
      if (activeEvolution.value || evolutionQueue.value.length === 0) return;
      activeEvolution.value = evolutionQueue.value.shift() || null;
    };
    const syncPetEvolutionForm = (pet) => {
      if (!pet) return pet;
      const chainAnchorDexId = Number((pet && pet.baseDexId) || (pet && pet.dexId)) || 0;
      const chain = getChainStageInfoByDexId(chainAnchorDexId || pet.dexId, pet.speciesName);
      const levelStage = stageIndexByLevelAndCount(pet.level, chain.formCount, chain.evoLevels);
      const fixedStage = Number(pet.fixedStageIndex);
      if (Number.isFinite(fixedStage) && levelStage >= fixedStage) {
        delete pet.fixedStageIndex;
      }
      const stage = resolvePetStageIndex(pet, chain);
      const evoDexId = resolveEvolutionDexIdByPetAndStage(pet, stage);
      if (Number(evoDexId) <= 0) return pet;
      const evoDex = dexById.get(Number(evoDexId)) || null;
      pet.dexId = Number(evoDexId);
      if (evoDex) {
        pet.speciesName = normalize(evoDex.name) || pet.speciesName;
        pet.element = normalize(evoDex.element) || pet.element || "未知系";
        pet.subElement = normalize(evoDex.subElement) || "";
      }
      const species = getSpeciesByDexId(pet.dexId, pet.speciesName);
      if (species) pet.equippedSkills = currentEquippedSkillNamesBySpecies(species, pet.equippedSkills, skillLevelForPet(pet), petExtraSkills(pet));
      if (!state.value.activatedDexIds.includes(Number(evoDexId))) state.value.activatedDexIds.push(Number(evoDexId));
      return pet;
    };
    const closeEvolutionModal = () => {
      const current = activeEvolution.value;
      if (current && current.petId) {
        const pet = state.value.activePets.find((p) => p && p.id === current.petId);
        if (pet) {
          syncPetEvolutionForm(pet);
          autoFillSkills(pet);
        }
      }
      activeEvolution.value = null;
      // 关闭当前后继续弹出队列中的下一个进化
      setTimeout(() => {
        tryOpenNextEvolution();
        scheduleNextAutoBattle();
      }, 50);
    };
    const stopBattleBgm = () => {
      const audio = battleBgmAudio.value;
      if (!audio) return;
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {}
    };
    const stopSceneBgm = () => {
      const audio = sceneBgmAudio.value;
      if (!audio) return;
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {}
    };
    const playSceneBgm = (src) => {
      if (battleScene.value && battleScene.value.open) return;
      const nextSrc = normalize(src) || HOME_BGM_SRC;
      try {
        if (!sceneBgmAudio.value) {
          const audio = new Audio(nextSrc);
          audio.loop = true;
          audio.preload = "auto";
          audio.volume = clamp(Number(bgmVolume.value) || 0, 0, 1);
          audio.muted = audio.volume <= 0;
          sceneBgmAudio.value = audio;
          currentSceneBgmSrc.value = nextSrc;
        }
        const audio = sceneBgmAudio.value;
        if (currentSceneBgmSrc.value !== nextSrc || !String(audio.src || "").includes(nextSrc.replace("./", ""))) {
          audio.pause();
          audio.src = nextSrc;
          audio.currentTime = 0;
          currentSceneBgmSrc.value = nextSrc;
        }
        audio.loop = true;
        applyBgmVolume();
        const task = audio.play();
        if (task && typeof task.catch === "function") task.catch(() => {});
      } catch {}
    };
    const refreshSceneBgm = () => {
      if (battleScene.value && battleScene.value.open) return;
      if (!playMode.value) return playSceneBgm(LOGIN_BGM_SRC);
      if (showTimeTunnelPanel.value || showTimeTunnelEnvironmentPanel.value) return playSceneBgm(TIME_TUNNEL_BGM_SRC);
      if (showStudyPanel.value) return playSceneBgm(STUDY_BGM_SRC);
      if (showShopPanel.value) return playSceneBgm(SHOP_BGM_SRC);
      if (showWarehousePanel.value) return playSceneBgm(WAREHOUSE_BGM_SRC);
      return playSceneBgm(HOME_BGM_SRC);
    };
    const playBattleBgm = () => {
      try {
        stopSceneBgm();
        if (!battleBgmAudio.value) {
          const audio = new Audio(BATTLE_BGM_SRC);
          audio.loop = true;
          audio.preload = "auto";
          audio.volume = clamp(Number(bgmVolume.value) || 0, 0, 1);
          audio.muted = audio.volume <= 0;
          battleBgmAudio.value = audio;
        }
        const audio = battleBgmAudio.value;
        audio.loop = true;
        applyBgmVolume();
        const task = audio.play();
        if (task && typeof task.catch === "function") task.catch(() => {});
      } catch {}
    };
    const hpPercent = (hp, maxHp) => {
      const max = Math.max(1, Number(maxHp) || 1);
      const cur = clamp(Number(hp) || 0, 0, max);
      return clamp((cur / max) * 100, 0, 100);
    };
    const skillBattleDesc = (skill) => skillDisplayDesc(skill);
    const battleStageBadges = (side) => {
      const ns = normalizeBattleState(side && side.stages ? side : { stages: side });
      const st = ns.stages;
      const rows = [
        { key: "atk", label: "攻击", value: st.atk || 0 },
        { key: "spAtk", label: "特攻", value: st.spAtk || 0 },
        { key: "def", label: "防御", value: st.def || 0 },
        { key: "spDef", label: "特防", value: st.spDef || 0 },
        { key: "accuracy", label: "命中", value: st.accuracy || 0 },
        { key: "evasion", label: "闪避", value: st.evasion || 0 },
        { key: "speed", label: "速度", value: st.speed || 0 },
        { key: "critStage", label: "暴击", value: ns.critStage || 0 }
      ];
      return rows.map((r) => ({
        ...r,
        text: `${r.label}${r.value >= 0 ? "+" : ""}${r.value}`,
        cls: r.value > 0 ? "bg-rose-500/85 text-white border-rose-300/80" : (r.value < 0 ? "bg-emerald-500/85 text-white border-emerald-300/80" : "bg-slate-700/75 text-slate-100 border-slate-400/70")
      }));
    };

    const addEvolutionFx = (petId) => {
      if (!evolvingIds.value.includes(petId)) {
        evolvingIds.value.push(petId);
        setTimeout(() => {
          evolvingIds.value = evolvingIds.value.filter((id) => id !== petId);
        }, 1300);
      }
    };
    const openUnreadReleaseNotes = () => {
      showReleaseNotesModal.value = true;
    };
    const closeReleaseNotesModal = () => {
      showReleaseNotesModal.value = false;
    };
    const openGameplayGuideModal = () => {
      showGameplayGuideModal.value = true;
    };
    const closeGameplayGuideModal = () => {
      showGameplayGuideModal.value = false;
    };

    if (storageAdapter.mode === "localStorage") {
      watch(state, () => {
        if (playMode.value === "guest") saveState(state.value);
      }, { deep: true });
    }
    watch(() => state.value && state.value.battleSpeed, (value) => {
      const next = clampBattleSpeed(value || battleSpeed.value || 1);
      if (battleSpeed.value !== next) battleSpeed.value = next;
      if (battleScene.value && typeof battleScene.value === "object") battleScene.value.battleSpeed = next;
      writeBattleSpeed(next);
    }, { immediate: true });
    watch(authReady, (ready) => {
      if (ready) openUnreadReleaseNotes();
    }, { immediate: true });
    let timer = null;
    let removeDesktopAutoSaveBeforeClose = null;
    const handleAutoSave = () => {
      if (playMode.value === "guest") saveState(state.value);
      else if (playMode.value === "user") saveUserBeforeUnload();
    };
    const handleVisibilityAutoSave = () => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") handleAutoSave();
    };
    const updateViewportSize = () => {
      if (typeof window === "undefined") return;
      viewportSize.value = {
        width: Math.max(1, Number(window.innerWidth) || 1700),
        height: Math.max(1, Number(window.innerHeight) || 765)
      };
    };
    onMounted(() => {
      timer = setInterval(() => { nowTs.value = Date.now(); }, 1000);
      updateViewportSize();
      loadPetActionLayout();
      checkAuthSession();
      window.__aolaAndroidReceiveSaveJson = async (text) => {
        try {
          if (authUser.value) await importUserLocalSaveText(text);
          else await importGuestLocalSaveText(text);
        } catch (err) {
          showToast(err && err.message ? err.message : "本地存档导入失败。");
        }
      };
      window.__aolaAndroidImportFailed = (message) => {
        showToast(message ? `本地存档导入失败：${message}` : "本地存档导入失败。");
      };
      window.addEventListener("resize", updateViewportSize);
      window.addEventListener("orientationchange", updateViewportSize);
      window.addEventListener("beforeunload", handleAutoSave);
      window.addEventListener("pagehide", handleAutoSave);
      document.addEventListener("visibilitychange", handleVisibilityAutoSave);
      if (window.aolaDesktop && typeof window.aolaDesktop.onAutoSaveBeforeClose === "function") {
        removeDesktopAutoSaveBeforeClose = window.aolaDesktop.onAutoSaveBeforeClose(async (payload = {}) => {
          try {
            await saveBeforeDesktopClose();
          } finally {
            if (window.aolaDesktop && typeof window.aolaDesktop.autoSaveDone === "function") {
              window.aolaDesktop.autoSaveDone(payload.windowId);
            }
          }
        });
      }
    });
    onBeforeUnmount(() => {
      if (timer) clearInterval(timer);
      stopChallengeRecording();
      revokeChallengeRecordingUrls();
      stopBattleBgm();
      stopSceneBgm();
      delete window.__aolaAndroidReceiveSaveJson;
      delete window.__aolaAndroidImportFailed;
      window.removeEventListener("resize", updateViewportSize);
      window.removeEventListener("orientationchange", updateViewportSize);
      window.removeEventListener("beforeunload", handleAutoSave);
      window.removeEventListener("pagehide", handleAutoSave);
      document.removeEventListener("visibilitychange", handleVisibilityAutoSave);
      if (typeof removeDesktopAutoSaveBeforeClose === "function") {
        removeDesktopAutoSaveBeforeClose();
        removeDesktopAutoSaveBeforeClose = null;
      }
    });

    watch(() => state.value.activePets.map((p) => p.id).join("|"), () => {
      state.value.bagPetIds = normalizeBagIds(state.value.bagPetIds, state.value.activePets);
      state.value.selectedAttackerId = state.value.bagPetIds[0] || "";
    });
    watch(bgmVolume, () => {
      writeBgmVolume(bgmVolume.value);
      applyBgmVolume();
    });

    const selectedDexEntry = computed(() => {
      if (!state.value.selectedDexId) return null;
      return visibleDexEntries.find((d) => d.dexId === state.value.selectedDexId) || null;
    });
    const selectedDexSpecies = computed(() => {
      const entry = selectedDexEntry.value;
      if (!entry) return null;
      const chain = getChainStageInfoByDexId(entry.dexId, entry.name);
      return getSpeciesByDexId(chain.rootDexId, entry.name) || null;
    });
    const selectedDexChainInfo = computed(() => {
      const entry = selectedDexEntry.value;
      if (!entry) return { rootDexId: 0, formCount: 1, stageIndex: 0 };
      return getChainStageInfoByDexId(entry.dexId, entry.name);
    });
    const selectedDexFormCount = computed(() => {
      return clamp(Number(selectedDexChainInfo.value.formCount) || 1, 1, 3);
    });
    const selectedDexStageIndex = computed(() => {
      return clamp(Number(selectedDexChainInfo.value.stageIndex) || 0, 0, selectedDexFormCount.value - 1);
    });
    const selectedDexAvailableFormIndices = computed(() => [selectedDexStageIndex.value]);
    const selectedChallengeFormIndex = computed(() => {
      return selectedDexStageIndex.value;
    });
    const selectedChallengeForm = computed(() => {
      const species = selectedDexSpecies.value;
      const entry = selectedDexEntry.value;
      if (!species || !entry) return null;
      return {
        index: selectedChallengeFormIndex.value,
        // 弹窗名称与图鉴 dex 名称保持一致，不显示“初阶/进阶”后缀
        name: normalize(entry.name),
        image: ensureHttps(entry.image) || PLACEHOLDER
      };
    });
    const selectedDexBattleImage = computed(() => {
      const entry = selectedDexEntry.value;
      return ensureHttps(entry && entry.image) || PLACEHOLDER;
    });
    const targetLevelInput = computed({
      get: () => state.value.targetLevel === null || state.value.targetLevel === undefined ? "" : String(state.value.targetLevel),
      set: (value) => {
        const text = String(value ?? "").trim();
        state.value.targetLevel = text;
      }
    });
    const targetLevelValidationText = computed(() => {
      const range = selectedChallengeLevelRange.value;
      const text = String(state.value.targetLevel ?? "").trim();
      if (!text) return `请输入${range.min}-${range.max}之间的等级`;
      const n = Number(text);
      if (!Number.isInteger(n) || n < range.min || n > range.max) return `挑战等级必须是${range.min}-${range.max}之间的整数`;
      return "";
    });
    const selectedChallengeLevelRange = computed(() => {
      const info = selectedDexChainInfo.value;
      const finalStage = (Number(info.formCount) || 1) <= 1 || Number(info.stageIndex) >= (Number(info.formCount) || 1) - 1;
      return finalStage ? { min: 60, max: 100 } : { min: 1, max: 100 };
    });
    const selectedChallengeDefaultLevel = computed(() => selectedChallengeLevelRange.value.min);
    const selectedChallengeFormLabel = computed(() => {
      const count = selectedDexFormCount.value;
      const idx = selectedDexStageIndex.value;
      if (count === 1) return "最终形态";
      if (count === 2) return idx === 0 ? "第一形态" : "最终形态";
      if (idx === 0) return "第一形态";
      if (idx === 1) return "第二形态";
      return "最终形态";
    });
    watch([selectedDexEntry, selectedDexStageIndex], () => {
      state.value.challengeFormIndex = selectedDexStageIndex.value;
      const range = selectedChallengeLevelRange.value;
      const n = Number(state.value.targetLevel);
      state.value.targetLevel = String(Number.isInteger(n) ? clamp(n, range.min, range.max) : selectedChallengeDefaultLevel.value);
    }, { immediate: true });
    const selectedPet = computed(() => {
      const real = state.value.activePets.find((p) => p.id === state.value.selectedPetId) || null;
      return detailPreviewPet.value || real || null;
    });
    watch(selectedPet, (pet) => {
      const seal = qixingSealForPet(pet);
      if (seal) selectedQixingSealId.value = seal.id;
    }, { immediate: true });
    const selectedDexDetailPet = computed(() => {
      const entry = selectedDexEntry.value;
      if (!entry) return null;
      const targetDexId = Number(entry.dexId) || 0;
      const targetRootDexId = chainRootByDex.get(targetDexId) || targetDexId;
      return safeActivePets.value.find((p) => {
        const petDexId = Number(p.dexId) || 0;
        const petRootDexId = chainRootByDex.get(petDexId) || petDexId;
        return petDexId === targetDexId || petRootDexId === targetRootDexId;
      }) || null;
    });

    const bagSlots = computed(() => state.value.bagPetIds.map((id, idx) => ({
      idx,
      pet: state.value.activePets.find((p) => p.id === id) || null
    })));
    const firstPet = computed(() => (bagSlots.value[0] && bagSlots.value[0].pet) ? bagSlots.value[0].pet : null);
    const bagPets = computed(() => bagSlots.value.map((x) => x.pet).filter((p) => p && p.id));
    const selectedBagSlotIndex = computed(() => {
      const id = petId(selectedPet.value);
      if (!id) return -1;
      return bagSlots.value.findIndex((slot) => slot.pet && petId(slot.pet) === id);
    });
    const bagCount = computed(() => bagPets.value.length);
    const safeActivePets = computed(() => state.value.activePets.filter((p) => p && p.id));
    const warehousePets = computed(() => safeActivePets.value.filter((p) => !state.value.bagPetIds.includes(p.id)));
    const warehouseCount = computed(() => warehousePets.value.length);
    const shopTargetOptions = computed(() => bagPets.value.map((p) => ({
      id: p.id,
      name: petDisplayName(p),
      level: p.level
    })));
    const shopSelectedPet = computed(() => bagPets.value.find((p) => p && p.id === shopTargetPetId.value) || null);
    const shopSelectedPetHasQixingSeal = computed(() => normalize(shopSelectedPet.value && shopSelectedPet.value.equippedItemId) === QIXING_SEAL_ITEM_ID);
    const itemById = (itemId) => itemCatalog.value.find((it) => normalize(it.id) === normalize(itemId)) || null;
    const petEquippedItem = (pet) => {
      const id = normalize(pet && pet.equippedItemId);
      if (!id) return null;
      const item = itemById(id);
      if (id === QIXING_SEAL_ITEM_ID) {
        const seal = qixingSealForPet(pet);
        const level = clamp(Math.floor(Number(seal && seal.level) || 1), 1, QIXING_SEAL_MAX_LEVEL);
        const meta = qixingSealMeta(seal);
        return { ...(item || { id, name: meta.name }), name: meta.name, level, image: meta.image, label: `${meta.name} Lv.${level}` };
      }
      return item;
    };
    const selectedPetEquippedItem = computed(() => petEquippedItem(selectedPet.value));
    const itemInventoryRows = computed(() => itemCatalog.value.map((it) => ({
      ...it,
      count: getItemCount(it.id),
      countLabel: it.id === "double_exp_device" || it.id === "auto_battle_device" ? `${getItemCount(it.id)} 次` : `× ${getItemCount(it.id)}`
    })));
    const autoBattleDeviceCount = computed(() => getItemCount("auto_battle_device"));
    const openShopEggDetail = (dexId) => {
      const entry = dexById.get(Number(dexId));
      if (!entry) return showToast("找不到该亚比蛋对应的亚比。");
      const species = getSpeciesByDexId(entry.dexId, entry.name);
      if (!species) return showToast("该亚比暂无已生成的技能/种族值数据。");
      const lv = 100;
      const unlocked = (species.skills || []).filter((s) => Number(s.level) <= lv).map((s) => normalizeSkillKey(s.name)).filter(Boolean);
      detailPreviewPet.value = {
        id: `preview_shop_egg_${entry.dexId}`,
        dexId: entry.dexId,
        fixedDexId: entry.dexId,
        fixedName: entry.name,
        fixedImage: ensureHttps(entry.image) || PLACEHOLDER,
        previewAllSkills: true,
        hideStudyTalentTabs: true,
        speciesName: entry.name,
        level: lv,
        exp: 0,
        totalExp: 0,
        element: entry.element || "",
        subElement: entry.subElement || "",
        equippedSkills: unlocked,
        talent: createRandomHatchTalent(),
        study: createZeroStats()
      };
      showPetDetailModal.value = true;
      selectedInfoTab.value = "skills";
      syncSelectedSkillName();
    };
    const warehouseElementOptions = computed(() => {
      const set = new Set();
      warehousePets.value.forEach((p) => {
        const e = normalizeElementName(p.element);
        if (e) set.add(e);
      });
      return ["全部系别"].concat(Array.from(set).sort((a, b) => a.localeCompare(b, "zh-Hans-CN")));
    });
    const filteredWarehousePets = computed(() => {
      const keyword = normalize(warehouseSearch.value).toLowerCase();
      const element = normalizeElementName(warehouseElementFilter.value) || normalize(warehouseElementFilter.value);
      const orderOf = (pet) => Number(pet && pet.createdAt) || 0;
      const powerOf = (pet) => calcPetBattlePower(pet);
      const list = warehousePets.value.filter((pet) => {
        const name = normalize(petDisplayName(pet)).toLowerCase();
        const speciesName = normalize(pet.speciesName).toLowerCase();
        const petElement = normalizeElementName(pet.element);
        const hitName = !keyword || name.includes(keyword) || speciesName.includes(keyword);
        const hitElement = !element || element === "全部系别" || petElement === element;
        return hitName && hitElement;
      });
      const mode = normalize(warehouseSortMode.value);
      return list.slice().sort((a, b) => {
        if (mode === "power_asc") return powerOf(a) - powerOf(b) || orderOf(a) - orderOf(b);
        if (mode === "power_desc") return powerOf(b) - powerOf(a) || orderOf(a) - orderOf(b);
        if (mode === "level_asc") return (Number(a.level) || 0) - (Number(b.level) || 0) || orderOf(a) - orderOf(b);
        if (mode === "level_desc") return (Number(b.level) || 0) - (Number(a.level) || 0) || orderOf(a) - orderOf(b);
        if (mode === "created_desc") return orderOf(b) - orderOf(a);
        return orderOf(a) - orderOf(b);
      });
    });
    const safeEggs = computed(() => state.value.eggs.filter((e) => e && e.id));
    const safeBattleLog = computed(() => sanitizeBattleLog(state.value.battleLog));

    const dexElementOptions = computed(() => {
      const set = new Set();
      visibleDexEntries.forEach((d) => {
        const e = normalizeElementName(d.element);
        if (e) set.add(e);
        const se = normalizeElementName(d.subElement);
        if (se) set.add(se);
      });
      return ["全部系别"].concat(Array.from(set).sort((a, b) => a.localeCompare(b, "zh-Hans-CN")));
    });
    const filteredDex = computed(() => {
      const q = normalize(dexSearch.value).toLowerCase();
      const element = normalizeElementName(dexElementFilter.value) || normalize(dexElementFilter.value);
      const defeat = normalize(dexDefeatFilter.value);
      return visibleDexEntries.filter((d) => {
        const hitName = !q || d.name.toLowerCase().includes(q);
        const hitElement = !element || element === "全部系别" || normalizeElementName(d.element) === element || normalizeElementName(d.subElement) === element;
        const won = hasDefeatedDex(d.dexId);
        const hitDefeat = !defeat || defeat === "全部战绩" || (defeat === "已击败" ? won : !won);
        return hitName && hitElement && hitDefeat;
      });
    });
    const guardianDexEntries = computed(() => visibleDexEntries.filter((d) => isGuardianName(d.name)));
    const bossDexEntries = computed(() => visibleDexEntries.filter((d) => isBossEntry(d)));
    const timeTunnelMaxClearedFloor = computed(() => Math.max(0, Math.floor(Number(state.value.timeTunnelMaxClearedFloor) || 0)));
    const timeTunnelMaxEnterFloor = computed(() => Math.min(TIME_TUNNEL_OPEN_MAX_FLOOR, Math.max(TIME_TUNNEL_MIN_CLEAR_FLOOR, timeTunnelMaxClearedFloor.value + 1)));
    const timeTunnelFloorRows = computed(() => TIME_TUNNEL_SELECT_FLOORS.map((floor) => ({
      floor,
      open: floor <= timeTunnelMaxEnterFloor.value,
      locked: floor > timeTunnelMaxEnterFloor.value,
      cleared: timeTunnelMaxClearedFloor.value >= floor
    })));
    const selectedTimeTunnelFloorRow = computed(() => timeTunnelFloorRows.value.find((x) => x.floor === Number(timeTunnelSelectedFloor.value)) || timeTunnelFloorRows.value[0]);
    const selectedTimeTunnelSpecialRules = computed(() => {
      const floor = Math.max(1, Math.floor(Number(selectedTimeTunnelFloorRow.value && selectedTimeTunnelFloorRow.value.floor) || 1));
      if (floor === 20) return ["第20层特殊规则：守卫整场减伤20%，命中率提升100%，受到火系技能攻击时伤害减少80%。"];
      if (floor === 25) return ["第25层特殊规则：守卫整场减伤25%，对机械系亚比造成伤害提升50%。暗影甲龙被击败后，十字匹诺斗志激发，并额外获得伤害提升40%。"];
      return [];
    });
    const timeTunnelEnvironmentEnemies = computed(() => {
      const scene = timeTunnelEnvironmentScene.value;
      return scene && Array.isArray(scene.enemies) ? scene.enemies : [];
    });
    const weeklyBossEntry = computed(() => {
      const entry = dexById.get(WEEKLY_BOSS_CONFIG.dexId);
      return entry ? { ...entry, name: WEEKLY_BOSS_CONFIG.name } : null;
    });
    const weeklyBossAnimSrc = computed(() => getTimeTunnelBattleAnimSrc(WEEKLY_BOSS_CONFIG.dexId));
    const weeklyBossAnimStyle = computed(() => {
      const vh = Math.max(1, Number(viewportSize.value && viewportSize.value.height) || 720);
      const targetBodyH = Math.floor(clamp(vh * 0.4, 300, 390));
      const style = centerPetAnimBodyStyle(getPetAnimLayoutStyle(WEEKLY_BOSS_CONFIG.dexId, "1", "1", targetBodyH, "center"), WEEKLY_BOSS_CONFIG.dexId, "1", "1");
      if (!style.renderW) return {};
      return {
        "--pet-anim-render-width": style.renderW,
        "--pet-anim-render-height": style.renderH,
        "--pet-anim-offset-x": style.offsetX,
        "--pet-anim-offset-y": style.offsetY,
        "--pet-anim-clip-top": style.clipTop || "0%",
        "--pet-anim-clip-right": style.clipRight || "0%",
        "--pet-anim-clip-bottom": style.clipBottom || "0%",
        "--pet-anim-clip-left": style.clipLeft || "0%"
      };
    });
    const weeklyBossAttemptsUsed = computed(() => {
      const row = state.value.weeklyBossAttempts && typeof state.value.weeklyBossAttempts === "object" ? state.value.weeklyBossAttempts : {};
      return normalize(row.bossKey) === WEEKLY_BOSS_CONFIG.key && normalize(row.date) === localDateKey() ? Math.max(0, Math.floor(Number(row.used) || 0)) : 0;
    });
    const weeklyBossAttemptsLeft = computed(() => Math.max(0, WEEKLY_BOSS_CONFIG.dailyAttempts - weeklyBossAttemptsUsed.value));
    const weeklyBossCleared = computed(() => {
      const rewards = state.value.weeklyBossHonorRewards && typeof state.value.weeklyBossHonorRewards === "object" ? state.value.weeklyBossHonorRewards : {};
      return !!rewards[WEEKLY_BOSS_CONFIG.key];
    });
    const weeklyBossDifficultyOptions = WEEKLY_BOSS_DIFFICULTY_OPTIONS;
    const selectedWeeklyBossDifficultyOption = computed(() => WEEKLY_BOSS_DIFFICULTY_BY_KEY.get(selectedWeeklyBossDifficulty.value) || WEEKLY_BOSS_DIFFICULTY_OPTIONS[0]);
    const weeklyBossDivineKeyClaimed = computed(() => Boolean(ensureWeeklyBossRewardState().divinePetKeyClaimed));
    const weeklyBossEggExchanged = computed(() => Boolean(ensureWeeklyBossRewardState().exchangedEgg) || hasObtainedEggDex(WEEKLY_BOSS_CONFIG.dexId));
    const weeklyBossChallengeText = computed(() => {
      const option = selectedWeeklyBossDifficultyOption.value;
      const medalRange = Array.isArray(option.rewardMedals) ? option.rewardMedals : [0, 0];
      const medalText = medalRange[0] === medalRange[1] ? `${medalRange[0]}个` : `${medalRange[0]}-${medalRange[1]}个`;
      const nightmareText = option.key === "nightmare" ? "并附加随机一项异常状态" : "";
      const keyText = weeklyBossDivineKeyClaimed.value ? "神宠之匙已领取过，本周BOSS不再重复发放" : `首次获胜可获得神宠之匙×${option.divinePetKeyCount}`;
      const badgeText = option.blackgoldBadge ? `，首次通关噩梦额外获得${WEEKLY_BOSS_CONFIG.honorBadgeName}` : "";
      return `当周BOSS：${WEEKLY_BOSS_CONFIG.name} ${option.label}难度，体力${option.fixedHp}，自带${Math.round(option.damageReductionRatio * 100)}%减伤，装配启星之印Lv.${WEEKLY_BOSS_CONFIG.qixingSealLevel}；每3回合随机提升属性${option.randomStageDelta}级${nightmareText}。胜利获得${medalText}当周BOSS勋章、${option.rewardHCoins}H币；${keyText}${badgeText}。勋章上限${WEEKLY_BOSS_MEDAL_MAX}个，${WEEKLY_BOSS_EGG_EXCHANGE_COST}个可兑换${WEEKLY_BOSS_CONFIG.name}亚比蛋。`;
    });
    const timeEnvViewportStyle = computed(() => {
      const designW = 1700;
      const designH = 765;
      const vw = Math.max(1, Number(viewportSize.value.width) || designW);
      const vh = Math.max(1, Number(viewportSize.value.height) || designH);
      const scale = Math.min(vw / designW, vh / designH);
      return {
        width: `${designW}px`,
        height: `${designH}px`,
        left: `${Math.max(0, (vw - designW * scale) / 2)}px`,
        top: `${Math.max(0, (vh - designH * scale) / 2)}px`,
        transform: `scale(${scale})`
      };
    });
    const shopEggEntries = computed(() => dexEntries.filter((entry) => isShopEggEntry(entry)).map((entry) => ({ ...entry, price: SHOP_EGG_PRICE })));
    const selectedGuardianEntry = computed(() => {
      const id = Number(selectedGuardianDexId.value) || 0;
      if (!id) return null;
      return dexById.get(id) || null;
    });
    const selectedBossEntry = computed(() => {
      const id = Number(selectedBossDexId.value) || 0;
      if (!id) return null;
      return dexById.get(id) || null;
    });
    const selectedGuardianIsExtra = computed(() => Boolean(selectedGuardianEntry.value && isExtraGuardianName(selectedGuardianEntry.value.name)));
    const selectedGuardianChallengeText = computed(() => selectedGuardianIsExtra.value
      ? "进阶守护者挑战：Lv.100 单阶段，体力种族为原种族值×10，天赋值均为50，除体力外学习力均为102，在现有基础上所有能力值再提升30%，免疫异常状态，通关后可获得对应亚比蛋和 1000 H币。"
      : "基础守护者挑战：从 Lv.30 开始逐级挑战至 Lv.100，体力种族为原种族值×5，天赋值均为30，除体力外学习力均为102，免疫异常状态，每击败一个阶段会清空我方能力等级，通关后获得对应亚比蛋和 500 H币。");
    const selectedBossDifficultyOption = computed(() => BOSS_DIFFICULTY_OPTIONS.find((x) => x.key === selectedBossDifficulty.value) || BOSS_DIFFICULTY_OPTIONS[0]);
    const selectedBossChallengeText = computed(() => {
      const option = selectedBossDifficultyOption.value;
      const boostPct = Math.round((Number(option.statBoostRatio) || 0) * 100);
      const fixedHp = Math.max(1, Math.floor(Number(option.fixedHp) || 1));
      const damageReductionPct = Math.round(clamp(Number(option.damageReductionRatio) || 0, 0, 0.95) * 100);
      const moraleText = option.moraleDelta > 0
        ? `，每过10回合激发${option.moraleLabel}，全属性提升${option.moraleDelta}级`
        : "";
      const reward = BOSS_DIFFICULTY_FIRST_WIN_REWARDS[option.key] || BOSS_DIFFICULTY_FIRST_WIN_REWARDS.normal;
      const medalText = reward ? `该 BOSS ${reward.medalSuffix}` : "该 BOSS 勋章";
      const itemText = reward && Array.isArray(reward.items) ? reward.items.map((item) => `${item.label} x${item.count}`).join("、") : "";
      return `BOSS挑战（${option.label}）：Lv.100 单阶段，体力值固定为${fixedHp}，普通/特殊攻击造成的伤害减少${damageReductionPct}%，天赋值均为60，除体力外学习力均为102，在现有基础上所有能力值再提升${boostPct}%${moraleText}。击败后获得对应亚比蛋和 2000 H币；首次通过当前难度额外获得${medalText}${itemText ? `、${itemText}` : ""}。`;
    });
    const challengeLockMessage = (entry) => {
      if (!entry) return "该亚比暂不可挑战。";
      if (isWeeklyBossEntry(entry)) return "该亚比为当周BOSS，请从【当周BOSS】入口挑战。";
      if (isLegacyBossEntry(entry)) return "该亚比为绝版BOSS，不能通过挑战图鉴获取。";
      if (isBossEntry(entry)) return "该亚比为BOSS，请从【挑战之路】入口挑战。";
      if (isGuardianName(entry.name)) return "该亚比为守护者，请从【挑战之路】入口挑战。";
      if (isShopEggEntry(entry)) return "该亚比蛋仅可从【亚比商店】购买，不能通过图鉴挑战获取。";
      return "该亚比暂不可挑战。";
    };
    const canChallengeFromDex = (entry) => {
      if (!entry) return false;
      return !isWeeklyBossEntry(entry) && !isLegacyBossEntry(entry) && !isGuardianName(entry.name) && !isBossEntry(entry) && !isShopEggEntry(entry);
    };
    const canStartChallengeByDex = (entry) => {
      if (!entry) return false;
      if (!canChallengeFromDex(entry)) return false;
      const dexId = Number(entry.dexId) || 0;
      return dexId >= 1 && dexId <= MAX_OPEN_CHALLENGE_DEX_ID;
    };
    const isDexIdInOpenChallengeRange = (entry) => {
      const dexId = Number(entry && entry.dexId) || 0;
      return dexId >= 1 && dexId <= MAX_OPEN_CHALLENGE_DEX_ID;
    };
    const openChallengeRangeMessage = () => `当前仅开放编号1-${MAX_OPEN_CHALLENGE_DEX_ID}的亚比挑战。`;
    const selectedDexChallengeLocked = computed(() => !canStartChallengeByDex(selectedDexEntry.value));
    const activatedDexCount = computed(() => new Set(state.value.activatedDexIds).size);
    const dexTotal = computed(() => visibleDexEntries.length);

    const resolvePetCurrentDexId = (pet) => {
      if (!pet || typeof pet !== "object") return 0;
      const anchorDexId = Number((pet && pet.baseDexId) || (pet && pet.dexId)) || 0;
      if (!anchorDexId) return Number((pet && pet.dexId) || 0) || 0;
      const chain = getChainStageInfoByDexId(anchorDexId, pet && pet.speciesName);
      const idx = resolvePetStageIndex(pet, chain);
      const rootDexId = chain.rootDexId || anchorDexId;
      return resolveEvolutionDexIdByPetAndStage({ dexId: rootDexId, baseDexId: rootDexId, speciesName: pet && pet.speciesName }, idx);
    };
    const canUseQiankunXiuluoshenSkinOnPet = (pet) => {
      if (!pet) return false;
      const ids = [
        Number(pet.dexId) || 0,
        Number(pet.baseDexId) || 0,
        Number(resolvePetCurrentDexId(pet)) || 0,
        Number(resolveEvolutionDexIdByPetAndStage(pet, 0)) || 0
      ];
      return ids.some((id) => QIANKUN_XIULUOSHEN_SKIN_ALLOWED_DEX_IDS.has(id));
    };
    const petBattleVisualDexId = (pet) => {
      if (pet && normalize(pet.skinKey) === QIANKUN_XIULUOSHEN_SKIN_KEY && canUseQiankunXiuluoshenSkinOnPet(pet)) {
        return QIANKUN_XIULUOSHEN_SKIN_DEX_ID;
      }
      return Number(resolvePetCurrentDexId(pet)) || Number(pet && pet.dexId) || 0;
    };
    const applyPetSkinBattleAbilityBonus = (ability, pet) => {
      const base = {
        hp: Math.max(1, Math.floor(Number(ability && ability.hp) || 1)),
        atk: Math.max(1, Math.floor(Number(ability && ability.atk) || 1)),
        def: Math.max(1, Math.floor(Number(ability && ability.def) || 1)),
        spAtk: Math.max(1, Math.floor(Number(ability && ability.spAtk) || 1)),
        spDef: Math.max(1, Math.floor(Number(ability && ability.spDef) || 1)),
        speed: Math.max(1, Math.floor(Number(ability && ability.speed) || 1)),
        total: Math.max(1, Math.floor(Number(ability && ability.total) || 1))
      };
      if (!pet || normalize(pet.skinKey) !== QIANKUN_XIULUOSHEN_SKIN_KEY || !canUseQiankunXiuluoshenSkinOnPet(pet)) return base;
      base.hp = Math.max(1, Math.floor(Number(base.hp) || 1) + 200);
      ["atk", "def", "spAtk", "spDef"].forEach((key) => {
        base[key] = Math.max(1, Math.floor((Number(base[key]) || 1) * 1.1));
      });
      base.speed = Math.max(1, Math.floor(Number(base.speed) || 1) + 500);
      base.total = ["hp", "atk", "def", "spAtk", "spDef", "speed"].reduce((sum, key) => sum + (Number(base[key]) || 0), 0);
      return base;
    };
    const petCurrentForm = (pet) => {
      if (!pet || typeof pet !== "object") return { name: "", img: PLACEHOLDER };
      const anchorDexId = Number((pet && pet.baseDexId) || (pet && pet.dexId)) || 0;
      const chain = getChainStageInfoByDexId(anchorDexId, pet.speciesName);
      const rootDexId = chain.rootDexId || anchorDexId;
      const species = getSpeciesByDexId(rootDexId, pet.speciesName);
      if (!species) return { name: normalize(pet.speciesName), img: PLACEHOLDER };
      const idx = resolvePetStageIndex(pet, chain);
      // 优先按进化阶段映射到具体 dex 条目，确保 20/40 级形态与图鉴图片完全一致
      const evoDexId = resolveEvolutionDexIdByPetAndStage({ dexId: rootDexId, baseDexId: rootDexId, speciesName: pet.speciesName }, idx);
      const evoDex = dexById.get(Number(evoDexId) || 0) || null;
      if (evoDex) {
        return {
          name: normalize(evoDex.name) || normalize(pet.speciesName),
          img: ensureHttps(evoDex.image) || PLACEHOLDER
        };
      }
      return species.forms[idx] || species.forms[0] || { name: normalize(pet.speciesName), img: PLACEHOLDER };
    };
    const stripFormSuffix = (name) => normalize(name).replace(/·(初阶|进阶|终阶|第一形态|第二形态|第三形态)$/g, "");
    const petDisplayName = (pet) => stripFormSuffix(petCurrentForm(pet).name) || normalize(pet.speciesName);
    const dexFinalForm = (entry) => {
      if (!entry) return { name: "", img: PLACEHOLDER };
      const species = getSpeciesByDexId(entry.dexId, entry.name);
      if (!species || !Array.isArray(species.forms) || species.forms.length === 0) {
        return { name: entry.name, img: entry.image || PLACEHOLDER };
      }
      const f2 = species.forms[2] || species.forms[species.forms.length - 1] || species.forms[0];
      return {
        name: normalize(f2 && f2.name) || entry.name,
        img: ensureHttps(f2 && f2.img) || entry.image || PLACEHOLDER
      };
    };
    const getSpeciesForPet = (pet) => {
      if (!pet) return null;
      const currentDexId = resolvePetCurrentDexId(pet);
      const baseDexId = Number(pet.baseDexId) || 0;
      const namedDex = dexByName.get(normalize(pet.speciesName)) || null;
      return getSpeciesByDexId(currentDexId, pet.speciesName)
        || getSpeciesByDexId(pet.dexId, pet.speciesName)
        || getSpeciesByDexId(baseDexId, pet.speciesName)
        || (namedDex ? getSpeciesByDexId(namedDex.dexId, namedDex.name) : null)
        || null;
    };

    const selectedPetDetailVisual = computed(() => {
      const pet = selectedPet.value;
      if (!pet) return { name: "", img: PLACEHOLDER };
      if (detailPreviewPet.value && Number(detailPreviewPet.value.fixedDexId) > 0) {
        const fixedDexId = Number(detailPreviewPet.value.fixedDexId) || 0;
        const fixedDex = dexById.get(fixedDexId) || null;
        return {
          name: normalize(detailPreviewPet.value.fixedName) || normalize((fixedDex && fixedDex.name) || pet.speciesName),
          img: ensureHttps(detailPreviewPet.value.fixedImage) || ensureHttps(fixedDex && fixedDex.image) || PLACEHOLDER
        };
      }
      return petCurrentForm(pet);
    });
    const selectedPetSpecies = computed(() => {
      const pet = selectedPet.value;
      if (!pet) return null;
      try {
        if (detailPreviewPet.value && Number(detailPreviewPet.value.fixedDexId) > 0) {
          const fixedDexId = Number(detailPreviewPet.value.fixedDexId) || 0;
          return getSpeciesByDexId(fixedDexId, pet.speciesName) || null;
        }
        return getSpeciesForPet(pet);
      } catch {
        return null;
      }
    });
    const availableSkillsForSelectedPet = computed(() => {
      skillAttackTypeVersion.value;
      const pet = selectedPet.value;
      if (!pet) return [];
      const species = selectedPetSpecies.value;
      if (!species) return [];
      const list = Array.isArray(species.skills) ? species.skills : [];
      const extra = petExtraSkills(pet);
      if (detailPreviewPet.value && detailPreviewPet.value.previewAllSkills) return list.concat(extra);
      const skillLevel = skillLevelForPet(pet);
      return list.filter((s) => skillLevel === null || Number(s && s.level) <= Number(skillLevel)).concat(extra);
    });
    const syncSelectedSkillName = () => {
      const list = availableSkillsForSelectedPet.value;
      if (list.length === 0) {
        selectedSkillName.value = "";
        return;
      }
      const current = normalizeSkillKey(selectedSkillName.value);
      const hit = list.find((s) => normalizeSkillKey(s.name) === current);
      selectedSkillName.value = hit ? normalizeSkillKey(hit.name) : normalizeSkillKey(list[0].name);
    };
    watch(() => state.value.selectedPetId, () => {
      syncSelectedSkillName();
      selectedInfoTab.value = "skills";
    }, { immediate: true });
    watch(availableSkillsForSelectedPet, () => {
      syncSelectedSkillName();
    }, { deep: true });
    watch(selectedPet, (pet) => {
      if (pet && pet.hideStudyTalentTabs && (selectedInfoTab.value === "study" || selectedInfoTab.value === "talent")) {
        selectedInfoTab.value = "skills";
      }
    });
    watch(() => (battleScene.value && Array.isArray(battleScene.value.logs) ? battleScene.value.logs.length : 0), () => {
      scrollBattleLogToBottom();
    });

    const selectedSkillDetail = computed(() => {
      const list = availableSkillsForSelectedPet.value;
      if (list.length === 0) return null;
      const current = normalizeSkillKey(selectedSkillName.value);
      const hit = list.find((s) => normalizeSkillKey(s.name) === current);
      return hit || list[0] || null;
    });
    const selectedPetSkillByName = (skillName) => {
      skillAttackTypeVersion.value;
      const key = normalizeSkillKey(skillName);
      if (!key) return null;
      const species = selectedPetSpecies.value;
      const fullList = species && Array.isArray(species.skills) ? species.skills : [];
      const fullHit = fullList.concat(petExtraSkills(selectedPet.value)).find((s) => normalizeSkillKey(s && s.name) === key);
      if (fullHit) return fullHit;
      return availableSkillsForSelectedPet.value.find((s) => normalizeSkillKey(s && s.name) === key) || null;
    };
    const selectedPetEquippedSkills = computed(() => {
      skillAttackTypeVersion.value;
      const pet = selectedPet.value;
      if (detailPreviewPet.value && detailPreviewPet.value.previewAllSkills) {
        return availableSkillsForSelectedPet.value.map((s) => normalizeSkillKey(s && s.name)).filter(Boolean);
      }
      const arr = pet && Array.isArray(pet.equippedSkills) ? pet.equippedSkills : [];
      const skillLevel = skillLevelForPet(pet);
      return currentEquippedSkillNamesBySpecies(selectedPetSpecies.value, arr, skillLevel, petExtraSkills(pet)).slice(0, 4);
    });
    const selectedRaceStats = computed(() => {
      const pet = selectedPet.value;
      const species = selectedPetSpecies.value;
      if (!pet || !species || !species.raceStats) return null;
      return species.raceStats;
    });
    const abilityBarMax = (key, context = "") => {
      const statKey = String(key || "");
      const ctx = String(context || "");
      if ((ctx === "guardian" || ctx === "boss") && statKey === "hp") return 0;
      return 2000;
    };
    const selectedAbilityStats = computed(() => {
      const pet = selectedPet.value;
      const race = selectedRaceStats.value;
      if (!pet || !race) return null;
      const talent = normalizeTalent(pet.talent);
      const study = normalizeStudy(pet.study);
      const out = {
        hp: calcAbilityHp(race.hp, talent.hp, study.hp, pet.level),
        atk: calcAbilityStat(race.atk, talent.atk, study.atk, pet.level, 1),
        def: calcAbilityStat(race.def, talent.def, study.def, pet.level, 1),
        spAtk: calcAbilityStat(race.spAtk, talent.spAtk, study.spAtk, pet.level, 1),
        spDef: calcAbilityStat(race.spDef, talent.spDef, study.spDef, pet.level, 1),
        speed: calcAbilityStat(race.speed, talent.speed, study.speed, pet.level, 1)
      };
      out.total = out.hp + out.atk + out.def + out.spAtk + out.spDef + out.speed;
      return out;
    });
    const guardianBossAbilityBarMax = (value, statKey, sceneMode) => {
      if ((sceneMode === "guardian" || sceneMode === "boss") && statKey === "hp") return Math.max(1, Math.floor(Number(value) || 0));
      return 2000;
    };
    const calcAbilityTotal = (stats) => {
      const s = stats && typeof stats === "object" ? stats : {};
      return STAT_KEYS.reduce((sum, key) => sum + (Math.max(0, Number(s[key]) || 0)), 0);
    };
    const calcBattlePowerFromAbilityTotal = (total) => Math.floor(Math.max(0, Number(total) || 0) * 3.6);
    const calcPetBattlePower = (pet) => {
      if (!pet) return 0;
      const species = getSpeciesByDexId(resolvePetCurrentDexId(pet), pet.speciesName) || getSpeciesByDexId(pet.dexId, pet.speciesName);
      const race = species && species.raceStats;
      if (!race) return 0;
      return calcBattlePowerFromAbilityTotal(calcAbilityTotal(calcPetAbilityByRace(race, pet.level, pet.talent, pet.study)));
    };
    const selectedPetBattlePower = computed(() => {
      const ability = selectedAbilityStats.value;
      return calcBattlePowerFromAbilityTotal(ability ? ability.total : calcPetBattlePower(selectedPet.value));
    });
    const bagBattlePower = computed(() => bagPets.value.reduce((sum, pet) => sum + calcPetBattlePower(pet), 0));
    const currentMaxBagBattlePower = computed(() => {
      const list = safeActivePets.value.map((pet) => calcPetBattlePower(pet)).sort((a, b) => b - a);
      return list.slice(0, 6).reduce((sum, value) => sum + value, 0);
    });
    const maxBagBattlePower = computed(() => Math.max(
      Math.floor(Number(state.value.maxBagBattlePower) || 0),
      Math.floor(Number(currentMaxBagBattlePower.value) || 0)
    ));
    const calcPetAbilityByRace = (raceStats, level, talentRaw, studyRaw) => {
      const race = raceStats && typeof raceStats === "object" ? raceStats : createZeroStats();
      const talent = normalizeTalent(talentRaw);
      const study = normalizeStudy(studyRaw);
      return {
        hp: calcAbilityHp(race.hp, talent.hp, study.hp, level),
        atk: calcAbilityStat(race.atk, talent.atk, study.atk, level, 1),
        def: calcAbilityStat(race.def, talent.def, study.def, level, 1),
        spAtk: calcAbilityStat(race.spAtk, talent.spAtk, study.spAtk, level, 1),
        spDef: calcAbilityStat(race.spDef, talent.spDef, study.spDef, level, 1),
        speed: calcAbilityStat(race.speed, talent.speed, study.speed, level, 1)
      };
    };
    const selectedPetTalent = computed(() => {
      const pet = selectedPet.value;
      if (!pet) return createZeroStats();
      return normalizeTalent(pet.talent);
    });
    const selectedPetTalentTotal = computed(() => talentTotal(selectedPetTalent.value));
    const selectedPetTalentGrade = computed(() => talentGradeByTotal(selectedPetTalentTotal.value));
    const selectedPetTalentImageSrc = computed(() => talentGradeImageSrc(selectedPetTalentGrade.value));
    const selectedPetStudy = computed(() => {
      const pet = selectedPet.value;
      if (!pet) return createZeroStats();
      return normalizeStudy(pet.study);
    });
    const selectedStudyTotal = computed(() => {
      const study = selectedPetStudy.value;
      return study.hp + study.atk + study.def + study.spAtk + study.spDef + study.speed;
    });
    const setInfoTab = (tab) => {
      const hit = String(tab || "");
      const ALLOWED = ["skills", "ability", "talent", "study", "race", "items", "traits"];
      const hiddenStudyTalent = Boolean(selectedPet.value && selectedPet.value.hideStudyTalentTabs);
      selectedInfoTab.value = ALLOWED.includes(hit) && !(hiddenStudyTalent && (hit === "study" || hit === "talent")) ? hit : "skills";
    };
    const setTalentValue = (key, value) => {
      const pet = selectedPet.value;
      if (!pet || !STAT_KEYS.includes(key)) return;
      if (!pet.talent || typeof pet.talent !== "object") pet.talent = createZeroStats();
      const n = clamp(safeNonNegInt(value), 0, 62);
      pet.talent[key] = n;
      pet.talent = normalizeTalent(pet.talent);
    };
    const setStudyValue = (key, value) => {
      const pet = selectedPet.value;
      if (!pet || !STAT_KEYS.includes(key)) return;
      if (!pet.study || typeof pet.study !== "object") pet.study = createZeroStats();
      const current = normalizeStudy(pet.study, key);
      const oldValue = clamp(Number(current[key]) || 0, 0, 255);
      const total = STAT_KEYS.reduce((sum, k) => sum + (Number(current[k]) || 0), 0);
      const maxForKey = Math.min(255, oldValue + Math.max(0, 510 - total));
      current[key] = clamp(safeNonNegInt(value), 0, maxForKey);
      pet.study = normalizeStudy(current, key);
    };

    const autoFillSkills = (pet) => {
      const species = getSpeciesForPet(pet);
      if (!species) return;
      const skillLevel = skillLevelForPet(pet);
      const merged = currentEquippedSkillNamesBySpecies(species, pet.equippedSkills, skillLevel, petExtraSkills(pet));
      pet.equippedSkills = merged.length > 0
        ? merged
        : fallbackEquippedSkillNamesBySpecies(species, skillLevel).slice(0, 4);
    };

    const grantExp = (pet, amount) => {
      const beforeForm = petCurrentForm(pet);
      const beforeLevel = pet.level;
      const beforeExp = pet.exp;
      const crossed = [];
      pet.exp += amount;
      pet.totalExp += amount;
      const chainAnchorDexId = Number((pet && pet.baseDexId) || (pet && pet.dexId)) || 0;
      const chain = getChainStageInfoByDexId(chainAnchorDexId || pet.dexId, pet.speciesName);
      while (pet.level < 100 && pet.exp >= expRequired(pet.level)) {
        const oldLevel = pet.level;
        pet.exp -= expRequired(pet.level);
        pet.level += 1;
        pet.skillUnlockLevel = clamp(Math.max(Number(pet.skillUnlockLevel) || 1, pet.level), 1, 100);
        const prevStage = stageIndexByLevelAndCount(oldLevel, chain.formCount, chain.evoLevels);
        const nextStage = stageIndexByLevelAndCount(pet.level, chain.formCount, chain.evoLevels);
        if (nextStage > prevStage) {
          addEvolutionFx(pet.id);
          const crossedLv = Array.isArray(chain.evoLevels) ? Number(chain.evoLevels[nextStage]) : null;
          if (Number.isFinite(crossedLv) && crossedLv > 0) crossed.push(crossedLv);
          else if (chain.formCount === 2) crossed.push(40);
          else if (nextStage === 1) crossed.push(20);
          else crossed.push(40);
        }
        syncPetEvolutionForm(pet);
      }
      syncPetEvolutionForm(pet);
      autoFillSkills(pet);
      const afterForm = petCurrentForm(pet);
      return {
        petId: pet.id,
        name: petDisplayName(pet),
        element: normalize(pet.element) || "未知系",
        subElement: normalize(pet.subElement),
        image: ensureHttps(afterForm && afterForm.img) || PLACEHOLDER,
        beforeImage: ensureHttps(beforeForm && beforeForm.img) || PLACEHOLDER,
        beforeName: normalize(beforeForm && beforeForm.name) || pet.speciesName,
        afterImage: ensureHttps(afterForm && afterForm.img) || PLACEHOLDER,
        afterName: normalize(afterForm && afterForm.name) || pet.speciesName,
        gainedExp: amount,
        beforeLevel,
        afterLevel: pet.level,
        beforeExp,
        afterExp: pet.exp,
        evolved: crossed.length > 0,
        crossedStages: crossed
      };
    };

    const getSkillPower = (pet) => {
      const species = getSpeciesForPet(pet);
      if (!species) return 120;
      const picked = pet.equippedSkills
        .map((name) => species.skills.find((s) => normalizeSkillKey(s && s.name) === normalizeSkillKey(name)))
        .filter(Boolean);
      if (picked.length === 0) return 120;
      const sum = picked.reduce((acc, s) => acc + (s.power > 0 ? s.power : 110), 0);
      return sum / picked.length;
    };

    const buildElementAttackGroupsAgainst = (entry) => {
      const defenderElements = getElementList(entry && entry.element, entry && entry.subElement);
      const rows = ELEMENT_NAMES
        .map((element) => normalizeElementName(element))
        .filter((element) => element && element !== "未知系")
        .map((element) => ({ element, factor: getElementFactorAgainstElements(element, defenderElements) }));
      return {
        strong: rows.filter((row) => row.factor >= 2).map((row) => row.element),
        weak: rows.filter((row) => row.factor > 0 && row.factor <= 0.5).map((row) => row.element),
        immune: rows.filter((row) => row.factor <= 0).map((row) => row.element)
      };
    };

    const predictedWinExp = computed(() => {
      const target = selectedDexEntry.value;
      if (!target) return 0;
      const n = Number(state.value.targetLevel);
      const level = Number.isFinite(n) ? n : selectedChallengeDefaultLevel.value;
      return calcWinExp(level);
    });
    const predictedLoseExp = computed(() => {
      const n = Number(state.value.targetLevel);
      const level = Number.isFinite(n) ? n : selectedChallengeDefaultLevel.value;
      return calcLoseExp(level);
    });
    const predictedElementFactor = computed(() => {
      const attacker = firstPet.value;
      const target = selectedDexEntry.value;
      if (!attacker || !target) return 1;
      return getElementFactorAgainstElements(attacker.element, getElementList(target.element, target.subElement));
    });
    const predictedElementText = computed(() => {
      const attacker = firstPet.value;
      const target = selectedDexEntry.value;
      if (!attacker || !target) return "请先设置首宠（背包1号位）并选择挑战目标。";
      return compareElementDesc(attacker.element, target.element, predictedElementFactor.value);
    });
    const selectedDexElementGroups = computed(() => buildElementAttackGroupsAgainst(selectedDexEntry.value));
    const selectedGuardianElementGroups = computed(() => buildElementAttackGroupsAgainst(selectedGuardianEntry.value));
    const selectedBossElementGroups = computed(() => buildElementAttackGroupsAgainst(selectedBossEntry.value));
    const weeklyBossElementGroups = computed(() => buildElementAttackGroupsAgainst(weeklyBossEntry.value));

    const petElementIconStyle = (element, size = 18) => {
      const icon = PET_TYPE_ICON[normalizeElementName(element)] || "";
      const safeSize = Math.max(12, Number(size) || 18);
      if (!icon) return { width: `${safeSize}px`, height: `${safeSize}px`, display: "none" };
      return {
        width: `${safeSize}px`,
        height: `${safeSize}px`,
        backgroundImage: `url(${icon})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "contain",
        backgroundPosition: "center"
      };
    };
    const petElementIconSrc = (element) => PET_TYPE_ICON[normalizeElementName(element)] || "";
    const petElementTransparentIconStyle = (element, size = 18) => {
      const icon = PET_TYPE_TRANSPARENT_ICON[normalizeElementName(element)] || "";
      const safeSize = Math.max(12, Number(size) || 18);
      if (!icon) return { width: `${safeSize}px`, height: `${safeSize}px`, display: "none" };
      return {
        width: `${safeSize}px`,
        height: `${safeSize}px`,
        backgroundImage: `url(${icon})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "contain",
        backgroundPosition: "center",
        backgroundColor: "transparent"
      };
    };
    const petElementList = (obj) => {
      const main = normalizeElementName(obj && obj.element) || "";
      const sub = normalizeElementName(obj && obj.subElement) || "";
      if (!main && !sub) return [];
      if (!sub || sub === main) return main ? [main] : [];
      return main ? [main, sub] : [sub];
    };

    const skillTypeMeta = (typeText) => {
      const raw = normalize(typeText);
      const first = normalize(raw.split("/")[0] || "");
      let element = first;
      if (element && !element.endsWith("系")) element = `${element}系`;
      if (!element) element = "未知系";
      if (element === "普通系") return { label: element, icon: PET_TYPE_ICON["普通系"] || "" };
      return { label: element, icon: PET_TYPE_ICON[element] || "" };
    };
    const battleSceneSkills = computed(() => {
      const scene = battleScene.value;
      return scene && Array.isArray(scene.skills) ? scene.skills : [];
    });
    const battleSkillElementRelationIcon = (skill, sceneArg = null) => {
      const scene = sceneArg || battleScene.value;
      if (!scene || !skill) return "";
      const factor = getBattleElementFactorSnapshot(scene, getSkillBattleElement(skill), "target");
      if (factor >= 2) return "./fight-ui/sprites/DefineSprite_346/1.png";
      if (factor > 0 && factor <= 0.5) return "./fight-ui/sprites/DefineSprite_344/1.png";
      return "";
    };
    const battleSceneSkillRows = computed(() => {
      const scene = battleScene.value;
      const skills = scene && Array.isArray(scene.skills) ? scene.skills : [];
      return [0, 1, 2, 3].map((slot) => {
        const skill = skills[slot] || null;
        if (!skill) {
          return {
            slot,
            empty: true,
            key: `battle_skill_slot_${slot}_empty`,
            name: "",
            title: "",
            disabled: true,
            rowClass: "border-slate-500/40 bg-slate-700/30 text-slate-400 cursor-not-allowed",
            relationIcon: "",
            elementLabel: "普通系",
            power: 0,
            pp: 0,
            ppMax: 0
          };
        }
        const name = safeSkillName(skill);
        const typeMeta = skillTypeMeta(safeSkillType(skill));
        const disabled = !scene || !scene.open || scene.ended || scene.isActing || scene.pendingFinish || safeSkillPP(skill) <= 0 || hasUsedOncePerBattleSkill(scene, "attacker", skill);
        return {
          slot,
          empty: false,
          skill,
          key: `battle_skill_slot_${slot}_${name || "skill"}`,
          name,
          title: skillBattleDesc(skill),
          disabled,
          rowClass: "border-cyan-300/35 bg-cyan-500/15 text-cyan-100 disabled:opacity-40",
          relationIcon: battleSkillElementRelationIcon(skill, scene),
          elementLabel: typeMeta.label,
          power: safeSkillPower(skill),
          pp: safeSkillPP(skill),
          ppMax: safeSkillPPMax(skill)
        };
      });
    });
    const battleVisualReady = computed(() => Boolean(battleScene.value && battleScene.value.visualReady));
    const battleAttackerStatusBadges = computed(() => {
      const scene = battleScene.value;
      if (!scene) return [];
      return buildStatusBadges(normalizeBattleState(scene.attackerState));
    });
    const battleTargetStatusBadges = computed(() => {
      const scene = battleScene.value;
      if (!scene) return [];
      return buildStatusBadges(normalizeBattleState(scene.targetState));
    });
    const battleAttackerTimedEffects = computed(() => {
      const scene = battleScene.value;
      if (!scene) return [];
      return buildTimedEffectBadges(scene, "attacker");
    });
    const battleTargetTimedEffects = computed(() => {
      const scene = battleScene.value;
      if (!scene) return [];
      return buildTimedEffectBadges(scene, "target");
    });
    const battleAttackerStageText = computed(() => {
      const scene = battleScene.value;
      if (!scene) return [];
      return battleStageBadges(normalizeBattleState(scene.attackerState));
    });
    const battleTargetStageText = computed(() => {
      const scene = battleScene.value;
      if (!scene) return [];
      return battleStageBadges(normalizeBattleState(scene.targetState));
    });
    const battleSceneTargetSkills = computed(() => {
      const scene = battleScene.value;
      return scene && Array.isArray(scene.targetSkills) ? scene.targetSkills : [];
    });
    const battleAbilityNow = (side, key) => {
      const scene = battleScene.value;
      if (!scene) return 0;
      const safeSide = side === "attacker" ? "attacker" : "target";
      return getBattleAbilityStat(scene, safeSide, key);
    };
    const battleSceneAvailablePets = computed(() => {
      const scene = battleScene.value;
      if (!scene || !Array.isArray(scene.team)) return [];
      return scene.team.filter((u) => u && u.id && u.hp > 0 && u.id !== scene.currentAttackerId);
    });
    const battleSceneCurrentUnit = computed(() => {
      const scene = battleScene.value;
      if (!scene || !Array.isArray(scene.team)) return null;
      return scene.team.find((u) => u.id === scene.currentAttackerId) || null;
    });
    const battleSceneLogRef = ref(null);
    const scrollBattleLogToBottom = () => {
      nextTick(() => {
        const el = battleSceneLogRef.value;
        if (!el) return;
        el.scrollTop = el.scrollHeight;
      });
    };
    const SKILL_EFFECT_ROOT = "./skill-effect";
    const FULLSCREEN_SKILL_EFFECT_ROOT = "./skill-effect-fullscreen";
    const FULLSCREEN_SKILL_EFFECT_NAMES = new Set([
      "飓风雷电",
      "万物皆明",
      "真战无落日",
      "月影无踪",
      "真舞八重击",
      "真血印",
      "真神武噬月",
      "龙之煌炎",
      "龙皇制裁",
      "无限冰龙魂",
      "狂龙重拳",
      "龙流破碎",
      "傲月之轮",
      "真芒无双",
      "十方雷动",
      "极玄绝灭",
      "霜刃",
      "瞬杀风暴",
      "武阳升龙",
      "逢尘化雪",
      "神圣放逐",
      "六道轮回",
      "万劫灰烬",
      "英雄王之剑",
      "天冕灭",
      "究极血印",
      "修罗战神诀",
      "黯天龙魂噬",
      "炽阳之锋",
      "审判之月",
      "赤霄红莲",
      "枯萎",
      "源灵噬",
      "凤舞八方",
      "究极噬灵击",
      "乾坤之怒",
      "极灵碎无双",
      "王命",
      "天辰破",
      "霜灵破",
      "地狱炽焰",
      "六龙审判",
      "灼日斩魄",
      "亘古升龙",
      "绝迹寒冬",
      "万世脉轮",
      "辉冰剑",
      "元魂斩杀"
    ]);
    const FULLSCREEN_SKILL_EFFECT_ID_BY_NAME = {
      飓风雷电: 16314,
      飓风雷電: 16314,
      万物皆明: 16234,
      月影无踪: 16235,
      真战无落日: 16310,
      真舞八重击: 3321,
      真血印: 17294,
      真神武噬月: 16311,
      龙之煌炎: 20067,
      龙皇制裁: 20070,
      无限冰龙魂: 20081,
      狂龙重拳: 20083,
      龙流破碎: 20074,
      傲月之轮: 16330,
      真芒无双: 16324,
      十方雷动: 16350,
      极玄绝灭: 11347,
      霜刃: 15337,
      瞬杀风暴: 16358,
      武阳升龙: 20102,
      逢尘化雪: 16366,
      神圣放逐: 21086,
      六道轮回: 19168,
      万劫灰烬: 17336,
      英雄王之剑: 23064,
      天冕灭: 19149,
      究极血印: 17322,
      修罗战神诀: 19156,
      黯天龙魂噬: 17328,
      炽阳之锋: 23050,
      审判之月: 16353,
      赤霄红莲: 19216,
      枯萎: 23072,
      源灵噬: 21087,
      凤舞八方: 10384,
      究极噬灵击: 16342,
      乾坤之怒: 16384,
      极灵碎无双: 21073,
      王命: 23080,
      天辰破: 20115,
      霜灵破: 15360,
      地狱炽焰: 23061,
      六龙审判: 20093,
      灼日斩魄: 16393,
      亘古升龙: 16405,
      绝迹寒冬: 16397,
      万世脉轮: 16401,
      辉冰剑: 15349,
      元魂斩杀: 33003
    };
    const FULLSCREEN_SKILL_EFFECT_IDS = new Set(Object.values(FULLSCREEN_SKILL_EFFECT_ID_BY_NAME).map((id) => Number(id)).filter((id) => id > 0));
    const PET_ACTION_LAYOUT_URL = "./pet-action-layout.json";
    const BATTLE_DAMAGE_VISUAL_DELAY_MS = 900;
    const BATTLE_SKILL_EFFECT_DURATION_MS = 900;
    const BATTLE_SKILL_EFFECT_SETTLE_MS = 200;
    const BATTLE_FLOAT_TEXT_DURATION_MS = BATTLE_FLOAT_TEXT_DURATION_MS_GLOBAL;
    const BATTLE_COUNTER_ATTACK_DELAY_MS = 3600;
    const BATTLE_DEFEAT_RESOLUTION_DELAY_MS = 2600;
    const BATTLE_DEFEAT_EXIT_START_DELAY_MS = 2400;
    const BATTLE_DEFEAT_EXIT_DURATION_MS = 1200;
    const PET_ANIM_FALLBACK_IDLE_DELAY_MS = 1200;
    const PET_ANIM_LOOP_GUARD_MS = 120;
    const PET_ANIM_FRAME_HINT_MS = 80;
    const BATTLE_DAMAGE_FLOAT_SETTLE_MS = 260;
    const webpDurationCache = new Map();
    const gifDurationCache = new Map();
    const skillEffectObjectUrlCache = new Map();
    const skillEffectCoreBoundsCache = new Map();
    const petActionLayout = ref({});
    const loadPetActionLayout = async () => {
      try {
        let data = null;
        const url = `${PET_ACTION_LAYOUT_URL}?v=20260615_qiankun_4036_layout`;
        if (isAndroidWebView) {
          data = JSON.parse(await loadLocalAssetText(url));
        } else {
          const res = await fetch(url);
          if (!res.ok) return;
          data = await res.json();
        }
        petActionLayout.value = data && typeof data === "object" ? data : {};
      } catch (_) {
        petActionLayout.value = {};
      }
    };
    const getAnimatedWebpDurationMs = async (src) => {
      const key = String(src || "");
      if (!key) return PET_ANIM_FALLBACK_IDLE_DELAY_MS;
      if (webpDurationCache.has(key)) return webpDurationCache.get(key);
      if (/\.png(?:\?|$)/i.test(key)) {
        webpDurationCache.set(key, PET_ANIM_FALLBACK_IDLE_DELAY_MS);
        return PET_ANIM_FALLBACK_IDLE_DELAY_MS;
      }
      if (/\.svg(?:\?|$)/i.test(key)) {
        try {
          const text = isAndroidWebView ? await loadLocalAssetText(key) : await fetch(key).then((res) => res.text());
          const durationMatch = String(text || "").match(/animation-duration\s*:\s*([\d.]+)\s*ms/i);
          const descMatch = String(text || "").match(/;\s*(\d+)\s+frames;\s*([\d.]+)\s*ms\s+per\s+frame/i);
          const duration = durationMatch
            ? Math.max(PET_ANIM_FALLBACK_IDLE_DELAY_MS, Math.round(Number(durationMatch[1]) || 0))
            : (descMatch ? Math.max(PET_ANIM_FALLBACK_IDLE_DELAY_MS, Math.round((Number(descMatch[1]) || 0) * (Number(descMatch[2]) || 0))) : PET_ANIM_FALLBACK_IDLE_DELAY_MS);
          webpDurationCache.set(key, duration);
          return duration;
        } catch {
          return PET_ANIM_FALLBACK_IDLE_DELAY_MS;
        }
      }
      if (isAndroidWebView) return PET_ANIM_FALLBACK_IDLE_DELAY_MS;
      try {
        const res = await fetch(key);
        const buf = await res.arrayBuffer();
        const bytes = new Uint8Array(buf);
        let total = 0;
        for (let i = 12; i + 20 <= bytes.length;) {
          const four = String.fromCharCode(bytes[i], bytes[i + 1], bytes[i + 2], bytes[i + 3]);
          const size = bytes[i + 4] | (bytes[i + 5] << 8) | (bytes[i + 6] << 16) | (bytes[i + 7] << 24);
          const data = i + 8;
          if (four === "ANMF" && data + 16 <= bytes.length) {
            total += bytes[data + 12] | (bytes[data + 13] << 8) | (bytes[data + 14] << 16);
          }
          i = data + size + (size % 2);
        }
        const duration = total > 0 ? total : PET_ANIM_FALLBACK_IDLE_DELAY_MS;
        webpDurationCache.set(key, duration);
        return duration;
      } catch {
        return PET_ANIM_FALLBACK_IDLE_DELAY_MS;
      }
    };
    const buildSingleLoopGifObjectUrl = (key, bytes) => {
      if (typeof Blob === "undefined" || typeof URL === "undefined" || !URL.createObjectURL) return key;
      if (skillEffectObjectUrlCache.has(key)) return skillEffectObjectUrlCache.get(key);
      const patched = new Uint8Array(bytes);
      const marker = "NETSCAPE2.0";
      for (let i = 0; i + marker.length + 5 < patched.length; i += 1) {
        let matched = true;
        for (let j = 0; j < marker.length; j += 1) {
          if (patched[i + j] !== marker.charCodeAt(j)) {
            matched = false;
            break;
          }
        }
        if (!matched) continue;
        const block = i + marker.length;
        if (patched[block] === 0x03 && patched[block + 1] === 0x01) {
          patched[block + 2] = 0x01;
          patched[block + 3] = 0x00;
          const objectUrl = URL.createObjectURL(new Blob([patched], { type: "image/gif" }));
          skillEffectObjectUrlCache.set(key, objectUrl);
          return objectUrl;
        }
      }
      skillEffectObjectUrlCache.set(key, key);
      return key;
    };
    const getAnimatedGifTiming = async (src) => {
      const key = String(src || "").split("?")[0];
      if (!key) return { durationMs: BATTLE_SKILL_EFFECT_DURATION_MS, removeMs: BATTLE_SKILL_EFFECT_DURATION_MS, src };
      if (gifDurationCache.has(key)) return gifDurationCache.get(key);
      if (isAndroidWebView) {
        const timing = {
          durationMs: BATTLE_SKILL_EFFECT_DURATION_MS,
          removeMs: BATTLE_SKILL_EFFECT_DURATION_MS + BATTLE_SKILL_EFFECT_SETTLE_MS,
          src
        };
        gifDurationCache.set(key, timing);
        return timing;
      }
      try {
        const res = await fetch(key);
        const buf = await res.arrayBuffer();
        const bytes = new Uint8Array(buf);
        let total = 0;
        let frames = 0;
        let lastDelay = 0;
        for (let i = 0; i + 7 < bytes.length; i += 1) {
          if (bytes[i] === 0x21 && bytes[i + 1] === 0xf9 && bytes[i + 2] === 0x04) {
            const delay = bytes[i + 4] | (bytes[i + 5] << 8);
            lastDelay = Math.max(2, delay) * 10;
            total += lastDelay;
            frames += 1;
          }
        }
        const durationMs = Math.max(BATTLE_SKILL_EFFECT_DURATION_MS, total || frames * 100 || BATTLE_SKILL_EFFECT_DURATION_MS);
        const singleLoopSrc = buildSingleLoopGifObjectUrl(key, bytes);
        const timing = {
          durationMs,
          removeMs: durationMs + BATTLE_SKILL_EFFECT_SETTLE_MS,
          src: singleLoopSrc
        };
        gifDurationCache.set(key, timing);
        return timing;
      } catch {
        const timing = {
          durationMs: BATTLE_SKILL_EFFECT_DURATION_MS,
          removeMs: BATTLE_SKILL_EFFECT_DURATION_MS + BATTLE_SKILL_EFFECT_SETTLE_MS,
          src
        };
        gifDurationCache.set(key, timing);
        return timing;
      }
    };
    const petAnimPlayMs = (duration) => Math.max(120, (Number(duration) || PET_ANIM_FALLBACK_IDLE_DELAY_MS) - PET_ANIM_LOOP_GUARD_MS);
    const petAnimActionSrc = (src, actionSeq = 0, stateKey = "") => {
      const key = normalize(src);
      if (!key) return "";
      if (stateKey === "idle" || !actionSeq) return key;
      const sep = key.includes("?") ? "&" : "?";
      return `${key}${sep}act=${encodeURIComponent(actionSeq)}`;
    };
    const getBattleActionVisualDurationMs = (scene, actionSrc, effectSrc = "") => {
      const effectMs = () => effectSrc
        ? getAnimatedGifTiming(effectSrc)
          .then((effectTiming) => Math.max(
            BATTLE_SKILL_EFFECT_DURATION_MS,
            Number(effectTiming && effectTiming.removeMs) || Number(effectTiming && effectTiming.durationMs) || BATTLE_SKILL_EFFECT_DURATION_MS
          ))
          .catch(() => BATTLE_SKILL_EFFECT_DURATION_MS)
        : Promise.resolve(0);
      if (!actionSrc) return effectMs().then((ms) => ms || BATTLE_DAMAGE_VISUAL_DELAY_MS);
      return getAnimatedWebpDurationMs(actionSrc)
        .then((duration) => {
          const actionMs = petAnimPlayMs(duration);
          if (!effectSrc) return actionMs;
          return effectMs().then((ms) => actionMs + ms);
        })
        .catch(() => BATTLE_DAMAGE_VISUAL_DELAY_MS);
    };
    const PET_ANIM_DEBUG = false;
    const BATTLE_PREPARE_TRACE = true;
    const BATTLE_IDLE_USES_ACTION_SVG = true;
    const BATTLE_STATIC_PET_RENDER_STYLE = Object.freeze({
      "--battle-pet-render-width": "auto",
      "--battle-pet-render-height": "var(--battle-pet-size, clamp(14vw, 25.2vmin, 26.6vw))",
      "--battle-pet-offset-x": "0px",
      "--battle-pet-offset-y": "0px",
      "--battle-pet-clip-top": "0%",
      "--battle-pet-clip-right": "0%",
      "--battle-pet-clip-bottom": "0%",
      "--battle-pet-clip-left": "0%"
    });
    const petAnimDebugLog = (msg, extra) => {
      if (!PET_ANIM_DEBUG || typeof console === "undefined" || !console.log) return;
      try {
        if (extra !== undefined) console.log("[PET_ANIM]", msg, extra);
        else console.log("[PET_ANIM]", msg);
      } catch (_) {}
    };
    const battlePrepareTrace = (stage, data) => {
      if (!BATTLE_PREPARE_TRACE || typeof console === "undefined" || !console.log) return;
      try {
        const payload = data && typeof data === "object" ? JSON.stringify(data) : (data || "");
        console.log("[BATTLE_PREP]", stage, payload);
      } catch (_) {
        console.log("[BATTLE_PREP]", stage);
      }
    };
    const getPetBattleStateCodeByKey = petBattleStateCodeByKey;
    const getPetBattleAnimPath = (dexId, side, stateKey) => {
      const id = Number(dexId) || 0;
      if (id <= 0) return "";
      return petBattleSvgImage(id, side, stateKey);
    };
    const estimatePetBattleAnimDurationMs = (dexId, side, stateKey) => {
      const id = String(Number(dexId) || 0);
      const sideCode = side === "target" ? "1" : "2";
      const stateCode = getPetBattleStateCodeByKey(stateKey);
      const sideMeta = petActionLayout.value && petActionLayout.value[id] && petActionLayout.value[id][sideCode];
      const action = sideMeta && sideMeta.actions && (sideMeta.actions[stateCode] || sideMeta.actions["1"]);
      const frames = Math.max(0, Math.floor(Number(action && action.frames) || 0));
      return frames > 0 ? Math.max(PET_ANIM_FALLBACK_IDLE_DELAY_MS, frames * PET_ANIM_FRAME_HINT_MS) : PET_ANIM_FALLBACK_IDLE_DELAY_MS;
    };
    const stripUrlQuery = (src) => normalize(src).split("?")[0] || normalize(src);
    const getSkillEffectCoreBounds = (src) => {
      const key = stripUrlQuery(src);
      if (!key) return Promise.resolve(null);
      if (skillEffectCoreBoundsCache.has(key)) return skillEffectCoreBoundsCache.get(key);
      if (typeof document === "undefined" || typeof Image === "undefined") return Promise.resolve(null);
      const promise = new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          try {
            const w = Math.max(1, Number(img.naturalWidth) || Number(img.width) || 1);
            const h = Math.max(1, Number(img.naturalHeight) || Number(img.height) || 1);
            const canvas = document.createElement("canvas");
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext("2d", { willReadFrequently: true });
            if (!ctx) return resolve(null);
            ctx.drawImage(img, 0, 0, w, h);
            const data = ctx.getImageData(0, 0, w, h).data;
            let minX = w;
            let minY = h;
            let maxX = -1;
            let maxY = -1;
            for (let y = 0; y < h; y += 1) {
              for (let x = 0; x < w; x += 1) {
                const i = (y * w + x) * 4;
                const alpha = data[i + 3];
                if (alpha <= 8) continue;
                const bright = Math.max(data[i], data[i + 1], data[i + 2]);
                if (bright <= 6) continue;
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
              }
            }
            if (maxX < minX || maxY < minY) return resolve(null);
            resolve({ w, h, x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 });
          } catch (err) {
            resolve(null);
          }
        };
        img.onerror = () => resolve(null);
        img.src = key;
      });
      skillEffectCoreBoundsCache.set(key, promise);
      return promise;
    };
    const getPetBattleStateCode = (scene, side) => {
      const safeSide = side === "target" ? "target" : "attacker";
      const src = normalize(safeSide === "target" ? (scene && scene.targetImage) : (scene && scene.attackerImage));
      const match = src.match(/_(\d+)\.(?:svg|png)(?:\?|$)/);
      return match ? match[1] : "1";
    };
    const getPetAnimLayoutStyle = (dexId, sideCode = "1", stateCode = "1", targetBodyH = 120, alignMode = "bottom") => {
      const sideMeta = petActionLayout.value && petActionLayout.value[String(dexId)] && petActionLayout.value[String(dexId)][sideCode];
      const idle = sideMeta && sideMeta.idle;
      const action = sideMeta && sideMeta.actions && (sideMeta.actions[stateCode] || sideMeta.actions["1"]);
      const idleBox = idle && (Array.isArray(idle.bodyBbox) ? idle.bodyBbox : (Array.isArray(idle.bbox) ? idle.bbox : null));
      const actionBox = action && (Array.isArray(action.bodyBbox) ? action.bodyBbox : (Array.isArray(action.bbox) ? action.bbox : null));
      if (!idle || !action || !idleBox || !actionBox) return {};
      const idleH = Math.max(1, idleBox[3] - idleBox[1]);
      const safeTargetBodyH = Math.max(1, Number(targetBodyH) || 120);
      const scale = safeTargetBodyH / idleH;
      const renderW = `${Math.max(1, Math.round((Number(action.w) || 1) * scale))}px`;
      const renderH = `${Math.max(1, Math.round((Number(action.h) || 1) * scale))}px`;
      const idleCenterX = (idleBox[0] + idleBox[2]) / 2;
      const actionCenterX = (actionBox[0] + actionBox[2]) / 2;
      const idleBottom = idleBox[3];
      const actionBottom = actionBox[3];
      const offsetX = alignMode === "center"
        ? `${Math.round(((Number(action.w) || 1) / 2 - actionCenterX) * scale)}px`
        : `${Math.round((idleCenterX - actionCenterX) * scale)}px`;
      const offsetY = alignMode === "center"
        ? `${Math.round(((Number(action.h) || 1) / 2 - (actionBox[1] + actionBox[3]) / 2) * scale)}px`
        : `${Math.round((idleBottom - actionBottom) * scale)}px`;
      const clipTop = "0%";
      const clipRight = "0%";
      const clipBottom = "0%";
      const clipLeft = "0%";
      return { renderW, renderH, offsetX, offsetY, clipTop, clipRight, clipBottom, clipLeft };
    };
    const getPetActionLayoutMeta = (dexId, sideCode = "1", stateCode = "1") => {
      const sideMeta = petActionLayout.value && petActionLayout.value[String(dexId)] && petActionLayout.value[String(dexId)][sideCode];
      const idle = sideMeta && sideMeta.idle;
      const action = sideMeta && sideMeta.actions && (sideMeta.actions[stateCode] || sideMeta.actions["1"]);
      const actionBox = action && (Array.isArray(action.bodyBbox) ? action.bodyBbox : (Array.isArray(action.bbox) ? action.bbox : null));
      if (!idle || !action || !actionBox) return null;
      return { idle, action, actionBox };
    };
    const centerPetBodyOffsetY = (meta, renderW) => {
      if (!meta || !meta.action || !Array.isArray(meta.actionBox)) return "0px";
      const frameW = Math.max(1, Number(meta.action.w) || 1);
      const frameH = Math.max(1, Number(meta.action.h) || 1);
      const scale = Math.max(0.01, (Math.max(1, parseFloat(renderW) || 1)) / frameW);
      const bodyCenterY = ((Number(meta.actionBox[1]) || 0) + (Number(meta.actionBox[3]) || frameH)) / 2;
      return `${Math.round((frameH / 2 - bodyCenterY) * scale)}px`;
    };
    const centerPetAnimBodyStyle = (baseStyle, dexId, sideCode = "1", stateCode = "1") => {
      if (!baseStyle || !baseStyle.renderW) return baseStyle || {};
      const meta = getPetActionLayoutMeta(dexId, sideCode, stateCode);
      if (!meta) return baseStyle;
      return {
        ...baseStyle,
        offsetY: centerPetBodyOffsetY(meta, baseStyle.renderW)
      };
    };
    const fitBagFocusPetAnimStyle = (dexId, targetBodyH, frameH) => {
      const meta = getPetActionLayoutMeta(dexId, "1", "1");
      if (!meta) return getPetAnimLayoutStyle(dexId, "1", "1", targetBodyH, "bottom");
      const frameW = Math.max(1, Number(meta.action.w) || 1);
      const frameFullH = Math.max(1, Number(meta.action.h) || 1);
      const frameBodyW = Math.max(1, Number(meta.actionBox[2]) - Number(meta.actionBox[0]));
      const frameBodyH = Math.max(1, Number(meta.actionBox[3]) - Number(meta.actionBox[1]));
      const safeFrameH = Math.max(1, Number(frameH) || 1);
      const safeTargetBodyH = Math.min(Math.max(1, Number(targetBodyH) || 1), safeFrameH * 0.72);
      const maxFrameW = Math.max(1, safeFrameH * 1.75);
      const scale = Math.max(0.01, Math.min(safeTargetBodyH / frameBodyH, maxFrameW / frameW));
      const renderW = `${Math.max(1, Math.round(frameW * scale))}px`;
      const renderH = `${Math.max(1, Math.round(frameFullH * scale))}px`;
      const bodyCenterX = ((Number(meta.actionBox[0]) || 0) + (Number(meta.actionBox[2]) || frameW)) / 2;
      const bodyCenterY = ((Number(meta.actionBox[1]) || 0) + (Number(meta.actionBox[3]) || frameFullH)) / 2;
      return {
        renderW,
        renderH,
        offsetX: `${Math.round((frameW / 2 - bodyCenterX) * scale)}px`,
        offsetY: `${Math.round((frameFullH / 2 - bodyCenterY) * scale)}px`,
        clipTop: "0%",
        clipRight: "0%",
        clipBottom: "0%",
        clipLeft: "0%"
      };
    };
    const dockBagFocusPetAnimStyle = (dexId, targetBodyH, stageH) => {
      const meta = getPetActionLayoutMeta(dexId, "1", "1");
      if (!meta) return getPetAnimLayoutStyle(dexId, "1", "1", targetBodyH, "bottom");
      const focusScale = 1.2;
      const focusDockRatio = 0.84;
      const frameW = Math.max(1, Number(meta.action.w) || 1);
      const frameH = Math.max(1, Number(meta.action.h) || 1);
      const bodyLeft = Math.max(0, Number(meta.actionBox[0]) || 0);
      const bodyTop = Math.max(0, Number(meta.actionBox[1]) || 0);
      const bodyRight = Math.min(frameW, Number(meta.actionBox[2]) || frameW);
      const bodyBottom = Math.min(frameH, Number(meta.actionBox[3]) || frameH);
      const bodyW = Math.max(1, bodyRight - bodyLeft);
      const bodyH = Math.max(1, bodyBottom - bodyTop);
      const safeStageH = Math.max(1, Number(stageH) || Math.max(1, Number(targetBodyH) || 1));
      const safeTargetBodyH = Math.min(Math.max(1, Number(targetBodyH) || 1) * focusScale, safeStageH * 0.7);
      const maxBodyW = Math.max(1, safeStageH * 1.25);
      const scale = Math.max(0.01, Math.min(safeTargetBodyH / bodyH, maxBodyW / bodyW));
      const renderW = `${Math.max(1, Math.round(frameW * scale))}px`;
      const renderH = `${Math.max(1, Math.round(frameH * scale))}px`;
      const bodyCenterX = (bodyLeft + bodyRight) / 2;
      const dockY = safeStageH * focusDockRatio;
      return {
        renderW,
        renderH,
        offsetX: `${Math.round((frameW / 2 - bodyCenterX) * scale)}px`,
        offsetY: `${Math.round(dockY - bodyBottom * scale)}px`,
        clipTop: "0%",
        clipRight: "0%",
        clipBottom: "0%",
        clipLeft: "0%"
      };
    };
    const getBattleUiPx = (vw, vh) => clamp(Math.min(vw * 0.000625, vh * 0.001112), 0.72, 1.08);
    const getBattleTargetSpriteRightX = (vw, vh) => {
      const uiPx = getBattleUiPx(vw, vh);
      if (vw <= 900) return (8 * uiPx) + (vw * 0.33);
      return (32 * uiPx) + (vw * 0.28);
    };
    const getPetBodyAnchor = (box, meta = null) => {
      const anchor = meta && Array.isArray(meta.bodyAnchor) ? meta.bodyAnchor : null;
      return {
        centerX: anchor ? Number(anchor[0]) || 0 : (box[0] + box[2]) / 2,
        bottom: anchor ? Number(anchor[1]) || 0 : box[3]
      };
    };
    const getBattlePetAnimLayoutStyle = (dexId, sideCode, stateCode, targetBodyH) => {
      const sideMeta = petActionLayout.value && petActionLayout.value[String(dexId)] && petActionLayout.value[String(dexId)][sideCode];
      const idle = sideMeta && sideMeta.idle;
      const action = sideMeta && sideMeta.actions && (sideMeta.actions[stateCode] || sideMeta.actions["1"]);
      const idleBox = idle && (Array.isArray(idle.bodyBbox) ? idle.bodyBbox : (Array.isArray(idle.bbox) ? idle.bbox : null));
      const actionBox = action && (Array.isArray(action.bodyBbox) ? action.bodyBbox : (Array.isArray(action.bbox) ? action.bbox : null));
      if (!idle || !action || !idleBox || !actionBox) return {};
      const idleBodyH = Math.max(1, idleBox[3] - idleBox[1]);
      const safeTargetBodyH = Math.max(1, Number(targetBodyH) || 120);
      const idleScale = Math.max(0.01, safeTargetBodyH / idleBodyH);
      const actionScale = idleScale;
      const idleW = Math.max(1, Number(idle.w) || 1);
      const idleH = Math.max(1, Number(idle.h) || 1);
      const actionW = Math.max(1, Number(action.w) || 1);
      const actionH = Math.max(1, Number(action.h) || 1);
      const idleAnchor = getPetBodyAnchor(idleBox, idle);
      const actionAnchor = getPetBodyAnchor(actionBox, action);
      const idleAnchorX = (idleAnchor.centerX - idleW / 2) * idleScale;
      const idleAnchorY = -(idleH - idleAnchor.bottom) * idleScale;
      return {
        renderW: `${Math.max(1, Math.round(actionW * actionScale))}px`,
        renderH: `${Math.max(1, Math.round(actionH * actionScale))}px`,
        offsetX: `${Math.round(idleAnchorX - actionAnchor.centerX * actionScale)}px`,
        offsetY: `${Math.round(idleAnchorY - actionAnchor.bottom * actionScale)}px`,
        clipTop: "0%",
        clipRight: "0%",
        clipBottom: "0%",
        clipLeft: "0%"
      };
    };
    const battlePetImageStyleCache = new Map();
    const battlePetImageStyle = (side) => {
      if (!BATTLE_IDLE_USES_ACTION_SVG) return BATTLE_STATIC_PET_RENDER_STYLE;
      const scene = battleScene.value;
      const safeSide = side === "target" ? "target" : "attacker";
      const dexId = resolveBattleSideDexId(scene, safeSide);
      const sideCode = safeSide === "target" ? "1" : "2";
      const stateCode = getPetBattleStateCode(scene, safeSide);
      const vw = Math.max(1, Number(viewportSize.value && viewportSize.value.width) || 1700);
      const vh = Math.max(1, Number(viewportSize.value && viewportSize.value.height) || 765);
      const landscapeAndroid = isAndroidWebView && vw >= vh;
      const targetBodyH = landscapeAndroid && safeSide === "attacker"
        ? Math.max(1, Math.min(vw * 0.22, vh * 0.43))
        : clamp(Math.min(vw * 0.252, vh * 0.252), vw * 0.14, vw * 0.266) * 1.5;
      const cacheKey = `${safeSide}|${dexId}|${sideCode}|${stateCode}|${Math.round(targetBodyH)}`;
      if (battlePetImageStyleCache.has(cacheKey)) return battlePetImageStyleCache.get(cacheKey);
      const style = getBattlePetAnimLayoutStyle(dexId, sideCode, stateCode, targetBodyH);
      if (!style.renderW) return {};
      const result = {
        "--battle-pet-render-width": style.renderW,
        "--battle-pet-render-height": style.renderH,
        "--battle-pet-offset-x": style.offsetX,
        "--battle-pet-offset-y": style.offsetY,
        "--battle-pet-clip-top": style.clipTop || "0%",
        "--battle-pet-clip-right": style.clipRight || "0%",
        "--battle-pet-clip-bottom": style.clipBottom || "0%",
        "--battle-pet-clip-left": style.clipLeft || "0%"
      };
      battlePetImageStyleCache.set(cacheKey, result);
      if (battlePetImageStyleCache.size > 80) battlePetImageStyleCache.delete(battlePetImageStyleCache.keys().next().value);
      return result;
    };
    const petAnimImageStyle = (petOrDexId, targetBodyH = 96, side = "target") => {
      const dexId = typeof petOrDexId === "object"
        ? (Number(resolvePetCurrentDexId(petOrDexId)) || Number(petOrDexId && petOrDexId.dexId) || 0)
        : (Number(petOrDexId) || 0);
      const sideCode = side === "attacker" ? "2" : "1";
      const style = getPetAnimLayoutStyle(dexId, sideCode, "1", targetBodyH, "center");
      if (!style.renderW) return {};
      return {
        "--pet-anim-render-width": style.renderW,
        "--pet-anim-render-height": style.renderH,
        "--pet-anim-offset-x": style.offsetX,
        "--pet-anim-offset-y": style.offsetY,
        "--pet-anim-clip-top": style.clipTop || "0%",
        "--pet-anim-clip-right": style.clipRight || "0%",
        "--pet-anim-clip-bottom": style.clipBottom || "0%",
        "--pet-anim-clip-left": style.clipLeft || "0%"
      };
    };
    const bagFocusPetAnimImageStyle = (petOrDexId) => {
      const dexId = typeof petOrDexId === "object"
        ? (Number(resolvePetCurrentDexId(petOrDexId)) || Number(petOrDexId && petOrDexId.dexId) || 0)
        : (Number(petOrDexId) || 0);
      const vw = Math.max(1, Number(viewportSize.value && viewportSize.value.width) || 1700);
      const vh = Math.max(1, Number(viewportSize.value && viewportSize.value.height) || 765);
      const landscapeAndroid = isAndroidWebView && vw >= vh;
      const uiPx = clamp(Math.min(vw * 0.000625, vh * 0.001112), 0.72, 1.08);
      const stageH = landscapeAndroid
        ? clamp(vh * 0.58, 210 * uiPx, 330 * uiPx)
        : clamp(vh * 0.53, 300 * uiPx, 430 * uiPx);
      const targetBodyH = landscapeAndroid
        ? Math.max(1, Math.min(vw * 0.11, vh * 0.28, stageH * 0.48))
        : Math.max(1, Math.min(vw * 0.18, vh * 0.3, stageH * 0.56));
      const style = dockBagFocusPetAnimStyle(dexId, targetBodyH, stageH);
      if (!style.renderW) return {};
      return {
        "--pet-anim-render-width": style.renderW,
        "--pet-anim-render-height": style.renderH,
        "--pet-anim-offset-x": style.offsetX,
        "--pet-anim-offset-y": style.offsetY,
        "--pet-anim-clip-top": style.clipTop || "0%",
        "--pet-anim-clip-right": style.clipRight || "0%",
        "--pet-anim-clip-bottom": style.clipBottom || "0%",
        "--pet-anim-clip-left": style.clipLeft || "0%"
      };
    };
    const bagSlotPetAnimImageStyle = (petOrDexId) => {
      const dexId = typeof petOrDexId === "object"
        ? (Number(resolvePetCurrentDexId(petOrDexId)) || Number(petOrDexId && petOrDexId.dexId) || 0)
        : (Number(petOrDexId) || 0);
      const vw = Math.max(1, Number(viewportSize.value && viewportSize.value.width) || 1700);
      const vh = Math.max(1, Number(viewportSize.value && viewportSize.value.height) || 765);
      const targetBodyH = Math.max(1, Math.min(vw * 0.042, vh * 0.082));
      const style = getPetAnimLayoutStyle(dexId, "1", "1", targetBodyH, "bottom");
      if (!style.renderW) return {};
      return {
        "--pet-anim-render-width": style.renderW,
        "--pet-anim-render-height": style.renderH,
        "--pet-anim-offset-x": style.offsetX,
        "--pet-anim-offset-y": style.offsetY,
        "--pet-anim-clip-top": style.clipTop || "0%",
        "--pet-anim-clip-right": style.clipRight || "0%",
        "--pet-anim-clip-bottom": style.clipBottom || "0%",
        "--pet-anim-clip-left": style.clipLeft || "0%"
      };
    };
    const getBattlePreparePetAnimLayoutStyle = (dexId, targetBodyH, mode = "single") => {
      const id = Number(dexId) || 0;
      const safeMode = normalize(mode);
      const useTeamFit = id >= 797 && (id <= MAX_OPEN_CHALLENGE_DEX_ID || EXTRA_PERSIST_DEX_IDS.has(id));
      const useCenteredBodyFit = safeMode === "bagFocus" || (safeMode === "team" && useTeamFit);
      if (!useCenteredBodyFit) return getPetAnimLayoutStyle(id, "1", "1", targetBodyH, "bottom");
      const meta = getPetActionLayoutMeta(id, "1", "1");
      if (!meta) return {};
      const { action, actionBox } = meta;
      const bodyW = Math.max(1, actionBox[2] - actionBox[0]);
      const bodyH = Math.max(1, actionBox[3] - actionBox[1]);
      const frameW = Math.max(1, Number(action.w) || 1);
      const frameH = Math.max(1, Number(action.h) || 1);
      const frameLimitW = targetBodyH * 3.6;
      const frameLimitH = targetBodyH * 3.6;
      const bodyScale = targetBodyH / bodyH;
      const frameScale = Math.min(frameLimitW / frameW, frameLimitH / frameH);
      const scale = Math.max(0.01, Math.min(bodyScale, frameScale));
      const renderW = `${Math.max(1, Math.round(frameW * scale))}px`;
      const renderH = `${Math.max(1, Math.round(frameH * scale))}px`;
      const bodyCenterX = (actionBox[0] + actionBox[2]) / 2;
      const bodyCenterY = (actionBox[1] + actionBox[3]) / 2;
      return {
        renderW,
        renderH,
        offsetX: `${Math.round((frameW / 2 - bodyCenterX) * scale)}px`,
        offsetY: `${Math.round((frameH / 2 - bodyCenterY) * scale)}px`,
        clipTop: "0%",
        clipRight: "0%",
        clipBottom: "0%",
        clipLeft: "0%"
      };
    };
    const battlePreparePetAnimImageStyle = (petOrDexId, mode = "single") => {
      const dexId = typeof petOrDexId === "object"
        ? (Number(resolvePetCurrentDexId(petOrDexId)) || Number(petOrDexId && petOrDexId.dexId) || 0)
        : (Number(petOrDexId) || 0);
      const vw = Math.max(1, Number(viewportSize.value && viewportSize.value.width) || 1700);
      const vh = Math.max(1, Number(viewportSize.value && viewportSize.value.height) || 765);
      const safeMode = normalize(mode);
      const targetBodyH = safeMode === "team"
        ? Math.max(1, Math.min(vw * 0.07, vh * 0.13))
        : (safeMode === "mini"
          ? Math.max(1, Math.min(vw * 0.07, vh * 0.15))
          : Math.max(1, Math.min(vw * 0.18, vh * 0.38)));
      const style = getBattlePreparePetAnimLayoutStyle(dexId, targetBodyH, safeMode);
      if (!style.renderW) return {};
      return {
        "--pet-anim-render-width": style.renderW,
        "--pet-anim-render-height": style.renderH,
        "--pet-anim-offset-x": style.offsetX,
        "--pet-anim-offset-y": style.offsetY,
        "--pet-anim-clip-top": style.clipTop || "0%",
        "--pet-anim-clip-right": style.clipRight || "0%",
        "--pet-anim-clip-bottom": style.clipBottom || "0%",
        "--pet-anim-clip-left": style.clipLeft || "0%"
      };
    };
    const warehousePetAnimImageStyle = (petOrDexId, mode = "list") => {
      const dexId = typeof petOrDexId === "object"
        ? (Number(resolvePetCurrentDexId(petOrDexId)) || Number(petOrDexId && petOrDexId.dexId) || 0)
        : (Number(petOrDexId) || 0);
      const vw = Math.max(1, Number(viewportSize.value && viewportSize.value.width) || 1700);
      const vh = Math.max(1, Number(viewportSize.value && viewportSize.value.height) || 765);
      const safeMode = normalize(mode);
      const targetBodyH = safeMode === "action"
        ? Math.max(1, Math.min(vw * 0.03, vh * 0.075))
        : Math.max(1, Math.min(vw * 0.038, vh * 0.088));
      const style = getPetAnimLayoutStyle(dexId, "1", "1", targetBodyH, "bottom");
      if (!style.renderW) return {};
      return {
        "--pet-anim-render-width": style.renderW,
        "--pet-anim-render-height": style.renderH,
        "--pet-anim-offset-x": style.offsetX,
        "--pet-anim-offset-y": style.offsetY,
        "--pet-anim-clip-top": style.clipTop || "0%",
        "--pet-anim-clip-right": style.clipRight || "0%",
        "--pet-anim-clip-bottom": style.clipBottom || "0%",
        "--pet-anim-clip-left": style.clipLeft || "0%"
      };
    };
    const timeTunnelPetAnimImageStyle = (petOrDexId) => {
      const dexId = typeof petOrDexId === "object"
        ? (Number(resolvePetCurrentDexId(petOrDexId)) || Number(petOrDexId && petOrDexId.dexId) || 0)
        : (Number(petOrDexId) || 0);
      const targetBodyH = Math.max(1, Math.min(1700 * 0.22, 765 * 0.42));
      const style = getPetAnimLayoutStyle(dexId, "1", "1", targetBodyH, "bottom");
      if (!style.renderW) return {};
      return {
        "--pet-anim-render-width": style.renderW,
        "--pet-anim-render-height": style.renderH,
        "--pet-anim-offset-x": style.offsetX,
        "--pet-anim-offset-y": style.offsetY,
        "--pet-anim-clip-top": style.clipTop || "0%",
        "--pet-anim-clip-right": style.clipRight || "0%",
        "--pet-anim-clip-bottom": style.clipBottom || "0%",
        "--pet-anim-clip-left": style.clipLeft || "0%"
      };
    };
    const timeTunnelEnemyScaleStyle = () => ({ transform: "scale(3)" });
    const getBattleSkillEffectId = (skill) => {
      const name = normalizeSkillKey(skill && skill.name).replace(/[·.\s]/g, "");
      if (name === "骰子炸弹" || name === "超级骰子炸弹") return DICE_BOMB_SKILL_EFFECT_ID;
      return Number(FULLSCREEN_SKILL_EFFECT_ID_BY_NAME[name]) || Number(skill && skill.skillId) || 0;
    };
    const getBattleSkillEffectPath = (skill, actionSeq = 0) => {
      const id = getBattleSkillEffectId(skill);
      if (id <= 0) return "";
      const cacheBust = actionSeq > 0 ? `?fx=${actionSeq}` : "";
      const root = isFullscreenSkillEffect(skill) ? FULLSCREEN_SKILL_EFFECT_ROOT : SKILL_EFFECT_ROOT;
      return `${root}/effect${id}.gif${cacheBust}`;
    };
    const bagPetVisual = (pet) => {
      if (!pet) return { src: PLACEHOLDER, animated: false };
      const dexId = Number(petBattleVisualDexId(pet)) || Number(pet.dexId) || 0;
      if (dexId > 0) {
        return { src: petBattleSvgImage(dexId, "target", "idle"), staticImage: petCroppedStaticImage(dexId), animated: true };
      }
      return { src: ensureHttps(petCurrentForm(pet).img) || PLACEHOLDER, animated: false };
    };
    const battlePrepareBagPetVisual = (pet) => {
      if (!pet) return { src: PLACEHOLDER, animated: false };
      const dexId = Number(resolvePetCurrentDexId(pet)) || Number(pet && pet.dexId) || 0;
      return { src: petCroppedStaticImage(dexId) || ensureHttps(petCurrentForm(pet).img) || PLACEHOLDER, staticImage: petCroppedStaticImage(dexId), animated: false };
    };
    const markPetAnimStateOncePerAction = (scene, side, actionSeq, stateKey) => {
      if (!scene) return true;
      if (!scene._petAnimActionMarks || typeof scene._petAnimActionMarks !== "object") scene._petAnimActionMarks = {};
      const key = `${String(side)}:${String(actionSeq)}`;
      if (scene._petAnimActionMarks[key] === stateKey) return false;
      scene._petAnimActionMarks[key] = stateKey;
      return true;
    };
    const resolveBattleSideDexId = (scene, side) => {
      if (!scene) return 0;
      if (side === "target") return Number(scene.targetDexId) || 0;
      const curId = String(scene.currentAttackerId || "");
      const current = Array.isArray(scene.team)
        ? scene.team.find((u) => u && String(u.id || "") === curId)
        : null;
      const activePet = state && state.value && Array.isArray(state.value.activePets)
        ? state.value.activePets.find((p) => p && String(p.id || "") === curId)
        : null;
      const attackerName = normalize(
        (current && current.name) ||
        (activePet && (petDisplayName(activePet) || activePet.speciesName)) ||
        scene.attackerName
      );
      if (attackerName.includes("大师兔")) return 3;
      const dexId = Number(
        (current && current.battleVisualDexId) ||
        (activePet && petBattleVisualDexId(activePet)) ||
        (current && current.dexId) ||
        (activePet && activePet.dexId) ||
        scene.attackerDexId
      ) || 0;
      const baseDexId = Number(
        (current && current.baseDexId) ||
        (activePet && activePet.baseDexId) ||
        scene.attackerBaseDexId
      ) || 0;
      if (dexId === 3 || baseDexId === 3) return 3;
      return dexId || baseDexId || 0;
    };
    const isBattleAnimSide = (scene, side) => {
      const dexId = resolveBattleSideDexId(scene, side === "target" ? "target" : "attacker");
      return Boolean(getPetBattleAnimPath(dexId, side === "target" ? "target" : "attacker", "idle"));
    };
    const buildFullscreenSkillEffectLayout = (bounds) => {
      return {
        width: "150vw",
        height: "150vh",
        left: "35%",
        top: "40%"
      };
    };
    const battleSkillEffectStyle = (side) => {
      const fx = battleScene.value && battleScene.value.skillEffectFx;
      const duration = Math.max(120, Number(fx && fx.durationMs) || battleDelayMs(BATTLE_SKILL_EFFECT_DURATION_MS, 120));
      if (side === "fullscreen") {
        const layout = buildFullscreenSkillEffectLayout(fx && fx.coreBounds);
        return {
          "--skill-fx-duration": `${duration}ms`,
          "--skill-fx-fullscreen-width": layout.width,
          "--skill-fx-fullscreen-height": layout.height,
          "--skill-fx-fullscreen-left": layout.left,
          "--skill-fx-fullscreen-top": layout.top
        };
      }
      const vw = Math.max(1, Number(viewportSize.value && viewportSize.value.width) || 1700);
      const vh = Math.max(1, Number(viewportSize.value && viewportSize.value.height) || 765);
      const landscapeAndroid = isAndroidWebView && vw >= vh;
      const targetBodyH = landscapeAndroid && side !== "target"
        ? Math.max(1, Math.min(vw * 0.22, vh * 0.43))
        : clamp(Math.min(vw * 0.252, vh * 0.252), vw * 0.14, vw * 0.266) * 1.5;
      return { "--skill-fx-local-x": "0px", "--skill-fx-local-y": `${Math.round(-targetBodyH * 0.5)}px`, "--skill-fx-duration": `${duration}ms` };
    };
    const battleStatusEffectStyle = (side, forceMorale = false) => {
      const scene = battleScene.value;
      const safeSide = side === "target" ? "target" : "attacker";
      const fx = forceMorale ? (scene && scene.moraleEffectFx) : (scene && scene.statusEffectFx);
      const duration = Math.max(360, Number(fx && fx.durationMs) || battleDelayMs(STATUS_ANIM_DURATION_MS, 180));
      const vw = Math.max(1, Number(viewportSize.value && viewportSize.value.width) || 1700);
      const vh = Math.max(1, Number(viewportSize.value && viewportSize.value.height) || 765);
      const landscapeAndroid = isAndroidWebView && vw >= vh;
      const targetBodyH = landscapeAndroid && safeSide !== "target"
        ? Math.max(1, Math.min(vw * 0.22, vh * 0.43))
        : clamp(Math.min(vw * 0.252, vh * 0.252), vw * 0.14, vw * 0.266) * 1.5;
      const isMoraleFx = Boolean(forceMorale || (fx && fx.morale && fx.side === safeSide));
      const maxFxSize = landscapeAndroid ? Math.min(vw * (isMoraleFx ? 1 : 0.38), isMoraleFx ? 1120 : 420) : (isMoraleFx ? 1360 : 520);
      const statusFxSize = clamp(targetBodyH * (isMoraleFx ? 3.7 : 1.45), isMoraleFx ? 440 : 180, maxFxSize);
      if (isMoraleFx && scene) {
        const dexId = resolveBattleSideDexId(scene, safeSide);
        const sideCode = safeSide === "target" ? "1" : "2";
        const stateCode = getPetBattleStateCode(scene, safeSide);
        const layout = getBattlePetAnimLayoutStyle(dexId, sideCode, stateCode, targetBodyH);
        const meta = getPetActionLayoutMeta(dexId, sideCode, stateCode);
        if (layout && meta && layout.renderW && Array.isArray(meta.actionBox)) {
          const frameW = Math.max(1, Number(meta.action && meta.action.w) || 1);
          const scale = Math.max(0.01, (Math.max(1, parseFloat(layout.renderW) || 1)) / frameW);
          const bodyCenterX = ((Number(meta.actionBox[0]) || 0) + (Number(meta.actionBox[2]) || frameW)) / 2;
          const frameH = Math.max(1, Number(meta.action && meta.action.h) || 1);
          const bodyCenterY = ((Number(meta.actionBox[1]) || 0) + (Number(meta.actionBox[3]) || frameH)) / 2;
          const bodyH = Math.max(1, (Number(meta.actionBox[3]) || frameH) - (Number(meta.actionBox[1]) || 0)) * scale;
          const centerX = (parseFloat(layout.offsetX) || 0) + bodyCenterX * scale;
          const centerY = (parseFloat(layout.offsetY) || 0) + bodyCenterY * scale;
          const moraleSize = clamp(bodyH * 4.9, landscapeAndroid ? 520 : 600, landscapeAndroid ? Math.min(vw * 1.24, 1360) : 1640);
          return {
            "--status-fx-local-x": `${Math.round(centerX)}px`,
            "--status-fx-local-y": `${Math.round(centerY)}px`,
            "--status-fx-size": `${Math.round(moraleSize)}px`,
            "--status-fx-duration": `${duration}ms`
          };
        }
      }
      return {
        "--status-fx-local-x": "0px",
        "--status-fx-local-y": `${Math.round(-targetBodyH * 0.5)}px`,
        "--status-fx-size": `${Math.round(statusFxSize)}px`,
        "--status-fx-duration": `${duration}ms`
      };
    };
    const battleTransformEffectStyle = (side) => {
      const safeSide = side === "target" ? "target" : "attacker";
      const vw = Math.max(1, Number(viewportSize.value && viewportSize.value.width) || 1700);
      const vh = Math.max(1, Number(viewportSize.value && viewportSize.value.height) || 765);
      const landscapeAndroid = isAndroidWebView && vw >= vh;
      const targetBodyH = landscapeAndroid && safeSide === "attacker"
        ? Math.max(1, Math.min(vw * 0.22, vh * 0.43))
        : clamp(Math.min(vw * 0.252, vh * 0.252), vw * 0.14, vw * 0.266) * 1.5;
      const maxFxSize = landscapeAndroid ? Math.min(vw * 0.75, 930) : 1080;
      const transformFxSize = clamp(targetBodyH * 3.225, 390, maxFxSize);
      return {
        "--transform-fx-local-x": "0px",
        "--transform-fx-local-y": `${Math.round(-targetBodyH * 0.55)}px`,
        "--transform-fx-size": `${Math.round(transformFxSize)}px`
      };
    };
    const battleStageChangeFxStyle = (side) => {
      const safeSide = side === "target" ? "target" : "attacker";
      const vw = Math.max(1, Number(viewportSize.value && viewportSize.value.width) || 1700);
      const vh = Math.max(1, Number(viewportSize.value && viewportSize.value.height) || 765);
      const landscapeAndroid = isAndroidWebView && vw >= vh;
      const targetBodyH = landscapeAndroid && safeSide === "attacker"
        ? Math.max(1, Math.min(vw * 0.22, vh * 0.43))
        : clamp(Math.min(vw * 0.252, vh * 0.252), vw * 0.14, vw * 0.266) * 1.5;
      return {
        "--stage-change-y": `${Math.round(-targetBodyH * 1.08)}px`,
        "--stage-change-size": `${Math.round(clamp(targetBodyH * 0.54, 72, 158))}px`
      };
    };
    const showBattleStatusEffectFx = (scene, side, statuses = []) => {
      if (!scene || !Array.isArray(statuses) || statuses.length === 0) return;
      const safeSide = side === "target" ? "target" : "attacker";
      if (scene.moraleEffectFx && scene.moraleEffectFx.side === safeSide && Date.now() < (Number(scene._battleMoraleUntil) || 0)) return;
      const first = statuses.find((x) => x && normalize(x.status || x.key || x.label)) || statuses[0];
      const statusKey = normalize(first && (first.status || first.key));
      const label = normalize(first && first.label) || statusLabel(statusKey) || "";
      const fileLabel = STATUS_ANIM_FILE_MAP[statusKey] || label;
      if (!fileLabel) return;
      const seq = Date.now() + Math.random();
      scene.statusEffectFx = {
        side: safeSide,
        src: assetSrcWithQuery(encodeAssetSrc(`./pet-state/${fileLabel}.gif`), "fx", seq),
        label,
        seq,
        durationMs: battleSceneDelayMs(scene, STATUS_ANIM_DURATION_MS, 180)
      };
      setTimeout(() => {
        const live = battleScene.value;
        if (!live || live !== scene || !live.statusEffectFx || live.statusEffectFx.seq !== seq) return;
        live.statusEffectFx = null;
      }, scene.statusEffectFx.durationMs + 80);
    };
    const setBattleSkillEffectFx = (scene, fx, durationMs, expireMs) => {
      if (!scene || !fx) return;
      const safeDuration = battleSceneDelayMs(scene, Number(durationMs) || BATTLE_SKILL_EFFECT_DURATION_MS, 120);
      const safeExpire = Math.max(safeDuration, battleSceneDelayMs(scene, Number(expireMs) || Number(durationMs) || BATTLE_SKILL_EFFECT_DURATION_MS, 120));
      scene.skillEffectFx = { ...fx, durationMs: safeDuration };
      scene._skillEffectUntil = Date.now() + safeExpire;
    };
    const isFullscreenSkillEffect = (skill) => {
      const name = normalizeSkillKey(skill && skill.name).replace(/[·.\s]/g, "");
      return FULLSCREEN_SKILL_EFFECT_NAMES.has(name) || FULLSCREEN_SKILL_EFFECT_IDS.has(getBattleSkillEffectId(skill));
    };
    const clearBattleSkillEffectFxIfExpired = (scene, seq) => {
      if (!scene || !scene.skillEffectFx) return;
      if (seq !== undefined && scene.skillEffectFx.seq !== seq) return;
      if (Date.now() < (Number(scene._skillEffectUntil) || 0)) return;
      scene.skillEffectFx = null;
      scene._skillEffectUntil = 0;
    };
    const applyBattleAnimImage = (scene, side, stateKey, actionSeq = 0) => {
      if (!scene) return;
      const safeSide = side === "target" ? "target" : "attacker";
      const lockKey = safeSide === "target" ? "_petAnimTargetPlayLock" : "_petAnimAttackerPlayLock";
      const imageKey = safeSide === "target" ? "targetImage" : "attackerImage";
      const timerKey = safeSide === "target" ? "_petAnimTargetAutoIdleTimer" : "_petAnimAttackerAutoIdleTimer";
      if (!BATTLE_IDLE_USES_ACTION_SVG) {
        if (scene[timerKey]) {
          clearTimeout(scene[timerKey]);
          scene[timerKey] = null;
        }
        scene[lockKey] = false;
        const curId = String(scene.currentAttackerId || "");
        const current = safeSide === "attacker" && Array.isArray(scene.team)
          ? scene.team.find((u) => u && String(u.id || "") === curId)
          : null;
        const fallback = safeSide === "target"
          ? (scene.targetStaticImage || petCroppedStaticImage(scene.targetDexId))
          : (current ? battleUnitStaticImage(current) : (scene.attackerStaticImage || petCroppedStaticImage(scene.attackerBattleVisualDexId || scene.attackerDexId)));
        if (fallback) scene[imageKey] = fallback;
        return;
      }
      if (stateKey !== "idle" && scene[lockKey]) {
        petAnimDebugLog("skip locked side", { side: safeSide, stateKey });
        return;
      }
      if (actionSeq > 0 && !markPetAnimStateOncePerAction(scene, safeSide, actionSeq, stateKey)) {
        petAnimDebugLog("skip duplicated state in same action", { side: safeSide, stateKey, actionSeq });
        return;
      }
      const dexId = resolveBattleSideDexId(scene, safeSide);
      const baseNext = getPetBattleAnimPath(dexId, safeSide, stateKey);
      const next = petAnimActionSrc(baseNext, actionSeq, stateKey);
      if (!next) {
        petAnimDebugLog("skip side (no anim path)", { side: safeSide, dexId, stateKey });
        return;
      }
      const startedAt = Date.now();
      const scheduleAutoIdle = (duration) => {
        if (scene[timerKey]) clearTimeout(scene[timerKey]);
        const delay = Math.max(80, (startedAt + battleSceneDelayMs(scene, petAnimPlayMs(duration), 80)) - Date.now());
        scene[timerKey] = setTimeout(() => {
          const live = battleScene.value;
          if (!live || live !== scene || live.ended || live[imageKey] !== next) return;
          applyBattleAnimImage(live, safeSide, "idle");
        }, delay);
      };
      if (scene[imageKey] === next) return;
      scene[imageKey] = next;
      petAnimDebugLog(`${safeSide} image -> ${stateKey}`, next);
      if (stateKey !== "idle") {
        scene[lockKey] = true;
        scheduleAutoIdle(estimatePetBattleAnimDurationMs(dexId, safeSide, stateKey));
        getAnimatedWebpDurationMs(next).then((duration) => {
          if (!battleScene.value || battleScene.value !== scene || scene.ended || scene[imageKey] !== next) return;
          scheduleAutoIdle(duration);
        });
        return;
      }
      if (scene[timerKey]) {
        clearTimeout(scene[timerKey]);
        scene[timerKey] = null;
      }
      scene[lockKey] = false;
    };
    const resetBattleAnimIdle = (scene) => {
      if (!scene) return;
      if (!BATTLE_IDLE_USES_ACTION_SVG) {
        if (scene._petAnimTargetAutoIdleTimer) {
          clearTimeout(scene._petAnimTargetAutoIdleTimer);
          scene._petAnimTargetAutoIdleTimer = null;
        }
        if (scene._petAnimAttackerAutoIdleTimer) {
          clearTimeout(scene._petAnimAttackerAutoIdleTimer);
          scene._petAnimAttackerAutoIdleTimer = null;
        }
        scene._petAnimTargetPlayLock = false;
        scene._petAnimAttackerPlayLock = false;
        scene._petAnimActionMarks = {};
        const curId = String(scene.currentAttackerId || "");
        const current = Array.isArray(scene.team)
          ? scene.team.find((u) => u && String(u.id || "") === curId)
          : null;
        const attackerIdle = current ? battleUnitStaticImage(current) : (scene.attackerStaticImage || petCroppedStaticImage(scene.attackerBattleVisualDexId || scene.attackerDexId));
        if (attackerIdle) scene.attackerImage = attackerIdle;
        if (scene.targetStaticImage) scene.targetImage = scene.targetStaticImage;
        return;
      }
      applyBattleAnimImage(scene, "attacker", "idle");
      applyBattleAnimImage(scene, "target", "idle");
    };
    const currentBattleAttackerUnit = (scene) => {
      if (!scene || !Array.isArray(scene.team)) return null;
      const curId = String(scene.currentAttackerId || "");
      return scene.team.find((u) => u && String(u.id || "") === curId) || null;
    };
    const battleUnitCanTransformSkin = (unit) => Boolean(
      unit
      && normalize(unit.skinKey) === QIANKUN_XIULUOSHEN_SKIN_KEY
      && Number(unit.skinBattleVisualDexId) > 0
      && !unit.skinActivated
    );
    const canShowBattleSkinTransform = () => {
      const scene = battleScene.value;
      return Boolean(scene && scene.open && battleUnitCanTransformSkin(currentBattleAttackerUnit(scene)));
    };
    const canTriggerBattleSkinTransform = () => {
      const scene = battleScene.value;
      return Boolean(
        scene
        && scene.open
        && !scene.ended
        && !scene.isActing
        && !scene.pendingFinish
        && battleUnitCanTransformSkin(currentBattleAttackerUnit(scene))
      );
    };
    const applyAttackerSkinIdleVisual = (scene) => {
      const unit = currentBattleAttackerUnit(scene);
      if (!scene || !unit || !battleUnitCanTransformSkin(unit)) return false;
      const originalDexId = Number(unit.originalBattleVisualDexId) || Number(unit.battleVisualDexId) || Number(scene.attackerDexId) || Number(scene.attackerBaseDexId) || 0;
      const finalDexId = Number(unit.skinBattleVisualDexId) || 0;
      if (!originalDexId || !finalDexId || originalDexId === finalDexId) return false;
      const finalIdle = normalize(unit.skinBattleImage) || (BATTLE_IDLE_USES_ACTION_SVG
        ? getPetBattleAnimPath(finalDexId, "attacker", "idle")
        : petCroppedStaticImage(finalDexId));
      if (!finalIdle) return false;
      if (scene._petAnimAttackerAutoIdleTimer) {
        clearTimeout(scene._petAnimAttackerAutoIdleTimer);
        scene._petAnimAttackerAutoIdleTimer = null;
      }
      scene._petAnimAttackerPlayLock = false;
      unit.skinActivated = true;
      unit.battleVisualDexId = finalDexId;
      unit.battleStaticDexId = finalDexId;
      unit.battleImage = finalIdle;
      unit.staticImage = unit.skinStaticImage || petCroppedStaticImage(finalDexId);
      scene.attackerPreSkinDexId = originalDexId;
      scene.attackerBattleVisualDexId = finalDexId;
      scene.attackerSkinBattleVisualDexId = finalDexId;
      scene.attackerSkinActivated = true;
      scene.attackerStaticImage = unit.skinStaticImage || petCroppedStaticImage(finalDexId);
      scene.attackerTransformingSkin = false;
      scene.attackerTransformFx = "";
      scene.attackerTransformUnitId = "";
      scene.attackerImage = finalIdle;
      return true;
    };
    const finishBattleSkinTransform = (scene, seq) => {
      const live = battleScene.value;
      if (!live || live !== scene || live.ended || live.attackerTransformSeq !== seq) return;
      applyAttackerSkinIdleVisual(live);
      live.attackerTransformingSkin = false;
      live.attackerTransformFx = "";
      live.attackerTransformUnitId = "";
      live.isActing = false;
      live._attackerTransformTimer = null;
    };
    const triggerBattleSkinTransform = () => {
      const scene = battleScene.value;
      if (!canTriggerBattleSkinTransform()) return;
      const unit = currentBattleAttackerUnit(scene);
      if (!unit) return;
      if (scene._attackerTransformTimer) {
        clearTimeout(scene._attackerTransformTimer);
        scene._attackerTransformTimer = null;
      }
      const seq = Date.now();
      scene.isActing = true;
      scene.attackerTransformSeq = seq;
      scene.attackerTransformUnitId = String(unit.id || "");
      scene.attackerTransformingSkin = true;
      scene.attackerTransformFx = assetSrcWithQuery(BATTLE_SKIN_TRANSFORM_FX_SRC, "skin", seq);
      pushBattleLog(scene, `${scene.attackerName}灵皮启耀，${QIANKUN_XIULUOSHEN_SKIN_NAME}姿态显现。皮肤对战加成：${QIANKUN_XIULUOSHEN_SKIN_BATTLE_BONUS_TEXT}。`);
      getAnimatedGifTiming(BATTLE_SKIN_TRANSFORM_FX_SRC).then((timing) => {
        if (battleScene.value !== scene) return;
        const rawDuration = clamp(Number(timing && timing.durationMs) || 1200, 900, 2600);
        const delay = battleSceneDelayMs(scene, rawDuration, 600);
        scene._attackerTransformTimer = setTimeout(() => finishBattleSkinTransform(scene, seq), delay);
      }).catch(() => {
        if (battleScene.value !== scene) return;
        scene._attackerTransformTimer = setTimeout(() => finishBattleSkinTransform(scene, seq), battleSceneDelayMs(scene, 1200, 600));
      });
    };
    const isSelfSideStatusSkillFx = (skill) => {
      const effects = parseSkillEffects(skill);
      if (!effects.length) return false;
      return effects.some((e) => {
        const kind = normalize(e && e.kind);
        const target = normalize(e && e.target) || "self";
        const selfDestination = target === "self"
          || normalize(e && e.copyTo) === "self"
          || normalize(e && e.to) === "self"
          || normalize(e && e.applyTo) === "self";
        if (!selfDestination) return false;
        if ([
          "heal", "healFlat", "healFlatTeam", "timedHeal", "healOverTime", "flatHealOverTime", "endTurnHealFlat",
          "statusCure", "statusShield", "stageGuard",
          "attackImmunity", "diminishingAttackImmunity", "damageAbsorb", "diminishingDamageAbsorb",
          "damageShield", "damageShieldByDamage", "damageReduction", "typedDamageReduction", "damageBoost",
          "damageReflect", "damageReflectFlat", "recoilByDamage",
          "windGodPossession", "elementShelter", "elementChange", "elementDamageReduction",
          "globalElementPower", "elementPowerBuff", "delayedStage", "timedStage", "timedRandomStage",
          "onHitRandomStage", "speedConditionalStage", "onCritHealMaxHp", "onCritLifesteal",
          "copyStage", "transferStage", "transferStatus", "swapStage", "swapStagePairs", "invertStage", "lastStand", "endTurnSetHpToOne",
          "unharmedPowerMultiplier"
        ].includes(kind)) return true;
        if (kind === "stage" || kind === "critStage") return Number(e && e.delta) > 0;
        return false;
      });
    };
    const isOpponentSideStatusSkillFx = (skill) => {
      const name = normalizeSkillKey(skill && skill.name).replace(/[·.\s]/g, "");
      if (name === "骰子炸弹" || name === "超级骰子炸弹") return true;
      return parseSkillEffects(skill).some((e) => {
        const kind = normalize(e && e.kind);
        const target = normalize(e && e.target) || "self";
        return kind === "diceDrain" && target === "opponent";
      });
    };
    const scheduleBattleSkillEffectVisual = (scene, actorSide, targetSide, skill, atkKind, actionStateKey, actionSeq, afterEffect) => {
      if (!scene || !skill) {
        if (typeof afterEffect === "function") afterEffect();
        return;
      }
      const visualStartedAt = Number(scene._petAnimActionStartedAt && scene._petAnimActionStartedAt[actionSeq]) || Date.now();
      const effectSide = (actionStateKey === "status" || atkKind === "status")
        ? (isOpponentSideStatusSkillFx(skill) ? targetSide : (isSelfSideStatusSkillFx(skill) ? actorSide : targetSide))
        : targetSide;
      const visualSide = isFullscreenSkillEffect(skill) ? "fullscreen" : effectSide;
      const actorDexId = resolveBattleSideDexId(scene, actorSide);
      const actionSrc = BATTLE_IDLE_USES_ACTION_SVG ? getPetBattleAnimPath(actorDexId, actorSide, actionStateKey) : "";
      const effectSrc = getBattleSkillEffectPath(skill, actionSeq);
      const scheduledActionSrc = petAnimActionSrc(actionSrc, actionSeq, actionStateKey);
      const runAfterEffect = () => {
        if (typeof afterEffect === "function") afterEffect();
      };
      markBattleDefeatVisualHold(scene, 1);
      if (scheduledActionSrc || effectSrc) {
        getBattleActionVisualDurationMs(scene, scheduledActionSrc, effectSrc).then((rawVisualMs) => {
          markBattleVisualHoldFrom(scene, visualStartedAt, rawVisualMs + BATTLE_FLOAT_TEXT_DURATION_MS + BATTLE_DAMAGE_FLOAT_SETTLE_MS);
        });
      }
      const actionDurationPromise = scheduledActionSrc
        ? getAnimatedWebpDurationMs(scheduledActionSrc)
        : Promise.resolve(0);
      actionDurationPromise.then((duration) => {
        const actionDelay = Math.max(0, visualStartedAt + battleSceneDelayMs(scene, petAnimPlayMs(duration), 80) - Date.now());
        setTimeout(() => {
          const live = battleScene.value;
          if (!live || live !== scene || live.ended) {
            runAfterEffect();
            return;
          }
          if (!effectSrc) {
            runAfterEffect();
            return;
          }
          getAnimatedGifTiming(effectSrc).then((effectTiming) => {
            const rawHoldMs = Math.max(BATTLE_SKILL_EFFECT_DURATION_MS, Number(effectTiming && effectTiming.durationMs) || BATTLE_SKILL_EFFECT_DURATION_MS);
            const rawRemoveMs = Math.max(rawHoldMs, Number(effectTiming && effectTiming.removeMs) || rawHoldMs);
            const removeMs = battleSceneDelayMs(scene, rawRemoveMs, 120);
            const singleLoopSrc = (effectTiming && effectTiming.src) || effectSrc;
            const applyFx = (coreBounds = null) => setBattleSkillEffectFx(scene, { side: visualSide, src: singleLoopSrc, seq: actionSeq, coreBounds }, rawHoldMs, rawRemoveMs);
            if (visualSide === "fullscreen") {
              getSkillEffectCoreBounds(singleLoopSrc).then((bounds) => {
                const current = battleScene.value;
                if (current && current === scene && scene.skillEffectFx && scene.skillEffectFx.seq === actionSeq) scene.skillEffectFx.coreBounds = bounds;
              });
            }
            applyFx(null);
            markBattleDefeatVisualHold(scene, 1);
            setTimeout(() => {
              const current = battleScene.value;
              if (current && current === scene) clearBattleSkillEffectFxIfExpired(scene, actionSeq);
              runAfterEffect();
            }, removeMs);
          }).catch(() => {
            if (visualSide === "fullscreen") {
              getSkillEffectCoreBounds(effectSrc).then((bounds) => {
                const current = battleScene.value;
                if (current && current === scene && scene.skillEffectFx && scene.skillEffectFx.seq === actionSeq) scene.skillEffectFx.coreBounds = bounds;
              });
            }
            setBattleSkillEffectFx(scene, { side: visualSide, src: effectSrc, seq: actionSeq, coreBounds: null }, BATTLE_SKILL_EFFECT_DURATION_MS);
            markBattleDefeatVisualHold(scene, 1);
            setTimeout(() => {
              const current = battleScene.value;
              if (current && current === scene) clearBattleSkillEffectFxIfExpired(scene, actionSeq);
              runAfterEffect();
            }, battleSceneDelayMs(scene, BATTLE_SKILL_EFFECT_DURATION_MS, 120));
          });
        }, actionDelay);
      }).catch(() => {
        const fallbackDelay = Math.max(0, visualStartedAt + battleSceneDelayMs(scene, BATTLE_DAMAGE_VISUAL_DELAY_MS, 120) - Date.now());
        setTimeout(runAfterEffect, fallbackDelay);
      });
    };
    const buildBattleUnitFromPet = (pet) => {
      if (!pet) return null;
      const species = getSpeciesForPet(pet);
      if (!species || !species.raceStats) return null;
      const baseSkills = Array.isArray(species.skills) ? species.skills : [];
      const extraSkills = petExtraSkills(pet);
      const fullSkills = baseSkills.concat(extraSkills);
      const skillLevel = skillLevelForPet(pet);
      const unlockedSkills = fullSkills.filter((s) => extraSkills.includes(s) || Number(s.level) <= skillLevel);
      const equipped = currentEquippedSkillNamesBySpecies(species, pet.equippedSkills, skillLevel, extraSkills);
      const chosenByEquip = equipped
        .map((name) => unlockedSkills.find((s) => normalizeSkillKey(s.name) === normalizeSkillKey(name)))
        .filter(Boolean);
      const chosenSkills = (chosenByEquip.length > 0 ? chosenByEquip : unlockedSkills).slice(0, 4).map((s) => ({
        skillId: Number(s && s.skillId) || null,
        dexId: Number(pet && pet.dexId) || Number(s && s.dexId) || 0,
        skillKey: normalize(s && s.skillKey),
        name: normalizeSkillKey(s.name) || "未知技能",
        attackTypeCode: Number.isFinite(Number(s && s.attackTypeCode)) ? Number(s.attackTypeCode) : null,
        attackTypeLabel: normalize(s && s.attackTypeLabel),
        type: buildSkillTypeText(normalize(s.type) || "未知系/普通攻击", s && s.attackTypeCode, s && s.attackTypeLabel),
        power: Number(s.power) > 0 ? Number(s.power) : 0,
        ppMax: Math.max(1, Number(s.pp) || 10),
        pp: Math.max(1, Number(s.pp) || 10),
        level: Math.max(0, Number(s.level) || 0),
        accuracy: safeSkillAccuracy(s),
        desc: normalize(s.desc)
      }));
      if (chosenSkills.length === 0) return null;
      const baseAbility = calcPetAbilityByRace(species.raceStats, pet.level, pet.talent, pet.study);
      const ability = applyPetSkinBattleAbilityBonus(baseAbility, pet);
      const seal = qixingSealForPet(pet);
      const visualDexId = petBattleVisualDexId(pet);
      const baseDexId = Number(pet.baseDexId) || Number(pet.dexId || (species && species.dexId)) || 0;
      const staticDexId = Number(resolvePetCurrentDexId(pet)) || baseDexId || Number(pet.dexId || (species && species.dexId)) || 0;
      const usesQiankunSkin = normalize(pet.skinKey) === QIANKUN_XIULUOSHEN_SKIN_KEY && Number(visualDexId) === QIANKUN_XIULUOSHEN_SKIN_DEX_ID;
      const battleStaticDexId = usesQiankunSkin ? QIANKUN_XIULUOSHEN_SKIN_DEX_ID : staticDexId;
      const originalStaticImage = petCroppedStaticImage(staticDexId);
      const staticImage = petCroppedStaticImage(battleStaticDexId);
      const originalBattleVisualDexId = staticDexId;
      const skinBattleVisualDexId = usesQiankunSkin ? QIANKUN_XIULUOSHEN_SKIN_DEX_ID : 0;
      const originalBattleImage = BATTLE_IDLE_USES_ACTION_SVG && Number(originalBattleVisualDexId) > 0
        ? getPetBattleAnimPath(originalBattleVisualDexId, "attacker", "idle")
        : originalStaticImage;
      const skinBattleImage = skinBattleVisualDexId > 0
        ? (BATTLE_IDLE_USES_ACTION_SVG ? getPetBattleAnimPath(skinBattleVisualDexId, "attacker", "idle") : staticImage)
        : "";
      const battleImage = originalBattleImage || originalStaticImage;
      return {
        id: pet.id,
        petId: pet.id,
        dexId: Number(pet.dexId || (species && species.dexId)) || 0,
        battleVisualDexId: Number(originalBattleVisualDexId) || Number(pet.dexId || (species && species.dexId)) || 0,
        originalBattleVisualDexId: Number(originalBattleVisualDexId) || Number(pet.dexId || (species && species.dexId)) || 0,
        skinBattleVisualDexId,
        baseDexId,
        staticDexId,
        battleStaticDexId,
        name: petDisplayName(pet),
        image: originalStaticImage,
        originalStaticImage,
        staticImage,
        skinStaticImage: staticImage,
        originalBattleImage,
        skinBattleImage,
        battleImage,
        level: pet.level,
        element: normalize(pet.element) || "未知系",
        subElement: normalize(pet.subElement),
        ability,
        hp: ability.hp,
        maxHp: ability.hp,
        skills: chosenSkills,
        battleItemId: normalize(pet.equippedItemId),
        qixingSealLevel: normalize(pet.equippedItemId) === QIXING_SEAL_ITEM_ID ? clamp(Math.floor(Number(seal && seal.level) || 1), 1, QIXING_SEAL_MAX_LEVEL) : 1,
        qixingSealTraitKey: normalize(pet.equippedItemId) === QIXING_SEAL_ITEM_ID ? normalizeQixingTraitKey(seal && seal.traitKey) : "",
        skinKey: normalize(pet.skinKey),
        skinActivated: false,
        battleState: createBattleState()
      };
    };
    const buildBattleTarget = ({ entry, level, forceHpRace500 = false, hpRaceOverride = null, hpRaceMultiplier = null, battleBoostRatio = 0, talentOverride = null, studyOverride = null, displayName = "", displayImage = "" }) => {
      if (!entry) return null;
      const species = getSpeciesByDexId(entry.dexId, entry.name);
      if (!species || !species.raceStats) return null;
      const baseHpRace = safeNonNegInt(species.raceStats.hp);
      const hpRace = Number(hpRaceOverride) > 0
        ? Number(hpRaceOverride)
        : (Number(hpRaceMultiplier) > 0
          ? Math.max(1, Math.round(baseHpRace * Number(hpRaceMultiplier)))
          : (forceHpRace500 ? 500 : baseHpRace));
      const race = {
        hp: hpRace,
        atk: safeNonNegInt(species.raceStats.atk),
        def: safeNonNegInt(species.raceStats.def),
        spAtk: safeNonNegInt(species.raceStats.spAtk),
        spDef: safeNonNegInt(species.raceStats.spDef),
        speed: safeNonNegInt(species.raceStats.speed)
      };
      const baseAbility = calcPetAbilityByRace(race, level, talentOverride || createUniformTalent30(), studyOverride || createZeroStats());
      const boostRatio = Number(battleBoostRatio) || 0;
      const ability = boostRatio > 0
        ? (() => {
            const next = { ...baseAbility };
            BATTLE_ABILITY_KEYS.forEach((key) => {
              next[key] = Math.max(1, Math.floor((Number(next[key]) || 0) * (1 + boostRatio)));
            });
            next.total = calcAbilityTotal(next);
            return next;
          })()
        : baseAbility;
      const randomBossPool = BOSS_RANDOM_SKILL_POOL_BY_DEX_ID[Number(entry && entry.dexId) || 0];
      const targetRawSkills = Array.isArray(randomBossPool)
        ? randomBossPool
            .map((name) => pickBossPoolSkillSource(entry && entry.dexId, name, species))
            .filter(Boolean)
        : (species.skills || []).filter((s) => Number(s.level) <= level);
      const targetUnlockedSkills = targetRawSkills.map((s) => ({
        skillId: Number(s && s.skillId) || null,
        dexId: Number(entry && entry.dexId) || Number(s && s.dexId) || 0,
        skillKey: normalize(s && s.skillKey),
        name: normalizeSkillKey(s.name) || "未知技能",
        attackTypeCode: Number.isFinite(Number(s && s.attackTypeCode)) ? Number(s.attackTypeCode) : null,
        attackTypeLabel: normalize(s && s.attackTypeLabel),
        type: buildSkillTypeText(normalize(s.type) || "未知系/普通攻击", s && s.attackTypeCode, s && s.attackTypeLabel),
        power: Number(s.power) > 0 ? Number(s.power) : 0,
        ppMax: Math.max(1, Number(s.pp) || 10),
        pp: Math.max(1, Number(s.pp) || 10),
        level: Math.max(0, Number(s.level) || 0),
        accuracy: safeSkillAccuracy(s),
        desc: normalize(s.desc)
      }));
      if (targetUnlockedSkills.length === 0) return null;
      const img = entry.image || PLACEHOLDER;
      const staticImage = petCroppedStaticImage(entry.dexId) || ensureHttps(img) || PLACEHOLDER;
      return {
        dexId: entry.dexId,
        name: normalize(displayName) || entry.name,
        image: ensureHttps(displayImage || petBattleSvgImage(entry.dexId, "target", "idle") || img),
        staticImage,
        level,
        element: normalize(entry.element) || "未知系",
        subElement: normalize(entry.subElement),
        ability,
        hp: ability.hp,
        maxHp: ability.hp,
        skills: targetUnlockedSkills,
        battleItemId: "",
        battleState: createBattleState()
      };
    };
    const normalizeTargetSkill = (skill, entry) => ({
      skillId: Number(skill && skill.skillId) || null,
      dexId: Number(entry && entry.dexId) || Number(skill && skill.dexId) || 0,
      skillKey: normalize(skill && skill.skillKey) || `${normalizeSkillKey(skill && skill.name)}#${normalize(skill && skill.element) || normalize(entry && entry.element) || "未知系"}`,
      name: normalizeSkillKey(skill && skill.name) || "未知技能",
      attackTypeCode: Number.isFinite(Number(skill && skill.attackTypeCode)) ? Number(skill.attackTypeCode) : null,
      attackTypeLabel: normalize(skill && skill.attackTypeLabel),
      type: buildSkillTypeText(
        normalize(skill && skill.type) || `${normalize(skill && skill.element) || normalize(entry && entry.element) || "未知系"}/${normalize(skill && skill.attackTypeLabel) || "普通攻击"}`,
        skill && skill.attackTypeCode,
        skill && skill.attackTypeLabel
      ),
      power: Number(skill && skill.power) > 0 ? Number(skill.power) : 0,
      ppMax: Math.max(1, Number(skill && (skill.ppMax || skill.pp)) || 10),
      pp: Math.max(1, Number(skill && (skill.pp || skill.ppMax)) || 10),
      level: Math.max(0, Number(skill && skill.level) || 0),
      accuracy: safeSkillAccuracy(skill),
      desc: normalize(skill && skill.desc)
    });
    const applyTimeTunnelTargetSkills = (target, entry) => {
      if (!target || !entry) return target;
      const extras = TIME_TUNNEL_EXTRA_SKILLS_BY_DEX_ID[Number(entry.dexId) || 0];
      if (!Array.isArray(extras) || extras.length === 0) return target;
      if (Number(entry.dexId) === 461) {
        target.skills = extras.map((skill) => normalizeTargetSkill(skill, entry));
        return target;
      }
      const seen = new Set((Array.isArray(target.skills) ? target.skills : []).map((s) => normalizeSkillKey(s && s.name)).filter(Boolean));
      extras.forEach((skill) => {
        const name = normalizeSkillKey(skill && skill.name);
        if (!name || seen.has(name)) return;
        target.skills.push(normalizeTargetSkill(skill, entry));
        seen.add(name);
      });
      return target;
    };
const applyTimeTunnelFloor20TargetBuff = (scene) => {
  if (!scene || scene.mode !== "timeTunnel") return false;
  const meta = scene.timeTunnelMeta || {};
  const floor = Math.max(1, Math.floor(Number(meta.floor) || 1));
  const dexId = Number(scene.targetDexId) || 0;
  if (floor !== 20 || !TIME_TUNNEL_FLOOR_20_BONUS_DEX_IDS.has(dexId)) return false;
  addTimedEffect(scene, "target", { kind: "damageReduction", turns: 999, data: { ratio: 0.2, permanent: true } });
  addTimedEffect(scene, "target", { kind: "hitRateBoost", turns: 999, data: { ratio: 1, permanent: true } });
  addTimedEffect(scene, "target", { kind: "elementDamageReduction", turns: 999, data: { element: "火系", ratio: 0.8, permanent: true } });
  pushBattleLog(scene, `${scene.targetName}获得时空隧道第20层加护：减伤20%，命中率提升100%，受到火系技能攻击时伤害减少80%。`);
  return true;
};
const applyTimeTunnelFloor25TargetBuff = (scene) => {
  if (!scene || scene.mode !== "timeTunnel") return false;
  const meta = scene.timeTunnelMeta || {};
  const floor = Math.max(1, Math.floor(Number(meta.floor) || 1));
  const dexId = Number(scene.targetDexId) || 0;
  if (floor !== 25 || !TIME_TUNNEL_FLOOR_25_BONUS_DEX_IDS.has(dexId)) return false;
  addTimedEffect(scene, "target", { kind: "damageReduction", turns: 999, data: { ratio: 0.25, permanent: true } });
  addTimedEffect(scene, "target", { kind: "targetElementDamageBoost", turns: 999, data: { targetElement: "机械系", factor: 1.5, permanent: true } });
  pushBattleLog(scene, `${scene.targetName}获得时空隧道第25层加护：整场减伤25%，对机械系亚比伤害提升50%。`);
  return true;
};
const applyBossChainFinalBuff = (scene) => {
      const meta = scene && scene.bossChainMeta;
      if (!scene || !meta || !meta.finalActive) return;
      const ratio = clamp(Number(meta.finalDamageReduction) || 0, 0, 1);
      const turns = Math.max(1, Math.floor(Number(meta.finalDamageReductionTurns) || 3));
      if (ratio <= 0) return;
      addTimedEffect(scene, "target", { kind: "damageReduction", turns, data: { ratio, stackWithChallenge: true } });
      pushBattleLog(scene, `${scene.targetName}登场后获得减伤${Math.round(ratio * 100)}%，持续${turns}回合。`);
    };
    const switchBossChainNextTarget = (scene) => {
      if (!scene || scene.mode !== "boss" || !scene.bossChainMeta) return false;
      const meta = scene.bossChainMeta;
      if (meta.finalActive) return false;
      const entry = dexById.get(Number(meta.finalDexId) || 0);
      if (!entry) return false;
      const target = buildBattleTarget({
        entry,
        level: Math.max(1, Math.floor(Number(meta.level) || 100)),
        forceHpRace500: false,
        hpRaceMultiplier: Number(meta.hpRaceMultiplier) || 15,
        battleBoostRatio: Number(meta.statBoostRatio) || 0,
        talentOverride: createUniformTalent60(),
        studyOverride: createGuardianStudy(),
        displayName: entry.name,
        displayImage: petBattleSvgImage(entry.dexId, "target", "idle") || entry.image
      });
      if (!target) return false;
      const fixedTargetMaxHp = Math.max(0, Math.floor(Number(scene.guardianMeta && scene.guardianMeta.fixedHp) || Number(meta.fixedHp) || 0));
      if (fixedTargetMaxHp > 0) {
        target.ability = { ...(target.ability || {}), hp: fixedTargetMaxHp };
        target.ability.total = calcAbilityTotal(target.ability);
        target.hp = fixedTargetMaxHp;
        target.maxHp = fixedTargetMaxHp;
      }
      meta.finalActive = true;
      scene.targetDexId = target.dexId;
      scene.targetName = target.name;
      scene.targetImage = target.image;
      scene.targetStaticImage = target.staticImage || target.image;
      scene.targetLevel = target.level;
      scene.targetElement = target.element;
      scene.targetSubElement = target.subElement;
      scene.targetAbility = target.ability;
      scene.targetHp = target.hp;
      scene.targetMaxHp = target.maxHp;
      scene.uiTargetHp = target.hp;
      scene.uiTargetMaxHp = target.maxHp;
      scene.targetBattleItemId = normalize(target.battleItemId);
      scene.targetQixingSealLevel = 1;
      scene.targetState = normalizeBattleState(target.battleState);
      scene.targetSkills = target.skills;
      scene.globalTimedEffects = [];
      scene.fxTargetDefeated = false;
      scene.fxTargetShake = false;
      scene.damageOnTarget = "";
      scene.healOnTarget = "";
      scene.damageTagOnTarget = "";
      scene.comboHitsOnTarget = [];
      scene.comboTotalOnTarget = "";
      resetBattleAnimIdle(scene);
      pushBattleLog(scene, `${meta.firstName || "前置BOSS"}已被击败，${target.name} Lv.${target.level} 登场。`);
      applyBossChainFinalBuff(scene);
      return true;
    };
    const buildTimeTunnelTarget = (enemy) => {
      const dexId = Number(enemy && enemy.dexId) || 0;
      const entry = dexById.get(dexId);
      if (!entry) return null;
      const species = getSpeciesByDexId(entry.dexId, entry.name);
      const baseRace = species && species.raceStats ? species.raceStats : createZeroStats();
      const study = createGuardianStudy();
      study.hp = 0;
      const raceHp = Math.max(1, Math.round(safeNonNegInt(baseRace.hp) * 5));
      const target = buildBattleTarget({
        entry,
        level: clamp(Number(enemy && enemy.level) || 1, 1, 100),
        talentOverride: createUniformTalent30(),
        studyOverride: study,
        displayName: entry.name,
        displayImage: getTimeTunnelBattleAnimSrc(entry.dexId),
        forceHpRace500: false,
        hpRaceOverride: raceHp,
        battleBoostRatio: 0
      });
      return applyTimeTunnelTargetSkills(target, entry);
    };
    const hasTimeTunnelEnvironmentElement = (unit, environmentElement) => {
      const envElement = normalizeElementName(environmentElement);
      if (!envElement) return false;
      return normalizeElementName(unit && unit.element) === envElement || normalizeElementName(unit && unit.subElement) === envElement;
    };
    const applyTimeTunnelEnvironmentBuffToUnit = (unit, environmentElement) => {
      if (!unit || !hasTimeTunnelEnvironmentElement(unit, environmentElement)) return unit;
      const nextAbility = { ...(unit.ability || {}) };
      BATTLE_ABILITY_KEYS.forEach((key) => {
        if (Number(nextAbility[key]) > 0) nextAbility[key] = Math.floor(Number(nextAbility[key]) * 1.1);
      });
      unit.ability = nextAbility;
      unit.maxHp = Math.max(1, Number(nextAbility.hp) || Number(unit.maxHp) || 1);
      unit.hp = unit.maxHp;
      unit._timeTunnelEnvironmentBuffed = true;
      return unit;
    };
    const openTimeTunnelDoor = (scene) => {
      if (!scene) return;
      const floor = Math.max(1, Math.floor(Number(scene.floor) || 1));
      if (floor >= TIME_TUNNEL_OPEN_MAX_FLOOR) return;
      timeTunnelDoorScene.value = {
        floor,
        environment: scene.environment || null,
        enemies: Array.isArray(scene.enemies) ? scene.enemies : [],
        nextFloor: floor + 1
      };
    };
    const enterTimeTunnelNextFloor = () => {
      const door = timeTunnelDoorScene.value;
      if (!door) return;
      timeTunnelDoorScene.value = null;
      const nextFloor = Math.max(1, Math.floor(Number(door.nextFloor) || 1));
      if (nextFloor > TIME_TUNNEL_OPEN_MAX_FLOOR) return showToast("下一层尚未开放。");
      timeTunnelSelectedFloor.value = nextFloor;
      showTimeTunnelPanel.value = false;
      const scene = buildTimeTunnelFloorScene(nextFloor);
      if (!scene) return;
      timeTunnelEnvironmentScene.value = scene;
      showTimeTunnelEnvironmentPanel.value = true;
      playSceneBgm(TIME_TUNNEL_BGM_SRC);
    };
    const setupBattleScene = ({ targetEntry, targetLevel, forceTargetHpRace500 = false, targetHpRaceOverride = null, targetHpRaceMultiplier = null, targetTalentOverride = null, targetStudyOverride = null, mode = "normal", guardianMeta = null, autoBattleMeta = null, timeTunnelMeta = null }) => {
      battlePrepareTrace("setup-start", { mode, targetDexId: Number(targetEntry && targetEntry.dexId) || 0, targetLevel });
      const team = bagPets.value.map((pet) => buildBattleUnitFromPet(pet)).filter(Boolean);
      battlePrepareTrace("team-built", {
        count: team.length,
        firstDexId: Number(team[0] && team[0].dexId) || 0,
        firstVisualDexId: Number(team[0] && team[0].battleVisualDexId) || 0,
        firstStaticDexId: Number(team[0] && team[0].battleStaticDexId) || Number(team[0] && team[0].staticDexId) || 0
      });
      if (team.length === 0) {
        showToast("背包中没有可出战亚比。");
        return false;
      }
      if (mode === "timeTunnel" && timeTunnelMeta && timeTunnelMeta.environmentElement) {
        team.forEach((unit) => applyTimeTunnelEnvironmentBuffToUnit(unit, timeTunnelMeta.environmentElement));
      }
      const bossChainRule = mode === "boss"
        ? BOSS_CHAIN_CHALLENGE_BY_FINAL_DEX_ID[Number(guardianMeta && guardianMeta.bossChainFinalDexId) || 0] || null
        : null;
      const effectiveTargetEntry = bossChainRule
        ? (dexById.get(Number(bossChainRule.firstDexId) || 0) || targetEntry)
        : targetEntry;
      const target = mode === "timeTunnel"
        ? buildTimeTunnelTarget({ dexId: Number(targetEntry && targetEntry.dexId) || 0, level: targetLevel })
        : buildBattleTarget({
          entry: effectiveTargetEntry,
          level: targetLevel,
          forceHpRace500: forceTargetHpRace500,
          hpRaceOverride: targetHpRaceOverride,
          hpRaceMultiplier: targetHpRaceMultiplier,
          battleBoostRatio: Number(guardianMeta && guardianMeta.statBoostRatio) || 0,
          talentOverride: targetTalentOverride,
          studyOverride: targetStudyOverride,
          displayName: mode === "normal" ? effectiveTargetEntry.name : effectiveTargetEntry.name,
          displayImage: petBattleSvgImage(effectiveTargetEntry.dexId, "target", "idle") || effectiveTargetEntry.image
        });
      if (!target) {
        showToast("挑战目标缺少可用种族值或技能数据。");
        return false;
      }
      battlePrepareTrace("target-built", { targetDexId: Number(target.dexId) || 0, skillCount: Array.isArray(target.skills) ? target.skills.length : 0 });
      if (mode === "timeTunnel" && timeTunnelMeta && timeTunnelMeta.environmentElement) {
        applyTimeTunnelEnvironmentBuffToUnit(target, timeTunnelMeta.environmentElement);
      }
      if (guardianMeta && guardianMeta.weeklyBoss) {
        target.battleItemId = QIXING_SEAL_ITEM_ID;
      }
      const fixedTargetMaxHp = (mode === "boss" || mode === "weeklyBoss") ? Math.max(0, Math.floor(Number(guardianMeta && guardianMeta.fixedHp) || 0)) : 0;
      if (fixedTargetMaxHp > 0) {
        target.ability = { ...(target.ability || {}), hp: fixedTargetMaxHp };
        target.ability.total = calcAbilityTotal(target.ability);
        target.hp = fixedTargetMaxHp;
        target.maxHp = fixedTargetMaxHp;
      }
      const deviceExpMultiplier = mode !== "study" && consumeItemCount("double_exp_device", 1) ? 2 : 1;
      const rewardEventActive = mode !== "study" && Boolean(isDoubleRewardTime.value);
      const rewardEventMultiplier = rewardEventActive ? 2 : 1;
      const expMultiplier = deviceExpMultiplier * rewardEventMultiplier;
      battleLogCollapsed.value = isAndroidWebView;
      battleScene.value = {
        open: true,
        visualReady: false,
        ended: false,
        win: false,
        mode,
        battleSpeed: clampBattleSpeed(battleSpeed.value),
        guardianMeta: guardianMeta || null,
        studyMeta: mode === "study" ? (guardianMeta || null) : null,
        timeTunnelMeta: timeTunnelMeta || null,
        autoBattleMeta: autoBattleMeta || null,
        deviceExpMultiplier,
        rewardEventActive,
        rewardEventMultiplier,
        expMultiplier,
        team,
        currentAttackerId: team[0].id,
        attackerDexId: Number(team[0].dexId) || 0,
        attackerBaseDexId: Number(team[0].baseDexId) || Number(team[0].dexId) || 0,
        attackerName: team[0].name,
        attackerImage: battleUnitBattleImage(team[0]),
        attackerStaticImage: team[0].skinActivated ? battleUnitStaticImage(team[0]) : battleUnitOriginalStaticImage(team[0]),
        attackerLevel: team[0].level,
        attackerElement: team[0].element,
        attackerSubElement: team[0].subElement,
        attackerBattleItemId: normalize(team[0].battleItemId),
        attackerQixingSealLevel: normalize(team[0].battleItemId) === QIXING_SEAL_ITEM_ID ? clamp(Math.floor(Number(team[0].qixingSealLevel) || 1), 1, QIXING_SEAL_MAX_LEVEL) : 1,
        attackerQixingSealTraitKey: normalize(team[0].qixingSealTraitKey),
        attackerBattleVisualDexId: Number(team[0].battleVisualDexId) || Number(team[0].dexId) || 0,
        attackerOriginalBattleVisualDexId: Number(team[0].originalBattleVisualDexId) || Number(team[0].battleVisualDexId) || Number(team[0].dexId) || 0,
        attackerSkinBattleVisualDexId: Number(team[0].skinBattleVisualDexId) || 0,
        attackerSkinActivated: Boolean(team[0].skinActivated && Number(team[0].skinBattleVisualDexId) > 0),
        attackerSkinKey: normalize(team[0].skinKey),
        attackerPreSkinDexId: 0,
        attackerTransformingSkin: false,
        attackerTransformFx: "",
        attackerTransformSeq: 0,
        attackerTransformUnitId: "",
        attackerAbility: team[0].ability,
        attackerHp: team[0].hp,
        attackerMaxHp: team[0].maxHp,
        uiAttackerHp: team[0].hp,
        uiAttackerMaxHp: team[0].maxHp,
        attackerState: normalizeBattleState(team[0].battleState),
        targetDexId: target.dexId,
        targetName: target.name,
        targetImage: target.image,
        targetStaticImage: target.staticImage || target.image,
        targetLevel: target.level,
        targetElement: target.element,
        targetSubElement: target.subElement,
        targetBattleItemId: normalize(target.battleItemId),
        targetQixingSealLevel: normalize(target.battleItemId) === QIXING_SEAL_ITEM_ID ? clamp(Math.floor(Number(guardianMeta && guardianMeta.qixingSealLevel) || WEEKLY_BOSS_CONFIG.qixingSealLevel || 1), 1, QIXING_SEAL_MAX_LEVEL) : 1,
        targetQixingSealTraitKey: QIXING_TRAIT_KEYS.LEGACY,
        targetChallengeDamageReductionRatio: (mode === "boss" || mode === "weeklyBoss") ? clamp(Number(guardianMeta && guardianMeta.damageReductionRatio) || 0, 0, 0.95) : 0,
        targetAbility: target.ability,
        targetHp: target.hp,
        targetMaxHp: target.maxHp,
        uiTargetHp: target.hp,
        uiTargetMaxHp: target.maxHp,
        targetState: normalizeBattleState(target.battleState),
        globalTimedEffects: [],
        teamTimedEffects: [],
        skills: team[0].skills,
        targetSkills: target.skills,
        targetFixedSkillCycleKey: "",
        targetFixedSkillCycleCursor: 0,
        logs: [],
        turnCount: 1,
        expGain: 0,
        unlockText: "",
        summary: "",
        lastDamage: 0,
        lastElementFactor: 1,
        oncePerBattleSkillKeys: [],
        diminishingSkillUseCounts: {},
        fxSkillText: "",
        fxAttackerSkillText: "",
        fxTargetSkillText: "",
        fxDamageText: "",
        fxAttackerShake: false,
        fxTargetShake: false,
        fxAttackerDefeated: false,
        fxTargetDefeated: false,
        isActing: false,
        damageOnAttacker: "",
        damageOnTarget: "",
        healOnAttacker: "",
        healOnTarget: "",
        damageTagOnAttacker: "",
        damageTagOnTarget: "",
        actionNoticeOnAttacker: "",
        actionNoticeOnTarget: "",
        critOnAttacker: false,
        critOnTarget: false,
        skillEffectFx: null,
        ppOnAttacker: "",
        ppOnTarget: "",
        comboHitsOnAttacker: [],
        comboHitsOnTarget: [],
        comboTotalOnAttacker: "",
        comboTotalOnTarget: "",
        comboTotalDelayOnAttacker: 0,
        comboTotalDelayOnTarget: 0,
        statusEffectFx: null,
        moraleEffectFx: null,
        stageChangeFx: { attacker: null, target: null },
        forceDefeatSide: "",
        forceDefeatReason: "",
        pendingForcedSwitchTargetAction: false,
        pendingForcedSwitchFinishTurn: false,
        pendingEndTurnTick: false,
        pendingFinish: false
      };
      battlePrepareTrace("scene-created", {
        attackerImage: battleScene.value.attackerImage,
        attackerStaticImage: battleScene.value.attackerStaticImage,
        targetImage: battleScene.value.targetImage
      });
      if (mode === "boss") {
        const finalDexId = Number(guardianMeta && guardianMeta.bossChainFinalDexId) || 0;
        const chainRule = BOSS_CHAIN_CHALLENGE_BY_FINAL_DEX_ID[finalDexId] || null;
        if (chainRule) {
          battleScene.value.bossChainMeta = {
            finalDexId,
            firstDexId: Number(chainRule.firstDexId) || 0,
            firstName: chainRule.firstName || "",
            finalName: chainRule.finalName || "",
            finalActive: false,
            level: Math.max(1, Math.floor(Number(targetLevel) || 100)),
            hpRaceMultiplier: Math.max(1, Number(targetHpRaceMultiplier) || 15),
            statBoostRatio: Number(guardianMeta && guardianMeta.statBoostRatio) || 0,
            fixedHp: Math.max(0, Math.floor(Number(guardianMeta && guardianMeta.fixedHp) || 0)),
            finalDamageReduction: Number(chainRule.finalDamageReduction) || 0,
            finalDamageReductionTurns: Math.max(1, Math.floor(Number(chainRule.finalDamageReductionTurns) || 3))
          };
        }
      }
      battleActionTab.value = "skills";
      battlePrepareTrace("before-idle", { useActionSvg: BATTLE_IDLE_USES_ACTION_SVG });
      resetBattleAnimIdle(battleScene.value);
      battlePrepareTrace("after-idle", {
        attackerImage: battleScene.value.attackerImage,
        targetImage: battleScene.value.targetImage
      });
      const startLog = mode === "guardian" ? "守护者挑战开始。按速度和技能优先度决定先手。" : (mode === "boss" ? "BOSS挑战开始。按速度和技能优先度决定先手。" : (mode === "timeTunnel" ? `时空隧道第${timeTunnelMeta && timeTunnelMeta.floor ? timeTunnelMeta.floor : 1}层开始。击败本层全部亚比才能开启下一层。` : (mode === "study" ? `${guardianMeta && guardianMeta.label ? guardianMeta.label : ""}学习力战场开始。按速度和技能优先度决定先手。` : "对战开始。按速度和技能优先度决定先手。")));
      pushBattleLog(battleScene.value, startLog);
      pushQixingSealBattleEntryLog(battleScene.value, "attacker");
      pushQixingSealBattleEntryLog(battleScene.value, "target");
      if (deviceExpMultiplier > 1) pushBattleLog(battleScene.value, "双倍经验器生效，本场胜利经验翻倍。");
      if (rewardEventActive) pushBattleLog(battleScene.value, "20:00—22:00双倍奖励生效，本场胜利经验与H币翻倍，可与双倍经验器叠加。");
      if (autoBattleMeta) pushBattleLog(battleScene.value, `自动战斗仪生效，本轮剩余自动挑战 ${Math.max(0, Number(autoBattleMeta.remainingAfterStart) || 0)} 次。`);
      if (mode === "timeTunnel" && timeTunnelMeta && timeTunnelMeta.environmentElement) {
        pushBattleLog(battleScene.value, `${timeTunnelMeta.environmentName || "时空环境"}展开，${timeTunnelMeta.environmentElement}亚比全属性数值提升10%。`);
      }
      if (mode === "timeTunnel") applyTimeTunnelFloor20TargetBuff(battleScene.value);
      if (mode === "timeTunnel") applyTimeTunnelFloor25TargetBuff(battleScene.value);
      if ((mode === "boss" || mode === "weeklyBoss") && battleScene.value.targetChallengeDamageReductionRatio > 0) {
        pushBattleLog(battleScene.value, `${battleScene.value.targetName}获得挑战减伤：普通/特殊攻击造成的伤害减少${Math.round(battleScene.value.targetChallengeDamageReductionRatio * 100)}%。`);
      }
      pushBattleLog(battleScene.value, "第1回合开始。");
      playBattleBgm();
      if (autoBattleMeta) scheduleAutoBattlePlayerAction(battleScene.value, 650);
      battlePrepareTrace("setup-done", { mode, autoBattle: Boolean(autoBattleMeta) });
      nextTick(() => {
        battlePrepareTrace("battle-dom-nextTick", { open: Boolean(battleScene.value && battleScene.value.open) });
        const traceAfterPaint = () => {
          if (battleScene.value && battleScene.value.open) battleScene.value.visualReady = true;
          battlePrepareTrace("battle-dom-rAF", { open: Boolean(battleScene.value && battleScene.value.open), visualReady: Boolean(battleScene.value && battleScene.value.visualReady) });
        };
        if (typeof requestAnimationFrame === "function") requestAnimationFrame(traceAfterPaint);
        else setTimeout(traceAfterPaint, 16);
      });
      return true;
    };
    const canCastBattleSkill = (skillName) => {
      const scene = battleScene.value;
      if (!scene || !scene.open || scene.ended || scene.isActing || scene.pendingFinish) return false;
      const key = normalizeSkillKey(skillName);
      const skill = battleSceneSkills.value.find((s) => normalizeSkillKey(s.name) === key);
      if (hasUsedOncePerBattleSkill(scene, "attacker", skill || key)) return false;
      return Boolean(skill && skill.pp > 0);
    };
    const pickAutoBattleSkill = (scene) => {
      if (!scene || !Array.isArray(scene.skills)) return null;
      const usable = scene.skills.filter((s) => s && Number(s.pp) > 0 && !hasUsedOncePerBattleSkill(scene, "attacker", s));
      if (usable.length <= 0) return null;
      return usable
        .slice()
        .sort((a, b) => averageSkillEffectPower(b, scene, "attacker", "target") - averageSkillEffectPower(a, scene, "attacker", "target"))[0] || usable[0];
    };
    const scheduleAutoBattlePlayerAction = (scene = battleScene.value, delayMs = 500) => {
      if (!scene || !scene.autoBattleMeta || !autoBattleRun.value) return;
      setTimeout(() => {
        const live = battleScene.value;
        if (!live || live !== scene || live.ended || live.pendingFinish || live.isActing || !live.autoBattleMeta || !autoBattleRun.value) return;
        const skill = pickAutoBattleSkill(live);
        if (!skill) {
          stopAutoBattleRun("我方可用技能PP不足，自动战斗已停止。");
          pushBattleLog(live, "我方可用技能PP不足，自动战斗已停止，可手动使用道具或换宠。");
          live.isActing = false;
          return;
        }
        castBattleSkill(skill.name);
      }, battleSceneDelayMs(scene, Math.max(0, Number(delayMs) || 0), 0));
    };
    const scheduleTurnSequencePlayerAction = (scene = battleScene.value, delayMs = 500) => {
      if (!scene || !getTurnSequenceAttackEffect(scene, "attacker")) return;
      setTimeout(() => {
        const live = battleScene.value;
        if (!live || live !== scene || live.ended || live.pendingFinish || live.isActing) return;
        const fx = getTurnSequenceAttackEffect(live, "attacker");
        const skillName = normalize(fx && fx.data && fx.data.skill && fx.data.skill.name);
        if (!skillName) return;
        castBattleSkill(skillName);
      }, battleSceneDelayMs(scene, Math.max(0, Number(delayMs) || 0), 0));
    };
    const playTimeTunnelMoraleFx = (scene) => {
      if (!scene) return;
      scene.actionNoticeOnTarget = "斗志激发";
      showBattleMoraleStatusFx(scene, "target", "斗志");
    };
    const triggerChallengeMoraleIfNeeded = (scene) => {
      if (!scene || scene.ended || scene.pendingFinish) return false;
      const turn = Math.max(1, Math.floor(Number(scene.turnCount) || 1));
      if (scene.mode === "weeklyBoss") {
        if (turn <= 1 || turn % 3 !== 0) return false;
        const meta = scene.guardianMeta && typeof scene.guardianMeta === "object" ? scene.guardianMeta : {};
        const delta = Math.max(0, Math.floor(Number(meta.weeklyBossRandomStageDelta) || 0));
        if (delta <= 0) return false;
        const keys = ALL_ABILITY_STAGE_KEYS.slice();
        const picked = keys[Math.floor(Math.random() * keys.length)] || keys[0];
        const changed = applyStageDelta(scene, "target", [picked], delta);
        const statusPool = ["poison", "burn", "freeze", "weak", "bind", "paralyze", "fear", "sleep", "confuse"];
        let statusText = "";
        if (meta.weeklyBossRandomStatus) {
          const attackerState = getSideState(scene, "attacker");
          const options = statusPool.filter((status) => !isStatusImmuneByElement(scene, "attacker", status) && !hasStatusShield(scene, "attacker", status));
          if (options.length > 0) {
            const status = options[Math.floor(Math.random() * options.length)];
            applyStatusTurns(attackerState, status, defaultStatusTurns(status));
            statusText = `，并使${scene.attackerName}陷入${statusLabel(status)}${attackerState.statuses[status]}回合`;
          }
        }
        scene.actionNoticeOnTarget = "源力涌动";
        showBattleMoraleStatusFx(scene, "target", "源力涌动");
        if (changed.length > 0 || statusText) pushBattleLog(scene, `第${turn}回合，${scene.targetName}源力涌动，随机提升${delta}级：${changed.map((k) => battleStatLabel(k)).join("、") || battleStatLabel(picked)}${statusText}。`);
        return true;
      }
      if (turn <= 1 || turn % CHALLENGE_MORALE_INTERVAL_TURNS !== 0) return false;
      if (scene.mode !== "boss") return false;
      const delta = Math.max(0, Math.floor(Number(scene.guardianMeta && scene.guardianMeta.moraleDelta) || 0));
      if (delta <= 0) return false;
      const label = normalize(scene.guardianMeta && scene.guardianMeta.moraleLabel) || (delta > 1 ? "狂暴斗志" : "斗志");
      const changed = applyStageDelta(scene, "target", ALL_ABILITY_STAGE_KEYS, delta);
      if (changed.length <= 0) return false;
      scene.actionNoticeOnTarget = `${label}激发`;
      showBattleMoraleStatusFx(scene, "target", label);
      pushBattleLog(scene, `第${turn}回合，${scene.targetName}激发${label}，全属性提升${delta}级。`);
      return true;
    };
    const switchTimeTunnelNextTarget = (scene) => {
      if (!scene || scene.mode !== "timeTunnel" || !scene.timeTunnelMeta) return false;
      const meta = scene.timeTunnelMeta;
      const enemies = Array.isArray(meta.enemies) ? meta.enemies : [];
      const nextIndex = Math.max(0, Math.floor(Number(meta.index) || 0)) + 1;
      const nextEnemy = enemies[nextIndex];
      if (!nextEnemy) return false;
      const target = buildTimeTunnelTarget(nextEnemy);
      if (!target) return false;
      if (meta.environmentElement) applyTimeTunnelEnvironmentBuffToUnit(target, meta.environmentElement);
      meta.index = nextIndex;
      scene.targetDexId = target.dexId;
      scene.targetName = target.name;
      scene.targetImage = target.image;
      scene.targetStaticImage = target.staticImage || target.image;
      scene.targetLevel = target.level;
      scene.targetElement = target.element;
      scene.targetSubElement = target.subElement;
      scene.targetAbility = target.ability;
      scene.targetHp = target.hp;
      scene.targetMaxHp = target.maxHp;
      scene.uiTargetHp = target.hp;
      scene.uiTargetMaxHp = target.maxHp;
      scene.targetState = normalizeBattleState(target.battleState);
      applyStageDelta(scene, "target", ALL_ABILITY_STAGE_KEYS, 1);
      scene.targetSkills = target.skills;
      scene.globalTimedEffects = [];
      scene.fxTargetDefeated = false;
      scene.fxTargetShake = false;
      scene.damageOnTarget = "";
      scene.healOnTarget = "";
      scene.damageTagOnTarget = "";
      scene.comboHitsOnTarget = [];
      scene.comboTotalOnTarget = "";
      resetBattleAnimIdle(scene);
      pushBattleLog(scene, `${target.name} Lv.${target.level} 上场，斗志激发，全属性提升1级。`);
      applyTimeTunnelFloor20TargetBuff(scene);
      applyTimeTunnelFloor25TargetBuff(scene);
      if (Math.max(1, Math.floor(Number(meta.floor) || 1)) === 25 && Number(target.dexId) === 382) {
        addTimedEffect(scene, "target", { kind: "damageBoost", turns: 999, data: { factor: 1.4, permanent: true } });
        pushBattleLog(scene, `${target.name}承接暗影甲龙的时空余焰，额外获得伤害提升40%。`);
      }
      playTimeTunnelMoraleFx(scene);
      return true;
    };
    const scheduleBattleDefeatResolution = (scene, defeatedSide, reason = "") => {
      if (!scene || scene.ended || scene.pendingFinish) return;
      scene.pendingFinish = true;
      scene.pendingEndTurnTick = false;
      scene.isActing = true;
      if (scene._defeatExitTimer) clearTimeout(scene._defeatExitTimer);
      if (scene._defeatResolutionTimer) clearTimeout(scene._defeatResolutionTimer);
      const resolveAfterExit = () => {
        const live = battleScene.value;
        if (!live || live !== scene || scene.ended) return;
        clearBattleFloatTextIfExpired(scene, true);
        scene.skillEffectFx = null;
        resetBattleVisualHold(scene);
        scene.pendingFinish = false;
        if (defeatedSide === "target") {
          if (tryGuardianExtraLife(scene)) {
            scene.isActing = false;
            scene.pendingEndTurnTick = false;
            pushBattleLog(scene, `第${scene.turnCount}回合继续。`);
            return;
          }
          if (switchBossChainNextTarget(scene)) {
            scene.isActing = false;
            scene.pendingEndTurnTick = false;
            pushBattleLog(scene, `第${scene.turnCount}回合继续。`);
            return;
          }
          if (switchTimeTunnelNextTarget(scene)) {
            scene.isActing = false;
            scene.pendingEndTurnTick = false;
            pushBattleLog(scene, `第${scene.turnCount}回合继续。`);
            return;
          }
          finalizeBattleScene(scene, true, reason);
          return;
        }
        if (Array.isArray(scene.team)) {
          const idx = scene.team.findIndex((u) => u.id === scene.currentAttackerId);
          if (idx >= 0) scene.team[idx].hp = 0;
        }
        const next = (scene.team || []).find((u) => u.hp > 0 && u.id !== scene.currentAttackerId);
        if (next) {
          if (scene.autoBattleMeta) stopAutoBattleRun("我方亚比倒下，需要手动换宠，自动战斗已停止。");
          scene.pendingForcedSwitchFinishTurn = !scene.pendingForcedSwitchTargetAction;
          pushBattleLog(scene, `${scene.attackerName} 倒下，请选择下一只上场亚比。`);
          showSwitchPanel.value = true;
          switchPanelMode.value = "forced";
          scene.isActing = false;
          return;
        }
        finalizeBattleScene(scene, false, reason || "我方背包亚比全部倒下");
      };
      const showDefeatExit = () => {
        const live = battleScene.value;
        if (!live || live !== scene || scene.ended) return;
        if (defeatedSide === "target") {
          scene.fxTargetShake = false;
          scene.fxTargetDefeated = true;
        }
        if (defeatedSide === "attacker") {
          scene.fxAttackerShake = false;
          scene.fxAttackerDefeated = true;
        }
        markBattleDefeatVisualHoldMs(scene, BATTLE_DEFEAT_EXIT_DURATION_MS);
        runAfterBattleVisuals(scene, resolveAfterExit, BATTLE_DEFEAT_EXIT_DURATION_MS);
      };
      runAfterBattleVisuals(scene, showDefeatExit, BATTLE_DEFEAT_EXIT_START_DELAY_MS);
    };
    const resolveBattleDefeatIfNeeded = (scene, reason = "") => {
      if (!scene || scene.ended || scene.pendingFinish) return false;
      const applyDestinyBondIfNeeded = (defeatedSide) => {
        const defeatedState = getSideState(scene, defeatedSide);
        const hasDestinyBond = (defeatedState.timedEffects || []).some((e) => normalize(e && e.kind) === "destinyBond" && Math.max(0, Number(e && e.turns) || 0) > 0);
        if (!hasDestinyBond) return;
        const opponentSide = defeatedSide === "attacker" ? "target" : "attacker";
        if (opponentSide === "attacker") {
          scene.attackerHp = 0;
          applyBattleDamageToActivePet(scene);
        } else {
          scene.targetHp = 0;
        }
        syncBattleUiHpForSide(scene, opponentSide);
        pushBattleLog(scene, `${defeatedSide === "attacker" ? scene.attackerName : scene.targetName}的同归于尽生效，${opponentSide === "attacker" ? scene.attackerName : scene.targetName}也失去战斗能力。`);
      };
      if (scene.forceDefeatSide) {
        const side = scene.forceDefeatSide;
        const forceReason = normalize(scene.forceDefeatReason);
        if (tryFullRestoreOnDefeatThisTurn(scene, side)) return false;
        scene.forceDefeatSide = "";
        scene.forceDefeatReason = "";
        if (side === "attacker" && (Number(scene.targetHp) || 0) <= 0) {
          scene.targetHp = 0;
          scheduleBattleDefeatResolution(scene, "target", reason);
          return true;
        }
        if (side === "target" && (Number(scene.attackerHp) || 0) <= 0) {
          scene.attackerHp = 0;
          applyBattleDamageToActivePet(scene);
          scheduleBattleDefeatResolution(scene, "attacker", reason || "我方背包亚比全部倒下");
          return true;
        }
        if (side === "attacker") {
          if (forceReason === "selfKo" && scene._targetActionPendingAfterCurrentAttacker && Math.max(0, Number(scene.targetHp) || 0) > 0) {
            scene.pendingForcedSwitchTargetAction = true;
          }
          scheduleBattleDefeatResolution(scene, "attacker", reason || "我方背包亚比全部倒下");
          return true;
        }
        scheduleBattleDefeatResolution(scene, "target", reason);
        return true;
      }
      if ((Number(scene.attackerHp) || 0) <= 0) tryFullRestoreOnDefeatThisTurn(scene, "attacker");
      if ((Number(scene.targetHp) || 0) <= 0) tryFullRestoreOnDefeatThisTurn(scene, "target");
      const attackerHp = Number(scene.attackerHp) || 0;
      const targetHp = Number(scene.targetHp) || 0;
      if (attackerHp <= 0) {
        scene.attackerHp = 0;
        applyBattleDamageToActivePet(scene);
        applyDestinyBondIfNeeded("attacker");
        if (Number(scene.targetHp) <= 0) {
          scene.targetHp = 0;
          scheduleBattleDefeatResolution(scene, "target", reason);
          return true;
        }
        scheduleBattleDefeatResolution(scene, "attacker", reason || "我方背包亚比全部倒下");
        return true;
      }
      if (targetHp <= 0) {
        scene.targetHp = 0;
        applyDestinyBondIfNeeded("target");
        if (Number(scene.attackerHp) <= 0) {
          scene.attackerHp = 0;
          applyBattleDamageToActivePet(scene);
        }
        scheduleBattleDefeatResolution(scene, "target", reason);
        return true;
      }
      return false;
    };
    const fixedBossSkillDexId = (scene) => {
      if (!scene) return 0;
      if (scene.mode === "weeklyBoss") return Number(WEEKLY_BOSS_CONFIG.dexId) || 0;
      return Number(scene.targetDexId) || 0;
    };
    const pickTargetSkill = (scene, candidates) => {
      let list = Array.isArray(candidates) ? candidates.filter((s) => s && s.pp > 0) : [];
      const findTargetSkillByName = (skillName) => {
        const name = normalize(skillName);
        return (Array.isArray(scene && scene.targetSkills) ? scene.targetSkills : []).find((s) => normalize(s && s.name) === name) || null;
      };
      const findUsableSkillByName = (skillName, refill = false) => {
        const hit = list.find((s) => normalize(s && s.name) === normalize(skillName)) || null;
        if (hit) return hit;
        if (!refill) return null;
        const raw = findTargetSkillByName(skillName);
        if (!raw) return null;
        raw.pp = Math.max(1, Number(raw.ppMax) || Number(raw.pp) || 1);
        if (!list.includes(raw)) list.push(raw);
        pushBattleLog(scene, `${scene.targetName}蓄势完成，固定释放${raw.name}。`);
        return raw;
      };
      const pickRandomPoolSkill = (pool) => {
        if (!Array.isArray(pool) || pool.length === 0) return null;
        const usablePoolSkills = pool
          .map((skillName) => findUsableSkillByName(skillName, true))
          .filter(Boolean);
        if (usablePoolSkills.length === 0) return null;
        return usablePoolSkills[Math.floor(Math.random() * usablePoolSkills.length)];
      };
      if (scene && scene.mode === "timeTunnel" && Number(scene.targetDexId) === 461) {
        const fixedSkillNames = TIME_TUNNEL_EXTRA_SKILLS_BY_DEX_ID[461].map((skill) => normalize(skill && skill.name));
        const preferred = list.filter((s) => fixedSkillNames.includes(normalize(s && s.name)));
        if (preferred.length > 0) return preferred[Math.floor(Math.random() * preferred.length)];
      }
      if (scene && scene.mode === "timeTunnel") {
        const cycle = TIME_TUNNEL_FIXED_SKILL_CYCLE_BY_DEX_ID[Number(scene.targetDexId) || 0];
        if (Array.isArray(cycle) && cycle.length > 0) {
          const turn = Math.max(1, Number(scene.turnCount) || 1);
          const fixed = findUsableSkillByName(cycle[(turn - 1) % cycle.length], true);
          if (fixed) return fixed;
        }
      }
      if (scene && (scene.mode === "boss" || scene.mode === "weeklyBoss")) {
        const targetDexId = fixedBossSkillDexId(scene);
        const poolSkill = pickRandomPoolSkill(BOSS_RANDOM_SKILL_POOL_BY_DEX_ID[targetDexId]);
        if (poolSkill) return poolSkill;
        const turn = Math.max(1, Number(scene.turnCount) || 1);
        const hpRatio = Math.max(0, Number(scene.targetHp) || 0) / Math.max(1, Number(scene.targetMaxHp) || 1);
        const forbiddenLowHpRules = Array.isArray(BOSS_LOW_HP_FORBIDDEN_SKILLS[targetDexId]) ? BOSS_LOW_HP_FORBIDDEN_SKILLS[targetDexId] : [];
        if (forbiddenLowHpRules.length > 0) {
          const forbiddenNames = new Set(forbiddenLowHpRules
            .filter((rule) => hpRatio < Math.max(0, Number(rule && rule.hpRatio) || 0))
            .map((rule) => normalize(rule && rule.skillName))
            .filter(Boolean));
          if (forbiddenNames.size > 0) {
            list = list.filter((s) => !forbiddenNames.has(normalize(s && s.name)));
          }
        }
        const lowHpRule = BOSS_LOW_HP_FIXED_SKILL[targetDexId];
        if (lowHpRule && hpRatio < lowHpRule.hpRatio) {
          const fixed = findUsableSkillByName(lowHpRule.skillName);
          if (fixed) return fixed;
        }
        const cycle = BOSS_FIXED_SKILL_CYCLE_BY_DEX_ID[targetDexId];
        if (Array.isArray(cycle) && cycle.length > 0) {
          const cycleKey = `${scene.mode}:${targetDexId}`;
          if (normalize(scene.targetFixedSkillCycleKey) !== cycleKey) {
            scene.targetFixedSkillCycleKey = cycleKey;
            scene.targetFixedSkillCycleCursor = 0;
          }
          const cursor = Math.max(0, Math.floor(Number(scene.targetFixedSkillCycleCursor) || 0));
          const fixed = findUsableSkillByName(cycle[cursor % cycle.length], true);
          if (fixed) {
            scene.targetFixedSkillCycleCursor = cursor + 1;
            return fixed;
          }
        }
        const intervalRule = BOSS_FIXED_SKILL_INTERVAL_BY_DEX_ID[targetDexId];
        if (intervalRule && Math.max(1, Math.floor(Number(intervalRule.interval) || 1)) > 0 && turn % Math.max(1, Math.floor(Number(intervalRule.interval) || 1)) === 0) {
          const fixed = findUsableSkillByName(intervalRule.skillName, true);
          if (fixed) return fixed;
        }
        const fixedName = BOSS_FIXED_SKILL_BY_TURN[targetDexId] && BOSS_FIXED_SKILL_BY_TURN[targetDexId][turn];
        const fixed = fixedName ? findUsableSkillByName(fixedName) : null;
        if (fixed) return fixed;
      }
      if (scene && scene.mode === "boss" && Math.max(1, Number(scene.turnCount) || 1) === 1) {
        const bossName = resolveBossName(scene.targetName);
        const fixedName = bossName === "骰子大王" ? "骰子炸弹" : "";
        const fixed = fixedName ? findUsableSkillByName(fixedName) : null;
        if (fixed) return fixed;
      }
      if (scene && (scene.mode === "guardian" || scene.mode === "boss")) {
        const safeList = list.filter((s) => {
          return !isSelfDestructiveSkillForChallengeAi(s);
        });
        list = safeList;
      }
      if (list.length <= 1) return list[0] || null;
      const isHardChallenge = scene && (scene.mode === "guardian" || scene.mode === "boss");
      if (!isHardChallenge) return list[Math.floor(Math.random() * list.length)];
      const maxPower = Math.max(...list.map((s) => Math.max(0, Number(s.power) || 0)), 0);
      const weightedPreferredRule = scene.mode === "boss" ? BOSS_WEIGHTED_PREFERRED_SKILL[Number(scene.targetDexId) || 0] : null;
      const weights = list.map((s) => {
        const power = Math.max(0, Number(s.power) || 0);
        const effects = parseSkillEffects(s);
        const selfBoostScore = effects.reduce((sum, e) => {
          const kind = normalize(e && e.kind);
          const target = normalize(e && e.target);
          if (target !== "self") return sum;
          if (kind === "stage") {
            const keys = Array.isArray(e.keys) ? e.keys : [];
            const usefulKeys = keys.filter((k) => ["atk", "spAtk", "def", "spDef", "speed", "accuracy", "critStage"].includes(normalize(k))).length;
            return sum + Math.max(0, Number(e.delta) || 0) * Math.max(1, usefulKeys);
          }
          if (kind === "critStage") return sum + Math.max(0, Number(e.delta) || 1);
          if (kind === "damageBoost") return sum + Math.max(1, Math.round(((Number(e.factor) || 1) - 1) * 8));
          return sum;
        }, 0);
        const powerScore = power > 0 && maxPower > 0 ? Math.pow(power / maxPower, 2) * 6 : 0;
        const baseWeight = Math.max(1, 1 + powerScore + selfBoostScore * 2.5);
        return weightedPreferredRule && normalize(s.name) === normalize(weightedPreferredRule.skillName)
          ? baseWeight * weightedPreferredRule.weightMultiplier
          : baseWeight;
      });
      const total = weights.reduce((sum, n) => sum + n, 0);
      let roll = Math.random() * total;
      for (let i = 0; i < list.length; i += 1) {
        roll -= weights[i];
        if (roll <= 0) return list[i];
      }
      return list[list.length - 1];
    };
    const useTargetAutoPpBean = (scene) => {
      if (!scene || !Array.isArray(scene.targetSkills)) return false;
      let restored = 0;
      scene.targetSkills.forEach((s) => {
        if (!s) return;
        const cur = Math.max(0, Number(s.pp) || 0);
        const mx = Math.max(1, Number(s.ppMax) || cur || 1);
        const next = mx;
        restored += Math.max(0, next - cur);
        s.pp = next;
        s.ppMax = Math.max(mx, next);
      });
      scene.ppOnTarget = `PP+${restored}`;
      markBattleFloatText(scene);
      pushBattleLog(scene, `${scene.targetName} 技能 PP 不足，自动使用高级PP豆回复 ${restored} PP。`);
      return true;
    };
    const targetNeedsAutoPpBean = (scene) => {
      if (scene && (scene.mode === "boss" || scene.mode === "weeklyBoss")) {
        const targetDexId = fixedBossSkillDexId(scene);
        if (BOSS_FIXED_SKILL_CYCLE_BY_DEX_ID[targetDexId] || BOSS_FIXED_SKILL_INTERVAL_BY_DEX_ID[targetDexId]) return false;
      }
      const skills = scene && Array.isArray(scene.targetSkills) ? scene.targetSkills : [];
      const totals = skills.reduce((acc, s) => {
        if (!s) return acc;
        const cur = Math.max(0, Number(s.pp) || 0);
        const mx = Math.max(cur, Number(s.ppMax) || cur || 0);
        acc.current += cur;
        acc.max += mx;
        return acc;
      }, { current: 0, max: 0 });
      return totals.max > 0 && totals.current < totals.max / 2;
    };
    const useTargetAutoPpBeanAsAction = (scene) => {
      if (!targetNeedsAutoPpBean(scene)) return false;
      return useTargetAutoPpBean(scene);
    };
    const finishBattleTurnVisuals = (turnEnd) => {
      if (!turnEnd || turnEnd.ended || turnEnd.pendingFinish) return;
      turnEnd.pendingEndTurnTick = false;
      runAfterBattleVisuals(turnEnd, () => {
        if (!battleScene.value || battleScene.value !== turnEnd || turnEnd.ended || turnEnd.pendingFinish) return;
        battleScene.value.fxSkillText = "";
        battleScene.value.fxAttackerSkillText = "";
        battleScene.value.fxTargetSkillText = "";
        clearBattleFloatTextIfExpired(battleScene.value, true);
        clearBattleSkillEffectFxIfExpired(battleScene.value);
        resetBattleVisualHold(battleScene.value);
        battleScene.value.fxTargetShake = false;
        battleScene.value.fxAttackerShake = false;
        battleScene.value.statusEffectFx = null;
        battleScene.value.moraleEffectFx = null;
        battleScene.value._petAnimActionMarks = {};
        battleScene.value._petAnimActionStartedAt = {};
        if (battleScene.value._petAnimTargetAutoIdleTimer) { clearTimeout(battleScene.value._petAnimTargetAutoIdleTimer); battleScene.value._petAnimTargetAutoIdleTimer = null; }
        if (battleScene.value._petAnimAttackerAutoIdleTimer) { clearTimeout(battleScene.value._petAnimAttackerAutoIdleTimer); battleScene.value._petAnimAttackerAutoIdleTimer = null; }
        battleScene.value._petAnimTargetPlayLock = false;
        battleScene.value._petAnimAttackerPlayLock = false;
        resetBattleAnimIdle(battleScene.value);
        battleScene.value.turnCount = Math.max(1, Number(battleScene.value.turnCount) || 1) + 1;
        pushBattleLog(battleScene.value, `第${battleScene.value.turnCount}回合开始。`);
        triggerChallengeMoraleIfNeeded(battleScene.value);
        battleScene.value.isActing = false;
        if (getTurnSequenceAttackEffect(battleScene.value, "attacker")) {
          scheduleTurnSequencePlayerAction(battleScene.value, 500);
          return;
        }
        scheduleAutoBattlePlayerAction(battleScene.value, 500);
      }, BATTLE_FLOAT_TEXT_DURATION_MS);
    };
    const settleBattleTurn = (turnEnd) => {
      if (!turnEnd || turnEnd.ended || turnEnd.pendingFinish) return false;
      if (turnEnd.pendingEndTurnTick) {
        const attackerEndFx = applyEndTurnStatus(turnEnd, "attacker");
        showBattleStatusEffectFx(turnEnd, "attacker", attackerEndFx && attackerEndFx.statuses);
        applyBattleDamageToActivePet(turnEnd);
        if (resolveBattleDefeatIfNeeded(turnEnd, "我方背包亚比全部倒下")) {
          pushBattleLog(turnEnd, `${turnEnd.attackerName} 倒下。`);
          return false;
        }
        if (!turnEnd.ended && !turnEnd.pendingFinish) {
          const targetEndFx = applyEndTurnStatus(turnEnd, "target");
          showBattleStatusEffectFx(turnEnd, "target", targetEndFx && targetEndFx.statuses);
          if (resolveBattleDefeatIfNeeded(turnEnd)) {
            pushBattleLog(turnEnd, `${turnEnd.targetName} 倒下。`);
            return false;
          }
        }
        tickGlobalTimedEffects(turnEnd);
        if (resolveBattleDefeatIfNeeded(turnEnd)) return false;
      }
      finishBattleTurnVisuals(turnEnd);
      return true;
    };
    const compareBattleActions = (scene, a, b) => {
      const pa = a && a.skill ? getSkillActionPriority(a.skill) : 0;
      const pb = b && b.skill ? getSkillActionPriority(b.skill) : 0;
      if (pa !== pb) return pb - pa;
      const sa = getBattleActionSpeed(scene, a.side);
      const sb = getBattleActionSpeed(scene, b.side);
      if (sa !== sb) return sb - sa;
      return (Number(a.tie) || 0) - (Number(b.tie) || 0);
    };
    const queueBattleTurnActions = (scene, actions, delayMs = 0) => {
      if (!scene || scene.ended || scene.pendingFinish) return;
      const ordered = (Array.isArray(actions) ? actions : [])
        .map((a) => {
          if (!a || !a.side) return a;
          const pool = a.side === "attacker" ? scene.skills : scene.targetSkills;
          const autoSkill = consumeTurnSequenceAttackSkill(scene, a.side, pool);
          if (!autoSkill) return a;
          const who = a.side === "attacker" ? scene.attackerName : scene.targetName;
          pushBattleLog(scene, `${who}延续${autoSkill.name}，本回合自动使用该技能。`);
          return { ...a, skill: autoSkill, autoTurnSequence: true };
        })
        .filter((a) => a && a.side && a.skill)
        .map((a) => ({ ...a, tie: Math.random() }))
        .sort((a, b) => compareBattleActions(scene, a, b));
      const runAt = (index) => {
        const live = battleScene.value;
        if (!live || live !== scene || live.ended || live.pendingFinish) return;
        const action = ordered[index];
        if (!action) {
          settleBattleTurn(live);
          return;
        }
        if (action.side === "attacker" && Math.max(0, Number(live.attackerHp) || 0) <= 0) {
          runAt(index + 1);
          return;
        }
        if (action.side === "target" && Math.max(0, Number(live.targetHp) || 0) <= 0) {
          runAt(index + 1);
          return;
        }
        if (resolveBattleDefeatIfNeeded(live, action.side === "target" ? "" : "我方背包亚比全部倒下")) return;
        if (!action.skill) {
          runAt(index + 1);
          return;
        }
        if (action.side === "target" && (action.skill._autoPpBeanAction || useTargetAutoPpBeanAsAction(live))) {
          if (action.skill._autoPpBeanAction) useTargetAutoPpBeanAsAction(live);
          setTimeout(() => runAt(index + 1), battleSceneDelayMs(live, BATTLE_FLOAT_TEXT_DURATION_MS, 120));
          return;
        }
        if (action.side === "attacker" && Math.max(0, Number(action.skill.pp) || 0) <= 0) {
          pushBattleLog(live, `${live.attackerName}的${action.skill.name} PP不足，无法使用。`);
          runAt(index + 1);
          return;
        }
        live._targetActionPendingAfterCurrentAttacker = action.side === "attacker"
          && ordered.slice(index + 1).some((nextAction) => nextAction && nextAction.side === "target" && nextAction.skill);
        const result = runBattleSkill(live, action.side, action.skill);
        live._targetActionPendingAfterCurrentAttacker = false;
        if (live.ended || live.pendingFinish || result.ended) return;
        runAfterBattleVisuals(live, () => runAt(index + 1), Math.max(BATTLE_FLOAT_TEXT_DURATION_MS, Number(result && result.visualDelayMs) || 0, BATTLE_COUNTER_ATTACK_DELAY_MS));
      };
      setTimeout(() => runAt(0), battleSceneDelayMs(scene, Math.max(0, Number(delayMs) || 0), 0));
    };
    const runBattleSkill = (scene, actor, skill) => {
      if (!scene || !skill || scene.ended) return { ended: scene && scene.ended, visualDelayMs: 0 };
      const isAttacker = actor === "attacker";
      const actorName = isAttacker ? scene.attackerName : scene.targetName;
      let targetName = isAttacker ? scene.targetName : scene.attackerName;
      const actorSide = isAttacker ? "attacker" : "target";
      let targetSide = isAttacker ? "target" : "attacker";
      const actorElement = getEffectiveBattleElement(scene, actorSide);
      let targetElements = getEffectiveBattleElements(scene, targetSide);
      const suppressDirectDamage = hasDirectDamageSuppressedEffect(skill);
      const hasDiminishingSelfEffect = hasDiminishingGateEffect(skill);
      const beforeAct = beforeActionCheck(scene, actorSide);
      if (beforeAct.log) {
        pushBattleLog(scene, beforeAct.log);
      }
      if (!beforeAct.canAct) {
        showBattleActionNotice(scene, actorSide, "本回合无法行动");
        return { ended: false, skipped: true, visualDelayMs: BATTLE_FLOAT_TEXT_DURATION_MS };
      }
      if (hasUsedOncePerBattleSkill(scene, actorSide, skill)) {
        pushBattleLog(scene, `${actorName} 本场战斗已经使用过 ${skill.name}，无法再次使用。`);
        return { ended: false, skipped: true, visualDelayMs: BATTLE_FLOAT_TEXT_DURATION_MS };
      }
      const guardianBossBlocked = isSkillBlockedByGuardianBoss(scene, actorSide, skill);
      skill.pp = Math.max(0, Number(skill.pp) - 1);
      if (skill._turnSequenceSourceSkill && skill._turnSequenceSourceSkill !== skill) {
        skill._turnSequenceSourceSkill.pp = skill.pp;
      }
      markOncePerBattleSkillUsed(scene, actorSide, skill);
      const stageTotalsBeforeSkill = battleStageTotalsSnapshot(scene);

      scene.fxSkillText = skill.name;
      scene.fxAttackerSkillText = isAttacker ? skill.name : "";
      scene.fxTargetSkillText = isAttacker ? "" : skill.name;
      scene.fxDamageText = "";
      scene.damageOnAttacker = "";
      scene.damageOnTarget = "";
      scene.healOnAttacker = "";
      scene.healOnTarget = "";
      scene.damageTagOnAttacker = "";
      scene.damageTagOnTarget = "";
      scene.actionNoticeOnAttacker = "";
      scene.actionNoticeOnTarget = "";
      scene.critOnAttacker = false;
      scene.critOnTarget = false;
      if (isAttacker) {
        scene.fxTargetShake = true;
        scene.fxAttackerShake = true;
      } else {
        scene.fxTargetShake = true;
        scene.fxAttackerShake = true;
      }

      const actionSeq = (Number(scene._petAnimActionSeq) || 0) + 1;
      scene._petAnimActionSeq = actionSeq;
      if (!scene._petAnimActionStartedAt || typeof scene._petAnimActionStartedAt !== "object") scene._petAnimActionStartedAt = {};
      scene._petAnimActionStartedAt[actionSeq] = Date.now();
      const atkKind = parseSkillAttackKind(skill);
      triggerFatalDragonShadowEffects(scene, actorSide, skill);
      const actorDexIdForDelay = resolveBattleSideDexId(scene, actorSide);
      const actorState = getSideState(scene, actorSide);
      if ((atkKind === "physical" || atkKind === "special") && Math.max(0, Number(actorState.statuses.confuse) || 0) > 0) {
        if (Math.random() < 0.5) {
          targetSide = actorSide;
          targetName = actorName;
          targetElements = getEffectiveBattleElements(scene, targetSide);
          pushBattleLog(scene, `${actorName}陷入混乱，攻击作用于自己。`);
        }
      }
      const actorLevel = isAttacker ? scene.attackerLevel : scene.targetLevel;
      const defenderLevel = isAttacker ? scene.targetLevel : scene.attackerLevel;
      const fixedDamage = calcBattleFixedDamageAmount(scene, actorSide, skill, actorLevel, defenderLevel);
      const dynamicPower = getSkillDynamicPower(scene, actorSide, targetSide, skill);
      const powerOverride = getSkillPowerOverride(skill);
      const turnSequencePower = Number(skill && skill._turnSequenceAuto ? skill.power : 0) || 0;
      const skillElement = getSkillBattleElement(skill);
      const elementFactorForEffectGate = getElementFactorAgainstElements(skillElement, targetElements);
      const hasUsablePower = fixedDamage > 0 || Number(skill.power) > 0 || Number(dynamicPower) > 0 || Number(powerOverride) > 0 || turnSequencePower > 0 || hasSkillEffectKind(skill, "multiHit");
      const isStatusAnim = suppressDirectDamage || hasDiminishingSelfEffect || atkKind === "status" || !hasUsablePower;
      const actionStateKey = isStatusAnim ? "status" : "atk";
      const actionSrcForDelay = BATTLE_IDLE_USES_ACTION_SVG ? getPetBattleAnimPath(actorDexIdForDelay, actorSide, actionStateKey) : "";
      const effectSrcForDelay = getBattleSkillEffectPath(skill, actionSeq);
      const estimatedActionMs = actionSrcForDelay ? petAnimPlayMs(estimatePetBattleAnimDurationMs(actorDexIdForDelay, actorSide, actionStateKey)) : 0;
      const estimatedEffectMs = effectSrcForDelay ? BATTLE_SKILL_EFFECT_DURATION_MS + BATTLE_SKILL_EFFECT_SETTLE_MS : 0;
      const visualDelayMs = (actionSrcForDelay || effectSrcForDelay)
        ? Math.max(BATTLE_FLOAT_TEXT_DURATION_MS, estimatedActionMs + estimatedEffectMs + BATTLE_FLOAT_TEXT_DURATION_MS + BATTLE_DAMAGE_FLOAT_SETTLE_MS)
        : BATTLE_FLOAT_TEXT_DURATION_MS;
      markBattleVisualHoldMs(scene, visualDelayMs);
      if (actionSrcForDelay || effectSrcForDelay) {
        const visualStartedAt = Number(scene._petAnimActionStartedAt && scene._petAnimActionStartedAt[actionSeq]) || Date.now();
        getBattleActionVisualDurationMs(scene, petAnimActionSrc(actionSrcForDelay, actionSeq, actionStateKey), effectSrcForDelay)
          .then((rawVisualMs) => markBattleVisualHoldFrom(scene, visualStartedAt, rawVisualMs + BATTLE_FLOAT_TEXT_DURATION_MS + BATTLE_DAMAGE_FLOAT_SETTLE_MS))
          .catch(() => {});
      }
      if (isAttacker) {
        applyBattleAnimImage(scene, "attacker", actionStateKey, actionSeq);
      } else {
        applyBattleAnimImage(scene, "target", actionStateKey, actionSeq);
      }
      if (guardianBossBlocked) {
        pushBattleLog(scene, `${actorName} 使用 ${skill.name}，但${targetName}对该技能效果免疫。`);
        const showBlockedVisual = () => {
          const live = battleScene.value;
          if (!live || live !== scene || live.ended) return;
          if (isAttacker) scene.damageOnTarget = "无效";
          else scene.damageOnAttacker = "无效";
          markBattleFloatText(scene);
          flushAfterDamageFloat(scene);
        };
        scheduleBattleSkillEffectVisual(scene, actorSide, targetSide, skill, atkKind, actionStateKey, actionSeq, showBlockedVisual);
        scene.pendingEndTurnTick = true;
        showBattleStageTotalChangeFx(scene, stageTotalsBeforeSkill, 220);
        return { ended: false, visualDelayMs };
      }
      const rolledPowerMultiplier = rollSkillChancePowerMultiplier(skill);
      if (rolledPowerMultiplier > 1) pushBattleLog(scene, `${actorName}的${skill.name}触发${rolledPowerMultiplier}倍伤害。`);
      const unharmedPowerMultiplier = getUnharmedPowerMultiplier(scene, actorSide, skill);
      if (unharmedPowerMultiplier > 1) pushBattleLog(scene, `${actorName}本回合未受到伤害，${skill.name}威力翻倍。`);
      const statusPowerMultiplier = getStatusPowerMultiplier(scene, actorSide, targetSide, skill);
      if (statusPowerMultiplier > 1) {
        const statusPowerSelf = parseSkillEffects(skill)
          .filter((e) => normalize(e && e.kind) === "statusPowerMultiplier" && normalize(e && e.target) === "self")
          .some((e) => {
            const statuses = Array.isArray(e && e.statuses) ? e.statuses.map(normalize).filter(Boolean) : [normalize(e && e.status)].filter(Boolean);
            const current = getSideState(scene, actorSide).statuses || {};
            return statuses.some((status) => Math.max(0, Number(current[status]) || 0) > 0);
          });
        pushBattleLog(scene, `${statusPowerSelf ? actorName : targetName}处于异常状态，${skill.name}威力提升至${statusPowerMultiplier}倍。`);
      }
      const powerFactor = getElementPowerFactor(scene, actorSide, skillElement) * getDamageBoostFactor(scene, actorSide) * getTargetElementDamageBoostFactor(scene, actorSide, targetSide) * getDamagePowerTransferFactor(scene, actorSide) * rolledPowerMultiplier * unharmedPowerMultiplier * statusPowerMultiplier;
      const actorStatuses = getSideState(scene, actorSide).statuses || {};
      const powerConditionFactor = normalize(skill && skill.name) === "激发力量"
        && (Math.max(0, Number(actorStatuses.poison) || 0) > 0 || Math.max(0, Number(actorStatuses.paralyze) || 0) > 0 || Math.max(0, Number(actorStatuses.burn) || 0) > 0)
        ? 2
        : 1;
      const effectsForHit = parseSkillEffects(skill);
      const selfAccuracyFreeKinds = new Set([
        "flag", "priority", "dynamicPower", "heal", "healByStatRatio", "healFlat", "healFlatTeam", "timedHeal", "endTurnHealFlat", "endTurnHealByLostHp",
        "statusCure", "statusShield", "stageGuard", "attackImmunity", "diminishingSuccessGate", "damageAbsorb", "damageReduction",
        "typedDamageReduction", "damageBoost", "chancePowerMultiplier", "damageShield", "turnSequenceAttack", "timedStage", "timedRandomStage", "endTurnStageAndStatusChance", "endTurnClearStageChance",
        "lastStand", "damageReflect", "damageReflectFlat", "elementChange", "elementDamageReduction", "globalElementPower",
        "mirrorOpponentStageBoost", "setCritStage", "windGodPossession", "elementShelter", "battleBackgroundOverride", "lifestealBuff", "fullRestoreOnDefeatThisTurn", "nextPetFullRestore",
        "endTurnSetHpToOne", "unharmedBranch"
      ]);
      const selfAccuracyFreeSkill = !hasUsablePower && effectsForHit.length > 0 && effectsForHit.every((e) => {
        const kind = normalize(e && e.kind);
        if (!selfAccuracyFreeKinds.has(kind) && kind !== "stage" && kind !== "critStage") return false;
        return normalize(e && e.target) === "self";
      });
      const acc = selfAccuracyFreeSkill ? 100 : getSkillBaseAccuracy(skill, Number(skill.accuracy) || 100);
      const actorAccStage = getSideState(scene, actorSide).stages.accuracy || 0;
      const targetEvaStage = getSideState(scene, targetSide).stages.evasion || 0;
      const hitRateElementFactor = applyBattleHitRateFactor(scene, actorSide, targetSide, skillElement);
      const finalHitRate = hasSkillEffectFlag(skill, "mustHit") || hasActiveNextAttackMustHit(scene, actorSide) || selfAccuracyFreeSkill ? 1 : clamp((acc / 100) * stageHitRateFactor(actorAccStage, targetEvaStage) * hitRateElementFactor, 0.1, 1);
      const hardcodedMultiHit = fixedDamage > 0 ? null : parseMultiHitRangeFromDesc(skill);
      const didHit = hardcodedMultiHit ? true : Math.random() <= finalHitRate;

      let damage = 0;
      let elementFactor = 1;
      let comboHitList = [];
      let isComboSkill = false;
      let landedHitCount = 0;
      let splitDamageDisplay = null;
      let skillEffectDidApply = false;
      if (!didHit) {
        pushBattleLog(scene, `${actorName} 使用 ${skill.name}，但技能未命中。`);
        const showMissVisual = () => {
          const live = battleScene.value;
          if (!live || live !== scene || live.ended) return;
          if (isAttacker) scene.damageOnTarget = "MISS";
          else scene.damageOnAttacker = "MISS";
          markBattleFloatText(scene);
        };
        scheduleBattleSkillEffectVisual(scene, actorSide, targetSide, skill, atkKind, actionStateKey, actionSeq, showMissVisual);
      } else if (elementFactorForEffectGate <= 0 && !selfAccuracyFreeSkill) {
        elementFactor = 0;
        pushBattleLog(scene, `${actorName} 使用 ${skill.name}，但${compareElementLabel(elementFactor)}，技能效果没有生效。`);
        const showInvalidVisual = () => {
          const live = battleScene.value;
          if (!live || live !== scene || live.ended) return;
          if (isAttacker) scene.damageOnTarget = "无效";
          else scene.damageOnAttacker = "无效";
          markBattleFloatText(scene);
          flushAfterDamageFloat(scene);
        };
        scheduleBattleSkillEffectVisual(scene, actorSide, targetSide, skill, atkKind, actionStateKey, actionSeq, showInvalidVisual);
        skillEffectDidApply = false;
      } else if (fixedDamage <= 0 && (suppressDirectDamage || hasDiminishingSelfEffect || atkKind === "status" || !hasUsablePower)) {
        pushBattleLog(scene, `${actorName} 使用 ${skill.name}（属性技能）。`);
        scheduleBattleSkillEffectVisual(scene, actorSide, targetSide, skill, atkKind, actionStateKey, actionSeq, () => flushAfterDamageFloat(scene));
        skillEffectDidApply = true;
      } else {
        if (targetSide === "target") applyBattleAnimImage(scene, "target", "hit", actionSeq);
        else applyBattleAnimImage(scene, "attacker", "hit", actionSeq);
        const immuneEffect = getAttackImmunityEffect(scene, targetSide, atkKind, skillElement);
        const immuneChance = immuneEffect ? clamp(Number(immuneEffect.data && immuneEffect.data.chance) || 1, 0, 1) : 0;
        if (immuneEffect) {
          pushBattleLog(scene, `${targetName}的攻击免疫判定：${Math.round(immuneChance * 100)}%概率免受本次${atkKind === "special" ? "特殊攻击" : "普通攻击"}伤害。`);
        }
        if (!hardcodedMultiHit && immuneEffect && Math.random() <= immuneChance) {
          pushBattleLog(scene, `${targetName}的攻击免疫生效，免受本次${atkKind === "special" ? "特殊攻击" : "普通攻击"}伤害。`);
          const showImmuneVisual = () => {
            const live = battleScene.value;
            if (!live || live !== scene || live.ended) return;
            if (isAttacker) scene.damageOnTarget = "无效";
            else scene.damageOnAttacker = "无效";
            markBattleFloatText(scene);
          };
          scheduleBattleSkillEffectVisual(scene, actorSide, targetSide, skill, atkKind, actionStateKey, actionSeq, showImmuneVisual);
          damage = 0;
          skillEffectDidApply = false;
        } else {
        elementFactor = fixedDamage > 0 ? 1 : elementFactorForEffectGate;
        const stab = normalize(actorElement) === normalize(skillElement) ? 1.5 : 1;
        const isNoEdgeBlade = normalize(skill && skill.name) === "无锋巨刃";
        const atkStat = atkKind === "special"
          ? getBattleAbilityStat(scene, actorSide, "spAtk")
          : getBattleAbilityStat(scene, actorSide, "atk");
        const defStat = isNoEdgeBlade
          ? 1
          : (atkKind === "special"
            ? getBattleAbilityStat(scene, targetSide, "spDef")
            : getBattleAbilityStat(scene, targetSide, "def"));
        if (powerConditionFactor > 1) pushBattleLog(scene, `${actorName}处于异常状态，激发力量威力提升为2倍。`);
        const reduceFactor = getDamageReductionFactor(scene, targetSide, atkKind) * getElementDamageReductionFactor(scene, targetSide, skillElement);
        const mh = hardcodedMultiHit;
        const bonusFixedPerHit = mh ? parseBonusFixedDamagePerHit(skill) : null;
        const bonusFixedEffects = parseSkillEffects(skill).filter((e) => normalize(e && e.kind) === "bonusFixedDamage");
        const statusCountBonusEffects = parseSkillEffects(skill).filter((e) => normalize(e && e.kind) === "statusCountBonusDamage");
        const perHitEffects = mh ? parseSkillEffects(skill).filter((e) => ["perHitStatus", "perHitStage", "perHitRandomAbilityStatFactor", "onHitRandomStage"].includes(normalize(e && e.kind))) : [];
        const onCritStatusEffects = parseSkillEffects(skill).filter((e) => normalize(e && e.kind) === "onCritStatus");
        const onCritHealMaxHpEffects = mh ? parseSkillEffects(skill).filter((e) => normalize(e && e.kind) === "onCritHealMaxHp") : [];
        const hitTimes = mh ? (mh.min + Math.floor(Math.random() * (mh.max - mh.min + 1))) : 1;
        const perHitPowerMultiplier = mh ? Math.max(1, Number(mh.powerMultiplier) || 1) : 1;
        const perHitPowerList = mh && Array.isArray(mh.powerList) ? mh.powerList : [];
        const shelterMultiplier = mh && getSideState(scene, actorSide).elementShelter
          ? Math.max(1, Number(mh.elementShelterMultiplier) || 1)
          : 1;
        if (shelterMultiplier > 1) pushBattleLog(scene, `${actorName}的元素庇护使${skill.name}威力翻倍。`);
        isComboSkill = Boolean(mh && hitTimes > 1);
        if (fixedDamage > 0) {
          damage = fixedDamage;
          comboHitList.push(`-${damage}`);
          landedHitCount = 1;
          skillEffectDidApply = true;
        } else if (elementFactor <= 0) {
          for (let i = 0; i < hitTimes; i += 1) comboHitList.push("无效");
          const showInvalidVisual = () => {
            const live = battleScene.value;
            if (!live || live !== scene || live.ended) return;
            if (targetSide === "target") {
              scene.damageOnTarget = "无效";
              scene.comboHitsOnTarget = comboHitList.slice();
              scene.comboTotalOnTarget = "";
              scene.comboTotalDelayOnTarget = 0;
            } else {
              scene.damageOnAttacker = "无效";
              scene.comboHitsOnAttacker = comboHitList.slice();
              scene.comboTotalOnAttacker = "";
              scene.comboTotalDelayOnAttacker = 0;
            }
            markBattleFloatText(scene);
            flushAfterDamageFloat(scene);
          };
          scheduleBattleSkillEffectVisual(scene, actorSide, targetSide, skill, atkKind, actionStateKey, actionSeq, showInvalidVisual);
          skillEffectDidApply = false;
        } else {
        let powerStep = 0;
        for (let i = 0; i < hitTimes; i += 1) {
          const hitOk = mh ? Math.random() <= finalHitRate : didHit;
          if (!hitOk) {
            comboHitList.push("MISS");
            powerStep = 0;
            continue;
          }
          const perHitImmuneEffect = mh ? getAttackImmunityEffect(scene, targetSide, atkKind, skillElement) : null;
          const perHitImmuneChance = perHitImmuneEffect ? clamp(Number(perHitImmuneEffect.data && perHitImmuneEffect.data.chance) || 1, 0, 1) : 0;
          if (perHitImmuneEffect && Math.random() <= perHitImmuneChance) {
            comboHitList.push("无效");
            powerStep = 0;
            continue;
          }
          const randomFactor = 0.85 + Math.random() * 0.15;
          let one = calcBattleDirectDamage({
            scene,
            actorSide,
            defenderSide: targetSide,
            actorLevel,
            skill,
            atkKind,
            skillElement,
            power: powerOverride || (perHitPowerList[i] || dynamicPower) || (isNoEdgeBlade ? 1 : Number(skill.power)),
            powerFactor: powerFactor * shelterMultiplier * Math.pow(perHitPowerMultiplier, powerStep),
            powerConditionFactor,
            elementFactor,
            randomFactor,
            reduceFactor
          });
          if (bonusFixedPerHit && Math.random() <= bonusFixedPerHit.chance) {
            one += bonusFixedPerHit.amount;
          }
          let splitFixedDamage = 0;
          bonusFixedEffects.forEach((e) => {
            const chance = clamp(Number(e.chance) || 1, 0, 1);
            const targetHpAbove = Number(e.targetHpAbove);
            const targetHpNow = Math.max(0, Number(targetSide === "attacker" ? scene.attackerHp : scene.targetHp) || 0);
            if (Number.isFinite(targetHpAbove) && !(targetHpNow > targetHpAbove)) return;
            const condition = e.condition || null;
            const multiplier = condition && battleSideMatchesDexCondition(scene, targetSide, condition)
              ? Math.max(1, Number(condition.multiplier) || 1)
              : 1;
            const finalChance = clamp(chance * multiplier, 0, 1);
            if (Math.random() <= finalChance) {
              const fixedAmount = Math.max(1, Math.floor((Number(e.amount) || 1) * multiplier));
              one += fixedAmount;
              if (e.splitDamageDisplay) splitFixedDamage += fixedAmount;
              if (multiplier > 1) pushBattleLog(scene, `${skill.name}对${targetName}触发克制强化，固定伤害和效果概率翻倍。`);
            }
          });
          statusCountBonusEffects.forEach((e) => {
            if (e.requireHit && !hitOk) return;
            const count = countBattleStatuses(scene, targetSide);
            if (count <= 0) return;
            const amount = Math.max(1, Math.floor(Number(e.amountPerStatus) || Number(e.amount) || 1)) * count;
            one += amount;
            pushBattleLog(scene, `${targetName}身上的不良状态使${skill.name}追加${amount}点伤害。`);
          });
          const shield = useDamageShieldAmount(scene, targetSide, one);
          if (shield.amount > 0) {
            const beforeShield = one;
            one = Math.max(0, one - shield.amount);
            if (beforeShield > one) pushBattleLog(scene, `${targetName}的${shield.label}抵抗${beforeShield - one}点伤害。`);
          }
          const actorCritStage = getSideState(scene, actorSide).critStage || 0;
          const crit = Math.random() < critChanceByStage(actorCritStage);
          if (crit) {
            one = Math.max(1, Math.floor(one * 2));
            if (isAttacker) scene.critOnTarget = true;
            else scene.critOnAttacker = true;
            onCritStatusEffects.forEach((e) => {
              const side = normalize(e && e.target) === "self" ? actorSide : targetSide;
              const status = normalize(e && e.status);
              if (!status || isGuardianBossProtectedTarget(scene, side) || isStatusImmuneByElement(scene, side, status) || hasStatusShield(scene, side, status)) return;
              const targetState = getSideState(scene, side);
              applyStatusTurns(targetState, status, Math.max(1, Math.floor(Number(e && e.turns) || defaultStatusTurns(status))));
              pushBattleLog(scene, `${skill.name}暴击触发，${side === "attacker" ? scene.attackerName : scene.targetName}陷入${statusLabel(status)}${targetState.statuses[status]}回合。`);
            });
            onCritHealMaxHpEffects.forEach((e) => {
              const side = normalize(e && e.target) === "opponent" ? targetSide : actorSide;
              const ratio = clamp(Number(e && e.ratio) || 0.1, 0.01, 1);
              const hpKey = side === "attacker" ? "attackerHp" : "targetHp";
              const maxHpKey = side === "attacker" ? "attackerMaxHp" : "targetMaxHp";
              const before = Math.max(0, Number(scene[hpKey]) || 0);
              const maxHp = Math.max(1, Number(scene[maxHpKey]) || 1);
              const amount = Math.max(1, Math.floor(maxHp * ratio));
              const healed = Math.max(0, Math.min(amount, maxHp - before));
              if (healed <= 0) return;
              scene[hpKey] = clamp(before + healed, 0, maxHp);
              syncBattleUiHpForSide(scene, side);
              if (side === "attacker") {
                scene.healOnAttacker = `+${healed}`;
                syncActivePetFromBattleScene(scene);
              } else {
                scene.healOnTarget = `+${healed}`;
              }
              markBattleFloatText(scene);
              pushBattleLog(scene, `${skill.name}第${i + 1}击暴击，${side === "attacker" ? scene.attackerName : scene.targetName}回复最大体力${Math.round(ratio * 100)}%，恢复 ${healed} 点。`);
            });
          }
          if (splitFixedDamage > 0 && hitTimes === 1) {
            splitDamageDisplay = { base: Math.max(0, one - splitFixedDamage), fixed: splitFixedDamage, total: one };
            comboHitList.push(`-${splitDamageDisplay.base}`);
            comboHitList.push(`固定-${splitDamageDisplay.fixed}`);
          } else {
            comboHitList.push(`-${one}`);
          }
          damage += one;
          landedHitCount += 1;
          skillEffectDidApply = true;
          perHitEffects.forEach((e) => {
            const chance = clamp(Number(e.chance) || 0, 0, 1);
            if (Math.random() > chance) return;
            const side = e.target === "self" ? actorSide : targetSide;
            if (e.guardianBossImmune && isGuardianBossProtectedTarget(scene, side)) return;
            const state = getSideState(scene, side);
            if (normalize(e.kind) === "perHitStatus") {
              const status = normalize(e.status);
              if (!status || isGuardianBossProtectedTarget(scene, side) || isStatusImmuneByElement(scene, side, status) || hasStatusShield(scene, side, status)) return;
              applyStatusTurns(state, status, e.turns);
              pushBattleLog(scene, `${skill.name}第${i + 1}击触发，${side === "attacker" ? scene.attackerName : scene.targetName}陷入${statusLabel(status)}${state.statuses[status]}回合。`);
              return;
            }
            if (normalize(e.kind) === "perHitRandomAbilityStatFactor") {
              const groups = Array.isArray(e.groups) ? e.groups.filter((g) => Array.isArray(g) && g.length > 0) : [];
              const group = groups.length ? groups[Math.floor(Math.random() * groups.length)] : [];
              const keys = group.filter((k) => BATTLE_STAGE_KEYS.includes(k));
              if (keys.length <= 0) return;
              const factor = clamp(Number(e.factor) || 1, 0.01, 3);
              const turns = Math.max(1, Math.floor(Number(e.turns) || 3));
              addTimedEffect(scene, side, { kind: "abilityStatFactor", turns, data: { keys, factor } });
              pushBattleLog(scene, `${skill.name}第${i + 1}击触发，${side === "attacker" ? scene.attackerName : scene.targetName}${keys.map((k) => battleStatLabel(k)).join("、")}数值降低${Math.round((1 - factor) * 100)}%。`);
              return;
            }
            if (normalize(e.kind) === "perHitStage") {
              const keys = (Array.isArray(e.keys) ? e.keys : []).map((k) => normalize(k)).filter((k, idx, arr) => ALL_ABILITY_STAGE_KEYS.includes(k) && arr.indexOf(k) === idx);
              const delta = Math.floor(Number(e.delta) || 0);
              if (keys.length <= 0 || delta === 0) return;
              const changed = applyStageDelta(scene, side, keys, delta);
              if (changed.length > 0) pushBattleLog(scene, `${skill.name}第${i + 1}击触发，${side === "attacker" ? scene.attackerName : scene.targetName}${delta > 0 ? "提升" : "降低"}${Math.abs(delta)}级：${changed.map((k) => battleStatLabel(k)).join("、")}`);
              return;
            }
            if (normalize(e.kind) === "onHitRandomStage") {
              const keys = (Array.isArray(e.keys) ? e.keys : []).map((k) => normalize(k)).filter((k, idx, arr) => ALL_ABILITY_STAGE_KEYS.includes(k) && arr.indexOf(k) === idx);
              const pick = Math.min(keys.length, Math.max(1, Math.floor(Number(e.pick) || 1)));
              const delta = Math.floor(Number(e.delta) || 0);
              if (keys.length <= 0 || pick <= 0 || delta === 0) return;
              const pool = keys.slice();
              const picked = [];
              while (pool.length > 0 && picked.length < pick) {
                const idx = Math.floor(Math.random() * pool.length);
                picked.push(pool.splice(idx, 1)[0]);
              }
              const changed = applyStageDelta(scene, side, picked, delta);
              if (changed.length > 0) pushBattleLog(scene, `${skill.name}第${i + 1}击命中，${side === "attacker" ? scene.attackerName : scene.targetName}随机${delta > 0 ? "提升" : "降低"}${Math.abs(delta)}级：${changed.map((k) => battleStatLabel(k)).join("、")}`);
            }
          });
          powerStep += 1;
        }
        }
        if ((scene.critOnTarget && isAttacker) || (scene.critOnAttacker && !isAttacker)) {
          pushBattleLog(scene, `${actorName} 打出了暴击！`);
        }
        }
      }

      scene.lastDamage = damage;
      scene.lastElementFactor = elementFactor;
      let selfPowerDamage = 0;
      let selfPowerElementFactor = 1;
      if (damage > 0 && hasSkillEffectKind(skill, "selfSamePower")) {
        selfPowerElementFactor = getBattleElementFactor(scene, skillElement, actorSide);
        selfPowerDamage = calcBattleDirectDamage({
          scene,
          actorSide,
          defenderSide: actorSide,
          actorLevel,
          skill,
          atkKind,
          skillElement,
          power: powerOverride || dynamicPower || Number(skill.power),
          powerFactor,
          powerConditionFactor,
          elementFactor: selfPowerElementFactor,
          randomFactor: 0.925,
          reduceFactor: getDamageReductionFactor(scene, actorSide, atkKind) * getElementDamageReductionFactor(scene, actorSide, skillElement)
        });
      }
      if (damage > 0) {
        const absorbEffect = getDamageAbsorbEffect(scene, targetSide);
        if (absorbEffect) {
          const hpKey = targetSide === "attacker" ? "attackerHp" : "targetHp";
          const maxHpKey = targetSide === "attacker" ? "attackerMaxHp" : "targetMaxHp";
          const before = Math.max(0, Number(scene[hpKey]) || 0);
          const maxHp = Math.max(1, Number(scene[maxHpKey]) || 1);
          const healed = Math.max(0, Math.min(damage, maxHp - before));
          scene[hpKey] = clamp(before + healed, 0, maxHp);
          syncBattleUiHpForSide(scene, targetSide);
          if (targetSide === "attacker") {
            const idx = Array.isArray(scene.team) ? scene.team.findIndex((u) => u && u.id === scene.currentAttackerId) : -1;
            if (idx >= 0) scene.team[idx].hp = scene.attackerHp;
          }
          if (targetSide === "attacker") scene.healOnAttacker = `+${healed}`;
          else scene.healOnTarget = `+${healed}`;
          markBattleFloatText(scene);
          pushBattleLog(scene, `${targetName}的混沌吸收生效，吸收本次 ${damage} 点伤害并回复 ${healed} 点体力。`);
          damage = 0;
          comboHitList = ["吸收"];
        }
      }
      if (damage > 0) {
        const showDamageVisual = () => {
          const live = battleScene.value;
          if (!live || live !== scene || live.ended) return;
          scene.uiAttackerHp = scene.attackerHp;
          scene.uiTargetHp = scene.targetHp;
          if (targetSide === "target") {
            if (isComboSkill || splitDamageDisplay) {
              scene.damageOnTarget = "";
              scene.comboHitsOnTarget = comboHitList.slice();
              scene.comboTotalOnTarget = `总-${damage}`;
              scene.comboTotalDelayOnTarget = comboHitList.length * 0.28 + 0.1;
            } else {
              scene.damageOnTarget = `-${damage}`;
              scene.comboHitsOnTarget = [];
              scene.comboTotalOnTarget = "";
              scene.comboTotalDelayOnTarget = 0;
            }
            const tag = compareElementLabel(elementFactor);
            const critTag = scene.critOnTarget ? "暴击" : "";
            scene.damageTagOnTarget = [tag === "克制" || tag === "微弱" ? tag : "", critTag].filter(Boolean).join(" ");
            if (selfPowerDamage > 0) {
              scene.damageOnAttacker = `-${selfPowerDamage}`;
            }
          } else {
            if (isComboSkill || splitDamageDisplay) {
              scene.damageOnAttacker = "";
              scene.comboHitsOnAttacker = comboHitList.slice();
              scene.comboTotalOnAttacker = `总-${damage}`;
              scene.comboTotalDelayOnAttacker = comboHitList.length * 0.28 + 0.1;
            } else {
              scene.damageOnAttacker = `-${damage}`;
              scene.comboHitsOnAttacker = [];
              scene.comboTotalOnAttacker = "";
              scene.comboTotalDelayOnAttacker = 0;
            }
            const tag = compareElementLabel(elementFactor);
            const critTag = scene.critOnAttacker ? "暴击" : "";
            scene.damageTagOnAttacker = [tag === "克制" || tag === "微弱" ? tag : "", critTag].filter(Boolean).join(" ");
            if (selfPowerDamage > 0) {
              scene.damageOnTarget = `-${selfPowerDamage}`;
            }
          }
          markBattleFloatText(scene);
          if (Number(scene.attackerHp) <= 0 || Number(scene.targetHp) <= 0) markBattleVisualHoldMs(scene, BATTLE_FLOAT_TEXT_DURATION_MS + BATTLE_DAMAGE_FLOAT_SETTLE_MS);
          flushAfterDamageFloat(scene);
        };
        if (targetSide === "target") {
            scene.targetHp = Math.max(hasLastStandEffect(scene, "target") && scene.targetHp > 0 ? 1 : 0, scene.targetHp - damage);
          recordBattleDamageTakenThisTurn(scene, "target", damage);
          if (damage > 0) clearSleepAfterDamage(scene, "target");
          if (selfPowerDamage > 0) {
              scene.attackerHp = Math.max(hasLastStandEffect(scene, "attacker") && scene.attackerHp > 0 ? 1 : 0, scene.attackerHp - selfPowerDamage);
            recordBattleDamageTakenThisTurn(scene, "attacker", selfPowerDamage);
            applyBattleDamageToActivePet(scene);
            clearSleepAfterDamage(scene, "attacker");
            pushBattleLog(scene, `${actorName}也受到${skill.name}同威力伤害 ${selfPowerDamage}（${compareElementLabel(selfPowerElementFactor)}）。`);
          }
            scheduleBattleSkillEffectVisual(scene, actorSide, targetSide, skill, atkKind, actionStateKey, actionSeq, showDamageVisual);
          }
          else {
            scene.attackerHp = Math.max(hasLastStandEffect(scene, "attacker") && scene.attackerHp > 0 ? 1 : 0, scene.attackerHp - damage);
            recordBattleDamageTakenThisTurn(scene, "attacker", damage);
            applyBattleDamageToActivePet(scene);
            if (damage > 0) clearSleepAfterDamage(scene, "attacker");
            if (selfPowerDamage > 0) {
              scene.targetHp = Math.max(hasLastStandEffect(scene, "target") && scene.targetHp > 0 ? 1 : 0, scene.targetHp - selfPowerDamage);
              recordBattleDamageTakenThisTurn(scene, "target", selfPowerDamage);
              clearSleepAfterDamage(scene, "target");
              pushBattleLog(scene, `${actorName}也受到${skill.name}同威力伤害 ${selfPowerDamage}（${compareElementLabel(selfPowerElementFactor)}）。`);
            }
            scheduleBattleSkillEffectVisual(scene, actorSide, targetSide, skill, atkKind, actionStateKey, actionSeq, showDamageVisual);
          }
        if (Number(scene.attackerHp) <= 0 || Number(scene.targetHp) <= 0) markBattleVisualHoldMs(scene, visualDelayMs);
        const damageTargetName = targetSide === actorSide ? `${actorName}自己` : targetName;
        if (splitDamageDisplay) {
          pushBattleLog(scene, `${actorName} 使用 ${skill.name}，对 ${damageTargetName} 造成 ${splitDamageDisplay.base} 点技能伤害，并追加 ${splitDamageDisplay.fixed} 点固定伤害，总伤害 ${damage}（${compareElementLabel(elementFactor)}）。`);
        } else if (comboHitList.length > 1) {
          pushBattleLog(scene, `${actorName} 使用 ${skill.name}，连续攻击 ${comboHitList.length} 次，对 ${damageTargetName} 总伤害 ${damage}（${compareElementLabel(elementFactor)}）。`);
        } else {
          pushBattleLog(scene, `${actorName} 使用 ${skill.name}，对 ${damageTargetName} 造成 ${damage} 点伤害（${compareElementLabel(elementFactor)}）。`);
        }
        applyActiveLifestealBuff(scene, actorSide, damage);
        const reflectEffects = getDamageReflectEffects(scene, targetSide, atkKind);
        reflectEffects.forEach((fx) => {
          const ratio = Math.max(0.01, Number(fx.data && fx.data.ratio) || 1);
          const reflectLabel = normalize(fx.data && fx.data.label) || "伤害反弹";
          const reflect = Math.max(1, Math.floor(damage * ratio));
          const hpKey = actorSide === "attacker" ? "attackerHp" : "targetHp";
          const before = Math.max(0, Number(scene[hpKey]) || 0);
          scene[hpKey] = Math.max(hasLastStandEffect(scene, actorSide) && before > 0 ? 1 : 0, before - reflect);
          const actual = Math.max(0, before - (Number(scene[hpKey]) || 0));
          if (actorSide === "attacker") {
            applyBattleDamageToActivePet(scene);
            scene.damageOnAttacker = `-${actual}`;
          } else {
            scene.damageOnTarget = `-${actual}`;
          }
          if (actual > 0) clearSleepAfterDamage(scene, actorSide);
          syncBattleUiHpForSide(scene, actorSide);
          if (fx.data && fx.data.consumeOnTrigger) fx.turns = 0;
          pushBattleLog(scene, `${targetName}的${reflectLabel}生效，${actorName}受到 ${actual} 点反弹伤害。`);
        });
        if (reflectEffects.some((fx) => Number(fx && fx.turns) <= 0)) cleanupExpiredEffects(getSideState(scene, targetSide));
        const flatReflectEffects = getDamageReflectFlatEffects(scene, targetSide, atkKind);
        flatReflectEffects.forEach((fx) => {
          const amount = Math.max(1, Math.floor(Number(fx.data && fx.data.amount) || 1));
          const actual = applyDirectHpDamage(scene, actorSide, amount);
          if (actorSide === "attacker") scene.damageOnAttacker = `-${actual}`;
          else scene.damageOnTarget = `-${actual}`;
          pushBattleLog(scene, `${targetName}的固定伤害反弹生效，${actorName}受到 ${actual} 点反弹伤害。`);
        });
        runOnDamagedEffects(scene, targetSide, actorSide, { reason: "attacked" });
        const damagedTriggerTimes = Math.max(1, landedHitCount || comboHitList.filter((x) => /^-\d+/.test(String(x))).length);
        for (let i = 0; i < damagedTriggerTimes; i += 1) {
          runOnDamagedEffects(scene, targetSide, actorSide, { reason: "damaged" });
        }
      }
      if (damage <= 0 && comboHitList.length > 0) {
        const showComboFailVisual = () => {
          const live = battleScene.value;
          if (!live || live !== scene || live.ended) return;
          const allImmune = comboHitList.every((x) => normalize(x) === "无效");
          if (targetSide === "target") {
            scene.damageOnTarget = allImmune && comboHitList.length === 1 ? "无效" : "";
            scene.comboHitsOnTarget = comboHitList.slice();
            scene.comboTotalOnTarget = "";
            scene.comboTotalDelayOnTarget = 0;
          } else {
            scene.damageOnAttacker = allImmune && comboHitList.length === 1 ? "无效" : "";
            scene.comboHitsOnAttacker = comboHitList.slice();
            scene.comboTotalOnAttacker = "";
            scene.comboTotalDelayOnAttacker = 0;
          }
          markBattleFloatText(scene);
          flushAfterDamageFloat(scene);
        };
        scheduleBattleSkillEffectVisual(scene, actorSide, targetSide, skill, atkKind, actionStateKey, actionSeq, showComboFailVisual);
        pushBattleLog(scene, `${actorName} 使用 ${skill.name}，但${compareElementLabel(elementFactor)}，未造成有效伤害。`);
      }
      if (skillEffectDidApply && damage <= 0 && (atkKind === "physical" || atkKind === "special") && hasUsablePower) {
        runOnDamagedEffects(scene, targetSide, actorSide, { reason: "attacked" });
      }
      const hasOnlyInvalidHits = comboHitList.length > 0 && comboHitList.every((x) => normalize(x) === "无效" || normalize(x) === "MISS");
      const isEffectOnlySkill = atkKind === "status" || !hasUsablePower;
      const canApplySkillEffect = didHit && elementFactorForEffectGate > 0 && !hasOnlyInvalidHits && (skillEffectDidApply || isEffectOnlySkill);
      applySkillEffects(scene, actorSide, skill, canApplySkillEffect);
      advanceTurnSequenceAttackEffect(scene, actorSide, skill, canApplySkillEffect);
      if (atkKind !== "status" && hasConsumableNextAttackEffect(scene, actorSide)) consumeNextAttackEffects(scene, actorSide);
      showBattleStageTotalChangeFx(scene, stageTotalsBeforeSkill, 220);
      if (resolveBattleDefeatIfNeeded(scene, isAttacker ? "" : "我方背包亚比全部倒下")) {
        consumeBattleTurnDurations(scene);
        return { ended: true, visualDelayMs };
      }
      scene.pendingEndTurnTick = true;

      return { ended: false, visualDelayMs };
    };
    const queueTargetCounterAttack = (delayMs = BATTLE_COUNTER_ATTACK_DELAY_MS) => {
      const scene = battleScene.value;
      if (!scene || scene.ended || scene.pendingFinish) return;
      setTimeout(() => {
        const live = battleScene.value;
        if (!live || live.ended || live.pendingFinish) return;
        if (useTargetAutoPpBeanAsAction(live)) {
          setTimeout(() => {
            const turnEnd = battleScene.value;
            if (!turnEnd || turnEnd !== live) return;
            settleBattleTurn(turnEnd);
          }, battleSceneDelayMs(live, BATTLE_FLOAT_TEXT_DURATION_MS, 120));
          return;
        }
        const skill = pickTargetSkill(live, battleSceneTargetSkills.value.filter((s) => s.pp > 0));
        if (!skill) {
          settleBattleTurn(live);
          return;
        }
        const result = runBattleSkill(live, "target", skill);
        if (live.ended || live.pendingFinish) return;
        runAfterBattleVisuals(live, () => {
          const turnEnd = battleScene.value;
          if (!turnEnd || turnEnd !== live) return;
          settleBattleTurn(turnEnd);
        }, Math.max(BATTLE_FLOAT_TEXT_DURATION_MS, Number(result && result.visualDelayMs) || 0));
      }, battleSceneDelayMs(scene, Math.max(0, Number(delayMs) || 0), 0));
    };
    const applyBattleDamageToActivePet = (scene) => {
      if (!scene || !Array.isArray(scene.team)) return;
      const idx = scene.team.findIndex((u) => u.id === scene.currentAttackerId);
      if (idx >= 0) {
        scene.team[idx].hp = clamp(Number(scene.attackerHp) || 0, 0, scene.team[idx].maxHp);
        scene.team[idx].battleState = normalizeBattleState(scene.attackerState);
      }
    };
    const resetAttackerBattleStateForGuardianStage = (scene) => {
      if (!scene) return;
      clearBattleFloatTextIfExpired(scene, true);
      clearBattleSkillEffectFxIfExpired(scene);
      scene.attackerState = createBattleState();
      if (Array.isArray(scene.team)) {
        scene.team.forEach((u) => {
          if (u) u.battleState = createBattleState();
        });
      }
      applyBattleDamageToActivePet(scene);
    };
    const switchGuardianStage = (scene) => {
      if (!scene || scene.mode !== "guardian" || !scene.guardianMeta) return false;
      const meta = scene.guardianMeta;
      if (meta.stageIndex >= meta.levels.length - 1) return false;
      meta.stageIndex += 1;
      const entry = dexById.get(Number(meta.dexId));
      if (!entry) return false;
      const nextLevel = meta.levels[meta.stageIndex];
      const nextTarget = buildBattleTarget({
        entry,
        level: nextLevel,
        forceHpRace500: false,
        hpRaceMultiplier: meta.hpRaceMultiplier,
        talentOverride: meta.talentValue === 50 ? createUniformTalent50() : null,
        studyOverride: createGuardianStudy(),
        displayName: entry.name,
        displayImage: petBattleSvgImage(entry.dexId, "target", "idle") || entry.image
      });
      if (!nextTarget) return false;
      scene.targetDexId = nextTarget.dexId;
      scene.targetName = nextTarget.name;
      scene.targetImage = nextTarget.image;
      scene.targetStaticImage = nextTarget.staticImage || nextTarget.image;
      scene.targetLevel = nextTarget.level;
      scene.targetElement = nextTarget.element;
      scene.targetAbility = nextTarget.ability;
      scene.targetHp = nextTarget.hp;
      scene.targetMaxHp = nextTarget.maxHp;
      scene.uiTargetHp = nextTarget.hp;
      scene.uiTargetMaxHp = nextTarget.maxHp;
      scene.targetState = normalizeBattleState(nextTarget.battleState);
      scene.targetSkills = nextTarget.skills;
      resetAttackerBattleStateForGuardianStage(scene);
      scene.fxTargetDefeated = false;
      resetBattleAnimIdle(scene);
      pushBattleLog(scene, `守护者进入下一阶段：Lv.${nextLevel}`);
      return true;
    };
    const tryGuardianExtraLife = (scene) => {
      if (!scene || scene.mode !== "guardian" || !scene.guardianMeta) return false;
      const meta = scene.guardianMeta;
      const guardianName = resolveGuardianName(meta.guardianName || scene.targetName);
      if (guardianName !== "烈焰鸟") return false;
      const totalLives = Math.max(1, Math.floor(Number(meta.lives) || 1));
      const usedLives = Math.max(0, Math.floor(Number(meta.usedLives) || 0));
      if (usedLives >= totalLives - 1) return false;
      meta.usedLives = usedLives + 1;
      scene.targetHp = Math.max(1, Math.floor(Number(scene.targetMaxHp) || 1));
      scene.uiTargetHp = scene.targetHp;
      scene.targetState = createBattleState();
      scene.fxTargetDefeated = false;
      scene.fxTargetShake = false;
      scene.actionNoticeOnTarget = "凤凰涅槃";
      scene.healOnTarget = `+${scene.targetHp}`;
      resetBattleAnimIdle(scene);
      pushBattleLog(scene, `烈焰鸟发动凤凰涅槃，第二条命上场。`);
      return true;
    };
    const studyBattlefieldByKey = (key) => STUDY_BATTLEFIELDS.find((row) => normalize(row.key) === normalize(key)) || null;
    const buildStudyBattleMeta = (key) => {
      const field = studyBattlefieldByKey(key);
      if (!field) return null;
      const entry = findDexByName(field.guardianName);
      if (!entry) return null;
      return { ...field, dexId: entry.dexId, targetEntry: entry, level: 10 };
    };
    const grantStudyReward = (scene) => {
      const meta = scene && scene.studyMeta;
      const key = normalize(meta && meta.key);
      if (!key) return { added: 0, current: 0, full: false, pet: null };
      const pet = state.value.activePets.find((p) => p && p.id === scene.currentAttackerId) || null;
      if (!pet) return { added: 0, current: 0, full: false, pet: null };
      const study = normalizeStudy(pet.study, key);
      const before = clamp(Number(study[key]) || 0, 0, 255);
      const total = studyTotal(study);
      study[key] = clamp(before + Math.min(10, Math.max(0, 510 - total)), 0, 255);
      pet.study = normalizeStudy(study, key);
      const after = clamp(Number(pet.study[key]) || 0, 0, 255);
      const added = Math.max(0, after - before);
      return { added, current: after, full: after >= 255, pet };
    };
    const restartStudyBattle = (scene) => {
      if (!scene || scene.mode !== "study" || !scene.studyMeta) return false;
      const meta = buildStudyBattleMeta(scene.studyMeta.key);
      if (!meta) return false;
      const nextTarget = buildBattleTarget({
        entry: meta.targetEntry,
        level: 10,
        forceHpRace500: false,
        talentOverride: createUniformTalent30(),
        studyOverride: createZeroStats(),
        displayName: meta.targetEntry.name,
        displayImage: petBattleSvgImage(meta.targetEntry.dexId, "target", "idle") || meta.targetEntry.image
      });
      if (!nextTarget) return false;
      scene.targetDexId = nextTarget.dexId;
      scene.targetName = nextTarget.name;
      scene.targetImage = nextTarget.image;
      scene.targetStaticImage = nextTarget.staticImage || nextTarget.image;
      scene.targetLevel = nextTarget.level;
      scene.targetElement = nextTarget.element;
      scene.targetSubElement = nextTarget.subElement;
      scene.targetAbility = nextTarget.ability;
      scene.targetHp = nextTarget.hp;
      scene.targetMaxHp = nextTarget.maxHp;
      scene.uiTargetHp = nextTarget.hp;
      scene.uiTargetMaxHp = nextTarget.maxHp;
      scene.targetState = normalizeBattleState(nextTarget.battleState);
      scene.targetSkills = nextTarget.skills;
      scene.fxTargetDefeated = false;
      scene.pendingEndTurnTick = false;
      scene.pendingFinish = false;
      scene.isActing = false;
      resetBattleAnimIdle(scene);
      pushBattleLog(scene, `${meta.label}学习力战场刷新守卫：${meta.guardianName} Lv.10。`);
      return true;
    };
    const finalizeBattleScene = (scene, win, reason = "") => {
      if (!scene || scene.ended) return;
      applyBattleDamageToActivePet(scene);
      scene.win = Boolean(win);

      const activePet = state.value.activePets.find((p) => p.id === scene.currentAttackerId) || firstPet.value || null;
      const target = dexById.get(Number(scene.targetDexId)) || selectedDexEntry.value;
      if (!target) return;

      let expGain = 0;
      let hCoinGain = 0;
      let unlockText = "";
      let expDistribution = [];
      if (win) {
        const rewardEventActive = Boolean(scene.rewardEventActive) || (scene.mode !== "study" && isDoubleRewardTimeAt(Date.now()));
        const rewardEventMultiplier = rewardEventActive ? Math.max(1, Math.floor(Number(scene.rewardEventMultiplier) || 2)) : 1;
        const expMultiplier = Math.max(1, Math.floor(Number(scene.expMultiplier) || 1));
        if (scene.mode === "study") {
          const reward = grantStudyReward(scene);
          unlockText = reward.added > 0
            ? `${reward.pet ? petDisplayName(reward.pet) : scene.attackerName} 获得${scene.studyMeta.label}学习力 +${reward.added}，当前 ${reward.current}/255。`
            : `${scene.studyMeta.label}学习力已达到上限。`;
          pushBattleLog(scene, unlockText);
          if (!reward.full && restartStudyBattle(scene)) {
            scene.expGain = 0;
            scene.hCoinGain = 0;
            scene.unlockText = unlockText;
            scene.summary = unlockText;
            return;
          }
        } else {
          expGain = calcWinExp(scene.targetLevel) * expMultiplier;
          const receivers = bagPets.value.filter((p) => p && p.id);
          if (receivers.length > 0) {
            const avg = Math.floor(expGain / receivers.length);
            const rem = expGain % receivers.length;
            receivers.forEach((pet, idx) => {
              const row = grantExp(pet, avg + (idx < rem ? 1 : 0));
              expDistribution.push(row);
            });
            pushBattleLog(scene, `获得总经验 ${expGain}，由背包 ${receivers.length} 只亚比平均共享。`);
            if (expMultiplier > 1) pushBattleLog(scene, `经验倍率已结算，本场经验 ×${expMultiplier}。`);
          } else if (activePet) {
            expDistribution.push(grantExp(activePet, expGain));
            if (expMultiplier > 1) pushBattleLog(scene, `经验倍率已结算，本场经验 ×${expMultiplier}。`);
          }
        }
        if (scene.mode === "timeTunnel") {
          const floor = Math.max(1, Math.floor(Number(scene.timeTunnelMeta && scene.timeTunnelMeta.floor) || 1));
          hCoinGain = floor * 300;
          state.value.timeTunnelMaxClearedFloor = Math.max(timeTunnelMaxClearedFloor.value, floor);
          unlockText = `时空隧道第${floor}层挑战成功，通往下一层的门已开启。`;
          pushBattleLog(scene, unlockText);
          grantZongziReward(scene, 4, `通过时空隧道第${floor}层`);
          const rewardCfg = TIME_TUNNEL_REWARDS_BY_FLOOR[floor];
          if (rewardCfg) {
            if (!Array.isArray(state.value.timeTunnelRewardClaimedFloors)) state.value.timeTunnelRewardClaimedFloors = [];
            if (!state.value.timeTunnelRewardClaimedFloors.includes(floor)) {
              state.value.timeTunnelRewardClaimedFloors.push(floor);
              const baseStageHCoins = Math.max(0, Math.floor(Number(rewardCfg.hCoins) || 0));
              const stageHCoins = baseStageHCoins * rewardEventMultiplier;
              if (stageHCoins > 0) {
                state.value.hCoins = Math.max(0, Math.floor(Number(state.value.hCoins) || 0)) + stageHCoins;
              }
              (Array.isArray(rewardCfg.items) ? rewardCfg.items : []).forEach((item) => {
                addItemCount(item.id, item.count);
              });
              const rewardTexts = [
                ...((Array.isArray(rewardCfg.items) ? rewardCfg.items : []).map((item) => `${item.label} x${item.count}`)),
                ...(stageHCoins > 0 ? [`${stageHCoins}H币${rewardEventActive ? "（双倍奖励）" : ""}`] : [])
              ];
              pushBattleLog(scene, `阶段奖励已发放：${rewardTexts.join("、")}。`);
              queueRewardFlyToasts([
                ...((Array.isArray(rewardCfg.items) ? rewardCfg.items : []).map((item) => `获取${item.label}×${item.count}！`)),
                ...(stageHCoins > 0 ? [`获取${stageHCoins}H币！`] : [])
              ]);
            } else {
              pushBattleLog(scene, `第${floor}层阶段奖励已领取过，本次不重复发放。`);
            }
          }
        } else if (scene.mode === "guardian") {
          hCoinGain = isExtraGuardianName(target.name) ? 1000 : 500;
          const advanced = switchGuardianStage(scene);
          if (advanced) {
            scene.expGain = expGain;
            scene.hCoinGain = 0;
            scene.unlockText = "";
            scene.summary = `${scene.attackerName} 守住当前阶段并获得 ${expGain} EXP，继续挑战。`;
            pushBattleLog(scene, scene.summary);
            scene.isActing = false;
            scene.pendingEndTurnTick = false;
            scene.pendingFinish = false;
            return;
          }
          markDefeatedDex(target.dexId);
          if (!state.value.activatedDexIds.includes(target.dexId)) state.value.activatedDexIds.push(target.dexId);
          recordGuardianBadgeWin(target.name);
          grantZongziReward(scene, 5, `${target.name}守护者挑战成功`);
          const canDropEgg = canDropEggByActionDexId(target.dexId);
          const alreadyHadEgg = hasObtainedEggDex(target.dexId);
          if (!canDropEgg) {
            unlockText = `${target.name} 守护者全阶段挑战成功，但缺少可出战动作资源，不掉落亚比蛋。`;
          } else if (!alreadyHadEgg) {
            state.value.eggs.unshift({
              id: uid(),
              dexId: target.dexId,
              speciesName: target.name,
              startAt: Date.now(),
              hatchAt: Date.now() + HATCH_MS
            });
            markObtainedEggDex(target.dexId);
            unlockText = `${target.name} 守护者全阶段挑战成功，获得 1 个亚比蛋。`;
          } else {
            unlockText = `${target.name} 守护者全阶段挑战成功，亚比蛋已获取过，不重复发放。`;
          }
        } else if (scene.mode === "boss") {
          hCoinGain = 2000;
          markDefeatedDex(target.dexId);
          if (!state.value.activatedDexIds.includes(target.dexId)) state.value.activatedDexIds.push(target.dexId);
          grantBossFirstWinRewardV1(target.name, scene.guardianMeta && scene.guardianMeta.bossDifficulty);
          const bossDifficultyKey = normalize(scene.guardianMeta && scene.guardianMeta.bossDifficulty) || "normal";
          const bossZongziRewards = { normal: 10, hard: 20, nightmare: 40 };
          grantZongziReward(scene, bossZongziRewards[bossDifficultyKey] || 10, `${target.name} BOSS${(scene.guardianMeta && scene.guardianMeta.bossDifficultyLabel) || ""}难度挑战成功`);
          const canDropEgg = canDropEggByActionDexId(target.dexId);
          const alreadyHadEgg = hasObtainedEggDex(target.dexId);
          if (!canDropEgg) {
            unlockText = `${target.name} BOSS挑战成功，但缺少可出战动作资源，不掉落亚比蛋。`;
          } else if (!alreadyHadEgg) {
            state.value.eggs.unshift({
              id: uid(),
              dexId: target.dexId,
              speciesName: target.name,
              startAt: Date.now(),
              hatchAt: Date.now() + HATCH_MS
            });
            markObtainedEggDex(target.dexId);
            unlockText = `${target.name} BOSS挑战成功，获得 1 个亚比蛋。`;
          } else {
            unlockText = `${target.name} BOSS挑战成功，亚比蛋已获取过，不重复发放。`;
          }
        } else if (scene.mode === "weeklyBoss") {
          const difficultyKey = normalize(scene.guardianMeta && scene.guardianMeta.weeklyBossDifficulty) || "normal";
          const difficulty = WEEKLY_BOSS_DIFFICULTY_BY_KEY.get(difficultyKey) || WEEKLY_BOSS_DIFFICULTY_OPTIONS[0];
          hCoinGain = Math.max(0, Math.floor(Number(difficulty.rewardHCoins) || 0));
          markDefeatedDex(target.dexId);
          if (!state.value.activatedDexIds.includes(target.dexId)) state.value.activatedDexIds.push(target.dexId);
          const medalRoll = rollWeeklyBossMedalReward(difficulty);
          const medalGain = addWeeklyBossMedals(medalRoll);
          const weeklyRewardState = ensureWeeklyBossRewardState();
          weeklyRewardState.clearedDifficulties = {
            ...(weeklyRewardState.clearedDifficulties && typeof weeklyRewardState.clearedDifficulties === "object" ? weeklyRewardState.clearedDifficulties : {}),
            [difficulty.key]: true
          };
          const rewardTexts = [];
          if (medalGain > 0) {
            rewardTexts.push(`当周BOSS勋章×${medalGain}`);
            pushBattleLog(scene, `获得 当周BOSS勋章×${medalGain}（当前${weeklyBossMedalCount.value}/${WEEKLY_BOSS_MEDAL_MAX}）。`);
          } else if (medalRoll > 0) {
            pushBattleLog(scene, `当周BOSS勋章已达上限${WEEKLY_BOSS_MEDAL_MAX}个，本次不再增加。`);
          }
          if (!weeklyRewardState.divinePetKeyClaimed && Math.max(0, Math.floor(Number(difficulty.divinePetKeyCount) || 0)) > 0) {
            const keyCount = Math.max(0, Math.floor(Number(difficulty.divinePetKeyCount) || 0));
            addItemCount("divine_pet_key", keyCount);
            weeklyRewardState.divinePetKeyClaimed = true;
            rewardTexts.push(`神宠之匙×${keyCount}`);
            pushBattleLog(scene, `首次获得当周BOSS神宠之匙奖励：神宠之匙×${keyCount}。`);
          }
          if (difficulty.blackgoldBadge) {
            if (!state.value.weeklyBossHonorRewards || typeof state.value.weeklyBossHonorRewards !== "object") state.value.weeklyBossHonorRewards = {};
            if (!state.value.weeklyBossHonorRewards[WEEKLY_BOSS_CONFIG.key]) {
              state.value.weeklyBossHonorRewards[WEEKLY_BOSS_CONFIG.key] = {
                name: WEEKLY_BOSS_CONFIG.honorBadgeName,
                bossName: WEEKLY_BOSS_CONFIG.name,
                badgeId: weeklyBossHonorBadgeIdOf(WEEKLY_BOSS_CONFIG.key),
                claimedAt: Date.now()
              };
              rewardTexts.push(WEEKLY_BOSS_CONFIG.honorBadgeName);
              pushBattleLog(scene, `获得 ${WEEKLY_BOSS_CONFIG.honorBadgeName}。`);
            }
          }
          unlockText = `${WEEKLY_BOSS_CONFIG.name} 当周BOSS${difficulty.label}难度挑战成功，获得${rewardTexts.length > 0 ? rewardTexts.join("、") : "重复奖励"}。`;
          scene._weeklyBossRewardFlyBase = [
            ...(medalGain > 0 ? [`获取当周BOSS勋章×${medalGain}！`] : []),
            ...rewardTexts.filter((text) => !text.startsWith("当周BOSS勋章")).map((text) => `获取${text}！`)
          ];
        } else {
          hCoinGain = Math.max(0, Math.floor(Number(scene.targetLevel) || 0) * 2);
          const targetChain = getChainStageInfoByDexId(target.dexId, target.name);
          const isFinalForm = targetChain.formCount <= 1 || targetChain.stageIndex >= (targetChain.formCount - 1);
          markDefeatedDex(target.dexId);
          if (!state.value.activatedDexIds.includes(target.dexId)) state.value.activatedDexIds.push(target.dexId);
          if (isFinalForm) {
            const hatchDexId = Number(targetChain.rootDexId) || target.dexId;
            const hatchDex = dexById.get(hatchDexId) || target;
            const canDropEgg = canDropEggByActionDexId(hatchDex.dexId);
            const alreadyHadEgg = hasObtainedEggDex(hatchDex.dexId);
            if (!canDropEgg) {
              unlockText = `${target.name}（最终形态）挑战成功，但缺少可出战动作资源，不掉落亚比蛋。`;
            } else if (!alreadyHadEgg) {
              state.value.eggs.unshift({
                id: uid(),
                dexId: hatchDex.dexId,
                speciesName: hatchDex.name,
                startAt: Date.now(),
                hatchAt: Date.now() + HATCH_MS
              });
              markObtainedEggDex(hatchDex.dexId);
              unlockText = `${target.name}（最终形态）挑战成功，获得 1 个亚比蛋。`;
            } else {
              unlockText = `${target.name}（最终形态）挑战成功，亚比蛋已获取过，不重复发放。`;
            }
          } else {
            unlockText = `${target.name} 不是最终形态，已激活图鉴但不掉落亚比蛋。`;
          }
        }
        if (hCoinGain > 0) {
          const baseHCoinGain = hCoinGain;
          hCoinGain = baseHCoinGain * rewardEventMultiplier;
          state.value.hCoins = Math.max(0, Math.floor(Number(state.value.hCoins) || 0)) + hCoinGain;
          pushBattleLog(scene, rewardEventMultiplier > 1 ? `双倍H币生效：${baseHCoinGain} -> ${hCoinGain} H币。` : `获得 ${hCoinGain} H币。`);
          if (Array.isArray(scene._weeklyBossRewardFlyBase)) {
            queueRewardFlyToasts([
              ...scene._weeklyBossRewardFlyBase,
              `获取${hCoinGain}H币！`
            ]);
            scene._weeklyBossRewardFlyBase = null;
          }
        }
      }
      if (scene.mode === "normal" && scene.guardianMeta && scene.guardianMeta.dexChallenge) {
        grantZongziReward(scene, 1, `${target.name}图鉴挑战${win ? "完成" : "结束"}`);
      }
      scene.ended = true;
      scene.expGain = expGain;
      scene.hCoinGain = hCoinGain;
      scene.unlockText = unlockText;
      scene.summary = win
        ? `${scene.attackerName} 成功击败 ${scene.targetName}。`
        : `${scene.attackerName} 挑战失败${reason ? `：${reason}` : ""}。`;
      battleResult.value = {
        win,
        expGain,
        hCoinGain,
        unlockText,
        summary: scene.summary,
        expDistribution,
        expMultiplier: Math.max(1, Math.floor(Number(scene.expMultiplier) || 1)),
        deviceExpMultiplier: Math.max(1, Math.floor(Number(scene.deviceExpMultiplier) || 1)),
        rewardEventActive: Boolean(scene.rewardEventActive),
        rewardEventMultiplier: Math.max(1, Math.floor(Number(scene.rewardEventMultiplier) || 1)),
        autoBattleText: scene.autoBattleMeta ? `自动战斗：本轮已完成 ${Math.max(0, Math.floor(Number(scene.autoBattleMeta.completed) || 0))}/${Math.max(1, Math.floor(Number(scene.autoBattleMeta.total) || 10))}，剩余次数 ${getItemCount("auto_battle_device")}` : "",
        repeatDexId: scene.mode === "normal" && !scene.autoBattleMeta ? Number(scene.targetDexId) || 0 : 0,
        repeatTargetLevel: scene.mode === "normal" && !scene.autoBattleMeta ? Math.max(1, Math.floor(Number(scene.targetLevel) || 1)) : 0
      };
      stopChallengeRecording();
      if (scene.autoBattleMeta) {
        if (!win) {
          stopAutoBattleRun("自动战斗已因挑战失败而停止，剩余次数已保留。");
        } else if (autoBattleRun.value) {
          autoBattleRun.value.remaining = Math.max(0, Math.floor(Number(autoBattleRun.value.remaining) || 0));
          setTimeout(() => {
            if (battleResult.value && autoBattleRun.value) closeBattleResult();
          }, 900);
        }
      }
      if (scene.mode === "timeTunnel") {
        restoreTimeTunnelEnvironmentAfterBattle(scene, win);
      }
      if (win && scene.mode === "timeTunnel") {
        openTimeTunnelDoor({
          floor: Math.max(1, Math.floor(Number(scene.timeTunnelMeta && scene.timeTunnelMeta.floor) || 1)),
          environment: scene.timeTunnelMeta ? { element: scene.timeTunnelMeta.environmentElement, name: scene.timeTunnelMeta.environmentName } : null,
          enemies: Array.isArray(scene.timeTunnelMeta && scene.timeTunnelMeta.enemies) ? scene.timeTunnelMeta.enemies : []
        });
      }
      if (win) {
        const evoList = (expDistribution || []).filter((x) => x && x.evolved);
        if (evoList.length > 0) {
          evolutionQueue.value.push(...evoList);
          tryOpenNextEvolution();
        }
      }
      closeBattleScene();

      state.value.battleLog.unshift({
        id: uid(),
        win,
        attacker: scene.attackerName,
        attackerLevel: scene.attackerLevel,
        target: scene.targetName,
        targetLevel: scene.targetLevel,
        expGain,
        time: new Date().toLocaleTimeString("zh-CN", { hour12: false })
      });
      state.value.battleLog = sanitizeBattleLog(state.value.battleLog).slice(0, 30);
    };
    const castBattleSkill = (skillName) => {
      const scene = battleScene.value;
      if (!scene || !scene.open || scene.ended || scene.isActing || scene.pendingFinish) return;
      const key = normalizeSkillKey(skillName);
      const autoSkill = consumeTurnSequenceAttackSkill(scene, "attacker", scene.skills);
      const skill = autoSkill || (scene.skills || []).find((s) => normalizeSkillKey(s.name) === key);
      if (!skill || skill.pp <= 0) return;
      if (hasUsedOncePerBattleSkill(scene, "attacker", skill)) {
        showToast(`${skill.name} 一场战斗只能使用一次。`);
        return;
      }
      if (autoSkill) pushBattleLog(scene, `${scene.attackerName}延续${skill.name}，本回合自动使用该技能。`);
      scene.isActing = true;
      const targetSkill = targetNeedsAutoPpBean(scene)
        ? { name: "__AUTO_PP_BEAN__", pp: 1, ppMax: 1, _autoPpBeanAction: true }
        : pickTargetSkill(scene, battleSceneTargetSkills.value.filter((s) => s.pp > 0));
      queueBattleTurnActions(scene, [
        { side: "attacker", skill },
        { side: "target", skill: targetSkill }
      ]);
    };
    const consumeBattleTurnAfterItem = () => {
      const scene = battleScene.value;
      if (!scene || !scene.open || scene.ended || scene.pendingFinish) return;
      const beforeAct = beforeActionCheck(scene, "attacker");
      if (beforeAct.log) pushBattleLog(scene, beforeAct.log);
      scene.isActing = true;
      queueTargetCounterAttack();
    };
    const switchBattlePet = (unitId) => {
      const scene = battleScene.value;
      if (!scene || scene.ended || scene.isActing || scene.pendingFinish) return;
      if (switchPanelMode.value === "manual" && Math.max(0, Number(getSideState(scene, "attacker").statuses.bind) || 0) > 0) {
        pushBattleLog(scene, `${scene.attackerName}处于束缚状态，无法主动替换亚比。`);
        showToast("束缚状态下无法主动换宠。");
        return;
      }
      if (switchPanelMode.value === "manual") {
        scene.attackerState = clearBattleStatuses(scene.attackerState);
      }
      applyBattleDamageToActivePet(scene);
      const id = String(unitId || "");
      if (!id || id === scene.currentAttackerId) return;
      const next = (scene.team || []).find((u) => u.id === id && u.hp > 0);
      if (!next) return;
      applyBattleUnitToAttackerSide(scene, next);
      if (scene.nextPetFullRestore) {
        scene.nextPetFullRestore = false;
        scene.attackerHp = scene.attackerMaxHp;
        scene.uiAttackerHp = scene.attackerHp;
        scene.attackerState = createBattleState();
        scene.skills = (Array.isArray(next.skills) ? next.skills : []).map((s) => ({ ...s, pp: Math.max(1, Number(s.ppMax) || Number(s.pp) || 1) }));
        const teamIdx = scene.team.findIndex((u) => u && u.id === next.id);
        if (teamIdx >= 0) {
          scene.team[teamIdx].hp = scene.attackerHp;
          scene.team[teamIdx].battleState = normalizeBattleState(scene.attackerState);
          scene.team[teamIdx].skills = scene.skills;
        }
        pushBattleLog(scene, `${next.name}因神秘仪式满状态回复。`);
      }
      clearBattleFloatTextIfExpired(scene, true);
      resetBattleVisualHold(scene);
      scene.fxAttackerDefeated = false;
      resetBattleAnimIdle(scene);
      pushBattleLog(scene, `我方换宠：${next.name} 上场。`);
      showSwitchPanel.value = false;
      const mode = switchPanelMode.value;
      switchPanelMode.value = "manual";
      if (mode === "manual" || (mode === "forced" && scene.pendingForcedSwitchTargetAction)) {
        scene.pendingForcedSwitchTargetAction = false;
        scene.pendingForcedSwitchFinishTurn = false;
        scene.isActing = true;
        queueTargetCounterAttack();
      } else if (mode === "forced" && scene.pendingForcedSwitchFinishTurn) {
        scene.pendingForcedSwitchFinishTurn = false;
        scene.isActing = true;
        finishBattleTurnVisuals(scene);
      }
    };
    const openSwitchPanel = (mode = "manual") => {
      const scene = battleScene.value;
      if (!scene || scene.ended || scene.isActing || scene.pendingFinish) return;
      switchPanelMode.value = mode;
      showSwitchPanel.value = true;
    };
    const closeSwitchPanel = () => {
      if (switchPanelMode.value === "forced") return;
      showSwitchPanel.value = false;
    };
    const closeBattleScene = () => {
      if (battleScene.value && battleScene.value.autoBattleMeta && !battleScene.value.ended) {
        stopAutoBattleRun("自动战斗已停止，剩余次数已保留。");
      }
      if (activeChallengeRecording.value) stopChallengeRecording();
      if (battleScene.value) {
        battleScene.value.pendingFinish = false;
        if (battleScene.value._petAnimTargetAutoIdleTimer) { clearTimeout(battleScene.value._petAnimTargetAutoIdleTimer); battleScene.value._petAnimTargetAutoIdleTimer = null; }
        if (battleScene.value._petAnimAttackerAutoIdleTimer) { clearTimeout(battleScene.value._petAnimAttackerAutoIdleTimer); battleScene.value._petAnimAttackerAutoIdleTimer = null; }
        if (battleScene.value._attackerTransformTimer) { clearTimeout(battleScene.value._attackerTransformTimer); battleScene.value._attackerTransformTimer = null; }
        battleScene.value._petAnimTargetPlayLock = false;
        battleScene.value._petAnimAttackerPlayLock = false;
      }
      battleScene.value = null;
      battleLogCollapsed.value = false;
      battleStageHoverSide.value = "";
      battleStagePinnedSide.value = "";
      stopBattleBgm();
      showSwitchPanel.value = false;
      switchPanelMode.value = "manual";
      refreshSceneBgm();
    };
    const toggleBattleLogCollapsed = () => {
      battleLogCollapsed.value = !battleLogCollapsed.value;
    };
    const showBattleStageSide = (side) => {
      battleStageHoverSide.value = side === "attacker" ? "attacker" : "target";
    };
    const toggleBattleStagePinnedSide = (side) => {
      const safeSide = side === "attacker" ? "attacker" : "target";
      if (battleStagePinnedSide.value === safeSide) {
        battleStagePinnedSide.value = "";
        battleStageHoverSide.value = "";
        return;
      }
      battleStageHoverSide.value = safeSide;
      battleStagePinnedSide.value = safeSide;
    };
    const clearBattleStagePinnedSide = (side = "") => {
      const safeSide = side === "attacker" ? "attacker" : (side === "target" ? "target" : "");
      if (!safeSide || battleStageHoverSide.value === safeSide) battleStageHoverSide.value = "";
      if (!safeSide || battleStagePinnedSide.value === safeSide) battleStagePinnedSide.value = "";
    };
    const isBattleStageVisibleSide = (side) => {
      const safeSide = side === "attacker" ? "attacker" : "target";
      return battleStageHoverSide.value === safeSide || battleStagePinnedSide.value === safeSide;
    };
    const openBattleItemPanel = () => {
      const scene = battleScene.value;
      if (!scene || scene.ended || scene.isActing || scene.pendingFinish) return;
      battleActionTab.value = "items";
      shopTargetPetId.value = scene.currentAttackerId || "";
    };
    const openBattleSkillPanel = () => {
      const scene = battleScene.value;
      if (!scene || scene.ended || scene.isActing || scene.pendingFinish) return;
      battleActionTab.value = "skills";
    };
    const clearSkillLongPress = () => {
      if (skillLongPressTimer.value) {
        clearTimeout(skillLongPressTimer.value);
        skillLongPressTimer.value = null;
      }
    };
    const onBattleSkillTouchStart = (skill) => {
      clearSkillLongPress();
      if (!skill) return;
      skillLongPressTimer.value = setTimeout(() => {
        const text = skillBattleDesc(skill);
        if (text) showToast(text);
      }, 420);
    };
    const onBattleSkillTouchEnd = () => {
      clearSkillLongPress();
    };

    const dexStatus = (entry) => {
      if (isLegacyBossEntry(entry)) return "绝版BOSS";
      if (isGuardianName(entry.name)) return "守护者";
      if (isBossEntry(entry)) return "BOSS";
      if (isShopEggEntry(entry)) return "商店蛋";
      if (state.value.activatedDexIds.includes(entry.dexId)) return "已激活";
      return "未激活";
    };
    const statusClass = (entry) => {
      const s = dexStatus(entry);
      if (s === "绝版BOSS") return "bg-slate-200 text-slate-700";
      if (s === "守护者") return "bg-amber-100 text-amber-700";
      if (s === "BOSS") return "bg-rose-100 text-rose-700";
      if (s === "商店蛋") return "bg-violet-100 text-violet-700";
      if (s === "已激活") return "bg-emerald-100 text-emerald-700";
      return "bg-slate-100 text-slate-500";
    };
    const expPercent = (pet) => {
      const need = expRequired(pet.level);
      if (!isFinite(need) || need <= 0) return 100;
      return clamp((pet.exp / need) * 100, 0, 100);
    };
    const formatRemain = (ms) => {
      if (ms <= 0) return "00:00";
      const sec = Math.floor(ms / 1000);
      return `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;
    };

    const inspectSkill = (skillName) => {
      selectedSkillName.value = normalizeSkillKey(skillName);
      syncSelectedSkillName();
    };
    const hasEquippedSkill = (pet, skillName) => {
      if (!pet) return false;
      const key = normalizeSkillKey(skillName);
      if (!key) return false;
      return (Array.isArray(pet.equippedSkills) ? pet.equippedSkills : [])
        .some((x) => normalizeSkillKey(x) === key);
    };
    const toggleEquipSkill = (skillName) => {
      const pet = selectedPet.value;
      if (!pet) return;
      const species = getSpeciesForPet(pet);
      if (!species) return;
      const nextSkill = normalizeSkillKey(skillName);
      if (!nextSkill) return;
      const skillLevel = skillLevelForPet(pet);
      const validSet = skillNameSetFromList(availableSkillsForSelectedPet.value);
      if (!validSet.has(nextSkill)) return;
      pet.equippedSkills = currentEquippedSkillNamesBySpecies(species, pet.equippedSkills, skillLevel, petExtraSkills(pet));
      const i = pet.equippedSkills.findIndex((x) => normalizeSkillKey(x) === nextSkill);
      if (i >= 0) { pet.equippedSkills.splice(i, 1); return; }
      if (pet.equippedSkills.length < 4) { pet.equippedSkills.push(nextSkill); return; }
      replaceSkillCtx.value = { petId: pet.id, newSkill: nextSkill };
    };
    const startDirectReplaceSkill = (oldSkill) => {
      const pet = selectedPet.value;
      if (!pet) return;
      const oldName = normalizeSkillKey(oldSkill);
      if (!oldName) return;
      replaceSkillCtx.value = { petId: pet.id, oldSkill: oldName, directReplaceMode: true };
    };
    const confirmDirectReplaceSkill = (newSkill) => {
      const pet = selectedPet.value;
      const ctx = replaceSkillCtx.value;
      if (!pet || !ctx || ctx.petId !== pet.id || !ctx.directReplaceMode) return;
      const species = getSpeciesForPet(pet);
      if (!species) { replaceSkillCtx.value = null; return; }
      const skillLevel = skillLevelForPet(pet);
      pet.equippedSkills = currentEquippedSkillNamesBySpecies(species, pet.equippedSkills, skillLevel, petExtraSkills(pet));
      const oldName = normalizeSkillKey(ctx.oldSkill);
      const newName = normalizeSkillKey(newSkill);
      const validSet = skillNameSetFromList(availableSkillsForSelectedPet.value);
      if (!oldName || !newName || !validSet.has(newName)) { replaceSkillCtx.value = null; return; }
      if (pet.equippedSkills.some((x) => normalizeSkillKey(x) === newName)) return;
      const idx = pet.equippedSkills.findIndex((x) => normalizeSkillKey(x) === oldName);
      if (idx >= 0) {
        pet.equippedSkills.splice(idx, 1, newName);
        pet.equippedSkills = currentEquippedSkillNamesBySpecies(species, pet.equippedSkills, skillLevel, petExtraSkills(pet));
      }
      replaceSkillCtx.value = null;
    };
    const confirmReplaceSkill = (oldSkill) => {
      const pet = selectedPet.value;
      const ctx = replaceSkillCtx.value;
      if (!pet || !ctx || ctx.petId !== pet.id) return;
      const species = getSpeciesForPet(pet);
      if (!species) { replaceSkillCtx.value = null; return; }
      const skillLevel = skillLevelForPet(pet);
      pet.equippedSkills = currentEquippedSkillNamesBySpecies(species, pet.equippedSkills, skillLevel, petExtraSkills(pet));
      const oldName = normalizeSkillKey(oldSkill);
      const newName = normalizeSkillKey(ctx.newSkill);
      const validSet = skillNameSetFromList(availableSkillsForSelectedPet.value);
      if (!newName || !validSet.has(newName)) { replaceSkillCtx.value = null; return; }
      const idx = pet.equippedSkills.indexOf(oldName);
      if (idx >= 0) {
        pet.equippedSkills.splice(idx, 1, newName);
        pet.equippedSkills = currentEquippedSkillNamesBySpecies(species, pet.equippedSkills, skillLevel, petExtraSkills(pet));
      }
      replaceSkillCtx.value = null;
    };
    const cancelReplaceSkill = () => { replaceSkillCtx.value = null; };

    const isInBag = (petId) => state.value.bagPetIds.includes(petId);
    const beginReplaceBag = (incomingPetId) => {
      if (!incomingPetId) return false;
      if (isInBag(incomingPetId)) return false;
      const incoming = safeActivePets.value.find((p) => p.id === incomingPetId);
      if (!incoming) return false;
      bagReplaceCtx.value = { incomingPetId };
      return true;
    };
    const addToBag = (petId) => {
      if (isInBag(petId)) return true;
      const emptyIdx = state.value.bagPetIds.findIndex((x) => !x);
      if (emptyIdx < 0) {
        if (beginReplaceBag(petId)) showToast("背包已满，请选择一个背包位进行替换。");
        return false;
      }
      state.value.bagPetIds.splice(emptyIdx, 1, petId);
      state.value.selectedAttackerId = state.value.bagPetIds[0] || "";
      return true;
    };
    const removeFromBag = (slotIdx) => {
      const removedId = state.value.bagPetIds[slotIdx] || "";
      state.value.bagPetIds.splice(slotIdx, 1, "");
      state.value.selectedAttackerId = state.value.bagPetIds[0] || "";
      if (removedId && state.value.selectedPetId === removedId) {
        state.value.selectedPetId = state.value.bagPetIds.find((id) => id) || "";
      }
    };
    const swapBagSlots = (a, b) => {
      if (a === b) return;
      const ids = state.value.bagPetIds;
      const tmp = ids[a];
      ids[a] = ids[b];
      ids[b] = tmp;
      state.value.selectedAttackerId = ids[0] || "";
    };
    const moveBagLeft = (slotIdx) => {
      if (slotIdx <= 0) return;
      swapBagSlots(slotIdx, slotIdx - 1);
    };
    const moveBagRight = (slotIdx) => {
      if (slotIdx >= 5) return;
      swapBagSlots(slotIdx, slotIdx + 1);
    };
    const setAsFirstPet = (petId) => {
      if (!petId) return;
      if (!isInBag(petId) && !addToBag(petId)) return;
      const idx = state.value.bagPetIds.indexOf(petId);
      if (idx < 0) return;
      if (idx !== 0) swapBagSlots(0, idx);
      state.value.selectedAttackerId = state.value.bagPetIds[0] || "";
    };
    const toggleBagByPet = (petId) => {
      const idx = state.value.bagPetIds.indexOf(petId);
      if (idx >= 0) removeFromBag(idx);
      else addToBag(petId);
    };
    const replaceBagSlot = (slotIdx) => {
      const ctx = bagReplaceCtx.value;
      if (!ctx) return;
      const idx = clamp(Number(slotIdx) || 0, 0, 5);
      const incomingPetId = String(ctx.incomingPetId || "");
      if (!incomingPetId) { bagReplaceCtx.value = null; return; }
      if (!safeActivePets.value.some((p) => p.id === incomingPetId)) {
        bagReplaceCtx.value = null;
        return;
      }
      const outgoingPetId = state.value.bagPetIds[idx] || "";
      state.value.bagPetIds.splice(idx, 1, incomingPetId);
      if (outgoingPetId && state.value.selectedPetId === outgoingPetId) {
        state.value.selectedPetId = incomingPetId;
      }
      state.value.selectedAttackerId = state.value.bagPetIds[0] || "";
      bagReplaceCtx.value = null;
      showToast(`已替换背包 ${idx + 1} 号位亚比。`);
    };
    const cancelReplaceBag = () => { bagReplaceCtx.value = null; };
    const useAsAttacker = (petId) => {
      setAsFirstPet(petId);
    };

    const selectDex = (dexId) => { state.value.selectedDexId = dexId; };
    const selectPet = (petId) => { state.value.selectedPetId = petId; };
    const toggleDexPanel = () => { state.value.showDexPanel = !state.value.showDexPanel; };
    const openDexPanel = () => { state.value.showDexPanel = true; };
    const closeDexPanel = () => { state.value.showDexPanel = false; };
    const openBagPanel = () => {
      showBagPanel.value = true;
    };
    const closeBagPanel = () => {
      showBagPanel.value = false;
    };
    const openWarehousePanel = () => {
      showWarehousePanel.value = true;
      playSceneBgm(WAREHOUSE_BGM_SRC);
    };
    const closeWarehousePanel = () => {
      showWarehousePanel.value = false;
      selectedWarehousePetId.value = "";
      showWarehouseActionModal.value = false;
      refreshSceneBgm();
    };
    const toggleWarehousePetActions = (petId) => {
      const id = String(petId || "");
      if (!id) return;
      selectedWarehousePetId.value = id;
      showWarehouseActionModal.value = true;
    };
    const isWarehousePetExpanded = (petId) => selectedWarehousePetId.value === String(petId || "");
    const closeWarehouseActionModal = () => { showWarehouseActionModal.value = false; };
    const addToBagFromWarehouse = (petId) => {
      const ok = addToBag(petId);
      if (ok) closeWarehouseActionModal();
      return ok;
    };
    const selectedWarehouseActionPet = computed(() => state.value.activePets.find((p) => p && p.id === selectedWarehousePetId.value) || null);
    const openLeaderboardPanel = () => {
      showLeaderboardPanel.value = true;
      leaderboardPage.value = 1;
      consumePreloadedLeaderboard(leaderboardMetric.value);
      fetchLeaderboard();
    };
    const closeLeaderboardPanel = () => {
      showLeaderboardPanel.value = false;
    };
    const setLeaderboardMetric = (key) => {
      if (!leaderboardTabs.some((x) => x.key === key)) return;
      leaderboardMetric.value = key;
      leaderboardPage.value = 1;
      consumePreloadedLeaderboard(key);
      fetchLeaderboard();
    };
    const changeLeaderboardPage = (delta) => {
      const next = clamp((Math.floor(Number(leaderboardPage.value) || 1) + Math.floor(Number(delta) || 0)), 1, Math.max(1, leaderboardTotalPages.value));
      if (next === leaderboardPage.value) return;
      leaderboardPage.value = next;
      fetchLeaderboard();
    };
    const refreshLeaderboard = () => {
      fetchLeaderboard();
    };
    const formatLeaderboardValue = (row) => {
      const value = row && row[leaderboardMetric.value];
      return Math.max(0, Math.floor(Number(value) || 0)).toLocaleString("zh-CN");
    };
    const openBadgePanel = () => { showBadgePanel.value = true; };
    const closeBadgePanel = () => { showBadgePanel.value = false; };
    const equipBadge = (badgeId) => {
      const id = normalize(badgeId);
      if (!id || !ownedBadges.value.some((b) => b.id === id)) return;
      state.value.equippedBadgeId = id;
      closeBadgePanel();
      const badge = ownedBadges.value.find((b) => b.id === id);
      showToast(`已佩戴徽章：${badge ? badge.name : "徽章"}`);
    };
    const unequipBadge = () => {
      state.value.equippedBadgeId = "";
      showToast("已卸下徽章。");
    };
    const openShopPanel = () => {
      showShopPanel.value = true;
      shopTab.value = "shop";
      playSceneBgm(SHOP_BGM_SRC);
      if (!shopTargetPetId.value) {
        const first = bagPets.value[0];
        shopTargetPetId.value = first ? first.id : "";
      }
    };
    const closeShopPanel = () => {
      showShopPanel.value = false;
      refreshSceneBgm();
    };
    const openRedeemGiftPanel = () => {
      openShopPanel();
      shopTab.value = "redeem";
    };
    const openEggHatchPanel = () => {
      showEggHatchPanel.value = true;
    };
    const closeEggHatchPanel = () => {
      showEggHatchPanel.value = false;
    };
    const buyShopItem = (itemId) => {
      const id = normalize(String(itemId || ""));
      if (!id) return;
      const item = shopItems.value.find((x) => normalize(x.id) === id);
      if (!item) return;
      const price = Math.max(0, Math.floor(Number(item.price) || 0));
      const quantity = shopBuyQuantity(id);
      const totalPrice = price * quantity;
      const wallet = Math.max(0, Math.floor(Number(state.value.hCoins) || 0));
      if (wallet < totalPrice) return showToast(`H币不足，需要 ${totalPrice} H币。`);
      state.value.hCoins = wallet - totalPrice;
      const gainCount = id === "double_exp_device" || id === "auto_battle_device" ? quantity * 10 : quantity;
      addItemCount(id, gainCount);
      showToast(totalPrice > 0 ? `已购买 ${item.name} x${quantity}，获得 ${gainCount} 次可用次数，花费 ${totalPrice} H币。` : `已获取 ${item.name} x${quantity}。`);
    };
    const buyShopEgg = (dexId) => {
      const entry = dexById.get(Number(dexId));
      if (!entry || !isShopEggEntry(entry)) return showToast("该亚比蛋暂未上架。");
      const price = SHOP_EGG_PRICE;
      const wallet = Math.max(0, Math.floor(Number(state.value.hCoins) || 0));
      if (wallet < price) return showToast(`H币不足，需要 ${price} H币。`);
      if (hasObtainedEggDex(entry.dexId)) return showToast(`${entry.name} 的亚比蛋已拥有，不重复购买。`);
      state.value.hCoins = wallet - price;
      state.value.eggs.unshift({
        id: uid(),
        dexId: entry.dexId,
        speciesName: entry.name,
        startAt: Date.now(),
        hatchAt: Date.now() + HATCH_MS
      });
      markObtainedEggDex(entry.dexId);
      showToast(`已购买 ${entry.name} 亚比蛋，花费 ${price} H币。`);
    };
    const redeemShopCode = () => {
      const code = normalize(shopRedeemCodeInput.value).replace(/\s+/g, "").toUpperCase();
      if (!code) return showToast("请输入兑换码。");
      if (code !== SHOP_REDEEM_CODE_ALHUB666) return showToast("该兑换码无效。");
      if (!Array.isArray(state.value.redeemedCodes)) state.value.redeemedCodes = [];
      if (state.value.redeemedCodes.map((row) => normalize(row).toUpperCase()).includes(code)) {
        return showToast("该兑换码已经使用过了。");
      }
      const entry = dexById.get(SHOP_REDEEM_CODE_ALHUB666_DEX_ID) || findDexByName(SHOP_REDEEM_CODE_ALHUB666_PET_NAME);
      if (!entry) return showToast(`兑换失败：缺少${SHOP_REDEEM_CODE_ALHUB666_PET_NAME}图鉴数据。`);
      state.value.redeemedCodes.push(code);
      state.value.eggs.unshift({
        id: uid(),
        dexId: entry.dexId,
        speciesName: entry.name,
        source: SHOP_REDEEM_CODE_ALHUB666_SOURCE,
        startAt: Date.now(),
        hatchAt: Date.now() + HATCH_MS
      });
      addItemCount("talent_boost_capsule", 20);
      state.value.hCoins = Math.max(0, Math.floor(Number(state.value.hCoins) || 0)) + 80000;
      addItemCount("time_tunnel_big_exp_fruit", 10);
      addItemCount("divine_pet_key", 10);
      shopRedeemCodeInput.value = "";
      queueRewardFlyToasts([
        `获取${entry.name}亚比蛋×1！`,
        "获取天赋增强胶囊×20！",
        "获取80000H币！",
        "获取大经验果×10！",
        "获取神宠之匙×10！"
      ]);
      showToast("兑换成功，奖励已发放。");
    };
    const openQixingGachaPanel = () => {
      ensureQixingGachaState();
      showQixingGachaPanel.value = true;
    };
    const closeQixingGachaPanel = () => {
      showQixingGachaPanel.value = false;
    };
    const pickQixingGachaPoolEntry = (phase) => {
      const pool = Array.isArray(phase && phase.pool) ? phase.pool : [];
      const total = pool.reduce((sum, row) => sum + (Number(row.probability) || 0), 0);
      let roll = Math.random() * total;
      for (const row of pool) {
        roll -= Number(row.probability) || 0;
        if (roll <= 0) return row;
      }
      return pool[pool.length - 1] || null;
    };
    const grantQixingGachaEgg = (entry) => {
      const dex = dexById.get(Number(entry.dexId)) || null;
      if (!dex) return { granted: false, label: entry.label, notice: `${entry.label}缺少图鉴数据，已跳过。` };
      state.value.eggs.unshift({
        id: uid(),
        dexId: dex.dexId,
        speciesName: dex.name,
        startAt: Date.now(),
        hatchAt: Date.now() + HATCH_MS
      });
      markObtainedEggDex(dex.dexId);
      if (entry.limitedKey) ensureQixingGachaState().limitedEggs[entry.limitedKey] = true;
      return { granted: true, label: `${dex.name}亚比蛋` };
    };
    const mergeQixingGachaResult = (summary, key, label, count = 1) => {
      if (!summary[key]) summary[key] = { label, count: 0 };
      summary[key].count += Math.max(1, Math.floor(Number(count) || 1));
    };
    const drawQixingGacha = (times = 1) => {
      const drawCount = clamp(Math.floor(Number(times) || 1), 1, 10);
      if (qixingGachaDrawing.value) return;
      const phase = selectedQixingGachaPhase.value;
      if (!selectedQixingGachaPhaseUnlocked.value) return showToast(qixingGachaPhaseLockText.value || "当前阶段尚未解锁。");
      if (getItemCount("divine_pet_key") < drawCount) return showToast(`神宠之匙不足，抽取需要 ${drawCount} 个。`);
      qixingGachaDrawing.value = true;
      consumeItemCount("divine_pet_key", drawCount);
      const gacha = ensureQixingGachaState();
      const summary = {};
      const notices = [];
      const grantDuplicateLimitedFallback = (entry) => {
        const amount = 10;
        addItemCount(QIXING_FRAGMENT_ITEM_ID, amount);
        mergeQixingGachaResult(summary, `item_${QIXING_FRAGMENT_ITEM_ID}`, "启星碎片", amount);
        notices.push(`${entry.label}已通过启星转盘获取过，自动替换为启星碎片×${amount}。`);
      };
      const grantQixingGachaEntry = (entry) => {
        if (!entry) return;
        if (entry.type === "hcoin") {
          const amount = Math.max(0, Math.floor(Number(entry.amount) || 0));
          state.value.hCoins = Math.max(0, Math.floor(Number(state.value.hCoins) || 0)) + amount;
          mergeQixingGachaResult(summary, "hcoin", "H币", amount);
          return;
        }
        if (entry.type === "trait") {
          const amount = Math.max(1, Math.floor(Number(entry.amount) || 1));
          const key = normalizeQixingTraitKey(entry.traitKey);
          grantQixingSeal(key, amount);
          mergeQixingGachaResult(summary, `trait_${key}`, (QIXING_TRAIT_META[key] && QIXING_TRAIT_META[key].name) || entry.label, amount);
          return;
        }
        if (entry.type === "item") {
          const amount = Math.max(1, Math.floor(Number(entry.amount) || 1));
          addItemCount(entry.itemId, amount);
          mergeQixingGachaResult(summary, `item_${entry.itemId}`, entry.label || itemNameById(entry.itemId, entry.label), amount);
          if (entry.limitedKey) gacha.limitedEggs[entry.limitedKey] = true;
          return;
        }
        if (entry.type === "egg") {
          const replaceIds = Array.isArray(entry.replaceIfOwnedDexIds) ? entry.replaceIfOwnedDexIds : [];
          const shouldReplaceOwned = replaceIds.length > 0 && replaceIds.some((id) => hasObtainedEggDex(id));
          if (shouldReplaceOwned) {
            grantDuplicateLimitedFallback(entry);
            if (entry.limitedKey) gacha.limitedEggs[entry.limitedKey] = true;
            return;
          }
          const eggResult = grantQixingGachaEgg(entry);
          if (eggResult.granted) mergeQixingGachaResult(summary, `egg_${entry.dexId}`, eggResult.label, 1);
          else notices.push(eggResult.notice);
        }
      };
      for (let i = 0; i < drawCount; i += 1) {
        const pityPrizes = Array.isArray(phase.pityPrizes) && phase.pityPrizes.length > 0
          ? phase.pityPrizes
          : [{ pityKey: phase.pityKey, pityLimit: phase.pityLimit, prizeKey: phase.pityPrizeKey }];
        pityPrizes.forEach((pity) => {
          const key = normalize(pity && pity.pityKey);
          if (!key) return;
          gacha.pityByKey[key] = Math.max(0, Math.floor(Number(gacha.pityByKey[key]) || 0)) + 1;
        });
        const pityHit = pityPrizes
          .map((pity) => {
            const key = normalize(pity && pity.pityKey);
            const entry = (phase.pool || []).find((row) => row.key === pity.prizeKey) || null;
            const obtained = Boolean(entry && entry.limitedKey && gacha.limitedEggs[entry.limitedKey]);
            const limit = Math.max(1, Math.floor(Number(pity && pity.pityLimit) || 1));
            return key && entry && !obtained && Math.max(0, Math.floor(Number(gacha.pityByKey[key]) || 0)) >= limit
              ? { key, limit, entry }
              : null;
          })
          .filter(Boolean)
          .sort((a, b) => a.limit - b.limit)[0] || null;
        let entry = pityHit ? pityHit.entry : pickQixingGachaPoolEntry(phase);
        if (!entry) entry = (phase.pool || [])[0];
        const hitPityKey = pityHit && pityHit.key;
        const limitedDuplicate = Boolean(entry.limitedKey && gacha.limitedEggs[entry.limitedKey]);
        if (limitedDuplicate) {
          grantDuplicateLimitedFallback(entry);
        } else {
          grantQixingGachaEntry(entry);
        }
        if (hitPityKey) gacha.pityByKey[hitPityKey] = 0;
        gacha.pity = Math.max(0, Math.floor(Number(gacha.pityByKey[phase.pityKey]) || 0));
      }
      const resultMessages = Object.values(summary).map((row) => `获取${row.label}×${row.count}！`);
      queueRewardFlyToasts([...resultMessages, ...notices]);
      showToast(`启星转盘完成 ${drawCount} 抽。`);
      qixingGachaDrawing.value = false;
    };
    const equipPetItemToSelectedPet = (itemId, petId = "") => {
      const id = normalize(String(itemId || ""));
      const pet = bagPets.value.find((p) => p && p.id === (petId || (selectedPet.value && selectedPet.value.id) || shopTargetPetId.value));
      if (!pet) return showToast("亚比道具只能对背包中的亚比使用，请先选择背包亚比。");
      if (id !== QIXING_SEAL_ITEM_ID) return showToast("该亚比道具暂未开放装配。");
      if (normalize(pet.equippedItemId) && normalize(pet.equippedItemId) !== id) return showToast(`${petDisplayName(pet)} 已装配其他亚比道具，请先卸下后再装配。`);
      const selectedSeal = qixingSealById(selectedQixingSealId.value);
      const seal = selectedSeal || firstAvailableQixingSeal();
      if (!seal) return showToast("特性数量不足。");
      const meta = qixingSealMeta(seal);
      const oldSeal = qixingSealForPet(pet);
      if (oldSeal && oldSeal.id === seal.id) return showToast(`${petDisplayName(pet)} 已装配${meta.name} Lv.${seal.level}。`);
      if (oldSeal) oldSeal.equippedPetId = "";
      const previousPetId = normalize(seal.equippedPetId);
      if (previousPetId && previousPetId !== pet.id) {
        const previousPet = safeActivePets.value.find((p) => p && p.id === previousPetId) || null;
        if (previousPet && normalize(previousPet.equippedItemInstanceId) === normalize(seal.id)) {
          previousPet.equippedItemId = "";
          previousPet.equippedItemInstanceId = "";
        }
      }
      seal.equippedPetId = pet.id;
      pet.equippedItemId = id;
      pet.equippedItemInstanceId = seal.id;
      selectedQixingSealId.value = seal.id;
      showToast(`${petDisplayName(pet)} 已装配${meta.name} Lv.${seal.level}。`);
    };
    const useBagItemOnSelectedPet = (itemId, amount = 1) => {
      const pet = selectedPet.value;
      if (!pet) return showToast("请先选择背包亚比。");
      shopTargetPetId.value = pet.id;
      return useShopItem(itemId, amount, { targetPetId: pet.id });
    };
    const upgradeQixingSeal = () => {
      const seal = selectedQixingSeal.value;
      if (!seal) return showToast("当前没有可升级的特性。");
      selectedQixingSealId.value = seal.id;
      const level = clamp(Math.floor(Number(seal.level) || 1), 1, QIXING_SEAL_MAX_LEVEL);
      const meta = qixingSealMeta(seal);
      if (level >= QIXING_SEAL_MAX_LEVEL) return showToast(`${meta.name}已达到最高等级。`);
      const upgrade = qixingSealUpgradeRule(level, seal.upgradeFailCount);
      if (getItemCount(QIXING_FRAGMENT_ITEM_ID) < upgrade.fragmentCost) return showToast(`特性碎片不足，升级需要 ${upgrade.fragmentCost} 个。`);
      const wallet = Math.max(0, Math.floor(Number(state.value.hCoins) || 0));
      if (wallet < upgrade.hcoinCost) return showToast(`H币不足，升级需要 ${upgrade.hcoinCost} H币。`);
      addItemCount(QIXING_FRAGMENT_ITEM_ID, -upgrade.fragmentCost);
      state.value.hCoins = Math.max(0, wallet - upgrade.hcoinCost);
      const success = upgrade.guaranteed || Math.random() < upgrade.successRate;
      if (!success) {
        seal.upgradeFailCount = Math.max(0, Math.floor(Number(seal.upgradeFailCount) || 0)) + 1;
        return showToast(`${meta.name} Lv.${level}升级失败，下次成功率提升至 ${Math.round(qixingSealUpgradeRule(level, seal.upgradeFailCount).successRate * 100)}%。`);
      }
      const nextLevel = clamp(level + 1, 1, QIXING_SEAL_MAX_LEVEL);
      seal.level = nextLevel;
      seal.upgradeFailCount = 0;
      evolutionQueue.value.push({
        kind: "qixingSealUpgrade",
        beforeName: `${meta.name} Lv.${level}`,
        afterName: `${meta.name} Lv.${nextLevel}`,
        beforeImage: meta.image,
        afterImage: meta.image,
        title: `${meta.name}升级`,
        desc: qixingSealBattleRule(seal, nextLevel).label || ""
      });
      tryOpenNextEvolution();
      showToast(`${meta.name}已升级至 Lv.${nextLevel}。`);
    };
    const decomposeQixingSeal = () => {
      const seal = selectedQixingSeal.value;
      if (!seal) return showToast("当前没有可分解的特性。");
      selectedQixingSealId.value = seal.id;
      if (normalize(seal.equippedPetId)) return showToast("已装配的特性需要先卸下后才能分解。");
      const level = clamp(Math.floor(Number(seal.level) || 1), 1, QIXING_SEAL_MAX_LEVEL);
      const meta = qixingSealMeta(seal);
      const gain = Math.max(0, Math.floor(Number(QIXING_SEAL_DECOMPOSE_FRAGMENT_BY_LEVEL[level]) || 0));
      if (gain <= 0) return showToast("该特性暂不能分解。");
      state.value.qixingSeals = ensureQixingSeals().filter((row) => normalize(row && row.id) !== normalize(seal.id));
      addItemCount(QIXING_FRAGMENT_ITEM_ID, gain);
      const nextSeal = firstAvailableQixingSeal() || ensureQixingSeals()[0] || null;
      selectedQixingSealId.value = nextSeal ? nextSeal.id : "";
      queueRewardFlyToasts([`获取特性碎片×${gain}！`]);
      showToast(`已分解${meta.name} Lv.${level}，获得特性碎片×${gain}。`);
    };
    const useShopItem = (itemId, amount = 1, options = {}) => {
      const id = normalize(String(itemId || ""));
      if (!id) return;
      const requestedAmount = clamp(Math.floor(Number(amount) || 1), 1, 999);
      const ownedAmount = getItemCount(id);
      if (ownedAmount <= 0) return showToast("该道具数量不足。");
      if (id === "double_exp_device") return showToast("双倍经验器会在非学习力战斗开始时自动消耗 1 次，并使胜利经验翻倍。");
      if (id === "auto_battle_device") return showToast("自动战斗仪请在图鉴挑战信息中使用，可连续挑战同一目标。");
      if (id === "divine_pet_key") return showToast("神宠之匙可在启星转盘中使用。");
      if (id === WEEKLY_BOSS_MEDAL_ITEM_ID) return showToast("当周BOSS勋章可在当周BOSS挑战页面兑换亚比蛋。");
      const explicitTargetPetId = normalize(options && options.targetPetId);
      if (explicitTargetPetId) {
        shopTargetPetId.value = explicitTargetPetId;
      } else if (id === SUPER_DICE_BOMB_SKILL_STONE_ITEM_ID && selectedPet.value && bagPets.value.some((p) => p && p.id === selectedPet.value.id)) {
        shopTargetPetId.value = selectedPet.value.id;
      } else if (battleScene.value && battleScene.value.currentAttackerId) {
        shopTargetPetId.value = battleScene.value.currentAttackerId;
      }
      const pet = bagPets.value.find((p) => p && p.id === shopTargetPetId.value);
      if (!pet) return showToast("亚比道具只能对背包中的亚比使用，请先选择背包亚比。");
      if (id === QIXING_SEAL_ITEM_ID) {
        return equipPetItemToSelectedPet(id, pet.id);
      }
      if (id === QIANKUN_XIULUOSHEN_SKIN_ITEM_ID) {
        if (!canUseQiankunXiuluoshenSkinOnPet(pet)) return showToast(`${QIANKUN_XIULUOSHEN_SKIN_NAME}仅限圣光修罗或修罗使用。`);
        if (normalize(pet.skinKey) === QIANKUN_XIULUOSHEN_SKIN_KEY) return showToast(`${petDisplayName(pet)} 已装配${QIANKUN_XIULUOSHEN_SKIN_NAME}。`);
        pet.skinKey = QIANKUN_XIULUOSHEN_SKIN_KEY;
        addItemCount(id, -1);
        showToast(`${petDisplayName(pet)} 已装配${QIANKUN_XIULUOSHEN_SKIN_NAME}。`);
        return;
      }
      if (id === SUPER_DICE_BOMB_SKILL_STONE_ITEM_ID) {
        if (!canUseSuperDiceBombSkillStoneOnPet(pet)) return showToast("超级骰子炸弹技能石只能给骰子大王或NO.14使用。");
        const skillName = normalizeSkillKey(SUPER_DICE_BOMB_SKILL.name);
        const learned = skillNameSetFromList(petExtraSkills(pet));
        const species = getSpeciesForPet(pet);
        const nativeSkills = speciesSkillNameSet(species, skillLevelForPet(pet));
        if (learned.has(skillName) || nativeSkills.has(skillName)) return showToast(`${petDisplayName(pet)} 已经学会${skillName}。`);
        const learnedSkills = petExtraSkills(pet);
        learnedSkills.push({ ...SUPER_DICE_BOMB_SKILL });
        pet.extraSkills = sanitizePetExtraSkills(learnedSkills);
        pet.equippedSkills = currentEquippedSkillNamesBySpecies(species, pet.equippedSkills, skillLevelForPet(pet), pet.extraSkills);
        if (!hasEquippedSkill(pet, skillName) && pet.equippedSkills.length < 4) pet.equippedSkills.push(skillName);
        addItemCount(id, -1);
        syncSelectedSkillName();
        showToast(`${petDisplayName(pet)} 学会了${skillName}${hasEquippedSkill(pet, skillName) ? "，已加入技能栏" : "，可在技能页替换装备"}。`);
        return;
      }
      const levelUpPetTo = (targetLevel) => {
        const goal = clamp(Math.floor(Number(targetLevel) || 1), 1, 100);
        const chainAnchorDexId = Number((pet && pet.baseDexId) || (pet && pet.dexId)) || Number(pet.dexId) || 0;
        const chain = getChainStageInfoByDexId(chainAnchorDexId, pet.speciesName);
        const crossed = [];
        while (pet.level < goal) {
          const beforeForm = petCurrentForm(pet);
          const oldLevel = pet.level;
          pet.level += 1;
          pet.skillUnlockLevel = clamp(Math.max(Number(pet.skillUnlockLevel) || 1, pet.level), 1, 100);
          const prevStage = stageIndexByLevelAndCount(oldLevel, chain.formCount, chain.evoLevels);
          const nextStage = stageIndexByLevelAndCount(pet.level, chain.formCount, chain.evoLevels);
          if (nextStage > prevStage) {
            addEvolutionFx(pet.id);
            const beforeDexId = resolveEvolutionDexIdByPetAndStage(pet, prevStage);
            const afterDexId = resolveEvolutionDexIdByPetAndStage(pet, nextStage);
            const beforeDex = dexById.get(Number(beforeDexId));
            const afterDex = dexById.get(Number(afterDexId));
            const afterForm = petCurrentForm(pet);
            crossed.push({
              petId: pet.id,
              beforeName: (beforeDex && beforeDex.name) || normalize(beforeForm && beforeForm.name) || pet.speciesName,
              afterName: (afterDex && afterDex.name) || normalize(afterForm && afterForm.name) || pet.speciesName,
              beforeImage: (beforeDex && ensureHttps(beforeDex.image)) || ensureHttps(beforeForm && beforeForm.img) || PLACEHOLDER,
              afterImage: (afterDex && ensureHttps(afterDex.image)) || ensureHttps(afterForm && afterForm.img) || PLACEHOLDER
            });
          }
          const evoDexId = resolveEvolutionDexIdByPetAndStage(pet, nextStage);
          if (evoDexId > 0 && !state.value.activatedDexIds.includes(evoDexId)) state.value.activatedDexIds.push(evoDexId);
        }
        pet.exp = 0;
        autoFillSkills(pet);
        syncSelectedSkillName();
        if (crossed.length > 0) {
          evolutionQueue.value.push(...crossed);
          tryOpenNextEvolution();
        }
      };
      if (id === "max_level_fruit") {
        if (pet.level >= 100) return showToast(`${petDisplayName(pet)} 已是满级。`);
        levelUpPetTo(100);
        addItemCount(id, -1);
        showToast(`${petDisplayName(pet)} 已升至 Lv.100。`);
        return;
      }
      if (id === "level_40_fruit") {
        if (pet.level > 40) return showToast(`${petDisplayName(pet)} 已超过 Lv.40，无法使用。`);
        if (pet.level === 40) return showToast(`${petDisplayName(pet)} 已是 Lv.40。`);
        levelUpPetTo(40);
        addItemCount(id, -1);
        showToast(`${petDisplayName(pet)} 已升至 Lv.40。`);
        return;
      }
      if (id === "small_exp_fruit" || id === "medium_exp_fruit" || id === "time_tunnel_big_exp_fruit") {
        const gain = id === "small_exp_fruit" ? 10000 : (id === "medium_exp_fruit" ? 50000 : 100000);
        const useCount = Math.min(requestedAmount, ownedAmount);
        const totalGain = gain * useCount;
        if (pet.level >= 100) {
          pet.level = 100;
          pet.exp = 0;
          autoFillSkills(pet);
          return showToast(`${petDisplayName(pet)} 已是满级，无法使用经验果。`);
        }
        grantExp(pet, totalGain);
        addItemCount(id, -useCount);
        setItemUseQuantity(id, 1);
        showToast(`${petDisplayName(pet)} 获得 ${totalGain} 经验。`);
        return;
      }
      if (id === "study_reset_fruit") {
        pet.study = createZeroStats();
        addItemCount(id, -1);
        showToast(`${petDisplayName(pet)} 的学习力已清空。`);
        return;
      }
      const studyFruitKey = STUDY_FRUIT_KEY_BY_ITEM_ID[id];
      if (studyFruitKey) {
        const study = normalizeStudy(pet.study);
        const before = clamp(Number(study[studyFruitKey]) || 0, 0, 255);
        if (before >= 255) return showToast(`${petDisplayName(pet)} 的${battleStatLabel(studyFruitKey)}学习力已满。`);
        const total = studyTotal(study);
        if (total >= 510) return showToast(`${petDisplayName(pet)} 的学习力总和已满。`);
        const requested = clamp(Math.floor(Number(amount) || 1), 1, 999);
        const useCount = Math.min(requested, getItemCount(id), 255 - before, 510 - total);
        if (useCount <= 0) return showToast(`${petDisplayName(pet)} 的${battleStatLabel(studyFruitKey)}学习力已满。`);
        study[studyFruitKey] = clamp(before + useCount, 0, 255);
        pet.study = normalizeStudy(study, studyFruitKey);
        addItemCount(id, -useCount);
        setItemUseQuantity(id, 1);
        showToast(`${petDisplayName(pet)} 的${battleStatLabel(studyFruitKey)}学习力 +${Math.max(0, pet.study[studyFruitKey] - before)}。`);
        return;
      }
      if (id === "level_down_spray") {
        if (pet.level <= 1) return showToast(`${petDisplayName(pet)} 已是 Lv.1。`);
        const previousLevel = clamp(Math.floor(Number(pet.level) || 1), 1, 100);
        const chainAnchorDexId = Number((pet && pet.baseDexId) || (pet && pet.dexId)) || Number(pet.dexId) || 0;
        const chain = getChainStageInfoByDexId(chainAnchorDexId, pet.speciesName);
        const currentStage = resolvePetStageIndex(pet, chain);
        const currentDexId = resolveEvolutionDexIdByPetAndStage(pet, currentStage);
        const currentDex = dexById.get(Number(currentDexId) || 0) || null;
        const currentSpecies = getSpeciesByDexId(Number(currentDexId) || pet.dexId, (currentDex && currentDex.name) || pet.speciesName);
        pet.fixedStageIndex = currentStage;
        if (currentDex) {
          pet.dexId = Number(currentDex.dexId) || pet.dexId;
          pet.speciesName = normalize(currentDex.name) || pet.speciesName;
          pet.element = normalize(currentDex.element) || pet.element || "未知系";
          pet.subElement = normalize(currentDex.subElement) || "";
        }
        pet.skillUnlockLevel = clamp(Math.max(previousLevel, Number(pet.skillUnlockLevel) || previousLevel), 1, 100);
        pet.level = 1;
        pet.exp = 0;
        syncSelectedSkillName();
        addItemCount(id, -1);
        showToast(`${petDisplayName(pet)} 已降至 Lv.1，技能栏保持不变。`);
        return;
      }
      if (id === "pp_bean_s" || id === "pp_bean_m" || id === "pp_bean_l") {
        const gain = id === "pp_bean_s" ? 5 : (id === "pp_bean_m" ? 10 : 20);
        const scene = battleScene.value;
        const actor = scene && scene.currentAttackerId === pet.id ? scene : null;
        if (!actor) return showToast("PP 豆需在该亚比出战时使用。");
        const maxMissing = (actor.skills || []).reduce((sum, s) => {
          if (hasUsedOncePerBattleSkill(actor, "attacker", s)) return sum;
          const cur = Number(s.pp) || 0;
          const mx = Math.max(1, Number(s.ppMax) || cur || 1);
          return sum + Math.max(0, mx - cur);
        }, 0);
        if (maxMissing <= 0) return showToast(`${petDisplayName(pet)} 的技能 PP 已满。`);
        const useCount = Math.min(requestedAmount, ownedAmount, Math.max(1, Math.ceil(maxMissing / gain)));
        const totalGain = gain * useCount;
        let deltaSum = 0;
        const detail = [];
        (actor.skills || []).forEach((s) => {
          if (hasUsedOncePerBattleSkill(actor, "attacker", s)) {
            detail.push(`${s.name}+0`);
            return;
          }
          const cur = Number(s.pp) || 0;
          const mx = Math.max(1, Number(s.ppMax) || cur || 1);
          const next = clamp(cur + totalGain, 0, mx);
          const inc = Math.max(0, next - cur);
          deltaSum += inc;
          detail.push(`${s.name}+${inc}`);
          s.pp = next;
        });
        addItemCount(id, -useCount);
        setItemUseQuantity(id, 1);
        actor.ppOnAttacker = `PP+${deltaSum}`;
        markBattleFloatText(actor);
        setTimeout(() => {
          if (battleScene.value && battleScene.value === actor) actor.ppOnAttacker = "";
        }, battleSceneDelayMs(actor, BATTLE_FLOAT_TEXT_DURATION_MS, 120));
        pushBattleLog(actor, `${petDisplayName(pet)} 使用 ${itemNameById(id, "PP豆")}×${useCount}：每个已装备技能回复 ${totalGain} PP，${detail.join("，")}（实际合计+${deltaSum}）`);
        battleActionTab.value = "skills";
        showToast(`${petDisplayName(pet)} 的技能 PP 实际回复 ${deltaSum} 点。`);
        consumeBattleTurnAfterItem();
        return;
      }
      if (id === "hp_candy_s" || id === "hp_candy_m" || id === "hp_candy_l") {
        const heal = id === "hp_candy_s" ? 50 : (id === "hp_candy_m" ? 100 : 200);
        const species = getSpeciesByDexId(pet.dexId, pet.speciesName);
        const race = species && species.raceStats ? species.raceStats : createZeroStats();
        const ability = calcPetAbilityByRace(race, pet.level, pet.talent, pet.study);
        const maxHp = Math.max(1, Number(ability.hp) || 1);
        const scene = battleScene.value;
        const oldHp = (scene && scene.currentAttackerId === pet.id)
          ? clamp(Number(scene.attackerHp) || 0, 0, maxHp)
          : clamp(Number(pet.hp || maxHp), 0, maxHp);
        const missingHp = Math.max(0, maxHp - oldHp);
        if (missingHp <= 0) return showToast(`${petDisplayName(pet)} 的体力已满。`);
        const useCount = Math.min(requestedAmount, ownedAmount, Math.max(1, Math.ceil(missingHp / heal)));
        const totalHeal = heal * useCount;
        pet.hp = clamp(oldHp + totalHeal, 0, maxHp);
        addItemCount(id, -useCount);
        setItemUseQuantity(id, 1);
        const healedActual = Math.max(0, pet.hp - oldHp);
        if (scene && scene.currentAttackerId === pet.id) {
          scene.attackerHp = clamp(Number(pet.hp) || 0, 0, Number(scene.attackerMaxHp) || 1);
          scene.uiAttackerHp = scene.attackerHp;
          scene.healOnAttacker = `+${healedActual}`;
          markBattleFloatText(scene);
          setTimeout(() => {
            if (battleScene.value && battleScene.value === scene) scene.healOnAttacker = "";
          }, battleSceneDelayMs(scene, BATTLE_FLOAT_TEXT_DURATION_MS, 120));
          pushBattleLog(scene, `${petDisplayName(pet)} 使用 ${shopItems.value.find((x) => x.id === id)?.name || "体力糖"}×${useCount}，回复 ${totalHeal} 体力（实际恢复 ${healedActual}）`);
        }
        battleActionTab.value = "skills";
        showToast(`${petDisplayName(pet)} 实际回复体力 ${healedActual} 点。`);
        if (scene && scene.currentAttackerId === pet.id) consumeBattleTurnAfterItem();
        return;
      }
      if (id === "purify_potion") {
        const scene = battleScene.value;
        const targetState = scene && scene.currentAttackerId === pet.id
          ? getSideState(scene, "attacker")
          : null;
        if (!targetState) return showToast("净化药剂需在该亚比出战时使用。");
        const statusKeys = Object.keys((targetState && targetState.statuses) || {});
        const activeLabels = statusKeys
          .filter((k) => Math.max(0, Number(targetState.statuses[k]) || 0) > 0)
          .map((k) => statusLabel(k));
        if (targetState) {
          statusKeys.forEach((k) => { targetState.statuses[k] = 0; });
        }
        addItemCount(id, -1);
        battleActionTab.value = "skills";
        const detail = activeLabels.length > 0 ? activeLabels.join("、") : "无异常状态";
        if (scene && scene.currentAttackerId === pet.id) {
          pushBattleLog(scene, `${petDisplayName(pet)} 使用净化药剂，清除了${detail}。`);
          consumeBattleTurnAfterItem();
        }
        showToast(`${petDisplayName(pet)} 已清除异常状态。`);
        return;
      }
      if (id === "talent_reroll_capsule") {
        const beforeTalent = normalizeTalent(pet.talent);
        const beforeTotal = Object.values(beforeTalent).reduce((sum, v) => sum + (Number(v) || 0), 0);
        const useCount = Math.min(requestedAmount, ownedAmount);
        for (let i = 0; i < useCount; i += 1) {
          pet.talentRerollCount = Math.max(0, Math.floor(Number(pet.talentRerollCount) || 0)) + 1;
          pet.talent = createTalentRerollByTotalDelta(normalizeTalent(pet.talent), pet.talentRerollCount);
        }
        const afterTotal = Object.values(pet.talent).reduce((sum, v) => sum + (Number(v) || 0), 0);
        addItemCount(id, -useCount);
        setItemUseQuantity(id, 1);
        showToast(`${petDisplayName(pet)} 天赋重组×${useCount}完成：${beforeTotal} -> ${afterTotal}（变化${afterTotal - beforeTotal >= 0 ? "+" : ""}${afterTotal - beforeTotal}，${talentGradeByTotal(afterTotal)}）。`);
        return;
      }
      if (id === "talent_boost_capsule") {
        pet.talent = normalizeTalent(pet.talent);
        const keys = STAT_KEYS.filter((k) => k in pet.talent);
        const beforeTalent = normalizeTalent(pet.talent);
        const gains = {};
        let useCount = 0;
        const limit = Math.min(requestedAmount, ownedAmount);
        for (let i = 0; i < limit; i += 1) {
          const candidates = keys.filter((k) => Number(pet.talent[k]) < 62);
          if (candidates.length === 0) break;
          const key = candidates[Math.floor(Math.random() * candidates.length)];
          const inc = randInt(6, 10);
          const before = Number(pet.talent[key]) || 0;
          pet.talent[key] = clamp(before + inc, 0, 62);
          gains[key] = (gains[key] || 0) + Math.max(0, Number(pet.talent[key]) - before);
          useCount += 1;
        }
        if (useCount <= 0) return showToast(`${petDisplayName(pet)} 的天赋已全部达到上限。`);
        pet.talent = normalizeTalent(pet.talent);
        addItemCount(id, -useCount);
        setItemUseQuantity(id, 1);
        const gainText = Object.keys(gains).filter((key) => gains[key] > 0).map((key) => `${battleStatLabel(key)}+${gains[key]}`).join("、") || "无提升";
        const beforeTotal = Object.values(beforeTalent).reduce((sum, v) => sum + (Number(v) || 0), 0);
        const afterTotal = Object.values(pet.talent).reduce((sum, v) => sum + (Number(v) || 0), 0);
        showToast(`${petDisplayName(pet)} 使用天赋增强胶囊×${useCount}：${gainText}，总和 ${beforeTotal} -> ${afterTotal}。`);
        return;
      }
      const talentGradeFruitRules = {
        talent_grade_wanzhong_fruit: { total: 240, grade: "万众瞩目" },
        talent_grade_wangzhe_fruit: { total: 300, grade: "王者无敌" },
        talent_grade_tianxia_fruit: { total: 360, grade: "天下无双" }
      };
      if (talentGradeFruitRules[id]) {
        const rule = talentGradeFruitRules[id];
        const beforeTalent = normalizeTalent(pet.talent);
        const beforeTotal = talentTotal(beforeTalent);
        if (beforeTotal >= rule.total) return showToast(`${petDisplayName(pet)} 的天赋已达到${talentGradeByTotal(beforeTotal)}，无需使用${itemNameById(id, "天赋果实")}。`);
        pet.talent = raiseTalentTotalToAtLeast(beforeTalent, rule.total);
        addItemCount(id, -1);
        const afterTotal = talentTotal(pet.talent);
        showToast(`${petDisplayName(pet)} 使用${itemNameById(id, "天赋果实")}，天赋总和 ${beforeTotal} -> ${afterTotal}（${rule.grade}）。`);
        return;
      }
      showToast("该道具暂未开放。");
    };
    const unequipPetItem = (petId) => {
      const pet = bagPets.value.find((p) => p && p.id === petId);
      if (!pet) return showToast("请先选择背包中的亚比。");
      const itemId = normalize(pet.equippedItemId);
      if (!itemId) return showToast(`${petDisplayName(pet)} 当前没有装配亚比道具。`);
      if (itemId === QIXING_SEAL_ITEM_ID) {
        const seal = qixingSealForPet(pet);
        if (seal) seal.equippedPetId = "";
      } else {
        addItemCount(itemId, 1);
      }
      pet.equippedItemId = "";
      pet.equippedItemInstanceId = "";
      showToast(`${petDisplayName(pet)} 已卸下${itemNameById(itemId, "亚比道具")}。`);
    };
    const setChallengeFormIndex = (idx) => {
      void idx;
      const next = selectedDexStageIndex.value;
      state.value.challengeFormIndex = next;
      const range = selectedChallengeLevelRange.value;
      const n = Number(state.value.targetLevel);
      state.value.targetLevel = String(Number.isInteger(n) ? clamp(n, range.min, range.max) : selectedChallengeDefaultLevel.value);
    };
    const openPetDetailModal = (petId) => {
      const id = String(petId || "");
      if (!id) return;
      const exists = state.value.activePets.some((p) => p && p.id === id);
      if (!exists) {
        showToast("该亚比数据异常，请重试。");
        return;
      }
      const openNow = () => {
        state.value.selectedPetId = id;
        showPetDetailModal.value = true;
        selectedInfoTab.value = "skills";
        syncSelectedSkillName();
      };
      detailPreviewPet.value = null;
      // 关键修复：当点击的就是当前 selectedPetId（常见于首宠）时，
      // 强制重置一次选择，确保依赖链完整刷新，避免弹窗白屏。
      if (state.value.selectedPetId === id) {
        state.value.selectedPetId = "";
        nextTick(() => openNow());
        return;
      }
      openNow();
    };
    const openSelectedDexDetail = () => {
      const entry = selectedDexEntry.value;
      if (!entry) return;
      // 查看详情时固定按 100 级展示，保证“技能栏（全部技能）”完整可见。
      const lv = 100;
      const species = speciesByDexMap.get(Number(entry.dexId));
      if (!species) {
        showToast("该挑战目标暂无已生成的技能/种族值数据。");
        return;
      }
      const unlocked = (species.skills || []).filter((s) => Number(s.level) <= lv).map((s) => normalizeSkillKey(s.name)).filter(Boolean);
      detailPreviewPet.value = {
        id: `preview_${entry.dexId}`,
        dexId: entry.dexId,
        fixedDexId: entry.dexId,
        fixedName: entry.name,
        fixedImage: ensureHttps(entry.image) || PLACEHOLDER,
        previewAllSkills: true,
        hideStudyTalentTabs: true,
        speciesName: entry.name,
        level: lv,
        exp: 0,
        totalExp: 0,
        element: entry.element || "",
        subElement: entry.subElement || "",
        equippedSkills: unlocked,
        talent: createRandomHatchTalent(),
        study: createZeroStats()
      };
      showPetDetailModal.value = true;
      selectedInfoTab.value = "skills";
      syncSelectedSkillName();
    };
    const openSelectedGuardianDetail = () => {
      const entry = selectedGuardianEntry.value;
      if (!entry) return;
      const species = speciesByDexMap.get(Number(entry.dexId));
      if (!species) {
        showToast("该守护者暂无已生成的技能/种族值数据。");
        return;
      }
      const lv = 100;
      const extraGuardian = isExtraGuardianName(entry.name);
      const unlocked = (species.skills || []).filter((s) => Number(s.level) <= lv).map((s) => normalizeSkillKey(s.name)).filter(Boolean);
      detailPreviewPet.value = {
        id: `preview_guardian_${entry.dexId}`,
        dexId: entry.dexId,
        fixedDexId: entry.dexId,
        fixedName: entry.name,
        fixedImage: ensureHttps(entry.image) || PLACEHOLDER,
        speciesName: entry.name,
        level: lv,
        exp: 0,
        totalExp: 0,
        element: entry.element || "",
        subElement: entry.subElement || "",
        equippedSkills: unlocked,
        previewAllSkills: true,
        hideStudyTalentTabs: false,
        talent: extraGuardian ? createUniformTalent50() : createUniformTalent30(),
        study: createGuardianStudy()
      };
      showPetDetailModal.value = true;
      selectedInfoTab.value = "skills";
      syncSelectedSkillName();
    };
    const openSelectedBossDetail = () => {
      const entry = selectedBossEntry.value;
      if (!entry) return;
      const species = speciesByDexMap.get(Number(entry.dexId));
      if (!species) {
        showToast("该BOSS暂无已生成的技能/种族值数据。");
        return;
      }
      const lv = 100;
      const unlocked = (species.skills || []).filter((s) => Number(s.level) <= lv).map((s) => normalizeSkillKey(s.name)).filter(Boolean);
      detailPreviewPet.value = {
        id: `preview_boss_${entry.dexId}`,
        dexId: entry.dexId,
        fixedDexId: entry.dexId,
        fixedName: entry.name,
        fixedImage: ensureHttps(entry.image) || PLACEHOLDER,
        speciesName: entry.name,
        level: lv,
        exp: 0,
        totalExp: 0,
        element: entry.element || "",
        subElement: entry.subElement || "",
        equippedSkills: unlocked,
        previewAllSkills: true,
        hideStudyTalentTabs: false,
        talent: createUniformTalent60(),
        study: createGuardianStudy()
      };
      showPetDetailModal.value = true;
      selectedInfoTab.value = "skills";
      syncSelectedSkillName();
    };
    const openWeeklyBossDetail = () => {
      const entry = weeklyBossEntry.value;
      if (!entry) return;
      const species = speciesByDexMap.get(Number(entry.dexId));
      if (!species) {
        showToast("该当周BOSS暂无已生成的技能/种族值数据。");
        return;
      }
      const lv = WEEKLY_BOSS_CONFIG.level;
      const unlocked = (species.skills || []).filter((s) => Number(s.level) <= lv).map((s) => normalizeSkillKey(s.name)).filter(Boolean);
      detailPreviewPet.value = {
        id: `preview_weekly_boss_${entry.dexId}`,
        dexId: entry.dexId,
        fixedDexId: entry.dexId,
        fixedName: entry.name,
        fixedImage: ensureHttps(entry.image) || PLACEHOLDER,
        speciesName: entry.name,
        level: lv,
        exp: 0,
        totalExp: 0,
        element: entry.element || "",
        subElement: entry.subElement || "",
        equippedSkills: unlocked,
        previewAllSkills: true,
        hideStudyTalentTabs: false,
        talent: createUniformTalent60(),
        study: createGuardianStudy()
      };
      showPetDetailModal.value = true;
      selectedInfoTab.value = "skills";
      syncSelectedSkillName();
    };
    const closePetDetailModal = () => {
      showPetDetailModal.value = false;
      detailPreviewPet.value = null;
      if (!isInBag(state.value.selectedPetId)) {
        state.value.selectedPetId = state.value.bagPetIds.find((id) => id) || "";
      }
    };
    watch(showPetDetailModal, (open) => {
      if (!open) return;
      nextTick(() => {
        syncSelectedSkillName();
      });
    });
    const openElementPanel = () => { showElementPanel.value = true; };
    const closeElementPanel = () => { showElementPanel.value = false; };

    const startChallenge = () => {
      const target = selectedDexEntry.value;
      if (!target) return showToast("请先在图鉴中选择挑战目标。");
      if (!canChallengeFromDex(target)) return showToast(challengeLockMessage(target));
      if (!canStartChallengeByDex(target)) return showToast(openChallengeRangeMessage());

      const range = selectedChallengeLevelRange.value;
      const rawText = String(state.value.targetLevel ?? "").trim();
      const raw = Number(rawText);
      if (!rawText || !Number.isInteger(raw) || raw < range.min || raw > range.max) {
        return showToast(`挑战等级必须是${range.min}-${range.max}之间的整数。`);
      }
      state.value.targetLevel = String(raw);
      return startDexChallengeByEntry(target, raw, { closePanel: false, allowRecording: false, returnToDex: true });
    };
    const startDexChallengeByEntry = async (target, tl, options = {}) => {
      if (!target) return false;
      const level = clamp(Math.floor(Number(tl) || 1), 1, 100);
      state.value.selectedDexId = target.dexId;
      state.value.targetLevel = String(level);
      if (options.closePanel !== false) closeTargetPanel();
      if (options.returnToDex) {
        state.value.showDexPanel = true;
        setBattleReturnContext({ panel: "dex", dexId: target.dexId });
        state.value.selectedDexId = null;
      }
      if (options.allowRecording) {
        await startChallengeRecording({ targetName: target.name, targetLevel: level, dexId: target.dexId });
      }
      startBattlePrepare(`正在准备挑战 ${target.name}...`, target, level, () => setupBattleScene({
        targetEntry: target,
        targetLevel: level,
        forceTargetHpRace500: false,
        mode: "normal",
        guardianMeta: {
          dexChallenge: true,
          dexId: target.dexId,
          targetLevel: level
        }
      }));
      return true;
    };
    const repeatLastDexChallenge = () => {
      const result = battleResult.value;
      const dexId = Number(result && result.repeatDexId) || 0;
      const level = Math.max(1, Math.floor(Number(result && result.repeatTargetLevel) || 1));
      const target = dexById.get(dexId);
      if (!target) return showToast("上次图鉴挑战目标不存在。");
      if (!canChallengeFromDex(target)) return showToast(challengeLockMessage(target));
      if (!canStartChallengeByDex(target)) return showToast(openChallengeRangeMessage());
      battleResult.value = null;
      return startDexChallengeByEntry(target, level, { closePanel: false, allowRecording: false, returnToDex: true });
    };
    const startAutoBattleChallenge = () => {
      const run = autoBattleRun.value;
      if (!run) return false;
      const target = dexById.get(Number(run.dexId));
      if (!target || !canChallengeFromDex(target) || !canStartChallengeByDex(target)) {
        stopAutoBattleRun("自动战斗目标已不可挑战。");
        return false;
      }
      if (bagPets.value.length === 0) {
        stopAutoBattleRun("背包中没有可出战亚比，自动战斗已停止。");
        return false;
      }
      if (getItemCount("auto_battle_device") <= 0) {
        stopAutoBattleRun("自动战斗仪次数已用完。");
        return false;
      }
      const level = clamp(Math.floor(Number(run.targetLevel) || 10), 1, 100);
      if (!consumeItemCount("auto_battle_device", 1)) {
        stopAutoBattleRun("自动战斗仪次数不足。");
        return false;
      }
      run.remaining = Math.max(0, Math.floor(Number(run.remaining) || 0) - 1);
      run.completed = Math.max(0, Math.floor(Number(run.completed) || 0)) + 1;
      state.value.selectedDexId = target.dexId;
      state.value.targetLevel = String(level);
      setBattleReturnContext({ panel: "dex", dexId: target.dexId });
      const started = setupBattleScene({
        targetEntry: target,
        targetLevel: level,
        forceTargetHpRace500: false,
        mode: "normal",
        guardianMeta: {
          dexChallenge: true,
          dexId: target.dexId,
          targetLevel: level
        },
        autoBattleMeta: {
          completed: run.completed,
          remainingAfterStart: run.remaining,
          total: Math.max(1, Math.floor(Number(run.total) || 10))
        }
      });
      if (!started) {
        addItemCount("auto_battle_device", 1);
        run.remaining += 1;
        run.completed = Math.max(0, run.completed - 1);
        return false;
      }
      return true;
    };
    const startAutoBattleFromDex = () => {
      const target = selectedDexEntry.value;
      if (!target) return showToast("请先在图鉴中选择挑战目标。");
      if (!canChallengeFromDex(target)) return showToast(challengeLockMessage(target));
      if (!canStartChallengeByDex(target)) return showToast(openChallengeRangeMessage());
      if (bagPets.value.length === 0) return showToast("背包中没有可出战亚比。");
      if (getItemCount("auto_battle_device") <= 0) return showToast("自动战斗仪次数不足。");
      const range = selectedChallengeLevelRange.value;
      const rawText = String(state.value.targetLevel ?? "").trim();
      const raw = Number(rawText);
      if (!rawText || !Number.isInteger(raw) || raw < range.min || raw > range.max) {
        return showToast(`挑战等级必须是${range.min}-${range.max}之间的整数。`);
      }
      state.value.targetLevel = String(raw);
      state.value.showDexPanel = true;
      setBattleReturnContext({ panel: "dex", dexId: target.dexId });
      state.value.selectedDexId = null;
      const wanted = autoBattleCountOptions.includes(Number(selectedAutoBattleCount.value)) ? Number(selectedAutoBattleCount.value) : 10;
      autoBattleRun.value = {
        dexId: target.dexId,
        targetLevel: raw,
        total: Math.min(wanted, getItemCount("auto_battle_device")),
        remaining: Math.min(wanted, getItemCount("auto_battle_device")),
        completed: 0
      };
      showToast(`自动战斗开始：将连续挑战 ${target.name}，最多 ${autoBattleRun.value.remaining} 次。`);
      startAutoBattleChallenge();
    };
    const stopAutoBattle = () => {
      stopAutoBattleRun("自动战斗已手动停止，剩余次数已保留。");
    };
    const openChallengeRoadPanel = () => {
      const rows = challengeRoadTiers.value;
      const firstOpen = rows.find((tier) => tier.unlocked && !tier.completed) || rows.find((tier) => tier.unlocked) || rows[0] || null;
      selectedChallengeRoadTierIndex.value = firstOpen ? firstOpen.tierIndex : 0;
      showChallengeRoadPanel.value = true;
    };
    const closeChallengeRoadPanel = () => {
      showChallengeRoadPanel.value = false;
      showChallengeRoadTierPanel.value = false;
    };
    const selectChallengeRoadTier = (tierIndex) => {
      const tier = challengeRoadTiers.value.find((row) => row.tierIndex === Math.floor(Number(tierIndex) || 0));
      if (!tier) return;
      if (!tier.unlocked) return showToast(tier.lockText || "请先通关上一梯度。");
      selectedChallengeRoadTierIndex.value = tier.tierIndex;
      showChallengeRoadTierPanel.value = true;
    };
    const closeChallengeRoadTierPanel = () => { showChallengeRoadTierPanel.value = false; };
    const openGuardianPanel = openChallengeRoadPanel;
    const closeGuardianPanel = closeChallengeRoadPanel;
    const openBossPanel = openChallengeRoadPanel;
    const closeBossPanel = closeChallengeRoadPanel;
    const openTimeTunnelPanel = () => {
      timeTunnelSelectedFloor.value = Math.max(1, timeTunnelMaxClearedFloor.value || 1);
      showTimeTunnelPanel.value = true;
      playSceneBgm(TIME_TUNNEL_BGM_SRC);
    };
    const closeTimeTunnelPanel = () => {
      showTimeTunnelPanel.value = false;
      showTimeTunnelEnvironmentPanel.value = false;
      timeTunnelDoorScene.value = null;
      timeTunnelEnvironmentScene.value = null;
      refreshSceneBgm();
    };
    const selectTimeTunnelFloor = (floor) => {
      timeTunnelSelectedFloor.value = Math.max(1, Math.floor(Number(floor) || 1));
    };
    const buildTimeTunnelFloorScene = (floor) => {
      const safeFloor = Math.max(1, Math.floor(Number(floor) || 1));
      const maxEnterFloor = Math.min(TIME_TUNNEL_OPEN_MAX_FLOOR, Math.max(TIME_TUNNEL_MIN_CLEAR_FLOOR, (timeTunnelMaxClearedFloor.value || 0) + 1));
      if (safeFloor > maxEnterFloor) {
        showToast("该层时空坐标尚未稳定，暂未开放。");
        return null;
      }
      const cfg = TIME_TUNNEL_FLOORS.find((x) => x.floor === safeFloor);
      if (!cfg || !Array.isArray(cfg.enemies) || cfg.enemies.length === 0) {
        showToast("该层挑战数据缺失。");
        return null;
      }
      const enemies = cfg.enemies.map((enemy) => {
        const entry = dexById.get(Number(enemy.dexId));
        return entry ? {
          dexId: Number(enemy.dexId) || 0,
          level: clamp(Number(enemy.level) || 1, 1, 100),
          entry,
          name: normalize(entry.name) || `亚比${enemy.dexId}`,
          image: getTimeTunnelBattleAnimSrc(entry.dexId),
          element: normalize(entry.element),
          subElement: normalize(entry.subElement)
        } : null;
      }).filter(Boolean);
      if (enemies.length !== cfg.enemies.length) {
        showToast("该层挑战目标数据缺失。");
        return null;
      }
      const environment = randomTimeTunnelEnvironment();
      return { floor: safeFloor, environment, enemies };
    };
    const enterSelectedTimeTunnelFloor = () => {
      if (bagPets.value.length === 0) return showToast("背包中没有可出战亚比。");
      const scene = buildTimeTunnelFloorScene(timeTunnelSelectedFloor.value);
      if (!scene) return;
      showTimeTunnelPanel.value = false;
      timeTunnelEnvironmentScene.value = scene;
      showTimeTunnelEnvironmentPanel.value = true;
      playSceneBgm(TIME_TUNNEL_BGM_SRC);
    };
    const backToTimeTunnelPanel = () => {
      if (!timeTunnelEnvironmentScene.value) return;
      showTimeTunnelEnvironmentPanel.value = false;
      showTimeTunnelPanel.value = true;
      timeTunnelEnvironmentScene.value = null;
      playSceneBgm(TIME_TUNNEL_BGM_SRC);
    };
    const startTimeTunnelFloor = (floor, sceneOverride = null) => {
      const safeFloor = Math.max(1, Math.floor(Number(floor) || 1));
      const maxEnterFloor = Math.min(TIME_TUNNEL_OPEN_MAX_FLOOR, Math.max(TIME_TUNNEL_MIN_CLEAR_FLOOR, (timeTunnelMaxClearedFloor.value || 0) + 1));
      if (safeFloor > maxEnterFloor) return showToast("该层时空坐标尚未稳定，暂未开放。");
      const scene = sceneOverride || buildTimeTunnelFloorScene(safeFloor);
      if (!scene || !Array.isArray(scene.enemies) || scene.enemies.length === 0) return;
      if (bagPets.value.length === 0) return showToast("背包中没有可出战亚比。");
      const first = scene.enemies[0];
      const entry = first.entry;
      if (!entry) return showToast("该层首个挑战目标数据缺失。");
      showTimeTunnelPanel.value = false;
      showTimeTunnelEnvironmentPanel.value = false;
      timeTunnelEnvironmentScene.value = scene;
      timeTunnelDoorScene.value = null;
      const meta = {
        floor: safeFloor,
        index: 0,
        environmentElement: normalizeElementName(scene.environment && scene.environment.element),
        environmentName: normalize(scene.environment && scene.environment.name),
        enemies: scene.enemies.map((x) => ({ dexId: Number(x.dexId) || 0, level: clamp(Number(x.level) || 1, 1, 100) }))
      };
      startBattlePrepare(`正在进入时空隧道第${safeFloor}层...`, entry, first.level, () => setupBattleScene({
        targetEntry: entry,
        targetLevel: first.level,
        targetTalentOverride: createUniformTalent50(),
        targetStudyOverride: createGuardianStudy(),
        mode: "timeTunnel",
        timeTunnelMeta: meta
      }), { targets: scene.enemies.map((x) => ({ entry: { ...x.entry, image: x.image }, level: x.level })) });
    };
    const startCurrentTimeTunnelBattle = () => {
      const scene = timeTunnelEnvironmentScene.value;
      if (!scene) return showToast("时空环境数据缺失。");
      timeTunnelDoorScene.value = null;
      return startTimeTunnelFloor(scene.floor, scene);
    };
    const openStudyPanel = () => {
      showStudyPanel.value = true;
      playSceneBgm(STUDY_BGM_SRC);
    };
    const closeStudyPanel = () => {
      showStudyPanel.value = false;
      refreshSceneBgm();
    };
    const startStudyBattle = (key) => {
      const meta = buildStudyBattleMeta(key);
      if (!meta) return showToast("学习力战场守卫数据缺失。");
      if (bagPets.value.length === 0) return showToast("背包中没有可出战亚比。");
      closeStudyPanel();
      startBattlePrepare(`正在进入${meta.label}...`, meta.targetEntry, 10, () => setupBattleScene({
        targetEntry: meta.targetEntry,
        targetLevel: 10,
        forceTargetHpRace500: false,
        targetTalentOverride: createUniformTalent30(),
        targetStudyOverride: createZeroStats(),
        mode: "study",
        guardianMeta: meta
      }));
    };
    const openTargetPanel = () => {
      if (!selectedDexEntry.value) return showToast("请先在图鉴中选择挑战目标。");
      if (!canChallengeFromDex(selectedDexEntry.value)) return showToast(challengeLockMessage(selectedDexEntry.value));
      showTargetPanel.value = true;
    };
    const closeTargetPanel = () => { showTargetPanel.value = false; };
    const selectDexAndOpenTarget = (dexId) => {
      const entry = dexById.get(Number(dexId));
      if (!entry) return;
      if (!canChallengeFromDex(entry)) return showToast(challengeLockMessage(entry));
      selectDex(entry.dexId);
      closeDexPanel();
      openTargetPanel();
    };
    const openGuardianChallengePanel = (dexId) => {
      const entry = dexById.get(Number(dexId));
      if (!entry || !isGuardianName(entry.name)) return;
      if (!isDexIdInOpenChallengeRange(entry)) return showToast(openChallengeRangeMessage());
      if (!isChallengeRoadEntryUnlocked(entry)) return showToast(challengeRoadLockMessage(entry));
      selectedGuardianDexId.value = entry.dexId;
      showGuardianChallengePanel.value = true;
    };
    const closeGuardianChallengePanel = () => { showGuardianChallengePanel.value = false; };
    const hasNormalHardForbiddenBagPet = () => bagPets.value.some((pet) => {
      if (!pet) return false;
      const ids = [
        Number(pet.dexId) || 0,
        Number(pet.baseDexId) || 0,
        Number(pet.fixedDexId) || 0,
        Number(resolvePetCurrentDexId(pet)) || 0
      ].filter(Boolean);
      const rootIds = ids.map((id) => Number(chainRootByDex.get(id)) || id);
      const names = [pet.speciesName, pet.fixedName, petDisplayName(pet)].map(normalize).filter(Boolean);
      return ids.concat(rootIds).some((id) => NORMAL_HARD_CHALLENGE_FORBIDDEN_DEX_IDS.has(id))
        || names.some((name) => name.includes("上古星龙"));
    });
    const blockNormalHardChallengeForbiddenPet = (difficultyKey) => {
      const key = normalize(difficultyKey);
      if (key !== "normal" && key !== "hard") return false;
      if (!hasNormalHardForbiddenBagPet()) return false;
      showToast("背包中存在普通/困难难度的挑战禁用亚比！");
      return true;
    };
    const startGuardianChallenge = async (dexId) => {
      const entry = dexById.get(Number(dexId));
      if (!entry || !isGuardianName(entry.name)) return showToast("该亚比不是守护者。");
      if (!isDexIdInOpenChallengeRange(entry)) return showToast(openChallengeRangeMessage());
      if (!isChallengeRoadEntryUnlocked(entry)) return showToast(challengeRoadLockMessage(entry));
      if (bagPets.value.length === 0) return showToast("背包中没有可出战亚比。");
      closeGuardianChallengePanel();
      setBattleReturnContext({ panel: "challengeRoad", tierIndex: selectedChallengeRoadTierIndex.value });
      closeChallengeRoadPanel();
      const extraGuardian = isExtraGuardianName(entry.name);
      const meta = {
        dexId: entry.dexId,
        guardianName: entry.name,
        levels: extraGuardian ? EXTRA_GUARDIAN_LEVELS.slice() : GUARDIAN_LEVELS.slice(),
        stageIndex: 0,
        hpRaceMultiplier: extraGuardian ? 10 : 5,
        talentValue: extraGuardian ? 50 : 30,
        statBoostRatio: extraGuardian ? ADVANCED_GUARDIAN_STAT_BOOST_RATIO : 0,
        lives: resolveGuardianName(entry.name) === "烈焰鸟" ? 2 : 1,
        usedLives: 0
      };
      const level = meta.levels[0];
      await startChallengeRecording({ targetName: entry.name, targetLevel: level, dexId: entry.dexId, source: "挑战之路" });
      startBattlePrepare(`正在进入守护者挑战 ${entry.name}...`, entry, level, () => setupBattleScene({
        targetEntry: entry,
        targetLevel: level,
        forceTargetHpRace500: false,
        targetHpRaceMultiplier: meta.hpRaceMultiplier,
        targetTalentOverride: extraGuardian ? createUniformTalent50() : null,
        targetStudyOverride: createGuardianStudy(),
        mode: "guardian",
        guardianMeta: meta
      }));
    };
    const confirmGuardianChallenge = () => {
      const entry = selectedGuardianEntry.value;
      if (!entry) return showToast("请先选择守护者。");
      startGuardianChallenge(entry.dexId);
    };
    const openBossChallengePanel = (dexId) => {
      const entry = dexById.get(Number(dexId));
      if (!entry || !isBossEntry(entry)) return;
      if (!isDexIdInOpenChallengeRange(entry)) return showToast(openChallengeRangeMessage());
      if (!isChallengeRoadEntryUnlocked(entry)) return showToast(challengeRoadLockMessage(entry) || BOSS_CHALLENGE_LOCKED_MESSAGE);
      selectedBossDexId.value = entry.dexId;
      if (!BOSS_DIFFICULTY_OPTIONS.some((x) => x.key === selectedBossDifficulty.value)) selectedBossDifficulty.value = "normal";
      showBossChallengePanel.value = true;
    };
    const closeBossChallengePanel = () => { showBossChallengePanel.value = false; };
    const startBossChallenge = async (dexId) => {
      const requestedEntry = dexById.get(Number(dexId));
      if (!requestedEntry || !isBossEntry(requestedEntry)) return showToast("该亚比不是BOSS。");
      if (!isDexIdInOpenChallengeRange(requestedEntry)) return showToast(openChallengeRangeMessage());
      if (!isChallengeRoadEntryUnlocked(requestedEntry)) return showToast(challengeRoadLockMessage(requestedEntry) || BOSS_CHALLENGE_LOCKED_MESSAGE);
      if (bagPets.value.length === 0) return showToast("背包中没有可出战亚比。");
      const difficulty = selectedBossDifficultyOption.value;
      if (blockNormalHardChallengeForbiddenPet(difficulty.key)) return;
      const chainRule = BOSS_CHAIN_CHALLENGE_BY_FINAL_DEX_ID[Number(requestedEntry.dexId) || 0] || null;
      const entry = chainRule ? (dexById.get(Number(chainRule.firstDexId) || 0) || requestedEntry) : requestedEntry;
      closeBossChallengePanel();
      setBattleReturnContext({ panel: "challengeRoad", tierIndex: selectedChallengeRoadTierIndex.value });
      closeChallengeRoadPanel();
      const prepareName = chainRule ? `${entry.name} → ${requestedEntry.name}` : entry.name;
      await startChallengeRecording({ targetName: prepareName, targetLevel: 100, dexId: requestedEntry.dexId, source: "挑战之路" });
      startBattlePrepare(`正在进入BOSS挑战 ${prepareName}（${difficulty.label}）...`, entry, 100, () => setupBattleScene({
        targetEntry: entry,
        targetLevel: 100,
        forceTargetHpRace500: false,
        targetHpRaceMultiplier: 15,
        targetTalentOverride: createUniformTalent60(),
        targetStudyOverride: createGuardianStudy(),
        mode: "boss",
        guardianMeta: {
          fixedHp: Math.max(1, Math.floor(Number(difficulty.fixedHp) || 1)),
          damageReductionRatio: clamp(Number(difficulty.damageReductionRatio) || 0, 0, 0.95),
          statBoostRatio: difficulty.statBoostRatio,
          bossDifficulty: difficulty.key,
          bossDifficultyLabel: difficulty.label,
          moraleDelta: difficulty.moraleDelta,
          moraleLabel: difficulty.moraleLabel,
          bossChainFinalDexId: chainRule ? Number(requestedEntry.dexId) || 0 : 0
        }
      }));
    };
    const confirmBossChallenge = () => {
      const entry = selectedBossEntry.value;
      if (!entry) return showToast("请先选择BOSS。");
      startBossChallenge(entry.dexId);
    };
    const openChallengeRoadEntry = (item) => {
      if (!item || item.missing || !Number(item.dexId)) return showToast("该挑战目标数据缺失。");
      if (!isChallengeRoadEntryUnlocked(item)) return showToast(challengeRoadLockMessage(item));
      if (item.kind === "guardian") return openGuardianChallengePanel(item.dexId);
      if (item.kind === "boss") return openBossChallengePanel(item.dexId);
      return showToast("该挑战目标暂不可挑战。");
    };
    const openWeeklyBossPanel = () => {
      if (!weeklyBossEntry.value) return showToast("当周BOSS数据暂不可用。");
      showWeeklyBossPanel.value = true;
    };
    const closeWeeklyBossPanel = () => { showWeeklyBossPanel.value = false; };
    const exchangeWeeklyBossEgg = () => {
      const entry = weeklyBossEntry.value;
      if (!entry) return showToast("当周BOSS数据暂不可用。");
      const rewardState = ensureWeeklyBossRewardState();
      if (rewardState.exchangedEgg || hasObtainedEggDex(WEEKLY_BOSS_CONFIG.dexId)) return showToast(`${WEEKLY_BOSS_CONFIG.name}亚比蛋已获取过，不能重复兑换。`);
      if (weeklyBossMedalCount.value < WEEKLY_BOSS_EGG_EXCHANGE_COST) return showToast(`当周BOSS勋章不足，需要${WEEKLY_BOSS_EGG_EXCHANGE_COST}个。`);
      if (!canDropEggByActionDexId(WEEKLY_BOSS_CONFIG.dexId)) return showToast(`${WEEKLY_BOSS_CONFIG.name}缺少可出战动作资源，暂不能兑换亚比蛋。`);
      consumeItemCount(WEEKLY_BOSS_MEDAL_ITEM_ID, WEEKLY_BOSS_EGG_EXCHANGE_COST);
      state.value.eggs.unshift({
        id: uid(),
        dexId: WEEKLY_BOSS_CONFIG.dexId,
        speciesName: WEEKLY_BOSS_CONFIG.name,
        startAt: Date.now(),
        hatchAt: Date.now() + HATCH_MS
      });
      markObtainedEggDex(WEEKLY_BOSS_CONFIG.dexId);
      rewardState.exchangedEgg = true;
      queueRewardFlyToasts([`兑换${WEEKLY_BOSS_CONFIG.name}亚比蛋！`]);
      showToast(`已使用${WEEKLY_BOSS_EGG_EXCHANGE_COST}个当周BOSS勋章兑换${WEEKLY_BOSS_CONFIG.name}亚比蛋。`);
    };
    const startWeeklyBossChallenge = () => {
      const entry = weeklyBossEntry.value;
      if (!entry) return showToast("当周BOSS数据暂不可用。");
      if (bagPets.value.length === 0) return showToast("背包中没有可出战亚比。");
      if (weeklyBossAttemptsLeft.value <= 0) return showToast("今日当周BOSS挑战次数已用完。");
      const difficulty = selectedWeeklyBossDifficultyOption.value || WEEKLY_BOSS_DIFFICULTY_OPTIONS[0];
      if (blockNormalHardChallengeForbiddenPet(difficulty.key)) return;
      const today = localDateKey();
      if (!state.value.weeklyBossAttempts || typeof state.value.weeklyBossAttempts !== "object" || normalize(state.value.weeklyBossAttempts.bossKey) !== WEEKLY_BOSS_CONFIG.key || normalize(state.value.weeklyBossAttempts.date) !== today) {
        state.value.weeklyBossAttempts = { bossKey: WEEKLY_BOSS_CONFIG.key, date: today, used: 0 };
      }
      state.value.weeklyBossAttempts.used = Math.min(WEEKLY_BOSS_CONFIG.dailyAttempts, Math.max(0, Math.floor(Number(state.value.weeklyBossAttempts.used) || 0)) + 1);
      setBattleReturnContext({ panel: "weeklyBoss" });
      closeWeeklyBossPanel();
      startBattlePrepare(`正在进入当周BOSS挑战 ${WEEKLY_BOSS_CONFIG.name}（${difficulty.label}）...`, entry, WEEKLY_BOSS_CONFIG.level, () => setupBattleScene({
        targetEntry: entry,
        targetLevel: WEEKLY_BOSS_CONFIG.level,
        forceTargetHpRace500: false,
        targetHpRaceMultiplier: WEEKLY_BOSS_CONFIG.hpRaceMultiplier,
        targetTalentOverride: createUniformTalent60(),
        targetStudyOverride: createGuardianStudy(),
        mode: "weeklyBoss",
        guardianMeta: {
          fixedHp: Math.max(1, Math.floor(Number(difficulty.fixedHp) || WEEKLY_BOSS_CONFIG.fixedHp)),
          damageReductionRatio: clamp(Number(difficulty.damageReductionRatio) || 0, 0, 0.95),
          statBoostRatio: WEEKLY_BOSS_CONFIG.statBoostRatio,
          qixingSealLevel: WEEKLY_BOSS_CONFIG.qixingSealLevel,
          weeklyBossDifficulty: difficulty.key,
          weeklyBossDifficultyLabel: difficulty.label,
          weeklyBossRandomStageDelta: difficulty.randomStageDelta,
          weeklyBossRandomStatus: difficulty.key === "nightmare",
          weeklyBoss: true
        }
      }));
    };

    const hatchEgg = (eggId) => {
      const idx = state.value.eggs.findIndex((e) => e.id === eggId);
      if (idx < 0) return;
      const egg = state.value.eggs[idx];
      if (egg.hatchAt > nowTs.value) return showToast("该亚比蛋还在孵化中。");
      const rawHatchDex = dexById.get(Number(egg.dexId)) || findDexByName(egg.speciesName);
      if (!rawHatchDex) return showToast("孵化失败：找不到图鉴编号。");
      const rootInfo = getChainStageInfoByDexId(rawHatchDex.dexId, rawHatchDex.name);
      const rootDexId = Number(rootInfo.rootDexId) || Number(rawHatchDex.dexId) || 0;
      const hatchDex = dexById.get(rootDexId) || rawHatchDex;
      const species = getSpeciesByDexId(hatchDex.dexId, hatchDex.name);
      if (!species) return showToast("孵化失败：缺少亚比数据。");

      const newPet = {
        id: uid(),
        dexId: hatchDex.dexId,
        baseDexId: hatchDex.dexId,
        speciesName: hatchDex.name,
        element: normalize(hatchDex.element) || "未知系",
        subElement: normalize(hatchDex.subElement),
        level: 1,
        exp: 0,
        totalExp: 0,
        talent: createRandomHatchTalent(),
        study: createZeroStats(),
        equippedSkills: normalizeEquippedSkillsBySpecies(
          species,
          species.skills.filter((s) => s.level <= 1).slice(0, 4).map((s) => s.name),
          1
        ),
        source: normalize(egg.source),
        createdAt: Date.now()
      };
      state.value.activePets.unshift(newPet);
      syncPetEvolutionForm(newPet);
      if (normalize(egg.source) !== SHOP_REDEEM_CODE_ALHUB666_SOURCE) markObtainedEggDex(newPet.dexId);
      state.value.selectedPetId = newPet.id;
      const emptyIdx = state.value.bagPetIds.findIndex((x) => !x);
      if (emptyIdx >= 0) state.value.bagPetIds.splice(emptyIdx, 1, newPet.id);
      state.value.selectedAttackerId = state.value.bagPetIds[0] || "";
      state.value.eggs.splice(idx, 1);
      const talentTotal = Object.values(newPet.talent || {}).reduce((sum, v) => sum + (Number(v) || 0), 0);
      const grade = talentGradeByTotal(talentTotal);
      showToast(`${newPet.speciesName} 孵化成功，初始 Lv.1。天赋总值 ${talentTotal}（${grade}）`);
    };

    const resetProgress = () => {
      if (!confirm("确定重置全部进度吗？")) return;
      state.value = createInitialState();
      selectedSkillName.value = "";
      replaceSkillCtx.value = null;
      bagReplaceCtx.value = null;
      bagItemUseCtx.value = null;
      autoBattleRun.value = null;
      saveState(state.value);
      showToast("进度已重置。");
    };

    const withFallback = (event) => {
      const img = event && event.target;
      if (!img) return;
      if (img.dataset.fallbackDone === "1") { img.style.display = "none"; return; }
      img.dataset.fallbackDone = "1";
      img.src = PLACEHOLDER;
    };
    const withStaticPetFallback = (event) => {
      const img = event && event.target;
      if (!img) return;
      if (img.dataset.staticFallbackDone === "1") { img.style.display = "none"; return; }
      img.dataset.staticFallbackDone = "1";
      img.src = STATIC_PET_IMAGE_FALLBACK;
    };
    const withBattlePetFallback = (event, side) => {
      const img = event && event.target;
      const scene = battleScene.value;
      if (!img || !scene) return withFallback(event);
      const safeSide = side === "target" ? "target" : "attacker";
      const fallback = safeSide === "target" ? scene.targetStaticImage : scene.attackerStaticImage;
      if (!fallback || img.dataset.battleFallbackDone === "1") return withFallback(event);
      img.dataset.battleFallbackDone = "1";
      img.src = fallback;
      img.classList.add("pet-bob");
    };

    return {
      state,
      playMode,
      authReady,
      authUser,
      authUsername,
      authPassword,
      authCaptcha,
      loginCaptchaVerified,
      loginCaptchaNotice: LOGIN_CAPTCHA_NOTICE,
      rememberPassword,
      authMode,
      authLoading,
      saveLoading,
      lastServerSavedAt,
      bgmVolume,
      bgmVolumePercent,
      battleSpeed,
      battleSpeedLabel,
      battlePrepare,
      settingsTab,
      applyBattleSpeed,
      battleBackground,
      onBattleBackgroundFilePick,
      resetBattleBackground,
      dexSearch,
      dexElementFilter,
      dexDefeatFilter,
      warehouseSearch,
      warehouseElementFilter,
      warehouseSortMode,
      nowTs,
      isDoubleRewardTime,
      doubleRewardNotice,
      toast,
      releaseNotes,
      gameplayGuideLines,
      battleResult,
      autoBattleRun,
      selectedAutoBattleCount,
      autoBattleCountOptions,
      challengeRecordingEnabled,
      challengeRecordingBusy,
      showChallengeRecordPanel,
      challengeRecordings,
      activeEvolution,
      battleScene,
      battleLogCollapsed,
      battleStageHoverSide,
      battleStagePinnedSide,
      showSwitchPanel,
      showGlobalSettingsPanel,
      showReleaseNotesModal,
      showGameplayGuideModal,
      selectedWarehousePetId,
      showWarehouseActionModal,
      selectedWarehouseActionPet,
      switchPanelMode,
      showElementPanel,
      showBagPanel,
      showWarehousePanel,
      showShopPanel,
      showBadgePanel,
      showEggHatchPanel,
      showLeaderboardPanel,
      leaderboardMetric,
      leaderboardTabs,
      leaderboardRows,
      leaderboardPage,
      leaderboardTotalPages,
      leaderboardLoading,
      leaderboardError,
      leaderboardCurrentLabel,
      openChallengeRecordPanel,
      closeChallengeRecordPanel,
      exportChallengeRecording,
      deleteChallengeRecording,
      formatChallengeRecordingTime,
      shopTab,
      shopRedeemCodeInput,
      battleActionTab,
      showPetDetailModal,
      elementRelationImage: ELEMENT_RELATION_IMAGE,
      selectedDexEntry,
      selectedDexSpecies,
      selectedDexFormCount,
      selectedDexStageIndex,
      selectedDexAvailableFormIndices,
      selectedChallengeFormIndex,
      selectedChallengeForm,
      selectedDexBattleImage,
      selectedChallengeLevelRange,
      selectedChallengeDefaultLevel,
      targetLevelInput,
      targetLevelValidationText,
      selectedChallengeFormLabel,
      selectedPet,
      selectedDexDetailPet,
      selectedSkillName,
      selectedSkillDetail,
      selectedPetSpecies,
      selectedPetDetailVisual,
      selectedPetSkillByName,
      selectedPetEquippedSkills,
      selectedRaceStats,
      selectedAbilityStats,
      abilityBarMax,
      selectedPetBattlePower,
      selectedPetTalent,
      selectedPetTalentTotal,
      selectedPetTalentGrade,
      selectedPetTalentImageSrc,
      selectedPetStudy,
      selectedStudyTotal,
      selectedInfoTab,
      replaceSkillCtx,
      bagReplaceCtx,
      filteredDex,
      dexElementOptions,
      activatedDexCount,
      dexTotal,
      bagSlots,
      selectedBagSlotIndex,
      firstPet,
      bagPets,
      bagCount,
      bagBattlePower,
      maxBagBattlePower,
      safeActivePets,
      warehousePets,
      warehouseElementOptions,
      filteredWarehousePets,
      warehouseCount,
      imageBadges,
      textBadges,
      shopItems,
      shopBuyQuantities,
      shopEggEntries,
      itemInventoryRows,
      autoBattleDeviceCount,
      qixingSealRows,
      selectedQixingSeal,
      selectedQixingSealLevel,
      selectedQixingSealMeta,
      selectedQixingSealRule,
      selectedQixingSealNextCost,
      selectedQixingSealNextHcoinCost,
      selectedQixingSealUpgradeSuccessText,
      selectedQixingSealDecomposeGain,
      canEquipSelectedQixingSeal,
      canDecomposeSelectedQixingSeal,
      selectedQixingSealEquippedOnSelectedPet,
      qixingSealImageSrc: QIXING_SEAL_IMAGE_SRC,
      selectQixingSeal,
      selectedQixingGachaPhaseKey,
      qixingGachaPhaseOptions,
      selectedQixingGachaPhase,
      selectedQixingGachaPhaseUnlocked,
      qixingGachaCurrentPity,
      qixingGachaCurrentPityLimit,
      qixingGachaCurrentPityLabel,
      qixingGachaPhaseLockText,
      qixingGachaPoolRows,
      qixingGachaDrawing,
      bagItemUseCtx,
      bagItemUseValidationText,
      petItemInventoryRows,
      selectedPetFeatureText,
      rewardFlyToast,
      shopTargetPetId,
      shopTargetOptions,
      shopSelectedPet,
      shopSelectedPetHasQixingSeal,
      safeEggs,
      safeBattleLog,
      predictedWinExp,
      predictedLoseExp,
      predictedElementFactor,
      predictedElementText,
      selectedDexElementGroups,
      selectedGuardianElementGroups,
      selectedBossElementGroups,
      ownedBadges,
      equippedBadge,
      availableSkillsForSelectedPet,
      expRequired,
      expPercent,
      petCurrentForm,
      bagPetVisual,
      petDisplayName,
      dexFinalForm,
      dexStatus,
      statusClass,
      formatRemain,
      isInBag,
      isEvolving: (petId) => evolvingIds.value.includes(petId),
      petId,
      eggId,
      rowId,
      safeSkillName,
      safeSkillType,
      safeSkillPower,
      safeSkillPP,
      safeSkillPPMax,
      safeSkillAccuracy,
      skillBattleDesc,
      skillAttackTypeLabel,
      skillDisplayDesc,
      hasEquippedSkill,
      hasDefeatedDex,
      petElementIconStyle,
      petElementIconSrc,
      petElementTransparentIconStyle,
      petElementList,
      skillTypeMeta,
      hpPercent,
      battleSceneLogRef,
      battleSceneSkills,
      battleSceneSkillRows,
      battleVisualReady,
      battleSkillElementRelationIcon,
      battleAttackerStatusBadges,
      battleTargetStatusBadges,
      battleAttackerTimedEffects,
      battleTargetTimedEffects,
      battleAttackerStageText,
      battleTargetStageText,
      battleAbilityNow,
      battleSceneAvailablePets,
      isBattleAnimSide,
      battlePetImageStyle,
      bagFocusPetAnimImageStyle,
      bagSlotPetAnimImageStyle,
      warehousePetAnimImageStyle,
      battlePreparePetAnimImageStyle,
      timeTunnelPetAnimImageStyle,
      timeTunnelEnemyScaleStyle,
      petAnimImageStyle,
      battleSkillEffectStyle,
      battleStatusEffectStyle,
      battleTransformEffectStyle,
      battleStageChangeFxStyle,
      canShowBattleSkinTransform,
      canTriggerBattleSkinTransform,
      triggerBattleSkinTransform,
      canCastBattleSkill,
      castBattleSkill,
      switchBattlePet,
      openSwitchPanel,
      openBattleItemPanel,
      openBattleSkillPanel,
      onBattleSkillTouchStart,
      onBattleSkillTouchEnd,
      closeSwitchPanel,
      closeBattleScene,
      closeBattleResult,
      repeatLastDexChallenge,
      closeEvolutionModal,
      closeReleaseNotesModal,
      toggleBattleLogCollapsed,
      showBattleStageSide,
      toggleBattleStagePinnedSide,
      clearBattleStagePinnedSide,
      isBattleStageVisibleSide,
      openGameplayGuideModal,
      closeGameplayGuideModal,
      showChallengeRoadPanel,
      showGuardianPanel,
      showBossPanel,
      showWeeklyBossPanel,
      showQixingGachaPanel,
      showStudyPanel,
      showTimeTunnelPanel,
      showTimeTunnelEnvironmentPanel,
      timeTunnelEnvironmentScene,
      timeTunnelDoorScene,
      timeEnvViewportStyle,
      showTargetPanel,
      showGuardianChallengePanel,
      showBossChallengePanel,
      challengeRoadTiers,
      selectedChallengeRoadTierIndex,
      challengeRoadDefeatFilter,
      challengeClearedMarkSrc: CHALLENGE_CLEARED_MARK_SRC,
      challengeClearedMiniMarkSrc: CHALLENGE_CLEARED_MINI_MARK_SRC,
      showChallengeRoadTierPanel,
      selectedChallengeRoadTier,
      filteredChallengeRoadItems,
      guardianDexEntries,
      bossDexEntries,
      weeklyBossEntry,
      weeklyBossAnimSrc,
      weeklyBossAnimStyle,
      weeklyBossAttemptsLeft,
      weeklyBossCleared,
      weeklyBossDifficultyOptions,
      selectedWeeklyBossDifficulty,
      selectedWeeklyBossDifficultyOption,
      weeklyBossMedalCount,
      weeklyBossEggExchangeAvailable,
      weeklyBossEggExchanged,
      weeklyBossChallengeText,
      weeklyBossElementGroups,
      isWeeklyBossDifficultyCleared,
      timeTunnelMaxClearedFloor,
      timeTunnelFloorRows,
      selectedTimeTunnelFloorRow,
      selectedTimeTunnelSpecialRules,
      timeTunnelEnvironmentEnemies,
      getTimeTunnelRewardInfo,
      studyBattlefields: STUDY_BATTLEFIELDS,
      selectedGuardianEntry,
      selectedBossEntry,
      bossDifficultyOptions: BOSS_DIFFICULTY_OPTIONS,
      selectedBossDifficulty,
      selectedBossDifficultyOption,
      selectedGuardianChallengeText,
      selectedBossChallengeText,
      isBossDifficultyCleared,
      petEquippedItem,
      selectedPetEquippedItem,
      canChallengeFromDex,
      canStartChallengeByDex,
      selectedDexChallengeLocked,
      openChallengeRoadPanel,
      closeChallengeRoadPanel,
      selectChallengeRoadTier,
      closeChallengeRoadTierPanel,
      openChallengeRoadEntry,
      openGuardianPanel,
      closeGuardianPanel,
      openBossPanel,
      closeBossPanel,
      openWeeklyBossPanel,
      closeWeeklyBossPanel,
      exchangeWeeklyBossEgg,
      openQixingGachaPanel,
      closeQixingGachaPanel,
      drawQixingGacha,
      openWeeklyBossDetail,
      startWeeklyBossChallenge,
      openTimeTunnelPanel,
      closeTimeTunnelPanel,
      selectTimeTunnelFloor,
      enterSelectedTimeTunnelFloor,
      backToTimeTunnelPanel,
      startTimeTunnelFloor,
      startCurrentTimeTunnelBattle,
      enterTimeTunnelNextFloor,
      openStudyPanel,
      closeStudyPanel,
      startStudyBattle,
      startAutoBattleFromDex,
      stopAutoBattle,
      openTargetPanel,
      closeTargetPanel,
      selectDexAndOpenTarget,
      openGuardianChallengePanel,
      closeGuardianChallengePanel,
      startGuardianChallenge,
      confirmGuardianChallenge,
      openBossChallengePanel,
      closeBossChallengePanel,
      startBossChallenge,
      confirmBossChallenge,
      selectDex,
      selectPet,
      toggleDexPanel,
      openDexPanel,
      closeDexPanel,
      openBagPanel,
      closeBagPanel,
      openWarehousePanel,
      closeWarehousePanel,
      toggleWarehousePetActions,
      isWarehousePetExpanded,
      closeWarehouseActionModal,
      addToBagFromWarehouse,
      openLeaderboardPanel,
      closeLeaderboardPanel,
      setLeaderboardMetric,
      changeLeaderboardPage,
      refreshLeaderboard,
      formatLeaderboardValue,
      openBadgePanel,
      closeBadgePanel,
      equipBadge,
      unequipBadge,
      openShopPanel,
      closeShopPanel,
      openRedeemGiftPanel,
      openEggHatchPanel,
      closeEggHatchPanel,
      buyShopItem,
      redeemShopCode,
      setBgmVolume,
      shopBuyQuantity,
      setShopBuyQuantity,
      shopItemTotalPrice,
      itemUseQuantity,
      setItemUseQuantity,
      isStudyFruitItem,
      buyShopEgg,
      openShopEggDetail,
      getItemCount,
      useShopItem,
      unequipPetItem,
      equipPetItemToSelectedPet,
      useBagItemOnSelectedPet,
      openBagItemUseDialog,
      setBagItemUseDialogQuantity,
      cancelBagItemUseDialog,
      confirmBagItemUseDialog,
      upgradeQixingSeal,
      decomposeQixingSeal,
      setChallengeFormIndex,
      openPetDetailModal,
      openSelectedDexDetail,
      openSelectedGuardianDetail,
      openSelectedBossDetail,
      closePetDetailModal,
      openElementPanel,
      closeElementPanel,
      toggleBagByPet,
      addToBag,
      replaceBagSlot,
      cancelReplaceBag,
      removeFromBag,
      moveBagLeft,
      moveBagRight,
      setAsFirstPet,
      useAsAttacker,
      inspectSkill,
      setInfoTab,
      setTalentValue,
      setStudyValue,
      toggleEquipSkill,
      startDirectReplaceSkill,
      confirmDirectReplaceSkill,
      confirmReplaceSkill,
      cancelReplaceSkill,
      startChallenge,
      hatchEgg,
      resetProgress,
      submitAuth,
      enterGuestMode,
      importGuestLocalSave,
      triggerLocalSaveImport,
      triggerUserLocalSaveImport,
      exportLocalSave,
      guestImportInput,
      importUserLocalSave,
      userImportInput,
      logoutUser,
      logoutGuest,
      saveToServer,
      loadServerSave,
      withFallback
      , withStaticPetFallback
      , withBattlePetFallback
    };
  }
}).mount("#app");
