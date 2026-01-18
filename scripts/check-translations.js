import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const hePath = path.join(__dirname, '../locales/he.json');
const enPath = path.join(__dirname, '../locales/en.json');

try {
  const he = JSON.parse(fs.readFileSync(hePath, 'utf8'));
  const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

  const heKeys = Object.keys(he);
  const enKeys = Object.keys(en);

  const missingInEn = heKeys.filter((key) => !enKeys.includes(key));
  const missingInHe = enKeys.filter((key) => !heKeys.includes(key));

  let hasError = false;

  if (missingInEn.length > 0) {
    console.error('\x1b[31m%s\x1b[0m', 'Keys present in he.json but missing in en.json:');
    missingInEn.forEach((key) => console.error(` - ${key}`));
    hasError = true;
  }

  if (missingInHe.length > 0) {
    console.error('\x1b[31m%s\x1b[0m', 'Keys present in en.json but missing in he.json:');
    missingInHe.forEach((key) => console.error(` - ${key}`));
    hasError = true;
  }

  if (hasError) {
    process.exit(1);
  } else {
    console.log('\x1b[32m%s\x1b[0m', 'Translation keys match perfectly!');
    process.exit(0);
  }
} catch (error) {
  console.error('\x1b[31m%s\x1b[0m', 'Error checking translations:');
  console.error(error);
  process.exit(1);
}

