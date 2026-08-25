/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/ui/forms/FormSelect.tsx

"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";

interface FormSelectProps {
    id: string;
    label: string;
    value: any;
    onChange: (value: any) => void;
    onBlur?: () => void;
    options: { id: number; name: string }[];
    placeholder: string;
    error?: string;
    touched?: boolean;
    required?: boolean;
}

export function FormSelect({
    id,
    label,
    value,
    onChange,
    onBlur,
    options,
    placeholder,
    error,
    touched,
    required,
}: FormSelectProps) {
    const showError = touched && error;

    return (
        <div id={`field-${id}`} className="flex flex-col gap-1">
            <label className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1">
                {label}
                {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                <select
                    value={value ?? ""}
                    onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
                    onBlur={onBlur}
                    className={cn(
                        "w-full p-2.5 rounded-xl border-2 bg-white text-blue-900 text-sm outline-none transition-all font-semibold text-right appearance-none",
                        showError
                            ? "border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-200"
                            : "border-blue-100 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                    )}
                >
                    <option value="">{placeholder}</option>
                    {options.map((option) => (
                        <option key={option.id} value={option.id}>
                            {option.name}
                        </option>
                    ))}
                </select>
                {showError && (
                    <FontAwesomeIcon
                        icon={faExclamationCircle}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500"
                    />
                )}
            </div>
            {showError && (
                <p className="text-xs text-red-500 font-medium mt-0.5 flex items-center gap-1">
                    <FontAwesomeIcon icon={faExclamationCircle} className="text-[10px]" />
                    {error}
                </p>
            )}
        </div>
    );
}