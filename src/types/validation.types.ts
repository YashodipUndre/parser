/**
 * Validation Types for Excel Parser
 */

/**
 * Validation Error Severity Levels - All issues are errors that must be fixed
 */
export type ValidationSeverity = 'error';

/**
 * Validation Error Type - All issues must be fixed before export
 */
export type ValidationErrorType =
    | 'REQUIRED_FIELD_EMPTY'      // Required field is empty
    | 'INVALID_FORMAT'            // Format doesn't match pattern
    | 'INVALID_EMAIL'             // Invalid email format
    | 'INVALID_PHONE'             // Invalid phone format
    | 'INVALID_DROPDOWN'          // Value not in dropdown list
    | 'DUPLICATE_VALUE'           // Duplicate ID or unique field
    | 'LEADING_TRAILING_SPACES'   // Has leading/trailing spaces
    | 'TOO_SHORT'                 // Value too short
    | 'TOO_LONG'                  // Value too long
    | 'INVALID_NUMERIC'           // Not a valid number
    | 'INVALID_DATE'              // Invalid date format
    | 'EMPTY_ROW'                 // Completely empty row
    | 'SPECIAL_CHARACTERS';       // Contains invalid special chars

/**
 * Single Validation Error
 */
export interface ValidationError {
    id: string;                    // Unique error ID
    rowIndex: number;              // Row number (1-based)
    columnName: string;            // Column name
    cellValue: string | number | boolean | null | undefined; // Current cell value
    errorType: ValidationErrorType;
    severity: ValidationSeverity;
    message: string;               // Human-readable error message
    suggestedFix?: string | number | boolean | null; // Suggested value to fix the error
    canAutoFix: boolean;           // Whether this error can be auto-fixed
}

/**
 * Validation Result for a single cell
 */
export interface CellValidationResult {
    isValid: boolean;
    errors: ValidationError[];
}

/**
 * Validation Result for entire sheet
 */
export interface SheetValidationResult {
    sheetName: string;
    totalRows: number;
    validRows: number;
    errorCount: number;
    errors: ValidationError[];
    validationProgress: number; // 0-100
}

/**
 * Overall Validation Summary
 */
export interface ValidationSummary {
    totalSheets: number;
    totalRows: number;
    totalErrors: number;
    errorsByType: Record<ValidationErrorType, number>;
    errorsByColumn: Record<string, number>;
    canProceed: boolean; // False if ANY errors exist
    validationProgress: number; // 0-100
}

/**
 * Auto-fix Result
 */
export interface AutoFixResult {
    success: boolean;
    fixedCount: number;
    failedCount: number;
    changes: AutoFixChange[];
    summary: string;
}

/**
 * Single Auto-fix Change
 */
export interface AutoFixChange {
    rowIndex: number;
    columnName: string;
    oldValue: string | number | boolean | null | undefined;
    newValue: string | number | boolean | null | undefined;
    fixType: string;
}

/**
 * Validation Rule Definition
 */
export interface ValidationRule {
    fieldName: string;
    ruleName: string;
    isRequired: boolean;
    validate: (value: string | number | boolean | null | undefined, rowData?: Record<string, unknown>) => CellValidationResult;
    autoFix?: (value: string | number | boolean | null | undefined) => string | number | boolean | null | undefined;
}

/**
 * Validation Options
 */
export interface ValidationOptions {
    checkRequiredFields: boolean;
    checkFormat: boolean;
    checkDuplicates: boolean;
    checkSpaces: boolean;
    checkDropdowns: boolean;
    strictMode: boolean; // Stricter validation rules
}

/**
 * Error Filter Options
 */
export interface ErrorFilterOptions {
    severity?: ValidationSeverity[];
    errorType?: ValidationErrorType[];
    columns?: string[];
    searchTerm?: string;
}
