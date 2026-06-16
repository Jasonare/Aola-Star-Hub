const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

exports.default = async function afterPackWinIcon(context) {
  if (context.electronPlatformName !== "win32") return;

  const rcedit = process.env.AOLA_RCEDIT_EXE;
  if (!rcedit || !fs.existsSync(rcedit)) {
    throw new Error("AOLA_RCEDIT_EXE is not set or does not point to rcedit-x64.exe.");
  }

  const appInfo = context.packager.appInfo;
  const exePath = path.join(context.appOutDir, `${appInfo.productFilename}.exe`);
  const iconPath = path.join(context.packager.projectDir, "build", "Aola-Star-Hub-icon.ico");
  if (!fs.existsSync(exePath)) {
    throw new Error(`Windows app executable was not found: ${exePath}`);
  }
  if (!fs.existsSync(iconPath)) {
    throw new Error(`Windows icon was not found: ${iconPath}`);
  }

  const args = [
    exePath,
    "--set-icon",
    iconPath,
    "--set-version-string",
    "FileDescription",
    appInfo.productName,
    "--set-version-string",
    "ProductName",
    appInfo.productName,
    "--set-file-version",
    appInfo.shortVersion || appInfo.buildVersion,
    "--set-product-version",
    appInfo.shortVersionWindows || appInfo.getVersionInWeirdWindowsForm()
  ];

  const result = spawnSync(rcedit, args, { stdio: "inherit", shell: false });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`rcedit failed with exit code ${result.status}`);
  }
};
