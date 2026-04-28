import useShowMailDetailsStore from "@/store/showMailDetails";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faXmark } from "@fortawesome/free-solid-svg-icons";

export default function MailViewer(props) {
    const { isMailDetailsStoreShown, triggerMailDetailsStoreShown } = useShowMailDetailsStore()

    if (isMailDetailsStoreShown)
        return (
            <div className="p-6">
                <header className="cursor-pointer">
                    <FontAwesomeIcon icon={faArrowRight} className="ml-auto" onClick={triggerMailDetailsStoreShown} />
                </header>

                <div className="pr-8">
                    <h1 className="flex flex-col w-fit items-center justify-center gap-4 ml-auto text-lg font-semibold mb-2">
                        <span>
                            تحديث الجدول الدراسي

                        </span>

                    </h1>

                    <p className="text-sm text-gray-500 mb-4">
                        من: إدارة الجامعة
                    </p>

                    <p className="text-sm leading-relaxed text-gray-700">
                        نود إعلامكم بأنه تم تحديث الجدول الدراسي للفصل القادم...
                    </p>
                </div>

            </div>
        );
}