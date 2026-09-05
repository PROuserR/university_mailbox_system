/* eslint-disable react-hooks/preserve-manual-memoization */
// app/(dashboard)/delegations/page.tsx

/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState, useRef, useLayoutEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
    faUserCog,
    faPlusCircle,
    faRefresh,
    faEdit,
    faHistory,
    faChevronLeft,
    faChevronRight,
    faList,
} from "@fortawesome/free-solid-svg-icons";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useDelegation } from "@/hooks/useDelegation";
import { PermissionGate } from "@/components/auth/PermissionGate";
import useUserInfoStore from "@/store/userInfoStore";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { Pagination } from "@/components/ui/Pagination";
import { cn } from "@/lib/utils";

// ==============================
// HELPERS 
// ==============================

function formatDate(date: string | null): string {
    if (!date) return "—";
    return new Date(date).toLocaleString("ar-EG", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
}

function formatDateTime(date: string): string {
    return new Date(date).toLocaleString("ar-EG", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
}

function getActionBadge(action: string): { color: string; label: string } {
    const actions: Record<string, { color: string; label: string }> = {
        'Create': { color: 'bg-emerald-100 text-emerald-700', label: 'إنشاء' },
        'Update': { color: 'bg-blue-100 text-blue-700', label: 'تحديث' },
        'Delete': { color: 'bg-red-100 text-red-700', label: 'حذف' },
        'View': { color: 'bg-purple-100 text-purple-700', label: 'عرض' },
        'Execute': { color: 'bg-orange-100 text-orange-700', label: 'تنفيذ' },
        'Approve': { color: 'bg-green-100 text-green-700', label: 'موافقة' },
        'Reject': { color: 'bg-red-100 text-red-700', label: 'رفض' },
    };
    return actions[action] || { color: 'bg-gray-100 text-gray-700', label: action };
}

// ==============================
// MAIN COMPONENT
// ==============================

export default function DelegationsPage() {
    const { isLoading: isAuthLoading } = useAuthGuard({
        requiredPermissions: ['ViewDelegations'],
        redirectTo: '/auth/login',
        unauthorizedPath: '/unauthorized'
    });

    const { id: currentUserId } = useUserInfoStore();

    const {
        allDelegations,
        statistics,
        isLoading,
        canManageDelegations,
        isAdmin,
        isDean,
        employees,
        deans,
        headOfDepartments,
        allUsers,
        revokeDelegation,
        loadAllData,
        revokeExpiredDelegations,
        addDefaultDelegations,
        resetDefaultDelegations,
        createDelegation,
        updateDelegation,
        availablePermissions,
        loadAvailablePermissions,
        getAvailablePermissionsForUser,
        useDelegationUsage,
        isCreating,
        isUpdating,
        isRevoking,
    } = useDelegation();

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);

    const [search, setSearch] = useState("");
    const [showDetails, setShowDetails] = useState(false);
    const [selectedDelegation, setSelectedDelegation] = useState<any | null>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // ✅ States لعرض الاستخدامات
    const [showUsage, setShowUsage] = useState(false);
    const [usageDelegation, setUsageDelegation] = useState<any | null>(null);
    const [usagePage, setUsagePage] = useState(1);
    const [usagePageSize, setUsagePageSize] = useState(10);

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const savedScrollTop = useRef<number>(0);

    // Modal states for confirmation
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        variant?: "danger" | "warning" | "success";
        icon?: any;
    }>({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: () => {},
        variant: "danger",
    });

    // Form states
    const [delegateUserId, setDelegateUserId] = useState<number | undefined>();
    const [endDate, setEndDate] = useState("");
    const [notes, setNotes] = useState("");
    const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([]);

    // ==============================
    // USAGE QUERY
    // ==============================

    const usageQuery = useDelegationUsage(
        usageDelegation?.id || null,
        usagePage,
        usagePageSize
    );

    const usageData = usageQuery.data;
    const usageItems = usageData?.items || [];
    const usageTotalCount = usageData?.totalCount || 0;
    const usageTotalPages = usageData?.totalPages || 0;

    // ==============================
    // STATISTICS
    // ==============================
    const stats = useMemo(() => {
        const delegations = allDelegations || [];
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
    }, [allDelegations]);

    // ==============================
    // FILTER
    // ==============================
    const filteredDelegations = useMemo(() => {
        const sourceDelegations = allDelegations;
        
        if (!sourceDelegations || sourceDelegations.length === 0) {
            return [];
        }
        
        return sourceDelegations.filter(item => {
            const searchValue = search.toLowerCase();
            const matchesSearch =
                item.delegateUserName?.toLowerCase().includes(searchValue) ||
                item.delegatorName?.toLowerCase().includes(searchValue);

            return matchesSearch;
        });
    }, [allDelegations, search]);

    const paginatedDelegations = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return filteredDelegations.slice(startIndex, endIndex);
    }, [filteredDelegations, currentPage, pageSize]);

    const totalPages = Math.ceil(filteredDelegations.length / pageSize);

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setCurrentPage(1);
    };

    // ==============================
    // HANDLERS
    // ==============================

    const handleRevokeClick = (id: number, delegateUserId: number) => {
        if (delegateUserId === currentUserId) {
            toast.error("لا يمكنك إلغاء تفويضك الخاص");
            return;
        }

        setConfirmModal({
            isOpen: true,
            title: "إلغاء التفويض",
            message: "هل أنت متأكد من إلغاء هذا التفويض؟",
            onConfirm: () => confirmRevoke(id),
            variant: "danger",
            icon: faBan,
        });
    };

    const confirmRevoke = async (id: number) => {
        try {
            await revokeDelegation(id);
            // ✅ البيانات ستتحدث تلقائياً عن طريق React Query
        } catch (error: any) {
            toast.error(error?.message || "فشل إلغاء التفويض");
        }
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
    };

    const resetForm = () => {
        setDelegateUserId(undefined);
        setEndDate("");
        setNotes("");
        setSelectedPermissionIds([]);
    };

    const handleEditClick = (delegation: any) => {
        if (!delegation.isActive) {
            toast.error("لا يمكن تعديل تفويض منتهي");
            return;
        }

        if (delegation.delegateUserId === currentUserId) {
            toast.error("لا يمكنك تعديل تفويضك الخاص");
            return;
        }

        if (isDean) {
            const targetUser = allUsers.find(u => u.id === delegation.delegateUserId);
            if (targetUser?.roles?.includes('Dean')) {
                toast.error("لا يمكن للعميد تعديل تفويض عميد آخر");
                return;
            }
        }

        setSelectedDelegation(delegation);
        setDelegateUserId(delegation.delegateUserId);
        setEndDate(delegation.endDate || "");
        setNotes(delegation.notes || "");
        setSelectedPermissionIds(delegation.permissions?.map((p: any) => p.id) || []);
        setShowEdit(true);
        loadAvailablePermissions();
    };

    const handleUpdateDelegation = async () => {
        if (!selectedDelegation) return;

        if (selectedPermissionIds.length === 0) {
            toast.error("يرجى اختيار صلاحية واحدة على الأقل");
            return;
        }

        setSubmitting(true);
        try {
            await updateDelegation(selectedDelegation.id, {
                endDate: endDate || undefined,
                notes: notes || undefined,
                permissionIds: selectedPermissionIds,
            });
            // ✅ البيانات ستتحدث تلقائياً عن طريق React Query
            setShowEdit(false);
            resetForm();
        } catch (error: any) {
            toast.error(error?.message || "فشل تحديث التفويض");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCreateDelegation = async () => {
        if (!delegateUserId) {
            toast.error("يرجى اختيار المستخدم");
            return;
        }

        if (selectedPermissionIds.length === 0) {
            toast.error("يرجى اختيار صلاحية واحدة على الأقل");
            return;
        }

        setSubmitting(true);
        try {
            await createDelegation({
                delegateUserId: Number(delegateUserId),
                endDate: endDate || undefined,
                notes: notes || undefined,
                permissionIds: selectedPermissionIds,
            });
            // ✅ البيانات ستتحدث تلقائياً عن طريق React Query
            setShowCreate(false);
            resetForm();
        } catch (error: any) {
            // الخطأ يتم معالجته في الـ Hook
        } finally {
            setSubmitting(false);
        }
    };

    const togglePermission = (id: number) => {
        if (scrollContainerRef.current) {
            savedScrollTop.current = scrollContainerRef.current.scrollTop;
        }
        
        setSelectedPermissionIds(prev =>
            prev.includes(id)
                ? prev.filter(p => p !== id)
                : [...prev, id]
        );
    };

    const selectAllPermissions = () => {
        if (scrollContainerRef.current) {
            savedScrollTop.current = scrollContainerRef.current.scrollTop;
        }
        const allIds = filteredPermissions.map(p => p.id);
        setSelectedPermissionIds(allIds);
    };

    const deselectAllPermissions = () => {
        if (scrollContainerRef.current) {
            savedScrollTop.current = scrollContainerRef.current.scrollTop;
        }
        setSelectedPermissionIds([]);
    };

    // ==============================
    // HANDLERS FOR USAGE
    // ==============================

    const handleShowUsage = (delegation: any) => {
        setUsageDelegation(delegation);
        setUsagePage(1);
        setShowUsage(true);
    };

    const handleUsagePageChange = (page: number) => {
        setUsagePage(page);
    };

    const handleUsagePageSizeChange = (size: number) => {
        setUsagePageSize(size);
        setUsagePage(1);
    };

    // ==============================
    // EFFECTS - تم التعديل ✅
    // ==============================

    // ❌ تم إزالة useEffect الذي كان يستدعي loadAllData()
    // ✅ الآن البيانات تتحمّل تلقائياً عن طريق React Query
    
    // ✅ فقط نقوم بتحميل الصلاحيات عند فتح المودال
    useEffect(() => {
        if (showCreate || showEdit) {
            loadAvailablePermissions();
        }
    }, [showCreate, showEdit]);

    // ✅ الحفاظ على موضع التمرير
    useLayoutEffect(() => {
        if (!showCreate && !showEdit) return;
        
        const container = scrollContainerRef.current;
        if (!container) return;

        container.scrollTop = savedScrollTop.current;
    }, [selectedPermissionIds, showCreate, showEdit]);

    // ==============================
    // FILTER PERMISSIONS
    // ==============================

    
const filteredPermissions = useMemo(() => {
  if (!delegateUserId) {
    return availablePermissions;
  }

  const permissions = getAvailablePermissionsForUser(delegateUserId);
  
  if (!permissions || permissions.length === 0) {
    return [];
  }

  return permissions;
}, [getAvailablePermissionsForUser, delegateUserId]);


    const sortedPermissions = useMemo(() => {
        if (!filteredPermissions || filteredPermissions.length === 0) {
            return [];
        }
        
        return [...filteredPermissions].sort((a, b) => {
            const aSelected = selectedPermissionIds.includes(a.id);
            const bSelected = selectedPermissionIds.includes(b.id);
            if (aSelected && !bSelected) return -1;
            if (!aSelected && bSelected) return 1;
            return a.displayName.localeCompare(b.displayName);
        });
    }, [filteredPermissions, selectedPermissionIds]);

    // ==============================
    // RENDER
    // ==============================

    if (isAuthLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    const delegations = paginatedDelegations;

    return (
        <div dir="rtl" className="min-h-screen bg-slate-50 p-3 sm:p-4">
            {/* ===== HEADER ===== */}
            <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-3 sm:p-4 mb-3 sm:mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-base sm:text-lg flex-shrink-0">
                        <FontAwesomeIcon icon={faUserCog} />
                    </div>
                    <div>
                        <h1 className="text-base sm:text-lg font-bold text-slate-800">إدارة التفويضات</h1>
                        <p className="text-[11px] sm:text-xs text-slate-500">إدارة صلاحيات المستخدمين والوصول المؤقت</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <PermissionGate permissions={['CreateDelegation']}>
                        <button
                            onClick={() => {
                                setConfirmModal({
                                    isOpen: true,
                                    title: "إضافة التفويضات الافتراضية",
                                    message: "هل أنت متأكد من إضافة التفويضات الافتراضية لجميع المستخدمين؟",
                                    onConfirm: async () => {
                                        await addDefaultDelegations();
                                        // ✅ البيانات ستتحدث تلقائياً
                                        setConfirmModal(prev => ({ ...prev, isOpen: false }));
                                    },
                                    variant: "success",
                                    icon: faPlusCircle,
                                });
                            }}
                            disabled={isLoading}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-50 flex items-center gap-1.5"
                        >
                            <FontAwesomeIcon icon={faPlusCircle} />
                            إضافة افتراضية
                        </button>
                    </PermissionGate>

                    {isAdmin && (
                        <PermissionGate permissions={['CreateDelegation']}>
                            <button
                                onClick={() => {
                                    setConfirmModal({
                                        isOpen: true,
                                        title: "إعادة تعيين التفويضات الافتراضية",
                                        message: "هل أنت متأكد من إعادة تعيين التفويضات الافتراضية لجميع المستخدمين؟",
                                        onConfirm: async () => {
                                            await resetDefaultDelegations();
                                            // ✅ البيانات ستتحدث تلقائياً
                                            setConfirmModal(prev => ({ ...prev, isOpen: false }));
                                        },
                                        variant: "warning",
                                        icon: faRefresh,
                                    });
                                }}
                                disabled={isLoading}
                                className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-50 flex items-center gap-1.5"
                            >
                                <FontAwesomeIcon icon={faRefresh} />
                                إعادة تعيين
                            </button>
                        </PermissionGate>
                    )}

                    <PermissionGate permissions={['RevokeDelegation']}>
                        <button
                            onClick={() => {
                                setConfirmModal({
                                    isOpen: true,
                                    title: "إلغاء التفويضات المنتهية",
                                    message: "هل أنت متأكد من إلغاء جميع التفويضات المنتهية؟",
                                    onConfirm: async () => {
                                        await revokeExpiredDelegations();
                                        // ✅ البيانات ستتحدث تلقائياً
                                        setConfirmModal(prev => ({ ...prev, isOpen: false }));
                                    },
                                    variant: "danger",
                                    icon: faTrash,
                                });
                            }}
                            disabled={isLoading}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-50 flex items-center gap-1.5"
                        >
                            <FontAwesomeIcon icon={faTrash} />
                            إلغاء المنتهية
                        </button>
                    </PermissionGate>

                    <button
                        onClick={() => loadAllData()}
                        disabled={isLoading}
                        className="bg-white border border-blue-200 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-slate-50 transition disabled:opacity-50 flex items-center gap-1.5"
                    >
                        <FontAwesomeIcon icon={faRotate} className={isLoading ? "animate-spin" : ""} />
                        تحديث
                    </button>

                    <PermissionGate permissions={['CreateDelegation']}>
                        <button
                            onClick={() => {
                                setShowCreate(true);
                                loadAvailablePermissions();
                            }}
                            className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition text-xs"
                        >
                            <FontAwesomeIcon icon={faPlus} />
                            تفويض جديد
                        </button>
                    </PermissionGate>
                </div>
            </div>

            {/* ===== STATS ===== */}
            {(statistics || stats) && canManageDelegations && (
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-3 sm:mb-4 text-xs sm:text-sm bg-white rounded-2xl border border-blue-100 p-2.5 sm:p-3 shadow-sm">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="text-slate-400 text-[10px] sm:text-xs">📊</span>
                        <span className="text-slate-600 text-[11px] sm:text-xs">الإحصائيات:</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
                        <span className="text-slate-500">الإجمالي:</span>
                        <span className="font-semibold text-slate-800">{stats.total}</span>
                    </div>
                    <div className="w-px h-3 sm:h-4 bg-slate-200" />
                    <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
                        <span className="text-emerald-500 text-[8px] sm:text-[10px]">●</span>
                        <span className="text-slate-500">نشط:</span>
                        <span className="font-semibold text-emerald-600">{stats.active}</span>
                    </div>
                    <div className="w-px h-3 sm:h-4 bg-slate-200" />
                    <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
                        <span className="text-yellow-500 text-[8px] sm:text-[10px]">●</span>
                        <span className="text-slate-500">ينتهي قريباً:</span>
                        <span className="font-semibold text-yellow-600">{stats.endingSoon}</span>
                    </div>
                    <div className="w-px h-3 sm:h-4 bg-slate-200" />
                    <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
                        <span className="text-red-500 text-[8px] sm:text-[10px]">●</span>
                        <span className="text-slate-500">منتهي:</span>
                        <span className="font-semibold text-red-500">{stats.expired}</span>
                    </div>
                </div>
            )}

            {/* ===== SEARCH ===== */}
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
                            placeholder="البحث عن المفوض إليه أو العميد..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 sm:py-2 pr-8 sm:pr-10 pl-3 text-xs sm:text-sm outline-none focus:border-blue-400"
                        />
                    </div>
                </div>
            </div>

            {/* ===== TABLE ===== */}
            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
                {delegations.length === 0 ? (
                    <div className="h-32 sm:h-40 flex flex-col items-center justify-center text-slate-400 gap-1.5 sm:gap-2">
                        <FontAwesomeIcon icon={faUsers} className="text-2xl sm:text-3xl" />
                        <p className="text-xs sm:text-sm">
                            لا توجد تفويضات
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-right text-xs sm:text-sm">
                                <thead>
                                    <tr className="bg-blue-50 text-slate-700">
                                        <th className="p-2 sm:p-3 font-semibold whitespace-nowrap">المفوض إليه</th>
                                        <th className="p-2 sm:p-3 font-semibold whitespace-nowrap hidden sm:table-cell">المفوض</th>
                                        <th className="p-2 sm:p-3 font-semibold whitespace-nowrap">الصلاحيات</th>
                                        <th className="p-2 sm:p-3 font-semibold whitespace-nowrap hidden md:table-cell">الفترة</th>
                                        <th className="p-2 sm:p-3 font-semibold whitespace-nowrap">الحالة</th>
                                        <th className="p-2 sm:p-3 font-semibold whitespace-nowrap">الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {delegations.map((item) => (
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

                                            <td className="p-2 sm:p-3 text-slate-600 text-[10px] sm:text-xs hidden sm:table-cell truncate max-w-[100px]" title={item.delegatorName}>
                                                {item.delegatorName || "—"}
                                            </td>

                                            <td className="p-2 sm:p-3">
                                                <div className="flex flex-wrap gap-1">
                                                    {item.permissions?.slice(0, 2).map((p: any) => (
                                                        <span key={p.id} className="text-[8px] sm:text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full">
                                                            {p.displayName}
                                                        </span>
                                                    ))}
                                                    {item.permissions?.length > 2 && (
                                                        <span className="text-[8px] sm:text-[10px] text-slate-400">
                                                            +{item.permissions.length - 2}
                                                        </span>
                                                    )}
                                                </div>
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
                                                <div className="flex gap-1.5">
                                                    {/* ✅ زر عرض الاستخدامات */}
                                                    <button
                                                        onClick={() => handleShowUsage(item)}
                                                        className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 hover:bg-purple-200 transition flex items-center justify-center"
                                                        title="سجل الاستخدامات"
                                                    >
                                                        <FontAwesomeIcon icon={faHistory} className="text-sm" />
                                                    </button>

                                                    <button
                                                        onClick={() => {
                                                            setSelectedDelegation(item);
                                                            setShowDetails(true);
                                                        }}
                                                        className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 hover:bg-blue-200 transition flex items-center justify-center"
                                                        title="تفاصيل"
                                                    >
                                                        <FontAwesomeIcon icon={faEye} className="text-sm" />
                                                    </button>

                                                    <PermissionGate permissions={['UpdateDelegation']}>
                                                        <button
                                                            onClick={() => handleEditClick(item)}
                                                            disabled={!item.isActive || item.delegateUserId === currentUserId || (isDean && allUsers.find(u => u.id === item.delegateUserId)?.roles?.includes('Dean'))}
                                                            className={cn(
                                                                "w-8 h-8 rounded-xl transition flex items-center justify-center",
                                                                !item.isActive || item.delegateUserId === currentUserId
                                                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                                    : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                                                            )}
                                                            title={item.delegateUserId === currentUserId ? "لا يمكن تعديل تفويضك الخاص" : "تعديل"}
                                                        >
                                                            <FontAwesomeIcon icon={faEdit} className="text-sm" />
                                                        </button>
                                                    </PermissionGate>

                                                    <PermissionGate permissions={['RevokeDelegation']}>
                                                        <button
                                                            onClick={() => handleRevokeClick(item.id, item.delegateUserId)}
                                                            disabled={!item.isActive || item.delegateUserId === currentUserId}
                                                            className={cn(
                                                                "w-8 h-8 rounded-xl transition flex items-center justify-center",
                                                                !item.isActive || item.delegateUserId === currentUserId
                                                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                                    : "bg-red-100 text-red-600 hover:bg-red-200"
                                                            )}
                                                            title={item.delegateUserId === currentUserId ? "لا يمكن إلغاء تفويضك الخاص" : "إلغاء"}
                                                        >
                                                            <FontAwesomeIcon icon={faTrash} className="text-sm" />
                                                        </button>
                                                    </PermissionGate>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* ===== PAGINATION ===== */}
                        {filteredDelegations.length > pageSize && (
                            <div className="border-t border-slate-100 p-3">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                    pageSize={pageSize}
                                    totalCount={filteredDelegations.length}
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

            {/* ===== DETAILS MODAL ===== */}
            {showDetails && selectedDelegation && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-4 sm:p-6 shadow-xl max-h-[90vh] overflow-y-auto ">
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
                                <p className="font-semibold text-slate-800">{selectedDelegation.delegatorName || "—"}</p>
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
                                <p className="text-xs text-slate-500">الصلاحيات</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {selectedDelegation.permissions?.map((p: any) => (
                                        <span key={p.id} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                                            {p.displayName}
                                        </span>
                                    ))}
                                </div>
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

            {/* ===== CONFIRMATION MODAL ===== */}
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText="تأكيد"
                cancelText="إلغاء"
                variant={confirmModal.variant || "danger"}
                icon={confirmModal.icon}
            />

            {/* ================================================================ */}
            {/* ✅ MODAL: عرض سجل الاستخدامات */}
            {/* ================================================================ */}
            {showUsage && usageDelegation && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-3xl p-4 sm:p-6 shadow-xl max-h-[90vh] flex flex-col">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h2 className="text-base sm:text-lg font-bold text-slate-800">
                                    سجل الاستخدامات
                                </h2>
                                <p className="text-xs text-slate-500">
                                    التفويض: {usageDelegation.delegateUserName} - {usageDelegation.delegatorName}
                                </p>
                            </div>
                            <button
                                onClick={() => { setShowUsage(false); setUsageDelegation(null); }}
                                className="text-slate-400 hover:text-red-500"
                            >
                                <FontAwesomeIcon icon={faXmark} className="text-lg" />
                            </button>
                        </div>

                        {/* Loading */}
                        {usageQuery.isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <FontAwesomeIcon icon={faSpinner} spin className="text-2xl text-blue-500" />
                            </div>
                        ) : usageItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                                <FontAwesomeIcon icon={faList} className="text-3xl mb-2" />
                                <p className="text-sm">لا توجد استخدامات لهذا التفويض</p>
                            </div>
                        ) : (
                            <>
                                {/* Table */}
                                <div className="overflow-y-auto flex-1">
                                    <table className="w-full text-right text-xs sm:text-sm">
                                        <thead className="sticky top-0 bg-blue-50">
                                            <tr className="text-slate-700">
                                                <th className="p-2 font-semibold whitespace-nowrap">المستخدم</th>
                                                <th className="p-2 font-semibold whitespace-nowrap">الصلاحية</th>
                                                <th className="p-2 font-semibold whitespace-nowrap">الإجراء</th>
                                                <th className="p-2 font-semibold whitespace-nowrap hidden sm:table-cell">الوقت</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {usageItems.map((usage: any) => {
                                                const badge = getActionBadge(usage.action);
                                                return (
                                                    <tr key={usage.id} className="border-t border-slate-100 hover:bg-slate-50">
                                                        <td className="p-2 whitespace-nowrap font-medium text-slate-700">
                                                            {usage.userName}
                                                        </td>
                                                        <td className="p-2 whitespace-nowrap">
                                                            <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                                                                {usage.permissionName}
                                                            </span>
                                                        </td>
                                                        <td className="p-2 whitespace-nowrap">
                                                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${badge.color}`}>
                                                                {badge.label}
                                                            </span>
                                                        </td>
                                                        <td className="p-2 whitespace-nowrap text-slate-500 text-[10px] hidden sm:table-cell">
                                                            {formatDateTime(usage.usedAt)}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination for Usage */}
                                {usageTotalCount > usagePageSize && (
                                    <div className="border-t border-slate-100 pt-3 mt-3">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="text-[10px] text-slate-500">
                                                إجمالي: {usageTotalCount} استخدام
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleUsagePageChange(usagePage - 1)}
                                                    disabled={!usageData?.hasPreviousPage}
                                                    className={cn(
                                                        "px-2 py-1 rounded text-xs transition",
                                                        usageData?.hasPreviousPage
                                                            ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                                                            : "bg-slate-50 text-slate-300 cursor-not-allowed"
                                                    )}
                                                >
                                                    <FontAwesomeIcon icon={faChevronRight} />
                                                </button>
                                                <span className="text-xs text-slate-600">
                                                    صفحة {usagePage} من {usageTotalPages || 1}
                                                </span>
                                                <button
                                                    onClick={() => handleUsagePageChange(usagePage + 1)}
                                                    disabled={!usageData?.hasNextPage}
                                                    className={cn(
                                                        "px-2 py-1 rounded text-xs transition",
                                                        usageData?.hasNextPage
                                                            ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                                                            : "bg-slate-50 text-slate-300 cursor-not-allowed"
                                                    )}
                                                >
                                                    <FontAwesomeIcon icon={faChevronLeft} />
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <select
                                                    value={usagePageSize}
                                                    onChange={(e) => handleUsagePageSizeChange(Number(e.target.value))}
                                                    className="text-xs border border-slate-200 rounded px-2 py-1 outline-none"
                                                >
                                                    <option value={5}>5</option>
                                                    <option value={10}>10</option>
                                                    <option value={20}>20</option>
                                                    <option value={50}>50</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* ===== CREATE MODAL ===== */}
            {showCreate && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-4 sm:p-6 shadow-xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-base sm:text-lg font-bold text-slate-800">إنشاء تفويض جديد</h2>
                            <button
                                onClick={() => { setShowCreate(false); resetForm(); }}
                                className="text-slate-400 hover:text-red-500"
                            >
                                <FontAwesomeIcon icon={faXmark} className="text-lg" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-slate-600">المستخدم المفوض إليه *</label>
                                <select
                                    value={delegateUserId}
                                    onChange={(e) => {
                                        setDelegateUserId(Number(e.target.value));
                                        setSelectedPermissionIds([]);
                                    }}
                                    className="w-full mt-1 border border-slate-200 rounded-xl p-2.5 text-sm outline-none focus:border-blue-400"
                                >
                                    <option value="">اختر المستخدم...</option>
                                    
                                    {/* العمداء */}
                                    {isAdmin && deans.length > 0 && (
                                        <optgroup label="العمداء">
                                            {deans.map((user) => (
                                                <option value={user.id} key={user.id}>
                                                    {user.fullName} ({user.email}) - عميد
                                                </option>
                                            ))}
                                        </optgroup>
                                    )}
                                    
                                    {/* رؤساء الأقسام */}
                                    {headOfDepartments.length > 0 && (
                                        <optgroup label="رؤساء الأقسام">
                                            {headOfDepartments.map((user) => (
                                                <option value={user.id} key={user.id}>
                                                    {user.fullName} ({user.email}) - رئيس قسم
                                                </option>
                                            ))}
                                        </optgroup>
                                    )}
                                    
                                    {/* الموظفين */}
                                    {employees.length > 0 && (
                                        <optgroup label="الموظفين">
                                            {employees.map((user) => (
                                                <option value={user.id} key={user.id}>
                                                    {user.fullName} ({user.email})
                                                </option>
                                            ))}
                                        </optgroup>
                                    )}
                                </select>
                                <p className="text-[10px] text-slate-400 mt-0.5">
                                    عرض {allUsers.length} من المستخدمين النشطين
                                    {isAdmin && ' (العمداء + رؤساء الأقسام + الموظفين)'}
                                    {isDean && ' (رؤساء الأقسام + الموظفين)'}
                                </p>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-slate-600">الصلاحيات *</label>
                                <div 
                                    ref={scrollContainerRef}
                                    className="mt-1 grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto border border-slate-200 rounded-xl p-2"
                                >
                                    {sortedPermissions.length === 0 ? (
                                        <p className="text-xs text-slate-400 col-span-2 text-center py-2">
                                            {isLoading ? 'جاري التحميل...' : 
                                            delegateUserId ? 'لا توجد صلاحيات متاحة لهذا المستخدم' : 'يرجى اختيار المستخدم أولاً'}
                                        </p>
                                    ) : (
                                        sortedPermissions.map((p) => (
                                            <label
                                                key={p.id}
                                                className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition text-xs ${
                                                    selectedPermissionIds.includes(p.id)
                                                        ? 'bg-blue-50 border border-blue-200'
                                                        : 'hover:bg-slate-50 border border-transparent'
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedPermissionIds.includes(p.id)}
                                                    onChange={() => togglePermission(p.id)}
                                                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-slate-700">{p.displayName}</span>
                                            </label>
                                        ))
                                    )}
                                </div>
                                <div className="flex gap-2 mt-2">
                                    <button
                                        type="button"
                                        onClick={selectAllPermissions}
                                        className="text-xs text-blue-600 hover:text-blue-800"
                                    >
                                        اختيار الكل
                                    </button>
                                    <span className="text-gray-300">|</span>
                                    <button
                                        type="button"
                                        onClick={deselectAllPermissions}
                                        className="text-xs text-red-500 hover:text-red-700"
                                    >
                                        إلغاء الكل
                                    </button>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-1">
                                    اختر {selectedPermissionIds.length} صلاحية
                                </p>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-slate-600">تاريخ النهاية (اختياري)</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full mt-1 border border-slate-200 rounded-xl p-2.5 text-sm outline-none focus:border-blue-400"
                                />
                            </div>

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
                                disabled={submitting || isCreating || !delegateUserId || selectedPermissionIds.length === 0}
                                onClick={handleCreateDelegation}
                                className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-slate-900 py-2 rounded-xl font-semibold transition disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                            >
                                {submitting || isCreating ? (
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

            {/* ===== EDIT MODAL ===== */}
            {showEdit && selectedDelegation && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-4 sm:p-6 shadow-xl max-h-[90vh] overflow-y-auto hide-scrollbar">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-base sm:text-lg font-bold text-slate-800">
                                تعديل تفويض: {selectedDelegation.delegateUserName}
                            </h2>
                            <button
                                onClick={() => { setShowEdit(false); resetForm(); }}
                                className="text-slate-400 hover:text-red-500"
                            >
                                <FontAwesomeIcon icon={faXmark} className="text-lg" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-slate-600">المستخدم المفوض إليه</label>
                                <div className="w-full mt-1 border border-slate-200 rounded-xl p-2.5 text-sm bg-slate-50 text-slate-700">
                                    {allUsers.find(u => u.id === Number(delegateUserId))?.fullName || "غير محدد"}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-slate-600">الصلاحيات *</label>
                                <div 
                                    ref={scrollContainerRef}
                                    className="mt-1 grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto border border-slate-200 rounded-xl p-2"
                                >
                                    {sortedPermissions.length === 0 ? (
                                        <p className="text-xs text-slate-400 col-span-2 text-center py-2">
                                            {isLoading ? 'جاري التحميل...' : 'لا توجد صلاحيات متاحة'}
                                        </p>
                                    ) : (
                                        sortedPermissions.map((p) => (
                                            <label
                                                key={p.id}
                                                className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition text-xs ${
                                                    selectedPermissionIds.includes(p.id)
                                                        ? 'bg-blue-50 border border-blue-200'
                                                        : 'hover:bg-slate-50 border border-transparent'
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedPermissionIds.includes(p.id)}
                                                    onChange={() => togglePermission(p.id)}
                                                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-slate-700">{p.displayName}</span>
                                            </label>
                                        ))
                                    )}
                                </div>
                                <div className="flex gap-2 mt-2">
                                    <button
                                        type="button"
                                        onClick={selectAllPermissions}
                                        className="text-xs text-blue-600 hover:text-blue-800"
                                    >
                                        اختيار الكل
                                    </button>
                                    <span className="text-gray-300">|</span>
                                    <button
                                        type="button"
                                        onClick={deselectAllPermissions}
                                        className="text-xs text-red-500 hover:text-red-700"
                                    >
                                        إلغاء الكل
                                    </button>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-1">
                                    اختر {selectedPermissionIds.length} صلاحية
                                </p>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-slate-600">تاريخ النهاية</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full mt-1 border border-slate-200 rounded-xl p-2.5 text-sm outline-none focus:border-blue-400"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-medium text-slate-600">الملاحظات</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={2}
                                    className="w-full mt-1 border border-slate-200 rounded-xl p-2.5 text-sm outline-none focus:border-blue-400 resize-none"
                                    placeholder="أضف ملاحظات..."
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={() => { setShowEdit(false); resetForm(); }}
                                className="flex-1 border border-slate-200 py-2 rounded-xl text-sm font-medium hover:bg-slate-50 transition"
                            >
                                إلغاء
                            </button>
                            <button
                                disabled={submitting || isUpdating}
                                onClick={handleUpdateDelegation}
                                className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-slate-900 py-2 rounded-xl font-semibold transition disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                            >
                                {submitting || isUpdating ? (
                                    <>
                                        <FontAwesomeIcon icon={faSpinner} spin />
                                        جاري الحفظ...
                                    </>
                                ) : (
                                    "حفظ التغييرات"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}