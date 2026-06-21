"use client";

import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    faPlus,
    faEdit,
    faTrash,
    faSearch,
    faUser,
    faUserCheck,
    faUserSlash,
    faBan,
    faUnlock,
    faEnvelope,
    faPhone,
    faStar,
    faXmark,
    faCheck,
    faTimes,
    faShieldHalved
} from "@fortawesome/free-solid-svg-icons";

import {
    FontAwesomeIcon
} from "@fortawesome/react-fontawesome";

import {
    apiWrapper
} from "@/utils/apiClient";



interface User {
    id: number;
    firstName: string;
    lastName: string;
    userName: string;
    fullName: string;
    email: string;
    phone: string | null;

    isActive: boolean;
    isBanned: boolean;
    isPermanentReceiver: boolean;

    lastLoginAt: string | null;

    createdAt: string;
    updatedAt: string | null;

    profileImageUrl: string | null;

    roles: string[];
}



interface ApiResponse<T> {
    isSuccess: boolean;
    data: T;
    message: string;
    errors: string[] | null;
    statusCode: number;
}



export default function UsersPage() {



    const [users, setUsers] = useState<User[]>([]);


    const [loading, setLoading] = useState(true);


    const [search, setSearch] = useState("");


    const [filter, setFilter] = useState<
        "all" |
        "active" |
        "inactive" |
        "banned" |
        "receiver"
    >("all");



    const [modalOpen, setModalOpen] = useState(false);


    const [editing, setEditing] =
        useState<User | null>(null);



    const [processing, setProcessing] =
        useState(false);



    const [form, setForm] = useState({

        firstName: "",
        lastName: "",
        userName: "",
        email: "",
        phone: ""

    });






    // ==============================
    // LOAD USERS
    // ==============================
    async function loadUsers() {

        try {

            setLoading(true);


            const response =
                await apiWrapper.get<ApiResponse<User[]>>(
                    "/Users"
                );


            if (response.success) {
                if (response.data)
                    setUsers(
                        response.data.data
                    );

            }


        }
        catch (error) {

            console.error(
                "Failed to load users:",
                error
            );

        }
        finally {

            setLoading(false);

        }

    }


    useEffect(() => {

        loadUsers();

    }, []);






    // ==============================
    // SEARCH + FILTER
    // ==============================


    const filteredUsers =
        useMemo(() => {


            return users.filter((user) => {


                const searchMatch =

                    user.fullName
                        .toLowerCase()
                        .includes(
                            search.toLowerCase()
                        )

                    ||

                    user.email
                        .toLowerCase()
                        .includes(
                            search.toLowerCase()
                        )

                    ||

                    user.userName
                        .toLowerCase()
                        .includes(
                            search.toLowerCase()
                        );





                const filterMatch =

                    filter === "all"

                        ? true


                        : filter === "active"

                            ? user.isActive


                            : filter === "inactive"

                                ? !user.isActive


                                : filter === "banned"

                                    ? user.isBanned


                                    : user.isPermanentReceiver;




                return searchMatch && filterMatch;



            });


        }, [
            users,
            search,
            filter
        ]);








    // ==============================
    // CREATE / UPDATE USER
    // ==============================


    async function saveUser() {


        if (
            !form.firstName ||
            !form.lastName ||
            !form.email
        )
            return;



        try {


            setProcessing(true);



            if (editing) {


                await apiWrapper.put(

                    `/Users/${editing.id}`,

                    {

                        firstName:
                            form.firstName,

                        lastName:
                            form.lastName,

                        userName:
                            form.userName,

                        email:
                            form.email,

                        phone:
                            form.phone

                    }

                );


            }

            else {


                await apiWrapper.post(

                    "/Users",

                    {

                        firstName:
                            form.firstName,

                        lastName:
                            form.lastName,

                        userName:
                            form.userName,

                        email:
                            form.email,

                        phone:
                            form.phone

                    }

                );


            }



            setModalOpen(false);

            setEditing(null);


            resetForm();


            loadUsers();



        }
        catch (error) {

            console.error(error);

        }
        finally {

            setProcessing(false);

        }


    }








    function resetForm() {

        setForm({

            firstName: "",

            lastName: "",

            userName: "",

            email: "",

            phone: ""

        });


    }









    function openCreate() {


        resetForm();

        setEditing(null);

        setModalOpen(true);


    }






    function openEdit(user: User) {



        setEditing(user);


        setForm({

            firstName: user.firstName,

            lastName: user.lastName,

            userName: user.userName,

            email: user.email,

            phone: user.phone ?? ""

        });


        setModalOpen(true);



    }








    // ==============================
    // DELETE
    // ==============================


    async function deleteUser(
        id: number
    ) {


        if (
            !confirm(
                "هل تريد حذف المستخدم؟"
            )
        )
            return;



        try {


            await apiWrapper.delete(

                `/Users/${id}`

            );



            loadUsers();


        }
        catch (error) {

            console.error(error);

        }


    }







    // ==============================
    // STATUS
    // ==============================


    async function toggleActive(
        user: User
    ) {


        try {


            await apiWrapper.post(

                user.isActive

                    ?
                    `/Users/${user.id}/deactivate`

                    :
                    `/Users/${user.id}/activate`

            );



            loadUsers();


        }
        catch (error) {

            console.error(error);

        }


    }






    // ==============================
    // BAN
    // ==============================


    async function toggleBan(
        user: User
    ) {


        try {


            await apiWrapper.post(

                user.isBanned

                    ?
                    `/Users/${user.id}/unban`

                    :
                    `/Users/${user.id}/ban`

            );



            loadUsers();


        }
        catch (error) {

            console.error(error);

        }


    }





    // ==============================
    // PERMANENT RECEIVER
    // ==============================


    async function toggleReceiver(
        user: User
    ) {


        try {


            await apiWrapper.post(

                user.isPermanentReceiver

                    ?

                    `/Users/${user.id}/remove-permanent-receiver`

                    :

                    `/Users/${user.id}/set-permanent-receiver`

            );



            loadUsers();


        }
        catch (error) {

            console.error(error);

        }


    }







    function formatDate(
        date: string | null
    ) {


        if (!date)
            return "-";


        return new Date(date)
            .toLocaleDateString(
                "ar-SA",
                {

                    year: "numeric",

                    month: "short",

                    day: "numeric"

                }

            );


    }
    return (

        <div
            dir="rtl"
            className="
      min-h-screen
      bg-slate-50
      p-6
      "
        >



            {/* HEADER */}

            <div
                className="
        bg-white
        rounded-3xl
        border
        border-sky-100
        shadow-sm
        p-6
        mb-6
        flex
        flex-col
        md:flex-row
        justify-between
        items-center
        gap-4
        "
            >


                <div
                    className="
          flex
          items-center
          gap-4
          "
                >


                    <div
                        className="
            w-14
            h-14
            rounded-2xl
            bg-sky-100
            text-sky-600
            flex
            items-center
            justify-center
            text-2xl
            "
                    >

                        <FontAwesomeIcon
                            icon={faUser}
                        />

                    </div>



                    <div>

                        <h1
                            className="
              text-2xl
              font-bold
              text-slate-800
              "
                        >
                            إدارة المستخدمين
                        </h1>


                        <p
                            className="
              text-slate-500
              mt-1
              "
                        >
                            إدارة حسابات المستخدمين والصلاحيات والمستلمين الدائمين
                        </p>


                    </div>


                </div>





                <button

                    onClick={openCreate}

                    className="
          bg-yellow-400
          hover:bg-yellow-500
          text-slate-900
          px-5
          py-3
          rounded-2xl
          font-semibold
          flex
          items-center
          gap-2
          transition
          "

                >

                    <FontAwesomeIcon
                        icon={faPlus}
                    />

                    إضافة مستخدم

                </button>


            </div>








            {/* FILTERS */}

            <div
                className="
        bg-white
        rounded-3xl
        border
        border-sky-100
        shadow-sm
        p-5
        mb-6
        "
            >


                <div
                    className="
          flex
          flex-col
          lg:flex-row
          gap-4
          "
                >



                    {/* SEARCH */}

                    <div
                        className="
            relative
            flex-1
            "
                    >


                        <FontAwesomeIcon

                            icon={faSearch}

                            className="
              absolute
              right-4
              top-1/2
              -translate-y-1/2
              text-slate-400
              "

                        />


                        <input

                            value={search}

                            onChange={(e) =>
                                setSearch(
                                    e.target.value
                                )
                            }

                            placeholder="
              البحث بالاسم أو البريد أو اسم المستخدم
              "

                            className="
              w-full
              bg-slate-50
              border
              border-slate-200
              rounded-2xl
              py-3
              pr-12
              pl-4
              outline-none
              focus:border-sky-400
              "

                        />


                    </div>





                    {/* FILTER BUTTONS */}

                    <div
                        className="
            flex
            flex-wrap
            gap-2
            "
                    >


                        {
                            [

                                {
                                    key: "all",
                                    label: "الكل"
                                },

                                {
                                    key: "active",
                                    label: "نشط"
                                },

                                {
                                    key: "inactive",
                                    label: "غير نشط"
                                },

                                {
                                    key: "banned",
                                    label: "محظور"
                                },

                                {
                                    key: "receiver",
                                    label: "مستلم دائم"
                                }


                            ].map(
                                item => (


                                    <button

                                        key={item.key}

                                        onClick={() =>
                                            setFilter(
                                                item.key as any
                                            )
                                        }


                                        className={`
                px-4
                py-2
                rounded-xl
                text-sm
                font-medium
                transition

                ${filter === item.key

                                                ?

                                                "bg-sky-500 text-white"

                                                :

                                                "bg-slate-100 text-slate-600 hover:bg-slate-200"

                                            }

                `}

                                    >

                                        {item.label}

                                    </button>


                                )
                            )
                        }


                    </div>



                </div>


            </div>










            {/* USERS TABLE */}

            <div
                className="
        bg-white
        rounded-3xl
        border
        border-sky-100
        shadow-sm
        overflow-hidden
        "
            >



                {

                    loading

                        ?

                        (

                            <div
                                className="
          h-64
          flex
          items-center
          justify-center
          text-slate-500
          "
                            >

                                جاري تحميل المستخدمين...

                            </div>

                        )


                        :

                        filteredUsers.length === 0

                            ?

                            (

                                <div
                                    className="
          h-64
          flex
          flex-col
          items-center
          justify-center
          text-slate-400
          gap-3
          "
                                >

                                    <FontAwesomeIcon
                                        icon={faUser}
                                        className="text-4xl"
                                    />

                                    لا يوجد مستخدمين

                                </div>

                            )


                            :

                            (


                                <div
                                    className="
        overflow-x-auto
        "
                                >


                                    <table
                                        className="
        w-full
        text-right
        "
                                    >


                                        <thead>

                                            <tr
                                                className="
            bg-sky-50
            text-slate-700
            "
                                            >


                                                <th className="p-5">
                                                    المستخدم
                                                </th>


                                                <th className="p-5">
                                                    البريد
                                                </th>


                                                <th className="p-5">
                                                    الدور
                                                </th>


                                                <th className="p-5">
                                                    الحالة
                                                </th>


                                                <th className="p-5">
                                                    الاستقبال
                                                </th>


                                                <th className="p-5">
                                                    آخر دخول
                                                </th>


                                                <th className="p-5">
                                                    الإجراءات
                                                </th>



                                            </tr>


                                        </thead>



                                        <tbody>



                                            {
                                                filteredUsers.map(
                                                    user => (


                                                        <tr

                                                            key={user.id}

                                                            className="
              border-t
              border-slate-100
              hover:bg-slate-50
              transition
              "

                                                        >




                                                            {/* USER */}

                                                            <td
                                                                className="
                p-5
                "
                                                            >


                                                                <div
                                                                    className="
                  flex
                  items-center
                  gap-3
                  "
                                                                >


                                                                    <div
                                                                        className="
                    w-11
                    h-11
                    rounded-full
                    bg-sky-100
                    text-sky-600
                    flex
                    items-center
                    justify-center
                    font-bold
                    "
                                                                    >

                                                                        {
                                                                            user.firstName
                                                                                ?.charAt(0)
                                                                        }

                                                                    </div>



                                                                    <div>

                                                                        <div
                                                                            className="
                      font-semibold
                      text-slate-800
                      "
                                                                        >

                                                                            {user.fullName}

                                                                        </div>


                                                                        <div
                                                                            className="
                      text-sm
                      text-slate-400
                      "
                                                                        >

                                                                            @{user.userName}

                                                                        </div>


                                                                    </div>



                                                                </div>


                                                            </td>






                                                            {/* EMAIL */}

                                                            <td
                                                                className="
                p-5
                text-slate-600
                "
                                                            >

                                                                <div
                                                                    className="
                  flex
                  items-center
                  gap-2
                  "
                                                                >

                                                                    <FontAwesomeIcon
                                                                        icon={faEnvelope}
                                                                        className="text-sky-400"
                                                                    />

                                                                    {user.email}

                                                                </div>


                                                            </td>






                                                            {/* ROLES */}

                                                            <td
                                                                className="p-5"
                                                            >

                                                                <div
                                                                    className="
                  flex
                  gap-2
                  flex-wrap
                  "
                                                                >

                                                                    {
                                                                        user.roles.map(
                                                                            role => (

                                                                                <span

                                                                                    key={role}

                                                                                    className="
                      bg-purple-100
                      text-purple-700
                      px-3
                      py-1
                      rounded-full
                      text-xs
                      "

                                                                                >

                                                                                    {role}

                                                                                </span>

                                                                            )
                                                                        )
                                                                    }


                                                                </div>


                                                            </td>

                                                            {/* STATUS */}

                                                            <td
                                                                className="p-5"
                                                            >

                                                                {
                                                                    user.isActive

                                                                        ?

                                                                        <span
                                                                            className="
                    inline-flex
                    items-center
                    gap-2
                    bg-emerald-100
                    text-emerald-700
                    px-3
                    py-1
                    rounded-full
                    text-sm
                    "
                                                                        >

                                                                            <FontAwesomeIcon
                                                                                icon={faCheck}
                                                                            />

                                                                            نشط

                                                                        </span>

                                                                        :

                                                                        <span
                                                                            className="
                    inline-flex
                    items-center
                    gap-2
                    bg-red-100
                    text-red-700
                    px-3
                    py-1
                    rounded-full
                    text-sm
                    "
                                                                        >

                                                                            <FontAwesomeIcon
                                                                                icon={faTimes}
                                                                            />

                                                                            غير نشط

                                                                        </span>

                                                                }



                                                                {
                                                                    user.isBanned &&

                                                                    <div
                                                                        className="
                    mt-2
                    inline-flex
                    bg-red-100
                    text-red-700
                    px-3
                    py-1
                    rounded-full
                    text-xs
                    "
                                                                    >

                                                                        محظور

                                                                    </div>

                                                                }


                                                            </td>






                                                            {/* RECEIVER */}

                                                            <td
                                                                className="p-5"
                                                            >

                                                                {
                                                                    user.isPermanentReceiver

                                                                        ?

                                                                        <span
                                                                            className="
                    inline-flex
                    items-center
                    gap-2
                    bg-yellow-100
                    text-yellow-700
                    px-3
                    py-1
                    rounded-full
                    text-sm
                    "
                                                                        >

                                                                            <FontAwesomeIcon
                                                                                icon={faStar}
                                                                            />

                                                                            دائم

                                                                        </span>


                                                                        :

                                                                        <span
                                                                            className="
                    text-slate-400
                    text-sm
                    "
                                                                        >

                                                                            -

                                                                        </span>

                                                                }


                                                            </td>








                                                            {/* LAST LOGIN */}

                                                            <td
                                                                className="
                p-5
                text-slate-500
                "
                                                            >

                                                                {
                                                                    formatDate(
                                                                        user.lastLoginAt
                                                                    )
                                                                }

                                                            </td>









                                                            {/* ACTIONS */}

                                                            <td
                                                                className="p-5"
                                                            >


                                                                <div
                                                                    className="
                  flex
                  flex-wrap
                  gap-2
                  "
                                                                >


                                                                    {/* EDIT */}

                                                                    <button

                                                                        onClick={() =>
                                                                            openEdit(user)
                                                                        }

                                                                        className="
                    w-10
                    h-10
                    rounded-xl
                    bg-sky-100
                    text-sky-600
                    hover:bg-sky-200
                    transition
                    "

                                                                    >

                                                                        <FontAwesomeIcon
                                                                            icon={faEdit}
                                                                        />

                                                                    </button>






                                                                    {/* ACTIVE */}

                                                                    <button

                                                                        onClick={() =>
                                                                            toggleActive(user)
                                                                        }

                                                                        className="
                    w-10
                    h-10
                    rounded-xl
                    bg-emerald-100
                    text-emerald-700
                    hover:bg-emerald-200
                    transition
                    "

                                                                    >

                                                                        <FontAwesomeIcon
                                                                            icon={
                                                                                user.isActive
                                                                                    ?
                                                                                    faUserSlash
                                                                                    :
                                                                                    faUserCheck
                                                                            }
                                                                        />

                                                                    </button>








                                                                    {/* BAN */}

                                                                    <button

                                                                        onClick={() =>
                                                                            toggleBan(user)
                                                                        }

                                                                        className="
                    w-10
                    h-10
                    rounded-xl
                    bg-red-100
                    text-red-600
                    hover:bg-red-200
                    transition
                    "

                                                                    >

                                                                        <FontAwesomeIcon
                                                                            icon={
                                                                                user.isBanned
                                                                                    ?
                                                                                    faUnlock
                                                                                    :
                                                                                    faBan
                                                                            }
                                                                        />


                                                                    </button>









                                                                    {/* PERMANENT RECEIVER */}

                                                                    <button

                                                                        onClick={() =>
                                                                            toggleReceiver(user)
                                                                        }


                                                                        className="
                    w-10
                    h-10
                    rounded-xl
                    bg-yellow-100
                    text-yellow-700
                    hover:bg-yellow-200
                    transition
                    "

                                                                    >

                                                                        <FontAwesomeIcon
                                                                            icon={faStar}
                                                                        />

                                                                    </button>









                                                                    {/* DELETE */}

                                                                    <button

                                                                        onClick={() =>
                                                                            deleteUser(user.id)
                                                                        }

                                                                        className="
                    w-10
                    h-10
                    rounded-xl
                    bg-red-100
                    text-red-700
                    hover:bg-red-200
                    transition
                    "

                                                                    >

                                                                        <FontAwesomeIcon
                                                                            icon={faTrash}
                                                                        />

                                                                    </button>



                                                                </div>


                                                            </td>




                                                        </tr>


                                                    )
                                                )
                                            }



                                        </tbody>


                                    </table>


                                </div>


                            )


                }



            </div>









            {/* CREATE / EDIT MODAL */}

            {

                modalOpen &&


                <div
                    className="
        fixed
        inset-0
        bg-black/30
        backdrop-blur-sm
        flex
        items-center
        justify-center
        z-50
        p-5
        "
                >


                    <div
                        className="
          bg-white
          rounded-3xl
          w-full
          max-w-lg
          p-6
          shadow-xl
          "
                    >


                        <div
                            className="
            flex
            justify-between
            items-center
            mb-6
            "
                        >


                            <h2
                                className="
              text-xl
              font-bold
              text-slate-800
              "
                            >

                                {
                                    editing
                                        ?
                                        "تعديل المستخدم"
                                        :
                                        "إضافة مستخدم"
                                }


                            </h2>




                            <button

                                onClick={() =>
                                    setModalOpen(false)
                                }

                                className="
              text-slate-400
              hover:text-red-500
              "

                            >

                                <FontAwesomeIcon
                                    icon={faXmark}
                                    className="text-xl"
                                />

                            </button>


                        </div>









                        <div
                            className="
            space-y-4
            "
                        >



                            <input

                                value={form.firstName}

                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        firstName: e.target.value
                                    })
                                }

                                placeholder="الاسم الأول"

                                className="
              w-full
              border
              rounded-2xl
              p-3
              outline-none
              focus:border-sky-400
              "

                            />





                            <input

                                value={form.lastName}

                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        lastName: e.target.value
                                    })
                                }

                                placeholder="اسم العائلة"

                                className="
              w-full
              border
              rounded-2xl
              p-3
              outline-none
              focus:border-sky-400
              "

                            />






                            <input

                                value={form.userName}

                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        userName: e.target.value
                                    })
                                }

                                placeholder="اسم المستخدم"

                                className="
              w-full
              border
              rounded-2xl
              p-3
              outline-none
              focus:border-sky-400
              "

                            />







                            <input

                                value={form.email}

                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        email: e.target.value
                                    })
                                }

                                placeholder="البريد الإلكتروني"

                                className="
              w-full
              border
              rounded-2xl
              p-3
              outline-none
              focus:border-sky-400
              "

                            />







                            <input

                                value={form.phone}

                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        phone: e.target.value
                                    })
                                }

                                placeholder="رقم الهاتف"

                                className="
              w-full
              border
              rounded-2xl
              p-3
              outline-none
              focus:border-sky-400
              "

                            />






                        </div>








                        <button

                            disabled={processing}

                            onClick={saveUser}


                            className="
            mt-6
            w-full
            bg-sky-500
            hover:bg-sky-600
            text-white
            py-3
            rounded-2xl
            font-semibold
            transition
            disabled:opacity-50
            "

                        >

                            {
                                processing
                                    ?
                                    "جاري الحفظ..."
                                    :
                                    "حفظ"
                            }


                        </button>





                    </div>


                </div>


            }




        </div>

    );


}