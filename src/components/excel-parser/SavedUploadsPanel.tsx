'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History, Trash2, Play, FileCheck } from 'lucide-react';
import type { SavedUploadSummary } from '@/types/history.types';

interface SavedUploadsPanelProps {
    uploads: SavedUploadSummary[];
    activeUploadId: string | null;
    onRestore: (id: string) => void;
    onDelete: (id: string) => void;
}

const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short'
    }).format(new Date(timestamp));
};

export function SavedUploadsPanel({ uploads, activeUploadId, onRestore, onDelete }: SavedUploadsPanelProps) {
    const hasUploads = uploads.length > 0;

    const confirmDelete = (id: string, fileName: string) => {
        const message = `Delete saved session "${fileName}"? This action cannot be undone.`;
        if (typeof window === 'undefined' || !window.confirm(message)) return;
        onDelete(id);
    };

    return (
        <Card className="border border-gray-200">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                        <History className="h-4 w-4 text-blue-600" />
                        Saved Sessions
                    </CardTitle>
                    <Badge variant="outline">Auto-flush 30d</Badge>
                </div>
                <p className="text-xs text-gray-500">Restore any upload without logging in. Entries older than 30 days are removed automatically.</p>
            </CardHeader>
            <CardContent className="space-y-3">
                {!hasUploads && (
                    <div className="text-sm text-gray-500">
                        No saved uploads yet. Upload a file and we&rsquo;ll keep a local copy so you can pick up later.
                    </div>
                )}

                {hasUploads && (
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                        {uploads.map((upload) => (
                            <div
                                key={upload.id}
                                className={`group rounded-xl border-2 p-4 transition-all duration-200 hover:shadow-md ${upload.id === activeUploadId
                                        ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100/50 shadow-sm'
                                        : 'border-gray-200 bg-white hover:border-blue-300'
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <FileCheck className={`h-4 w-4 shrink-0 ${upload.id === activeUploadId ? 'text-blue-600' : 'text-gray-400'}`} />
                                            <p className="text-sm font-bold text-gray-900 truncate" title={upload.fileName}>{upload.fileName}</p>
                                        </div>
                                        <p className="text-xs text-gray-500 ml-6">Updated {formatDate(upload.updatedAt)}</p>
                                        <div className="mt-2 flex items-center gap-3 text-xs ml-6">
                                            <span className="text-gray-600 font-medium">{upload.totalRows} rows</span>
                                            <span className="text-gray-300">•</span>
                                            <span className={`font-semibold ${upload.totalErrors > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                                {upload.totalErrors > 0 ? `${upload.totalErrors} issues` : '✓ Clean'}
                                            </span>
                                            {upload.sheetNames.length > 1 && (
                                                <>
                                                    <span className="text-gray-300">•</span>
                                                    <span className="text-gray-500">{upload.sheetNames.length} sheets</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        {upload.id === activeUploadId ? (
                                            <Badge className="bg-blue-600 text-white text-xs px-3 py-1.5 font-semibold border-0">Active</Badge>
                                        ) : (
                                            <Button
                                                size="sm"
                                                onClick={() => onRestore(upload.id)}
                                                className="gap-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 hover:from-blue-700 hover:to-blue-800 border-0 font-bold"
                                            >
                                                <Play className="h-3.5 w-3.5" fill="currentColor" />
                                                Resume
                                            </Button>
                                        )}
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                            onClick={() => confirmDelete(upload.id, upload.fileName)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
