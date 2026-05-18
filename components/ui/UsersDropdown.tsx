"use client"

import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faChevronDown,
    faCheck,
} from "@fortawesome/free-solid-svg-icons"

type User = {
    id: number
    firstName: string
    lastName: string
}

type Props = {
    users?: User[]
    selectedUsers: number[]
    setSelectedUsers: React.Dispatch<React.SetStateAction<number[]>>
}

export default function UsersDropdown({
    users,
    selectedUsers,
    setSelectedUsers,
}: Props) {
    const [open, setOpen] = useState(false)

    const toggleUser = (id: number) => {
        setSelectedUsers((prev) =>
            prev.includes(id)
                ? prev.filter((userId) => userId !== id)
                : [...prev, id]
        )
    }

    return (
        <div className="relative w-[260px]" dir="rtl">
            {/* Trigger */}
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex w-full items-center justify-between rounded-xl border bg-white px-4 py-2 text-right shadow-sm"
            >
                <span className="truncate">
                    {selectedUsers.length > 0
                        ? `تم اختيار ${selectedUsers.length}`
                        : "اختر المستخدمين"}
                </span>

                <FontAwesomeIcon
                    icon={faChevronDown}
                    className={`text-sm transition-transform duration-200 ${open ? "rotate-180" : ""
                        }`}
                />
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute z-50 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border bg-white p-2 shadow-lg">
                    {users?.map((user) => {
                        const isSelected = selectedUsers.includes(user.id)

                        return (
                            <button
                                key={user.id}
                                type="button"
                                onClick={() => toggleUser(user.id)}
                                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-right transition hover:bg-gray-100"
                            >
                                <span>
                                    {user.firstName} {user.lastName}
                                </span>

                                {isSelected && (
                                    <FontAwesomeIcon
                                        icon={faCheck}
                                        className="text-sm"
                                    />
                                )}
                            </button>
                        )
                    })}
                </div>
            )}
        </div>
    )
}