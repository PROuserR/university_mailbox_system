// components/settings/EditButton.tsx
"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen } from "@fortawesome/free-solid-svg-icons";

interface EditButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function EditButton({ onClick, disabled = false }: EditButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <FontAwesomeIcon icon={faPen} className="text-[10px]" />
      تعديل
    </button>
  );
}