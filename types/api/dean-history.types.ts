// types/api/dean-history.types.ts

// ============================================================
// ===== Response DTOs =====
// ============================================================

export interface DeanHistoryResponseDto {
    id: number;
    userId: number;
    deanName: string;
    startedAt: string;
    endedAt: string | null;
    notes: string | null;
    isCurrentDean: boolean;
    daysInOffice: number;
}

export interface CurrentDeanDto {
    userId: number;
    userName: string;
    userEmail: string;
    startedAt: string;
    daysInOffice: number;
}

// ============================================================
// ===== Request DTOs =====
// ============================================================

export interface CreateDeanHistoryRequest {
    userId: number;
    startedAt: string;
    notes?: string;
}

export interface TransferDeanRequest {
    newDeanUserId: number;
    transferDate?: string;
    notes?: string;
}
