// app/(dashboard)/document-types/page.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import { apiWrapper } from "@/utils/apiClient";

import {
    faPlus,
    faEdit,
    faTrash,
    faPowerOff,
    faSearch,
    faFileLines,
    faXmark,
    faCheck,
    faBan,
    faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import toast from "react-hot-toast";

interface DocumentType {
    id: number;
    name: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string | null;
}

interface ApiResponse<T> {
    isSuccess: boolean;
    data: T;
    message: string;
    errors: string[] | null;
    statusCode: number;
}

export default function DocumentTypesPage() {
    const [documents, setDocuments] = useState<DocumentType[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<DocumentType | null>(null);
    const [name, setName] = useState("");
    const [processing, setProcessing] = useState(false);

    async function loadDocuments() {
        try {
            setLoading(true);
            const response = await apiWrapper.get<ApiResponse<DocumentType[]>>(
                "/DocumentTypes"
            );

            if (response.success && response.data) {
                setDocuments(response.data.data);
            }
        } catch (error) {
            console.error("Failed to load document types:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadDocuments();
    }, []);

    const filteredDocuments = useMemo(() => {
        return documents.filter((item) => {
            const matchesSearch = item.name
                .toLowerCase()
                .includes(search.toLowerCase());

            const matchesFilter =
                filter === "all"
                    ? true
                    : filter === "active"
                        ? item.isActive
                        : !item.isActive;

            return matchesSearch && matchesFilter;
        });
    }, [documents, search, filter]);

    const totalCount = documents.length;
    const activeCount = documents.filter((x) => x.isActive).length;
    const inactiveCount = documents.filter((x) => !x.isActive).length;

    async function saveDocument() {
        if (!name.trim()) return;

        try {
            setProcessing(true);

            if (editing) {
                await apiWrapper.put(`/DocumentTypes/${editing.id}`, { name });
            } else {
                await apiWrapper.post("/DocumentTypes", { name });
            }

            setModalOpen(false);
            setName("");
            setEditing(null);
            await loadDocuments();
            toast.success(editing ? "تم التعديل بنجاح" : "تم الإضافة بنجاح");
        } catch (error) {
            console.error(error);
            toast.error("فشل الحفظ");
        } finally {
            setProcessing(false);
        }
    }

    async function deleteDocument(id: number) {
        if (!window.confirm("هل تريد حذف نوع الوثيقة؟")) return;

        try {
            await apiWrapper.delete(`/DocumentTypes/${id}`);
            toast.success("تم الحذف بنجاح");
            loadDocuments();
        } catch (error) {
            console.error(error);
            toast.error("فشل الحذف");
        }
    }

    async function toggleStatus(item: DocumentType) {
        try {
            const endpoint = item.isActive
                ? `/DocumentTypes/${item.id}/deactivate`
                : `/DocumentTypes/${item.id}/activate`;

            await apiWrapper.post(endpoint);
            toast.success(item.isActive ? "تم التعطيل" : "تم التفعيل");
            loadDocuments();
        } catch (error) {
            console.error(error);
            toast.error("فشل تغيير الحالة");
        }
    }

    function openCreate() {
        setEditing(null);
        setName("");
        setModalOpen(true);
    }

    function openEdit(item: DocumentType) {
        setEditing(item);
        setName(item.name);
        setModalOpen(true);
    }

    function formatDate(date: string) {
        return new Date(date).toLocaleDateString();
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
                            onChange={(e) => setSearch(e.target.value)}
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
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                onClick={() => setFilter(item.key as any)}
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
                                {filteredDocuments.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="border-t border-slate-100 hover:bg-slate-50 transition"
                                    >
                                       <td className="p-2 sm:p-3 font-medium text-slate-800 text-xs sm:text-sm max-w-[120px] sm:max-w-[200px] truncate" title={item.name}>
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
                                                    onClick={() => toggleStatus(item)}
                                                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition flex items-center justify-center"
                                                >
                                                    <FontAwesomeIcon icon={faPowerOff} className="text-[10px] sm:text-sm" />
                                                </button>
                                                <button
                                                    onClick={() => deleteDocument(item.id)}
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
                )}
            </div>

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
                            onClick={saveDocument}
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