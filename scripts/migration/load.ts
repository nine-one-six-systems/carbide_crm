/**
 * Load transformed data into Supabase
 * 
 * Usage: npx tsx scripts/migration/load.ts <contacts.json> [organizations.json] [activities.json]
 * 
 * Required environment variables:
 * - SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 */

import * as fs from 'fs';
import * as path from 'path';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type {
  CarbideContact,
  CarbideOrganization,
  CarbideActivity,
  TransformResult,
  LoadResult,
  LoadError,
} from './types';

// Batch size for inserts
const BATCH_SIZE = 100;

/**
 * Initialize Supabase client with service role key
 */
function initSupabase(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
  }
  
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Get or create a migration user profile
 */
async function getMigrationUser(supabase: SupabaseClient): Promise<string> {
  // Check for existing migration user
  const { data: existingUser } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', 'migration@carbide.local')
    .single();
  
  if (existingUser) {
    return existingUser.id;
  }
  
  // Create migration user in auth
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: 'migration@carbide.local',
    password: crypto.randomUUID(),
    email_confirm: true,
    user_metadata: {
      full_name: 'Migration System',
    },
  });
  
  if (authError) {
    throw new Error(`Failed to create migration user: ${authError.message}`);
  }
  
  return authUser.user.id;
}

/**
 * Load contacts into Supabase
 */
async function loadContacts(
  supabase: SupabaseClient,
  contacts: CarbideContact[],
  createdBy: string
): Promise<LoadResult> {
  const errors: LoadError[] = [];
  let inserted = 0;
  
  // Process in batches
  for (let i = 0; i < contacts.length; i += BATCH_SIZE) {
    const batch = contacts.slice(i, i + BATCH_SIZE);
    
    const records = batch.map(contact => ({
      first_name: contact.first_name,
      last_name: contact.last_name,
      emails: contact.emails,
      phones: contact.phones,
      addresses: contact.addresses,
      job_title: contact.job_title || null,
      description: contact.description || null,
      tags: contact.tags,
      avatar_url: contact.avatar_url || null,
      custom_attributes: contact.custom_attributes,
      created_by: createdBy,
    }));
    
    const { data, error } = await supabase
      .from('contacts')
      .insert(records)
      .select('id');
    
    if (error) {
      // Try individual inserts to identify failing records
      for (let j = 0; j < records.length; j++) {
        const { error: singleError } = await supabase
          .from('contacts')
          .insert(records[j]);
        
        if (singleError) {
          errors.push({
            index: i + j,
            record: batch[j],
            error: singleError.message,
          });
        } else {
          inserted++;
        }
      }
    } else {
      inserted += data?.length || 0;
    }
    
    // Progress update
    const progress = Math.min(100, Math.round((i + batch.length) / contacts.length * 100));
    process.stdout.write(`\rLoading contacts: ${progress}%`);
  }
  
  console.log(''); // New line after progress
  
  return {
    success: errors.length === 0,
    inserted,
    failed: errors.length,
    errors,
  };
}

/**
 * Load organizations into Supabase
 */
async function loadOrganizations(
  supabase: SupabaseClient,
  organizations: CarbideOrganization[],
  createdBy: string
): Promise<LoadResult> {
  const errors: LoadError[] = [];
  let inserted = 0;
  
  // Process in batches
  for (let i = 0; i < organizations.length; i += BATCH_SIZE) {
    const batch = organizations.slice(i, i + BATCH_SIZE);
    
    const records = batch.map(org => ({
      name: org.name,
      type: org.type || null,
      industry: org.industry || null,
      website: org.website || null,
      addresses: org.addresses,
      description: org.description || null,
      tags: org.tags,
      logo_url: org.logo_url || null,
      custom_attributes: org.custom_attributes,
      created_by: createdBy,
    }));
    
    const { data, error } = await supabase
      .from('organizations')
      .insert(records)
      .select('id');
    
    if (error) {
      // Try individual inserts
      for (let j = 0; j < records.length; j++) {
        const { error: singleError } = await supabase
          .from('organizations')
          .insert(records[j]);
        
        if (singleError) {
          errors.push({
            index: i + j,
            record: batch[j],
            error: singleError.message,
          });
        } else {
          inserted++;
        }
      }
    } else {
      inserted += data?.length || 0;
    }
    
    // Progress update
    const progress = Math.min(100, Math.round((i + batch.length) / organizations.length * 100));
    process.stdout.write(`\rLoading organizations: ${progress}%`);
  }
  
  console.log('');
  
  return {
    success: errors.length === 0,
    inserted,
    failed: errors.length,
    errors,
  };
}

/**
 * Load activities into Supabase
 * Requires contacts to be loaded first for matching
 */
async function loadActivities(
  supabase: SupabaseClient,
  activities: CarbideActivity[],
  loggedBy: string
): Promise<LoadResult> {
  const errors: LoadError[] = [];
  let inserted = 0;
  
  // Build contact lookup map
  console.log('Building contact lookup map...');
  const { data: contacts } = await supabase
    .from('contacts')
    .select('id, first_name, last_name, emails');
  
  const contactByEmail = new Map<string, string>();
  const contactByName = new Map<string, string>();
  
  for (const contact of contacts || []) {
    const name = `${contact.first_name} ${contact.last_name}`.toLowerCase();
    contactByName.set(name, contact.id);
    
    for (const email of contact.emails || []) {
      contactByEmail.set(email.value.toLowerCase(), contact.id);
    }
  }
  
  // Process activities
  for (let i = 0; i < activities.length; i += BATCH_SIZE) {
    const batch = activities.slice(i, i + BATCH_SIZE);
    
    const records = batch.map(activity => {
      // Find contact ID
      let contactId: string | undefined;
      
      if (activity._contact_email) {
        contactId = contactByEmail.get(activity._contact_email.toLowerCase());
      }
      
      if (!contactId && activity._contact_name) {
        contactId = contactByName.get(activity._contact_name.toLowerCase());
      }
      
      return {
        type: activity.type,
        contact_id: contactId || null,
        organization_id: activity.organization_id || null,
        subject: activity.subject || null,
        notes: activity.notes || null,
        occurred_at: activity.occurred_at,
        logged_by: loggedBy,
      };
    });
    
    // Filter out activities without a contact match (optional - can adjust based on requirements)
    const validRecords = records.filter(r => r.contact_id !== null);
    const skipped = records.length - validRecords.length;
    
    if (skipped > 0) {
      errors.push({
        index: i,
        record: `${skipped} activities in batch`,
        error: 'No matching contact found',
      });
    }
    
    if (validRecords.length > 0) {
      const { data, error } = await supabase
        .from('activities')
        .insert(validRecords)
        .select('id');
      
      if (error) {
        errors.push({
          index: i,
          record: `Batch of ${validRecords.length}`,
          error: error.message,
        });
      } else {
        inserted += data?.length || 0;
      }
    }
    
    // Progress update
    const progress = Math.min(100, Math.round((i + batch.length) / activities.length * 100));
    process.stdout.write(`\rLoading activities: ${progress}%`);
  }
  
  console.log('');
  
  return {
    success: errors.length === 0,
    inserted,
    failed: errors.length,
    errors,
  };
}

/**
 * Print load summary
 */
function printLoadSummary(name: string, result: LoadResult): void {
  console.log(`\n=== ${name} Load Summary ===`);
  console.log(`Inserted: ${result.inserted}`);
  console.log(`Failed: ${result.failed}`);
  console.log(`Success: ${result.success ? 'YES' : 'NO'}`);
  
  if (result.errors.length > 0) {
    console.log('\nErrors:');
    for (const error of result.errors.slice(0, 5)) {
      console.log(`  [${error.index}]: ${error.error}`);
    }
    if (result.errors.length > 5) {
      console.log(`  ... and ${result.errors.length - 5} more errors`);
    }
  }
}

// CLI entry point
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.error('Usage: npx tsx load.ts <contacts.json> [organizations.json] [activities.json]');
    console.error('\nRequired environment variables:');
    console.error('  SUPABASE_URL');
    console.error('  SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }
  
  console.log('=== Carbide Migration Load ===\n');
  
  // Initialize Supabase
  console.log('Initializing Supabase client...');
  const supabase = initSupabase();
  
  // Get migration user
  console.log('Getting migration user...');
  const migrationUserId = await getMigrationUser(supabase);
  console.log(`Migration user ID: ${migrationUserId}`);
  
  let hasErrors = false;
  
  // Load organizations first (if provided) for linking
  if (args[1]) {
    try {
      console.log(`\nLoading organizations from: ${args[1]}`);
      const orgsData = JSON.parse(
        fs.readFileSync(path.resolve(args[1]), 'utf-8')
      ) as TransformResult<CarbideOrganization>;
      
      const orgResult = await loadOrganizations(supabase, orgsData.data, migrationUserId);
      printLoadSummary('Organizations', orgResult);
      
      if (!orgResult.success) hasErrors = true;
    } catch (error) {
      console.error(`Error loading organizations: ${error}`);
      hasErrors = true;
    }
  }
  
  // Load contacts
  if (args[0]) {
    try {
      console.log(`\nLoading contacts from: ${args[0]}`);
      const contactsData = JSON.parse(
        fs.readFileSync(path.resolve(args[0]), 'utf-8')
      ) as TransformResult<CarbideContact>;
      
      const contactResult = await loadContacts(supabase, contactsData.data, migrationUserId);
      printLoadSummary('Contacts', contactResult);
      
      if (!contactResult.success) hasErrors = true;
    } catch (error) {
      console.error(`Error loading contacts: ${error}`);
      hasErrors = true;
    }
  }
  
  // Load activities (optional)
  if (args[2]) {
    try {
      console.log(`\nLoading activities from: ${args[2]}`);
      const activitiesData = JSON.parse(
        fs.readFileSync(path.resolve(args[2]), 'utf-8')
      ) as TransformResult<CarbideActivity>;
      
      const activityResult = await loadActivities(supabase, activitiesData.data, migrationUserId);
      printLoadSummary('Activities', activityResult);
      
      if (!activityResult.success) hasErrors = true;
    } catch (error) {
      console.error(`Error loading activities: ${error}`);
      hasErrors = true;
    }
  }
  
  console.log('\n=== Migration Load Complete ===');
  
  if (hasErrors) {
    console.log('⚠️  Completed with errors');
    process.exit(1);
  } else {
    console.log('✅ All data loaded successfully');
    process.exit(0);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

