"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCircleQuestion,
    faGear,
    faSearch,
    faUserCircle,
    faBars,      
    faTimes,
} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import Link from "next/link";
import UserSettingsOverlay from "../overlays/UserSettings";
import useUserSettingsStore from "@/store/userSettingsStore";
import userInfoStore from "@/store/userInfoStore";
import { useEffect, useState } from "react";

interface NavbarProps {
    onMenuClick?: () => void;
    isMenuOpen?: boolean;
}


export default function Navbar({ onMenuClick, isMenuOpen }: NavbarProps) {
    const { isUserSettingsShown, triggerUserSettings } = useUserSettingsStore();
    const { email, firstname, lastname } = userInfoStore();
    const [isSmallScreen, setIsSmallScreen] = useState(false);

    useEffect(() => {
        const checkScreenSize = () => {
            setIsSmallScreen(window.innerWidth < 1024);
        };
        checkScreenSize();
        window.addEventListener("resize", checkScreenSize);
        return () => window.removeEventListener("resize", checkScreenSize);
    }, []);
    return (
        <nav className="w-full h-16 bg-blue-100 text-gray-800 flex items-center justify-between px-6" dir="rtl">

            {/* ✅ زر القائمة - يظهر فقط على الشاشات الصغيرة */}
            {isSmallScreen && (
                <button
                    onClick={onMenuClick}
                    className="p-2 rounded-lg hover:bg-blue-200 transition ml-2"
                    aria-label={isMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
                >
                    <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} className="h-5 w-5 text-gray-700" />
                </button>
            )}

            {/* RIGHT (in RTL): Logo */}
            <div className="flex items-center gap-2">
                <Image width="48" height="48" src="/aleppo_university_logo.svg" alt="Aleppo university logo" />
            </div>

            {/* CENTER: Search */}
            <div className="flex-1 max-w-xl ml-[40%]">
                <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
                    <input
                        type="text"
                        placeholder="ابحث في البريد، الأشخاص، المجموعات..."
                        className="bg-transparent outline-none w-full text-sm text-right"
                    />
                    <FontAwesomeIcon icon={faSearch} className="text-black ml-2" />
                </div>
            </div>

            {/* LEFT (in RTL): Actions */}
            <div className="flex items-center gap-5">

                {/* Help */}
                <Link href="/support">
                    <FontAwesomeIcon
                        icon={faCircleQuestion}
                        className="text-lg cursor-pointer"
                    />
                </Link>

                {/* Settings */}
                <Link href="/settings">
                    <FontAwesomeIcon
                        icon={faGear}
                        className="text-lg cursor-pointer"
                    />
                </Link>

                {/* Profile */}
                <div className="flex items-center gap-2 cursor-pointer" onClick={triggerUserSettings}>
                    <FontAwesomeIcon icon={faUserCircle} className="text-lg cursor-pointer" />
                </div>
            </div>

            {isUserSettingsShown ? <UserSettingsOverlay
                user={{
                    name: `${firstname} ${lastname}`,
                    email: email
                }}
            /> : null}


        </nav>
    );
}