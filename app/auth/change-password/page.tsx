/* eslint-disable @typescript-eslint/no-explicit-any */
// app/auth/change-password/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { apiWrapper, ApiResult } from "@/utils/apiClient";

export default function ChangePasswordPage() {
    const router = useRouter();

    const [currentPasswordInput, setCurrentPasswordInput] = useState("");
    const [newPasswordInput, setNewPasswordInput] = useState("");
    const [confirmNewPasswordInput, setConfirmNewPasswordInput] = useState("");
    const [loading, setLoading] = useState(false);

    const changePassword = async () => {
        try {
            const res = await apiWrapper.post<ApiResult<object>>("/auth/change-password", {
                currentPassword: currentPasswordInput,
                newPassword: newPasswordInput
            });

            if (res.data?.isSuccess) {
                setNewPasswordInput("");
                setConfirmNewPasswordInput("");
                toast.success("تم تغيير كلمة المرور بنجاح");
                router.push("/");
            } else {
                toast.error(res.data?.message || "فشل تغيير كلمة المرور");
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "فشل تغيير كلمة المرور");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentPasswordInput || !newPasswordInput || !confirmNewPasswordInput) {
            return toast.error("يرجى تعبئة جميع الحقول");
        }

        if (newPasswordInput.length < 6) {
            return toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
        }

        if (newPasswordInput !== confirmNewPasswordInput) {
            return toast.error("كلمتا المرور غير متطابقتين");
        }

        setLoading(true);
        await changePassword();
    };

    return (
        <div
            dir="rtl"
            className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-200 to-blue-900 p-4" >
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-blue-200 to-blue-900" />

            <Toaster position="top-center" />

            <div className="relative z-20 w-[92%] max-w-sm px-4 py-5 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col items-center">
                {/* Header */}
                <header className="w-full text-center mb-4">
                    <h1 className="text-lg sm:text-xl font-bold text-gray-800">
                        تغيير كلمة المرور
                    </h1>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                        أدخل كلمة مرور جديدة لحسابك
                    </p>
                </header>

                {/* Form */}
                <form onSubmit={handleSubmit} className="w-full space-y-3">

                    {/* Current Password */}
                    <div className="relative group transition-all duration-300">
                        <input
                            id="currentPassword"
                            type="password"
                            placeholder="كلمة المرور الحالية"
                            value={currentPasswordInput}
                            onChange={(e) => setCurrentPasswordInput(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 pr-9 text-slate-700 text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10 transition-all duration-300 placeholder:text-gray-400"
                            required
                            disabled={loading}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-300">
                            <FontAwesomeIcon icon={faLock} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </div>
                    </div>

                    {/* New Password */}
                    <div className="relative group transition-all duration-300">
                        <input
                            id="newPassword"
                            type="password"
                            placeholder="كلمة المرور الجديدة"
                            value={newPasswordInput}
                            onChange={(e) => setNewPasswordInput(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 pr-9 text-slate-700 text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10 transition-all duration-300 placeholder:text-gray-400"
                            required
                            disabled={loading}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-300">
                            <FontAwesomeIcon icon={faLock} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </div>
                    </div>

                    {/* Confirm New Password */}
                    <div className="relative group transition-all duration-300">
                        <input
                            id="confirmPassword"
                            type="password"
                            placeholder="تأكيد كلمة المرور"
                            value={confirmNewPasswordInput}
                            onChange={(e) => setConfirmNewPasswordInput(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 pr-9 text-slate-700 text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10 transition-all duration-300 placeholder:text-gray-400"
                            required
                            disabled={loading}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-300">
                            <FontAwesomeIcon icon={faLock} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-900 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-2 text-xs sm:text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>جاري المعالجة...</span>
                            </>
                        ) : (
                            <span>تأكيد التغيير</span>
                        )}
                    </button>
                </form>

                {/* Footer */}
                <footer className="w-full mt-4 pt-3 border-t border-gray-100 flex flex-col items-center gap-2">
                    <p className="text-[9px] sm:text-[10px] text-gray-400 text-center">
                        تأكد من اختيار كلمة مرور قوية تحتوي على حروف وأرقام
                    </p>
                    <Link
                        href="/"
                        className="text-[10px] sm:text-xs text-blue-600 hover:text-blue-800 transition"
                    >
                        العودة الى الصفحة الرئيسية
                    </Link>
                </footer>
            </div>
        </div>
    );
}