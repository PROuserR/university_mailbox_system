/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(dashboard)/dean/settings/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowRight,
    faSpinner,
    faGear,
    faClock,
    faToggleOn,
    faToggleOff,
    faBan,
    faUsers,
    faEnvelope,
    faFile,
    faDatabase,
    faShield,
    faCheckCircle,
    faRotate,
    faServer,
    faTrash,
    faHardDrive,
    faBoxArchive,
    faPen,
    faFolder,
    faCloud,
} from "@fortawesome/free-solid-svg-icons";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { useSettings } from "@/hooks/useSettings";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { EditButton } from "@/components/settings/EditButton";
import useUserInfoStore from "@/store/userInfoStore";
import { CronEditor } from "@/components/settings/CronEditor";

// ==============================
// SUB-COMPONENTS
// ==============================

interface ToggleCardProps {
    label: string;
    description: string;
    enabled: boolean;
    onToggle: () => void;
    disabled?: boolean;
    icon?: any;
    showEdit?: boolean;
    onEdit?: () => void;
}

function ToggleCard({ 
    label, 
    description, 
    enabled, 
    onToggle, 
    disabled = false, 
    icon,
    showEdit = false,
    onEdit,
}: ToggleCardProps) {
    return (
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-3">
                {icon && (
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                        <FontAwesomeIcon icon={icon} className="text-sm" />
                    </div>
                )}
                <div>
                    <p className="font-medium text-slate-700">{label}</p>
                    <p className="text-xs text-slate-400">{description}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                {showEdit && onEdit && (
                    <EditButton onClick={onEdit} disabled={disabled} />
                )}
                <button
                    onClick={onToggle}
                    disabled={disabled}
                    className="text-3xl transition hover:scale-110 disabled:opacity-50"
                >
                    <FontAwesomeIcon
                        icon={enabled ? faToggleOn : faToggleOff}
                        className={enabled ? "text-blue-600" : "text-gray-300"}
                    />
                </button>
            </div>
        </div>
    );
}

interface SettingCardProps {
    label: string;
    description: string;
    value: string | number;
    icon?: any;
    suffix?: string;
    showEdit?: boolean;
    onEdit?: () => void;
    disabled?: boolean;
}
function formatCronToText(cron: string, type: string): string {
    const parts = cron.trim().split(' ');
    if (parts.length < 5) return "غير محدد";

    const minute = parseInt(parts[0]) || 0;
    const hour = parseInt(parts[1]) || 0;
    const h = String(hour).padStart(2, '0');
    const m = String(minute).padStart(2, '0');

    switch (type) {
        case 'daily':
            return `يومياً الساعة ${h}:${m}`;
        case 'weekly': {
            const weekDays = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
            const day = parseInt(parts[4]) || 0;
            return `أسبوعياً يوم ${weekDays[day]} الساعة ${h}:${m}`;
        }
        case 'monthly': {
            const day = parseInt(parts[2]) || 1;
            return `شهرياً يوم ${day} الساعة ${h}:${m}`;
        }
        case 'yearly': {
            const months = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
            const month = parseInt(parts[3]) || 1;
            const day = parseInt(parts[2]) || 1;
            return `سنوياً في ${months[month - 1]} يوم ${day} الساعة ${h}:${m}`;
        }
        default:
            return `${h}:${m}`;
    }
}
function SettingCard({ 
    label, 
    description, 
    value, 
    icon, 
    suffix = "",
    showEdit = false,
    onEdit,
    disabled = false,
}: SettingCardProps) {
    return (
        <div className="p-3 bg-slate-50 rounded-xl">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {icon && (
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                            <FontAwesomeIcon icon={icon} className="text-sm" />
                        </div>
                    )}
                    <div>
                        <p className="font-medium text-slate-700">{label}</p>
                        <p className="text-xs text-slate-400">{description}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {showEdit && onEdit && (
                        <EditButton onClick={onEdit} disabled={disabled} />
                    )}
                    <span className="text-sm font-medium text-slate-700">
                        {value} {suffix}
                    </span>
                </div>
            </div>
        </div>
    );
}

// ==============================
// MAIN COMPONENT
// ==============================

export default function DeanSettingsPage() {
    const router = useRouter();
    const { role } = useUserInfoStore();

    const { isLoading: isAuthLoading } = useAuthGuard({
        requiredPermissions: ['ViewSettings'],
        redirectTo: '/auth/login',
        unauthorizedPath: '/unauthorized'
    });

    const {
        settings,
        isLoading,
        isSaving,
        toggleIncomingEmail,
        toggleOutgoingEmail,
        resetSettings,
        updateDistributionSettings,
        updateFileSettings,
        updateArchiveSettings,
        updateCleanupSettings,
        updateTempCleanupSettings,
        updateFilesBackupSettings,
        updateDatabaseBackupSettings,
        updateEmailIncomingSettings,
        updateEmailOutgoingSettings,
    } = useSettings();

    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState<string>("");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [formValues, setFormValues] = useState<any>({});

    const canUpdate = role === "Dean" || role === "Admin";

    const openModal = (type: string) => {
        setModalType(type);
        setModalOpen(true);
        if (settings) {
            switch (type) {
                case "distribution":
                    setFormValues({
                        ignoredAfterDays: settings.ignoredAfterDays,
                        autoIgnoreEnabled: settings.autoIgnoreEnabled,
                        backgroundServiceIntervalHours: settings.backgroundServiceIntervalHours,
                        requireDeanApprovalForAll: settings.requireDeanApprovalForAll,
                        autoApprovePermanentReceivers: settings.autoApprovePermanentReceivers,
                    });
                    break;
                case "file":
    setFormValues({
        maxAttachmentSizeMB: settings.maxAttachmentSizeMB,
        allowedExtensions: settings.allowedExtensionsList.join(', '),
        blockedMimeTypes: settings.blockedMimeTypesList.join(', '),
    });
    break;
                case "archive":
                    setFormValues({
                        archiveAfterDays: settings.archiveAfterDays,
                        autoArchiveEnabled: settings.autoArchiveEnabled,
                        archiveBatchSize: settings.archiveBatchSize,
                    });
                    break;
                case "cleanup":
                    setFormValues({
                        cleanupDelayMinutes: settings.cleanupDelayMinutes,
                        maxStaleMinutes: settings.maxStaleMinutes,
                        autoCleanupEnabled: settings.autoCleanupEnabled,
                        autoRemoveStaleRunning: settings.autoRemoveStaleRunning,
                    });
                    break;
                case "temp-cleanup":
                    setFormValues({
                        tempCleanupEnabled: settings.tempCleanupEnabled,
                        tempFilesMaxAgeMinutes: settings.tempFilesMaxAgeMinutes,
                        autoDeleteTempFiles: settings.autoDeleteTempFiles,
                    });
                    break;
              case "files-backup":
    setFormValues({
        // Job Control
        isDailyBackupJobEnabled: settings.isDailyBackupJobEnabled,
        isMonthlyBackupJobEnabled: settings.isMonthlyBackupJobEnabled,
        isAnnualBackupJobEnabled: settings.isAnnualBackupJobEnabled,
        isCleanupJobEnabled: settings.isCleanupJobEnabled,
        
        // Enable/Disable Backup Types
        dailyBackupEnabled: settings.dailyBackupEnabled,
        monthlyBackupEnabled: settings.monthlyBackupEnabled,
        annualBackupEnabled: settings.annualBackupEnabled,
        
        // Retention Policies
        dailyRetentionDays: settings.dailyRetentionDays ,
        monthlyRetentionMonths: settings.monthlyRetentionMonths ,
        annualRetentionYears: settings.annualRetentionYears ,
        
        dailyBackupCron: settings.dailyBackupCron ,
        monthlyBackupCron: settings.monthlyBackupCron, 
        annualBackupCron: settings.annualBackupCron ,
        cleanupCron: settings.cleanupCron ,
    });
    break;
                case "database-backup":
    setFormValues({
        dbBackupEnabled: settings.dbBackupEnabled,
        dbBackupFrequency: settings.dbBackupFrequency || 1,
        dbBackupScheduledHour: settings.dbBackupScheduledHour || 2,
        dbBackupScheduledMinute: settings.dbBackupScheduledMinute || 0,
        dbBackupWeeklyDay: settings.dbBackupWeeklyDay !== null ? settings.dbBackupWeeklyDay : 0,
        dbBackupMonthlyDay: settings.dbBackupMonthlyDay !== null ? settings.dbBackupMonthlyDay : 1,
        dbBackupMaxRetention: settings.dbBackupMaxRetention || 10,
        dbBackupCompress: settings.dbBackupCompress,
    });
    break;
                case "email-incoming":
                    setFormValues({
                        enableIncomingEmail: settings.enableIncomingEmail,
                        incomingEmailServer: settings.incomingEmailServer || "",
                        incomingEmailPort: settings.incomingEmailPort,
                        incomingEmailUsername: settings.incomingEmailUsername || "",
                        incomingEmailPassword: "",
                        incomingEmailUseSsl: settings.incomingEmailUseSsl,
                        incomingEmailCheckIntervalMinutes: settings.incomingEmailCheckIntervalMinutes,
                        incomingEmailMaxPerBatch: settings.incomingEmailMaxPerBatch,
                        incomingEmailAllowedDomains: settings.incomingEmailAllowedDomains || "",
                        incomingEmailFetchDays: settings.incomingEmailFetchDays || "",
                    });
                    break;
                case "email-outgoing":
                    setFormValues({
                        enableOutgoingEmail: settings.enableOutgoingEmail,
                        outgoingEmailServer: settings.outgoingEmailServer || "",
                        outgoingEmailPort: settings.outgoingEmailPort,
                        outgoingEmailUsername: settings.outgoingEmailUsername || "",
                        outgoingEmailPassword: "",
                        outgoingEmailUseSsl: settings.outgoingEmailUseSsl,
                        outgoingEmailFrom: settings.outgoingEmailFrom || "",
                        outgoingEmailFromName: settings.outgoingEmailFromName || "",
                        outgoingEmailMaxRetryCount: settings.outgoingEmailMaxRetryCount,
                        outgoingEmailRetryIntervalMinutes: settings.outgoingEmailRetryIntervalMinutes,
                        outgoingEmailNotifyOnDelivery: settings.outgoingEmailNotifyOnDelivery,
                    });
                    break;
                default:
                    setFormValues({});
            }
        }
    };

    const handleSave = async () => {
        try {
            switch (modalType) {
                case "distribution":
                    await updateDistributionSettings(formValues);
                    break;
              case "file":
    const allowedExtensions = formValues.allowedExtensions
        ? formValues.allowedExtensions.split(',').map((s: string) => s.trim()).filter(Boolean)
        : undefined;
    const blockedMimeTypes = formValues.blockedMimeTypes
        ? formValues.blockedMimeTypes.split(',').map((s: string) => s.trim()).filter(Boolean)
        : undefined;
    
    await updateFileSettings({
        maxAttachmentSizeMB: formValues.maxAttachmentSizeMB,
        allowedExtensions: allowedExtensions,
        blockedMimeTypes: blockedMimeTypes,
    });
    break;
                case "archive":
                    await updateArchiveSettings(formValues);
                    break;
                case "cleanup":
                    await updateCleanupSettings(formValues);
                    break;
                case "temp-cleanup":
                    await updateTempCleanupSettings(formValues);
                    break;
                case "files-backup":
                    await updateFilesBackupSettings(formValues);
                    break;
                case "database-backup":
                    await updateDatabaseBackupSettings(formValues);
                    break;
                case "email-incoming":
                    await updateEmailIncomingSettings(formValues);
                    break;
                case "email-outgoing":
                    await updateEmailOutgoingSettings(formValues);
                    break;
                default:
                    break;
            }
            setModalOpen(false);
        } catch {
            // الخطأ يتم معالجته في الـ Hook
        }
    };

    if (isAuthLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <FontAwesomeIcon icon={faSpinner} spin className="text-3xl text-blue-600" />
                <span className="mr-3 text-blue-600 text-sm">جاري التحقق من الصلاحيات...</span>
            </div>
        );
    }

    if (!canUpdate) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="text-5xl mb-4">🔒</div>
                <h2 className="text-xl font-bold text-slate-600">غير مصرح</h2>
                <p className="text-sm text-slate-400 mt-1">هذه الصفحة متاحة للعميد أو الإدمن فقط</p>
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

    if (isLoading || !settings) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <FontAwesomeIcon icon={faSpinner} spin className="text-3xl text-blue-600" />
                <span className="mr-3 text-blue-600 text-sm">جاري تحميل الإعدادات...</span>
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
                            <p className="text-xs text-slate-500">إدارة إعدادات النظام المختلفة</p>
                        </div>
                    </div>

                    <PermissionGate permissions={['UpdateSettings']}>
                        <button
                            onClick={resetSettings}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition text-sm disabled:opacity-50"
                        >
                            <FontAwesomeIcon icon={faRotate} />
                            إعادة تعيين
                        </button>
                    </PermissionGate>
                </div>
            </div>

            {/* ===== 1. إعدادات التوزيع ===== */}
            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4 mb-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <FontAwesomeIcon icon={faUsers} className="text-blue-500" />
                        إعدادات التوزيع
                    </h2>
                    <PermissionGate permissions={['UpdateSettings']}>
                        <EditButton onClick={() => openModal("distribution")} />
                    </PermissionGate>
                </div>
                <div className="space-y-4">
                    <ToggleCard
                        label="التجاهل التلقائي"
                        description="تفعيل أو تعطيل خاصية التجاهل التلقائي للمراسلات"
                        enabled={settings.autoIgnoreEnabled}
                        onToggle={() => {}}
                        disabled={true}
                        icon={faBan}
                    />
                    <SettingCard
                        label="عدد الأيام للتجاهل"
                        description="عدد الأيام بعدها تعتبر المراسلة متجاهلة"
                        value={settings.ignoredAfterDays}
                        suffix="يوم"
                        icon={faClock}
                    />
                    <ToggleCard
                        label="موافقة العميد للجميع"
                        description="طلب موافقة العميد على جميع التوزيعات"
                        enabled={settings.requireDeanApprovalForAll}
                        onToggle={() => {}}
                        disabled={true}
                        icon={faShield}
                    />
                    <ToggleCard
                        label="الموافقة التلقائية للمستلمين الدائمين"
                        description="الموافقة التلقائية على توزيعات المستلمين الدائمين"
                        enabled={settings.autoApprovePermanentReceivers}
                        onToggle={() => {}}
                        disabled={true}
                        icon={faCheckCircle}
                    />
                    <SettingCard
                        label="فترة الخدمة الخلفية"
                        description="عدد الساعات بين كل تشغيل لخدمة الخلفية"
                        value={settings.backgroundServiceIntervalHours}
                        suffix="ساعة"
                        icon={faClock}
                    />
                </div>
            </div>

          {/* ===== 2. إعدادات المرفقات ===== */}
<div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4 mb-4">
    <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <FontAwesomeIcon icon={faFile} className="text-blue-500" />
            إعدادات المرفقات
        </h2>
        <PermissionGate permissions={['UpdateSettings']}>
            <EditButton onClick={() => openModal("file")} />
        </PermissionGate>
    </div>
    <div className="space-y-4">
        <SettingCard
            label="الحد الأقصى للمرفق"
            description="الحد الأقصى لحجم المرفق بالميجابايت"
            value={settings.maxAttachmentSizeMB}
            suffix="MB"
            icon={faFile}
            showEdit={false}
            onEdit={() => openModal("file")}
        />
        <div className="p-3 bg-slate-50 rounded-xl">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                        <FontAwesomeIcon icon={faFile} className="text-sm" />
                    </div>
                    <div>
                        <p className="font-medium text-slate-700">الامتدادات المسموحة</p>
                        <p className="text-xs text-slate-400">أنواع الملفات المسموح برفعها (مفصولة بفواصل)</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-1">
                    {settings.allowedExtensionsList.map((ext, index) => (
                        <span key={index} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                            {ext}
                        </span>
                    ))}
                </div>
            </div>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                        <FontAwesomeIcon icon={faBan} className="text-sm" />
                    </div>
                    <div>
                        <p className="font-medium text-slate-700">أنواع MIME المحظورة</p>
                        <p className="text-xs text-slate-400">أنواع الملفات المحظورة (مفصولة بفواصل)</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-1">
                    {settings.blockedMimeTypesList.map((mime, index) => (
                        <span key={index} className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full">
                            {mime}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    </div>
</div>

            {/* ===== 3. إعدادات البريد الوارد ===== */}
            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4 mb-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <FontAwesomeIcon icon={faEnvelope} className="text-green-500" />
                        إعدادات البريد الوارد
                    </h2>
                    <PermissionGate permissions={['UpdateSettings']}>
                        <EditButton onClick={() => openModal("email-incoming")} />
                    </PermissionGate>
                </div>
                <div className="space-y-4">
                    <ToggleCard
                        label="تفعيل البريد الوارد"
                        description="تفعيل أو تعطيل استقبال البريد الإلكتروني الوارد"
                        enabled={settings.enableIncomingEmail}
                        onToggle={() => toggleIncomingEmail(!settings.enableIncomingEmail)}
                        disabled={isSaving}
                        icon={faEnvelope}
                    />
                    {settings.enableIncomingEmail && (
                        <>
                            <SettingCard
                                label="خادم البريد"
                                description="خادم البريد الإلكتروني الوارد"
                                value={settings.incomingEmailServer || "-"}
                                icon={faServer}
                            />
                            <SettingCard
                                label="المنفذ"
                                description="منفذ خادم البريد"
                                value={settings.incomingEmailPort}
                                icon={faDatabase}
                            />
                            <SettingCard
                                label="اسم المستخدم"
                                description="اسم مستخدم البريد الإلكتروني"
                                value={settings.incomingEmailUsername || "-"}
                                icon={faUsers}
                            />
                            <div className="grid grid-cols-1 gap-3">
                                <SettingCard
                                    label="SSL"
                                    description="استخدام SSL"
                                    value={settings.incomingEmailUseSsl ? "مفعل" : "معطل"}
                                    icon={faShield}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <SettingCard
                                    label="فترة الفحص"
                                    description="عدد الدقائق بين كل فحص"
                                    value={settings.incomingEmailCheckIntervalMinutes}
                                    suffix="دقيقة"
                                    icon={faClock}
                                />
                                <SettingCard
                                    label="الحد الأقصى للدفعة"
                                    description="الحد الأقصى للرسائل في الدفعة الواحدة"
                                    value={settings.incomingEmailMaxPerBatch}
                                    suffix="رسالة"
                                    icon={faFile}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ===== 4. إعدادات البريد الصادر ===== */}
            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4 mb-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <FontAwesomeIcon icon={faEnvelope} className="text-blue-500" />
                        إعدادات البريد الصادر
                    </h2>
                    <PermissionGate permissions={['UpdateSettings']}>
                        <EditButton onClick={() => openModal("email-outgoing")} />
                    </PermissionGate>
                </div>
                <div className="space-y-4">
                    <ToggleCard
                        label="تفعيل البريد الصادر"
                        description="تفعيل أو تعطيل إرسال البريد الإلكتروني الصادر"
                        enabled={settings.enableOutgoingEmail}
                        onToggle={() => toggleOutgoingEmail(!settings.enableOutgoingEmail)}
                        disabled={isSaving}
                        icon={faEnvelope}
                    />
                    {settings.enableOutgoingEmail && (
                        <>
                            <SettingCard
                                label="خادم البريد"
                                description="خادم البريد الإلكتروني الصادر"
                                value={settings.outgoingEmailServer || "-"}
                                icon={faServer}
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <SettingCard
                                    label="المنفذ"
                                    description="منفذ خادم البريد"
                                    value={settings.outgoingEmailPort}
                                    icon={faDatabase}
                                />
                                <SettingCard
                                    label="SSL"
                                    description="استخدام SSL"
                                    value={settings.outgoingEmailUseSsl ? "مفعل" : "معطل"}
                                    icon={faShield}
                                />
                            </div>
                            <SettingCard
                                label="البريد المرسل"
                                description="عنوان البريد الإلكتروني للمرسل"
                                value={settings.outgoingEmailFrom || "-"}
                                icon={faEnvelope}
                            />
                            <SettingCard
                                label="اسم المرسل"
                                description="اسم المرسل الظاهر"
                                value={settings.outgoingEmailFromName || "-"}
                                icon={faUsers}
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <SettingCard
                                    label="عدد محاولات إعادة الإرسال"
                                    description="الحد الأقصى لمحاولات إعادة الإرسال"
                                    value={settings.outgoingEmailMaxRetryCount}
                                    icon={faRotate}
                                />
                                <SettingCard
                                    label="فترة إعادة المحاولة"
                                    description="عدد الدقائق بين محاولات إعادة الإرسال"
                                    value={settings.outgoingEmailRetryIntervalMinutes}
                                    suffix="دقيقة"
                                    icon={faClock}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ===== 5. إعدادات الأرشفة ===== */}
            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4 mb-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <FontAwesomeIcon icon={faBoxArchive} className="text-amber-500" />
                        إعدادات الأرشفة
                    </h2>
                    <PermissionGate permissions={['UpdateSettings']}>
                        <EditButton onClick={() => openModal("archive")} />
                    </PermissionGate>
                </div>
                <div className="space-y-4">
                    <ToggleCard
                        label="الأرشفة التلقائية"
                        description="تفعيل أو تعطيل الأرشفة التلقائية للمراسلات القديمة"
                        enabled={settings.autoArchiveEnabled}
                        onToggle={() => {}}
                        disabled={true}
                        icon={faBoxArchive}
                    />
                    <div className="grid grid-cols-2 gap-3">
                        <SettingCard
                            label="الأرشفة بعد أيام"
                            description="عدد الأيام بعدها تتم الأرشفة"
                            value={settings.archiveAfterDays}
                            suffix="يوم"
                            icon={faClock}
                        />
                        <SettingCard
                            label="حجم الدفعة"
                            description="عدد المراسلات في الدفعة الواحدة"
                            value={settings.archiveBatchSize}
                            suffix="مراسلة"
                            icon={faFile}
                        />
                    </div>
                </div>
            </div>

            {/* ===== 6. إعدادات تنظيف الملفات المؤقتة ===== */}
            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4 mb-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <FontAwesomeIcon icon={faTrash} className="text-red-500" />
                        إعدادات تنظيف الملفات المؤقتة
                    </h2>
                    <PermissionGate permissions={['UpdateSettings']}>
                        <EditButton onClick={() => openModal("temp-cleanup")} />
                    </PermissionGate>
                </div>
                <div className="space-y-4">
                    <ToggleCard
                        label="تنظيف الملفات المؤقتة"
                        description="تفعيل أو تعطيل تنظيف الملفات المؤقتة تلقائياً"
                        enabled={settings.tempCleanupEnabled}
                        onToggle={() => {}}
                        disabled={true}
                        icon={faTrash}
                    />
                    {settings.tempCleanupEnabled && (
                        <div className="grid grid-cols-2 gap-3">
                            <SettingCard
                                label="الحد الأقصى للعمر"
                                description="عدد الدقائق قبل حذف الملف المؤقت"
                                value={settings.tempFilesMaxAgeMinutes}
                                suffix="دقيقة"
                                icon={faClock}
                            />
                            <SettingCard
                                label="الحذف التلقائي"
                                description="حذف الملفات المؤقتة تلقائياً"
                                value={settings.autoDeleteTempFiles ? "مفعل" : "معطل"}
                                icon={faTrash}
                            />
                        </div>
                    )}
                </div>
            </div>

           {/* // ===== 7. إعدادات النسخ الاحتياطي للملفات ===== */}
<div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4 mb-4">
    <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <FontAwesomeIcon icon={faFolder} className="text-purple-500" />
            إعدادات النسخ الاحتياطي للملفات
        </h2>
        <PermissionGate permissions={['UpdateSettings']}>
            <EditButton onClick={() => openModal("files-backup")} />
        </PermissionGate>
    </div>
    <div className="space-y-4">
        {/* Job Control */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <SettingCard
                label="مهمة النسخ اليومي"
                description="تفعيل مهمة النسخ الاحتياطي اليومي"
                value={settings.isDailyBackupJobEnabled ? "مفعل" : "معطل"}
                icon={faClock}
            />
            <SettingCard
                label="مهمة النسخ الشهري"
                description="تفعيل مهمة النسخ الاحتياطي الشهري"
                value={settings.isMonthlyBackupJobEnabled ? "مفعل" : "معطل"}
                icon={faClock}
            />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <SettingCard
                label="مهمة النسخ السنوي"
                description="تفعيل مهمة النسخ الاحتياطي السنوي"
                value={settings.isAnnualBackupJobEnabled ? "مفعل" : "معطل"}
                icon={faClock}
            />
            <SettingCard
                label="مهمة التنظيف"
                description="تفعيل مهمة تنظيف النسخ الاحتياطية"
                value={settings.isCleanupJobEnabled ? "مفعل" : "معطل"}
                icon={faTrash}
            />
        </div>

        {/* Enable/Disable Backup Types */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <SettingCard
                label="نسخ يومي"
                description="تفعيل النسخ الاحتياطي اليومي للملفات"
                value={settings.dailyBackupEnabled ? "مفعل" : "معطل"}
                icon={faClock}
            />
            <SettingCard
                label="نسخ شهري"
                description="تفعيل النسخ الاحتياطي الشهري للملفات"
                value={settings.monthlyBackupEnabled ? "مفعل" : "معطل"}
                icon={faClock}
            />
            <SettingCard
                label="نسخ سنوي"
                description="تفعيل النسخ الاحتياطي السنوي للملفات"
                value={settings.annualBackupEnabled ? "مفعل" : "معطل"}
                icon={faClock}
            />
        </div>

        {/* Retention Policies */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <SettingCard
                label="الاحتفاظ اليومي"
                description="عدد الأيام للاحتفاظ بالنسخ اليومية"
                value={settings.dailyRetentionDays}
                suffix="يوم"
                icon={faHardDrive}
            />
            <SettingCard
                label="الاحتفاظ الشهري"
                description="عدد الأشهر للاحتفاظ بالنسخ الشهرية"
                value={settings.monthlyRetentionMonths}
                suffix="شهر"
                icon={faHardDrive}
            />
            <SettingCard
                label="الاحتفاظ السنوي"
                description="عدد السنوات للاحتفاظ بالنسخ السنوية"
                value={settings.annualRetentionYears}
                suffix="سنة"
                icon={faHardDrive}
            />
        </div>

        {/* ✅ عرض الجدولة بوصف بسيط بدلاً من CRON */}
        <div className="border-t border-gray-100 pt-3">
            <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <FontAwesomeIcon icon={faClock} className="text-blue-500" />
                الجدولة الزمنية
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <SettingCard
                    label="النسخ اليومي"
                    description="وقت النسخ الاحتياطي اليومي"
                    value={formatCronToText(settings.dailyBackupCron || "0 2 * * *", 'daily')}
                    icon={faClock}
                />
                <SettingCard
                    label="النسخ الشهري"
                    description="وقت النسخ الاحتياطي الشهري"
                    value={formatCronToText(settings.monthlyBackupCron || "0 3 1 * *", 'monthly')}
                    icon={faClock}
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <SettingCard
                    label="النسخ السنوي"
                    description="وقت النسخ الاحتياطي السنوي"
                    value={formatCronToText(settings.annualBackupCron || "0 4 1 1 *", 'yearly')}
                    icon={faClock}
                />
                <SettingCard
                    label="التنظيف"
                    description="وقت تنظيف النسخ الاحتياطية"
                    value={formatCronToText(settings.cleanupCron || "0 5 * * 0", 'weekly')}
                    icon={faTrash}
                />
            </div>
        </div>
    </div>
</div>

            {/* // ===== 8. إعدادات النسخ الاحتياطي لقاعدة البيانات ===== */}
            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4 mb-4">
    <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <FontAwesomeIcon icon={faDatabase} className="text-blue-500" />
            إعدادات النسخ الاحتياطي لقاعدة البيانات
        </h2>
        <PermissionGate permissions={['UpdateSettings']}>
            <EditButton onClick={() => openModal("database-backup")} />
        </PermissionGate>
    </div>
    <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <SettingCard
                label="نسخ قاعدة البيانات"
                description="تفعيل النسخ الاحتياطي لقاعدة البيانات"
                value={settings.dbBackupEnabled ? "مفعل" : "معطل"}
                icon={faDatabase}
            />
            <SettingCard
                label="ضغط النسخ"
                description="ضغط ملفات النسخ الاحتياطي"
                value={settings.dbBackupCompress ? "مفعل" : "معطل"}
                icon={faFile}
            />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <SettingCard
                label="الاحتفاظ بالنسخ"
                description="الحد الأقصى لعدد النسخ المحتفظ بها"
                value={settings.dbBackupMaxRetention}
                suffix="نسخة"
                icon={faHardDrive}
            />
            <SettingCard
                label="التكرار"
                description="تكرار النسخ الاحتياطي"
                value={
                    settings.dbBackupFrequency === 1 ? "يومي" :
                    settings.dbBackupFrequency === 2 ? "أسبوعي" :
                    settings.dbBackupFrequency === 3 ? "شهري" : "غير محدد"
                }
                icon={faClock}
            />
            <SettingCard
                label="الوقت المحدد"
                description="ساعة:دقيقة"
                value={`${settings.dbBackupScheduledHour}:${String(settings.dbBackupScheduledMinute).padStart(2, '0')}`}
                icon={faClock}
            />
        </div>
        {settings.dbBackupFrequency === 2 && settings.dbBackupWeeklyDay !== null && (
            <SettingCard
                label="اليوم الأسبوعي"
                description="يوم النسخ الاحتياطي الأسبوعي"
                value={
                    settings.dbBackupWeeklyDay === 0 ? "الأحد" :
                    settings.dbBackupWeeklyDay === 1 ? "الإثنين" :
                    settings.dbBackupWeeklyDay === 2 ? "الثلاثاء" :
                    settings.dbBackupWeeklyDay === 3 ? "الأربعاء" :
                    settings.dbBackupWeeklyDay === 4 ? "الخميس" :
                    settings.dbBackupWeeklyDay === 5 ? "الجمعة" :
                    settings.dbBackupWeeklyDay === 6 ? "السبت" : "غير محدد"
                }
                icon={faClock}
            />
        )}
        {settings.dbBackupFrequency === 3 && settings.dbBackupMonthlyDay !== null && (
            <SettingCard
                label="اليوم الشهري"
                description="يوم النسخ الاحتياطي الشهري"
                value={`اليوم ${settings.dbBackupMonthlyDay}`}
                icon={faClock}
            />
        )}
    </div>
            </div>

            {/* ===== 9. إعدادات التنظيف ===== */}
            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <FontAwesomeIcon icon={faClock} className="text-orange-500" />
                        إعدادات التنظيف
                    </h2>
                    <PermissionGate permissions={['UpdateSettings']}>
                        <EditButton onClick={() => openModal("cleanup")} />
                    </PermissionGate>
                </div>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <SettingCard
                            label="تأخير التنظيف"
                            description="عدد الدقائق قبل بدء التنظيف"
                            value={settings.cleanupDelayMinutes}
                            suffix="دقيقة"
                            icon={faClock}
                        />
                        <SettingCard
                            label="الحد الأقصى للتقادم"
                            description="عدد الدقائق قبل اعتبار المهمة قديمة"
                            value={settings.maxStaleMinutes}
                            suffix="دقيقة"
                            icon={faClock}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <SettingCard
                            label="التنظيف التلقائي"
                            description="تفعيل التنظيف التلقائي"
                            value={settings.autoCleanupEnabled ? "مفعل" : "معطل"}
                            icon={faRotate}
                        />
                        <SettingCard
                            label="إزالة المهام العالقة"
                            description="إزالة المهام العالقة تلقائياً"
                            value={settings.autoRemoveStaleRunning ? "مفعل" : "معطل"}
                            icon={faTrash}
                        />
                    </div>
                </div>
            </div>

            {/* ===== MODAL ===== */}
            <SettingsModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSave}
                title={
                    modalType === "distribution" ? "تعديل إعدادات التوزيع" :
                    modalType === "file" ? "تعديل إعدادات المرفقات" :
                    modalType === "archive" ? "تعديل إعدادات الأرشفة" :
                    modalType === "cleanup" ? "تعديل إعدادات التنظيف" :
                    modalType === "temp-cleanup" ? "تعديل إعدادات التنظيف المؤقت" :
                    modalType === "files-backup" ? "تعديل إعدادات النسخ الاحتياطي للملفات" :
                    modalType === "database-backup" ? "تعديل إعدادات النسخ الاحتياطي لقاعدة البيانات" :
                    modalType === "email-incoming" ? "تعديل إعدادات البريد الوارد" :
                    modalType === "email-outgoing" ? "تعديل إعدادات البريد الصادر" :
                    "تعديل الإعدادات"
                }
                isSaving={isSaving}
            >
                {modalType === "distribution" && (
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-slate-700">عدد الأيام للتجاهل</label>
                            <input
                                type="number"
                                value={formValues.ignoredAfterDays || ""}
                                onChange={(e) => setFormValues({...formValues, ignoredAfterDays: Number(e.target.value)})}
                                className="w-full mt-1 border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-400"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700">فترة الخدمة الخلفية (ساعات)</label>
                            <input
                                type="number"
                                value={formValues.backgroundServiceIntervalHours || ""}
                                onChange={(e) => setFormValues({...formValues, backgroundServiceIntervalHours: Number(e.target.value)})}
                                className="w-full mt-1 border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-400"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={formValues.autoIgnoreEnabled || false}
                                onChange={(e) => setFormValues({...formValues, autoIgnoreEnabled: e.target.checked})}
                                className="w-4 h-4 rounded border-gray-300"
                            />
                            <label className="text-sm text-slate-700">التجاهل التلقائي</label>
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={formValues.requireDeanApprovalForAll || false}
                                onChange={(e) => setFormValues({...formValues, requireDeanApprovalForAll: e.target.checked})}
                                className="w-4 h-4 rounded border-gray-300"
                            />
                            <label className="text-sm text-slate-700">موافقة العميد للجميع</label>
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={formValues.autoApprovePermanentReceivers || false}
                                onChange={(e) => setFormValues({...formValues, autoApprovePermanentReceivers: e.target.checked})}
                                className="w-4 h-4 rounded border-gray-300"
                            />
                            <label className="text-sm text-slate-700">الموافقة التلقائية للمستلمين الدائمين</label>
                        </div>
                    </div>
                )}

               {modalType === "file" && (
    <div className="space-y-4">
        <div>
            <label className="text-sm font-medium text-slate-700">الحد الأقصى للمرفق (MB)</label>
            <input
                type="number"
                value={formValues.maxAttachmentSizeMB || ""}
                onChange={(e) => setFormValues({...formValues, maxAttachmentSizeMB: Number(e.target.value)})}
                className="w-full mt-1 border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-400"
                placeholder="10"
            />
            <p className="text-[10px] text-slate-400 mt-0.5">بين 1 و 100 ميجابايت</p>
        </div>
        <div>
            <label className="text-sm font-medium text-slate-700">الامتدادات المسموحة</label>
            <input
                type="text"
                value={formValues.allowedExtensions || ""}
                onChange={(e) => setFormValues({...formValues, allowedExtensions: e.target.value})}
                className="w-full mt-1 border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-400"
                placeholder=".pdf, .docx, .jpg"
            />
            <p className="text-[10px] text-slate-400 mt-0.5">افصل بين الامتدادات بفاصلة، يجب أن تبدأ بـ .</p>
        </div>
        <div>
            <label className="text-sm font-medium text-slate-700">أنواع MIME المحظورة</label>
            <input
                type="text"
                value={formValues.blockedMimeTypes || ""}
                onChange={(e) => setFormValues({...formValues, blockedMimeTypes: e.target.value})}
                className="w-full mt-1 border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-400"
                placeholder="application/x-msdownload, text/javascript"
            />
            <p className="text-[10px] text-slate-400 mt-0.5">افصل بين الأنواع بفاصلة</p>
        </div>
    </div>
)}

                {modalType === "archive" && (
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-slate-700">الأرشفة بعد أيام</label>
                            <input
                                type="number"
                                value={formValues.archiveAfterDays || ""}
                                onChange={(e) => setFormValues({...formValues, archiveAfterDays: Number(e.target.value)})}
                                className="w-full mt-1 border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-400"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700">حجم الدفعة</label>
                            <input
                                type="number"
                                value={formValues.archiveBatchSize || ""}
                                onChange={(e) => setFormValues({...formValues, archiveBatchSize: Number(e.target.value)})}
                                className="w-full mt-1 border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-400"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={formValues.autoArchiveEnabled || false}
                                onChange={(e) => setFormValues({...formValues, autoArchiveEnabled: e.target.checked})}
                                className="w-4 h-4 rounded border-gray-300"
                            />
                            <label className="text-sm text-slate-700">الأرشفة التلقائية</label>
                        </div>
                    </div>
                )}

                {modalType === "cleanup" && (
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-slate-700">تأخير التنظيف (دقائق)</label>
                            <input
                                type="number"
                                value={formValues.cleanupDelayMinutes || ""}
                                onChange={(e) => setFormValues({...formValues, cleanupDelayMinutes: Number(e.target.value)})}
                                className="w-full mt-1 border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-400"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700">الحد الأقصى للتقادم (دقائق)</label>
                            <input
                                type="number"
                                value={formValues.maxStaleMinutes || ""}
                                onChange={(e) => setFormValues({...formValues, maxStaleMinutes: Number(e.target.value)})}
                                className="w-full mt-1 border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-400"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={formValues.autoCleanupEnabled || false}
                                onChange={(e) => setFormValues({...formValues, autoCleanupEnabled: e.target.checked})}
                                className="w-4 h-4 rounded border-gray-300"
                            />
                            <label className="text-sm text-slate-700">التنظيف التلقائي</label>
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={formValues.autoRemoveStaleRunning || false}
                                onChange={(e) => setFormValues({...formValues, autoRemoveStaleRunning: e.target.checked})}
                                className="w-4 h-4 rounded border-gray-300"
                            />
                            <label className="text-sm text-slate-700">إزالة المهام العالقة</label>
                        </div>
                    </div>
                )}

                {modalType === "temp-cleanup" && (
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-slate-700">الحد الأقصى لعمر الملف (دقائق)</label>
                            <input
                                type="number"
                                value={formValues.tempFilesMaxAgeMinutes || ""}
                                onChange={(e) => setFormValues({...formValues, tempFilesMaxAgeMinutes: Number(e.target.value)})}
                                className="w-full mt-1 border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-400"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={formValues.tempCleanupEnabled || false}
                                onChange={(e) => setFormValues({...formValues, tempCleanupEnabled: e.target.checked})}
                                className="w-4 h-4 rounded border-gray-300"
                            />
                            <label className="text-sm text-slate-700">تفعيل التنظيف المؤقت</label>
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={formValues.autoDeleteTempFiles || false}
                                onChange={(e) => setFormValues({...formValues, autoDeleteTempFiles: e.target.checked})}
                                className="w-4 h-4 rounded border-gray-300"
                            />
                            <label className="text-sm text-slate-700">الحذف التلقائي</label>
                        </div>
                    </div>
                )}

   {modalType === "files-backup" && (
    <div className="space-y-4 ">
        {/* Job Control */}
        <div className="border-b border-gray-100 pb-3">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">التحكم بالمهام</h3>
            <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        checked={formValues.isDailyBackupJobEnabled || false}
                        onChange={(e) => setFormValues({...formValues, isDailyBackupJobEnabled: e.target.checked})}
                        className="w-4 h-4 rounded border-gray-300"
                    />
                    <label className="text-sm text-slate-700">مهمة يومية</label>
                </div>
                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        checked={formValues.isMonthlyBackupJobEnabled || false}
                        onChange={(e) => setFormValues({...formValues, isMonthlyBackupJobEnabled: e.target.checked})}
                        className="w-4 h-4 rounded border-gray-300"
                    />
                    <label className="text-sm text-slate-700">مهمة شهرية</label>
                </div>
                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        checked={formValues.isAnnualBackupJobEnabled || false}
                        onChange={(e) => setFormValues({...formValues, isAnnualBackupJobEnabled: e.target.checked})}
                        className="w-4 h-4 rounded border-gray-300"
                    />
                    <label className="text-sm text-slate-700">مهمة سنوية</label>
                </div>
                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        checked={formValues.isCleanupJobEnabled || false}
                        onChange={(e) => setFormValues({...formValues, isCleanupJobEnabled: e.target.checked})}
                        className="w-4 h-4 rounded border-gray-300"
                    />
                    <label className="text-sm text-slate-700">مهمة تنظيف</label>
                </div>
            </div>
        </div>

        {/* Enable/Disable Backup Types */}
        <div className="border-b border-gray-100 pb-3">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">أنواع النسخ الاحتياطي</h3>
            <div className="grid grid-cols-3 gap-2">
                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        checked={formValues.dailyBackupEnabled || false}
                        onChange={(e) => setFormValues({...formValues, dailyBackupEnabled: e.target.checked})}
                        className="w-4 h-4 rounded border-gray-300"
                    />
                    <label className="text-sm text-slate-700">يومي</label>
                </div>
                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        checked={formValues.monthlyBackupEnabled || false}
                        onChange={(e) => setFormValues({...formValues, monthlyBackupEnabled: e.target.checked})}
                        className="w-4 h-4 rounded border-gray-300"
                    />
                    <label className="text-sm text-slate-700">شهري</label>
                </div>
                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        checked={formValues.annualBackupEnabled || false}
                        onChange={(e) => setFormValues({...formValues, annualBackupEnabled: e.target.checked})}
                        className="w-4 h-4 rounded border-gray-300"
                    />
                    <label className="text-sm text-slate-700">سنوي</label>
                </div>
            </div>
        </div>

        {/* Retention Policies */}
        <div className="border-b border-gray-100 pb-3">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">سياسات الاحتفاظ</h3>
            <div className="grid grid-cols-3 gap-3">
                <div>
                    <label className="text-xs text-slate-500">الاحتفاظ اليومي (أيام)</label>
                    <input
                        type="number"
                        value={formValues.dailyRetentionDays || 7}
                        onChange={(e) => setFormValues({...formValues, dailyRetentionDays: Number(e.target.value)})}
                        className="w-full mt-0.5 border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-blue-400"
                        min={1}
                        max={365}
                    />
                </div>
                <div>
                    <label className="text-xs text-slate-500">الاحتفاظ الشهري (أشهر)</label>
                    <input
                        type="number"
                        value={formValues.monthlyRetentionMonths || 12}
                        onChange={(e) => setFormValues({...formValues, monthlyRetentionMonths: Number(e.target.value)})}
                        className="w-full mt-0.5 border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-blue-400"
                        min={1}
                        max={120}
                    />
                </div>
                <div>
                    <label className="text-xs text-slate-500">الاحتفاظ السنوي (سنوات)</label>
                    <input
                        type="number"
                        value={formValues.annualRetentionYears || 5}
                        onChange={(e) => setFormValues({...formValues, annualRetentionYears: Number(e.target.value)})}
                        className="w-full mt-0.5 border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-blue-400"
                        min={1}
                        max={100}
                    />
                </div>
            </div>
        </div>

        {/* CRON Schedules - بدون أي ذكر لـ CRON */}
<div>
    <h3 className="text-sm font-semibold text-slate-700 mb-2">جدولة المهام</h3>
    <div className="space-y-4">
        <CronEditor
            value={formValues.dailyBackupCron || "0 2 * * *"}
            onChange={(cron) => setFormValues({...formValues, dailyBackupCron: cron})}
            label="النسخ اليومي"
            description="اختر وقت النسخ الاحتياطي اليومي"
            frequency="daily"
        />
        
        <div className="border-t border-gray-100 pt-3">
            <CronEditor
                value={formValues.monthlyBackupCron || "0 3 1 * *"}
                onChange={(cron) => setFormValues({...formValues, monthlyBackupCron: cron})}
                label="النسخ الشهري"
                description="اختر وقت النسخ الاحتياطي الشهري"
                frequency="monthly"
            />
        </div>

        <div className="border-t border-gray-100 pt-3">
            <CronEditor
                value={formValues.annualBackupCron || "0 4 1 1 *"}
                onChange={(cron) => setFormValues({...formValues, annualBackupCron: cron})}
                label="النسخ السنوي"
                description="اختر وقت النسخ الاحتياطي السنوي"
                frequency="yearly"
            />
        </div>

        <div className="border-t border-gray-100 pt-3">
            <CronEditor
                value={formValues.cleanupCron || "0 5 * * 0"}
                onChange={(cron) => setFormValues({...formValues, cleanupCron: cron})}
                label="التنظيف"
                description="اختر وقت تنظيف النسخ الاحتياطية"
                frequency="weekly"
            />
        </div>
    </div>
</div>
    </div>
)}
               {modalType === "database-backup" && (
    <div className="space-y-4">
        <div className="flex items-center gap-3">
            <input
                type="checkbox"
                checked={formValues.dbBackupEnabled || false}
                onChange={(e) => setFormValues({...formValues, dbBackupEnabled: e.target.checked})}
                className="w-4 h-4 rounded border-gray-300"
            />
            <label className="text-sm text-slate-700">تفعيل النسخ الاحتياطي لقاعدة البيانات</label>
        </div>

        <div>
            <label className="text-sm font-medium text-slate-700">تكرار النسخ الاحتياطي</label>
            <select
                value={formValues.dbBackupFrequency || 1}
                onChange={(e) => setFormValues({...formValues, dbBackupFrequency: Number(e.target.value)})}
                className="w-full mt-1 border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-400"
            >
                <option value={1}>يومي</option>
                <option value={2}>أسبوعي</option>
                <option value={3}>شهري</option>
            </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
            <div>
                <label className="text-sm font-medium text-slate-700">الساعة</label>
                <select
                    value={formValues.dbBackupScheduledHour || 2}
                    onChange={(e) => setFormValues({...formValues, dbBackupScheduledHour: Number(e.target.value)})}
                    className="w-full mt-1 border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-400"
                >
                    {Array.from({length: 24}, (_, i) => i).map(hour => (
                        <option key={hour} value={hour}>{hour.toString().padStart(2, '0')}</option>
                    ))}
                </select>
            </div>
            <div>
                <label className="text-sm font-medium text-slate-700">الدقيقة</label>
                <select
                    value={formValues.dbBackupScheduledMinute || 0}
                    onChange={(e) => setFormValues({...formValues, dbBackupScheduledMinute: Number(e.target.value)})}
                    className="w-full mt-1 border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-400"
                >
                    {Array.from({length: 60}, (_, i) => i).map(minute => (
                        <option key={minute} value={minute}>{minute.toString().padStart(2, '0')}</option>
                    ))}
                </select>
            </div>
        </div>

        {/* يوم أسبوعي - يظهر فقط عند اختيار أسبوعي */}
        {formValues.dbBackupFrequency === 2 && (
            <div>
                <label className="text-sm font-medium text-slate-700">اليوم الأسبوعي</label>
                <select
                    value={formValues.dbBackupWeeklyDay || 0}
                    onChange={(e) => setFormValues({...formValues, dbBackupWeeklyDay: Number(e.target.value)})}
                    className="w-full mt-1 border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-400"
                >
                    <option value={0}>الأحد</option>
                    <option value={1}>الإثنين</option>
                    <option value={2}>الثلاثاء</option>
                    <option value={3}>الأربعاء</option>
                    <option value={4}>الخميس</option>
                    <option value={5}>الجمعة</option>
                    <option value={6}>السبت</option>
                </select>
            </div>
        )}

        {/* يوم شهري - يظهر فقط عند اختيار شهري */}
        {formValues.dbBackupFrequency === 3 && (
            <div>
                <label className="text-sm font-medium text-slate-700">اليوم الشهري</label>
                <select
                    value={formValues.dbBackupMonthlyDay || 1}
                    onChange={(e) => setFormValues({...formValues, dbBackupMonthlyDay: Number(e.target.value)})}
                    className="w-full mt-1 border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-400"
                >
                    {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                        <option key={day} value={day}>{day}</option>
                    ))}
                </select>
            </div>
        )}

        <div>
            <label className="text-sm font-medium text-slate-700">الاحتفاظ بالنسخ</label>
            <input
                type="number"
                value={formValues.dbBackupMaxRetention || 10}
                onChange={(e) => setFormValues({...formValues, dbBackupMaxRetention: Number(e.target.value)})}
                className="w-full mt-1 border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-400"
                min={1}
            />
            <p className="text-[10px] text-slate-400 mt-0.5">الحد الأقصى لعدد النسخ المحتفظ بها (على الأقل 1)</p>
        </div>

        <div className="flex items-center gap-3">
            <input
                type="checkbox"
                checked={formValues.dbBackupCompress || false}
                onChange={(e) => setFormValues({...formValues, dbBackupCompress: e.target.checked})}
                className="w-4 h-4 rounded border-gray-300"
            />
            <label className="text-sm text-slate-700">ضغط النسخ</label>
        </div>
    </div>
)}

                {modalType === "email-incoming" && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={formValues.enableIncomingEmail || false}
                                onChange={(e) => setFormValues({...formValues, enableIncomingEmail: e.target.checked})}
                                className="w-4 h-4 rounded border-gray-300"
                            />
                            <label className="text-sm text-slate-700">تفعيل البريد الوارد</label>
                        </div>
                        <div className="border-t border-gray-100 pt-4 space-y-3">
                            <div>
                                <label className="text-sm font-medium text-slate-700">خادم البريد</label>
                                <input
                                    type="text"
                                    value={formValues.incomingEmailServer || ""}
                                    onChange={(e) => setFormValues({...formValues, incomingEmailServer: e.target.value})}
                                    className="w-full mt-1 border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-400"
                                    placeholder="mail.example.com"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-sm font-medium text-slate-700">المنفذ</label>
                                    <input
                                        type="number"
                                        value={formValues.incomingEmailPort || ""}
                                        onChange={(e) => setFormValues({...formValues, incomingEmailPort: Number(e.target.value)})}
                                        className="w-full mt-1 border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-400"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700">اسم المستخدم</label>
                                    <input
                                        type="text"
                                        value={formValues.incomingEmailUsername || ""}
                                        onChange={(e) => setFormValues({...formValues, incomingEmailUsername: e.target.value})}
                                        className="w-full mt-1 border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-400"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">كلمة المرور</label>
                                <input
                                    type="password"
                                    value={formValues.incomingEmailPassword || ""}
                                    onChange={(e) => setFormValues({...formValues, incomingEmailPassword: e.target.value})}
                                    className="w-full mt-1 border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-400"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={formValues.incomingEmailUseSsl || false}
                                        onChange={(e) => setFormValues({...formValues, incomingEmailUseSsl: e.target.checked})}
                                        className="w-4 h-4 rounded border-gray-300"
                                    />
                                    <label className="text-sm text-slate-700">SSL</label>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-sm font-medium text-slate-700">فترة الفحص (دقائق)</label>
                                    <input
                                        type="number"
                                        value={formValues.incomingEmailCheckIntervalMinutes || ""}
                                        onChange={(e) => setFormValues({...formValues, incomingEmailCheckIntervalMinutes: Number(e.target.value)})}
                                        className="w-full mt-1 border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-400"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700">الحد الأقصى للدفعة</label>
                                    <input
                                        type="number"
                                        value={formValues.incomingEmailMaxPerBatch || ""}
                                        onChange={(e) => setFormValues({...formValues, incomingEmailMaxPerBatch: Number(e.target.value)})}
                                        className="w-full mt-1 border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-400"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">النطاقات المسموحة</label>
                                <input
                                    type="text"
                                    value={formValues.incomingEmailAllowedDomains || ""}
                                    onChange={(e) => setFormValues({...formValues, incomingEmailAllowedDomains: e.target.value})}
                                    className="w-full mt-1 border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-400"
                                    placeholder="@gmail.com,@university.edu"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">أيام الجلب</label>
                                <input
                                    type="number"
                                    value={formValues.incomingEmailFetchDays || ""}
                                    onChange={(e) => setFormValues({...formValues, incomingEmailFetchDays: Number(e.target.value)})}
                                    className="w-full mt-1 border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-400"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {modalType === "email-outgoing" && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={formValues.enableOutgoingEmail || false}
                                onChange={(e) => setFormValues({...formValues, enableOutgoingEmail: e.target.checked})}
                                className="w-4 h-4 rounded border-gray-300"
                            />
                            <label className="text-sm text-slate-700">تفعيل البريد الصادر</label>
                        </div>
                        <div className="border-t border-gray-100 pt-4 space-y-3">
                            <div>
                                <label className="text-sm font-medium text-slate-700">خادم البريد</label>
                                <input
                                    type="text"
                                    value={formValues.outgoingEmailServer || ""}
                                    onChange={(e) => setFormValues({...formValues, outgoingEmailServer: e.target.value})}
                                    className="w-full mt-1 border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-400"
                                    placeholder="smtp.example.com"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-sm font-medium text-slate-700">المنفذ</label>
                                    <input
                                        type="number"
                                        value={formValues.outgoingEmailPort || ""}
                                        onChange={(e) => setFormValues({...formValues, outgoingEmailPort: Number(e.target.value)})}
                                        className="w-full mt-1 border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-400"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700">اسم المستخدم</label>
                                    <input
                                        type="text"
                                        value={formValues.outgoingEmailUsername || ""}
                                        onChange={(e) => setFormValues({...formValues, outgoingEmailUsername: e.target.value})}
                                        className="w-full mt-1 border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-400"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">كلمة المرور</label>
                                <input
                                    type="password"
                                    value={formValues.outgoingEmailPassword || ""}
                                    onChange={(e) => setFormValues({...formValues, outgoingEmailPassword: e.target.value})}
                                    className="w-full mt-1 border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-400"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={formValues.outgoingEmailUseSsl || false}
                                    onChange={(e) => setFormValues({...formValues, outgoingEmailUseSsl: e.target.checked})}
                                    className="w-4 h-4 rounded border-gray-300"
                                />
                                <label className="text-sm text-slate-700">SSL</label>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">البريد المرسل</label>
                                <input
                                    type="email"
                                    value={formValues.outgoingEmailFrom || ""}
                                    onChange={(e) => setFormValues({...formValues, outgoingEmailFrom: e.target.value})}
                                    className="w-full mt-1 border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-400"
                                    placeholder="noreply@domain.com"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">اسم المرسل</label>
                                <input
                                    type="text"
                                    value={formValues.outgoingEmailFromName || ""}
                                    onChange={(e) => setFormValues({...formValues, outgoingEmailFromName: e.target.value})}
                                    className="w-full mt-1 border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-400"
                                    placeholder="نظام المراسلات"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-sm font-medium text-slate-700">عدد محاولات إعادة الإرسال</label>
                                    <input
                                        type="number"
                                        value={formValues.outgoingEmailMaxRetryCount || ""}
                                        onChange={(e) => setFormValues({...formValues, outgoingEmailMaxRetryCount: Number(e.target.value)})}
                                        className="w-full mt-1 border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-400"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700">فترة إعادة المحاولة (دقائق)</label>
                                    <input
                                        type="number"
                                        value={formValues.outgoingEmailRetryIntervalMinutes || ""}
                                        onChange={(e) => setFormValues({...formValues, outgoingEmailRetryIntervalMinutes: Number(e.target.value)})}
                                        className="w-full mt-1 border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-400"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={formValues.outgoingEmailNotifyOnDelivery || false}
                                    onChange={(e) => setFormValues({...formValues, outgoingEmailNotifyOnDelivery: e.target.checked})}
                                    className="w-4 h-4 rounded border-gray-300"
                                />
                                <label className="text-sm text-slate-700">إشعار عند التسليم</label>
                            </div>
                        </div>
                    </div>
                )}
            </SettingsModal>
        </div>
    );
}