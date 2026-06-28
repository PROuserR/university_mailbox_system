"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
    faUser,
    faEnvelope,
    faPhone,
    faShieldHalved,
    faCalendar,
    faTrash,
    faSave,
    faLanguage,
    faGear,
    faUpload,
    faLockOpen,
    faLock,
} from "@fortawesome/free-solid-svg-icons";

import { apiWrapper } from "@/utils/apiClient";
import Link from "next/link";



interface Profile {

    id: number;

    firstName: string;

    lastName: string;

    fullName: string;

    email: string;

    phone: string | null;

    profileImageUrl: string | null;

    roles: string[];

    isActive: boolean;

    isBanned: boolean;

    createdAt: string;

    lastLoginAt: string;

    profileImageId: number | null;

}



interface Settings {

    language?: string;

}


interface ProfileResponse {
    success: boolean;
    data: Profile;
}


export default function ProfilePage() {



    const [profile, setProfile] =
        useState<Profile | null>(null);



    const [settings, setSettings] =
        useState<Settings>({});



    const [loading, setLoading] =
        useState(true);



    const [form, setForm] = useState({

        firstName: "",
        lastName: "",
        email: "",
        phone: ""

    });






    useEffect(() => {

        loadProfile();


    }, []);

    function translateRole(role: string) {

        const roles: any = {

            Dean: "العميد",

            Admin: "مدير النظام",

            User: "مستخدم"

        };


        return roles[role] ?? role;

    }

    async function loadProfile() {


        try {


            const response =
                await apiWrapper.get<ProfileResponse>(
                    "/Profiles"
                );



            if (response?.success) {

                if (response.data) {
                    const data =
                        response.data.data;



                    setProfile(data);



                    setForm({

                        firstName: data.firstName ?? "",

                        lastName: data.lastName ?? "",

                        email: data.email ?? "",

                        phone: data.phone ?? ""

                    });

                }
            }

        }
        catch (error) {


            toast.error(
                "فشل تحميل الملف الشخصي"
            );


        }
        finally {

            setLoading(false);

        }



    }







    async function updateProfile() {


        try {


            const response =
                await apiWrapper.put(
                    "/Profiles",
                    form
                );



            if (response?.success) {


                toast.success(
                    "تم تحديث الملف الشخصي بنجاح"
                );



                loadProfile();


            }



        }
        catch (error) {


            toast.error(
                "فشل تحديث الملف الشخصي"
            );


        }



    }









    async function uploadPicture(
        e: React.ChangeEvent<HTMLInputElement>
    ) {


        const file =
            e.target.files?.[0];



        if (!file)
            return;




        const formData =
            new FormData();



        formData.append(
            "file",
            file
        );





        try {


            const response =
                await apiWrapper.post(
                    "/Profiles/picture",
                    formData
                );



            if (response?.success) {


                toast.success(
                    "تم رفع الصورة الشخصية"
                );



                loadProfile();


            }



        }
        catch (error) {


            toast.error(
                "فشل رفع الصورة"
            );


        }



    }









    async function deletePicture() {


        try {


            const response =
                await apiWrapper.delete(
                    "/Profiles/picture"
                );



            if (response?.success) {


                toast.success(
                    "تم حذف الصورة الشخصية"
                );



                loadProfile();


            }


        }
        catch (error) {


            toast.error(
                "فشل حذف الصورة"
            );


        }


    }









    async function changeLanguage(
        language: string
    ) {


        try {


            const response =
                await apiWrapper.post(
                    "/Profiles/language",
                    {
                        language
                    }
                );



            if (response?.success) {


                setSettings({

                    ...settings,

                    language

                });



                toast.success(
                    "تم تحديث اللغة"
                );


            }



        }
        catch (error) {


            toast.error(
                "فشل تحديث اللغة"
            );


        }



    }









    if (loading || !profile) {


        return (

            <div
                dir="rtl"
                className="
                    min-h-screen
                    flex
                    items-center
                    justify-center
                    bg-yellow-50
                "
            >


                <div className="
                    text-blue-700
                    text-xl
                    font-bold
                ">

                    جاري تحميل الملف الشخصي...

                </div>



            </div>

        );


    }
    return (

        <div
            dir="rtl"
            className="
                min-h-screen
                bg-gradient-to-br
                from-yellow-50
                via-white
                to-blue-50
                p-5
            "
        >


            <motion.div

                initial={{
                    opacity: 0,
                    y: 30
                }}

                animate={{
                    opacity: 1,
                    y: 0
                }}

                className="
                    max-w-6xl
                    mx-auto
                    space-y-6
                "

            >






                {/* رأس الملف الشخصي */}


                <div className="
                    bg-white
                    rounded-3xl
                    shadow-xl
                    p-6
                    flex
                    flex-col
                    md:flex-row
                    items-center
                    gap-6
                ">



                    <div className="
                        relative
                    ">



                        {
                            profile.profileImageUrl ?


                                <img

                                    src={
                                        profile.profileImageUrl
                                    }

                                    className="
                                    w-36
                                    h-36
                                    rounded-full
                                    object-cover
                                    border-4
                                    border-blue-200
                                "

                                />


                                :


                                <div className="
                                w-36
                                h-36
                                rounded-full
                                bg-blue-100
                                flex
                                items-center
                                justify-center
                                text-blue-600
                                text-5xl
                            ">

                                    <FontAwesomeIcon
                                        icon={faUser}
                                    />

                                </div>


                        }






                        <label className="
                            absolute
                            bottom-0
                            left-0
                            bg-yellow-300
                            p-3
                            rounded-full
                            cursor-pointer
                        ">


                            <FontAwesomeIcon
                                icon={faUpload}
                            />



                            <input

                                hidden

                                type="file"

                                accept="image/*"

                                onChange={
                                    uploadPicture
                                }

                            />


                        </label>



                    </div>







                    <div className="
                        flex-1
                    ">



                        <h1 className="
                            text-3xl
                            font-bold
                            text-blue-800
                        ">

                            {profile.fullName}

                        </h1>





                        <p className="
                            text-gray-500
                            mt-2
                        ">

                            {
                                profile.roles
                                    ?.map(translateRole)
                                    .join("، ")
                            }


                        </p>







                        <button

                            onClick={
                                deletePicture
                            }

                            className="
                                mt-4
                                bg-red-100
                                text-red-600
                                px-4
                                py-2
                                rounded-xl
                            "

                        >

                            <FontAwesomeIcon
                                icon={faTrash}
                            />

                            {" "}

                            حذف الصورة


                        </button>





                    </div>



                </div>










                {/* شبكة المحتوى */}



                <div className="
                    grid
                    md:grid-cols-2
                    gap-6
                ">







                    {/* تعديل المعلومات */}



                    <div className="
                        bg-white
                        rounded-3xl
                        shadow-lg
                        p-6
                    ">



                        <h2 className="
                            text-xl
                            font-bold
                            text-blue-700
                            mb-5
                        ">


                            <FontAwesomeIcon
                                icon={faUser}
                            />


                            {" "}

                            المعلومات الشخصية


                        </h2>







                        <div className="space-y-4 flex flex-col">
                            <input

                                className="input"

                                placeholder="الاسم الأول"

                                value={
                                    form.firstName
                                }

                                onChange={
                                    e =>
                                        setForm({

                                            ...form,

                                            firstName:
                                                e.target.value

                                        })
                                }

                            />







                            <input

                                className="input"

                                placeholder="اسم العائلة"

                                value={
                                    form.lastName
                                }

                                onChange={
                                    e =>
                                        setForm({

                                            ...form,

                                            lastName:
                                                e.target.value

                                        })
                                }

                            />








                            <input

                                className="input"

                                placeholder="البريد الإلكتروني"

                                value={
                                    form.email
                                }

                                onChange={
                                    e =>
                                        setForm({

                                            ...form,

                                            email:
                                                e.target.value

                                        })
                                }

                            />









                            <input

                                className="input"

                                placeholder="رقم الهاتف"

                                value={
                                    form.phone
                                }

                                onChange={
                                    e =>
                                        setForm({

                                            ...form,

                                            phone:
                                                e.target.value

                                        })
                                }

                            />

                            <button

                                onClick={
                                    updateProfile
                                }

                                className="
                                    w-full
                                    bg-blue-500
                                    hover:bg-blue-600
                                    text-white
                                    py-3
                                    rounded-xl
                                    transition
                                "

                            >


                                <FontAwesomeIcon
                                    icon={faSave}
                                />

                                {" "}

                                حفظ التغييرات



                            </button>



                            <Link
                                href="/auth/change-password"
                                className="
                                    w-full
                                    bg-red-500
                                    hover:bg-blue-600
                                    text-white
                                    text-center
                                    py-3
                                    rounded-xl
                                    transition
                                "
                            >
                                <FontAwesomeIcon
                                    icon={faLock}
                                />
                                تغيير كلمة السر
                            </Link>



                        </div>




                    </div>
                    {/* تفاصيل الحساب */}


                    <div className="
                        bg-white
                        rounded-3xl
                        shadow-lg
                        p-6
                    ">



                        <h2 className="
                            text-xl
                            font-bold
                            text-blue-700
                            mb-5
                        ">



                            <FontAwesomeIcon
                                icon={faGear}
                            />

                            {" "}

                            تفاصيل الحساب



                        </h2>







                        <div className="
                            space-y-4
                            text-gray-700
                        ">






                            <p>

                                <FontAwesomeIcon
                                    icon={faEnvelope}
                                />

                                {" "}

                                {profile.email}


                            </p>








                            <p>

                                <FontAwesomeIcon
                                    icon={faPhone}
                                />

                                {" "}


                                {
                                    profile.phone
                                    ??
                                    "لا يوجد رقم هاتف"
                                }



                            </p>








                            <p>

                                <FontAwesomeIcon
                                    icon={faShieldHalved}
                                />

                                {" "}

                                الحالة:

                                {" "}

                                {
                                    profile.isActive
                                        ?
                                        "نشط"
                                        :
                                        "غير نشط"
                                }


                            </p>








                            <p>

                                <FontAwesomeIcon
                                    icon={faCalendar}
                                />

                                {" "}

                                تاريخ الإنشاء:

                                {" "}

                                {
                                    new Date(
                                        profile.createdAt
                                    )
                                        .toLocaleDateString(
                                            "ar-SA"
                                        )
                                }


                            </p>








                            <p>


                                آخر تسجيل دخول:

                                {" "}


                                {
                                    new Date(
                                        profile.lastLoginAt
                                    )
                                        .toLocaleDateString(
                                            "ar-SA"
                                        )
                                }



                            </p>







                        </div>





                    </div>







                </div>









                {/* إعدادات اللغة */}




                <div className="
                    bg-white
                    rounded-3xl
                    shadow-lg
                    p-6
                ">




                    <h2 className="
                        text-xl
                        font-bold
                        text-blue-700
                        mb-4
                    ">



                        <FontAwesomeIcon
                            icon={faLanguage}
                        />

                        {" "}

                        اللغة



                    </h2>







                    <select


                        className="
                            border
                            border-blue-200
                            rounded-xl
                            p-3
                            w-full
                            md:w-72
                        "


                        value={
                            settings.language ?? "ar"
                        }


                        onChange={
                            e =>
                                changeLanguage(
                                    e.target.value
                                )
                        }


                    >



                        <option value="ar">

                            العربية

                        </option>





                        <option value="en">

                            الإنجليزية

                        </option>





                        <option value="fr">

                            الفرنسية

                        </option>



                    </select>






                </div>






            </motion.div>










        </div>


    );


}