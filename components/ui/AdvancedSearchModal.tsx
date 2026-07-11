// components/ui/AdvancedSearchModal.tsx

"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Filter, ArrowUpDown } from "lucide-react";
import { CorrespondenceMainType } from "@/types/api/correspondence.types";
import type { SortField, SortDirection } from "@/hooks/useAdvancedSearch";

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
  sortField: SortField;
  sortDirection: SortDirection;
  onSortChange: (field: SortField, direction?: SortDirection) => void;
  activeFiltersCount: number;
}

const sortOptions: { value: SortField; label: string }[] = [
  { value: "issuedDate", label: "تاريخ الإصدار" },
  { value: "createdAt", label: "تاريخ الإنشاء" },
  { value: "title", label: "العنوان" },
  { value: "number", label: "الرقم" },
  { value: "senderEntity", label: "الجهة المرسلة" },
  { value: "mainType", label: "النوع" },
];

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
  sortField,
  sortDirection,
  onSortChange,
  activeFiltersCount,
}: AdvancedSearchModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* ✅ استخدام hideCloseButton لإخفاء زر الإغلاق الافتراضي */}
      <DialogContent className="max-w-md rounded-2xl p-0 shadow-2xl" hideCloseButton>
        {/* ===== Header مع زر الإغلاق المخصص ===== */}
        <div className="flex items-center justify-between border-b border-border p-3">
          <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
            <Filter className="h-4 w-4 text-primary" />
            بحث متقدم
            {activeFiltersCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                {activeFiltersCount}
              </span>
            )}
          </DialogTitle>
          {/* ✅ زر الإغلاق المخصص */}
          <Button 
            variant="ghost" 
            size="icon-sm" 
            onClick={onClose} 
            className="h-7 w-7"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* ===== Content ===== */}
        <div className="p-4 space-y-3">
          {/* ترتيب النتائج */}
          <div>
            <label className="mb-1 flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <ArrowUpDown className="h-3 w-3" />
              ترتيب النتائج
            </label>
            <div className="flex items-center gap-2">
              <select
                value={sortField}
                onChange={(e) => onSortChange(e.target.value as SortField)}
                className="flex-1 rounded-md border border-border bg-background px-2 py-1.5 text-sm outline-none focus:border-primary"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSortChange(sortField, sortDirection === "asc" ? "desc" : "asc")}
                className="h-8 w-8 p-0"
              >
                {sortDirection === "asc" ? "↑" : "↓"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* نوع المراسلة */}
            <div>
              <label className="text-xs text-muted-foreground">النوع</label>
              <select
                value={mainType || ""}
                onChange={(e) => onMainTypeChange(e.target.value || undefined)}
                className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm outline-none focus:border-primary"
              >
                <option value="">الكل</option>
                <option value={String(CorrespondenceMainType.Incoming)}>وارد</option>
                <option value={String(CorrespondenceMainType.Outgoing)}>صادر</option>
                <option value={String(CorrespondenceMainType.Internal)}>داخلي</option>
              </select>
            </div>

            {/* مهني */}
            <div>
              <label className="text-xs text-muted-foreground">التصنيف</label>
              <select
                value={isProfessional === undefined ? "" : String(isProfessional)}
                onChange={(e) => onProfessionalChange(e.target.value ? e.target.value === "true" : undefined)}
                className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm outline-none focus:border-primary"
              >
                <option value="">الكل</option>
                <option value="true">مهني</option>
                <option value="false">عادي</option>
              </select>
            </div>

            {/* نوع الوثيقة */}
            <div>
              <label className="text-xs text-muted-foreground">نوع الوثيقة</label>
              <select
                value={documentTypeId || ""}
                onChange={(e) => onDocumentTypeChange(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm outline-none focus:border-primary"
              >
                <option value="">الكل</option>
                {documentTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            {/* الجهة المرسلة */}
            <div>
              <label className="text-xs text-muted-foreground">الجهة المرسلة</label>
              <select
                value={senderEntityId || ""}
                onChange={(e) => onSenderEntityChange(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm outline-none focus:border-primary"
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
        </div>

        {/* ===== Footer ===== */}
        <div className="flex items-center justify-between border-t border-border p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-red-500 hover:text-red-700 text-xs"
          >
            إعادة تعيين
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              إلغاء
            </Button>
            <Button size="sm" onClick={onApply} className="gap-1">
              <Filter className="h-3 w-3" />
              تطبيق
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}