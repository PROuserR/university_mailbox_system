import useShowMailDetailsStore from "@/store/showMailDetails";
import MailViewer from "./MailViewer";
import { useState } from "react";
import formatDate from "@/utils/formatDate";
import getEmailContentPreview from "@/utils/getEmailContentPreview";
import { apiWrapper } from "@/utils/apiClient";
import useSearchInputStore from "@/store/searchInputStore";
import { Mail } from "@/types/api/Mail";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";
import useMailFilterStore from "@/store/mailFilterStore";
import { useInfiniteQuery } from "@tanstack/react-query";
import MailListLoader from "./MailListLoader";
import MailListError from "./MailListError";
import { MailPageResponse } from "@/types/api/MailPageResponse";

export default function MailList() {
    const { isMailDetailsStoreShown, triggerMailDetailsStoreShown } = useShowMailDetailsStore()
    const [selectedMailData, setSelectedMailData] = useState<Mail | undefined>(undefined);
    const { seachInput } = useSearchInputStore();
    const { filter } = useMailFilterStore();

    const fetchMails = async (pageParam: number): Promise<MailPageResponse> => {
        const res = await apiWrapper.get<{ data: MailPageResponse }>("/Correspondence/paged", {
            PageSize: 12,
            Page: pageParam, // ✅ MUST be dynamic
            SortBy: "createdAt",
            SortOrderDESC: true,
            MainType: filter != "Professional" ? filter : null,
            IsProfessional: filter === "Professional" ? true : null,
            Search: seachInput || undefined,
        })

        if (!res.success || !res.data) {
            throw new Error("Failed to fetch mails")
        }
        return res.data.data
    }

    const showMailDetails = (mailData: Mail) => {
        setSelectedMailData(mailData);
        triggerMailDetailsStoreShown();
    }

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
    } = useInfiniteQuery<MailPageResponse>({
        queryKey: ['mails', filter, seachInput],

        queryFn: ({ pageParam = 1 }) => fetchMails(pageParam as number),

        initialPageParam: 1, // ✅ REQUIRED in v5

        getNextPageParam: (lastPage, allPages) => {
            const loaded = allPages.flatMap(p => p.items).length

            return loaded < lastPage.totalCount
                ? allPages.length + 1
                : undefined
        },
    })

    const mailList = data?.pages.flatMap(page => page.items) ?? []

    const bottomRef = useInfiniteScroll({
        onBottom: fetchNextPage,
        isLoading: isFetchingNextPage,
        hasMore: !!hasNextPage,
        dataLength: mailList?.length ?? 0,
    })

    if (isLoading) return <MailListLoader />
    else if (isError) return <MailListError />
    else
        if (!isMailDetailsStoreShown)
            return (
                <div className="flex flex-col gap-y-1 p-4 h-full w-full" >
                    {mailList.map(((mail: Mail) => (
                        <div className="w-full" key={mail.id}>
                            <div className="space-y-4" onClick={() => showMailDetails(mail)}>
                                <div className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer">
                                    <p className="font-medium ">{mail.title}</p>
                                    <div className="flex w-full items-center text-sm">
                                        <span className="mr-auto">{formatDate(mail.issuedDate)}</span>
                                        <p className="text-gray-500">
                                            {getEmailContentPreview(mail.content)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )))}
                    <div ref={bottomRef} />
                </div>
            );
        else
            return (
                <div className="p-4 w-full">
                    {isMailDetailsStoreShown && selectedMailData ? <MailViewer data={selectedMailData} /> : null}
                </div>
            );
}