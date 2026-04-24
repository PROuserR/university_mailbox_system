"use client";

import { useState, FormEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUser,
    faLock,
    faChevronRight,
    faEnvelope,
    faUserTie
} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import axios from 'axios';
import Link from "next/link";

export default function SignupPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [agreeToTerms, setAgreeToTerms] = useState(false);
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [userType, setUserType] = useState("employee"); // New state for user type

    const signupUser = async () => {
        const userData = { "firstName": firstname, "lastName": lastname, "email": email, "password": password, "role": userType };
        const res = await axios.post("http://universitymailbox.runasp.net/api/users", userData)
        console.log(res)
    }

    const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert("كلمة المرور والتأكيد غير متطابقين");
            return;
        }
        if (!agreeToTerms) {
            alert("يرجى الموافقة على الشروط والأحكام");
            return;
        }
        signupUser()
        console.log("User registered:", { email, userType });
        alert("تم إنشاء الحساب بنجاح!");
    };

    return (
        <div
            dir="rtl"
            className="h-full w-full absolute left-0 top-0 flex items-center justify-center font-sans text-right overflow-y-hidden  z-10"
            style={{
                background: "linear-gradient(135deg, #f0f2f5 0%, #dbeafe 50%, #eff6ff 100%)"
            }}
        >
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none bg-gradient-to-br from-gray-50 via-transparent to-blue-900">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-100 opacity-50 blur-[100px]"></div>
                <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-indigo-100 opacity-50 blur-[100px]"></div>
            </div>

            {/* Main Card */}
            <div className="relative z-10 w-full max-w-[400px] bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 overflow-hidden">
                {/* Card Header (Logo & Title) */}
                <div className="pt-8 pb-6 px-8 text-center">
                    <div className="mx-auto w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 text-blue-600 shadow-inner">
                        <Image
                            src="/aleppo_university_logo.svg"
                            alt="Aleppo university logo"
                            width={500}
                            height={300}
                        />
                    </div>

                    <h1 className="text-2xl font-bold text-gray-800 mb-1"> انشاء حساب جديد </h1>
                    <p className="text-sm text-blue-600 font-medium tracking-wide">ديوان جامعة حلب</p>
                </div>

                {/* Form */}
                <form onSubmit={handleRegister} className="p-8 space-y-6">


                    {/* Firstname Input Group */}
                    <div className="relative group transition-all duration-300">
                        <input
                            id="firstname"
                            type="text"
                            placeholder="الاسم"
                            value={firstname}
                            onChange={(e) => setFirstname(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 pr-12 text-slate-700 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 placeholder:text-gray-400"
                            required
                        />

                        {/* FontAwesome Icon - User */}
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-300">
                            <FontAwesomeIcon icon={faUser} className="w-5 h-5" />
                        </div>
                    </div>

                    {/* Lastname Input Group */}
                    <div className="relative group transition-all duration-300">
                        <input
                            id="lastname"
                            type="text"
                            placeholder="الكنية"
                            value={lastname}
                            onChange={(e) => setLastname(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 pr-12 text-slate-700 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 placeholder:text-gray-400"
                            required
                        />

                        {/* FontAwesome Icon - User */}
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-300">
                            <FontAwesomeIcon icon={faUser} className="w-5 h-5" />
                        </div>
                    </div>



                    {/* Input Group: Email */}
                    <div className="relative group">
                        <input
                            type="email"
                            id="email"
                            placeholder="البريد الالكتروني"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-50 text-slate-700 border border-slate-200 rounded-xl px-5 py-4 pr-12 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all duration-300 placeholder:text-slate-400"
                            required
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                            <FontAwesomeIcon icon={faEnvelope} className="w-5 h-5" />
                        </div>
                    </div>

                    {/* Input Group: User Type */}
                    <div className="relative group">
                        <select
                            id="userType"
                            value={userType}
                            onChange={(e) => setUserType(e.target.value)}
                            className="w-full bg-slate-50 text-slate-700 border border-slate-200 rounded-xl px-5 py-4 pr-12 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all duration-300 placeholder:text-slate-400 appearance-none"
                            required
                        >
                            <option value="employee">موظف</option>
                            <option value="dean">مسؤول</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                            <FontAwesomeIcon icon={faUserTie} className="w-5 h-5" />
                        </div>
                    </div>

                    {/* Input Group: Password */}
                    <div className="relative group">
                        <input
                            type="password"
                            id="password"
                            placeholder="كلمة المرور"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-50 text-slate-700 border border-slate-200 rounded-xl px-5 py-4 pr-12 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all duration-300 placeholder:text-slate-400"
                            required
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                            <FontAwesomeIcon icon={faLock} className="w-5 h-5" />
                        </div>
                    </div>

                    {/* Input Group: Confirm Password */}
                    <div className="relative group">
                        <input
                            type="password"
                            id="confirmPassword"
                            placeholder="تأكيد كلمة المرور"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-slate-50 text-slate-700 border border-slate-200 rounded-xl px-5 py-4 pr-12 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all duration-300 placeholder:text-slate-400"
                            required
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                            <FontAwesomeIcon icon={faLock} className="w-5 h-5" />
                        </div>
                    </div>

                    {/* Checkbox Terms */}
                    {/* <div className="flex items-start gap-3 pt-1">
                        <div className="flex-1">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={agreeToTerms}
                                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-100 cursor-pointer"
                                />
                                <span className="text-sm text-slate-500 leading-none group-hover:text-slate-700 transition-colors">
                                    أوافق على <span className="text-slate-700 font-semibold">الشروط والأحكام</span> والسياسة الخاصة
                                </span>
                            </label>
                        </div>
                        <div className="text-xs text-slate-400">
                            <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4 opacity-50" />
                        </div>
                    </div> */}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-blue-900/20 transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        <span>إنشاء حساب</span>
                        <FontAwesomeIcon icon={faChevronRight} className="rotate-180 w-5 h-5" />
                    </button>

                </form>

                {/* Footer Links */}
                <div className="bg-slate-50 px-8 py-6 border-t border-slate-100 flex items-center justify-between text-xs">
                    <Link href="/auth/forget-password" className="text-blue-600 hover:text-blue-700 hover:underline decoration-blue-300 underline-offset-4 transition-all">
                        استعادة كلمة المرور
                    </Link>

                    <Link href="/support" className="text-slate-400 hover:text-blue-600 transition-colors">
                        مساعدة؟
                    </Link>
                </div>
            </div>
        </div>
    );
}