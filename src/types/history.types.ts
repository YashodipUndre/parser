import type { ParsedExcelFile } from '@/types/excel.types';
import type { ValidationSummary } from '@/types/validation.types';

export interface SerializedParsedExcelFile extends Omit<ParsedExcelFile, 'uploadDate'> {
    uploadDate: string;
}

export interface SavedUploadSummary {
    id: string;
    fileName: string;
    fileSize: number;
    totalRows: number;
    totalErrors: number;
    autoFixCount: number;
    sheetCount: number;
    sheetNames: string[];
    createdAt: number;
    updatedAt: number;
    expiresAt: number;
}

export interface SavedUploadEntry extends SavedUploadSummary {
    parsedFile: SerializedParsedExcelFile;
    validationSummary?: ValidationSummary | null;
}
