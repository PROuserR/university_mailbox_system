/* eslint-disable @typescript-eslint/no-explicit-any */

// components/distribution/DistributionDetail.tsx

"use client";

import { useState } from "react";
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
 * Stage 1 prediction returned by FastAPI.
 *
 * Example:
 * {
 *   "willReply": true,
 *   "replyProbability": 0.87
 * }
 */
interface Stage1Prediction {
  willReply: boolean;
  replyProbability: number;
}

/**
 * Stage 2 prediction returned by FastAPI.
 *
 * Example:
 * {
 *   "predictedResponseTimeMinutes": 120,
 *   "predictedResponseTimeHours": 2
 * }
 */
interface Stage2Prediction {
  predictedResponseTimeMinutes: number;
  predictedResponseTimeHours: number;
}

interface PredictionState {
  stage1: Stage1Prediction | null;
  stage2: Stage2Prediction | null;
  loading: boolean;
  error: string | null;
}

interface Stage1ApiResponse {
  prediction: Stage1Prediction;
}

interface Stage2ApiResponse {
  prediction_stage2: Stage2Prediction;
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

const STAGE1_ENDPOINT = "/predict";

// Change this if your Stage 2 FastAPI route is different.
const STAGE2_ENDPOINT = "/predict_stage2";

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
 * Converts an unknown prediction response into a readable
 * one-line value when possible.
 */
const getPredictionSummary = (
  response: unknown
): string | null => {
  if (response === null || response === undefined) {
    return null;
  }

  if (
    typeof response === "string" ||
    typeof response === "number" ||
    typeof response === "boolean"
  ) {
    return String(response);
  }

  if (typeof response !== "object") {
    return String(response);
  }

  const obj = response as Record<string, unknown>;

  const possibleKeys = [
    "prediction",
    "predictedClass",
    "predicted_class",
    "class",
    "label",
    "result",
    "status",
    "value",
  ];

  for (const key of possibleKeys) {
    if (
      obj[key] !== undefined &&
      obj[key] !== null &&
      typeof obj[key] !== "object"
    ) {
      return String(obj[key]);
    }
  }

  return null;
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
    Completed: {
      label: "مكتمل",
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
    Approval: "موافقة",
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
      stage1: null,
      stage2: null,
      loading: false,
      error: null,
    });

  // ==========================================================
  // Build Stage 1 payload
  // ==========================================================

  const buildStage1Payload = () => {
    const attachmentStats = getAttachmentStats(
      item.attachments
    );

    const payload = {
      distributedDate: toApiDate(item.distributedDate),
      status: String(item.status ?? ""),
      isRead: Boolean(item.isRead),
      isAutoDistributed: Boolean(
        (item as any).isAutoDistributed
      ),
      receiverId: Number(item.receiverId ?? 0),
      departmentId: Number(
        (item as any).departmentId ?? 0
      ),
      mainType: String(item.mainType ?? ""),
      documentType: String(item.documentType ?? ""),
      senderEntity: String(item.senderEntity ?? ""),
      isProfessional: Boolean(item.isProfessional),
      isFromHead: Boolean(
        (item as any).isFromHead
      ),
      attachmentCount:
        attachmentStats.attachmentCount,
      totalAttachmentSize:
        attachmentStats.totalAttachmentSize,
      contentLength: getContentLength(
        item.correspondenceContent
      ),
    };

    return payload;
  };

  // ==========================================================
  // Build Stage 2 payload
  // ==========================================================

  const buildStage2Payload = () => {
    const attachmentStats = getAttachmentStats(
      item.attachments
    );

    const payload = {
      distributedDate: toApiDate(item.distributedDate),
      readAt: toApiDate(item.readAt),
      status: String(item.status ?? ""),
      isRead: Boolean(item.isRead),
      isAutoDistributed: Boolean(
        (item as any).isAutoDistributed
      ),
      receiverId: Number(item.receiverId ?? 0),
      departmentId: Number(
        (item as any).departmentId ?? 0
      ),
      mainType: String(item.mainType ?? ""),
      documentType: String(item.documentType ?? ""),
      senderEntity: String(item.senderEntity ?? ""),
      isProfessional: Boolean(item.isProfessional),
      isFromHead: Boolean(
        (item as any).isFromHead
      ),
      attachmentCount:
        attachmentStats.attachmentCount,
      totalAttachmentSize:
        attachmentStats.totalAttachmentSize,
      contentLength: getContentLength(
        item.correspondenceContent
      ),
    };

    return payload;
  };

  // ==========================================================
  // Validate payload
  // ==========================================================

  const validatePayload = (
    payload: Record<string, unknown>
  ): string | null => {
    const numericFields = [
      "receiverId",
      "departmentId",
      "attachmentCount",
      "totalAttachmentSize",
      "contentLength",
    ];

    for (const field of numericFields) {
      const value = payload[field];

      if (
        typeof value !== "number" ||
        Number.isNaN(value)
      ) {
        return `قيمة غير صالحة للحقل: ${field}`;
      }
    }

    return null;
  };

  // ==========================================================
  // Run prediction
  // ==========================================================

  const handlePrediction = async (): Promise<void> => {
    if (prediction.loading) return;

    setPrediction({
      stage1: null,
      stage2: null,
      loading: true,
      error: null,
    });

    try {
      // ------------------------------------------------------
      // Stage 1
      // ------------------------------------------------------

      const stage1Payload = buildStage1Payload();

      console.log(
        "Prediction Stage 1 Payload:",
        stage1Payload
      );

      const stage1Validation =
        validatePayload(stage1Payload);

      if (stage1Validation) {
        throw new Error(stage1Validation);
      }

      const stage1Response =
        await axios.post<Stage1ApiResponse>(
          `${PREDICTION_API_URL}${STAGE1_ENDPOINT}`,
          stage1Payload,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

      console.log(
        "Prediction Stage 1 Response:",
        stage1Response.data
      );

      setPrediction((previous) => ({
        ...previous,
        stage1:
          stage1Response.data.prediction,
      }));

      toast.success(
        "تم تنفيذ المرحلة الأولى بنجاح"
      );

      // ------------------------------------------------------
      // Stage 2
      // ------------------------------------------------------

      const stage2Payload = buildStage2Payload();

      console.log(
        "Prediction Stage 2 Payload:",
        stage2Payload
      );

      const stage2Validation =
        validatePayload(stage2Payload);

      if (stage2Validation) {
        throw new Error(stage2Validation);
      }

      const stage2Response =
        await axios.post<Stage2ApiResponse>(
          `${PREDICTION_API_URL}${STAGE2_ENDPOINT}`,
          stage2Payload,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

      console.log(
        "Prediction Stage 2 Response:",
        stage2Response.data
      );

      setPrediction((previous) => ({
        ...previous,
        stage2:
          stage2Response.data.prediction_stage2,
        loading: false,
      }));

      toast.success(
        "تم تنفيذ المرحلة الثانية بنجاح"
      );
    } catch (error: unknown) {
      console.error(
        "Prediction API Error:",
        error
      );

      const axiosError =
        error as AxiosError<ApiErrorResponse>;

      const responseData =
        axiosError.response?.data;

      console.error(
        "Prediction API Response:",
        responseData
      );

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

      setPrediction((previous) => ({
        ...previous,
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
                Prediction Button
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
              className={`flex items-center gap-2 rounded-3xl px-4 py-2 transition-all ${prediction.loading
                  ? "cursor-not-allowed bg-yellow-50 text-yellow-600"
                  : "cursor-pointer bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
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
                  icon={faStar}
                  className="h-3 w-3"
                />
              )}

              <span>
                {prediction.loading
                  ? "جاري التنبؤ..."
                  : "التنبؤ"}
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
            Prediction Results
        ==================================================== */}

        <AnimatePresence>
          {(prediction.stage1 !== null ||
            prediction.stage2 !== null ||
            prediction.error) && (
              <motion.div
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
                className="border-b border-border p-4"
              >
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100">
                    <FontAwesomeIcon
                      icon={faStar}
                      className="h-4 w-4 text-yellow-600"
                    />
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground">
                      نتائج التنبؤ
                    </h3>

                    <p className="text-xs text-muted-foreground">
                      نتائج مراحل نموذج التنبؤ
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
                    Stage 1
                ================================================== */}

                  {prediction.stage1 !== null && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        x: -10,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm"
                    >
                      <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                            1
                          </div>

                          <span className="font-semibold text-foreground">
                            المرحلة الأولى
                          </span>
                        </div>

                        <FontAwesomeIcon
                          icon={faCircleCheck}
                          className="h-4 w-4 text-emerald-500"
                        />
                      </div>

                      <div className="p-4">
                        {getPredictionSummary(
                          prediction.stage1
                        ) && (
                            <div className="mb-3 rounded-xl bg-blue-50 p-3">
                              <p className="mb-1 text-[11px] text-blue-600">
                                النتيجة
                              </p>

                              <p className="break-words text-base font-bold text-blue-800">
                                {getPredictionSummary(
                                  prediction.stage1
                                )}
                              </p>
                            </div>
                          )}

                        <div>
                          <p className="mb-2 text-xs font-medium text-muted-foreground">
                            تفاصيل التنبؤ
                          </p>

                          <pre
                            className="max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-xl bg-muted/40 p-3 text-xs leading-5 text-foreground"
                            dir="rtl"
                          >
                            <span className="font-semibold">
                              هل سيجيب:
                            </span>{" "}
                            {formatPredictionResponse(
                              prediction.stage1
                                .willReply
                            )}

                            {"\n"}

                            <span className="font-semibold">
                              احتمال الاستجابة:
                            </span>{" "}
                            {formatPredictionResponse(
                              prediction.stage1
                                .replyProbability
                            )}
                          </pre>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* =================================================
                    Stage 2
                ================================================== */}

                  {prediction.stage2 !== null && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        x: 10,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm"
                    >
                      <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-700">
                            2
                          </div>

                          <span className="font-semibold text-foreground">
                            المرحلة الثانية
                          </span>
                        </div>

                        <FontAwesomeIcon
                          icon={faCircleCheck}
                          className="h-4 w-4 text-emerald-500"
                        />
                      </div>

                      <div className="p-4">
                        {getPredictionSummary(
                          prediction.stage2
                        ) && (
                            <div className="mb-3 rounded-xl bg-purple-50 p-3">
                              <p className="mb-1 text-[11px] text-purple-600">
                                النتيجة
                              </p>

                              <p className="break-words text-base font-bold text-purple-800">
                                {getPredictionSummary(
                                  prediction.stage2
                                )}
                              </p>
                            </div>
                          )}

                        <div>
                          <p className="mb-2 text-xs font-medium text-muted-foreground">
                            تفاصيل التنبؤ
                          </p>

                          <pre
                            className="max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-xl bg-muted/40 p-3 text-xs leading-5 text-foreground"
                            dir="rtl"
                          >
                            <span className="font-semibold">
                              وقت الاستجابة المتوقع بالدقائق:
                            </span>{" "}
                            {formatPredictionResponse(
                              prediction.stage2
                                .predictedResponseTimeMinutes
                            )}

                            {"\n"}

                            <span className="font-semibold">
                              وقت الاستجابة المتوقع بالساعات:
                            </span>{" "}
                            {formatPredictionResponse(
                              prediction.stage2
                                .predictedResponseTimeHours
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