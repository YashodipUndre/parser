'use client';

import * as XLSX from 'xlsx';
import { DROPDOWN_OPTIONS, VALID_COLUMNS, EMAIL_PATTERN } from '@/constants';
import type { LeadDataRow, ParsedExcelFile, AutoFixInfo } from '@/types/excel.types';

const isEmpty = (v: unknown) => !v || (typeof v === 'string' && !v.trim());
const toProper = (s: string) => s.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
const isEmail = (v: string) => EMAIL_PATTERN.test(v) || v.includes('@');

const NAME_FIELDS = new Set(['First Name', 'Middle Name', 'Last Name', 'Job Title', 'Organization Name', 'City', 'State/Province', 'Country', 'Source', 'Lead Category', 'Market Segment', 'Industry Type', 'CASE Officer Remark', 'CASE Officer Note']);
const PHONE_FIELDS = new Set(['Phone', 'Mobile', 'WhatsApp', 'Phone Ext.', 'Company Phone']);

// Levenshtein distance with early exit
const leven = (a: string, b: string): number => {
    if (a === b) return 0;
    const [s1, s2] = a.length > b.length ? [b, a] : [a, b];
    if (!s1.length) return s2.length;
    let prev = Array.from({ length: s1.length + 1 }, (_, i) => i);
    for (let i = 0; i < s2.length; i++) {
        const curr = [i + 1];
        for (let j = 0; j < s1.length; j++) {
            curr[j + 1] = s2[i] === s1[j] ? prev[j] : Math.min(prev[j], prev[j + 1], curr[j]) + 1;
        }
        prev = curr;
    }
    return prev[s1.length];
};

const findMatch = (val: string, opts: readonly string[]): string | null => {
    const v = val.toLowerCase();
    for (const o of opts) {
        const ol = o.toLowerCase();
        if (ol === v || ol.includes(v) || v.includes(ol)) return o;
    }
    for (const o of opts) {
        if ((o.length - leven(val, o)) / o.length >= 0.8) return o;
    }
    return null;
};

const processFixes = (val: string, col: string, row: number): { value: string; fixes: AutoFixInfo[] } => {
    const fixes: AutoFixInfo[] = [];
    let v = val.trim();

    if (val !== v) fixes.push({ rowIndex: row, columnName: col, originalValue: val, fixedValue: v, fixType: 'space-trim' });

    if (v && isEmail(v)) {
        const l = v.toLowerCase();
        if (v !== l) {
            fixes.push({ rowIndex: row, columnName: col, originalValue: val, fixedValue: l, fixType: 'email-lowercase' });
            v = l;
        }
    }

    if (NAME_FIELDS.has(col) && v) {
        const p = toProper(v);
        if (v !== p) {
            fixes.push({ rowIndex: row, columnName: col, originalValue: val, fixedValue: p, fixType: 'name-format' });
            v = p;
        }
    }

    if (PHONE_FIELDS.has(col) && v) {
        const c = v.replace(/[\s\-\(\)]/g, '');
        if (v !== c) {
            fixes.push({ rowIndex: row, columnName: col, originalValue: val, fixedValue: c, fixType: 'phone-clean' });
            v = c;
        }
    }

    const opts = DROPDOWN_OPTIONS[col as keyof typeof DROPDOWN_OPTIONS];
    if (opts && v) {
        const m = findMatch(v, opts);
        if (m && m !== v) {
            fixes.push({ rowIndex: row, columnName: col, originalValue: val, fixedValue: m, fixType: 'dropdown-match' });
            v = m;
        }
    }

    return { value: v, fixes };
};

export async function parseExcelFile(file: File): Promise<ParsedExcelFile> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const wb = XLSX.read(e.target?.result, { type: 'binary' });
                const allFixes: AutoFixInfo[] = [];
                let totalRows = 0;

                const sheets = wb.SheetNames.map(name => {
                    const ws = wb.Sheets[name];
                    const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', raw: false }) as unknown[][];
                    if (!raw.length) return { name, data: [], headers: [], rowCount: 0, columnCount: 0 };

                    const headers = (raw[0] as string[]).filter(h => (VALID_COLUMNS as readonly string[]).includes(h));
                    const headerMap = (raw[0] as string[]).map((h, i) => ({ h, i })).filter(({ h }) => (VALID_COLUMNS as readonly string[]).includes(h));

                    const data: LeadDataRow[] = [];
                    for (let r = 1; r < raw.length; r++) {
                        const row = raw[r] as unknown[];
                        const rowData: Partial<LeadDataRow> = {};
                        let hasData = false;

                        for (const { h, i } of headerMap) {
                            const val = (row[i] as string) || '';
                            const { value, fixes } = processFixes(val, h, r + 1);
                            allFixes.push(...fixes);
                            (rowData as Record<string, unknown>)[h] = value;
                            if (value) hasData = true;
                        }

                        if (hasData) data.push(rowData as LeadDataRow);
                    }

                    totalRows += data.length;
                    if (allFixes.length) console.info(`🔧 Fixed ${allFixes.length} issues in ${name}`);

                    return { name, data, headers, rowCount: data.length, columnCount: headers.length };
                });

                resolve({ fileName: file.name, fileSize: file.size, uploadDate: new Date(), sheets, totalRows, totalSheets: wb.SheetNames.length, autoFixes: allFixes });
            } catch (err) {
                reject(new Error(`Parse failed: ${(err as Error).message}`));
            }
        };
        reader.onerror = () => reject(new Error('Read failed'));
        reader.readAsBinaryString(file);
    });
}

export function exportToExcel(sheets: ParsedExcelFile['sheets'], fileName: string): void {
    const wb = XLSX.utils.book_new();
    for (const s of sheets) {
        if (!s.data.length) continue;
        const h = Object.keys(s.data[0]);
        const ws = XLSX.utils.aoa_to_sheet([h, ...s.data.map(r => h.map(k => r[k as keyof LeadDataRow] || ''))]);
        XLSX.utils.book_append_sheet(wb, ws, s.name);
    }
    XLSX.writeFile(wb, fileName);
}

export function validateHeaders(uploaded: string[], template: string[]) {
    const missing = template.filter(h => !uploaded.includes(h));
    const extra = uploaded.filter(h => !template.includes(h));
    return { isValid: !missing.length && !extra.length, missingColumns: missing, extraColumns: extra, columnOrderMismatch: uploaded.some((h, i) => h !== template[i]) };
}

export function analyzeColumn(col: string, vals: unknown[]) {
    const nonEmpty = vals.filter(v => !isEmpty(v));
    const unique = new Set(nonEmpty);
    return { dataType: 'text', emptyCount: vals.length - nonEmpty.length, uniqueCount: unique.size, hasSpaces: nonEmpty.some(v => typeof v === 'string' && v !== v.trim()), sampleValues: Array.from(unique).slice(0, 5) };
}
