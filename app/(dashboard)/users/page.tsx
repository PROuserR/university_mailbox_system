/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
// app/(dashboard)/users/page.tsx

"use client";

import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    faPlus,
    faEdit,
    faSearch,
    faUser,
    faUserCheck,
    faUserSlash,
    faEnvelope,
    faStar,
    faXmark,
    faCheckCircle,
    faTimes,
    faKey,
    faSpinner,
    faPhone,
} from "@fortawesome/free-solid-svg-icons";

import {
    FontAwesomeIcon
} from "@fortawesome/react-fontawesome";

import {
    apiWrapper
} from "@/utils/apiClient";
import { toast } from "react-hot-toast";

// ==============================
// TYPES - مطابقة للـ DTOs
// ==============================

// UpdateUserRole enum (مطابق للـ Backend)
enum UpdateUserRole {
    User = "User",
    Employee = "Employee"
}

// CreateUserRole enum (مطابق للـ Backend)
enum CreateUserRole {
    Employee = 2,
    User = 3
}

interface User {
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

interface ApiResponse<T> {
    isSuccess: boolean;
    data: T;
    message: string;
    errors: string[] | null;
    statusCode: number;
}

// ==============================
// COMPONENT
// ==============================

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<"all" | "active" | "inactive" | "receiver">("all");
    
    // Modal states
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState<"create" | "edit" | "resetPassword">("create");
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [processing, setProcessing] = useState(false);
    
    // Form states - مطابقة للـ DTOs
    const [createForm, setCreateForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: CreateUserRole.User, // User = 3
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

    // ==============================
    // LOAD USERS
    // ==============================
    async function loadUsers() {
        try {
            setLoading(true);
            const response = await apiWrapper.get<ApiResponse<User[]>>("/Users");

            if (response.success && response.data) {
                setUsers(response.data.data);
            }
        } catch (error) {
            console.error("Failed to load users:", error);
            toast.error("فشل تحميل المستخدمين");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadUsers();
    }, []);

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
    // CREATE USER - مطابق لـ CreateUserRequest
    // ==============================
    async function createUser() {
        if (!createForm.firstName || !createForm.lastName || !createForm.email || !createForm.password) {
            toast.error("يرجى تعبئة جميع الحقول المطلوبة");
            return;
        }

        try {
            setProcessing(true);
            
            // ✅ CreateUserRequest: FirstName, LastName, Email, Password, Role (2=Employee, 3=User)
            await apiWrapper.post("/Users", {
                firstName: createForm.firstName,
                lastName: createForm.lastName,
                email: createForm.email,
                password: createForm.password,
                role: createForm.role, // 2 = Employee, 3 = User
            });
            
            toast.success("تم إضافة المستخدم بنجاح");
            closeModal();
            loadUsers();
        } catch (error: any) {
            console.error(error);
            toast.error(error?.response?.data?.message || "فشل إضافة المستخدم");
        } finally {
            setProcessing(false);
        }
    }

    // ==============================
    // UPDATE USER - مطابق لـ UpdateUserRequest
    // ==============================
    async function updateUser() {
        if (!editingUser) return;
        if (!updateForm.firstName || !updateForm.lastName || !updateForm.email) {
            toast.error("يرجى تعبئة جميع الحقول المطلوبة");
            return;
        }

        try {
            setProcessing(true);
            
            // ✅ UpdateUserRequest: FirstName, LastName, Phone, Email, Role (User/Employee)
            await apiWrapper.put(`/Users/${editingUser.id}`, {
                firstName: updateForm.firstName,
                lastName: updateForm.lastName,
                phone: updateForm.phone || null,
                email: updateForm.email,
                role: updateForm.role, // "User" or "Employee"
            });
            
            toast.success("تم تعديل المستخدم بنجاح");
            closeModal();
            loadUsers();
        } catch (error: any) {
            console.error(error);
            toast.error(error?.response?.data?.message || "فشل تعديل المستخدم");
        } finally {
            setProcessing(false);
        }
    }

    // ==============================
    // RESET PASSWORD - مطابق لـ AdminResetUserPasswordRequest
    // ==============================
    async function resetPassword() {
        if (!resetPasswordForm.newPassword || resetPasswordForm.newPassword.length < 6) {
            toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
            return;
        }

        try {
            setProcessing(true);
            
            // ✅ AdminResetUserPasswordRequest: UserId, NewPassword
            await apiWrapper.post("/Users/reset-user-password", {
                userId: resetPasswordForm.userId,
                newPassword: resetPasswordForm.newPassword,
            });
            
            toast.success("تم إعادة تعيين كلمة المرور بنجاح");
            closeModal();
        } catch (error: any) {
            console.error(error);
            toast.error(error?.response?.data?.message || "فشل إعادة تعيين كلمة المرور");
        } finally {
            setProcessing(false);
        }
    }

    // ==============================
    // TOGGLE ACTIVE
    // ==============================
    async function toggleActive(user: User) {
        try {
            await apiWrapper.post(
                user.isActive
                    ? `/Users/${user.id}/deactivate`
                    : `/Users/${user.id}/activate`
            );
            toast.success(user.isActive ? "تم تعطيل المستخدم" : "تم تفعيل المستخدم");
            loadUsers();
        } catch (error: any) {
            console.error(error);
            toast.error(error?.response?.data?.message || "فشل تغيير الحالة");
        }
    }

    // ==============================
    // TOGGLE PERMANENT RECEIVER
    // ==============================
    async function toggleReceiver(user: User) {
        try {
            await apiWrapper.post(
                user.isPermanentReceiver
                    ? `/Users/${user.id}/remove-permanent-receiver`
                    : `/Users/${user.id}/set-permanent-receiver`
            );
            toast.success(
                user.isPermanentReceiver
                    ? "تم إزالة المستخدم من المستلمين الدائمين"
                    : "تم إضافة المستخدم للمستلمين الدائمين"
            );
            loadUsers();
        } catch (error: any) {
            console.error(error);
            toast.error(error?.response?.data?.message || "فشل تغيير حالة الاستقبال الدائم");
        }
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
            role: CreateUserRole.User, // 3 = User
        });
        setModalOpen(true);
    }

    function openEditModal(user: User) {
        setModalType("edit");
        setEditingUser(user);
        
        // تحديد الدور الحالي للمستخدم
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

    function openResetPasswordModal(user: User) {
        setModalType("resetPassword");
        setEditingUser(user);
        setResetPasswordForm({
            userId: user.id,
            newPassword: "",
        });
        setModalOpen(true);
    }

    function closeModal() {
        setModalOpen(false);
        setEditingUser(null);
        setProcessing(false);
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
    }

    function formatDate(date: string | null) {
        if (!date) return "-";
        return new Date(date).toLocaleDateString();
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
                        <FontAwesomeIcon icon={faUser} />
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
                {loading ? (
                    <div className="h-32 sm:h-40 flex items-center justify-center text-slate-500 text-xs sm:text-sm">
                        جاري تحميل المستخدمين...
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="h-32 sm:h-40 flex flex-col items-center justify-center text-slate-400 gap-1.5 sm:gap-2">
                        <FontAwesomeIcon icon={faUser} className="text-2xl sm:text-3xl" />
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
                                                {user.roles.map((role) => (
                                                    <span
                                                        key={role}
                                                        className="bg-purple-100 text-purple-700 px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] whitespace-nowrap"
                                                    >
                                                        {role}
                                                    </span>
                                                ))}
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
                                                    <FontAwesomeIcon icon={faStar} className="text-[7px] sm:text-[8px]" />
                                                    دائم
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 text-[10px] sm:text-xs">-</span>
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
                                                    onClick={() => toggleActive(user)}
                                                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition flex items-center justify-center"
                                                    title={user.isActive ? "تعطيل" : "تفعيل"}
                                                >
                                                    <FontAwesomeIcon icon={user.isActive ? faUserSlash : faUserCheck} className="text-[10px] sm:text-sm" />
                                                </button>
                                                <button
                                                    onClick={() => toggleReceiver(user)}
                                                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-yellow-100 text-yellow-600 hover:bg-yellow-200 transition flex items-center justify-center"
                                                    title={user.isPermanentReceiver ? "إزالة من الدائمين" : "إضافة للدائمين"}
                                                >
                                                    <FontAwesomeIcon icon={faStar} className="text-[10px] sm:text-sm" />
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
                                <input
                                    value={createForm.firstName}
                                    onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
                                    placeholder="الاسم الأول *"
                                    className="w-full border border-slate-200 rounded-xl p-2.5 sm:p-3 text-sm outline-none focus:border-blue-400 text-right"
                                />
                                <input
                                    value={createForm.lastName}
                                    onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
                                    placeholder="اسم العائلة *"
                                    className="w-full border border-slate-200 rounded-xl p-2.5 sm:p-3 text-sm outline-none focus:border-blue-400 text-right"
                                />
                                <input
                                    value={createForm.email}
                                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                                    placeholder="البريد الإلكتروني *"
                                    type="email"
                                    className="w-full border border-slate-200 rounded-xl p-2.5 sm:p-3 text-sm outline-none focus:border-blue-400 text-right"
                                />
                                <input
                                    value={createForm.password}
                                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                                    placeholder="كلمة المرور *"
                                    type="password"
                                    className="w-full border border-slate-200 rounded-xl p-2.5 sm:p-3 text-sm outline-none focus:border-blue-400 text-right"
                                />

                                {/* Role Selection - CreateUserRole (2=Employee, 3=User) */}
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

                        {/* ===== EDIT FORM - مطابق لـ UpdateUserRequest ===== */}
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

                                {/* Role Selection - UpdateUserRole (User/Employee) */}
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
                            </div>
                        )}

                        {/* ===== RESET PASSWORD FORM ===== */}
                        {modalType === "resetPassword" && (
                            <div className="space-y-3 sm:space-y-3.5">
                                <p className="text-sm text-slate-600">
                                    إعادة تعيين كلمة المرور للمستخدم: <span className="font-semibold text-slate-800">{editingUser?.fullName}</span>
                                </p>
                                <input
                                    value={resetPasswordForm.newPassword}
                                    onChange={(e) => setResetPasswordForm({ ...resetPasswordForm, newPassword: e.target.value })}
                                    placeholder="كلمة المرور الجديدة * (6 أحرف على الأقل)"
                                    type="password"
                                    className="w-full border border-slate-200 rounded-xl p-2.5 sm:p-3 text-sm outline-none focus:border-blue-400 text-right"
                                />
                            </div>
                        )}

                        <button
                            disabled={processing}
                            onClick={
                                modalType === "create"
                                    ? createUser
                                    : modalType === "edit"
                                        ? updateUser
                                        : resetPassword
                            }
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 sm:py-2.5 rounded-xl font-semibold transition disabled:opacity-50 text-sm mt-4 sm:mt-5 flex items-center justify-center gap-2"
                        >
                            {processing ? (
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