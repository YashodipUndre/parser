'use client';
import { useCallback } from 'react';
import type { ParsedExcelFile } from '@/types/excel.types';

interface SessionData {
    parsedFile: ParsedExcelFile | null;
    selectedSheetIndex: number;
    unsavedChanges: boolean;
    timestamp: number;
}

const SESSION_KEY = 'excel-parser-session';
const DRAFT_KEY = 'excel-parser-draft';
const MAX_SESSION_AGE = 24 * 60 * 60 * 1000; // 24 hours

export function useSessionRecovery() {
    // Save session data to localStorage
    const saveSession = useCallback((data: Omit<SessionData, 'timestamp'>) => {
        const sessionData: SessionData = {
            ...data,
            timestamp: Date.now()
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    }, []);

    // Load session data from localStorage
    const loadSession = useCallback((): SessionData | null => {
        try {
            const stored = localStorage.getItem(SESSION_KEY);
            if (!stored) return null;

            const session: SessionData = JSON.parse(stored);
            const age = Date.now() - session.timestamp;

            // Expire old sessions
            if (age > MAX_SESSION_AGE) {
                localStorage.removeItem(SESSION_KEY);
                return null;
            }

            return session;
        } catch (error) {
            console.warn('Failed to load session:', error);
            return null;
        }
    }, []);

    // Clear session data
    const clearSession = useCallback(() => {
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(DRAFT_KEY);
    }, []);

    // Save draft (auto-save functionality)
    const saveDraft = useCallback((data: unknown) => {
        const draftData = {
            data,
            timestamp: Date.now()
        };
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
    }, []);

    // Load draft
    const loadDraft = useCallback(() => {
        try {
            const stored = localStorage.getItem(DRAFT_KEY);
            if (!stored) return null;

            const draft = JSON.parse(stored);
            const age = Date.now() - draft.timestamp;

            // Expire old drafts (1 hour)
            if (age > 60 * 60 * 1000) {
                localStorage.removeItem(DRAFT_KEY);
                return null;
            }

            return draft.data;
        } catch (error) {
            console.warn('Failed to load draft:', error);
            return null;
        }
    }, []);

    // Check if session recovery is available
    const hasRecoverableSession = useCallback(() => {
        const session = loadSession();
        return session && session.parsedFile && session.unsavedChanges;
    }, [loadSession]);

    return {
        saveSession,
        loadSession,
        clearSession,
        saveDraft,
        loadDraft,
        hasRecoverableSession
    };
}
