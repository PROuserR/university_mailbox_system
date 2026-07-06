import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faSignOutAlt,
    faTimes,
    faUserEdit,
    faChartArea,
    faUserAlt
} from '@fortawesome/free-solid-svg-icons'
import userSettingsOverlayStore from '@/store/userSettingsOverlayStore'
import { useRouter } from "next/navigation";
import { UserInfo } from '@/types/api/User/UserInfo';
import { apiWrapper } from '@/utils/apiClient';
import useUserInfoStore from '@/store/userInfoStore';


type Props = {
    user: UserInfo;
};

export default function UserSettingsOverlay({ user }: Props) {

    const { triggerUserSettings } = userSettingsOverlayStore()
    const {
        role,
    } = useUserInfoStore();
    const router = useRouter();

    const handleSignout = async () => {
        await apiWrapper.post('/auth/logout')
        triggerUserSettings();
        localStorage.clear();
        router.push("/auth/login");
    }

    const handleStatisticsPageNavigation = async () => {
        triggerUserSettings();
        router.push("statistics");
    }

    const handleProfileNavigation = async () => {
        triggerUserSettings();
        if (role === "Dean" || role == "Admin") {
            router.push("/statistics");
        }
        else {
            router.push("/user-statistics");
        }
    }

    const handleDelegationsPage = async () => {
        triggerUserSettings();
        router.push("/delegations");

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
                <div className="flex flex-col gap-y-4 items-center w-full">
                    <button
                        onClick={handleStatisticsPageNavigation}
                        className="flex w-48 items-center justify-center  p-2 rounded-lg transition bg-yellow-500 hover:bg-yellow-600 text-black"
                    >
                        <div className='flex w-2/3 items-center justify-center'>
                            <span> احصائيات </span>
                        </div>
                        <div className='flex w-1/3 items-center justify-center'>
                            <FontAwesomeIcon icon={faChartArea} />
                        </div>

                    </button>

                    <button
                        onClick={handleDelegationsPage}
                        className="flex w-48 items-center justify-center  p-2 rounded-lg transition bg-yellow-500 hover:bg-yellow-600 text-black"
                    >
                        <div className='flex w-2/3 items-center justify-center'>
                            <span> تفويض  </span>
                        </div>
                        <div className='flex w-1/3 items-center justify-center'>
                            <FontAwesomeIcon icon={faUserAlt} />
                        </div>

                    </button>

                    <button
                        onClick={handleSignout}
                        className="flex w-48 items-center justify-center  p-2 rounded-lg transition bg-yellow-500 hover:bg-yellow-600 text-black"
                    >
                        <div className='flex w-2/3 items-center justify-center'>
                            <span>تسجيل الخروج</span>
                        </div>
                        <div className='flex w-1/3 items-center justify-center'>
                            <FontAwesomeIcon icon={faSignOutAlt} />
                        </div>

                    </button>

                    <button
                        onClick={handleProfileNavigation}
                        className="flex w-48 items-center justify-center  p-2 rounded-lg transition bg-yellow-500 hover:bg-yellow-600 text-black"
                    >
                        <div className='flex w-2/3 items-center justify-center'>
                            <span> الملف الشخصي</span>
                        </div>
                        <div className='flex w-1/3 items-center justify-center'>
                            <FontAwesomeIcon icon={faUserEdit} />
                        </div>

                    </button>
                </div>
            </div>
        </div >
    )
}