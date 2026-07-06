// components/mail/MailDistribute.tsx

"use client";

import {
    useEffect,
    useMemo,
    useState,
} from "react";

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
    faLock,
    faUserPlus,
    faUserMinus,
} from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import toast from "react-hot-toast";

import { User } from "@/types/api/distribution.types";
import { useDistributionEditor, useDistributeMutation } from "@/hooks/useDistribute";

type Props = {
    correspondenceId: number;
    onSuccess?: () => void;
    onClose?: () => void;
};

// =========================
// COMPONENT
// =========================

export default function MailDistribute({
    correspondenceId,
    onSuccess,
    onClose,
}: Props) {
    // =========================
    // STATE
    // =========================

    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [notes, setNotes] = useState("");
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");

    // =========================
    // HOOKS
    // =========================

    const {
        data: editorData,
        isLoading,
        isError,
        refetch,
    } = useDistributionEditor(correspondenceId);

    const distributeMutation = useDistributeMutation(correspondenceId, onSuccess, onClose);

    // =========================
    // INIT SELECTED USERS (غير الدائمين فقط)
    // =========================

    useEffect(() => {
        if (editorData?.users) {
            const initialSelected = editorData.users
                .filter(u => u.isSelected && !u.isPermanentReceiver)
                .map(u => u.id);

            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSelectedUsers(initialSelected);
        }
    }, [editorData]);

    // =========================
    // FILTER USERS
    // =========================

    const permanentUsers = useMemo(() => {
        return editorData?.users.filter(u => u.isPermanentReceiver) ?? [];
    }, [editorData]);

    const currentUsers = useMemo(() => {
        return editorData?.users.filter(
            u => !u.isPermanentReceiver && selectedUsers.includes(u.id)
        ) ?? [];
    }, [editorData, selectedUsers]);

    const availableUsers = useMemo(() => {
        return editorData?.users.filter(
            u =>
                !u.isPermanentReceiver &&
                !selectedUsers.includes(u.id) &&
                (
                    u.fullName.toLowerCase().includes(search.toLowerCase()) ||
                    u.email.toLowerCase().includes(search.toLowerCase())
                )
        ) ?? [];
    }, [editorData, selectedUsers, search]);

    // =========================
    // TOGGLE USER (إضافة/إزالة)
    // =========================

    const addUser = (id: number) => {
        setSelectedUsers((prev) => [...prev, id]);
    };

    const removeUser = (id: number) => {
        setSelectedUsers((prev) => prev.filter((x) => x !== id));
    };

    // =========================
    // SUBMIT
    // =========================

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedUsers.length) {
            toast.error("اختر مستلم واحد على الأقل");
            return;
        }

        distributeMutation.mutate({ receiverIds: selectedUsers, notes });
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
                <p>فشل تحميل بيانات التوزيع</p>
                <button
                    onClick={() => refetch()}
                    className="mt-2 rounded-lg bg-red-100 px-4 py-2 text-sm text-red-600 hover:bg-red-200"
                >
                    إعادة المحاولة
                </button>
            </div>
        );
    }

    // =========================
    // RENDER
    // =========================

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full text-right"
        >
            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>

                {/* ======================================== */}
                {/* 1. المستخدمون الدائمون (Permanent) */}
                {/* ======================================== */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-[2rem] border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-6 shadow-lg"
                >
                    <div className="mb-5 flex flex-row-reverse items-center justify-end gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                            <FontAwesomeIcon icon={faLock} />
                        </div>
                        <div className="text-right">
                            <h2 className="text-lg font-bold text-gray-800">
                                التوزيع الدائم
                            </h2>
                            <p className="text-sm text-gray-500">
                                يتم التوزيع عليهم تلقائياً - لا يمكن التعديل
                            </p>
                        </div>
                    </div>

                    {permanentUsers.length === 0 ? (
                        <p className="text-sm text-gray-400">لا يوجد مستخدمون دائمون</p>
                    ) : (
                        <div className="flex flex-wrap gap-3">
                            {permanentUsers.map((user) => (
                                <motion.div
                                    key={user.id}
                                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    className="group relative overflow-hidden rounded-3xl border border-blue-100 bg-white p-4 shadow-md transition hover:-translate-y-1 hover:shadow-xl"
                                >
                                    <div className="relative flex flex-row-reverse items-start gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-400 to-gray-500 text-white font-bold">
                                            {user.firstName.charAt(0)}
                                        </div>
                                        <div className="flex flex-col items-end text-right">
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
                                                <FontAwesomeIcon icon={faLock} className="text-gray-400" />
                                                <span className="text-xs text-gray-400">تلقائي</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* ======================================== */}
                {/* 2. المستخدمون الحاليون (Selected) */}
                {/* ======================================== */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-[2rem] border border-blue-100 bg-gradient-to-br from-yellow-50 to-white p-6 shadow-lg"
                >
                    <div className="mb-5 flex flex-row-reverse items-center justify-end gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-100 text-yellow-600">
                            <FontAwesomeIcon icon={faUserCheck} />
                        </div>
                        <div className="text-right">
                            <h2 className="text-lg font-bold text-gray-800">
                                المستلمون الحاليون
                            </h2>
                            <p className="text-sm text-gray-500">
                                {currentUsers.length} مستلم
                            </p>
                        </div>
                    </div>

                    {currentUsers.length === 0 ? (
                        <p className="text-sm text-gray-400">لا يوجد مستلمون حالياً</p>
                    ) : (
                        <div className="flex flex-wrap gap-3">
                            {currentUsers.map((user) => (
                                <motion.div
                                    key={user.id}
                                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="group relative overflow-hidden rounded-3xl border border-yellow-200 bg-white p-4 shadow-md transition hover:-translate-y-1 hover:shadow-xl"
                                >
                                    <div className="relative flex flex-row-reverse items-start gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-400 text-white font-bold">
                                            {user.firstName.charAt(0)}
                                        </div>
                                        <div className="flex flex-col items-end text-right">
                                            <span className="font-bold text-gray-800">
                                                {user.fullName}
                                            </span>
                                            <div className="mt-1 flex flex-row-reverse items-center gap-2 text-sm text-gray-500">
                                                <FontAwesomeIcon icon={faEnvelope} className="text-yellow-500" />
                                                {user.email}
                                            </div>
                                            <div className="mt-2 flex flex-row-reverse items-center gap-2">
                                                <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs text-yellow-700">
                                                    {user.role}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeUser(user.id)}
                                                    className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-500 transition hover:bg-red-100 hover:text-red-600"
                                                    title="إزالة المستلم"
                                                >
                                                    <FontAwesomeIcon icon={faUserMinus} className="text-sm" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* ======================================== */}
                {/* 3. إضافة مستلمين (Available Users) */}
                {/* ======================================== */}
                <div className="flex flex-col gap-3">
                    <label className="flex flex-row-reverse items-center justify-end gap-2 text-sm font-bold text-gray-700">
                        <FontAwesomeIcon icon={faUserGroup} className="text-blue-600" />
                        إضافة مستلمين
                    </label>

                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setOpen(!open)}
                            className="flex w-full flex-row-reverse items-center justify-between rounded-3xl border border-blue-100 bg-white px-6 py-4 shadow-lg transition hover:shadow-xl"
                        >
                            <div className="flex flex-row-reverse items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                                    <FontAwesomeIcon icon={faUserPlus} />
                                </div>
                                <div className="flex flex-col items-end text-right">
                                    <span className="font-semibold text-gray-800">
                                        {availableUsers.length} متاح للإضافة
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        اختر مستلمين لإضافتهم
                                    </span>
                                </div>
                            </div>
                            <motion.div animate={{ rotate: open ? 180 : 0 }} className="pr-4">
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
                                            placeholder="بحث عن مستلم..."
                                            className="w-full rounded-2xl border border-blue-100 bg-blue-50/40 px-4 py-3 text-right outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                                        />
                                    </div>

                                    <div className="max-h-[350px] overflow-y-auto">
                                        {availableUsers.length === 0 ? (
                                            <div className="py-8 text-center text-gray-400">
                                                {search ? "لا توجد نتائج بحث" : "جميع المستخدمين تم اختيارهم"}
                                            </div>
                                        ) : (
                                            availableUsers.map((user, i) => (
                                                <motion.button
                                                    key={user.id}
                                                    type="button"
                                                    onClick={() => addUser(user.id)}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.02 }}
                                                    className="flex w-full flex-row-reverse items-center justify-between border-b px-5 py-4 text-right transition hover:bg-blue-50"
                                                >
                                                    <div className="flex flex-row-reverse items-center gap-4">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white">
                                                            {user.firstName.charAt(0)}
                                                        </div>
                                                        <div className="flex flex-col items-end text-right">
                                                            <span className="font-semibold text-gray-800">
                                                                {user.fullName}
                                                            </span>
                                                            <span className="text-sm text-gray-500">
                                                                {user.email}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                                        <FontAwesomeIcon icon={faUserPlus} className="text-sm" />
                                                    </div>
                                                </motion.button>
                                            ))
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* ======================================== */}
                {/* 4. الملاحظات */}
                {/* ======================================== */}
                <div className="flex flex-col gap-3 text-right">
                    <label className="text-sm font-bold text-gray-700">
                        ملاحظات
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        className="resize-none rounded-[2rem] border border-blue-100 p-5 text-right outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                        placeholder="أضف ملاحظات (اختياري)..."
                    />
                </div>

                {/* ======================================== */}
                {/* 5. أزرار الإجراءات */}
                {/* ======================================== */}
                <div className="flex gap-3">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        type="submit"
                        disabled={distributeMutation.isPending || selectedUsers.length === 0}
                        className="flex flex-1 items-center justify-center gap-3 rounded-[2rem] bg-blue-600 px-6 py-4 font-bold text-white shadow-xl transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <FontAwesomeIcon
                            icon={distributeMutation.isPending ? faSpinner : faPaperPlane}
                            spin={distributeMutation.isPending}
                        />
                        {distributeMutation.isPending ? "جاري الحفظ..." : "حفظ التوزيع"}
                    </motion.button>

                    {onClose && (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            type="button"
                            onClick={onClose}
                            className="flex items-center justify-center gap-3 rounded-[2rem] border border-gray-200 px-6 py-4 font-bold text-gray-600 transition hover:bg-gray-50"
                        >
                            <FontAwesomeIcon icon={faXmark} />
                            إلغاء
                        </motion.button>
                    )}
                </div>

            </form>
        </motion.div>
    );
}