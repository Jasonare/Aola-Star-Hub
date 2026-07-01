const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const badgesDir = path.join(__dirname, "badges");
const medalsDir = path.join(__dirname, "勋章");
const manifestPath = path.join(badgesDir, "manifest.json");

const AUTO_PREFIX = "boss_";
const TIER_RULES = [
  { pattern: /青铜[徽勋]章$/u, tier: "normal" },
  { pattern: /白银勋章$/u, tier: "hard" },
  { pattern: /黄金勋章$/u, tier: "nightmare" }
];

const NAME_ALIASES = {
  "魔焰基拉": "魔焰吉拉"
};

const readJson = (filePath, fallback) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
};

const ensureObject = (value) => (value && typeof value === "object" && !Array.isArray(value) ? value : {});

const toRelativeResourcePath = (absolutePath) => {
  const relative = path.relative(rootDir, absolutePath).replace(/\\/g, "/");
  return `./${relative}`;
};

const resolveBossTierMeta = (fileName) => {
  const stem = path.parse(fileName).name;
  for (const rule of TIER_RULES) {
    if (!rule.pattern.test(stem)) continue;
    const rawBoss = stem.replace(rule.pattern, "");
    const bossName = NAME_ALIASES[rawBoss] || rawBoss;
    return {
      bossName,
      tier: rule.tier,
      id: `boss_${bossName}_${rule.tier}_first`
    };
  }
  return null;
};

const buildAutoMappings = () => {
  if (!fs.existsSync(medalsDir)) return {};
  const files = fs.readdirSync(medalsDir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, "zh-Hans-CN"));

  const mappings = {};
  for (const fileName of files) {
    const meta = resolveBossTierMeta(fileName);
    if (!meta) continue;
    mappings[meta.id] = toRelativeResourcePath(path.join(medalsDir, fileName));
  }
  return mappings;
};

const main = () => {
  fs.mkdirSync(badgesDir, { recursive: true });
  const manifest = readJson(manifestPath, { byId: {}, byName: {} });
  const byId = { ...ensureObject(manifest.byId) };
  const byName = ensureObject(manifest.byName);

  Object.keys(byId).forEach((key) => {
    if (String(key).startsWith(AUTO_PREFIX)) delete byId[key];
  });

  const autoMappings = buildAutoMappings();
  Object.assign(byId, autoMappings);

  const output = {
    byId,
    byName
  };

  fs.writeFileSync(manifestPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");

  const count = Object.keys(autoMappings).length;
  console.log(`Updated ${manifestPath}`);
  console.log(`Auto-mapped ${count} boss badge image(s) from ${medalsDir}`);
};

try {
  main();
} catch (error) {
  console.error(error && error.stack ? error.stack : String(error));
  process.exitCode = 1;
}
