"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUserPlus,
    faSearch,
    faUserCircle,
} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import Link from "next/link";
import UserSettingsOverlay from "../overlays/UserSettings";
import userSettingsOverlayStore from "@/store/userSettingsOverlayStore";
import useSearchInputStore from "@/store/searchInputStore";
import useUserInfoStore from "@/store/userInfoStore";
import NotificationsDropdown from "../dropdown/NotificationsDropdown";

export default function Navbar() {
    const { isUserSettingsShown, triggerUserSettings } = userSettingsOverlayStore();
    const { email, firstname, lastname, role } = useUserInfoStore();
    const { setSearchInput } = useSearchInputStore()

    return (
        <nav className="w-full h-16 bg-blue-100 text-gray-800 flex items-center px-8 z-20" dir="rtl">
            {/* RIGHT (in RTL): Logo */}
            <Link href="/" className="flex items-center justify-center gap-8 mr-16">
                <Image width="48" height="48" src="/aleppo_university_logo.svg" alt="Aleppo university logo" />
            </Link>

            {/* CENTER: Search */}
            <div className="flex-1 max-w-xl mr-36">
                <div className="flex items-center bg-white rounded-2xl px-3 py-2 shadow-lg">
                    <input
                        type="text"
                        placeholder="بحث في البريد..."
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="bg-transparent outline-none w-full text-sm text-right"
                    />
                    <FontAwesomeIcon icon={faSearch} className="text-black ml-2" />
                </div>
            </div>

            {/* LEFT (in RTL): Actions */}
            <div className="flex items-center gap-4 mr-auto">

                <NotificationsDropdown />

                {/* Add user */}
                {role === "Dean" &&
                    <Link href="/auth/signup" className="flex bg-gradient-to-br from-blue-600 to-blue-400 p-2 rounded-2xl text-white shadow-lg h-10 w-10 items-center justify-center">
                        <FontAwesomeIcon
                            icon={faUserPlus}
                            className="text-base cursor-pointer"
                        />
                    </Link>}

                {/* Profile */}
                <div className="flex bg-gradient-to-br from-blue-600 to-blue-400 p-2 rounded-2xl text-white shadow-lg h-10 w-10 items-center justify-center" onClick={triggerUserSettings}>
                    <FontAwesomeIcon icon={faUserCircle} className="text-lg cursor-pointer" />
                </div>


            </div>

            {isUserSettingsShown ? <UserSettingsOverlay
                user={{
                    name: `${firstname} ${lastname}`,
                    email: email,
                    role: role
                }}
            /> : null}


        </nav>
    );
}