"use client";

import { useEffect, useMemo, useState } from "react";
import { apiWrapper } from "@/utils/apiClient";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBuilding,
    faCheckCircle,
    faBan,
    faPlus,
    faPen,
    faTrash,
    faSearch,
} from "@fortawesome/free-solid-svg-icons";

interface SenderEntity {
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
}

export default function SenderEntitiesPage() {
    const [entities, setEntities] = useState<SenderEntity[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const [showCreate, setShowCreate] = useState(false);
    const [showEdit, setShowEdit] = useState(false);

    const [selected, setSelected] = useState<SenderEntity | null>(null);
    const [name, setName] = useState("");

    const loadData = async () => {
        try {
            const response =
                await apiWrapper.get<ApiResponse<SenderEntity[]>>(
                    "/SenderEntities"
                );

            if (response.data?.isSuccess) {
                setEntities(response.data.data);
            }
        } catch {
            toast.error("فشل تحميل البيانات");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const filtered = useMemo(() => {
        return entities.filter((x) =>
            x.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [entities, search]);

    const activeCount = entities.filter((x) => x.isActive).length;
    const inactiveCount = entities.filter((x) => !x.isActive).length;

    const createEntity = async () => {
        try {
            await apiWrapper.post("/SenderEntities", { name });
            toast.success("تم إنشاء الجهة بنجاح");
            setShowCreate(false);
            setName("");
            loadData();
        } catch {
            toast.error("فشل إنشاء الجهة");
        }
    };

    const updateEntity = async () => {
        if (!selected) return;

        try {
            await apiWrapper.put(
                `/SenderEntities/${selected.id}`,
                { name }
            );

            toast.success("تم تعديل الجهة");
            setShowEdit(false);
            loadData();
        } catch {
            toast.error("فشل التعديل");
        }
    };

    const deleteEntity = async (id: number) => {
        if (!confirm("هل أنت متأكد من الحذف؟")) return;

        try {
            await apiWrapper.delete(`/SenderEntities/${id}`);
            toast.success("تم الحذف");
            loadData();
        } catch {
            toast.error("فشل الحذف");
        }
    };

    const toggleStatus = async (entity: SenderEntity) => {
        try {
            await apiWrapper.post(
                `/SenderEntities/${entity.id}/${entity.isActive ? "deactivate" : "activate"}`
            );

            toast.success(
                entity.isActive
                    ? "تم تعطيل الجهة"
                    : "تم تفعيل الجهة"
            );

            loadData();
        } catch {
            toast.error("فشل العملية");
        }
    };

    if (loading) {
        return (
            <div dir="rtl" className="flex min-h-screen items-center justify-center">
                جاري التحميل...
            </div>
        );
    }

    return (
        <div dir="rtl"
            className="relative isolate min-h-screen p-6 py-16">
            <div className="space-y-8">

                <div className="rounded-3xl border border-blue-200/60 bg-white/90 p-8 shadow-xl backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800">
                                إدارة الجهات المرسلة
                            </h1>

                            <p className="mt-2 text-slate-500">
                                إدارة وتنظيم الجهات المرسلة في النظام
                            </p>
                        </div>

                        <button
                            onClick={() => {
                                setName("");
                                setShowCreate(true);
                            }}
                            className="rounded-2xl bg-yellow-400 px-5 py-3 text-black shadow-lg transition-all hover:scale-105 hover:shadow-xl font-bold"
                        >
                            <FontAwesomeIcon icon={faPlus} className="ml-2" />
                            إضافة جهة
                        </button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card title="إجمالي الجهات" value={entities.length} icon={faBuilding} />
                    <Card title="الجهات النشطة" value={activeCount} icon={faCheckCircle} />
                    <Card title="الجهات المعطلة" value={inactiveCount} icon={faBan} />
                </div>

                <div className="rounded-3xl border border-blue-100 bg-white/90 p-6 shadow-xl backdrop-blur-sm">
                    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                        <div className="relative w-full md:max-w-md">
                            <FontAwesomeIcon
                                icon={faSearch}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="البحث عن جهة..."
                                className="w-full rounded-2xl border border-blue-200 bg-white p-3 pr-10 shadow-lg outline-none transition-all focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                            />
                        </div>


                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-blue-100 bg-blue-50 text-right">
                                    <th className="p-4">الجهة</th>
                                    <th className="p-4">الحالة</th>
                                    <th className="p-4">تاريخ الإنشاء</th>
                                    <th className="p-4">آخر تعديل</th>
                                    <th className="p-4">الإجراءات</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filtered.map((entity) => (
                                    <tr key={entity.id} className="border-b transition-colors hover:bg-blue-50/70">
                                        <td className="max-w-[300px] truncate p-4">
                                            {entity.name}
                                        </td>

                                        <td className="p-4">
                                            <span
                                                className={`rounded-full px-3 py-1 text-sm ${entity.isActive
                                                    ? "bg-emerald-100 text-emerald-700"
                                                    : "bg-amber-100 text-amber-700"
                                                    }`}
                                            >
                                                {entity.isActive ? "نشطة" : "معطلة"}
                                            </span>
                                        </td>

                                        <td className="p-4">
                                            {new Date(entity.createdAt).toLocaleDateString()}
                                        </td>

                                        <td className="p-4">
                                            {entity.updatedAt
                                                ? new Date(entity.updatedAt).toLocaleDateString()
                                                : "-"}
                                        </td>

                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setSelected(entity);
                                                        setName(entity.name);
                                                        setShowEdit(true);
                                                    }}

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
                                                    <FontAwesomeIcon icon={faPen} />
                                                </button>

                                                <button
                                                    onClick={() => toggleStatus(entity)}
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
                                                        icon={entity.isActive ? faBan : faCheckCircle}
                                                    />
                                                </button>

                                                <button
                                                    onClick={() => deleteEntity(entity.id)}
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
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {showCreate && (
                <Modal
                    title="إضافة جهة جديدة"
                    value={name}
                    setValue={setName}
                    onClose={() => setShowCreate(false)}
                    onSave={createEntity}
                />
            )}

            {showEdit && (
                <Modal
                    title="تعديل الجهة"
                    value={name}
                    setValue={setName}
                    onClose={() => setShowEdit(false)}
                    onSave={updateEntity}
                />
            )}
        </div>
    );
}

function Card({
    title,
    value,
    icon,
}: any) {
    return (
        <motion.div
            whileHover={{
                y: -4,
                scale: 1.02,
            }}
            className="
            rounded-3xl
            border
            border-blue-100
            bg-white/90
            p-6
            shadow-xl
            backdrop-blur-sm
            "
        >
            <div className="flex items-center justify-between">
                <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-blue-400 p-4 text-white shadow-lg">
                    <FontAwesomeIcon
                        icon={icon}
                        className="text-xl"
                    />
                </div>

                <span className="font-medium text-slate-600">
                    {title}
                </span>
            </div>

            <h2 className="mt-6 text-4xl font-bold text-slate-800">
                {value}
            </h2>
        </motion.div>
    );
}

function Modal({
    title,
    value,
    setValue,
    onClose,
    onSave,
}: any) {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
            <div className="w-full max-w-md rounded-3xl border border-blue-100 bg-white p-8 shadow-2xl">
                <h2 className="mb-4 text-xl font-bold">{title}</h2>

                <input
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="mb-4 w-full rounded-2xl border border-blue-200 bg-blue-50/30 p-3 outline-none transition-all focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                />

                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="rounded-xl border px-4 py-2"
                    >
                        إلغاء
                    </button>

                    <button
                        onClick={onSave}
                        className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-400 px-4 py-2 text-white shadow-lg"
                    >
                        حفظ
                    </button>
                </div>
            </div>
        </div>
    );
}
