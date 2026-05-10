"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faAnglesLeft,
  faAnglesRight,
} from "@fortawesome/free-solid-svg-icons";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;

  // ✅ DEFAULT NOW IS 10
  itemsPerPage?: number;

  onPageChange: (page: number) => void;
  showInfo?: boolean;
  visiblePages?: number;
  className?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems = 0,
  itemsPerPage = 10, // 🔥 DEFAULT FIX HERE
  onPageChange,
  showInfo = true,
  visiblePages = 5,
  className = "",
}: PaginationProps) {
  if (totalPages <= 0) return null;

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

  // ✅ SAFE CALCULATION (no divide by 0 bugs)
  const startItem = totalItems
    ? (currentPage - 1) * itemsPerPage + 1
    : 0;

  const endItem = totalItems
    ? Math.min(currentPage * itemsPerPage, totalItems)
    : 0;

  return (
    <div
      className={`p-2 md:p-3 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-2 ${className}`}
    >
      {/* INFO */}
      {showInfo && (
        <div className="text-xs md:text-sm text-gray-500 order-2 sm:order-1">
          {totalItems
            ? `عرض ${startItem} - ${endItem} من ${totalItems}`
            : `صفحة ${currentPage} من ${totalPages}`}
        </div>
      )}

      {/* CONTROLS */}
      <div className="flex items-center gap-0.5 order-1 sm:order-2 flex-wrap justify-center">

        {/* FIRST */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-1.5 md:p-2 hover:bg-gray-100 rounded-md disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faAnglesRight} />
        </button>

        {/* PREV */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 md:p-2 hover:bg-gray-100 rounded-md disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>

        {/* PAGES */}
        <div className="flex gap-1">
          {getVisiblePages().map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`min-w-[32px] h-8 px-2 rounded-md text-xs transition ${currentPage === pageNum
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              {pageNum}
            </button>
          ))}
        </div>

        {/* NEXT */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 md:p-2 hover:bg-gray-100 rounded-md disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>

        {/* LAST */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-1.5 md:p-2 hover:bg-gray-100 rounded-md disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faAnglesLeft} />
        </button>
      </div>
    </div>
  );
}