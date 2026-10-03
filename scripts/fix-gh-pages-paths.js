/**
 * Post-build script to fix icon fonts for GitHub Pages deployment
 * 
 * This script:
 * 1. Copies icon font files to a simple path in dist
 * 2. Patches the JS bundle to reference the new font paths
 */

import { readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync, existsSync, cpSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Paths
const distDir = join(projectRoot, 'dist');
const fontsSourceDir = join(projectRoot, 'node_modules', '@expo', 'vector-icons', 'build', 'vendor', 'react-native-vector-icons', 'Fonts');
const fontsTargetDir = join(distDir, 'fonts');

// Icon fonts we use in the app
const requiredFonts = ['Ionicons', 'Feather'];

// The old path pattern that needs to be replaced
const oldPathPattern = 'assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts';
const newPathPattern = 'fonts';

// Find all JS bundle files
function findBundleFiles() {
  const jsDir = join(distDir, '_expo', 'static', 'js', 'web');
  if (!existsSync(jsDir)) {
    console.error('JS directory not found:', jsDir);
    return [];
  }
  
  const files = readdirSync(jsDir);
  return files
    .filter(f => f.endsWith('.js'))
    .map(f => join(jsDir, f));
}

// Extract font hashes from the bundle
function extractFontHashes(bundleContent) {
  const hashes = {};
  
  for (const fontName of requiredFonts) {
    // Match patterns like Ionicons.b4eb097d35f44ed943676fd56f6bdc51.ttf
    const regex = new RegExp(`${fontName}\\.([a-f0-9]+)\\.ttf`, 'g');
    const match = bundleContent.match(regex);
    if (match && match[0]) {
      hashes[fontName] = match[0];
    }
  }
  
  return hashes;
}

// Main function
function main() {
  console.log('🔧 Fixing icon fonts for GitHub Pages deployment...\n');
  
  // Check if fonts source exists
  if (!existsSync(fontsSourceDir)) {
    console.error('❌ Font source directory not found:', fontsSourceDir);
    process.exit(1);
  }
  
  // Find all bundle files
  const bundleFiles = findBundleFiles();
  if (bundleFiles.length === 0) {
    console.error('❌ Could not find any JS bundle files');
    process.exit(1);
  }
  
  console.log('📦 Found bundle files:', bundleFiles.length);
  
  // Read the main bundle to find font hashes
  let fontHashes = {};
  for (const bundlePath of bundleFiles) {
    const bundleContent = readFileSync(bundlePath, 'utf8');
    const hashes = extractFontHashes(bundleContent);
    fontHashes = { ...fontHashes, ...hashes };
  }
  
  console.log('🔍 Found font references:', fontHashes);
  
  if (Object.keys(fontHashes).length === 0) {
    console.log('⚠️  No font hashes found in bundle. Icons may not be used.');
    return;
  }
  
  // Create target directory
  mkdirSync(fontsTargetDir, { recursive: true });
  console.log('📁 Created directory:', fontsTargetDir);
  
  // Copy fonts with correct hashed names
  for (const [fontName, hashedFilename] of Object.entries(fontHashes)) {
    const sourceFile = join(fontsSourceDir, `${fontName}.ttf`);
    const targetFile = join(fontsTargetDir, hashedFilename);
    
    if (existsSync(sourceFile)) {
      copyFileSync(sourceFile, targetFile);
      console.log(`✅ Copied ${fontName}.ttf → fonts/${hashedFilename}`);
    } else {
      console.error(`❌ Source font not found: ${sourceFile}`);
    }
  }
  
  // Clean up unused vector-icons font directory in dist/assets/node_modules/@expo
  // Needed fonts (Ionicons, Feather) are already copied to dist/fonts and bundle-patched.
  // The remaining 15+ unused TTF fonts have extremely long paths (>260 chars) causing Windows MAX_PATH errors in Git.
  const expoAssetsDir = join(distDir, 'assets', 'node_modules', '@expo');
  if (existsSync(expoAssetsDir)) {
    rmSync(expoAssetsDir, { recursive: true, force: true });
    console.log('🧹 Removed unused vector-icons in assets/node_modules/@expo');
  }

  // Remove redundant nested node_modules inside material-top-tabs to prevent path length issues
  const nestedTopTabsNodeModules = join(distDir, 'assets', 'node_modules', '@react-navigation', 'material-top-tabs', 'node_modules');
  if (existsSync(nestedTopTabsNodeModules)) {
    rmSync(nestedTopTabsNodeModules, { recursive: true, force: true });
    console.log('🧹 Removed redundant nested node_modules in material-top-tabs');
  }

  // Also clean up any lingering vendor/@expo or vendor nested node_modules
  const vendorExpoDir = join(distDir, 'assets', 'vendor', '@expo');
  if (existsSync(vendorExpoDir)) {
    rmSync(vendorExpoDir, { recursive: true, force: true });
  }
  const vendorNestedTopTabs = join(distDir, 'assets', 'vendor', '@react-navigation', 'material-top-tabs', 'node_modules');
  if (existsSync(vendorNestedTopTabs)) {
    rmSync(vendorNestedTopTabs, { recursive: true, force: true });
  }

  // 1. Move all assets under dist/assets/node_modules to dist/assets/vendor
  // This prevents git / gh-pages / webservers from ignoring or blocking node_modules paths
  const nodeModulesAssetsDir = join(distDir, 'assets', 'node_modules');
  const vendorAssetsDir = join(distDir, 'assets', 'vendor');
  if (existsSync(nodeModulesAssetsDir)) {
    console.log('\n📦 Migrating node_modules assets to assets/vendor...');
    mkdirSync(vendorAssetsDir, { recursive: true });
    cpSync(nodeModulesAssetsDir, vendorAssetsDir, { recursive: true });
    rmSync(nodeModulesAssetsDir, { recursive: true, force: true });
    console.log('✅ Migrated dist/assets/node_modules → dist/assets/vendor');
  }

  // Patch the JS bundles to use the new font paths and vendor asset paths
  console.log('\n📝 Patching JS bundles to use new asset paths...');
  
  for (const bundlePath of bundleFiles) {
    let bundleContent = readFileSync(bundlePath, 'utf8');
    let modified = false;
    
    if (bundleContent.includes(oldPathPattern)) {
      bundleContent = bundleContent.split(oldPathPattern).join(newPathPattern);
      modified = true;
    }

    if (bundleContent.includes('assets/node_modules')) {
      bundleContent = bundleContent.split('assets/node_modules').join('assets/vendor');
      modified = true;
    }

    if (modified) {
      writeFileSync(bundlePath, bundleContent);
      console.log(`✅ Patched: ${bundlePath.split('\\').pop() || bundlePath.split('/').pop()}`);
    }
  }
  
  // Also patch HTML files and inject version metadata & cache control headers
  console.log('\n📝 Patching HTML files and injecting version metadata...');

  const packageJson = JSON.parse(readFileSync(join(projectRoot, 'package.json'), 'utf8'));
  const buildTime = new Date().toISOString();
  const buildTimestamp = Date.now();

  let gitCommit = process.env.GITHUB_SHA || process.env.GIT_COMMIT || '';
  if (!gitCommit) {
    try {
      gitCommit = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
    } catch {
      gitCommit = '';
    }
  } else if (gitCommit.length > 7) {
    gitCommit = gitCommit.substring(0, 7);
  }

  // Use git hash as version, with fallback to package.json version
  const versionString = gitCommit ? `#${gitCommit}` : (packageJson.version ? `v${packageJson.version}` : '1.0.0');

  const versionData = {
    version: versionString,
    commit: gitCommit,
    buildTime,
    timestamp: buildTimestamp,
  };

  // Write version.json
  writeFileSync(join(distDir, 'version.json'), JSON.stringify(versionData, null, 2));
  console.log(`📄 Generated version.json: ${versionData.version} (${versionData.buildTime})`);

  // Create .nojekyll and clean .gitignore in dist
  writeFileSync(join(distDir, '.nojekyll'), '');
  writeFileSync(join(distDir, '.gitignore'), '# Empty to allow all dist files\n');
  console.log('📄 Created .nojekyll and .gitignore in dist');

  const metaTags = `\n    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">\n    <meta http-equiv="Pragma" content="no-cache">\n    <meta http-equiv="Expires" content="0">\n    <meta name="app-version" content="${versionData.version}">\n    <meta name="git-commit" content="${versionData.commit}">\n    <meta name="build-time" content="${versionData.buildTime}">\n    <meta name="build-timestamp" content="${versionData.timestamp}">`;

  const htmlFiles = readdirSync(distDir, { recursive: true })
    .filter(f => f.toString().endsWith('.html'))
    .map(f => join(distDir, f.toString()));
  
  for (const htmlPath of htmlFiles) {
    let htmlContent = readFileSync(htmlPath, 'utf8');
    
    if (htmlContent.includes(oldPathPattern)) {
      htmlContent = htmlContent.split(oldPathPattern).join(newPathPattern);
    }

    if (htmlContent.includes('assets/node_modules')) {
      htmlContent = htmlContent.split('assets/node_modules').join('assets/vendor');
    }

    if (htmlContent.includes('<head>') && !htmlContent.includes('name="build-time"')) {
      htmlContent = htmlContent.replace('<head>', `<head>${metaTags}`);
    }

    // Update viewport for mobile full-bleed fit
    htmlContent = htmlContent.replace(
      /<meta\s+name=["']viewport["'][^>]*>/i,
      '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">',
    );

    // Ensure #root expands to 100% width and height in expo-reset
    if (htmlContent.includes('#root{display:flex}')) {
      htmlContent = htmlContent.replace(
        '#root{display:flex}',
        '#root{display:flex;width:100%;height:100%;flex-direction:column;overflow:hidden;}',
      );
    }

    writeFileSync(htmlPath, htmlContent);
    console.log(`✅ Patched: ${htmlPath.replace(distDir, 'dist')}`);
  }
  
  console.log('\n✨ Build post-processing completed successfully!');
}

main();
