#!/usr/bin/env npx tsx
/**
 * Carbide CRM Migration Orchestrator
 * 
 * Full migration workflow: Transform -> Validate -> Load
 * 
 * Usage: npx tsx scripts/migration/run-migration.ts [options]
 * 
 * Options:
 *   --contacts <file>       Path to legacy contacts CSV
 *   --organizations <file>  Path to legacy organizations CSV
 *   --activities <file>     Path to legacy activities CSV (optional)
 *   --output-dir <dir>      Directory for transformed JSON files (default: ./migration-output)
 *   --dry-run               Transform and validate only, don't load
 *   --skip-validation       Skip validation step
 *   --help                  Show this help message
 * 
 * Required environment variables for loading:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import * as fs from 'fs';
import * as path from 'path';
import { transformContacts } from './transform-contacts';
import { transformOrganizations } from './transform-organizations';
import { transformActivities } from './transform-activities';
import { validateContacts, validateOrganizations, validateActivities } from './validate';

interface MigrationOptions {
  contactsFile?: string;
  organizationsFile?: string;
  activitiesFile?: string;
  outputDir: string;
  dryRun: boolean;
  skipValidation: boolean;
}

function parseArgs(): MigrationOptions {
  const args = process.argv.slice(2);
  const options: MigrationOptions = {
    outputDir: './migration-output',
    dryRun: false,
    skipValidation: false,
  };
  
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--contacts':
        options.contactsFile = args[++i];
        break;
      case '--organizations':
        options.organizationsFile = args[++i];
        break;
      case '--activities':
        options.activitiesFile = args[++i];
        break;
      case '--output-dir':
        options.outputDir = args[++i];
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--skip-validation':
        options.skipValidation = true;
        break;
      case '--help':
        printHelp();
        process.exit(0);
      default:
        if (args[i].startsWith('-')) {
          console.error(`Unknown option: ${args[i]}`);
          process.exit(1);
        }
    }
  }
  
  return options;
}

function printHelp(): void {
  console.log(`
Carbide CRM Migration Orchestrator

Full migration workflow: Transform -> Validate -> Load

Usage: npx tsx scripts/migration/run-migration.ts [options]

Options:
  --contacts <file>       Path to legacy contacts CSV
  --organizations <file>  Path to legacy organizations CSV
  --activities <file>     Path to legacy activities CSV (optional)
  --output-dir <dir>      Directory for transformed JSON files (default: ./migration-output)
  --dry-run               Transform and validate only, don't load
  --skip-validation       Skip validation step
  --help                  Show this help message

Required environment variables for loading:
  SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY

Example:
  npx tsx scripts/migration/run-migration.ts \\
    --contacts legacy-contacts.csv \\
    --organizations legacy-orgs.csv \\
    --output-dir ./migration-output \\
    --dry-run
`);
}

function printBanner(): void {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                  CARBIDE CRM MIGRATION                        ║
║                  Legacy CRM → Carbide                         ║
╚═══════════════════════════════════════════════════════════════╝
`);
}

async function runMigration(options: MigrationOptions): Promise<void> {
  printBanner();
  
  // Ensure output directory exists
  if (!fs.existsSync(options.outputDir)) {
    fs.mkdirSync(options.outputDir, { recursive: true });
  }
  
  let hasErrors = false;
  const outputFiles: string[] = [];
  
  // =========================================================================
  // STEP 1: TRANSFORM
  // =========================================================================
  console.log('\n📋 STEP 1: TRANSFORM\n');
  
  // Transform contacts
  if (options.contactsFile) {
    console.log(`Transforming contacts from: ${options.contactsFile}`);
    
    try {
      const csvContent = fs.readFileSync(path.resolve(options.contactsFile), 'utf-8');
      const result = transformContacts(csvContent);
      
      const outputPath = path.join(options.outputDir, 'contacts.json');
      fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
      outputFiles.push(outputPath);
      
      console.log(`  ✓ Transformed ${result.stats.successfulRows}/${result.stats.totalRows} contacts`);
      console.log(`    Errors: ${result.stats.errorRows}, Warnings: ${result.stats.warningCount}`);
      console.log(`    Output: ${outputPath}`);
      
      if (result.stats.errorRows > 0) {
        console.log('    ⚠️  Some contacts had errors and were skipped');
      }
    } catch (error) {
      console.error(`  ✗ Failed to transform contacts: ${error}`);
      hasErrors = true;
    }
  }
  
  // Transform organizations
  if (options.organizationsFile) {
    console.log(`\nTransforming organizations from: ${options.organizationsFile}`);
    
    try {
      const csvContent = fs.readFileSync(path.resolve(options.organizationsFile), 'utf-8');
      const result = transformOrganizations(csvContent);
      
      const outputPath = path.join(options.outputDir, 'organizations.json');
      fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
      outputFiles.push(outputPath);
      
      console.log(`  ✓ Transformed ${result.stats.successfulRows}/${result.stats.totalRows} organizations`);
      console.log(`    Errors: ${result.stats.errorRows}, Warnings: ${result.stats.warningCount}`);
      console.log(`    Output: ${outputPath}`);
    } catch (error) {
      console.error(`  ✗ Failed to transform organizations: ${error}`);
      hasErrors = true;
    }
  }
  
  // Transform activities
  if (options.activitiesFile) {
    console.log(`\nTransforming activities from: ${options.activitiesFile}`);
    
    try {
      const csvContent = fs.readFileSync(path.resolve(options.activitiesFile), 'utf-8');
      const result = transformActivities(csvContent);
      
      const outputPath = path.join(options.outputDir, 'activities.json');
      fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
      outputFiles.push(outputPath);
      
      console.log(`  ✓ Transformed ${result.stats.successfulRows}/${result.stats.totalRows} activities`);
      console.log(`    Errors: ${result.stats.errorRows}, Warnings: ${result.stats.warningCount}`);
      console.log(`    Output: ${outputPath}`);
    } catch (error) {
      console.error(`  ✗ Failed to transform activities: ${error}`);
      hasErrors = true;
    }
  }
  
  if (outputFiles.length === 0) {
    console.log('\n⚠️  No input files specified. Use --help to see available options.');
    process.exit(1);
  }
  
  // =========================================================================
  // STEP 2: VALIDATE
  // =========================================================================
  if (!options.skipValidation) {
    console.log('\n\n✅ STEP 2: VALIDATE\n');
    
    const contactsOutputPath = path.join(options.outputDir, 'contacts.json');
    const orgsOutputPath = path.join(options.outputDir, 'organizations.json');
    const activitiesOutputPath = path.join(options.outputDir, 'activities.json');
    
    // Validate contacts
    if (fs.existsSync(contactsOutputPath)) {
      console.log('Validating contacts...');
      const data = JSON.parse(fs.readFileSync(contactsOutputPath, 'utf-8'));
      const validation = validateContacts(data);
      
      console.log(`  Records: ${data.data.length}`);
      console.log(`  Valid: ${validation.isValid ? 'YES' : 'NO'}`);
      console.log(`  Errors: ${validation.errors.length}, Warnings: ${validation.warnings.length}`);
      
      if (!validation.isValid) {
        hasErrors = true;
        console.log('  ❌ Contacts validation FAILED');
      } else {
        console.log('  ✓ Contacts validation passed');
      }
    }
    
    // Validate organizations
    if (fs.existsSync(orgsOutputPath)) {
      console.log('\nValidating organizations...');
      const data = JSON.parse(fs.readFileSync(orgsOutputPath, 'utf-8'));
      const validation = validateOrganizations(data);
      
      console.log(`  Records: ${data.data.length}`);
      console.log(`  Valid: ${validation.isValid ? 'YES' : 'NO'}`);
      console.log(`  Errors: ${validation.errors.length}, Warnings: ${validation.warnings.length}`);
      
      if (!validation.isValid) {
        hasErrors = true;
        console.log('  ❌ Organizations validation FAILED');
      } else {
        console.log('  ✓ Organizations validation passed');
      }
    }
    
    // Validate activities
    if (fs.existsSync(activitiesOutputPath)) {
      console.log('\nValidating activities...');
      const data = JSON.parse(fs.readFileSync(activitiesOutputPath, 'utf-8'));
      const validation = validateActivities(data);
      
      console.log(`  Records: ${data.data.length}`);
      console.log(`  Valid: ${validation.isValid ? 'YES' : 'NO'}`);
      console.log(`  Errors: ${validation.errors.length}, Warnings: ${validation.warnings.length}`);
      
      if (!validation.isValid) {
        hasErrors = true;
        console.log('  ❌ Activities validation FAILED');
      } else {
        console.log('  ✓ Activities validation passed');
      }
    }
  } else {
    console.log('\n\n⏭️  STEP 2: VALIDATE (skipped)\n');
  }
  
  // =========================================================================
  // STEP 3: LOAD
  // =========================================================================
  if (options.dryRun) {
    console.log('\n\n🔍 STEP 3: LOAD (dry-run mode - skipped)\n');
    console.log('To load data into Supabase, run without --dry-run flag.');
    console.log('\nTransformed files ready for loading:');
    for (const file of outputFiles) {
      console.log(`  - ${file}`);
    }
  } else if (hasErrors) {
    console.log('\n\n❌ STEP 3: LOAD (skipped due to errors)\n');
    console.log('Fix the errors above and re-run the migration.');
  } else {
    console.log('\n\n🚀 STEP 3: LOAD\n');
    
    // Check for required environment variables
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log('⚠️  Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
      console.log('   Set these environment variables and re-run, or use --dry-run');
      process.exit(1);
    }
    
    // Dynamically import and run loader
    const { default: load } = await import('./load');
    console.log('Loading data into Supabase...');
    console.log('(See load.ts output above for details)');
  }
  
  // =========================================================================
  // SUMMARY
  // =========================================================================
  console.log('\n\n═══════════════════════════════════════════════════════════════');
  console.log('                      MIGRATION SUMMARY                         ');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  console.log(`Mode: ${options.dryRun ? 'DRY RUN' : 'FULL MIGRATION'}`);
  console.log(`Output directory: ${options.outputDir}`);
  console.log(`Status: ${hasErrors ? '❌ COMPLETED WITH ERRORS' : '✅ SUCCESS'}`);
  
  if (options.dryRun && !hasErrors) {
    console.log('\nNext steps:');
    console.log('1. Review the transformed JSON files in the output directory');
    console.log('2. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables');
    console.log('3. Re-run without --dry-run to load data into Supabase');
  }
  
  console.log('');
  
  process.exit(hasErrors ? 1 : 0);
}

// Main entry point
const options = parseArgs();
runMigration(options).catch(error => {
  console.error('\nFatal error:', error);
  process.exit(1);
});

