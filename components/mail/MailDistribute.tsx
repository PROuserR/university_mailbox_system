"use client";

import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    useMutation,
    useQuery,
} from "@tanstack/react-query";

import {
    motion,
    AnimatePresence,
} from "framer-motion";

import {
    faCheck,
    faChevronDown,
    faPaperPlane,
    faSpinner,
    faUserGroup,
    faXmark,
    faEnvelope,
    faUserCheck,
} from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { apiWrapper } from "@/utils/apiClient";

import toast from "react-hot-toast";

type User = {
    id: number;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    role: string;
    isSelected?: boolean;
    isPermanentReceiver: boolean
};

type DistributionEditorData = {
    correspondenceId: number;
    correspondenceNumber: string;
    correspondenceTitle: string;
    users: User[];
};

type Props = {
    correspondenceId: number;
};

export default function MailDistribute({
    correspondenceId,
}: Props) {
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [notes, setNotes] = useState("");
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");

    // =========================
    // GET DATA
    // =========================

    const {
        data: editorData,
        isLoading,
        isError,
    } = useQuery<DistributionEditorData>({
        queryKey: ["distribution-editor", correspondenceId],
        queryFn: async () => {
            const res = await apiWrapper.get<{
                data: DistributionEditorData;
            }>(`Distributions/editor-data/${correspondenceId}`);

            if (!res.success || !res.data) {
                throw new Error("Failed to load distribution data");
            }

            return res.data.data;
        },
    });

    // =========================
    // INIT SELECTED USERS
    // =========================

    useEffect(() => {
        if (editorData?.users) {
            setSelectedUsers(
                editorData.users
                    .filter((u) => u.isSelected)
                    .map((u) => u.id)
            );
        }
    }, [editorData]);

    // =========================
    // FILTER USERS
    // =========================

    const filteredUsers = useMemo(() => {
        if (!editorData?.users) return [];

        return editorData.users.filter(
            (user) =>
                user.fullName.toLowerCase().includes(search.toLowerCase()) ||
                user.email.toLowerCase().includes(search.toLowerCase())
        );
    }, [editorData, search]);

    // =========================
    // TOGGLE USER
    // =========================

    const toggleUser = (id: number) => {
        setSelectedUsers((prev) =>
            prev.includes(id)
                ? prev.filter((x) => x !== id)
                : [...prev, id]
        );
    };

    // =========================
    // SUBMIT
    // =========================

    const distributeMutation = useMutation({
        mutationFn: async () => {
            const res = await apiWrapper.post(
                "Distributions/distribute",
                {
                    correspondenceId,
                    receiverIds: selectedUsers,
                    notes,
                }
            );

            if (!res.success) throw new Error();

            return res.data;
        },
        onSuccess: () => {
            toast.success("تم حفظ التوزيع بنجاح");
        },
        onError: () => {
            toast.error("فشل حفظ التوزيع");
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedUsers.length) {
            toast.error("اختر مستلم واحد على الأقل");
            return;
        }

        distributeMutation.mutate();
    };

    // =========================
    // LOADING / ERROR
    // =========================

    if (isLoading) {
        return (
            <div className="flex items-center gap-3 rounded-3xl bg-blue-50 px-6 py-5 text-blue-600 text-right">
                <FontAwesomeIcon icon={faSpinner} spin />
                جاري تحميل بيانات التوزيع...
            </div>
        );
    }

    if (isError || !editorData) {
        return (
            <div className="rounded-3xl bg-red-50 px-6 py-5 text-red-500 text-right">
                فشل تحميل بيانات التوزيع
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full text-right"
        >
            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>

                {/* CURRENT DISTRIBUTION */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-[2rem] border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-6 shadow-lg flex flex-col w-full"
                >
                    <div className="mb-5 w-full text-right flex flex-row-reverse items-center justify-end gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                            <FontAwesomeIcon icon={faUserCheck} />
                        </div>

                        <div className="text-right">
                            <h2 className="text-lg font-bold text-gray-800">
                                التوزيع الحالي
                            </h2>
                            <p className="text-sm text-gray-500">
                                المستخدمون الموزع عليهم
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-6 gap-8">
                        <AnimatePresence>
                            {editorData.users
                                .map((user, i) => (
                                    <motion.div
                                        key={user.id}
                                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        transition={{ delay: i * 0.04 }}
                                        className="flex rounded-3xl border border-blue-100 bg-white p-4 shadow-md transition hover:-translate-y-1 hover:shadow-xl text-right"
                                    >
                                        <div className=" flex items-start gap-4 w-64">

                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-400 text-white font-bold">
                                                {user.firstName.charAt(0)}
                                            </div>

                                            <div className="flex flex-col items-end justify-end text-right">
                                                <span className="font-bold text-gray-800">
                                                    {user.fullName}
                                                </span>

                                                <div className="mt-1 flex flex-row-reverse items-center gap-2 text-sm text-gray-500">
                                                    <FontAwesomeIcon icon={faEnvelope} className="text-blue-500" />
                                                    {user.email}
                                                </div>

                                                <div className="mt-2 flex flex-row-reverse items-center gap-2">
                                                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-700">
                                                        {user.role}
                                                    </span>

                                                    <button
                                                        type="button"
                                                        onClick={() => toggleUser(user.id)}
                                                        className="flex h-7 w-7 items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100"
                                                    >
                                                        <FontAwesomeIcon icon={faXmark} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* PERMANANT DISTRIBUTION */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-[2rem] border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-6 shadow-lg flex flex-col w-full"
                >
                    <div className="mb-5 w-full text-right flex flex-row-reverse items-center justify-end gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                            <FontAwesomeIcon icon={faUserCheck} />
                        </div>

                        <div className="text-right">
                            <h2 className="text-lg font-bold text-gray-800">
                                التوزيع الدائم
                            </h2>
                            <p className="text-sm text-gray-500">
                                المستخدمون الموزع عليهم
                            </p>
                        </div>
                    </div>

                    <div className="flex  gap-3">
                        <AnimatePresence>
                            {editorData.users
                                .filter((u) => selectedUsers.includes(u.id) && u.isPermanentReceiver == true)
                                .map((user, i) => (
                                    <motion.div
                                        key={user.id}
                                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        transition={{ delay: i * 0.04 }}
                                        className="group relative overflow-hidden rounded-3xl border border-blue-100 bg-white p-4 shadow-md transition hover:-translate-y-1 hover:shadow-xl text-right"
                                    >
                                        <div className="relative flex flex-row-reverse items-start gap-4">

                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-400 text-white font-bold">
                                                {user.firstName.charAt(0)}
                                            </div>

                                            <div className="flex flex-col items-end justify-end text-right">
                                                <span className="font-bold text-gray-800">
                                                    {user.fullName}
                                                </span>

                                                <div className="mt-1 flex flex-row-reverse items-center gap-2 text-sm text-gray-500">
                                                    <FontAwesomeIcon icon={faEnvelope} className="text-blue-500" />
                                                    {user.email}
                                                </div>

                                                <div className="mt-2 flex flex-row-reverse items-center gap-2">
                                                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-700">
                                                        {user.role}
                                                    </span>

                                                    <button
                                                        type="button"
                                                        onClick={() => toggleUser(user.id)}
                                                        className="flex h-7 w-7 items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100"
                                                    >
                                                        <FontAwesomeIcon icon={faXmark} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* SELECT USERS */}
                <div className="flex flex-col gap-3">
                    <label className="flex flex-row-reverse items-center justify-end gap-2 text-sm font-bold text-gray-700">
                        <FontAwesomeIcon icon={faUserGroup} className="text-blue-600" />
                        إدارة المستلمين
                    </label>

                    <div className="relative">

                        <button
                            type="button"
                            onClick={() => setOpen(!open)}
                            className="flex w-full flex-row-reverse items-center justify-end rounded-3xl border border-blue-100 bg-white px-6 py-4 shadow-lg text-right"
                        >
                            <div className="flex flex-row-reverse items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                                    <FontAwesomeIcon icon={faUserGroup} />
                                </div>

                                <div className="flex flex-col items-end text-right">
                                    <span className="font-semibold text-gray-800">
                                        {selectedUsers.length} مستلم
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        اختر أو عدل المستلمين
                                    </span>
                                </div>

                            </div>

                            <motion.div animate={{ rotate: open ? 180 : 0 }} className="pr-8">
                                <FontAwesomeIcon icon={faChevronDown} />
                            </motion.div>
                        </button>

                        <AnimatePresence>
                            {open && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute z-50 mt-3 w-full overflow-hidden rounded-[2rem] border border-blue-100 bg-white shadow-2xl"
                                >
                                    <div className="p-4">
                                        <input
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            placeholder="بحث..."
                                            className="w-full rounded-2xl border border-blue-100 bg-blue-50/40 px-4 py-3 text-right"
                                        />
                                    </div>

                                    <div className="max-h-[350px] overflow-y-auto">

                                        {filteredUsers.map((user, i) => {
                                            const isSelected = selectedUsers.includes(user.id);

                                            return (
                                                <motion.button
                                                    key={user.id}
                                                    type="button"
                                                    onClick={() => toggleUser(user.id)}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.02 }}
                                                    className="flex w-full flex-row-reverse items-center justify-between border-b px-5 py-4 text-right hover:bg-blue-50"
                                                >
                                                    <div className="flex flex-row-reverse items-center gap-4">

                                                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white">
                                                            {user.firstName.charAt(0)}
                                                        </div>

                                                        <div className="flex flex-col items-end text-right">
                                                            <span className="font-semibold">
                                                                {user.fullName}
                                                            </span>
                                                            <span className="text-sm text-gray-500">
                                                                {user.email}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {isSelected && (
                                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white">
                                                            <FontAwesomeIcon icon={faCheck} />
                                                        </div>
                                                    )}
                                                </motion.button>
                                            );
                                        })}

                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* NOTES */}
                <div className="flex flex-col gap-3 text-right">
                    <label className="text-sm font-bold text-gray-700">
                        ملاحظات
                    </label>

                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={4}
                        className="resize-none rounded-[2rem] border border-blue-100 p-5 text-right"
                        placeholder="أضف ملاحظات..."
                    />
                </div>

                {/* SUBMIT */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    disabled={distributeMutation.isPending}
                    className="flex w-1/2 mx-auto items-center justify-center gap-3 rounded-[2rem] bg-blue-600 px-6 py-5 font-bold text-white shadow-xl"
                >
                    <FontAwesomeIcon
                        icon={distributeMutation.isPending ? faSpinner : faPaperPlane}
                        spin={distributeMutation.isPending}
                    />

                    {distributeMutation.isPending
                        ? "جاري الحفظ..."
                        : "حفظ التوزيع"}
                </motion.button>

            </form>
        </motion.div>
    );
}