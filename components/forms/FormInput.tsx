/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/ui/forms/FormInput.tsx

"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";

interface FormInputProps {
    id: string;
    label: string;
    type?: string;
    value: any;
    onChange: (value: any) => void;
    onBlur?: () => void;
    placeholder?: string;
    error?: string;
    touched?: boolean;
    required?: boolean;
    maxLength?: number;
    min?: number;
    step?: number;
    className?: string;
    inputMode?: "text" | "numeric" | "decimal";
    pattern?: string;
}

export function FormInput({
    id,
    label,
    type = "text",
    value,
    onChange,
    onBlur,
    placeholder,
    error,
    touched,
    required,
    maxLength,
    min,
    step,
    className = "",
    inputMode = "text",
    pattern,
}: FormInputProps) {
    const showError = touched && error;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        
        if (type === "number") {
            const numericValue = inputValue.replace(/[^0-9]/g, '');
            onChange(numericValue === "" ? "" : Number(numericValue));
        } else {
            onChange(e.target.value);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (type === "number") {
            const allowedKeys = [
                'Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 
                'ArrowUp', 'ArrowDown', 'Home', 'End', 'Enter'
            ];
            
            if (!/^\d$/.test(e.key) && !allowedKeys.includes(e.key)) {
                e.preventDefault();
            }
        }
    };

    const displayValue = type === "number" ? (value === "" ? "" : String(value)) : value;
    
    const inputType = type === "number" ? "text" : type;

    return (
        <div id={`field-${id}`} className="flex flex-col gap-1">
            <label className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1">
                {label}
                {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                <input
                    type={inputType}
                    value={displayValue}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onBlur={onBlur}
                    placeholder={placeholder}
                    maxLength={maxLength}
                    min={min}
                    step={step}
                    inputMode={inputMode}
                    pattern={pattern}
                    className={cn(
                        "w-full p-2.5 rounded-xl border-2 bg-white text-blue-900 text-sm placeholder:text-blue-200 outline-none transition-all font-semibold text-right",
                        type === "date" && "[&::-webkit-calendar-picker-indicator]:cursor-pointer",
                        type === "number" && "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                        showError
                            ? "border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-200"
                            : "border-blue-100 focus:border-blue-400 focus:ring-2 focus:ring-blue-200",
                        className
                    )}
                />
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
            {maxLength && type !== "date" && type !== "number" && (
                <div className="text-left text-[10px] text-gray-400">
                    {displayValue?.length || 0}/{maxLength}
                </div>
            )}
        </div>
    );
}