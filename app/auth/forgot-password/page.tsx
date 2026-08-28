/* eslint-disable @typescript-eslint/no-explicit-any */
// app/auth/forgot-password/page.tsx

"use client";

import { useState, FormEvent, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faArrowRight, faSpinner } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { apiWrapper } from "@/utils/apiClient";
import { ApiResult } from "@/types/api/ApiResult";

// ============================================
// ===== VALIDATION =====
// ============================================

interface ValidationErrors {
    email?: string;
}

const validateEmail = (email: string): string => {
    if (!email || email.trim() === "") {
        return "البريد الإلكتروني مطلوب";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return "صيغة البريد الإلكتروني غير صحيحة";
    }
    if (email.length > 255) {
        return "البريد الإلكتروني لا يتجاوز 255 حرف";
    }
    return "";
};
// ============================================
// ===== MAIN COMPONENT =====
// ============================================

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [touched, setTouched] = useState<{ email: boolean }>({ email: false });
    
    const toastIdRef = useRef<string | null>(null);

    useEffect(() => {
        return () => {
            if (toastIdRef.current) {
                toast.dismiss(toastIdRef.current);
            }
        };
    }, []);

    // ============================================
    // ===== VALIDATION HANDLERS =====
    // ============================================

    const handleBlur = () => {
        setTouched({ email: true });
        const error = validateEmail(email);
        setErrors({ email: error });
    };

    const handleChange = (value: string) => {
        setEmail(value);
        if (touched.email) {
            const error = validateEmail(value);
            setErrors({ email: error });
        }
    };

    const isFieldValid = (): boolean => {
        if (!touched.email) return true;
        return !errors.email;
    };

    // ============================================
    // ===== SUBMIT HANDLER =====
    // ============================================

    const forgotPassword = async () => {
        try {
            const res = await apiWrapper.post<ApiResult<object>>("/auth/forgot-password", {
                email: email
            });

            if (toastIdRef.current) {
                toast.dismiss(toastIdRef.current);
                toastIdRef.current = null;
            }

            if (res.data?.isSuccess) {
                toastIdRef.current = toast.success(res.data.message, {
                    duration: 4000,
                });
                router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`);
            } else {
                toastIdRef.current = toast.error(res.data?.message || "فشل إرسال رمز التحقق", {
                    duration: 4000,
                });
            }
        } catch (error: any) {
            if (toastIdRef.current) {
                toast.dismiss(toastIdRef.current);
                toastIdRef.current = null;
            }
            toastIdRef.current = toast.error(error?.message || "فشل إرسال رمز التحقق", {
                duration: 4000,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (toastIdRef.current) {
            toast.dismiss(toastIdRef.current);
            toastIdRef.current = null;
        }

        const emailError = validateEmail(email);
        setErrors({ email: emailError });
        setTouched({ email: true });

        if (emailError) {
            toastIdRef.current = toast.error(emailError, {
                duration: 4000,
            });
            return;
        }

        setLoading(true);
        await forgotPassword();
    };

    return (
        <div
            dir="rtl"
            className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-200 to-blue-900 p-4"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-blue-200 to-blue-900" />
            <Toaster 
                position="top-center"
                toastOptions={{
                    duration: 5000,
                    style: {
                        direction: 'rtl',
                    },
                }}
            />

            <div className="relative z-20 w-[92%] max-w-sm px-4 py-5 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col items-center">
                <div className="w-full text-center mb-4">
                    <h1 className="text-lg sm:text-xl font-bold text-gray-800">استعادة كلمة المرور</h1>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-1">أدخل بريدك الإلكتروني لاستقبال رمز التحقق</p>
                </div>

                <form onSubmit={handleSubmit} className="w-full space-y-3">
                    <div className="space-y-1">
                        <div className="relative group transition-all duration-300">
                            <input
                                id="email"
                                type="email"
                                placeholder="البريد الإلكتروني"
                                value={email}
                                onChange={(e) => handleChange(e.target.value)}
                                onBlur={handleBlur}
                                className={`
                                    w-full bg-gray-50 border rounded-xl px-3 py-2.5 pr-9 text-slate-700 text-xs sm:text-sm outline-none transition-all duration-300 placeholder:text-gray-400
                                    ${!isFieldValid() && touched.email
                                        ? "border-red-500 bg-red-50 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        : "border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10"
                                    }
                                `}
                                required
                                disabled={loading}
                                autoFocus
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-300">
                                <FontAwesomeIcon icon={faEnvelope} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </div>
                        </div>
                        {touched.email && errors.email && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                <span className="inline-block w-1 h-1 bg-red-500 rounded-full" />
                                {errors.email}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-900 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-2 text-xs sm:text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <FontAwesomeIcon icon={faSpinner} spin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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

                <footer className="w-full mt-4 pt-3 border-t border-gray-100 flex items-center justify-center">
                    <Link href="/auth/login" className="text-[10px] sm:text-xs text-blue-600 hover:text-blue-800 transition">
                        العودة إلى تسجيل الدخول
                    </Link>
                </footer>
            </div>
        </div>
    );
}