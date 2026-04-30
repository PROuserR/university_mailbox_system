import { useEffect, useRef } from "react";

type Props = {
    onBottom: () => void;
    isLoading?: boolean;
    hasMore?: boolean;
    dataLength: number;
};

export default function useSafeBottomTrigger({
    onBottom,
    isLoading = false,
    hasMore = true,
    dataLength,
}: Props) {
    const bottomRef = useRef<HTMLDivElement | null>(null);

    // 🔒 prevents triggering before first data load
    const isReadyRef = useRef(false);

    // 🔒 prevents multiple rapid calls
    const loadingLockRef = useRef(false);

    useEffect(() => {
        if (dataLength > 0) {
            isReadyRef.current = true;
        }
    }, [dataLength]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                const isFullyVisible = entry.intersectionRatio === 1;

                // 🚨 ALL SAFETY CHECKS
                if (
                    !isFullyVisible ||
                    !isReadyRef.current ||
                    isLoading ||
                    loadingLockRef.current ||
                    !hasMore
                ) {
                    return;
                }

                loadingLockRef.current = true;

                Promise.resolve(onBottom()).finally(() => {
                    loadingLockRef.current = false;
                });
            },
            {
                root: null,
                threshold: 1.0, // must be fully visible
            }
        );

        const el = bottomRef.current;
        if (el) observer.observe(el);

        return () => {
            if (el) observer.unobserve(el);
        };
    }, [onBottom, isLoading, hasMore]);

    return bottomRef;
}