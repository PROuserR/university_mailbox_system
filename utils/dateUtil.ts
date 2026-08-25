// src/utils/dateUtils.ts

import { format, isValid } from 'date-fns';

const TIMEZONE = 'Asia/Damascus';

// ============================================================
// ===== Conversions =====
// ============================================================

export const localDateToUTC = (dateString: string): string => {
    if (!dateString) return '';
    
    try {
        // Create date at noon to avoid timezone issues
        const date = new Date(dateString + 'T12:00:00');
        return date.toISOString();
    } catch {
        return '';
    }
};

export const utcToLocalDate = (utcDateString: string | null): string => {
    if (!utcDateString) return '';
    
    try {
        const date = new Date(utcDateString);
        if (!isValid(date)) return '';
        
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
    } catch {
        return '';
    }
};

// ============================================================
// ===== Today's Date =====
// ============================================================

export const getTodaySyria = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const getTodaySyriaDate = (): Date => {
    const dateStr = getTodaySyria();
    const parts = dateStr.split('-');
    return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
};

// ============================================================
// ===== Date Display Formatting =====
// ============================================================

export const formatDateDisplay = (dateString?: string | null): string => {
    if (!dateString) return "";
    
    const localDate = utcToLocalDate(dateString);
    if (!localDate) return "";
    
    const parts = localDate.split('-');
    if (parts.length !== 3) return "";
    
    const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    const now = new Date();
    
    const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    const targetDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    
    const diffDays = Math.floor((today.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "اليوم";
    if (diffDays === 1) return "أمس";
    if (diffDays > 0 && diffDays < 7) return `منذ ${diffDays} أيام`;
    
    if (diffDays < 0) {
        const futureDays = Math.abs(diffDays);
        if (futureDays === 1) return "غداً";
        if (futureDays < 7) return `بعد ${futureDays} أيام`;
    }
    
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
};

export const formatDateShort = (dateString?: string | null): string => {
    if (!dateString) return '';
    
    const localDate = utcToLocalDate(dateString);
    if (!localDate) return '';
    
    const parts = localDate.split('-');
    if (parts.length !== 3) return '';
    
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

export const formatDateInput = (dateString?: string | null): string => {
    if (!dateString) return '';
    return utcToLocalDate(dateString);
};

// ============================================================
// ===== Validation =====
// ============================================================

export const isValidDate = (dateString: string): boolean => {
    if (!dateString) return false;
    const date = new Date(dateString);
    return !isNaN(date.getTime());
};

export const isNotFutureDate = (dateString: string): boolean => {
    if (!dateString) return true;
    
    const today = new Date();
    const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
    const selectedDate = new Date(dateString + 'T00:00:00Z');
    
    return selectedDate <= todayUTC;
};

export const isDateNotAfter = (date1: string, date2: string): boolean => {
    if (!date1 || !date2) return true;
    
    const d1 = new Date(date1 + 'T00:00:00Z');
    const d2 = new Date(date2 + 'T00:00:00Z');
    
    return d1 <= d2;
};

// ============================================================
// ===== Date Comparison =====
// ============================================================

export const daysBetween = (date1: string, date2: string): number => {
    if (!date1 || !date2) return 0;
    
    const d1 = new Date(date1 + 'T00:00:00Z');
    const d2 = new Date(date2 + 'T00:00:00Z');
    
    return Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
};

export const isDateBefore = (date1: string, date2: string): boolean => {
    if (!date1 || !date2) return false;
    
    const d1 = new Date(date1 + 'T00:00:00Z');
    const d2 = new Date(date2 + 'T00:00:00Z');
    
    return d1 < d2;
};

export const isDateAfter = (date1: string, date2: string): boolean => {
    if (!date1 || !date2) return false;
    
    const d1 = new Date(date1 + 'T00:00:00Z');
    const d2 = new Date(date2 + 'T00:00:00Z');
    
    return d1 > d2;
};

// ============================================================
// ===== Add / Subtract Days =====
// ============================================================

export const addDays = (dateString: string, days: number): string => {
    if (!dateString) return '';
    
    const date = new Date(dateString + 'T00:00:00Z');
    date.setDate(date.getDate() + days);
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
};

export const subtractDays = (dateString: string, days: number): string => {
    return addDays(dateString, -days);
};

// ============================================================
// ===== UTC Helpers =====
// ============================================================

export const toUTCDate = (dateString: string): Date => {
    return new Date(dateString + 'T00:00:00Z');
};

export const getTodayUTC = (): Date => {
    const now = new Date();
    return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
};