'use client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import myAPI from '@/utils/myAPI';


export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const router = useRouter();

    const forgetPassword = async () => {
        const userData = { "email": email };
        const res = await myAPI.post("/auth/forgot-password", userData)
        if (res.status === 200) {
            toast.success("تم ارسال الكود بنجاح");
            router.push("/");
        }
        else{
            toast.error("هناك خطأ, لم يتم ارسال الكود");
        }
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Handle form submission logic (e.g., calling an API to send reset link)
        forgetPassword();

    };

    return (
        // Main Container: Centers content on the screen
        <div
            className="h-full w-full absolute left-0 top-0 flex items-center justify-center font-sans text-right overflow-y-hidden z-10">

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-blue-200 to-blue-900" />

            <Toaster />

            {/* Card Wrapper: Defines the visible, contained element */}
            <div className="relative z-20 w-full max-w-md px-4 py-6 bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col items-center">

                {/* Header Section (Logo and Title) */}
                <div className="text-center mb-16">
                    <h1 className="text-3xl font-extrabold text-gray-800 mt-4">
                        استعادة كلمة المرور
                    </h1>
                    <p className="text-gray-500 mt-1 text-base">
                        يرجى إدخال بريدك الإلكتروني لاستقبال رابط إعادة تعيين كلمة المرور.
                    </p>
                </div>

                {/* The Form */}
                <form onSubmit={handleSubmit} className="space-y-8 w-full">
                    {/* Input Field: Email/Username */}
                    <div>
                        <div className="relative flex flex-row-reverse items-center">
                            {/* Icon Placement */}
                            <div className="absolute inset-y-0 right-4 pl-3 flex items-center pointer-events-none">
                                <FontAwesomeIcon icon={faEnvelope} className="text-gray-400" />
                            </div>

                            {/* Input Element */}
                            <input
                                id="email"
                                name="email"
                                type="email"
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="البريد الإلكتروني"
                                required
                                className="block w-full pr-12 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 text-right"
                            />
                        </div>
                    </div>

                    {/* Forgot Password Button (Primary Action) */}
                    <button
                        type="submit"
                        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                    >
                        إرسال رابط إعادة التعيين
                        <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                    </button>
                </form>

                {/* Footer Links */}
                <div className="mt-8 text-center space-y-4">
                    <div className="flex justify-center items-center text-sm text-gray-600">
                        هل نسيت شيئًا آخر؟
                        <a href="/support" className="ml-1 font-medium text-blue-600 hover:text-blue-800 cursor-pointer">
                            مساعدة
                        </a>
                    </div>

                    {/* If the user is on a truly lost screen, maybe link back to login */}
                    <a href="/" className="text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer block">
                        العودة إلى الصفحة الرئيسية
                    </a>
                </div>
            </div>
        </div>
    );
};
