// components/ui/Pagination.tsx
"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faAnglesLeft,
  faAnglesRight,
} from "@fortawesome/free-solid-svg-icons";

interface PaginationProps {
  /** رقم الصفحة الحالية */
  currentPage: number;
  /** إجمالي عدد الصفحات */
  totalPages: number;
  /** إجمالي عدد العناصر (للإحصائيات) */
  totalItems?: number;
  /** عدد العناصر في كل صفحة (للإحصائيات) */
  itemsPerPage?: number;
  /** دالة تتغير عند تغيير الصفحة */
  onPageChange: (page: number) => void;
  /** عرض معلومات إضافية (مثال: صفحة X من Y) */
  showInfo?: boolean;
  /** عدد الأرقام التي تظهر (افتراضي 5) */
  visiblePages?: number;
  /** كلاس إضافي */
  className?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  showInfo = true,
  visiblePages = 5,
  className = "",
}: PaginationProps) {
  if (totalPages <= 0) return null;

  // حساب الأرقام التي ستظهر
  const getVisiblePages = (): number[] => {
    let pages: number[] = [];

    if (totalPages <= visiblePages) {
      pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else if (currentPage <= 3) {
      pages = Array.from({ length: visiblePages }, (_, i) => i + 1);
    } else if (currentPage >= totalPages - 2) {
      pages = Array.from(
        { length: visiblePages },
        (_, i) => totalPages - visiblePages + i + 1
      );
    } else {
      const offset = Math.floor(visiblePages / 2);
      pages = Array.from(
        { length: visiblePages },
        (_, i) => currentPage - offset + i
      );
    }

    return pages;
  };

  const startItem = (currentPage - 1) * (itemsPerPage || 0) + 1;
  const endItem = Math.min(currentPage * (itemsPerPage || 0), totalItems || 0);

  return (
    <div
      className={`p-2 md:p-3 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-2 ${className}`}
    >
      {/* معلومات الصفحات */}
      {showInfo && (
        <div className="text-xs md:text-sm text-gray-500 order-2 sm:order-1">
          {totalItems && itemsPerPage
            ? `عرض ${startItem} - ${endItem} من ${totalItems}`
            : `صفحة ${currentPage} من ${totalPages}`}
        </div>
      )}

      {/* أزرار التنقل */}
      <div className="flex items-center gap-0.5 order-1 sm:order-2 flex-wrap justify-center">
        {/* الصفحة الأولى */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-1.5 md:p-2 text-gray-600 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition"
          aria-label="الصفحة الأولى"
        >
          <FontAwesomeIcon
            icon={faAnglesRight}
            className="h-3 w-3 md:h-4 md:w-4"
          />
        </button>

        {/* الصفحة السابقة */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 md:p-2 text-gray-600 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition"
          aria-label="الصفحة السابقة"
        >
          <FontAwesomeIcon
            icon={faChevronRight}
            className="h-3 w-3 md:h-4 md:w-4"
          />
        </button>

        {/* أرقام الصفحات */}
        <div className="flex gap-0.5 md:gap-1">
          {getVisiblePages().map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`min-w-[28px] md:min-w-[36px] h-7 md:h-9 px-1.5 md:px-2 rounded-md md:rounded-lg text-xs md:text-sm transition ${
                currentPage === pageNum
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {pageNum}
            </button>
          ))}
        </div>

        {/* الصفحة التالية */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 md:p-2 text-gray-600 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition"
          aria-label="الصفحة التالية"
        >
          <FontAwesomeIcon
            icon={faChevronLeft}
            className="h-3 w-3 md:h-4 md:w-4"
          />
        </button>

        {/* الصفحة الأخيرة */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-1.5 md:p-2 text-gray-600 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition"
          aria-label="الصفحة الأخيرة"
        >
          <FontAwesomeIcon
            icon={faAnglesLeft}
            className="h-3 w-3 md:h-4 md:w-4"
          />
        </button>
      </div>
    </div>
  );
}
