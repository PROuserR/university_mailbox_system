// components/layout/MobileMenuButton.tsx
"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";

interface MobileMenuButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export default function MobileMenuButton({ isOpen, onClick }: MobileMenuButtonProps) {
  return (
    <button
      onClick={onClick}
      className="md:hidden fixed top-4 right-4 z-50 p-2 bg-blue-600 text-white rounded-lg shadow-lg"
      aria-label={isOpen ? "إغلاق القائمة" : "فتح القائمة"}
    >
      <FontAwesomeIcon icon={isOpen ? faTimes : faBars} className="h-5 w-5" />
    </button>
  );
}