/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useOutgoingInfiniteScroll.ts

import { useCallback, useRef, useState, useEffect } from "react";

interface UseInfiniteScrollProps {
  onBottom: () => void;
  isLoading?: boolean;
  hasMore?: boolean;
  dataLength: number;
  threshold?: number;
  rootMargin?: string;
}

export function useOutgoingInfiniteScroll({
  onBottom,
  isLoading = false,
  hasMore = true,
  dataLength,
  threshold = 0.5,
  rootMargin = "50px",
}: UseInfiniteScrollProps) {
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const isReadyRef = useRef(false);
  const loadingLockRef = useRef(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // تحديث حالة الجاهزية عند وجود بيانات
  useEffect(() => {
    if (dataLength > 0) {
      isReadyRef.current = true;
    }
  }, [dataLength]);

  // معالج التقاطع
  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const entry = entries[0];
      if (!entry) return;

      const isVisible = entry.intersectionRatio >= threshold;

      if (
        !isVisible ||
        !isReadyRef.current ||
        isLoading ||
        loadingLockRef.current ||
        !hasMore
      ) {
        return;
      }

      loadingLockRef.current = true;
      onBottom();

      setTimeout(() => {
        loadingLockRef.current = false;
      }, 500);
    },
    [onBottom, isLoading, hasMore, threshold]
  );

  // إنشاء Observer عند تغير العنصر
  useEffect(() => {
    const el = element;
    if (!el) return;

    // تنظيف الـ Observer القديم
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // إنشاء Observer جديد
    observerRef.current = new IntersectionObserver(handleIntersection, {
      root: null,
      threshold,
      rootMargin,
    });

    observerRef.current.observe(el);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [element, handleIntersection, threshold, rootMargin]);

  const setBottomRef = useCallback((node: HTMLDivElement | null) => {
    setElement(node);
  }, []);

  return { bottomRef: { current: element }, setBottomRef };
}