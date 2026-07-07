// app/auth/login/page.tsx

"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faLock,
    faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { apiWrapper, ApiResult } from "@/utils/apiClient";
import { UserLoginData } from "@/types/api/User/UserLoginData";
import useUserInfoStore from "@/store/userInfoStore";

export default function LoginPage() {
    const [emailInput, setEmailInput] = useState("");
    const [passwordInput, setPasswordInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { setEmail, setFirstname, setLastname, setRole } = useUserInfoStore();

    const loginUser = async () => {
        try {
            const res = await apiWrapper.post<ApiResult<UserLoginData>>('/auth/login', {
                email: emailInput,
                password: passwordInput
            });

            if (res.data?.isSuccess) {
                const data = res.data.data;
                setIsLoading(false);
                setEmail(data.email);
                setFirstname(data.firstName);
                setLastname(data.lastName);
                setRole(data.role);
                toast.success("تم تسجيل الدخول بنجاح");
                router.push("/");
            } else {
                toast.error(res.data?.message || "فشل تسجيل الدخول");
                setIsLoading(false);
            }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "فشل تسجيل الدخول");
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!emailInput || !passwordInput) {
            toast.error("يرجى تعبئة جميع الحقول");
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
    {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-blue-200 to-blue-900" />

            {/* Main Card Container */}
            <div className="relative z-20 w-[92%] max-w-sm px-4 py-5 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col items-center">

                {/* --- LOGO & HEADER SECTION --- */}
                <div className="w-full text-center mb-4">
                    {/* Custom University Logo SVG */}
                    <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 mb-2 drop-shadow-lg">
                        <Image
                            src="/aleppo_university_logo.svg"
                            alt="Aleppo university logo"
                            width={80}
                            height={80}
                            priority
                            className="w-full h-full"
                        />
                    </div>

                    {/* Title Text */}
                    <h1 className="text-lg sm:text-xl font-bold text-slate-800 tracking-wide">تسجيل الدخول</h1>
                    <p className="text-[10px] sm:text-xs text-blue-600/80 font-medium">ديوان جامعة حلب</p>
                </div>

                {/* --- LOGIN FORM SECTION --- */}
                <form onSubmit={handleSubmit} className="w-full space-y-3 mb-4">
                    {/* Email Input Group */}
                    <div className="relative group transition-all duration-300">
                        <input
                            id="email"
                            type="email"
                            placeholder="البريد الإلكتروني"
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 pr-9 text-slate-700 text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10 transition-all duration-300 placeholder:text-gray-400"
                            required
                            disabled={isLoading}
                        />

                        {/* FontAwesome Icon - Envelope */}
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-300">
                            <FontAwesomeIcon icon={faEnvelope} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </div>
                    </div>

                    {/* Password Input Group */}
                    <div className="relative group transition-all duration-300">
                        <input
                            id="password"
                            type="password"
                            placeholder="كلمة المرور"
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 pr-9 text-slate-700 text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10 transition-all duration-300 placeholder:text-gray-400"
                            required
                            disabled={isLoading}
                        />

                        {/* FontAwesome Icon - Lock */}
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-300">
                            <FontAwesomeIcon icon={faLock} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading || (!emailInput && !passwordInput)}
                        className={`w-full bg-blue-900 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-2 text-xs sm:text-sm ${isLoading ? "cursor-not-allowed opacity-90" : "hover:bg-blue-800 focus:ring-3 focus:ring-blue-300"
                            }`}
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>جاري التحقق...</span>
                            </span>
                        ) : (
                            <span>تسجيل الدخول</span>
                        )}
                    </button>
                </form>

                {/* --- FOOTER LINKS SECTION --- */}
                <footer className="flex flex-col w-full">
                    <div className="w-full pt-3 border-t border-gray-100 flex items-center justify-center gap-3">
                        {/* Forgot Password Link */}
                        <Link
                            href="/auth/forget-password"
                            className="text-[10px] sm:text-xs text-blue-600 hover:text-blue-800 hover:underline decoration-dotted decoration-blue-300 underline-offset-4 transition-all duration-300 font-medium flex items-center gap-1 group"
                        >
                            استعادة كلمة المرور
                            <FontAwesomeIcon icon={faEnvelope} className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </Link>

                        {/* Help/Link */}
                        <Link href="/support" className="text-[10px] sm:text-xs text-slate-500 hover:text-blue-600 transition-colors duration-300">
                            مساعدة؟
                        </Link>
                    </div>
                </footer>
            </div>
        </div>
    );
}