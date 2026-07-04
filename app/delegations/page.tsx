"use client";

import {
    useEffect,
    useMemo,
    useState
} from "react";

import toast from "react-hot-toast";

import {
    FontAwesomeIcon
} from "@fortawesome/react-fontawesome";

import {
    faPlus,
    faUsers,
    faClock,
    faCheckCircle,
    faBan,
    faSearch,
    faRotate,
    faEye,
    faTrash
} from "@fortawesome/free-solid-svg-icons";

import {
    apiWrapper
} from "@/utils/apiClient";



interface Delegation {

    id: number;

    deanId: number;

    deanName: string;

    delegateUserId: number;

    delegateUserName: string;

    startDate: string;

    endDate: string;

    type: string;

    isActive: boolean;

    notes: string;

    createdAt: string;

}



interface ApiResponse<T> {

    success: boolean;

    data: T;

    message: string;

    errors: string[];

    statusCode: number;

}



export default function Page() {


    const [delegations, setDelegations] =
        useState<Delegation[]>([]);



    const [loading, setLoading] =
        useState(true);



    const [refreshing, setRefreshing] =
        useState(false);



    const [search, setSearch] =
        useState("");



    const [statusFilter, setStatusFilter] =
        useState<
            "all" | "active" | "expired"
        >("all");



    const [typeFilter, setTypeFilter] =
        useState("all");



    const [selectedDelegation, setSelectedDelegation] =
        useState<Delegation | null>(null);



    const [showDetails, setShowDetails] =
        useState(false);



    const [showCreate, setShowCreate] =
        useState(false);



    const [showDelete, setShowDelete] =
        useState(false);



    const [deleteId, setDeleteId] =
        useState<number | null>(null);



    const [delegateUserId, setDelegateUserId] =
        useState("");



    const [startDate, setStartDate] =
        useState("");



    const [endDate, setEndDate] =
        useState("");



    const [notes, setNotes] =
        useState("");



    const [submitting, setSubmitting] =
        useState(false);






    async function loadDelegations() {

        try {

            setLoading(true);



            const response =
                await apiWrapper.get<
                    ApiResponse<Delegation[]>
                >(
                    "/Delegations"
                );


            if (response.data)
                if (response.data.success) {


                    setDelegations(
                        response.data.data ?? []
                    );


                }
                else {


                    toast.error(
                        response.data.message ||
                        "فشل تحميل التفويضات"
                    );


                }


        }
        catch (error: any) {


            toast.error(
                error?.message ||
                "فشل تحميل التفويضات"
            );


        }
        finally {


            setLoading(false);


        }

    }







    useEffect(() => {

        loadDelegations();

    }, []);







    const statistics = useMemo(() => {


        const today =
            new Date();



        const active =
            delegations.filter(
                item =>
                    item.isActive
            );



        const expired =
            delegations.filter(
                item =>
                    new Date(item.endDate)
                    <
                    today
            );



        const endingSoon =
            active.filter(item => {


                const days =
                    (
                        new Date(item.endDate)
                            .getTime()
                        -
                        today.getTime()
                    )
                    /
                    (
                        1000 *
                        60 *
                        60 *
                        24
                    );



                return days <= 3 && days >= 0;


            });




        return {


            total:
                delegations.length,



            active:
                active.length,



            endingSoon:
                endingSoon.length,



            expired:
                expired.length


        };



    }, [
        delegations
    ]);







    const filteredDelegations =
        useMemo(() => {


            return delegations.filter(item => {



                const searchValue =
                    search.toLowerCase();




                const matchesSearch =


                    item.delegateUserName
                        ?.toLowerCase()
                        .includes(searchValue)


                    ||


                    item.deanName
                        ?.toLowerCase()
                        .includes(searchValue);






                const matchesStatus =


                    statusFilter === "all"


                        ?


                        true


                        :


                        statusFilter === "active"


                            ?


                            item.isActive


                            :


                            !item.isActive;






                const matchesType =


                    typeFilter === "all"


                        ?


                        true


                        :


                        item.type === typeFilter;






                return (


                    matchesSearch

                    &&

                    matchesStatus

                    &&

                    matchesType


                );



            });



        }, [


            delegations,

            search,

            statusFilter,

            typeFilter


        ]);







    async function refresh() {


        try {


            setRefreshing(true);


            await loadDelegations();


        }
        finally {


            setRefreshing(false);


        }


    }







    async function createDelegation() {



        if (!delegateUserId) {


            toast.error(
                "معرف المستخدم المفوض إليه مطلوب"
            );


            return;


        }






        if (!startDate || !endDate) {


            toast.error(
                "تاريخ البداية والنهاية مطلوبان"
            );


            return;


        }






        try {



            setSubmitting(true);




            const response =
                await apiWrapper.post<
                    ApiResponse<any>
                >(

                    "/Delegations",

                    {


                        delegateUserId:
                            Number(delegateUserId),


                        startDate,


                        endDate,


                        type:
                            "Approval",


                        notes


                    }

                );




            if (response.data)
                if (response.data.success) {



                    toast.success(
                        "تم إنشاء التفويض بنجاح"
                    );



                    setShowCreate(false);



                    setDelegateUserId("");

                    setStartDate("");

                    setEndDate("");

                    setNotes("");



                    await loadDelegations();



                }
                else {


                    toast.error(
                        response.data.message
                    );


                }



        }
        catch (error: any) {



            toast.error(
                error?.message ||
                "فشل إنشاء التفويض"
            );



        }
        finally {



            setSubmitting(false);



        }


    }
    async function revokeDelegation() {


        if (!deleteId)
            return;



        try {


            const response =
                await apiWrapper.delete<
                    ApiResponse<any>
                >(

                    `/Delegations/${deleteId}`

                );


            if (response.data)
                if (response.data.success) {

                    toast.success(
                        "تم إلغاء التفويض"
                    );

                    setShowDelete(false);

                    setDeleteId(null);

                    await loadDelegations();

                }
                else {

                    toast.error(
                        response.data.message
                    );


                }



        }
        catch (error: any) {


            toast.error(
                error?.message ||
                "فشل إلغاء التفويض"
            );


        }


    }



    return (

        <div
            dir="rtl"
            className="
                min-h-screen
                space-y-6
                bg-slate-50
                p-6
            "
        >



            {/* HEADER */}


            <div className="
                flex
                flex-col
                justify-between
                gap-4
                rounded-2xl
                bg-white
                p-6
                shadow-sm
                md:flex-row
                md:items-center
            ">



                <div>


                    <h1 className="
                        text-3xl
                        font-bold
                        text-slate-800
                    ">


                        إدارة التفويضات


                    </h1>




                    <p className="
                        mt-2
                        text-slate-500
                    ">


                        إدارة صلاحيات تفويض الاعتمادات والوصول المؤقت.


                    </p>



                </div>






                <div className="
                    flex
                    gap-3
                ">



                    <button


                        onClick={refresh}


                        disabled={refreshing}


                        className="
                            rounded-lg
                            border
                            bg-white
                            px-4
                            py-2
                            hover:bg-slate-100
                            disabled:opacity-50
                        "


                    >


                        <FontAwesomeIcon

                            icon={faRotate}

                            className="ml-2"

                        />


                        تحديث



                    </button>







                    <button


                        onClick={() => setShowCreate(true)}


                        className="
                            rounded-lg
                            bg-yellow-400
                            px-4
                            py-2
                            font-medium
                            text-black
                            hover:bg-yellow-500
                        "


                    >



                        <FontAwesomeIcon

                            icon={faPlus}

                            className="ml-2"

                        />



                        تفويض جديد



                    </button>




                </div>




            </div>







            {/* STATISTICS */}





            <div className="
                grid
                gap-5
                md:grid-cols-2
                xl:grid-cols-4
            ">



                {


                    [

                        {

                            title:
                                "إجمالي التفويضات",

                            value:
                                statistics.total,

                            icon:
                                faUsers,

                            color:
                                "text-blue-600"

                        },


                        {

                            title:
                                "نشط",

                            value:
                                statistics.active,

                            icon:
                                faCheckCircle,

                            color:
                                "text-green-600"

                        },


                        {

                            title:
                                "ينتهي قريباً",

                            value:
                                statistics.endingSoon,

                            icon:
                                faClock,

                            color:
                                "text-yellow-600"

                        },


                        {

                            title:
                                "منتهي",

                            value:
                                statistics.expired,

                            icon:
                                faBan,

                            color:
                                "text-red-600"

                        }


                    ].map((card) => (


                        <div


                            key={card.title}


                            className="
                                flex
                                items-center
                                justify-between
                                rounded-xl
                                bg-white
                                p-6
                                shadow-sm
                            "


                        >



                            <div>



                                <p className="
                                    text-sm
                                    text-slate-500
                                ">



                                    {card.title}



                                </p>





                                <h2 className="
                                    mt-2
                                    text-3xl
                                    font-bold
                                ">



                                    {card.value}



                                </h2>



                            </div>






                            <FontAwesomeIcon


                                icon={card.icon}


                                className={`

                                    text-4xl

                                    ${card.color}

                                `}


                            />



                        </div>



                    ))


                }



            </div>









            {/* TABLE */}





            <div className="
                rounded-xl
                bg-white
                p-6
                shadow-sm
            ">





                <div className="
                    mb-6
                    flex
                    flex-col
                    gap-4
                    md:flex-row
                ">





                    <div className="relative flex-1">





                        <FontAwesomeIcon


                            icon={faSearch}


                            className="
                                absolute
                                right-3
                                top-3
                                text-slate-400
                            "


                        />





                        <input


                            className="
                                w-full
                                rounded-lg
                                border
                                py-2
                                pr-10
                                pl-4
                            "


                            placeholder="البحث عن المفوض إليه..."



                            value={search}



                            onChange={

                                e =>

                                    setSearch(

                                        e.target.value

                                    )

                            }



                        />



                    </div>






                    <select


                        className="
                            rounded-lg
                            border
                            px-4
                            py-2
                        "



                        value={statusFilter}



                        onChange={

                            e =>

                                setStatusFilter(

                                    e.target.value as any

                                )

                        }



                    >



                        <option value="all">

                            كل الحالات

                        </option>



                        <option value="active">

                            نشط

                        </option>




                        <option value="expired">

                            منتهي

                        </option>



                    </select>






                    <select


                        className="
                            rounded-lg
                            border
                            px-4
                            py-2
                        "



                        value={typeFilter}



                        onChange={

                            e =>

                                setTypeFilter(

                                    e.target.value

                                )

                        }



                    >



                        <option value="all">

                            كل الأنواع

                        </option>




                        <option value="Approval">

                            اعتماد

                        </option>




                    </select>





                </div>





                {


                    loading ?



                        <div className="
                            py-20
                            text-center
                            text-slate-500
                        ">


                            جاري تحميل التفويضات...


                        </div>



                        :



                        filteredDelegations.length === 0 ?



                            <div className="
                            py-20
                            text-center
                        ">



                                لا توجد تفويضات.



                            </div>



                            :



                            <div className="overflow-x-auto">



                                <table className="w-full">



                                    <thead>



                                        <tr className="
                                    border-b
                                    bg-slate-100
                                ">



                                            <th className="p-4 text-right">

                                                المفوض إليه

                                            </th>



                                            <th className="p-4 text-right">

                                                النوع

                                            </th>




                                            <th className="p-4 text-right">

                                                الفترة

                                            </th>




                                            <th className="p-4 text-right">

                                                الحالة

                                            </th>




                                            <th className="p-4 text-center">

                                                الإجراءات

                                            </th>




                                        </tr>




                                    </thead>
                                    <tbody>


                                        {
                                            filteredDelegations.map(item => (


                                                <tr

                                                    key={item.id}

                                                    className="
                                                border-b
                                                hover:bg-slate-50
                                            "

                                                >



                                                    <td className="p-4">


                                                        <p className="font-semibold">

                                                            {item.delegateUserName}

                                                        </p>



                                                        <p className="
                                                    text-sm
                                                    text-slate-500
                                                ">


                                                            العميد:
                                                            {" "}
                                                            {item.deanName}


                                                        </p>



                                                    </td>





                                                    <td className="p-4">


                                                        <span className="
                                                    rounded-full
                                                    bg-blue-100
                                                    px-3
                                                    py-1
                                                    text-sm
                                                    text-blue-700
                                                ">


                                                            {item.type === "Approval"
                                                                ? "اعتماد"
                                                                : item.type
                                                            }


                                                        </span>


                                                    </td>






                                                    <td className="p-4">


                                                        {
                                                            new Date(item.startDate)
                                                                .toLocaleDateString("ar-SA")
                                                        }


                                                        <br />


                                                        {
                                                            new Date(item.endDate)
                                                                .toLocaleDateString("ar-SA")
                                                        }


                                                    </td>






                                                    <td className="p-4">



                                                        {

                                                            item.isActive ?


                                                                <span className="
                                                            rounded-full
                                                            bg-green-100
                                                            px-3
                                                            py-1
                                                            text-sm
                                                            text-green-700
                                                        ">


                                                                    نشط


                                                                </span>


                                                                :


                                                                <span className="
                                                            rounded-full
                                                            bg-red-100
                                                            px-3
                                                            py-1
                                                            text-sm
                                                            text-red-700
                                                        ">


                                                                    منتهي


                                                                </span>


                                                        }



                                                    </td>






                                                    <td className="p-4">



                                                        <div className="
                                                    flex
                                                    justify-center
                                                    gap-2
                                                ">




                                                            <button


                                                                className="
                                                            rounded-lg
                                                            border
                                                            px-3
                                                            py-2
                                                        "



                                                                onClick={() => {


                                                                    setSelectedDelegation(item);


                                                                    setShowDetails(true);



                                                                }}



                                                            >



                                                                <FontAwesomeIcon

                                                                    icon={faEye}

                                                                />



                                                            </button>






                                                            <button


                                                                className="
                                                            rounded-lg
                                                            border
                                                            px-3
                                                            py-2
                                                            text-red-600
                                                        "



                                                                onClick={() => {


                                                                    setDeleteId(item.id);


                                                                    setShowDelete(true);



                                                                }}



                                                            >



                                                                <FontAwesomeIcon

                                                                    icon={faTrash}

                                                                />



                                                            </button>





                                                        </div>



                                                    </td>




                                                </tr>



                                            ))


                                        }



                                    </tbody>




                                </table>




                            </div>



                }





            </div>









            {/* DETAILS MODAL */}



            {


                showDetails && selectedDelegation && (


                    <div className="
                        fixed
                        inset-0
                        z-50
                        flex
                        items-center
                        justify-center
                        bg-black/40
                        p-4
                    ">



                        <div className="
                            w-full
                            max-w-xl
                            rounded-xl
                            bg-white
                            p-6
                            shadow-xl
                        ">



                            <h2 className="
                                mb-5
                                text-xl
                                font-bold
                            ">


                                تفاصيل التفويض


                            </h2>





                            <div className="space-y-4">



                                <div>

                                    <p className="text-sm text-slate-500">
                                        المفوض إليه
                                    </p>


                                    <p className="font-semibold">

                                        {selectedDelegation.delegateUserName}

                                    </p>


                                </div>





                                <div>

                                    <p className="text-sm text-slate-500">
                                        العميد
                                    </p>


                                    <p className="font-semibold">

                                        {selectedDelegation.deanName}

                                    </p>


                                </div>






                                <div className="
                                    grid
                                    grid-cols-2
                                    gap-4
                                ">



                                    <div>

                                        <p className="text-sm text-slate-500">
                                            تاريخ البداية
                                        </p>


                                        <p>

                                            {
                                                new Date(
                                                    selectedDelegation.startDate
                                                )
                                                    .toLocaleDateString("ar-SA")
                                            }

                                        </p>


                                    </div>





                                    <div>

                                        <p className="text-sm text-slate-500">
                                            تاريخ النهاية
                                        </p>


                                        <p>

                                            {
                                                new Date(
                                                    selectedDelegation.endDate
                                                )
                                                    .toLocaleDateString("ar-SA")
                                            }

                                        </p>


                                    </div>



                                </div>






                                <div>


                                    <p className="text-sm text-slate-500">

                                        النوع

                                    </p>



                                    <span className="
                                        rounded-full
                                        bg-blue-100
                                        px-3
                                        py-1
                                        text-sm
                                        text-blue-700
                                    ">


                                        {
                                            selectedDelegation.type === "Approval"
                                                ? "اعتماد"
                                                : selectedDelegation.type
                                        }


                                    </span>



                                </div>







                                <div>


                                    <p className="text-sm text-slate-500">

                                        الملاحظات

                                    </p>



                                    <div className="
                                        mt-2
                                        rounded-lg
                                        bg-slate-100
                                        p-4
                                    ">


                                        {
                                            selectedDelegation.notes ||
                                            "لا توجد ملاحظات"
                                        }



                                    </div>



                                </div>




                            </div>





                            <button

                                onClick={() =>
                                    setShowDetails(false)
                                }


                                className="
                                    mt-6
                                    rounded-lg
                                    border
                                    px-4
                                    py-2
                                "

                            >

                                إغلاق


                            </button>



                        </div>



                    </div>



                )

            }
            {/* CREATE MODAL */}


            {
                showCreate && (

                    <div className="
                        fixed
                        inset-0
                        z-50
                        flex
                        items-center
                        justify-center
                        bg-black/40
                        p-4
                    ">


                        <div className="
                            w-full
                            max-w-lg
                            rounded-xl
                            bg-white
                            p-6
                            shadow-xl
                        ">


                            <h2 className="
                                mb-5
                                text-xl
                                font-bold
                            ">

                                إنشاء تفويض جديد

                            </h2>



                            <div className="space-y-4">


                                <div>

                                    <label className="text-sm font-medium">

                                        معرف المستخدم المفوض إليه

                                    </label>


                                    <input

                                        type="number"

                                        className="
                                            mt-1
                                            w-full
                                            rounded-lg
                                            border
                                            px-4
                                            py-2
                                        "

                                        value={delegateUserId}

                                        onChange={
                                            e =>
                                                setDelegateUserId(
                                                    e.target.value
                                                )
                                        }

                                    />


                                </div>




                                <div className="
                                    grid
                                    grid-cols-2
                                    gap-4
                                ">


                                    <div>

                                        <label className="text-sm font-medium">

                                            تاريخ البداية

                                        </label>


                                        <input

                                            type="date"

                                            className="
                                                mt-1
                                                w-full
                                                rounded-lg
                                                border
                                                px-4
                                                py-2
                                            "

                                            value={startDate}

                                            onChange={
                                                e =>
                                                    setStartDate(
                                                        e.target.value
                                                    )
                                            }

                                        />

                                    </div>




                                    <div>

                                        <label className="text-sm font-medium">

                                            تاريخ النهاية

                                        </label>


                                        <input

                                            type="date"

                                            className="
                                                mt-1
                                                w-full
                                                rounded-lg
                                                border
                                                px-4
                                                py-2
                                            "

                                            value={endDate}

                                            onChange={
                                                e =>
                                                    setEndDate(
                                                        e.target.value
                                                    )
                                            }

                                        />

                                    </div>


                                </div>





                                <div>


                                    <label className="text-sm font-medium">

                                        الملاحظات

                                    </label>


                                    <textarea

                                        className="
                                            mt-1
                                            min-h-24
                                            w-full
                                            rounded-lg
                                            border
                                            p-3
                                        "

                                        value={notes}

                                        onChange={
                                            e =>
                                                setNotes(
                                                    e.target.value
                                                )
                                        }

                                    />


                                </div>



                            </div>





                            <div className="
                                mt-6
                                flex
                                justify-end
                                gap-3
                            ">


                                <button

                                    onClick={() =>
                                        setShowCreate(false)
                                    }

                                    className="
                                        rounded-lg
                                        border
                                        px-4
                                        py-2
                                    "

                                >

                                    إلغاء

                                </button>




                                <button

                                    disabled={submitting}

                                    onClick={createDelegation}

                                    className="
                                        rounded-lg
                                        bg-yellow-400
                                        px-4
                                        py-2
                                        font-medium
                                    "

                                >

                                    {
                                        submitting
                                            ?
                                            "جاري الإنشاء..."
                                            :
                                            "إنشاء"
                                    }

                                </button>



                            </div>



                        </div>


                    </div>

                )
            }





            {/* DELETE MODAL */}


            {
                showDelete && (

                    <div className="
                        fixed
                        inset-0
                        z-50
                        flex
                        items-center
                        justify-center
                        bg-black/40
                        p-4
                    ">


                        <div className="
                            w-full
                            max-w-md
                            rounded-xl
                            bg-white
                            p-6
                            shadow-xl
                        ">


                            <h2 className="
                                text-xl
                                font-bold
                            ">

                                إلغاء التفويض

                            </h2>



                            <p className="
                                mt-4
                                text-slate-600
                            ">

                                هل أنت متأكد من إلغاء هذا التفويض؟

                            </p>





                            <div className="
                                mt-6
                                flex
                                justify-end
                                gap-3
                            ">


                                <button

                                    onClick={() => {

                                        setShowDelete(false);

                                        setDeleteId(null);

                                    }}

                                    className="
                                        rounded-lg
                                        border
                                        px-4
                                        py-2
                                    "

                                >

                                    إلغاء

                                </button>




                                <button

                                    onClick={revokeDelegation}

                                    className="
                                        rounded-lg
                                        bg-red-600
                                        px-4
                                        py-2
                                        text-white
                                    "

                                >

                                    إلغاء التفويض

                                </button>



                            </div>



                        </div>


                    </div>

                )
            }





        </div>

    );

}