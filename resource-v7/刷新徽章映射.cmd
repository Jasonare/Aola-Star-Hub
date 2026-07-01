@echo off
setlocal
cd /d "%~dp0"
node "%~dp0refresh-badge-manifest.js"
echo.
if errorlevel 1 (
  echo 刷新失败，请检查上面的报错信息。
) else (
  echo 刷新完成，manifest 已更新。
)
pause
