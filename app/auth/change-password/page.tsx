/* eslint-disable @typescript-eslint/no-explicit-any */
// app/auth/change-password/page.tsx

"use client";

import { useState, FormEvent, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faSpinner, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { apiWrapper } from "@/utils/apiClient";
import { ApiResult } from "@/types/api/ApiResult";

// ============================================
// ===== VALIDATION FUNCTIONS =====
// ============================================

interface ValidationErrors {
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
}

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

export default function ChangePasswordPage() {
    const router = useRouter();

    const [currentPasswordInput, setCurrentPasswordInput] = useState("");
    const [newPasswordInput, setNewPasswordInput] = useState("");
    const [confirmNewPasswordInput, setConfirmNewPasswordInput] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [touched, setTouched] = useState<{
        currentPassword: boolean;
        newPassword: boolean;
        confirmPassword: boolean;
    }>({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false,
    });

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

    const validateField = (field: keyof ValidationErrors, value: string): string => {
        if (field === "currentPassword") {
            if (!value || value.trim() === "") return "Current password is required";
            return "";
        }
        if (field === "newPassword") {
            return validatePassword(value);
        }
        if (field === "confirmPassword") {
            if (!value || value.trim() === "") return "Please confirm your password";
            if (value !== newPasswordInput) return "Passwords do not match";
            return "";
        }
        return "";
    };

    const handleBlur = (field: keyof ValidationErrors) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
        const value = field === "currentPassword" ? currentPasswordInput 
            : field === "newPassword" ? newPasswordInput 
            : confirmNewPasswordInput;
        const error = validateField(field, value);
        setErrors((prev) => ({ ...prev, [field]: error }));
    };

    const handleChange = (field: keyof ValidationErrors, value: string) => {
        if (field === "currentPassword") setCurrentPasswordInput(value);
        else if (field === "newPassword") setNewPasswordInput(value);
        else setConfirmNewPasswordInput(value);

        if (touched[field]) {
            const error = validateField(field, value);
            setErrors((prev) => ({ ...prev, [field]: error }));
        }
        
        if (field === "newPassword" && touched.confirmPassword) {
            const confirmError = validateField("confirmPassword", confirmNewPasswordInput);
            setErrors((prev) => ({ ...prev, confirmPassword: confirmError }));
        }
    };

    const isFieldValid = (field: keyof ValidationErrors): boolean => {
        if (!touched[field]) return true;
        return !errors[field];
    };

    // ============================================
    // ===== SUBMIT HANDLER =====
    // ============================================

    const changePassword = async () => {
        try {
            const res = await apiWrapper.post<ApiResult<object>>("/auth/change-password", {
                currentPassword: currentPasswordInput,
                newPassword: newPasswordInput
            });

            if (toastIdRef.current) {
                toast.dismiss(toastIdRef.current);
                toastIdRef.current = null;
            }

            if (res.data?.isSuccess) {
                setNewPasswordInput("");
                setConfirmNewPasswordInput("");
                toastIdRef.current = toast.success(res.data.message, { duration: 5000 });
                router.push("/");
            } else {
                toastIdRef.current = toast.error(res.data?.message || "فشل تغيير كلمة المرور", { duration: 5000 });
            }
        } catch (error: any) {
            if (toastIdRef.current) {
                toast.dismiss(toastIdRef.current);
                toastIdRef.current = null;
            }
            toastIdRef.current = toast.error(error?.message || "فشل تغيير كلمة المرور", { duration: 5000 });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (toastIdRef.current) {
            toast.dismiss(toastIdRef.current);
            toastIdRef.current = null;
        }

        const currentError = validateField("currentPassword", currentPasswordInput);
        const newError = validateField("newPassword", newPasswordInput);
        const confirmError = validateField("confirmPassword", confirmNewPasswordInput);

        const newErrors: ValidationErrors = {};
        if (currentError) newErrors.currentPassword = currentError;
        if (newError) newErrors.newPassword = newError;
        if (confirmError) newErrors.confirmPassword = confirmError;

        setErrors(newErrors);
        setTouched({ currentPassword: true, newPassword: true, confirmPassword: true });

        if (Object.keys(newErrors).length > 0) {
            toastIdRef.current = toast.error("يرجى تصحيح الأخطاء في النموذج", { duration: 4000 });
            return;
        }

        setLoading(true);
        await changePassword();
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
                <header className="w-full text-center mb-4">
                    <h1 className="text-lg sm:text-xl font-bold text-gray-800">تغيير كلمة المرور</h1>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-1">أدخل كلمة مرور جديدة لحسابك</p>
                </header>

                <form onSubmit={handleSubmit} className="w-full space-y-3">
                    {/* Current Password */}
                    <div className="space-y-1">
                        <div className="relative group transition-all duration-300">
                            <input
                                id="currentPassword"
                                type={showCurrentPassword ? "text" : "password"}
                                placeholder="كلمة المرور الحالية"
                                value={currentPasswordInput}
                                onChange={(e) => handleChange("currentPassword", e.target.value)}
                                onBlur={() => handleBlur("currentPassword")}
                                className={`
                                    w-full bg-gray-50 border rounded-xl px-3 py-2.5 pr-9 pl-9 text-slate-700 text-xs sm:text-sm outline-none transition-all duration-300 placeholder:text-gray-400
                                    ${!isFieldValid("currentPassword") && touched.currentPassword
                                        ? "border-red-500 bg-red-50 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        : "border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10"
                                    }
                                `}
                                disabled={loading}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-300">
                                <FontAwesomeIcon icon={faLock} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                            >
                                <FontAwesomeIcon icon={showCurrentPassword ? faEyeSlash : faEye} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                        </div>
                        {touched.currentPassword && errors.currentPassword && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                <span className="inline-block w-1 h-1 bg-red-500 rounded-full" />
                                {errors.currentPassword}
                            </p>
                        )}
                    </div>

                    {/* New Password */}
                    <div className="space-y-1">
                        <div className="relative group transition-all duration-300">
                            <input
                                id="newPassword"
                                type={showNewPassword ? "text" : "password"}
                                placeholder="كلمة المرور الجديدة"
                                value={newPasswordInput}
                                onChange={(e) => handleChange("newPassword", e.target.value)}
                                onBlur={() => handleBlur("newPassword")}
                                className={`
                                    w-full bg-gray-50 border rounded-xl px-3 py-2.5 pr-9 pl-9 text-slate-700 text-xs sm:text-sm outline-none transition-all duration-300 placeholder:text-gray-400
                                    ${!isFieldValid("newPassword") && touched.newPassword
                                        ? "border-red-500 bg-red-50 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        : "border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10"
                                    }
                                `}
                                disabled={loading}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-300">
                                <FontAwesomeIcon icon={faLock} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                            >
                                <FontAwesomeIcon icon={showNewPassword ? faEyeSlash : faEye} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                        </div>
                        {touched.newPassword && errors.newPassword && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                <span className="inline-block w-1 h-1 bg-red-500 rounded-full" />
                                {errors.newPassword}
                            </p>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1">
                        <div className="relative group transition-all duration-300">
                            <input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="تأكيد كلمة المرور"
                                value={confirmNewPasswordInput}
                                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                                onBlur={() => handleBlur("confirmPassword")}
                                className={`
                                    w-full bg-gray-50 border rounded-xl px-3 py-2.5 pr-9 pl-9 text-slate-700 text-xs sm:text-sm outline-none transition-all duration-300 placeholder:text-gray-400
                                    ${!isFieldValid("confirmPassword") && touched.confirmPassword
                                        ? "border-red-500 bg-red-50 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        : "border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10"
                                    }
                                `}
                                disabled={loading}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-300">
                                <FontAwesomeIcon icon={faLock} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                            >
                                <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                        </div>
                        {touched.confirmPassword && errors.confirmPassword && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                <span className="inline-block w-1 h-1 bg-red-500 rounded-full" />
                                {errors.confirmPassword}
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
                                <span>جاري المعالجة...</span>
                            </>
                        ) : (
                            <span>تأكيد التغيير</span>
                        )}
                    </button>
                </form>

                <footer className="w-full mt-4 pt-3 border-t border-gray-100 flex flex-col items-center gap-2">
                    <p className="text-[9px] sm:text-[10px] text-gray-400 text-center">
                        تأكد من اختيار كلمة مرور قوية تحتوي على حروف وأرقام
                    </p>
                    <Link href="/" className="text-[10px] sm:text-xs text-blue-600 hover:text-blue-800 transition">
                        العودة الى الصفحة الرئيسية
                    </Link>
                </footer>
            </div>
        </div>
    );
}