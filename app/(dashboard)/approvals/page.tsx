"use client";

import { useEffect, useMemo, useState } from "react";
import { apiWrapper } from "@/utils/apiClient";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
    faClipboardCheck,
    faClock,
    faSearch,
    faFilter,
    faRotate,
    faUsers,
    faFileLines,
    faPaperclip,
    faCheck,
    faXmark,
    faEye,
    faBolt,
} from "@fortawesome/free-solid-svg-icons";


interface Attachment {

    id: number;

    fileName: string;

    filePath: string;

    fileSize: number;

    mimeType: string;

    isPrimary: boolean;

}


interface Distribution {

    id: number;

    distributedDate: string;

    status: string;

    receiverId: number;

    receiverName: string;

    receiverRole: string;

    receiverEmail: string;

    isAutoDistributed?: boolean;

}


interface PendingCorrespondence {

    correspondenceId: number;

    correspondenceNumber: string;

    correspondenceTitle: string;

    correspondenceContent: string;

    senderEntity: string;

    documentType: string;

    mainType: string;

    isProfessional: boolean;

    issuedDate: string;

    receivedDate: string;

    distributorName: string;

    attachments: Attachment[];

    pendingReceivers: Distribution[];


}


interface GroupedResponse {

    items: PendingCorrespondence[];

}


interface ApiResponse<T> {

    isSuccess: boolean;

    data: T;

    message: string;

}



export default function ApprovalCenterPage() {


    const [loading, setLoading] = useState(true);


    const [search, setSearch] = useState("");



    const [filter, setFilter] =
        useState<
            "all" | "incoming" | "outgoing"
        >("all");



    // Stores distribution IDs
    const [selected, setSelected] =
        useState<number[]>([]);



    const [items, setItems] =
        useState<PendingCorrespondence[]>([]);



    const loadData = async () => {
        try {
            setLoading(true);
            const response =
                await apiWrapper.get<ApiResponse<GroupedResponse>>(
                    "/Distributions/pending-approval/grouped"
                );



            if (response.success) {
                if (response.data)
                    setItems(
                        response.data.data.items ?? []
                    );
            }
            else {

                if (response.data)
                    toast.error(
                        response.data.message ||
                        "فشل تحميل البيانات"
                    );


            }



        }
        catch {


            toast.error(
                "فشل تحميل التوزيعات"
            );


        }
        finally {


            setLoading(false);


        }


    };



    const approveDistribution = async (
        id: number
    ) => {


        if (
            !window.confirm(
                "اعتماد هذا التوزيع؟"
            )
        )
            return;



        try {


            await apiWrapper.post(
                `/Distributions/${id}/approve`
            );



            toast.success(
                "تم اعتماد التوزيع"
            );



            await loadData();



        }
        catch {


            toast.error(
                "فشل اعتماد التوزيع"
            );


        }


    };



    const rejectDistribution = async (
        id: number
    ) => {


        if (
            !window.confirm(
                "رفض هذا التوزيع؟"
            )
        )
            return;



        try {


            await apiWrapper.post(
                `/Distributions/${id}/reject`
            );



            toast.success(
                "تم رفض التوزيع"
            );



            await loadData();



        }
        catch {


            toast.error(
                "فشل رفض التوزيع"
            );


        }


    };



    const approveAll = async (
        correspondenceId: number
    ) => {



        if (
            !window.confirm(
                "اعتماد جميع المستلمين؟"
            )
        )
            return;



        try {


            await apiWrapper.post(
                `/Distributions/correspondence/${correspondenceId}/approve-all`
            );



            toast.success(
                "تم اعتماد جميع المستلمين"
            );



            await loadData();



        }
        catch {


            toast.error(
                "فشل العملية"
            );


        }


    };



    const rejectAll = async (
        correspondenceId: number
    ) => {



        if (
            !window.confirm(
                "رفض جميع المستلمين؟"
            )
        )
            return;



        try {


            await apiWrapper.post(
                `/Distributions/correspondence/${correspondenceId}/reject-all`
            );



            toast.success(
                "تم رفض جميع المستلمين"
            );



            await loadData();



        }
        catch {


            toast.error(
                "فشل العملية"
            );


        }


    };



    const approveBatch = async () => {



        if (
            selected.length === 0
        )
            return;



        if (
            !window.confirm(
                `اعتماد ${selected.length} توزيع؟`
            )
        )
            return;



        try {


            await apiWrapper.post(
                "/Distributions/batch/approve",
                {
                    distributionIds: selected,
                }
            );



            toast.success(
                "تم اعتماد المحدد"
            );



            setSelected([]);



            await loadData();



        }
        catch {


            toast.error(
                "فشل العملية"
            );


        }


    };



    const rejectBatch = async () => {



        if (
            selected.length === 0
        )
            return;



        if (
            !window.confirm(
                `رفض ${selected.length} توزيع؟`
            )
        )
            return;



        try {


            await apiWrapper.post(
                "/Distributions/batch/reject",
                {
                    distributionIds: selected,
                }
            );



            toast.success(
                "تم رفض المحدد"
            );



            setSelected([]);



            await loadData();



        }
        catch {


            toast.error(
                "فشل العملية"
            );


        }


    };



    useEffect(() => {


        loadData();


    }, []);




    const filtered =
        useMemo(() => {


            const searchValue =
                search.toLowerCase();



            return items.filter(
                (item) => {



                    const matchesSearch =

                        item.correspondenceTitle
                            ?.toLowerCase()
                            .includes(searchValue)

                        ||

                        item.correspondenceNumber
                            ?.toLowerCase()
                            .includes(searchValue)

                        ||

                        item.senderEntity
                            ?.toLowerCase()
                            .includes(searchValue);



                    const matchesFilter =

                        filter === "all"

                        ||

                        item.mainType
                            ?.toLowerCase()
                            .includes(filter);



                    return (
                        matchesSearch &&
                        matchesFilter
                    );


                }
            );


        }, [items, search, filter]);




    const totalReceivers =
        useMemo(() => {


            return items.reduce(
                (sum, item) =>
                    sum +
                    item.pendingReceivers.length,
                0
            );


        }, [items]);




    const autoDistributed =
        useMemo(() => {


            return items.reduce(
                (sum, item) =>
                    sum +
                    item.pendingReceivers.filter(
                        receiver =>
                            receiver.isAutoDistributed
                    ).length,
                0
            );


        }, [items]);



    const manualDistributed =
        totalReceivers -
        autoDistributed;



    if (loading) {

        return (
            <div
                dir="rtl"
                className="flex min-h-screen items-center justify-center text-xl font-bold"
            >
                جاري تحميل مركز الاعتماد...
            </div>
        );


    }
    return (
        <div
            dir="rtl"
            className="
                min-h-screen
                bg-gradient-to-br
                from-blue-50
                via-yellow-50
                to-white
                p-8
            "
        >

            <div
                className="
                    w-full
                    space-y-8
                "
            >


                {/* HERO */}

                <motion.div

                    initial={{
                        opacity: 0,
                        y: -30,
                    }}

                    animate={{
                        opacity: 1,
                        y: 0,
                    }}

                    className="
                        rounded-[32px]
                        border
                        border-blue-200/70
                        bg-white/90
                        p-8
                        shadow-2xl
                        backdrop-blur-sm
                    "

                >


                    <div
                        className="
                            flex
                            items-center
                            justify-between
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
                                    flex
                                    h-16
                                    w-16
                                    items-center
                                    justify-center
                                    rounded-3xl
                                    bg-gradient-to-br
                                    from-blue-500
                                    to-blue-400
                                    text-white
                                    shadow-lg
                                "
                            >

                                <FontAwesomeIcon
                                    icon={faClipboardCheck}
                                    className="text-2xl"
                                />

                            </div>


                            <div>


                                <h1
                                    className="
                                        text-4xl
                                        font-black
                                        text-slate-800
                                    "
                                >

                                    مركز اعتماد التوزيعات

                                </h1>


                                <p
                                    className="
                                        mt-2
                                        text-slate-500
                                    "
                                >

                                    مراجعة واعتماد أو رفض التوزيعات
                                    المعلقة بطريقة احترافية.

                                </p>


                            </div>


                        </div>



                        <button

                            onClick={loadData}

                            className="
                                rounded-2xl
                                bg-yellow-400
                                px-5
                                py-3
                                font-bold
                                shadow-lg
                                transition
                                hover:scale-105
                            "

                        >

                            <FontAwesomeIcon
                                icon={faRotate}
                                className="ml-2"
                            />

                            تحديث

                        </button>


                    </div>


                </motion.div>




                {/* STATS */}


                <div
                    className="
                        grid
                        gap-5
                        lg:grid-cols-4
                    "
                >


                    <StatCard
                        title="التوزيعات المعلقة"
                        value={totalReceivers}
                        icon={faClock}
                        color="blue"
                    />


                    <StatCard
                        title="عدد المراسلات"
                        value={items.length}
                        icon={faFileLines}
                        color="yellow"
                    />


                    <StatCard
                        title="توزيع تلقائي"
                        value={autoDistributed}
                        icon={faBolt}
                        color="emerald"
                    />


                    <StatCard
                        title="توزيع يدوي"
                        value={manualDistributed}
                        icon={faUsers}
                        color="purple"
                    />


                </div>




                {/* TOOLBAR */}


                <div
                    className="
                        rounded-3xl
                        border
                        border-blue-100
                        bg-white/90
                        p-6
                        shadow-xl
                    "
                >


                    <div
                        className="
                            flex
                            flex-col
                            gap-5
                            lg:flex-row
                            lg:items-center
                            lg:justify-between
                        "
                    >



                        <div
                            className="
                                relative
                                w-full
                                max-w-lg
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
                                    ابحث برقم أو عنوان المراسلة...
                                "

                                className="
                                    w-full
                                    rounded-2xl
                                    border
                                    border-blue-200
                                    bg-white
                                    p-3
                                    pr-10
                                    outline-none
                                    focus:border-blue-400
                                    focus:ring-4
                                    focus:ring-blue-100
                                "

                            />


                        </div>




                        <div
                            className="
                                flex
                                flex-wrap
                                gap-3
                            "
                        >


                            {[
                                {
                                    key: "all",
                                    label: "الكل",
                                },
                                {
                                    key: "incoming",
                                    label: "الوارد",
                                },
                                {
                                    key: "outgoing",
                                    label: "الصادر",
                                },
                            ].map((item) => (


                                <button

                                    key={item.key}

                                    onClick={() =>
                                        setFilter(
                                            item.key as
                                            "all" |
                                            "incoming" |
                                            "outgoing"
                                        )
                                    }


                                    className={`

                                        rounded-2xl
                                        px-5
                                        py-3
                                        font-semibold
                                        transition-all

                                        ${filter === item.key

                                            ?

                                            `bg-gradient-to-r
                                    from-blue-500
                                    to-blue-400
                                    text-white
                                    shadow-lg
                                            `

                                            :

                                            `
                            bg-blue-50
                            text-slate-700
                            hover:bg-yellow-100
                            `

                                        }

                                    `}

                                >

                                    <FontAwesomeIcon
                                        icon={faFilter}
                                        className="ml-2"
                                    />


                                    {item.label}


                                </button>


                            ))}


                        </div>



                    </div>


                </div>





                {/* BATCH ACTIONS */}


                {
                    selected.length > 0 && (

                        <motion.div

                            initial={{
                                opacity: 0,
                                y: -20,
                            }}

                            animate={{
                                opacity: 1,
                                y: 0,
                            }}

                            className="
                                rounded-3xl
                                border
                                border-yellow-200
                                bg-yellow-50
                                p-5
                                shadow-lg
                            "

                        >


                            <div
                                className="
                                    flex
                                    items-center
                                    justify-between
                                "
                            >


                                <h3
                                    className="
                                        font-bold
                                        text-slate-700
                                    "
                                >

                                    تم تحديد {selected.length} توزيع

                                </h3>



                                <div
                                    className="
                                        flex
                                        gap-3
                                    "
                                >


                                    <button

                                        onClick={approveBatch}

                                        className="
                                            rounded-2xl
                                            bg-emerald-500
                                            px-5
                                            py-3
                                            text-white
                                            shadow-lg
                                        "

                                    >

                                        <FontAwesomeIcon
                                            icon={faCheck}
                                            className="ml-2"
                                        />

                                        اعتماد المحدد

                                    </button>



                                    <button

                                        onClick={rejectBatch}

                                        className="
                                            rounded-2xl
                                            bg-red-500
                                            px-5
                                            py-3
                                            text-white
                                            shadow-lg
                                        "

                                    >

                                        <FontAwesomeIcon
                                            icon={faXmark}
                                            className="ml-2"
                                        />

                                        رفض المحدد

                                    </button>



                                </div>


                            </div>


                        </motion.div>


                    )
                }




                {/* CARDS START */}

                <div className="grid gap-6">


                    {
                        filtered.length === 0 && (

                            <div
                                className="
                                    rounded-3xl
                                    border
                                    border-dashed
                                    border-blue-200
                                    bg-white
                                    py-20
                                    text-center
                                    shadow-lg
                                "
                            >

                                <FontAwesomeIcon
                                    icon={faClipboardCheck}
                                    className="
                                        mb-4
                                        text-5xl
                                        text-blue-300
                                    "
                                />


                                <h2
                                    className="
                                        text-2xl
                                        font-bold
                                    "
                                >

                                    لا توجد توزيعات بانتظار الاعتماد

                                </h2>


                            </div>

                        )
                    }
                    {filtered.map((item) => (

                        <motion.div

                            key={item.correspondenceId}

                            whileHover={{
                                y: -4,
                            }}

                            className="
                                overflow-hidden
                                rounded-[30px]
                                border
                                border-blue-100
                                bg-white/95
                                shadow-xl
                            "

                        >


                            {/* HEADER */}

                            <div
                                className="
                                    bg-gradient-to-r
                                    from-blue-600
                                    via-blue-500
                                    to-yellow-400
                                    p-6
                                    text-white
                                "
                            >


                                <div
                                    className="
                                        flex
                                        items-start
                                        justify-between
                                    "
                                >


                                    <div>


                                        <h2
                                            className="
                                                text-2xl
                                                font-bold
                                            "
                                        >

                                            {item.correspondenceTitle}

                                        </h2>


                                        <p className="mt-2">

                                            رقم المراسلة:
                                            {" "}
                                            {item.correspondenceNumber}

                                        </p>


                                    </div>



                                    <div>

                                        <input

                                            type="checkbox"

                                            checked={
                                                item.pendingReceivers.length > 0 &&
                                                item.pendingReceivers.every(
                                                    receiver =>
                                                        selected.includes(
                                                            receiver.receiverId
                                                        )
                                                )
                                            }


                                            onChange={(e) => {


                                                const ids =
                                                    item.pendingReceivers.map(
                                                        receiver =>
                                                            receiver.receiverId
                                                    );



                                                if (e.target.checked) {


                                                    setSelected(
                                                        Array.from(
                                                            new Set(
                                                                [
                                                                    ...selected,
                                                                    ...ids
                                                                ]
                                                            )
                                                        )
                                                    );


                                                }
                                                else {


                                                    setSelected(
                                                        selected.filter(
                                                            id =>
                                                                !ids.includes(id)
                                                        )
                                                    );


                                                }


                                            }}


                                            className="h-6 w-6"

                                        />


                                    </div>


                                </div>


                            </div>




                            {/* BODY */}


                            <div
                                className="
                                    grid
                                    gap-8
                                    p-8
                                    lg:grid-cols-3
                                "
                            >



                                {/* INFORMATION */}


                                <div>


                                    <h3
                                        className="
                                            mb-4
                                            font-bold
                                            text-slate-700
                                        "
                                    >

                                        معلومات المراسلة

                                    </h3>



                                    <div className="space-y-3">


                                        <InfoRow

                                            label="الجهة المرسلة"

                                            value={
                                                item.senderEntity
                                            }

                                        />


                                        <InfoRow

                                            label="نوع الوثيقة"

                                            value={
                                                item.documentType
                                            }

                                        />


                                        <InfoRow

                                            label="نوع المراسلة"

                                            value={
                                                item.mainType
                                            }

                                        />


                                        <InfoRow

                                            label="الموزع"

                                            value={
                                                item.distributorName
                                            }

                                        />


                                    </div>


                                </div>





                                {/* RECEIVERS */}


                                <div>


                                    <h3
                                        className="
                                            mb-4
                                            font-bold
                                        "
                                    >

                                        المستلمون

                                    </h3>



                                    <div className="space-y-3">


                                        {
                                            item.pendingReceivers.map(
                                                receiver => (

                                                    <div
                                                        key={
                                                            receiver.receiverId
                                                        }

                                                        className="
                                                            flex
                                                            items-center
                                                            justify-between
                                                            rounded-2xl
                                                            bg-blue-50
                                                            p-3
                                                        "

                                                    >


                                                        <div>


                                                            <h4 className="font-semibold">

                                                                {
                                                                    receiver.receiverName
                                                                }

                                                            </h4>


                                                            <p
                                                                className="
                                                                    text-xs
                                                                    text-slate-500
                                                                "
                                                            >

                                                                {
                                                                    receiver.receiverRole
                                                                }

                                                            </p>


                                                        </div>



                                                        <button

                                                            className="
                                                                rounded-xl
                                                                bg-white
                                                                p-3
                                                                shadow
                                                            "

                                                        >

                                                            <FontAwesomeIcon
                                                                icon={faEye}
                                                            />


                                                        </button>



                                                    </div>


                                                )
                                            )
                                        }


                                    </div>


                                </div>






                                {/* ACTIONS */}


                                <div>


                                    <h3
                                        className="
                                            mb-4
                                            font-bold
                                            text-slate-700
                                        "
                                    >

                                        إجراءات الاعتماد

                                    </h3>



                                    <div
                                        className="
                                            rounded-2xl
                                            bg-slate-50
                                            p-4
                                        "
                                    >


                                        <div
                                            className="
                                                mb-3
                                                flex
                                                items-center
                                                gap-2
                                            "
                                        >

                                            <FontAwesomeIcon
                                                icon={faPaperclip}
                                            />

                                            <span className="font-semibold">

                                                المرفقات

                                            </span>


                                        </div>



                                        {

                                            item.attachments.length === 0

                                                ?

                                                <p className="text-sm text-slate-400">

                                                    لا توجد مرفقات

                                                </p>

                                                :

                                                item.attachments.map(
                                                    file => (

                                                        <div

                                                            key={
                                                                file.id
                                                            }

                                                            className="
                                                            rounded-xl
                                                            bg-white
                                                            p-3
                                                            mb-2
                                                        "

                                                        >

                                                            <FontAwesomeIcon
                                                                icon={faPaperclip}
                                                                className="ml-2"
                                                            />

                                                            {file.fileName}

                                                        </div>

                                                    )
                                                )

                                        }


                                    </div>





                                    <div
                                        className="
                                            mt-6
                                            grid
                                            gap-3
                                        "
                                    >


                                        <button

                                            onClick={() =>
                                                approveAll(
                                                    item.correspondenceId
                                                )
                                            }

                                            className="
                                                rounded-2xl
                                                bg-emerald-500
                                                px-5
                                                py-4
                                                font-bold
                                                text-white
                                            "

                                        >

                                            <FontAwesomeIcon
                                                icon={faCheck}
                                                className="ml-2"
                                            />

                                            اعتماد جميع المستلمين

                                        </button>



                                        <button

                                            onClick={() =>
                                                rejectAll(
                                                    item.correspondenceId
                                                )
                                            }

                                            className="
                                                rounded-2xl
                                                bg-red-500
                                                px-5
                                                py-4
                                                font-bold
                                                text-white
                                            "

                                        >

                                            <FontAwesomeIcon
                                                icon={faXmark}
                                                className="ml-2"
                                            />

                                            رفض جميع المستلمين

                                        </button>


                                    </div>



                                </div>


                            </div>





                            {/* INDIVIDUAL ACTIONS */}


                            <div
                                className="
                                    border-t
                                    border-blue-100
                                    bg-blue-50/40
                                    p-6
                                "
                            >


                                <h3 className="mb-5 font-bold">

                                    إجراءات المستلمين

                                </h3>



                                <div className="space-y-3">


                                    {
                                        item.pendingReceivers.map(
                                            receiver => (

                                                <div

                                                    key={
                                                        receiver.receiverId
                                                    }

                                                    className="
                                                        flex
                                                        items-center
                                                        justify-between
                                                        rounded-2xl
                                                        bg-white
                                                        p-4
                                                        shadow
                                                    "

                                                >


                                                    <div>

                                                        <h4 className="font-semibold">

                                                            {
                                                                receiver.receiverName
                                                            }

                                                        </h4>


                                                        <p className="text-sm text-slate-500">

                                                            {
                                                                receiver.receiverEmail
                                                            }

                                                        </p>


                                                    </div>




                                                    <div className="flex gap-3">


                                                        <button

                                                            onClick={() =>
                                                                approveDistribution(
                                                                    receiver.receiverId
                                                                )
                                                            }

                                                            className="
                                                                rounded-xl
                                                                bg-emerald-100
                                                                px-4
                                                                py-2
                                                                text-emerald-700
                                                            "

                                                        >

                                                            <FontAwesomeIcon
                                                                icon={faCheck}
                                                            />

                                                        </button>




                                                        <button

                                                            onClick={() =>
                                                                rejectDistribution(
                                                                    receiver.receiverId
                                                                )
                                                            }

                                                            className="
                                                                rounded-xl
                                                                bg-red-100
                                                                px-4
                                                                py-2
                                                                text-red-700
                                                            "

                                                        >

                                                            <FontAwesomeIcon
                                                                icon={faXmark}
                                                            />

                                                        </button>



                                                    </div>


                                                </div>

                                            )
                                        )
                                    }


                                </div>


                            </div>


                        </motion.div>

                    ))}



                </div>


            </div>


        </div >


    );

}




function InfoRow({

    label,

    value,

}: {

    label: string;

    value: string;

}) {


    return (

        <div
            className="
                flex
                justify-between
                rounded-xl
                bg-slate-50
                p-3
            "
        >

            <span className="text-slate-500">

                {label}

            </span>


            <span className="font-semibold">

                {value}

            </span>


        </div>

    );

}





function StatCard({

    title,

    value,

    icon,

    color,

}: {

    title: string;

    value: number;

    icon: any;

    color:
    "blue" |
    "yellow" |
    "emerald" |
    "purple";

}) {


    const colors = {

        blue:
            "from-blue-600 to-blue-400",

        yellow:
            "from-yellow-500 to-yellow-400",

        emerald:
            "from-emerald-600 to-emerald-400",

        purple:
            "from-purple-600 to-purple-400",

    };



    return (

        <motion.div

            whileHover={{
                y: -5,
            }}

            className="
                rounded-[28px]
                bg-white
                p-6
                shadow-xl
            "

        >


            <div
                className="
                    flex
                    justify-between
                    items-center
                "
            >

                <div
                    className={`
                        rounded-2xl
                        bg-gradient-to-br
                        ${colors[color]}
                        p-4
                        text-white
                    `}
                >

                    <FontAwesomeIcon
                        icon={icon}
                    />

                </div>



                <span className="font-semibold">

                    {title}

                </span>


            </div>



            <h2 className="mt-6 text-5xl font-black">

                {value}

            </h2>



        </motion.div>

    );

}