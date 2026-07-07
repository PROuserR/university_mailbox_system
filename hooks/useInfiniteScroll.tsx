// hooks/useInfiniteScroll.ts

import { useEffect, useRef, useCallback } from "react";

type Props = {
    onBottom: () => void | Promise<void>;
    isLoading?: boolean;
    hasMore?: boolean;
    dataLength: number;
    threshold?: number;
    rootMargin?: string;
};

export default function useSafeBottomTrigger({
    onBottom,
    isLoading = false,
    hasMore = true,
    dataLength,
    threshold = 0.8,
    rootMargin = "50px",
}: Props) {
    const bottomRef = useRef<HTMLDivElement | null>(null);
    const isReadyRef = useRef(false);
    const loadingLockRef = useRef(false);
    const observerRef = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        if (dataLength > 0) {
            isReadyRef.current = true;
        }
    }, [dataLength]);

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

            const result = onBottom();
            if (result instanceof Promise) {
                result.finally(() => {
                    loadingLockRef.current = false;
                });
            } else {
                loadingLockRef.current = false;
            }
        },
        [onBottom, isLoading, hasMore, threshold]
    );

    useEffect(() => {
        const el = bottomRef.current;
        if (!el) return;

        if (observerRef.current) {
            observerRef.current.disconnect();
            observerRef.current = null;
        }

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
    }, [handleIntersection, threshold, rootMargin]);

    return bottomRef;
}