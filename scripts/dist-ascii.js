const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const projectDir = path.resolve(__dirname, "..");
const isAsciiPath = (value) => /^[\x00-\x7F]*$/.test(String(value || ""));
const asciiRootCandidates = [
  process.env.AOLA_DIST_ASCII_ROOT && path.resolve(process.env.AOLA_DIST_ASCII_ROOT),
  path.join(process.env.PUBLIC || path.join(path.parse(projectDir).root, "Users", "Public"), "AolaStarHubBuild"),
  path.join(process.env.ProgramData || path.join(path.parse(projectDir).root, "ProgramData"), "AolaStarHubBuild"),
  path.join(path.parse(projectDir).root, "AolaStarHubBuild")
].filter(Boolean).filter(isAsciiPath);
const releaseDir = path.join(projectDir, "release");
const builderCli = path.join(projectDir, "node_modules", "electron-builder", "cli.js");
const afterPackHook = path.join("scripts", "after-pack-win-icon.js");

const excludedRootEntries = new Set([
  ".git",
  "node_modules",
  "release"
]);

const globToRegExp = (pattern) => {
  const normalized = String(pattern || "").replace(/\\/g, "/");
  let out = "^";
  for (let i = 0; i < normalized.length; i += 1) {
    const ch = normalized[i];
    const next = normalized[i + 1];
    if (ch === "*" && next === "*") {
      const after = normalized[i + 2];
      if (after === "/") {
        out += "(?:.*\\/)?";
        i += 2;
      } else {
        out += ".*";
        i += 1;
      }
    } else if (ch === "*") {
      out += "[^/]*";
    } else if ("\\^$+?.()|{}[]".includes(ch)) {
      out += `\\${ch}`;
    } else {
      out += ch;
    }
  }
  return new RegExp(`${out}$`);
};

const listFiles = (dir, base = dir) => {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  const rootStat = fs.statSync(dir);
  if (rootStat.isFile()) return [path.relative(base, dir).replace(/\\/g, "/")];
  const stack = [dir];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      if (current === base && excludedRootEntries.has(entry.name)) continue;
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(full);
      } else if (entry.isFile()) {
        out.push(path.relative(base, full).replace(/\\/g, "/"));
      }
    }
  }
  return out;
};

const copyPackagedFiles = (fromRoot, toRoot) => {
  const pkg = JSON.parse(fs.readFileSync(path.join(fromRoot, "package.json"), "utf8"));
  const patterns = Array.isArray(pkg.build && pkg.build.files) ? pkg.build.files : ["**/*"];
  const matchers = patterns.map(globToRegExp);
  const files = listFiles(fromRoot).filter((rel) => matchers.some((re) => re.test(rel)));
  for (const rel of files) {
    const from = path.join(fromRoot, rel);
    const to = path.join(toRoot, rel);
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.copyFileSync(from, to);
  }
  if (!files.includes("package-lock.json") && fs.existsSync(path.join(fromRoot, "package-lock.json"))) {
    fs.copyFileSync(path.join(fromRoot, "package-lock.json"), path.join(toRoot, "package-lock.json"));
  }
  const hookFrom = path.join(fromRoot, afterPackHook);
  if (fs.existsSync(hookFrom)) {
    const hookTo = path.join(toRoot, afterPackHook);
    fs.mkdirSync(path.dirname(hookTo), { recursive: true });
    fs.copyFileSync(hookFrom, hookTo);
  }
  return files.length;
};

const copyTree = (from, to) => {
  const stat = fs.statSync(from);
  if (stat.isDirectory()) {
    fs.mkdirSync(to, { recursive: true });
    for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
      if (from === projectDir && excludedRootEntries.has(entry.name)) continue;
      copyTree(path.join(from, entry.name), path.join(to, entry.name));
    }
    return;
  }
  if (stat.isSymbolicLink()) {
    const target = fs.readlinkSync(from);
    fs.symlinkSync(target, to);
    return;
  }
  fs.copyFileSync(from, to);
};

const prepareReleaseDirForCopy = (dir) => {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch (err) {
    console.warn(`Cannot fully remove release directory (${err.code || err.message}); copying build artifacts over existing files.`);
    try {
      fs.mkdirSync(dir, { recursive: true });
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        try {
          fs.rmSync(full, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 });
        } catch (innerErr) {
          console.warn(`Keeping existing release entry because it is locked: ${full} (${innerErr.code || innerErr.message})`);
        }
      }
    } catch (innerErr) {
      console.warn(`Release cleanup skipped (${innerErr.code || innerErr.message}); build artifacts will still be copied over.`);
    }
  }
  fs.mkdirSync(dir, { recursive: true });
};

const writeReleaseNotes = (dir) => {
  const notePath = path.join(dir, "INSTALLER-README.txt");
  const lines = [
    "Aola Star Hub Windows installer package",
    "",
    "This build uses a split NSIS installer because the app resources are too large for a single embedded setup.exe.",
    "Keep the generated setup.exe and the .nsis.7z package file in the same folder before running the installer.",
    "If the package file is moved away, the installer cannot install the app offline.",
    ""
  ];
  fs.writeFileSync(notePath, lines.join(os.EOL), "utf8");
};

const ensureBuilder = () => {
  if (!fs.existsSync(builderCli)) {
    console.error(`electron-builder was not found: ${builderCli}`);
    process.exit(1);
  }
};

const configureAsciiBuildEnv = (root) => {
  const sharedCacheRoot = isAsciiPath("C:\\electron_cache") && fs.existsSync("C:\\electron_cache")
    ? "C:\\electron_cache"
    : path.join(root, "electron-cache");
  const electronCache = path.join(sharedCacheRoot, "electron");
  const builderCache = sharedCacheRoot;
  fs.mkdirSync(electronCache, { recursive: true });
  fs.mkdirSync(builderCache, { recursive: true });
  process.env.ELECTRON_CACHE = electronCache;
  process.env.ELECTRON_BUILDER_CACHE = builderCache;
  process.env.npm_config_cache = path.join(root, "npm-cache");
};

const findRceditInWinCodeSignCache = (cacheRoot) => {
  const winCodeSignRoot = path.join(cacheRoot, "winCodeSign");
  if (!fs.existsSync(winCodeSignRoot)) return null;
  for (const entry of fs.readdirSync(winCodeSignRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const candidate = path.join(winCodeSignRoot, entry.name, "rcedit-x64.exe");
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
};

const extractRceditFromWinCodeSignArchive = (cacheRoot, toolsDir) => {
  const winCodeSignRoot = path.join(cacheRoot, "winCodeSign");
  const sevenZip = path.join(projectDir, "node_modules", "7zip-bin", "win", "x64", "7za.exe");
  if (!fs.existsSync(winCodeSignRoot) || !fs.existsSync(sevenZip)) return null;
  const archive = fs.readdirSync(winCodeSignRoot)
    .filter((name) => name.endsWith(".7z"))
    .map((name) => path.join(winCodeSignRoot, name))
    .find((file) => fs.statSync(file).size > 0);
  if (!archive) return null;
  fs.mkdirSync(toolsDir, { recursive: true });
  const result = spawnSync(sevenZip, [
    "x",
    "-bd",
    archive,
    "-orcedit-extract",
    "rcedit-x64.exe",
    "rcedit-ia32.exe",
    "-y"
  ], {
    cwd: toolsDir,
    stdio: "ignore",
    shell: false
  });
  const rcedit = path.join(toolsDir, "rcedit-extract", "rcedit-x64.exe");
  return result.status === 0 && fs.existsSync(rcedit) ? rcedit : null;
};

const prepareRcedit = (root) => {
  const cacheRoot = process.env.ELECTRON_BUILDER_CACHE || "C:\\electron_cache";
  const toolsDir = path.join(root, "winCodeSign-tools");
  const cachedRcedit = findRceditInWinCodeSignCache(cacheRoot);
  const sourceRcedit = cachedRcedit || extractRceditFromWinCodeSignArchive(cacheRoot, toolsDir);
  if (!sourceRcedit) {
    console.error("Could not find rcedit-x64.exe in the electron-builder winCodeSign cache.");
    console.error("Run npm run dist once to let electron-builder download winCodeSign, then run npm run dist again.");
    process.exit(1);
  }
  fs.mkdirSync(toolsDir, { recursive: true });
  const rcedit = path.join(toolsDir, "rcedit-x64.exe");
  fs.copyFileSync(sourceRcedit, rcedit);
  process.env.AOLA_RCEDIT_EXE = rcedit;
};

const pickBuildRoot = () => {
  const errors = [];
  for (const candidate of asciiRootCandidates) {
    const probe = path.join(candidate, ".write-test");
    try {
      fs.mkdirSync(candidate, { recursive: true });
      fs.writeFileSync(probe, "ok");
      fs.rmSync(probe, { force: true });
      return candidate;
    } catch (err) {
      errors.push(`${candidate}: ${err.code || err.message}`);
    }
  }
  console.error("No writable ASCII build directory was found.");
  console.error("Set AOLA_DIST_ASCII_ROOT to a writable English-only path, for example C:\\Users\\Public\\AolaStarHubBuild.");
  if (errors.length) console.error(errors.join(os.EOL));
  process.exit(1);
};

const runBuilder = (cwd) => {
  const result = spawnSync(process.execPath, [builderCli, "--win"], {
    cwd,
    stdio: "inherit",
    env: process.env,
    shell: false
  });
  if (result.error) {
    console.error(result.error);
    process.exit(1);
  }
  process.exitCode = result.status || 0;
};

ensureBuilder();

if (isAsciiPath(projectDir)) {
  configureAsciiBuildEnv(projectDir);
  prepareRcedit(projectDir);
  runBuilder(projectDir);
  if (!process.exitCode) writeReleaseNotes(releaseDir);
  process.exit(process.exitCode || 0);
}

const buildRoot = pickBuildRoot();
configureAsciiBuildEnv(buildRoot);
prepareRcedit(buildRoot);
const mirrorDir = path.join(buildRoot, "workspace");
const mirrorReleaseDir = path.join(mirrorDir, "release");
console.log(`Project path contains non-ASCII characters, building from ASCII mirror: ${mirrorDir}`);
fs.rmSync(mirrorDir, { recursive: true, force: true });
fs.mkdirSync(mirrorDir, { recursive: true });
const copiedCount = copyPackagedFiles(projectDir, mirrorDir);
console.log(`Copied ${copiedCount} packaged files into ASCII mirror.`);

const nodeModulesLink = path.join(mirrorDir, "node_modules");
if (fs.existsSync(path.join(projectDir, "node_modules"))) {
  try {
    fs.symlinkSync(path.join(projectDir, "node_modules"), nodeModulesLink, "junction");
  } catch (err) {
    console.error(`Failed to link node_modules into ASCII mirror: ${err.code || err.message}`);
    process.exit(1);
  }
}

runBuilder(mirrorDir);
if (process.exitCode) process.exit(process.exitCode);

prepareReleaseDirForCopy(releaseDir);
copyTree(mirrorReleaseDir, releaseDir);
writeReleaseNotes(releaseDir);
console.log(`Build artifacts copied back to: ${releaseDir}`);
