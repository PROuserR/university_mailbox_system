'use client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faSignOutAlt,
    faUser,
    faTimes
} from '@fortawesome/free-solid-svg-icons'
import useUserSettingsStore from '@/store/userSettingsStore'
import { useRouter } from "next/navigation";
import axios from 'axios';


export default function UserSettingsOverlay({
    user,
}: Props) {


    const { triggerUserSettings } = useUserSettingsStore()
    const router = useRouter();

    const handleSignout = async () => {
        const res = await axios.post('/api/logout', {
            credentials: 'include'
        })
        triggerUserSettings();
        router.push("/auth/login");
    }

    return (
        <div className="fixed top-16 left-4 w-full z-50 flex items-center justify-end">
            {/* modal */}
            <div
                className="relative w-[90%] max-w-md rounded-2xl shadow-xl p-6 bg-blue-600 text-white">
                {/* close button */}
                <button
                    onClick={triggerUserSettings}
                    className="absolute top-4 right-4 cursor-pointer text-white/80 hover:text-white">
                    <FontAwesomeIcon icon={faTimes} />
                </button>

                {/* user info */}
                <div className="flex flex-col items-center justify-center text-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200">
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
                    </div>

                    <div>
                        <p className="font-semibold text-lg">{user.name}</p>
                        <p
                            className="text-sm text-blue-100">
                            {user.email}
                        </p>
                    </div>
                </div>

                {/* actions */}
                <div className="flex flex-col gap-3 w-full">

                    <button
                        onClick={handleSignout}
                        className="flex items-center justify-center gap-x-4 px-4 py-3 rounded-lg transition bg-red-500 hover:bg-red-600 text-white"
                    >
                        <FontAwesomeIcon icon={faSignOutAlt} />
                        <span>تسجيل الخروج</span>
                    </button>

                </div>
            </div>
        </div >
    )
}