/* eslint-disable react-hooks/set-state-in-effect */
// app/(dashboard)/distribution-page/page.tsx

"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowRight,
    faPaperPlane,
    faSpinner,
    faUserGroup,
    faEnvelope,
    faUserCheck,
    faLock,
    faUserPlus,
    faUserMinus,
    faXmark,
    faChevronDown,
    faHashtag,
    faUsers,
    faEye,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";

import { apiWrapper } from "@/utils/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
export const dynamic = 'force-dynamic';
// =========================
// TYPES
// =========================

type User = {
    id: number;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    role: string;
    isSelected?: boolean;
    isPermanentReceiver: boolean;
};

type DistributionEditorData = {
    correspondenceId: number;
    correspondenceNumber: string;
    correspondenceTitle: string;
    users: User[];
};

// =========================
// COMPONENT
// =========================

export default function DistributionPageClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();

    const correspondenceId = searchParams.get("id");

    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [notes, setNotes] = useState("");
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");

    // =========================
    // FETCH DATA
    // =========================

    const {
        data: editorData,
        isLoading,
        isError,
        refetch,
    } = useQuery<DistributionEditorData>({
        queryKey: ["distribution-editor", correspondenceId],
        queryFn: async () => {
            const res = await apiWrapper.get<{
                data: DistributionEditorData;
            }>(`Distributions/editor-data/${correspondenceId}`);

            if (!res.success || !res.data) {
                throw new Error("Failed to load distribution data");
            }

            return res.data.data;
        },
        enabled: !!correspondenceId,
    });

    // =========================
    // INIT SELECTED USERS
    // =========================

    useEffect(() => {
        if (editorData?.users) {
            const initialSelected = editorData.users
                .filter((u) => u.isSelected && !u.isPermanentReceiver)
                .map((u) => u.id);
            setSelectedUsers(initialSelected);
        }
    }, [editorData]);

    // =========================
    // FILTER USERS
    // =========================

    const permanentUsers = editorData?.users.filter((u) => u.isPermanentReceiver) ?? [];
    const currentUsers =
        editorData?.users.filter(
            (u) => !u.isPermanentReceiver && selectedUsers.includes(u.id)
        ) ?? [];
    const availableUsers =
        editorData?.users.filter(
            (u) =>
                !u.isPermanentReceiver &&
                !selectedUsers.includes(u.id) &&
                (u.fullName.toLowerCase().includes(search.toLowerCase()) ||
                    u.email.toLowerCase().includes(search.toLowerCase()))
        ) ?? [];

    // =========================
    // TOGGLE USER
    // =========================

    const addUser = (id: number) => {
        setSelectedUsers((prev) => [...prev, id]);
    };

    const removeUser = (id: number) => {
        setSelectedUsers((prev) => prev.filter((x) => x !== id));
    };

    // =========================
    // SUBMIT
    // =========================

    const distributeMutation = useMutation({
        mutationFn: async () => {
            const res = await apiWrapper.post("Distributions/distribute", {
                correspondenceId: Number(correspondenceId),
                receiverIds: selectedUsers,
                notes: notes || undefined,
            });

            if (!res.success) {
                throw new Error(res.error || "فشل حفظ التوزيع");
            }

            return res.data;
        },
        onSuccess: () => {
            toast.success("تم حفظ التوزيع بنجاح");

            queryClient.invalidateQueries({
                queryKey: ["distribution-editor", correspondenceId],
            });
            queryClient.invalidateQueries({
                queryKey: ["distribution-mails"],
            });

            setTimeout(() => {
                router.push(`/mail/${correspondenceId}`);
            }, 1500);
        },
        onError: (error: Error) => {
            toast.error(error.message || "فشل حفظ التوزيع");
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedUsers.length) {
            toast.error("اختر مستلم واحد على الأقل");
            return;
        }

        distributeMutation.mutate();
    };

    // =========================
    // LOADING / ERROR
    // =========================

    if (!correspondenceId) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] text-red-500">
                <p>معرف المراسلة غير موجود</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <FontAwesomeIcon icon={faSpinner} spin className="text-3xl text-blue-600" />
                <span className="mr-3 text-blue-600">جاري تحميل بيانات التوزيع...</span>
            </div>
        );
    }

    if (isError || !editorData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-red-500">
                <p>فشل تحميل بيانات التوزيع</p>
                <button
                    onClick={() => refetch()}
                    className="mt-4 px-4 py-2 bg-red-100 rounded-lg hover:bg-red-200 transition"
                >
                    إعادة المحاولة
                </button>
            </div>
        );
    }
return (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col h-full w-full bg-gray-50"
        dir="rtl"
    >
        {/* ===== HEADER - ثابت داخل الصفحة ===== */}
        <header className="bg-white border-b border-gray-200 shadow-sm shrink-0">
            <div className="flex items-center justify-between px-4 md:px-8 py-3">
                <button
                    onClick={() => router.push(`/mail/${correspondenceId}`)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition text-sm font-medium"
                >
                    <FontAwesomeIcon icon={faArrowRight} />
                    رجوع
                </button>

                <button
                    onClick={handleSubmit}
                    disabled={distributeMutation.isPending || selectedUsers.length === 0}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    <FontAwesomeIcon
                        icon={distributeMutation.isPending ? faSpinner : faPaperPlane}
                        spin={distributeMutation.isPending}
                    />
                    {distributeMutation.isPending ? "جاري الحفظ..." : "حفظ التوزيع"}
                </button>
            </div>

            {/* معلومات المراسلة */}
            <div className="px-4 md:px-8 pb-4">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                    توزيع المراسلة
                </h1>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
                    <div className="flex items-center gap-1.5 text-gray-500">
                        <FontAwesomeIcon icon={faHashtag} className="text-gray-400 text-[10px]" />
                        <span>رقم: {editorData.correspondenceNumber}</span>
                    </div>

                    <span className="text-gray-300">|</span>

                    <div className="flex items-center gap-1.5 text-gray-500">
                        <FontAwesomeIcon icon={faEnvelope} className="text-gray-400 text-[10px]" />
                        <span>{editorData.correspondenceTitle}</span>
                    </div>
                </div>
            </div>
        </header>

        {/* ===== MAIN CONTENT - قابل للتمرير ===== */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-4">
            <div className="max-w-6xl mx-auto space-y-4 px-2 sm:px-3 md:px-4 pb-8">
                    {/* 1. المستخدمون الدائمون */}
                    {permanentUsers.length > 0 && (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                                    <FontAwesomeIcon icon={faLock} className="text-sm" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-gray-800 text-sm">التوزيع الدائم</h2>
                                    <p className="text-xs text-gray-500">يتم التوزيع عليهم تلقائياً</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {permanentUsers.map((user) => (
                                    <div
                                        key={user.id}
                                        className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-200"
                                    >
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 text-white flex items-center justify-center font-bold text-[10px]">
                                            {user.firstName.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800 text-xs">
                                                {user.fullName}
                                            </p>
                                            <p className="text-[10px] text-gray-500">{user.email}</p>
                                        </div>
                                        <FontAwesomeIcon icon={faLock} className="text-gray-400 text-[10px]" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 2. المستخدمون الحاليون */}
                    <div className="bg-white rounded-xl border border-yellow-200 shadow-sm p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-yellow-100 text-yellow-600 flex items-center justify-center">
                                    <FontAwesomeIcon icon={faUserCheck} className="text-sm" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-gray-800 text-sm">المستلمون الحاليون</h2>
                                    <p className="text-xs text-gray-500">{currentUsers.length} مستلم</p>
                                </div>
                            </div>
                        </div>

                        {currentUsers.length === 0 ? (
                            <p className="text-sm text-gray-400">لا يوجد مستلمون حالياً</p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {currentUsers.map((user) => (
                                    <div
                                        key={user.id}
                                        className="flex items-center gap-2 bg-yellow-50 rounded-lg px-3 py-1.5 border border-yellow-200"
                                    >
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-400 text-white flex items-center justify-center font-bold text-[10px]">
                                            {user.firstName.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800 text-xs">
                                                {user.fullName}
                                            </p>
                                            <p className="text-[10px] text-gray-500">{user.email}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeUser(user.id)}
                                            className="w-6 h-6 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition flex items-center justify-center"
                                        >
                                            <FontAwesomeIcon icon={faUserMinus} className="text-[10px]" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 3. إضافة مستلمين */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                                <FontAwesomeIcon icon={faUserGroup} className="text-sm" />
                            </div>
                            <div>
                                <h2 className="font-bold text-gray-800 text-sm">إضافة مستلمين</h2>
                                <p className="text-xs text-gray-500">
                                    {availableUsers.length} مستلم متاح للإضافة
                                </p>
                            </div>
                        </div>

                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setOpen(!open)}
                                className="w-full flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm hover:border-blue-300 transition"
                            >
                                <span className="text-gray-500">
                                    {availableUsers.length > 0
                                        ? `اختر من ${availableUsers.length} مستلم`
                                        : "جميع المستخدمين تم اختيارهم"}
                                </span>
                                <FontAwesomeIcon
                                    icon={faChevronDown}
                                    className={`transition-transform text-gray-400 ${open ? "rotate-180" : ""}`}
                                />
                            </button>

                            {open && availableUsers.length > 0 && (
                                <div className="absolute z-10 mt-1 w-full bg-white rounded-lg border border-gray-200 shadow-lg max-h-48 overflow-y-auto">
                                    <div className="p-2 sticky top-0 bg-white border-b border-gray-100">
                                        <input
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            placeholder="بحث عن مستلم..."
                                            className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue-400"
                                        />
                                    </div>

                                    {availableUsers.map((user) => (
                                        <button
                                            key={user.id}
                                            type="button"
                                            onClick={() => {
                                                addUser(user.id);
                                                setSearch("");
                                            }}
                                            className="w-full flex items-center justify-between px-3 py-2 hover:bg-blue-50 transition text-right"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
                                                    {user.firstName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-800 text-xs">
                                                        {user.fullName}
                                                    </p>
                                                    <p className="text-[10px] text-gray-500">{user.email}</p>
                                                </div>
                                            </div>
                                            <FontAwesomeIcon icon={faUserPlus} className="text-blue-500 text-xs" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 4. الملاحظات */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">
                            ملاحظات
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={2}
                            className="w-full rounded-lg border border-gray-200 p-2.5 text-sm text-right resize-none focus:outline-none focus:border-blue-400"
                            placeholder="أضف ملاحظات (اختياري)..."
                        />
                    </div>
                </div>
            </main>
        </motion.div>
    );
}