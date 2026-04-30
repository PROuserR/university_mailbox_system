import useShowMailDetailsStore from "@/store/showMailDetails";
import MailViewer from "./MailViewer";
import { SetStateAction, useEffect, useState } from "react";
import toast from "react-hot-toast";
import formatDate from "@/utils/formatDate";
import getEmailContentPreview from "@/utils/getEmailContentPreview";
import { apiWrapper } from "@/utils/apiClient";
import useSearchInputStore from "@/store/searchInputStore";
import { Mail } from "@/types/api/Mail";
import { AxiosResponse } from "axios";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";
import useMailFilterStore from "@/store/mailFilterStore";
import { MailPageResponse } from "@/types/api/MailPageResponse";

export default function MailList() {
    const { isMailDetailsStoreShown, triggerMailDetailsStoreShown } = useShowMailDetailsStore()
    const [mailList, setMailList] = useState<Array<Mail>>([]);
    const [selectedMailData, setSelectedMailData] = useState<Mail | undefined>(undefined);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const { seachInput } = useSearchInputStore();
    const { filter } = useMailFilterStore();

    const fetchNextPage = () => {
        setPage(page + 1)
        fetchMoreMail(page + 1)
    };

    const bottomRef = useInfiniteScroll({
        onBottom: fetchNextPage,
        isLoading,
        hasMore,
        dataLength: mailList.length,
    });

    useEffect(() => {
        getMailInbox()

    }, [filter])

    const fetchMoreMail = async (atPage: number) => {
        setIsLoading(true);
        const res = await apiWrapper.get<MailPageResponse>("/Correspondence/paged", {
            "PageSize": 12,
            "Page": atPage,
            "SortBy": "createdAt",
            "SortOrderDESC": true,
            "MainType": filter
        });

        if (res.data) {
            setMailList([...mailList, ...res.data?.data.items])
            setHasMore(res.data?.data.totalCount > [...mailList, ...res.data?.data.items].length)
            if (!res.success) {
                toast.error("حدث خطأ في جلب البيانات")
            }
        }
        setIsLoading(false)
    }

    const getMailInbox = async () => {
        const res = await apiWrapper.get<MailPageResponse>("/Correspondence/paged", {
            "PageSize": 12,
            "Page": 1,
            "SortBy": "createdAt",
            "SortOrderDESC": true,
            "MainType": filter
        });
        console.log(res)
        if (res.data) {
            setMailList(res.data?.data.items)
            setHasMore(res.data?.data.totalCount > mailList.length)
            if (!res.success) {
                toast.error("حدث خطأ في جلب البيانات")
            }
        }
    }

    const filterData = async () => {
        if (seachInput.length > 0) {
            const filteredData = await apiWrapper.get<MailPageResponse>("/Correspondence/paged", {
                "Search": seachInput
            })
            if (filteredData?.data) {
                setMailList(filteredData.data?.data.items)
            }
        }
        else {
            getMailInbox()
        }
    }

    const showMailDetails = (mailData: Mail) => {
        setSelectedMailData(mailData);
        triggerMailDetailsStoreShown();
    }

    useEffect(() => {
        getMailInbox()
    }, [])

    useEffect(() => {
        filterData()
    }, [seachInput])

    if (!isMailDetailsStoreShown)
        return (
            <div className="flex flex-col gap-y-1 p-4 h-full w-full" >
                <h1 className="font-semibold mb-4">ديوان جامعة حلب </h1>
                {mailList.map((mail => (
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