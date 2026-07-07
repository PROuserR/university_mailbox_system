// app/auth/forgot-password/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { apiWrapper, ApiResult } from "@/utils/apiClient";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const forgotPassword = async () => {
        try {
            const res = await apiWrapper.post<ApiResult<object>>("/auth/forgot-password", {
                email: email
            });

            if (res.data?.isSuccess) {
                toast.success("تم إرسال رمز التحقق إلى بريدك الإلكتروني");
                // ✅ الانتقال إلى صفحة إعادة تعيين كلمة المرور مع البريد الإلكتروني
                router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`);
            } else {
                toast.error(res.data?.message || "فشل إرسال رمز التحقق");
            }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "فشل إرسال رمز التحقق");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (!email) {
            toast.error("يرجى إدخال البريد الإلكتروني");
            return;
        }

        setLoading(true);
        await forgotPassword();
    };

    return (
        <div
            dir="rtl"
            className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-200 to-blue-900 p-4">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-blue-200 to-blue-900" />

            <Toaster position="top-center" />

            <div className="relative z-20 w-[92%] max-w-sm px-4 py-5 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col items-center">
                {/* Header */}
                <div className="w-full text-center mb-4">
                    <h1 className="text-lg sm:text-xl font-bold text-gray-800">
                        استعادة كلمة المرور
                    </h1>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                        أدخل بريدك الإلكتروني لاستقبال رمز التحقق
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="w-full space-y-3">
                    <div className="relative group transition-all duration-300">
                        <input
                            id="email"
                            type="email"
                            placeholder="البريد الإلكتروني"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 pr-9 text-slate-700 text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10 transition-all duration-300 placeholder:text-gray-400"
                            required
                            disabled={loading}
                            autoFocus
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-300">
                            <FontAwesomeIcon icon={faEnvelope} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </div>
                    </div>

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
                                <span>جاري الإرسال...</span>
                            </>
                        ) : (
                            <>
                                <span>إرسال رمز التحقق</span>
                                <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3" />
                            </>
                        )}
                    </button>
                </form>

                {/* Footer */}
                <footer className="w-full mt-4 pt-3 border-t border-gray-100 flex items-center justify-center">
                    <Link
                        href="/auth/login"
                        className="text-[10px] sm:text-xs text-blue-600 hover:text-blue-800 transition"
                    >
                        العودة إلى تسجيل الدخول
                    </Link>
                </footer>
            </div>
        </div>
    );
}