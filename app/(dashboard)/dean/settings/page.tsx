// app/(dashboard)/dean/settings/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowRight,
    faSpinner,
    faGear,
    faClock,
    faToggleOn,
    faToggleOff,
    faSave,
    faBan,
    faUsers,
    faEnvelope,
    faFile,
    faImage,
    faDatabase,
    faShield,
    faCheckCircle,
    faRotate,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import { apiWrapper } from "@/utils/apiClient";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import useUserInfoStore from "@/store/userInfoStore";

// ==============================
// TYPES
// ==============================

interface SystemSettingsDto {
    // Distribution
    ignoredAfterDays: number;
    autoIgnoreEnabled: boolean;
    backgroundServiceIntervalHours: number;

    // File
    maxAttachmentSizeMB: number;
    orphanFileRetentionHours: number;
    allowedExtensionsList: string[];
    blockedMimeTypesList: string[];

    // Image
    imageCompressionEnabled: boolean;
    imageCompressionQuality: number;
    imageMaxWidth: number;
    imageMaxHeight: number;

    // Storage
    defaultStorageProvider: string;

    // Security
    enableVirusScan: boolean;
    requireDeanApprovalForAll: boolean;
    autoApprovePermanentReceivers: boolean;
}

// ==============================
// MAIN COMPONENT
// ==============================

export default function DeanSettingsPage() {
    useAuthGuard();
    const router = useRouter();
    const { role } = useUserInfoStore();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<SystemSettingsDto | null>(null);

    const isDean = role === "Dean";

    // ==============================
    // FETCH SETTINGS
    // ==============================

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await apiWrapper.get<{
                data: SystemSettingsDto;
            }>("/SystemSettings");

            if (response.success && response.data) {
                setSettings(response.data.data);
            } else {
                toast.error(response.error || "فشل تحميل الإعدادات");
            }
        } catch {
            toast.error("حدث خطأ أثناء تحميل الإعدادات");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isDean) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            fetchSettings();
        } else {
            setLoading(false);
        }
    }, [isDean]);

    // ==============================
    // UPDATE SETTINGS
    // ==============================

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateSetting = async (key: string, value: any) => {
        if (!settings) return;

        try {
            setSaving(true);

            let url = "";
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let body: any = {};

            // ✅ تحديد المسار الصحيح لكل إعداد
            switch (key) {
                case "autoIgnoreEnabled":
                    url = "/SystemSettings/auto-ignore";
                    body = { enabled: value };
                    break;
                case "ignoredAfterDays":
                    url = "/SystemSettings/ignored-after-days";
                    body = { days: value };
                    break;
                case "requireDeanApprovalForAll":
                    url = "/SystemSettings/require-approval";
                    body = { enabled: value };
                    break;
                case "autoApprovePermanentReceivers":
                    url = "/SystemSettings/auto-approve-permanent";
                    body = { enabled: value };
                    break;
                case "defaultStorageProvider":
                    url = "/SystemSettings/storage-provider";
                    body = { provider: value };
                    break;
                default:
                    // ✅ تحديث عام
                    url = "/SystemSettings";
                    body = { [key]: value };
                    break;
            }

            const response = await apiWrapper.put(url, body);

            if (response.success) {
                toast.success("تم تحديث الإعداد بنجاح");
                // ✅ إعادة تحميل الإعدادات للحصول على القيم المحدثة
                await fetchSettings();
            } else {
                toast.error(response.error || "فشل تحديث الإعداد");
            }
        } catch {
            toast.error("حدث خطأ أثناء تحديث الإعداد");
        } finally {
            setSaving(false);
        }
    };

    // ==============================
    // RESET SETTINGS
    // ==============================

    const handleReset = async () => {
        if (!window.confirm("هل أنت متأكد من إعادة تعيين جميع الإعدادات إلى القيم الافتراضية؟")) return;

        try {
            setSaving(true);
            const response = await apiWrapper.post("/SystemSettings/reset");

            if (response.success) {
                toast.success("تم إعادة تعيين الإعدادات بنجاح");
                await fetchSettings();
            } else {
                toast.error(response.error || "فشل إعادة تعيين الإعدادات");
            }
        } catch {
            toast.error("حدث خطأ أثناء إعادة تعيين الإعدادات");
        } finally {
            setSaving(false);
        }
    };

    // ==============================
    // TOGGLE HANDLERS
    // ==============================

    const toggleAutoIgnore = () => {
        if (settings) {
            updateSetting("autoIgnoreEnabled", !settings.autoIgnoreEnabled);
        }
    };

    const toggleDeanApproval = () => {
        if (settings) {
            updateSetting("requireDeanApprovalForAll", !settings.requireDeanApprovalForAll);
        }
    };

    const toggleAutoApprovePermanent = () => {
        if (settings) {
            updateSetting("autoApprovePermanentReceivers", !settings.autoApprovePermanentReceivers);
        }
    };

    const handleDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value);
        if (value > 0) {
            updateSetting("ignoredAfterDays", value);
        }
    };

    // ==============================
    // RENDER
    // ==============================

    if (!isDean) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="text-5xl mb-4">🔒</div>
                <h2 className="text-xl font-bold text-slate-600">غير مصرح</h2>
                <p className="text-sm text-slate-400 mt-1">هذه الصفحة متاحة للعميد فقط</p>
                <button
                    onClick={() => router.back()}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition"
                >
                    <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                    العودة
                </button>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <FontAwesomeIcon icon={faSpinner} spin className="text-3xl text-blue-600" />
                <span className="mr-3 text-blue-600 text-sm">جاري تحميل الإعدادات...</span>
            </div>
        );
    }

    if (!settings) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="text-5xl mb-4">⚙️</div>
                <h2 className="text-xl font-bold text-slate-600">لا توجد إعدادات</h2>
                <p className="text-sm text-slate-400 mt-1">لم يتم العثور على إعدادات النظام</p>
                <button
                    onClick={fetchSettings}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition"
                >
                    <FontAwesomeIcon icon={faSpinner} className={loading ? "animate-spin" : ""} />
                    إعادة المحاولة
                </button>
            </div>
        );
    }

    return (
        <div dir="rtl" className="min-h-screen bg-slate-50 p-4">
            {/* ===== HEADER ===== */}
            <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-4 mb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center">
                            <FontAwesomeIcon icon={faGear} />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-800">إعدادات النظام</h1>
                            <p className="text-xs text-slate-500">إدارة إعدادات النظام الخاصة بالتجاهل والمرفقات والأمان</p>
                        </div>
                    </div>

                    <button
                        onClick={handleReset}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition text-sm disabled:opacity-50"
                    >
                        <FontAwesomeIcon icon={faRotate} />
                        إعادة تعيين
                    </button>
                </div>
            </div>

            {/* ===== SETTINGS SECTIONS ===== */}

            {/* 1. إعدادات التجاهل */}
            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4 mb-4">
                <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-4">
                    <FontAwesomeIcon icon={faBan} className="text-red-500" />
                    إعدادات التجاهل
                </h2>

                <div className="space-y-4">
                    {/* Auto-Ignore Toggle */}
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <div>
                            <p className="font-medium text-slate-700">التجاهل التلقائي</p>
                            <p className="text-xs text-slate-400">
                                تفعيل أو تعطيل خاصية التجاهل التلقائي للمراسلات
                            </p>
                        </div>
                        <button
                            onClick={toggleAutoIgnore}
                            disabled={saving}
                            className="text-3xl transition hover:scale-110 disabled:opacity-50"
                        >
                            <FontAwesomeIcon
                                icon={settings.autoIgnoreEnabled ? faToggleOn : faToggleOff}
                                className={settings.autoIgnoreEnabled ? "text-blue-600" : "text-gray-300"}
                            />
                        </button>
                    </div>

                    {/* Ignored After Days */}
                    <div className="p-3 bg-slate-50 rounded-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-slate-700">عدد الأيام للتجاهل</p>
                                <p className="text-xs text-slate-400">
                                    عدد الأيام بعدها تعتبر المراسلة متجاهلة
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={settings.ignoredAfterDays}
                                    onChange={handleDaysChange}
                                    min={1}
                                    max={90}
                                    className="w-20 px-3 py-1.5 rounded-xl border border-gray-200 text-center text-sm focus:outline-none focus:border-blue-400"
                                />
                                <span className="text-sm text-slate-400">يوم</span>
                                {saving && <FontAwesomeIcon icon={faSpinner} spin className="text-blue-500" />}
                            </div>
                        </div>
                    </div>

                    {/* Background Service Interval */}
                    <div className="p-3 bg-slate-50 rounded-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-slate-700">فترة الخدمة الخلفية</p>
                                <p className="text-xs text-slate-400">
                                    عدد الساعات بين كل تشغيل لخدمة الخلفية
                                </p>
                            </div>
                            <span className="text-sm font-medium text-slate-700">
                                {settings.backgroundServiceIntervalHours} ساعة
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. إعدادات المرفقات */}
            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4 mb-4">
                <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-4">
                    <FontAwesomeIcon icon={faFile} className="text-blue-500" />
                    إعدادات المرفقات
                </h2>

                <div className="space-y-4">
                    <div className="p-3 bg-slate-50 rounded-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-slate-700">الحد الأقصى للمرفق</p>
                                <p className="text-xs text-slate-400">الحد الأقصى لحجم المرفق بالميجابايت</p>
                            </div>
                            <span className="text-sm font-medium text-slate-700">
                                {settings.maxAttachmentSizeMB} MB
                            </span>
                        </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-slate-700">الاحتفاظ بالملفات اليتيمة</p>
                                <p className="text-xs text-slate-400">عدد الساعات للاحتفاظ بالملفات غير المرتبطة</p>
                            </div>
                            <span className="text-sm font-medium text-slate-700">
                                {settings.orphanFileRetentionHours} ساعة
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. إعدادات الصور */}
            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4 mb-4">
                <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-4">
                    <FontAwesomeIcon icon={faImage} className="text-purple-500" />
                    إعدادات الصور
                </h2>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <div>
                            <p className="font-medium text-slate-700">ضغط الصور</p>
                            <p className="text-xs text-slate-400">تفعيل أو تعطيل ضغط الصور عند الرفع</p>
                        </div>
                        <span className={`text-sm font-medium ${settings.imageCompressionEnabled ? 'text-green-600' : 'text-gray-400'}`}>
                            {settings.imageCompressionEnabled ? 'مفعل' : 'معطل'}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="p-3 bg-slate-50 rounded-xl text-center">
                            <p className="text-xs text-slate-400">جودة الضغط</p>
                            <p className="text-lg font-bold text-slate-700">{settings.imageCompressionQuality}%</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl text-center">
                            <p className="text-xs text-slate-400">العرض الأقصى</p>
                            <p className="text-lg font-bold text-slate-700">{settings.imageMaxWidth} بكسل</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl text-center">
                            <p className="text-xs text-slate-400">الارتفاع الأقصى</p>
                            <p className="text-lg font-bold text-slate-700">{settings.imageMaxHeight} بكسل</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. إعدادات الأمان */}
            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4">
                <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-4">
                    <FontAwesomeIcon icon={faShield} className="text-green-500" />
                    إعدادات الأمان
                </h2>

                <div className="space-y-4">
                    {/* فحص الفيروسات */}
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <div>
                            <p className="font-medium text-slate-700">فحص الفيروسات</p>
                            <p className="text-xs text-slate-400">تفعيل أو تعطيل فحص الفيروسات للمرفقات</p>
                        </div>
                        <span className={`text-sm font-medium ${settings.enableVirusScan ? 'text-green-600' : 'text-gray-400'}`}>
                            {settings.enableVirusScan ? 'مفعل' : 'معطل'}
                        </span>
                    </div>

                    {/* موافقة العميد للجميع */}
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <div>
                            <p className="font-medium text-slate-700">موافقة العميد للجميع</p>
                            <p className="text-xs text-slate-400">طلب موافقة العميد على جميع التوزيعات</p>
                        </div>
                        <button
                            onClick={toggleDeanApproval}
                            disabled={saving}
                            className="text-3xl transition hover:scale-110 disabled:opacity-50"
                        >
                            <FontAwesomeIcon
                                icon={settings.requireDeanApprovalForAll ? faToggleOn : faToggleOff}
                                className={settings.requireDeanApprovalForAll ? "text-blue-600" : "text-gray-300"}
                            />
                        </button>
                    </div>

                    {/* الموافقة التلقائية للمستلمين الدائمين */}
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <div>
                            <p className="font-medium text-slate-700">الموافقة التلقائية للمستلمين الدائمين</p>
                            <p className="text-xs text-slate-400">الموافقة التلقائية على توزيعات المستلمين الدائمين</p>
                        </div>
                        <button
                            onClick={toggleAutoApprovePermanent}
                            disabled={saving}
                            className="text-3xl transition hover:scale-110 disabled:opacity-50"
                        >
                            <FontAwesomeIcon
                                icon={settings.autoApprovePermanentReceivers ? faToggleOn : faToggleOff}
                                className={settings.autoApprovePermanentReceivers ? "text-blue-600" : "text-gray-300"}
                            />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}