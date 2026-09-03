/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(dashboard)/departments/page.tsx

"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlus,
    faEdit,
    faTrash,
    faSearch,
    faBuilding,
    faUsers,
    faUserCheck,
    faUserPlus,
    faUserMinus,
    faXmark,
    faSpinner,
    faCheckCircle,
    faTimes,
    faUserCog,
    faEye,
    faUser,
    faEnvelope,
    faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { PERMISSIONS } from "@/lib/permissions";
import {
    useDepartments,
    useCreateDepartment,
    useUpdateDepartment,
    useDeleteDepartment,
    useAddDepartmentMember,
    useRemoveDepartmentMember,
    useSetDepartmentHead,
    useRemoveDepartmentHead,
    useDepartmentMembers,
    useActivateDepartment,
    useDeactivateDepartment,
} from "@/hooks/useDepartments";
import { useActiveUsers } from "@/hooks/useUsers";
import { DepartmentDto, DepartmentMemberDto } from "@/types/api/department.types";
import { UserResponse } from "@/types/api/user";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { Pagination } from "@/components/ui/Pagination";
import toast from "react-hot-toast";

// ============================================================
// ===== Validation =====
// ============================================================

interface ValidationErrors {
    name?: string;
    code?: string;
}

const validateName = (value: string): string => {
    if (!value || value.trim() === "") return "اسم القسم مطلوب";
    if (value.length > 100) return "اسم القسم لا يتجاوز 100 حرف";
    return "";
};

const validateCode = (value: string): string => {
    if (value && value.length > 20) return "الكود لا يتجاوز 20 حرف";
    return "";
};

// ============================================================
// ===== Main Component =====
// ============================================================

export default function DepartmentsPage() {
    const { isLoading: isAuthLoading, isAuthorized } = useAuthGuard({
        requiredPermissions: [PERMISSIONS.MANAGE_DEPARTMENT],
        redirectTo: '/auth/login',
        unauthorizedPath: '/unauthorized'
    });

    // ===== Queries =====
    const { data: departments = [], isLoading: loadingDepartments, refetch: refetchDepartments } = useDepartments();
    const { data: users = [], isLoading: loadingUsers, refetch: refetchUsers } = useActiveUsers();

    // ===== Pagination State =====
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);

    // ===== States =====
    const [search, setSearch] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState<DepartmentDto | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState<"create" | "edit">("create");
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [touched, setTouched] = useState<{ name: boolean; code: boolean }>({
        name: false,
        code: false,
    });
    const [viewingDepartment, setViewingDepartment] = useState<DepartmentDto | null>(null);
    const [showDepartmentDetails, setShowDepartmentDetails] = useState(false);

    // ===== Confirmation Modal States =====
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        variant?: "danger" | "warning" | "success";
        icon?: any;
        confirmText?: string;
    }>({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: () => {},
        variant: "danger",
    });

    // ===== Form States =====
    const [createForm, setCreateForm] = useState({
        name: "",
        code: "",
        headUserId: null as number | null,
    });

    const [editForm, setEditForm] = useState({
        name: "",
        code: "",
        isActive: true,
        headUserId: null as number | null,
    });

    // ===== Member Management States =====
    const [memberModalOpen, setMemberModalOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

    // ===== Members Query =====
    const { data: members = [], refetch: refetchMembers } = useDepartmentMembers(
        selectedDepartment?.id || null
    );

    // ============================================================
    // ===== Helper Functions =====
    // ============================================================

    const isUserEligibleForDepartment = (user: UserResponse): boolean => {
        if (user.roles?.includes('Admin')) return false;
        if (user.roles?.includes('Dean')) return false;
        if (user.roles?.includes('HeadOfDepartment')) return false;
        return true;
    };

    const isUserEligibleForHead = (user: UserResponse): boolean => {
        if (user.roles?.includes('Admin')) return false;
        if (user.roles?.includes('Dean')) return false;
        return true;
    };

    // ============================================================
    // ===== Modal Handlers =====
    // ============================================================

    const closeModal = useCallback(() => {
        setModalOpen(false);
        setSelectedDepartment(null);
        setErrors({});
        setTouched({ name: false, code: false });
    }, []);

    const closeMembersModal = useCallback(() => {
        setMemberModalOpen(false);
        setSelectedUserId(null);
    }, []);

    const closeDepartmentDetails = useCallback(() => {
        setShowDepartmentDetails(false);
        setViewingDepartment(null);
        setSelectedDepartment(null);
    }, []);

    // ============================================================
    // ===== Mutations =====
    // ============================================================

    const createMutation = useCreateDepartment(() => { closeModal(); refetchDepartments(); refetchUsers(); });
    const updateMutation = useUpdateDepartment(() => { closeModal(); refetchDepartments(); refetchUsers(); });
    const deleteMutation = useDeleteDepartment(() => { refetchDepartments(); refetchUsers(); });
    const addMemberMutation = useAddDepartmentMember(() => {
        refetchDepartments();
        refetchMembers();
        refetchUsers();
    });
    const removeMemberMutation = useRemoveDepartmentMember(() => {
        refetchDepartments();
        refetchMembers();
        refetchUsers();
    });
    const setHeadMutation = useSetDepartmentHead(() => {
        refetchDepartments();
        refetchMembers();
        refetchUsers();
    });
    const removeHeadMutation = useRemoveDepartmentHead(() => {
        refetchDepartments();
        refetchMembers();
        refetchUsers();
    });
    const activateMutation = useActivateDepartment(() => { refetchDepartments(); refetchUsers(); });
    const deactivateMutation = useDeactivateDepartment(() => { refetchDepartments(); refetchUsers(); });

    const isProcessing =
        createMutation.isPending ||
        updateMutation.isPending ||
        deleteMutation.isPending ||
        addMemberMutation.isPending ||
        removeMemberMutation.isPending ||
        setHeadMutation.isPending ||
        removeHeadMutation.isPending ||
        activateMutation.isPending ||
        deactivateMutation.isPending;

    // ============================================================
    // ===== Validation Handlers =====
    // ============================================================

    const validateField = (field: keyof ValidationErrors, value: string): string => {
        if (field === "name") return validateName(value);
        if (field === "code") return validateCode(value);
        return "";
    };

    const handleBlur = (field: keyof ValidationErrors) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
        const value = field === "name" ? createForm.name : createForm.code;
        const error = validateField(field, value);
        setErrors((prev) => ({ ...prev, [field]: error }));
    };

    const handleChange = (field: keyof ValidationErrors, value: string) => {
        if (field === "name") {
            setCreateForm((prev) => ({ ...prev, name: value }));
        } else {
            setCreateForm((prev) => ({ ...prev, code: value }));
        }
        if (touched[field]) {
            const error = validateField(field, value);
            setErrors((prev) => ({ ...prev, [field]: error }));
        }
    };

    const isFieldValid = (field: keyof ValidationErrors): boolean => {
        if (!touched[field]) return true;
        return !errors[field];
    };

    // ============================================================
    // ===== SEARCH + FILTER + PAGINATION =====
    // ============================================================

    const filteredDepartments = useMemo(() => {
        return departments.filter((dept) =>
            dept.name.toLowerCase().includes(search.toLowerCase()) ||
            (dept.code?.toLowerCase() || "").includes(search.toLowerCase())
        );
    }, [departments, search]);

    // ✅ Pagination - تقسيم الأقسام
    const paginatedDepartments = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return filteredDepartments.slice(startIndex, endIndex);
    }, [filteredDepartments, currentPage, pageSize]);

    const totalPages = Math.ceil(filteredDepartments.length / pageSize);

    // ✅ إعادة تعيين الصفحة عند تغيير البحث
    const handleSearchChange = (value: string) => {
        setSearch(value);
        setCurrentPage(1);
    };

    // ============================================================
    // ===== useMemo للفلترة =====
    // ============================================================

    const availableHeads = useMemo(() => {
        return users.filter((user) => {
            if (user.roles?.includes('Admin')) return false;
            if (user.roles?.includes('Dean')) return false;

            if (selectedDepartment) {
                const userDepartment = departments.find(d => d.headUserId === user.id);
                if (userDepartment && userDepartment.id !== selectedDepartment.id) {
                    return false;
                }
            } else {
                if (departments.some(d => d.headUserId === user.id)) {
                    return false;
                }
            }

            return true;
        });
    }, [users, departments, selectedDepartment]);

    const availableUsers = useMemo(() => {
        return users.filter((user) => {
            if (user.roles?.includes('Admin')) return false;
            if (user.roles?.includes('Dean')) return false;
            if (user.roles?.includes('HeadOfDepartment')) return false;

            if (members.some((m) => m.userId === user.id)) return false;

            return true;
        });
    }, [users, members]);

    // ============================================================
    // ===== CRUD Handlers =====
    // ============================================================

    const handleCreate = () => {
        const nameError = validateName(createForm.name);
        const codeError = validateCode(createForm.code);

        setErrors({ name: nameError, code: codeError });
        setTouched({ name: true, code: true });

        if (nameError) return;

        if (createForm.headUserId) {
            const user = users.find(u => u.id === createForm.headUserId);
            if (user) {
                if (!isUserEligibleForHead(user)) {
                    toast.error("لا يمكن تعيين Admin أو Dean كرئيس قسم");
                    return;
                }
                const otherDepartment = departments.find(d => d.headUserId === user.id);
                if (otherDepartment) {
                    toast.error(`هذا المستخدم هو رئيس قسم '${otherDepartment.name}' حالياً. لا يمكن تعيينه كرئيس لقسم آخر.`);
                    return;
                }
            }
        }

        createMutation.mutate({
            name: createForm.name,
            code: createForm.code || null,
            headUserId: createForm.headUserId,
        });
    };

    const handleUpdate = () => {
        if (!selectedDepartment) return;

        const nameError = validateName(editForm.name);
        if (nameError) {
            toast.error(nameError);
            return;
        }

        if (editForm.headUserId) {
            const user = users.find(u => u.id === editForm.headUserId);
            if (user) {
                if (!isUserEligibleForHead(user)) {
                    toast.error("لا يمكن تعيين Admin أو Dean كرئيس قسم");
                    return;
                }
                const otherDepartment = departments.find(d => d.headUserId === user.id && d.id !== selectedDepartment.id);
                if (otherDepartment) {
                    toast.error(`هذا المستخدم هو رئيس قسم '${otherDepartment.name}' حالياً. لا يمكن تعيينه كرئيس لقسم آخر.`);
                    return;
                }
            }
        }

        updateMutation.mutate({
            id: selectedDepartment.id,
            payload: {
                name: editForm.name,
                code: editForm.code || null,
                isActive: editForm.isActive,
                headUserId: editForm.headUserId,
            },
        });
    };

    const handleDelete = (id: number) => {
        setConfirmModal({
            isOpen: true,
            title: "حذف القسم",
            message: "هل أنت متأكد من حذف هذا القسم؟ لا يمكن التراجع عن هذا الإجراء.",
            variant: "danger",
            icon: faTrash,
            confirmText: "حذف",
            onConfirm: () => {
                deleteMutation.mutate(id);
            },
        });
    };

    const handleToggleActive = (department: DepartmentDto) => {
        if (department.isActive) {
            setConfirmModal({
                isOpen: true,
                title: "تعطيل القسم",
                message: "⚠️ تحذير: تعطيل القسم سيؤدي إلى إزالة جميع الأعضاء ورئيس القسم. هل أنت متأكد؟",
                variant: "warning",
                icon: faTriangleExclamation,
                confirmText: "تعطيل",
                onConfirm: () => {
                    deactivateMutation.mutate(department.id);
                },
            });
        } else {
            activateMutation.mutate(department.id);
        }
    };

    // ===== Member Management =====
    const handleAddMember = () => {
        if (!selectedDepartment || !selectedUserId) return;

        const user = users.find(u => u.id === selectedUserId);
        if (user && !isUserEligibleForDepartment(user)) {
            toast.error("لا يمكن إضافة Admin أو Dean أو رئيس قسم آخر إلى القسم");
            return;
        }

        addMemberMutation.mutate({
            departmentId: selectedDepartment.id,
            userId: selectedUserId,
        });
        setSelectedUserId(null);
    };

    const handleRemoveMember = (departmentId: number, userId: number, isHead: boolean) => {
        if (isHead) {
            toast.error("لا يمكن إزالة رئيس القسم من هنا. استخدم زر إزالة الرئيس المخصص.");
            return;
        }

        setConfirmModal({
            isOpen: true,
            title: "إزالة العضو",
            message: "هل أنت متأكد من إزالة هذا العضو من القسم؟",
            variant: "danger",
            icon: faUserMinus,
            confirmText: "إزالة",
            onConfirm: () => {
                removeMemberMutation.mutate({ departmentId, userId });
            },
        });
    };

    const handleSetHead = (departmentId: number, userId: number) => {
        const user = users.find(u => u.id === userId);
        if (user && !isUserEligibleForHead(user)) {
            toast.error("لا يمكن تعيين Admin أو Dean كرئيس قسم");
            return;
        }

        setConfirmModal({
            isOpen: true,
            title: "تعيين رئيس القسم",
            message: "هل أنت متأكد من تعيين هذا المستخدم كرئيس للقسم؟",
            variant: "success",
            icon: faUserCheck,
            confirmText: "تعيين",
            onConfirm: () => {
                setHeadMutation.mutate({ departmentId, userId });
            },
        });
    };

    const handleRemoveHead = (departmentId: number, headName: string) => {
        setConfirmModal({
            isOpen: true,
            title: "إزالة رئيس القسم",
            message: `⚠️ تحذير: إزالة رئيس القسم (${headName}) ستؤدي إلى:\n\n• إزالة صلاحيات رئيس القسم بالكامل\n• تغيير دور المستخدم من HeadOfDepartment إلى User\n• إلغاء جميع التفويضات المرتبطة برئيس القسم\n\nهل أنت متأكد من المتابعة؟`,
            variant: "warning",
            icon: faUserMinus,
            confirmText: "إزالة الرئيس",
            onConfirm: () => {
                removeHeadMutation.mutate(departmentId);
            },
        });
    };

    // ===== View Department Details =====
    const handleViewDepartment = (department: DepartmentDto) => {
        setViewingDepartment(department);
        setSelectedDepartment(department);
        setShowDepartmentDetails(true);
        refetchMembers();
    };

    // ===== Modal Openers =====
    const openCreateModal = () => {
        setModalType("create");
        setCreateForm({ name: "", code: "", headUserId: null });
        setErrors({});
        setTouched({ name: false, code: false });
        setModalOpen(true);
    };

    const openEditModal = (department: DepartmentDto) => {
        setModalType("edit");
        setSelectedDepartment(department);
        setEditForm({
            name: department.name,
            code: department.code || "",
            isActive: department.isActive,
            headUserId: department.headUserId,
        });
        setModalOpen(true);
    };

    const openMembersModal = (department: DepartmentDto) => {
        setSelectedDepartment(department);
        setMemberModalOpen(true);
        refetchMembers();
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
                        <FontAwesomeIcon icon={faBuilding} />
                    </div>
                    <div>
                        <h1 className="text-base sm:text-lg font-bold text-slate-800">إدارة الأقسام</h1>
                        <p className="text-[11px] sm:text-xs text-slate-500">إدارة الأقسام وأعضاءها ورؤسائها</p>
                    </div>
                </div>

                <button
                    onClick={openCreateModal}
                    className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl font-semibold flex items-center gap-1.5 sm:gap-2 transition text-xs sm:text-sm w-full sm:w-auto justify-center"
                >
                    <FontAwesomeIcon icon={faPlus} className="text-xs sm:text-sm" />
                    إضافة قسم
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
                    <span className="font-semibold text-slate-800">{departments.length}</span>
                </div>
                <div className="w-px h-3 sm:h-4 bg-slate-200" />
                <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
                    <span className="text-emerald-500 text-[8px] sm:text-[10px]">●</span>
                    <span className="text-slate-500">نشط:</span>
                    <span className="font-semibold text-emerald-600">
                        {departments.filter(d => d.isActive).length}
                    </span>
                </div>
                <div className="w-px h-3 sm:h-4 bg-slate-200" />
                <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
                    <span className="text-red-500 text-[8px] sm:text-[10px]">●</span>
                    <span className="text-slate-500">غير نشط:</span>
                    <span className="font-semibold text-red-500">
                        {departments.filter(d => !d.isActive).length}
                    </span>
                </div>
                <div className="w-px h-3 sm:h-4 bg-slate-200" />
                <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
                    <span className="text-blue-500 text-[8px] sm:text-[10px]">●</span>
                    <span className="text-slate-500">بها رئيس:</span>
                    <span className="font-semibold text-blue-600">
                        {departments.filter(d => d.headUserId).length}
                    </span>
                </div>
            </div>

            {/* ===== SEARCH ===== */}
            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-3 sm:p-4 mb-3 sm:mb-4">
                <div className="relative flex-1">
                    <FontAwesomeIcon
                        icon={faSearch}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[11px] sm:text-sm"
                    />
                    <input
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        placeholder="البحث باسم القسم أو الكود..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 sm:py-2 pr-8 sm:pr-10 pl-3 text-xs sm:text-sm outline-none focus:border-blue-400"
                    />
                </div>
            </div>

            {/* ===== DEPARTMENTS TABLE ===== */}
            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
                {loadingDepartments ? (
                    <div className="h-32 sm:h-40 flex items-center justify-center text-slate-500 text-xs sm:text-sm">
                        جاري تحميل الأقسام...
                    </div>
                ) : filteredDepartments.length === 0 ? (
                    <div className="h-32 sm:h-40 flex flex-col items-center justify-center text-slate-400 gap-1.5 sm:gap-2">
                        <FontAwesomeIcon icon={faBuilding} className="text-2xl sm:text-3xl" />
                        <p className="text-xs sm:text-sm">لا يوجد أقسام</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-right text-xs sm:text-sm">
                                <thead>
                                    <tr className="bg-blue-50 text-slate-700">
                                        <th className="p-2 sm:p-3 font-semibold whitespace-nowrap">القسم</th>
                                        <th className="p-2 sm:p-3 font-semibold whitespace-nowrap hidden sm:table-cell">الكود</th>
                                        <th className="p-2 sm:p-3 font-semibold whitespace-nowrap hidden md:table-cell">رئيس القسم</th>
                                        <th className="p-2 sm:p-3 font-semibold whitespace-nowrap">الأعضاء</th>
                                        <th className="p-2 sm:p-3 font-semibold whitespace-nowrap">الحالة</th>
                                        <th className="p-2 sm:p-3 font-semibold whitespace-nowrap">الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedDepartments.map((dept) => (
                                        <tr
                                            key={dept.id}
                                            className="border-t border-slate-100 hover:bg-slate-50 transition"
                                        >
                                            <td className="p-2 sm:p-3 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <FontAwesomeIcon icon={faBuilding} className="text-blue-500 text-sm" />
                                                    <span className="font-semibold text-slate-800">{dept.name}</span>
                                                </div>
                                            </td>

                                            <td className="p-2 sm:p-3 text-slate-600 text-xs hidden sm:table-cell">
                                                {dept.code || "-"}
                                            </td>

                                            <td className="p-2 sm:p-3 hidden md:table-cell">
                                                {dept.headUserName ? (
                                                    <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-[10px]">
                                                        <FontAwesomeIcon icon={faUserCheck} className="text-[8px]" />
                                                        {dept.headUserName}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 text-xs">-</span>
                                                )}
                                            </td>

                                            <td className="p-2 sm:p-3 whitespace-nowrap">
                                                <button
                                                    onClick={() => openMembersModal(dept)}
                                                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition"
                                                >
                                                    <FontAwesomeIcon icon={faUsers} className="text-sm" />
                                                    <span className="font-semibold">{dept.membersCount}</span>
                                                </button>
                                            </td>

                                            <td className="p-2 sm:p-3 whitespace-nowrap">
                                                <button
                                                    onClick={() => handleToggleActive(dept)}
                                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] transition ${dept.isActive
                                                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                                            : "bg-red-100 text-red-700 hover:bg-red-200"
                                                        }`}
                                                >
                                                    <FontAwesomeIcon icon={dept.isActive ? faCheckCircle : faTimes} className="text-[8px]" />
                                                    {dept.isActive ? "نشط" : "غير نشط"}
                                                </button>
                                            </td>

                                            <td className="p-2 sm:p-3 whitespace-nowrap">
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => handleViewDepartment(dept)}
                                                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-green-100 text-green-600 hover:bg-green-200 transition flex items-center justify-center"
                                                        title="عرض التفاصيل"
                                                    >
                                                        <FontAwesomeIcon icon={faEye} className="text-[10px] sm:text-sm" />
                                                    </button>
                                                    <button
                                                        onClick={() => openEditModal(dept)}
                                                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-100 text-blue-600 hover:bg-blue-200 transition flex items-center justify-center"
                                                        title="تعديل"
                                                    >
                                                        <FontAwesomeIcon icon={faEdit} className="text-[10px] sm:text-sm" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(dept.id)}
                                                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition flex items-center justify-center"
                                                        title="حذف"
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
                        {filteredDepartments.length > pageSize && (
                            <div className="border-t border-slate-100 p-3">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                    pageSize={pageSize}
                                    totalCount={filteredDepartments.length}
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

            {/* ============================================================
                CREATE/EDIT MODAL
            ============================================================ */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-4 sm:p-6 shadow-xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-3 sm:mb-4">
                            <h2 className="text-base sm:text-lg font-bold text-slate-800">
                                {modalType === "create" ? "إضافة قسم جديد" : "تعديل القسم"}
                            </h2>
                            <button onClick={closeModal} className="text-slate-400 hover:text-red-500">
                                <FontAwesomeIcon icon={faXmark} className="text-lg" />
                            </button>
                        </div>

                        {modalType === "create" ? (
                            <div className="space-y-3 sm:space-y-3.5">
                                <div className="space-y-1">
                                    <input
                                        value={createForm.name}
                                        onChange={(e) => handleChange("name", e.target.value)}
                                        onBlur={() => handleBlur("name")}
                                        placeholder="اسم القسم *"
                                        className={`w-full border rounded-xl p-2.5 sm:p-3 text-sm outline-none text-right transition ${!isFieldValid("name") && touched.name
                                                ? "border-red-500 bg-red-50 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                                : "border-slate-200 focus:border-blue-400"
                                            }`}
                                    />
                                    {touched.name && errors.name && (
                                        <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                                    )}
                                </div>

                                <input
                                    value={createForm.code}
                                    onChange={(e) => handleChange("code", e.target.value)}
                                    onBlur={() => handleBlur("code")}
                                    placeholder="الكود (اختياري)"
                                    className="w-full border border-slate-200 rounded-xl p-2.5 sm:p-3 text-sm outline-none focus:border-blue-400 text-right"
                                />
                                {touched.code && errors.code && (
                                    <p className="text-red-500 text-xs mt-1">{errors.code}</p>
                                )}

                                <select
                                    value={createForm.headUserId || ""}
                                    onChange={(e) =>
                                        setCreateForm({
                                            ...createForm,
                                            headUserId: e.target.value ? Number(e.target.value) : null,
                                        })
                                    }
                                    className="w-full border border-slate-200 rounded-xl p-2.5 sm:p-3 text-sm outline-none focus:border-blue-400 text-right"
                                >
                                    <option value="">اختر رئيس القسم (اختياري)</option>
                                    {availableHeads.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.fullName} ({user.email})
                                        </option>
                                    ))}
                                </select>
                                <p className="text-[10px] text-slate-400">
                                    * لا يمكن تعيين Admin أو Dean كرئيس قسم
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3 sm:space-y-3.5">
                                <input
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    placeholder="اسم القسم *"
                                    className="w-full border border-slate-200 rounded-xl p-2.5 sm:p-3 text-sm outline-none focus:border-blue-400 text-right"
                                />
                                <input
                                    value={editForm.code}
                                    onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                                    placeholder="الكود (اختياري)"
                                    className="w-full border border-slate-200 rounded-xl p-2.5 sm:p-3 text-sm outline-none focus:border-blue-400 text-right"
                                />

                                <select
                                    value={editForm.headUserId || ""}
                                    onChange={(e) =>
                                        setEditForm({
                                            ...editForm,
                                            headUserId: e.target.value ? Number(e.target.value) : null,
                                        })
                                    }
                                    className="w-full border border-slate-200 rounded-xl p-2.5 sm:p-3 text-sm outline-none focus:border-blue-400 text-right"
                                >
                                    <option value="">اختر رئيس القسم (اختياري)</option>
                                    {availableHeads.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.fullName} ({user.email})
                                        </option>
                                    ))}
                                </select>
                                <p className="text-[10px] text-slate-400">
                                    * لا يمكن تعيين Admin أو Dean كرئيس قسم
                                </p>

                                <div className="flex items-center gap-2">
                                    <label className="text-sm text-slate-600">الحالة:</label>
                                    <button
                                        onClick={() => setEditForm({ ...editForm, isActive: !editForm.isActive })}
                                        className={`px-4 py-1.5 rounded-xl text-sm font-medium transition ${editForm.isActive
                                                ? "bg-emerald-100 text-emerald-700"
                                                : "bg-red-100 text-red-700"
                                            }`}
                                    >
                                        {editForm.isActive ? "نشط" : "غير نشط"}
                                    </button>
                                </div>
                            </div>
                        )}

                        <button
                            disabled={isProcessing}
                            onClick={modalType === "create" ? handleCreate : handleUpdate}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 sm:py-2.5 rounded-xl font-semibold transition disabled:opacity-50 text-sm mt-4 sm:mt-5 flex items-center justify-center gap-2"
                        >
                            {isProcessing ? (
                                <>
                                    <FontAwesomeIcon icon={faSpinner} spin />
                                    جاري الحفظ...
                                </>
                            ) : (
                                "حفظ"
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* ============================================================
                MEMBERS MODAL (إدارة الأعضاء)
            ============================================================ */}
            {memberModalOpen && selectedDepartment && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-4 sm:p-6 shadow-xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-3 sm:mb-4">
                            <h2 className="text-base sm:text-lg font-bold text-slate-800">
                                أعضاء قسم: {selectedDepartment.name}
                                <span className="text-sm font-normal text-slate-500 mr-2">
                                    ({selectedDepartment.membersCount})
                                </span>
                            </h2>
                            <button onClick={closeMembersModal} className="text-slate-400 hover:text-red-500">
                                <FontAwesomeIcon icon={faXmark} className="text-lg" />
                            </button>
                        </div>

                        {/* Add Member */}
                        <div className="flex gap-2 mb-4">
                            <select
                                value={selectedUserId || ""}
                                onChange={(e) => setSelectedUserId(e.target.value ? Number(e.target.value) : null)}
                                className="flex-1 border border-slate-200 rounded-xl p-2 text-sm outline-none focus:border-blue-400 text-right"
                            >
                                <option value="">اختر مستخدم للإضافة</option>
                                {availableUsers.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.fullName} ({user.email})
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={handleAddMember}
                                disabled={!selectedUserId || isProcessing}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-50 flex items-center gap-2"
                            >
                                <FontAwesomeIcon icon={faUserPlus} />
                                إضافة
                            </button>
                        </div>
                        <p className="text-[10px] text-slate-400 mb-3">
                            * لا يمكن إضافة Admin أو Dean أو رئيس قسم آخر إلى القسم
                        </p>

                        {/* Members List */}
                        <div className="space-y-2">
                            {members.length === 0 ? (
                                <p className="text-center text-slate-400 text-sm py-4">لا يوجد أعضاء</p>
                            ) : (
                                members.map((member) => (
                                    <div
                                        key={member.userId}
                                        className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                                                {member.fullName.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-800">
                                                    {member.fullName}
                                                    {member.isHead && (
                                                        <span className="mr-2 text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                                                            رئيس
                                                        </span>
                                                    )}
                                                </p>
                                                <p className="text-xs text-slate-400">{member.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            {!member.isHead && (
                                                <button
                                                    onClick={() =>
                                                        handleSetHead(selectedDepartment.id, member.userId)
                                                    }
                                                    className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition flex items-center justify-center"
                                                    title="تعيين كرئيس"
                                                >
                                                    <FontAwesomeIcon icon={faUserCog} className="text-[10px]" />
                                                </button>
                                            )}
                                            {member.isHead && (
                                                <button
                                                    onClick={() => handleRemoveHead(selectedDepartment.id, member.fullName)}
                                                    className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 hover:bg-orange-200 transition flex items-center justify-center"
                                                    title="إزالة الرئيس (تحذير: سيتم إزالة الصلاحيات والدور)"
                                                >
                                                    <FontAwesomeIcon icon={faUserMinus} className="text-[10px]" />
                                                </button>
                                            )}
                                            {!member.isHead && (
                                                <button
                                                    onClick={() =>
                                                        handleRemoveMember(selectedDepartment.id, member.userId, member.isHead)
                                                    }
                                                    className="w-7 h-7 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition flex items-center justify-center"
                                                    title="إزالة العضو"
                                                >
                                                    <FontAwesomeIcon icon={faUserMinus} className="text-[10px]" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <button
                            onClick={closeMembersModal}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-xl font-semibold transition text-sm mt-4"
                        >
                            إغلاق
                        </button>
                    </div>
                </div>
            )}

            {/* ============================================================
                DEPARTMENT DETAILS MODAL (عرض تفاصيل القسم)
            ============================================================ */}
            {showDepartmentDetails && viewingDepartment && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl p-4 sm:p-6 shadow-xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-slate-800">تفاصيل القسم</h2>
                            <button onClick={closeDepartmentDetails} className="text-slate-400 hover:text-red-500">
                                <FontAwesomeIcon icon={faXmark} className="text-lg" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl">
                                <div>
                                    <p className="text-xs text-slate-500">اسم القسم</p>
                                    <p className="font-semibold text-slate-800">{viewingDepartment.name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">الكود</p>
                                    <p className="font-semibold text-slate-800">{viewingDepartment.code || "-"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">الحالة</p>
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${viewingDepartment.isActive
                                            ? "bg-emerald-100 text-emerald-700"
                                            : "bg-red-100 text-red-700"
                                        }`}>
                                        {viewingDepartment.isActive ? "نشط" : "غير نشط"}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">رئيس القسم</p>
                                    <p className="font-semibold text-slate-800">
                                        {viewingDepartment.headUserName || "-"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">عدد الأعضاء</p>
                                    <p className="font-semibold text-slate-800">{viewingDepartment.membersCount}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">تاريخ الإنشاء</p>
                                    <p className="font-semibold text-slate-800">
                                        {new Date(viewingDepartment.createdAt).toLocaleDateString("ar-SA")}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold text-slate-700 mb-2">قائمة الأعضاء</h3>
                                {members.length === 0 ? (
                                    <p className="text-center text-slate-400 text-sm py-4">لا يوجد أعضاء</p>
                                ) : (
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {members.map((member) => (
                                            <div
                                                key={member.userId}
                                                className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                                                        {member.fullName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-800">
                                                            {member.fullName}
                                                            {member.isHead && (
                                                                <span className="mr-2 text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                                                                    رئيس
                                                                </span>
                                                            )}
                                                        </p>
                                                        <p className="text-xs text-slate-400">{member.email}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={closeDepartmentDetails}
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-xl font-semibold transition text-sm"
                            >
                                إغلاق
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================================
                CONFIRMATION MODAL
            ============================================================ */}
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText={confirmModal.confirmText || "تأكيد"}
                cancelText="إلغاء"
                variant={confirmModal.variant || "danger"}
                icon={confirmModal.icon}
            />
        </div>
    );
}