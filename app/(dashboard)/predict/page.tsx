/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBrain,
  faClock,
  faEnvelope,
  faPaperclip,
  faFileLines,
  faCalendar,
  faBolt,
  faRotateRight,
  faCheckCircle,
  faXmarkCircle,
  faSpinner,
  faRobot,
  faCircleInfo,
  faGear,
  faArrowRotateRight,
  faUser,
  faBuilding,
} from "@fortawesome/free-solid-svg-icons";

// ============================================================
// ✅ استيراد الـ Hooks
// ============================================================

import { useDelegation } from "@/hooks/useDelegation";
import { useActiveDepartments } from "@/hooks/useDepartments";

// ============================================================
// API
// ============================================================

const API_URL = "http://127.0.0.1:8000";

// ============================================================
// Types
// ============================================================

interface MailForm {
  distributedDate: string;
  approvedAt: string;
  receiverId: number;
  departmentId: number;
  mainType: string;
  isAutoDistributed: boolean;
  isFromHead: boolean;
  isProfessional: boolean;
  attachmentCount: number;
  totalAttachmentSize: number;
  contentLength: number;
}

interface ReadPrediction {
  willRead: boolean;
  readProbability: number;
  ignoreProbability: number;
  threshold_used: number;
}

interface ReadTimePrediction {
  predictedReadTimeMinutes: number;
  predictedReadTimeHours: number;
  formatted: string;
}

// ============================================================
// Default Form
// ============================================================

const initialForm: MailForm = {
  distributedDate: new Date().toISOString().slice(0, 16),
  approvedAt: new Date().toISOString().slice(0, 16),
  receiverId: 0,
  departmentId: 0,
  mainType: "Incoming",
  isAutoDistributed: false,
  isFromHead: true,
  isProfessional: true,
  attachmentCount: 3,
  totalAttachmentSize: 500000,
  contentLength: 1500,
};

// ============================================================
// Component
// ============================================================

export default function PredictionPage() {
  const [form, setForm] = useState<MailForm>(initialForm);

  const [readLoading, setReadLoading] = useState(false);
  const [timeLoading, setTimeLoading] = useState(false);
  const [thresholdLoading, setThresholdLoading] = useState(false);
  const [trainingLoading, setTrainingLoading] = useState(false);

  const [readPrediction, setReadPrediction] = useState<ReadPrediction | null>(null);
  const [timePrediction, setTimePrediction] = useState<ReadTimePrediction | null>(null);
  const [threshold, setThreshold] = useState<number>(0.35);
  const [trainingStatus, setTrainingStatus] = useState<any>(null);
  const [showSettings, setShowSettings] = useState(false);

  // ============================================================
  // ✅ استخدام الـ Hooks لجلب البيانات
  // ============================================================

  // ✅ استخدام useDelegation للحصول على المستخدمين النشطين
  const delegation = useDelegation();
  const departmentsQuery = useActiveDepartments();

  // ✅ استخراج البيانات من delegation
  const users = delegation.allUsers || [];
  const isLoadingUsers = delegation.isLoading;
  const usersError = false; // يمكنك إضافة error handling حسب الحاجة

  // ✅ استخراج البيانات من departments
  const departments = departmentsQuery?.data || [];
  const isLoadingDepartments = departmentsQuery?.isLoading || false;
  const departmentsError = departmentsQuery?.isError || false;

  // ============================================================
  // Update Field
  // ============================================================

  const updateField = <K extends keyof MailForm>(
    field: K,
    value: MailForm[K]
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // ============================================================
  // Convert local datetime to API datetime
  // ============================================================

  const toApiDate = (value: string) => {
    if (!value) return value;
    return value.length === 16 ? `${value}:00Z` : value;
  };

  // ============================================================
  // Build API Data
  // ============================================================

  const buildPayload = () => ({
    distributedDate: toApiDate(form.distributedDate),
    approvedAt: toApiDate(form.approvedAt),
    receiverId: Number(form.receiverId),
    departmentId: Number(form.departmentId) || 0,
    mainType: form.mainType,
    isAutoDistributed: Boolean(form.isAutoDistributed),
    isFromHead: Boolean(form.isFromHead),
    isProfessional: Boolean(form.isProfessional),
    attachmentCount: Number(form.attachmentCount),
    totalAttachmentSize: Number(form.totalAttachmentSize),
    contentLength: Number(form.contentLength),
  });

  // ============================================================
  // API Calls
  // ============================================================

  // ✅ 1. التنبؤ بالقراءة
  const predictRead = async () => {
    if (!form.receiverId || !form.departmentId) {
      toast.error("يرجى اختيار المستخدم والقسم");
      return;
    }

    setReadLoading(true);
    setReadPrediction(null);

    try {
      const response = await axios.post(
        `${API_URL}/predict_read`,
        buildPayload()
      );

      if (response.data?.data) {
        setReadPrediction(response.data.data);
        toast.success("تم التنبؤ بالقراءة بنجاح!");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "فشل التنبؤ بالقراءة");
    } finally {
      setReadLoading(false);
    }
  };

  // ✅ 2. التنبؤ بوقت القراءة
  const predictReadTime = async () => {
    if (!form.receiverId || !form.departmentId) {
      toast.error("يرجى اختيار المستخدم والقسم");
      return;
    }

    setTimeLoading(true);
    setTimePrediction(null);

    try {
      const response = await axios.post(
        `${API_URL}/predict_read_time`,
        buildPayload()
      );

      if (response.data?.data) {
        setTimePrediction(response.data.data);
        toast.success("تم التنبؤ بوقت القراءة بنجاح!");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "فشل التنبؤ بوقت القراءة");
    } finally {
      setTimeLoading(false);
    }
  };

  // ✅ 3. تشغيل الكل
  const predictBoth = async () => {
    await Promise.all([predictRead(), predictReadTime()]);
  };

  // ✅ 4. الحصول على العتبة الحالية
  const getThreshold = async () => {
    try {
      const response = await axios.get(`${API_URL}/get_threshold`);
      if (response.data) {
        setThreshold(response.data.current_threshold);
        toast.success(`العتبة الحالية: ${response.data.current_threshold}`);
      }
    } catch (error: any) {
      toast.error("فشل جلب العتبة");
    }
  };

  // ✅ 5. تحديث العتبة
  const updateThreshold = async (newThreshold: number) => {
    setThresholdLoading(true);
    try {
      const response = await axios.post(`${API_URL}/set_threshold`, {
        threshold: newThreshold,
        reason: "تحديث من لوحة التحكم",
      });

      if (response.data) {
        setThreshold(newThreshold);
        toast.success(`تم تحديث العتبة إلى ${newThreshold}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "فشل تحديث العتبة");
    } finally {
      setThresholdLoading(false);
    }
  };

  // ✅ 6. تشغيل التدريب التلقائي
  const runTraining = async () => {
    setTrainingLoading(true);
    try {
      const response = await axios.post(`${API_URL}/retrain`);
      if (response.data) {
        toast.success("بدأ التدريب في الخلفية!");
        checkTrainingStatus();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "فشل بدء التدريب");
    } finally {
      setTrainingLoading(false);
    }
  };

  // ✅ 7. التحقق من حالة التدريب
  const checkTrainingStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/training_status`);
      if (response.data) {
        setTrainingStatus(response.data.training_status);
        const status = response.data.training_status;
        if (status.status === "completed") {
          toast.success("اكتمل التدريب بنجاح!");
        } else if (status.status === "failed") {
          toast.error("فشل التدريب!");
        }
      }
    } catch (error: any) {
      toast.error("فشل جلب حالة التدريب");
    }
  };

  // ============================================================
  // Reset
  // ============================================================

  const resetForm = () => {
    setForm(initialForm);
    setReadPrediction(null);
    setTimePrediction(null);
    toast.success("تمت إعادة ضبط النموذج.");
  };

  // ============================================================
  // Format Time
  // ============================================================

  const formatTime = (minutes: number) => {
    const hours = minutes / 60;
    if (hours < 1) {
      return `${Math.round(minutes)} دقيقة`;
    }
    if (hours < 24) {
      return `${hours.toFixed(1)} ساعة`;
    }
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    if (remainingHours < 0.1) {
      return `${days} يوم`;
    }
    return `${days}ي ${remainingHours.toFixed(1)}س`;
  };

  // ============================================================
  // جلب البيانات من الـ Queries
  // ============================================================

  const isLoading = isLoadingUsers || isLoadingDepartments;
  const isError = usersError || departmentsError;

  // ============================================================
  // Loading / Error States
  // ============================================================

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-indigo-500" />
          <p className="mt-4 text-slate-500">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <p className="text-red-500">فشل تحميل البيانات. يرجى المحاولة مرة أخرى.</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // Render
  // ============================================================

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-wrap items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/20">
              <FontAwesomeIcon icon={faBrain} className="text-3xl text-indigo-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">متنبئ القراءة</h1>
              <p className="text-sm text-slate-500">توقع قراءة البريد الإلكتروني ووقتها</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
            >
              <FontAwesomeIcon icon={faGear} className="ml-2" />
              الإعدادات
            </button>
            <button
              onClick={runTraining}
              disabled={trainingLoading}
              className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-sm text-indigo-600 transition hover:bg-indigo-500/20 disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faArrowRotateRight} spin={trainingLoading} className="ml-2" />
              تدريب
            </button>
          </div>
        </motion.header>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-lg"
            >
              <div className="flex flex-wrap items-end gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    العتبة الحالية: {threshold}
                  </label>
                  <input
                    type="range"
                    min={0.1}
                    max={0.9}
                    step={0.05}
                    value={threshold}
                    onChange={(e) => setThreshold(parseFloat(e.target.value))}
                    className="w-48 accent-indigo-500"
                  />
                </div>
                <button
                  onClick={() => updateThreshold(threshold)}
                  disabled={thresholdLoading}
                  className="rounded-xl bg-indigo-500 px-4 py-2 text-sm text-white transition hover:bg-indigo-600 disabled:opacity-50"
                >
                  {thresholdLoading ? "جاري التحديث..." : "تحديث العتبة"}
                </button>
                <button
                  onClick={getThreshold}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  جلب العتبة الحالية
                </button>
                <button
                  onClick={checkTrainingStatus}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  حالة التدريب
                </button>
              </div>
              {trainingStatus && (
                <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
                  <p>الحالة: {trainingStatus.status}</p>
                  <p>الرسالة: {trainingStatus.message}</p>
                  <p>التقدم: {trainingStatus.progress}%</p>
                  {trainingStatus.last_training && (
                    <p>آخر تدريب: {new Date(trainingStatus.last_training.timestamp).toLocaleString()}</p>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          {/* Form */}
          <motion.section
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">بيانات البريد</h2>
                <p className="text-xs text-slate-500">أدخل خصائص البريد للتنبؤ</p>
              </div>
              <button
                onClick={resetForm}
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-600 transition hover:bg-slate-50"
              >
                <FontAwesomeIcon icon={faRotateRight} className="ml-2" />
                إعادة ضبط
              </button>
            </div>

            {/* Dates */}
            <div className="grid gap-4 md:grid-cols-2">
              <DateInput
                label="تاريخ التوزيع"
                value={form.distributedDate}
                onChange={(v) => updateField("distributedDate", v)}
              />
              <DateInput
                label="تاريخ الموافقة"
                value={form.approvedAt}
                onChange={(v) => updateField("approvedAt", v)}
              />
            </div>

            {/* Users & Departments - Select */}
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <SelectInput
                label="المستخدم"
                icon={faUser}
                value={form.receiverId}
                options={users.map((u: any) => ({
                  value: u.id,
                  label: u.fullName || u.email || `مستخدم ${u.id}`,
                }))}
                onChange={(v) => updateField("receiverId", Number(v))}
                placeholder="اختر المستخدم..."
              />
              <SelectInput
                label="القسم"
                icon={faBuilding}
                value={form.departmentId}
                options={departments.map((d: any) => ({
                  value: d.id,
                  label: d.name || `قسم ${d.id}`,
                }))}
                onChange={(v) => updateField("departmentId", Number(v))}
                placeholder="اختر القسم..."
              />
            </div>

            {/* Main Type */}
            <div className="mt-4">
              <SelectInput
                label="النوع الرئيسي"
                icon={faFileLines}
                value={form.mainType}
                options={[
                  { value: "Incoming", label: "وارد" },
                  { value: "Outgoing", label: "صادر" },
                  { value: "Internal", label: "داخلي" },
                ]}
                onChange={(v) => updateField("mainType", v)}
                placeholder="اختر النوع..."
              />
            </div>

            {/* Attachments */}
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <NumberInput
                label="عدد المرفقات"
                icon={faPaperclip}
                value={form.attachmentCount}
                onChange={(v) => updateField("attachmentCount", v)}
              />
              <NumberInput
                label="حجم المرفقات"
                icon={faPaperclip}
                value={form.totalAttachmentSize}
                onChange={(v) => updateField("totalAttachmentSize", v)}
              />
              <NumberInput
                label="طول المحتوى"
                icon={faFileLines}
                value={form.contentLength}
                onChange={(v) => updateField("contentLength", v)}
              />
            </div>

            {/* Toggles */}
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Toggle
                label="توزيع تلقائي"
                checked={form.isAutoDistributed}
                onChange={(v) => updateField("isAutoDistributed", v)}
              />
              <Toggle
                label="من رئيس"
                checked={form.isFromHead}
                onChange={(v) => updateField("isFromHead", v)}
              />
              <Toggle
                label="مهني"
                checked={form.isProfessional}
                onChange={(v) => updateField("isProfessional", v)}
              />
            </div>

            {/* Buttons */}
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <PredictionButton
                icon={faBrain}
                title="توقع القراءة"
                description="سيقرأ أم سيتجاهل؟"
                loading={readLoading}
                onClick={predictRead}
              />
              <PredictionButton
                icon={faClock}
                title="توقع الوقت"
                description="وقت القراءة المتوقع"
                loading={timeLoading}
                onClick={predictReadTime}
              />
              <button
                onClick={predictBoth}
                disabled={readLoading || timeLoading}
                className="flex min-h-[70px] items-center justify-center gap-3 rounded-2xl bg-indigo-500 px-4 text-white transition hover:bg-indigo-600 disabled:opacity-50"
              >
                <FontAwesomeIcon icon={faBolt} className="text-white" />
                <div className="text-right">
                  <p className="text-sm font-bold">تشغيل الكل</p>
                  <p className="text-xs text-indigo-200">توقعات متكاملة</p>
                </div>
              </button>
            </div>
          </motion.section>

          {/* Results */}
          <div className="space-y-6">
            {/* Read Prediction */}
            <ResultCard
              icon={faBrain}
              title="توقع القراءة"
              subtitle="هل سيقرأ البريد؟"
              loading={readLoading}
              iconColor="text-indigo-500"
            >
              {readPrediction ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`rounded-2xl border p-5 ${
                    readPrediction.willRead
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-red-200 bg-red-50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <FontAwesomeIcon
                      icon={readPrediction.willRead ? faCheckCircle : faXmarkCircle}
                      className={`text-3xl ${
                        readPrediction.willRead ? "text-emerald-500" : "text-red-500"
                      }`}
                    />
                    <div>
                      <p className={`text-xl font-bold ${
                        readPrediction.willRead ? "text-emerald-700" : "text-red-700"
                      }`}>
                        {readPrediction.willRead ? "✅ سيقرأ" : "❌ سيتجاهل"}
                      </p>
                      <p className="text-sm text-slate-600">
                        احتمال القراءة: {(readPrediction.readProbability * 100).toFixed(1)}%
                      </p>
                      <p className="text-sm text-slate-600">
                        احتمال التجاهل: {(readPrediction.ignoreProbability * 100).toFixed(1)}%
                      </p>
                      <p className="text-xs text-slate-400">
                        العتبة: {readPrediction.threshold_used}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <EmptyState icon={faRobot} text="شغّل التوقع لرؤية النتيجة" />
              )}
            </ResultCard>

            {/* Time Prediction */}
            <ResultCard
              icon={faClock}
              title="توقع وقت القراءة"
              subtitle="الوقت المتوقع بالدقائق"
              loading={timeLoading}
              iconColor="text-indigo-500"
            >
              {timePrediction ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">الوقت المتوقع</p>
                      <p className="text-3xl font-bold text-indigo-600">
                        {timePrediction.formatted}
                      </p>
                    </div>
                    <FontAwesomeIcon icon={faClock} className="text-3xl text-indigo-400" />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-white p-2 text-center shadow-sm">
                      <p className="text-xs text-slate-500">دقائق</p>
                      <p className="font-semibold text-slate-800">
                        {timePrediction.predictedReadTimeMinutes.toFixed(0)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-white p-2 text-center shadow-sm">
                      <p className="text-xs text-slate-500">ساعات</p>
                      <p className="font-semibold text-slate-800">
                        {timePrediction.predictedReadTimeHours.toFixed(1)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <EmptyState icon={faClock} text="شغّل التوقع لرؤية النتيجة" />
              )}
            </ResultCard>

            {/* Info */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
              <FontAwesomeIcon icon={faCircleInfo} className="ml-2 text-indigo-500" />
              <span>النظام يتوقع القراءة باستخدام العتبة {threshold}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// ============================================================
// Components
// ============================================================

function DateInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      <input
        type="datetime-local"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
      />
    </div>
  );
}

function NumberInput({ label, icon, value, onChange }: { label: string; icon: any; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      <div className="relative">
        <FontAwesomeIcon icon={icon} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-10 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />
      </div>
    </div>
  );
}

function SelectInput({ 
  label, 
  icon, 
  value, 
  options, 
  onChange, 
  placeholder 
}: { 
  label: string; 
  icon?: any; 
  value: any; 
  options: { value: any; label: string }[]; 
  onChange: (v: any) => void; 
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      <div className="relative">
        {icon && (
          <FontAwesomeIcon icon={icon} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
        )}
        <select
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-10 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        >
          <option value="" disabled>{placeholder || "اختر..."}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
    >
      <span>{label}</span>
      <div className={`relative h-6 w-11 rounded-full transition ${checked ? "bg-indigo-500" : "bg-slate-300"}`}>
        <div className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${checked ? "left-6" : "left-1"}`} />
      </div>
    </button>
  );
}

function PredictionButton({ icon, title, description, loading, onClick }: any) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="flex min-h-[70px] items-center gap-3 rounded-2xl border border-indigo-200 bg-indigo-50 px-4 text-right text-slate-700 transition hover:bg-indigo-100 disabled:opacity-50"
    >
      <FontAwesomeIcon icon={loading ? faSpinner : icon} spin={loading} className="text-indigo-500" />
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
    </button>
  );
}

function ResultCard({ icon, title, subtitle, loading, children, iconColor }: any) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg">
      <div className="mb-4 flex items-center gap-3">
        <FontAwesomeIcon icon={icon} className={iconColor || "text-indigo-500"} />
        <div>
          <h3 className="font-semibold text-slate-800">{title}</h3>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>
      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <FontAwesomeIcon icon={faSpinner} spin className="text-2xl text-indigo-500" />
        </div>
      ) : (
        children
      )}
    </div>
  );
}

function EmptyState({ icon, text }: any) {
  return (
    <div className="flex h-32 flex-col items-center justify-center text-center">
      <FontAwesomeIcon icon={icon} className="mb-2 text-2xl text-slate-300" />
      <p className="text-sm text-slate-400">{text}</p>
    </div>
  );
}