// Centralized constants for file upload UI and behavior
import { ACCEPTED_FILE_TYPES } from './config';

// UI copy strings for the upload component
export const UPLOAD_MESSAGES_CUS = {
    titleDefault: 'Upload Excel File For Customers',
    titleActive: 'Drop here',
    subtitle: 'Drag & drop or click • Auto-parses on upload',
    supportPrefix: 'Supports'
} as const;

// Behavioral constraints
export const UPLOAD_MAX_FILES = 1 as const;

// Derived list of supported extensions from ACCEPTED_FILE_TYPES
export const SUPPORTED_EXTENSIONS: readonly string[] = Object.values(ACCEPTED_FILE_TYPES).flat();
export const SUPPORTED_EXTENSIONS_STRING = SUPPORTED_EXTENSIONS.join(', ');
