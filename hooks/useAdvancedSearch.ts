// src/hooks/useAdvancedSearch.ts

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback, useMemo } from "react";
import { CorrespondenceStatus } from "@/types/api/correspondence.types";

export type SortDirection = "asc" | "desc";
export type SortField = "title" | "number" | "issuedDate" | "createdAt" | "senderEntity" | "mainType" | "distributedDate" | "receivedDate" | "sentDate";

export interface AdvancedSearchParams {
    searchText: string;
    mainType?: string;
    isProfessional?: boolean;
    dateFrom?: Date;
    dateTo?: Date;
    documentTypeId?: number;
    senderEntityId?: number;
    status?: CorrespondenceStatus;
    sortField: SortField;
    sortDirection: SortDirection;
    number?: number;
    createdAtFrom?: Date;
    createdAtTo?: Date;
    issuedDateFrom?: Date;
    issuedDateTo?: Date;
    receivedDateFrom?: Date;
    receivedDateTo?: Date;
    sentDateFrom?: Date;
    sentDateTo?: Date;
}

export interface AdvancedSearchReturn<T> {
    searchParams: AdvancedSearchParams;
    tempParams: AdvancedSearchParams;
    hasActiveFilters: boolean;
    isOpen: boolean;
    setSearchText: (text: string) => void;
    setMainType: (type?: string) => void;
    setProfessional: (value?: boolean) => void;
    setDateRange: (from?: Date, to?: Date) => void;
    setDocumentType: (id?: number) => void;
    setSenderEntity: (id?: number) => void;
    setStatus: (value?: CorrespondenceStatus) => void;
    setSort: (field: SortField, direction?: SortDirection) => void;
    setNumber: (value?: number) => void;
    setCreatedAtRange: (from?: Date, to?: Date) => void;
    setIssuedDateRange: (from?: Date, to?: Date) => void;
    setReceivedDateRange: (from?: Date, to?: Date) => void;
    setSentDateRange: (from?: Date, to?: Date) => void;
    setTempParams: (params: AdvancedSearchParams) => void; // ✅ إضافة هذه الدالة
    resetFilters: () => void;
    openModal: () => void;
    closeModal: () => void;
    applyFilters: () => void;
}

const defaultParams: AdvancedSearchParams = {
    searchText: "",
    mainType: undefined,
    isProfessional: undefined,
    dateFrom: undefined,
    dateTo: undefined,
    documentTypeId: undefined,
    senderEntityId: undefined,
    status: undefined,
    sortField: "issuedDate",
    sortDirection: "desc",
    number: undefined,
    createdAtFrom: undefined,
    createdAtTo: undefined,
    issuedDateFrom: undefined,
    issuedDateTo: undefined,
    receivedDateFrom: undefined,
    receivedDateTo: undefined,
    sentDateFrom: undefined,
    sentDateTo: undefined,
};

const cleanText = (text: string): string => {
    return text.replace(/\s+/g, ' ').trim();
};

export function useAdvancedSearch<T>(initialParams?: Partial<AdvancedSearchParams>): AdvancedSearchReturn<T> {
    const [searchParams, setSearchParams] = useState<AdvancedSearchParams>({
        ...defaultParams,
        ...initialParams,
    });

    const [tempParams, setTempParams] = useState<AdvancedSearchParams>({
        ...defaultParams,
        ...initialParams,
    });

    const [isOpen, setIsOpen] = useState(false);

    const hasActiveFilters = useMemo(() => {
        return !!(searchParams.mainType ||
            searchParams.isProfessional !== undefined ||
            searchParams.dateFrom ||
            searchParams.dateTo ||
            searchParams.documentTypeId ||
            searchParams.senderEntityId ||
            searchParams.status !== undefined ||
            searchParams.number ||
            searchParams.createdAtFrom ||
            searchParams.createdAtTo ||
            searchParams.issuedDateFrom ||
            searchParams.issuedDateTo ||
            searchParams.receivedDateFrom ||
            searchParams.receivedDateTo ||
            searchParams.sentDateFrom ||
            searchParams.sentDateTo);
    }, [searchParams]);

    const setSearchText = useCallback((text: string) => {
        const cleaned = cleanText(text);
        setSearchParams(prev => ({ ...prev, searchText: cleaned }));
        setTempParams(prev => ({ ...prev, searchText: cleaned }));
    }, []);

    const setMainType = useCallback((type?: string) => {
        setTempParams(prev => ({ ...prev, mainType: type }));
    }, []);

    const setProfessional = useCallback((value?: boolean) => {
        setTempParams(prev => ({ ...prev, isProfessional: value }));
    }, []);

    const setDateRange = useCallback((from?: Date, to?: Date) => {
        setTempParams(prev => ({ ...prev, dateFrom: from, dateTo: to }));
    }, []);

    const setDocumentType = useCallback((id?: number) => {
        setTempParams(prev => ({ ...prev, documentTypeId: id }));
    }, []);

    const setSenderEntity = useCallback((id?: number) => {
        setTempParams(prev => ({ ...prev, senderEntityId: id }));
    }, []);

    const setStatus = useCallback((value?: CorrespondenceStatus) => {
        setTempParams(prev => ({ ...prev, status: value }));
    }, []);

    const setNumber = useCallback((value?: number) => {
        setTempParams(prev => ({ ...prev, number: value }));
    }, []);

    const setCreatedAtRange = useCallback((from?: Date, to?: Date) => {
        setTempParams(prev => ({ ...prev, createdAtFrom: from, createdAtTo: to }));
    }, []);

    const setIssuedDateRange = useCallback((from?: Date, to?: Date) => {
        setTempParams(prev => ({ ...prev, issuedDateFrom: from, issuedDateTo: to }));
    }, []);

    const setReceivedDateRange = useCallback((from?: Date, to?: Date) => {
        setTempParams(prev => ({ ...prev, receivedDateFrom: from, receivedDateTo: to }));
    }, []);

    const setSentDateRange = useCallback((from?: Date, to?: Date) => {
        setTempParams(prev => ({ ...prev, sentDateFrom: from, sentDateTo: to }));
    }, []);

    const setSort = useCallback((field: SortField, direction?: SortDirection) => {
        setTempParams(prev => ({
            ...prev,
            sortField: field,
            sortDirection: direction || (prev.sortField === field && prev.sortDirection === "asc" ? "desc" : "asc"),
        }));
    }, []);

    const resetFilters = useCallback(() => {
        const currentSearchText = searchParams.searchText;
        const resetState = {
            ...defaultParams,
            searchText: currentSearchText,
        };
        setSearchParams(resetState);
        setTempParams(resetState);
    }, [searchParams.searchText]);

    const openModal = useCallback(() => {
        setTempParams({ ...searchParams });
        setIsOpen(true);
    }, [searchParams]);

    const closeModal = useCallback(() => {
        setIsOpen(false);
    }, []);

    const applyFilters = useCallback(() => {
        const cleaned = cleanText(tempParams.searchText);
        setSearchParams({
            ...tempParams,
            searchText: cleaned
        });
        setIsOpen(false);
    }, [tempParams]);

    return {
        searchParams,
        tempParams,
        hasActiveFilters,
        isOpen,
        setSearchText,
        setMainType,
        setProfessional,
        setDateRange,
        setDocumentType,
        setSenderEntity,
        setStatus,
        setSort,
        setNumber,
        setCreatedAtRange,
        setIssuedDateRange,
        setReceivedDateRange,
        setSentDateRange,
        setTempParams, 
        resetFilters,
        openModal,
        closeModal,
        applyFilters,
    };
}