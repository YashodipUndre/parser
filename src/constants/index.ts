// Slim constants hub: re-export from focused modules to avoid duplication and keep file small.
export { DROPDOWN_OPTIONS } from './dropdowns';
export {
    REQUIRED_FIELDS,
    OPTIONAL_FIELDS,
    SYSTEM_GENERATED_FIELDS,
    DATE_FIELDS,
    VALID_COLUMNS,
    isRequiredField,
    isOptionalField,
    isDateField,
    getAllFieldNames,
} from './fields';
export {
    SENTENCE_CASE_COLUMNS,
    CAPITALIZE_FIRST_COLUMNS,
    EMAIL_COLUMNS,
    COLUMN_ORDER,
    sortColumnsByOrder,
} from './formatting';
export {
    EMAIL_PATTERN,
    PHONE_PATTERN,
    MAX_FILE_SIZE,
    ACCEPTED_FILE_TYPES,
    VIRTUAL_ROW_HEIGHT,
    TABLE_HEIGHT,
    ERROR_LIST_HEIGHT,
} from './config';
export {
    UPLOAD_MESSAGES,
    UPLOAD_MAX_FILES,
    SUPPORTED_EXTENSIONS,
    SUPPORTED_EXTENSIONS_STRING,
} from './uploads';

// Import values for type definitions
import {
    REQUIRED_FIELDS,
    OPTIONAL_FIELDS,
    SYSTEM_GENERATED_FIELDS,
    VALID_COLUMNS,
} from './fields';

// Export derived types from const arrays
export type RequiredField = (typeof REQUIRED_FIELDS)[number];
export type OptionalField = (typeof OPTIONAL_FIELDS)[number];
export type SystemField = (typeof SYSTEM_GENERATED_FIELDS)[number];
export type AllFields = (typeof VALID_COLUMNS)[number];
