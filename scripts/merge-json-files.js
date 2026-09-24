import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '..', 'assets', 'data');
const outputFile = path.join(__dirname, '..', 'assets', 'data', 'merged.json');

// Get all JSON files in the directory
const files = fs.readdirSync(dataDir)
  .filter(file => file.endsWith('.json') && file !== 'merged.json')
  .sort();

console.log(`Found ${files.length} JSON files to merge:`);
files.forEach(file => console.log(`  - ${file}`));

// Read and parse all JSON files
const mergedData = [];

for (const file of files) {
  const filePath = path.join(dataDir, file);
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(content);
    mergedData.push(parsed);
    console.log(`✓ Successfully read ${file}`);
  } catch (error) {
    console.error(`✗ Error reading ${file}:`, error.message);
  }
}

// Write merged data to output file
fs.writeFileSync(outputFile, JSON.stringify(mergedData, null, 2), 'utf8');
console.log(`\n✓ Merged ${mergedData.length} files into ${outputFile}`);
