// components/sender-entity/SenderEntityTable.tsx
"use client";
import Pagination from "@/components/ui/Pagination";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faCheckCircle,
  faBan,
  faPlus,
  faChevronLeft,
  faChevronRight
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
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
  const totalPages = Math.ceil(entities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEntities = entities.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };


 // ✅ Mobile Card Component مع Pagination
  const MobileCard = ({ entity, index }: { entity: SenderEntityResponse; index: number }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const isEditMode = editingId === entity.id;

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-2 overflow-hidden">
        <div 
          className="p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50"
          onClick={() => {
            if (isEditMode) return;
            setIsExpanded(!isExpanded);
          }}
        >
          <div className="flex items-center gap-2 flex-1">
            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
              {startIndex + index + 1}
            </div>
            <div>
              <p className="font-medium text-gray-800 truncate max-w-[120px] line-clamp-2 text-sm">
                {entity.name}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                  entity.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                }`}>
                  {entity.isActive ? (
                    <><FontAwesomeIcon icon={faCheckCircle} className="h-2 w-2" /> مفعل</>
                  ) : (
                    <><FontAwesomeIcon icon={faBan} className="h-2 w-2" /> غير مفعل</>
                  )}
                </span>
                <span className="text-[10px] text-gray-400">
                  {new Date(entity.createdAt).toLocaleDateString("ar-EG")}
                </span>
              </div>
            </div>
          </div>
          <FontAwesomeIcon 
            icon={isExpanded || isEditMode ? faChevronLeft : faChevronRight} 
            className="text-gray-400 text-xs"
          />
        </div>

        {(isExpanded || isEditMode) && (
          <div className="p-3 border-t border-gray-100 bg-gray-50">
            {isEditMode ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500"
                  autoFocus
                />
                <div className="flex gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditSubmit();
                    }}
                    disabled={isOperationsLoading}
                    className="flex-1 px-2 py-1.5 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700"
                  >
                    حفظ
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingId(null);
                      setEditingName("");
                    }}
                    className="flex-1 px-2 py-1.5 bg-gray-300 rounded-lg text-xs hover:bg-gray-400"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingId(entity.id);
                    setEditingName(entity.name);
                  }}
                  disabled={isOperationsLoading}
                  className="flex items-center gap-1.5 px-2 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs hover:bg-blue-100 transition"
                >
                  <FontAwesomeIcon icon={faEdit} className="h-2.5 w-2.5" />
                  تعديل
                </button>
                
                {entity.isActive ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeactivate(entity.id);
                    }}
                    disabled={isOperationsLoading}
                    className="flex items-center gap-1.5 px-2 py-1.5 bg-orange-50 text-orange-600 rounded-lg text-xs hover:bg-orange-100 transition"
                  >
                    <FontAwesomeIcon icon={faBan} className="h-2.5 w-2.5" />
                    إلغاء تفعيل
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onActivate(entity.id);
                    }}
                    disabled={isOperationsLoading}
                    className="flex items-center gap-1.5 px-2 py-1.5 bg-green-50 text-green-600 rounded-lg text-xs hover:bg-green-100 transition"
                  >
                    <FontAwesomeIcon icon={faCheckCircle} className="h-2.5 w-2.5" />
                    تفعيل
                  </button>
                )}
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`هل أنت متأكد من حذف "${entity.name}"؟`)) {
                      onDelete(entity.id);
                    }
                  }}
                  disabled={isOperationsLoading}
                  className="flex items-center gap-1.5 px-2 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs hover:bg-red-100 transition"
                >
                  <FontAwesomeIcon icon={faTrash} className="h-2.5 w-2.5" />
                  حذف
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // ✅ Component Pagination Controls
  const PaginationControls = () => (
    entities.length > 0 && (
  <Pagination
    currentPage={currentPage}
    totalPages={totalPages}
    totalItems={entities.length}
    itemsPerPage={itemsPerPage}
    onPageChange={goToPage}
    showInfo={true}
    visiblePages={5}
  />
)
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header - مصغر */}
      <div className="p-3 md:p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="text-right">
          <h2 className="text-sm md:text-base font-semibold text-gray-800">
            قائمة الجهات المرسلة
          </h2>
          <p className="text-[11px] md:text-xs text-gray-500 mt-0.5">
            إجمالي {entities.length} جهة
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-xs md:text-sm"
        >
          <FontAwesomeIcon icon={faPlus} className="h-3 w-3 md:h-3.5 md:w-3.5" />
          إضافة جهة جديدة
        </button>
      </div>

      {/* Desktop Table View - مصغر */}
      <div className="hidden md:block overflow-x-auto" dir="rtl">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-right">
              <th className="px-3 py-2 text-xs font-medium text-gray-600 w-12">#</th>
              <th className="px-3 py-2 text-xs font-medium text-gray-600">الاسم</th>
              <th className="px-3 py-2 text-xs font-medium text-gray-600 w-20">الحالة</th>
              <th className="px-3 py-2 text-xs font-medium text-gray-600 w-28">تاريخ الإنشاء</th>
              <th className="px-3 py-2 text-xs font-medium text-gray-600 w-28">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentEntities.map((entity, index) => (
              <tr key={entity.id} className="hover:bg-gray-50 transition">
                <td className="px-3 py-2 text-xs text-gray-500">{startIndex + index + 1}</td>
                <td className="px-3 py-2">
                  {editingId === entity.id ? (
                    <div className="flex gap-1">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500"
                        autoFocus
                      />
                      <button
                        onClick={handleEditSubmit}
                        disabled={isOperationsLoading}
                        className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                      >
                        حفظ
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-2 py-1 bg-gray-300 rounded text-xs hover:bg-gray-400"
                      >
                        إلغاء
                      </button>
                    </div>
                  ) : (
                    <span className="text-gray-800 truncate max-w-[80px] lg:max-w-[150px] line-clamp-2 text-sm">
                      {entity.name}
                    </span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                    entity.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}>
                    {entity.isActive ? (
                      <><FontAwesomeIcon icon={faCheckCircle} className="h-2.5 w-2.5" /> مفعل</>
                    ) : (
                      <><FontAwesomeIcon icon={faBan} className="h-2.5 w-2.5" /> غير مفعل</>
                    )}
                  </span>
                </td>
                <td className="px-3 py-2 text-xs text-gray-500">
                  {new Date(entity.createdAt).toLocaleDateString("ar-EG")}
                </td>
                <td className="px-3 py-2">
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setEditingId(entity.id);
                        setEditingName(entity.name);
                      }}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded transition"
                    >
                      <FontAwesomeIcon icon={faEdit} className="h-[12px] w-[12px]" />
                    </button>
                    {entity.isActive ? (
                      <button
                        onClick={() => onDeactivate(entity.id)}
                        className="p-1 text-orange-600 hover:bg-orange-50 rounded transition"
                      >
                        <FontAwesomeIcon icon={faBan} className="h-[12px] w-[12px]" />
                      </button>
                    ) : (
                      <button
                        onClick={() => onActivate(entity.id)}
                        className="p-1 text-green-600 hover:bg-green-50 rounded transition"
                      >
                        <FontAwesomeIcon icon={faCheckCircle} className="h-[12px] w-[12px]" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (confirm(`هل أنت متأكد من حذف "${entity.name}"؟`)) {
                          onDelete(entity.id);
                        }
                      }}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                    >
                      <FontAwesomeIcon icon={faTrash} className="h-3 w-3" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View - مصغر */}
      <div className="block md:hidden p-2">
        {entities.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            لا توجد جهات مرسلة. أضف جهة جديدة بالضغط على الزر أعلاه.
          </div>
        ) : (
          currentEntities.map((entity, index) => (
            <MobileCard key={entity.id} entity={entity} index={index} />
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {entities.length > 0 && <PaginationControls />}

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 md:p-5 w-full max-w-md">
            <h3 className="text-base md:text-lg font-semibold mb-3 text-right">
              إضافة جهة مرسلة جديدة
            </h3>
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
    </div>
  );
}