'use client';
import { XCircle, Info, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ValidationError } from '@/types/validation.types';

interface ErrorListProps {
    errors: ValidationError[];
    onErrorClick?: (error: ValidationError) => void;
    focusedCell?: { rowIndex: number; columnName: string } | null;
}

export function ErrorList({ errors, onErrorClick, focusedCell }: ErrorListProps) {
    if (errors.length === 0) {
        return (
            <Card className="border-dashed h-[700px] flex items-center justify-center">
                <CardContent className="text-center">
                    <Info className="mx-auto h-10 w-10 text-gray-400" />
                    <p className="mt-3 text-sm font-medium text-gray-700">No errors found</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-[calc(100dvh-200px)] flex flex-col shadow-md rounded-md bg-white border border-gray-200">
            <CardHeader className="pb-3 shrink-0">
                <CardTitle className="text-lg font-bold text-gray-800">Issues ({errors.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden">
                <div className="h-full overflow-y-auto divide-y divide-gray-100">
                    {errors.map((error) => {
                        const isFocused = focusedCell && focusedCell.rowIndex === error.rowIndex && focusedCell.columnName === error.columnName;

                        return (
                            <div
                                key={error.id}
                                className={`flex items-start gap-3 p-4 cursor-pointer transition-colors hover:bg-blue-50 ${isFocused ? 'bg-yellow-100 border-l-4 border-yellow-500' : 'bg-red-50/50 hover:bg-red-100/50'}`}
                                onClick={() => {
                                    console.log('Clicking error:', error.rowIndex, error.columnName);
                                    onErrorClick?.(error);
                                }}
                            >
                                <XCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Badge variant="destructive" className="text-[10px]">Row {error.rowIndex}</Badge>
                                        <span className="text-xs font-bold text-gray-800">{error.columnName}</span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-800 mb-2">{error.message}</p>
                                    {error.cellValue && <p className="mt-1 text-xs text-gray-700 truncate mb-2">Current: <span className="font-mono font-semibold">{String(error.cellValue)}</span></p>}
                                    {error.suggestedFix && <p className="mt-1 text-xs text-blue-700 font-medium mb-2">Suggested: <span className="font-mono font-semibold">{String(error.suggestedFix)}</span></p>}
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <ChevronRight className="h-4 w-4 text-gray-500 shrink-0" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}


