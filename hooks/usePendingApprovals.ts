/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/usePendingApprovals.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import * as distributionService from "@/services/distribution.service";
import { PendingApprovalCorrespondenceDto } from "@/types/api/distribution.types";
import toast from "react-hot-toast";
import PagedResult from "@/types/api/PagedResponse";

function sanitizePendingApprovalData(
  items: PendingApprovalCorrespondenceDto[]
): PendingApprovalCorrespondenceDto[] {
  return items.map((item) => ({
    ...item,
    attachments: (item.attachments || [])
      .filter((att) => att !== null && att !== undefined)
      .map((att) => ({
        ...att,
        fileName: att.fileName || "ملف بدون اسم",
      })),
    pendingReceivers: (item.pendingReceivers || [])
      .filter((r) => r !== null && r !== undefined)
      .map((r) => ({
        ...r,
        receiverName: r.receiverName || "غير معروف",
        receiverEmail: r.receiverEmail || "",
      })),
  }));
}

export function usePendingApprovals(pageSize: number = 20) {
  const [data, setData] =
    useState<PagedResult<PendingApprovalCorrespondenceDto> | null>(null);
  const [items, setItems] = useState<PendingApprovalCorrespondenceDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const isMounted = useRef(true);

  const loadData = useCallback(
    async (page: number = 1, isLoadMore: boolean = false) => {
      try {
        const result = await distributionService.getPendingApprovalsGrouped(
          page,
          pageSize
        );
        if (!isMounted.current) return;

        const cleanItems = sanitizePendingApprovalData(result.items);

        if (isLoadMore) {
          setItems((prev) => [...prev, ...cleanItems]);
        } else {
          setItems(cleanItems);
          setSelectedItems([]);
        }

        setData({
          ...result,
          items: cleanItems,
        });
        setTotalCount(result.totalCount);
        setCurrentPage(result.pageNumber);
        setHasMore(result.pageNumber < result.totalPages);
      } catch (error: any) {
        if (!isMounted.current) return;
        toast.error(error.message || "فشل تحميل الموافقات المعلقة");
        console.error(error);
        throw error;
      }
    },
    [pageSize]
  );

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore || isLoading) return;
    const nextPage = currentPage + 1;
    setIsLoadingMore(true);
    try {
      await loadData(nextPage, true);
    } finally {
      if (isMounted.current) {
        setIsLoadingMore(false);
      }
    }
  }, [hasMore, isLoadingMore, isLoading, currentPage, loadData]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      await loadData(1, false);
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [loadData]);

  const toggleSelectItem = useCallback((distributionId: number) => {
    setSelectedItems((prev) =>
      prev.includes(distributionId)
        ? prev.filter((id) => id !== distributionId)
        : [...prev, distributionId]
    );
  }, []);

  const selectAll = useCallback(() => {
    const allIds = items.flatMap((item) =>
      (item.pendingReceivers || [])
        .filter((r) => r && r.distributionId)
        .map((r) => r.distributionId)
    );
    setSelectedItems(allIds);
  }, [items]);

  const deselectAll = useCallback(() => {
    setSelectedItems([]);
  }, []);

  const approveSelected = useCallback(async () => {
    if (selectedItems.length === 0) {
      toast.error("يرجى اختيار توزيعات للموافقة عليها");
      return;
    }

    setIsProcessing(true);
    try {
      const count = await distributionService.approveDistributions(
        selectedItems
      );
      toast.success(`تمت الموافقة على ${count} توزيع`);
      setSelectedItems([]);
      await refresh();
      return count;
    } catch (error: any) {
      toast.error(error.message || "فشل الموافقة على التوزيعات");
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [selectedItems, refresh]);

  const rejectSelected = useCallback(
    async (reason?: string) => {
      if (selectedItems.length === 0) {
        toast.error("يرجى اختيار توزيعات للرفض");
        return;
      }

      setIsProcessing(true);
      try {
        const count = await distributionService.rejectDistributions(
          selectedItems,
          reason
        );
        toast.success(`تم رفض ${count} توزيع`);
        setSelectedItems([]);
        await refresh();
        return count;
      } catch (error: any) {
        toast.error(error.message || "فشل رفض التوزيعات");
        throw error;
      } finally {
        setIsProcessing(false);
      }
    },
    [selectedItems, refresh]
  );

  const approveAllByCorrespondence = useCallback(
    async (correspondenceId: number) => {
      setIsProcessing(true);
      try {
        const count = await distributionService.approveAllByCorrespondence(
          correspondenceId
        );
        toast.success(`تمت الموافقة على ${count} توزيع للمراسلة`);
        await refresh();
        return count;
      } catch (error: any) {
        toast.error(error.message || "فشل الموافقة على جميع التوزيعات");
        throw error;
      } finally {
        setIsProcessing(false);
      }
    },
    [refresh]
  );

  const rejectAllByCorrespondence = useCallback(
    async (correspondenceId: number, reason?: string) => {
      setIsProcessing(true);
      try {
        const count = await distributionService.rejectAllByCorrespondence(
          correspondenceId,
          reason
        );
        toast.success(`تم رفض ${count} توزيع للمراسلة`);
        await refresh();
        return count;
      } catch (error: any) {
        toast.error(error.message || "فشل رفض جميع التوزيعات");
        throw error;
      } finally {
        setIsProcessing(false);
      }
    },
    [refresh]
  );

const approveSingle = useCallback(async (distributionId: number) => {
  setIsProcessing(true);
  try {
    await distributionService.approveDistribution(distributionId);
    toast.success("تمت الموافقة على التوزيع");
    await refresh();
    return true;
  } catch (error: any) {
    toast.error(error.message || "فشل الموافقة على التوزيع");
    throw error;
  } finally {
    setIsProcessing(false);
  }
}, [refresh]);

const rejectSingle = useCallback(async (distributionId: number, reason?: string) => {
  setIsProcessing(true);
  try {
    await distributionService.rejectDistribution(distributionId, reason);
    toast.success("تم رفض التوزيع");
    await refresh();
    return true;
  } catch (error: any) {
    toast.error(error.message || "فشل رفض التوزيع");
    throw error;
  } finally {
    setIsProcessing(false);
  }
}, [refresh]);
  useEffect(() => {
    isMounted.current = true;

    const fetchInitial = async () => {
      try {
        const result = await distributionService.getPendingApprovalsGrouped(
          1,
          pageSize
        );
        if (!isMounted.current) return;

        const cleanItems = sanitizePendingApprovalData(result.items);
        setItems(cleanItems);
        setData({ ...result, items: cleanItems });
        setTotalCount(result.totalCount);
        setCurrentPage(result.pageNumber);
        setHasMore(result.pageNumber < result.totalPages);
        setSelectedItems([]);
      } catch (error: any) {
        if (!isMounted.current) return;
        toast.error(error.message || "فشل تحميل الموافقات المعلقة");
        console.error(error);
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    };

    fetchInitial();

    return () => {
      isMounted.current = false;
    };
  }, [pageSize]);

  return {
    items,
    data,
    isLoading,
    isLoadingMore,
    hasMore,
    totalCount,
    currentPage,
    selectedItems,
    isProcessing,
    loadMore,
    refresh,
    toggleSelectItem,
    selectAll,
    deselectAll,
    approveSelected,
    rejectSelected,
    approveAllByCorrespondence,
    rejectAllByCorrespondence,
    approveSingle,
  rejectSingle,
  };
}