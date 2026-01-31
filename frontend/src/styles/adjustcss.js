const fs = require('fs');
const path = require('path');

// ========================================
// CSS CONFLICT FIXER
// Removes problematic CSS rules that break header dropdowns
// ========================================

const CSS_FIXES = {
  'Home1.css': {
    rules: [
      // Remove contain property from header-wrapper
      {
        selector: '.header-wrapper',
        remove: ['contain'],
        reason: 'contain property clips dropdowns'
      },
      // Remove contain from hero-section
      {
        selector: '.hero-section',
        remove: ['contain'],
        reason: 'contain property clips dropdowns'
      }
    ]
  },
  
  'Home3.css': {
    rules: [
      // Already has fix but ensure it's consistent
      {
        selector: '.header-wrapper',
        ensure: 'contain: none !important;',
        reason: 'ensure dropdowns can escape'
      },
      // Remove contain from hero-section if exists
      {
        selector: '.hero-section',
        ensure: 'contain: layout style !important;',
        reason: 'hero needs layout containment only'
      }
    ]
  },
  
  'SubCategory.css': {
    rules: [
      // Ensure z-index doesn't interfere
      {
        selector: '.subcategory-revamped-layout',
        remove: ['z-index'],
        reason: 'avoid z-index stacking context issues'
      }
    ]
  },
  
  'Quotes.css': {
    rules: [
      // No specific header wrapper issues, but check z-index
      {
        selector: '.quotes-page-layout',
        remove: ['z-index'],
        reason: 'avoid z-index conflicts'
      }
    ]
  },
  
  'Trending.css': {
    rules: [
      // Check mobile sidebar overlay z-index
      {
        selector: '.mobile-sidebar-overlay',
        modify: {
          'z-index': '1024' // Below header (1030)
        },
        reason: 'ensure overlay below header'
      }
    ]
  }
};

// ========================================
// CORE FIX FUNCTIONS
// ========================================

function removePropertyFromRule(cssContent, selector, propertyToRemove) {
  // Match the selector and its rule block
  const selectorRegex = new RegExp(
    `(${escapeRegex(selector)}\\s*{[^}]*)(${propertyToRemove}\\s*:[^;]+;)([^}]*})`,
    'gs'
  );
  
  return cssContent.replace(selectorRegex, (match, before, prop, after) => {
    console.log(`  ✓ Removed "${propertyToRemove}" from "${selector}"`);
    return before + after;
  });
}

function ensurePropertyInRule(cssContent, selector, property) {
  // Check if selector exists
  const selectorRegex = new RegExp(`${escapeRegex(selector)}\\s*{[^}]*}`, 's');
  
  if (!selectorRegex.test(cssContent)) {
    console.log(`  ℹ Selector "${selector}" not found, skipping`);
    return cssContent;
  }
  
  // Check if property already exists
  const propertyName = property.split(':')[0].trim();
  const propertyRegex = new RegExp(
    `(${escapeRegex(selector)}\\s*{[^}]*)(${propertyName}\\s*:[^;]+;)`,
    's'
  );
  
  if (propertyRegex.test(cssContent)) {
    // Replace existing property
    cssContent = cssContent.replace(propertyRegex, (match, before, oldProp) => {
      console.log(`  ✓ Updated "${propertyName}" in "${selector}"`);
      return before + property + '\n';
    });
  } else {
    // Add new property
    cssContent = cssContent.replace(selectorRegex, (match) => {
      const insertPoint = match.lastIndexOf('}');
      const newRule = match.slice(0, insertPoint) + '  ' + property + '\n' + match.slice(insertPoint);
      console.log(`  ✓ Added "${property}" to "${selector}"`);
      return newRule;
    });
  }
  
  return cssContent;
}

function modifyPropertyInRule(cssContent, selector, propertyName, newValue) {
  const propertyRegex = new RegExp(
    `(${escapeRegex(selector)}\\s*{[^}]*)(${propertyName}\\s*:[^;]+;)`,
    's'
  );
  
  if (!propertyRegex.test(cssContent)) {
    console.log(`  ℹ Property "${propertyName}" in "${selector}" not found, skipping`);
    return cssContent;
  }
  
  return cssContent.replace(propertyRegex, (match, before, oldProp) => {
    const newProp = `${propertyName}: ${newValue};`;
    console.log(`  ✓ Modified "${propertyName}" in "${selector}" to "${newValue}"`);
    return before + newProp;
  });
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ========================================
// FILE PROCESSOR
// ========================================

function processCSSFile(filePath, fixes) {
  console.log(`\n📄 Processing: ${path.basename(filePath)}`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`  ⚠ File not found: ${filePath}`);
    return;
  }
  
  let cssContent = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  fixes.rules.forEach(rule => {
    const selector = rule.selector;
    console.log(`  🔧 Fixing selector: "${selector}"`);
    console.log(`     Reason: ${rule.reason}`);
    
    // Remove properties
    if (rule.remove) {
      rule.remove.forEach(prop => {
        const before = cssContent;
        cssContent = removePropertyFromRule(cssContent, selector, prop);
        if (before !== cssContent) modified = true;
      });
    }
    
    // Ensure properties
    if (rule.ensure) {
      const before = cssContent;
      cssContent = ensurePropertyInRule(cssContent, selector, rule.ensure);
      if (before !== cssContent) modified = true;
    }
    
    // Modify properties
    if (rule.modify) {
      Object.entries(rule.modify).forEach(([prop, value]) => {
        const before = cssContent;
        cssContent = modifyPropertyInRule(cssContent, selector, prop, value);
        if (before !== cssContent) modified = true;
      });
    }
  });
  
  if (modified) {
    // Create backup
    const backupPath = filePath + '.backup';
    fs.copyFileSync(filePath, backupPath);
    console.log(`  💾 Backup created: ${path.basename(backupPath)}`);
    
    // Write modified file
    fs.writeFileSync(filePath, cssContent, 'utf8');
    console.log(`  ✅ File updated successfully`);
  } else {
    console.log(`  ℹ No changes needed`);
  }
}

// ========================================
// MAIN EXECUTION
// ========================================

function main() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║   CSS CONFLICT FIXER FOR HEADER.CSS    ║');
  console.log('╚════════════════════════════════════════╝');
  
  // Get CSS directory from command line or use default
  const cssDir = process.argv[2] || './src/styles';
  
  if (!fs.existsSync(cssDir)) {
    console.error(`\n❌ Error: CSS directory not found: ${cssDir}`);
    console.log('\nUsage: node adjustcss.js [path/to/styles]');
    console.log('Example: node adjustcss.js ./frontend/src/styles');
    process.exit(1);
  }
  
  console.log(`\n📁 CSS Directory: ${cssDir}\n`);
  
  let filesProcessed = 0;
  let filesModified = 0;
  
  // Process each file
  Object.entries(CSS_FIXES).forEach(([filename, fixes]) => {
    const filePath = path.join(cssDir, filename);
    const statsBefore = fs.existsSync(filePath) ? fs.statSync(filePath) : null;
    
    processCSSFile(filePath, fixes);
    
    const statsAfter = fs.existsSync(filePath) ? fs.statSync(filePath) : null;
    
    filesProcessed++;
    if (statsBefore && statsAfter && statsBefore.mtime !== statsAfter.mtime) {
      filesModified++;
    }
  });
  
  // Summary
  console.log('\n' + '═'.repeat(50));
  console.log('📊 SUMMARY');
  console.log('═'.repeat(50));
  console.log(`Files processed: ${filesProcessed}`);
  console.log(`Files modified: ${filesModified}`);
  console.log(`Backup files created: ${filesModified}`);
  console.log('\n✨ CSS conflicts fixed!');
  console.log('\n💡 TIP: Test your header dropdowns now');
  console.log('   If issues persist, restore backups with:');
  console.log(`   node adjustcss.js ${cssDir} --restore\n`);
}

// ========================================
// RESTORE FUNCTION
// ========================================

function restoreBackups() {
  const cssDir = process.argv[2] || './src/styles';
  console.log('\n🔄 Restoring backups...\n');
  
  Object.keys(CSS_FIXES).forEach(filename => {
    const filePath = path.join(cssDir, filename);
    const backupPath = filePath + '.backup';
    
    if (fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, filePath);
      console.log(`✓ Restored: ${filename}`);
    }
  });
  
  console.log('\n✅ All backups restored\n');
}

// Run
if (process.argv.includes('--restore')) {
  restoreBackups();
} else {
  main();
}