// src/components/ui/forms/FormTextarea.tsx

"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";

interface FormTextareaProps {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    placeholder?: string;
    error?: string;
    touched?: boolean;
    required?: boolean;
    maxLength?: number;
    rows?: number;
    className?: string;
}

export function FormTextarea({
    id,
    label,
    value,
    onChange,
    onBlur,
    placeholder,
    error,
    touched,
    required,
    maxLength,
    rows = 3,
    className = "",
}: FormTextareaProps) {
    const showError = touched && error;

    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1">
                {label}
                {required && <span className="text-red-500">*</span>}
            </label>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onBlur={onBlur}
                className={cn(
                    "w-full p-3 rounded-xl border-2 bg-white text-blue-800 text-sm placeholder:text-blue-200 outline-none resize-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all font-light leading-relaxed text-right",
                    showError && error
                        ? "border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-200"
                        : "border-blue-100",
                    className
                )}
                placeholder={placeholder}
                maxLength={maxLength}
                rows={rows}
            />
            {showError && error && (
                <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                    <FontAwesomeIcon icon={faExclamationCircle} className="text-[10px]" />
                    {error}
                </p>
            )}
            {maxLength && (
                <div className="text-left text-xs text-gray-400">
                    {value?.length || 0}/{maxLength}
                </div>
            )}
        </div>
    );
}