'use client';

import { useCallback, useMemo } from 'react';
import type { ParsedExcelFile } from '@/types/excel.types';
import type { ValidationSummary } from '@/types/validation.types';
import type { SavedUploadEntry, SavedUploadSummary, SerializedParsedExcelFile } from '@/types/history.types';

const HISTORY_STORAGE_KEY = 'excel-parser-history';
const HISTORY_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days
const MAX_ENTRIES = 25; // hard cap to avoid blowing past localStorage quota

interface SavePayload {
    id?: string;
    parsedFile: ParsedExcelFile;
    validationSummary?: ValidationSummary | null;
    totalErrors: number;
    autoFixCount: number;
}

const isBrowser = typeof window !== 'undefined';

const serializeParsedFile = (file: ParsedExcelFile): SerializedParsedExcelFile => ({
    ...file,
    uploadDate: file.uploadDate.toISOString(),
});

const deserializeParsedFile = (file: SerializedParsedExcelFile): ParsedExcelFile => ({
    ...file,
    uploadDate: new Date(file.uploadDate),
});

const readHistory = (): SavedUploadEntry[] => {
    if (!isBrowser) return [];
    try {
        const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);
        if (!raw) return [];
        const parsed: SavedUploadEntry[] = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.warn('Failed to read upload history:', error);
        return [];
    }
};

const writeHistory = (entries: SavedUploadEntry[]) => {
    if (!isBrowser) return;
    try {
        window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(entries));
    } catch (error) {
        console.warn('Failed to persist upload history:', error);
    }
};

const flushExpiredEntries = (entries: SavedUploadEntry[]) => {
    if (!entries.length) return entries;
    const now = Date.now();
    const filtered = entries.filter((entry) => entry.expiresAt > now);
    if (filtered.length !== entries.length) {
        writeHistory(filtered);
    }
    return filtered;
};

const ensureCapacity = (entries: SavedUploadEntry[]) => {
    if (entries.length <= MAX_ENTRIES) return entries;
    const sorted = [...entries].sort((a, b) => a.updatedAt - b.updatedAt);
    return sorted.slice(sorted.length - MAX_ENTRIES);
};

export function useUploadHistory() {
    const listUploads = useCallback((): SavedUploadSummary[] => {
        const entries = flushExpiredEntries(readHistory());
        return entries
            .sort((a, b) => b.updatedAt - a.updatedAt)
            .map((entry) => {
                const { parsedFile, ...summary } = entry;
                void parsedFile;
                return summary;
            });
    }, []);

    const getUploadById = useCallback((id: string): ParsedExcelFile | null => {
        const entries = flushExpiredEntries(readHistory());
        const entry = entries.find((item) => item.id === id);
        return entry ? deserializeParsedFile(entry.parsedFile) : null;
    }, []);

    const saveUpload = useCallback((payload: SavePayload): string => {
        if (!payload.parsedFile) return payload.id || '';
        const entries = flushExpiredEntries(readHistory());
        const now = Date.now();
        const id = payload.id ?? (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${now}-${Math.random()}`);
        const existingIndex = entries.findIndex((entry) => entry.id === id);
        const baseSummary = existingIndex >= 0 ? entries[existingIndex] : null;

        const summary: SavedUploadEntry = {
            id,
            fileName: payload.parsedFile.fileName,
            fileSize: payload.parsedFile.fileSize,
            totalRows: payload.parsedFile.totalRows,
            totalErrors: payload.totalErrors,
            autoFixCount: payload.autoFixCount,
            sheetCount: payload.parsedFile.totalSheets,
            sheetNames: payload.parsedFile.sheets.map((s) => s.name),
            createdAt: baseSummary?.createdAt ?? now,
            updatedAt: now,
            expiresAt: now + HISTORY_TTL,
            parsedFile: serializeParsedFile(payload.parsedFile),
            validationSummary: payload.validationSummary ?? null,
        };

        const nextEntries = existingIndex >= 0
            ? entries.map((entry, idx) => (idx === existingIndex ? summary : entry))
            : [...entries, summary];

        const bounded = ensureCapacity(nextEntries);
        writeHistory(bounded);
        return id;
    }, []);

    const deleteUpload = useCallback((id: string) => {
        const entries = readHistory();
        const next = entries.filter((entry) => entry.id !== id);
        writeHistory(next);
    }, []);

    const clearUploads = useCallback(() => {
        if (!isBrowser) return;
        window.localStorage.removeItem(HISTORY_STORAGE_KEY);
    }, []);

    const flushUploads = useCallback(() => {
        flushExpiredEntries(readHistory());
    }, []);

    const helpers = useMemo(() => ({
        listUploads,
        getUploadById,
        saveUpload,
        deleteUpload,
        clearUploads,
        flushUploads,
    }), [listUploads, getUploadById, saveUpload, deleteUpload, clearUploads, flushUploads]);

    return helpers;
}
