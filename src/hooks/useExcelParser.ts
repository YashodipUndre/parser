'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { parseExcelFile, exportToExcel } from '@/lib/excel-parser';
import { validateRow, detectDuplicateIDs } from '@/lib/validators';
import type { ParsedExcelFile, ExcelSheet } from '@/types/excel.types';
import type { ValidationSummary, ValidationError } from '@/types/validation.types';
import { useUploadHistory } from '@/hooks/useUploadHistory';

const BATCH_SIZE = 100;

export function useExcelParser() {
    const [parsedFile, setParsedFile] = useState<ParsedExcelFile | null>(null);
    const [selectedSheetIndex, setSelectedSheetIndex] = useState(0);
    const [errors, setErrors] = useState<ValidationError[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [validationSummary, setValidationSummary] = useState<ValidationSummary | null>(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [hasBeenDownloaded, setHasBeenDownloaded] = useState(false);
    const [activeUploadId, setActiveUploadId] = useState<string | null>(null);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

    // Integrated hooks
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilters, setActiveFilters] = useState<string[]>([]);
    const [focusedCell, setFocusedCell] = useState<{ rowIndex: number; columnName: string } | null>(null);
    const [currentErrorIndex, setCurrentErrorIndex] = useState(0);

    const { listUploads, saveUpload, getUploadById, deleteUpload, flushUploads } = useUploadHistory();
    const savedUploads = useMemo(() => listUploads(), [listUploads]);

    useEffect(() => { flushUploads(); }, [flushUploads]);

    // Streaming validation for large datasets
    const validateData = useCallback(async (sheet: ExcelSheet) => {
        const data = sheet.data as unknown as Array<Record<string, unknown>>;
        const allErrors: ValidationError[] = [];

        // Process in chunks
        for (let i = 0; i < data.length; i += BATCH_SIZE) {
            const chunk = data.slice(i, Math.min(i + BATCH_SIZE, data.length));
            const chunkErrors = chunk.flatMap((row, idx) => validateRow(row, i + idx + 2));
            allErrors.push(...chunkErrors);

            // Yield to browser
            if (i + BATCH_SIZE < data.length) {
                await new Promise(resolve => setTimeout(resolve, 0));
            }
        }

        allErrors.push(...detectDuplicateIDs(data));

        const byType = allErrors.reduce((a, e) => ({ ...a, [e.errorType]: (a[e.errorType] || 0) + 1 }), {} as Record<string, number>);
        const byCol = allErrors.reduce((a, e) => ({ ...a, [e.columnName]: (a[e.columnName] || 0) + 1 }), {} as Record<string, number>);

        setErrors(allErrors);
        setValidationSummary({
            totalSheets: parsedFile?.totalSheets || 1,
            totalRows: sheet.rowCount,
            totalErrors: allErrors.length,
            errorsByType: byType as ValidationSummary['errorsByType'],
            errorsByColumn: byCol,
            canProceed: !allErrors.length,
            validationProgress: 100
        });

        return allErrors;
    }, [parsedFile]);

    const persistSnapshot = useCallback((file: ParsedExcelFile, opts?: { totalErrors?: number; autoFixCount?: number; assignNewId?: boolean }) => {
        if (!file) return;
        setSaveStatus('saving');
        const id = saveUpload({
            id: opts?.assignNewId ? undefined : activeUploadId ?? undefined,
            parsedFile: file,
            validationSummary,
            totalErrors: opts?.totalErrors ?? errors.length,
            autoFixCount: opts?.autoFixCount ?? file.autoFixes?.length ?? 0,
        });
        if (id && id !== activeUploadId) setActiveUploadId(id);
        setTimeout(() => setSaveStatus('saved'), 200);
    }, [activeUploadId, errors.length, validationSummary, saveUpload]);

    const handleCreateBlankExcel = useCallback(() => {
        setIsLoading(true);
        try {
            const { FIELD_SCHEMA } = require('@/constants/schema');
            const headers = FIELD_SCHEMA.map((f: any) => f.name);
            const emptyRows = Array.from({ length: 10 }, () => {
                const row: Record<string, string> = {};
                headers.forEach((h: string) => { row[h] = ''; });
                return row;
            }) as unknown as ExcelSheet['data'];
            const blank: ParsedExcelFile = {
                fileName: `New_Lead_File_${new Date().toISOString().split('T')[0]}.xlsx`,
                fileSize: 0,
                uploadDate: new Date(),
                sheets: [{ name: 'Sheet1', data: emptyRows, headers, rowCount: 10, columnCount: headers.length }],
                totalRows: 10,
                totalSheets: 1,
                autoFixes: [],
            };
            setParsedFile(blank);
            setSelectedSheetIndex(0);
            setErrors([]);
            setValidationSummary(null);
            setHasUnsavedChanges(true);
            setHasBeenDownloaded(false);
            setActiveUploadId(null);
            persistSnapshot(blank, { totalErrors: 0, autoFixCount: 0, assignNewId: true });
        } finally {
            setIsLoading(false);
        }
    }, [persistSnapshot]);

    const handleFileUpload = useCallback(async (file: File) => {
        setIsLoading(true);
        try {
            const parsed = await parseExcelFile(file);
            setParsedFile(parsed);
            setSelectedSheetIndex(0);
            setErrors([]);
            setValidationSummary(null);
            setHasUnsavedChanges(false);
            setHasBeenDownloaded(false);
            setActiveUploadId(null);
            persistSnapshot(parsed, { totalErrors: 0, autoFixCount: parsed.autoFixes?.length ?? 0, assignNewId: true });
        } catch (error) {
            console.error('Parse error:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [persistSnapshot]);

    const handleClear = useCallback(() => {
        setParsedFile(null);
        setErrors([]);
        setValidationSummary(null);
        setHasUnsavedChanges(false);
        setHasBeenDownloaded(false);
        setActiveUploadId(null);
        setSaveStatus('idle');
        setSearchQuery('');
        setActiveFilters([]);
        setFocusedCell(null);
    }, []);

    const handleValidate = useCallback(async () => {
        if (!parsedFile) return;
        setIsLoading(true);
        try {
            await validateData(parsedFile.sheets[selectedSheetIndex]);
        } finally {
            setIsLoading(false);
        }
    }, [parsedFile, selectedSheetIndex, validateData]);

    const handleExport = useCallback(() => {
        if (!parsedFile) return;
        try {
            exportToExcel(parsedFile.sheets, parsedFile.fileName.replace(/\.[^/.]+$/, '') + '_cleaned.xlsx');
            setHasBeenDownloaded(true);
            setHasUnsavedChanges(false);
        } catch (error) {
            console.error('Export error:', error);
            throw error;
        }
    }, [parsedFile]);

    const handleDataUpdate = useCallback(async (newData: ExcelSheet['data']) => {
        if (!parsedFile) return;
        const sheet = { ...parsedFile.sheets[selectedSheetIndex], data: newData };
        const nextFile = { ...parsedFile, sheets: parsedFile.sheets.map((s, i) => i === selectedSheetIndex ? sheet : s) };
        setParsedFile(nextFile);
        const errs = await validateData(sheet);
        setHasUnsavedChanges(true);
        setHasBeenDownloaded(false);
        persistSnapshot(nextFile, { totalErrors: errs.length });
    }, [parsedFile, selectedSheetIndex, validateData, persistSnapshot]);

    const handleCellUpdate = useCallback((rowIndex: number, columnName: string, value: string) => {
        if (!parsedFile) return;
        const d = [...parsedFile.sheets[selectedSheetIndex].data];
        const idx = rowIndex - 2;
        if (d[idx]) {
            d[idx] = { ...d[idx], [columnName]: value };
            handleDataUpdate(d);
        }
    }, [parsedFile, selectedSheetIndex, handleDataUpdate]);

    const handleDeleteRow = useCallback((rowIndex: number) => {
        if (!parsedFile || !window.confirm(`Delete row ${rowIndex}?`)) return;
        const d = [...parsedFile.sheets[selectedSheetIndex].data];
        const idx = rowIndex - 2;
        if (idx >= 0 && idx < d.length) {
            d.splice(idx, 1);
            handleDataUpdate(d);
        }
    }, [parsedFile, selectedSheetIndex, handleDataUpdate]);

    const handleRestoreUpload = useCallback((id: string) => {
        const restored = getUploadById(id);
        if (!restored) return false;
        setParsedFile(restored);
        setSelectedSheetIndex(0);
        setErrors([]);
        setValidationSummary(null);
        setHasUnsavedChanges(false);
        setHasBeenDownloaded(false);
        setActiveUploadId(id);
        return true;
    }, [getUploadById]);

    const handleDeleteSavedUpload = useCallback((id: string) => {
        deleteUpload(id);
        if (activeUploadId === id) setActiveUploadId(null);
    }, [deleteUpload, activeUploadId]);

    // Integrated filter logic
    const filteredErrors = useMemo(() => {
        if (!activeFilters.length) return errors;
        return errors.filter(e => {
            if (activeFilters.includes('auto-fixable') && !e.canAutoFix) return false;
            if (activeFilters.includes('required-fields') && e.errorType !== 'REQUIRED_FIELD_EMPTY') return false;
            return true;
        });
    }, [errors, activeFilters]);

    // Integrated navigation
    const navigateToError = useCallback((idx: number) => {
        if (idx >= 0 && idx < filteredErrors.length) {
            setCurrentErrorIndex(idx);
            const err = filteredErrors[idx];
            setFocusedCell({ rowIndex: err.rowIndex, columnName: err.columnName });
            setTimeout(() => {
                const el = document.getElementById(`cell-${err.rowIndex}-${err.columnName}`);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    }, [filteredErrors]);

    return {
        parsedFile,
        currentSheet: parsedFile?.sheets[selectedSheetIndex] || null,
        selectedSheetIndex,
        errors: filteredErrors,
        autoFixes: parsedFile?.autoFixes || [],
        isLoading,
        validationSummary,
        hasUnsavedChanges,
        hasBeenDownloaded,
        savedUploads,
        activeUploadId,
        saveStatus,
        searchQuery,
        activeFilters,
        focusedCell,
        currentErrorIndex,
        setSearchQuery,
        setActiveFilters: useCallback((f: string[]) => setActiveFilters(f), []),
        toggleFilter: useCallback((f: string) => setActiveFilters(p => p.includes(f) ? p.filter(x => x !== f) : [...p, f]), []),
        clearFilters: useCallback(() => setActiveFilters([]), []),
        navigateToError,
        nextError: useCallback(() => navigateToError(currentErrorIndex + 1), [currentErrorIndex, navigateToError]),
        prevError: useCallback(() => navigateToError(currentErrorIndex - 1), [currentErrorIndex, navigateToError]),
        scrollToCell: useCallback((r: number, c: string) => setFocusedCell({ rowIndex: r, columnName: c }), []),
        clearFocus: useCallback(() => setFocusedCell(null), []),
        handleCreateBlankExcel,
        handleFileUpload,
        handleClear,
        handleValidate,
        handleExport,
        handleDataUpdate,
        handleCellUpdate,
        handleDeleteRow,
        handleRestoreUpload,
        handleDeleteSavedUpload,
        setSelectedSheetIndex,
    };
}
