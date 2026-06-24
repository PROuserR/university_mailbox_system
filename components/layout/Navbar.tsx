"use client";

import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUserEdit,
    faSearch,
    faUserCircle,
    faAngleRight,
    faChartBar,
    faFile,
    faMessage,
} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import Link from "next/link";
import UserSettingsOverlay from "../overlays/UserSettings";
import userSettingsOverlayStore from "@/store/userSettingsOverlayStore";
import useSearchInputStore from "@/store/searchInputStore";
import useUserInfoStore from "@/store/userInfoStore";
import NotificationsDropdown from "../dropdown/NotificationsDropdown";
import useSidebarToggleStore from "@/store/sidebarToggleStore";
import { usePathname } from "next/navigation";

export default function Navbar() {
    const {
        isUserSettingsShown,
        triggerUserSettings,
    } = userSettingsOverlayStore();

    const {
        email,
        firstname,
        lastname,
        role,
    } = useUserInfoStore();

    const { setSearchInput } =
        useSearchInputStore();

    const { isSidebarToggleShown, triggerSidebar } = useSidebarToggleStore();
    const pathname = usePathname();

    return (
        <nav
            className="flex h-16 w-full items-center border-b border-blue-200/50 bg-blue-100/90 px-8 text-gray-800 backdrop-blur-md"
            dir="rtl"
        >

            {/* RIGHT (RTL) - Logo + Toggle Button */}
            <motion.div
                className={`flex items-center justify-center gap-8  ${isSidebarToggleShown ? "mr-12" : "-mr-1"}`}
            >
                {pathname === "/" && <motion.button
                    whileHover={{
                        scale: 1.25,
                    }}
                    whileTap={{
                        scale: 0.96,
                    }}
                    onClick={triggerSidebar} className="text-xl">
                    <FontAwesomeIcon icon={faAngleRight} />
                </motion.button>}

                <Link
                    href="/"
                >
                    <motion.div
                        whileHover={{
                            scale: 1.1,
                        }}
                        whileTap={{
                            scale: 0.96,
                        }}
                    >
                        <Image
                            width="48"
                            height="48"
                            src="/aleppo_university_logo.svg"
                            alt="Aleppo university logo"
                            className="drop-shadow-md"
                        />
                    </motion.div>
                </Link>

            </motion.div>

            {/* CENTER - Search */}
            <div className="mr-36 max-w-xl flex-1">
                <motion.div
                    whileHover={{
                        scale: 1.015,
                    }}
                    whileFocus={{
                        scale: 1.02,
                    }}
                    className="group flex items-center rounded-2xl border border-transparent bg-white px-3 py-2 shadow-lg transition-all duration-300 focus-within:border-blue-300 focus-within:shadow-blue-200/60"
                >
                    <motion.input
                        type="text"
                        placeholder="بحث في البريد..."
                        onChange={(e) =>
                            setSearchInput(
                                e.target.value
                            )
                        }
                        className="w-full bg-transparent text-right text-sm outline-none"
                    />

                    <motion.div
                        whileHover={{
                            rotate: 12,
                            scale: 1.15,
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                        }}
                    >
                        <FontAwesomeIcon
                            icon={faSearch}
                            className="ml-2 text-gray-500 transition-colors duration-300 group-focus-within:text-blue-600"
                        />
                    </motion.div>
                </motion.div>
            </div>

            {/* LEFT (RTL) - Actions */}
            <div className="mr-auto flex items-center gap-4">

                {/* Edit Document Types */}
                {role === "Dean" && (
                    <motion.div
                        whileHover={{
                            y: -2,
                            scale: 1.03,
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                        }}
                    >
                        <Link
                            href="/document-types"
                            className="group relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-blue-400 text-white shadow-lg"
                        >
                            {/* Glow effect */}
                            <div className="absolute inset-0 bg-white/0 transition duration-300 group-hover:bg-white/10" />

                            <FontAwesomeIcon
                                icon={faFile}
                                className="relative z-10 cursor-pointer text-base transition-transform duration-300 group-hover:scale-110"
                            />
                        </Link>
                    </motion.div>
                )}

                {/* Edit Sender Entities */}
                {role === "Dean" && (
                    <motion.div
                        whileHover={{
                            y: -2,
                            scale: 1.03,
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                        }}
                    >
                        <Link
                            href="/sender-entities"
                            className="group relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-blue-400 text-white shadow-lg"
                        >
                            {/* Glow effect */}
                            <div className="absolute inset-0 bg-white/0 transition duration-300 group-hover:bg-white/10" />

                            <FontAwesomeIcon
                                icon={faMessage}
                                className="relative z-10 cursor-pointer text-base transition-transform duration-300 group-hover:scale-110"
                            />
                        </Link>
                    </motion.div>
                )}

                {/* Edit users */}
                {role === "Dean" && (
                    <motion.div
                        whileHover={{
                            y: -2,
                            scale: 1.03,
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                        }}
                    >
                        <Link
                            href="/users"
                            className="group relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-blue-400 text-white shadow-lg"
                        >
                            {/* Glow effect */}
                            <div className="absolute inset-0 bg-white/0 transition duration-300 group-hover:bg-white/10" />

                            <FontAwesomeIcon
                                icon={faUserEdit}
                                className="relative z-10 cursor-pointer text-base transition-transform duration-300 group-hover:scale-110"
                            />
                        </Link>
                    </motion.div>
                )}

                {/* Statistics  */}
                {role === "Dean" ? (
                    <Link href="/statistics">
                        {/* Statistics */}
                        <motion.button
                            whileHover={{
                                y: -2,
                                scale: 1.03,
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                            }}
                            className="group relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-blue-400 text-white shadow-lg"
                        >
                            {/* Animated shine */}
                            <motion.div
                                initial={{
                                    x: "-120%",
                                }}
                                whileHover={{
                                    x: "120%",
                                }}
                                transition={{
                                    duration: 0.7,
                                }}
                                className="absolute inset-0 w-1/2 skew-x-12 bg-white/20 blur-sm"
                            />

                            <FontAwesomeIcon
                                icon={faChartBar}
                                className="relative z-10 cursor-pointer text-lg transition-transform duration-300 group-hover:scale-110"
                            />
                        </motion.button>
                    </Link>
                ): 
                    <Link href="/user-statistics">
                        {/* Statistics */}
                        <motion.button
                            whileHover={{
                                y: -2,
                                scale: 1.03,
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                            }}
                            className="group relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-blue-400 text-white shadow-lg"
                        >
                            {/* Animated shine */}
                            <motion.div
                                initial={{
                                    x: "-120%",
                                }}
                                whileHover={{
                                    x: "120%",
                                }}
                                transition={{
                                    duration: 0.7,
                                }}
                                className="absolute inset-0 w-1/2 skew-x-12 bg-white/20 blur-sm"
                            />

                            <FontAwesomeIcon
                                icon={faChartBar}
                                className="relative z-10 cursor-pointer text-lg transition-transform duration-300 group-hover:scale-110"
                            />
                        </motion.button>
                    </Link>
                }

                {/* Notifications */}
                <motion.div
                    whileHover={{
                        y: -2,
                        scale: 1.03,
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 300,
                    }}
                >
                    <NotificationsDropdown />
                </motion.div>



                {/* Profile */}
                <motion.button
                    whileHover={{
                        y: -2,
                        scale: 1.03,
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 300,
                    }}
                    onClick={
                        triggerUserSettings
                    }
                    className="group relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-blue-400 text-white shadow-lg"
                >
                    {/* Animated shine */}
                    <motion.div
                        initial={{
                            x: "-120%",
                        }}
                        whileHover={{
                            x: "120%",
                        }}
                        transition={{
                            duration: 0.7,
                        }}
                        className="absolute inset-0 w-1/2 skew-x-12 bg-white/20 blur-sm"
                    />

                    <FontAwesomeIcon
                        icon={faUserCircle}
                        className="relative z-10 cursor-pointer text-lg transition-transform duration-300 group-hover:scale-110"
                    />
                </motion.button>

            </div>

            {isUserSettingsShown ? (
                <UserSettingsOverlay
                    user={{
                        name: `${firstname} ${lastname}`,
                        email: email,
                        role: role,
                    }}
                />
            ) : null}
        </nav>
    );
}