/**
 * Transform legacy CRM contacts to Carbide format
 * 
 * Usage: npx tsx scripts/migration/transform-contacts.ts <input.csv> <output.json>
 */

import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import type {
  LegacyContact,
  CarbideContact,
  CarbideEmail,
  CarbidePhone,
  CarbideAddress,
  ContactCustomAttributes,
  TransformResult,
  TransformError,
  TransformStats,
} from './types';
import {
  normalizePhone,
  normalizeEmail,
  parseTags,
  normalizeDate,
  toBoolean,
  toNumber,
  normalizeUrl,
  mapPhoneLabel,
  removeEmptyStrings,
  generateContactKey,
  deduplicateBy,
} from './utils';

/**
 * Transform a single legacy contact to Carbide format
 */
function transformContact(
  legacy: LegacyContact,
  rowIndex: number,
  errors: TransformError[]
): CarbideContact | null {
  // Validate required fields
  const firstName = legacy['First Name']?.trim();
  const lastName = legacy['Last Name']?.trim();
  
  if (!firstName || !lastName) {
    errors.push({
      row: rowIndex,
      field: !firstName ? 'First Name' : 'Last Name',
      value: !firstName ? legacy['First Name'] : legacy['Last Name'],
      message: 'Required field is missing or empty',
      severity: 'error',
    });
    return null;
  }
  
  // Transform emails
  const emails: CarbideEmail[] = [];
  const emailFields = ['Email', 'Email 2', 'Email 3'] as const;
  
  for (let i = 0; i < emailFields.length; i++) {
    const field = emailFields[i];
    const normalized = normalizeEmail(legacy[field]);
    if (normalized) {
      emails.push({
        value: normalized,
        label: i === 0 ? 'primary' : 'other',
        is_primary: i === 0,
      });
    } else if (legacy[field]) {
      errors.push({
        row: rowIndex,
        field,
        value: legacy[field],
        message: 'Invalid email format',
        severity: 'warning',
      });
    }
  }
  
  // Transform phones
  const phones: CarbidePhone[] = [];
  const phoneFields = ['Mobile', 'Phone', 'Phone (work)', 'Phone (other)', 'Phone (Emergency)'] as const;
  
  for (const field of phoneFields) {
    const normalized = normalizePhone(legacy[field]);
    if (normalized) {
      phones.push({
        value: normalized,
        label: mapPhoneLabel(field),
        is_primary: field === 'Mobile' || (field === 'Phone' && phones.length === 0),
      });
    }
  }
  
  // Ensure only one primary phone
  const primaryPhones = phones.filter(p => p.is_primary);
  if (primaryPhones.length > 1) {
    for (let i = 1; i < primaryPhones.length; i++) {
      const phone = phones.find(p => p === primaryPhones[i]);
      if (phone) phone.is_primary = false;
    }
  }
  
  // Warn if no contact method
  if (emails.length === 0 && phones.length === 0) {
    errors.push({
      row: rowIndex,
      field: 'contact_info',
      value: null,
      message: 'Contact has no email or phone number',
      severity: 'warning',
    });
  }
  
  // Transform address
  const addresses: CarbideAddress[] = [];
  if (legacy['Address Line 1'] || legacy['City'] || legacy['State']) {
    addresses.push({
      street1: legacy['Address Line 1']?.trim(),
      street2: legacy['Address Line 2']?.trim(),
      city: legacy['City']?.trim(),
      state: legacy['State']?.trim(),
      postal_code: legacy['ZipCode']?.trim(),
      country: legacy['Country']?.trim() || 'USA',
      label: 'primary',
    });
  }
  
  // Transform custom attributes - Personal
  const personal = removeEmptyStrings({
    favorite_food: legacy['Favorite Food']?.trim(),
    favorite_drink: legacy['Favorite Drink']?.trim(),
    coffee_order: legacy['Coffee/Starbucks Order']?.trim(),
    favorite_restaurant: legacy['Favorite Restaurant']?.trim(),
    hobbies: legacy['Hobbies']?.trim(),
    leisure_activities: legacy['Leisure Activities']?.trim(),
    goals: legacy['Personal Goals']?.trim(),
    birthday: normalizeDate(legacy['Birthday'] || legacy['DOB']),
    anniversary: normalizeDate(legacy['Anniversary Date']),
    marital_status: legacy['Marital Status']?.trim(),
    dependents: legacy['Dependents']?.trim(),
  });
  
  // Transform custom attributes - Social
  const social = removeEmptyStrings({
    linkedin: normalizeUrl(legacy['LinkedIn']),
    twitter: normalizeUrl(legacy['Twitter']),
    facebook: normalizeUrl(legacy['Facebook']),
    instagram: normalizeUrl(legacy['Instagram']),
    skype: legacy['Skype']?.trim(),
    website: normalizeUrl(legacy['Website']),
  });
  
  // Transform custom attributes - Preferences
  const preferences = removeEmptyStrings({
    email_opt_out: toBoolean(legacy['Email Opt Out']),
    sms_opt_out: toBoolean(legacy['SMS Opt Out']),
    email_opt_out_reason: legacy['Email Opt Out Reason']?.trim(),
  });
  
  // Transform custom attributes - Geo
  const geo = removeEmptyStrings({
    lat: toNumber(legacy['Latitude']),
    lng: toNumber(legacy['Longitude']),
    created_lat: toNumber(legacy['Created Latitude']),
    created_lng: toNumber(legacy['Created Longitude']),
    created_address: legacy['Created Address']?.trim(),
  });
  
  // Transform custom attributes - Legacy
  const legacyAttrs = removeEmptyStrings({
    description_916: legacy['916 Description']?.trim(),
    consent: legacy['Consent']?.trim(),
    nps: legacy['Survey Score'] || legacy['Survey Comment'] ? {
      score: toNumber(legacy['Survey Score']),
      comment: legacy['Survey Comment']?.trim(),
      completed_at: normalizeDate(legacy['Survey Completed Date']),
    } : undefined,
    salesmate_score: toNumber(legacy['Salesmate Score']),
  });
  
  // Build custom_attributes
  const customAttributes: ContactCustomAttributes = {};
  if (Object.keys(personal).length > 0) customAttributes.personal = personal as ContactCustomAttributes['personal'];
  if (Object.keys(social).length > 0) customAttributes.social = social as ContactCustomAttributes['social'];
  if (Object.keys(preferences).length > 0) customAttributes.preferences = preferences as ContactCustomAttributes['preferences'];
  if (Object.keys(geo).length > 0) customAttributes.geo = geo as ContactCustomAttributes['geo'];
  if (Object.keys(legacyAttrs).length > 0) customAttributes.legacy = legacyAttrs as ContactCustomAttributes['legacy'];
  
  return {
    first_name: firstName,
    last_name: lastName,
    emails,
    phones,
    addresses,
    job_title: legacy['Job Title']?.trim(),
    description: legacy['Description']?.trim(),
    tags: parseTags(legacy['Tags']),
    custom_attributes: customAttributes,
    _legacy_owner: legacy['Owner']?.trim(),
    _legacy_employer: legacy['Employer']?.trim(),
  };
}

/**
 * Transform all contacts from CSV file
 */
export function transformContacts(csvContent: string): TransformResult<CarbideContact> {
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as LegacyContact[];
  
  const errors: TransformError[] = [];
  const contacts: CarbideContact[] = [];
  const fieldsTransformed: Record<string, number> = {};
  
  for (let i = 0; i < records.length; i++) {
    const legacy = records[i];
    const contact = transformContact(legacy, i + 2, errors); // +2 for header row and 1-based index
    
    if (contact) {
      contacts.push(contact);
      
      // Track transformed fields
      if (contact.emails.length > 0) fieldsTransformed['emails'] = (fieldsTransformed['emails'] || 0) + 1;
      if (contact.phones.length > 0) fieldsTransformed['phones'] = (fieldsTransformed['phones'] || 0) + 1;
      if (contact.addresses.length > 0) fieldsTransformed['addresses'] = (fieldsTransformed['addresses'] || 0) + 1;
      if (contact.custom_attributes.personal) fieldsTransformed['custom_attributes.personal'] = (fieldsTransformed['custom_attributes.personal'] || 0) + 1;
      if (contact.custom_attributes.social) fieldsTransformed['custom_attributes.social'] = (fieldsTransformed['custom_attributes.social'] || 0) + 1;
      if (contact.custom_attributes.preferences) fieldsTransformed['custom_attributes.preferences'] = (fieldsTransformed['custom_attributes.preferences'] || 0) + 1;
      if (contact.custom_attributes.geo) fieldsTransformed['custom_attributes.geo'] = (fieldsTransformed['custom_attributes.geo'] || 0) + 1;
      if (contact.custom_attributes.legacy) fieldsTransformed['custom_attributes.legacy'] = (fieldsTransformed['custom_attributes.legacy'] || 0) + 1;
    }
  }
  
  // Deduplicate contacts
  const { unique, duplicates } = deduplicateBy(
    contacts,
    (c) => generateContactKey(c.first_name, c.last_name, c.emails[0]?.value)
  );
  
  if (duplicates.length > 0) {
    for (const dup of duplicates) {
      errors.push({
        row: 0, // Unknown row after dedup
        field: 'duplicate',
        value: `${dup.first_name} ${dup.last_name}`,
        message: 'Duplicate contact detected and removed',
        severity: 'warning',
      });
    }
  }
  
  const stats: TransformStats = {
    totalRows: records.length,
    successfulRows: unique.length,
    errorRows: records.length - contacts.length,
    warningCount: errors.filter(e => e.severity === 'warning').length,
    fieldsTransformed,
  };
  
  return {
    data: unique,
    errors,
    stats,
  };
}

// CLI entry point
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: npx tsx transform-contacts.ts <input.csv> <output.json>');
    process.exit(1);
  }
  
  const [inputPath, outputPath] = args;
  
  try {
    const csvContent = fs.readFileSync(path.resolve(inputPath), 'utf-8');
    const result = transformContacts(csvContent);
    
    fs.writeFileSync(
      path.resolve(outputPath),
      JSON.stringify(result, null, 2),
      'utf-8'
    );
    
    console.log('\n=== Contact Transformation Complete ===');
    console.log(`Total rows processed: ${result.stats.totalRows}`);
    console.log(`Successfully transformed: ${result.stats.successfulRows}`);
    console.log(`Errors: ${result.stats.errorRows}`);
    console.log(`Warnings: ${result.stats.warningCount}`);
    console.log('\nFields transformed:');
    for (const [field, count] of Object.entries(result.stats.fieldsTransformed)) {
      console.log(`  ${field}: ${count}`);
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

