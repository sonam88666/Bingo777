package com.bingo777.pro.game;

import android.graphics.Color;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        try {
            if (getWindow() != null && getWindow().getDecorView() != null) {
                getWindow().getDecorView().setBackgroundColor(Color.parseColor("#020617"));
            }
            if (this.bridge != null && this.bridge.getWebView() != null) {
                WebView webView = this.bridge.getWebView();
                webView.setBackgroundColor(Color.parseColor("#020617"));

                WebSettings settings = webView.getSettings();
                if (settings != null) {
                    settings.setJavaScriptEnabled(true);
                    settings.setDomStorageEnabled(true);
                    settings.setDatabaseEnabled(true);
                    settings.setAllowFileAccess(true);
                    settings.setAllowContentAccess(true);
                    settings.setLoadWithOverviewMode(true);
                    settings.setUseWideViewPort(true);
                    settings.setCacheMode(WebSettings.LOAD_DEFAULT);
                }

                // Clear stale HTTP/asset cache from older APK builds while keeping localStorage intact
                webView.clearCache(true);

                // Unregister any stale Service Worker or CacheStorage that could serve an outdated index.html
                webView.postDelayed(() -> {
                    try {
                        webView.evaluateJavascript(
                            "(function(){try{if('serviceWorker' in navigator){navigator.serviceWorker.getRegistrations().then(function(r){r.forEach(function(x){x.unregister();});});}if('caches' in window){caches.keys().then(function(k){k.forEach(function(c){caches.delete(c);});});}}catch(e){}})();",
                            null
                        );
                    } catch (Exception ignored) {}
                }, 300);
            }
        } catch (Exception ignored) {}
    }
}
