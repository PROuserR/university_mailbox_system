"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faLock,
    faEnvelope,
    faPlusCircle,
} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import userInfoStore from "@/store/userInfoStore";
import toast from "react-hot-toast";
import { apiWrapper } from "@/utils/apiClient";
import { AxiosResponse } from "axios";
import { UserLoginData } from "@/types/api/UserLoginData";

export default function LoginPage() {
    const [emailInput, setEmailInpt] = useState("");
    const [passwordInput, setPasswordInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { setEmail, setFirstname, setLastname } = userInfoStore();

    const loginUser = async () => {
        const res = await apiWrapper.post<AxiosResponse<UserLoginData>>('/auth/login', { email: emailInput, password: passwordInput })
        console.log(res)
        if (res.status === 200 && res.data) {
            const data = res.data.data
            setIsLoading(false);
            setEmail(data.email);
            setFirstname(data.firstName);
            setLastname(data.lastName);
            toast.success("تم تسجيل الدخول بنجاح");
            router.push("/");
        }

    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!emailInput || !passwordInput) return;
        setIsLoading(true);
        loginUser();
    };


    return (
        <div
            dir="rtl"
            className="h-full w-full absolute left-0 top-0 flex items-center justify-center font-sans text-right overflow-y-hidden z-10"
        >
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-blue-200 to-blue-900" />

            {/* Main Card Container */}
            <div className="relative z-20 w-full max-w-md px-4 py-6 bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col items-center">

                {/* --- LOGO & HEADER SECTION --- */}
                <div className="w-full text-center mb-8 mt-2">

                    {/* Custom University Logo SVG */}
                    <div className="mx-auto w-32 h-32 mb-4 drop-shadow-lg animate-[fadeIn_1s_ease-out]">
                        <Image
                            src="/aleppo_university_logo.svg"
                            alt="Aleppo university logo"
                            width={500}
                            height={300}
                        />
                    </div>

                    {/* Title Text */}
                    <h1 className="text-2xl font-bold text-slate-800 tracking-wide mb-1 font-arabic">تسجيل الدخول</h1>
                    <p className="text-sm text-blue-600/80 font-medium"> ديوان جامعة حلب </p>

                </div>

                {/* --- LOGIN FORM SECTION --- */}
                <form onSubmit={handleSubmit} className="w-full space-y-6 mb-8">
                    {/* Email Input Group */}
                    <div className="relative group transition-all duration-300">
                        <input
                            id="email"
                            type="email"
                            placeholder="البريد الإلكتروني"
                            value={emailInput}
                            onChange={(e) => setEmailInpt(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 pr-12 text-slate-700 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 placeholder:text-gray-400"
                            required
                        />

                        {/* FontAwesome Icon - User */}
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-300">
                            <FontAwesomeIcon icon={faEnvelope} className="w-5 h-5" />
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
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 pr-12 text-slate-700 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 placeholder:text-gray-400"
                            required
                        />

                        {/* FontAwesome Icon - Lock */}
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-300">
                            <FontAwesomeIcon icon={faLock} className="w-5 h-5" />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading || (!emailInput && !passwordInput)}
                        className={`w-full bg-blue-900 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-2 ${isLoading ? "cursor-not-allowed opacity-90" : "hover:bg-blue-800 focus:ring-4 focus:ring-blue-300"
                            }`}
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-3">
                                {/* Spinning Spinner SVG */}
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className="font-sans">جاري التحقق...</span>
                            </span>
                        ) : (
                            <>
                                <span className="font-sans"> تسجيل الدخول </span>
                            </>
                        )}
                    </button>

                </form>

                {/* --- FOOTER LINKS SECTION --- */}

                <footer className="flex flex-col w-full text-sm">
                    <div className="w-full mt-auto pt-6 border-t border-gray-100 flex items-center justify-center gap-4">

                        {/* Forgot Password Link */}
                        <Link href="/auth/forget-password" className="ml-auto text-blue-600 hover:text-blue-800 hover:underline decoration-dotted decoration-blue-300 underline-offset-4 transition-all duration-300 font-medium flex items-center gap-1 group">
                            استعادة كلمة المرور
                            <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        </Link>


                        {/* Help/Link */}
                        <Link href="/support" className="text-slate-500 hover:text-blue-600 transition-colors duration-300 flex items-center gap-1">
                            مساعدة؟
                        </Link>
                    </div>

                    {/* Signup Password Link */}
                    <Link href="/auth/signup" className="mx-auto text-blue-600 hover:text-blue-800 hover:underline decoration-dotted decoration-blue-300 underline-offset-4 transition-all duration-300 font-medium flex items-center gap-1 group">
                        ليس لديك حساب؟
                        <FontAwesomeIcon icon={faPlusCircle} className="w-4 h-4 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    </Link>
                </footer>

            </div>
        </div>
    );
}
