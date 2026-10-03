/**
 * Post-build script to fix icon fonts for GitHub Pages deployment
 * 
 * This script:
 * 1. Copies icon font files to a simple path in dist
 * 2. Patches the JS bundle to reference the new font paths
 */

import { readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync, existsSync } from 'fs';
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
  
  // Patch the JS bundles to use the new font path
  console.log('\n📝 Patching JS bundles to use new font paths...');
  
  for (const bundlePath of bundleFiles) {
    let bundleContent = readFileSync(bundlePath, 'utf8');
    
    if (bundleContent.includes(oldPathPattern)) {
      bundleContent = bundleContent.split(oldPathPattern).join(newPathPattern);
      writeFileSync(bundlePath, bundleContent);
      console.log(`✅ Patched: ${bundlePath.split('\\').pop() || bundlePath.split('/').pop()}`);
    }
  }
  
  // Also patch HTML files and inject version metadata
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

  const metaTags = `\n    <meta name="app-version" content="${versionData.version}">\n    <meta name="git-commit" content="${versionData.commit}">\n    <meta name="build-time" content="${versionData.buildTime}">\n    <meta name="build-timestamp" content="${versionData.timestamp}">`;

  const htmlFiles = readdirSync(distDir, { recursive: true })
    .filter(f => f.toString().endsWith('.html'))
    .map(f => join(distDir, f.toString()));
  
  for (const htmlPath of htmlFiles) {
    let htmlContent = readFileSync(htmlPath, 'utf8');
    
    if (htmlContent.includes(oldPathPattern)) {
      htmlContent = htmlContent.split(oldPathPattern).join(newPathPattern);
    }

    if (htmlContent.includes('<head>') && !htmlContent.includes('name="build-time"')) {
      htmlContent = htmlContent.replace('<head>', `<head>${metaTags}`);
    }

    writeFileSync(htmlPath, htmlContent);
    console.log(`✅ Patched: ${htmlPath.replace(distDir, 'dist')}`);
  }
  
  console.log('\n✨ Build post-processing completed successfully!');
}

main();
