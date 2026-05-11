"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faAdd,
    faSearch,
    faUserCircle
} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import Link from "next/link";
import UserSettingsOverlay from "../overlays/UserSettings";
import userSettingsOverlayStore from "@/store/userSettingsOverlayStore";
import useSearchInputStore from "@/store/searchInputStore";
import useUserInfoStore from "@/store/userInfoStore";

export default function Navbar() {
    const { isUserSettingsShown, triggerUserSettings } = userSettingsOverlayStore();
    const { email, firstname, lastname, role } = useUserInfoStore();
    const { setSearchInput } = useSearchInputStore()

    return (
        <nav className="w-full h-16 bg-blue-100 text-gray-800 flex items-center px-6 z-20" dir="rtl">
            {/* RIGHT (in RTL): Logo */}
            <Link href="/" className="flex items-center justify-center gap-8">
                <Image width="48" height="48" src="/aleppo_university_logo.svg" alt="Aleppo university logo" />
                <span className="font-bold text-xl">ديوان جامعة حلب </span>
            </Link>

            {/* CENTER: Search */}
            <div className="flex-1 max-w-xl mr-10">
                <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
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
            <div className="flex items-center gap-5 mr-auto">
                {/* Add user */}
                {role === "Dean" &&
                    <Link href="/auth/signup">
                        <FontAwesomeIcon
                            icon={faAdd}
                            className="text-lg cursor-pointer"
                        />
                    </Link>}


                {/* Settings */}
                {/* <Link href="/settings">
                    <FontAwesomeIcon
                        icon={faGear}
                        className="text-lg cursor-pointer"
                    />
                </Link> */}

                {/* Profile */}
                <div className="flex items-center gap-2 cursor-pointer" onClick={triggerUserSettings}>
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