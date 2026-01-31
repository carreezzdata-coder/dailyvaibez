// replace-all.js - Simple global find and replace
const fs = require('fs');
const path = require('path');

// What to replace
const replacements = [
  { from: /dailyvaibe/gi, to: 'dailyvaibe' },
  { from: /dailyvaibe/g, to: 'Dailyvaibe' },
  { from: /dailyvaibe/g, to: 'DailyVaibe' },
  { from: /dailyvaibe/g, to: 'DAILYVAIBE' }
];

const SKIP_DIRS = ['node_modules', '.git', '.next', 'build', 'dist'];
const SKIP_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.woff', '.woff2', '.ttf', '.eot'];

let filesChanged = 0;
let changesCount = 0;

function shouldSkip(filePath) {
  return SKIP_DIRS.some(dir => filePath.includes(path.sep + dir + path.sep));
}

function shouldSkipFile(filename) {
  return SKIP_EXTENSIONS.some(ext => filename.endsWith(ext));
}

function replaceInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let fileChanges = 0;
    
    replacements.forEach(rep => {
      const matches = (content.match(rep.from) || []).length;
      if (matches > 0) {
        content = content.replace(rep.from, rep.to);
        fileChanges += matches;
      }
    });
    
    if (fileChanges > 0) {
      fs.writeFileSync(filePath, content, 'utf8');
      filesChanged++;
      changesCount += fileChanges;
      console.log(`✓ ${path.relative(process.cwd(), filePath)} (${fileChanges} changes)`);
    }
  } catch (error) {
    // Skip binary or locked files
  }
}

function walkDir(dir) {
  try {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      
      if (shouldSkip(filePath)) return;
      
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        walkDir(filePath);
      } else if (!shouldSkipFile(file)) {
        replaceInFile(filePath);
      }
    });
  } catch (error) {
    // Skip
  }
}

console.log('\n🔄 Replacing dailyvaibe → dailyvaibe everywhere...\n');

walkDir(process.cwd());

console.log(`\n✅ Done! Changed ${filesChanged} files (${changesCount} replacements total)\n`);
console.log('Now run:');
console.log('  1. rmdir /s /q .next');
console.log('  2. npm run build\n');