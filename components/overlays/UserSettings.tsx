import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faSignOutAlt,
    faUser,
    faTimes,
    faLock
} from '@fortawesome/free-solid-svg-icons'
import userSettingsOverlayStore from '@/store/userSettingsOverlayStore'
import { useRouter } from "next/navigation";
import { UserInfo } from '@/types/api/User/UserInfo';
import { apiWrapper } from '@/utils/apiClient';
import { useState } from 'react';


type Props = {
    user: UserInfo;
};

export default function UserSettingsOverlay({ user }: Props) {

    const { triggerUserSettings } = userSettingsOverlayStore()
    const [userRole, setUserRole] = useState("");
    const router = useRouter();

    const handleSignout = async () => {
        const res = await apiWrapper.post('/auth/logout')
        triggerUserSettings();
        localStorage.clear();
        router.push("/auth/login");
    }

    const handleChangePassword = async () => {
        triggerUserSettings();
        router.push("/auth/change-password");
    }

    const getUserRoleInArabic = (userRole: string) => {
        switch (user.role) {
            case "Dean":
                return ("عميد")
                break;
            case "Employee":
                return ("موظف")
                break;
            case "User":
                return ("دكتور")
                break;
            default:
                break;
        }
    }

    return (
        <div className="fixed top-16 left-4 w-96 z-50 flex items-center justify-end">
            {/* modal */}
            <div
                className="relative w-full max-w-md rounded-2xl shadow-xl p-6 bg-blue-600 text-white">
                {/* close button */}
                <button
                    onClick={triggerUserSettings}
                    className="absolute top-4 right-4 cursor-pointer text-white/80 hover:text-white">
                    <FontAwesomeIcon icon={faTimes} />
                </button>

                {/* user info */}
                <div className="flex flex-col items-center justify-center text-center gap-4 mb-6">
                    <div>
                        <p className="font-semibold text-lg">{user.name} | {getUserRoleInArabic(user.role)}</p>
                        <p
                            className="text-sm text-blue-100">
                            {user.email}
                        </p>
                    </div>
                </div>

                {/* actions */}
                <div className="flex gap-x-4  w-full">
                    <button
                        onClick={handleSignout}
                        className="flex w-1/2 items-center justify-center gap-x-4 p-2 rounded-lg transition bg-yellow-500 hover:bg-yellow-600 text-black"
                    >
                        <FontAwesomeIcon icon={faSignOutAlt} />
                        <span>تسجيل الخروج</span>
                    </button>

                    <button
                        onClick={handleChangePassword}
                        className="flex w-1/2 items-center justify-center gap-x-4 p-2 rounded-lg transition bg-yellow-500 hover:bg-yellow-600 text-black"
                    >
                        <FontAwesomeIcon icon={faLock} />
                        <span>تغير كلمة السر </span>
                    </button>
                </div>
            </div>
        </div >
    )
}