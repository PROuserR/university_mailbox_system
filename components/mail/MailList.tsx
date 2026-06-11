"use client";

import useShowMailDetailsStore from "@/store/showMailDetails";

import { useState } from "react";

import { apiWrapper } from "@/utils/apiClient";

import useSearchInputStore from "@/store/searchInputStore";

import useInfiniteScroll from "@/hooks/useInfiniteScroll";

import useMailFilterStore from "@/store/mailFilterStore";

import {
    useInfiniteQuery,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import toast from "react-hot-toast";

import { AnimatePresence, motion } from "framer-motion";

import { Mail } from "@/types/api/Mail/Mail";

import { MailPageResponse } from "@/types/api/Mail/MailPageResponse";

import MailViewer from "@/components/mail/MailViewer";

import MailCard from "@/components/mail/MailCard";

import MailListLoader from "@/components/ui/MailListLoader";

import MailListError from "@/components/ui/MailListError";

import MailEditPage from "./MailEditPage";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faKeyboard } from "@fortawesome/free-solid-svg-icons";
import VirtualKeyboard from "@/components/ui/VirtualKeyboard";

export default function MailList() {
    const queryClient = useQueryClient();

    const { isMailDetailsStoreShown, triggerMailDetailsStoreShown } =
        useShowMailDetailsStore();

    const [selectedMailData, setSelectedMailData] = useState<Mail>();
    const [editingMail, setEditingMail] = useState<Mail | null>(null);
    const [keyboardOpen, setKeyboardOpen] = useState(false);

    const { seachInput } = useSearchInputStore();
    const { filter } = useMailFilterStore();

    const [showVirtualKeyboard, setShowVirtualKeyboard] = useState(false);

    const fetchMails = async (pageParam: number): Promise<MailPageResponse> => {
        const res = await apiWrapper.get<{ data: MailPageResponse }>(
            "/Correspondences/paged",
            {
                PageSize: 12,
                Page: pageParam,
                SortBy: "createdAt",
                SortOrderDESC: true,
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
                ["mails", filter, seachInput],
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

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
    } = useInfiniteQuery<MailPageResponse>({
        queryKey: ["mails", filter, seachInput],
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

    const showMailDetails = (mailData: Mail) => {
        setSelectedMailData(mailData);
        triggerMailDetailsStoreShown();
    };

    if (isLoading) return <MailListLoader />;
    if (isError) return <MailListError />;

    return (
        <AnimatePresence mode="wait">
            {editingMail ? (
                <MailEditPage
                    mail={editingMail}
                    filter={filter}
                    searchInput={seachInput}
                    onBack={() => setEditingMail(null)}
                    onSuccess={() => setEditingMail(null)}
                />
            ) : !isMailDetailsStoreShown ? (
                <motion.div
                    key="mail-list"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col h-full w-full"
                >
                    {/* TOP BAR */}
                    <div className="flex items-center justify-between bg-blue-50 border-b border-blue-100 px-4 py-3">
                        <button
                            onClick={() => setKeyboardOpen(true)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-200 shadow-sm hover:bg-blue-100 transition"
                        >
                            <FontAwesomeIcon
                                icon={faKeyboard}
                                className="text-blue-600"
                            />
                            <span className="text-sm text-gray-600">
                                لوحة المفاتيح
                            </span>
                        </button>

                        <h2 className="text-blue-700 font-semibold text-sm">
                            قائمة البريد 
                        </h2>

                        <VirtualKeyboard
                            open={keyboardOpen}
                            onClose={() => setKeyboardOpen(false)}
                        />
                    </div>

                    {/* MAIL LIST */}
                    <div className="flex flex-col gap-y-2 p-4 flex-1 overflow-y-auto">
                        {mailList.map((mail, index) => (
                            <MailCard
                                key={mail.id}
                                mail={mail}
                                index={index}
                                onClick={showMailDetails}
                                onEdit={(mail) => setEditingMail(mail)}
                                onDelete={(id) =>
                                    deleteMailMutation.mutate(id)
                                }
                                isDeleting={deleteMailMutation.isPending}
                            />
                        ))}

                        <div ref={bottomRef} />
                    </div>
                </motion.div>
            ) : (
                <motion.div
                    key="mail-viewer"
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.3 }}
                    className="p-4 w-full"
                >
                    {selectedMailData && (
                        <MailViewer data={selectedMailData} />
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}