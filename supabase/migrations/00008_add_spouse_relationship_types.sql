-- Add spouse, husband, and wife relationship types to secondary_relationship_type enum

ALTER TYPE secondary_relationship_type ADD VALUE IF NOT EXISTS 'spouse';
ALTER TYPE secondary_relationship_type ADD VALUE IF NOT EXISTS 'husband';
ALTER TYPE secondary_relationship_type ADD VALUE IF NOT EXISTS 'wife';

