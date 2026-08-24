// components/settings/SettingsModal.tsx
"use client";

import { ReactNode, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  title: string;
  children: ReactNode;
  isSaving?: boolean;
  saveLabel?: string;
}

export function SettingsModal({
  isOpen,
  onClose,
  onSave,
  title,
  children,
  isSaving = false,
  saveLabel = "حفظ التغييرات",
}: SettingsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence >
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-hidden">
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header - ثابت */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100 shrink-0">
            <h2 className="text-lg font-bold text-slate-800">{title}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-gray-100 transition flex items-center justify-center text-gray-400 hover:text-gray-600"
            >
              <FontAwesomeIcon icon={faXmark} className="text-lg" />
            </button>
          </div>

          {/* ✅ Content - مع Scroll داخلي فقط */}
          <div 
            className="flex-1 overflow-y-auto p-4 hide-scrollbar"
            // ✅ نمنع التمرير من التسرب إلى الخارج
            onWheel={(e) => e.stopPropagation()}
          >
            {children}
          </div>

          {/* Footer - ثابت */}
          <div className="flex gap-2 p-4 border-t border-gray-100 shrink-0">
            <button
              onClick={onClose}
              className="flex-1 border border-gray-200 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
            >
              إلغاء
            </button>
            <button
              onClick={onSave}
              disabled={isSaving}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
            >
              {isSaving ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  جاري الحفظ...
                </>
              ) : (
                saveLabel
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}