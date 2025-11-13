# 🔧 Troubleshooting Guide

Common issues and solutions for the Real-Time Edge Detection project.

---

## 🏗️ Build Issues

### Issue: "OpenCV not found"

```
CMake Error: find_package(OpenCV REQUIRED) failed
Could not find a package configuration file provided by "OpenCV"
```

**Solutions:**

1. **Verify OpenCV SDK path**

   ```properties
   # Check local.properties
   opencv.dir=C:\\opencv\\OpenCV-android-sdk\\sdk
   ```

2. **Download OpenCV**

   - Visit: https://opencv.org/releases/
   - Download Android SDK (not iOS or other platforms)
   - Extract completely before configuring path

3. **Check directory structure**

   ```
   opencv/sdk/
   ├── native/
   │   └── jni/
   │       ├── OpenCVConfig.cmake  ← Must exist
   │       ├── abi-armeabi-v7a/
   │       └── abi-arm64-v8a/
   └── java/
   ```

4. **Use absolute paths**
   ```gradle
   // app/build.gradle
   externalNativeBuild {
       cmake {
           arguments "-DOpenCV_DIR=C:/opencv/sdk/native/jni"
       }
   }
   ```

---

### Issue: "NDK not configured"

```
NDK is not configured. Download it with SDK manager.
```

**Solution:**

```
Android Studio → Tools → SDK Manager → SDK Tools
✓ NDK (Side by side)
✓ CMake
Click Apply and wait for download
```

---

### Issue: "Gradle sync failed"

```
Failed to apply plugin 'com.android.application'
```

**Solutions:**

1. **Update Gradle version**

   ```properties
   # gradle/wrapper/gradle-wrapper.properties
   distributionUrl=https\://services.gradle.org/distributions/gradle-8.2-bin.zip
   ```

2. **Clear Gradle cache**

   ```bash
   ./gradlew clean --refresh-dependencies

   # Or manually delete
   rm -rf .gradle/
   rm -rf ~/.gradle/caches/
   ```

3. **Invalidate Android Studio caches**
   ```
   File → Invalidate Caches → Invalidate and Restart
   ```

---

### Issue: "CMake executable not found"

```
CMake Error: CMake was unable to find a build program corresponding to "Ninja"
```

**Solution:**

```
SDK Manager → SDK Tools → ✓ CMake (version 3.22.1 or later)
```

---

## 📱 Runtime Issues

### Issue: Camera permission denied

```
java.lang.SecurityException: Permission denied
```

**Solutions:**

1. **Grant permission manually**

   ```
   Settings → Apps → Edge Detection → Permissions → Camera → Allow
   ```

2. **Check AndroidManifest.xml**

   ```xml
   <uses-permission android:name="android.permission.CAMERA" />
   <uses-feature android:name="android.hardware.camera2" android:required="true" />
   ```

3. **Request at runtime** (already implemented in MainActivity.kt)

---

### Issue: Black screen / No camera preview

```
App starts but shows black screen
```

**Solutions:**

1. **Check Logcat for errors**

   ```bash
   adb logcat | grep -E "Camera|NativeLib|MainActivity"
   ```

2. **Verify Camera2 support**

   ```bash
   adb shell getprop ro.product.model
   # Camera2 requires Android 5.0+ (API 21+)
   # App requires Android 7.0+ (API 24+)
   ```

3. **Test on physical device**

   - Emulators have limited Camera2 support
   - Use a real Android phone/tablet

4. **Check camera availability**
   ```kotlin
   val cameraManager = getSystemService(Context.CAMERA_SERVICE) as CameraManager
   val cameraIdList = cameraManager.cameraIdList
   Log.d(TAG, "Available cameras: ${cameraIdList.size}")
   ```

---

### Issue: App crashes on launch

```
java.lang.UnsatisfiedLinkError: dlopen failed: library "libnative-lib.so" not found
```

**Solutions:**

1. **Rebuild native library**

   ```bash
   ./gradlew clean
   ./gradlew :app:externalNativeBuildDebug
   ./gradlew assembleDebug
   ```

2. **Check ABI filters**

   ```gradle
   // app/build.gradle
   android {
       defaultConfig {
           ndk {
               abiFilters 'armeabi-v7a', 'arm64-v8a'
           }
       }
   }
   ```

3. **Verify APK contains libraries**
   ```bash
   unzip -l app/build/outputs/apk/debug/app-debug.apk | grep ".so"
   # Should show:
   # lib/armeabi-v7a/libnative-lib.so
   # lib/arm64-v8a/libnative-lib.so
   # lib/armeabi-v7a/libopencv_java4.so
   # lib/arm64-v8a/libopencv_java4.so
   ```

---

### Issue: "Out of memory" error

```
java.lang.OutOfMemoryError: Failed to allocate a 12441612 byte allocation
```

**Solutions:**

1. **Reduce image resolution**

   ```kotlin
   // CameraHelper.kt
   private const val IMAGE_WIDTH = 640  // Reduce if needed
   private const val IMAGE_HEIGHT = 480
   ```

2. **Increase heap size**

   ```xml
   <!-- AndroidManifest.xml -->
   <application
       android:largeHeap="true"
       ...>
   ```

3. **Optimize frame processing**
   ```cpp
   // native-lib.cpp
   // Process every Nth frame
   static int frameCounter = 0;
   if (++frameCounter % 2 != 0) {
       return input_;  // Skip processing
   }
   ```

---

### Issue: Low FPS performance

```
Frame rate below 20 FPS
```

**Solutions:**

1. **Optimize Canny parameters**

   ```cpp
   // native-lib.cpp
   // Reduce blur kernel size
   cv::GaussianBlur(gray, blurred, cv::Size(3, 3), 1.0);  // Was 5x5

   // Adjust thresholds
   cv::Canny(blurred, edges, 100, 200);  // Higher = less processing
   ```

2. **Reduce resolution**

   ```kotlin
   private const val IMAGE_WIDTH = 480   // Was 640
   private const val IMAGE_HEIGHT = 360  // Was 480
   ```

3. **Enable GPU optimization**

   ```gradle
   android {
       defaultConfig {
           renderscriptTargetApi 24
           renderscriptSupportModeEnabled true
       }
   }
   ```

4. **Profile with Android Profiler**
   ```
   View → Tool Windows → Profiler
   Monitor CPU, Memory, and Frame rendering
   ```

---

## 🌐 Web Viewer Issues

### Issue: "Cannot GET /"

```
404 - File not found
```

**Solutions:**

1. **Start HTTP server in correct directory**

   ```bash
   cd web  # Must be in web directory!
   python -m http.server 8000
   ```

2. **Check index.html exists**
   ```bash
   ls web/index.html  # Should exist
   ```

---

### Issue: TypeScript not compiling

```
Error: Cannot find module 'typescript'
```

**Solutions:**

1. **Install dependencies**

   ```bash
   cd web
   npm install
   ```

2. **Rebuild TypeScript**

   ```bash
   npm run build
   ```

3. **Check tsconfig.json**
   ```json
   {
     "compilerOptions": {
       "target": "ES6",
       "outDir": "./dist"
     }
   }
   ```

---

### Issue: "Module not found" errors

```
GET http://localhost:8000/dist/main.js 404
```

**Solutions:**

1. **Build TypeScript first**

   ```bash
   npm run build
   # Creates web/dist/main.js
   ```

2. **Check file exists**
   ```bash
   ls web/dist/main.js
   ```

---

### Issue: Image not loading

```
GET http://localhost:8000/assets/sample.svg 404
```

**Solution:**

```bash
# Verify file exists
ls web/assets/sample.svg

# Check file permissions (Linux/Mac)
chmod 644 web/assets/sample.svg
```

---

## 🔐 Permission Issues

### Issue: "INSTALL_FAILED_UPDATE_INCOMPATIBLE"

```
Installation failed with message INSTALL_FAILED_UPDATE_INCOMPATIBLE
```

**Solution:**

```bash
# Uninstall previous version
adb uninstall com.example.realtime

# Reinstall
adb install app/build/outputs/apk/debug/app-debug.apk
```

---

### Issue: USB debugging not working

```
error: device unauthorized
```

**Solutions:**

1. **Accept RSA key on device**

   - Unlock phone
   - Look for "Allow USB debugging?" dialog
   - Check "Always allow from this computer"
   - Click OK

2. **Revoke and retry**

   ```bash
   adb kill-server
   adb start-server
   adb devices
   ```

3. **Check USB mode**
   - Phone must be in "File Transfer" or "PTP" mode
   - Not "Charging only"

---

## 🐞 Debugging Tips

### Enable Detailed Logging

#### Android Logcat

```bash
# Full app logs
adb logcat | grep "com.example.realtime"

# Native library logs
adb logcat | grep "NativeLib"

# OpenCV logs
adb logcat | grep "OpenCV"

# Clear and monitor
adb logcat -c && adb logcat -s NativeLib:D MainActivity:D
```

#### Native C++ Debugging

```cpp
// native-lib.cpp
#define TAG "NativeLib"
#define LOGD(...) __android_log_print(ANDROID_LOG_DEBUG, TAG, __VA_ARGS__)

LOGD("Processing frame: %dx%d", width, height);
LOGD("Canny thresholds: %.0f - %.0f", lowThresh, highThresh);
```

#### Kotlin Debugging

```kotlin
// MainActivity.kt
private val TAG = "MainActivity"

Log.d(TAG, "FPS: $currentFPS")
Log.d(TAG, "Frame size: ${frameBytes.size} bytes")
```

---

### Performance Profiling

#### Android Studio Profiler

```
1. Run app in debug mode
2. View → Tool Windows → Profiler
3. Select device and process
4. Monitor:
   - CPU usage
   - Memory allocation
   - Network activity
   - Frame rendering time
```

#### Systrace

```bash
# Capture system trace
python systrace.py --time=10 -o trace.html sched freq idle am wm gfx view \
    dalvik camera hal res

# Open trace.html in Chrome
```

---

## 📊 Common Error Messages

| Error                                       | Cause                         | Solution                                      |
| ------------------------------------------- | ----------------------------- | --------------------------------------------- |
| `SecurityException: Permission denied`      | Camera permission not granted | Grant permission in Settings                  |
| `UnsatisfiedLinkError: libnative-lib.so`    | Native library not built      | Run `./gradlew :app:externalNativeBuildDebug` |
| `OutOfMemoryError`                          | Image too large               | Reduce resolution or increase heap            |
| `IllegalStateException: Camera is in use`   | Camera already open           | Close other camera apps                       |
| `FileNotFoundException: OpenCVConfig.cmake` | OpenCV not configured         | Update `local.properties` with correct path   |

---

## 🆘 Still Having Issues?

1. **Clean and Rebuild**

   ```bash
   ./gradlew clean
   rm -rf .gradle/ build/
   ./gradlew assembleDebug
   ```

2. **Check System Requirements**

   - Android Studio Arctic Fox or later
   - Android SDK Platform 34
   - NDK v25.1.8937393 or later
   - OpenCV Android SDK 4.x
   - Physical Android device (not emulator)

3. **Review Documentation**

   - README.md - Project overview
   - BUILD_INSTRUCTIONS.md - Detailed build steps
   - QUICK_START.md - Fast setup guide

4. **Check GitHub Issues**

   - https://github.com/AY-10/realtime-edge-detection/issues

5. **Enable Verbose Logging**
   ```bash
   ./gradlew assembleDebug --info --stacktrace
   ```

---

**Need more help? Create an issue on GitHub with:**

- Error message / stack trace
- Android Studio version
- Device model and Android version
- Steps to reproduce the problem
