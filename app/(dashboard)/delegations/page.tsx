/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
// app/(dashboard)/delegations/page.tsx

"use client";

import {
    useEffect,
    useMemo,
    useState
} from "react";

import toast from "react-hot-toast";

import {
    FontAwesomeIcon
} from "@fortawesome/react-fontawesome";

import {
    faPlus,
    faUsers,
    faClock,
    faCheckCircle,
    faBan,
    faSearch,
    faRotate,
    faEye,
    faTrash,
    faXmark,
    faSpinner,
} from "@fortawesome/free-solid-svg-icons";

import {
    apiWrapper,
    ApiResult
} from "@/utils/apiClient";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

// ==============================
// TYPES
// ==============================

// ✅ DelegationType من Backend (يأتي كـ string)
type DelegationTypeString = "Approval" | "Rejection" | "Both";

// ✅ Enum للاستخدام الداخلي
enum DelegationType {
    Approval = 1,
    Rejection = 2,
    Both = 3
}

// ✅ Delegation مع type كـ string
interface Delegation {
    id: number;
    deanId: number;
    deanName: string;
    delegateUserId: number;
    delegateUserName: string;
    startDate: string;
    endDate: string | null;
    type: DelegationTypeString;
    isActive: boolean;
    notes: string | null;
    createdAt: string;
}

// ✅ UserResponseDto من Backend
interface UserResponseDto {
    id: number;
    firstName: string;
    lastName: string;
    userName: string;
    fullName: string;
    email: string;
    phone: string | null;
    isActive: boolean;
    isBanned: boolean;
    isPermanentReceiver: boolean;
    lastLoginAt: string | null;
    createdAt: string;
    updatedAt: string | null;
    profileImageUrl: string | null;
    roles: string[];
}

// ==============================
// HELPERS
// ==============================

// ✅ عرض النص بالعربي
function getTypeLabel(type: DelegationTypeString): string {
    switch (type) {
        case "Approval": return "اعتماد";
        case "Rejection": return "رفض";
        case "Both": return "اعتماد ورفض";
        default: return "غير محدد";
    }
}

// ✅ لون النوع
function getTypeColor(type: DelegationTypeString): string {
    switch (type) {
        case "Approval": return "bg-emerald-100 text-emerald-700";
        case "Rejection": return "bg-red-100 text-red-700";
        case "Both": return "bg-purple-100 text-purple-700";
        default: return "bg-gray-100 text-gray-700";
    }
}

function formatDate(date: string | null): string {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("ar-SA");
}

// ==============================
// COMPONENT
// ==============================

export default function DelegationsPage() {
    const [delegations, setDelegations] = useState<Delegation[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "expired">("all");
    const [typeFilter, setTypeFilter] = useState<"all" | "approval" | "rejection" | "both">("all");

    // Modal states
    const [showDetails, setShowDetails] = useState(false);
    const [selectedDelegation, setSelectedDelegation] = useState<Delegation | null>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [revokeModalOpen, setRevokeModalOpen] = useState(false);
    const [revokeTargetId, setRevokeTargetId] = useState<number | null>(null);
    // Form states
    const [delegateUserId, setDelegateUserId] = useState("");
    const [endDate, setEndDate] = useState("");
    const [type, setType] = useState<DelegationTypeString>("Both");
    const [notes, setNotes] = useState("");

    const [users, setUsers] = useState<UserResponseDto[]>([]);

    // ==============================
    // LOAD USERS
    // ==============================
    const getEmployeeUsers = async () => {
        try {
            const req = await apiWrapper.get<ApiResult<UserResponseDto[]>>("/Users/role/Employee");
            if (req.data?.isSuccess) {
                const activeUsers = req.data.data.filter(
                    user => user.isActive === true && user.isBanned === false
                );
                setUsers(activeUsers);
                console.log("✅ Active Employees:", activeUsers.length);
            }
        } catch (error) {
            console.error("Failed to load users:", error);
        }
    };

    // ==============================
    // LOAD DELEGATIONS
    // ==============================
    async function loadDelegations() {
        try {
            setLoading(true);
            const response = await apiWrapper.get<ApiResult<Delegation[]>>("/Delegations");

            if (response.data?.isSuccess) {
                console.log("✅ Delegations loaded:", response.data.data);
                setDelegations(response.data.data);
            } else {
                toast.error(response.data?.message || "فشل تحميل التفويضات");
            }
        } catch (error: any) {
            toast.error(error?.message || "فشل تحميل التفويضات");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getEmployeeUsers();
        loadDelegations();
    }, []);

    // ==============================
    // STATISTICS
    // ==============================
    const statistics = useMemo(() => {
        const today = new Date();
        const active = delegations.filter(item => item.isActive);
        const expired = delegations.filter(item => 
            item.endDate && new Date(item.endDate) < today
        );
        const endingSoon = active.filter(item => {
            if (!item.endDate) return false;
            const days = (new Date(item.endDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
            return days <= 3 && days >= 0;
        });

        return {
            total: delegations.length,
            active: active.length,
            endingSoon: endingSoon.length,
            expired: expired.length
        };
    }, [delegations]);

    // ==============================
    // FILTER
    // ==============================
    const filteredDelegations = useMemo(() => {
        return delegations.filter(item => {
            const searchValue = search.toLowerCase();
            const matchesSearch =
                item.delegateUserName?.toLowerCase().includes(searchValue) ||
                item.deanName?.toLowerCase().includes(searchValue);

            const matchesStatus =
                statusFilter === "all"
                    ? true
                    : statusFilter === "active"
                        ? item.isActive
                        : !item.isActive;

            // ✅ فلترة النوع - مقارنة strings
            const matchesType =
                typeFilter === "all"
                    ? true
                    : typeFilter === "approval"
                        ? item.type === "Approval"
                        : typeFilter === "rejection"
                            ? item.type === "Rejection"
                            : item.type === "Both";

            return matchesSearch && matchesStatus && matchesType;
        });
    }, [delegations, search, statusFilter, typeFilter]);

    // ==============================
    // CREATE DELEGATION
    // ==============================
    async function createDelegation() {
        if (!delegateUserId) {
            toast.error("المستخدم المفوض إليه مطلوب");
            return;
        }

        try {
            setSubmitting(true);

            const response = await apiWrapper.post<ApiResult<object>>("/Delegations", {
                delegateUserId: Number(delegateUserId),
                endDate: endDate || null,
                type: type,
                notes: notes || null,
            });

            if (response.data?.isSuccess) {
                toast.success("تم إنشاء التفويض بنجاح");
                setShowCreate(false);
                resetForm();
                await loadDelegations();
            } else {
                toast.error(response.error || "فشل إنشاء التفويض");
            }
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error?.message || "فشل إنشاء التفويض";
        toast.error(errorMessage);
        } finally {
            setSubmitting(false);
        }
    }

    const handleRevokeClick = (id: number) => {
        setRevokeTargetId(id);
        setRevokeModalOpen(true);
    };

    const confirmRevoke = async () => {
        if (!revokeTargetId) return;
        try {
            const response = await apiWrapper.delete<ApiResult<object>>(`/Delegations/${revokeTargetId}`);
            if (response.data?.isSuccess) {
                toast.success("تم إلغاء التفويض بنجاح");
                await loadDelegations();
            } else {
                toast.error(response.data?.message || "فشل إلغاء التفويض");
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "فشل إلغاء التفويض");
        }
        setRevokeTargetId(null);
    };


    // ==============================
    // HELPERS
    // ==============================
    function resetForm() {
        setDelegateUserId("");
        setEndDate("");
        setType("Both");
        setNotes("");
    }

    // ==============================
    // RENDER
    // ==============================

    return (
        <div dir="rtl" className="min-h-screen bg-slate-50 p-3 sm:p-4">
            {/* ===== HEADER ===== */}
            <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-3 sm:p-4 mb-3 sm:mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-base sm:text-lg flex-shrink-0">
                        <FontAwesomeIcon icon={faUsers} />
                    </div>
                    <div>
                        <h1 className="text-base sm:text-lg font-bold text-slate-800">إدارة التفويضات</h1>
                        <p className="text-[11px] sm:text-xs text-slate-500">إدارة صلاحيات تفويض الاعتمادات والوصول المؤقت</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => { setRefreshing(true); loadDelegations().finally(() => setRefreshing(false)); }}
                        disabled={refreshing}
                        className="bg-white border border-blue-200 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium hover:bg-slate-50 transition disabled:opacity-50 flex items-center gap-1.5"
                    >
                        <FontAwesomeIcon icon={faRotate} className={refreshing ? "animate-spin" : ""} />
                        تحديث
                    </button>

                    <button
                        onClick={() => setShowCreate(true)}
                        className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl font-semibold flex items-center gap-1.5 sm:gap-2 transition text-xs sm:text-sm"
                    >
                        <FontAwesomeIcon icon={faPlus} className="text-xs sm:text-sm" />
                        تفويض جديد
                    </button>
                </div>
            </div>

            {/* ===== STATS ===== */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-3 sm:mb-4 text-xs sm:text-sm bg-white rounded-2xl border border-blue-100 p-2.5 sm:p-3 shadow-sm">
                <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="text-slate-400 text-[10px] sm:text-xs">📊</span>
                    <span className="text-slate-600 text-[11px] sm:text-xs">الإحصائيات:</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
                    <span className="text-slate-500">الإجمالي:</span>
                    <span className="font-semibold text-slate-800">{statistics.total}</span>
                </div>
                <div className="w-px h-3 sm:h-4 bg-slate-200" />
                <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
                    <span className="text-emerald-500 text-[8px] sm:text-[10px]">●</span>
                    <span className="text-slate-500">نشط:</span>
                    <span className="font-semibold text-emerald-600">{statistics.active}</span>
                </div>
                <div className="w-px h-3 sm:h-4 bg-slate-200" />
                <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
                    <span className="text-yellow-500 text-[8px] sm:text-[10px]">●</span>
                    <span className="text-slate-500">ينتهي قريباً:</span>
                    <span className="font-semibold text-yellow-600">{statistics.endingSoon}</span>
                </div>
                <div className="w-px h-3 sm:h-4 bg-slate-200" />
                <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
                    <span className="text-red-500 text-[8px] sm:text-[10px]">●</span>
                    <span className="text-slate-500">منتهي:</span>
                    <span className="font-semibold text-red-500">{statistics.expired}</span>
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
                            placeholder="البحث عن المفوض إليه أو العميد..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 sm:py-2 pr-8 sm:pr-10 pl-3 text-xs sm:text-sm outline-none focus:border-blue-400"
                        />
                    </div>

                    <div className="flex gap-1.5 flex-wrap">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs outline-none focus:border-blue-400"
                        >
                            <option value="all">كل الحالات</option>
                            <option value="active">نشط</option>
                            <option value="expired">منتهي</option>
                        </select>

                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value as any)}
                            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs outline-none focus:border-blue-400"
                        >
                            <option value="all">كل الأنواع</option>
                            <option value="approval">اعتماد</option>
                            <option value="rejection">رفض</option>
                            <option value="both">اعتماد ورفض</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* ===== TABLE ===== */}
            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="h-32 sm:h-40 flex items-center justify-center text-slate-500 text-xs sm:text-sm">
                        <FontAwesomeIcon icon={faSpinner} spin className="ml-2" />
                        جاري تحميل التفويضات...
                    </div>
                ) : filteredDelegations.length === 0 ? (
                    <div className="h-32 sm:h-40 flex flex-col items-center justify-center text-slate-400 gap-1.5 sm:gap-2">
                        <FontAwesomeIcon icon={faUsers} className="text-2xl sm:text-3xl" />
                        <p className="text-xs sm:text-sm">لا توجد تفويضات</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-xs sm:text-sm">
                            <thead>
                                <tr className="bg-blue-50 text-slate-700">
                                    <th className="p-2 sm:p-3 font-semibold whitespace-nowrap">المفوض إليه</th>
                                    <th className="p-2 sm:p-3 font-semibold whitespace-nowrap hidden sm:table-cell">العميد</th>
                                    <th className="p-2 sm:p-3 font-semibold whitespace-nowrap">النوع</th>
                                    <th className="p-2 sm:p-3 font-semibold whitespace-nowrap hidden md:table-cell">الفترة</th>
                                    <th className="p-2 sm:p-3 font-semibold whitespace-nowrap">الحالة</th>
                                    <th className="p-2 sm:p-3 font-semibold whitespace-nowrap">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredDelegations.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="border-t border-slate-100 hover:bg-slate-50 transition"
                                    >
                                        <td className="p-2 sm:p-3 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-[10px] sm:text-xs">
                                                    {item.delegateUserName?.charAt(0) || "?"}
                                                </div>
                                                <span className="font-semibold text-slate-800 text-xs sm:text-sm truncate max-w-[80px] sm:max-w-[120px]" title={item.delegateUserName}>
                                                    {item.delegateUserName}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="p-2 sm:p-3 text-slate-600 text-[10px] sm:text-xs hidden sm:table-cell truncate max-w-[100px]" title={item.deanName}>
                                            {item.deanName || "—"}
                                        </td>

                                        <td className="p-2 sm:p-3 whitespace-nowrap">
                                            <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-medium ${getTypeColor(item.type)}`}>
                                                {getTypeLabel(item.type)}
                                            </span>
                                        </td>

                                        <td className="p-2 sm:p-3 text-[10px] sm:text-xs text-slate-500 hidden md:table-cell whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span>من: {formatDate(item.startDate)}</span>
                                                <span>إلى: {formatDate(item.endDate)}</span>
                                            </div>
                                        </td>

                                        <td className="p-2 sm:p-3 whitespace-nowrap">
                                            {item.isActive ? (
                                                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] whitespace-nowrap">
                                                    <FontAwesomeIcon icon={faCheckCircle} className="text-[6px] sm:text-[7px]" />
                                                    نشط
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] whitespace-nowrap">
                                                    <FontAwesomeIcon icon={faBan} className="text-[6px] sm:text-[7px]" />
                                                    منتهي
                                                </span>
                                            )}
                                        </td>

                                        <td className="p-2 sm:p-3 whitespace-nowrap">
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => {
                                                        setSelectedDelegation(item);
                                                        setShowDetails(true);
                                                    }}
                                                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-100 text-blue-600 hover:bg-blue-200 transition flex items-center justify-center"
                                                    title="تفاصيل"
                                                >
                                                    <FontAwesomeIcon icon={faEye} className="text-[10px] sm:text-sm" />
                                                </button>
                                                {/* زر الإلغاء */}
            <button
                onClick={() => handleRevokeClick(item.id)}
                className="w-8 h-8 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition flex items-center justify-center"
            >
                <FontAwesomeIcon icon={faTrash} className="text-sm" />
            </button>

            {/* ===== مودال التأكيد ===== */}
            <ConfirmationModal
                isOpen={revokeModalOpen}
                onClose={() => {
                    setRevokeModalOpen(false);
                    setRevokeTargetId(null);
                }}
                onConfirm={confirmRevoke}
                title="إلغاء التفويض"
                message="هل أنت متأكد من إلغاء هذا التفويض؟."
                confirmText="نعم، ألغِ"
                cancelText="إلغاء"
                variant="warning"
                icon={faBan}
            />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ===== DETAILS MODAL ===== */}
            {showDetails && selectedDelegation && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-4 sm:p-6 shadow-xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-base sm:text-lg font-bold text-slate-800">تفاصيل التفويض</h2>
                            <button
                                onClick={() => setShowDetails(false)}
                                className="text-slate-400 hover:text-red-500"
                            >
                                <FontAwesomeIcon icon={faXmark} className="text-lg" />
                            </button>
                        </div>

                        <div className="space-y-3 text-sm">
                            <div>
                                <p className="text-xs text-slate-500">المفوض إليه</p>
                                <p className="font-semibold text-slate-800">{selectedDelegation.delegateUserName}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">العميد</p>
                                <p className="font-semibold text-slate-800">{selectedDelegation.deanName || "—"}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-xs text-slate-500">تاريخ البداية</p>
                                    <p className="font-medium">{formatDate(selectedDelegation.startDate)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">تاريخ النهاية</p>
                                    <p className="font-medium">{formatDate(selectedDelegation.endDate)}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">النوع</p>
                                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${getTypeColor(selectedDelegation.type)}`}>
                                    {getTypeLabel(selectedDelegation.type)}
                                </span>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">الحالة</p>
                                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${selectedDelegation.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                                    {selectedDelegation.isActive ? "نشط" : "منتهي"}
                                </span>
                            </div>
                            {selectedDelegation.notes && (
                                <div>
                                    <p className="text-xs text-slate-500">الملاحظات</p>
                                    <p className="text-slate-700 bg-slate-50 p-2 rounded-lg">{selectedDelegation.notes}</p>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => setShowDetails(false)}
                            className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-xl font-medium transition text-sm"
                        >
                            إغلاق
                        </button>
                    </div>
                </div>
            )}

            {/* ===== CREATE MODAL ===== */}
            {showCreate && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-4 sm:p-6 shadow-xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-base sm:text-lg font-bold text-slate-800">إنشاء تفويض جديد</h2>
                            <button
                                onClick={() => { setShowCreate(false); resetForm(); }}
                                className="text-slate-400 hover:text-red-500"
                            >
                                <FontAwesomeIcon icon={faXmark} className="text-lg" />
                            </button>
                        </div>

                        <div className="space-y-3.5">
                            {/* المستخدم المفوض إليه */}
                            <div>
                                <label className="text-xs font-medium text-slate-600">المستخدم المفوض إليه *</label>
                                <select
                                    value={delegateUserId}
                                    onChange={(e) => setDelegateUserId(e.target.value)}
                                    className="w-full mt-1 border border-slate-200 rounded-xl p-2.5 text-sm outline-none focus:border-blue-400"
                                >
                                    <option value="">اختر المستخدم...</option>
                                    {users.map((user) => (
                                        <option value={user.id} key={user.id}>
                                            {user.fullName} ({user.email})
                                        </option>
                                    ))}
                                </select>
                                <p className="text-[10px] text-slate-400 mt-0.5">
                                    عرض {users.length} من الموظفين النشطين
                                </p>
                            </div>

                            {/* نوع التفويض */}
                            <div>
                                <label className="text-xs font-medium text-slate-600">نوع التفويض</label>
                                <div className="grid grid-cols-3 gap-1.5 mt-1">
                                    {[
                                        { value: "Approval" as DelegationTypeString, label: "اعتماد" },
                                        { value: "Rejection" as DelegationTypeString, label: "رفض" },
                                        { value: "Both" as DelegationTypeString, label: "اعتماد ورفض" },
                                    ].map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => setType(option.value)}
                                            className={`py-1.5 rounded-xl text-[10px] sm:text-xs font-medium transition ${
                                                type === option.value
                                                    ? "bg-blue-500 text-white"
                                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                            }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* تاريخ النهاية */}
                            <div>
                                <label className="text-xs font-medium text-slate-600">تاريخ النهاية (اختياري)</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full mt-1 border border-slate-200 rounded-xl p-2.5 text-sm outline-none focus:border-blue-400"
                                />
                                <p className="text-[10px] text-slate-400 mt-0.5">اتركه فارغاً للتفويض الدائم</p>
                            </div>

                            {/* الملاحظات */}
                            <div>
                                <label className="text-xs font-medium text-slate-600">الملاحظات</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={2}
                                    className="w-full mt-1 border border-slate-200 rounded-xl p-2.5 text-sm outline-none focus:border-blue-400 resize-none"
                                    placeholder="أضف ملاحظات (اختياري)..."
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={() => { setShowCreate(false); resetForm(); }}
                                className="flex-1 border border-slate-200 py-2 rounded-xl text-sm font-medium hover:bg-slate-50 transition"
                            >
                                إلغاء
                            </button>
                            <button
                                disabled={submitting || !delegateUserId}
                                onClick={createDelegation}
                                className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-slate-900 py-2 rounded-xl font-semibold transition disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                            >
                                {submitting ? (
                                    <>
                                        <FontAwesomeIcon icon={faSpinner} spin />
                                        جاري الإنشاء...
                                    </>
                                ) : (
                                    "إنشاء"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            
        </div>
    );
}