import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const hePath = path.join(__dirname, '../locales/he.json');
const srcPaths = [
  path.join(__dirname, '../app'),
  path.join(__dirname, '../components'),
  path.join(__dirname, '../utils'),
];

// 1. Get all translation keys from he.json
const getJsonKeys = (filePath) => {
  try {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return new Set(Object.keys(content));
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return new Set();
  }
};

const heKeys = getJsonKeys(hePath);

// 2. Scan code for t('key') usages
const findKeysInCode = (dir, keysSet = new Set()) => {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      findKeysInCode(fullPath, keysSet);
    } else if (file.match(/\.(ts|tsx|js|jsx)$/)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      // Regex to find t('key'), t("key"), t(`key`)
      const regex = /\bt\(\s*['"`]([^'"`]+)['"`]/g;
      let match;
      while ((match = regex.exec(content)) !== null) {
        keysSet.add(match[1]);
      }
    }
  }
  return keysSet;
};

const usedKeysInCode = new Set();
srcPaths.forEach((p) => {
  if (fs.existsSync(p)) findKeysInCode(p, usedKeysInCode);
});

// 3. Compare and report
let hasError = false;

console.log('--- Translation Audit (vs he.json) ---');

// Missing in JSON (Used in code but not defined in he.json)
const missingInHe = [...usedKeysInCode].filter((key) => !heKeys.has(key));

if (missingInHe.length > 0) {
  console.error('\x1b[31m%s\x1b[0m', '\n[MISSING] Used in code but missing from he.json:');
  missingInHe.sort().forEach((key) => console.error(` - ${key}`));
  hasError = true;
}

// Unused in code (Defined in he.json but not found in code scan)
const unusedInHe = [...heKeys].filter((key) => !usedKeysInCode.has(key));

if (unusedInHe.length > 0) {
  console.warn('\x1b[33m%s\x1b[0m', '\n[UNUSED?] Defined in he.json but not found in code scan:');
  console.warn(' (Note: may include false positives for dynamic keys)');
  unusedInHe.sort().forEach((key) => console.warn(` - ${key}`));
}

if (!hasError && unusedInHe.length === 0) {
  console.log('\x1b[32m%s\x1b[0m', '\nAll used translations are defined and used!');
} else if (!hasError) {
  console.log('\x1b[32m%s\x1b[0m', '\nNo missing translations found.');
}

if (hasError) {
  process.exit(1);
}
