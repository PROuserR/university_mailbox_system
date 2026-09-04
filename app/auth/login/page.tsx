/* eslint-disable @typescript-eslint/no-explicit-any */
// app/auth/login/page.tsx

"use client";

import { useState, FormEvent, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faEnvelope, faSpinner, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { apiWrapper } from "@/utils/apiClient";
import useUserInfoStore from "@/store/userInfoStore";
import { ApiResult } from "@/types/api/ApiResult";
import { LoginResponse } from "@/types/api/user";

// ============================================
// ===== VALIDATION FUNCTIONS =====
// ============================================

interface ValidationErrors {
    email?: string;
    password?: string;
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

const validatePassword = (password: string): string => {
    if (!password || password.trim() === "") {
        return "كلمة المرور مطلوبة";
    }
    if (password.length < 6) {
        return "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
    }
    if (!/\d/.test(password)) {
        return "كلمة المرور يجب أن تحتوي على رقم واحد على الأقل";
    }
    if (!/[a-z]/.test(password)) {
        return "كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل";
    }
    if (!/[A-Z]/.test(password)) {
        return "كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل";
    }
    return "";
};

// ============================================
// ===== MAIN COMPONENT =====
// ============================================

export default function LoginPage() {
    const [emailInput, setEmailInput] = useState("");
    const [passwordInput, setPasswordInput] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [touched, setTouched] = useState<{ email: boolean; password: boolean }>({
        email: false,
        password: false,
    });
    const router = useRouter();
    const { setEmail, setFirstname, setLastname, setRole } = useUserInfoStore();

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

    const validateField = (field: "email" | "password", value: string): string => {
        if (field === "email") {
            return validateEmail(value);
        } else {
            return validatePassword(value);
        }
    };

    const handleBlur = (field: "email" | "password") => {
        setTouched((prev) => ({ ...prev, [field]: true }));
        const error = validateField(field, field === "email" ? emailInput : passwordInput);
        setErrors((prev) => ({ ...prev, [field]: error }));
    };

    const handleChange = (field: "email" | "password", value: string) => {
        if (field === "email") {
            setEmailInput(value);
        } else {
            setPasswordInput(value);
        }

        if (touched[field]) {
            const error = validateField(field, value);
            setErrors((prev) => ({ ...prev, [field]: error }));
        }
    };

    const isFieldValid = (field: "email" | "password"): boolean => {
        if (!touched[field]) return true;
        return !errors[field];
    };

    // ============================================
    // ===== LOGIN HANDLER =====
    // ============================================

    const loginUser = async () => {
        try {
            const res = await apiWrapper.post<ApiResult<LoginResponse>>('/auth/login', {
                email: emailInput,
                password: passwordInput
            });

            if (toastIdRef.current) {
                toast.dismiss(toastIdRef.current);
                toastIdRef.current = null;
            }

            if (res.success && res.data?.isSuccess) {
                const data = res.data.data;
                
                // ✅ تخزين بيانات المستخدم في store
                setEmail(data.email);
                setFirstname(data.firstName);
                setLastname(data.lastName);
                setRole(data.role);
                
                toastIdRef.current = toast.success(res.data.message || "تم تسجيل الدخول بنجاح", { duration: 4000 });
                
                setTimeout(() => {
                    router.push("/");
                }, 100);
            } else {
                const errorMessage = res.message || res.data?.message || "فشلت عملية تسجيل الدخول";
                toastIdRef.current = toast.error(errorMessage, { duration: 4000 });
                setIsLoading(false);
            }
        } catch (error: any) {
            if (toastIdRef.current) {
                toast.dismiss(toastIdRef.current);
                toastIdRef.current = null;
            }
            const errorMessage = error?.message || "فشلت عملية تسجيل الدخول";
            toastIdRef.current = toast.error(errorMessage, { duration: 4000 });
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (toastIdRef.current) {
            toast.dismiss(toastIdRef.current);
            toastIdRef.current = null;
        }

        const emailError = validateEmail(emailInput);
        const passwordError = validatePassword(passwordInput);

        const newErrors: ValidationErrors = {};
        if (emailError) newErrors.email = emailError;
        if (passwordError) newErrors.password = passwordError;

        setErrors(newErrors);
        setTouched({ email: true, password: true });

        if (Object.keys(newErrors).length > 0) {
            const firstError = newErrors.email || newErrors.password || "يرجى تصحيح الأخطاء في النموذج";
            toastIdRef.current = toast.error(firstError, { duration: 4000 });
            return;
        }

        setIsLoading(true);
        await loginUser();
    };

    return (
        <div
            dir="rtl"
            className="h-screen w-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-200 to-blue-900"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-blue-200 to-blue-900" />
            
            <Toaster 
                position="top-center"
                toastOptions={{
                    duration: 4000,
                    style: {
                        direction: 'rtl',
                    },
                }}
            />

            <div className="relative z-20 w-[92%] max-w-sm px-4 py-5 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col items-center">
                {/* Logo & Header */}
                <div className="w-full text-center mb-4">
                    <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 mb-2 drop-shadow-lg">
                        <Image
                            src="/logo.svg"
                            alt="Aleppo university logo"
                            width={80}
                            height={80}
                            priority
                            className="w-full h-full"
                        />
                    </div>
                    <h1 className="text-lg sm:text-xl font-bold text-slate-800 tracking-wide">تسجيل الدخول</h1>
                    <p className="text-[10px] sm:text-xs text-blue-600/80 font-medium">ديوان جامعة حلب</p>
                </div>

                <form onSubmit={handleSubmit} className="w-full space-y-3 mb-4">
                    {/* Email Field */}
                    <div className="space-y-1">
                        <div className="relative group transition-all duration-300">
                            <input
                                id="email"
                                type="email"
                                placeholder="البريد الإلكتروني"
                                value={emailInput}
                                onChange={(e) => handleChange("email", e.target.value)}
                                onBlur={() => handleBlur("email")}
                                className={`
                                    w-full bg-gray-50 border rounded-xl px-3 py-2.5 pr-9 text-slate-700 text-xs sm:text-sm outline-none transition-all duration-300 placeholder:text-gray-400
                                    ${!isFieldValid("email") && touched.email
                                        ? "border-red-500 bg-red-50 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        : "border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10"
                                    }
                                `}
                                disabled={isLoading}
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

                    {/* Password Field */}
                    <div className="space-y-1">
                        <div className="relative group transition-all duration-300">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="كلمة المرور"
                                value={passwordInput}
                                onChange={(e) => handleChange("password", e.target.value)}
                                onBlur={() => handleBlur("password")}
                                className={`
                                    w-full bg-gray-50 border rounded-xl px-3 py-2.5 pr-9 pl-9 text-slate-700 text-xs sm:text-sm outline-none transition-all duration-300 placeholder:text-gray-400
                                    ${!isFieldValid("password") && touched.password
                                        ? "border-red-500 bg-red-50 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        : "border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10"
                                    }
                                `}
                                disabled={isLoading}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-300">
                                <FontAwesomeIcon icon={faLock} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                            >
                                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                        </div>
                        {touched.password && errors.password && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                <span className="inline-block w-1 h-1 bg-red-500 rounded-full" />
                                {errors.password}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-900 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-2 text-xs sm:text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <FontAwesomeIcon icon={faSpinner} spin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                <span>جاري التحقق...</span>
                            </>
                        ) : (
                            <span>تسجيل الدخول</span>
                        )}
                    </button>
                </form>

                <footer className="flex flex-col w-full">
                    <div className="w-full pt-3 border-t border-gray-100 flex items-center justify-center gap-3">
                        <Link
                            href="/auth/forgot-password"
                            className="text-[10px] sm:text-xs text-blue-600 hover:text-blue-800 hover:underline decoration-dotted decoration-blue-300 underline-offset-4 transition-all duration-300 font-medium"
                        >
                            استعادة كلمة المرور
                        </Link>
                    </div>
                </footer>
            </div>
        </div>
    );
}