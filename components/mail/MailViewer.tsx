import useShowMailDetailsStore from "@/store/showMailDetails";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faL } from "@fortawesome/free-solid-svg-icons";
import MailFile from "./MailFile";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useState } from "react";
import formatDate from "@/utils/formatDate";
import { Mail } from "@/types/api/Mail/Mail";
import MailDistribute from "./MailDistribute";

type Props = {
    data: Mail;
};

export default function MailViewer({ data }: Props) {
    const { isMailDetailsStoreShown, triggerMailDetailsStoreShown } = useShowMailDetailsStore();
    const [showMailDistribute, setShowMailDistribute] = useState(false);

    const editor = useEditor({
        extensions: [StarterKit],
        content: "",
        editable: false, // important for email view
        immediatelyRender: false
    });

    useEffect(() => {
        if (editor && data?.content) {
            editor.commands.setContent(data.content);
        }
    }, [editor, data]);

    if (isMailDetailsStoreShown)
        return (
            <>
                <header className="flex flex-col gap-4 w-full ml-auto items-center mb-8">
                    <div className="flex w-full">
                        <span className="mr-auto text-gray-400">
                            رقم البريد:
                            {data?.number}
                        </span>
                        <FontAwesomeIcon icon={faArrowRight} className="ml-auto cursor-pointer" onClick={triggerMailDetailsStoreShown} />
                    </div>


                    <div className="flex gap-8 flex-row-reverse ml-auto text-xl">
                        <button onClick={() => setShowMailDistribute(!showMailDistribute)} className="bg-blue-500 text-white p-4 rounded-2xl cursor-pointer disabled:opacity-50"> حالة التوزيع </button>
                        {showMailDistribute && <MailDistribute correspondenceId={data?.id} />}
                    </div>
                </header>



                <main className="pr-8 mb-8">
                    <div className="flex w-full items-center justify-center gap-4 ml-auto text-lg font-semibold mb-2">

                        <span className=" text-gray-600">
                            {data?.issuedDate && formatDate(data?.issuedDate)}
                        </span>
                        <span className="mr-auto font-extrabold">
                            {data?.isProfessional ? <span>مهني</span> : null}
                        </span>
                        <div className="flex flex-col items-center">
                            <span>
                                {data?.title}
                            </span>

                        </div>

                    </div>
                    <div className="flex justify-center items-center gap-16 w-full">
                        {data?.attachments?.map(attachment => (
                            <div key={attachment?.id}>
                                {attachment?.mimeType.startsWith("image/") ? <MailFile key={attachment.id} filePath={attachment.filePath} isImage={true} fileName={undefined} /> :
                                    <MailFile key={attachment.id} filePath={attachment.filePath} fileName={attachment.fileName} isImage={false} />}

                            </div>
                        ))}
                    </div>

                    <div>
                        <EditorContent editor={editor} />
                    </div>
                </main>


            </>
        );
}