"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import myAPI from "@/utils/myAPI";

export default function ChangePasswordPage() {
    const router = useRouter();

    const [currentPasswordInput, setCurrentPasswordInput] = useState("");
    const [newPasswordInput, setNewPasswordInput] = useState("");
    const [confirmNewPasswordInput, setConfirmNewPasswordInput] = useState("");
    const [loading, setLoading] = useState(false);

    const changePassword = async () => {
        const data = { "currentPassword": currentPasswordInput, "newPassword": newPasswordInput };
        const res = await myAPI.post("/auth/change-password", data);
        console.log("change-password")
        console.log(res)
        if (res.status === 200) {
            setNewPasswordInput("");
            setConfirmNewPasswordInput("");
            toast.success("تم تغير كلمة المرور بنجاح");
            // redirect after success
            router.push("/");
        }
        setLoading(false);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newPasswordInput || !confirmNewPasswordInput) {
            return toast.error("يرجى تعبئة جميع الحقول");
        }

        if (newPasswordInput.length < 8) {
            return toast.error("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
        }

        if (newPasswordInput !== confirmNewPasswordInput) {
            return toast.error("كلمتا المرور غير متطابقتين");
        }

        setLoading(true);
        changePassword();
    };

    return (
        <div
            dir="rtl"
            className="h-full w-full absolute left-0 top-0 flex items-center justify-center font-sans text-right overflow-y-hidden z-10"
        >
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-blue-200 to-blue-900" />

            <Toaster position="top-center" />

            <div className="relative gap-4 z-20 w-full max-w-md px-4 py-6 bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col items-center justify-center">
                {/* Header */}
                <header className="mb-6 text-center">
                    <h1 className="text-2xl font-bold text-gray-800">
                        إعادة تعيين كلمة المرور
                    </h1>
                    <p className="text-sm text-gray-500 mt-2">
                        أدخل كلمة مرور جديدة لحسابك
                    </p>
                </header>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
                    {/* Current Password */}
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">
                            كلمة المرور الحالية
                        </label>

                        {/* Password Input Group */}
                        <div className="relative group transition-all duration-300">
                            <input
                                id="currentPassword"
                                type="password"
                                placeholder="********"
                                value={currentPasswordInput}
                                onChange={(e) => setCurrentPasswordInput(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 pr-12 text-slate-700 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 placeholder:text-gray-400"
                                required
                            />

                            {/* FontAwesome Icon - Lock */}
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-300">
                                <FontAwesomeIcon icon={faLock} className="w-5 h-5" />
                            </div>
                        </div>
                    </div>

                    {/* New Password */}
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">
                            كلمة المرور الجديدة
                        </label>

                        {/* Password Input Group */}
                        <div className="relative group transition-all duration-300">
                            <input
                                id="password"
                                type="password"
                                placeholder="********"
                                value={newPasswordInput}
                                onChange={(e) => setNewPasswordInput(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 pr-12 text-slate-700 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 placeholder:text-gray-400"
                                required
                            />

                            {/* FontAwesome Icon - Lock */}
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-300">
                                <FontAwesomeIcon icon={faLock} className="w-5 h-5" />
                            </div>
                        </div>
                    </div>

                    {/* Confirm New Password */}
                    <div >
                        <label className="block text-sm text-gray-600 mb-1">
                            تأكيد كلمة المرور
                        </label>

                        {/* Password Confirm Input Group */}
                        <div className="relative group transition-all duration-300">
                            <input
                                id="passwordConfirm"
                                type="password"
                                placeholder="********"
                                value={confirmNewPasswordInput}
                                onChange={(e) => setConfirmNewPasswordInput(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 pr-12 text-slate-700 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 placeholder:text-gray-400"
                                required
                            />
                            {/* FontAwesome Icon - Lock */}
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-300">
                                <FontAwesomeIcon icon={faLock} className="w-5 h-5" />
                            </div>
                        </div>
                    </div>


                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {loading ? "جاري المعالجة..." : "تأكيد التغيير"}
                    </button>
                </form>

                {/* Footer */}
                <footer className="text-center flex flex-col gap-4">
                    <p className="text-xs text-gray-400 text-center mt-6">
                        تأكد من اختيار كلمة مرور قوية تحتوي على حروف وأرقام
                    </p>
                    <Link href="/">
                        العودة الى الصفحة الرئيسية
                    </Link>
                </footer>

            </div>
        </div>
    );
}