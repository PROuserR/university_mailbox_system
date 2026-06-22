"use client";

import { useEffect, useMemo, useState } from "react";
import { apiWrapper } from "@/utils/apiClient";

import {
    faPlus,
    faEdit,
    faTrash,
    faPowerOff,
    faSearch,
    faFileLines,
    faXmark,
    faCheck,
    faBan,
} from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface DocumentType {

    id: number;

    name: string;

    isActive: boolean;

    createdAt: string;

    updatedAt: string | null;

}

interface ApiResponse<T> {
    isSuccess: boolean;
    data: T;
    message: string;
    errors: string[] | null;
    statusCode: number;
}

export default function DocumentTypesPage() {
    const [documents, setDocuments] = useState<DocumentType[]>([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<
        "all" | "active" | "inactive"
    >("all");

    const [modalOpen, setModalOpen] = useState(false);

    const [editing, setEditing] =
        useState<DocumentType | null>(null);

    const [name, setName] = useState("");

    const [processing, setProcessing] =
        useState(false);


    // ==========================
    // Fetch Document Types
    // ==========================

    async function loadDocuments() {

        try {

            setLoading(true);


            const response =
                await apiWrapper.get<ApiResponse<DocumentType[]>>(
                    "/DocumentTypes"
                );

            if (response.success) {
                if (response.data)
                    setDocuments(
                        response.data.data
                    );

            }


        }
        catch (error) {

            console.error(
                "Failed to load document types:",
                error
            );

        }
        finally {

            setLoading(false);

        }

    }


    useEffect(() => {
        loadDocuments();
    }, []);



    // ==========================
    // Filtering
    // ==========================

    const filteredDocuments = useMemo(() => {

        return documents.filter((item) => {

            const matchesSearch =
                item.name
                    .toLowerCase()
                    .includes(
                        search.toLowerCase()
                    );


            const matchesFilter =
                filter === "all"
                    ? true
                    : filter === "active"
                        ? item.isActive
                        : !item.isActive;


            return (
                matchesSearch &&
                matchesFilter
            );

        });

    }, [
        documents,
        search,
        filter
    ]);




    // ==========================
    // Create / Update
    // ==========================

    async function saveDocument() {

        if (!name.trim()) return;


        try {

            setProcessing(true);


            if (editing) {

                await apiWrapper.put(
                    `/DocumentTypes/${editing.id}`,
                    {
                        name
                    }
                );

            }
            else {

                await apiWrapper.post(
                    "/DocumentTypes",
                    {
                        name
                    }
                );

            }


            setModalOpen(false);
            setName("");
            setEditing(null);

            await loadDocuments();


        }
        catch (error) {

            console.error(error);

        }
        finally {

            setProcessing(false);

        }

    }



    // ==========================
    // Delete
    // ==========================

    async function deleteDocument(
        id: number
    ) {

        const confirmDelete =
            window.confirm(
                "هل تريد حذف نوع الوثيقة؟"
            );


        if (!confirmDelete)
            return;


        try {

            await apiWrapper.delete(
                `/DocumentTypes/${id}`
            );


            loadDocuments();

        }
        catch (error) {

            console.error(error);

        }

    }




    // ==========================
    // Activate / Deactivate
    // ==========================

    async function toggleStatus(
        item: DocumentType
    ) {

        try {


            const endpoint =
                item.isActive
                    ? `/DocumentTypes/${item.id}/deactivate`
                    : `/DocumentTypes/${item.id}/activate`;



            await apiWrapper.post(
                endpoint
            );


            loadDocuments();


        }
        catch (error) {

            console.error(error);

        }

    }




    function openCreate() {

        setEditing(null);
        setName("");
        setModalOpen(true);

    }



    function openEdit(
        item: DocumentType
    ) {

        setEditing(item);
        setName(item.name);
        setModalOpen(true);

    }



    function formatDate(
        date: string
    ) {

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


            {/* Header */}

            <div
                className="
        bg-white
        rounded-3xl
        shadow-sm
        border
        border-sky-100
        p-6
        mb-6
        flex
        justify-between
        items-center
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
                            icon={faFileLines}
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
                            أنواع الوثائق
                        </h1>


                        <p
                            className="
              text-slate-500
              mt-1
              "
                        >
                            إدارة تصنيفات وثائق نظام المراسلات
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

                    إضافة نوع وثيقة

                </button>


            </div>
            {/* Filters */}

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
          md:flex-row
          gap-4
          justify-between
          "
                >


                    {/* Search */}

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
                                setSearch(e.target.value)
                            }

                            placeholder="البحث عن نوع الوثيقة..."

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




                    {/* Status Filters */}

                    <div
                        className="
            flex
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
                                }

                            ].map((item) => (

                                <button

                                    key={item.key}

                                    onClick={() =>
                                        setFilter(
                                            item.key as any
                                        )
                                    }


                                    className={`
                  px-5
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

                            ))
                        }


                    </div>



                </div>


            </div>






            {/* Table */}

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
                    loading ?

                        (

                            <div
                                className="
              h-60
              flex
              items-center
              justify-center
              text-slate-500
              "
                            >

                                جاري تحميل البيانات...

                            </div>

                        )


                        :

                        filteredDocuments.length === 0 ?

                            (

                                <div
                                    className="
              h-60
              flex
              flex-col
              items-center
              justify-center
              text-slate-400
              gap-3
              "
                                >

                                    <FontAwesomeIcon
                                        icon={faFileLines}
                                        className="text-4xl"
                                    />

                                    لا توجد أنواع وثائق

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

                                                <th
                                                    className="
                  p-5
                  font-semibold
                  "
                                                >
                                                    الاسم
                                                </th>


                                                <th
                                                    className="
                  p-5
                  font-semibold
                  "
                                                >
                                                    الحالة
                                                </th>


                                                <th
                                                    className="
                  p-5
                  font-semibold
                  "
                                                >
                                                    تاريخ الإنشاء
                                                </th>


                                                <th
                                                    className="
                  p-5
                  font-semibold
                  "
                                                >
                                                    آخر تحديث
                                                </th>


                                                <th
                                                    className="
                  p-5
                  font-semibold
                  "
                                                >
                                                    الإجراءات
                                                </th>


                                            </tr>

                                        </thead>




                                        <tbody>


                                            {
                                                filteredDocuments.map(
                                                    (item) => (


                                                        <tr
                                                            key={item.id}
                                                            className="
                  border-t
                  border-slate-100
                  hover:bg-slate-50
                  transition
                  "
                                                        >


                                                            <td
                                                                className="
                    p-5
                    font-medium
                    text-slate-800
                    "
                                                            >

                                                                {item.name}

                                                            </td>




                                                            <td
                                                                className="p-5"
                                                            >

                                                                {
                                                                    item.isActive ?

                                                                        (

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

                                                                        )

                                                                        :

                                                                        (

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
                                                                                    icon={faBan}
                                                                                />

                                                                                غير نشط

                                                                            </span>

                                                                        )
                                                                }


                                                            </td>





                                                            <td
                                                                className="
                    p-5
                    text-slate-500
                    "
                                                            >

                                                                {
                                                                    formatDate(
                                                                        item.createdAt
                                                                    )
                                                                }

                                                            </td>





                                                            <td
                                                                className="
                    p-5
                    text-slate-500
                    "
                                                            >

                                                                {
                                                                    item.updatedAt
                                                                        ?
                                                                        formatDate(
                                                                            item.updatedAt
                                                                        )
                                                                        :
                                                                        "-"
                                                                }

                                                            </td>





                                                            <td
                                                                className="p-5"
                                                            >

                                                                <div
                                                                    className="
                      flex
                      gap-2
                      "
                                                                >

                                                                    <button

                                                                        onClick={() =>
                                                                            openEdit(item)
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





                                                                    <button

                                                                        onClick={() =>
                                                                            toggleStatus(item)
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
                                                                            icon={faPowerOff}
                                                                        />

                                                                    </button>





                                                                    <button

                                                                        onClick={() =>
                                                                            deleteDocument(
                                                                                item.id
                                                                            )
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







            {/* Modal */}

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
          "
                >


                    <div
                        className="
            bg-white
            rounded-3xl
            w-full
            max-w-md
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
                                        "تعديل نوع الوثيقة"
                                        :
                                        "إضافة نوع وثيقة"
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





                        <input

                            value={name}

                            onChange={(e) =>
                                setName(
                                    e.target.value
                                )
                            }

                            placeholder="اسم الوثيقة"

                            className="
              w-full
              border
              border-slate-200
              rounded-2xl
              p-4
              mb-5
              outline-none
              focus:border-sky-400
              "

                        />






                        <button

                            disabled={processing}

                            onClick={saveDocument}

                            className="
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