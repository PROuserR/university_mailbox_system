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
  faBuilding,
  faUser,
  faFileLines,
  faCalendar,
  faBolt,
  faRotateRight,
  faCheckCircle,
  faXmarkCircle,
  faSpinner,
  faRobot,
  faCircleInfo,
} from "@fortawesome/free-solid-svg-icons";


// ============================================================
// API
// ============================================================

const API_URL = "http://127.0.0.1:8000";


// ============================================================
// Types
// ============================================================

interface MailForm {
  distributedDate: string;
  readAt: string;
  status: string;
  isRead: boolean;
  isAutoDistributed: boolean;
  receiverId: number;
  departmentId: number;
  mainType: string;
  documentType: string;
  senderEntity: string;
  isProfessional: boolean;
  isFromHead: boolean;
  attachmentCount: number;
  totalAttachmentSize: number;
  contentLength: number;
}

interface Stage2Prediction {
  predictedResponseTimeMinutes: number;
  predictedResponseTimeHours: number;
}


// ============================================================
// Default Form
// ============================================================

const initialForm: MailForm = {
  distributedDate: "2026-09-04T10:30",
  readAt: "2026-09-04T11:15",

  status: "Completed",

  isRead: true,
  isAutoDistributed: false,

  receiverId: 15,
  departmentId: 1,

  mainType: "Approval",
  documentType: "Request",

  senderEntity: "Finance Department",

  isProfessional: true,
  isFromHead: true,

  attachmentCount: 0,
  totalAttachmentSize: 0,
  contentLength: 200,
};


// ============================================================
// Component
// ============================================================

export default function PredictionPage() {
  const [form, setForm] = useState<MailForm>(initialForm);

  const [stage1Loading, setStage1Loading] = useState(false);
  const [stage2Loading, setStage2Loading] = useState(false);

  const [stage1Prediction, setStage1Prediction] =
    useState<boolean | null>(null);

  const [stage2Prediction, setStage2Prediction] =
    useState<Stage2Prediction | null>(null);


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
  // Build API Data
  // ============================================================

  const buildStage1Payload = () => {
    const formData = {
      distributedDate: form.distributedDate.toString(),
      status: form.status,
      isRead: Boolean(form.isRead),
      isAutoDistributed: Boolean(form.isAutoDistributed),

      receiverId: Number(form.receiverId),
      departmentId: Number(form.departmentId),

      mainType: form.mainType,
      documentType: form.documentType,
      senderEntity: form.senderEntity,

      isProfessional: Boolean(form.isProfessional),
      isFromHead: Boolean(form.isFromHead),

      attachmentCount: Number(form.attachmentCount),
      totalAttachmentSize: Number(form.totalAttachmentSize),
      contentLength: Number(form.contentLength),
    };
    return formData;
  };


  const buildStage2Payload = () => {
    return {
      distributedDate: toApiDate(form.distributedDate),
      readAt: toApiDate(form.readAt),

      status: String(form.status ?? ""),

      isRead: Boolean(form.isRead),
      isAutoDistributed: Boolean(form.isAutoDistributed),

      receiverId: Number(form.receiverId),
      departmentId: Number(form.departmentId),

      mainType: String(form.mainType ?? ""),
      documentType: String(form.documentType ?? ""),
      senderEntity: String(form.senderEntity ?? ""),

      isProfessional: Boolean(form.isProfessional),
      isFromHead: Boolean(form.isFromHead),

      attachmentCount: Number(form.attachmentCount),
      totalAttachmentSize: Number(form.totalAttachmentSize),
      contentLength: Number(form.contentLength),
    };
  };


  // ============================================================
  // Convert local datetime to API datetime
  // ============================================================

  const toApiDate = (value: string) => {
    if (!value) return value;

    return value.length === 16
      ? `${value}:00Z`
      : value;
  };


  // ============================================================
  // Stage 1
  // ============================================================

  const runStage1 = async () => {
    setStage1Loading(true);
    setStage1Prediction(null);

    try {
      const response = await axios.post(
        `${API_URL}/predict`,
        buildStage1Payload()
      );

      const rawPrediction =
        response.data?.prediction;

      const prediction =
        rawPrediction === 1 ||
        rawPrediction === true ||
        rawPrediction === "1" ||
        rawPrediction === "true";

      setStage1Prediction(prediction);

      toast.success("اكتمل توقع المرحلة 1.");
    } catch (error) {
      console.error("Stage 1 error:", error);

      toast.error(
        "فشل توقع المرحلة 1. تأكد من تشغيل FastAPI."
      );
    } finally {
      setStage1Loading(false);
    }
  };


  // ============================================================
  // Stage 2
  // ============================================================

  const runStage2 = async () => {
    setStage2Loading(true);
    setStage2Prediction(null);

    try {
      const response = await axios.post(
        `${API_URL}/predict_stage2`,
        buildStage2Payload()
      );

      const prediction =
        response.data?.prediction_stage2;

      setStage2Prediction(prediction);

      toast.success("اكتمل توقع المرحلة 2.");
    } catch (error) {
      console.error("Stage 2 error:", error);

      toast.error(
        "فشل توقع المرحلة 2. تأكد من تضمين readAt وتشغيل FastAPI."
      );
    } finally {
      setStage2Loading(false);
    }
  };


  // ============================================================
  // Both
  // ============================================================

  const runBoth = async () => {
    await Promise.all([
      runStage1(),
      runStage2(),
    ]);
  };


  // ============================================================
  // Reset
  // ============================================================

  const resetForm = () => {
    setForm(initialForm);
    setStage1Prediction(null);
    setStage2Prediction(null);

    toast.success("تمت إعادة ضبط النموذج.");
  };


  // ============================================================
  // Format Time
  // ============================================================

  const formatResponseTime = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)} دقيقة`;
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


  return (
    <main className="min-h-screen bg-slate-50 ">

      {/* ======================================================
          Background
      ======================================================= */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-indigo-600/20 blur-[140px]" />

        <div className="absolute -right-40 top-1/3 h-[500px] w-[500px] rounded-full bg-purple-600/15 blur-[140px]" />

        <div className="absolute bottom-[-200px] left-1/3 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[140px]" />

      </div>


      {/* ======================================================
          Container
      ======================================================= */}

      <div className="relative mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:py-12">


        {/* ====================================================
            Header
        ===================================================== */}

        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-4">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-400/20 bg-indigo-500/10 shadow-lg shadow-indigo-500/10">

                <FontAwesomeIcon
                  icon={faBrain}
                  className="text-2xl text-indigo-400"
                />

              </div>

              <div>

                <div className="mb-1 flex items-center gap-2">

                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">
                    ذكاء البريد الإلكتروني الاصطناعي
                  </span>

                </div>

                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  متنبئ بالرد على البريد الإلكتروني
                </h1>

              </div>

            </div>

          </div>


          <p className="mt-5 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
            حلّل المراسلات باستخدام مرحلتين من التعلم الآلي:
            توقّع ما إذا كان المستلم سيرد، وقدّر
            وقت الاستجابة المتوقع.
          </p>

        </motion.header>


        {/* ====================================================
            Content
        ===================================================== */}

        <div className="grid gap-7 lg:grid-cols-[1.15fr_0.85fr]">


          {/* ==================================================
              FORM
          =================================================== */}

          <motion.section
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-3xl border border-white/[0.08] bg-white/[0.035] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-7"
          >

            <div className="mb-7 flex items-center justify-between">

              <div>

                <div className="flex items-center gap-2">

                  <FontAwesomeIcon
                    icon={faEnvelope}
                    className="text-indigo-400"
                  />

                  <h2 className="text-lg font-semibold">
                    بيانات المراسلة
                  </h2>

                </div>

                <p className="mt-1 text-xs text-slate-500">
                  أدخل خصائص البريد المستخدمة بواسطة نماذج التعلم الآلي.
                </p>

              </div>


              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-white/10 px-3 py-2 text-xs text-slate-400 transition hover:bg-white/10 hover:text-white"
              >

                <FontAwesomeIcon
                  icon={faRotateRight}
                  className="mr-2"
                />

                Reset

              </button>

            </div>


            {/* Dates */}

            <div className="grid gap-4 md:grid-cols-2">

              <DateInput
                label="تاريخ التوزيع"
                value={form.distributedDate}
                onChange={(value) =>
                  updateField(
                    "distributedDate",
                    value
                  )
                }
              />

              <DateInput
                label="وقت القراءة"
                value={form.readAt}
                onChange={(value) =>
                  updateField(
                    "readAt",
                    value
                  )
                }
              />

            </div>


            {/* Main fields */}

            <div className="mt-5 grid gap-4 md:grid-cols-2">

              <SelectInput
                label="حالة"
                icon={faCircleInfo}
                value={form.status}
                options={[
                  "Completed",
                  "Pending",
                  "InProgress",
                  "Rejected",
                ]}
                onChange={(value) =>
                  updateField("status", value)
                }
              />

              <SelectInput
                label="النوع الرئيسي"
                icon={faFileLines}
                value={form.mainType}
                options={[
                  "Approval",
                  "Request",
                  "Information",
                  "Circular",
                ]}
                onChange={(value) =>
                  updateField("mainType", value)
                }
              />

              <SelectInput
                label="نوع المستند"
                icon={faFileLines}
                value={form.documentType}
                options={[
                  "Request",
                  "Letter",
                  "Report",
                  "Memo",
                ]}
                onChange={(value) =>
                  updateField("documentType", value)
                }
              />

              <TextInput
                label="جهة الإرسال"
                icon={faBuilding}
                value={form.senderEntity}
                onChange={(value) =>
                  updateField(
                    "senderEntity",
                    value
                  )
                }
              />

            </div>


            {/* IDs */}

            <div className="mt-5 grid gap-4 md:grid-cols-2">

              <NumberInput
                label="معرّف المستلم"
                icon={faUser}
                value={form.receiverId}
                onChange={(value) =>
                  updateField(
                    "receiverId",
                    value
                  )
                }
              />

              <NumberInput
                label="معرّف القسم"
                icon={faBuilding}
                value={form.departmentId}
                onChange={(value) =>
                  updateField(
                    "departmentId",
                    value
                  )
                }
              />

            </div>


            {/* Attachments */}

            <div className="mt-5 grid gap-4 md:grid-cols-3">

              <NumberInput
                label="المرفقات"
                icon={faPaperclip}
                value={form.attachmentCount}
                onChange={(value) =>
                  updateField(
                    "attachmentCount",
                    value
                  )
                }
              />

              <NumberInput
                label="حجم المرفقات"
                icon={faPaperclip}
                value={form.totalAttachmentSize}
                onChange={(value) =>
                  updateField(
                    "totalAttachmentSize",
                    value
                  )
                }
              />

              <NumberInput
                label="طول المحتوى"
                icon={faFileLines}
                value={form.contentLength}
                onChange={(value) =>
                  updateField(
                    "contentLength",
                    value
                  )
                }
              />

            </div>


            {/* Toggles */}

            <div className="mt-6 grid gap-3 sm:grid-cols-2">

              <Toggle
                label="تمت القراءة"
                checked={form.isRead}
                onChange={(value) =>
                  updateField(
                    "isRead",
                    value
                  )
                }
              />

              <Toggle
                label="موزّع تلقائيًا"
                checked={form.isAutoDistributed}
                onChange={(value) =>
                  updateField(
                    "isAutoDistributed",
                    value
                  )
                }
              />

              <Toggle
                label="مهني"
                checked={form.isProfessional}
                onChange={(value) =>
                  updateField(
                    "isProfessional",
                    value
                  )
                }
              />

              <Toggle
                label="من المدير"
                checked={form.isFromHead}
                onChange={(value) =>
                  updateField(
                    "isFromHead",
                    value
                  )
                }
              />

            </div>


            {/* =================================================
                Prediction Buttons
            ================================================== */}

            <div className="mt-7 grid gap-3 sm:grid-cols-3">

              <PredictionButton
                icon={faBrain}
                title="المرحلة 1"
                description="هل سيرد؟"
                loading={stage1Loading}
                onClick={runStage1}
              />

              <PredictionButton
                icon={faClock}
                title="المرحلة 2"
                description="وقت الاستجابة"
                loading={stage2Loading}
                onClick={runStage2}
              />

              <button
                type="button"
                onClick={runBoth}
                disabled={
                  stage1Loading ||
                  stage2Loading
                }
                className="group flex min-h-[74px] items-center justify-center gap-3 rounded-2xl bg-white px-4 text-left text-slate-900 transition hover:-translate-y-0.5 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">

                  <FontAwesomeIcon
                    icon={faBolt}
                    className="text-indigo-600"
                  />

                </div>

                <div>

                  <p className="text-sm font-bold">
                    تشغيل المرحلتين
                  </p>

                  <p className="text-xs text-slate-500">
                    تحليل كامل
                  </p>

                </div>

              </button>

            </div>

          </motion.section>


          {/* ==================================================
              RESULTS
          =================================================== */}

          <div className="space-y-6">


            {/* Stage 1 */}

            <ResultCard
              icon={faBrain}
              title="المرحلة 1"
              subtitle="احتمالية الرد"
              loading={stage1Loading}
            >

              <AnimatePresence mode="wait">

                {stage1Prediction !== null && !stage1Loading && (

                  <motion.div
                    key={String(stage1Prediction)}
                    initial={{
                      opacity: 0,
                      scale: 0.9,
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.9,
                    }}
                  >

                    <div
                      className={`rounded-2xl border p-5 ${stage1Prediction
                        ? "border-emerald-400/20 bg-emerald-400/[0.06]"
                        : "border-red-400/20 bg-red-400/[0.06]"
                        }`}
                    >

                      <div className="flex items-center gap-4">

                        <div
                          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${stage1Prediction
                            ? "bg-emerald-400/10"
                            : "bg-red-400/10"
                            }`}
                        >

                          <FontAwesomeIcon
                            icon={
                              stage1Prediction
                                ? faCheckCircle
                                : faXmarkCircle
                            }
                            className={`text-2xl ${stage1Prediction
                              ? "text-emerald-400"
                              : "text-red-400"
                              }`}
                          />

                        </div>

                        <div>

                          <p
                            className={`text-2xl font-bold ${stage1Prediction
                              ? "text-emerald-300"
                              : "text-red-300"
                              }`}
                          >
                            {stage1Prediction
                              ? "من المرجح أن يرد"
                              : "من غير المرجح أن يرد"}
                          </p>

                          <p className="mt-1 text-sm text-slate-400">
                            {stage1Prediction
                              ? "يتوقع النموذج أن هذا المستلم سيرد على الأرجح."
                              : "يتوقع النموذج أن هذا المستلم لن يرد على الأرجح."}
                          </p>

                        </div>

                      </div>

                    </div>

                  </motion.div>

                )}

              </AnimatePresence>


              {stage1Prediction === null &&
                !stage1Loading && (
                  <EmptyState
                    icon={faRobot}
                    text="شغّل المرحلة 1 لإنشاء توقع."
                  />
                )}

            </ResultCard>


            {/* Stage 2 */}

            <ResultCard
              icon={faClock}
              title="المرحلة 2"
              subtitle="وقت الاستجابة المقدّر"
              loading={stage2Loading}
            >

              <AnimatePresence mode="wait">

                {stage2Prediction &&
                  !stage2Loading && (

                    <motion.div
                      initial={{
                        opacity: 0,
                        y: 15,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                    >

                      <div className="rounded-2xl border border-indigo-400/20 bg-indigo-500/[0.06] p-5">

                        <div className="flex items-center justify-between gap-4">

                          <div>

                            <p className="text-sm">
                              الاستجابة المتوقعة
                            </p>

                            <p className="mt-1 text-4xl font-bold tracking-tight text-blue-400">
                              {formatResponseTime(
                                stage2Prediction.predictedResponseTimeHours
                              )}
                            </p>

                          </div>

                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10">

                            <FontAwesomeIcon
                              icon={faClock}
                              className="text-2xl text-indigo-400"
                            />

                          </div>

                        </div>


                        <div className="mt-5 grid grid-cols-2 gap-3">

                          <ResultStat
                            label="الدقائق"
                            value={stage2Prediction.predictedResponseTimeMinutes.toFixed(
                              2
                            )}
                          />

                          <ResultStat
                            label="الساعات"
                            value={stage2Prediction.predictedResponseTimeHours.toFixed(
                              2
                            )}
                          />

                        </div>

                      </div>

                    </motion.div>

                  )}

              </AnimatePresence>


              {!stage2Prediction &&
                !stage2Loading && (
                  <EmptyState
                    icon={faClock}
                    text="شغّل المرحلة 2 لتقدير وقت الاستجابة."
                  />
                )}

            </ResultCard>


            {/* Model information */}

            <motion.div
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5"
            >

              <div className="flex gap-3">

                <FontAwesomeIcon
                  icon={faCircleInfo}
                  className="mt-0.5 text-indigo-400"
                />

                <div>

                  <p className="text-sm font-medium">
                    خط أنابيب التنبؤ ذي المرحلتين
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    تتنبأ المرحلة 1 باحتمالية الرد. وتقدّر المرحلة 2
                    وقت الاستجابة باستخدام بيانات المراسلة
                    ووقت القراءة المسجّل.
                  </p>

                </div>

              </div>

            </motion.div>

          </div>

        </div>

      </div>

    </main>
  );
}


// ============================================================
// Date Input
// ============================================================

function DateInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>

      <label className="mb-2 block text-xs font-medium">
        {label}
      </label>

      <div className="relative">

        <FontAwesomeIcon
          icon={faCalendar}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-slate-500"
        />

        <input
          type="datetime-local"
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="w-full rounded-xl border border-white/10 bg-slate-200 px-4 py-3 pl-11 text-sm outline-none transition focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10"
        />

      </div>

    </div>
  );
}


// ============================================================
// Text Input
// ============================================================

function TextInput({
  label,
  icon,
  value,
  onChange,
}: {
  label: string;
  icon: any;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>

      <label className="mb-2 block text-xs font-medium">
        {label}
      </label>

      <div className="relative">

        <FontAwesomeIcon
          icon={icon}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-slate-500"
        />

        <input
          type="text"
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="w-full rounded-xl border border-white/10 bg-slate-200 px-4 py-3 pl-11 text-sm outline-none transition placeholder:text-slate-600 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10"
        />

      </div>

    </div>
  );
}


// ============================================================
// Number Input
// ============================================================

function NumberInput({
  label,
  icon,
  value,
  onChange,
}: {
  label: string;
  icon: any;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <TextInput
      label={label}
      icon={icon}
      value={String(value)}
      onChange={(value) =>
        onChange(Number(value))
      }
    />
  );
}


// ============================================================
// Select
// ============================================================

const optionLabels: Record<string, string> = {
  Completed: "مكتمل",
  Pending: "قيد الانتظار",
  InProgress: "قيد التنفيذ",
  Rejected: "مرفوض",
  Approval: "موافقة",
  Request: "طلب",
  Information: "معلومات",
  Circular: "تعميم",
  Letter: "خطاب",
  Report: "تقرير",
  Memo: "مذكرة",
};

function getOptionLabel(option: string) {
  return optionLabels[option] ?? option;
}

function SelectInput({
  label,
  icon,
  value,
  options,
  onChange,
}: {
  label: string;
  icon: any;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div>

      <label className="mb-2 block text-xs font-medium">
        {label}
      </label>

      <div className="relative">

        <FontAwesomeIcon
          icon={icon}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-slate-500"
        />

        <select
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="w-full appearance-none rounded-xl border bg-slate-200 px-4 py-3 pl-11 text-sm  outline-none transition focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10"
        >

          {options.map((option) => (
            <option
              key={option}
              value={option}
            >
              {getOptionLabel(option)}
            </option>
          ))}

        </select>

      </div>

    </div>
  );
}


// ============================================================
// Toggle
// ============================================================

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between rounded-xl border bg-slate-200 px-4 py-3 transition hover:bg-white/[0.05]"
    >

      <span className="text-sm">
        {label}
      </span>

      <div
        className={`relative h-6 w-11 rounded-full transition ${checked
          ? "bg-indigo-500"
          : "bg-slate-700"
          }`}
      >

        <div
          className={`absolute top-1 h-4 w-4 rounded-full bg-slate-200 shadow-sm transition ${checked
            ? "left-6"
            : "left-1"
            }`}
        />

      </div>

    </button>
  );
}


// ============================================================
// Prediction Button
// ============================================================

function PredictionButton({
  icon,
  title,
  description,
  loading,
  onClick,
}: {
  icon: any;
  title: string;
  description: string;
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="group flex min-h-[74px] items-center gap-3 rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.07] px-4 text-left transition hover:-translate-y-0.5 hover:border-indigo-400/30 hover:bg-indigo-500/[0.13] disabled:cursor-not-allowed disabled:opacity-50"
    >

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10">

        <FontAwesomeIcon
          icon={loading ? faSpinner : icon}
          spin={loading}
          className="text-indigo-400"
        />

      </div>

      <div>

        <p className="text-sm font-semibold">
          {title}
        </p>

        <p className="mt-0.5 text-xs text-slate-500">
          {description}
        </p>

      </div>

    </button>
  );
}


// ============================================================
// Result Card
// ============================================================

function ResultCard({
  icon,
  title,
  subtitle,
  loading,
  children,
}: {
  icon: any;
  title: string;
  subtitle: string;
  loading: boolean;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      layout
      className="rounded-3xl border border-white/[0.08] bg-white/[0.035] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl"
    >

      <div className="mb-6 flex items-center gap-3">

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10">

          <FontAwesomeIcon
            icon={icon}
            className="text-indigo-400"
          />

        </div>

        <div>

          <h2 className="font-semibold">
            {title}
          </h2>

          <p className="text-xs text-slate-500">
            {subtitle}
          </p>

        </div>

      </div>


      {loading ? (

        <div className="flex min-h-[150px] items-center justify-center">

          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear",
            }}
          >

            <FontAwesomeIcon
              icon={faSpinner}
              className="text-2xl text-indigo-400"
            />

          </motion.div>

        </div>

      ) : (
        children
      )}

    </motion.section>
  );
}


// ============================================================
// Empty State
// ============================================================

function EmptyState({
  icon,
  text,
}: {
  icon: any;
  text: string;
}) {
  return (
    <div className="flex min-h-[150px] flex-col items-center justify-center text-center">

      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.03]">

        <FontAwesomeIcon
          icon={icon}
          className="text-xl text-slate-600"
        />

      </div>

      <p className="text-sm text-slate-500">
        {text}
      </p>

    </div>
  );
}


// ============================================================
// Result Stat
// ============================================================

function ResultStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-black/20 p-3">

      <p className="text-[11px] uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-lg font-semibold text-white">
        {value}
      </p>

    </div>
  );
}
