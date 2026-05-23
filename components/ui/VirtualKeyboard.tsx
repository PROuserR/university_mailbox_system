"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faXmark,
    faKeyboard,
    faDeleteLeft,
    faGlobe,
    faArrowUp,
} from "@fortawesome/free-solid-svg-icons";

import { useEffect, useState } from "react";

type Props = {
    open: boolean;
    onClose: () => void;
};

type Lang = "en" | "ar";

const numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

const englishKeys = [
    "q", "w", "e", "r", "t", "y", "u", "i", "o", "p",
    "a", "s", "d", "f", "g", "h", "j", "k", "l",
    "z", "x", "c", "v", "b", "n", "m",
];

const arabicKeys = [
    "ض", "ص", "ث", "ق", "ف", "غ", "ع", "ه", "خ", "ح",
    "ش", "س", "ي", "ب", "ل", "ا", "ت", "ن", "م",
    "ئ", "ء", "ؤ", "ر", "لا", "ى", "ة",
];

export default function VirtualKeyboard({ open, onClose }: Props) {
    const [lang, setLang] = useState<Lang>("en");
    const [shift, setShift] = useState(false);
    const [focusedEl, setFocusedEl] = useState<HTMLElement | null>(null);

    const keys = lang === "en" ? englishKeys : arabicKeys;

    // Track focused input globally
    useEffect(() => {
        const handler = () => {
            const el = document.activeElement as HTMLElement;
            const tag = el?.tagName?.toLowerCase();

            if (
                el &&
                (tag === "input" ||
                    tag === "textarea" ||
                    el.isContentEditable)
            ) {
                setFocusedEl(el);
            }
        };

        document.addEventListener("focusin", handler);
        return () => document.removeEventListener("focusin", handler);
    }, []);

    const insertChar = (char: string) => {
        const el = focusedEl;
        if (!el) return;

        // INPUT / TEXTAREA
        if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
            const start = el.selectionStart ?? el.value.length;
            const end = el.selectionEnd ?? el.value.length;

            const newValue =
                el.value.slice(0, start) +
                char +
                el.value.slice(end);

            el.value = newValue;
            el.setSelectionRange(start + char.length, start + char.length);
            el.focus();

            el.dispatchEvent(new Event("input", { bubbles: true }));
            return;
        }

        // contentEditable
        if (el.isContentEditable) {
            document.execCommand("insertText", false, char);
            return;
        }
    };

    const backspace = () => {
        const el = focusedEl;
        if (!el) return;

        if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
            const start = el.selectionStart ?? 0;
            const end = el.selectionEnd ?? 0;

            if (start === end && start > 0) {
                const newValue =
                    el.value.slice(0, start - 1) +
                    el.value.slice(end);

                el.value = newValue;
                el.setSelectionRange(start - 1, start - 1);
            } else {
                const newValue =
                    el.value.slice(0, start) +
                    el.value.slice(end);

                el.value = newValue;
                el.setSelectionRange(start, start);
            }

            el.dispatchEvent(new Event("input", { bubbles: true }));
            el.focus();
            return;
        }

        if (el?.isContentEditable) {
            document.execCommand("delete");
        }
    };

    const space = () => insertChar(" ");
    const enter = () => insertChar("\n");

    const toggleLang = () => setLang((p) => (p === "en" ? "ar" : "en"));
    const toggleShift = () => setShift((p) => !p);

    const renderKey = (k: string) =>
        shift ? k.toUpperCase() : k;

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 40 }}
                    transition={{ duration: 0.25 }}
                    className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-4xl"
                >
                    <div
                        className="bg-white shadow-2xl rounded-2xl border border-blue-100 p-4"
                        dir={lang === "ar" ? "rtl" : "ltr"}
                    >
                        {/* TOP BAR */}
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <FontAwesomeIcon icon={faKeyboard} />
                                {lang === "en"
                                    ? "Virtual Keyboard"
                                    : "لوحة مفاتيح"}
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={toggleLang}
                                    className="px-2 py-1 text-xs bg-blue-100 rounded"
                                >
                                    <FontAwesomeIcon icon={faGlobe} /> {lang.toUpperCase()}
                                </button>

                                <button
                                    onClick={onClose}
                                    className="text-gray-500 hover:text-red-500"
                                >
                                    <FontAwesomeIcon icon={faXmark} />
                                </button>
                            </div>
                        </div>

                        {/* KEYS */}
                        <div className="grid grid-cols-10 gap-2 mb-2">
                            {numbers.map((n) => (
                                <button
                                    key={n}
                                    onClick={() => insertChar(n)}
                                    className="p-2 bg-gray-100 rounded hover:bg-gray-200"
                                >
                                    {n}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-10 gap-2">
                            {keys.map((k) => (
                                <button
                                    key={k}
                                    onClick={() => insertChar(renderKey(k))}
                                    className="p-2 bg-blue-100 rounded hover:bg-blue-200 active:scale-95 transition"
                                >
                                    {renderKey(k)}
                                </button>
                            ))}
                        </div>

                        {/* ACTION ROW */}
                        <div className="flex gap-2 mt-3">
                            <button
                                onClick={toggleShift}
                                className="flex-1 p-2 bg-gray-100 rounded"
                            >
                                <FontAwesomeIcon icon={faArrowUp} /> Shift
                            </button>

                            <button
                                onClick={space}
                                className="flex-1 p-2 bg-gray-100 rounded"
                            >
                                Space
                            </button>

                            <button
                                onClick={enter}
                                className="flex-1 p-2 bg-gray-100 rounded"
                            >
                                Enter
                            </button>

                            <button
                                onClick={backspace}
                                className="flex-1 p-2 bg-red-100 text-red-600 rounded"
                            >
                                <FontAwesomeIcon icon={faDeleteLeft} /> Delete
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}