'use client';

import { useMemo, useCallback, memo, useState, useRef, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, flexRender, type ColumnDef, type SortingState, type Row, type Cell } from '@tanstack/react-table';
import { ArrowUp, ArrowDown, Search, ChevronDown, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { isRequiredField, DROPDOWN_OPTIONS, SENTENCE_CASE_COLUMNS, CAPITALIZE_FIRST_COLUMNS, EMAIL_COLUMNS, VIRTUAL_ROW_HEIGHT, TABLE_HEIGHT, sortColumnsByOrder } from '@/constants';
import { NO_DATA_TITLE, NO_DATA_SUBTITLE } from '@/constants/ui';
import type { LeadDataRow, AutoFixInfo } from '@/types/excel.types';
import type { ValidationError } from '@/types/validation.types';

interface LeadDataGridProps {
    data: LeadDataRow[];
    errors?: ValidationError[];
    autoFixes?: AutoFixInfo[];
    onDataUpdate?: (data: LeadDataRow[]) => void;
    onDeleteRow?: (rowIndex: number) => void;
    focusedCell?: { rowIndex: number; columnName: string } | null;
}

interface CellProps {
    value: unknown;
    cellErrors: ValidationError[];
    autoFixInfo?: AutoFixInfo;
    columnName: string;
    onCellChange?: (col: string, val: string) => void;
    isFocused?: boolean;
    isDropdown?: boolean;
}

const DataCell = memo(({ value, cellErrors, autoFixInfo, columnName, isFocused, isDropdown, onCellChange }: CellProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(String(value || ''));
    const hasErr = cellErrors.length > 0;
    const isEmail = (EMAIL_COLUMNS as readonly string[]).includes(columnName);

    const save = useCallback((v: string) => {
        onCellChange?.(columnName, v === '___CLEAR___' ? '' : v.trim());
        setIsEditing(false);
    }, [columnName, onCellChange]);

    if (isEditing && isDropdown) return (
        <Select value={editValue} onValueChange={save} onOpenChange={(o) => !o && setIsEditing(false)} open>
            <SelectTrigger className="w-full h-8 border-0 shadow-none bg-transparent px-0 text-sm font-medium" />
            <SelectContent>
                {editValue && <><SelectItem value="___CLEAR___" className="text-sm font-medium text-red-600">✕ Clear</SelectItem><div className="h-px bg-gray-200 my-1" /></>}
                {DROPDOWN_OPTIONS[columnName as keyof typeof DROPDOWN_OPTIONS]?.map(o => <SelectItem key={o} value={o} className="text-sm font-medium">{o}</SelectItem>)}
            </SelectContent>
        </Select>
    );

    if (isEditing) return (
        <input type={isEmail ? "email" : "text"} value={editValue} onChange={(e) => setEditValue(e.target.value)}
            onBlur={() => save(editValue)} onKeyDown={(e) => { if (e.key === 'Enter') save(editValue); if (e.key === 'Escape') setIsEditing(false); }}
            autoFocus className="w-full h-8 px-3 py-2.5 bg-transparent border-0 text-sm font-medium text-gray-900 focus:outline-none" />
    );

    const err = cellErrors.map(e => e.message).join(' • ');
    const fix = autoFixInfo ? `✨ Fixed: "${autoFixInfo.originalValue}" → "${autoFixInfo.fixedValue}"` : '';
    const tooltip = err && fix ? `${err} | ${fix}` : fix || err || (isDropdown ? 'Click' : 'Double-click');

    return (
        <div className={cn('px-3 py-2.5 text-sm font-medium flex items-center gap-1', {
            'border-2 border-blue-600 bg-blue-100 font-bold text-blue-900 shadow-lg': isFocused,
            'border-2 border-red-600 bg-red-50 font-bold text-red-800': !isFocused && hasErr,
            'border-2 border-green-500 bg-green-50 font-bold text-green-800': !isFocused && !hasErr && autoFixInfo,
            'text-gray-800 hover:bg-blue-50 cursor-pointer': !isFocused && !hasErr && !autoFixInfo,
        })} title={tooltip}
            onClick={() => isDropdown && (setEditValue(String(value || '')), setIsEditing(true))}
            onDoubleClick={() => (setEditValue(String(value || '')), setIsEditing(true))}>
            <span className="truncate flex-1">{value ? String(value) : <span className="text-gray-400 font-normal text-xs">Empty</span>}</span>
            {isDropdown && <ChevronDown className="h-3 w-3 text-gray-500 shrink-0" />}
        </div>
    );
}, (prev, next) => prev.value === next.value && prev.cellErrors.length === next.cellErrors.length && prev.autoFixInfo === next.autoFixInfo && prev.isFocused === next.isFocused && prev.isDropdown === next.isDropdown);
DataCell.displayName = 'DataCell';

// Row state cache to prevent tooltip recreation
const rowStateCache = new Map<string, { dup: { id: string; rowIndices: number[] } | undefined }>();

interface TableRowProps {
    vr: { index: number; start: number; size: number; end: number };
    row: Row<LeadDataRow>;
    origRow: number;
    dupMap: Map<number, { id: string; rowIndices: number[] }>;
    focusedCell: { rowIndex: number; columnName: string } | null | undefined;
    errorMap: Map<string, ValidationError[]>;
    autoFixMap: Map<string, AutoFixInfo>;
    onDeleteRow?: (rowIndex: number) => void;
    handleCellChange: (rowIndex: number, columnName: string, value: string) => void;
}

// Memoized row component
const TableRow = memo(({ vr, row, origRow, dupMap, focusedCell, errorMap, autoFixMap, onDeleteRow, handleCellChange }: TableRowProps) => {
    const dup = dupMap.get(origRow);
    const cacheKey = `${origRow}-${vr.size}`;
    if (!rowStateCache.has(cacheKey)) rowStateCache.set(cacheKey, { dup });

    return (
        <tr key={row.id} style={{ height: `${vr.size}px` }} className={cn("border-b border-gray-100 hover:bg-blue-50/30", dup && "bg-orange-50/50")}>
            <td className="sticky left-0 z-30 w-16 border-r border-gray-200 px-2 py-2.5 text-center bg-gray-50">
                <div className="text-[10px] font-bold text-gray-600">{vr.index + 1}</div>
            </td>
            <td className={cn("sticky z-20 w-12 border-r border-gray-200 px-1 py-1 text-center", dup ? "bg-orange-100" : "bg-gray-50")} style={{ left: '32px' }}>
                {dup ? (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex flex-col items-center gap-0.5 cursor-pointer">
                                <div className="text-[9px] font-bold text-orange-700">{origRow}</div>
                                <Button size="sm" variant="destructive" onClick={() => window.confirm(`Delete row ${origRow}?`) && onDeleteRow?.(origRow)} className="h-4 w-4 p-0">
                                    <Trash2 className="h-2.5 w-2.5" />
                                </Button>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-orange-900 text-white">
                            <p className="text-xs font-semibold">Duplicate ID: {dup.id}</p>
                            <p className="text-xs mt-1">Rows: {dup.rowIndices.join(', ')}</p>
                        </TooltipContent>
                    </Tooltip>
                ) : (
                    <div className="text-[10px] font-bold text-gray-700">{origRow}</div>
                )}
            </td>
            {row.getVisibleCells().map((c: Cell<LeadDataRow, unknown>) => {
                const isFocused = focusedCell?.rowIndex === origRow && focusedCell?.columnName === c.column.id;
                const isID = c.column.id === 'ID';
                const cellErrors = errorMap.get(`${origRow}-${c.column.id}`) || [];
                const autoFixInfo = autoFixMap.get(`${origRow}-${c.column.id}`);
                const isDropdown = !!DROPDOWN_OPTIONS[c.column.id as keyof typeof DROPDOWN_OPTIONS];
                const cellValue = row.getValue(c.column.id);

                return (
                    <td key={c.id} id={`cell-${origRow}-${c.column.id}`} className={cn("min-w-40", isFocused && 'bg-yellow-200 ring-2 ring-yellow-500', dup && isID && "bg-orange-50", dup && !isID && "bg-orange-50/30")}>
                        <DataCell value={cellValue} cellErrors={cellErrors} autoFixInfo={autoFixInfo} columnName={c.column.id} isFocused={isFocused} isDropdown={isDropdown} onCellChange={(col, val) => handleCellChange(origRow, col, val)} />
                    </td>
                );
            })}
        </tr>
    );
}, (prev, next) => {
    return prev.origRow === next.origRow && prev.vr.index === next.vr.index && prev.focusedCell === next.focusedCell;
});
TableRow.displayName = 'TableRow';

// Header cell - memoized
interface HeaderCellProps {
    column: { getIsSorted: () => 'asc' | 'desc' | false; toggleSorting: (asc: boolean) => void };
    k: string;
}

const HeaderCell = memo(({ column, k }: HeaderCellProps) => {
    const opts = DROPDOWN_OPTIONS[k as keyof typeof DROPDOWN_OPTIONS];
    let text = k.toUpperCase();
    if ((EMAIL_COLUMNS as readonly string[]).includes(k)) text = k;
    else if ((SENTENCE_CASE_COLUMNS as readonly string[]).includes(k)) text = k.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    else if ((CAPITALIZE_FIRST_COLUMNS as readonly string[]).includes(k)) text = k.charAt(0).toUpperCase() + k.slice(1).toLowerCase();

    const headerBtn = (
        <div className="flex items-center justify-between gap-1 min-w-40 w-full">
            <button className="flex items-center gap-1.5 hover:text-blue-600 transition-colors flex-1 min-w-0" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                <span className="font-bold text-gray-800 truncate text-[10px] tracking-wide">{text}</span>
                {isRequiredField(k) && <Badge variant="destructive" className="ml-1 text-[7px] px-1 py-0 h-3">REQ</Badge>}
                {column.getIsSorted() === 'asc' ? <ArrowUp className="h-3 w-3 text-blue-600 ml-1" /> : column.getIsSorted() === 'desc' ? <ArrowDown className="h-3 w-3 text-blue-600 ml-1" /> : null}
            </button>
            {opts && <Badge variant="secondary" className="text-[7px] px-1 py-0 h-3"><ChevronDown className="h-2 w-2" /></Badge>}
        </div>
    );

    if (!opts) return headerBtn;
    return (
        <Tooltip>
            <TooltipTrigger asChild>{headerBtn}</TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs bg-gray-900 text-white">
                <p className="font-bold text-xs mb-2 text-blue-300">Options:</p>
                <div className="text-xs space-y-1">{opts.map((o, i) => <div key={i}><span className="text-blue-400">•</span> {o}</div>)}</div>
            </TooltipContent>
        </Tooltip>
    );
}, (prev, next) => prev.k === next.k && prev.column.getIsSorted() === next.column.getIsSorted());
HeaderCell.displayName = 'HeaderCell';

export function LeadDataGrid({ data, errors = [], autoFixes = [], onDataUpdate, onDeleteRow, focusedCell }: LeadDataGridProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const parentRef = useRef<HTMLDivElement>(null);

    const { errorMap, dupMap, displayData } = useMemo(() => {
        const errMap = new Map<string, ValidationError[]>();
        const rowErrMap = new Map<number, number>();
        const dups = new Map<number, { id: string; rowIndices: number[] }>();

        errors.forEach(e => {
            const k = `${e.rowIndex}-${e.columnName}`;
            errMap.set(k, [...(errMap.get(k) || []), e]);
            rowErrMap.set(e.rowIndex, (rowErrMap.get(e.rowIndex) || 0) + 1);
            if (e.errorType === 'DUPLICATE_VALUE' && e.columnName === 'ID') {
                const id = String(e.cellValue);
                if (!dups.has(e.rowIndex)) {
                    const dupRows = errors.filter(err => err.errorType === 'DUPLICATE_VALUE' && err.columnName === 'ID' && String(err.cellValue) === id).map(err => err.rowIndex);
                    if (dupRows.length > 1) dupRows.forEach(r => dups.set(r, { id, rowIndices: dupRows }));
                }
            }
        });

        const indexed = data.map((row, i) => ({ row, idx: i, rowIdx: i + 2 }));
        indexed.sort((a, b) => {
            const aErr = rowErrMap.get(a.rowIdx) || 0, bErr = rowErrMap.get(b.rowIdx) || 0;
            if (aErr !== bErr) return bErr - aErr;
            const aDup = dups.has(a.rowIdx), bDup = dups.has(b.rowIdx);
            if (aDup !== bDup) return aDup ? -1 : 1;
            return a.idx - b.idx;
        });

        return { errorMap: errMap, dupMap: dups, displayData: indexed };
    }, [data, errors]);

    const afixMap = useMemo(() => new Map(autoFixes.map(f => [`${f.rowIndex}-${f.columnName}`, f])), [autoFixes]);
    const rows_ = useMemo(() => displayData.map(i => i.row), [displayData]);
    const displayIndexToRowMap = useMemo(() => new Map(displayData.map((i, d) => [d, i.rowIdx])), [displayData]);
    const rowToDisplayIndexMap = useMemo(() => {
        const map = new Map<number, number>();
        displayData.forEach((item, displayIdx) => map.set(item.rowIdx, displayIdx));
        return map;
    }, [displayData]);

    const handleCellChange = useCallback((r: number, c: string, v: string) => {
        if (!onDataUpdate) return;
        const d = [...data];
        d[r - 2] = { ...d[r - 2], [c]: v };
        onDataUpdate(d);
    }, [data, onDataUpdate]);

    // Build columns with memoization
    const columns = useMemo<ColumnDef<LeadDataRow>[]>(() => {
        if (!rows_.length) return [];
        return sortColumnsByOrder(Object.keys(rows_[0])).map(k => ({
            id: k,
            accessorFn: (r) => r[k],
            header: ({ column }) => <HeaderCell column={column} k={k} />,
            cell: () => null,
        }));
    }, [rows_]);

    const table = useReactTable({ data: rows_, columns, state: { sorting, globalFilter }, onSortingChange: setSorting, onGlobalFilterChange: setGlobalFilter, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel(), getFilteredRowModel: getFilteredRowModel() });
    const { rows } = table.getRowModel();
    const rowVirtualizer = useVirtualizer({ count: rows.length, getScrollElement: () => parentRef.current, estimateSize: () => VIRTUAL_ROW_HEIGHT, overscan: 4 });

    useEffect(() => {
        if (!focusedCell) return;
        const targetIndex = rowToDisplayIndexMap.get(focusedCell.rowIndex);
        if (typeof targetIndex === 'number') {
            rowVirtualizer.scrollToIndex(targetIndex, { align: 'center' });
            requestAnimationFrame(() => {
                const el = document.getElementById(`cell-${focusedCell.rowIndex}-${focusedCell.columnName}`);
                el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
            });
        }
    }, [focusedCell, rowToDisplayIndexMap, rowVirtualizer]);

    if (!rows_.length) return <div className="rounded-md border border-gray-200 bg-white shadow-sm p-8 text-center text-gray-500"><div className="text-lg font-medium">{NO_DATA_TITLE}</div><div className="text-sm mt-1">{NO_DATA_SUBTITLE}</div></div>;

    const vRows = rowVirtualizer.getVirtualItems();

    return (
        <TooltipProvider>
            <div className="rounded-md border border-gray-200 bg-white shadow-sm overflow-hidden h-[calc(100dvh-200px)]">
                <div className="border-b border-gray-200 p-4">
                    <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Search all columns..." value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} className="w-full rounded-md border border-gray-300 pl-10 pr-4 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>
                </div>
                <div ref={parentRef} className="overflow-auto" style={{ height: `${TABLE_HEIGHT}px` }}>
                    <table className="w-full">
                        <thead className="sticky top-0 z-30 bg-gray-50 border-b border-gray-200">
                            {table.getHeaderGroups().map(hg => (
                                <tr key={hg.id}>
                                    <th className="sticky left-0 z-50 w-16 border-r border-gray-200 bg-gray-50 px-2 py-3 text-center text-[10px] font-bold text-gray-700">SR. NO.</th>
                                    <th className="sticky z-40 w-12 border-r border-gray-200 bg-gray-50 px-2 py-3 text-center text-[10px] font-bold text-gray-700" style={{ left: '32px' }}>#</th>
                                    {hg.headers.map(h => <th key={h.id} className="min-w-40 px-0 py-3 text-left bg-gray-50">{flexRender(h.column.columnDef.header, h.getContext())}</th>)}
                                </tr>
                            ))}
                        </thead>
                        <tbody>
                            {vRows.length && vRows[0].start > 0 && <tr><td style={{ height: `${vRows[0].start}px` }} /></tr>}
                            {vRows.map(vr => {
                                const row = rows[vr.index], origRow = displayIndexToRowMap.get(row.index) || row.index + 2;
                                return <TableRow key={`${origRow}-${vr.index}`} vr={vr} row={row} origRow={origRow} dupMap={dupMap} focusedCell={focusedCell} errorMap={errorMap} autoFixMap={afixMap} onDeleteRow={onDeleteRow} handleCellChange={handleCellChange} />;
                            })}
                            {vRows.length && vRows[vRows.length - 1].end < rows.length * VIRTUAL_ROW_HEIGHT && <tr><td style={{ height: `${rows.length * VIRTUAL_ROW_HEIGHT - vRows[vRows.length - 1].end}px` }} /></tr>}
                        </tbody>
                    </table>
                </div>
                <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600"><div className="flex items-center justify-between"><div>Showing {rows.length} rows</div><div>Errors: {errors.length}</div></div></div>
            </div>
        </TooltipProvider>
    );
}
