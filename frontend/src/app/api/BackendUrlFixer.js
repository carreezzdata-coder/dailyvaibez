const fs = require('fs');
const path = require('path');

class FrontendUrlFixer {
  constructor() {
    this.stats = {
      scanned: 0,
      alreadyHas: 0,
      fixed: 0,
      failed: 0,
      skipped: 0
    };
    this.results = [];
    this.dryRun = false;
  }

  /**
   * Main execution method
   */
  async run(options = {}) {
    this.dryRun = options.dryRun || false;
    // Default to Next.js API routes directory
    const routesDir = options.routesDir || path.join(__dirname, 'src', 'app', 'api');
    
    console.log('🔍 Frontend URL Fixer starting...');
    console.log(`📁 Scanning directory: ${routesDir}`);
    console.log(`🔧 Mode: ${this.dryRun ? 'DRY RUN (no changes)' : 'LIVE (will modify files)'}\n`);

    await this.scanDirectory(routesDir);
    this.printReport();
    
    return this.stats;
  }

  /**
   * Recursively scan directory for route files
   */
  async scanDirectory(dir) {
    if (!fs.existsSync(dir)) {
      console.error(`❌ Directory not found: ${dir}`);
      return;
    }

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        await this.scanDirectory(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.js')) {
        await this.processFile(fullPath);
      }
    }
  }

  /**
   * Process individual route file
   */
  async processFile(filePath) {
    this.stats.scanned++;
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(process.cwd(), filePath);

      // Check if file already has the import
      if (this.hasImport(content)) {
        this.stats.alreadyHas++;
        this.results.push({
          file: relativePath,
          status: 'skip',
          reason: 'Already has frontend config import'
        });
        return;
      }

      // Skip non-route files
      if (!this.isRouteFile(content)) {
        this.stats.skipped++;
        this.results.push({
          file: relativePath,
          status: 'skip',
          reason: 'Not a route file (no express router)'
        });
        return;
      }

      // Determine the correct import path
      const importPath = this.calculateImportPath(filePath);
      
      // Add the import
      const newContent = this.addImport(content, importPath);

      if (!this.dryRun) {
        // Backup original file
        fs.writeFileSync(`${filePath}.backup`, content, 'utf8');
        
        // Write new content
        fs.writeFileSync(filePath, newContent, 'utf8');
      }

      this.stats.fixed++;
      this.results.push({
        file: relativePath,
        status: 'fixed',
        importPath: importPath,
        backup: `${filePath}.backup`
      });

      console.log(`✅ ${this.dryRun ? '[DRY RUN] Would fix' : 'Fixed'}: ${relativePath}`);

    } catch (error) {
      this.stats.failed++;
      this.results.push({
        file: path.relative(process.cwd(), filePath),
        status: 'error',
        error: error.message
      });
      console.error(`❌ Error processing ${filePath}:`, error.message);
    }
  }

  /**
   * Check if file already has the frontend config import
   */
  hasImport(content) {
    const patterns = [
      /require\(['"]\.\.\/.*?frontendconfig['"]\)/,
      /from ['"]\.\.\/.*?frontendconfig['"]/,
      /FRONTEND_URL.*=.*require/,
      /import.*frontendconfig/i
    ];

    return patterns.some(pattern => pattern.test(content));
  }

  /**
   * Check if this is actually a route file
   */
  isRouteFile(content) {
    // Next.js API route patterns
    const nextJsPatterns = [
      /export\s+(async\s+)?function\s+(GET|POST|PUT|DELETE|PATCH)/,
      /export\s+const\s+(GET|POST|PUT|DELETE|PATCH)\s*=/,
      /NextRequest/,
      /NextResponse/,
      /export\s+default\s+(async\s+)?function/
    ];

    // Express route patterns (fallback)
    const expressPatterns = [
      /express\.Router\(\)/,
      /router\.(get|post|put|delete|patch)/,
      /app\.(get|post|put|delete|patch)/
    ];

    return (
      nextJsPatterns.some(pattern => pattern.test(content)) ||
      expressPatterns.some(pattern => pattern.test(content))
    );
  }

  /**
   * Calculate correct import path based on file location
   */
  calculateImportPath(filePath) {
    const relativePath = path.relative(process.cwd(), filePath);
    
    // For Next.js: src/app/api/... -> need to go up to src level
    // Example: src/app/api/admin/route.js -> ../../../../lib/config
    // Example: src/app/api/route.js -> ../../../lib/config
    
    // Count how many levels deep we are from src/app/api
    const parts = relativePath.split(path.sep);
    const apiIndex = parts.indexOf('api');
    
    if (apiIndex === -1) {
      // Fallback: count total depth
      const depth = parts.length - 1;
      return `${'../'.repeat(depth)}lib/config`;
    }
    
    // Calculate depth from api folder
    const depthFromApi = parts.length - apiIndex - 1;
    const upLevels = depthFromApi + 3; // +3 to get from api -> app -> src -> root
    
    return `${'../'.repeat(upLevels)}lib/config`;
  }

  /**
   * Add import to file content intelligently
   */
  addImport(content, importPath) {
    const lines = content.split('\n');
    
    // Find the best insertion point
    let insertIndex = 0;
    let lastRequireIndex = -1;
    let firstCodeIndex = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Track require statements
      if (line.startsWith('const') && line.includes('require(')) {
        lastRequireIndex = i;
      }
      
      // Track first line of actual code (not require/import)
      if (firstCodeIndex === -1 && 
          line.length > 0 && 
          !line.startsWith('//') && 
          !line.startsWith('/*') && 
          !line.startsWith('*') &&
          !line.startsWith('const') &&
          !line.startsWith('import') &&
          !line.startsWith('require')) {
        firstCodeIndex = i;
      }
    }

    // Determine insertion point
    if (lastRequireIndex >= 0) {
      // Insert after last require statement
      insertIndex = lastRequireIndex + 1;
    } else if (firstCodeIndex >= 0) {
      // Insert before first code line
      insertIndex = firstCodeIndex;
    } else {
      // Insert at beginning
      insertIndex = 0;
    }

    // Create the import statement
    const importStatement = `const { FRONTEND_URL, CLIENT_URL, ADMIN_URL, API_DOMAIN, ALLOWED_ORIGINS, isOriginAllowed } = require('${importPath}');`;

    // Insert the import with appropriate spacing
    const beforeImport = lines.slice(0, insertIndex);
    const afterImport = lines.slice(insertIndex);
    
    // Add spacing if needed
    const needsSpaceBefore = insertIndex > 0 && beforeImport[beforeImport.length - 1].trim() !== '';
    const needsSpaceAfter = afterImport.length > 0 && afterImport[0].trim() !== '';

    const newLines = [
      ...beforeImport,
      ...(needsSpaceBefore ? [''] : []),
      importStatement,
      ...(needsSpaceAfter ? [''] : []),
      ...afterImport
    ];

    return newLines.join('\n');
  }

  /**
   * Print summary report
   */
  printReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 FRONTEND URL FIXER REPORT');
    console.log('='.repeat(60));
    console.log(`Total files scanned:     ${this.stats.scanned}`);
    console.log(`Already has import:      ${this.stats.alreadyHas}`);
    console.log(`Fixed:                   ${this.stats.fixed}`);
    console.log(`Skipped (not routes):    ${this.stats.skipped}`);
    console.log(`Failed:                  ${this.stats.failed}`);
    console.log('='.repeat(60));

    if (this.stats.fixed > 0) {
      console.log('\n✨ Files modified:');
      this.results
        .filter(r => r.status === 'fixed')
        .forEach(r => {
          console.log(`   📝 ${r.file}`);
          console.log(`      Import: ${r.importPath}`);
          if (r.backup) {
            console.log(`      Backup: ${r.backup}`);
          }
        });
    }

    if (this.stats.failed > 0) {
      console.log('\n⚠️  Failed files:');
      this.results
        .filter(r => r.status === 'error')
        .forEach(r => {
          console.log(`   ❌ ${r.file}: ${r.error}`);
        });
    }

    if (this.dryRun) {
      console.log('\n🔍 DRY RUN MODE - No files were actually modified');
      console.log('   Run with { dryRun: false } to apply changes');
    }

    console.log('\n');
  }

  /**
   * Restore all backups (undo operation)
   */
  async restoreBackups(routesDir) {
    const backupFiles = this.findBackupFiles(routesDir || path.join(__dirname, 'src', 'app', 'api'));
    
    console.log(`\n🔄 Restoring ${backupFiles.length} backup files...`);
    
    for (const backupFile of backupFiles) {
      const originalFile = backupFile.replace('.backup', '');
      try {
        fs.copyFileSync(backupFile, originalFile);
        fs.unlinkSync(backupFile);
        console.log(`✅ Restored: ${path.relative(process.cwd(), originalFile)}`);
      } catch (error) {
        console.error(`❌ Failed to restore ${backupFile}:`, error.message);
      }
    }
    
    console.log('✨ Restore complete!\n');
  }

  /**
   * Find all backup files
   */
  findBackupFiles(dir, backups = []) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        this.findBackupFiles(fullPath, backups);
      } else if (entry.name.endsWith('.js.backup')) {
        backups.push(fullPath);
      }
    }

    return backups;
  }

  /**
   * Clean up all backup files
   */
  async cleanBackups(routesDir) {
    const backupFiles = this.findBackupFiles(routesDir || path.join(__dirname, 'src', 'app', 'api'));
    
    console.log(`\n🧹 Cleaning ${backupFiles.length} backup files...`);
    
    for (const backupFile of backupFiles) {
      try {
        fs.unlinkSync(backupFile);
        console.log(`✅ Deleted: ${path.relative(process.cwd(), backupFile)}`);
      } catch (error) {
        console.error(`❌ Failed to delete ${backupFile}:`, error.message);
      }
    }
    
    console.log('✨ Cleanup complete!\n');
  }
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const fixer = new FrontendUrlFixer();

  const command = args[0] || 'run';
  const dryRun = args.includes('--dry-run') || args.includes('-d');
  const routesDir = args.find(arg => arg.startsWith('--dir='))?.split('=')[1];

  switch (command) {
    case 'run':
      fixer.run({ dryRun, routesDir });
      break;
    
    case 'restore':
      fixer.restoreBackups(routesDir);
      break;
    
    case 'clean':
      fixer.cleanBackups(routesDir);
      break;
    
    default:
      console.log(`
Frontend URL Fixer - Utility to add frontend config imports to Next.js API route files

Usage:
  node BackendUrlFixer.js [command] [options]

Commands:
  run       - Scan and fix route files (default)
  restore   - Restore all files from backups
  clean     - Remove all backup files

Options:
  --dry-run, -d           - Preview changes without modifying files
  --dir=/path/to/routes   - Specify custom routes directory (default: src/app/api)

Examples:
  node BackendUrlFixer.js run --dry-run
  node BackendUrlFixer.js run
  node BackendUrlFixer.js run --dir=C:\\Projects\\DAILY VAIBE\\frontend\\src\\app\\api
  node BackendUrlFixer.js restore
  node BackendUrlFixer.js clean

Default Directory:
  Scans: src/app/api (Next.js API routes)
  Import: ../../../lib/config (or calculated based on depth)
      `);
  }
}

module.exports = FrontendUrlFixer;