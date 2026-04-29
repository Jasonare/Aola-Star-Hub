# Aola Star Hub Android (WebView)

## 说明
这是为当前静态前端项目生成的 Android WebView 包装工程。

## 目录
- app/src/main/assets/www: 打包进 APK 的前端资源
- sync-assets.ps1: 从项目根目录同步资源到 assets/www

## 使用步骤
1. 在项目根目录执行：
   powershell -ExecutionPolicy Bypass -File .\android-webview\sync-assets.ps1
2. 用 Android Studio 打开 `android-webview` 目录。
3. 等待 Gradle 同步完成。
4. Build > Build APK(s)。

## 注意
- 当前页面使用了 `https://cdn.tailwindcss.com`，需联网加载。
- 若希望离线可用，请把 Tailwind 产物改为本地静态 CSS 并同步到 assets/www。
