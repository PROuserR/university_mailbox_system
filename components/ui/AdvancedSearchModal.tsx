// src/components/ui/AdvancedSearchModal.tsx

"use client";

import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Filter, ArrowUpDown, AlertCircle, Calendar } from "lucide-react";
import { CorrespondenceMainType, CorrespondenceStatus } from "@/types/api/correspondence.types";
import type { SortField, SortDirection, AdvancedSearchParams } from "@/hooks/useAdvancedSearch";
import { cn } from "@/lib/utils";

// ============================================================
// ===== Types =====
// ============================================================

interface DateValidationErrors {
    createdAt?: string;
    issuedDate?: string;
    receivedDate?: string;
    sentDate?: string;
}

interface AdvancedSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: () => void;
    onReset: () => void;
    mainType: string | undefined;
    onMainTypeChange: (value: string | undefined) => void;
    isProfessional: boolean | undefined;
    onProfessionalChange: (value: boolean | undefined) => void;
    documentTypeId: number | undefined;
    onDocumentTypeChange: (value: number | undefined) => void;
    documentTypes: { id: number; name: string }[];
    senderEntityId: number | undefined;
    onSenderEntityChange: (value: number | undefined) => void;
    senderEntities: { id: number; name: string }[];
    status?: CorrespondenceStatus;
    onStatusChange?: (value: CorrespondenceStatus | undefined) => void;
    sortField: SortField;
    sortDirection: SortDirection;
    onSortChange: (field: SortField, direction?: SortDirection) => void;
    activeFiltersCount: number;
    number?: number;
    onNumberChange?: (value?: number) => void;
    // ✅ نستخدم tempParams و setTempParams مباشرة
    tempParams: AdvancedSearchParams;
    setTempParams: (params: AdvancedSearchParams) => void;
}

// ============================================================
// ===== Constants =====
// ============================================================

const sortOptions: { value: SortField; label: string }[] = [
    { value: "issuedDate", label: "تاريخ الإصدار" },
    { value: "createdAt", label: "تاريخ الإنشاء" },
    { value: "receivedDate", label: "تاريخ الاستلام" },
    { value: "sentDate", label: "تاريخ الإرسال" },
    { value: "title", label: "العنوان" },
    { value: "number", label: "الرقم" },
    { value: "senderEntity", label: "الجهة المرسلة" },
    { value: "mainType", label: "النوع" },
];

const mainTypeOptions: { value: CorrespondenceMainType | ""; label: string }[] = [
    { value: "", label: "الكل" },
    { value: CorrespondenceMainType.Incoming, label: "وارد" },
    { value: CorrespondenceMainType.Outgoing, label: "صادر" },
    { value: CorrespondenceMainType.Internal, label: "داخلي" },
];

const statusOptions: { value: CorrespondenceStatus | ""; label: string }[] = [
    { value: "", label: "الكل" },
    { value: CorrespondenceStatus.Draft, label: "مسودة" },
    { value: CorrespondenceStatus.PendingApproval, label: "بانتظار الموافقة" },
    { value: CorrespondenceStatus.Distributed, label: "موزعة" },
    { value: CorrespondenceStatus.Signed, label: "موقعة" },
    { value: CorrespondenceStatus.Archived, label: "مؤرشفة" },
];

// ============================================================
// ===== Date Input Component =====
// ============================================================

const DateInputGroup = ({
    label,
    fromValue,
    toValue,
    onFromChange,
    onToChange,
    error,
}: {
    label: string;
    fromValue: Date | undefined;
    toValue: Date | undefined;
    onFromChange: (val: Date | undefined) => void;
    onToChange: (val: Date | undefined) => void;
    error?: string;
}) => {
    const fromDateString = fromValue ? fromValue.toISOString().split('T')[0] : "";
    const toDateString = toValue ? toValue.toISOString().split('T')[0] : "";
    const hasError = !!error;

    return (
        <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">{label}</label>
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="text-[10px] text-muted-foreground block mb-0.5">من</label>
                    <input
                        type="date"
                        value={fromDateString}
                        onChange={(e) => {
                            const val = e.target.value;
                            onFromChange(val ? new Date(val) : undefined);
                        }}
                        className={cn(
                            "w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-all bg-background",
                            hasError
                                ? "border-red-400 focus:ring-red-200 bg-red-50"
                                : "border-border focus:border-primary focus:ring-primary/20"
                        )}
                    />
                </div>
                <div>
                    <label className="text-[10px] text-muted-foreground block mb-0.5">إلى</label>
                    <input
                        type="date"
                        value={toDateString}
                        onChange={(e) => {
                            const val = e.target.value;
                            onToChange(val ? new Date(val) : undefined);
                        }}
                        className={cn(
                            "w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-all bg-background",
                            hasError
                                ? "border-red-400 focus:ring-red-200 bg-red-50"
                                : "border-border focus:border-primary focus:ring-primary/20"
                        )}
                    />
                </div>
            </div>
            {hasError && error && (
                <div className="flex items-center gap-1 text-xs text-red-500 mt-0.5">
                    <AlertCircle className="h-3 w-3" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
};

// ============================================================
// ===== Main Component =====
// ============================================================

export function AdvancedSearchModal({
    isOpen,
    onClose,
    onApply,
    onReset,
    mainType,
    onMainTypeChange,
    isProfessional,
    onProfessionalChange,
    documentTypeId,
    onDocumentTypeChange,
    documentTypes,
    senderEntityId,
    onSenderEntityChange,
    senderEntities,
    status,
    onStatusChange,
    sortField,
    sortDirection,
    onSortChange,
    activeFiltersCount,
    number,
    onNumberChange,
    tempParams,
    setTempParams,
}: AdvancedSearchModalProps) {
    // ===== Validation State =====
    const [dateErrors, setDateErrors] = useState<DateValidationErrors>({});

    const validateDateRange = useCallback((
        from: Date | undefined,
        to: Date | undefined,
        field: keyof DateValidationErrors
    ): string | undefined => {
        if (from && to && to < from) {
            const fieldNames: Record<keyof DateValidationErrors, string> = {
                createdAt: "تاريخ الإنشاء",
                issuedDate: "تاريخ الإصدار",
                receivedDate: "تاريخ الاستلام",
                sentDate: "تاريخ الإرسال",
            };
            return `${fieldNames[field]} (إلى) لا يمكن أن يكون أقدم من ${fieldNames[field]} (من)`;
        }
        return undefined;
    }, []);

    const validateAllDates = useCallback(() => {
        const errors: DateValidationErrors = {};

        const createdAtError = validateDateRange(tempParams.createdAtFrom, tempParams.createdAtTo, 'createdAt');
        if (createdAtError) errors.createdAt = createdAtError;

        const issuedDateError = validateDateRange(tempParams.issuedDateFrom, tempParams.issuedDateTo, 'issuedDate');
        if (issuedDateError) errors.issuedDate = issuedDateError;

        const receivedDateError = validateDateRange(tempParams.receivedDateFrom, tempParams.receivedDateTo, 'receivedDate');
        if (receivedDateError) errors.receivedDate = receivedDateError;

        const sentDateError = validateDateRange(tempParams.sentDateFrom, tempParams.sentDateTo, 'sentDate');
        if (sentDateError) errors.sentDate = sentDateError;

        setDateErrors(errors);
        return Object.keys(errors).length === 0;
    }, [tempParams, validateDateRange]);

    const handleApply = () => {
        const isValid = validateAllDates();
        if (!isValid) {
            return;
        }
        onApply();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl rounded-2xl p-0 shadow-2xl max-h-[90vh] flex flex-col" hideCloseButton>
                {/* ===== Header ===== */}
                <div className="flex items-center justify-between border-b border-border p-4">
                    <DialogTitle className="flex items-center gap-2 text-base font-semibold">
                        <Filter className="h-4 w-4 text-primary" />
                        بحث متقدم
                        {activeFiltersCount > 0 && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                                {activeFiltersCount}
                            </span>
                        )}
                    </DialogTitle>
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={onClose}
                        className="h-8 w-8"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* ===== Body ===== */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Sort */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                                <ArrowUpDown className="h-3 w-3" />
                                ترتيب حسب
                            </label>
                            <select
                                value={sortField}
                                onChange={(e) => onSortChange(e.target.value as SortField)}
                                className="w-full mt-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            >
                                {sortOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-muted-foreground">اتجاه الترتيب</label>
                            <div className="flex gap-2 mt-1">
                                <button
                                    onClick={() => onSortChange(sortField, "desc")}
                                    className={cn(
                                        "flex-1 rounded-lg border px-3 py-2 text-sm transition-all",
                                        sortDirection === "desc"
                                            ? "border-primary bg-primary/10 text-primary font-medium"
                                            : "border-border hover:bg-muted"
                                    )}
                                >
                                    تنازلي
                                </button>
                                <button
                                    onClick={() => onSortChange(sortField, "asc")}
                                    className={cn(
                                        "flex-1 rounded-lg border px-3 py-2 text-sm transition-all",
                                        sortDirection === "asc"
                                            ? "border-primary bg-primary/10 text-primary font-medium"
                                            : "border-border hover:bg-muted"
                                    )}
                                >
                                    تصاعدي
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* رقم المراسلة */}
                    {onNumberChange && (
                        <div>
                            <label className="text-xs font-medium text-muted-foreground">رقم المراسلة</label>
                            <input
                                type="number"
                                value={number || ""}
                                onChange={(e) => onNumberChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                placeholder="أدخل رقم المراسلة..."
                                className="w-full mt-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-medium text-muted-foreground">نوع المراسلة</label>
                            <select
                                value={mainType || ""}
                                onChange={(e) => onMainTypeChange(e.target.value || undefined)}
                                className="w-full mt-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            >
                                {mainTypeOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-medium text-muted-foreground">التصنيف</label>
                            <select
                                value={isProfessional === undefined ? "" : String(isProfessional)}
                                onChange={(e) => onProfessionalChange(e.target.value ? e.target.value === "true" : undefined)}
                                className="w-full mt-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            >
                                <option value="">الكل</option>
                                <option value="true">مهني</option>
                                <option value="false">عادي</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-medium text-muted-foreground">نوع المستند</label>
                            <select
                                value={documentTypeId || ""}
                                onChange={(e) => onDocumentTypeChange(e.target.value ? Number(e.target.value) : undefined)}
                                className="w-full mt-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            >
                                <option value="">الكل</option>
                                {documentTypes.map((type) => (
                                    <option key={type.id} value={type.id}>
                                        {type.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-medium text-muted-foreground">الجهة المرسلة</label>
                            <select
                                value={senderEntityId || ""}
                                onChange={(e) => onSenderEntityChange(e.target.value ? Number(e.target.value) : undefined)}
                                className="w-full mt-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            >
                                <option value="">الكل</option>
                                {senderEntities.map((entity) => (
                                    <option key={entity.id} value={entity.id}>
                                        {entity.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* الحالة */}
                    {onStatusChange && (
                        <div>
                            <label className="text-xs font-medium text-muted-foreground">الحالة</label>
                            <select
                                value={status !== undefined ? String(status) : ""}
                                onChange={(e) => onStatusChange(e.target.value ? Number(e.target.value) as CorrespondenceStatus : undefined)}
                                className="w-full mt-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            >
                                {statusOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* التواريخ */}
                    <div className="space-y-3 border-t border-border pt-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                            <Calendar className="h-4 w-4" />
                            التواريخ
                            <span className="text-xs text-muted-foreground font-normal">(من → إلى)</span>
                        </div>

                        {/* ✅ تاريخ الإنشاء */}
                        <DateInputGroup
                            label="تاريخ الإنشاء"
                            fromValue={tempParams.createdAtFrom}
                            toValue={tempParams.createdAtTo}
                            onFromChange={(val) => {
                                setTempParams({ ...tempParams, createdAtFrom: val });
                                const error = validateDateRange(val, tempParams.createdAtTo, 'createdAt');
                                setDateErrors(prev => ({ ...prev, createdAt: error }));
                            }}
                            onToChange={(val) => {
                                setTempParams({ ...tempParams, createdAtTo: val });
                                const error = validateDateRange(tempParams.createdAtFrom, val, 'createdAt');
                                setDateErrors(prev => ({ ...prev, createdAt: error }));
                            }}
                            error={dateErrors.createdAt}
                        />

                        {/* ✅ تاريخ الإصدار */}
                        <DateInputGroup
                            label="تاريخ الإصدار"
                            fromValue={tempParams.issuedDateFrom}
                            toValue={tempParams.issuedDateTo}
                            onFromChange={(val) => {
                                setTempParams({ ...tempParams, issuedDateFrom: val });
                                const error = validateDateRange(val, tempParams.issuedDateTo, 'issuedDate');
                                setDateErrors(prev => ({ ...prev, issuedDate: error }));
                            }}
                            onToChange={(val) => {
                                setTempParams({ ...tempParams, issuedDateTo: val });
                                const error = validateDateRange(tempParams.issuedDateFrom, val, 'issuedDate');
                                setDateErrors(prev => ({ ...prev, issuedDate: error }));
                            }}
                            error={dateErrors.issuedDate}
                        />

                        {/* ✅ تاريخ الاستلام */}
                        <DateInputGroup
                            label="تاريخ الاستلام"
                            fromValue={tempParams.receivedDateFrom}
                            toValue={tempParams.receivedDateTo}
                            onFromChange={(val) => {
                                setTempParams({ ...tempParams, receivedDateFrom: val });
                                const error = validateDateRange(val, tempParams.receivedDateTo, 'receivedDate');
                                setDateErrors(prev => ({ ...prev, receivedDate: error }));
                            }}
                            onToChange={(val) => {
                                setTempParams({ ...tempParams, receivedDateTo: val });
                                const error = validateDateRange(tempParams.receivedDateFrom, val, 'receivedDate');
                                setDateErrors(prev => ({ ...prev, receivedDate: error }));
                            }}
                            error={dateErrors.receivedDate}
                        />

                        {/* ✅ تاريخ الإرسال */}
                        <DateInputGroup
                            label="تاريخ الإرسال"
                            fromValue={tempParams.sentDateFrom}
                            toValue={tempParams.sentDateTo}
                            onFromChange={(val) => {
                                setTempParams({ ...tempParams, sentDateFrom: val });
                                const error = validateDateRange(val, tempParams.sentDateTo, 'sentDate');
                                setDateErrors(prev => ({ ...prev, sentDate: error }));
                            }}
                            onToChange={(val) => {
                                setTempParams({ ...tempParams, sentDateTo: val });
                                const error = validateDateRange(tempParams.sentDateFrom, val, 'sentDate');
                                setDateErrors(prev => ({ ...prev, sentDate: error }));
                            }}
                            error={dateErrors.sentDate}
                        />
                    </div>
                </div>

                {/* ===== Footer ===== */}
                <div className="flex items-center justify-between border-t border-border p-4 bg-muted/30 rounded-b-2xl">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onReset}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 text-sm"
                    >
                        إعادة تعيين
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={onClose}>
                            إلغاء
                        </Button>
                        <Button size="sm" onClick={handleApply} className="gap-1">
                            <Filter className="h-3 w-3" />
                            تطبيق
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}