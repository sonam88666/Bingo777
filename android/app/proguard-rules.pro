# ProGuard / R8 rules for Bingo777 Pro Android APK
# Optimized for minimal APK size with full Capacitor WebView compatibility

# Preserve Capacitor core and plugins
-keep class com.getcapacitor.** { *; }
-keep interface com.getcapacitor.** { *; }
-keep class * extends com.getcapacitor.Plugin { *; }
-keepclassmembers class * extends com.getcapacitor.Plugin {
    public *;
}
-keep public class * extends com.getcapacitor.BridgeActivity
-keep public class * extends com.getcapacitor.BridgeFragment
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Webview JS Interface
-keepclassmembers class * extends android.webkit.WebViewClient {
    public *;
}
-keepclassmembers class * extends android.webkit.WebChromeClient {
    public *;
}

# Strip debug attributes and source lines to minimize DEX footprint
-dontusemixedcaseclassnames
-dontskipnonpubliclibraryclasses
-verbose
