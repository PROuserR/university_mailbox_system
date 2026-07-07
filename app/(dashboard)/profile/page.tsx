/* eslint-disable react-hooks/set-state-in-effect */
// app/(dashboard)/profile/page.tsx

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
    faUser,
    faEnvelope,
    faPhone,
    faShieldHalved,
    faCalendar,
    faTrash,
    faSave,
    faLanguage,
    faGear,
    faUpload,
    faLock,
    faSpinner,
    faUserCheck,
    faUserSlash,
    faPen,
    faXmark,
    faCheck,
} from "@fortawesome/free-solid-svg-icons";

import { apiWrapper, ApiResult } from "@/utils/apiClient";
import Link from "next/link";
import myAPI from "@/utils/myAPI";

// ==============================
// TYPES - مطابقة للـ DTOs
// ==============================

interface Profile {
    id: number;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    phone: string | null;
    profileImageUrl: string | null;
    roles: string[];
    isActive: boolean;
    isBanned: boolean;
    createdAt: string;
    lastLoginAt: string | null;
    profileImageId: number | null;
}

// ==============================
// COMPONENT
// ==============================

export default function ProfilePage() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [userLanguage, setUserLanguage] = useState<string>("ar");
    const [imageUrl, setImageUrl] = useState<string>("");
    const [imageLoading, setImageLoading] = useState(true);

    // ✅ وضع التعديل
    const [isEditing, setIsEditing] = useState(false);

    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
    });

    // ==============================
    // GET PROFILE PICTURE
    // ==============================

    const fetchProfilePicture = async () => {
        try {
            setImageLoading(true);
            // ✅ استخدام fetch مباشرة للحصول على الصورة كـ Blob
            const response = await myAPI.get("/Profiles/picture", {
                responseType: "blob",
            });

            if (response.status === 200) {
                const blob = response.data;
                const url = URL.createObjectURL(blob);
                setImageUrl(url);
            } else {
                // ✅ إذا لم توجد صورة، استخدم fallback
                setImageUrl("");
            }
        } catch (error) {
            console.error("Failed to load profile picture:", error);
            setImageUrl("");
        } finally {
            setImageLoading(false);
        }
    };

    // ==============================
    // LOAD LANGUAGE
    // ==============================

    const fetchLanguage = async () => {
        try {
            // ✅ استخدام apiWrapper مع النوع الصحيح
            const response = await apiWrapper.get<ApiResult<string>>("/Profiles/language");

            if (response.data?.isSuccess) {
                setUserLanguage(response.data.data || "ar");
            } else {
                setUserLanguage("ar");
            }
        } catch {
            setUserLanguage("ar");
        }
    };

    // ==============================
    // LOAD PROFILE
    // ==============================

    async function loadProfile() {
        try {
            setLoading(true);
            const response = await apiWrapper.get<ApiResult<Profile>>("/Profiles");

            if (response.data?.isSuccess) {
                const data = response.data.data;
                setProfile(data);
                setForm({
                    firstName: data.firstName ?? "",
                    lastName: data.lastName ?? "",
                    email: data.email ?? "",
                    phone: data.phone ?? "",
                });
            } else {
                toast.error(response.data?.message || "فشل تحميل الملف الشخصي");
            }
        } catch {
            toast.error("فشل تحميل الملف الشخصي");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadProfile();
        fetchLanguage();
        fetchProfilePicture();

        return () => {
            if (imageUrl) {
                URL.revokeObjectURL(imageUrl);
            }
        };
    }, []);

    // ==============================
    // UPDATE PROFILE
    // ==============================

    async function updateProfile() {
        if (!form.firstName || !form.lastName || !form.email) {
            toast.error("يرجى تعبئة جميع الحقول المطلوبة");
            return;
        }

        try {
            setSubmitting(true);
            const response = await apiWrapper.put<ApiResult<Profile>>("/Profiles", {
                firstName: form.firstName,
                lastName: form.lastName,
                phone: form.phone || null,
                email: form.email,
            });

            if (response.data?.isSuccess) {
                toast.success("تم تحديث الملف الشخصي بنجاح");
                setIsEditing(false);
                await loadProfile();
            } else {
                toast.error(response.data?.message || "فشل تحديث الملف الشخصي");
            }
        } catch {
            toast.error("فشل تحديث الملف الشخصي");
        } finally {
            setSubmitting(false);
        }
    }

    // ==============================
    // UPLOAD PICTURE
    // ==============================

    async function uploadPicture(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            setUploading(true);
            const response = await apiWrapper.post<ApiResult<string>>(
                "/Profiles/picture",
                formData
            );

            if (response.data?.isSuccess) {
                toast.success("تم رفع الصورة الشخصية");
                // ✅ إعادة تحميل الصورة
                if (imageUrl) {
                    URL.revokeObjectURL(imageUrl);
                }
                await fetchProfilePicture();
                await loadProfile();
            } else {
                toast.error(response.data?.message || "فشل رفع الصورة");
            }
        } catch {
            toast.error("فشل رفع الصورة");
        } finally {
            setUploading(false);
        }
    }

    // ==============================
    // DELETE PICTURE
    // ==============================

    async function deletePicture() {
        if (!window.confirm("هل تريد حذف الصورة الشخصية؟")) return;

        try {
            const response = await apiWrapper.delete<ApiResult<object>>(
                "/Profiles/picture"
            );

            if (response.data?.isSuccess) {
                toast.success("تم حذف الصورة الشخصية");
                if (imageUrl) {
                    URL.revokeObjectURL(imageUrl);
                    setImageUrl("");
                }
                await loadProfile();
            } else {
                toast.error(response.data?.message || "فشل حذف الصورة");
            }
        } catch {
            toast.error("فشل حذف الصورة");
        }
    }

    // ==============================
    // CHANGE LANGUAGE
    // ==============================

    async function changeLanguage(language: string) {
        try {
            const response = await apiWrapper.post<ApiResult<object>>(
                `/Profiles/language?language=${language}`
            );

            if (response.data?.isSuccess) {
                setUserLanguage(language);
                toast.success(`تم تغيير اللغة إلى ${language === "ar" ? "العربية" : "English"}`);
                setTimeout(() => {
                    window.location.reload();
                }, 500);
            } else {
                toast.error(response.data?.message || "فشل تغيير اللغة");
            }
        } catch {
            toast.error("فشل تغيير اللغة");
        }
    }

    // ==============================
    // HELPERS
    // ==============================

    function translateRole(role: string) {
        const roles: Record<string, string> = {
            Dean: "العميد",
            Admin: "مدير النظام",
            Employee: "موظف",
            User: "مستخدم",
        };
        return roles[role] ?? role;
    }

    function formatDate(date: string | null) {
        if (!date) return "—";
        return new Date(date).toLocaleDateString("ar-SA");
    }

    // ==============================
    // RENDER
    // ==============================

    if (loading || !profile) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <FontAwesomeIcon icon={faSpinner} spin className="text-3xl text-blue-600" />
                <span className="mr-3 text-blue-600 text-sm">جاري تحميل الملف الشخصي...</span>
            </div>
        );
    }

    return (
        <div dir="rtl" className="min-h-screen bg-slate-50 p-3 sm:p-4">
            {/* ===== HEADER ===== */}
            <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-3 sm:p-4 mb-3 sm:mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-base sm:text-lg flex-shrink-0">
                        <FontAwesomeIcon icon={faUser} />
                    </div>
                    <div>
                        <h1 className="text-base sm:text-lg font-bold text-slate-800">الملف الشخصي</h1>
                        <p className="text-[11px] sm:text-xs text-slate-500">إدارة معلومات حسابك الشخصية</p>
                    </div>
                </div>

                {/* ✅ زر التعديل */}
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl font-semibold flex items-center gap-1.5 sm:gap-2 transition text-xs sm:text-sm"
                    >
                        <FontAwesomeIcon icon={faPen} className="text-xs sm:text-sm" />
                        تعديل
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                setIsEditing(false);
                                if (profile) {
                                    setForm({
                                        firstName: profile.firstName ?? "",
                                        lastName: profile.lastName ?? "",
                                        email: profile.email ?? "",
                                        phone: profile.phone ?? "",
                                    });
                                }
                            }}
                            className="bg-gray-200 hover:bg-gray-300 text-slate-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl font-semibold flex items-center gap-1.5 sm:gap-2 transition text-xs sm:text-sm"
                        >
                            <FontAwesomeIcon icon={faXmark} className="text-xs sm:text-sm" />
                            إلغاء
                        </button>
                        <button
                            onClick={updateProfile}
                            disabled={submitting}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl font-semibold flex items-center gap-1.5 sm:gap-2 transition text-xs sm:text-sm disabled:opacity-50"
                        >
                            {submitting ? (
                                <>
                                    <FontAwesomeIcon icon={faSpinner} spin />
                                    جاري الحفظ...
                                </>
                            ) : (
                                <>
                                    <FontAwesomeIcon icon={faCheck} />
                                    حفظ
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>

            {/* ===== PROFILE CARD ===== */}
            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4 sm:p-6 mb-3 sm:mb-4 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                    {imageLoading ? (
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-slate-200 animate-pulse" />
                    ) : imageUrl ? (
                        <img
                            src={imageUrl}
                            alt="profile-picture"
                            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-blue-200"
                        />
                    ) : (
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-4xl font-bold">
                            {profile.firstName?.charAt(0) || "?"}
                        </div>
                    )}

                    {/* Upload Button */}
                    <label className="absolute bottom-0 left-0 bg-yellow-400 hover:bg-yellow-500 p-2 rounded-full cursor-pointer shadow-md transition">
                        {uploading ? (
                            <FontAwesomeIcon icon={faSpinner} spin className="text-sm" />
                        ) : (
                            <FontAwesomeIcon icon={faUpload} className="text-sm" />
                        )}
                        <input
                            hidden
                            type="file"
                            accept="image/*"
                            onChange={uploadPicture}
                            disabled={uploading}
                        />
                    </label>
                </div>

                {/* Info */}
                <div className="flex-1 text-center sm:text-right">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
                        {profile.fullName}
                    </h2>
                    <p className="text-sm text-slate-500 mt-0.5">
                        {profile.roles?.map(translateRole).join("، ")}
                    </p>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            profile.isActive
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-red-100 text-red-700"
                        }`}>
                            <FontAwesomeIcon icon={profile.isActive ? faUserCheck : faUserSlash} className="text-[10px]" />
                            {profile.isActive ? "نشط" : "غير نشط"}
                        </span>
                        {profile.isBanned && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                <FontAwesomeIcon icon={faUserSlash} className="text-[10px]" />
                                محظور
                            </span>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                    {imageUrl && (
                        <button
                            onClick={deletePicture}
                            className="px-3 py-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition text-xs font-medium flex items-center gap-1.5"
                        >
                            <FontAwesomeIcon icon={faTrash} className="text-[10px]" />
                            حذف الصورة
                        </button>
                    )}
                    <Link
                        href="/auth/change-password"
                        className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition text-xs font-medium flex items-center gap-1.5 text-center justify-center"
                    >
                        <FontAwesomeIcon icon={faLock} className="text-[10px]" />
                        تغيير كلمة السر
                    </Link>
                </div>
            </div>

            {/* ===== GRID ===== */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">

                {/* ===== EDIT PROFILE ===== */}
                <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4 sm:p-5">
                    <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                        <FontAwesomeIcon icon={faUser} className="text-blue-500" />
                        {isEditing ? "تعديل المعلومات الشخصية" : "المعلومات الشخصية"}
                    </h3>

                    <div className="space-y-3">
                        <input
                            value={form.firstName}
                            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                            disabled={!isEditing}
                            placeholder="الاسم الأول *"
                            className={`w-full border rounded-xl p-2.5 text-sm outline-none text-right ${
                                isEditing
                                    ? "border-slate-200 focus:border-blue-400"
                                    : "border-transparent bg-slate-50 text-slate-600"
                            }`}
                        />
                        <input
                            value={form.lastName}
                            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                            disabled={!isEditing}
                            placeholder="اسم العائلة *"
                            className={`w-full border rounded-xl p-2.5 text-sm outline-none text-right ${
                                isEditing
                                    ? "border-slate-200 focus:border-blue-400"
                                    : "border-transparent bg-slate-50 text-slate-600"
                            }`}
                        />
                        <input
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            disabled={!isEditing}
                            placeholder="البريد الإلكتروني *"
                            type="email"
                            className={`w-full border rounded-xl p-2.5 text-sm outline-none text-right ${
                                isEditing
                                    ? "border-slate-200 focus:border-blue-400"
                                    : "border-transparent bg-slate-50 text-slate-600"
                            }`}
                        />
                        <input
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            disabled={!isEditing}
                            placeholder="رقم الهاتف"
                            className={`w-full border rounded-xl p-2.5 text-sm outline-none text-right ${
                                isEditing
                                    ? "border-slate-200 focus:border-blue-400"
                                    : "border-transparent bg-slate-50 text-slate-600"
                            }`}
                        />

                        {!isEditing && (
                            <p className="text-xs text-slate-400 text-center">
                                اضغط على زر تعديل لتغيير المعلومات
                            </p>
                        )}
                    </div>
                </div>

                {/* ===== ACCOUNT DETAILS ===== */}
                <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4 sm:p-5">
                    <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                        <FontAwesomeIcon icon={faGear} className="text-blue-500" />
                        تفاصيل الحساب
                    </h3>

                    <div className="space-y-2.5 text-sm">
                        <div className="flex justify-between border-b border-slate-100 pb-2">
                            <span className="text-slate-500">البريد الإلكتروني</span>
                            <span className="font-medium text-slate-800">{profile.email}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-2">
                            <span className="text-slate-500">رقم الهاتف</span>
                            <span className="font-medium text-slate-800">{profile.phone || "—"}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-2">
                            <span className="text-slate-500">الحالة</span>
                            <span className={`font-medium ${profile.isActive ? "text-emerald-600" : "text-red-600"}`}>
                                {profile.isActive ? "نشط" : "غير نشط"}
                            </span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-2">
                            <span className="text-slate-500">الأدوار</span>
                            <span className="font-medium text-slate-800">
                                {profile.roles?.map(translateRole).join("، ") || "—"}
                            </span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-2">
                            <span className="text-slate-500">تاريخ الإنشاء</span>
                            <span className="font-medium text-slate-800">{formatDate(profile.createdAt)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">آخر تسجيل دخول</span>
                            <span className="font-medium text-slate-800">{formatDate(profile.lastLoginAt)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== LANGUAGE SETTINGS ===== */}
            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4 sm:p-5 mt-3 sm:mt-4">
                <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <FontAwesomeIcon icon={faLanguage} className="text-blue-500" />
                    اللغة
                </h3>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <select
                        className="border border-slate-200 rounded-xl p-2.5 text-sm outline-none focus:border-blue-400 w-full sm:w-64"
                        value={userLanguage}
                        onChange={(e) => changeLanguage(e.target.value)}
                    >
                        <option value="ar">العربية</option>
                        <option value="en">English</option>
                    </select>
                    <span className="text-[10px] text-slate-400">
                        سيتم إعادة تحميل الصفحة لتطبيق اللغة
                    </span>
                </div>
            </div>
        </div>
    );
}