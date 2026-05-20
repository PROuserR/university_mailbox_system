// app/not-found.tsx

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
    faArrowRight,
    faCompass,
    faHouse,
    faMagnifyingGlass,
    faTriangleExclamation,
    faBell,
} from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function NotFound() {
    return (
        <main
            dir="rtl"
            className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#EEF5FF] via-[#F8FBFF] to-[#DDEBFF]"
        >
            {/* BACKGROUND GLOW */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute right-[-120px] top-[-100px] h-[300px] w-[300px] rounded-full bg-blue-400/20 blur-3xl" />

                <div className="absolute bottom-[-100px] left-[-120px] h-[280px] w-[280px] rounded-full bg-yellow-300/20 blur-3xl" />

                <div className="absolute left-1/2 top-1/2 h-[250px] w-[250px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300/10 blur-3xl" />
            </div>

            {/* GRID */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(37,99,235,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.04)_1px,transparent_1px)] bg-[size:55px_55px]" />

            {/* TOP BAR */}
            <header className="relative z-20 border-b border-white/30 bg-white/60 backdrop-blur-2xl">
                <div className="flex items-center justify-between px-6 py-4">
                    {/* RIGHT */}
                    <div className="flex items-center gap-3">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-sky-400 shadow-lg shadow-blue-500/20"
                        >
                            <FontAwesomeIcon
                                icon={faBell}
                                className="text-white"
                            />
                        </motion.div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-100 bg-white shadow-md">
                            <div className="h-5 w-5 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500" />
                        </div>
                    </div>

                    {/* SEARCH */}
                    <div className="relative w-full max-w-lg">
                        <FontAwesomeIcon
                            icon={faMagnifyingGlass}
                            className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            placeholder="ابحث في النظام..."
                            className="w-full rounded-2xl border border-white/30 bg-white/80 py-3 pr-12 pl-5 text-right shadow-lg outline-none backdrop-blur-xl placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-200/40"
                        />
                    </div>

                    {/* LOGO */}
                    <div className="hidden md:block">
                        <div className="rounded-2xl bg-white/80 px-5 py-2 font-bold text-slate-700 shadow-lg">
                            نظام البريد
                        </div>
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <section className="relative z-10 flex min-h-[calc(100vh-80px)] items-center justify-center px-6 py-16">
                <motion.div
                    initial={{
                        opacity: 0,
                        y: 40,
                        scale: 0.96,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                    }}
                    transition={{
                        duration: 0.6,
                        ease: "easeOut",
                    }}
                    className="relative w-full max-w-6xl overflow-hidden rounded-[40px] border border-white/30 bg-white/50 shadow-[0_20px_80px_rgba(37,99,235,0.15)] backdrop-blur-3xl"
                >
                    <div className="grid min-h-[650px] grid-cols-1 lg:grid-cols-2">
                        {/* LEFT SIDE */}
                        <div className="relative flex flex-col justify-center overflow-hidden p-10 lg:p-16">
                            {/* Decorative */}
                            <div className="absolute left-[-60px] top-[-60px] h-44 w-44 rounded-full bg-blue-300/20 blur-3xl" />

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
                                className="mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-600 to-cyan-400 text-4xl text-white shadow-2xl shadow-blue-500/30"
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
                                className="text-7xl font-black tracking-tight text-transparent bg-gradient-to-r from-blue-700 via-sky-500 to-cyan-400 bg-clip-text"
                            >
                                404
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
                                className="mt-5 text-4xl font-bold text-slate-900"
                            >
                                الصفحة غير موجودة
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
                                className="mt-6 max-w-xl text-lg leading-9 text-slate-600"
                            >
                                يبدو أن الصفحة التي تحاول الوصول إليها غير موجودة أو ربما
                                تم نقلها أو حذفها من النظام.
                            </motion.p>

                            {/* BUTTONS */}
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
                                className="mt-10 flex flex-wrap gap-4"
                            >
                                <Link href="/">
                                    <motion.div
                                        whileHover={{
                                            scale: 1.04,
                                        }}
                                        whileTap={{
                                            scale: 0.98,
                                        }}
                                        className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-400 px-7 py-4 font-bold text-white shadow-xl shadow-blue-500/30"
                                    >
                                        <FontAwesomeIcon icon={faHouse} />

                                        <span>العودة للرئيسية</span>
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
                                    className="flex items-center gap-3 rounded-2xl border border-white/40 bg-white/70 px-7 py-4 font-bold text-slate-700 shadow-lg backdrop-blur-xl"
                                >
                                    <FontAwesomeIcon icon={faArrowRight} />

                                    <span>الرجوع للخلف</span>
                                </motion.button>
                            </motion.div>

                            {/* STATUS BADGE */}
                            <motion.div
                                animate={{
                                    y: [0, -8, 0],
                                }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 3,
                                    ease: "easeInOut",
                                }}
                                className="mt-12 flex w-fit items-center gap-3 rounded-full border border-yellow-200/40 bg-yellow-100/70 px-5 py-3 text-sm font-semibold text-yellow-900 shadow-lg backdrop-blur-xl"
                            >
                                <FontAwesomeIcon icon={faCompass} />

                                <span>ربما ضللت الطريق داخل النظام</span>
                            </motion.div>
                        </div>

                        {/* RIGHT SIDE */}
                        <div className="relative hidden items-center justify-center overflow-hidden bg-gradient-to-br from-[#DCEEFF] via-[#EEF6FF] to-[#F8FBFF] lg:flex">
                            {/* Decorative Circles */}
                            <div className="absolute left-10 top-10 h-32 w-32 rounded-full border border-blue-200/40 bg-white/30 backdrop-blur-xl" />

                            <div className="absolute bottom-12 right-12 h-52 w-52 rounded-full border border-cyan-200/30 bg-cyan-100/20 backdrop-blur-2xl" />

                            {/* Main Card */}
                            <motion.div
                                animate={{
                                    y: [0, -12, 0],
                                }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 4,
                                    ease: "easeInOut",
                                }}
                                className="relative w-[420px] rounded-[36px] border border-white/30 bg-white/60 p-8 shadow-[0_20px_60px_rgba(59,130,246,0.2)] backdrop-blur-2xl"
                            >
                                {/* Header */}
                                <div className="mb-8 flex items-center justify-between">
                                    <div>
                                        <div className="h-4 w-28 rounded-full bg-blue-200" />

                                        <div className="mt-3 h-3 w-40 rounded-full bg-slate-200" />
                                    </div>

                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-sky-400 text-white shadow-xl">
                                        <FontAwesomeIcon icon={faCompass} />
                                    </div>
                                </div>

                                {/* Fake Content */}
                                <div className="space-y-5">
                                    {[1, 2, 3].map((item) => (
                                        <motion.div
                                            key={item}
                                            whileHover={{
                                                scale: 1.02,
                                            }}
                                            className="rounded-2xl border border-white/20 bg-[#EEF6FF] p-5 shadow-md"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-3">
                                                    <div className="h-4 w-44 rounded-full bg-blue-300" />

                                                    <div className="h-3 w-60 rounded-full bg-slate-200" />

                                                    <div className="h-3 w-32 rounded-full bg-slate-100" />
                                                </div>

                                                <div className="h-10 w-10 rounded-xl bg-yellow-300/80" />
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Floating 404 */}
                                <motion.div
                                    animate={{
                                        rotate: [0, 4, -4, 0],
                                    }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 5,
                                    }}
                                    className="absolute -bottom-6 -left-6 rounded-3xl bg-gradient-to-r from-yellow-300 to-yellow-200 px-6 py-4 text-3xl font-black text-slate-900 shadow-2xl"
                                >
                                    404
                                </motion.div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </section>
        </main>
    );
}