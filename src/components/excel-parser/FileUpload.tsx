'use client';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, X, Loader2, Download } from 'lucide-react';
import { cn, formatFileSize, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE, UPLOAD_MESSAGES, UPLOAD_MAX_FILES, SUPPORTED_EXTENSIONS_STRING } from '@/constants';

interface FileUploadProps {
    onFileSelect: (file: File) => void; onClear?: () => void; onExport?: () => void; onCreateBlank?: () => void;
    isLoading?: boolean; selectedFile?: File | null; canExport?: boolean; saveStatus?: 'idle' | 'saving' | 'saved';
}

export function FileUpload({ onFileSelect, onClear, onExport, onCreateBlank, isLoading, selectedFile, canExport, saveStatus }: FileUploadProps) {
    const [uploadDate, setUploadDate] = useState<Date | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState('');

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: useCallback((f: File[]) => f[0] && (setUploadDate(new Date()), onFileSelect(f[0])), [onFileSelect]),
        accept: ACCEPTED_FILE_TYPES, maxFiles: UPLOAD_MAX_FILES, maxSize: MAX_FILE_SIZE, disabled: isLoading
    });

    if (!selectedFile) return (
        <Card className="border-2 border-dashed border-gray-300 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-300">
                <div {...getRootProps()} className={cn('cursor-pointer transition-all duration-200 hover:bg-linear-to-br hover:from-blue-50 hover:to-blue-100/50', isDragActive && 'bg-linear-to-br from-blue-50 to-blue-100/50 border-blue-400', isLoading && 'cursor-not-allowed opacity-50')}>
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                        <div className="bg-linear-to-br from-blue-100 to-blue-200 p-3 rounded-xl mb-3 border-2 border-blue-300"><Upload className="h-8 w-8 text-blue-600" /></div>
                        <h3 className="text-sm font-bold text-gray-900">{isDragActive ? UPLOAD_MESSAGES.titleActive : UPLOAD_MESSAGES.titleDefault}</h3>
                        <p className="text-xs text-gray-600 mt-1">{UPLOAD_MESSAGES.subtitle}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{UPLOAD_MESSAGES.supportPrefix} {SUPPORTED_EXTENSIONS_STRING} (max {formatFileSize(MAX_FILE_SIZE)})</p>
                    </div>
                </div>
                <div onClick={onCreateBlank} className={cn('flex flex-col items-center justify-center p-8 text-center transition-all duration-200 hover:bg-linear-to-br hover:from-emerald-50 hover:to-emerald-100/50 cursor-pointer group', isLoading && 'cursor-not-allowed opacity-50')}>
                    <div className="bg-linear-to-br from-emerald-100 to-emerald-200 p-3 rounded-xl mb-3 border-2 border-emerald-300"><FileSpreadsheet className="h-8 w-8 text-emerald-600" /></div>
                    <h3 className="text-sm font-bold text-gray-900">Start with Blank Excel</h3>
                    <p className="text-xs text-gray-600 mt-1 mb-4">Create a new file with 41 standard ERPNext lead fields</p>
                    <Button onClick={(e) => (e.stopPropagation(), onCreateBlank?.())} disabled={isLoading} size="sm" className="gap-2 bg-linear-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-500/30 group-hover:shadow-xl group-hover:shadow-emerald-500/40 group-hover:from-emerald-700 group-hover:to-emerald-800 font-bold tracking-wide border-0 transition-all duration-200">Create New File</Button>
                </div>
            </div>
        </Card>
    );

    const dotIndex = selectedFile.name.lastIndexOf('.');
    const ext = dotIndex > 0 ? selectedFile.name.substring(dotIndex + 1) : '';
    const name = editedName || (dotIndex > 0 ? selectedFile.name.substring(0, dotIndex) : selectedFile.name);

    return (
        <Card className="p-4 bg-white border border-gray-200">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-2.5"><FileSpreadsheet className="h-5 w-5 text-blue-600" /></div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            {isEditing ? (
                                <input type="text" value={editedName} onChange={(e) => setEditedName(e.target.value)} onBlur={() => setIsEditing(false)}
                                    onKeyDown={(e) => (e.key === 'Enter' && setIsEditing(false), e.key === 'Escape' && setEditedName(''))}
                                    className="font-bold text-neutral-700 text-sm border border-blue-300 rounded px-2 py-1 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1" autoFocus placeholder="Enter filename" />
                            ) : (
                                <h3 className="font-bold text-neutral-700 text-sm truncate cursor-pointer hover:text-blue-600 transition-colors" onClick={() => (setEditedName(name), setIsEditing(true))} title="Click to edit filename">{name}</h3>
                            )}
                            {ext && <Badge variant="secondary" className="text-xs font-mono bg-gray-100 text-gray-700 border border-gray-300">{ext}</Badge>}
                            {saveStatus === 'saving' ? <Loader2 className="h-4 w-4 text-blue-600 animate-spin" /> : <div className="h-4 w-4" />}
                        </div>
                        <div className="text-xs text-gray-600 flex gap-3"><span>{formatFileSize(selectedFile.size)}</span>{uploadDate && <span>Uploaded {formatDate(uploadDate)}</span>}</div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {onExport && <Button variant="default" size="sm" onClick={onExport} disabled={isLoading || !canExport} className="gap-2 font-bold tracking-wide"><Download size={16} /> Export Clean Data</Button>}
                    <Button variant="ghost" size="icon" onClick={onClear} disabled={isLoading} className="size-9 bg-gray-100 hover:bg-gray-200 border border-gray-200"><X className="text-gray-600 hover:text-gray-800" size={16} /></Button>
                </div>
            </div>
        </Card>
    );
}

