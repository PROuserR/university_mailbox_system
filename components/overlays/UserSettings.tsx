import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faSignOutAlt,
    faUser,
    faTimes,
    faLock
} from '@fortawesome/free-solid-svg-icons'
import userSettingsOverlayStore from '@/store/userSettingsOverlayStore'
import { useRouter } from "next/navigation";
import { UserInfo } from '@/types/api/UserInfo';
import { apiWrapper } from '@/utils/apiClient';


type Props = {
    user: UserInfo;
};

export default function UserSettingsOverlay({ user }: Props) {

    const { triggerUserSettings } = userSettingsOverlayStore()
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
                    {/* <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200">
                        {user.avatar ? (
                            <img
                                src={user.avatar}
                                alt="avatar"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <FontAwesomeIcon icon={faUser} />
                            </div>
                        )}
                    </div> */}

                    <div>
                        <p className="font-semibold text-lg">{user.name}</p>
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
                        className="flex w-1/2 items-center justify-center gap-x-4 p-2 rounded-lg transition bg-red-500 hover:bg-red-600 text-white"
                    >
                        <FontAwesomeIcon icon={faSignOutAlt} />
                        <span>تسجيل الخروج</span>
                    </button>

                    <button
                        onClick={handleChangePassword}
                        className="flex w-1/2 items-center justify-center gap-x-4 p-2 rounded-lg transition bg-red-500 hover:bg-red-600 text-white"
                    >
                        <FontAwesomeIcon icon={faLock} />
                        <span>تغير كلمة السر </span>
                    </button>
                </div>
            </div>
        </div >
    )
}