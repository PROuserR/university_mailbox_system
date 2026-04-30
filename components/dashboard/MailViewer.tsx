import useShowMailDetailsStore from "@/store/showMailDetails";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import MailFile from "./MailFile";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";
import formatDate from "@/utils/formatDate";
import { Mail } from "@/types/api/Mail";

type Props = {
    data: Mail;
};

export default function MailViewer({ data }: Props) {
    const { isMailDetailsStoreShown, triggerMailDetailsStoreShown } = useShowMailDetailsStore()

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
            <div >
                <header className="flex gap-4 w-full ml-auto cursor-pointer items-center mb-8">
                    <span className="mr-auto text-gray-400">
                        رقم البريد:
                        {data?.number}
                    </span>
                    <FontAwesomeIcon icon={faArrowRight} className="ml-auto" onClick={triggerMailDetailsStoreShown} />

                </header>

                <div className="pr-8 mb-8">
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

                    <div>
                        {data?.attachments?.map(attachment => (
                            <div key={attachment?.id}>
                                {attachment?.mimeType.startsWith("image/") ? <MailFile key={attachment.id} filePath={attachment.filePath} /> : null}
                            </div>
                        ))}
                    </div>

                    <div>
                        <EditorContent editor={editor} />
                    </div>
                </div>
            </div>
        );
}