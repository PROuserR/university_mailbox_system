"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCircleQuestion,
    faGear,
    faSearch,
    faUserCircle
} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import Link from "next/link";
import UserSettingsOverlay from "../overlays/UserSettings";
import userSettingsOverlayStore from "@/store/userSettingsOverlayStore";
import userInfoStore from "@/store/userInfoStore";
import useSearchInputStore from "@/store/searchInputStore";

export default function Navbar() {
    const { isUserSettingsShown, triggerUserSettings } = userSettingsOverlayStore();
    const { email, firstname, lastname } = userInfoStore();
    const { setSearchInput } = useSearchInputStore()

    return (
        <nav className="w-full h-16 bg-blue-100 text-gray-800 flex items-center justify-between px-6" dir="rtl">
            {/* RIGHT (in RTL): Logo */}
            <div className="flex items-center gap-2">
                <Image width="48" height="48" src="/aleppo_university_logo.svg" alt="Aleppo university logo" />
            </div>

            {/* CENTER: Search */}
            <div className="flex-1 max-w-xl ml-[40%]">
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