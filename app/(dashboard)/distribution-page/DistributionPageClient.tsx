/* eslint-disable react-hooks/set-state-in-effect */
// app/(dashboard)/distribution-page/DistributionPageClient.tsx

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
    faInfoCircle,
    faCheck,
    faTimes,
    faUndo,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";

import { useDistributionEditor, useDistributeMutation } from "@/hooks/useDistribute";
import { UserDistributionStatusDto } from "@/types/api/distribution.types";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useUserRole } from "@/hooks/useUserRole";
import { CorrespondenceStatus, getStatusLabel, getStatusColor } from "@/types/api/correspondence.types";
import { cn } from "@/lib/utils";
import { BackButton } from "@/components/ui/BackButton";
// ❌ إزالة import useMarkAsRead
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

export const dynamic = 'force-dynamic';

// =========================
// COMPONENT
// =========================

export default function DistributionPageClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const correspondenceId = searchParams.get("id");

    // ✅ Auth Guard
    const { isLoading: isAuthLoading, isAuthorized } = useAuthGuard({
        requiredPermissions: ['CreateDistribution'],
        redirectTo: '/auth/login',
        unauthorizedPath: '/unauthorized'
    });

    const { isDean, isEmployee, isHeadOfDepartment, userId } = useUserRole();

    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [initialSelectedUsers, setInitialSelectedUsers] = useState<number[]>([]);
    const [notes, setNotes] = useState("");
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");

    // ❌ إزالة Mark as Read Modal states
    // const [markAsReadModalOpen, setMarkAsReadModalOpen] = useState(false);
    // const [markAsReadNotes, setMarkAsReadNotes] = useState("");

    // =========================
    // HOOKS
    // =========================

    const {
        data: editorData,
        isLoading,
        isError,
        refetch,
    } = useDistributionEditor(correspondenceId ? Number(correspondenceId) : null);

    const distributeMutation = useDistributeMutation(
        Number(correspondenceId),
        () => {
            router.push(`/correspondences?id=${correspondenceId}`);
        }
    );

    // ❌ إزالة markAsReadMutation
    // const markAsReadMutation = useMarkAsRead(() => {
    //     setMarkAsReadModalOpen(false);
    //     setMarkAsReadNotes("");
    //     refetch();
    //     toast.success("تم تحديد البريد كمقروء");
    // });

    // =========================
    // INIT SELECTED USERS - فقط isSelected = true
    // =========================

    useEffect(() => {
        if (editorData?.users) {
            const initialSelected = editorData.users
                .filter((u) => u.isSelected === true)
                .map((u) => u.id);
            setSelectedUsers(initialSelected);
            setInitialSelectedUsers(initialSelected);
        }
    }, [editorData]);

    // =========================
    // FILTER USERS
    // =========================

    const permanentUsers = isDean 
        ? [] 
        : editorData?.users.filter((u) => u.isPermanentReceiver) ?? [];

    const currentUsers =
        editorData?.users.filter(
            (u) => u.isSelected === true
        ) ?? [];

    const availableUsers =
        editorData?.users.filter(
            (u) => {
                if (u.isSelected === true) return false;
                if (!isDean && u.isPermanentReceiver) return false;
                return u.fullName.toLowerCase().includes(search.toLowerCase()) ||
                    u.email.toLowerCase().includes(search.toLowerCase());
            }
        ) ?? [];

    // =========================
    // TOGGLE USER
    // =========================

    const addUser = (id: number) => {
        setSelectedUsers((prev) => [...prev, id]);
        if (editorData) {
            const user = editorData.users.find(u => u.id === id);
            if (user) {
                user.isSelected = true;
            }
        }
    };

    const removeUser = (id: number) => {
        setSelectedUsers((prev) => prev.filter((x) => x !== id));
        if (editorData) {
            const user = editorData.users.find(u => u.id === id);
            if (user) {
                user.isSelected = false;
            }
        }
    };

    // =========================
    // RESET SELECTION 
    // =========================

    const resetSelection = () => {
        setSelectedUsers(initialSelectedUsers);
        
        if (editorData) {
            editorData.users.forEach((user) => {
                user.isSelected = initialSelectedUsers.includes(user.id);
            });
        }
        
        setNotes("");
        toast.success("تم إلغاء التغييرات");
    };

    const isUserLocked = (user: UserDistributionStatusDto): boolean => {
        if (isDean) {
            return false;
        }

        if (isEmployee && !isHeadOfDepartment) {
            return user.isPermanentReceiver;
        }

        if (isHeadOfDepartment) {
            return user.isPermanentReceiver || user.id === userId;
        }

        return user.isLocked || false;
    };


    const status = editorData?.correspondenceStatus;
    const isDistributeDisabled = status === CorrespondenceStatus.Signed || 
                                status === CorrespondenceStatus.Archived;

    const requireDeanApproval = editorData?.requireDeanApprovalForAll || false;
    const autoApprovePermanent = editorData?.autoApprovePermanentReceivers || false;

    const hasChanges = JSON.stringify(selectedUsers.sort()) !== JSON.stringify(initialSelectedUsers.sort()) || notes !== "";

    // =========================
    // HANDLE SUBMIT
    // =========================

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isDistributeDisabled) {
            const statusLabel = status === CorrespondenceStatus.Signed ? 'موقعة' : 'مؤرشفة';
            toast.error(`لا يمكن توزيع المراسلة في حالة ${statusLabel}`);
            return;
        }

        if (isDean && !selectedUsers.length) {
            toast.error("يجب اختيار مستلم واحد على الأقل");
            return;
        }

        distributeMutation.mutate({
            receiverIds: selectedUsers,
            notes: notes || undefined,
        });
    };

    // ❌ إزالة handleMarkAsRead
    // const handleMarkAsRead = () => {
    //     if (!correspondenceId) {
    //         toast.error("لا يوجد مراسلة مرتبطة بهذا البريد");
    //         return;
    //     }
    //     markAsReadMutation.mutate({
    //         correspondenceId: Number(correspondenceId),
    //         notes: markAsReadNotes || undefined,
    //     });
    // };

    // =========================
    // LOADING / ERROR
    // =========================

    if (isAuthLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <FontAwesomeIcon icon={faSpinner} spin className="text-3xl text-blue-600" />
                <span className="mr-3 text-blue-600">جاري التحميل...</span>
            </div>
        );
    }

    if (!isAuthorized) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <p className="text-red-500 text-lg">ليس لديك صلاحية لتوزيع المراسلات</p>
                <button
                    onClick={() => router.push('/')}
                    className="mt-4 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                    العودة للرئيسية
                </button>
            </div>
        );
    }

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

    const statusLabel = status !== undefined ? getStatusLabel(status) : 'غير معروف';
    const statusColor = status !== undefined ? getStatusColor(status) : 'bg-gray-100 text-gray-700';
    const statusMessage = isDistributeDisabled 
        ? `⚠️ هذه المراسلة ${statusLabel}، لا يمكن توزيعها`
        : null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col h-full w-full bg-gray-50"
            dir="rtl"
        >
            {/* ===== HEADER ===== */}
            <header className="bg-white border-b border-gray-200 shadow-sm shrink-0">
                <div className="flex items-center justify-between px-4 md:px-8 py-3">
                    <div className="flex items-center gap-2">
                        <BackButton
                            onClick={() => router.push(`/correspondences?id=${correspondenceId}`)}
                            hasChanges={hasChanges}
                            variant="compact"
                        />

                        {/* ❌ إزالة زر تحديد كمقروء من هنا */}
                        {/* <button
                            onClick={() => setMarkAsReadModalOpen(true)}
                            disabled={markAsReadMutation.isPending}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition disabled:opacity-50"
                            title="تحديد البريد كمقروء"
                        >
                            <FontAwesomeIcon icon={faEnvelope } className="text-sm" />
                            <span className="hidden sm:inline">قراءة</span>
                        </button> */}
                    </div>

                    {/* عنوان الصفحة */}
                    <h1 className="text-lg md:text-xl font-bold text-gray-900">
                        توزيع المراسلة
                    </h1>

                    {/* مساحة فارغة للحفاظ على التوزان */}
                    <div className="w-20 md:w-32"></div>
                </div>

                {/* معلومات المراسلة */}
                <div className="px-4 md:px-8 pb-4">
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

                        <span className="text-gray-300">|</span>

                        <div className="flex items-center gap-1.5 text-gray-500">
                            <FontAwesomeIcon icon={faInfoCircle} className="text-gray-400 text-[10px]" />
                            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                                {isDean ? 'عميد' : isHeadOfDepartment ? 'رئيس قسم' : 'موظف'}
                            </span>
                        </div>

                        {/* ✅ عرض حالة المراسلة */}
                        {status !== undefined && (
                            <>
                                <span className="text-gray-300">|</span>
                                <div className="flex items-center gap-1.5">
                                    <span className={cn("text-xs px-2 py-0.5 rounded-full", statusColor)}>
                                        {statusLabel}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>

                    {/* ✅ عرض الإعدادات */}
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                        {requireDeanApproval && (
                            <span className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded-lg">
                                <FontAwesomeIcon icon={faInfoCircle} className="text-[10px]" />
                                يحتاج موافقة العميد
                            </span>
                        )}
                        {autoApprovePermanent && (
                            <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                                <FontAwesomeIcon icon={faCheck} className="text-[10px]" />
                                الموافقة التلقائية للدائمين
                            </span>
                        )}
                    </div>

                    {/* ✅ رسالة الحالة المانعة للتوزيع */}
                    {statusMessage && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                            {statusMessage}
                        </div>
                    )}
                </div>
            </header>

            {/* ===== MAIN CONTENT ===== */}
            <main className="flex-1 overflow-y-auto px-4 md:px-8 py-4 pb-32">
                <div className="max-w-6xl mx-auto space-y-4 px-2 sm:px-3 md:px-4 pb-8">
                    {/* 1. المستخدمون الدائمون - يظهرون فقط للموظف ورئيس القسم */}
                    {!isDean && permanentUsers.length > 0 && (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                                    <FontAwesomeIcon icon={faLock} className="text-sm" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-gray-800 text-sm">التوزيع الدائم</h2>
                                    <p className="text-xs text-gray-500">يتم التوزيع عليهم تلقائياً - لا يمكن التعديل</p>
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

                    {/* 2. المستخدمون الحاليون - فقط isSelected = true */}
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
                                {currentUsers.map((user) => {
                                    const isLocked = isUserLocked(user);
                                    const showAutoTag = !isDean && user.isPermanentReceiver;
                                    
                                    return (
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
                                                    {showAutoTag && (
                                                        <span className="text-[8px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full mr-1">
                                                            تلقائي
                                                        </span>
                                                    )}
                                                </p>
                                                <p className="text-[10px] text-gray-500">{user.email}</p>
                                            </div>
                                            {isLocked ? (
                                                <FontAwesomeIcon icon={faLock} className="text-gray-400 text-[10px]" />
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => removeUser(user.id)}
                                                    className="w-6 h-6 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition flex items-center justify-center"
                                                >
                                                    <FontAwesomeIcon icon={faUserMinus} className="text-[10px]" />
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
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
                                    {isDean 
                                        ? `${availableUsers.length} مستلم متاح للإضافة`
                                        : `${availableUsers.length} مستلم متاح للإضافة (الدائمون مقفلون)`}
                                </p>
                            </div>
                        </div>

                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setOpen(!open)}
                                className="w-full flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm hover:border-blue-300 transition"
                                disabled={isDistributeDisabled}
                            >
                                <span className="text-gray-500">
                                    {isDistributeDisabled 
                                        ? 'التوزيع غير مسموح'
                                        : availableUsers.length > 0
                                            ? `اختر من ${availableUsers.length} مستلم`
                                            : isDean 
                                                ? "جميع المستخدمين تم اختيارهم"
                                                : "جميع المستخدمين المتاحين تم اختيارهم"}
                                </span>
                                {!isDistributeDisabled && (
                                    <FontAwesomeIcon
                                        icon={faChevronDown}
                                        className={`transition-transform text-gray-400 ${open ? "rotate-180" : ""}`}
                                    />
                                )}
                            </button>

                            {!isDistributeDisabled && open && availableUsers.length > 0 && (
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
                            disabled={isDistributeDisabled}
                        />
                    </div>
                </div>
            </main>

            {/* ❌ إزالة Mark as Read Modal */}
            {/* {markAsReadModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-xl p-6">
                        <h2 className="text-lg font-bold mb-2">تحديد البريد كمقروء</h2>
                        <p className="text-sm text-gray-500 mb-4">الرجاء إدخال ملاحظات (اختياري):</p>
                        <textarea
                            value={markAsReadNotes}
                            onChange={(e) => setMarkAsReadNotes(e.target.value)}
                            className="w-full border rounded-xl p-3 text-sm resize-none h-24 focus:outline-none focus:border-blue-400"
                            placeholder="ملاحظات..."
                        />
                        <div className="flex gap-2 mt-4">
                            <button 
                                onClick={() => setMarkAsReadModalOpen(false)} 
                                className="flex-1 border border-gray-200 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleMarkAsRead}
                                disabled={markAsReadMutation.isPending}
                                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-xl font-semibold transition disabled:opacity-50"
                            >
                                {markAsReadMutation.isPending ? "جاري..." : "تأكيد القراءة"}
                            </button>
                        </div>
                    </div>
                </div>
            )} */}

            {/* ===== FIXED FOOTER - الأزرار في الأسفل ===== */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg px-4 md:px-8 py-4 z-50">
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-end gap-3">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        {/* زر الإلغاء */}
                        <button
                            type="button"
                            onClick={resetSelection}
                            disabled={!hasChanges || isDistributeDisabled}
                            className={cn(
                                "flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition",
                                hasChanges && !isDistributeDisabled
                                    ? "bg-red-50 text-red-600 hover:bg-red-100"
                                    : "bg-gray-100 text-gray-400 cursor-not-allowed opacity-60"
                            )}
                        >
                            <FontAwesomeIcon icon={faUndo} />
                            إلغاء التغييرات
                        </button>

                        {/* زر الحفظ */}
                        <button
                            onClick={handleSubmit}
                            disabled={distributeMutation.isPending || isDistributeDisabled || !hasChanges}
                            className={cn(
                                "flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition min-w-[140px]",
                                distributeMutation.isPending || isDistributeDisabled || !hasChanges
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
                            )}
                        >
                            <FontAwesomeIcon
                                icon={distributeMutation.isPending ? faSpinner : faPaperPlane}
                                spin={distributeMutation.isPending}
                            />
                            {isDistributeDisabled 
                                ? 'غير مسموح بالتوزيع' 
                                : distributeMutation.isPending 
                                    ? 'جاري الحفظ...' 
                                    : 'حفظ التوزيع'}
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}