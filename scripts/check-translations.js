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

  // Check for nikud (Hebrew vowel marks) in Hebrew translations
  // Nikud Unicode ranges: U+05B0-05BD, U+05BF, U+05C1-05C2, U+05C4-05C5, U+05C7
  const nikudRegex = /[\u05B0-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7]/;
  const missingNikud = heKeys.filter((key) => {
    const value = he[key];
    // Check if it's a Hebrew string (contains Hebrew characters) but lacks nikud
    const hasHebrew = /[\u05D0-\u05EA]/.test(value);
    return hasHebrew && !nikudRegex.test(value);
  });

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

  if (missingNikud.length > 0) {
    console.warn('\x1b[33m%s\x1b[0m', '\nHebrew translations missing nikud (vowel marks):');
    missingNikud.forEach((key) => console.warn(` - ${key}: "${he[key]}"`));
    console.warn('\x1b[33m%s\x1b[0m', '(Note: This is a warning, not an error. Consider adding nikud for better readability.)');
  }

  if (hasError) {
    process.exit(1);
  } else if (missingNikud.length > 0) {
    console.log('\x1b[32m%s\x1b[0m', '\nTranslation keys match perfectly, but some Hebrew translations are missing nikud.');
    process.exit(0);
  } else {
    console.log('\x1b[32m%s\x1b[0m', 'Translation keys match perfectly and all Hebrew translations have nikud!');
    process.exit(0);
  }
} catch (error) {
  console.error('\x1b[31m%s\x1b[0m', 'Error checking translations:');
  console.error(error);
  process.exit(1);
}

