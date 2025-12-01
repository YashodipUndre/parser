/**
 * Excel Data Types for Lead Config Parser
 * Based on "BACKEND UPLIFT Lead Config Parser 11 November, 2025"
 * 
 * IMPORTANT: This file defines the MASTER SCHEMA (41 fields)
 * User uploads can have extra columns, but only these 41 fields will be validated and exported
 * Output format must match BACKEND UPLIFT structure exactly
 */

// Import constants and utility functions from centralized location
import {
    DROPDOWN_OPTIONS,
    EMAIL_PATTERN,
    PHONE_PATTERN,
    isRequiredField,
    type RequiredField,
    type OptionalField,
    type SystemField,
    type AllFields,
} from '@/constants';

// Re-export types and functions for backwards compatibility
export type {
    RequiredField,
    OptionalField,
    SystemField,
    AllFields,
};

// Re-export functions from constants
export {
    isRequiredField,
    isOptionalField,
    getAllFieldNames,
} from '@/constants';

/**
 * Lead Data Row Interface
 */
export interface LeadDataRow extends Record<string, unknown> {
    // REQUIRED FIELDS
    ID: string | number;
    'Lead Status': string;
    Status: string;
    'Lead Stage': string;
    Territory: string;

    // OPTIONAL FIELDS
    Series?: string;
    Salutation?: string;
    'First Name'?: string;
    'Middle Name'?: string;
    'Last Name'?: string;
    'Job Title'?: string;
    Gender?: string;
    Source?: string;
    'Lead Priority'?: string;
    'Lead Owner'?: string;
    'Lead Category'?: string;
    'Request Type'?: string;
    Email?: string;
    Website?: string;
    'Mobile No'?: string;
    WhatsApp?: string;
    Phone?: string;
    'Phone Ext.'?: string;
    'Alternate Phone(s)'?: string;
    'Organization Name'?: string;
    'No of Employees'?: string;
    'CASE Officer Remark'?: string;
    'CASE Officer Note'?: string;
    'Annual Revenue'?: string | number;
    'Market Segment'?: string;
    'Industry Type'?: string;
    Fax?: string;
    Pincode?: string;
    City?: string;
    'State/Province'?: string;
    Country?: string;
    'Bill To Address'?: string;
    'Ship To Address'?: string;
    'Qualification Status'?: string;
    'Qualified By'?: string;
    'Qualified on'?: string;
}

/**
 * Excel Sheet Data
 */
export interface ExcelSheet {
    name: string;
    data: LeadDataRow[];
    headers: string[];
    rowCount: number;
    columnCount: number;
}

/**
 * Auto-fix information for a cell
 */
export interface AutoFixInfo {
    rowIndex: number;
    columnName: string;
    originalValue: string;
    fixedValue: string;
    fixType: 'name-format' | 'email-lowercase' | 'phone-clean' | 'dropdown-match' | 'space-trim';
}

/**
 * Parsed Excel File
 */
export interface ParsedExcelFile {
    fileName: string;
    fileSize: number;
    uploadDate: Date;
    sheets: ExcelSheet[];
    totalRows: number;
    totalSheets: number;
    autoFixes?: AutoFixInfo[]; // Track auto-fixed cells
}

/**
 * Field Metadata
 */
export interface FieldMetadata {
    name: string;
    isRequired: boolean;
    dataType: 'text' | 'numeric' | 'email' | 'phone' | 'date' | 'dropdown';
    dropdownOptions?: readonly string[];
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
}

/**
 * Column Analysis Result
 */
export interface ColumnAnalysis {
    columnName: string;
    dataType: string;
    totalValues: number;
    emptyCount: number;
    uniqueValues: number;
    hasSpaces: boolean;
    sampleValues: Array<string | number | boolean | null>;
    isRequired: boolean;
}

/**
 * Get field metadata for a specific field
 */
export function getFieldMetadata(fieldName: string): FieldMetadata {
    const isRequired = isRequiredField(fieldName);
    const dropdownOptions = DROPDOWN_OPTIONS[fieldName as keyof typeof DROPDOWN_OPTIONS];

    let dataType: FieldMetadata['dataType'] = 'text';
    let pattern: RegExp | undefined;

    // Determine data type
    if (dropdownOptions) {
        dataType = 'dropdown';
    } else if (fieldName === 'Email') {
        dataType = 'email';
        pattern = EMAIL_PATTERN;
    } else if (fieldName.includes('Phone') || fieldName.includes('Mobile') || fieldName.includes('WhatsApp')) {
        dataType = 'phone';
        pattern = PHONE_PATTERN;
    } else if (fieldName.includes('Revenue') || fieldName === 'Annual Revenue' || fieldName === 'ID') {
        dataType = 'numeric';
    } else if (fieldName === 'Qualified on') {
        dataType = 'date';
    }

    return {
        name: fieldName,
        isRequired,
        dataType,
        dropdownOptions,
        pattern,
    };
}
