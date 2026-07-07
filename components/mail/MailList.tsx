// components/mail/MailList.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    useInfiniteQuery,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faSortAmountDown,
    faSortAmountUp,
    faSpinner,
    faInbox,
    faPaperPlane,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";

import { apiWrapper } from "@/utils/apiClient";
import { Mail } from "@/types/api/Mail/Mail";
import { MailPageResponse } from "@/types/api/Mail/MailPageResponse";
import useSearchInputStore from "@/store/searchInputStore";
import useMailFilterStore from "@/store/mailFilterStore";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";

import MailCard from "./MailCard";
import MailListLoader from "@/components/ui/MailListLoader";
import MailListError from "@/components/ui/MailListError";

export default function MailList() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const { seachInput } = useSearchInputStore();
    const { filter } = useMailFilterStore();

    const [sortBy, setSortBy] = useState("createdAt");
    const [sortOrderDESC, setSortOrderDESC] = useState(true);

    // =========================
    // FETCH MAILS
    // =========================

    const fetchMails = async (pageParam: number): Promise<MailPageResponse> => {
        const res = await apiWrapper.get<{ data: MailPageResponse }>(
            "/Correspondences/paged",
            {
                PageSize: 12,
                Page: pageParam,
                SortBy: sortBy,
                SortOrderDESC: sortOrderDESC,
                MainType: filter !== "Professional" ? filter : null,
                IsProfessional: filter === "Professional" ? true : null,
                Search: seachInput || undefined,
            }
        );

        if (!res.success || !res.data) {
            throw new Error("Failed to fetch mails");
        }

        return res.data.data;
    };

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
        refetch,
    } = useInfiniteQuery<MailPageResponse>({
        queryKey: ["mails", filter, seachInput, sortBy, sortOrderDESC],
        queryFn: ({ pageParam = 1 }) => fetchMails(pageParam as number),
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) => {
            const loaded = allPages.flatMap((p) => p.items).length;
            return loaded < lastPage.totalCount ? allPages.length + 1 : undefined;
        },
    });

    const mailList = data?.pages.flatMap((page) => page.items) ?? [];

    const bottomRef = useInfiniteScroll({
        onBottom: fetchNextPage,
        isLoading: isFetchingNextPage,
        hasMore: !!hasNextPage,
        dataLength: mailList.length,
    });

    // =========================
    // DELETE MAIL
    // =========================

    const deleteMailMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await apiWrapper.delete(`Correspondences/${id}`);

            if (!res.success) {
                toast.error("لا يمكن حذف البريد بعد توزيعه");
                throw new Error("Failed to delete mail");
            }

            return id;
        },
        onSuccess: (_, deletedId) => {
            queryClient.setQueryData(
                ["mails", filter, seachInput, sortBy, sortOrderDESC],
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (oldData: any) => {
                    if (!oldData) return oldData;

                    return {
                        ...oldData,
                        pages: oldData.pages.map((page: MailPageResponse) => ({
                            ...page,
                            items: page.items.filter(
                                (mail: Mail) => String(mail.id) !== deletedId
                            ),
                            totalCount: page.totalCount - 1,
                        })),
                    };
                }
            );

            toast.success("تم حذف البريد بنجاح");
        },
    });

    // =========================
    // OPEN MAIL
    // =========================

    const openMail = (mail: Mail) => {
        router.push(`/mail/${mail.id}`);
    };

    // =========================
    // EDIT MAIL
    // =========================

    const editMail = (mail: Mail) => {
        router.push(`/mail/${mail.id}/edit`);
    };

    // =========================
    // RENDER
    // =========================

    if (isLoading) return <MailListLoader />;
    if (isError) return <MailListError onRetry={() => refetch()} />;

    return (
        <div className="flex flex-col h-full w-full bg-gray-50">
            {/* ===== شريط الفلترة والترتيب ===== */}
            <div className="bg-white border-b border-gray-200 px-4 py-2 sticky top-0 z-10">
                <div className="flex items-center justify-between gap-2">
                    {/* نوع العرض */}
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                        <FontAwesomeIcon icon={faInbox} className="text-blue-500" />
                        <span>{filter || "الكل"}</span>
                        <span className="text-gray-300 mx-1">|</span>
                        <span className="font-medium text-gray-700">{mailList.length}</span>
                    </div>

                    {/* الترتيب */}
                    <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="text-sm bg-transparent outline-none text-gray-600 cursor-pointer"
                        >
                            <option value="createdAt">التاريخ</option>
                            <option value="title">العنوان</option>
                            <option value="number">الرقم</option>
                        </select>
                        <button
                            onClick={() => setSortOrderDESC(!sortOrderDESC)}
                            className="text-blue-600 p-1 hover:bg-blue-50 rounded transition"
                        >
                            <FontAwesomeIcon
                                icon={sortOrderDESC ? faSortAmountDown : faSortAmountUp}
                            />
                        </button>
                    </div>
                </div>
            </div>

            {/* ===== قائمة البريد ===== */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {mailList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <div className="text-6xl mb-4">📭</div>
                        <p className="text-lg font-medium">لا توجد رسائل</p>
                        <p className="text-sm">حاول تغيير فلترة البحث</p>
                    </div>
                ) : (
                    mailList.map((mail, index) => (
                        <MailCard
                            key={mail.id}
                            mail={mail}
                            index={index}
                            onClick={openMail}
                            onEdit={editMail}
                            onDelete={(id) => deleteMailMutation.mutate(id)}
                            isDeleting={deleteMailMutation.isPending}
                            editable={true}
                        />
                    ))
                )}

                {/* عنصر التحميل اللانهائي */}
                <div ref={bottomRef} className="py-2">
                    {isFetchingNextPage && (
                        <div className="flex justify-center items-center gap-2 text-blue-600 py-2">
                            <FontAwesomeIcon icon={faSpinner} spin />
                            <span className="text-sm">جاري تحميل المزيد...</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
