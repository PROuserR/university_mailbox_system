/* eslint-disable react-hooks/set-state-in-effect */
// app/unauthorized/page.tsx

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    faArrowRight,
    faCompass,
    faHouse,
    faTriangleExclamation,
    faSpinner,
} from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAuth } from "@/hooks/useAuth";

export default function Unauthorized() {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        if (!isLoading && !isAuthenticated()) {
            router.push("/auth/login");
        }
    }, [isLoading, isAuthenticated, router, mounted]);

    if (!mounted || isLoading) {
        return (
            <main
                dir="rtl"
                className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF5F5] via-[#FFF0F0] to-[#FFE8E8]"
            >
                <div className="flex flex-col items-center gap-4">
                    <FontAwesomeIcon
                        icon={faSpinner}
                        spin
                        className="text-4xl text-red-500"
                    />
                    <p className="text-slate-600 text-sm">جاري التحقق...</p>
                </div>
            </main>
        );
    }

    if (!isAuthenticated()) {
        return null;
    }

    return (
        <main
            dir="rtl"
            className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#FFF5F5] via-[#FFF0F0] to-[#FFE8E8]"
        >
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute right-[-80px] top-[-80px] h-[200px] w-[200px] rounded-full bg-red-400/20 blur-3xl" />
                <div className="absolute bottom-[-80px] left-[-80px] h-[180px] w-[180px] rounded-full bg-red-300/20 blur-3xl" />
                <div className="absolute left-1/2 top-1/2 h-[150px] w-[150px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-300/10 blur-3xl" />
            </div>

            <div className="absolute inset-0 bg-[linear-gradient(rgba(220,38,38,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(220,38,38,0.04)_1px,transparent_1px)] bg-[size:40px_40px]" />

            <section className="relative z-10 flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-8">
                <motion.div
                    initial={{
                        opacity: 0,
                        y: 30,
                        scale: 0.96,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                    }}
                    transition={{
                        duration: 0.5,
                        ease: "easeOut",
                    }}
                    className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-white/30 bg-white/50 shadow-[0_10px_40px_rgba(220,38,38,0.12)] backdrop-blur-3xl"
                >
                    <div className="grid min-h-[480px] grid-cols-1 md:grid-cols-2">

                        <div className="relative flex flex-col justify-center p-6 md:p-8 lg:p-10">
                            <div className="absolute left-[-40px] top-[-40px] h-32 w-32 rounded-full bg-red-300/20 blur-2xl" />

                            <motion.div
                                initial={{
                                    rotate: -15,
                                    scale: 0.8,
                                }}
                                animate={{
                                    rotate: 0,
                                    scale: 1,
                                }}
                                transition={{
                                    type: "spring",
                                    stiffness: 120,
                                }}
                                className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-red-400 text-2xl text-white shadow-lg shadow-red-500/30"
                            >
                                <FontAwesomeIcon icon={faTriangleExclamation} />
                            </motion.div>

                            <motion.h1
                                initial={{
                                    opacity: 0,
                                    y: 10,
                                }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                }}
                                transition={{
                                    delay: 0.1,
                                }}
                                className="text-5xl md:text-6xl font-black tracking-tight text-transparent bg-gradient-to-r from-red-700 via-red-500 to-red-400 bg-clip-text"
                            >
                                403
                            </motion.h1>

                            <motion.h2
                                initial={{
                                    opacity: 0,
                                    y: 12,
                                }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                }}
                                transition={{
                                    delay: 0.2,
                                }}
                                className="mt-3 text-2xl md:text-3xl font-bold text-slate-900"
                            >
                                الوصول غير مصرح به
                            </motion.h2>

                            <motion.p
                                initial={{
                                    opacity: 0,
                                    y: 12,
                                }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                }}
                                transition={{
                                    delay: 0.3,
                                }}
                                className="mt-4 text-sm md:text-base leading-7 text-slate-600 max-w-md"
                            >
                                عذراً، لا تملك الصلاحيات اللازمة للوصول إلى هذه
                                الصفحة أو تنفيذ هذا الإجراء.
                            </motion.p>

                            <motion.div
                                initial={{
                                    opacity: 0,
                                    y: 12,
                                }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                }}
                                transition={{
                                    delay: 0.4,
                                }}
                                className="mt-6 flex flex-wrap gap-3"
                            >
                                <Link href="/">
                                    <motion.div
                                        whileHover={{
                                            scale: 1.04,
                                        }}
                                        whileTap={{
                                            scale: 0.98,
                                        }}
                                        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-400 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-500/30"
                                    >
                                        <FontAwesomeIcon icon={faHouse} className="text-sm" />
                                        <span>الرئيسية</span>
                                    </motion.div>
                                </Link>

                                <motion.button
                                    whileHover={{
                                        scale: 1.03,
                                    }}
                                    whileTap={{
                                        scale: 0.97,
                                    }}
                                    onClick={() => window.history.back()}
                                    className="flex items-center gap-2 rounded-xl border border-white/40 bg-white/70 px-4 py-2.5 text-sm font-bold text-slate-700 shadow-lg backdrop-blur-xl"
                                >
                                    <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
                                    <span>رجوع</span>
                                </motion.button>
                            </motion.div>

                            <motion.div
                                animate={{
                                    y: [0, -6, 0],
                                }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 3,
                                    ease: "easeInOut",
                                }}
                                className="mt-6 flex w-fit items-center gap-2 rounded-full border border-red-200/40 bg-red-100/70 px-3 py-1.5 text-xs font-semibold text-red-900 shadow-lg backdrop-blur-xl"
                            >
                                <FontAwesomeIcon icon={faCompass} className="text-xs" />
                                <span>ليس لديك صلاحية الوصول</span>
                            </motion.div>
                        </div>

                        <div className="relative hidden items-center justify-center overflow-hidden bg-gradient-to-br from-[#FFE8E8] via-[#FFF0F0] to-[#FFF5F5] md:flex">
                            <div className="absolute left-6 top-6 h-20 w-20 rounded-full border border-red-200/40 bg-white/30 backdrop-blur-xl" />
                            <div className="absolute bottom-8 right-8 h-32 w-32 rounded-full border border-red-200/30 bg-red-100/20 backdrop-blur-2xl" />

                            <motion.div
                                animate={{
                                    y: [0, -10, 0],
                                }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 4,
                                    ease: "easeInOut",
                                }}
                                className="relative w-[320px] rounded-2xl border border-white/30 bg-white/60 p-6 shadow-[0_10px_40px_rgba(220,38,38,0.15)] backdrop-blur-2xl"
                            >
                                <div className="mb-6 flex items-center justify-between">
                                    <div>
                                        <div className="h-3 w-20 rounded-full bg-red-200" />
                                        <div className="mt-2 h-2 w-28 rounded-full bg-slate-200" />
                                    </div>
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-red-400 text-white shadow-lg">
                                        <FontAwesomeIcon icon={faCompass} className="text-sm" />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {[1, 2, 3].map((item) => (
                                        <motion.div
                                            key={item}
                                            whileHover={{
                                                scale: 1.01,
                                            }}
                                            className="rounded-xl border border-white/20 bg-[#FFF0F0] p-3 shadow-sm"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-2">
                                                    <div className="h-3 w-32 rounded-full bg-red-300" />
                                                    <div className="h-2 w-44 rounded-full bg-slate-200" />
                                                    <div className="h-2 w-24 rounded-full bg-slate-100" />
                                                </div>
                                                <div className="h-7 w-7 rounded-lg bg-red-300/80" />
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                <motion.div
                                    animate={{
                                        rotate: [0, 3, -3, 0],
                                    }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 5,
                                    }}
                                    className="absolute -bottom-4 -left-4 rounded-2xl bg-gradient-to-r from-red-300 to-red-200 px-4 py-2 text-2xl font-black text-red-700 shadow-xl"
                                >
                                    403
                                </motion.div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </section>
        </main>
    );
}