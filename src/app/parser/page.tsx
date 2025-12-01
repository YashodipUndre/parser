'use client';
import React, { useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import { FileUpload } from '@/components/excel-parser/FileUpload';
import { FileUploadCus } from '@/components/cus-parser/FileUploadCus';
import { SheetSelector } from '@/components/excel-parser/SheetSelector';
import { LeadDataGrid } from '@/components/excel-parser/LeadDataGrid';
import { ErrorList } from '@/components/excel-parser/ErrorList';
import { useExcelParser } from '@/hooks/useExcelParser';
import { SavedUploadsPanel } from '@/components/excel-parser/SavedUploadsPanel';
import { Features } from './Features';
import { Workflow } from './Workflow';

const createMockFile = (name: string, size: number): File => {
    // Create a Blob with approximate size (File.size is read-only)
    const content = new Uint8Array(size);
    return new File([content], name, { type: 'application/vnd.ms-excel' });
};

export default function ParserPage() {
    const { parsedFile, currentSheet, selectedSheetIndex, errors, autoFixes, isLoading, validationSummary, hasUnsavedChanges, hasBeenDownloaded, savedUploads, activeUploadId, saveStatus, focusedCell, scrollToCell, handleCreateBlankExcel, handleFileUpload, handleClear, handleValidate, handleExport, handleDataUpdate, handleDeleteRow, handleRestoreUpload, handleDeleteSavedUpload, setSelectedSheetIndex } = useExcelParser();

    useEffect(() => { if (currentSheet && !validationSummary) handleValidate(); }, [currentSheet, validationSummary, handleValidate]);

    useEffect(() => {
        if (!parsedFile || !hasUnsavedChanges || hasBeenDownloaded) return;
        const warn = () => window.history.pushState(null, '', window.location.href);
        const handleBeforeUnload = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('popstate', warn);
        return () => { window.removeEventListener('beforeunload', handleBeforeUnload); window.removeEventListener('popstate', warn); };
    }, [parsedFile, hasUnsavedChanges, hasBeenDownloaded]);

    const handleResumeSaved = (id: string) => handleRestoreUpload(id) ? toast.success('Session restored', { description: 'You can continue where you left off.' }) : toast.error('Unable to restore session');
    const handleDeleteSaved = (id: string) => (handleDeleteSavedUpload(id), toast.success('Saved upload removed'));

    const onFileSelect = (f: File) => (handleFileUpload(f), toast.success('File uploaded successfully', { description: f.name }));
    const onCreateBlank = () => (handleCreateBlankExcel(), toast.success('Blank Excel created', { description: '10 empty rows with 41 standard fields' }));
    const onClear = () => window.confirm('Clear current file? All unsaved changes will be lost.') && handleClear();
    const onExport = () => (validationSummary?.totalErrors && toast.warning('Exporting with validation errors', { description: `${validationSummary.totalErrors} errors found. The exported file may contain invalid data.` }), handleExport());

    return (
        <React.Fragment>
            <Toaster position="top-right" richColors />
            <div className="mx-auto max-w-[1800px] px-6 py-6">
                <div className="space-y-6">
                    {!parsedFile ? (
                        <React.Fragment>
                            <FileUpload onFileSelect={onFileSelect} onCreateBlank={onCreateBlank} isLoading={isLoading} selectedFile={null} saveStatus={saveStatus} />
                            <FileUploadCus onFileSelect={onFileSelect} onCreateBlank={onCreateBlank} isLoading={isLoading} selectedFile={null} saveStatus={saveStatus} />
                            <SavedUploadsPanel uploads={savedUploads} activeUploadId={activeUploadId} onRestore={handleResumeSaved} onDelete={handleDeleteSaved} />
                            <Features />
                            <Workflow />
                        </React.Fragment>
                    ) : (
                        <React.Fragment >
                            <FileUpload onFileSelect={onFileSelect} onCreateBlank={onCreateBlank} onClear={onClear} onExport={onExport} isLoading={isLoading} selectedFile={createMockFile(parsedFile.fileName, parsedFile.fileSize)} canExport saveStatus={saveStatus} />
                            {parsedFile.sheets.length > 1 && <SheetSelector sheets={parsedFile.sheets} selectedSheet={selectedSheetIndex} onSelectSheet={setSelectedSheetIndex} />}
                            <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
                                <div className="xl:col-span-3">
                                    {currentSheet && <LeadDataGrid data={currentSheet.data} errors={errors} autoFixes={autoFixes} onDataUpdate={handleDataUpdate} onDeleteRow={handleDeleteRow} focusedCell={focusedCell} />}
                                </div>
                                <div className="xl:col-span-1 space-y-4">
                                    <ErrorList errors={errors} onErrorClick={(err) => scrollToCell(err.rowIndex, err.columnName)} focusedCell={focusedCell} />
                                </div>
                            </div>
                        </React.Fragment>
                    )}
                </div>
            </div>
        </React.Fragment>
    );
}
