# 📦 Deployment Guide

This guide covers deploying the Synagogue Calendar app to various platforms.

## Table of Contents

- [Android TV (Quickest!)](#-android-tv-quickest)
- [Web Deployment](#web-deployment)
  - [Netlify](#netlify)
  - [GitHub Pages](#github-pages)

---

## 📺 Android TV (Quickest!)

The fastest way to get the Synagogue Calendar running on an Android TV:

1. Open the web browser on your Android TV
2. Navigate to: **https://netafim.short.gy/cal**
3. That's it! The app is ready to use

This is perfect for quickly displaying the calendar on a synagogue TV screen without any installation or configuration.

---

## 🌐 Web Deployment

The app can be deployed to any web hosting service. Here are the most popular options:

### Prerequisites

Before deploying, ensure your `app.json` has proper web configuration:

```json
{
  "expo": {
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/favicon.png"
    }
  }
}
```

This ensures Expo generates a static build suitable for hosting.

### Netlify

Netlify offers free hosting with automatic SSL and continuous deployment.

#### Step 1: Install Netlify CLI

```bash
yarn global add netlify-cli
```

#### Step 2: Build the Web Version

```bash
npx expo export -p web
```

This creates a `dist` folder with your static web app.

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
2. Set build command: `npx expo export -p web`
3. Set publish directory: `dist`
4. Every push to main branch auto-deploys!

**Tip:** For Netlify, you don't need the `baseUrl` configuration in `app.json` since it deploys to the root path.

---

### GitHub Pages

Free hosting directly from your GitHub repository.

#### Step 1: Update app.json

Add web configuration with your GitHub Pages base path:

```json
{
  "expo": {
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/favicon.png"
    },
    "assetBundlePatterns": ["**/*"]
  }
}
```

For a repository at `https://github.com/yourusername/synagogue-calendar`, add this to your `app.json` under the `expo` key:

```json
{
  "expo": {
    "experiments": {
      "baseUrl": "/synagogue-calendar"
    }
  }
}
```

**Note:** If deploying to root domain (e.g., `yourusername.github.io`), you can skip the `baseUrl` configuration.

#### Step 2: Install gh-pages

```bash
yarn add --dev gh-pages
```

#### Step 3: Add Deploy Scripts

Add these to `package.json` scripts:

```json
{
  "scripts": {
    "build:web": "npx expo export -p web && node scripts/fix-gh-pages-paths.js",
    "deploy:web": "gh-pages -d dist --nojekyll",
    "deploy": "yarn build:web && yarn deploy:web"
  }
}
```

**Important notes:**

1. **`--nojekyll` flag:** Required because Expo outputs assets to a folder named `_expo`. GitHub Pages uses Jekyll by default, which ignores files/folders starting with `_`. The `--nojekyll` flag creates a `.nojekyll` file that disables Jekyll processing.

2. **`fix-gh-pages-paths.js` script:** This post-build script fixes icon fonts for GitHub Pages. Expo vector icons (Ionicons, Feather, etc.) reference font files from a `node_modules` path that doesn't get deployed. The script copies the fonts to a `fonts/` folder and patches the JS bundle to use the correct paths.

#### Step 4: Create the Icon Font Fix Script

Create `scripts/fix-gh-pages-paths.js` with the following content. This script is required for icons to display correctly on GitHub Pages:

```javascript
/**
 * Post-build script to fix icon fonts for GitHub Pages deployment
 */
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const distDir = join(projectRoot, 'dist');
const fontsSourceDir = join(
  projectRoot,
  'node_modules',
  '@expo',
  'vector-icons',
  'build',
  'vendor',
  'react-native-vector-icons',
  'Fonts',
);
const fontsTargetDir = join(distDir, 'fonts');

// Add icon fonts used in your app
const requiredFonts = ['Ionicons', 'Feather'];
const oldPathPattern = 'assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts';
const newPathPattern = 'fonts';

function findBundleFiles() {
  const jsDir = join(distDir, '_expo', 'static', 'js', 'web');
  if (!existsSync(jsDir)) return [];
  return readdirSync(jsDir)
    .filter((f) => f.endsWith('.js'))
    .map((f) => join(jsDir, f));
}

function extractFontHashes(bundleContent) {
  const hashes = {};
  for (const fontName of requiredFonts) {
    const regex = new RegExp(`${fontName}\\.([a-f0-9]+)\\.ttf`, 'g');
    const match = bundleContent.match(regex);
    if (match?.[0]) hashes[fontName] = match[0];
  }
  return hashes;
}

function main() {
  console.log('🔧 Fixing icon fonts for GitHub Pages...');
  if (!existsSync(fontsSourceDir)) {
    console.error('❌ Font source not found');
    process.exit(1);
  }

  const bundleFiles = findBundleFiles();
  let fontHashes = {};
  for (const bundlePath of bundleFiles) {
    fontHashes = { ...fontHashes, ...extractFontHashes(readFileSync(bundlePath, 'utf8')) };
  }

  if (Object.keys(fontHashes).length === 0) {
    console.log('⚠️ No fonts found');
    return;
  }

  mkdirSync(fontsTargetDir, { recursive: true });
  for (const [fontName, hashedFilename] of Object.entries(fontHashes)) {
    const src = join(fontsSourceDir, `${fontName}.ttf`);
    if (existsSync(src)) {
      copyFileSync(src, join(fontsTargetDir, hashedFilename));
      console.log(`✅ ${fontName}.ttf`);
    }
  }

  // Patch bundles and HTML
  for (const bundlePath of bundleFiles) {
    let content = readFileSync(bundlePath, 'utf8');
    if (content.includes(oldPathPattern)) {
      writeFileSync(bundlePath, content.split(oldPathPattern).join(newPathPattern));
    }
  }

  const htmlFiles = readdirSync(distDir, { recursive: true }).filter((f) => f.toString().endsWith('.html'));
  for (const htmlFile of htmlFiles) {
    const htmlPath = join(distDir, htmlFile.toString());
    let content = readFileSync(htmlPath, 'utf8');
    if (content.includes(oldPathPattern)) {
      writeFileSync(htmlPath, content.split(oldPathPattern).join(newPathPattern));
    }
  }

  console.log('✨ Icon fonts fixed!');
}

main();
```

#### Step 5: Build and Deploy

```bash
yarn deploy
```

#### Step 6: Enable GitHub Pages

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under **Source**, select the `gh-pages` branch
4. Click **Save**
5. Your app will be live at `https://yourusername.github.io/synagogue-calendar` in a few minutes

#### Troubleshooting

- **Icons not displaying (empty boxes):** Make sure you have the `fix-gh-pages-paths.js` script and it runs as part of the build. This script copies icon fonts and patches paths in the bundle.
- **404 Errors for JS/CSS files:** Make sure you're using `--nojekyll` in your deploy command. GitHub Pages uses Jekyll by default, which ignores the `_expo` folder
- **404 Errors (wrong paths):** Make sure the `baseUrl` in `app.json` matches your repository name (e.g., `/synagogue-calendar`)
- **404 Errors for font files:** Icon fonts must be copied to a simple path (not containing `node_modules`). The fix script handles this automatically.
- **Assets Not Loading:** Ensure `assetBundlePatterns` includes all asset directories
- **Blank Page:** Check browser console for errors related to incorrect base paths

## build

- When adding packages run
  `npx expo install --fix`
  to verify package expo compatebility.
- To build the apk on eas servers use the command `eas build --platform android --profile preview`.
- To add to Android studio run the command `npx expo prebuild --platform android` and then open the android folder in androd studio.

[⬅️ Back to Main README](../README.md)
