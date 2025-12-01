'use client';

import React from 'react';
import { Sheet, Check } from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { ExcelSheet } from '@/types/excel.types';

interface SheetSelectorProps {
    sheets: ExcelSheet[];
    selectedSheet: number;
    onSelectSheet: (index: number) => void;
}

export function SheetSelector({ sheets, selectedSheet, onSelectSheet }: SheetSelectorProps) {
    return (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {sheets.map((sheet, index) => (
                <button
                    key={index}
                    onClick={() => onSelectSheet(index)}
                    className={cn(
                        'flex items-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium transition-all hover:bg-gray-50',
                        selectedSheet === index
                            ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                            : 'border-gray-200 bg-white text-gray-700'
                    )}
                >
                    <Sheet className="h-4 w-4" />
                    <span className="whitespace-nowrap">{sheet.name}</span>
                    <Badge variant={selectedSheet === index ? 'default' : 'secondary'} className="ml-1">
                        {formatNumber(sheet.rowCount)} rows
                    </Badge>
                    {selectedSheet === index && <Check className="h-4 w-4 ml-1" />}
                </button>
            ))}
        </div>
    );
}
