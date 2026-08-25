// src/components/ui/ParentSelectorModal.tsx

"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faSearch,
    faXmark,
    faCheck,
    faSpinner,
    faInbox,
} from "@fortawesome/free-solid-svg-icons";
import { useParentSelector } from "@/hooks/useCorrespondence";
import { cn } from "@/lib/utils";
import { CorrespondenceParentSelectorDto } from "@/types/api/correspondence.types";

interface ParentSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (item: CorrespondenceParentSelectorDto) => void;
    selectedId?: number | null;
}

const getMainTypeLabel = (mainType: number) => {
    switch (mainType) {
        case 1: return "وارد";
        case 2: return "صادر";
        case 3: return "داخلي";
        default: return "غير محدد";
    }
};

const getMainTypeColor = (mainType: number) => {
    switch (mainType) {
        case 1: return "bg-emerald-100 text-emerald-700";
        case 2: return "bg-blue-100 text-blue-700";
        case 3: return "bg-purple-100 text-purple-700";
        default: return "bg-gray-100 text-gray-700";
    }
};

export function ParentSelectorModal({
    isOpen,
    onClose,
    onSelect,
    selectedId,
}: ParentSelectorModalProps) {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [hasSearched, setHasSearched] = useState(false);

    const { data, isLoading, refetch } = useParentSelector(search, page, 10);

    const handleSearch = () => {
        setPage(1);
        setHasSearched(true);
        refetch();
    };

    const handleSelect = (item: CorrespondenceParentSelectorDto) => {
        onSelect(item);
        onClose();
    };

    const items = data?.items || [];
    const totalCount = data?.totalCount || 0;
    const totalPages = data?.totalPages || 0;

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg rounded-2xl p-0 shadow-2xl" hideCloseButton>
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border p-4">
                    <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
                        <span className="text-lg">🔗</span>
                        اختيار مراسلة أصلية
                    </DialogTitle>
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={onClose}
                        className="h-8 w-8"
                    >
                        <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
                    </Button>
                </div>

                {/* Search Bar */}
                <div className="p-4 space-y-4">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="ابحث برقم أو عنوان المراسلة..."
                                className="w-full rounded-xl border border-border bg-white px-4 py-2.5 pr-10 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                            />
                            <FontAwesomeIcon
                                icon={faSearch}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"
                            />
                        </div>
                        <Button
                            onClick={handleSearch}
                            disabled={isLoading}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition"
                        >
                            {isLoading ? (
                                <FontAwesomeIcon icon={faSpinner} spin />
                            ) : (
                                <FontAwesomeIcon icon={faSearch} />
                            )}
                            بحث
                        </Button>
                    </div>

                    {/* Results */}
                    {hasSearched && (
                        <div className="max-h-[350px] overflow-y-auto space-y-1.5">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-8 text-gray-400">
                                    <FontAwesomeIcon icon={faSpinner} spin className="ml-2" />
                                    جاري البحث...
                                </div>
                            ) : items.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                                    <FontAwesomeIcon icon={faInbox} className="text-2xl mb-2" />
                                    <p className="text-sm">لا توجد نتائج</p>
                                </div>
                            ) : (
                                items.map((item) => {
                                    const isSelected = selectedId === item.id;
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => handleSelect(item)}
                                            className={cn(
                                                "w-full text-right p-3 rounded-xl border transition-all hover:border-blue-300 hover:bg-blue-50",
                                                isSelected
                                                    ? "border-blue-400 bg-blue-50"
                                                    : "border-gray-200"
                                            )}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-gray-800">
                                                            #{item.number}
                                                        </span>
                                                        <span className={cn(
                                                            "px-2 py-0.5 rounded-full text-[10px] font-medium",
                                                            getMainTypeColor(item.mainType)
                                                        )}>
                                                            {getMainTypeLabel(item.mainType)}
                                                        </span>
                                                    </div>
                                                    <span className="text-sm text-gray-600">
                                                        {item.title}
                                                    </span>
                                                </div>
                                                {isSelected && (
                                                    <FontAwesomeIcon
                                                        icon={faCheck}
                                                        className="text-blue-500 text-sm"
                                                    />
                                                )}
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    )}

                    {hasSearched && !isLoading && totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 pt-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setPage((p) => Math.max(1, p - 1));
                                    refetch();
                                }}
                                disabled={page <= 1}
                                className="h-8 w-8 p-0"
                            >
                                ›
                            </Button>
                            <span className="text-sm text-gray-500">
                                {page} / {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setPage((p) => Math.min(totalPages, p + 1));
                                    refetch();
                                }}
                                disabled={page >= totalPages}
                                className="h-8 w-8 p-0"
                            >
                                ‹
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}