import useShowMailDetailsStore from "@/store/showMailDetails";
import MailViewer from "./MailViewer";
import myAPI from "@/utils/myAPI";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function MailList() {
    const { isMailDetailsStoreShown, triggerMailDetailsStoreShown } = useShowMailDetailsStore()
    const [mailList, setMailList] = useState([])

    const getMailInbox = async () => {
        try {
            const res = await myAPI.get("/Correspondence");
            setMailList(res.data.data)
            console.log(res)
        } catch (errorMessage) {
            toast.error(errorMessage)
        }
    }

    useEffect(() => {

        getMailInbox()
    }, [])

    { isMailDetailsStoreShown ? <MailViewer /> : null }
    if (!isMailDetailsStoreShown)
        return (
            <div className="flex flex-col  gap-y-1 p-4 w-full">
                <h1 className="font-semibold mb-4">البريد الوارد</h1>
                {mailList.map((mail => (
                    <div className="w-full" key={mail.id}>
                        <div className="space-y-4" onClick={triggerMailDetailsStoreShown}>
                            <div className="p-3 bg-gray-100 rounded-lg cursor-pointer">
                                <p className="font-medium text-sm">{mail.title}</p>
                                <p className="text-xs text-gray-500">تم تحديث الجدول الدراسي</p>
                            </div>
                        </div>
                        {isMailDetailsStoreShown ? <MailViewer /> : null}
                    </div>
                )))}

            </div>

        );
    else
        return (
            <div className="p-4 w-full">
                {isMailDetailsStoreShown ? <MailViewer /> : null}
            </div>
        );
}