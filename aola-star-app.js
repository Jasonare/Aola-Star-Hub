
if (!window.Vue) {
  const app = document.getElementById("app");
  if (app) {
    app.innerHTML = "<div style='padding:24px;font-weight:700;color:#dc2626'>Vue 加载失败，请检查 ./vendor/vue.global.prod.js 是否存在。</div>";
  }
  throw new Error("Vue failed to load from local vendor file");
}
const { createApp, ref, computed, watch, onMounted, onBeforeUnmount, nextTick } = window.Vue;

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
const SAVE_FILE_PREFIX = "aola_battle_save_";
const STARTER_DEX_IDS = [1, 4, 7];
const BASE_GUARDIAN_NAMES = ["冰拳艾司", "沙麒麟", "金刚库巴", "木面侠", "火花龙"];
const EXTRA_GUARDIAN_NAMES = [
  "烈焰鸟", "合金猛将", "利刺大黄蜂", "雷纳瑞", "魂斗鱼", "浮云尊者", "神武月", "影刃", "年兽", "麦斗元帅",
  "山脉之魂", "星光角斗士", "时间之神", "天使莱特", "战无炎", "极速威锋", "满月巨灵", "天之巨灵", "黑夜童心", "远古灵龟",
  "暴雪山神", "赤影飞狐", "赤魔导士", "天女若希", "神罗麦提", "超T兔", "猪猪超人", "翡冷翠", "鬼王", "岩波斗魂者",
  "友人契约书", "多古拉伯爵", "伊泽", "迦娜", "蓝羽灵者", "剑圣太白", "猎空", "奥弗", "赫提"
];
const EXTRA_GUARDIAN_ALIAS = {
  "浮云尊者兄弟": "浮云尊者",
  "终极麦斗猪": "麦斗元帅",
  "天使菜特": "天使莱特"
};
const GUARDIAN_NAMES = Array.from(new Set([...BASE_GUARDIAN_NAMES, ...EXTRA_GUARDIAN_NAMES]));
const BOSS_NAMES = [
  "骰子大王", "龙族大法师", "七星神龙", "青龙灵兽", "玄武灵兽", "白虎灵兽", "朱雀灵兽", "念", "凯撒", "修罗",
  "奇灵王", "音爵卡卡", "烈焰凤凰", "魔焰吉拉", "古渊露龙", "终结兔", "飞天独角兽", "熊猫大侠", "帝皇龙", "梅卡"
];
const EXCLUDED_GUARDIAN_NAMES = ["魔灯鬼王"];
const EXCLUDED_BOSS_NAMES = ["冰山修罗"];
const SHOP_EGG_NAMES = [
  "阿努比斯", "寒冰公主", "花冠公主", "燕尾怪盗", "黑暗守卫", "变异库斯特", "星云大圣", "暗影夜蝠",
  "宇宙侠", "冰霜射手", "爆裂侠", "怒风侠", "天辉侠", "霸气侠"
];
const STUDY_BATTLEFIELDS = [
  { key: "atk", label: "攻击", guardianName: "朵朵兔" },
  { key: "spAtk", label: "特攻", guardianName: "闪光河豚" },
  { key: "hp", label: "体力", guardianName: "小花苞" },
  { key: "def", label: "防御", guardianName: "扭扭" },
  { key: "spDef", label: "特防", guardianName: "盼盼" },
  { key: "speed", label: "速度", guardianName: "毛毛球" }
];
const SHOP_EGG_PRICE = 2000;
const LOGIN_BGM_SRC = "./BGM/小k橘子 - 主题公园3.ogg";
const HOME_BGM_SRC = "./BGM/小k橘子 - 神宠殿堂.ogg";
const WAREHOUSE_BGM_SRC = "./BGM/小k橘子 - 家园.ogg";
const SHOP_BGM_SRC = "./BGM/小k橘子 - 经验战场.ogg";
const STUDY_BGM_SRC = "./BGM/小k橘子 - 欢乐岛.ogg";
const GUARDIAN_LEVELS = [30, 40, 50, 60, 70, 80, 90, 100];
const EXTRA_GUARDIAN_LEVELS = [100];
const MAX_OPEN_CHALLENGE_DEX_ID = 796;
const NO_EGG_ACTION_DEX_IDS = new Set([116,117,118,119,210,213,216,217,218,219,222,223,224,225,227,237,239,240,241,242,243,244,245,246,247,248,250,251,252,269,270,272,301,304,306,307,308,318,319,321,322,324,325,326,327,329,330,331,332,333,334,340,359,360,361,369,399,400,401,402,403,404,405,415,419,420,446,447,448,461,462,464,465,466,523,527,609,716,717,735,754,755,756,757,758,759,760,761,762,763,764,765,766,767,768,769,770,771,772,773,774,775,776,777,778,779,780,781,782,783,784,785,786,787,788,789,790,791,792,793,797,798,799,800,801,802,803,804,805,806,807,808,809,810,811,812,813,814,815,816,817,818,819,820,821,822,823,824,825,826,827,828,829,830,831,832,833,834,835,836,837,838,839,840,841,842,843,844,845,846,847,848,849,850,851,852,853,854,855,856,857,858,859,860,861,862,863,864,865,866,867,868,869,870,871,872,873,874,875,876,877,878,879,880,881,882,883,884,885,886,887,888,889,890,891,892,893,894,895,896,897,898,899,900,901,902,903,904,905,906,907,908,909,910,911,912,913,914,915,916,917,918,919,920,921,922,923,924,925,926,927,928,929,930,931,932,933,934,935,936,937,938,939,940,941,942,943,944,945,946,947,948,949,950,951,952,953,954,955,956,957,958,959,960,961,962,963,964,965,966,967,968,969,970,971,972,973,974,975,976,977,978,979,980,981,982,983,984,985,986,987,988,989,990,991,992,993,994,995,996,997,998,999,1000,1001,1002,1003,1004,1005,1006,1007,1008,1009,1010,1011,1012,1013,1014,1015,1016,1017,1018,1019,1020,1021,1022,1023,1024,1025,1026,1027,1028,1029,1030,1031,1032,1033,1034,1035,1036,1037,1038,1039,1040,1041,1042,1043,1044,1045,1046,1047,1048,1049,1050,1051,1052,1053,1054,1055,1056,1057,1058,1059,1060,1061,1062,1063,1064,1065,1066,1067,1068,1069,1070,1071,1072,1073,1074,1075,1076,1077,1078,1079,1080,1081,1082,1083,1084,1085,1086,1087,1088,1089,1090,1091,1092,1093,1094,1095,1096,1097,1098,1099,1100,1101,1102,1103,1104,1105,1106,1107,1108,1109,1110,1111,1112,1113,1114,1115,1116,1117,1118,1119,1120,1121,1122,1123,1124,1125,1126,1127,1128,1129,1130,1131,1132,1133,1134,1135,1136,1137,1138,1139,1140,1141,1142,1143,1144,1145,1146,1147,1148,1149,1150,1151,1152,1153,1154,1155,1156,1157,1158,1159,1160,1161,1162,1163,1164,1165,1166,1167,1168,1169,1170,1171,1172,1173,1174,1175,1176,1177,1178,1179,1180,1181,1182,1183,1184,1185,1186,1187,1188,1189,1190,1191,1192,1193,1194,1195,1196,1197,1198,1199,1200,1201,1202,1203,1204,1205,1206,1207,1208,1209,1210,1211,1212,1213,1214,1215,1216,1217,1218,1219,1220,1221,1222,1223,1224,1225,1226,1227,1228,1229,1230,1231,1232,1233,1234,1235,1236,1237,1238,1239,1240,1241,1242,1243,1244,1245,1246,1247,1248,1249,1250,1251,1252,1253,1254,1255,1256,1257,1258,1259,1260,1261,1262,1263,1264,1265,1266,1267,1268,1269,1270,1271,1272,1273,1274,1275,1276,1277,1278,1279,1280,1281,1282,1283,1284,1285,1286,1287,1288,1289,1290,1291,1292,1293,1294,1295,1296,1297,1298,1299,1300,1301,1302,1303,1304,1305,1306,1307,1308,1309,1310,1311,1312,1313,1314,1315,1316,1317,1318,1319,1320,1321,1322,1323,1324,1325,1326,1327,1328,1329,1330,1331,1332,1333,1334,1335,1336,1337,1338,1339,1340,1341,1342,1343,1344,1345,1346,1347,1348,1349,1350,1351,1352,1353,1354,1355,1356,1357,1358,1359,1360,1361,1362,1363,1364,1365,1366,1367,1368,1369,1370,1371,1372,1373,1374,1375,1376,1377,1378,1379,1380,1381,1382,1383,1384,1385,1386,1387,1388,1389,1390,1391,1392,1393,1394,1395,1396,1397,1398,1399,1400,1401,1402,1403,1404,1405,1406,1407,1408,1409,1410,1411,1412,1413,1414,1415,1416,1417,1418,1419,1420,1421,1422,1423,1424,1425,1426,1427,1428,1429,1430,1431,1432,1433,1434,1435,1436,1437,1438,1439,1440,1441,1442,1443,1444,1445,1446,1447,1448,1449,1450,1451,1452,1453,1454,1455,1456,1457,1458,1459,1460,1461,1462,1463,1464,1465,1466,1467,1468,1469,1470,1471,1472,1473,1474,1475,1476,1477,1478,1479,1480,1481,1482,1483,1484,1485,1486,1487,1488,1489,1490,1491,1492,1493,1494,1495,1496,1497,1498,1499,1500,1501,1502,1503,1504,1505,1506,1507,1508,1509,1510,1511,1512,1513,1514,1515,1516,1517,1518,1519,1520,1521,1522,1523,1524,1525,1526,1527,1528,1529,1530,1531,1532,1533,1534,1535,1536,1537,1538,1539,1540,1541,1542,1543,1544,1545,1546,1547,1548,1549,1550,1551,1552,1553,1554,1555,1556,1557,1558,1559,1560,1561,1562,1563,1564,1565,1566,1567,1568,1569,1570,1571,1572,1573,1574,1575,1576,1577,1578,1579,1580,1581,1582,1583,1584,1585,1586,1587,1588,1589,1590,1591,1592,1593,1594,1595,1596,1597,1598,1599,1600,1601,1602,1603,1604,1605,1606,1607,1608,1609,1610,1611,1612,1613,1614,1615,1616,1617,1618,1619,1620,1621,1622,1623,1624,1625,1626,1627,1628,1629,1630,1631,1632,1633,1634,1635,1636,1637,1638,1639,1640,1641,1642,1643,1644,1645,1646,1647,1648,1649,1650,1651,1652,1653,1654,1655,1656,1657,1658,1659,1660,1661,1662,1663,1664,1665,1666,1667,1668,1669,1670,1671,1672,1673,1674,1675,1676,1677,1678,1679,1680,1681,1682,1683,1684,1685,1686,1687,1688,1689,1690,1691,1692,1693,1694,1695,1696,1697,1698,1699,1700,1701,1702,1703,1704,1705,1706,1707,1708,1709,1710,1711,1712,1713,1714,1715,1716,1717,1718,1719,1720,1721,1722,1723,1724,1725,1726,1727,1728,1729,1730,1731,1732,1733,1734,1735,1736,1737,1738,1739,1740,1741,1742,1743,1744,1745,1746,1747,1748,1749,1750,1751,1752,1753,1754,1755,1756,1757,1758,1759,1760,1761,1762,1763,1764,1765,1766,1767,1768,1769,1770,1771,1772,1773,1774,1775,1776,1777,1778,1779,1780,1781,1782,1783,1784,1785,1786,1787,1788,1789,1790,1791,1792,1793,1794,1795,1796,1797,1798,1799,1800,1801,1802,1803,1804,1805,1806,1807,1808,1809,1810,1811,1812,1813,1814,1815,1816,1817,1818,1819,1820,1821,1822,1823,1824,1825,1826,1827,1828,1829,1830,1831,1832,1833,1834,1835,1836,1837,1838,1839,1840,1841,1842,1843,1844,1845,1846,1847,1848,1849,1850,1851,1852,1853,1854,1855,1856,1857,1858,1859,1860,1861,1862,1863,1864,1865,1866,1867,1868,1869,1870,1871,1872,1873,1874,1875,1876,1877,1878,1879,1880,1881,1882,1883,1884,1885,1886,1887,1888,1889,1890,1891,1892,1893,1894,1895,1896,1897,1898,1899,1900,1901,1902,1903,1904,1905,1906,1907,1908,1909,1910,1911,1912,1913,1914,1915,1916,1917,1918,1919,1920,1921,1922,1923,1924,1925,1926,1927,1928,1929,1930,1931,1932,1933,1934,1935,1936,1937,1938,1939,1940,1941,1942,1943,1944,1945,1946,1947,1948,1949,1950,1951,1952,1953,1954,1955,1956,1957,1958,1959,1960,1961,1962,1963,1964,1965,1966,1967,1968,1969,1970,1971,1972,1973,1974,1975,1976,1977,1978,1979,1980,1981,1982,1983,1984,1985,1986,1987,1988,1989,1990,1991,1992,1993,1994,1995,1996,1997,1998,1999,2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024,2025,2026,2027,2028,2029,2030,2031,2032,2033,2034,2035,2036,2037,2038,2039,2040,2041,2042,2043,2044,2045,2046,2047,2048,2049,2050,2051,2052,2053,2054,2055,2056,2057,2058,2059,2060,2061,2062,2063,2064,2065,2066,2067,2068,2069,2070,2071,2072,2073,2074,2075,2076,2077,2078,2079,2080,2081,2082,2083,2084,2085,2086,2087,2088,2089,2090,2091,2092,2093,2094,2095,2096,2097,2098,2099,2100,2101,2102,2103,2104,2105,2106,2107,2108,2109,2110,2111,2112,2113,2114,2115,2116,2117,2118,2119,2120,2121,2122,2123,2124,2125,2126,2127,2128,2129,2130,2131,2132,2133,2134,2135,2136,2137,2138,2139,2140,2141,2142,2143,2144,2145,2146,2147,2148,2149,2150,2151,2152,2153,2154,2155,2156,2157,2158,2159,2160,2161,2162,2163,2164,2165,2166,2167,2168,2169,2170,2171,2172,2173,2174,2175,2176,2177,2178,2179,2180,2181,2182,2183,2184,2185,2186,2187,2188,2189,2190,2191,2192,2193,2194,2195,2196,2197,2198,2199,2200,2201,2202,2203,2204,2205,2206,2207,2208,2209,2210,2211,2212,2213,2214,2215,2216,2217,2218,2219,2220,2221,2222,2223,2224,2225,2226,2227,2228,2229,2230,2231,2232,2233,2234,2235,2236,2237,2238,2239,2240,2241,2242,2243,2244,2245,2246,2247,2248,2249,2250,2251,2252,2253,2254,2255,2256,2257,2258,2259,2260,2261,2262,2263,2264,2265,2266,2267,2268,2269,2270,2271,2272,2273,2274,2275,2276,2277,2278,2279,2280,2281,2282,2283,2284,2285,2286,2287,2288,2289,2290,2291,2292,2293,2294,2295,2296,2297,2298,2299,2300,2301,2302,2303,2304,2305,2306,2307,2308,2309,2310,2311,2312,2313,2314,2315,2316,2317,2318,2319,2320,2321,2322,2323,2324,2325,2326,2327,2328,2329,2330,2331,2332,2333,2334,2335,2336,2337,2338,2339,2340,2341,2342,2343,2344,2345,2346,2347,2348,2349,2350,2351,2352,2353,2354,2355,2356,2357,2358,2359,2360,2361,2362,2363,2364,2365,2366,2367,2368,2369,2370]);
const canObtainEggByActionDexId = (dexId) => {
  const id = Number(dexId) || 0;
  return id > 0 && id <= MAX_OPEN_CHALLENGE_DEX_ID && !NO_EGG_ACTION_DEX_IDS.has(id);
};
const BATTLE_BGM_SRC = "./BGM/小k橘子 - 战斗 (2015).ogg";
const HATCH_MS = 5 * 60 * 1000;
const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Crect width='120' height='120' rx='24' fill='%23f1f5f9'/%3E%3Ccircle cx='60' cy='48' r='22' fill='%2394a3b8' opacity='0.35'/%3E%3Crect x='24' y='78' width='72' height='14' rx='7' fill='%2394a3b8' opacity='0.35'/%3E%3C/svg%3E";
const ELEMENT_RELATION_IMAGE = "./属性克制.jpg";
const BATTLE_FLOAT_TEXT_DURATION_MS_GLOBAL = 2000;

const uid = () => `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const normalize = (s) => String(s || "").replace(/[\u200b\u00a0]/g, "").trim();
const ensureHttps = (url) => String(url || "").replace(/^http:\/\//i, "https://");
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
const markBattleFloatText = (scene) => {
  if (!scene) return;
  scene._floatTextUntil = Date.now() + BATTLE_FLOAT_TEXT_DURATION_MS_GLOBAL;
  if (scene._floatTextTimer) clearTimeout(scene._floatTextTimer);
  scene._floatTextTimer = setTimeout(() => {
    clearBattleFloatTextIfExpired(scene);
  }, BATTLE_FLOAT_TEXT_DURATION_MS_GLOBAL + 60);
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
  }, Math.round(BATTLE_FLOAT_TEXT_DURATION_MS_GLOBAL * 0.35));
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
const resolveShopEggName = (name) => {
  const raw = normalize(name);
  if (SHOP_EGG_NAMES.includes(raw)) return raw;
  return SHOP_EGG_NAMES.find((pet) => pet.length >= 2 && raw.includes(pet)) || raw;
};
const isShopEggName = (name) => SHOP_EGG_NAMES.includes(resolveShopEggName(name));
const normalizeElementName = (element) => {
  let raw = normalize(element);
  if (raw) {
    raw = raw.replace(/\uFFFD/g, "系");
    raw = raw.replace(/\?/g, "系");
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
    "超电系": "电系"
  };
  if (alias[raw]) return alias[raw];
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
  "未知系": ""
};

const ELEMENT_CHART = {
  "水系": { strong: ["火系", "土系", "爬行系"], weak: ["上古系", "木系"] },
  "火系": { strong: ["冰系", "机械系", "木系"], weak: ["水系", "上古系", "光明系"] },
  "木系": { strong: ["土系", "水系", "爬行系", "光明系"], weak: ["火系", "上古系", "飞行系", "机械系"] },
  "冰系": { strong: ["上古系", "飞行系", "木系"], weak: ["火系", "水系", "机械系"] },
  "土系": { strong: ["火系", "冰系", "飞行系"], weak: ["机械系", "爬行系", "格斗系"] },
  "电系": { strong: ["水系", "飞行系"], weak: ["木系", "上古系", "光明系"] },
  "爬行系": { strong: ["火系", "机械系", "土系", "电系"], weak: ["木系"] },
  "飞行系": { strong: ["木系", "格斗系"], weak: ["电系", "土系", "机械系"] },
  "机械系": { strong: ["冰系", "土系"], weak: ["水系", "火系"] },
  "数码系": { strong: ["神秘系"], weak: ["机械系", "暗黑系", "光明系"] },
  "上古系": { strong: ["上古系"], weak: ["机械系"] },
  "神秘系": { strong: ["格斗系"], weak: ["机械系", "神秘系"] },
  "格斗系": { strong: ["冰系", "土系", "机械系", "暗黑系"], weak: ["飞行系", "神秘系"] },
  "暗黑系": { strong: ["神秘系", "数码系"], weak: ["格斗系", "光明系"] },
  "光明系": { strong: ["神秘系", "数码系", "暗黑系"], weak: ["木系", "土系", "冰系", "机械系"] }
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
    if (Number.isFinite(power) && power <= 0 && !/(固定伤害|伤害\s*=|点伤害|威力)/.test(desc)) return "属性攻击";
    return parsed || "普通攻击";
  }
  return parseSkillTypeMeta(skillOrType).attackType || "普通攻击";
};
const skillDisplayDesc = (skill) => {
  const name = normalize(skill && skill.name).replace(/决/g, "诀");
  if (name === "锁神诀") return "100％命中，每回合减血1/16，持续5回合，并且令敌方1体速度下降1级，对BOSS有效；一场战斗只能使用一次，使用PP豆无法再次使用。";
  if (name === "激发力量") return "攻击对方单体，若自己中毒、麻痹或烧伤时，则发动2倍威力。";
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
const normalizeStudy = (raw) => {
  const s = raw && typeof raw === "object" ? raw : {};
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
  // 官方学习力总和上限 510，优先回退最后编辑项之外的超额
  for (const k of ["speed", "spDef", "def", "spAtk", "atk", "hp"]) {
    if (total <= 510) break;
    const cut = Math.min(out[k], total - 510);
    out[k] -= cut;
    total -= cut;
  }
  return out;
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
const STATUS_LABEL_MAP = { poison: "中毒", burn: "烧伤", sleep: "睡眠", paralyze: "麻痹", freeze: "冰冻", leech: "寄生", bind: "束缚", weak: "衰弱", confuse: "混乱", fear: "害怕" };
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
  const raw = normalize(typeText);
  const parsed = parseSkillTypeMeta(raw);
  const attackType = attackTypeLabelFromCode(attackTypeCode) || normalize(attackTypeText) || parsed.attackType || "普通攻击";
  return `${parsed.element || "未知系"}/${attackType}`;
};
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
  critStage: 0,
  statuses: { poison: 0, burn: 0, sleep: 0, paralyze: 0, freeze: 0, leech: 0, bind: 0, weak: 0, confuse: 0, fear: 0 },
  skipTurns: 0,
  timedEffects: [],
  onDamagedEffects: []
});
const normalizeBattleState = (state) => {
  const s = state && typeof state === "object" ? state : createBattleState();
  const out = createBattleState();
  BATTLE_STAGE_KEYS.forEach((k) => {
    out.stages[k] = clamp(Number(s.stages && s.stages[k]) || 0, -6, 6);
  });
  Object.keys(out.statuses).forEach((k) => {
    out.statuses[k] = Math.max(0, Math.floor(Number(s.statuses && s.statuses[k]) || 0));
  });
  out.critStage = clamp(Math.floor(Number(s.critStage) || 0), -6, 6);
  out.skipTurns = Math.max(0, Math.floor(Number(s.skipTurns) || 0));
  out.timedEffects = Array.isArray(s.timedEffects) ? s.timedEffects.map((e) => ({
    kind: normalize(e && e.kind),
    turns: Math.max(1, Math.floor(Number(e && e.turns) || 1)),
    data: e && typeof e.data === "object" ? { ...e.data } : {}
  })) : [];
  out.onDamagedEffects = Array.isArray(s.onDamagedEffects) ? s.onDamagedEffects.map((e) => ({
    turns: Math.max(1, Math.floor(Number(e && e.turns) || 1)),
    chance: clamp(Number(e && e.chance) || 0, 0, 1),
    allStatsDelta: clamp(Math.floor(Number(e && e.allStatsDelta) || 0), -6, 6),
    keys: Array.isArray(e && e.keys) ? e.keys.filter((k) => typeof k === "string") : [],
    delta: clamp(Math.floor(Number(e && e.delta) || 0), -6, 6),
    applyTo: normalize(e && e.applyTo) === "self" ? "self" : "attacker",
    trigger: normalize(e && e.trigger) === "attacked" ? "attacked" : "damaged"
  })) : [];
  return out;
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
  const meta = skillOrType && typeof skillOrType === "object"
    ? { attackType: skillAttackTypeLabel(skillOrType) }
    : parseSkillTypeMeta(skillOrType);
  if (meta.attackType.includes("特殊攻击")) return "special";
  if (meta.attackType.includes("普通攻击")) return "physical";
  return "status";
};
const parseSkillElement = (typeText) => parseSkillTypeMeta(typeText).element || "未知系";
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
const calcBattleFixedDamageAmount = (scene, actorSide, skill, actorLevel = 1) => {
  const name = normalize(skill && skill.name);
  if (name === "圣灵") {
    const speed = getBattleAbilityStat(scene, actorSide === "target" ? "target" : "attacker", "speed");
    return Math.max(1, Math.floor(speed / 3));
  }
  return parseFixedDamageAmount(skill, actorLevel);
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
const getSideState = (scene, side) => {
  if (!scene) return createBattleState();
  if (side === "attacker") {
    if (!scene.attackerState || typeof scene.attackerState !== "object") scene.attackerState = createBattleState();
    return scene.attackerState;
  }
  if (!scene.targetState || typeof scene.targetState !== "object") scene.targetState = createBattleState();
  return scene.targetState;
};
const getBattleAbilityStat = (scene, side, key) => {
  const ability = side === "attacker" ? scene.attackerAbility : scene.targetAbility;
  const state = getSideState(scene, side);
  const base = Math.max(1, Number(ability && ability[key]) || 1);
  const m = stageMultiplier(state.stages[key] || 0);
  let val = Math.max(1, Math.floor(base * m));
  if (key === "def") {
    const hasDefenseHalve = (state.timedEffects || []).some((e) => normalize(e && e.kind) === "defenseHalve");
    if (hasDefenseHalve) val = Math.max(1, Math.floor(val * 0.5));
  }
  return val;
};
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
const applyStageDelta = (scene, side, keys, delta) => {
  const state = getSideState(scene, side);
  const n = clamp(Math.floor(Number(delta) || 0), -6, 6);
  if (n !== 0 && hasStageGuard(scene, side, n)) {
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
  return changed;
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
const TIMED_EFFECT_REFRESH_BY_KIND = new Set(["diceDrain"]);
const addTimedEffect = (scene, side, effect) => {
  const state = getSideState(scene, side);
  const next = {
    kind: normalize(effect && effect.kind),
    turns: Math.max(1, Math.floor(Number(effect && effect.turns) || 1)),
    data: effect && typeof effect.data === "object" ? { ...effect.data } : {}
  };
  const keyOf = (fx) => `${normalize(fx && fx.kind)}|${JSON.stringify(fx && fx.data ? fx.data : {})}`;
  const idx = state.timedEffects.findIndex((fx) => TIMED_EFFECT_REFRESH_BY_KIND.has(next.kind)
    ? normalize(fx && fx.kind) === next.kind
    : keyOf(fx) === keyOf(next));
  if (idx >= 0) {
    state.timedEffects[idx] = next;
  } else {
    state.timedEffects.push(next);
  }
};
const damageSideByMaxHpRatio = (scene, side, ratio) => {
  const hpKey = side === "attacker" ? "attackerHp" : "targetHp";
  const maxHpKey = side === "attacker" ? "attackerMaxHp" : "targetMaxHp";
  const maxHp = Math.max(1, Number(scene && scene[maxHpKey]) || 1);
  const before = Math.max(0, Number(scene && scene[hpKey]) || 0);
  const damage = Math.max(1, Math.floor(maxHp * clamp(Number(ratio) || 0, 0.01, 1)));
  scene[hpKey] = Math.max(0, before - damage);
  const actual = Math.max(0, before - (Number(scene[hpKey]) || 0));
  if (side === "attacker" && Array.isArray(scene.team)) {
    const idx = scene.team.findIndex((u) => u && u.id === scene.currentAttackerId);
    if (idx >= 0) scene.team[idx].hp = clamp(Number(scene.attackerHp) || 0, 0, Number(scene.team[idx].maxHp) || 1);
  }
  syncBattleUiHpForSide(scene, side);
  return { damage, actual };
};
const addOnDamagedEffect = (scene, side, effect) => {
  const state = getSideState(scene, side);
  state.onDamagedEffects.push({
    turns: Math.max(1, Math.floor(Number(effect && effect.turns) || 1)),
    chance: clamp(Number(effect && effect.chance) || 0, 0, 1),
    allStatsDelta: clamp(Math.floor(Number(effect && effect.allStatsDelta) || 0), -6, 6),
    keys: Array.isArray(effect && effect.keys) ? effect.keys.filter((k) => typeof k === "string") : [],
    delta: clamp(Math.floor(Number(effect && effect.delta) || 0), -6, 6),
    applyTo: normalize(effect && effect.applyTo) === "self" ? "self" : "attacker",
    trigger: normalize(effect && effect.trigger) === "attacked" ? "attacked" : "damaged"
  });
};
const cleanupExpiredEffects = (state) => {
  if (!state) return;
  state.timedEffects = (state.timedEffects || []).filter((e) => Number(e.turns) > 0);
  state.onDamagedEffects = (state.onDamagedEffects || []).filter((e) => Number(e.turns) > 0);
};
const pushBattleLog = (scene, text) => {
  if (!scene || !text) return;
  if (!Array.isArray(scene.logs)) scene.logs = [];
  scene.logs.push(String(text));
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
  if (kind === "damageReduction") {
    const ratio = Math.round((Number(d.ratio) || 0) * 100);
    return { key: `dr_${ratio}`, label: `减伤${ratio}%`, turns, desc: `受到伤害降低${ratio}%，剩余${turns}回合`, tone: "buff" };
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
  if (kind === "healOverTime") {
    const ratio = Number(d.ratio) || 0;
    const pct = Math.max(1, Math.round(ratio * 100));
    return { key: `hot_${pct}`, label: `回血${pct}%`, turns, desc: `每回合回复最大体力${pct}%，剩余${turns}回合`, tone: "buff" };
  }
  if (kind === "attackImmunity") {
    const attackKind = normalize(d.attackKind) || "all";
    const chance = Math.round((Number(d.chance) || 1) * 100);
    const label = attackKind === "physical" ? "免疫普攻" : (attackKind === "special" ? "免疫特攻" : "攻击免疫");
    const desc = `${chance}%概率免受${attackKind === "physical" ? "普通攻击" : (attackKind === "special" ? "特殊攻击" : "攻击")}伤害，剩余${turns}回合`;
    return { key: `immune_${attackKind}_${chance}`, label, turns, desc, tone: "buff" };
  }
  if (kind === "stageGuard") {
    const mode = normalize(d.mode) || "debuff";
    const label = mode === "buff" ? "防止提升" : (mode === "all" ? "能力保护" : "防止削弱");
    const desc = mode === "buff"
      ? `属性能力等级不能被提升，剩余${turns}回合`
      : (mode === "all" ? `属性能力等级不会变化，剩余${turns}回合` : `属性能力等级不会被削弱，剩余${turns}回合`);
    return { key: `stage_guard_${mode}`, label, turns, desc, tone: "buff" };
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
    return { key: "dice_drain", label: "骰子炸弹", turns, desc: `本次投掷${pip}点，每回合被吸取${pip * amount}体力，剩余${turns}回合`, tone: "debuff" };
  }
  if (kind === "lockGodDrain") {
    return { key: "lock_god_drain", label: "锁神诀", turns, desc: `每回合扣除最大体力值的1/16，剩余${turns}回合`, tone: "debuff" };
  }
  return { key: kind || "effect", label: "持续效果", turns, desc: `持续效果剩余${turns}回合`, tone: "buff" };
};
const onDamagedBadgeMeta = (e) => {
  const turns = Math.max(0, Number(e && e.turns) || 0);
  if (turns <= 0) return null;
  const trigger = normalize(e && e.trigger) === "attacked" ? "受击后" : "受伤后";
  const applyTo = normalize(e && e.applyTo) === "self" ? "自身" : "攻击方";
  const delta = Number(e && e.delta) || Number(e && e.allStatsDelta) || 0;
  const keys = Array.isArray(e && e.keys) ? e.keys : [];
  const what = keys.length > 0 ? keys.map((k) => battleStatLabel(k)).join("、") : "全属性";
  const act = delta >= 0 ? "提升" : "降低";
  return {
    key: `od_${trigger}_${applyTo}_${what}_${delta}`,
    label: "受击反制",
    turns,
    desc: `${trigger}使${applyTo}${act}${Math.abs(delta)}级：${what}，剩余${turns}回合`,
    tone: delta >= 0 ? "buff" : "debuff"
  };
};
const buildTimedEffectBadges = (scene, side) => {
  const sideState = getSideState(scene, side);
  const own = sideState.timedEffects || [];
  const global = Array.isArray(scene && scene.globalTimedEffects) ? scene.globalTimedEffects : [];
  const fxBadges = own.concat(global).map((e) => timedEffectBadgeMeta(e)).filter((x) => x.turns > 0);
  const onDamagedBadges = (sideState.onDamagedEffects || []).map((e) => onDamagedBadgeMeta(e)).filter(Boolean);
  const out = [];
  const seen = new Set();
  fxBadges.concat(onDamagedBadges).forEach((badge) => {
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
  (state.timedEffects || []).forEach((e) => { e.turns = Math.max(0, Number(e.turns) - 1); });
  (state.onDamagedEffects || []).forEach((e) => { e.turns = Math.max(0, Number(e.turns) - 1); });
  cleanupExpiredEffects(state);
};
const getDamageReductionFactor = (scene, side) => {
  const state = getSideState(scene, side);
  let ratio = 0;
  (state.timedEffects || []).forEach((e) => {
    if (e.kind === "damageReduction") {
      ratio = Math.max(ratio, clamp(Number(e.data && e.data.ratio) || 0, 0, 0.95));
    }
  });
  return 1 - ratio;
};
const getAttackImmunityEffect = (scene, side, atkKind) => {
  if (atkKind !== "physical" && atkKind !== "special") return null;
  const state = getSideState(scene, side);
  const kind = atkKind === "special" ? "special" : "physical";
  cleanupExpiredEffects(state);
  const effects = (state.timedEffects || []).filter((e) => {
    if (normalize(e && e.kind) !== "attackImmunity") return false;
    if (Math.max(0, Number(e && e.turns) || 0) <= 0) return false;
    const d = e.data || {};
    const guardKind = normalize(d.attackKind) || "all";
    return guardKind === "all" || guardKind === kind;
  });
  if (effects.length === 0) return null;
  return effects.reduce((best, cur) => {
    const bp = clamp(Number(best.data && best.data.chance) || 1, 0, 1);
    const cp = clamp(Number(cur.data && cur.data.chance) || 1, 0, 1);
    return cp > bp ? cur : best;
  }, effects[0]);
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
const parseSkillEffects = (skill) => {
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
  if (canonicalSkillName === "锁神诀") {
    return [
      { kind: "lockGodSeal", target: "opponent", turns: 8, ratio: 1 / 16, speedDelta: -1 }
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
    const m = seg.match(/(\d+(?:\.\d+)?)\s*%\s*(?:概率|几率|机率)?|(?:概率|几率|机率)\s*(\d+(?:\.\d+)?)\s*%/);
    if (!m) return 1;
    const n = Number(m[1] || m[2]);
    return Number.isFinite(n) ? clamp(n / 100, 0, 1) : 1;
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
  if (name === "欢乐之铃") {
    const turns = 5;
    const ratio = clamp(parseRatioFromText(desc, 0.1) || 0.1, 0.03, 1);
    add({ kind: "timedHeal", target: "self", turns, ratio });
  }
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
        const ratioText =
          desc.match(/(?:回复|恢复)[^。；，\n]{0,18}(?:自身|自己|我方)?[^。；，\n]{0,8}((?:\d+\s*\/\s*\d+)|(?:\d+(?:\.\d+)?\s*%)|一半|三分之一|四分之一|五分之一|六分之一|八分之一|十六分之一)(?:的)?\s*(?:最大)?(?:体力值?|生命值?|HP|hp)/) ||
          desc.match(/(?:回复|恢复)[^。；，\n]{0,18}(?:自身|自己|我方)?[^。；，\n]{0,8}(?:最大)?(?:体力值?|生命值?|HP|hp)(?:的)?\s*((?:\d+\s*\/\s*\d+)|(?:\d+(?:\.\d+)?\s*%)|一半|三分之一|四分之一|五分之一|六分之一|八分之一|十六分之一)/) ||
          desc.match(/(?:最大)?(?:体力值?|生命值?|HP|hp)(?:的)?\s*((?:\d+\s*\/\s*\d+)|(?:\d+(?:\.\d+)?\s*%)|一半|三分之一|四分之一|五分之一|六分之一|八分之一|十六分之一)/) ||
          desc.match(/((?:\d+\s*\/\s*\d+)|(?:\d+(?:\.\d+)?\s*%)|一半|三分之一|四分之一|五分之一|六分之一|八分之一|十六分之一)(?:的)?\s*(?:最大)?(?:体力值?|生命值?|HP|hp)/);
        if (ratioText) {
          const ratio = clamp(parseRatioFromText(ratioText[1], 0.5), 0.01, 1);
          add({ kind: "heal", target: "self", ratio });
        } else {
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
  if ((desc.includes("停止行动") || desc.includes("无法行动")) && !hasExplicitSelfSkip) {
    const turnsM = desc.match(/([0-9一二三四五六])\s*回合/);
    const turns = turnsM ? cnNumToInt(turnsM[1], 1) : 1;
    const selfStop = /(?:自身|自己|自身体?|本回合)[^。；，\n]{0,12}(?:停止行动|无法行动)/.test(desc);
    const oppStop = /(?:对方|敌方)[^。；，\n]{0,12}(?:停止行动|无法行动)/.test(desc);
    let target = "opponent";
    if (selfStop && !oppStop) target = "self";
    else if (!selfStop && oppStop) target = "opponent";
    else if (selfStop && oppStop) {
      // 同时出现时优先使用“更近的动作短语”
      const selfIdx = desc.search(/(?:自身|自己|自身体?|本回合)[^。；，\n]{0,12}(?:停止行动|无法行动)/);
      const oppIdx = desc.search(/(?:对方|敌方)[^。；，\n]{0,12}(?:停止行动|无法行动)/);
      target = (selfIdx >= 0 && (oppIdx < 0 || selfIdx <= oppIdx)) ? "self" : "opponent";
    }
    add({ kind: "skip", target, turns: Math.max(1, turns) });
  }

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
  if (name === "骰子炸弹") {
    add({ kind: "diceDrain", target: "opponent", turns: 5, amountPerPip: 30 });
  }
  if (name === "圣灵") {
    add({ kind: "lifesteal", target: "self", ratio: 0.5 });
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
    if (t.includes("全属性") || t.includes("全能力")) return ALL_ABILITY_STAGE_KEYS.slice();
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
    add({
      kind: "onDamagedStage",
      target: "self",
      applyTo: "attacker",
      keys: ["atk", "spAtk"],
      delta: -3,
      turns: onDamagedTurns,
      chance: 1,
      trigger: "damaged"
    });
  }
  const statusMap = [
    { key: "中毒", status: "poison", turns: 5 },
    { key: "烧伤", status: "burn", turns: 5 },
    { key: "睡眠", status: "sleep", turns: 2 },
    { key: "麻痹", status: "paralyze", turns: 3 },
    { key: "冰冻", status: "freeze", turns: 5 },
    { key: "寄生", status: "leech", turns: 5 },
    { key: "束缚", status: "bind", turns: 5 },
    { key: "衰弱", status: "weak", turns: 4 },
    { key: "混乱", status: "confuse", turns: 3 },
    { key: "害怕", status: "fear", turns: 1 }
  ];
  statusMap.forEach((x) => {
    if (!desc.includes(x.key)) return;
    if (!hasStatusApplyIntent(desc, x.key)) return;
    const m = desc.match(new RegExp(`${x.key}\\s*([0-9一二三四五六])\\s*回合`));
    let turns = m ? cnNumToInt(m[1], x.turns) : x.turns;
    if (x.status === "sleep" && !m) turns = 1 + Math.floor(Math.random() * 2);
    const selfStatus = new RegExp(`(?:自身|自己|我方)[^。；，\\n]{0,10}${x.key}|${x.key}[^。；，\\n]{0,10}(?:自身|自己|我方)`).test(desc);
    const opponentStatus = new RegExp(`(?:对方|敌方|目标)[^。；，\\n]{0,14}${x.key}|${x.key}[^。；，\\n]{0,14}(?:对方|敌方|目标)`).test(desc);
    const recoverySleep = x.status === "sleep" && (name === "恢复性睡眠" || /睡眠[^。；，\n]{0,18}(?:回复|恢复)|(?:回复|恢复)[^。；，\n]{0,18}睡眠/.test(desc));
    const target = (recoverySleep || (selfStatus && !opponentStatus)) ? "self" : "opponent";
    const chance = statusChanceFromDesc(desc, x.key, 1);
    add({ kind: "status", target, status: x.status, turns, chance });
  });
  if ((name === "玄灵甲") || (desc.includes("伤害抗性") && desc.includes("50"))) {
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
      normalize(e.applyTo)
    ].join("|");
    if (seen.has(key)) return;
    seen.add(key);
    dedup.push(e);
  });
  return dedup;
};
const applySkillEffects = (scene, actor, skill, didHit) => {
  const effects = parseSkillEffects(skill);
  if (!effects.length) return [];
  const logs = [];
  const actorName = actor === "attacker" ? scene.attackerName : scene.targetName;
  const targetName = actor === "attacker" ? scene.targetName : scene.attackerName;
  const isGuardianImmuneSide = (side) => scene && (scene.mode === "guardian" || scene.mode === "boss") && side === "target";
  effects.forEach((e) => {
    if (!didHit && (e.kind === "status" || e.kind === "stage") && e.target === "opponent") return;
    if (e.kind === "stage") {
      if (e.requireHit && !didHit) return;
      const chance = clamp(Number(e.chance) || 1, 0, 1);
      if (Math.random() > chance) return;
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const changed = applyStageDelta(scene, side, e.keys, e.delta);
      if (changed.length > 0) {
        const who = side === "attacker" ? scene.attackerName : scene.targetName;
        const act = e.delta > 0 ? "提升" : "降低";
        logs.push(`${who}${act}${Math.abs(e.delta)}级：${changed.map((k) => battleStatLabel(k)).join("、")}${chance < 1 ? `（概率${Math.round(chance * 100)}%）` : ""}`);
      }
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
      const chance = clamp(Number(e.chance) || 1, 0, 1);
      if (Math.random() > chance) return;
      const st = getSideState(scene, side);
      if (DAMAGE_STATUS_KEYS.includes(e.status) && Math.max(0, Number(st.statuses.sleep) || 0) > 0) {
        st.statuses.sleep = 0;
        logs.push(`${side === "attacker" ? scene.attackerName : scene.targetName}因扣血类状态解除睡眠。`);
      }
      st.statuses[e.status] = Math.max(st.statuses[e.status], Math.max(1, Math.floor(Number(e.turns) || 1)));
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
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const st = getSideState(scene, side);
      st.skipTurns = Math.max(st.skipTurns, Math.max(1, Math.floor(Number(e.turns) || 1)));
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      logs.push(`${who}将停止行动${st.skipTurns}回合`);
      return;
    }
    if (e.kind === "heal") {
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      const shownHeal = calcHealAmountByRatio(scene, side, e.ratio);
      const healed = healSideByRatio(scene, side, e.ratio);
      syncBattleUiHpForSide(scene, side);
      if (side === "attacker") scene.healOnAttacker = `+${shownHeal}`;
      else scene.healOnTarget = `+${shownHeal}`;
      markBattleFloatText(scene);
      if (side === "attacker" && Array.isArray(scene.team)) {
        const idx = scene.team.findIndex((u) => u.id === scene.currentAttackerId);
        if (idx >= 0) scene.team[idx].hp = clamp(Number(scene.attackerHp) || 0, 0, scene.team[idx].maxHp);
      }
      logs.push(`${who}回复了 ${shownHeal} 点体力（实际恢复 ${healed}）`);
      return;
    }
    if (e.kind === "healFlat") {
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      const hpKey = side === "attacker" ? "attackerHp" : "targetHp";
      const maxHpKey = side === "attacker" ? "attackerMaxHp" : "targetMaxHp";
      const before = Number(scene[hpKey]) || 0;
      const maxHp = Math.max(1, Number(scene[maxHpKey]) || 1);
      const val = Math.max(1, Number(e.amount) || 0);
      scene[hpKey] = clamp(before + val, 0, maxHp);
      const healed = Math.max(0, (Number(scene[hpKey]) || 0) - before);
      syncBattleUiHpForSide(scene, side);
      if (side === "attacker") scene.healOnAttacker = `+${val}`;
      else scene.healOnTarget = `+${val}`;
      markBattleFloatText(scene);
      if (side === "attacker" && Array.isArray(scene.team)) {
        const idx = scene.team.findIndex((u) => u.id === scene.currentAttackerId);
        if (idx >= 0) scene.team[idx].hp = clamp(Number(scene.attackerHp) || 0, 0, scene.team[idx].maxHp);
      }
      logs.push(`${who}回复了 ${val} 点体力（实际恢复 ${healed}）`);
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
        const idx = scene.team.findIndex((u) => u.id === scene.currentAttackerId);
        if (idx >= 0) scene.team[idx].hp = clamp(Number(scene.attackerHp) || 0, 0, scene.team[idx].maxHp);
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
        applyBattleDamageToActivePet(scene);
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
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      const hpKey = side === "attacker" ? "attackerHp" : "targetHp";
      const maxHpKey = side === "attacker" ? "attackerMaxHp" : "targetMaxHp";
      const maxHp = Math.max(1, Number(scene[maxHpKey]) || 1);
      const recoil = Math.max(1, Math.floor(maxHp * clamp(Number(e.ratio) || 0, 0.01, 1)));
      const before = Number(scene[hpKey]) || 0;
      scene[hpKey] = Math.max(0, before - recoil);
      const actual = Math.max(0, before - (Number(scene[hpKey]) || 0));
      if (side === "attacker") applyBattleDamageToActivePet(scene);
      syncBattleUiHpForSide(scene, side);
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
      return;
    }
    if (e.kind === "critStage") {
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const st = getSideState(scene, side);
      const prev = st.critStage || 0;
      st.critStage = clamp(prev + (Number(e.delta) || 0), -6, 6);
      if (st.critStage !== prev) {
        const who = side === "attacker" ? scene.attackerName : scene.targetName;
        logs.push(`${who}${(Number(e.delta) || 0) >= 0 ? "提升" : "降低"}暴击等级${Math.abs(Number(e.delta) || 0)}级`);
      }
      return;
    }
    if (e.kind === "damageReduction") {
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      addTimedEffect(scene, side, { kind: "damageReduction", turns: e.turns, data: { ratio: e.ratio } });
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      logs.push(`${who}获得减伤${Math.round((Number(e.ratio) || 0) * 100)}%，持续${e.turns}回合`);
      return;
    }
    if (e.kind === "timedHeal") {
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      addTimedEffect(scene, side, { kind: "healOverTime", turns: e.turns, data: { ratio: e.ratio } });
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      logs.push(`${who}获得持续回血效果，持续${e.turns}回合`);
      return;
    }
    if (e.kind === "attackImmunity") {
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const attackKind = normalize(e.attackKind) || "all";
      const chance = clamp(Number(e.chance) || 1, 0, 1);
      addTimedEffect(scene, side, { kind: "attackImmunity", turns: e.turns, data: { attackKind, chance } });
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      const attackLabel = attackKind === "physical" ? "普通攻击" : (attackKind === "special" ? "特殊攻击" : "攻击");
      logs.push(`${who}获得${Math.round(chance * 100)}%概率免受${attackLabel}伤害，持续${e.turns}回合`);
      return;
    }
    if (e.kind === "stageGuard") {
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const mode = normalize(e.mode) || "debuff";
      addTimedEffect(scene, side, { kind: "stageGuard", turns: e.turns, data: { mode } });
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      const label = mode === "buff" ? "提升" : (mode === "all" ? "变化" : "削弱");
      logs.push(`${who}获得能力等级保护，属性能力等级不会被${label}，持续${e.turns}回合`);
      return;
    }
    if (e.kind === "onDamagedAllStatDown") {
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      addOnDamagedEffect(scene, side, { turns: e.turns, chance: e.chance, allStatsDelta: e.delta });
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      logs.push(`${who}获得受击反制效果，持续${e.turns}回合`);
      return;
    }
    if (e.kind === "onDamagedStage") {
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      addOnDamagedEffect(scene, side, {
        turns: e.turns,
        chance: e.chance,
        keys: Array.isArray(e.keys) ? e.keys.slice() : [],
        delta: Number(e.delta) || 0,
        applyTo: normalize(e.applyTo) === "self" ? "self" : "attacker",
        trigger: normalize(e.trigger) === "attacked" ? "attacked" : "damaged"
      });
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      const applyToWho = normalize(e.applyTo) === "self" ? "自身" : "攻击方";
      logs.push(`${who}获得受击触发效果，受击时使${applyToWho}${(Number(e.delta) || 0) >= 0 ? "提升" : "降低"}能力，持续${e.turns}回合`);
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
      addTimedEffect(scene, side, {
        kind: "diceDrain",
        turns: Math.max(1, Math.floor(Number(e.turns) || 5)),
        data: {
          caster,
          pip,
          amountPerPip: Math.max(1, Math.floor(Number(e.amountPerPip) || 30))
        }
      });
      logs.push(`${casterName}使用骰子炸弹投掷出${pip}点，${who}将在5回合内每回合被吸取${pip * Math.max(1, Math.floor(Number(e.amountPerPip) || 30))}点体力。`);
    }
    if (e.kind === "lockGodSeal") {
      if (!didHit) return;
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const caster = actor;
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      const turns = Math.max(1, Math.floor(Number(e.turns) || 8));
      const ratio = clamp(Number(e.ratio) || (1 / 16), 0.01, 1);
      const speedDelta = -Math.max(1, Math.floor(Math.abs(Number(e.speedDelta) || 1)));
      addTimedEffect(scene, side, {
        kind: "lockGodDrain",
        turns,
        data: { caster, ratio }
      });
      const changed = applyStageDelta(scene, side, ["speed"], speedDelta);
      logs.push(`${who}被锁神诀锁定，${turns}回合内每回合扣除最大体力值的1/16。`);
      if (changed.length > 0) logs.push(`${who}降低${Math.abs(speedDelta)}级：${changed.map((k) => battleStatLabel(k)).join("、")}`);
      return;
    }
    if (e.kind === "lockGodDrain") {
      if (!didHit) return;
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const caster = actor;
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      const turns = Math.max(1, Math.floor(Number(e.turns) || 8));
      const ratio = clamp(Number(e.ratio) || (1 / 16), 0.01, 1);
      addTimedEffect(scene, side, {
        kind: "lockGodDrain",
        turns,
        data: { caster, ratio }
      });
      logs.push(`${who}被锁神诀锁定，${turns}回合内每回合扣除最大体力值的1/16。`);
    }
  });
  if (logs.length > 0) {
    logs.forEach((line) => pushBattleLog(scene, line));
  }
  return logs;
};
const runOnDamagedEffects = (scene, damagedSide, attackerSide, options = {}) => {
  const state = getSideState(scene, damagedSide);
  const effects = Array.isArray(state.onDamagedEffects) ? state.onDamagedEffects : [];
  const reason = normalize(options && options.reason) || "damaged";
  effects.forEach((e) => {
    const trigger = normalize(e && e.trigger) || "damaged";
    if (trigger === "attacked" && reason !== "attacked") return;
    if (trigger === "damaged" && reason !== "damaged") return;
    if (Math.random() > (Number(e.chance) || 0)) return;
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
    if (changed.length === 0) return;
    const owner = damagedSide === "attacker" ? scene.attackerName : scene.targetName;
    const victim = appliedSide === "attacker" ? scene.attackerName : scene.targetName;
    const d = Array.isArray(e.keys) && e.keys.length > 0 ? Number(e.delta) : Number(e.allStatsDelta);
    pushBattleLog(scene, `${owner}触发反制效果，${victim}${d < 0 ? "下降" : "提升"}${Math.abs(d)}级：${changed.map((k) => battleStatLabel(k)).join("、")}`);
  });
};
const beforeActionCheck = (scene, side) => {
  const state = getSideState(scene, side);
  const actorName = side === "attacker" ? scene.attackerName : scene.targetName;
  if (state.statuses.fear > 0) {
    state.statuses.fear = 0;
    return { canAct: false, log: `${actorName}陷入害怕，本回合无法行动。` };
  }
  if (state.skipTurns > 0) {
    state.skipTurns -= 1;
    return { canAct: false, log: `${actorName}本回合无法行动。` };
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
  const maxHp = Math.max(1, Number(scene[maxHpKey]) || 1);
  const applyDot = (status, ratio, label) => {
    if (state.statuses[status] <= 0) return 0;
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
    if (normalize(e.kind) !== "diceDrain") return;
    const pip = clamp(Math.floor(Number(e.data && e.data.pip) || 1), 1, 6);
    const amountPerPip = Math.max(1, Math.floor(Number(e.data && e.data.amountPerPip) || 30));
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
    pushBattleLog(scene, `骰子炸弹：本次投掷点数为${pip}点，${casterName}吸取${actorName}${actual}点体力。`);
    if (healToCaster > 0) pushBattleLog(scene, `骰子炸弹：${casterName}回复${healToCaster}点体力。`);
  });
  (state.timedEffects || []).forEach((e) => {
    if (normalize(e.kind) !== "lockGodDrain") return;
    const ratio = clamp(Number(e.data && e.data.ratio) || (1 / 16), 0.01, 1);
    const dmg = Math.max(1, Math.floor(maxHp * ratio));
    const actual = Math.min(dmg, Math.max(0, Number(scene[hpKey]) || 0));
    scene[hpKey] = Math.max(0, (Number(scene[hpKey]) || 0) - dmg);
    totalDamage += actual;
    if (actual > 0) damageStatusTriggered = true;
    pushBattleLog(scene, `锁神诀：${actorName}受到${actual}点持续伤害。`);
  });
  const delayedStageToApply = [];
  (state.timedEffects || []).forEach((e) => {
    if (normalize(e.kind) !== "delayedStage") return;
    if (Number(e.turns) !== 1) return;
    const d = e && e.data ? e.data : {};
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
  tickSideEffects(scene, side);
  return totalDamage;
};
const tickGlobalTimedEffects = (scene) => {
  if (!scene || !Array.isArray(scene.globalTimedEffects)) return;
  scene.globalTimedEffects.forEach((e) => { e.turns = Math.max(0, Number(e.turns) - 1); });
  scene.globalTimedEffects = scene.globalTimedEffects.filter((e) => Number(e.turns) > 0);
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
  // 参考奥拉星常用公开结算写法：先算基础伤害，再乘 STAB、克制与随机系数
  const base = Math.floor(((((2 * lv) / 5 + 2) * p * (atk / def)) / 50) + 2);
  const dmg = Math.floor(base * Math.max(0, Number(stab) || 1) * Math.max(0, Number(elementFactor) || 1) * rf);
  return Math.max(1, dmg);
};
const compareElementLabel = (factor) => (factor >= 2 ? "克制" : (factor <= 0.5 ? "微弱" : "正常"));
const compareElementDesc = (attackerElement, defenderElement, factor) => {
  const atk = normalize(attackerElement) || "未知系";
  const def = normalize(defenderElement) || "未知系";
  const label = compareElementLabel(factor);
  return `${atk} 对 ${def}：${label}，${factor.toFixed(2)}x`;
};
const parseMultiHitRangeFromDesc = (skill) => {
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
    return { min: a, max: b };
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

    const speciesRaw = window.AOLA_SPECIES_DATA && typeof window.AOLA_SPECIES_DATA === "object" ? window.AOLA_SPECIES_DATA : {};
    const speciesRawByDex = window.AOLA_SPECIES_DATA_BY_DEX && typeof window.AOLA_SPECIES_DATA_BY_DEX === "object" ? window.AOLA_SPECIES_DATA_BY_DEX : {};
    const skillRawById = window.AOLA_SKILL_DATA_BY_ID && typeof window.AOLA_SKILL_DATA_BY_ID === "object" ? window.AOLA_SKILL_DATA_BY_ID : {};
    const skillRawList = Array.isArray(window.AOLA_SKILL_DATA_LIST) ? window.AOLA_SKILL_DATA_LIST : [];
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
        if (typeof fetch !== "function") return null;
        if (window.location && window.location.protocol === "file:") return null;
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

        const descBySkillId = new Map();
        (Array.isArray(skillRows) ? skillRows : []).forEach((row) => {
          const sid = Number(row && row.skill_id);
          if (!Number.isFinite(sid) || sid <= 0) return;
          const desc = normalize((row && row.client_desc) || (row && row.new_effect_desc) || (row && row.old_effect_desc) || "");
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

      const element = normalize(source.element) || normalize(entry.element) || "未知系";
      const subElement = normalize(source.subElement || source.element2 || "");
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
    applySkillDescFromExtractJson();

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
        selectedDexId: null,
        challengeFormIndex: 0,
        selectedAttackerId: bagSeed[0] || "",
        selectedPetId: (starterPets[0] && starterPets[0].id) || "",
        items: { level_40_fruit: 1 },
        hCoins: 200,
        guardianWinCounts: {},
        equippedBadgeId: "",
        targetLevel: 10,
        battleLog: [],
        showDexPanel: false
      };
    };

    const sanitizeState = (loaded) => {
      if (!loaded || typeof loaded !== "object") return createInitialState();
      const activePets = Array.isArray(loaded.activePets) ? loaded.activePets.map((p) => {
        const nameInSave = normalize(p.speciesName);
        const dex = resolveDexFromSaved({ dexId: p.dexId, speciesName: nameInSave, level: p.level });
        if (!dex) return null;
        const species = getSpeciesByDexId(dex.dexId, dex.name);
        if (!species) return null;
        const level = clamp(Number(p.level) || 1, 1, 100);
        const savedBase = Number(p.baseDexId) || 0;
        const anchor = savedBase || dex.dexId;
        const rootDexId = chainRootByDex.get(anchor) || anchor;
        const currentDex = dex;
        const currentSpecies = getSpeciesByDexId(currentDex.dexId, currentDex.name) || species;
        return {
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
          equippedSkills: normalizeEquippedSkillsBySpecies(currentSpecies, p.equippedSkills, level),
          talentRerollCount: Math.max(0, Math.floor(Number(p.talentRerollCount) || 0)),
          createdAt: Number(p.createdAt) || Date.now()
        };
      }).filter((pet) => pet && Number(pet.dexId) > 0 && Number(pet.dexId) <= MAX_OPEN_CHALLENGE_DEX_ID) : [];

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
          startAt: Number(e.startAt) || Date.now(),
          hatchAt: Number(e.hatchAt) || (Date.now() + HATCH_MS)
        };
      }).filter(Boolean) : [];

      const activated = new Set(Array.isArray(loaded.activatedDexIds) ? loaded.activatedDexIds.map((n) => Number(n)).filter(Boolean) : []);
      const defeated = new Set(Array.isArray(loaded.defeatedDexIds) ? loaded.defeatedDexIds.map((n) => Number(n)).filter((n) => n > 0) : []);
      activePets.forEach((p) => {
        const chain = getChainStageInfoByDexId(p.dexId, p.speciesName);
        const stage = stageIndexByLevelAndCount(p.level, chain.formCount);
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
      return {
        activatedDexIds: Array.from(activated),
        defeatedDexIds: Array.from(defeated),
        obtainedEggDexIds: Array.isArray(loaded.obtainedEggDexIds) ? loaded.obtainedEggDexIds.map((n) => Number(n)).filter((n) => n > 0 && canObtainEggByActionDexId(n)) : [],
        activePets,
        bagPetIds,
        eggs,
        items: (() => {
          const source = (loaded.items && typeof loaded.items === "object") ? { ...loaded.items } : {};
          if (!Object.prototype.hasOwnProperty.call(loaded, "items")) source.level_40_fruit = Math.max(1, Number(source.level_40_fruit) || 0);
          return source;
        })(),
        hCoins: Object.prototype.hasOwnProperty.call(loaded, "hCoins") ? Math.max(0, Math.floor(Number(loaded.hCoins) || 0)) : 200,
        guardianWinCounts: (() => {
          const source = loaded.guardianWinCounts && typeof loaded.guardianWinCounts === "object" ? loaded.guardianWinCounts : {};
          const out = {};
          Object.keys(source).forEach((name) => {
            const key = normalize(name);
            const count = Math.max(0, Math.floor(Number(source[name]) || 0));
            if (key && count > 0) out[key] = count;
          });
          return out;
        })(),
        equippedBadgeId: normalize(loaded.equippedBadgeId),
        selectedDexId: dexEntries.some((d) => d.dexId === Number(loaded.selectedDexId)) ? Number(loaded.selectedDexId) : null,
        challengeFormIndex: clamp(Number(loaded.challengeFormIndex) || 0, 0, 2),
        selectedAttackerId,
        selectedPetId: activePets.some((p) => p.id === loaded.selectedPetId) ? loaded.selectedPetId : ((activePets[0] && activePets[0].id) || ""),
        targetLevel: clamp(Number(loaded.targetLevel) || 10, 1, 100),
        battleLog: sanitizeBattleLog(loaded.battleLog),
        showDexPanel: false
      };
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
    const saveState = (nextState) => {
      if (playMode.value !== "guest" && storageAdapter.mode === "localStorage") return;
      try { storageAdapter.saveRaw(JSON.stringify(nextState)); } catch {}
    };

    const state = ref(createInitialState());
    const playMode = ref("");
    const authReady = ref(false);
    const authUser = ref(null);
    const authUsername = ref("");
    const authPassword = ref("");
    const rememberPassword = ref(false);
    const authMode = ref("login");
    const authLoading = ref(false);
    const saveLoading = ref(false);
    const lastServerSavedAt = ref("");
    const dexSearch = ref("");
    const dexElementFilter = ref("全部系别");
    const dexDefeatFilter = ref("全部战绩");
    const warehouseSearch = ref("");
    const warehouseElementFilter = ref("全部系别");
    const warehouseSortMode = ref("created");
    const nowTs = ref(Date.now());
    const battleResult = ref(null);
    const evolutionQueue = ref([]);
    const activeEvolution = ref(null);
    const battleScene = ref(null);
    const showGuardianPanel = ref(false);
    const showBossPanel = ref(false);
    const showStudyPanel = ref(false);
    const showTargetPanel = ref(false);
    const showGuardianChallengePanel = ref(false);
    const showBossChallengePanel = ref(false);
    const showSwitchPanel = ref(false);
    const selectedWarehousePetId = ref("");
    const showWarehouseActionModal = ref(false);
    const skillLongPressTimer = ref(null);
    const switchPanelMode = ref("manual");
    const selectedGuardianDexId = ref(null);
    const selectedBossDexId = ref(null);
    const toast = ref({ show: false, message: "" });
    const evolvingIds = ref([]);
    const selectedSkillName = ref("");
    const selectedInfoTab = ref("skills");
    const replaceSkillCtx = ref(null);
    const bagReplaceCtx = ref(null);
    const showElementPanel = ref(false);
    const showWarehousePanel = ref(false);
    const showShopPanel = ref(false);
    const showBadgePanel = ref(false);
    const shopTab = ref("shop");
    const battleActionTab = ref("skills");
    const showPetDetailModal = ref(false);
    const detailPreviewPet = ref(null);
    const shopTargetPetId = ref("");
    const shopBuyQuantities = ref({});
    const initialOnlyItems = [
      {
        id: "level_40_fruit",
        name: "40级经验果",
        price: 0,
        desc: "初始一次性道具，只能给低于 Lv.40 的亚比使用，使用后直接升至 Lv.40"
      }
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
        id: "talent_reroll_capsule",
        name: "天赋重组胶囊",
        price: 200,
        desc: "重新随机生成各项天赋值，使用次数越多，总天赋更高的概率越高"
      },
      {
        id: "talent_boost_capsule",
        name: "天赋增强胶囊",
        price: 500,
        desc: "随机单项天赋值增加 1-5 点"
      }
    ]);
    const itemCatalog = computed(() => initialOnlyItems.concat(shopItems.value));
    const battleBgmAudio = ref(null);
    const sceneBgmAudio = ref(null);
    const currentSceneBgmSrc = ref("");
    const guardianBadgeThresholds = [
      { count: 1, suffix: "斗士", tone: "amber" },
      { count: 10, suffix: "的克星", tone: "rose" },
      { count: 100, suffix: "的噩梦", tone: "violet" }
    ];
    const badgeIdOf = (guardianName, threshold) => `guardian_${normalize(guardianName)}_${threshold}`;
    const ownedBadges = computed(() => {
      const counts = state.value.guardianWinCounts && typeof state.value.guardianWinCounts === "object" ? state.value.guardianWinCounts : {};
      const rows = [];
      Object.keys(counts).sort((a, b) => a.localeCompare(b, "zh-Hans-CN")).forEach((name) => {
        const count = Math.max(0, Math.floor(Number(counts[name]) || 0));
        guardianBadgeThresholds.forEach((rule) => {
          if (count >= rule.count) {
            rows.push({
              id: badgeIdOf(name, rule.count),
              name: `${name}${rule.suffix}`,
              guardianName: name,
              count: rule.count,
              currentCount: count,
              tone: rule.tone
            });
          }
        });
      });
      return rows;
    });
    const equippedBadge = computed(() => ownedBadges.value.find((b) => b.id === state.value.equippedBadgeId) || null);
    const recordGuardianBadgeWin = (guardianName) => {
      const name = normalize(guardianName);
      if (!name) return;
      if (!state.value.guardianWinCounts || typeof state.value.guardianWinCounts !== "object") state.value.guardianWinCounts = {};
      state.value.guardianWinCounts[name] = Math.max(0, Math.floor(Number(state.value.guardianWinCounts[name]) || 0)) + 1;
      const count = state.value.guardianWinCounts[name];
      const unlocked = guardianBadgeThresholds.filter((rule) => count === rule.count);
      unlocked.forEach((rule) => showToast(`激活徽章：${name}${rule.suffix}`));
    };
    const ensureItemInventory = () => {
      if (!state.value.items || typeof state.value.items !== "object") state.value.items = {};
    };
    const getItemCount = (itemId) => {
      ensureItemInventory();
      const id = normalize(String(itemId || ""));
      return Math.max(0, Number(state.value.items[id]) || 0);
    };
    const itemNameById = (itemId, fallback = "道具") => {
      const id = normalize(String(itemId || ""));
      const item = itemCatalog.value.find((x) => normalize(x.id) === id);
      return item ? item.name : fallback;
    };
    const hasObtainedEggDex = (dexId) => {
      const id = Number(dexId) || 0;
      if (!id) return false;
      const got = Array.isArray(state.value.obtainedEggDexIds) ? state.value.obtainedEggDexIds : [];
      if (got.includes(id)) return true;
      if (state.value.eggs.some((e) => Number(e && e.dexId) === id)) return true;
      const targetRoot = chainRootByDex.get(id) || id;
      const owned = (Array.isArray(state.value.activePets) ? state.value.activePets : []).some((p) => {
        const petDexId = Number(p && p.dexId) || 0;
        const petBaseDexId = Number(p && p.baseDexId) || 0;
        const petRoot = chainRootByDex.get(petDexId) || chainRootByDex.get(petBaseDexId) || petBaseDexId || petDexId;
        return petDexId === id || petBaseDexId === id || petRoot === targetRoot;
      });
      return owned;
    };
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
      const cur = Math.max(0, Number(state.value.items[id]) || 0);
      state.value.items[id] = Math.max(0, cur + (Number(delta) || 0));
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

    const showToast = (message) => {
      toast.value = { show: true, message };
      setTimeout(() => { toast.value.show = false; }, 2200);
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
      const remembered = readRememberLogin();
      rememberPassword.value = remembered.remember;
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
    const enterGuestMode = () => {
      authUser.value = null;
      lastServerSavedAt.value = "";
      writeAuthToken("");
      playMode.value = "guest";
      writeSessionMode("guest");
      state.value = loadLocalState();
      showToast("已以游客身份进入，进度将保存到本机。");
      refreshSceneBgm();
    };
    const submitAuth = async () => {
      if (authLoading.value) return;
      const username = normalize(authUsername.value);
      const password = String(authPassword.value || "");
      if (!username || !password) {
        showToast("请输入用户名和密码。");
        return;
      }
      authLoading.value = true;
      try {
        const path = authMode.value === "register" ? "/api/auth/register" : "/api/auth/login";
        const data = await apiJson(path, {
          method: "POST",
          body: JSON.stringify({ username, password })
        });
        authUser.value = data.user || null;
        writeAuthToken(data.token || "");
        writeRememberLogin(username, password);
        if (!rememberPassword.value) authPassword.value = "";
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
    const saveToServer = async () => {
      if (!authUser.value) {
        showToast("请先登录后再存档。");
        return;
      }
      if (saveLoading.value) return;
      saveLoading.value = true;
      try {
        const data = await apiJson("/api/save", {
          method: "POST",
          body: JSON.stringify({ save: state.value })
        });
        lastServerSavedAt.value = data.savedAt || new Date().toISOString();
        saveState(state.value);
        showToast(`已保存到 ${data.saveDir || "用户存档目录"}`);
      } catch (err) {
        showToast(err && err.message ? err.message : "服务器存档失败。");
      } finally {
        saveLoading.value = false;
      }
    };
    const closeBattleResult = () => { battleResult.value = null; };
    const tryOpenNextEvolution = () => {
      if (activeEvolution.value || evolutionQueue.value.length === 0) return;
      activeEvolution.value = evolutionQueue.value.shift() || null;
    };
    const syncPetEvolutionForm = (pet) => {
      if (!pet) return pet;
      const chainAnchorDexId = Number((pet && pet.baseDexId) || (pet && pet.dexId)) || 0;
      const chain = getChainStageInfoByDexId(chainAnchorDexId || pet.dexId, pet.speciesName);
      const stage = stageIndexByLevelAndCount(pet.level, chain.formCount, chain.evoLevels);
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
      if (species) pet.equippedSkills = normalizeEquippedSkillsBySpecies(species, pet.equippedSkills, pet.level);
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
        const task = audio.play();
        if (task && typeof task.catch === "function") task.catch(() => {});
      } catch {}
    };
    const refreshSceneBgm = () => {
      if (battleScene.value && battleScene.value.open) return;
      if (!playMode.value) return playSceneBgm(LOGIN_BGM_SRC);
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
          battleBgmAudio.value = audio;
        }
        const audio = battleBgmAudio.value;
        audio.loop = true;
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

    if (storageAdapter.mode === "localStorage") {
      watch(state, () => {
        if (playMode.value === "guest") saveState(state.value);
      }, { deep: true });
    }
    let timer = null;
    const handleAutoSave = () => saveState(state.value);
    onMounted(() => {
      timer = setInterval(() => { nowTs.value = Date.now(); }, 1000);
      checkAuthSession();
      if (storageAdapter.mode === "file") {
        window.addEventListener("beforeunload", handleAutoSave);
        window.addEventListener("pagehide", handleAutoSave);
      }
    });
    onBeforeUnmount(() => {
      if (timer) clearInterval(timer);
      stopBattleBgm();
      stopSceneBgm();
      if (storageAdapter.mode === "file") {
        window.removeEventListener("beforeunload", handleAutoSave);
        window.removeEventListener("pagehide", handleAutoSave);
      }
    });

    watch(() => state.value.activePets.map((p) => p.id).join("|"), () => {
      state.value.bagPetIds = normalizeBagIds(state.value.bagPetIds, state.value.activePets);
      state.value.selectedAttackerId = state.value.bagPetIds[0] || "";
    });

    const selectedDexEntry = computed(() => {
      if (!state.value.selectedDexId) return null;
      return dexEntries.find((d) => d.dexId === state.value.selectedDexId) || null;
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
      state.value.targetLevel = (Number.isInteger(n) && n >= range.min && n <= range.max) ? String(n) : String(selectedChallengeDefaultLevel.value);
    }, { immediate: true });
    const selectedPet = computed(() => {
      const real = state.value.activePets.find((p) => p.id === state.value.selectedPetId) || null;
      return detailPreviewPet.value || real || null;
    });
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
    const bagCount = computed(() => bagPets.value.length);
    const safeActivePets = computed(() => state.value.activePets.filter((p) => p && p.id));
    const warehousePets = computed(() => safeActivePets.value.filter((p) => !state.value.bagPetIds.includes(p.id)));
    const warehouseCount = computed(() => warehousePets.value.length);
    const shopTargetOptions = computed(() => safeActivePets.value.map((p) => ({
      id: p.id,
      name: petDisplayName(p),
      level: p.level
    })));
    const itemInventoryRows = computed(() => shopItems.value.map((it) => ({
      ...it,
      count: getItemCount(it.id)
    })));
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
        const e = normalize(p.element);
        if (e) set.add(e);
      });
      return ["全部系别"].concat(Array.from(set).sort((a, b) => a.localeCompare(b, "zh-Hans-CN")));
    });
    const filteredWarehousePets = computed(() => {
      const keyword = normalize(warehouseSearch.value).toLowerCase();
      const element = normalize(warehouseElementFilter.value);
      const list = warehousePets.value.filter((pet) => {
        const name = normalize(petDisplayName(pet)).toLowerCase();
        const speciesName = normalize(pet.speciesName).toLowerCase();
        const petElement = normalize(pet.element);
        const hitName = !keyword || name.includes(keyword) || speciesName.includes(keyword);
        const hitElement = !element || element === "全部系别" || petElement === element;
        return hitName && hitElement;
      });
      const createdOrder = (pet) => Number(pet && pet.createdAt) || 0;
      if (warehouseSortMode.value === "level") {
        return list.slice().sort((a, b) =>
          (Number(b.level) || 0) - (Number(a.level) || 0) ||
          (Number(a.dexId) || 0) - (Number(b.dexId) || 0) ||
          createdOrder(a) - createdOrder(b)
        );
      }
      return list.slice().sort((a, b) => createdOrder(a) - createdOrder(b));
    });
    const safeEggs = computed(() => state.value.eggs.filter((e) => e && e.id));
    const safeBattleLog = computed(() => sanitizeBattleLog(state.value.battleLog));

    const dexElementOptions = computed(() => {
      const set = new Set();
      dexEntries.forEach((d) => {
        const e = normalize(d.element);
        if (e) set.add(e);
        const se = normalize(d.subElement);
        if (se) set.add(se);
      });
      return ["全部系别"].concat(Array.from(set).sort((a, b) => a.localeCompare(b, "zh-Hans-CN")));
    });
    const filteredDex = computed(() => {
      const q = normalize(dexSearch.value).toLowerCase();
      const element = normalize(dexElementFilter.value);
      const defeat = normalize(dexDefeatFilter.value);
      return dexEntries.filter((d) => {
        const hitName = !q || d.name.toLowerCase().includes(q);
        const hitElement = !element || element === "全部系别" || normalize(d.element) === element || normalize(d.subElement) === element;
        const won = hasDefeatedDex(d.dexId);
        const hitDefeat = !defeat || defeat === "全部战绩" || (defeat === "已击败" ? won : !won);
        return hitName && hitElement && hitDefeat;
      });
    });
    const guardianDexEntries = computed(() => dexEntries.filter((d) => isGuardianName(d.name)));
    const bossDexEntries = computed(() => dexEntries.filter((d) => isBossName(d.name)));
    const shopEggEntries = computed(() => SHOP_EGG_NAMES.map((name) => {
      const entry = dexEntries.find((d) => normalize(d.name) === name) || dexEntries.find((d) => resolveShopEggName(d.name) === name);
      return entry ? { ...entry, price: SHOP_EGG_PRICE } : null;
    }).filter(Boolean));
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
      ? "进阶守护者挑战：Lv.100 单阶段，体力种族为原种族值×10，天赋值均为50，除体力外学习力均为102，免疫异常状态，通关后可获得对应亚比蛋和 1000 H币。"
      : "基础守护者挑战：从 Lv.30 开始逐级挑战至 Lv.100，体力种族为原种族值×5，天赋值均为30，除体力外学习力均为102，免疫异常状态，每击败一个阶段会清空我方能力等级，通关后获得对应亚比蛋和 500 H币。");
    const selectedBossChallengeText = computed(() => "BOSS挑战：Lv.100 单阶段，体力种族为原种族值×15，天赋值均为60，除体力外学习力均为102。击败后获得对应亚比蛋和 2000 H币。");
    const challengeLockMessage = (entry) => {
      if (!entry) return "该亚比暂不可挑战。";
      if (isBossName(entry.name)) return "该亚比为BOSS，请从【BOSS挑战】入口挑战。";
      if (isGuardianName(entry.name)) return "该亚比为守护者，请从【守护者挑战】入口挑战。";
      if (isShopEggName(entry.name)) return "该亚比蛋仅可从【亚比商店/道具】购买，不能通过图鉴挑战获取。";
      return "该亚比暂不可挑战。";
    };
    const canChallengeFromDex = (entry) => {
      if (!entry) return false;
      return !isGuardianName(entry.name) && !isBossName(entry.name) && !isShopEggName(entry.name);
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
    const dexTotal = computed(() => dexEntries.length);

    const resolvePetCurrentDexId = (pet) => {
      if (!pet || typeof pet !== "object") return 0;
      const anchorDexId = Number((pet && pet.baseDexId) || (pet && pet.dexId)) || 0;
      if (!anchorDexId) return Number((pet && pet.dexId) || 0) || 0;
      const chain = getChainStageInfoByDexId(anchorDexId, pet && pet.speciesName);
      const idx = stageIndexByLevelAndCount(pet && pet.level, chain.formCount);
      const rootDexId = chain.rootDexId || anchorDexId;
      return resolveEvolutionDexIdByPetAndStage({ dexId: rootDexId, baseDexId: rootDexId, speciesName: pet && pet.speciesName }, idx);
    };
    const petCurrentForm = (pet) => {
      if (!pet || typeof pet !== "object") return { name: "", img: PLACEHOLDER };
      const anchorDexId = Number((pet && pet.baseDexId) || (pet && pet.dexId)) || 0;
      const chain = getChainStageInfoByDexId(anchorDexId, pet.speciesName);
      const rootDexId = chain.rootDexId || anchorDexId;
      const species = getSpeciesByDexId(rootDexId, pet.speciesName);
      if (!species) return { name: normalize(pet.speciesName), img: PLACEHOLDER };
      const idx = stageIndexByLevelAndCount(pet.level, chain.formCount);
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
        const currentDexId = resolvePetCurrentDexId(pet);
        return getSpeciesByDexId(currentDexId, pet.speciesName) || getSpeciesByDexId(pet.dexId, pet.speciesName) || null;
      } catch {
        return null;
      }
    });
    const availableSkillsForSelectedPet = computed(() => {
      const pet = selectedPet.value;
      if (!pet) return [];
      const species = selectedPetSpecies.value;
      if (!species) return [];
      const list = Array.isArray(species.skills) ? species.skills : [];
      if (detailPreviewPet.value && detailPreviewPet.value.previewAllSkills) return list;
      return list.filter((s) => Number(s && s.level) <= Number(pet.level));
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
    const selectedPetEquippedSkills = computed(() => {
      const pet = selectedPet.value;
      if (detailPreviewPet.value && detailPreviewPet.value.previewAllSkills) {
        return availableSkillsForSelectedPet.value.map((s) => normalizeSkillKey(s && s.name)).filter(Boolean);
      }
      const arr = pet && Array.isArray(pet.equippedSkills) ? pet.equippedSkills : [];
      return arr.slice(0, 4);
    });
    const selectedRaceStats = computed(() => {
      const pet = selectedPet.value;
      const species = selectedPetSpecies.value;
      if (!pet || !species || !species.raceStats) return null;
      return species.raceStats;
    });
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
      const ALLOWED = ["skills", "ability", "talent", "study", "race"];
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
      const draft = normalizeStudy(pet.study);
      let others = 0;
      STAT_KEYS.forEach((k) => { if (k !== key) others += draft[k]; });
      const maxForKey = Math.max(0, 510 - others);
      draft[key] = clamp(safeNonNegInt(value), 0, Math.min(255, maxForKey));
      pet.study = normalizeStudy(draft);
    };

    const autoFillSkills = (pet) => {
      const species = getSpeciesByDexId(pet.dexId, pet.speciesName);
      if (!species) return;
      pet.equippedSkills = normalizeEquippedSkillsBySpecies(species, pet.equippedSkills, pet.level);
      const unlocked = species.skills.filter((s) => s.level <= pet.level).map((s) => normalizeSkillKey(s.name)).filter(Boolean);
      for (const skill of unlocked) {
        if (pet.equippedSkills.length >= 4) break;
        if (!pet.equippedSkills.includes(skill)) pet.equippedSkills.push(skill);
      }
      pet.equippedSkills = normalizeEquippedSkillsBySpecies(species, pet.equippedSkills, pet.level);
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
      const species = getSpeciesByDexId(pet.dexId, pet.speciesName);
      if (!species) return 120;
      const picked = pet.equippedSkills.map((name) => species.skills.find((s) => s.name === name)).filter(Boolean);
      if (picked.length === 0) return 120;
      const sum = picked.reduce((acc, s) => acc + (s.power > 0 ? s.power : 110), 0);
      return sum / picked.length;
    };

    const getElementFactor = (attackerElement, defenderElement) => {
      const atk = normalize(attackerElement) || "未知系";
      const def = normalize(defenderElement) || "未知系";
      const chart = ELEMENT_CHART[atk];
      if (!chart) return 1;
      if (chart.strong.includes(def)) return 2;
      if (chart.weak.includes(def)) return 0.5;
      return 1;
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
      return getElementFactor(attacker.element, target.element);
    });
    const predictedElementText = computed(() => {
      const attacker = firstPet.value;
      const target = selectedDexEntry.value;
      if (!attacker || !target) return "请先设置首宠（背包1号位）并选择挑战目标。";
      return compareElementDesc(attacker.element, target.element, predictedElementFactor.value);
    });

    const petElementIconStyle = (element, size = 18) => {
      const icon = PET_TYPE_ICON[normalizeElementName(element)] || "";
      const safeSize = Math.max(12, Number(size) || 18);
      if (!icon) return { width: `${safeSize}px`, height: `${safeSize}px`, display: "none" };
      return {
        width: `${safeSize}px`,
        height: `${safeSize}px`,
        backgroundImage: `url(${icon})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: `${safeSize}px ${safeSize}px`,
        backgroundPosition: "center"
      };
    };
    const petElementIconSrc = (element) => PET_TYPE_ICON[normalizeElementName(element)] || "";
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
    const PET_BATTLE_ANIM_ROOT = "./pet-action";
    const SKILL_EFFECT_ROOT = "./skill-effect";
    const BATTLE_DAMAGE_VISUAL_DELAY_MS = 900;
    const BATTLE_SKILL_EFFECT_DURATION_MS = 900;
    const BATTLE_SKILL_EFFECT_SETTLE_MS = 200;
    const BATTLE_FLOAT_TEXT_DURATION_MS = BATTLE_FLOAT_TEXT_DURATION_MS_GLOBAL;
    const BATTLE_COUNTER_ATTACK_DELAY_MS = 3600;
    const BATTLE_DEFEAT_RESOLUTION_DELAY_MS = 2600;
    const BATTLE_DEFEAT_EXIT_START_DELAY_MS = 2400;
    const BATTLE_DEFEAT_EXIT_DURATION_MS = 1200;
    const PET_ANIM_FALLBACK_IDLE_DELAY_MS = 1200;
    const webpDurationCache = new Map();
    const gifDurationCache = new Map();
    const skillEffectObjectUrlCache = new Map();
    const getAnimatedWebpDurationMs = async (src) => {
      const key = String(src || "");
      if (!key) return PET_ANIM_FALLBACK_IDLE_DELAY_MS;
      if (webpDurationCache.has(key)) return webpDurationCache.get(key);
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
    const PET_ANIM_DEBUG = true;
    const petAnimDebugLog = (msg, extra) => {
      if (!PET_ANIM_DEBUG || typeof console === "undefined" || !console.log) return;
      try {
        if (extra !== undefined) console.log("[PET_ANIM]", msg, extra);
        else console.log("[PET_ANIM]", msg);
      } catch (_) {}
    };
    const getPetBattleAnimPath = (dexId, side, stateKey) => {
      const id = Number(dexId) || 0;
      if (id <= 0) return "";
      const sideCode = side === "target" ? "1" : "2";
      const stateCode = stateKey === "idle" ? "1" : (stateKey === "hit" ? "2" : (stateKey === "status" ? "6" : "4"));
      return `${PET_BATTLE_ANIM_ROOT}/${id}/pet${id}_${sideCode}_${stateCode}.webp`;
    };
    const getBattleSkillEffectPath = (skill, actionSeq = 0) => {
      const id = Number(skill && skill.skillId) || 0;
      if (id <= 0) return "";
      const cacheBust = actionSeq > 0 ? `?fx=${actionSeq}` : "";
      return `${SKILL_EFFECT_ROOT}/effect${id}.gif${cacheBust}`;
    };
    const bagPetVisual = (pet) => {
      if (!pet) return { src: PLACEHOLDER, animated: false };
      const dexId = Number(pet.dexId) || Number(resolvePetCurrentDexId(pet)) || 0;
      if (dexId > 0) {
        return { src: getPetBattleAnimPath(dexId, "target", "idle"), animated: true };
      }
      return { src: ensureHttps(petCurrentForm(pet).img) || PLACEHOLDER, animated: false };
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
      petAnimDebugLog("resolve attacker dex", { curId, dexId, baseDexId, fromTeam: current ? current.id : "", fromActive: activePet ? activePet.id : "" });
      return dexId || baseDexId || 0;
    };
    const isBattleAnimSide = (scene, side) => {
      const dexId = resolveBattleSideDexId(scene, side === "target" ? "target" : "attacker");
      return Boolean(getPetBattleAnimPath(dexId, side === "target" ? "target" : "attacker", "idle"));
    };
    const battleSkillEffectStyle = (side) => {
      const duration = Math.max(300, Number(battleScene.value && battleScene.value.skillEffectFx && battleScene.value.skillEffectFx.durationMs) || BATTLE_SKILL_EFFECT_DURATION_MS);
      const localX = side === "target" ? "52%" : "48%";
      return { "--skill-fx-local-x": localX, "--skill-fx-local-y": "50%", "--skill-fx-duration": `${duration}ms` };
    };
    const setBattleSkillEffectFx = (scene, fx, durationMs, expireMs) => {
      if (!scene || !fx) return;
      const safeDuration = Math.max(BATTLE_SKILL_EFFECT_DURATION_MS, Number(durationMs) || BATTLE_SKILL_EFFECT_DURATION_MS);
      const safeExpire = Math.max(safeDuration, Number(expireMs) || safeDuration);
      scene.skillEffectFx = { ...fx, durationMs: safeDuration };
      scene._skillEffectUntil = Date.now() + safeExpire;
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
      if (stateKey !== "idle" && scene[lockKey]) {
        petAnimDebugLog("skip locked side", { side: safeSide, stateKey });
        return;
      }
      if (actionSeq > 0 && !markPetAnimStateOncePerAction(scene, safeSide, actionSeq, stateKey)) {
        petAnimDebugLog("skip duplicated state in same action", { side: safeSide, stateKey, actionSeq });
        return;
      }
      const dexId = resolveBattleSideDexId(scene, safeSide);
      const next = getPetBattleAnimPath(dexId, safeSide, stateKey);
      if (!next) {
        petAnimDebugLog("skip side (no anim path)", { side: safeSide, dexId, stateKey });
        return;
      }
      if (safeSide === "target") {
        if (scene.targetImage === next) return;
        scene.targetImage = next;
        petAnimDebugLog("target image -> " + stateKey, next);
        if (stateKey !== "idle") {
          scene._petAnimTargetPlayLock = true;
          if (scene._petAnimTargetAutoIdleTimer) clearTimeout(scene._petAnimTargetAutoIdleTimer);
          getAnimatedWebpDurationMs(next).then((duration) => {
            if (!battleScene.value || battleScene.value !== scene || scene.ended) return;
            scene._petAnimTargetAutoIdleTimer = setTimeout(() => {
            const live = battleScene.value;
            if (!live || live !== scene || live.ended) return;
            applyBattleAnimImage(live, "target", "idle");
            }, Math.max(1, duration));
          });
        } else {
          scene._petAnimTargetPlayLock = false;
        }
        return;
      }
      if (scene.attackerImage === next) return;
      scene.attackerImage = next;
      petAnimDebugLog("attacker image -> " + stateKey, next);
      if (stateKey !== "idle") {
        scene._petAnimAttackerPlayLock = true;
        if (scene._petAnimAttackerAutoIdleTimer) clearTimeout(scene._petAnimAttackerAutoIdleTimer);
        getAnimatedWebpDurationMs(next).then((duration) => {
          if (!battleScene.value || battleScene.value !== scene || scene.ended) return;
          scene._petAnimAttackerAutoIdleTimer = setTimeout(() => {
          const live = battleScene.value;
          if (!live || live !== scene || live.ended) return;
          applyBattleAnimImage(live, "attacker", "idle");
          }, Math.max(1, duration));
        });
      } else {
        scene._petAnimAttackerPlayLock = false;
      }
    };
    const resetBattleAnimIdle = (scene) => {
      applyBattleAnimImage(scene, "attacker", "idle");
      applyBattleAnimImage(scene, "target", "idle");
    };
    const isSelfSideStatusSkillFx = (skill) => {
      const effects = parseSkillEffects(skill);
      if (!effects.length) return false;
      return effects.some((e) => {
        const kind = normalize(e && e.kind);
        const target = normalize(e && e.target) || "self";
        if (target !== "self") return false;
        if (kind === "heal" || kind === "healFlat" || kind === "healFlatTeam" || kind === "timedHeal") return true;
        if (kind === "windGodPossession") return true;
        if (kind === "attackImmunity" || kind === "stageGuard" || kind === "damageReduction" || kind === "healOverTime") return true;
        if (kind === "globalElementPower" || kind === "elementPowerBuff" || kind === "delayedStage") return true;
        if (kind === "stage" || kind === "critStage") return Number(e && e.delta) > 0;
        return false;
      });
    };
    const scheduleBattleSkillEffectVisual = (scene, actorSide, targetSide, skill, atkKind, actionStateKey, actionSeq, afterEffect) => {
      if (!scene || !skill) {
        if (typeof afterEffect === "function") afterEffect();
        return;
      }
      const effectSide = (actionStateKey === "status" || atkKind === "status")
        ? (isSelfSideStatusSkillFx(skill) ? actorSide : targetSide)
        : targetSide;
      const actorDexId = resolveBattleSideDexId(scene, actorSide);
      const actionSrc = getPetBattleAnimPath(actorDexId, actorSide, actionStateKey);
      const effectSrc = getBattleSkillEffectPath(skill, actionSeq);
      const runAfterEffect = () => {
        if (typeof afterEffect === "function") afterEffect();
      };
      getAnimatedWebpDurationMs(actionSrc).then((duration) => {
        const actionDelay = Math.max(1, Number(duration) || PET_ANIM_FALLBACK_IDLE_DELAY_MS);
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
            const holdMs = Math.max(BATTLE_SKILL_EFFECT_DURATION_MS, Number(effectTiming && effectTiming.durationMs) || BATTLE_SKILL_EFFECT_DURATION_MS);
            const removeMs = Math.max(holdMs, Number(effectTiming && effectTiming.removeMs) || holdMs);
            const singleLoopSrc = (effectTiming && effectTiming.src) || effectSrc;
            setBattleSkillEffectFx(scene, { side: effectSide, src: singleLoopSrc, seq: actionSeq }, holdMs, removeMs);
            setTimeout(() => {
              const current = battleScene.value;
              if (current && current === scene) clearBattleSkillEffectFxIfExpired(scene, actionSeq);
              runAfterEffect();
            }, removeMs);
          }).catch(() => {
            setBattleSkillEffectFx(scene, { side: effectSide, src: effectSrc, seq: actionSeq }, BATTLE_SKILL_EFFECT_DURATION_MS);
            setTimeout(() => {
              const current = battleScene.value;
              if (current && current === scene) clearBattleSkillEffectFxIfExpired(scene, actionSeq);
              runAfterEffect();
            }, BATTLE_SKILL_EFFECT_DURATION_MS);
          });
        }, actionDelay);
      }).catch(() => {
        setTimeout(runAfterEffect, BATTLE_DAMAGE_VISUAL_DELAY_MS);
      });
    };
    const buildBattleUnitFromPet = (pet) => {
      if (!pet) return null;
      const species = getSpeciesByDexId(pet.dexId, pet.speciesName);
      if (!species || !species.raceStats) return null;
      const unlockedSkills = (species.skills || []).filter((s) => Number(s.level) <= pet.level);
      const equipped = normalizeEquippedSkillsBySpecies(species, pet.equippedSkills, pet.level);
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
      const ability = calcPetAbilityByRace(species.raceStats, pet.level, pet.talent, pet.study);
      return {
        id: pet.id,
        petId: pet.id,
        dexId: Number(pet.dexId || (species && species.dexId)) || 0,
        baseDexId: Number(pet.baseDexId) || Number(pet.dexId || (species && species.dexId)) || 0,
        name: petDisplayName(pet),
        image: ensureHttps(petCurrentForm(pet).img) || PLACEHOLDER,
        level: pet.level,
        element: normalize(pet.element) || "未知系",
        subElement: normalize(pet.subElement),
        ability,
        hp: ability.hp,
        maxHp: ability.hp,
        skills: chosenSkills,
        battleState: createBattleState()
      };
    };
    const buildBattleTarget = ({ entry, level, forceHpRace500 = false, hpRaceOverride = null, hpRaceMultiplier = null, talentOverride = null, studyOverride = null, displayName = "", displayImage = "" }) => {
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
      const ability = calcPetAbilityByRace(race, level, talentOverride || createUniformTalent30(), studyOverride || createZeroStats());
      const targetUnlockedSkills = (species.skills || []).filter((s) => Number(s.level) <= level).map((s) => ({
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
      return {
        dexId: entry.dexId,
        name: normalize(displayName) || entry.name,
        image: ensureHttps(displayImage || img),
        level,
        element: normalize(entry.element) || "未知系",
        subElement: normalize(entry.subElement),
        ability,
        hp: ability.hp,
        maxHp: ability.hp,
        skills: targetUnlockedSkills,
        battleState: createBattleState()
      };
    };
    const setupBattleScene = ({ targetEntry, targetLevel, forceTargetHpRace500 = false, targetHpRaceOverride = null, targetHpRaceMultiplier = null, targetTalentOverride = null, targetStudyOverride = null, mode = "normal", guardianMeta = null }) => {
      const team = bagPets.value.map((pet) => buildBattleUnitFromPet(pet)).filter(Boolean);
      if (team.length === 0) {
        showToast("背包中没有可出战亚比。");
        return false;
      }
      const target = buildBattleTarget({
        entry: targetEntry,
        level: targetLevel,
        forceHpRace500: forceTargetHpRace500,
        hpRaceOverride: targetHpRaceOverride,
        hpRaceMultiplier: targetHpRaceMultiplier,
        talentOverride: targetTalentOverride,
        studyOverride: targetStudyOverride,
        displayName: mode === "normal" ? targetEntry.name : targetEntry.name,
        displayImage: targetEntry.image
      });
      if (!target) {
        showToast("挑战目标缺少可用种族值或技能数据。");
        return false;
      }
      battleScene.value = {
        open: true,
        ended: false,
        win: false,
        mode,
        guardianMeta: guardianMeta || null,
        studyMeta: mode === "study" ? (guardianMeta || null) : null,
        team,
        currentAttackerId: team[0].id,
        attackerDexId: Number(team[0].dexId) || 0,
        attackerBaseDexId: Number(team[0].baseDexId) || Number(team[0].dexId) || 0,
        attackerName: team[0].name,
        attackerImage: team[0].image,
        attackerLevel: team[0].level,
        attackerElement: team[0].element,
        attackerSubElement: team[0].subElement,
        attackerAbility: team[0].ability,
        attackerHp: team[0].hp,
        attackerMaxHp: team[0].maxHp,
        uiAttackerHp: team[0].hp,
        uiAttackerMaxHp: team[0].maxHp,
        attackerState: normalizeBattleState(team[0].battleState),
        targetDexId: target.dexId,
        targetName: target.name,
        targetImage: target.image,
        targetLevel: target.level,
        targetElement: target.element,
        targetSubElement: target.subElement,
        targetAbility: target.ability,
        targetHp: target.hp,
        targetMaxHp: target.maxHp,
        uiTargetHp: target.hp,
        uiTargetMaxHp: target.maxHp,
        targetState: normalizeBattleState(target.battleState),
        globalTimedEffects: [],
        skills: team[0].skills,
        targetSkills: target.skills,
        logs: [],
        turnCount: 1,
        expGain: 0,
        unlockText: "",
        summary: "",
        lastDamage: 0,
        lastElementFactor: 1,
        oncePerBattleSkillKeys: [],
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
        forceDefeatSide: "",
        pendingEndTurnTick: false,
        pendingFinish: false
      };
      battleActionTab.value = "skills";
      resetBattleAnimIdle(battleScene.value);
      const startLog = mode === "guardian" ? "守护者挑战开始。挑战方先手。" : (mode === "boss" ? "BOSS挑战开始。挑战方先手。" : (mode === "study" ? `${guardianMeta && guardianMeta.label ? guardianMeta.label : ""}学习力战场开始。挑战方先手。` : "对战开始。挑战方先手。"));
      pushBattleLog(battleScene.value, startLog);
      pushBattleLog(battleScene.value, "第1回合开始。");
      playBattleBgm();
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
    const scheduleBattleDefeatResolution = (scene, defeatedSide, reason = "") => {
      if (!scene || scene.ended || scene.pendingFinish) return;
      scene.pendingFinish = true;
      scene.pendingEndTurnTick = false;
      scene.isActing = true;
      if (scene._defeatExitTimer) clearTimeout(scene._defeatExitTimer);
      scene._defeatExitTimer = setTimeout(() => {
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
      }, BATTLE_DEFEAT_EXIT_START_DELAY_MS);
      setTimeout(() => {
        const live = battleScene.value;
        if (!live || live !== scene || scene.ended) return;
        scene.pendingFinish = false;
        if (defeatedSide === "target") {
          finalizeBattleScene(scene, true, reason);
          return;
        }
        if (Array.isArray(scene.team)) {
          const idx = scene.team.findIndex((u) => u.id === scene.currentAttackerId);
          if (idx >= 0) scene.team[idx].hp = 0;
        }
        const next = (scene.team || []).find((u) => u.hp > 0 && u.id !== scene.currentAttackerId);
        if (next) {
          pushBattleLog(scene, `${scene.attackerName} 倒下，请选择下一只上场亚比。`);
          showSwitchPanel.value = true;
          switchPanelMode.value = "forced";
          scene.isActing = false;
          return;
        }
        finalizeBattleScene(scene, false, reason || "我方背包亚比全部倒下");
      }, Math.max(BATTLE_DEFEAT_RESOLUTION_DELAY_MS, BATTLE_DEFEAT_EXIT_START_DELAY_MS + BATTLE_DEFEAT_EXIT_DURATION_MS));
    };
    const resolveBattleDefeatIfNeeded = (scene, reason = "") => {
      if (!scene || scene.ended || scene.pendingFinish) return false;
      if (scene.forceDefeatSide) {
        const side = scene.forceDefeatSide;
        scene.forceDefeatSide = "";
        if (side === "attacker") {
          scheduleBattleDefeatResolution(scene, "attacker", reason || "我方背包亚比全部倒下");
          return true;
        }
        scheduleBattleDefeatResolution(scene, "target", reason);
        return true;
      }
      const attackerHp = Number(scene.attackerHp) || 0;
      const targetHp = Number(scene.targetHp) || 0;
      if (attackerHp <= 0) {
        scene.attackerHp = 0;
        applyBattleDamageToActivePet(scene);
        scheduleBattleDefeatResolution(scene, "attacker", reason || "我方背包亚比全部倒下");
        return true;
      }
      if (targetHp <= 0) {
        scene.targetHp = 0;
        scheduleBattleDefeatResolution(scene, "target", reason);
        return true;
      }
      return false;
    };
    const pickTargetSkill = (scene, candidates) => {
      let list = Array.isArray(candidates) ? candidates.filter((s) => s && s.pp > 0) : [];
      if (scene && scene.mode === "boss" && Math.max(1, Number(scene.turnCount) || 1) === 1) {
        const bossName = resolveBossName(scene.targetName);
        const fixedName = bossName === "骰子大王" ? "骰子炸弹" : (bossName === "龙族大法师" ? "风神附体" : "");
        const fixed = fixedName ? list.find((s) => normalize(s && s.name) === fixedName) : null;
        if (fixed) return fixed;
      }
      if (scene && scene.mode === "guardian") {
        const safeList = list.filter((s) => {
          const effects = parseSkillEffects(s);
          return !effects.some((e) => normalize(e && e.kind) === "selfKo");
        });
        if (safeList.length > 0) list = safeList;
      }
      if (list.length <= 1) return list[0] || null;
      if (!scene || scene.mode !== "guardian") return list[Math.floor(Math.random() * list.length)];
      const maxPower = Math.max(...list.map((s) => Math.max(0, Number(s.power) || 0)), 0);
      const weights = list.map((s) => {
        const power = Math.max(0, Number(s.power) || 0);
        if (power <= 0 || maxPower <= 0) return 1;
        const ratio = power / maxPower;
        return 1 + Math.pow(ratio, 2) * 4;
      });
      const total = weights.reduce((sum, n) => sum + n, 0);
      let roll = Math.random() * total;
      for (let i = 0; i < list.length; i += 1) {
        roll -= weights[i];
        if (roll <= 0) return list[i];
      }
      return list[list.length - 1];
    };
    const useGuardianAutoPpBean = (scene) => {
      if (!scene || scene.mode !== "guardian" || !Array.isArray(scene.targetSkills)) return false;
      let restored = 0;
      scene.targetSkills.forEach((s) => {
        if (!s) return;
        const cur = Math.max(0, Number(s.pp) || 0);
        const mx = Math.max(1, Number(s.ppMax) || cur || 1);
        restored += Math.max(0, mx - cur);
        s.pp = mx;
      });
      scene.ppOnTarget = `PP+${restored}`;
      markBattleFloatText(scene);
      pushBattleLog(scene, `${scene.targetName} 技能 PP 不足，自动使用 PP 豆回复 ${restored} PP，本回合不攻击。`);
      scene.pendingEndTurnTick = true;
      return true;
    };
    const runBattleSkill = (scene, actor, skill) => {
      if (!scene || !skill || scene.ended) return { ended: scene && scene.ended, visualDelayMs: 0 };
      const isAttacker = actor === "attacker";
      const actorName = isAttacker ? scene.attackerName : scene.targetName;
      let targetName = isAttacker ? scene.targetName : scene.attackerName;
      const actorElement = isAttacker ? scene.attackerElement : scene.targetElement;
      let targetElement = isAttacker ? scene.targetElement : scene.attackerElement;
      const actorSide = isAttacker ? "attacker" : "target";
      let targetSide = isAttacker ? "target" : "attacker";
      const beforeAct = beforeActionCheck(scene, actorSide);
      if (beforeAct.log) {
        pushBattleLog(scene, beforeAct.log);
      }
      if (!beforeAct.canAct) {
        return { ended: false, skipped: true, visualDelayMs: BATTLE_FLOAT_TEXT_DURATION_MS };
      }
      if (hasUsedOncePerBattleSkill(scene, actorSide, skill)) {
        pushBattleLog(scene, `${actorName} 本场战斗已经使用过 ${skill.name}，无法再次使用。`);
        return { ended: false, skipped: true, visualDelayMs: BATTLE_FLOAT_TEXT_DURATION_MS };
      }
      skill.pp = Math.max(0, Number(skill.pp) - 1);
      markOncePerBattleSkillUsed(scene, actorSide, skill);

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
      const atkKind = parseSkillAttackKind(skill);
      const actorDexIdForDelay = resolveBattleSideDexId(scene, actorSide);
      const actorState = getSideState(scene, actorSide);
      if ((atkKind === "physical" || atkKind === "special") && Math.max(0, Number(actorState.statuses.confuse) || 0) > 0) {
        actorState.statuses.confuse = Math.max(0, Number(actorState.statuses.confuse) - 1);
        if (Math.random() < 0.5) {
          targetSide = actorSide;
          targetName = actorName;
          targetElement = actorElement;
          pushBattleLog(scene, `${actorName}陷入混乱，攻击作用于自己。`);
        }
      }
      const actorLevel = isAttacker ? scene.attackerLevel : scene.targetLevel;
      const fixedDamage = calcBattleFixedDamageAmount(scene, actorSide, skill, actorLevel);
      const isStatusAnim = atkKind === "status" || (Number(skill.power) <= 0 && fixedDamage <= 0);
      const actionStateKey = isStatusAnim ? "status" : "atk";
      const visualDelayMs = (getPetBattleAnimPath(actorDexIdForDelay, actorSide, actionStateKey) || getBattleSkillEffectPath(skill, actionSeq))
        ? Math.max(BATTLE_FLOAT_TEXT_DURATION_MS, BATTLE_COUNTER_ATTACK_DELAY_MS + BATTLE_DAMAGE_VISUAL_DELAY_MS)
        : BATTLE_FLOAT_TEXT_DURATION_MS;
      if (isAttacker) {
        applyBattleAnimImage(scene, "attacker", actionStateKey, actionSeq);
      } else {
        applyBattleAnimImage(scene, "target", actionStateKey, actionSeq);
      }
      const skillElement = parseSkillElement(skill.type);
      const acc = atkKind === "status" ? 100 : clamp(Number(skill.accuracy) || 100, 1, 100);
      const actorAcc = stageMultiplier(getSideState(scene, actorSide).stages.accuracy || 0);
      const targetEva = stageMultiplier(getSideState(scene, targetSide).stages.evasion || 0);
      const finalHitRate = clamp((acc / 100) * (actorAcc / targetEva), 0.05, 1);
      const didHit = Math.random() <= finalHitRate;

      let damage = 0;
      let elementFactor = 1;
      let comboHitList = [];
      let isComboSkill = false;
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
      } else if (atkKind === "status" || (Number(skill.power) <= 0 && fixedDamage <= 0)) {
        pushBattleLog(scene, `${actorName} 使用 ${skill.name}（属性技能）。`);
        scheduleBattleSkillEffectVisual(scene, actorSide, targetSide, skill, atkKind, actionStateKey, actionSeq, () => flushAfterDamageFloat(scene));
      } else {
        if (targetSide === "target") applyBattleAnimImage(scene, "target", "hit", actionSeq);
        else applyBattleAnimImage(scene, "attacker", "hit", actionSeq);
        const immuneEffect = getAttackImmunityEffect(scene, targetSide, atkKind);
        const immuneChance = immuneEffect ? clamp(Number(immuneEffect.data && immuneEffect.data.chance) || 1, 0, 1) : 0;
        if (immuneEffect) {
          pushBattleLog(scene, `${targetName}的攻击免疫判定：${Math.round(immuneChance * 100)}%概率免受本次${atkKind === "special" ? "特殊攻击" : "普通攻击"}伤害。`);
        }
        if (immuneEffect && Math.random() <= immuneChance) {
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
        } else {
        elementFactor = fixedDamage > 0 ? 1 : getElementFactor(skillElement, targetElement);
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
        const powerFactor = getElementPowerFactor(scene, actorSide, skillElement);
        const actorStatuses = getSideState(scene, actorSide).statuses || {};
        const powerConditionFactor = normalize(skill && skill.name) === "激发力量"
          && (Math.max(0, Number(actorStatuses.poison) || 0) > 0 || Math.max(0, Number(actorStatuses.paralyze) || 0) > 0 || Math.max(0, Number(actorStatuses.burn) || 0) > 0)
          ? 2
          : 1;
        if (powerConditionFactor > 1) pushBattleLog(scene, `${actorName}处于异常状态，激发力量威力提升为2倍。`);
        const reduceFactor = getDamageReductionFactor(scene, targetSide);
        const mh = fixedDamage > 0 ? null : parseMultiHitRangeFromDesc(skill);
        const bonusFixedPerHit = mh ? parseBonusFixedDamagePerHit(skill) : null;
        const hitTimes = mh ? (mh.min + Math.floor(Math.random() * (mh.max - mh.min + 1))) : 1;
        isComboSkill = Boolean(mh && hitTimes > 1);
        if (fixedDamage > 0) {
          damage = fixedDamage;
          comboHitList.push(`-${damage}`);
        } else {
        for (let i = 0; i < hitTimes; i += 1) {
          const randomFactor = 0.85 + Math.random() * 0.15;
          let one = calcSkillDamageByOfficialStyle({
            level: actorLevel,
            power: (isNoEdgeBlade ? 1 : Number(skill.power)) * powerFactor * powerConditionFactor,
            atkStat,
            defStat,
            stab,
            elementFactor,
            randomFactor
          });
          one = Math.max(1, Math.floor(one * reduceFactor));
          if (bonusFixedPerHit && Math.random() <= bonusFixedPerHit.chance) {
            one += bonusFixedPerHit.amount;
          }
          const actorCritStage = getSideState(scene, actorSide).critStage || 0;
          const crit = Math.random() < critChanceByStage(actorCritStage);
          if (crit) {
            one = Math.max(1, Math.floor(one * 1.5));
            if (isAttacker) scene.critOnTarget = true;
            else scene.critOnAttacker = true;
          }
          comboHitList.push(`-${one}`);
          damage += one;
        }
        }
        if ((scene.critOnTarget && isAttacker) || (scene.critOnAttacker && !isAttacker)) {
          pushBattleLog(scene, `${actorName} 打出了暴击！`);
        }
        }
      }

      scene.lastDamage = damage;
      scene.lastElementFactor = elementFactor;
      if (damage > 0) {
        const showDamageVisual = () => {
          const live = battleScene.value;
          if (!live || live !== scene || live.ended) return;
          scene.uiAttackerHp = scene.attackerHp;
          scene.uiTargetHp = scene.targetHp;
          if (targetSide === "target") {
            if (isComboSkill) {
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
          } else {
            if (isComboSkill) {
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
          }
          markBattleFloatText(scene);
          flushAfterDamageFloat(scene);
        };
        if (targetSide === "target") {
          scene.targetHp = Math.max(0, scene.targetHp - damage);
          if (damage > 0) clearSleepAfterDamage(scene, "target");
            scheduleBattleSkillEffectVisual(scene, actorSide, targetSide, skill, atkKind, actionStateKey, actionSeq, showDamageVisual);
          }
          else {
            scene.attackerHp = Math.max(0, scene.attackerHp - damage);
            applyBattleDamageToActivePet(scene);
            if (damage > 0) clearSleepAfterDamage(scene, "attacker");
            scheduleBattleSkillEffectVisual(scene, actorSide, targetSide, skill, atkKind, actionStateKey, actionSeq, showDamageVisual);
          }
        const damageTargetName = targetSide === actorSide ? `${actorName}自己` : targetName;
        if (comboHitList.length > 1) {
          pushBattleLog(scene, `${actorName} 使用 ${skill.name}，连续攻击 ${comboHitList.length} 次，对 ${damageTargetName} 总伤害 ${damage}（${compareElementLabel(elementFactor)}）。`);
        } else {
          pushBattleLog(scene, `${actorName} 使用 ${skill.name}，对 ${damageTargetName} 造成 ${damage} 点伤害（${compareElementLabel(elementFactor)}）。`);
        }
        runOnDamagedEffects(scene, targetSide, actorSide, { reason: "attacked" });
        const damagedTriggerTimes = Math.max(1, comboHitList.length);
        for (let i = 0; i < damagedTriggerTimes; i += 1) {
          runOnDamagedEffects(scene, targetSide, actorSide, { reason: "damaged" });
        }
      }
      if (didHit && damage <= 0) {
        runOnDamagedEffects(scene, targetSide, actorSide, { reason: "attacked" });
      }
      applySkillEffects(scene, actorSide, skill, didHit);
      if (resolveBattleDefeatIfNeeded(scene, isAttacker ? "" : "我方背包亚比全部倒下")) return { ended: true, visualDelayMs };
      scene.pendingEndTurnTick = true;

      return { ended: false, visualDelayMs };
    };
    const queueTargetCounterAttack = (delayMs = BATTLE_COUNTER_ATTACK_DELAY_MS) => {
      const scene = battleScene.value;
      if (!scene || scene.ended || scene.pendingFinish) return;
      const finishTurnVisuals = (turnEnd) => {
        if (!turnEnd || turnEnd.ended || turnEnd.pendingFinish) return;
        turnEnd.pendingEndTurnTick = false;
        setTimeout(() => {
          if (!battleScene.value || battleScene.value !== turnEnd || turnEnd.ended || turnEnd.pendingFinish) return;
          battleScene.value.fxSkillText = "";
          battleScene.value.fxAttackerSkillText = "";
          battleScene.value.fxTargetSkillText = "";
          clearBattleFloatTextIfExpired(battleScene.value);
          clearBattleSkillEffectFxIfExpired(battleScene.value);
          battleScene.value.fxTargetShake = false;
          battleScene.value.fxAttackerShake = false;
          battleScene.value._petAnimActionMarks = {};
          if (battleScene.value._petAnimTargetAutoIdleTimer) { clearTimeout(battleScene.value._petAnimTargetAutoIdleTimer); battleScene.value._petAnimTargetAutoIdleTimer = null; }
          if (battleScene.value._petAnimAttackerAutoIdleTimer) { clearTimeout(battleScene.value._petAnimAttackerAutoIdleTimer); battleScene.value._petAnimAttackerAutoIdleTimer = null; }
          battleScene.value._petAnimTargetPlayLock = false;
          battleScene.value._petAnimAttackerPlayLock = false;
          resetBattleAnimIdle(battleScene.value);
          battleScene.value.turnCount = Math.max(1, Number(battleScene.value.turnCount) || 1) + 1;
          pushBattleLog(battleScene.value, `第${battleScene.value.turnCount}回合开始。`);
          battleScene.value.isActing = false;
        }, BATTLE_FLOAT_TEXT_DURATION_MS);
      };
      const settleEndTurn = (turnEnd) => {
        if (!turnEnd || turnEnd.ended || turnEnd.pendingFinish) return false;
        if (turnEnd.pendingEndTurnTick) {
          applyEndTurnStatus(turnEnd, "attacker");
          applyBattleDamageToActivePet(turnEnd);
          if (resolveBattleDefeatIfNeeded(turnEnd, "我方背包亚比全部倒下")) {
            pushBattleLog(turnEnd, `${turnEnd.attackerName} 倒下。`);
            return false;
          }
          if (!turnEnd.ended && !turnEnd.pendingFinish) {
            applyEndTurnStatus(turnEnd, "target");
            if (resolveBattleDefeatIfNeeded(turnEnd)) {
              pushBattleLog(turnEnd, `${turnEnd.targetName} 倒下。`);
              return false;
            }
          }
          tickGlobalTimedEffects(turnEnd);
          if (resolveBattleDefeatIfNeeded(turnEnd)) return false;
        }
        finishTurnVisuals(turnEnd);
        return true;
      };
      setTimeout(() => {
        const live = battleScene.value;
        if (!live || live.ended || live.pendingFinish) return;
        const candidates = battleSceneTargetSkills.value.filter((s) => s.pp > 0);
        if (candidates.length === 0) {
          if (useGuardianAutoPpBean(live)) {
            setTimeout(() => {
              const turnEnd = battleScene.value;
              if (!turnEnd || turnEnd !== live) return;
              settleEndTurn(turnEnd);
            }, BATTLE_FLOAT_TEXT_DURATION_MS);
            return;
          }
          finalizeBattleScene(live, true, "挑战目标技能 PP 耗尽");
          live.isActing = false;
          return;
        }
        const skill = pickTargetSkill(live, candidates);
        if (!skill) {
          settleEndTurn(live);
          return;
        }
        const result = runBattleSkill(live, "target", skill);
        if (live.ended || live.pendingFinish) return;
        setTimeout(() => {
          const turnEnd = battleScene.value;
          if (!turnEnd || turnEnd !== live) return;
          settleEndTurn(turnEnd);
        }, Math.max(BATTLE_FLOAT_TEXT_DURATION_MS, Number(result && result.visualDelayMs) || 0));
      }, Math.max(0, Number(delayMs) || 0));
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
        displayImage: entry.image
      });
      if (!nextTarget) return false;
      scene.targetDexId = nextTarget.dexId;
      scene.targetName = nextTarget.name;
      scene.targetImage = nextTarget.image;
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
      const study = normalizeStudy(pet.study);
      const before = clamp(Number(study[key]) || 0, 0, 255);
      study[key] = clamp(before + 10, 0, 255);
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
        displayImage: meta.targetEntry.image
      });
      if (!nextTarget) return false;
      scene.targetDexId = nextTarget.dexId;
      scene.targetName = nextTarget.name;
      scene.targetImage = nextTarget.image;
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
          expGain = calcWinExp(scene.targetLevel);
          const receivers = bagPets.value.filter((p) => p && p.id);
          if (receivers.length > 0) {
            const avg = Math.floor(expGain / receivers.length);
            const rem = expGain % receivers.length;
            receivers.forEach((pet, idx) => {
              const row = grantExp(pet, avg + (idx < rem ? 1 : 0));
              expDistribution.push(row);
            });
            pushBattleLog(scene, `获得总经验 ${expGain}，由背包 ${receivers.length} 只亚比平均共享。`);
          } else if (activePet) {
            expDistribution.push(grantExp(activePet, expGain));
          }
        }
        if (scene.mode === "guardian") {
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
          const canDropEgg = canObtainEggByActionDexId(target.dexId);
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
          const canDropEgg = canObtainEggByActionDexId(target.dexId);
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
        } else {
          hCoinGain = Math.max(0, Math.floor(Number(scene.targetLevel) || 0) * 2);
          const targetChain = getChainStageInfoByDexId(target.dexId, target.name);
          const isFinalForm = targetChain.formCount <= 1 || targetChain.stageIndex >= (targetChain.formCount - 1);
          markDefeatedDex(target.dexId);
          if (!state.value.activatedDexIds.includes(target.dexId)) state.value.activatedDexIds.push(target.dexId);
          if (isFinalForm) {
            const hatchDexId = Number(targetChain.rootDexId) || target.dexId;
            const hatchDex = dexById.get(hatchDexId) || target;
            const canDropEgg = canObtainEggByActionDexId(hatchDex.dexId);
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
          state.value.hCoins = Math.max(0, Math.floor(Number(state.value.hCoins) || 0)) + hCoinGain;
          pushBattleLog(scene, `获得 ${hCoinGain} H币。`);
        }
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
        expDistribution
      };
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
      const skill = (scene.skills || []).find((s) => normalizeSkillKey(s.name) === key);
      if (!skill || skill.pp <= 0) return;
      if (hasUsedOncePerBattleSkill(scene, "attacker", skill)) {
        showToast(`${skill.name} 一场战斗只能使用一次。`);
        return;
      }
      scene.isActing = true;
      const result = runBattleSkill(scene, "attacker", skill);
      if (scene.ended) {
        scene.isActing = false;
        return;
      }
      if (scene.pendingFinish) return;
      const noPp = (scene.skills || []).every((s) => s.pp <= 0);
      if (noPp) {
        finalizeBattleScene(scene, false, "技能 PP 耗尽");
        scene.isActing = false;
        return;
      }
      Promise.resolve(result && result.visualDone).then(() => {
        const live = battleScene.value;
        if (!live || live !== scene || live.ended || live.pendingFinish) return;
        queueTargetCounterAttack(BATTLE_COUNTER_ATTACK_DELAY_MS);
      });
    };
    const consumeBattleTurnAfterItem = () => {
      const scene = battleScene.value;
      if (!scene || !scene.open || scene.ended || scene.pendingFinish) return;
      const beforeAct = beforeActionCheck(scene, "attacker");
      if (beforeAct.log) pushBattleLog(scene, beforeAct.log);
      const noPp = (scene.skills || []).every((s) => s.pp <= 0);
      if (noPp) {
        finalizeBattleScene(scene, false, "技能 PP 耗尽");
        scene.isActing = false;
        return;
      }
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
      applyBattleDamageToActivePet(scene);
      const id = String(unitId || "");
      if (!id || id === scene.currentAttackerId) return;
      const next = (scene.team || []).find((u) => u.id === id && u.hp > 0);
      if (!next) return;
      scene.currentAttackerId = next.id;
      scene.attackerDexId = Number(next.dexId) || 0;
      scene.attackerBaseDexId = Number(next.baseDexId) || Number(next.dexId) || 0;
      scene.attackerName = next.name;
      scene.attackerImage = next.image;
      scene.attackerLevel = next.level;
      scene.attackerElement = next.element;
      scene.attackerSubElement = next.subElement;
      scene.attackerAbility = next.ability;
      scene.attackerHp = next.hp;
      scene.attackerMaxHp = next.maxHp;
      scene.uiAttackerHp = next.hp;
      scene.uiAttackerMaxHp = next.maxHp;
      scene.attackerState = normalizeBattleState(next.battleState);
      scene.skills = next.skills;
      scene.fxAttackerDefeated = false;
      resetBattleAnimIdle(scene);
      pushBattleLog(scene, `我方换宠：${next.name} 上场。`);
      showSwitchPanel.value = false;
      const mode = switchPanelMode.value;
      switchPanelMode.value = "manual";
      if (mode === "manual") {
        scene.isActing = true;
        queueTargetCounterAttack();
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
      if (battleScene.value) {
        battleScene.value.pendingFinish = false;
        if (battleScene.value._petAnimTargetAutoIdleTimer) { clearTimeout(battleScene.value._petAnimTargetAutoIdleTimer); battleScene.value._petAnimTargetAutoIdleTimer = null; }
        if (battleScene.value._petAnimAttackerAutoIdleTimer) { clearTimeout(battleScene.value._petAnimAttackerAutoIdleTimer); battleScene.value._petAnimAttackerAutoIdleTimer = null; }
        battleScene.value._petAnimTargetPlayLock = false;
        battleScene.value._petAnimAttackerPlayLock = false;
      }
      battleScene.value = null;
      stopBattleBgm();
      showSwitchPanel.value = false;
      switchPanelMode.value = "manual";
      refreshSceneBgm();
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
      if (isGuardianName(entry.name)) return "守护者";
      if (isBossName(entry.name)) return "BOSS";
      if (isShopEggName(entry.name)) return "商店蛋";
      if (state.value.activatedDexIds.includes(entry.dexId)) return "已激活";
      return "未激活";
    };
    const statusClass = (entry) => {
      const s = dexStatus(entry);
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
      const species = getSpeciesByDexId(pet.dexId, pet.speciesName);
      if (!species) return;
      const nextSkill = normalizeSkillKey(skillName);
      if (!nextSkill) return;
      const validSet = speciesSkillNameSet(species, pet.level);
      if (!validSet.has(nextSkill)) return;
      pet.equippedSkills = normalizeEquippedSkillsBySpecies(species, pet.equippedSkills, pet.level);
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
      const species = getSpeciesByDexId(pet.dexId, pet.speciesName);
      if (!species) { replaceSkillCtx.value = null; return; }
      pet.equippedSkills = normalizeEquippedSkillsBySpecies(species, pet.equippedSkills, pet.level);
      const oldName = normalizeSkillKey(ctx.oldSkill);
      const newName = normalizeSkillKey(newSkill);
      const validSet = speciesSkillNameSet(species, pet.level);
      if (!oldName || !newName || !validSet.has(newName)) { replaceSkillCtx.value = null; return; }
      if (pet.equippedSkills.some((x) => normalizeSkillKey(x) === newName)) return;
      const idx = pet.equippedSkills.findIndex((x) => normalizeSkillKey(x) === oldName);
      if (idx >= 0) {
        pet.equippedSkills.splice(idx, 1, newName);
        pet.equippedSkills = normalizeEquippedSkillsBySpecies(species, pet.equippedSkills, pet.level);
      }
      replaceSkillCtx.value = null;
    };
    const confirmReplaceSkill = (oldSkill) => {
      const pet = selectedPet.value;
      const ctx = replaceSkillCtx.value;
      if (!pet || !ctx || ctx.petId !== pet.id) return;
      const species = getSpeciesByDexId(pet.dexId, pet.speciesName);
      if (!species) { replaceSkillCtx.value = null; return; }
      pet.equippedSkills = normalizeEquippedSkillsBySpecies(species, pet.equippedSkills, pet.level);
      const oldName = normalizeSkillKey(oldSkill);
      const newName = normalizeSkillKey(ctx.newSkill);
      const validSet = speciesSkillNameSet(species, pet.level);
      if (!newName || !validSet.has(newName)) { replaceSkillCtx.value = null; return; }
      const idx = pet.equippedSkills.indexOf(oldName);
      if (idx >= 0) {
        pet.equippedSkills.splice(idx, 1, newName);
        pet.equippedSkills = normalizeEquippedSkillsBySpecies(species, pet.equippedSkills, pet.level);
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
      state.value.bagPetIds.splice(slotIdx, 1, "");
      state.value.selectedAttackerId = state.value.bagPetIds[0] || "";
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
        const first = safeActivePets.value[0];
        shopTargetPetId.value = first ? first.id : "";
      }
    };
    const closeShopPanel = () => {
      showShopPanel.value = false;
      refreshSceneBgm();
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
      addItemCount(id, quantity);
      showToast(totalPrice > 0 ? `已购买 ${item.name} x${quantity}，花费 ${totalPrice} H币。` : `已获取 ${item.name} x${quantity}。`);
    };
    const buyShopEgg = (dexId) => {
      const entry = dexById.get(Number(dexId));
      if (!entry || !isShopEggName(entry.name)) return showToast("该亚比蛋暂未上架。");
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
    const useShopItem = (itemId) => {
      const id = normalize(String(itemId || ""));
      if (!id) return;
      if (getItemCount(id) <= 0) return showToast("该道具数量不足。");
      if (battleScene.value && battleScene.value.currentAttackerId) {
        shopTargetPetId.value = battleScene.value.currentAttackerId;
      }
      const pet = state.value.activePets.find((p) => p && p.id === shopTargetPetId.value);
      if (!pet) return showToast("请先选择目标亚比。");
      const levelUpPetTo = (targetLevel) => {
        const goal = clamp(Math.floor(Number(targetLevel) || 1), 1, 100);
        const chainAnchorDexId = Number((pet && pet.baseDexId) || (pet && pet.dexId)) || Number(pet.dexId) || 0;
        const chain = getChainStageInfoByDexId(chainAnchorDexId, pet.speciesName);
        const crossed = [];
        while (pet.level < goal) {
          const beforeForm = petCurrentForm(pet);
          const oldLevel = pet.level;
          pet.level += 1;
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
      if (id === "pp_bean_s" || id === "pp_bean_m" || id === "pp_bean_l") {
        const gain = id === "pp_bean_s" ? 5 : (id === "pp_bean_m" ? 10 : 20);
        const scene = battleScene.value;
        const actor = scene && scene.currentAttackerId === pet.id ? scene : null;
        if (!actor) return showToast("PP 豆需在该亚比出战时使用。");
        let deltaSum = 0;
        const detail = [];
        (actor.skills || []).forEach((s) => {
          if (hasUsedOncePerBattleSkill(actor, "attacker", s)) {
            detail.push(`${s.name}+0`);
            return;
          }
          const cur = Number(s.pp) || 0;
          const mx = Math.max(1, Number(s.ppMax) || cur || 1);
          const next = clamp(cur + gain, 0, mx);
          const inc = Math.max(0, next - cur);
          deltaSum += inc;
          detail.push(`${s.name}+${inc}`);
          s.pp = next;
        });
        addItemCount(id, -1);
        actor.ppOnAttacker = `PP+${gain}`;
        markBattleFloatText(actor);
        setTimeout(() => {
          if (battleScene.value && battleScene.value === actor) actor.ppOnAttacker = "";
        }, BATTLE_FLOAT_TEXT_DURATION_MS);
        pushBattleLog(actor, `${petDisplayName(pet)} 使用 ${itemNameById(id, "PP豆")}：每个已装备技能回复 ${gain} PP，${detail.join("，")}（实际合计+${deltaSum}）`);
        battleActionTab.value = "skills";
        showToast(`${petDisplayName(pet)} 的技能 PP 回复 ${gain} 点。`);
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
        pet.hp = clamp(oldHp + heal, 0, maxHp);
        addItemCount(id, -1);
        const healedActual = Math.max(0, pet.hp - oldHp);
        if (scene && scene.currentAttackerId === pet.id) {
          scene.attackerHp = clamp(Number(pet.hp) || 0, 0, Number(scene.attackerMaxHp) || 1);
          scene.uiAttackerHp = scene.attackerHp;
          scene.healOnAttacker = `+${heal}`;
          markBattleFloatText(scene);
          setTimeout(() => {
            if (battleScene.value && battleScene.value === scene) scene.healOnAttacker = "";
          }, BATTLE_FLOAT_TEXT_DURATION_MS);
          pushBattleLog(scene, `${petDisplayName(pet)} 使用 ${shopItems.value.find((x) => x.id === id)?.name || "体力糖"}，回复 ${heal} 体力（实际恢复 ${healedActual}）`);
        }
        battleActionTab.value = "skills";
        showToast(`${petDisplayName(pet)} 回复体力 ${heal} 点。`);
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
        pet.talentRerollCount = Math.max(0, Math.floor(Number(pet.talentRerollCount) || 0)) + 1;
        pet.talent = normalizeTalent(createBiasedRandomTalent(pet.talentRerollCount));
        const afterTotal = Object.values(pet.talent).reduce((sum, v) => sum + (Number(v) || 0), 0);
        addItemCount(id, -1);
        showToast(`${petDisplayName(pet)} 天赋重组完成：${beforeTotal} -> ${afterTotal}（${talentGradeByTotal(afterTotal)}）。`);
        return;
      }
      if (id === "talent_boost_capsule") {
        pet.talent = normalizeTalent(pet.talent);
        const keys = STAT_KEYS.filter((k) => k in pet.talent);
        const candidates = keys.filter((k) => Number(pet.talent[k]) < 62);
        if (candidates.length === 0) return showToast(`${petDisplayName(pet)} 的天赋已全部达到上限。`);
        const key = candidates[Math.floor(Math.random() * candidates.length)];
        const inc = randInt(1, 5);
        const before = Number(pet.talent[key]) || 0;
        pet.talent[key] = clamp(before + inc, 0, 62);
        pet.talent = normalizeTalent(pet.talent);
        addItemCount(id, -1);
        showToast(`${petDisplayName(pet)} 的${battleStatLabel(key)}天赋 +${pet.talent[key] - before}。`);
        return;
      }
      showToast("该道具暂未开放。");
    };
    const setChallengeFormIndex = (idx) => {
      void idx;
      const next = selectedDexStageIndex.value;
      state.value.challengeFormIndex = next;
      state.value.targetLevel = selectedChallengeDefaultLevel.value;
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
    const closePetDetailModal = () => {
      showPetDetailModal.value = false;
      detailPreviewPet.value = null;
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
      const tl = raw;
      closeTargetPanel();
      setupBattleScene({
        targetEntry: target,
        targetLevel: tl,
        forceTargetHpRace500: false,
        mode: "normal"
      });
    };
    const openGuardianPanel = () => { showGuardianPanel.value = true; };
    const closeGuardianPanel = () => { showGuardianPanel.value = false; };
    const openBossPanel = () => { showBossPanel.value = true; };
    const closeBossPanel = () => { showBossPanel.value = false; };
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
      setupBattleScene({
        targetEntry: meta.targetEntry,
        targetLevel: 10,
        forceTargetHpRace500: false,
        targetTalentOverride: createUniformTalent30(),
        targetStudyOverride: createZeroStats(),
        mode: "study",
        guardianMeta: meta
      });
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
      selectedGuardianDexId.value = entry.dexId;
      closeGuardianPanel();
      showGuardianChallengePanel.value = true;
    };
    const closeGuardianChallengePanel = () => { showGuardianChallengePanel.value = false; };
    const startGuardianChallenge = (dexId) => {
      const entry = dexById.get(Number(dexId));
      if (!entry || !isGuardianName(entry.name)) return showToast("该亚比不是守护者。");
      if (!isDexIdInOpenChallengeRange(entry)) return showToast(openChallengeRangeMessage());
      if (bagPets.value.length === 0) return showToast("背包中没有可出战亚比。");
      closeGuardianChallengePanel();
      const extraGuardian = isExtraGuardianName(entry.name);
      const meta = {
        dexId: entry.dexId,
        guardianName: entry.name,
        levels: extraGuardian ? EXTRA_GUARDIAN_LEVELS.slice() : GUARDIAN_LEVELS.slice(),
        stageIndex: 0,
        hpRaceMultiplier: extraGuardian ? 10 : 5,
        talentValue: extraGuardian ? 50 : 30
      };
      const level = meta.levels[0];
      setupBattleScene({
        targetEntry: entry,
        targetLevel: level,
        forceTargetHpRace500: false,
        targetHpRaceMultiplier: meta.hpRaceMultiplier,
        targetTalentOverride: extraGuardian ? createUniformTalent50() : null,
        targetStudyOverride: createGuardianStudy(),
        mode: "guardian",
        guardianMeta: meta
      });
    };
    const confirmGuardianChallenge = () => {
      const entry = selectedGuardianEntry.value;
      if (!entry) return showToast("请先选择守护者。");
      startGuardianChallenge(entry.dexId);
    };
    const openBossChallengePanel = (dexId) => {
      const entry = dexById.get(Number(dexId));
      if (!entry || !isBossName(entry.name)) return;
      if (!isDexIdInOpenChallengeRange(entry)) return showToast(openChallengeRangeMessage());
      selectedBossDexId.value = entry.dexId;
      closeBossPanel();
      showBossChallengePanel.value = true;
    };
    const closeBossChallengePanel = () => { showBossChallengePanel.value = false; };
    const startBossChallenge = (dexId) => {
      const entry = dexById.get(Number(dexId));
      if (!entry || !isBossName(entry.name)) return showToast("该亚比不是BOSS。");
      if (!isDexIdInOpenChallengeRange(entry)) return showToast(openChallengeRangeMessage());
      if (bagPets.value.length === 0) return showToast("背包中没有可出战亚比。");
      closeBossChallengePanel();
      setupBattleScene({
        targetEntry: entry,
        targetLevel: 100,
        forceTargetHpRace500: false,
        targetHpRaceMultiplier: 15,
        targetTalentOverride: createUniformTalent60(),
        targetStudyOverride: createGuardianStudy(),
        mode: "boss"
      });
    };
    const confirmBossChallenge = () => {
      const entry = selectedBossEntry.value;
      if (!entry) return showToast("请先选择BOSS。");
      startBossChallenge(entry.dexId);
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
        createdAt: Date.now()
      };
      state.value.activePets.unshift(newPet);
      syncPetEvolutionForm(newPet);
      markObtainedEggDex(newPet.dexId);
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

    return {
      state,
      playMode,
      authReady,
      authUser,
      authUsername,
      authPassword,
      rememberPassword,
      authMode,
      authLoading,
      saveLoading,
      lastServerSavedAt,
      dexSearch,
      dexElementFilter,
      dexDefeatFilter,
      warehouseSearch,
      warehouseElementFilter,
      warehouseSortMode,
      nowTs,
      toast,
      battleResult,
      activeEvolution,
      battleScene,
      showSwitchPanel,
      selectedWarehousePetId,
      showWarehouseActionModal,
      selectedWarehouseActionPet,
      switchPanelMode,
      showElementPanel,
      showWarehousePanel,
      showShopPanel,
      showBadgePanel,
      shopTab,
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
      selectedPetEquippedSkills,
      selectedRaceStats,
      selectedAbilityStats,
      selectedPetTalent,
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
      firstPet,
      bagPets,
      bagCount,
      safeActivePets,
      warehousePets,
      warehouseElementOptions,
      filteredWarehousePets,
      warehouseCount,
      shopItems,
      shopBuyQuantities,
      shopEggEntries,
      itemInventoryRows,
      shopTargetPetId,
      shopTargetOptions,
      safeEggs,
      safeBattleLog,
      predictedWinExp,
      predictedLoseExp,
      predictedElementFactor,
      predictedElementText,
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
      safeSkillAccuracy,
      skillBattleDesc,
      skillAttackTypeLabel,
      skillDisplayDesc,
      hasEquippedSkill,
      hasDefeatedDex,
      petElementIconStyle,
      petElementIconSrc,
      petElementList,
      skillTypeMeta,
      hpPercent,
      battleSceneLogRef,
      battleSceneSkills,
      battleAttackerStatusBadges,
      battleTargetStatusBadges,
      battleAttackerTimedEffects,
      battleTargetTimedEffects,
      battleAttackerStageText,
      battleTargetStageText,
      battleAbilityNow,
      battleSceneAvailablePets,
      isBattleAnimSide,
      battleSkillEffectStyle,
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
      closeEvolutionModal,
      showGuardianPanel,
      showBossPanel,
      showStudyPanel,
      showTargetPanel,
      showGuardianChallengePanel,
      showBossChallengePanel,
      guardianDexEntries,
      bossDexEntries,
      studyBattlefields: STUDY_BATTLEFIELDS,
      selectedGuardianEntry,
      selectedBossEntry,
      selectedGuardianChallengeText,
      selectedBossChallengeText,
      canChallengeFromDex,
      canStartChallengeByDex,
      selectedDexChallengeLocked,
      openGuardianPanel,
      closeGuardianPanel,
      openBossPanel,
      closeBossPanel,
      openStudyPanel,
      closeStudyPanel,
      startStudyBattle,
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
      openWarehousePanel,
      closeWarehousePanel,
      toggleWarehousePetActions,
      isWarehousePetExpanded,
      closeWarehouseActionModal,
      addToBagFromWarehouse,
      openBadgePanel,
      closeBadgePanel,
      equipBadge,
      unequipBadge,
      openShopPanel,
      closeShopPanel,
      buyShopItem,
      shopBuyQuantity,
      setShopBuyQuantity,
      shopItemTotalPrice,
      buyShopEgg,
      openShopEggDetail,
      useShopItem,
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
      logoutUser,
      saveToServer,
      loadServerSave,
      withFallback
    };
  }
}).mount("#app");
