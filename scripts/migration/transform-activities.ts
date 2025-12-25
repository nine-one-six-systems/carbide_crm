/**
 * Transform legacy CRM activities to Carbide format (Optional historical import)
 * 
 * Usage: npx tsx scripts/migration/transform-activities.ts <input.csv> <output.json>
 */

import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import type {
  LegacyActivity,
  CarbideActivity,
  TransformResult,
  TransformError,
  TransformStats,
} from './types';
import { normalizeDate } from './utils';

/**
 * Map legacy activity type to Carbide activity_type enum
 */
function mapActivityType(legacyType: string | undefined): string {
  if (!legacyType) return 'note';
  
  const normalized = legacyType.toLowerCase().trim();
  
  const mapping: Record<string, string> = {
    'call': 'call_outbound',
    'call out': 'call_outbound',
    'outbound call': 'call_outbound',
    'call in': 'call_inbound',
    'inbound call': 'call_inbound',
    'received call': 'call_inbound',
    'email': 'email_outbound',
    'email sent': 'email_outbound',
    'sent email': 'email_outbound',
    'email received': 'email_inbound',
    'received email': 'email_inbound',
    'text': 'text_outbound',
    'sms': 'text_outbound',
    'text sent': 'text_outbound',
    'text received': 'text_inbound',
    'sms received': 'text_inbound',
    'meeting': 'meeting_in_person',
    'in person': 'meeting_in_person',
    'in-person': 'meeting_in_person',
    'virtual meeting': 'meeting_virtual',
    'video call': 'meeting_virtual',
    'zoom': 'meeting_virtual',
    'teams': 'meeting_virtual',
    'note': 'note',
    'notes': 'note',
    'comment': 'note',
  };
  
  return mapping[normalized] || 'note';
}

/**
 * Transform a single legacy activity to Carbide format
 */
function transformActivity(
  legacy: LegacyActivity,
  rowIndex: number,
  errors: TransformError[]
): CarbideActivity | null {
  // Parse activity date
  const activityDate = legacy['Activity Date'];
  const occurredAt = normalizeDate(activityDate);
  
  if (!occurredAt) {
    errors.push({
      row: rowIndex,
      field: 'Activity Date',
      value: activityDate,
      message: 'Invalid or missing activity date',
      severity: 'error',
    });
    return null;
  }
  
  // Build contact identifier for matching
  const contactEmail = legacy['Contact Email']?.trim();
  const contactFirstName = legacy['Contact First Name']?.trim();
  const contactLastName = legacy['Contact Last Name']?.trim();
  
  if (!contactEmail && (!contactFirstName || !contactLastName)) {
    errors.push({
      row: rowIndex,
      field: 'contact',
      value: null,
      message: 'Activity must have contact email or full name for matching',
      severity: 'warning',
    });
  }
  
  return {
    type: mapActivityType(legacy['Activity Type']),
    subject: legacy['Subject']?.trim(),
    notes: legacy['Notes']?.trim() || 'Migrated from legacy CRM',
    occurred_at: `${occurredAt}T12:00:00Z`, // Default to noon if no time
    _contact_email: contactEmail,
    _contact_name: contactFirstName && contactLastName 
      ? `${contactFirstName} ${contactLastName}`.toLowerCase()
      : undefined,
  };
}

/**
 * Transform all activities from CSV file
 */
export function transformActivities(csvContent: string): TransformResult<CarbideActivity> {
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as LegacyActivity[];
  
  const errors: TransformError[] = [];
  const activities: CarbideActivity[] = [];
  const fieldsTransformed: Record<string, number> = {};
  
  for (let i = 0; i < records.length; i++) {
    const legacy = records[i];
    const activity = transformActivity(legacy, i + 2, errors);
    
    if (activity) {
      activities.push(activity);
      
      // Track activity types
      fieldsTransformed[activity.type] = (fieldsTransformed[activity.type] || 0) + 1;
    }
  }
  
  const stats: TransformStats = {
    totalRows: records.length,
    successfulRows: activities.length,
    errorRows: records.length - activities.length,
    warningCount: errors.filter(e => e.severity === 'warning').length,
    fieldsTransformed,
  };
  
  return {
    data: activities,
    errors,
    stats,
  };
}

// CLI entry point
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: npx tsx transform-activities.ts <input.csv> <output.json>');
    process.exit(1);
  }
  
  const [inputPath, outputPath] = args;
  
  try {
    const csvContent = fs.readFileSync(path.resolve(inputPath), 'utf-8');
    const result = transformActivities(csvContent);
    
    fs.writeFileSync(
      path.resolve(outputPath),
      JSON.stringify(result, null, 2),
      'utf-8'
    );
    
    console.log('\n=== Activity Transformation Complete ===');
    console.log(`Total rows processed: ${result.stats.totalRows}`);
    console.log(`Successfully transformed: ${result.stats.successfulRows}`);
    console.log(`Errors: ${result.stats.errorRows}`);
    console.log(`Warnings: ${result.stats.warningCount}`);
    console.log('\nActivity types:');
    for (const [type, count] of Object.entries(result.stats.fieldsTransformed)) {
      console.log(`  ${type}: ${count}`);
    }
    
    if (result.errors.length > 0) {
      console.log('\n=== Errors and Warnings ===');
      for (const error of result.errors.slice(0, 10)) {
        console.log(`  [${error.severity.toUpperCase()}] Row ${error.row}: ${error.field} - ${error.message}`);
      }
      if (result.errors.length > 10) {
        console.log(`  ... and ${result.errors.length - 10} more`);
      }
    }
    
    console.log(`\nOutput written to: ${outputPath}`);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

