package com.aolastar.hub;

import android.annotation.SuppressLint;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.activity.OnBackPressedCallback;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;
import androidx.webkit.WebSettingsCompat;
import androidx.webkit.WebViewFeature;

import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

public class MainActivity extends AppCompatActivity {

    private WebView webView;
    private ValueCallback<Uri[]> filePathCallback;
    private ActivityResultLauncher<Intent> fileChooserLauncher;
    private ActivityResultLauncher<Intent> saveImportLauncher;
    private String exportFilename;
    private String exportMimeType;
    private StringBuilder exportBase64Builder;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        applyFullscreenWebViewWindow();
        setContentView(R.layout.activity_main);

        fileChooserLauncher = registerForActivityResult(new ActivityResultContracts.StartActivityForResult(), result -> {
            if (filePathCallback == null) return;
            Uri[] uris = null;
            if (result.getResultCode() == RESULT_OK && result.getData() != null) {
                Intent data = result.getData();
                if (data.getClipData() != null) {
                    int count = data.getClipData().getItemCount();
                    uris = new Uri[count];
                    for (int i = 0; i < count; i++) uris[i] = data.getClipData().getItemAt(i).getUri();
                } else if (data.getData() != null) {
                    uris = new Uri[] { data.getData() };
                }
            }
            filePathCallback.onReceiveValue(uris);
            filePathCallback = null;
        });

        saveImportLauncher = registerForActivityResult(new ActivityResultContracts.StartActivityForResult(), result -> {
            if (result.getResultCode() != RESULT_OK || result.getData() == null || result.getData().getData() == null) return;
            try {
                String text = readUriText(result.getData().getData());
                runOnUiThread(() -> webView.evaluateJavascript("window.__aolaAndroidReceiveSaveJson && window.__aolaAndroidReceiveSaveJson(" + JSONObject.quote(text) + ")", null));
            } catch (Exception e) {
                runOnUiThread(() -> webView.evaluateJavascript("window.__aolaAndroidImportFailed && window.__aolaAndroidImportFailed(" + JSONObject.quote(e.getMessage()) + ")", null));
            }
        });

        webView = findViewById(R.id.webview);
        webView.setBackgroundColor(Color.BLACK);
        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowFileAccessFromFileURLs(true);
        settings.setAllowUniversalAccessFromFileURLs(true);
        settings.setAllowContentAccess(true);
        settings.setDatabaseEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);

        if (WebViewFeature.isFeatureSupported(WebViewFeature.ALGORITHMIC_DARKENING)) {
            WebSettingsCompat.setAlgorithmicDarkeningAllowed(settings, false);
        }

        webView.addJavascriptInterface(new AndroidBridge(), "AolaAndroid");
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (filePathCallback != null) filePathCallback.onReceiveValue(null);
                filePathCallback = callback;
                try {
                    fileChooserLauncher.launch(params.createIntent());
                } catch (Exception e) {
                    filePathCallback = null;
                    return false;
                }
                return true;
            }
        });
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return false;
            }
        });

        webView.loadUrl("file:///android_asset/www/aola-star.html");

        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack();
                } else {
                    finish();
                }
            }
        });
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) applyFullscreenWebViewWindow();
    }

    private void applyFullscreenWebViewWindow() {
        Window window = getWindow();
        window.setStatusBarColor(Color.BLACK);
        window.setNavigationBarColor(Color.BLACK);
        window.addFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            WindowManager.LayoutParams params = window.getAttributes();
            params.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
            window.setAttributes(params);
        }

        View decorView = window.getDecorView();
        decorView.setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_FULLSCREEN
                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
        );
    }

    private String readUriText(Uri uri) throws Exception {
        try (InputStream input = getContentResolver().openInputStream(uri);
             ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            if (input == null) throw new IllegalStateException("无法读取文件。");
            byte[] buffer = new byte[8192];
            int len;
            while ((len = input.read(buffer)) >= 0) output.write(buffer, 0, len);
            return output.toString(StandardCharsets.UTF_8.name());
        }
    }

    private String writeDownloadFile(String filename, String mimeType, byte[] data) throws Exception {
        ContentResolver resolver = getContentResolver();
        ContentValues values = new ContentValues();
        values.put(MediaStore.Downloads.DISPLAY_NAME, filename);
        values.put(MediaStore.Downloads.MIME_TYPE, mimeType);
        values.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/Aola Star Hub");
        Uri uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
        if (uri == null) throw new IllegalStateException("无法创建导出文件。");
        try (OutputStream output = resolver.openOutputStream(uri)) {
            if (output == null) throw new IllegalStateException("无法写入导出文件。");
            output.write(data);
        }
        return uri.toString();
    }

    public class AndroidBridge {
        @JavascriptInterface
        public String exportSaveJson(String filename, String text) {
            try {
                return "OK|" + writeDownloadFile(filename, "application/json", text.getBytes(StandardCharsets.UTF_8));
            } catch (Exception e) {
                return "ERR|" + e.getMessage();
            }
        }

        @JavascriptInterface
        public String exportBlobBase64(String filename, String mimeType, String base64) {
            try {
                byte[] data = Base64.decode(base64, Base64.DEFAULT);
                return "OK|" + writeDownloadFile(filename, mimeType, data);
            } catch (Exception e) {
                return "ERR|" + e.getMessage();
            }
        }

        @JavascriptInterface
        public synchronized String beginBlobExport(String filename, String mimeType) {
            exportFilename = filename;
            exportMimeType = mimeType;
            exportBase64Builder = new StringBuilder();
            return "OK";
        }

        @JavascriptInterface
        public synchronized String appendBlobExportBase64(String chunk) {
            if (exportBase64Builder == null) return "ERR|导出尚未开始。";
            exportBase64Builder.append(chunk);
            return "OK";
        }

        @JavascriptInterface
        public synchronized String finishBlobExportBase64() {
            if (exportBase64Builder == null) return "ERR|导出尚未开始。";
            try {
                byte[] data = Base64.decode(exportBase64Builder.toString(), Base64.DEFAULT);
                String uri = writeDownloadFile(exportFilename, exportMimeType, data);
                exportFilename = null;
                exportMimeType = null;
                exportBase64Builder = null;
                return "OK|" + uri;
            } catch (Exception e) {
                exportFilename = null;
                exportMimeType = null;
                exportBase64Builder = null;
                return "ERR|" + e.getMessage();
            }
        }

        @JavascriptInterface
        public void importSaveJson() {
            runOnUiThread(() -> {
                Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
                intent.addCategory(Intent.CATEGORY_OPENABLE);
                intent.setType("*/*");
                intent.putExtra(Intent.EXTRA_MIME_TYPES, new String[] { "application/json", "text/plain", "application/octet-stream" });
                saveImportLauncher.launch(intent);
            });
        }
    }
}
