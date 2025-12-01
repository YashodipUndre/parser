import { FIELD_SCHEMA } from './schema';

// Derived arrays from the master schema
export const REQUIRED_FIELDS = FIELD_SCHEMA.filter(f => f.required).map(f => f.name) as readonly string[];
export const SYSTEM_GENERATED_FIELDS = FIELD_SCHEMA.filter(f => f.system).map(f => f.name) as readonly string[];
export const DATE_FIELDS = FIELD_SCHEMA.filter(f => f.isDate).map(f => f.name) as readonly string[];
export const OPTIONAL_FIELDS = FIELD_SCHEMA.filter(f => !f.required && !f.system).map(f => f.name) as readonly string[];
export const VALID_COLUMNS = FIELD_SCHEMA.map(f => f.name) as readonly string[];

// Utilities
export const isRequiredField = (field: string) => REQUIRED_FIELDS.includes(field);
export const isOptionalField = (field: string) => OPTIONAL_FIELDS.includes(field);
export const isDateField = (field: string) => DATE_FIELDS.includes(field);
export const getAllFieldNames = (): string[] => Array.from(new Set(VALID_COLUMNS));
