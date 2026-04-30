// src/components/sender-entity/SenderEntityForm.tsx

"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faSave } from "@fortawesome/free-solid-svg-icons";

interface SenderEntityFormProps {
  initialName?: string;
  onSubmit: (name: string) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  title?: string;
}

export default function SenderEntityForm({
  initialName = "",
  onSubmit,
  onCancel,
  isLoading = false,
  title = "جهة مرسلة جديدة",
}: SenderEntityFormProps) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError("الاسم مطلوب");
      return;
    }

    if (name.trim().length < 2) {
      setError("الاسم يجب أن يكون حرفين على الأقل");
      return;
    }

    setError("");
    await onSubmit(name.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
          اسم الجهة <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="مثال: رئاسة الجامعة"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-right focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
          autoFocus
        />
        {error && <p className="text-red-500 text-sm mt-1 text-right">{error}</p>}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faSave} className="h-4 w-4" />
          {isLoading ? "جاري الحفظ..." : "حفظ"}
        </button>
        
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2.5 rounded-xl hover:bg-gray-200 transition"
        >
          <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
          إلغاء
        </button>
      </div>
    </form>
  );
}