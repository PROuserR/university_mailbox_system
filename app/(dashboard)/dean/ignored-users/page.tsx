// app/(dashboard)/dean/ignored-users/page.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowRight,
    faSpinner,
    faUsers,
    faEnvelope,
    faClock,
    faBan,
    faEye,
    faUser,
    faCalendar,
    faFileLines,
    faRefresh,
    faChevronLeft,
    faChevronRight,
    faAnglesLeft,
    faAnglesRight,
    faTrash,
    faChevronDown,
    faChevronUp,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import { apiWrapper } from "@/utils/apiClient";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import useUserInfoStore from "@/store/userInfoStore";

// ==============================
// TYPES
// ==============================

interface IgnoredCorrespondenceInfoDto {
    correspondenceId: number;
    correspondenceNumber: string;
    title: string;
    distributedAt: string;
    daysPending: number;
}

interface IgnoredUsersReportDto {
    userId: number;
    userName: string;
    fullName: string;
    unreadCount: number;
    oldestUnreadDate: string | null;
    ignoredCorrespondences: IgnoredCorrespondenceInfoDto[];
}

interface PagedResult<T> {
    items: T[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

// ==============================
// HELPERS
// ==============================

const formatDate = (date: string | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("ar-SA", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

const getDaysColor = (days: number) => {
    if (days <= 7) return "text-yellow-600";
    if (days <= 14) return "text-orange-600";
    if (days <= 30) return "text-red-500";
    return "text-red-700";
};

// ==============================
// MAIN COMPONENT
// ==============================

export default function IgnoredUsersPage() {
    useAuthGuard();
    const router = useRouter();
    const { role } = useUserInfoStore();

    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [data, setData] = useState<PagedResult<IgnoredUsersReportDto> | null>(null);
    const [daysThreshold, setDaysThreshold] = useState<number>(7);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [expandedUsers, setExpandedUsers] = useState<Set<number>>(new Set());

    const isDean = role === "Dean";

    // ==============================
    // FETCH DATA
    // ==============================

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await apiWrapper.get<{
                data: PagedResult<IgnoredUsersReportDto>;
            }>(`/v2/Charts/dean/ignored-users`, {
                daysThreshold,
                page,
                pageSize,
            });

            if (response.success && response.data) {
                setData(response.data.data);
            } else {
                toast.error(response.error || "فشل تحميل التقرير");
            }
        } catch {
            toast.error("حدث خطأ أثناء تحميل التقرير");
        } finally {
            setLoading(false);
        }
    }, [daysThreshold, page, pageSize]);

    useEffect(() => {
        if (isDean) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            fetchData();
        } else {
            setLoading(false);
        }
    }, [isDean, fetchData]);

    // ==============================
    // PROCESS IGNORED
    // ==============================

    const handleProcessIgnored = async () => {
        if (!window.confirm("هل أنت متأكد من معالجة جميع المراسلات المتجاهلة؟")) return;

        try {
            setProcessing(true);
            const response = await apiWrapper.post(
                `/api/Reports/process-ignored?daysThreshold=${daysThreshold}`
            );

            if (response.success) {
                toast.success("تمت معالجة المراسلات المتجاهلة بنجاح");
                await fetchData();
            } else {
                toast.error(response.error || "فشل معالجة المراسلات");
            }
        } catch {
            toast.error("حدث خطأ أثناء المعالجة");
        } finally {
            setProcessing(false);
        }
    };

    // ==============================
    // TOGGLE USER EXPAND
    // ==============================

    const toggleUser = (userId: number) => {
        setExpandedUsers((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(userId)) {
                newSet.delete(userId);
            } else {
                newSet.add(userId);
            }
            return newSet;
        });
    };

    // ==============================
    // PAGINATION
    // ==============================

    const goToPage = (newPage: number) => {
        if (newPage >= 1 && newPage <= (data?.totalPages || 1)) {
            setPage(newPage);
        }
    };

    // ==============================
    // RENDER
    // ==============================

    if (!isDean) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="text-5xl mb-4">🔒</div>
                <h2 className="text-xl font-bold text-slate-600">غير مصرح</h2>
                <p className="text-sm text-slate-400 mt-1">هذه الصفحة متاحة للعميد فقط</p>
                <button
                    onClick={() => router.back()}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition"
                >
                    <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                    العودة
                </button>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <FontAwesomeIcon icon={faSpinner} spin className="text-3xl text-blue-600" />
                <span className="mr-3 text-blue-600 text-sm">جاري تحميل التقرير...</span>
            </div>
        );
    }

    const items = data?.items || [];

    return (
        <div dir="rtl" className="min-h-screen bg-slate-50 p-4">
            {/* ===== HEADER ===== */}
            <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-4 mb-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
                            <FontAwesomeIcon icon={faUsers} />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-800">المستخدمون المتجاهلون</h1>
                            <p className="text-xs text-slate-500 flex items-center gap-2">
                                <FontAwesomeIcon icon={faClock} className="text-slate-400" />
                                الحد الأدنى للأيام: {daysThreshold} يوم
                                {data && ` · إجمالي المستخدمين: ${data.totalCount}`}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <select
                            value={daysThreshold}
                            onChange={(e) => {
                                setDaysThreshold(Number(e.target.value));
                                setPage(1);
                            }}
                            className="px-3 py-1.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-blue-400"
                        >
                            <option value={3}>3 أيام</option>
                            <option value={7}>7 أيام</option>
                            <option value={14}>14 يوم</option>
                            <option value={30}>30 يوم</option>
                            <option value={60}>60 يوم</option>
                        </select>

                        <button
                            onClick={fetchData}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition text-sm"
                            disabled={loading}
                        >
                            <FontAwesomeIcon icon={faRefresh} className={loading ? "animate-spin" : ""} />
                            تحديث
                        </button>

                        <button
                            onClick={handleProcessIgnored}
                            disabled={processing || items.length === 0}
                            className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-red-500 text-white hover:bg-red-600 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FontAwesomeIcon icon={processing ? faSpinner : faTrash} spin={processing} />
                            {processing ? "جاري المعالجة..." : "تطبيق التجاهل"}
                        </button>
                    </div>
                </div>
            </div>

            {/* ===== STATISTICS ===== */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <div className="bg-white rounded-xl border border-red-100 p-3 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">إجمالي المستخدمين المتجاهلين</span>
                        <FontAwesomeIcon icon={faUsers} className="text-red-500" />
                    </div>
                    <p className="text-2xl font-bold text-red-600 mt-1">{data?.totalCount || 0}</p>
                </div>

                <div className="bg-white rounded-xl border border-orange-100 p-3 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">إجمالي المراسلات المتجاهلة</span>
                        <FontAwesomeIcon icon={faEnvelope} className="text-orange-500" />
                    </div>
                    <p className="text-2xl font-bold text-orange-600 mt-1">
                        {items.reduce((acc, user) => acc + user.ignoredCorrespondences.length, 0)}
                    </p>
                </div>

                <div className="bg-white rounded-xl border border-yellow-100 p-3 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">الحد الأدنى للأيام</span>
                        <FontAwesomeIcon icon={faClock} className="text-yellow-500" />
                    </div>
                    <p className="text-2xl font-bold text-yellow-600 mt-1">{daysThreshold} يوم</p>
                </div>
            </div>

            {/* ===== USERS LIST ===== */}
            {items.length === 0 ? (
                <div className="bg-white rounded-2xl border border-green-100 p-8 text-center shadow-sm">
                    <div className="text-5xl mb-4">✅</div>
                    <h2 className="text-xl font-bold text-green-600">لا يوجد مستخدمون متجاهلون</h2>
                    <p className="text-sm text-slate-400 mt-1">جميع المستخدمين في الحدود الطبيعية</p>
                </div>
            ) : (
                <>
                    <div className="space-y-3">
                        {items.map((user, index) => {
                            const isExpanded = expandedUsers.has(user.userId);
                            const totalIgnored = user.ignoredCorrespondences.length;

                            return (
                                <motion.div
                                    key={user.userId}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden"
                                >
                                    {/* ===== USER HEADER ===== */}
                                    <div
                                        className="px-4 py-3 bg-gradient-to-r from-orange-50 to-white cursor-pointer hover:bg-orange-100/50 transition flex items-center justify-between"
                                        onClick={() => toggleUser(user.userId)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center font-bold text-sm">
                                                {user.fullName.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-800">
                                                    {user.fullName}
                                                </h3>
                                                <p className="text-xs text-slate-400">@{user.userName}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1.5 text-sm">
                                                <FontAwesomeIcon icon={faEnvelope} className="text-slate-400 text-xs" />
                                                <span className="font-medium text-slate-700">{user.unreadCount}</span>
                                                <span className="text-slate-400 text-xs">غير مقروء</span>
                                            </div>
                                            {user.oldestUnreadDate && (
                                                <div className="flex items-center gap-1.5 text-sm">
                                                    <FontAwesomeIcon icon={faClock} className="text-slate-400 text-xs" />
                                                    <span className="text-slate-500 text-xs">
                                                        {formatDate(user.oldestUnreadDate)}
                                                    </span>
                                                </div>
                                            )}
                                            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                                                {totalIgnored}
                                            </span>
                                            <FontAwesomeIcon
                                                icon={isExpanded ? faChevronUp : faChevronDown}
                                                className="text-slate-400 text-sm"
                                            />
                                        </div>
                                    </div>

                                    {/* ===== USER BODY ===== */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.25 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="p-4 border-t border-orange-100 space-y-2">
                                                    {totalIgnored === 0 ? (
                                                        <p className="text-sm text-slate-400 text-center py-2">
                                                            لا توجد مراسلات متجاهلة لهذا المستخدم
                                                        </p>
                                                    ) : (
                                                        <>
                                                            <p className="text-xs font-medium text-slate-500 mb-2">
                                                                المراسلات المتجاهلة ({totalIgnored})
                                                            </p>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                                {user.ignoredCorrespondences.map((corr) => (
                                                                    <div
                                                                        key={corr.correspondenceId}
                                                                        className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition text-xs"
                                                                    >
                                                                        <div className="min-w-0 flex-1">
                                                                            <p className="font-medium text-slate-700 truncate">
                                                                                {corr.title}
                                                                            </p>
                                                                            <p className="text-slate-400 text-[10px]">
                                                                                #{corr.correspondenceNumber} · {formatDate(corr.distributedAt)}
                                                                            </p>
                                                                        </div>
                                                                        <span className={`font-medium mr-2 ${getDaysColor(corr.daysPending)}`}>
                                                                            {corr.daysPending} يوم
                                                                        </span>
                                                                          {/* ✅ زر الانتقال إلى المراسلة */}
            <button
                onClick={() => {
                    // ✅ التحقق من التصميم الحالي
                    const uiMode = localStorage.getItem('ui-mode-storage');
                    let isModern = false;
                    try {
                        const parsed = JSON.parse(uiMode || '{}');
                        isModern = parsed.state?.uiMode === 'modern';
                    } catch {
                        isModern = false;
                    }
                    
                    if (isModern) {
                       router.push(`/correspondences?id=${corr.correspondenceId}`);
                    } else {
                        router.push(`/mail/${corr.correspondenceId}`);
                    }
                }}
                className="px-2 py-1 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition text-[10px]"
            >
                عرض
            </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* ===== PAGINATION ===== */}
                    {data && data.totalPages > 1 && (
                        <div className="flex items-center justify-center gap-1 mt-4">
                            <button
                                onClick={() => goToPage(1)}
                                disabled={!data.hasPreviousPage}
                                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FontAwesomeIcon icon={faAnglesRight} />
                            </button>
                            <button
                                onClick={() => goToPage(page - 1)}
                                disabled={!data.hasPreviousPage}
                                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FontAwesomeIcon icon={faChevronRight} />
                            </button>

                            <span className="text-sm text-slate-600 mx-2">
                                {page} / {data.totalPages}
                            </span>

                            <button
                                onClick={() => goToPage(page + 1)}
                                disabled={!data.hasNextPage}
                                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FontAwesomeIcon icon={faChevronLeft} />
                            </button>
                            <button
                                onClick={() => goToPage(data.totalPages)}
                                disabled={!data.hasNextPage}
                                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FontAwesomeIcon icon={faAnglesLeft} />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}