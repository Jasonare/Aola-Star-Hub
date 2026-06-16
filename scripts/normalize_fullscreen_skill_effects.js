const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const INPUT_DIR = path.join(ROOT, "skill-effect");
const OUTPUT_DIR = path.join(ROOT, "skill-effect-fullscreen");

const FULLSCREEN_EFFECT_IDS = [
  16254, // 飓风·雷电
  16234, // 万物皆明
  16235, // 月影无踪
  16310, // 真战无落日
  3321,  // 真舞八重击
  17294, // 真·血印
  16311, // 真神武噬月
  20067  // 龙之煌炎
];

const MISSING_FULLSCREEN_EFFECT_IDS = [16221, 3321, 17294, 16311, 20067, 16314];

MISSING_FULLSCREEN_EFFECT_IDS.forEach((id) => {
  if (!FULLSCREEN_EFFECT_IDS.includes(id)) FULLSCREEN_EFFECT_IDS.push(id);
});

const ADDITIONAL_FULLSCREEN_EFFECT_IDS = [
  20070, 20081, 20083, 20074,
  16330, 16324, 16350, 11347, 15337, 16358,
  20102, 16366, 21086, 19168, 17336, 23064,
  19149, 17322, 19156, 17328, 23050, 16353,
  19216, 23072, 21087, 10384, 16342, 16384,
  21073, 23080, 20115, 15360, 23061, 20093,
  16393, 16405, 16397, 16401, 15349, 33003
];

ADDITIONAL_FULLSCREEN_EFFECT_IDS.forEach((id) => {
  if (!FULLSCREEN_EFFECT_IDS.includes(id)) FULLSCREEN_EFFECT_IDS.push(id);
});

const run = (args) => spawnSync("ffmpeg", args, {
  cwd: ROOT,
  encoding: "utf8",
  windowsHide: true
});

const detectCrop = (input) => {
  const result = run([
    "-hide_banner",
    "-i", input,
    "-vf", "alphaextract,cropdetect=limit=1:round=2:reset=0",
    "-frames:v", "120",
    "-f", "null",
    "-"
  ]);
  const text = `${result.stdout || ""}\n${result.stderr || ""}`;
  const matches = [...text.matchAll(/crop=(\d+):(\d+):(\d+):(\d+)/g)];
  if (!matches.length) return null;
  const last = matches[matches.length - 1];
  return {
    w: Number(last[1]),
    h: Number(last[2]),
    x: Number(last[3]),
    y: Number(last[4])
  };
};

const normalizeOne = (skillId) => {
  const input = path.join(INPUT_DIR, `effect${skillId}.gif`);
  const output = path.join(OUTPUT_DIR, `effect${skillId}.gif`);
  if (!fs.existsSync(input)) return { skillId, status: "missing", input };
  const crop = detectCrop(input);
  if (!crop || crop.w <= 0 || crop.h <= 0) return { skillId, status: "crop_failed", input };
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const tmp = path.join(OUTPUT_DIR, `effect${skillId}.tmp.gif`);
  const vf = `crop=${crop.w}:${crop.h}:${crop.x}:${crop.y},split[s0][s1];[s0]palettegen=reserve_transparent=1:transparency_color=000000[p];[s1][p]paletteuse=alpha_threshold=64`;
  const result = run([
    "-hide_banner",
    "-y",
    "-i", input,
    "-filter_complex", vf,
    "-loop", "0",
    tmp
  ]);
  if (result.status !== 0 || !fs.existsSync(tmp) || fs.statSync(tmp).size <= 0) {
    try { if (fs.existsSync(tmp)) fs.unlinkSync(tmp); } catch {}
    return { skillId, status: "ffmpeg_failed", crop, log: (result.stderr || "").slice(-1200) };
  }
  fs.renameSync(tmp, output);
  return {
    skillId,
    status: "ok",
    crop,
    inputBytes: fs.statSync(input).size,
    outputBytes: fs.statSync(output).size,
    output: path.relative(ROOT, output)
  };
};

const main = () => {
  const results = FULLSCREEN_EFFECT_IDS.map(normalizeOne);
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "_normalize_results.json"),
    JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2),
    "utf8"
  );
  results.forEach((row) => console.log(JSON.stringify(row)));
};

main();
