"use client";

import { useState } from "react";
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

export default function MailComposeOverlay() {
    const [to, setTo] = useState<string>("");
    const [subject, setSubject] = useState<string>("");
    const [attachments, setAttachments] = useState<File[]>([]);

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
                placeholder: "Write your message...",
            }),
        ],
        content: "",
        immediatelyRender: false
    });

    if (!editor) return null;

    // 🎯 Toolbar button style
    const btn = (active: boolean) =>
        `w-9 h-9 flex items-center justify-center rounded-lg transition ${active
            ? "bg-blue-500 text-white"
            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
        }`;

    // 📎 Handle attachments
    const handleFiles = (files: FileList | null) => {
        if (!files) return;
        setAttachments((prev) => [...prev, ...Array.from(files)]);
    };

    const removeFile = (index: number) => {
        setAttachments((prev) => prev.filter((_, i) => i !== index));
    };

    // 📤 Send handler
    const handleSend = () => {
        const content = editor.getHTML();

        if (!to.trim()) return alert("Recipient required");
        if (!subject.trim()) return alert("Subject required");
        if (!content || content === "<p></p>") return alert("Message empty");

        const payload = {
            to,
            subject,
            content,
            attachments,
        };

        console.log("Sending:", payload);

        // reset
        setTo("");
        setSubject("");
        setAttachments([]);
        editor.commands.clearContent();
    };

    return (
        <div className="absolute left-4 bottom-4 max-w-5xl mx-auto bg-white border rounded-2xl shadow p-4 space-y-4">
            {/* To */}
            <input
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="الى"
                className="w-full border-b p-2 outline-none focus:border-blue-500 text-right"
            />

            {/* Subject */}
            <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="الموضوع"
                className="w-full border-b p-2 outline-none focus:border-blue-500 text-right"
            />

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

                <button onClick={() => editor.chain().focus().setTextAlign("left").run()} className={btn(editor.isActive({ textAlign: "left" }))}>
                    <FontAwesomeIcon icon={faAlignLeft} />
                </button>

                <button onClick={() => editor.chain().focus().setTextAlign("center").run()} className={btn(editor.isActive({ textAlign: "center" }))}>
                    <FontAwesomeIcon icon={faAlignCenter} />
                </button>

                <button onClick={() => editor.chain().focus().setTextAlign("right").run()} className={btn(editor.isActive({ textAlign: "right" }))}>
                    <FontAwesomeIcon icon={faAlignRight} />
                </button>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                <button onClick={() => editor.chain().focus().undo().run()} className={btn(false)}>
                    <FontAwesomeIcon icon={faUndo} />
                </button>

                <button onClick={() => editor.chain().focus().redo().run()} className={btn(false)}>
                    <FontAwesomeIcon icon={faRedo} />
                </button>

                {/* 📎 Attach */}
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

            {/* Attachments Preview */}
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

            {/* Editor */}
            <div className="border rounded-xl" dir="rtl">
                <EditorContent editor={editor} className="h-full min-h-64" />
            </div>

            {/* Send */}
            <div className="flex justify-end">
                <button
                    onClick={handleSend}
                    className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
                >
                    <FontAwesomeIcon icon={faPaperPlane} />
                    ارسال
                </button>
            </div>
        </div>
    );
};