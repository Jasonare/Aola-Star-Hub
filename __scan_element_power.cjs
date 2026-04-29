const fs = require("fs");
const vm = require("vm");

const code = fs.readFileSync("aola-skill-data.js", "utf8");
const sandbox = { console };
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(
  code +
    "\nthis.__out=(typeof AOLA_SKILL_DATA_BY_ID!=='undefined'?AOLA_SKILL_DATA_BY_ID:(typeof AOLA_SKILL_DATA!=='undefined'?AOLA_SKILL_DATA:null));",
  sandbox
);
const data = sandbox.__out || {};
const list = Object.values(data);

// 元素名与操作词全部用 unicode 转义，规避终端编码问题
const elementName =
  "(\\u6728\\u7cfb|\\u706b\\u7cfb|\\u6c34\\u7cfb|\\u51b0\\u7cfb|\\u571f\\u7cfb|\\u7535\\u7cfb|\\u5149\\u660e\\u7cfb|\\u6697\\u9ed1\\u7cfb|\\u795e\\u79d8\\u7cfb|\\u673a\\u68b0\\u7cfb|\\u98de\\u884c\\u7cfb|\\u9f99\\u7cfb|\\u4e0a\\u53e4\\u7cfb|\\u6570\\u7801\\u7cfb|\\u683c\\u6597\\u7cfb|\\u738b\\u7cfb|\\u795e\\u5175\\u7cfb|\\u5723\\u7075\\u7cfb|\\u722c\\u884c\\u7cfb|\\u666e\\u901a\\u7cfb|\\u6bd2\\u7cfb)";
const opWord =
  "(\\u589e\\u52a0|\\u63d0\\u5347|\\u63d0\\u9ad8|\\u4e0a\\u5347|\\u589e\\u5f3a|\\u964d\\u4f4e|\\u4e0b\\u964d|\\u51cf\\u5c11|\\u524a\\u5f31)";
const skillWord = "\\u6280\\u80fd"; // 技能
const powerWord = "\\u5a01\\u529b"; // 威力

const r1 = new RegExp(
  `(${elementName})\\s*${skillWord}\\s*${powerWord}\\s*${opWord}\\s*(\\d+(?:\\.\\d+)?)\\s*(?:%|\\u767e\\u5206\\u6bd4)?`
);
const r2 = new RegExp(
  `${opWord}\\s*(\\d+(?:\\.\\d+)?)\\s*(?:%|\\u767e\\u5206\\u6bd4)?\\s*(${elementName})\\s*${skillWord}\\s*${powerWord}`
);
const r3 = new RegExp(
  `(${elementName})\\s*${powerWord}\\s*${opWord}\\s*(\\d+(?:\\.\\d+)?)\\s*(?:%|\\u767e\\u5206\\u6bd4)?`
);
const multiElement = `${elementName}(?:[\\u3001,\\uff0c\\u548c\\u4e0e]\\s*${elementName})+`;
const r4 = new RegExp(
  `${opWord}\\s*(${multiElement})\\s*${skillWord}\\s*${powerWord}\\s*(\\d+(?:\\.\\d+)?)\\s*(?:%|\\u767e\\u5206\\u6bd4)?`
);

const hit = list.filter((s) => {
  const d = String((s && s.desc) || "").replace(/\uFF05/g, "%");
  return r1.test(d) || r2.test(d) || r3.test(d) || r4.test(d);
});

const uniq = new Map();
for (const s of hit) {
  const k = `${s.name}#${s.desc}`;
  if (!uniq.has(k)) uniq.set(k, { name: s.name || "", desc: s.desc || "" });
}

const rows = [...uniq.values()].sort(
  (a, b) =>
    a.name.localeCompare(b.name, "zh-Hans-CN") ||
    a.desc.localeCompare(b.desc, "zh-Hans-CN")
);

const outTxt = "element_power_skills_report.txt";
const outJson = "element_power_skills_report.json";
const lines = [`命中技能数(去重后): ${rows.length}`, ""];
rows.forEach((r, i) => lines.push(`${i + 1}. ${r.name}\t${r.desc}`));
fs.writeFileSync(outTxt, lines.join("\n"), "utf8");
fs.writeFileSync(outJson, JSON.stringify({ count: rows.length, skills: rows }, null, 2), "utf8");

console.log(`written: ${outTxt}, ${outJson}, count=${rows.length}`);
for (const r of rows) console.log(`${r.name}\t${r.desc}`);
