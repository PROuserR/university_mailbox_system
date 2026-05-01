// src/components/sender-entity/SenderEntityDropdown.tsx

"use client";

import { useActiveSenderEntities } from "@/hooks/useSenderEntity";
import type { SenderEntityResponse } from "@/types/senderEntity";

interface SenderEntityDropdownProps {
  /** Currently selected entity ID */
  value?: number;
  /** Callback when selection changes */
  onChange: (entityId: number, entity: SenderEntityResponse) => void;
  /** Optional placeholder text */
  placeholder?: string;
  /** Whether the dropdown is disabled */
  disabled?: boolean;
  /** Additional className */
  className?: string;
}

export default function SenderEntityDropdown({
  value,
  onChange,
  placeholder = "اختر الجهة المرسلة",
  disabled = false,
  className = "",
}: SenderEntityDropdownProps) {
  const { entities, loading } = useActiveSenderEntities();

  if (loading) {
    return (
      <select disabled className={`w-full border rounded-xl p-3 bg-gray-50 ${className}`}>
        <option>جاري التحميل...</option>
      </select>
    );
  }

  return (
    <select
      value={value || ""}
      onChange={(e) => {
        const selectedId = parseInt(e.target.value);
        const selectedEntity = entities.find((e) => e.id === selectedId);
        if (selectedEntity) {
          onChange(selectedId, selectedEntity);
        }
      }}
      disabled={disabled}
      className={`w-full border border-gray-200 rounded-xl p-3 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all duration-300 text-right ${className}`}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {entities.map((entity) => (
        <option key={entity.id} value={entity.id}>
          {entity.name}
        </option>
      ))}
    </select>
  );
}