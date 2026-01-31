#!/usr/bin/env node

/**
 * CSS AUDITOR - Admin Dashboard CSS Conflict & Quality Analyzer
 * 
 * Scans all CSS files in the admin directory and detects:
 * - Conflicting rules (same property defined multiple times)
 * - Redundant CSS (duplicate selectors/rules)
 * - Imbalanced layouts (competing grid/flex definitions)
 * - Missing CSS variables usage
 * - Inconsistent spacing values
 * - Z-index conflicts
 * - Specificity wars
 */

const fs = require('fs');
const path = require('path');
const css = require('css');

class CSSAuditor {
  constructor(adminDir) {
    this.adminDir = adminDir;
    this.cssFiles = [];
    this.parsedCSS = [];
    this.conflicts = [];
    this.redundancies = [];
    this.imbalances = [];
    this.warnings = [];
    this.stats = {
      totalRules: 0,
      totalFiles: 0,
      conflictCount: 0,
      redundancyCount: 0,
      imbalanceCount: 0
    };
  }

  // Scan directory for CSS files
  scanDirectory(dir, relativePath = '') {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const relPath = path.join(relativePath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        this.scanDirectory(fullPath, relPath);
      } else if (item.endsWith('.css')) {
        this.cssFiles.push({
          name: item,
          path: fullPath,
          relativePath: relPath
        });
      }
    });
  }

  // Parse all CSS files
  parseCSS() {
    this.cssFiles.forEach(file => {
      try {
        const content = fs.readFileSync(file.path, 'utf8');
        const ast = css.parse(content, { source: file.relativePath });
        
        this.parsedCSS.push({
          file: file.relativePath,
          ast: ast,
          content: content
        });
        
        this.stats.totalFiles++;
      } catch (error) {
        this.warnings.push({
          type: 'PARSE_ERROR',
          file: file.relativePath,
          message: error.message
        });
      }
    });
  }

  // Extract all rules with their properties
  extractRules() {
    const allRules = [];
    
    this.parsedCSS.forEach(parsed => {
      if (!parsed.ast.stylesheet) return;
      
      const rules = parsed.ast.stylesheet.rules;
      rules.forEach(rule => {
        if (rule.type === 'rule') {
          this.stats.totalRules++;
          
          rule.selectors.forEach(selector => {
            rule.declarations?.forEach(decl => {
              if (decl.type === 'declaration') {
                allRules.push({
                  file: parsed.file,
                  selector: selector,
                  property: decl.property,
                  value: decl.value,
                  position: rule.position
                });
              }
            });
          });
        } else if (rule.type === 'media') {
          // Handle media queries
          rule.rules?.forEach(mediaRule => {
            if (mediaRule.type === 'rule') {
              mediaRule.selectors?.forEach(selector => {
                mediaRule.declarations?.forEach(decl => {
                  if (decl.type === 'declaration') {
                    allRules.push({
                      file: parsed.file,
                      selector: selector,
                      property: decl.property,
                      value: decl.value,
                      media: rule.media,
                      position: mediaRule.position
                    });
                  }
                });
              });
            }
          });
        }
      });
    });
    
    return allRules;
  }

  // Detect conflicting rules (same selector, same property, different files)
  detectConflicts() {
    const rules = this.extractRules();
    const selectorPropertyMap = {};
    
    rules.forEach(rule => {
      const key = `${rule.selector}::${rule.property}`;
      
      if (!selectorPropertyMap[key]) {
        selectorPropertyMap[key] = [];
      }
      
      selectorPropertyMap[key].push(rule);
    });
    
    // Check for conflicts
    Object.entries(selectorPropertyMap).forEach(([key, instances]) => {
      if (instances.length > 1) {
        const files = [...new Set(instances.map(i => i.file))];
        
        if (files.length > 1) {
          this.conflicts.push({
            severity: 'HIGH',
            type: 'CROSS_FILE_CONFLICT',
            selector: instances[0].selector,
            property: instances[0].property,
            instances: instances.map(i => ({
              file: i.file,
              value: i.value,
              line: i.position?.start.line
            }))
          });
          this.stats.conflictCount++;
        }
      }
    });
  }

  // Detect layout imbalances (competing grid/flex/display definitions)
  detectImbalances() {
    const rules = this.extractRules();
    const layoutProperties = [
      'display', 'grid-template-columns', 'flex-direction', 
      'padding', 'margin', 'max-width', 'width'
    ];
    
    // Group by selector
    const selectorMap = {};
    rules.forEach(rule => {
      if (!selectorMap[rule.selector]) {
        selectorMap[rule.selector] = [];
      }
      selectorMap[rule.selector].push(rule);
    });
    
    // Check for layout conflicts
    Object.entries(selectorMap).forEach(([selector, instances]) => {
      const layoutRules = instances.filter(i => 
        layoutProperties.includes(i.property)
      );
      
      if (layoutRules.length > 0) {
        const files = [...new Set(layoutRules.map(i => i.file))];
        
        if (files.length > 1) {
          const displayRules = layoutRules.filter(r => r.property === 'display');
          const gridRules = layoutRules.filter(r => r.property.includes('grid'));
          const flexRules = layoutRules.filter(r => r.property.includes('flex'));
          const paddingRules = layoutRules.filter(r => r.property === 'padding');
          const widthRules = layoutRules.filter(r => r.property === 'max-width' || r.property === 'width');
          
          if (displayRules.length > 1 || gridRules.length > 1 || 
              flexRules.length > 1 || paddingRules.length > 1 || 
              widthRules.length > 1) {
            this.imbalances.push({
              severity: 'HIGH',
              type: 'LAYOUT_IMBALANCE',
              selector: selector,
              issue: 'Multiple files defining layout properties',
              conflicts: {
                display: displayRules.length > 1 ? displayRules.map(r => ({ file: r.file, value: r.value })) : null,
                grid: gridRules.length > 1 ? gridRules.map(r => ({ file: r.file, value: r.value })) : null,
                flex: flexRules.length > 1 ? flexRules.map(r => ({ file: r.file, value: r.value })) : null,
                padding: paddingRules.length > 1 ? paddingRules.map(r => ({ file: r.file, value: r.value })) : null,
                width: widthRules.length > 1 ? widthRules.map(r => ({ file: r.file, value: r.value })) : null
              }
            });
            this.stats.imbalanceCount++;
          }
        }
      }
    });
  }

  // Detect redundant CSS (duplicate selectors with same properties)
  detectRedundancies() {
    const rules = this.extractRules();
    const ruleMap = {};
    
    rules.forEach(rule => {
      const key = `${rule.selector}::${rule.property}::${rule.value}`;
      
      if (!ruleMap[key]) {
        ruleMap[key] = [];
      }
      
      ruleMap[key].push(rule);
    });
    
    Object.entries(ruleMap).forEach(([key, instances]) => {
      if (instances.length > 1) {
        const files = [...new Set(instances.map(i => i.file))];
        
        if (files.length > 1) {
          this.redundancies.push({
            severity: 'MEDIUM',
            type: 'DUPLICATE_RULE',
            selector: instances[0].selector,
            property: instances[0].property,
            value: instances[0].value,
            files: files
          });
          this.stats.redundancyCount++;
        }
      }
    });
  }

  // Check for hardcoded values instead of CSS variables
  detectHardcodedValues() {
    const rules = this.extractRules();
    const hardcodedSpacing = /^\d+(\.\d+)?(px|rem|em)$/;
    const hardcodedColors = /^#[0-9a-f]{3,6}$|^rgb|^rgba/i;
    
    const spacingProperties = ['padding', 'margin', 'gap', 'top', 'bottom', 'left', 'right'];
    const colorProperties = ['color', 'background', 'background-color', 'border-color'];
    
    rules.forEach(rule => {
      if (spacingProperties.includes(rule.property) && hardcodedSpacing.test(rule.value.trim())) {
        if (!rule.value.includes('var(--space')) {
          this.warnings.push({
            severity: 'LOW',
            type: 'HARDCODED_SPACING',
            file: rule.file,
            selector: rule.selector,
            property: rule.property,
            value: rule.value,
            suggestion: 'Use CSS variables like var(--space-md) for consistent spacing'
          });
        }
      }
      
      if (colorProperties.includes(rule.property) && hardcodedColors.test(rule.value.trim())) {
        if (!rule.value.includes('var(--')) {
          this.warnings.push({
            severity: 'LOW',
            type: 'HARDCODED_COLOR',
            file: rule.file,
            selector: rule.selector,
            property: rule.property,
            value: rule.value,
            suggestion: 'Use CSS variables for consistent theming'
          });
        }
      }
    });
  }

  // Generate comprehensive report
  generateReport() {
    const report = {
      summary: {
        ...this.stats,
        scanDate: new Date().toISOString(),
        filesScanned: this.cssFiles.map(f => f.relativePath)
      },
      conflicts: this.conflicts,
      imbalances: this.imbalances,
      redundancies: this.redundancies,
      warnings: this.warnings,
      recommendations: this.generateRecommendations()
    };
    
    return report;
  }

  // Generate actionable recommendations
  generateRecommendations() {
    const recommendations = [];
    
    if (this.conflicts.length > 0) {
      recommendations.push({
        priority: 'CRITICAL',
        issue: 'Cross-file CSS conflicts detected',
        action: 'Move all layout rules to Admin.css. Component files should only contain visual styles.',
        affectedFiles: [...new Set(this.conflicts.map(c => c.instances.map(i => i.file)).flat())]
      });
    }
    
    if (this.imbalances.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        issue: 'Layout imbalance detected - multiple files controlling same layout',
        action: 'Establish single source of truth: Admin.css for layout, component CSS for appearance only.',
        affectedSelectors: [...new Set(this.imbalances.map(i => i.selector))]
      });
    }
    
    if (this.redundancies.length > 5) {
      recommendations.push({
        priority: 'MEDIUM',
        issue: `${this.redundancies.length} redundant rules found`,
        action: 'Consolidate duplicate rules into a shared CSS file or use CSS variables.',
        count: this.redundancies.length
      });
    }
    
    const hardcodedWarnings = this.warnings.filter(w => 
      w.type === 'HARDCODED_SPACING' || w.type === 'HARDCODED_COLOR'
    );
    
    if (hardcodedWarnings.length > 10) {
      recommendations.push({
        priority: 'LOW',
        issue: `${hardcodedWarnings.length} hardcoded values found`,
        action: 'Replace hardcoded spacing and colors with CSS variables for consistency.',
        count: hardcodedWarnings.length
      });
    }
    
    return recommendations;
  }

  // Pretty print report to console
  printReport(report) {
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║         CSS AUDITOR - ADMIN DASHBOARD ANALYSIS               ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');
    
    console.log('📊 SUMMARY');
    console.log('─────────────────────────────────────────────────────────────');
    console.log(`Files Scanned:    ${report.summary.totalFiles}`);
    console.log(`Total CSS Rules:  ${report.summary.totalRules}`);
    console.log(`Conflicts:        ${report.summary.conflictCount} 🔴`);
    console.log(`Imbalances:       ${report.summary.imbalanceCount} 🟠`);
    console.log(`Redundancies:     ${report.summary.redundancyCount} 🟡`);
    console.log(`Warnings:         ${report.warnings.length} ⚠️`);
    console.log('\n');
    
    if (report.conflicts.length > 0) {
      console.log('🔴 CRITICAL - CROSS-FILE CONFLICTS');
      console.log('─────────────────────────────────────────────────────────────');
      report.conflicts.slice(0, 10).forEach(conflict => {
        console.log(`\nSelector: ${conflict.selector}`);
        console.log(`Property: ${conflict.property}`);
        conflict.instances.forEach(inst => {
          console.log(`  📄 ${inst.file}: ${inst.value} (line ${inst.line || 'unknown'})`);
        });
      });
      if (report.conflicts.length > 10) {
        console.log(`\n... and ${report.conflicts.length - 10} more conflicts`);
      }
      console.log('\n');
    }
    
    if (report.imbalances.length > 0) {
      console.log('🟠 HIGH - LAYOUT IMBALANCES');
      console.log('─────────────────────────────────────────────────────────────');
      report.imbalances.slice(0, 5).forEach(imbalance => {
        console.log(`\nSelector: ${imbalance.selector}`);
        console.log(`Issue: ${imbalance.issue}`);
        Object.entries(imbalance.conflicts).forEach(([prop, conflicts]) => {
          if (conflicts) {
            console.log(`  ${prop}:`);
            conflicts.forEach(c => {
              console.log(`    📄 ${c.file}: ${c.value}`);
            });
          }
        });
      });
      if (report.imbalances.length > 5) {
        console.log(`\n... and ${report.imbalances.length - 5} more imbalances`);
      }
      console.log('\n');
    }
    
    if (report.recommendations.length > 0) {
      console.log('💡 RECOMMENDATIONS');
      console.log('─────────────────────────────────────────────────────────────');
      report.recommendations.forEach((rec, idx) => {
        console.log(`\n${idx + 1}. [${rec.priority}] ${rec.issue}`);
        console.log(`   Action: ${rec.action}`);
        if (rec.affectedFiles) {
          console.log(`   Affected: ${rec.affectedFiles.slice(0, 3).join(', ')}${rec.affectedFiles.length > 3 ? '...' : ''}`);
        }
      });
      console.log('\n');
    }
    
    console.log('📝 FULL REPORT SAVED TO: css-audit-report.json\n');
  }

  // Run full audit
  async audit() {
    console.log('🔍 Scanning CSS files...');
    this.scanDirectory(this.adminDir);
    
    console.log(`📚 Found ${this.cssFiles.length} CSS files`);
    console.log('🔬 Parsing CSS...');
    this.parseCSS();
    
    console.log('🔍 Detecting conflicts...');
    this.detectConflicts();
    
    console.log('⚖️  Checking layout imbalances...');
    this.detectImbalances();
    
    console.log('🔄 Finding redundancies...');
    this.detectRedundancies();
    
    console.log('🎨 Checking hardcoded values...');
    this.detectHardcodedValues();
    
    const report = this.generateReport();
    
    // Save report to file
    fs.writeFileSync(
      path.join(process.cwd(), 'css-audit-report.json'),
      JSON.stringify(report, null, 2)
    );
    
    this.printReport(report);
    
    return report;
  }
}

// CLI Usage
if (require.main === module) {
  const adminPath = process.argv[2] || path.join(process.cwd(), 'src', 'app', 'admin');
  
  if (!fs.existsSync(adminPath)) {
    console.error(`❌ Error: Admin directory not found at ${adminPath}`);
    console.log('Usage: node cssauditor.js [path-to-admin-directory]');
    process.exit(1);
  }
  
  const auditor = new CSSAuditor(adminPath);
  auditor.audit().then(report => {
    if (report.summary.conflictCount > 0 || report.summary.imbalanceCount > 0) {
      process.exit(1);
    }
  });
}

module.exports = CSSAuditor;