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

export default function MailViewer({ data } : Props) {
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
            <div className="p-6">
                <header className="w-fit ml-auto cursor-pointer">
                    <FontAwesomeIcon icon={faArrowRight} className="ml-auto" onClick={triggerMailDetailsStoreShown} />
                </header>

                <div className="pr-8">
                    <h1 className="flex w-full items-center justify-center gap-4 ml-auto text-lg font-semibold mb-2">
                        <span className="mr-auto text-gray-600">
                            {data?.issuedDate && formatDate(data?.issuedDate)}
                        </span>
                        <span>
                            {data?.title}
                        </span>
                    </h1>

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