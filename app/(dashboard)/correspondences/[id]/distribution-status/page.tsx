// app/(dashboard)/correspondences/[id]/distribution-status/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowRight,
    faSpinner,
    faEnvelope,
    faUsers,
    faEye,
    faClock,
    faBan,
    faRotateLeft,
    faXmark,
    faCheckCircle,
    faChartPie,
    faUser,
    faCalendar,
    faCircle,
    faFileLines,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import { apiWrapper } from "@/utils/apiClient";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import useUserInfoStore from "@/store/userInfoStore";

// ==============================
// TYPES
// ==============================

interface ReceiverStatusDto {
    receiverId: number;
    receiverName: string;
    receiverEmail: string;
    status: string;
    distributedDate: string | null;
    readAt: string | null;
    revokedAt: string | null;
    notes: string | null;
    rejectionReason: string | null;
    daysPending: number;
}

interface DistributionStatusDto {
    correspondenceId: number;
    correspondenceNumber: string;
    correspondenceTitle: string;
    totalReceivers: number;
    readCount: number;
    pendingCount: number;
    ignoredCount: number;
    revokedCount: number;
    pendingApprovalCount: number;
    rejectedCount: number;
    readPercentage: number;
    receivers: ReceiverStatusDto[];
}

// ==============================
// HELPERS
// ==============================

const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
        case "read":
            return { label: "مقروءة", color: "bg-emerald-100 text-emerald-700 border-emerald-300" };
        case "pending":
            return { label: "قيد الانتظار", color: "bg-yellow-100 text-yellow-700 border-yellow-300" };
        case "pendingapproval":
            return { label: "بانتظار الموافقة", color: "bg-blue-100 text-blue-700 border-blue-300" };
        case "ignored":
            return { label: "متجاهلة", color: "bg-gray-100 text-gray-600 border-gray-300" };
        case "revoked":
            return { label: "ملغية", color: "bg-red-100 text-red-700 border-red-300" };
        case "rejected":
            return { label: "مرفوضة", color: "bg-rose-100 text-rose-700 border-rose-300" };
        default:
            return { label: status, color: "bg-gray-100 text-gray-600 border-gray-300" };
    }
};

const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
        case "read": return faEye;
        case "pending": return faClock;
        case "pendingapproval": return faClock;
        case "ignored": return faBan; 
        case "revoked": return faRotateLeft;
        case "rejected": return faXmark;
        default: return faCircle;
    }
};

const getStatusDotColor = (status: string) => {
    switch (status.toLowerCase()) {
        case "read": return "text-emerald-500";
        case "pending": return "text-yellow-500";
        case "pendingapproval": return "text-purple-500";
        case "ignored": return "text-gray-400"; 
        case "revoked": return "text-red-500";
        case "rejected": return "text-rose-500";
        default: return "text-gray-400";
    }
};

const formatDate = (date: string | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("ar-SA", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

// ==============================
// MAIN COMPONENT
// ==============================

export default function DistributionStatusReportPage() {
    useAuthGuard();
    const router = useRouter();
    const params = useParams();
    const { role } = useUserInfoStore();
    const correspondenceId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<DistributionStatusDto | null>(null);

    // ✅ التحقق من صلاحية المستخدم
    useEffect(() => {
        if (role && role !== "Dean") {
            toast.error("هذه الصفحة متاحة للعميد فقط");
            router.back();
        }
    }, [role, router]);

    // ==============================
    // FETCH DATA
    // ==============================

    useEffect(() => {
        if (!correspondenceId) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await apiWrapper.get<{
                    data: DistributionStatusDto;
                }>(`/v2/Charts/dean/distribution-status-report/${correspondenceId}`);

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
        };

        fetchData();
    }, [correspondenceId]);

    // ==============================
    // RENDER
    // ==============================

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <FontAwesomeIcon icon={faSpinner} spin className="text-3xl text-blue-600" />
                <span className="mr-3 text-blue-600 text-sm">جاري تحميل التقرير...</span>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="text-5xl mb-4">📊</div>
                <h2 className="text-xl font-bold text-slate-600">لا توجد بيانات</h2>
                <p className="text-sm text-slate-400">لم يتم العثور على تقرير لهذه المراسلة</p>
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

    return (
        <div dir="rtl" className="min-h-screen bg-slate-50 p-4">
            {/* ===== HEADER ===== */}
            <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-4 mb-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center">
                            <FontAwesomeIcon icon={faChartPie} />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-800">تقرير حالة التوزيع</h1>
                            <p className="text-xs text-slate-500 flex items-center gap-2">
                                <FontAwesomeIcon icon={faFileLines} className="text-slate-400" />
                                {data.correspondenceNumber} - {data.correspondenceTitle}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition text-sm"
                    >
                        <FontAwesomeIcon icon={faArrowRight} />
                        العودة
                    </button>
                </div>
            </div>

            {/* ===== STATISTICS CARDS ===== */}
            {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="bg-white rounded-xl border border-blue-100 p-3 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">إجمالي المستلمين</span>
                        <FontAwesomeIcon icon={faUsers} className="text-blue-500" />
                    </div>
                    <p className="text-2xl font-bold text-slate-800 mt-1">{data.totalReceivers}</p>
                </div>

                <div className="bg-white rounded-xl border border-emerald-100 p-3 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">مقروء</span>
                        <FontAwesomeIcon icon={faEye} className="text-emerald-500" />
                    </div>
                    <p className="text-2xl font-bold text-emerald-600 mt-1">
                        {data.readCount}
                        <span className="text-sm font-normal text-slate-400 mr-1">
                            ({data.readPercentage.toFixed(0)}%)
                        </span>
                    </p>
                </div>

                <div className="bg-white rounded-xl border border-yellow-100 p-3 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">قيد الانتظار</span>
                        <FontAwesomeIcon icon={faClock} className="text-yellow-500" />
                    </div>
                    <p className="text-2xl font-bold text-yellow-600 mt-1">{data.pendingCount}</p>
                </div>

                <div className="bg-white rounded-xl border border-red-100 p-3 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">ملغية/مرفوضة</span>
                        <FontAwesomeIcon icon={faXmark} className="text-red-500" />
                    </div>
                    <p className="text-2xl font-bold text-red-600 mt-1">
                        {data.revokedCount + data.rejectedCount}
                    </p>
                </div>
            </div> */}

<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
    <div className="bg-white rounded-xl border border-blue-100 p-3 shadow-sm">
        <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">إجمالي المستلمين</span>
            <FontAwesomeIcon icon={faUsers} className="text-blue-500" />
        </div>
        <p className="text-2xl font-bold text-slate-800 mt-1">{data.totalReceivers}</p>
    </div>

    <div className="bg-white rounded-xl border border-emerald-100 p-3 shadow-sm">
        <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">مقروء</span>
            <FontAwesomeIcon icon={faEye} className="text-emerald-500" />
        </div>
        <p className="text-2xl font-bold text-emerald-600 mt-1">
            {data.readCount}
            <span className="text-sm font-normal text-slate-400 mr-1">
                ({data.readPercentage.toFixed(0)}%)
            </span>
        </p>
    </div>

    <div className="bg-white rounded-xl border border-yellow-100 p-3 shadow-sm">
        <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">قيد الانتظار</span>
            <FontAwesomeIcon icon={faClock} className="text-yellow-500" />
        </div>
        <p className="text-2xl font-bold text-yellow-600 mt-1">{data.pendingCount}</p>
    </div>

    <div className="bg-white rounded-xl border border-purple-100 p-3 shadow-sm">
        <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">بانتظار الموافقة</span>
            <FontAwesomeIcon icon={faClock} className="text-purple-500" />
        </div>
        <p className="text-2xl font-bold text-purple-600 mt-1">{data.pendingApprovalCount}</p>
    </div>

    <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
        <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">متجاهلة</span>
            <FontAwesomeIcon icon={faBan} className="text-gray-400" />
        </div>
        <p className="text-2xl font-bold text-gray-600 mt-1">{data.ignoredCount}</p>
    </div>

    <div className="bg-white rounded-xl border border-red-100 p-3 shadow-sm">
        <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">ملغية/مرفوضة</span>
            <FontAwesomeIcon icon={faXmark} className="text-red-500" />
        </div>
        <p className="text-2xl font-bold text-red-600 mt-1">
            {data.revokedCount + data.rejectedCount}
        </p>
    </div>
</div>
            {/* ===== PROGRESS BAR ===== */}
            <div className="bg-white rounded-xl border border-blue-100 p-4 shadow-sm mb-4">
                <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">نسبة القراءة</span>
                    <span className="font-semibold text-blue-600">{data.readPercentage.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500"
                        style={{ width: `${data.readPercentage}%` }}
                    />
                </div>
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>0%</span>
                    <span>100%</span>
                </div>
            </div>

            {/* ===== RECEIVERS LIST ===== */}
            <div className="bg-white rounded-xl border border-blue-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-blue-100 bg-blue-50/50">
                    <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <FontAwesomeIcon icon={faUser} className="text-blue-500" />
                        قائمة المستلمين
                        <span className="text-xs font-normal text-slate-400 mr-1">
                            ({data.receivers.length})
                        </span>
                    </h2>
                </div>

                <div className="divide-y divide-slate-100">
                    {data.receivers.map((receiver, index) => {
                        const status = getStatusBadge(receiver.status);
                        const StatusIcon = getStatusIcon(receiver.status);
                        const dotColor = getStatusDotColor(receiver.status);

                        return (
                            <motion.div
                                key={receiver.receiverId}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.03 }}
                                className="p-4 hover:bg-slate-50 transition"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                    {/* المستلم */}
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold text-xs">
                                            {receiver.receiverName.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-800 text-sm">
                                                {receiver.receiverName}
                                            </p>
                                            <p className="text-xs text-slate-400">{receiver.receiverEmail}</p>
                                        </div>
                                    </div>

                                    {/* الحالة */}
                                    <div className="flex items-center gap-3">
                                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${status.color}`}>
                                            <FontAwesomeIcon icon={StatusIcon} className="text-[10px]" />
                                            {status.label}
                                        </div>

                                        <FontAwesomeIcon icon={faCircle} className={`text-[8px] ${dotColor}`} />
                                    </div>
                                </div>

                                {/* التفاصيل الإضافية */}
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">
                                    {receiver.distributedDate && (
                                        <div className="flex items-center gap-1">
                                            <FontAwesomeIcon icon={faCalendar} className="text-[10px]" />
                                            <span>تاريخ التوزيع: {formatDate(receiver.distributedDate)}</span>
                                        </div>
                                    )}
                                    {receiver.readAt && (
                                        <div className="flex items-center gap-1 text-emerald-600">
                                            <FontAwesomeIcon icon={faEye} className="text-[10px]" />
                                            <span>قرأ في: {formatDate(receiver.readAt)}</span>
                                        </div>
                                    )}
                                    {receiver.daysPending > 0 && (
                                        <div className="flex items-center gap-1 text-yellow-600">
                                            <FontAwesomeIcon icon={faClock} className="text-[10px]" />
                                            <span>{receiver.daysPending} يوم بانتظار القراءة</span>
                                        </div>
                                    )}
                                    {receiver.rejectionReason && (
                                        <div className="flex items-center gap-1 text-rose-600 w-full md:w-auto">
                                            <FontAwesomeIcon icon={faXmark} className="text-[10px]" />
                                            <span>سبب الرفض: {receiver.rejectionReason}</span>
                                        </div>
                                    )}
                                    {receiver.notes && (
                                        <div className="flex items-center gap-1 text-slate-400 w-full md:w-auto">
                                            <span>📝 ملاحظات: {receiver.notes}</span>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {data.receivers.length === 0 && (
                    <div className="py-8 text-center text-slate-400 text-sm">
                        لا يوجد مستلمون
                    </div>
                )}
            </div>
        </div>
    );
}