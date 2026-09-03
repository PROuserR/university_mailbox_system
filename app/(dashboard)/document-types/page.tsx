/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(dashboard)/document-types/page.tsx

"use client";

import { useMemo, useState } from "react";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { Pagination } from "@/components/ui/Pagination";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { useDocumentTypes } from "@/hooks/useDocumentTypes";

import {
    faPlus,
    faEdit,
    faTrash,
    faPowerOff,
    faSearch,
    faFileLines,
    faXmark,
    faBan,
    faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import toast from "react-hot-toast";

export default function DocumentTypesPage() {
    // ===== Auth Guard =====
    const { isLoading: isAuthLoading, isAuthorized } = useAuthGuard({
        requiredPermissions: [PERMISSIONS.MANAGE_DOCUMENT_TYPES],
        redirectTo: '/auth/login',
        unauthorizedPath: '/unauthorized'
    });

    // ===== Hook =====
    const {
        documents,
        loading,
        createDocument,
        updateDocument,
        deleteDocument,
        toggleStatus,
    } = useDocumentTypes();

    // ===== Local State =====
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<any | null>(null);
    const [name, setName] = useState("");
    const [processing, setProcessing] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    // ===== Pagination State =====
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);

    // ===== Reset page when search/filter changes =====
    const handleSearchChange = (value: string) => {
        setSearch(value);
        setCurrentPage(1);
    };

    const handleFilterChange = (value: typeof filter) => {
        setFilter(value);
        setCurrentPage(1);
    };

    // ===== Search & Filter =====
    const filteredDocuments = useMemo(() => {
        if (!documents || !Array.isArray(documents)) {
            return [];
        }
        
        return documents.filter((item) => {
            if (!item) return false;
            
            const matchesSearch = item.name
                ?.toLowerCase()
                .includes(search.toLowerCase()) ?? false;

            const matchesFilter =
                filter === "all"
                    ? true
                    : filter === "active"
                        ? item.isActive === true
                        : item.isActive === false;

            return matchesSearch && matchesFilter;
        });
    }, [documents, search, filter]);

    // ===== Pagination =====
    const paginatedDocuments = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return filteredDocuments.slice(startIndex, endIndex);
    }, [filteredDocuments, currentPage, pageSize]);

    const totalPages = Math.ceil(filteredDocuments.length / pageSize);

    // ===== Stats =====
    const totalCount = documents?.length || 0;
    const activeCount = documents?.filter((x) => x?.isActive === true).length || 0;
    const inactiveCount = documents?.filter((x) => x?.isActive === false).length || 0;

    // ===== CRUD Handlers =====
    const handleSave = async () => {
        if (!name.trim()) {
            toast.error("يرجى إدخال اسم الوثيقة");
            return;
        }

        setProcessing(true);
        try {
            if (editing) {
                await updateDocument(editing.id, name);
            } else {
                await createDocument(name);
            }
            setModalOpen(false);
            setName("");
            setEditing(null);
        } catch (error: any) {
            // ❌ لا نغلق المودال عند الخطأ، ونعرض رسالة الخطأ
            // الـ Hook يعرض toast.error بالفعل، لكننا نضمن عدم حدوث أخطاء إضافية
        } finally {
            setProcessing(false);
        }
    };

    const handleDeleteClick = (id: number) => {
        setDeleteTargetId(id);
        setDeleteError(null);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!deleteTargetId) return;

        setProcessing(true);
        try {
            await deleteDocument(deleteTargetId);
            setDeleteModalOpen(false);
            setDeleteTargetId(null);
            setDeleteError(null);
        } catch (err: any) {
            // الـ Hook يعرض toast.error بالفعل
            setDeleteError(err?.message || "فشل الحذف");
        } finally {
            setProcessing(false);
        }
    };

    const handleCloseModal = () => {
        setDeleteModalOpen(false);
        setDeleteTargetId(null);
        setDeleteError(null);
    };

    const handleToggleStatus = async (item: any) => {
        if (!item) return;
        try {
            await toggleStatus(item.id, item.isActive);
        } catch (error: any) {
            // الـ Hook يعرض toast.error بالفعل
        }
    };

    // ===== Modal Handlers =====
    const openCreate = () => {
        setEditing(null);
        setName("");
        setModalOpen(true);
    };

    const openEdit = (item: any) => {
        if (!item) return;
        setEditing(item);
        setName(item.name);
        setModalOpen(true);
    };

    const formatDate = (date: string) => {
        if (!date) return "-";
        return new Date(date).toLocaleDateString();
    };

    // ============================================================
    // ===== Render =====
    // ============================================================

    if (isAuthLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    if (!isAuthorized) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="text-6xl">🔒</div>
                <h2 className="text-xl font-bold text-slate-700">غير مصرح بالوصول</h2>
                <p className="text-sm text-slate-500">ليس لديك الصلاحية لعرض هذه الصفحة</p>
            </div>
        );
    }

    return (
        <div dir="rtl" className="min-h-screen bg-slate-50 p-3 sm:p-4">
            {/* ===== HEADER ===== */}
            <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-3 sm:p-4 mb-3 sm:mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-base sm:text-lg flex-shrink-0">
                        <FontAwesomeIcon icon={faFileLines} />
                    </div>
                    <div>
                        <h1 className="text-base sm:text-lg font-bold text-slate-800">أنواع الوثائق</h1>
                        <p className="text-[11px] sm:text-xs text-slate-500">إدارة تصنيفات وثائق النظام</p>
                    </div>
                </div>

                <button
                    onClick={openCreate}
                    className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl font-semibold flex items-center gap-1.5 sm:gap-2 transition text-xs sm:text-sm w-full sm:w-auto justify-center"
                >
                    <FontAwesomeIcon icon={faPlus} className="text-xs sm:text-sm" />
                    إضافة نوع وثيقة
                </button>
            </div>

            {/* ===== STATS ===== */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-3 sm:mb-4 text-xs sm:text-sm bg-white rounded-2xl border border-blue-100 p-2.5 sm:p-3 shadow-sm">
                <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="text-slate-400 text-[10px] sm:text-xs">📊</span>
                    <span className="text-slate-600 text-[11px] sm:text-xs">الإحصائيات:</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
                    <span className="text-slate-500">الإجمالي:</span>
                    <span className="font-semibold text-slate-800">{totalCount}</span>
                </div>
                <div className="w-px h-3 sm:h-4 bg-slate-200" />
                <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
                    <span className="text-emerald-500 text-[8px] sm:text-[10px]">●</span>
                    <span className="text-slate-500">نشط:</span>
                    <span className="font-semibold text-emerald-600">{activeCount}</span>
                </div>
                <div className="w-px h-3 sm:h-4 bg-slate-200" />
                <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
                    <span className="text-red-500 text-[8px] sm:text-[10px]">●</span>
                    <span className="text-slate-500">غير نشط:</span>
                    <span className="font-semibold text-red-500">{inactiveCount}</span>
                </div>
            </div>

            {/* ===== FILTERS ===== */}
            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-3 sm:p-4 mb-3 sm:mb-4">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-between">
                    <div className="relative flex-1">
                        <FontAwesomeIcon
                            icon={faSearch}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[11px] sm:text-sm"
                        />
                        <input
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            placeholder="البحث عن نوع وثيقة..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 sm:py-2 pr-8 sm:pr-10 pl-3 text-xs sm:text-sm outline-none focus:border-blue-400"
                        />
                    </div>

                    <div className="flex gap-1.5 flex-wrap">
                        {[
                            { key: "all", label: "الكل" },
                            { key: "active", label: "نشط" },
                            { key: "inactive", label: "غير نشط" },
                        ].map((item) => (
                            <button
                                key={item.key}
                                onClick={() => handleFilterChange(item.key as typeof filter)}
                                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[10px] sm:text-xs font-medium transition ${
                                    filter === item.key
                                        ? "bg-blue-500 text-white"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ===== TABLE ===== */}
            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="h-32 sm:h-40 flex items-center justify-center text-slate-500 text-xs sm:text-sm">
                        جاري تحميل البيانات...
                    </div>
                ) : filteredDocuments.length === 0 ? (
                    <div className="h-32 sm:h-40 flex flex-col items-center justify-center text-slate-400 gap-1.5 sm:gap-2">
                        <FontAwesomeIcon icon={faFileLines} className="text-2xl sm:text-3xl" />
                        <p className="text-xs sm:text-sm">لا توجد أنواع وثائق</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-right text-xs sm:text-sm">
                                <thead>
                                    <tr className="bg-blue-50 text-slate-700">
                                        <th className="p-2 sm:p-3 font-semibold">الاسم</th>
                                        <th className="p-2 sm:p-3 font-semibold">الحالة</th>
                                        <th className="p-2 sm:p-3 font-semibold hidden md:table-cell">تاريخ الإنشاء</th>
                                        <th className="p-2 sm:p-3 font-semibold hidden lg:table-cell">آخر تحديث</th>
                                        <th className="p-2 sm:p-3 font-semibold">الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedDocuments.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="border-t border-slate-100 hover:bg-slate-50 transition"
                                        >
                                            <td
                                                className="p-2 sm:p-3 font-medium text-slate-800 text-xs sm:text-sm max-w-[120px] sm:max-w-[200px] truncate"
                                                title={item.name}
                                            >
                                                {item.name}
                                            </td>
                                            <td className="p-2 sm:p-3">
                                                {item.isActive ? (
                                                    <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs">
                                                        <FontAwesomeIcon icon={faCheckCircle} className="text-[8px] sm:text-[10px]" />
                                                        نشط
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs">
                                                        <FontAwesomeIcon icon={faBan} className="text-[8px] sm:text-[10px]" />
                                                        غير نشط
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-2 sm:p-3 text-slate-500 text-[10px] sm:text-xs hidden md:table-cell">
                                                {formatDate(item.createdAt)}
                                            </td>
                                            <td className="p-2 sm:p-3 text-slate-500 text-[10px] sm:text-xs hidden lg:table-cell">
                                                {item.updatedAt ? formatDate(item.updatedAt) : "-"}
                                            </td>
                                            <td className="p-2 sm:p-3">
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => openEdit(item)}
                                                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-100 text-blue-600 hover:bg-blue-200 transition flex items-center justify-center"
                                                    >
                                                        <FontAwesomeIcon icon={faEdit} className="text-[10px] sm:text-sm" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleStatus(item)}
                                                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition flex items-center justify-center"
                                                    >
                                                        <FontAwesomeIcon icon={faPowerOff} className="text-[10px] sm:text-sm" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(item.id)}
                                                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition flex items-center justify-center"
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} className="text-[10px] sm:text-sm" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* ===== ✅ PAGINATION ===== */}
                        {filteredDocuments.length > pageSize && (
                            <div className="border-t border-slate-100 p-3">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                    pageSize={pageSize}
                                    totalCount={filteredDocuments.length}
                                    showPageSize={true}
                                    onPageSizeChange={(size) => {
                                        setPageSize(size);
                                        setCurrentPage(1);
                                    }}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* ===== CONFIRMATION MODAL ===== */}
            <ConfirmationModal
                isOpen={deleteModalOpen}
                onClose={handleCloseModal}
                onConfirm={confirmDelete}
                title={deleteError ? "فشل الحذف" : "تأكيد الحذف"}
                message={
                    deleteError 
                        ? `⚠️ ${deleteError}`
                        : "هل أنت متأكد من حذف هذا العنصر؟ لا يمكن التراجع عن هذا الإجراء."
                }
                confirmText={deleteError ? "إعادة المحاولة" : "نعم، احذف"}
                cancelText="إلغاء"
                variant={deleteError ? "warning" : "danger"}
            />

            {/* ===== MODAL ===== */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-4 sm:p-6 shadow-xl">
                        <div className="flex justify-between items-center mb-3 sm:mb-4">
                            <h2 className="text-base sm:text-lg font-bold text-slate-800">
                                {editing ? "تعديل نوع الوثيقة" : "إضافة نوع وثيقة"}
                            </h2>
                            <button
                                onClick={() => setModalOpen(false)}
                                className="text-slate-400 hover:text-red-500"
                            >
                                <FontAwesomeIcon icon={faXmark} className="text-lg" />
                            </button>
                        </div>

                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="اسم الوثيقة"
                            className="w-full border border-slate-200 rounded-xl p-2.5 sm:p-3 mb-3 sm:mb-4 text-sm outline-none focus:border-blue-400"
                        />

                        <button
                            disabled={processing}
                            onClick={handleSave}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 sm:py-2.5 rounded-xl font-semibold transition disabled:opacity-50 text-sm"
                        >
                            {processing ? "جاري الحفظ..." : "حفظ"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}