/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(dashboard)/users/page.tsx

"use client";

import {
    useEffect,
    useMemo,
    useState,
} from "react";
import {
    faPlus,
    faEdit,
    faSearch,
    faUser,
    faUserCheck,
    faUserSlash,
    faEnvelope,
    faXmark,
    faCheckCircle,
    faTimes,
    faKey,
    faSpinner,
    faEye,
    faEyeSlash,
    faUserCog,
    faUserShield,
    faUserGraduate,
    faUserTie,
    faUsers,
    faUserMinus,
    faUserPlus,
} from "@fortawesome/free-solid-svg-icons";

import {
    FontAwesomeIcon
} from "@fortawesome/react-fontawesome";

import { useAuthGuard } from "@/hooks/useAuthGuard";
import useUserInfoStore from "@/store/userInfoStore";
import { useUsers, useCreateUser, useUpdateUser, useResetUserPassword, useToggleActive, useTogglePermanentReceiver } from "@/hooks/useUsers";
import { CreateUserRole, UpdateUserRole, UserResponse } from "@/types/api/user";

// ==============================
// VALIDATION FUNCTIONS
// ==============================

interface ValidationErrors {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    newPassword?: string;
}

const validateFirstName = (value: string): string => {
    if (!value || value.trim() === "") return "الاسم الأول مطلوب";
    if (value.length > 100) return "الاسم الأول لا يتجاوز 100 حرف";
    return "";
};

const validateLastName = (value: string): string => {
    if (!value || value.trim() === "") return "اسم العائلة مطلوب";
    if (value.length > 100) return "اسم العائلة لا يتجاوز 100 حرف";
    return "";
};

const validateEmail = (email: string): string => {
    if (!email || email.trim() === "") return "البريد الإلكتروني مطلوب";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "صيغة البريد الإلكتروني غير صحيحة";
    if (email.length > 255) return "البريد الإلكتروني لا يتجاوز 255 حرف";
    return "";
};

const validatePassword = (password: string): string => {
    if (!password || password.trim() === "") return "كلمة المرور مطلوبة";
    if (password.length < 6) return "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
    if (!/\d/.test(password)) return "كلمة المرور يجب أن تحتوي على رقم واحد على الأقل";
    if (!/[a-z]/.test(password)) return "كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل";
    if (!/[A-Z]/.test(password)) return "كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل";
    return "";
};

// ==============================
// COMPONENT
// ==============================

export default function UsersPage() {
    const { isLoading: isAuthLoading, isAuthorized } = useAuthGuard({
        requiredPermissions: ['ManageUsers'],
        redirectTo: '/auth/login',
        unauthorizedPath: '/unauthorized'
    });

    const { id: currentUserId, roles: currentUserRoles } = useUserInfoStore();

    const { data: users = [], isLoading: loadingUsers, refetch: refetchUsers } = useUsers();
    const createUserMutation = useCreateUser(() => { closeModal(); refetchUsers(); });
    const updateUserMutation = useUpdateUser(() => { closeModal(); refetchUsers(); });
    const resetPasswordMutation = useResetUserPassword(() => { closeModal(); refetchUsers(); });
    const toggleActiveMutation = useToggleActive(() => refetchUsers());
    const toggleReceiverMutation = useTogglePermanentReceiver(() => refetchUsers());

    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<"all" | "active" | "inactive" | "receiver">("all");
    
    // Modal states
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState<"create" | "edit" | "resetPassword">("create");
    const [editingUser, setEditingUser] = useState<UserResponse | null>(null);

    // Show password states
    const [showCreatePassword, setShowCreatePassword] = useState(false);
    const [showResetPassword, setShowResetPassword] = useState(false);

    // Validation states
    const [createErrors, setCreateErrors] = useState<ValidationErrors>({});
    const [createTouched, setCreateTouched] = useState<{
        firstName: boolean;
        lastName: boolean;
        email: boolean;
        password: boolean;
    }>({
        firstName: false,
        lastName: false,
        email: false,
        password: false,
    });

    const [resetErrors, setResetErrors] = useState<ValidationErrors>({});
    const [resetTouched, setResetTouched] = useState<{
        newPassword: boolean;
    }>({
        newPassword: false,
    });

    // Form states
    const [createForm, setCreateForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: CreateUserRole.User,
    });
    
    const [updateForm, setUpdateForm] = useState({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        role: UpdateUserRole.User,
    });
    
    const [resetPasswordForm, setResetPasswordForm] = useState({
        userId: 0,
        newPassword: "",
    });

    const isProcessing = 
        createUserMutation.isPending || 
        updateUserMutation.isPending || 
        resetPasswordMutation.isPending || 
        toggleActiveMutation.isPending || 
        toggleReceiverMutation.isPending;

    // ==============================
    // CHECK IF ROLE IS PROTECTED
    // ==============================
    const isProtectedRole = (roles: string[]): boolean => {
        return roles.includes('Admin') || 
               roles.includes('Dean') || 
               roles.includes('HeadOfDepartment');
    };

    const canEditRole = (user: UserResponse): boolean => {
        if (isProtectedRole(user.roles)) return false;
        if (user.id === currentUserId) return false;
        return true;
    };

    const canDeactivate = (user: UserResponse): boolean => {
        if (user.id === currentUserId) return false;
        if (user.roles.includes('Admin')) return false;
        return true;
    };

    // ==============================
    // SEARCH + FILTER
    // ==============================
    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            const searchMatch =
                user.fullName.toLowerCase().includes(search.toLowerCase()) ||
                user.email.toLowerCase().includes(search.toLowerCase()) ||
                user.userName.toLowerCase().includes(search.toLowerCase());

            const filterMatch =
                filter === "all"
                    ? true
                    : filter === "active"
                        ? user.isActive
                        : filter === "inactive"
                            ? !user.isActive
                            : user.isPermanentReceiver;

            return searchMatch && filterMatch;
        });
    }, [users, search, filter]);

    // ==============================
    // STATS
    // ==============================
    const totalCount = users.length;
    const activeCount = users.filter((u) => u.isActive).length;
    const inactiveCount = users.filter((u) => !u.isActive).length;
    const receiverCount = users.filter((u) => u.isPermanentReceiver).length;

    // ==============================
    // VALIDATION HANDLERS
    // ==============================

    const validateCreateField = (field: keyof ValidationErrors, value: string): string => {
        switch (field) {
            case 'firstName': return validateFirstName(value);
            case 'lastName': return validateLastName(value);
            case 'email': return validateEmail(value);
            case 'password': return validatePassword(value);
            default: return "";
        }
    };

    const handleCreateBlur = (field: keyof ValidationErrors) => {
        setCreateTouched((prev) => ({ ...prev, [field]: true }));
        if (field === 'password' || field === 'firstName' || field === 'lastName' || field === 'email') {
            const value = createForm[field as keyof typeof createForm] as string || "";
            const error = validateCreateField(field, value);
            setCreateErrors((prev) => ({ ...prev, [field]: error }));
        }
    };

    const handleCreateChange = (field: keyof ValidationErrors, value: string) => {
        setCreateForm((prev) => ({ ...prev, [field]: value }));
        if (createTouched[field as keyof typeof createTouched]) {
            const error = validateCreateField(field, value);
            setCreateErrors((prev) => ({ ...prev, [field]: error }));
        }
    };

    const handleResetBlur = () => {
        setResetTouched({ newPassword: true });
        const error = validatePassword(resetPasswordForm.newPassword);
        setResetErrors({ newPassword: error });
    };

    const handleResetChange = (value: string) => {
        setResetPasswordForm((prev) => ({ ...prev, newPassword: value }));
        if (resetTouched.newPassword) {
            const error = validatePassword(value);
            setResetErrors({ newPassword: error });
        }
    };

    const isCreateFieldValid = (field: keyof ValidationErrors): boolean => {
        if (!createTouched[field as keyof typeof createTouched]) return true;
        return !createErrors[field];
    };

    const isResetFieldValid = (): boolean => {
        if (!resetTouched.newPassword) return true;
        return !resetErrors.newPassword;
    };

    // ==============================
    // HANDLERS
    // ==============================

    function handleCreateUser() {
        const firstNameError = validateFirstName(createForm.firstName);
        const lastNameError = validateLastName(createForm.lastName);
        const emailError = validateEmail(createForm.email);
        const passwordError = validatePassword(createForm.password);

        const newErrors: ValidationErrors = {};
        if (firstNameError) newErrors.firstName = firstNameError;
        if (lastNameError) newErrors.lastName = lastNameError;
        if (emailError) newErrors.email = emailError;
        if (passwordError) newErrors.password = passwordError;

        setCreateErrors(newErrors);
        setCreateTouched({
            firstName: true,
            lastName: true,
            email: true,
            password: true,
        });

        if (Object.keys(newErrors).length > 0) {
            return;
        }

        const roleString = createForm.role === CreateUserRole.Employee ? "Employee" : "User";
        
        createUserMutation.mutate({
            firstName: createForm.firstName,
            lastName: createForm.lastName,
            email: createForm.email,
            password: createForm.password,
            role: roleString,
        });
    }

    function handleUpdateUser() {
        if (!editingUser) return;

        const firstNameError = validateFirstName(updateForm.firstName);
        const lastNameError = validateLastName(updateForm.lastName);
        const emailError = validateEmail(updateForm.email);

        if (firstNameError || lastNameError || emailError) {
            return;
        }

        const payload: any = {
            firstName: updateForm.firstName,
            lastName: updateForm.lastName,
            phone: updateForm.phone || null,
            email: updateForm.email,
        };

        if (canEditRole(editingUser)) {
            payload.role = updateForm.role;
        }

        updateUserMutation.mutate({ id: editingUser.id, payload });
    }

    function handleResetPassword() {
        const passwordError = validatePassword(resetPasswordForm.newPassword);
        setResetErrors({ newPassword: passwordError });
        setResetTouched({ newPassword: true });

        if (passwordError) return;

        resetPasswordMutation.mutate({
            userId: resetPasswordForm.userId,
            newPassword: resetPasswordForm.newPassword,
        });
    }

    function handleToggleActive(user: UserResponse) {
        if (!canDeactivate(user)) {
            return;
        }
        toggleActiveMutation.mutate({ id: user.id, isActive: user.isActive });
    }

    function handleToggleReceiver(user: UserResponse) {
        toggleReceiverMutation.mutate({ id: user.id, isPermanentReceiver: user.isPermanentReceiver });
    }

    // ==============================
    // MODAL HELPERS
    // ==============================
    function openCreateModal() {
        setModalType("create");
        setEditingUser(null);
        setCreateForm({
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            role: CreateUserRole.User,
        });
        setCreateErrors({});
        setCreateTouched({
            firstName: false,
            lastName: false,
            email: false,
            password: false,
        });
        setShowCreatePassword(false);
        setModalOpen(true);
    }

    function openEditModal(user: UserResponse) {
        setModalType("edit");
        setEditingUser(user);
        
        const currentRole = user.roles.includes("Employee") 
            ? UpdateUserRole.Employee 
            : UpdateUserRole.User;
        
        setUpdateForm({
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone ?? "",
            email: user.email,
            role: currentRole,
        });
        setModalOpen(true);
    }

    function openResetPasswordModal(user: UserResponse) {
        setModalType("resetPassword");
        setEditingUser(user);
        setResetPasswordForm({
            userId: user.id,
            newPassword: "",
        });
        setResetErrors({});
        setResetTouched({ newPassword: false });
        setShowResetPassword(false);
        setModalOpen(true);
    }

    function closeModal() {
        setModalOpen(false);
        setEditingUser(null);
        setCreateForm({
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            role: CreateUserRole.User,
        });
        setUpdateForm({
            firstName: "",
            lastName: "",
            phone: "",
            email: "",
            role: UpdateUserRole.User,
        });
        setResetPasswordForm({
            userId: 0,
            newPassword: "",
        });
        setCreateErrors({});
        setResetErrors({});
        setShowCreatePassword(false);
        setShowResetPassword(false);
    }

    function formatDate(date: string | null) {
        if (!date) return "-";
        return new Date(date).toLocaleDateString();
    }

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
                        <FontAwesomeIcon icon={faUsers} />
                    </div>
                    <div>
                        <h1 className="text-base sm:text-lg font-bold text-slate-800">إدارة المستخدمين</h1>
                        <p className="text-[11px] sm:text-xs text-slate-500">إدارة حسابات المستخدمين والصلاحيات</p>
                    </div>
                </div>

                <button
                    onClick={openCreateModal}
                    className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl font-semibold flex items-center gap-1.5 sm:gap-2 transition text-xs sm:text-sm w-full sm:w-auto justify-center"
                >
                    <FontAwesomeIcon icon={faPlus} className="text-xs sm:text-sm" />
                    إضافة مستخدم
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
                <div className="w-px h-3 sm:h-4 bg-slate-200" />
                <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
                    <span className="text-yellow-500 text-[8px] sm:text-[10px]">●</span>
                    <span className="text-slate-500">مستلم دائم:</span>
                    <span className="font-semibold text-yellow-600">{receiverCount}</span>
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
                            placeholder="البحث بالاسم أو البريد أو اسم المستخدم..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 sm:py-2 pr-8 sm:pr-10 pl-3 text-xs sm:text-sm outline-none focus:border-blue-400"
                        />
                    </div>

                    <div className="flex gap-1.5 flex-wrap">
                        {[
                            { key: "all", label: "الكل" },
                            { key: "active", label: "نشط" },
                            { key: "inactive", label: "غير نشط" },
                            { key: "receiver", label: "مستلم دائم" },
                        ].map((item) => (
                            <button
                                key={item.key}
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

            {/* ===== USERS TABLE ===== */}
            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
                {loadingUsers ? (
                    <div className="h-32 sm:h-40 flex items-center justify-center text-slate-500 text-xs sm:text-sm">
                        جاري تحميل المستخدمين...
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="h-32 sm:h-40 flex flex-col items-center justify-center text-slate-400 gap-1.5 sm:gap-2">
                        <FontAwesomeIcon icon={faUsers} className="text-2xl sm:text-3xl" />
                        <p className="text-xs sm:text-sm">لا يوجد مستخدمين</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-xs sm:text-sm">
                            <thead>
                                <tr className="bg-blue-50 text-slate-700">
                                    <th className="p-2 sm:p-3 font-semibold whitespace-nowrap">المستخدم</th>
                                    <th className="p-2 sm:p-3 font-semibold whitespace-nowrap hidden sm:table-cell">البريد</th>
                                    <th className="p-2 sm:p-3 font-semibold whitespace-nowrap hidden md:table-cell">الدور</th>
                                    <th className="p-2 sm:p-3 font-semibold whitespace-nowrap">الحالة</th>
                                    <th className="p-2 sm:p-3 font-semibold whitespace-nowrap hidden lg:table-cell">الاستقبال</th>
                                    <th className="p-2 sm:p-3 font-semibold whitespace-nowrap">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="border-t border-slate-100 hover:bg-slate-50 transition"
                                    >
                                        {/* USER */}
                                        <td className="p-2 sm:p-3 whitespace-nowrap">
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs sm:text-sm flex-shrink-0">
                                                    {user.firstName?.charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-semibold text-slate-800 text-xs sm:text-sm truncate max-w-[80px] sm:max-w-[120px]" title={user.fullName}>
                                                        {user.fullName}
                                                        {user.id === currentUserId && (
                                                            <span className="mr-1 text-[8px] text-blue-500">(أنت)</span>
                                                        )}
                                                    </div>
                                                    <div className="text-[10px] sm:text-xs text-slate-400 truncate max-w-[60px] sm:max-w-[100px]">
                                                        @{user.userName}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* EMAIL */}
                                        <td className="p-2 sm:p-3 text-slate-600 text-[10px] sm:text-xs truncate max-w-[120px] sm:max-w-[180px] hidden sm:table-cell" title={user.email}>
                                            <div className="flex items-center gap-1.5">
                                                <FontAwesomeIcon icon={faEnvelope} className="text-blue-400 text-[8px] sm:text-[10px]" />
                                                {user.email}
                                            </div>
                                        </td>

                                        {/* ROLES */}
                                        <td className="p-2 sm:p-3 hidden md:table-cell">
                                            <div className="flex gap-1 flex-wrap">
                                                {user.roles.map((role) => {
                                                    let icon = faUser;
                                                    let color = "bg-purple-100 text-purple-700";
                                                    if (role === 'Admin') {
                                                        icon = faUserShield;
                                                        color = "bg-red-100 text-red-700";
                                                    } else if (role === 'Dean') {
                                                        icon = faUserGraduate;
                                                        color = "bg-blue-100 text-blue-700";
                                                    } else if (role === 'HeadOfDepartment') {
                                                        icon = faUserTie;
                                                        color = "bg-green-100 text-green-700";
                                                    } else if (role === 'Employee') {
                                                        icon = faUserCog;
                                                        color = "bg-orange-100 text-orange-700";
                                                    }
                                                    return (
                                                        <span
                                                            key={role}
                                                            className={`${color} px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] whitespace-nowrap flex items-center gap-0.5`}
                                                        >
                                                            <FontAwesomeIcon icon={icon} className="text-[6px] sm:text-[7px]" />
                                                            {role}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </td>

                                        {/* STATUS */}
                                        <td className="p-2 sm:p-3 whitespace-nowrap">
                                            <div className="flex flex-col gap-0.5">
                                                {user.isActive ? (
                                                    <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] whitespace-nowrap">
                                                        <FontAwesomeIcon icon={faCheckCircle} className="text-[7px] sm:text-[8px]" />
                                                        نشط
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] whitespace-nowrap">
                                                        <FontAwesomeIcon icon={faTimes} className="text-[7px] sm:text-[8px]" />
                                                        غير نشط
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* PERMANENT RECEIVER */}
                                        <td className="p-2 sm:p-3 hidden lg:table-cell whitespace-nowrap">
                                            {user.isPermanentReceiver ? (
                                                <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] whitespace-nowrap">
                                                    <FontAwesomeIcon icon={faUserCheck} className="text-[7px] sm:text-[8px]" />
                                                    دائم
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-400 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] whitespace-nowrap">
                                                    <FontAwesomeIcon icon={faUserMinus} className="text-[7px] sm:text-[8px]" />
                                                    غير دائم
                                                </span>
                                            )}
                                        </td>

                                        {/* ACTIONS */}
                                        <td className="p-2 sm:p-3 whitespace-nowrap">
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => openEditModal(user)}
                                                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-100 text-blue-600 hover:bg-blue-200 transition flex items-center justify-center"
                                                    title="تعديل"
                                                >
                                                    <FontAwesomeIcon icon={faEdit} className="text-[10px] sm:text-sm" />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleActive(user)}
                                                    disabled={!canDeactivate(user) || toggleActiveMutation.isPending}
                                                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl transition flex items-center justify-center ${
                                                        !canDeactivate(user) || toggleActiveMutation.isPending
                                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                            : user.isActive
                                                                ? "bg-red-100 text-red-600 hover:bg-red-200"
                                                                : "bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
                                                    }`}
                                                    title={
                                                        user.id === currentUserId
                                                            ? "لا يمكن تعطيل حسابك الخاص"
                                                            : user.roles.includes('Admin')
                                                                ? "لا يمكن تعطيل حساب المدير"
                                                                : user.isActive
                                                                    ? "تعطيل"
                                                                    : "تفعيل"
                                                    }
                                                >
                                                    <FontAwesomeIcon icon={user.isActive ? faUserSlash : faUserCheck} className="text-[10px] sm:text-sm" />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleReceiver(user)}
                                                    disabled={toggleReceiverMutation.isPending}
                                                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl transition flex items-center justify-center ${
                                                        toggleReceiverMutation.isPending
                                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                            : user.isPermanentReceiver
                                                                ? "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                                                                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                                    }`}
                                                    title={user.isPermanentReceiver ? "إزالة من الدائمين" : "إضافة للدائمين"}
                                                >
                                                    <FontAwesomeIcon icon={user.isPermanentReceiver ? faUserCheck : faUserPlus} className="text-[10px] sm:text-sm" />
                                                </button>
                                                <button
                                                    onClick={() => openResetPasswordModal(user)}
                                                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-purple-100 text-purple-600 hover:bg-purple-200 transition flex items-center justify-center"
                                                    title="إعادة تعيين كلمة المرور"
                                                >
                                                    <FontAwesomeIcon icon={faKey} className="text-[10px] sm:text-sm" />
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
                    <div className="bg-white rounded-2xl w-full max-w-md p-4 sm:p-6 shadow-xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-3 sm:mb-4">
                            <h2 className="text-base sm:text-lg font-bold text-slate-800">
                                {modalType === "create" && "إضافة مستخدم"}
                                {modalType === "edit" && "تعديل المستخدم"}
                                {modalType === "resetPassword" && "إعادة تعيين كلمة المرور"}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="text-slate-400 hover:text-red-500"
                            >
                                <FontAwesomeIcon icon={faXmark} className="text-lg" />
                            </button>
                        </div>

                        {/* ===== CREATE FORM ===== */}
                        {modalType === "create" && (
                            <div className="space-y-3 sm:space-y-3.5">
                                {/* First Name */}
                                <div className="space-y-1">
                                    <input
                                        value={createForm.firstName}
                                        onChange={(e) => handleCreateChange("firstName", e.target.value)}
                                        onBlur={() => handleCreateBlur("firstName")}
                                        placeholder="الاسم الأول *"
                                        className={`w-full border rounded-xl p-2.5 sm:p-3 text-sm outline-none text-right transition ${
                                            !isCreateFieldValid("firstName") && createTouched.firstName
                                                ? "border-red-500 bg-red-50 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                                : "border-slate-200 focus:border-blue-400"
                                        }`}
                                    />
                                    {createTouched.firstName && createErrors.firstName && (
                                        <p className="text-red-500 text-xs mt-1">{createErrors.firstName}</p>
                                    )}
                                </div>

                                {/* Last Name */}
                                <div className="space-y-1">
                                    <input
                                        value={createForm.lastName}
                                        onChange={(e) => handleCreateChange("lastName", e.target.value)}
                                        onBlur={() => handleCreateBlur("lastName")}
                                        placeholder="اسم العائلة *"
                                        className={`w-full border rounded-xl p-2.5 sm:p-3 text-sm outline-none text-right transition ${
                                            !isCreateFieldValid("lastName") && createTouched.lastName
                                                ? "border-red-500 bg-red-50 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                                : "border-slate-200 focus:border-blue-400"
                                        }`}
                                    />
                                    {createTouched.lastName && createErrors.lastName && (
                                        <p className="text-red-500 text-xs mt-1">{createErrors.lastName}</p>
                                    )}
                                </div>

                                {/* Email */}
                                <div className="space-y-1">
                                    <input
                                        value={createForm.email}
                                        onChange={(e) => handleCreateChange("email", e.target.value)}
                                        onBlur={() => handleCreateBlur("email")}
                                        placeholder="البريد الإلكتروني *"
                                        type="email"
                                        className={`w-full border rounded-xl p-2.5 sm:p-3 text-sm outline-none text-right transition ${
                                            !isCreateFieldValid("email") && createTouched.email
                                                ? "border-red-500 bg-red-50 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                                : "border-slate-200 focus:border-blue-400"
                                        }`}
                                    />
                                    {createTouched.email && createErrors.email && (
                                        <p className="text-red-500 text-xs mt-1">{createErrors.email}</p>
                                    )}
                                </div>

                                {/* Password with Eye Button */}
                                <div className="space-y-1">
                                    <div className="relative">
                                        <input
                                            value={createForm.password}
                                            onChange={(e) => handleCreateChange("password", e.target.value)}
                                            onBlur={() => handleCreateBlur("password")}
                                            placeholder="كلمة المرور *"
                                            type={showCreatePassword ? "text" : "password"}
                                            className={`w-full border rounded-xl p-2.5 sm:p-3 text-sm outline-none text-right transition pl-10 ${
                                                !isCreateFieldValid("password") && createTouched.password
                                                    ? "border-red-500 bg-red-50 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                                    : "border-slate-200 focus:border-blue-400"
                                            }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCreatePassword(!showCreatePassword)}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                                        >
                                            <FontAwesomeIcon icon={showCreatePassword ? faEyeSlash : faEye} />
                                        </button>
                                    </div>
                                    {createTouched.password && createErrors.password && (
                                        <p className="text-red-500 text-xs mt-1">{createErrors.password}</p>
                                    )}
                                    <div className="text-[10px] text-gray-400 mt-1 space-y-0.5">
                                        <p>• 6 أحرف على الأقل • رقم واحد • حرف صغير • حرف كبير</p>
                                    </div>
                                </div>

                                {/* Role Selection */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-medium text-slate-600">الدور</label>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setCreateForm({ ...createForm, role: CreateUserRole.User })}
                                            className={`flex-1 py-2 rounded-xl text-sm font-medium transition ${
                                                createForm.role === CreateUserRole.User
                                                    ? "bg-blue-500 text-white"
                                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                            }`}
                                        >
                                            مستخدم
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setCreateForm({ ...createForm, role: CreateUserRole.Employee })}
                                            className={`flex-1 py-2 rounded-xl text-sm font-medium transition ${
                                                createForm.role === CreateUserRole.Employee
                                                    ? "bg-blue-500 text-white"
                                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                            }`}
                                        >
                                            موظف
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ===== EDIT FORM ===== */}
                        {modalType === "edit" && (
                            <div className="space-y-3 sm:space-y-3.5">
                                <input
                                    value={updateForm.firstName}
                                    onChange={(e) => setUpdateForm({ ...updateForm, firstName: e.target.value })}
                                    placeholder="الاسم الأول *"
                                    className="w-full border border-slate-200 rounded-xl p-2.5 sm:p-3 text-sm outline-none focus:border-blue-400 text-right"
                                />
                                <input
                                    value={updateForm.lastName}
                                    onChange={(e) => setUpdateForm({ ...updateForm, lastName: e.target.value })}
                                    placeholder="اسم العائلة *"
                                    className="w-full border border-slate-200 rounded-xl p-2.5 sm:p-3 text-sm outline-none focus:border-blue-400 text-right"
                                />
                                <input
                                    value={updateForm.phone}
                                    onChange={(e) => setUpdateForm({ ...updateForm, phone: e.target.value })}
                                    placeholder="رقم الهاتف"
                                    className="w-full border border-slate-200 rounded-xl p-2.5 sm:p-3 text-sm outline-none focus:border-blue-400 text-right"
                                />
                                <input
                                    value={updateForm.email}
                                    onChange={(e) => setUpdateForm({ ...updateForm, email: e.target.value })}
                                    placeholder="البريد الإلكتروني *"
                                    type="email"
                                    className="w-full border border-slate-200 rounded-xl p-2.5 sm:p-3 text-sm outline-none focus:border-blue-400 text-right"
                                />

                                {/* Role Selection - Only if editable */}
                                {editingUser && canEditRole(editingUser) && (
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-medium text-slate-600">الدور</label>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setUpdateForm({ ...updateForm, role: UpdateUserRole.User })}
                                                className={`flex-1 py-2 rounded-xl text-sm font-medium transition ${
                                                    updateForm.role === UpdateUserRole.User
                                                        ? "bg-blue-500 text-white"
                                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                                }`}
                                            >
                                                مستخدم
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setUpdateForm({ ...updateForm, role: UpdateUserRole.Employee })}
                                                className={`flex-1 py-2 rounded-xl text-sm font-medium transition ${
                                                    updateForm.role === UpdateUserRole.Employee
                                                        ? "bg-blue-500 text-white"
                                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                                }`}
                                            >
                                                موظف
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {editingUser && !canEditRole(editingUser) && (
                                    <div className="bg-gray-50 rounded-xl p-3 text-center text-sm text-gray-500">
                                        <FontAwesomeIcon icon={faUserShield} className="ml-2 text-gray-400" />
                                        لا يمكن تعديل دور المستخدمين (Admin, Dean, HeadOfDepartment)
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ===== RESET PASSWORD FORM ===== */}
                        {modalType === "resetPassword" && (
                            <div className="space-y-3 sm:space-y-3.5">
                                <p className="text-sm text-slate-600">
                                    إعادة تعيين كلمة المرور للمستخدم: <span className="font-semibold text-slate-800">{editingUser?.fullName}</span>
                                </p>
                                <div className="space-y-1">
                                    <div className="relative">
                                        <input
                                            value={resetPasswordForm.newPassword}
                                            onChange={(e) => handleResetChange(e.target.value)}
                                            onBlur={handleResetBlur}
                                            placeholder="كلمة المرور الجديدة * (6 أحرف على الأقل)"
                                            type={showResetPassword ? "text" : "password"}
                                            className={`w-full border rounded-xl p-2.5 sm:p-3 text-sm outline-none text-right transition pl-10 ${
                                                !isResetFieldValid() && resetTouched.newPassword
                                                    ? "border-red-500 bg-red-50 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                                    : "border-slate-200 focus:border-blue-400"
                                            }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowResetPassword(!showResetPassword)}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                                        >
                                            <FontAwesomeIcon icon={showResetPassword ? faEyeSlash : faEye} />
                                        </button>
                                    </div>
                                    {resetTouched.newPassword && resetErrors.newPassword && (
                                        <p className="text-red-500 text-xs mt-1">{resetErrors.newPassword}</p>
                                    )}
                                    <div className="text-[10px] text-gray-400 mt-1 space-y-0.5">
                                        <p>• 6 أحرف على الأقل • رقم واحد • حرف صغير • حرف كبير</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <button
                            disabled={isProcessing}
                            onClick={
                                modalType === "create"
                                    ? handleCreateUser
                                    : modalType === "edit"
                                        ? handleUpdateUser
                                        : handleResetPassword
                            }
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
        </div>
    );
}