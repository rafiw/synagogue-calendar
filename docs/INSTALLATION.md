# 🚀 Installation Guide

## Prerequisites

Before you begin, ensure you have the following installed:

### Required:

- **Node.js** - Version 18 or higher ([Download](https://nodejs.org/))
- **Yarn** - Package manager ([Installation](https://yarnpkg.com/getting-started/install))
- **Git** - Version control ([Download](https://git-scm.com/))

### Platform-Specific (Optional):

#### For Android Development:

- **Android Studio** - For building Android apps ([Download](https://developer.android.com/studio))
- **Android SDK** - Installed via Android Studio
- **Java Development Kit (JDK)** - Version 11 or higher

#### For iOS Development (macOS only):

- **Xcode** - For building iOS apps ([Mac App Store](https://apps.apple.com/app/xcode/id497799835))
- **CocoaPods** - iOS dependency manager (installed via Xcode)
- **Apple Developer Account** - For distribution

---

## Quick Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/synagogue-calander.git
cd synagogue-calander
```

### 2. Install Dependencies

```bash
yarn install
```

This will install all required packages including:

- React Native
- Expo
- TypeScript
- Hebcal libraries
- All other dependencies

### 3. Start the Development Server

```bash
yarn start
```

This will start the Expo development server and show you a QR code.

---

## Platform-Specific Setup

### 📱 Running on Android

#### Option 1: Using Expo Go (Easiest)

1. Install **Expo Go** app on your Android device from [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
2. Run `yarn start` on your computer
3. Scan the QR code with Expo Go app
4. The app will load on your device

#### Option 2: Android Emulator

1. Open Android Studio
2. Go to **Tools → Device Manager**
3. Create a new virtual device (or use existing)
4. Start the emulator
5. Run:
   ```bash
   yarn android
   ```

#### Option 3: Physical Device with USB

1. Enable **Developer Options** on your Android device
2. Enable **USB Debugging**
3. Connect device via USB
4. Run:
   ```bash
   yarn android
   ```

---

### 🍎 Running on iOS (macOS only)

#### Option 1: Using Expo Go (Easiest)

1. Install **Expo Go** app on your iOS device from [App Store](https://apps.apple.com/app/expo-go/id982107779)
2. Run `yarn start` on your Mac
3. Scan the QR code with Camera app
4. Open with Expo Go

#### Option 2: iOS Simulator

1. Install Xcode from Mac App Store
2. Run:
   ```bash
   yarn ios
   ```
3. The iOS simulator will launch automatically

---

### 🌐 Running on Web

The easiest way to test the app:

```bash
yarn web
```

This will open the app in your default browser at `http://localhost:19006`

---

## Development Tools Setup

### Visual Studio Code (Recommended)

Install these helpful extensions:

- **React Native Tools** - Microsoft
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking
- **i18n Ally** - Translation helper

### Setting Up EAS CLI (For Building)

If you plan to build production versions:

```bash
yarn global add eas-cli
```

Then login:

```bash
eas login
```

---

## Verify Installation

Run these commands to ensure everything is set up correctly:

### 1. Check Node.js Version

```bash
node --version
```

Should show v18.x.x or higher

### 2. Check Yarn Version

```bash
yarn --version
```

Should show version 1.x.x or higher

### 3. Run Tests

```bash
yarn test
```

All tests should pass

### 4. Check Linting

```bash
yarn lint
```

Should show no errors

---

## Troubleshooting

### Common Issues and Solutions

#### Issue: "Cannot find module" errors

**Solution:**

```bash
# Clear cache and reinstall
rm -rf node_modules
yarn cache clean
yarn install
```

#### Issue: Metro bundler issues

**Solution:**

```bash
# Reset Metro bundler
yarn start --reset-cache
```

#### Issue: Android build fails

**Solution:**

```bash
cd android
./gradlew clean
cd ..
yarn android
```

#### Issue: iOS build fails

**Solution:**

```bash
cd ios
pod deintegrate
pod install
cd ..
yarn ios
```

#### Issue: "EMFILE: too many open files"

**Solution (macOS/Linux):**

```bash
# Increase file watchers limit
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

---

## Environment Setup

### Android Environment Variables (if using Android Studio)

Add to your `.bashrc`, `.zshrc`, or `.bash_profile`:

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk  # macOS
# export ANDROID_HOME=$HOME/Android/Sdk       # Linux
# export ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk  # Windows

export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

Then reload:

```bash
source ~/.bashrc  # or ~/.zshrc
```

---

## Available Scripts

After installation, you can use these scripts:

### Development

```bash
yarn start          # Start Expo dev server
yarn android        # Run on Android
yarn ios           # Run on iOS
yarn web           # Run in browser
```

### Code Quality

```bash
yarn lint          # Check code style
yarn lint:fix      # Fix code style issues
yarn format        # Format code with Prettier
yarn format-check  # Check formatting
```

### Testing

```bash
yarn test              # Run tests once
yarn test:watch        # Run tests in watch mode
yarn test:coverage     # Run tests with coverage report
yarn test:ui          # Open Vitest UI
```

### Translation Tools

```bash
yarn check-translations  # Check translation completeness
yarn audit-translations  # Audit translation files
```

---

## Project Structure

After installation, here's what you'll see:

```
synagogue-calander/
├── app/                # Expo Router pages
│   ├── index.tsx      # Main screen
│   └── settings/      # Settings pages
├── components/         # React components
│   ├── Zmanim.tsx     # Prayer times
│   ├── Classes.tsx    # Classes display
│   ├── Messages.tsx   # Announcements
│   └── ...
├── utils/             # Helper functions
│   ├── zmanim_wrapper.ts  # Hebcal integration
│   ├── classesHelpers.ts  # Classes logic
│   └── ...
├── locales/           # Translations
│   ├── en.json        # English
│   └── he.json        # Hebrew
├── assets/            # Images and data
├── __tests__/         # Unit tests
├── docs/              # Documentation
├── package.json       # Dependencies
└── README.md          # You are here!
```

---

## Next Steps

After successful installation:

1. 📖 [Learn about Features](./FEATURES.md)
2. 📦 [Deploy your app](./DEPLOYMENT.md)
3. 🔄 [Set up GitHub backup](./GITHUB_SETUP.md)
4. 🤝 [Contribute to the project](./CONTRIBUTING.md)

---

## Getting Help

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section above
2. Search [existing GitHub issues](https://github.com/yourusername/synagogue-calander/issues)
3. Open a [new issue](https://github.com/yourusername/synagogue-calander/issues/new) with:
   - Your Node.js version (`node --version`)
   - Your Yarn version (`yarn --version`)
   - Your operating system
   - Error messages and logs

---

[⬅️ Back to Main README](../README.md)
