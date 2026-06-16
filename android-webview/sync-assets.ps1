param(
  [string]$ProjectRoot = ".."
)

$ErrorActionPreference = 'Stop'
$srcRoot = Resolve-Path -LiteralPath $ProjectRoot
$dstRoot = Join-Path $PSScriptRoot "app/src/main/assets/www"

if (Test-Path -LiteralPath $dstRoot) {
  Remove-Item -LiteralPath $dstRoot -Recurse -Force
}
New-Item -ItemType Directory -Path $dstRoot | Out-Null

$copyFiles = @(
  "aola-star.html",
  "sw.js",
  "aola-star-app.js",
  "aola-star-crash.js",
  "aola-dex-1-100.js",
  "aola-species-data.js",
  "aola-skill-data.js",
  "aola-skill-effects-hardcoded.js",
  "aola-evolution-chains.js",
  "pet-action-layout.json",
  "aola_pet_skill_extract.json",
  "aola_pet_skill_extract_skills.json",
  "属性克制.jpg"
)

foreach ($f in $copyFiles) {
  $src = Join-Path $srcRoot $f
  if (Test-Path -LiteralPath $src) {
    Copy-Item -LiteralPath $src -Destination (Join-Path $dstRoot $f) -Force
  }
}

$dirs = @(
  "vendor",
  "ui",
  "type",
  "type-transparent",
  "fight-ui",
  "BGM",
  "time-tunnel-environments",
  "pet-action",
  "pet-img",
  "pet-state",
  "skill-effect",
  "skill-effect-fullscreen"
)
foreach ($d in $dirs) {
  $srcDir = Join-Path $srcRoot $d
  if (Test-Path -LiteralPath $srcDir) {
    Copy-Item -LiteralPath $srcDir -Destination (Join-Path $dstRoot $d) -Recurse -Force
  }
}

Write-Output "Synced web assets to: $dstRoot"
