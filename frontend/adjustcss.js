const fs = require('fs');
const path = require('path');

// ========================================
// COMPREHENSIVE CSS CONFLICT FIXER
// Removes ALL conflicts that break header dropdowns
// ========================================

console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║   COMPREHENSIVE CSS CONFLICT FIXER FOR HEADER/SEARCH     ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

const CSS_FIXES = {
  // ========================================
  // HOME1.CSS - Core Home Page
  // ========================================
  'Home1.css': {
    rules: [
      {
        selector: '.header-wrapper',
        remove: ['contain'],
        ensure: 'overflow: visible !important;',
        reason: 'Allow dropdowns to escape header wrapper'
      },
      {
        selector: '.hero-section',
        remove: ['contain'],
        ensure: 'contain: layout style !important;',
        reason: 'Only layout containment, not paint'
      },
      {
        selector: '.main-container',
        modify: { 'z-index': '1' },
        reason: 'Base z-index level'
      },
      {
        selector: '.trending-sidebar',
        modify: { 'z-index': '10' },
        reason: 'Below header (1030)'
      },
      {
        selector: '.headlines-sidebar',
        modify: { 'z-index': '10' },
        reason: 'Below header (1030)'
      }
    ]
  },

  // ========================================
  // HOME3.CSS - Additional Home Styles
  // ========================================
  'Home3.css': {
    rules: [
      {
        selector: '.header-wrapper',
        ensure: 'contain: none !important;',
        reason: 'Critical: prevent dropdown clipping'
      },
      {
        selector: '.hero-section',
        ensure: 'contain: layout style !important;',
        reason: 'Hero needs only layout containment'
      },
      {
        selector: '.hero-composite',
        remove: ['contain'],
        ensure: 'overflow: visible;',
        reason: 'Allow dropdowns in hero area'
      },
      {
        selector: '.mobile-sidebar-overlay',
        modify: { 'z-index': '1024' },
        reason: 'Below header dropdowns'
      },
      {
        selector: '.mobile-sidebar-drawer',
        modify: { 'z-index': '1026' },
        reason: 'Below header dropdowns'
      }
    ]
  },

  // ========================================
  // SUBCATEGORY.CSS - Category Pages
  // ========================================
  'SubCategory.css': {
    rules: [
      {
        selector: '.trending-flash-banner',
        remove: ['position', 'top', 'z-index'],
        ensure: 'position: relative;',
        reason: 'Unstick trending flash - let it scroll'
      },
      {
        selector: '.subcategory-revamped-layout',
        remove: ['z-index'],
        reason: 'Remove stacking context issues'
      },
      {
        selector: '.subcategory-left-panel',
        modify: { 'z-index': '10' },
        reason: 'Below header (1030)'
      },
      {
        selector: '.subcategory-right-panel',
        modify: { 'z-index': '10' },
        reason: 'Below header (1030)'
      },
      {
        selector: '.subcategory-center-content',
        modify: { 'z-index': '1' },
        reason: 'Base content level'
      },
      {
        selector: '.mobile-sidebar-overlay',
        modify: { 'z-index': '1024' },
        reason: 'Below header'
      },
      {
        selector: '.mobile-sidebar-drawer',
        modify: { 'z-index': '1026' },
        reason: 'Below header dropdowns'
      },
      {
        selector: '.sidebar-hamburger',
        modify: { 'z-index': '1025' },
        reason: 'Below header dropdowns'
      }
    ]
  },

  // ========================================
  // TRENDING.CSS - Trending Page
  // ========================================
  'Trending.css': {
    rules: [
      {
        selector: '.trending-layout',
        remove: ['z-index'],
        reason: 'Remove stacking conflicts'
      },
      {
        selector: '.recents-sidebar',
        modify: { 'z-index': '10' },
        reason: 'Below header (1030)'
      },
      {
        selector: '.mobile-sidebar-overlay',
        modify: { 'z-index': '1024' },
        reason: 'Below header'
      },
      {
        selector: '.mobile-sidebar-toggle',
        modify: { 'z-index': '150' },
        reason: 'Well below header'
      }
    ]
  },

  // ========================================
  // CATEGORIES.CSS - Category Grid
  // ========================================
  'Categories.css': {
    rules: [
      {
        selector: '.category-page-layout',
        remove: ['z-index'],
        reason: 'No stacking context needed'
      },
      {
        selector: '.category-left-sidebar',
        modify: { 'z-index': '10' },
        reason: 'Below header (1030)'
      },
      {
        selector: '.category-right-sidebar',
        modify: { 'z-index': '10' },
        reason: 'Below header (1030)'
      },
      {
        selector: '.sidebar-hamburger',
        modify: { 'z-index': '1025' },
        reason: 'Below header dropdowns'
      },
      {
        selector: '.mobile-sidebar-overlay',
        modify: { 'z-index': '1024' },
        reason: 'Below header'
      },
      {
        selector: '.mobile-sidebar-drawer',
        modify: { 'z-index': '1026' },
        reason: 'Below header dropdowns'
      }
    ]
  },

  // ========================================
  // HEADER.CSS - Critical Header Fixes
  // ========================================
  'Header.css': {
    rules: [
      {
        selector: '.header-wrapper',
        ensure: 'z-index: 1030;',
        reason: 'Header at proper level'
      },
      {
        selector: '.search-results-dropdown',
        ensure: 'z-index: 1200 !important;',
        reason: 'Search dropdown highest priority'
      },
      {
        selector: '.notifications-dropdown',
        ensure: 'z-index: 1100 !important;',
        reason: 'Notifications dropdown high priority'
      },
      {
        selector: '.dynamic-header',
        ensure: 'z-index: 1000;',
        reason: 'Base header layer'
      }
    ]
  },

  // ========================================
  // SEARCHNOTIFICATIONS.CSS
  // ========================================
  'SearchNotifications.css': {
    rules: [
      {
        selector: '.search-results-dropdown',
        ensure: 'z-index: 1200 !important;',
        reason: 'Highest for search'
      },
      {
        selector: '.notifications-dropdown',
        ensure: 'z-index: 1100 !important;',
        reason: 'High for notifications'
      },
      {
        selector: '.mobile-search-overlay',
        modify: { 'z-index': '9999' },
        reason: 'Mobile search above everything'
      }
    ]
  }
};

// ========================================
// UTILITY FUNCTIONS
// ========================================

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function removePropertyFromRule(cssContent, selector, propertyToRemove) {
  const selectorRegex = new RegExp(
    `(${escapeRegex(selector)}\\s*\\{[^}]*)(${escapeRegex(propertyToRemove)}\\s*:[^;]+;)([^}]*\\})`,
    'gs'
  );
  
  return cssContent.replace(selectorRegex, (match, before, prop, after) => {
    console.log(`  ✓ Removed "${propertyToRemove}" from "${selector}"`);
    return before + after;
  });
}

function ensurePropertyInRule(cssContent, selector, property) {
  const selectorRegex = new RegExp(`${escapeRegex(selector)}\\s*\\{[^}]*\\}`, 's');
  
  if (!selectorRegex.test(cssContent)) {
    console.log(`  ℹ Selector "${selector}" not found, skipping`);
    return cssContent;
  }
  
  const propertyName = property.split(':')[0].trim();
  const propertyRegex = new RegExp(
    `(${escapeRegex(selector)}\\s*\\{[^}]*)(${escapeRegex(propertyName)}\\s*:[^;]+;)`,
    's'
  );
  
  if (propertyRegex.test(cssContent)) {
    cssContent = cssContent.replace(propertyRegex, (match, before, oldProp) => {
      console.log(`  ✓ Updated "${propertyName}" in "${selector}"`);
      return before + property + '\n';
    });
  } else {
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
    `(${escapeRegex(selector)}\\s*\\{[^}]*)(${escapeRegex(propertyName)}\\s*:[^;]+;)`,
    's'
  );
  
  if (!propertyRegex.test(cssContent)) {
    // Property doesn't exist, add it
    return ensurePropertyInRule(cssContent, selector, `${propertyName}: ${newValue};`);
  }
  
  return cssContent.replace(propertyRegex, (match, before, oldProp) => {
    const newProp = `${propertyName}: ${newValue};`;
    console.log(`  ✓ Modified "${propertyName}" in "${selector}" to "${newValue}"`);
    return before + newProp;
  });
}

// ========================================
// FILE PROCESSOR
// ========================================

function processCSSFile(filePath, fixes) {
  console.log(`\n📄 Processing: ${path.basename(filePath)}`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`  ⚠ File not found: ${filePath}`);
    return false;
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
    return true;
  } else {
    console.log(`  ℹ No changes needed`);
    return false;
  }
}

// ========================================
// MAIN EXECUTION
// ========================================

function main() {
  const cssDir = process.argv[2] || './src/styles';
  
  if (!fs.existsSync(cssDir)) {
    console.error(`\n❌ Error: CSS directory not found: ${cssDir}`);
    console.log('\n💡 Usage: node adjustcss.js [path/to/styles]');
    console.log('   Example: node adjustcss.js ./frontend/src/styles\n');
    process.exit(1);
  }
  
  console.log(`📁 CSS Directory: ${cssDir}\n`);
  
  let filesProcessed = 0;
  let filesModified = 0;
  
  // Process each file
  Object.entries(CSS_FIXES).forEach(([filename, fixes]) => {
    const filePath = path.join(cssDir, filename);
    filesProcessed++;
    
    if (processCSSFile(filePath, fixes)) {
      filesModified++;
    }
  });
  
  // Summary
  console.log('\n' + '═'.repeat(60));
  console.log('📊 SUMMARY');
  console.log('═'.repeat(60));
  console.log(`Files processed: ${filesProcessed}`);
  console.log(`Files modified: ${filesModified}`);
  console.log(`Backup files created: ${filesModified}`);
  
  console.log('\n✨ CSS conflicts fixed!');
  console.log('\n💡 WHAT WAS FIXED:');
  console.log('   ✓ Removed contain: paint from header-wrapper');
  console.log('   ✓ Fixed hero-section containment');
  console.log('   ✓ Adjusted all z-index values');
  console.log('   ✓ Unstuck trending flash banner in SubCategory');
  console.log('   ✓ Removed stacking context conflicts');
  console.log('   ✓ Fixed search & notification dropdown rendering');
  
  console.log('\n🧪 TEST YOUR FIXES:');
  console.log('   1. Open your site in browser');
  console.log('   2. Click search bar - dropdown should appear');
  console.log('   3. Click notifications - should render properly');
  console.log('   4. Navigate to subcategory - flash banner should scroll');
  console.log('   5. Check all pages: home, trending, quotes, category');
  
  console.log('\n📦 TO RESTORE BACKUPS:');
  console.log(`   node adjustcss.js ${cssDir} --restore\n`);
}

// ========================================
// RESTORE FUNCTION
// ========================================

function restoreBackups() {
  const cssDir = process.argv[2] || './src/styles';
  console.log('\n🔄 Restoring backups...\n');
  
  let restored = 0;
  
  Object.keys(CSS_FIXES).forEach(filename => {
    const filePath = path.join(cssDir, filename);
    const backupPath = filePath + '.backup';
    
    if (fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, filePath);
      console.log(`✓ Restored: ${filename}`);
      restored++;
    } else {
      console.log(`⚠ No backup found: ${filename}`);
    }
  });
  
  console.log(`\n✅ Restored ${restored} file(s)\n`);
}

// Run
if (process.argv.includes('--restore')) {
  restoreBackups();
} else {
  main();
}