"use client";

import { useState } from "react";

import { useQuery, useMutation } from "@tanstack/react-query";

import { apiWrapper } from "@/utils/apiClient";

import toast from "react-hot-toast";
import UsersDropdown from "../dropdown/UsersDropdown";

type User = {
    id: number;
    firstName: string;
    lastName: string
};

type Props = {
    correspondenceId: number;
};

export default function MailDistribute({ correspondenceId }: Props) {
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

    const [notes, setNotes] = useState<string>("");

    // =========================
    // GET USERS
    // =========================

    const {
        data: users,
        isLoading,
        isError,
    } = useQuery<User[]>({
        queryKey: ["users"],
        queryFn: async () => {
            const res =
                await apiWrapper.get<{
                    data: User[];
                }>("/Users");

            if (!res.success || !res.data) {
                throw new Error("Failed to fetch users");
            }

            return res.data.data;
        },
    });

    // =========================
    // POST DISTRIBUTION
    // =========================

    const distributeMutation = useMutation({
        mutationFn: async () => {
            const payload = {
                correspondenceId,
                receiverIds: selectedUsers,
                notes,
            };

            const res =
                await apiWrapper.post(
                    "/Distributions/distribute",
                    payload
                );

            if (!res.success) {
                toast.error("فشل توزيع البريد");
                throw new Error("Distribution failed");
            }

            return res.data;
        },

        onSuccess: () => {
            toast.success("تم توزيع البريد بنجاح");

            setSelectedUsers([]);
            setNotes("");
        },
    });

    // =========================
    // HANDLERS
    // =========================

    const handleSelect = (
        e: React.ChangeEvent<HTMLSelectElement>
    ) => {
        const values = Array.from(
            e.target.selectedOptions
        ).map((opt) => Number(opt.value));

        setSelectedUsers(values);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        distributeMutation.mutate();
    };

    if (isLoading) return <p>Loading users...</p>;

    if (isError) return <p>Failed to load users</p>;

    return (
        <div className="flex flex-row-reverse  ml-auto items-center gap-8">

            <form
                onSubmit={handleSubmit}
                className="flex flex-row-reverse gap-8 items-center"
            >

                {/* USERS MULTI SELECT */}

                <label>المستلمين</label>

                <UsersDropdown
                    users={users}
                    selectedUsers={selectedUsers}
                    setSelectedUsers={setSelectedUsers}
                />

                {/* NOTES */}

                <input
                    type="text"
                    placeholder="ملاحظات"
                    value={notes}
                    onChange={(e) =>
                        setNotes(e.target.value)
                    }
                    className="p-2 border rounded-xl"
                />

                {/* SUBMIT */}

                <input
                    type="submit"
                    value={
                        distributeMutation.isPending
                            ? "جاري التوزيع..."
                            : "توزيع"
                    }
                    disabled={
                        distributeMutation.isPending
                    }
                    className="bg-blue-500 p-4 rounded-2xl text-white cursor-pointer disabled:opacity-50"
                />
            </form>
        </div>
    );
}