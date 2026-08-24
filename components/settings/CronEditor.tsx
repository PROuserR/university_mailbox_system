// components/settings/CronEditor.tsx
"use client";

import { useState, useEffect, useRef, useMemo } from "react";

interface CronEditorProps {
    value: string;
    onChange: (cron: string) => void;
    label: string;
    description: string;
    frequency?: "daily" | "weekly" | "monthly" | "yearly";
}

export function CronEditor({
    value,
    onChange,
    label,
    description,
    frequency = "daily",
}: CronEditorProps) {
    // تحليل الـ CRON
    const parseCron = (cron: string) => {
        const parts = cron.trim().split(' ');
        if (parts.length < 5) {
            return { minute: 0, hour: 2, day: 1, month: 1, weekDay: 0 };
        }

        const minute = parseInt(parts[0]) || 0;
        const hour = parseInt(parts[1]) || 0;
        
        let day = 1;
        let month = 1;
        let weekDay = 0;
        
        if (parts[2] !== '*') {
            day = parseInt(parts[2]) || 1;
        }
        
        if (parts[3] !== '*') {
            month = parseInt(parts[3]) || 1;
        }
        
        if (parts[4] !== '*') {
            weekDay = parseInt(parts[4]) || 0;
        }

        return { minute, hour, day, month, weekDay };
    };

    // ✅ استخدام useMemo لحساب القيمة الأولية (بدون ref)
    const initialCronParts = useMemo(() => parseCron(value), []);
    
    // ✅ تهيئة الحالة من الـ value (بدون ref)
    const [cronParts, setCronParts] = useState(initialCronParts);

    // ✅ استخدام ref لتتبع آخر قيمة من الخارج
    const lastExternalValue = useRef(value);
    const isInitialMount = useRef(true);

    // ✅ بناء CRON من الأجزاء
    const buildCron = (parts: { minute: number; hour: number; day: number; month: number; weekDay: number }) => {
        let cron = `${parts.minute} ${parts.hour} `;
        
        switch (frequency) {
            case 'daily':
                cron += '* * *';
                break;
            case 'weekly':
                cron += `* * ${parts.weekDay}`;
                break;
            case 'monthly':
                cron += `${parts.day} * *`;
                break;
            case 'yearly':
                cron += `${parts.day} ${parts.month} *`;
                break;
            default:
                cron += '* * *';
                break;
        }
        
        return cron;
    };

    // ✅ تحديث lastExternalValue عند تغيير value من الخارج
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            lastExternalValue.current = value;
            return;
        }

        // ✅ إذا كانت القيمة من الخارج مختلفة عن القيمة المخزنة
        if (value !== lastExternalValue.current) {
            lastExternalValue.current = value;
            const parsed = parseCron(value);
            setCronParts(parsed);
        }
    }, [value]);

    // ✅ تحديث CRON عند تغيير أي قيمة
    const updateCron = (newParts: Partial<typeof cronParts>) => {
        const updated = { ...cronParts, ...newParts };
        setCronParts(updated);

        const newCron = buildCron(updated);
        lastExternalValue.current = newCron;
        onChange(newCron);
    };

    const weekDays = [
        { value: 0, label: "الأحد" },
        { value: 1, label: "الإثنين" },
        { value: 2, label: "الثلاثاء" },
        { value: 3, label: "الأربعاء" },
        { value: 4, label: "الخميس" },
        { value: 5, label: "الجمعة" },
        { value: 6, label: "السبت" },
    ];

    const months = [
        { value: 1, label: "يناير" },
        { value: 2, label: "فبراير" },
        { value: 3, label: "مارس" },
        { value: 4, label: "أبريل" },
        { value: 5, label: "مايو" },
        { value: 6, label: "يونيو" },
        { value: 7, label: "يوليو" },
        { value: 8, label: "أغسطس" },
        { value: 9, label: "سبتمبر" },
        { value: 10, label: "أكتوبر" },
        { value: 11, label: "نوفمبر" },
        { value: 12, label: "ديسمبر" },
    ];

    const getScheduleDescription = () => {
        const h = String(cronParts.hour).padStart(2, '0');
        const m = String(cronParts.minute).padStart(2, '0');
        
        switch (frequency) {
            case 'daily':
                return `يومياً الساعة ${h}:${m}`;
            case 'weekly':
                return `أسبوعياً يوم ${weekDays.find(d => d.value === cronParts.weekDay)?.label} الساعة ${h}:${m}`;
            case 'monthly':
                return `شهرياً يوم ${cronParts.day} الساعة ${h}:${m}`;
            case 'yearly':
                return `سنوياً في ${months.find(m => m.value === cronParts.month)?.label} يوم ${cronParts.day} الساعة ${h}:${m}`;
            default:
                return `${h}:${m}`;
        }
    };

    return (
        <div className="space-y-2">
            <div>
                <label className="text-sm font-medium text-slate-700">{label}</label>
                <p className="text-xs text-slate-400">{description}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="text-xs text-slate-500">الدقيقة</label>
                    <select
                        value={cronParts.minute}
                        onChange={(e) => updateCron({ minute: parseInt(e.target.value) })}
                        className="w-full mt-0.5 border border-gray-200 rounded-lg p-1.5 text-sm focus:outline-none focus:border-blue-400"
                    >
                        {Array.from({ length: 60 }, (_, i) => i).map(m => (
                            <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="text-xs text-slate-500">الساعة</label>
                    <select
                        value={cronParts.hour}
                        onChange={(e) => updateCron({ hour: parseInt(e.target.value) })}
                        className="w-full mt-0.5 border border-gray-200 rounded-lg p-1.5 text-sm focus:outline-none focus:border-blue-400"
                    >
                        {Array.from({ length: 24 }, (_, i) => i).map(h => (
                            <option key={h} value={h}>{h.toString().padStart(2, '0')}</option>
                        ))}
                    </select>
                </div>
            </div>

            {frequency === 'weekly' && (
                <div>
                    <label className="text-xs text-slate-500">اليوم</label>
                    <select
                        value={cronParts.weekDay}
                        onChange={(e) => updateCron({ weekDay: parseInt(e.target.value) })}
                        className="w-full mt-0.5 border border-gray-200 rounded-lg p-1.5 text-sm focus:outline-none focus:border-blue-400"
                    >
                        {weekDays.map(day => (
                            <option key={day.value} value={day.value}>{day.label}</option>
                        ))}
                    </select>
                </div>
            )}

            {frequency === 'monthly' && (
                <div>
                    <label className="text-xs text-slate-500">يوم الشهر</label>
                    <select
                        value={cronParts.day}
                        onChange={(e) => updateCron({ day: parseInt(e.target.value) })}
                        className="w-full mt-0.5 border border-gray-200 rounded-lg p-1.5 text-sm focus:outline-none focus:border-blue-400"
                    >
                        {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>
                </div>
            )}

            {frequency === 'yearly' && (
                <div>
                    <label className="text-xs text-slate-500">الشهر</label>
                    <select
                        value={cronParts.month}
                        onChange={(e) => updateCron({ month: parseInt(e.target.value) })}
                        className="w-full mt-0.5 border border-gray-200 rounded-lg p-1.5 text-sm focus:outline-none focus:border-blue-400"
                    >
                        {months.map(m => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                    </select>
                </div>
            )}

            <div className="text-xs text-blue-600 bg-blue-50 rounded-lg p-2 text-center border border-blue-100">
                ⏰ {getScheduleDescription()}
            </div>
        </div>
    );
}