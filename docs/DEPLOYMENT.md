# 📦 Deployment Guide

This guide covers deploying the Synagogue Calendar app to various platforms.

## Table of Contents

- [Web Deployment](#web-deployment)
  - [Netlify](#netlify)
  - [Vercel](#vercel)
  - [GitHub Pages](#github-pages)
  - [Traditional Web Server](#traditional-web-server)
- [Android APK](#android-apk)
  - [EAS Build (Recommended)](#eas-build-recommended)
  - [Local Build with Android Studio](#local-build-with-android-studio)
- [iOS Deployment](#ios-deployment)
  - [EAS Build & App Store](#eas-build--app-store)
  - [TestFlight](#testflight)

---

## 🌐 Web Deployment

The app can be deployed to any web hosting service. Here are the most popular options:

### Netlify

Netlify offers free hosting with automatic SSL and continuous deployment.

#### Step 1: Install Netlify CLI

```bash
yarn global add netlify-cli
```

#### Step 2: Build the Web Version

```bash
npx expo export --platform web
```

This creates a `dist` folder with your web app.

#### Step 3: Deploy to Netlify

```bash
netlify deploy --dir dist --prod
```

Or use the Netlify dashboard:

1. Go to [netlify.com](https://netlify.com)
2. Drag and drop the `dist` folder
3. Your site is live!

#### Optional: Continuous Deployment

1. Connect your GitHub repository to Netlify
2. Set build command: `npx expo export --platform web`
3. Set publish directory: `dist`
4. Every push to main branch auto-deploys!

---

### Vercel

Vercel provides excellent performance and automatic scaling.

#### Step 1: Install Vercel CLI

```bash
yarn global add vercel
```

#### Step 2: Build the Web Version

```bash
npx expo export --platform web
```

#### Step 3: Deploy

```bash
vercel --prod
```

Follow the prompts to set up your project.

#### Optional: Continuous Deployment

1. Connect your GitHub repository at [vercel.com](https://vercel.com)
2. Vercel automatically detects Expo projects
3. Every push deploys automatically!

---

### GitHub Pages

Free hosting directly from your GitHub repository.

#### Step 1: Update package.json

Add your GitHub Pages URL:

```json
{
  "homepage": "https://yourusername.github.io/synagogue-calander"
}
```

#### Step 2: Install gh-pages

```bash
yarn add --dev gh-pages
```

#### Step 3: Add Deploy Script

Add to `package.json` scripts:

```json
{
  "scripts": {
    "deploy": "expo export --platform web && gh-pages -d dist"
  }
}
```

#### Step 4: Deploy

```bash
yarn deploy
```

Your app will be live at `https://yourusername.github.io/synagogue-calander`

---

### Traditional Web Server

Deploy to any web hosting service (Bluehost, HostGator, etc.)

#### Step 1: Build the Web Version

```bash
npx expo export --platform web
```

#### Step 2: Upload Files

Upload the contents of the `dist` folder to your web server using:

- **FTP/SFTP** - Using FileZilla, Cyberduck, etc.
- **cPanel File Manager** - Upload via hosting control panel
- **SSH** - Use `scp` or `rsync` commands

#### Step 3: Configure Server

Make sure your server:

- Serves `index.html` for all routes (for React Router)
- Has HTTPS enabled (recommended)

Example `.htaccess` for Apache:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

---

## 📱 Android APK

### EAS Build (Recommended)

EAS (Expo Application Services) builds your app in the cloud - no local Android Studio needed!

#### Step 1: Install EAS CLI

```bash
yarn global add eas-cli
```

#### Step 2: Login to Expo

```bash
eas login
```

Create a free account at [expo.dev](https://expo.dev) if you don't have one.

#### Step 3: Configure Build

```bash
eas build:configure
```

This creates/updates `eas.json` configuration file.

#### Step 4: Build APK

For production (release build):

```bash
eas build --platform android --profile production
```

For testing (preview build):

```bash
eas build --platform android --profile preview
```

#### Step 5: Download APK

After the build completes (5-15 minutes):

1. You'll receive a link to download the APK
2. Download the APK file
3. Transfer to your Android device

#### Step 6: Install APK

On your Android device:

1. **Enable "Install Unknown Apps"**:
   - Go to Settings → Apps → Special Access → Install Unknown Apps
   - Select your file manager or browser
   - Enable "Allow from this source"

2. **Install the APK**:
   - Open the APK file
   - Tap "Install"
   - Wait for installation
   - Tap "Open" to launch

#### Distribution Options

**Direct Distribution:**

- Share APK file via Google Drive, Dropbox, etc.
- Send via WhatsApp, email, etc.
- Upload to your website for download

**Google Play Store:**

```bash
# Build for Play Store
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android
```

You'll need a Google Play Developer account ($25 one-time fee).

---

### Local Build with Android Studio

Build APK on your own computer (requires more setup).

#### Prerequisites

1. **Install Android Studio**
   - Download from [developer.android.com/studio](https://developer.android.com/studio)
   - Install Android SDK (API 33 or higher)

2. **Set up environment variables**

   macOS/Linux - Add to `~/.bashrc` or `~/.zshrc`:

   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

   Windows - Set in System Environment Variables:

   ```
   ANDROID_HOME=C:\Users\YourName\AppData\Local\Android\Sdk
   ```

3. **Install Java Development Kit (JDK)**
   - JDK 11 or higher required
   - Download from [adoptium.net](https://adoptium.net/)

#### Build Steps

1. **Generate Android Project**

   ```bash
   npx expo prebuild --platform android
   ```

2. **Navigate to Android Directory**

   ```bash
   cd android
   ```

3. **Build Release APK**

   macOS/Linux:

   ```bash
   ./gradlew assembleRelease
   ```

   Windows:

   ```bash
   gradlew.bat assembleRelease
   ```

4. **Find Your APK**

   The APK will be at:

   ```
   android/app/build/outputs/apk/release/app-release.apk
   ```

#### Signing the APK (Optional but Recommended)

For production, you should sign your APK:

1. **Generate a keystore**:

   ```bash
   keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Configure signing in android/app/build.gradle**:

   ```gradle
   android {
       ...
       signingConfigs {
           release {
               storeFile file('my-release-key.keystore')
               storePassword 'your-password'
               keyAlias 'my-key-alias'
               keyPassword 'your-password'
           }
       }
       buildTypes {
           release {
               signingConfig signingConfigs.release
               ...
           }
       }
   }
   ```

3. **Rebuild**:
   ```bash
   ./gradlew assembleRelease
   ```

---

## 🍎 iOS Deployment

**Note:** iOS deployment requires a macOS computer and Apple Developer account.

### EAS Build & App Store

#### Prerequisites

- macOS computer
- Apple Developer account ($99/year)
- Apple Developer Program enrollment

#### Step 1: Install EAS CLI

```bash
yarn global add eas-cli
```

#### Step 2: Login

```bash
eas login
```

#### Step 3: Configure iOS Build

```bash
eas build:configure
```

#### Step 4: Build for iOS

For App Store distribution:

```bash
eas build --platform ios --profile production
```

For testing on your device:

```bash
eas build --platform ios --profile preview
```

#### Step 5: Submit to App Store

After successful build:

```bash
eas submit --platform ios
```

Follow the prompts to:

- Select your Apple ID
- Choose your app
- Provide app metadata

#### Step 6: App Store Connect

1. Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. Complete app information
3. Add screenshots
4. Submit for review

---

### TestFlight

Distribute to beta testers before App Store release.

#### Step 1: Build for TestFlight

```bash
eas build --platform ios --profile production
```

#### Step 2: Upload to TestFlight

```bash
eas submit --platform ios
```

#### Step 3: Invite Testers

1. Go to App Store Connect
2. Select your app
3. Go to TestFlight tab
4. Add internal or external testers
5. Testers receive invitation via email

---

## 🔧 Build Configuration

### Customizing eas.json

Edit `eas.json` to customize builds:

```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "simulator": false,
        "bundleIdentifier": "com.yoursynagogue.calendar"
      }
    },
    "preview": {
      "android": {
        "buildType": "apk"
      },
      "distribution": "internal"
    }
  }
}
```

---

## 📱 Alternative: PWA (Progressive Web App)

Users can "install" your web app on their devices:

### Enable PWA Features

The app is already configured as a PWA. Users can:

1. Visit your website
2. Tap "Add to Home Screen" (mobile browsers)
3. Use the app like a native app

### Benefits:

- ✅ No App Store approval needed
- ✅ Instant updates
- ✅ Works on all platforms
- ✅ Smaller file size

---

## 🚀 Continuous Deployment

### Automatic Builds with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: yarn install
      - run: npx expo export --platform web
      - uses: netlify/actions/cli@master
        with:
          args: deploy --dir=dist --prod
        env:
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
```

---

## 📊 Performance Optimization

Before deploying:

1. **Optimize Images**

   ```bash
   # Use WebP format for backgrounds
   # Compress images with tools like tinypng.com
   ```

2. **Enable Production Mode**
   - EAS builds are already optimized
   - Web builds are minified automatically

3. **Test Performance**
   ```bash
   # Test web build locally
   yarn web
   ```

---

## 🔍 Post-Deployment Checklist

After deploying, verify:

- [ ] App loads correctly
- [ ] All features work as expected
- [ ] Zmanim calculations are accurate
- [ ] Hebrew text displays properly (RTL)
- [ ] Images and backgrounds load
- [ ] Settings persist correctly
- [ ] GitHub sync works (if configured)
- [ ] Responsive on different screen sizes
- [ ] Performance is good

---

## 🆘 Troubleshooting Deployment

### Build Fails

**EAS Build fails:**

```bash
# Check build logs
eas build:list
# View specific build
eas build:view [build-id]
```

**Local Android build fails:**

```bash
cd android
./gradlew clean
cd ..
yarn android
```

### APK Won't Install

- Make sure "Install from Unknown Sources" is enabled
- Check if Android version is compatible (Android 5.0+)
- Try uninstalling old version first

### Web App Not Loading

- Check browser console for errors
- Verify all files uploaded correctly
- Check server routing configuration

---

## 📞 Need Help?

- Open an issue on [GitHub](https://github.com/yourusername/synagogue-calander/issues)
- Check [Expo Documentation](https://docs.expo.dev/)
- Visit [Expo Forums](https://forums.expo.dev/)

---

[⬅️ Back to Main README](../README.md)
