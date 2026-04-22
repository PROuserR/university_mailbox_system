"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCircleQuestion,
    faGear,
    faSearch,
} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";

export default function Navbar() {
    return (
        <nav className="w-full h-16 bg-white border-b flex items-center justify-between px-6" dir="rtl">

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
                    <FontAwesomeIcon icon={faSearch} className="text-gray-400 ml-2" />
                </div>
            </div>

            {/* LEFT (in RTL): Actions */}
            <div className="flex items-center gap-5">

                {/* Help */}
                <FontAwesomeIcon
                    icon={faCircleQuestion}
                    className="text-gray-600 text-lg cursor-pointer"
                />

                {/* Settings */}
                <FontAwesomeIcon
                    icon={faGear}
                    className="text-gray-600 text-lg cursor-pointer"
                />

                {/* Profile */}
                <div className="flex items-center gap-2 cursor-pointer">
                    <div className="hidden md:block text-sm text-right">
                        <p className="text-gray-700 font-medium">د. سارة جونسون</p>
                        <p className="text-gray-400 text-xs">أستاذة</p>
                    </div>
                    <img
                        src="/avatar.png"
                        alt="profile"
                        className="w-8 h-8 rounded-full object-cover"
                    />
                </div>
            </div>
        </nav>
    );
}