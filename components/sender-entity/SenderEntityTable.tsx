// components/sender-entity/SenderEntityTable.tsx
"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faCheckCircle,
  faBan,
  faPlus,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import type { SenderEntityResponse } from "@/types/senderEntity";
import SenderEntityForm from "./SenderEntityForm";

interface SenderEntityTableProps {
  entities: SenderEntityResponse[];
  loading: boolean;
  onEdit: (id: number, name: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onActivate: (id: number) => Promise<void>;
  onDeactivate: (id: number) => Promise<void>;
  onCreate: (name: string) => Promise<void>;
  isOperationsLoading: boolean;
}

export default function SenderEntityTable({
  entities,
  loading,
  onEdit,
  onDelete,
  onActivate,
  onDeactivate,
  onCreate,
  isOperationsLoading,
}: SenderEntityTableProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [selectedEntity, setSelectedEntity] = useState<SenderEntityResponse | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleEditSubmit = async () => {
    if (editingId && editingName.trim()) {
      await onEdit(editingId, editingName);
      setEditingId(null);
      setEditingName("");
    }
  };

  // Mobile Card Component
  const MobileCard = ({ entity, index }: { entity: SenderEntityResponse; index: number }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-3 overflow-hidden">
        {/* Card Header - Always visible */}
        <div 
          className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3 flex-1">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">
              {index + 1}
            </div>
            <div>
              <p className="font-medium text-gray-800  truncate max-w-[150px] line-clamp-2">{entity.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    entity.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {entity.isActive ? (
                    <>
                      <FontAwesomeIcon icon={faCheckCircle} className="h-2 w-2" />
                      مفعل
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faBan} className="h-2 w-2" />
                      غير مفعل
                    </>
                  )}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(entity.createdAt).toLocaleDateString("ar-EG")}
                </span>
              </div>
            </div>
          </div>
          <FontAwesomeIcon 
            icon={isExpanded ? faChevronLeft : faChevronRight} 
            className="text-gray-400 text-sm"
          />
        </div>

        {/* Card Body - Expanded */}
        {isExpanded && (
          <div className="p-4 border-t border-gray-100 bg-gray-50">
            {editingId === entity.id ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleEditSubmit}
                    disabled={isOperationsLoading}
                    className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                  >
                    حفظ
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="flex-1 px-3 py-2 bg-gray-300 rounded-lg text-sm hover:bg-gray-400"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setEditingId(entity.id);
                    setEditingName(entity.name);
                    setIsExpanded(false);
                  }}
                  disabled={isOperationsLoading}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm hover:bg-blue-100 transition"
                >
                  <FontAwesomeIcon icon={faEdit} className="h-3 w-3" />
                  تعديل
                </button>
                
                {entity.isActive ? (
                  <button
                    onClick={() => onDeactivate(entity.id)}
                    disabled={isOperationsLoading}
                    className="flex items-center gap-2 px-3 py-2 bg-orange-50 text-orange-600 rounded-lg text-sm hover:bg-orange-100 transition"
                  >
                    <FontAwesomeIcon icon={faBan} className="h-3 w-3" />
                    إلغاء تفعيل
                  </button>
                ) : (
                  <button
                    onClick={() => onActivate(entity.id)}
                    disabled={isOperationsLoading}
                    className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-600 rounded-lg text-sm hover:bg-green-100 transition"
                  >
                    <FontAwesomeIcon icon={faCheckCircle} className="h-3 w-3" />
                    تفعيل
                  </button>
                )}
                
                <button
                  onClick={() => {
                    if (confirm(`هل أنت متأكد من حذف "${entity.name}"؟`)) {
                      onDelete(entity.id);
                    }
                  }}
                  disabled={isOperationsLoading}
                  className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100 transition"
                >
                  <FontAwesomeIcon icon={faTrash} className="h-3 w-3" />
                  حذف
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header with Create Button - Responsive */}
      <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="text-right">
          <h2 className="md:text-lg font-semibold text-gray-800">
            قائمة الجهات المرسلة
          </h2>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            إجمالي {entities.length} جهة
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm md:text-base"
        >
          <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
          إضافة جهة جديدة
        </button>
      </div>

      {/* Desktop Table View - Hidden on mobile */}
      <div className="hidden md:block overflow-x-auto" dir="rtl">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-right">
              <th className="px-4 py-3 text-sm font-medium text-gray-600 w-16">#</th>
              <th className="px-4 py-3 text-sm font-medium text-gray-600">الاسم</th>
              <th className="px-4 py-3 text-sm font-medium text-gray-600 w-28">الحالة</th>
              <th className="px-4 py-3 text-sm font-medium text-gray-600 w-36">تاريخ الإنشاء</th>
              <th className="px-4 py-3 text-sm font-medium text-gray-600 w-36">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {entities.map((entity, index) => (
              <tr key={entity.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                <td className="px-4 py-3">
                  {editingId === entity.id ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="border border-gray-200 rounded-lg px-3 py-1 text-sm focus:outline-none focus:border-blue-500"
                        autoFocus
                      />
                      <button
                        onClick={handleEditSubmit}
                        disabled={isOperationsLoading}
                        className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                      >
                        حفظ
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1 bg-gray-300 rounded-lg text-sm hover:bg-gray-400"
                      >
                        إلغاء
                      </button>
                    </div>
                  ) : (
                    <span className="text-gray-800 truncate max-w-[100px] lg:max-w-[200px] line-clamp-2">{entity.name}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      entity.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {entity.isActive ? (
                      <>
                        <FontAwesomeIcon icon={faCheckCircle} className="h-3 w-3" />
                        مفعل
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faBan} className="h-3 w-3" />
                        غير مفعل
                      </>
                    )}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {new Date(entity.createdAt).toLocaleDateString("ar-EG")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingId(entity.id);
                        setEditingName(entity.name);
                      }}
                      disabled={isOperationsLoading}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="تعديل"
                    >
                      <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
                    </button>
                    {entity.isActive ? (
                      <button
                        onClick={() => onDeactivate(entity.id)}
                        disabled={isOperationsLoading}
                        className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition"
                        title="إلغاء تفعيل"
                      >
                        <FontAwesomeIcon icon={faBan} className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => onActivate(entity.id)}
                        disabled={isOperationsLoading}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition"
                        title="تفعيل"
                      >
                        <FontAwesomeIcon icon={faCheckCircle} className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (confirm(`هل أنت متأكد من حذف "${entity.name}"؟`)) {
                          onDelete(entity.id);
                        }
                      }}
                      disabled={isOperationsLoading}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="حذف"
                    >
                      <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                    </button>
                  </div>
                </td>
               </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View - Visible only on mobile */}
      <div className="block md:hidden p-4">
        {entities.length === 0 && !loading ? (
          <div className="text-center py-12 text-gray-500">
            لا توجد جهات مرسلة. أضف جهة جديدة بالضغط على الزر أعلاه.
          </div>
        ) : (
          entities.map((entity, index) => (
            <MobileCard key={entity.id} entity={entity} index={index} />
          ))
        )}
      </div>

      {/* Create Form Modal - Responsive */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 md:p-6 w-full max-w-md">
            <h3 className="text-lg md:text-xl font-semibold mb-4">إضافة جهة مرسلة جديدة</h3>
            <SenderEntityForm
              onSubmit={async (name) => {
                await onCreate(name);
                setShowCreateForm(false);
              }}
              onCancel={() => setShowCreateForm(false)}
              isLoading={isOperationsLoading}
            />
          </div>
        </div>
      )}

      {/* Empty State for Desktop */}
      {entities.length === 0 && !loading && (
        <div className="hidden md:flex text-center py-12 text-gray-500 flex-1 items-center justify-center">
          لا توجد جهات مرسلة. أضف جهة جديدة بالضغط على الزر أعلاه.
        </div>
      )}
    </div>
  );
}