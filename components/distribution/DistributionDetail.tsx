/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */

// components/distribution/DistributionDetail.tsx

"use client";

import { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faCalendar,
  faUsers,
  faEye,
  faPaperclip,
  faXmark,
  faChevronLeft,
  faChevronRight,
  faFile,
  faStar,
  faSpinner,
  faCircleCheck,
  faTriangleExclamation,
  faBrain,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DistributionResponseByIdDto } from "@/types/api/distribution.types";

// ============================================================
// Types
// ============================================================

interface DistributionDetailProps {
  item: DistributionResponseByIdDto;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
  currentIndex?: number;
  totalCount?: number;
}

/**
 * ✅ النموذج الجديد - التنبؤ بالقراءة
 */
interface ReadPrediction {
  willRead: boolean;
  readProbability: number;
  ignoreProbability: number;
  threshold_used: number;
}

/**
 * ✅ النموذج الجديد - التنبؤ بوقت القراءة
 */
interface ReadTimePrediction {
  predictedReadTimeMinutes: number;
  predictedReadTimeHours: number;
  formatted: string;
}

interface PredictionState {
  readPrediction: ReadPrediction | null;
  timePrediction: ReadTimePrediction | null;
  loading: boolean;
  error: string | null;
}

interface ApiErrorResponse {
  detail?: string | unknown;
  message?: string | unknown;
}

// ============================================================
// Prediction API configuration
// ============================================================

const PREDICTION_API_URL =
  process.env.NEXT_PUBLIC_PREDICTION_API_URL ||
  "http://127.0.0.1:8000";

// ✅ Endpoints الجديدة
const READ_ENDPOINT = "/predict_read";
const READ_TIME_ENDPOINT = "/predict_read_time";

// ============================================================
// Helpers
// ============================================================

const formatDate = (
  date: string | null | undefined
): string => {
  if (!date) return "-";

  try {
    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "-";
    }

    return parsed.toLocaleString("ar-EG", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  } catch {
    return "-";
  }
};

const formatDateShort = (
  date?: string | null
): string => {
  if (!date) return "";

  try {
    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "";
    }

    return parsed.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  } catch {
    return "";
  }
};

/**
 * Converts any date-like value into an ISO string
 * suitable for FastAPI.
 */
const toApiDate = (value: unknown): string => {
  if (!value) return "";

  try {
    const date = new Date(String(value));

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toISOString();
  } catch {
    return "";
  }
};

/**
 * Safely converts unknown API responses into something
 * React can render without producing [object Object].
 */
const formatPredictionResponse = (
  response: unknown
): string => {
  if (response === null || response === undefined) {
    return "لا توجد نتيجة";
  }

  if (typeof response === "string") {
    return response;
  }

  if (
    typeof response === "number" ||
    typeof response === "boolean" ||
    typeof response === "bigint"
  ) {
    return String(response);
  }

  try {
    return JSON.stringify(response, null, 2);
  } catch {
    return "تعذر عرض نتيجة التنبؤ";
  }
};

/**
 * Converts the HTML correspondence content into plain text
 * and returns its character length.
 */
const getContentLength = (
  content: string | null | undefined
): number => {
  if (!content) return 0;

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(
      content,
      "text/html"
    );

    return doc.body.textContent?.trim().length || 0;
  } catch {
    return content.replace(/<[^>]*>/g, "").trim().length;
  }
};

/**
 * Calculates attachment statistics from the actual
 * distribution attachments.
 */
const getAttachmentStats = (
  attachments: DistributionResponseByIdDto["attachments"]
) => {
  if (!attachments || attachments.length === 0) {
    return {
      attachmentCount: 0,
      totalAttachmentSize: 0,
    };
  }

  return {
    attachmentCount: attachments.length,
    totalAttachmentSize: attachments.reduce(
      (total, attachment) =>
        total + Number(attachment.fileSize || 0),
      0
    ),
  };
};

const getStatusBadge = (status: string) => {
  const statusMap: Record<
    string,
    { label: string; color: string }
  > = {
    Pending: {
      label: "قيد الانتظار",
      color:
        "bg-yellow-100 text-yellow-700 border-yellow-300",
    },
    Read: {
      label: "مقروء",
      color:
        "bg-emerald-100 text-emerald-700 border-emerald-300",
    },
    Ignored: {
      label: "متجاهل",
      color:
        "bg-gray-100 text-gray-600 border-gray-300",
    },
    Rejected: {
      label: "مرفوض",
      color:
        "bg-rose-100 text-rose-700 border-rose-300",
    },
    Revoked: {
      label: "ملغي",
      color:
        "bg-red-100 text-red-700 border-red-300",
    },
    PendingApproval: {
      label: "بانتظار الموافقة",
      color:
        "bg-purple-100 text-purple-700 border-purple-300",
    },
  };

  const s =
    statusMap[status] || {
      label: status,
      color:
        "bg-gray-100 text-gray-600 border-gray-300",
    };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${s.color}`}
    >
      {s.label}
    </span>
  );
};

const getMainTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    Incoming: "وارد",
    Outgoing: "صادر",
    Internal: "داخلي",
  };

  return labels[type] || type;
};

const getFileIcon = (mimeType: string | null) => {
  if (!mimeType) return faFile;

  if (mimeType.includes("pdf")) return faFile;

  if (
    mimeType.includes("word") ||
    mimeType.includes("document")
  ) {
    return faFile;
  }

  if (
    mimeType.includes("excel") ||
    mimeType.includes("spreadsheet")
  ) {
    return faFile;
  }

  if (mimeType.includes("image")) return faFile;

  if (
    mimeType.includes("zip") ||
    mimeType.includes("archive")
  ) {
    return faFile;
  }

  return faFile;
};

// ============================================================
// ✅ Build payloads for new models
// ============================================================

/**
 * Builds the payload for /predict_read and /predict_read_time
 */
const buildPredictionPayload = (item: DistributionResponseByIdDto) => {
  const attachmentStats = getAttachmentStats(
    item.attachments
  );

  return {
    distributedDate: toApiDate(item.distributedDate),
    approvedAt: toApiDate(item.approvedAt),
    receiverId: Number(item.receiverId ?? 0),
    departmentId: Number((item as any).departmentId ?? 0),
    mainType: String(item.mainType ?? "Incoming"),
    isAutoDistributed: Boolean((item as any).isAutoDistributed),
    isFromHead: Boolean((item as any).isFromHead),
    isProfessional: Boolean(item.isProfessional),
    attachmentCount: attachmentStats.attachmentCount,
    totalAttachmentSize: attachmentStats.totalAttachmentSize,
    contentLength: getContentLength(item.correspondenceContent),
  };
};

// ============================================================
// Main Component
// ============================================================

export function DistributionDetail({
  item,
  onClose,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  currentIndex,
  totalCount,
}: DistributionDetailProps) {
  const [prediction, setPrediction] =
    useState<PredictionState>({
      readPrediction: null,
      timePrediction: null,
      loading: false,
      error: null,
    });

  // ==========================================================
  // ✅ إعادة ضبط التنبؤ عند تغيير الـ item (التوزيعة)
  // ==========================================================

  useEffect(() => {
    // مسح نتائج التنبؤ السابقة عند تغيير العنصر
    setPrediction({
      readPrediction: null,
      timePrediction: null,
      loading: false,
      error: null,
    });
  }, [item.id]); // ✅ يتغير كلما تغيرت التوزيعة

  // ==========================================================
  // ✅ Run prediction using new models
  // ==========================================================

  const handlePrediction = async (): Promise<void> => {
    if (prediction.loading) return;

    setPrediction({
      readPrediction: null,
      timePrediction: null,
      loading: true,
      error: null,
    });

    try {
      const payload = buildPredictionPayload(item);

      // ------------------------------------------------------
      // 1. التنبؤ بالقراءة (/predict_read)
      // ------------------------------------------------------

      const readResponse = await axios.post(
        `${PREDICTION_API_URL}${READ_ENDPOINT}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const readData = readResponse.data?.data;

      if (readData) {
        setPrediction((prev) => ({
          ...prev,
          readPrediction: readData,
        }));
        toast.success("تم التنبؤ بالقراءة بنجاح!");
      }

      // ------------------------------------------------------
      // 2. التنبؤ بوقت القراءة (/predict_read_time)
      // ------------------------------------------------------

      const timeResponse = await axios.post(
        `${PREDICTION_API_URL}${READ_TIME_ENDPOINT}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const timeData = timeResponse.data?.data;

      if (timeData) {
        setPrediction((prev) => ({
          ...prev,
          timePrediction: timeData,
          loading: false,
        }));
        toast.success("تم التنبؤ بوقت القراءة بنجاح!");
      }
    } catch (error: unknown) {
      const axiosError =
        error as AxiosError<ApiErrorResponse>;

      const responseData =
        axiosError.response?.data;

      let errorMessage =
        "حدث خطأ أثناء تنفيذ التنبؤ";

      if (typeof responseData === "string") {
        errorMessage = responseData;
      } else if (
        responseData &&
        typeof responseData === "object"
      ) {
        if (responseData.detail) {
          errorMessage =
            typeof responseData.detail === "string"
              ? responseData.detail
              : JSON.stringify(
                responseData.detail
              );
        } else if (responseData.message) {
          errorMessage = String(
            responseData.message
          );
        }
      } else if (
        axiosError.message
      ) {
        errorMessage = axiosError.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setPrediction((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));

      toast.error(errorMessage);
    }
  };

  // ==========================================================
  // Render
  // ==========================================================

  return (
    <div className="flex h-full flex-col bg-card">
      {/* =====================================================
          Header
      ====================================================== */}

      <div className="shrink-0 flex items-center justify-between border-b border-border px-4 py-2">
        <div className="flex items-center gap-1 flex-wrap">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="md:hidden"
          >
            <FontAwesomeIcon
              icon={faXmark}
              className="h-4 w-4"
            />
          </Button>

          <div className="mr-2">
            {getStatusBadge(item.status)}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {totalCount !== undefined && (
            <p className="text-sm text-muted-foreground">
              {currentIndex !== undefined
                ? currentIndex + 1
                : "?"}{" "}
              / {totalCount}
            </p>
          )}

          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onPrevious}
              disabled={!hasPrevious}
            >
              <FontAwesomeIcon
                icon={faChevronRight}
                className="h-4 w-4"
              />
            </Button>

            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onNext}
              disabled={!hasNext}
            >
              <FontAwesomeIcon
                icon={faChevronLeft}
                className="h-4 w-4"
              />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="hidden md:flex"
          >
            <FontAwesomeIcon
              icon={faXmark}
              className="h-4 w-4"
            />
          </Button>
        </div>
      </div>

      {/* =====================================================
          Sender / Basic Information
      ====================================================== */}

      <div className="shrink-0 border-b border-border p-4">
        <div className="flex flex-wrap justify-between gap-4">
          <div className="flex gap-3">
            <Avatar className="size-10">
              <AvatarFallback className="bg-primary/10 text-primary">
                {item.fullName?.charAt(0) || "م"}
              </AvatarFallback>
            </Avatar>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-semibold text-foreground">
                  {item.fullName ||
                    "مستخدم غير معروف"}
                </h2>

                {item.mainType && (
                  <Badge variant="outline">
                    {getMainTypeLabel(
                      item.mainType
                    )}
                  </Badge>
                )}

                {item.isProfessional && (
                  <Badge variant="professional">
                    مهني
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-0.5">
                <span>
                  رقم المراسلة:{" "}
                  {item.correspondenceNumber || "—"}
                </span>

                <span>•</span>

                <span className="flex items-center gap-1">
                  <FontAwesomeIcon
                    icon={faUser}
                    className="h-3 w-3"
                  />
                  {item.distributorName ||
                    "غير معروف"}
                </span>

                <span>•</span>

                <span className="flex items-center gap-1">
                  <FontAwesomeIcon
                    icon={faCalendar}
                    className="h-3 w-3"
                  />
                  {formatDateShort(
                    item.distributedDate
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <FontAwesomeIcon
                icon={faUsers}
                className="h-3 w-3"
              />

              <span>
                {item.receiverId
                  ? "مستلم واحد"
                  : "—"}
              </span>
            </div>

            {/* =================================================
                ✅ Prediction Button (New Models)
            ================================================== */}

            <motion.button
              type="button"
              onClick={handlePrediction}
              disabled={prediction.loading}
              whileHover={
                !prediction.loading
                  ? { scale: 1.03 }
                  : undefined
              }
              whileTap={
                !prediction.loading
                  ? { scale: 0.97 }
                  : undefined
              }
              className={`flex items-center gap-2 rounded-3xl px-4 py-2 transition-all ${
                prediction.loading
                  ? "cursor-not-allowed bg-indigo-50 text-indigo-600"
                  : "cursor-pointer bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
              }`}
            >
              {prediction.loading ? (
                <FontAwesomeIcon
                  icon={faSpinner}
                  spin
                  className="h-3 w-3"
                />
              ) : (
                <FontAwesomeIcon
                  icon={faBrain}
                  className="h-3 w-3"
                />
              )}

              <span>
                {prediction.loading
                  ? "جاري التنبؤ..."
                  : "التنبؤ بالقراءة"}
              </span>
            </motion.button>

            {item.isRead && (
              <div className="flex items-center gap-1 text-emerald-600">
                <FontAwesomeIcon
                  icon={faEye}
                  className="h-3 w-3"
                />
                <span>مقروء</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =====================================================
          Title
      ====================================================== */}

      <div className="shrink-0 border-b border-border px-4 py-3">
        <h1 className="text-lg font-bold text-foreground">
          {item.correspondenceTitle ||
            "بدون عنوان"}
        </h1>
      </div>

      {/* =====================================================
          Scroll Area
      ====================================================== */}

      <div className="flex-1 overflow-y-auto hide-scrollbar">
        {/* ===================================================
            ✅ Prediction Results (New Models)
        ==================================================== */}

        <AnimatePresence mode="wait">
          {(prediction.readPrediction !== null ||
            prediction.timePrediction !== null ||
            prediction.error) && (
              <motion.div
                key="prediction-results"
                initial={{
                  opacity: 0,
                  height: 0,
                }}
                animate={{
                  opacity: 1,
                  height: "auto",
                }}
                exit={{
                  opacity: 0,
                  height: 0,
                }}
                transition={{
                  duration: 0.2,
                }}
                className="border-b border-border p-4"
              >
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100">
                    <FontAwesomeIcon
                      icon={faBrain}
                      className="h-4 w-4 text-indigo-600"
                    />
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground">
                      نتائج التنبؤ
                    </h3>

                    <p className="text-xs text-muted-foreground">
                      التنبؤ بالقراءة ووقتها
                    </p>
                  </div>
                </div>

                {/* =================================================
                  Error
                ================================================== */}

                {prediction.error && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: -5,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    className="mb-3 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700"
                  >
                    <FontAwesomeIcon
                      icon={faTriangleExclamation}
                      className="mt-0.5 h-4 w-4 shrink-0"
                    />

                    <div className="min-w-0">
                      <p className="text-sm font-semibold">
                        حدث خطأ
                      </p>

                      <p className="mt-1 break-words text-xs">
                        {prediction.error}
                      </p>
                    </div>
                  </motion.div>
                )}

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {/* =================================================
                    ✅ Read Prediction
                ================================================== */}

                  {prediction.readPrediction !== null && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        x: -10,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      transition={{
                        duration: 0.2,
                      }}
                      className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm"
                    >
                      <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                            <FontAwesomeIcon
                              icon={faBrain}
                              className="h-3 w-3"
                            />
                          </div>

                          <span className="font-semibold text-foreground">
                            التنبؤ بالقراءة
                          </span>
                        </div>

                        <FontAwesomeIcon
                          icon={faCircleCheck}
                          className="h-4 w-4 text-emerald-500"
                        />
                      </div>

                      <div className="p-4">
                        {/* ✅ نتيجة القراءة */}
                        <div
                          className={`mb-3 rounded-xl p-3 ${
                            prediction.readPrediction.willRead
                              ? "bg-emerald-50"
                              : "bg-red-50"
                          }`}
                        >
                          <p className="mb-1 text-[11px] text-muted-foreground">
                            النتيجة
                          </p>

                          <p
                            className={`text-base font-bold ${
                              prediction.readPrediction.willRead
                                ? "text-emerald-700"
                                : "text-red-700"
                            }`}
                          >
                            {prediction.readPrediction.willRead
                              ? "✅ سيقرأ"
                              : "❌ سيتجاهل"}
                          </p>
                        </div>

                        <div>
                          <p className="mb-2 text-xs font-medium text-muted-foreground">
                            تفاصيل التنبؤ
                          </p>

                          <pre
                            className="max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-xl bg-muted/40 p-3 text-xs leading-5 text-foreground"
                            dir="rtl"
                          >
                            <span className="font-semibold">
                              احتمال القراءة:
                            </span>{" "}
                            {(
                              prediction.readPrediction
                                .readProbability * 100
                            ).toFixed(1)}
                            %

                            {"\n"}

                            <span className="font-semibold">
                              احتمال التجاهل:
                            </span>{" "}
                            {(
                              prediction.readPrediction
                                .ignoreProbability * 100
                            ).toFixed(1)}
                            %

                            {"\n"}

                            <span className="font-semibold">
                              العتبة المستخدمة:
                            </span>{" "}
                            {prediction.readPrediction
                              .threshold_used}
                          </pre>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* =================================================
                    ✅ Read Time Prediction
                ================================================== */}

                  {prediction.timePrediction !== null && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        x: 10,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      transition={{
                        duration: 0.2,
                      }}
                      className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm"
                    >
                      <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-700">
                            <FontAwesomeIcon
                              icon={faClock}
                              className="h-3 w-3"
                            />
                          </div>

                          <span className="font-semibold text-foreground">
                            وقت القراءة
                          </span>
                        </div>

                        <FontAwesomeIcon
                          icon={faCircleCheck}
                          className="h-4 w-4 text-emerald-500"
                        />
                      </div>

                      <div className="p-4">
                        {/* ✅ نتيجة وقت القراءة */}
                        <div className="mb-3 rounded-xl bg-purple-50 p-3">
                          <p className="mb-1 text-[11px] text-purple-600">
                            الوقت المتوقع
                          </p>

                          <p className="text-base font-bold text-purple-700">
                            {prediction.timePrediction.formatted}
                          </p>
                        </div>

                        <div>
                          <p className="mb-2 text-xs font-medium text-muted-foreground">
                            تفاصيل التنبؤ
                          </p>

                          <pre
                            className="max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-xl bg-muted/40 p-3 text-xs leading-5 text-foreground"
                            dir="rtl"
                          >
                            <span className="font-semibold">
                              الدقائق:
                            </span>{" "}
                            {prediction.timePrediction
                              .predictedReadTimeMinutes.toFixed(
                                0
                              )}

                            {"\n"}

                            <span className="font-semibold">
                              الساعات:
                            </span>{" "}
                            {prediction.timePrediction
                              .predictedReadTimeHours.toFixed(
                                1
                              )}
                          </pre>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
        </AnimatePresence>

        {/* ===================================================
            Additional Information
        ==================================================== */}

        <div className="border-b border-border p-4">
          <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
            {item.documentType && (
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">
                  نوع الوثيقة:
                </span>

                <span className="text-muted-foreground">
                  {item.documentType}
                </span>
              </div>
            )}

            {item.senderEntity && (
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">
                  الجهة المرسلة:
                </span>

                <span className="text-muted-foreground">
                  {item.senderEntity}
                </span>
              </div>
            )}

            {item.senderReference && (
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">
                  مرجع المرسل:
                </span>

                <span className="text-muted-foreground">
                  {item.senderReference}
                </span>
              </div>
            )}

            {item.notes && (
              <div className="flex items-center gap-2 col-span-2">
                <span className="font-medium text-foreground">
                  📝 ملاحظات:
                </span>

                <span className="text-muted-foreground">
                  {item.notes}
                </span>
              </div>
            )}

            {item.rejectionReason && (
              <div className="flex items-center gap-2 col-span-2 text-rose-600">
                <span className="font-medium">
                  ❌ سبب الرفض:
                </span>

                <span>
                  {item.rejectionReason}
                </span>
              </div>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {item.issuedDate && (
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">
                  📅 تاريخ الإصدار:
                </span>

                <span>
                  {formatDate(item.issuedDate)}
                </span>
              </div>
            )}

            {item.readAt && (
              <div className="flex items-center gap-2 text-emerald-600">
                <span className="font-medium">
                  👁️ قرأ في:
                </span>

                <span>
                  {formatDate(item.readAt)}
                </span>
              </div>
            )}

            {item.approvedAt && (
              <div className="flex items-center gap-2 text-emerald-600">
                <span className="font-medium">
                  ✅ تاريخ الموافقة:
                </span>

                <span>
                  {formatDate(item.approvedAt)}
                </span>
              </div>
            )}

            {item.rejectedAt && (
              <div className="flex items-center gap-2 text-rose-600">
                <span className="font-medium">
                  ❌ تاريخ الرفض:
                </span>

                <span>
                  {formatDate(item.rejectedAt)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ===================================================
            Content
        ==================================================== */}

        <div className="border-b border-border p-4">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <div
              dangerouslySetInnerHTML={{
                __html:
                  item.correspondenceContent ||
                  "<p class='text-muted-foreground'>لا يوجد محتوى</p>",
              }}
            />
          </div>
        </div>

        {/* ===================================================
            Attachments
        ==================================================== */}

        {item.attachments &&
          item.attachments.length > 0 && (
            <div className="p-4">
              <div className="mb-3 flex items-center gap-2">
                <FontAwesomeIcon
                  icon={faPaperclip}
                  className="h-4 w-4 text-emerald-500"
                />

                <h3 className="font-semibold text-foreground">
                  المرفقات
                </h3>

                <Badge variant="secondary">
                  {item.attachments.length}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-2">
                {item.attachments.map((att) => {
                  const Icon = getFileIcon(
                    att.mimeType
                  );

                  const isInline =
                    att.isInline || false;

                  return (
                    <div
                      key={att.id}
                      className="group flex w-full max-w-[280px] items-center justify-between rounded-lg border border-border bg-muted/30 p-2 transition-all hover:shadow-md"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-100">
                          <FontAwesomeIcon
                            icon={Icon}
                            className="h-4 w-4 text-blue-600"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p
                            className="truncate text-sm font-medium text-foreground"
                            title={att.fileName}
                          >
                            {att.fileName}
                          </p>

                          <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                            <span>
                              {Math.round(
                                Number(
                                  att.fileSize || 0
                                ) / 1024
                              )}{" "}
                              KB
                            </span>

                            {att.isPrimary && (
                              <Badge
                                variant="outline"
                                className="h-4 px-1.5 py-0 text-[8px]"
                              >
                                أساسي
                              </Badge>
                            )}

                            {isInline && (
                              <Badge
                                variant="outline"
                                className="h-4 border-blue-200 bg-blue-50 px-1.5 py-0 text-[8px] text-blue-600"
                              >
                                مضمن
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
      </div>
    </div>
  );
}