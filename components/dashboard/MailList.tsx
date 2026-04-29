import useShowMailDetailsStore from "@/store/showMailDetails";
import MailViewer from "./MailViewer";
import myAPI from "@/utils/myAPI";
import { SetStateAction, useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import formatDate from "@/utils/formatDate";
import getEmailContentPreview from "@/utils/getEmailContentPreview";


export default function MailList() {
    const { isMailDetailsStoreShown, triggerMailDetailsStoreShown } = useShowMailDetailsStore()
    const [mailList, setMailList] = useState<any[]>([])
    const [selectedMailData, setSelectedMailData] = useState();

    const getMailInbox = async () => {
        try {
            const res = await myAPI.get("/Correspondence");
            setMailList(res.data.data)
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message || "حدث خطأ");
            } else {
                toast.error("خطأ غير متوقع");
            }
        }
    }

    const showMailDetails =  (mailData: SetStateAction<undefined>) => {
        setSelectedMailData(mailData);
        triggerMailDetailsStoreShown();
    }

    useEffect(() => {
        getMailInbox()
    }, [])

    if (!isMailDetailsStoreShown)
        return (
            <div className="flex flex-col  gap-y-1 p-4 w-full">
                <h1 className="font-semibold mb-4">البريد الوارد</h1>
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
            </div>

        );
    else
        return (
            <div className="p-4 w-full">
                {isMailDetailsStoreShown && selectedMailData ? <MailViewer data={selectedMailData} /> : null}
            </div>
        );
}