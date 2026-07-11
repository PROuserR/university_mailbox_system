// hooks/useAdvancedSearch.ts

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback, useMemo } from "react";

export type SortDirection = "asc" | "desc";
export type SortField = "title" | "number" | "issuedDate" | "createdAt" | "senderEntity" | "mainType" | "distributedDate";

export interface AdvancedSearchParams {
  searchText: string;
  mainType?: string;
  isProfessional?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  documentTypeId?: number;
  senderEntityId?: number;
  sortField: SortField;
  sortDirection: SortDirection;
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
  setSort: (field: SortField, direction?: SortDirection) => void;
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
  sortField: "issuedDate",
  sortDirection: "desc",
};

// ✅ دالة تنظيف النص
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
      searchParams.senderEntityId);
  }, [searchParams]);

  // ✅ تنظيف النص عند التحديث
  const setSearchText = useCallback((text: string) => {
    const cleaned = cleanText(text);
    setSearchParams(prev => ({ ...prev, searchText: cleaned }));
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

  const setSort = useCallback((field: SortField, direction?: SortDirection) => {
    setTempParams(prev => ({
      ...prev,
      sortField: field,
      sortDirection: direction || (prev.sortField === field && prev.sortDirection === "asc" ? "desc" : "asc"),
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setSearchParams({
      ...defaultParams,
      searchText: searchParams.searchText,
    });
    setTempParams({
      ...defaultParams,
      searchText: searchParams.searchText,
    });
  }, [searchParams.searchText]);

  const openModal = useCallback(() => {
    setTempParams({ ...searchParams });
    setIsOpen(true);
  }, [searchParams]);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const applyFilters = useCallback(() => {
    // ✅ تنظيف النص قبل التطبيق
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
    setSort,
    resetFilters,
    openModal,
    closeModal,
    applyFilters,
  };
}