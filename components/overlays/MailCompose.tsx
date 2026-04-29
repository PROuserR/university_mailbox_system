"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBold,
    faItalic,
    faUnderline,
    faListUl,
    faListOl,
    faQuoteLeft,
    faCode,
    faAlignLeft,
    faAlignCenter,
    faAlignRight,
    faUndo,
    faRedo,
    faHeading,
    faPaperPlane,
    faPaperclip,
    faXmark,
} from "@fortawesome/free-solid-svg-icons";
import myAPI from "@/utils/myAPI";
import useMailComposeStore from "@/store/mailComposeStore";


export default function MailComposeOverlay() {
    // const [to, setTo] = useState<string>("");
    const [subject, setSubject] = useState<string>("");
    const [number, setNumber] = useState<string>("");
    const [attachments, setAttachments] = useState<File[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [mailType, setMailType] = useState<string>("incoming");
    const [isProfessional, setIsProfessional] = useState<boolean>(true);

    const { isMailComposeShown, tiggerMailCompose } = useMailComposeStore();

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
            }),
            Underline,
            TextAlign.configure({
                types: ["heading", "paragraph"],
            }),
            Placeholder.configure({
                placeholder: "Write your mail...",
            }),
        ],
        content: "",
        immediatelyRender: false
    });

    if (!editor) return null;

    const btn = (active: boolean) =>
        `w-9 h-9 flex items-center justify-center rounded-lg transition ${active
            ? "bg-blue-500 text-white"
            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
        }`;

    const handleFiles = (files: FileList | null) => {
        if (!files) return;
        setAttachments((prev) => [...prev, ...Array.from(files)]);
    };

    const removeFile = (index: number) => {
        setAttachments((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSend = async () => {
        const content = editor.getHTML();

        // Validation with toast
        // if (!to.trim()) return toast.error("Recipient required");
        if (!subject.trim()) return toast.error("Subject required");
        if (!content || content === "<p></p>") return toast.error("Message empty");

        setLoading(true);
        const loadingToast = toast.loading("Sending mail...");
        const now = new Date()

        try {
            // Use FormData to handle file uploads
            const formData = new FormData();
            formData.append("senderEntityId", String(2));
            formData.append("DocumentTypeID", String(1));
            formData.append("Number", number);
            formData.append("Title", subject);
            formData.append("Content", content);
            formData.append("MainType", mailType);
            formData.append("IsProfessional", String(isProfessional));
            formData.append("IssuedDate", now.toISOString());
            formData.append("ReceivedDate", now.toISOString());
            formData.append("Notes", "23");

            attachments.forEach((file) => {
                formData.append("AdditionalFiles", file);
            });

            // Replace '/api/send-mail' with your actual endpoint
            const response = await myAPI.post("/Correspondence", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            console.log("Success:", response);
            toast.success("Mail sent successfully!", { id: loadingToast });

            // Reset form on success
            // setTo("");
            setSubject("");
            setNumber("");
            setAttachments([]);
            setMailType("incoming");
            setIsProfessional(true);
            editor.commands.clearContent();
        } catch (error: any) {
            console.error("Error sending mail:", error);
            const errorMessage = error.response?.data?.message || "Failed to send mail. Please try again.";
            toast.error(errorMessage, { id: loadingToast });
        } finally {
            setLoading(false);
        }
    };

    if (isMailComposeShown)
        return (
            <div className="absolute left-4 bottom-4 max-w-5xl mx-auto bg-white border rounded-2xl shadow p-4 space-y-4">

                {/* To */}
                {/* <input
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="الى"
                className="w-full border-b p-2 outline-none focus:border-blue-500 text-right"
            /> */}

                {/* Subject */}
                <input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="الموضوع"
                    className="w-full border-b p-2 outline-none focus:border-blue-500 text-right"
                />

                {/* ✅ NEW: Mail Type + Professional */}
                <div className="flex flex-wrap gap-4 items-center">

                    {/* Mail Type Select */}
                    <select
                        value={mailType}
                        onChange={(e) => setMailType(e.target.value)}
                        className="border rounded-lg p-2 text-sm bg-white"
                    >
                        <option value="incoming">وارد</option>
                        <option value="outgoing">صادر</option>
                        <option value="internal">داخلي</option>
                    </select>

                    {/* Professional Radio */}
                    <div className="flex items-center gap-3 text-sm">
                        <span>مهني:</span>

                        <label className="flex items-center gap-1">
                            <input
                                type="radio"
                                name="professional"
                                checked={isProfessional === true}
                                onChange={() => setIsProfessional(true)}
                            />
                            نعم
                        </label>

                        <label className="flex items-center gap-1">
                            <input
                                type="radio"
                                name="professional"
                                checked={isProfessional === false}
                                onChange={() => setIsProfessional(false)}
                            />
                            لا
                        </label>
                    </div>

                    {/* Number Input */}
                    <div className="flex items-center gap-3 text-sm">

                        <label className="flex items-center gap-1">
                            الرقم:

                            <input
                                type="text"
                                name="number"
                                onChange={(e) => setNumber(e.target.value)}
                                className="border"
                            />
                        </label>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex flex-wrap gap-2 border rounded-xl p-2 bg-gray-50">
                    <button onClick={() => editor.chain().focus().toggleBold().run()} className={btn(editor.isActive("bold"))}>
                        <FontAwesomeIcon icon={faBold} />
                    </button>

                    <button onClick={() => editor.chain().focus().toggleItalic().run()} className={btn(editor.isActive("italic"))}>
                        <FontAwesomeIcon icon={faItalic} />
                    </button>

                    <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={btn(editor.isActive("underline"))}>
                        <FontAwesomeIcon icon={faUnderline} />
                    </button>

                    <div className="w-px h-6 bg-gray-300 mx-1" />

                    <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={btn(editor.isActive("heading", { level: 1 }))}>
                        <FontAwesomeIcon icon={faHeading} /><span className="text-[10px] ml-1">1</span>
                    </button>

                    <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btn(editor.isActive("heading", { level: 2 }))}>
                        <FontAwesomeIcon icon={faHeading} /><span className="text-[10px] ml-1">2</span>
                    </button>

                    <div className="w-px h-6 bg-gray-300 mx-1" />

                    <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={btn(editor.isActive("bulletList"))}>
                        <FontAwesomeIcon icon={faListUl} />
                    </button>

                    <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btn(editor.isActive("orderedList"))}>
                        <FontAwesomeIcon icon={faListOl} />
                    </button>

                    <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btn(editor.isActive("blockquote"))}>
                        <FontAwesomeIcon icon={faQuoteLeft} />
                    </button>

                    <button onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={btn(editor.isActive("codeBlock"))}>
                        <FontAwesomeIcon icon={faCode} />
                    </button>

                    <div className="w-px h-6 bg-gray-300 mx-1" />

                    <button onClick={() => editor.chain().focus().setTextAlign("right").run()} className={btn(editor.isActive({ textAlign: "left" }))}>
                        <FontAwesomeIcon icon={faAlignLeft} />
                    </button>

                    <button onClick={() => editor.chain().focus().setTextAlign("center").run()} className={btn(editor.isActive({ textAlign: "center" }))}>
                        <FontAwesomeIcon icon={faAlignCenter} />
                    </button>

                    <button onClick={() => editor.chain().focus().setTextAlign("left").run()} className={btn(editor.isActive({ textAlign: "right" }))}>
                        <FontAwesomeIcon icon={faAlignRight} />
                    </button>

                    <div className="w-px h-6 bg-gray-300 mx-1" />

                    <button onClick={() => editor.chain().focus().undo().run()} className={btn(false)}>
                        <FontAwesomeIcon icon={faUndo} />
                    </button>

                    <button onClick={() => editor.chain().focus().redo().run()} className={btn(false)}>
                        <FontAwesomeIcon icon={faRedo} />
                    </button>

                    <label className={btn(false) + " cursor-pointer"}>
                        <FontAwesomeIcon icon={faPaperclip} />
                        <input
                            type="file"
                            multiple
                            className="hidden"
                            onChange={(e) => handleFiles(e.target.files)}
                        />
                    </label>
                </div>

                {attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {attachments.map((file, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-lg text-sm"
                            >
                                <span className="truncate max-w-[150px]">{file.name}</span>
                                <button onClick={() => removeFile(i)}>
                                    <FontAwesomeIcon icon={faXmark} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="border rounded-xl prose max-w-none [&_h1]:text-3xl [&_h1]:font-bold [&_h2]:text-2xl [&_h2]:font-semibold [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-1">
                    <EditorContent editor={editor} className="h-full min-h-64" />
                </div>

                <div className="flex gap-4 justify-end">
                    <button
                        onClick={handleSend}
                        disabled={loading}
                        className={`flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                        <FontAwesomeIcon icon={faPaperPlane} />
                        {loading ? "جاري الارسال..." : "ارسال"}
                    </button>

                    <button
                        onClick={tiggerMailCompose}
                        className={`flex items-center gap-2 px-5 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                        <FontAwesomeIcon icon={faXmark} />
                        الغاء
                    </button>
                </div>
            </div >
        );
};