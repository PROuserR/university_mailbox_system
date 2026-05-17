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

import { Mail } from "@/types/api/Mail";

import { MailPageResponse } from "@/types/api/MailPageResponse";

import MailViewer from "@/components/mail/MailViewer";

import MailCard from "@/components/mail/MailCard";


import MailListLoader from "@/components/ui/MailListLoader";

import MailListError from "@/components/ui/MailListError";
import MailEditPage from "./MailEditPage";

export default function MailList() {
    const queryClient =
        useQueryClient();

    const {
        isMailDetailsStoreShown,
        triggerMailDetailsStoreShown,
    } =
        useShowMailDetailsStore();

    const [selectedMailData, setSelectedMailData] =
        useState<Mail>();

    const [editingMail, setEditingMail] =
        useState<Mail | null>(null);

    const { seachInput } =
        useSearchInputStore();

    const { filter } =
        useMailFilterStore();

    const fetchMails = async (
        pageParam: number
    ): Promise<MailPageResponse> => {
        const res =
            await apiWrapper.get<{
                data: MailPageResponse;
            }>(
                "/Correspondences/paged",
                {
                    PageSize: 12,
                    Page: pageParam,
                    SortBy: "createdAt",
                    SortOrderDESC: true,

                    MainType:
                        filter !==
                            "Professional"
                            ? filter
                            : null,

                    IsProfessional:
                        filter ===
                            "Professional"
                            ? true
                            : null,

                    Search:
                        seachInput ||
                        undefined,
                }
            );

        if (
            !res.success ||
            !res.data
        ) {
            throw new Error(
                "Failed to fetch mails"
            );
        }

        return res.data.data;
    };

    const deleteMailMutation =
        useMutation({
            mutationFn: async (
                id: string
            ) => {
                const res =
                    await apiWrapper.delete(
                        `Correspondences/${id}`
                    );

                if (!res.success) {
                    toast.error(
                        "لا يمكن حذف البريد بعد توزيعه"
                    );

                    throw new Error(
                        "Failed to delete mail"
                    );
                }

                return id;
            },

            onSuccess: (
                _,
                deletedId
            ) => {
                queryClient.setQueryData(
                    [
                        "mails",
                        filter,
                        seachInput,
                    ],
                    (oldData: any) => {
                        if (!oldData)
                            return oldData;

                        return {
                            ...oldData,

                            pages:
                                oldData.pages.map(
                                    (
                                        page: MailPageResponse
                                    ) => ({
                                        ...page,

                                        items:
                                            page.items.filter(
                                                (
                                                    mail: Mail
                                                ) =>
                                                    String(
                                                        mail.id
                                                    ) !==
                                                    deletedId
                                            ),

                                        totalCount:
                                            page.totalCount -
                                            1,
                                    })
                                ),
                        };
                    }
                );

                toast.success(
                    "تم حذف البريد بنجاح"
                );
            },
        });


    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
    } = useInfiniteQuery<MailPageResponse>(
        {
            queryKey: [
                "mails",
                filter,
                seachInput,
            ],

            queryFn: ({
                pageParam = 1,
            }) =>
                fetchMails(
                    pageParam as number
                ),

            initialPageParam: 1,

            getNextPageParam: (
                lastPage,
                allPages
            ) => {
                const loaded =
                    allPages.flatMap(
                        (p) => p.items
                    ).length;

                return loaded <
                    lastPage.totalCount
                    ? allPages.length +
                    1
                    : undefined;
            },
        }
    );

    const mailList =
        data?.pages.flatMap(
            (page) => page.items
        ) ?? [];

    const bottomRef =
        useInfiniteScroll({
            onBottom:
                fetchNextPage,

            isLoading:
                isFetchingNextPage,

            hasMore:
                !!hasNextPage,

            dataLength:
                mailList.length,
        });

    const showMailDetails = (
        mailData: Mail
    ) => {
        setSelectedMailData(
            mailData
        );

        triggerMailDetailsStoreShown();
    };

    if (isLoading)
        return <MailListLoader />;

    if (isError)
        return <MailListError />;

    return (
        <AnimatePresence mode="wait">
            {editingMail ? (
                <MailEditPage
                    mail={editingMail}
                    filter={filter}
                    searchInput={seachInput}
                    onBack={() =>
                        setEditingMail(null)
                    }
                    onSuccess={() =>
                        setEditingMail(null)
                    }
                />
            ) : !isMailDetailsStoreShown ? (
                <motion.div
                    key="mail-list"
                    initial={{
                        opacity: 0,
                    }}
                    animate={{
                        opacity: 1,
                    }}
                    exit={{
                        opacity: 0,
                    }}
                    transition={{
                        duration: 0.25,
                    }}
                    className="flex flex-col gap-y-2 p-4 h-full w-full"
                >
                    {mailList.map(
                        (
                            mail,
                            index
                        ) => (
                            <MailCard
                                key={
                                    mail.id
                                }
                                mail={
                                    mail
                                }
                                index={
                                    index
                                }
                                onClick={
                                    showMailDetails
                                }
                                onEdit={(
                                    mail
                                ) =>
                                    setEditingMail(
                                        mail
                                    )
                                }
                                onDelete={(
                                    id
                                ) =>
                                    deleteMailMutation.mutate(
                                        id
                                    )
                                }
                                isDeleting={
                                    deleteMailMutation.isPending
                                }
                            />
                        )
                    )}

                    <div
                        ref={
                            bottomRef
                        }
                    />
                </motion.div>
            ) : (
                <motion.div
                    key="mail-viewer"
                    initial={{
                        opacity: 0,
                        x: 40,
                    }}
                    animate={{
                        opacity: 1,
                        x: 0,
                    }}
                    exit={{
                        opacity: 0,
                        x: -40,
                    }}
                    transition={{
                        duration: 0.3,
                    }}
                    className="p-4 w-full"
                >
                    {selectedMailData ? (
                        <MailViewer
                            data={
                                selectedMailData
                            }
                        />
                    ) : null}
                </motion.div>
            )}
        </AnimatePresence>
    );
}