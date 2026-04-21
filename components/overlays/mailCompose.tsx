"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";

export default function MailCompose() {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            TextAlign.configure({
                types: ["heading", "paragraph"],
            }),
        ],
        content: "<p class='text-gray-700'>Start writing...</p>",
        immediatelyRender: false,
    });

    if (!editor) return null;

    return (
        <div className="absolute left-4 bottom-4 h-96 w-[600px] bg-gray-200">
            {/* Toolbar */}
            <div className="flex flex-wrap gap-2 p-3 border-b bg-gray-50">
                <button onClick={() => editor.chain().focus().toggleBold().run()} className="btn">B</button>
                <button onClick={() => editor.chain().focus().toggleItalic().run()} className="btn">I</button>
                <button onClick={() => editor.chain().focus().toggleUnderline().run()} className="btn">U</button>

                <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className="btn">H1</button>
                <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className="btn">H2</button>

                <button onClick={() => editor.chain().focus().toggleBulletList().run()} className="btn">• List</button>
                <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className="btn">1. List</button>

                <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className="btn">❝ ❞</button>
                <button onClick={() => editor.chain().focus().toggleCodeBlock().run()} className="btn">{"</>"}</button>

                <button onClick={() => editor.chain().focus().setTextAlign("left").run()} className="btn">⬅</button>
                <button onClick={() => editor.chain().focus().setTextAlign("center").run()} className="btn">⬍</button>
                <button onClick={() => editor.chain().focus().setTextAlign("right").run()} className="btn">➡</button>

                <button onClick={() => editor.chain().focus().undo().run()} className="btn">Undo</button>
                <button onClick={() => editor.chain().focus().redo().run()} className="btn">Redo</button>
            </div>

            {/* Editor */}
            <EditorContent
                editor={editor}
                className="p-4 min-h-[300px] prose max-w-none focus:outline-none"
            />
        </div>
    );
}