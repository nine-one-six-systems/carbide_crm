/**
 * Validate transformed data before loading into Supabase
 * 
 * Usage: npx tsx scripts/migration/validate.ts <contacts.json> <organizations.json>
 */

import * as fs from 'fs';
import * as path from 'path';
import type {
  CarbideContact,
  CarbideOrganization,
  CarbideActivity,
  TransformResult,
  ValidationResult,
  ValidationError,
  ValidationWarning,
} from './types';
import { isValidEmail } from './utils';

/**
 * Validate a contact record
 */
function validateContact(
  contact: CarbideContact,
  index: number,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): boolean {
  let isValid = true;
  
  // Required fields
  if (!contact.first_name || contact.first_name.trim().length === 0) {
    errors.push({
      index,
      field: 'first_name',
      message: 'First name is required',
      value: contact.first_name,
    });
    isValid = false;
  }
  
  if (!contact.last_name || contact.last_name.trim().length === 0) {
    errors.push({
      index,
      field: 'last_name',
      message: 'Last name is required',
      value: contact.last_name,
    });
    isValid = false;
  }
  
  // Validate emails
  for (const email of contact.emails) {
    if (!isValidEmail(email.value)) {
      errors.push({
        index,
        field: 'emails',
        message: `Invalid email format: ${email.value}`,
        value: email.value,
      });
      isValid = false;
    }
  }
  
  // Validate phone format (basic)
  for (const phone of contact.phones) {
    if (phone.value.replace(/\D/g, '').length < 10) {
      warnings.push({
        index,
        field: 'phones',
        message: `Phone number may be incomplete: ${phone.value}`,
        value: phone.value,
      });
    }
  }
  
  // Warn if no contact method
  if (contact.emails.length === 0 && contact.phones.length === 0) {
    warnings.push({
      index,
      field: 'contact_info',
      message: 'Contact has no email or phone number',
      value: null,
    });
  }
  
  // Validate custom attributes
  if (contact.custom_attributes.personal?.birthday) {
    const birthday = new Date(contact.custom_attributes.personal.birthday);
    if (isNaN(birthday.getTime())) {
      warnings.push({
        index,
        field: 'custom_attributes.personal.birthday',
        message: 'Invalid birthday date format',
        value: contact.custom_attributes.personal.birthday,
      });
    }
  }
  
  // Validate geo coordinates
  if (contact.custom_attributes.geo) {
    const { lat, lng } = contact.custom_attributes.geo;
    if (lat !== undefined && (lat < -90 || lat > 90)) {
      warnings.push({
        index,
        field: 'custom_attributes.geo.lat',
        message: 'Latitude must be between -90 and 90',
        value: lat,
      });
    }
    if (lng !== undefined && (lng < -180 || lng > 180)) {
      warnings.push({
        index,
        field: 'custom_attributes.geo.lng',
        message: 'Longitude must be between -180 and 180',
        value: lng,
      });
    }
  }
  
  return isValid;
}

/**
 * Validate an organization record
 */
function validateOrganization(
  org: CarbideOrganization,
  index: number,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): boolean {
  let isValid = true;
  
  // Required fields
  if (!org.name || org.name.trim().length === 0) {
    errors.push({
      index,
      field: 'name',
      message: 'Organization name is required',
      value: org.name,
    });
    isValid = false;
  }
  
  // Validate type enum
  const validTypes = ['company', 'fund', 'agency', 'non_profit', 'government', 'other'];
  if (org.type && !validTypes.includes(org.type)) {
    errors.push({
      index,
      field: 'type',
      message: `Invalid organization type: ${org.type}`,
      value: org.type,
    });
    isValid = false;
  }
  
  // Validate website URL
  if (org.website) {
    try {
      new URL(org.website);
    } catch {
      warnings.push({
        index,
        field: 'website',
        message: 'Invalid website URL',
        value: org.website,
      });
    }
  }
  
  // Validate geo coordinates
  if (org.custom_attributes.geo) {
    const { lat, lng } = org.custom_attributes.geo;
    if (lat !== undefined && (lat < -90 || lat > 90)) {
      warnings.push({
        index,
        field: 'custom_attributes.geo.lat',
        message: 'Latitude must be between -90 and 90',
        value: lat,
      });
    }
    if (lng !== undefined && (lng < -180 || lng > 180)) {
      warnings.push({
        index,
        field: 'custom_attributes.geo.lng',
        message: 'Longitude must be between -180 and 180',
        value: lng,
      });
    }
  }
  
  return isValid;
}

/**
 * Validate an activity record
 */
function validateActivity(
  activity: CarbideActivity,
  index: number,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): boolean {
  let isValid = true;
  
  // Required fields
  if (!activity.type) {
    errors.push({
      index,
      field: 'type',
      message: 'Activity type is required',
      value: activity.type,
    });
    isValid = false;
  }
  
  if (!activity.occurred_at) {
    errors.push({
      index,
      field: 'occurred_at',
      message: 'Activity date is required',
      value: activity.occurred_at,
    });
    isValid = false;
  } else {
    const date = new Date(activity.occurred_at);
    if (isNaN(date.getTime())) {
      errors.push({
        index,
        field: 'occurred_at',
        message: 'Invalid date format',
        value: activity.occurred_at,
      });
      isValid = false;
    }
  }
  
  // Warn if no contact identifier
  if (!activity._contact_email && !activity._contact_name) {
    warnings.push({
      index,
      field: 'contact',
      message: 'Activity has no contact identifier for matching',
      value: null,
    });
  }
  
  return isValid;
}

/**
 * Validate contacts from transform result
 */
export function validateContacts(
  result: TransformResult<CarbideContact>
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  for (let i = 0; i < result.data.length; i++) {
    validateContact(result.data[i], i, errors, warnings);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate organizations from transform result
 */
export function validateOrganizations(
  result: TransformResult<CarbideOrganization>
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  for (let i = 0; i < result.data.length; i++) {
    validateOrganization(result.data[i], i, errors, warnings);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate activities from transform result
 */
export function validateActivities(
  result: TransformResult<CarbideActivity>
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  for (let i = 0; i < result.data.length; i++) {
    validateActivity(result.data[i], i, errors, warnings);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Print validation summary
 */
function printValidationSummary(
  name: string,
  result: ValidationResult,
  total: number
): void {
  console.log(`\n=== ${name} Validation ===`);
  console.log(`Total records: ${total}`);
  console.log(`Valid: ${result.isValid ? 'YES' : 'NO'}`);
  console.log(`Errors: ${result.errors.length}`);
  console.log(`Warnings: ${result.warnings.length}`);
  
  if (result.errors.length > 0) {
    console.log('\nErrors:');
    for (const error of result.errors.slice(0, 10)) {
      console.log(`  [${error.index}] ${error.field}: ${error.message}`);
    }
    if (result.errors.length > 10) {
      console.log(`  ... and ${result.errors.length - 10} more errors`);
    }
  }
  
  if (result.warnings.length > 0) {
    console.log('\nWarnings:');
    for (const warning of result.warnings.slice(0, 5)) {
      console.log(`  [${warning.index}] ${warning.field}: ${warning.message}`);
    }
    if (result.warnings.length > 5) {
      console.log(`  ... and ${result.warnings.length - 5} more warnings`);
    }
  }
}

// CLI entry point
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.error('Usage: npx tsx validate.ts <contacts.json> [organizations.json] [activities.json]');
    process.exit(1);
  }
  
  let hasErrors = false;
  
  // Validate contacts
  if (args[0]) {
    try {
      const contactsData = JSON.parse(
        fs.readFileSync(path.resolve(args[0]), 'utf-8')
      ) as TransformResult<CarbideContact>;
      
      const contactValidation = validateContacts(contactsData);
      printValidationSummary('Contacts', contactValidation, contactsData.data.length);
      
      if (!contactValidation.isValid) hasErrors = true;
    } catch (error) {
      console.error(`Error reading contacts file: ${error}`);
      hasErrors = true;
    }
  }
  
  // Validate organizations
  if (args[1]) {
    try {
      const orgsData = JSON.parse(
        fs.readFileSync(path.resolve(args[1]), 'utf-8')
      ) as TransformResult<CarbideOrganization>;
      
      const orgValidation = validateOrganizations(orgsData);
      printValidationSummary('Organizations', orgValidation, orgsData.data.length);
      
      if (!orgValidation.isValid) hasErrors = true;
    } catch (error) {
      console.error(`Error reading organizations file: ${error}`);
      hasErrors = true;
    }
  }
  
  // Validate activities
  if (args[2]) {
    try {
      const activitiesData = JSON.parse(
        fs.readFileSync(path.resolve(args[2]), 'utf-8')
      ) as TransformResult<CarbideActivity>;
      
      const activityValidation = validateActivities(activitiesData);
      printValidationSummary('Activities', activityValidation, activitiesData.data.length);
      
      if (!activityValidation.isValid) hasErrors = true;
    } catch (error) {
      console.error(`Error reading activities file: ${error}`);
      hasErrors = true;
    }
  }
  
  console.log('\n=== Validation Complete ===');
  
  if (hasErrors) {
    console.log('❌ Validation FAILED - Fix errors before loading');
    process.exit(1);
  } else {
    console.log('✅ Validation PASSED - Ready to load');
    process.exit(0);
  }
}

