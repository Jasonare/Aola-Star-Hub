const crypto = require("crypto");
const fs = require("fs");
const http = require("http");
const https = require("https");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DEFAULT_CONFIG = path.join(ROOT, "object-storage.config.json");
const DEFAULT_OUT = path.join(ROOT, "asset-url-map.json");

const CONTENT_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".swf": "application/x-shockwave-flash",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".xml": "application/xml; charset=utf-8"
};

const usage = () => {
  console.log([
    "Usage:",
    "  node scripts/upload-assets-to-object-storage.js --source <dir> [options]",
    "",
    "Options:",
    "  --source <dir>       Directory to upload.",
    "  --config <file>      Object storage config JSON. Default: object-storage.config.json",
    "  --out <file>         Output resource URL map JSON. Default: asset-url-map.json",
    "  --prefix <path>      Remote object key prefix. Overrides config.remotePrefix.",
    "  --concurrency <n>    Upload concurrency. Default: 6",
    "  --flush-every <n>    Write the URL map after every n completed files. Default: 100",
    "  --force              Re-upload files even when they already exist in the URL map.",
    "  --dry-run           Only generate the URL map, do not upload.",
    "  --help              Show this message."
  ].join("\n"));
};

const parseArgs = (argv) => {
  const args = {
    config: DEFAULT_CONFIG,
    out: DEFAULT_OUT,
    concurrency: 6,
    flushEvery: 100,
    force: false,
    dryRun: false
  };
  for (let i = 2; i < argv.length; i += 1) {
    const name = argv[i];
    if (name === "--dry-run") {
      args.dryRun = true;
    } else if (name === "--force") {
      args.force = true;
    } else if (name === "--help" || name === "-h") {
      args.help = true;
    } else if (name.startsWith("--")) {
      const key = name.slice(2);
      const value = argv[i + 1];
      if (!value || value.startsWith("--")) {
        throw new Error(`Missing value for ${name}`);
      }
      args[key] = value;
      i += 1;
    } else {
      throw new Error(`Unknown argument: ${name}`);
    }
  }
  args.concurrency = Math.max(1, Number(args.concurrency) || 6);
  args.flushEvery = Math.max(1, Number(args.flushEvery) || 100);
  return args;
};

const toPosixPath = (value) => value.replace(/\\/g, "/");

const encodeKey = (key) => key
  .split("/")
  .map((part) => encodeURIComponent(part))
  .join("/");

const trimSlashes = (value) => String(value || "").replace(/^\/+|\/+$/g, "");

const normalizePrefix = (value) => {
  const prefix = trimSlashes(value);
  return prefix ? `${prefix}/` : "";
};

const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));

const listFiles = (dir) => {
  const files = [];
  const stack = [dir];
  while (stack.length) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true })
      .sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(full);
      } else if (entry.isFile()) {
        files.push({
          absolutePath: full,
          relativePath: toPosixPath(path.relative(dir, full))
        });
      }
    }
  }
  return files.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
};

const getMapKey = (sourceDir, file) => {
  const relFromRoot = toPosixPath(path.relative(ROOT, file.absolutePath));
  if (relFromRoot && !relFromRoot.startsWith("../") && relFromRoot !== "..") {
    return relFromRoot;
  }
  return file.relativePath;
};

const getContentType = (file, config) => {
  const overrides = config.contentTypeOverrides || {};
  const ext = path.extname(file).toLowerCase();
  return overrides[ext] || CONTENT_TYPES[ext] || "application/octet-stream";
};

const buildAliyunOssObjectUrl = (config, key) => {
  const endpoint = new URL(config.endpoint);
  const encodedKey = encodeKey(key);
  endpoint.hostname = `${config.bucket}.${endpoint.hostname}`;
  endpoint.pathname = `/${encodedKey}`;
  return endpoint;
};

const signAliyunOssRequest = ({ config, method, url, key, body, contentType }) => {
  const date = new Date().toUTCString();
  const contentMd5 = crypto.createHash("md5").update(body).digest("base64");
  const headers = {
    "cache-control": config.cacheControl || "",
    "content-length": String(body.length),
    "content-md5": contentMd5,
    "content-type": contentType,
    "date": date,
    "host": url.host
  };
  const canonicalResource = `/${config.bucket}/${key}`;
  const stringToSign = [
    method,
    contentMd5,
    contentType,
    date,
    canonicalResource
  ].join("\n");
  const signature = crypto
    .createHmac("sha1", config.accessKeySecret)
    .update(stringToSign)
    .digest("base64");
  headers.authorization = `OSS ${config.accessKeyId}:${signature}`;
  return headers;
};

const requestPut = (url, headers, body) => new Promise((resolve, reject) => {
  const client = url.protocol === "http:" ? http : https;
  const req = client.request(url, { method: "PUT", headers }, (res) => {
    const chunks = [];
    res.on("data", (chunk) => chunks.push(chunk));
    res.on("end", () => {
      const text = Buffer.concat(chunks).toString("utf8");
      if (res.statusCode >= 200 && res.statusCode < 300) {
        resolve();
        return;
      }
      const endpointMatch = text.match(/<Endpoint>([^<]+)<\/Endpoint>/);
      const hint = endpointMatch
        ? `\nHint: this bucket belongs to ${endpointMatch[1]}. Set config.endpoint to https://${endpointMatch[1]}.`
        : "";
      reject(new Error(`PUT ${url.href} failed with ${res.statusCode}: ${text.slice(0, 500)}${hint}`));
    });
  });
  req.on("error", reject);
  req.end(body);
});

const uploadAliyunOssObject = async ({ config, file, key }) => {
  const body = fs.readFileSync(file.absolutePath);
  const url = buildAliyunOssObjectUrl(config, key);
  const contentType = getContentType(file.relativePath, config);
  const headers = signAliyunOssRequest({
    config,
    method: "PUT",
    url,
    key,
    body,
    contentType
  });
  await requestPut(url, headers, body);
};

const assertConfig = (config) => {
  const required = [
    "provider",
    "endpoint",
    "bucket",
    "accessKeyId",
    "accessKeySecret"
  ];
  const missing = required.filter((key) => !config[key]);
  if (missing.length) {
    throw new Error(`Object storage config is incomplete: ${missing.join(", ")}`);
  }
  if (config.provider !== "aliyun-oss") {
    throw new Error(`Unsupported provider: ${config.provider}. Current script supports aliyun-oss.`);
  }
};

const readExistingUrlMap = (file) => {
  if (!fs.existsSync(file)) return {};
  const data = readJson(file);
  return data && typeof data === "object" && !Array.isArray(data) ? data : {};
};

const writeUrlMap = (file, urlMap) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tempFile = `${file}.tmp`;
  fs.writeFileSync(tempFile, `${JSON.stringify(urlMap, null, 2)}\n`, "utf8");
  fs.renameSync(tempFile, file);
};

const makeUrlMap = (files, config, prefix, sourceDir) => {
  const baseUrl = String(config.publicBaseUrl || "").replace(/\/+$/g, "");
  return Object.fromEntries(files.map((file) => {
    const mapKey = getMapKey(sourceDir, file);
    const objectKey = `${prefix}${mapKey}`;
    const url = baseUrl ? `${baseUrl}/${encodeKey(objectKey)}` : objectKey;
    return [mapKey, url];
  }));
};

const runQueue = async (items, concurrency, worker) => {
  let next = 0;
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (next < items.length) {
      const index = next;
      next += 1;
      await worker(items[index], index);
    }
  });
  await Promise.all(workers);
};

const main = async () => {
  const args = parseArgs(process.argv);
  if (args.help) {
    usage();
    return;
  }
  if (!args.source) {
    throw new Error("Missing required argument: --source <dir>");
  }

  const sourceDir = path.resolve(ROOT, args.source);
  if (!fs.existsSync(sourceDir) || !fs.statSync(sourceDir).isDirectory()) {
    throw new Error(`Source directory does not exist: ${sourceDir}`);
  }
  if (!fs.existsSync(args.config)) {
    throw new Error(`Config file does not exist: ${args.config}. Copy object-storage.config.example.json first.`);
  }

  const config = readJson(args.config);
  const prefix = normalizePrefix(args.prefix !== undefined ? args.prefix : config.remotePrefix);
  const files = listFiles(sourceDir);
  const newUrlMap = makeUrlMap(files, config, prefix, sourceDir);
  const outFile = path.resolve(ROOT, args.out);
  const urlMap = readExistingUrlMap(outFile);
  let completedSinceFlush = 0;
  let uploadedCount = 0;
  let skippedCount = 0;
  let writeChain = Promise.resolve();

  const flushUrlMap = async (reason) => {
    writeChain = writeChain.then(() => {
      writeUrlMap(outFile, urlMap);
      if (reason) {
        console.log(`Resource URL map checkpoint written to: ${outFile} (${reason})`);
      }
    });
    return writeChain;
  };

  const markCompleted = async (mapKey, url) => {
    urlMap[mapKey] = url;
    completedSinceFlush += 1;
    if (completedSinceFlush >= args.flushEvery) {
      const flushed = completedSinceFlush;
      completedSinceFlush = 0;
      await flushUrlMap(`${flushed} completed since last checkpoint`);
    }
  };

  if (!args.dryRun) {
    assertConfig(config);
    await runQueue(files, args.concurrency, async (file, index) => {
      const mapKey = getMapKey(sourceDir, file);
      const key = `${prefix}${mapKey}`;
      if (!args.force && urlMap[mapKey]) {
        skippedCount += 1;
        await markCompleted(mapKey, newUrlMap[mapKey]);
        console.log(`[${index + 1}/${files.length}] skipped ${file.relativePath} (already in URL map)`);
        return;
      }
      await uploadAliyunOssObject({ config, file, key });
      uploadedCount += 1;
      await markCompleted(mapKey, newUrlMap[mapKey]);
      console.log(`[${index + 1}/${files.length}] uploaded ${file.relativePath} -> ${key}`);
    });
  } else {
    console.log(`Dry run enabled. ${files.length} file(s) scanned, upload skipped.`);
    Object.assign(urlMap, newUrlMap);
  }

  Object.assign(urlMap, newUrlMap);
  await flushUrlMap("final");
  console.log(`Resource URL map written to: ${outFile} (${uploadedCount} uploaded, ${skippedCount} skipped, ${Object.keys(newUrlMap).length} scanned, ${Object.keys(urlMap).length} total)`);
};

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
