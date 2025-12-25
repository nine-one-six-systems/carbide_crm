/**
 * Transform legacy CRM organizations to Carbide format
 * 
 * Usage: npx tsx scripts/migration/transform-organizations.ts <input.csv> <output.json>
 */

import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import type {
  LegacyOrganization,
  CarbideOrganization,
  CarbideAddress,
  OrgCustomAttributes,
  TransformResult,
  TransformError,
  TransformStats,
} from './types';
import {
  parseTags,
  toNumber,
  normalizeUrl,
  mapOrganizationType,
  removeEmptyStrings,
  generateOrgKey,
  deduplicateBy,
} from './utils';

/**
 * Transform a single legacy organization to Carbide format
 */
function transformOrganization(
  legacy: LegacyOrganization,
  rowIndex: number,
  errors: TransformError[]
): CarbideOrganization | null {
  // Validate required fields
  const name = legacy['Name - Company']?.trim();
  
  if (!name) {
    errors.push({
      row: rowIndex,
      field: 'Name - Company',
      value: legacy['Name - Company'],
      message: 'Required field is missing or empty',
      severity: 'error',
    });
    return null;
  }
  
  // Transform address
  const addresses: CarbideAddress[] = [];
  if (legacy['Address Line 1 - Company'] || legacy['City - Company'] || legacy['State - Company']) {
    addresses.push({
      street1: legacy['Address Line 1 - Company']?.trim(),
      street2: legacy['Address Line 2 - Company']?.trim(),
      city: legacy['City - Company']?.trim(),
      state: legacy['State - Company']?.trim(),
      postal_code: legacy['ZipCode - Company']?.trim(),
      country: legacy['Country - Company']?.trim() || 'USA',
      label: 'headquarters',
    });
  }
  
  // Transform custom attributes - Social
  const social = removeEmptyStrings({
    linkedin: normalizeUrl(legacy['LinkedIn - Company']),
    twitter: normalizeUrl(legacy['Twitter - Company']),
    facebook: normalizeUrl(legacy['Facebook - Company']),
    instagram: normalizeUrl(legacy['Instagram - Company']),
    skype: legacy['Skype - Company']?.trim(),
  });
  
  // Transform custom attributes - Geo
  const geo = removeEmptyStrings({
    lat: toNumber(legacy['Latitude - Company']),
    lng: toNumber(legacy['Longitude - Company']),
    created_lat: toNumber(legacy['Created Latitude - Company']),
    created_lng: toNumber(legacy['Created Longitude - Company']),
    created_address: legacy['Created Address - Company']?.trim(),
  });
  
  // Transform custom attributes - Operations
  const operations = removeEmptyStrings({
    vehicles: toNumber(legacy['Vehicles - Company']),
    location_count: toNumber(legacy['Number of Locations - Company']),
    timezone: legacy['Time Zone - Company']?.trim(),
  });
  
  // Transform custom attributes - Identifiers
  const identifiers = removeEmptyStrings({
    site_code: legacy['Site Code - Company']?.trim(),
  });
  
  // Transform custom attributes - Contacts (POCs)
  const contacts = removeEmptyStrings({
    admin_poc: legacy['Admin POC - Company']?.trim(),
    onsite_poc: legacy['On Site POC - Company']?.trim(),
  });
  
  // Transform custom attributes - Legacy
  const legacyAttrs = removeEmptyStrings({
    pharmacy_status: legacy['Pharmacy Status - Company']?.trim(),
  });
  
  // Build custom_attributes
  const customAttributes: OrgCustomAttributes = {};
  if (Object.keys(social).length > 0) customAttributes.social = social as OrgCustomAttributes['social'];
  if (Object.keys(geo).length > 0) customAttributes.geo = geo as OrgCustomAttributes['geo'];
  if (Object.keys(operations).length > 0) customAttributes.operations = operations as OrgCustomAttributes['operations'];
  if (Object.keys(identifiers).length > 0) customAttributes.identifiers = identifiers as OrgCustomAttributes['identifiers'];
  if (Object.keys(contacts).length > 0) customAttributes.contacts = contacts as OrgCustomAttributes['contacts'];
  if (Object.keys(legacyAttrs).length > 0) customAttributes.legacy = legacyAttrs as OrgCustomAttributes['legacy'];
  
  // Map organization type
  const orgType = mapOrganizationType(legacy['Type - Company']);
  
  // Normalize website
  const website = normalizeUrl(legacy['Website - Company']);
  if (legacy['Website - Company'] && !website) {
    errors.push({
      row: rowIndex,
      field: 'Website - Company',
      value: legacy['Website - Company'],
      message: 'Invalid website URL format',
      severity: 'warning',
    });
  }
  
  return {
    name,
    type: orgType,
    industry: legacy['Industry']?.trim(),
    website,
    addresses,
    description: legacy['Description - Company']?.trim(),
    tags: parseTags(legacy['Tags - Company']),
    custom_attributes: customAttributes,
    _legacy_owner: legacy['Owner - Company']?.trim(),
  };
}

/**
 * Transform all organizations from CSV file
 */
export function transformOrganizations(csvContent: string): TransformResult<CarbideOrganization> {
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as LegacyOrganization[];
  
  const errors: TransformError[] = [];
  const organizations: CarbideOrganization[] = [];
  const fieldsTransformed: Record<string, number> = {};
  
  for (let i = 0; i < records.length; i++) {
    const legacy = records[i];
    const org = transformOrganization(legacy, i + 2, errors); // +2 for header row and 1-based index
    
    if (org) {
      organizations.push(org);
      
      // Track transformed fields
      if (org.type) fieldsTransformed['type'] = (fieldsTransformed['type'] || 0) + 1;
      if (org.industry) fieldsTransformed['industry'] = (fieldsTransformed['industry'] || 0) + 1;
      if (org.website) fieldsTransformed['website'] = (fieldsTransformed['website'] || 0) + 1;
      if (org.addresses.length > 0) fieldsTransformed['addresses'] = (fieldsTransformed['addresses'] || 0) + 1;
      if (org.custom_attributes.social) fieldsTransformed['custom_attributes.social'] = (fieldsTransformed['custom_attributes.social'] || 0) + 1;
      if (org.custom_attributes.geo) fieldsTransformed['custom_attributes.geo'] = (fieldsTransformed['custom_attributes.geo'] || 0) + 1;
      if (org.custom_attributes.operations) fieldsTransformed['custom_attributes.operations'] = (fieldsTransformed['custom_attributes.operations'] || 0) + 1;
      if (org.custom_attributes.identifiers) fieldsTransformed['custom_attributes.identifiers'] = (fieldsTransformed['custom_attributes.identifiers'] || 0) + 1;
      if (org.custom_attributes.contacts) fieldsTransformed['custom_attributes.contacts'] = (fieldsTransformed['custom_attributes.contacts'] || 0) + 1;
    }
  }
  
  // Deduplicate organizations by name
  const { unique, duplicates } = deduplicateBy(
    organizations,
    (o) => generateOrgKey(o.name)
  );
  
  if (duplicates.length > 0) {
    for (const dup of duplicates) {
      errors.push({
        row: 0, // Unknown row after dedup
        field: 'duplicate',
        value: dup.name,
        message: 'Duplicate organization detected and removed',
        severity: 'warning',
      });
    }
  }
  
  const stats: TransformStats = {
    totalRows: records.length,
    successfulRows: unique.length,
    errorRows: records.length - organizations.length,
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
    console.error('Usage: npx tsx transform-organizations.ts <input.csv> <output.json>');
    process.exit(1);
  }
  
  const [inputPath, outputPath] = args;
  
  try {
    const csvContent = fs.readFileSync(path.resolve(inputPath), 'utf-8');
    const result = transformOrganizations(csvContent);
    
    fs.writeFileSync(
      path.resolve(outputPath),
      JSON.stringify(result, null, 2),
      'utf-8'
    );
    
    console.log('\n=== Organization Transformation Complete ===');
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

