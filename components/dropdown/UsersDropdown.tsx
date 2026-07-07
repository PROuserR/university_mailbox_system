// components/dropdown/UsersDropdown.tsx

"use client";

import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faChevronDown,
    faCheck,
    faUser,
    faSearch,
    faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";

type User = {
    id: number;
    firstName: string;
    lastName: string;
    email?: string;
};

type Props = {
    users?: User[];
    selectedUsers: number[];
    setSelectedUsers: React.Dispatch<React.SetStateAction<number[]>>;
    placeholder?: string;
    className?: string;
};

export default function UsersDropdown({
    users = [],
    selectedUsers,
    setSelectedUsers,
    placeholder = "اختر المستخدمين",
    className = "",
}: Props) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    // ✅ إغلاق عند الضغط خارج القائمة
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // ✅ تصفية المستخدمين حسب البحث
    const filteredUsers = users.filter((user) => {
        const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
        const searchTerm = search.toLowerCase();
        return fullName.includes(searchTerm) || user.email?.toLowerCase().includes(searchTerm);
    });

    const toggleUser = (id: number) => {
        setSelectedUsers((prev) =>
            prev.includes(id)
                ? prev.filter((userId) => userId !== id)
                : [...prev, id]
        );
    };

    const selectAll = () => {
        const allIds = users.map((u) => u.id);
        setSelectedUsers(allIds);
    };

    const deselectAll = () => {
        setSelectedUsers([]);
    };

    const getSelectedNames = () => {
        if (selectedUsers.length === 0) return placeholder;
        if (selectedUsers.length === 1) {
            const user = users.find((u) => u.id === selectedUsers[0]);
            return user ? `${user.firstName} ${user.lastName}` : placeholder;
        }
        return `تم اختيار ${selectedUsers.length} مستخدمين`;
    };

    return (
        <div className={`relative w-full min-w-[200px] ${className}`} dir="rtl" ref={dropdownRef}>
            {/* ===== Trigger ===== */}
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-right shadow-sm hover:border-blue-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
                <span className="truncate text-sm text-gray-700">
                    {getSelectedNames()}
                </span>

                <div className="flex items-center gap-2">
                    {selectedUsers.length > 0 && (
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                            {selectedUsers.length}
                        </span>
                    )}
                    <FontAwesomeIcon
                        icon={faChevronDown}
                        className={`text-sm text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                    />
                </div>
            </button>

            {/* ===== Dropdown ===== */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl"
                    >
                        {/* ===== Header ===== */}
                        <div className="flex items-center gap-2 p-3 border-b border-gray-100">
                            <div className="relative flex-1">
                                <FontAwesomeIcon
                                    icon={faSearch}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"
                                />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="بحث..."
                                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 pr-8 text-sm outline-none focus:border-blue-400 focus:bg-white transition"
                                />
                            </div>
                            {selectedUsers.length > 0 && (
                                <button
                                    type="button"
                                    onClick={deselectAll}
                                    className="px-2 py-1 rounded-lg text-xs text-red-500 hover:bg-red-50 transition"
                                >
                                    <FontAwesomeIcon icon={faXmark} className="ml-1" />
                                    إلغاء الكل
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={selectAll}
                                className="px-2 py-1 rounded-lg text-xs text-blue-500 hover:bg-blue-50 transition"
                            >
                                تحديد الكل
                            </button>
                        </div>

                        {/* ===== List ===== */}
                        <div className="max-h-56 overflow-y-auto p-1.5">
                            {filteredUsers.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-6 text-gray-400">
                                    <FontAwesomeIcon icon={faUser} className="text-2xl mb-1" />
                                    <p className="text-xs">لا يوجد مستخدمين</p>
                                </div>
                            ) : (
                                filteredUsers.map((user) => {
                                    const isSelected = selectedUsers.includes(user.id);
                                    const fullName = `${user.firstName} ${user.lastName}`;

                                    return (
                                        <button
                                            key={user.id}
                                            type="button"
                                            onClick={() => toggleUser(user.id)}
                                            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-right transition-all duration-150 ${
                                                isSelected
                                                    ? "bg-blue-50 hover:bg-blue-100"
                                                    : "hover:bg-gray-50"
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                                                    isSelected
                                                        ? "bg-blue-500 text-white"
                                                        : "bg-gray-200 text-gray-600"
                                                }`}>
                                                    {user.firstName?.charAt(0) || "?"}
                                                </div>
                                                <div className="min-w-0 text-right">
                                                    <p className={`text-sm truncate ${
                                                        isSelected ? "font-semibold text-blue-700" : "text-gray-700"
                                                    }`}>
                                                        {fullName}
                                                    </p>
                                                    {user.email && (
                                                        <p className="text-xs text-gray-400 truncate">
                                                            {user.email}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {isSelected && (
                                                <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0">
                                                    <FontAwesomeIcon icon={faCheck} className="text-[10px]" />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })
                            )}
                        </div>

                        {/* ===== Footer ===== */}
                        <div className="border-t border-gray-100 p-2 text-center">
                            <p className="text-[10px] text-gray-400">
                                {selectedUsers.length} من {users.length} مستخدمين
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}