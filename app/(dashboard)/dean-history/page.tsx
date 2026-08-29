/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(dashboard)/dean-history/page.tsx

"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faTrash,
  faSearch,
  faClock,
  faHistory,
  faXmark,
  faSpinner,
  faCheckCircle,
  faTimes,
  faUserGraduate,
  faArrowLeft,
  faUniversity,
} from "@fortawesome/free-solid-svg-icons";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { UserRole } from "@/types/api/user";
import {
  useAllDeanHistory,
  useCurrentDean,
  useAssignNewDean,
  useTerminateCurrentDean,
  useTransferDean,
  useDeleteDeanHistory,
} from "@/hooks/useDeanHistory";
import { useActiveUsers } from "@/hooks/useUsers";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import toast from "react-hot-toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// ============================================================
// ===== Validation =====
// ============================================================

interface ValidationErrors {
  userId?: string;
  startedAt?: string;
  newDeanUserId?: string;
  transferDate?: string;
}

// ============================================================
// ===== Main Component =====
// ============================================================

export default function DeanHistoryPage() {
  const { isLoading: isAuthLoading, isAuthorized } = useAuthGuard({
    requiredRoles: [UserRole.ADMIN],
    redirectTo: "/auth/login",
    unauthorizedPath: "/unauthorized",
  });

  const {
    data: history = [],
    isLoading: loadingHistory,
    refetch: refetchHistory,
  } = useAllDeanHistory();
  const { data: currentDean, refetch: refetchCurrentDean } = useCurrentDean();
  const { data: users = [] } = useActiveUsers();

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"assign" | "transfer">("assign");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState({
    userId: false,
    startedAt: false,
    newDeanUserId: false,
    transferDate: false,
  });

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: "danger" | "warning" | "success";
    icon?: any;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    variant: "danger",
  });

  const [assignForm, setAssignForm] = useState({
    userId: null as number | null,
    startedAt: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const [transferForm, setTransferForm] = useState({
    newDeanUserId: null as number | null,
    transferDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  // ============================================================
  // ===== Helper: التحقق من أن المستخدم ليس Admin =====
  // ============================================================

  const isUserAdmin = (userId: number): boolean => {
    const user = users.find(u => u.id === userId);
    return user?.roles?.includes(UserRole.ADMIN) || false;
  };

  // ============================================================
  // ===== Modal Handlers =====
  // ============================================================

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setErrors({});
    setTouched({
      userId: false,
      startedAt: false,
      newDeanUserId: false,
      transferDate: false,
    });
  }, []);

  const openAssignModal = useCallback(() => {
    setModalType("assign");
    setAssignForm({
      userId: null,
      startedAt: new Date().toISOString().split("T")[0],
      notes: "",
    });
    setErrors({});
    setTouched({
      userId: false,
      startedAt: false,
      newDeanUserId: false,
      transferDate: false,
    });
    setModalOpen(true);
  }, []);

  const openTransferModal = useCallback(() => {
    setModalType("transfer");
    setTransferForm({
      newDeanUserId: null,
      transferDate: new Date().toISOString().split("T")[0],
      notes: "",
    });
    setErrors({});
    setTouched({
      userId: false,
      startedAt: false,
      newDeanUserId: false,
      transferDate: false,
    });
    setModalOpen(true);
  }, []);

  // ============================================================
  // ===== Mutations =====
  // ============================================================

  const assignMutation = useAssignNewDean(() => {
    closeModal();
    refetchHistory();
    refetchCurrentDean();
  });
  const terminateMutation = useTerminateCurrentDean(() => {
    refetchHistory();
    refetchCurrentDean();
  });
  const transferMutation = useTransferDean(() => {
    closeModal();
    refetchHistory();
    refetchCurrentDean();
  });
  const deleteMutation = useDeleteDeanHistory(() => refetchHistory());

  const isProcessing =
    assignMutation.isPending ||
    terminateMutation.isPending ||
    transferMutation.isPending ||
    deleteMutation.isPending;

  // ============================================================
  // ===== Validation Handlers (Assign) =====
  // ============================================================

  const validateAssignField = (field: keyof ValidationErrors, value: any): string => {
    if (field === "userId") {
      if (!value) return "يرجى اختيار المستخدم";
      if (isUserAdmin(value)) {
        return "لا يمكن تعيين Admin كعميد";
      }
      if (currentDean) {
        return "يوجد عميد حالياً. يجب إنهاء العميد الحالي أولاً";
      }
      return "";
    }
    if (field === "startedAt") {
      if (!value) return "تاريخ البدء مطلوب";
      const selectedDate = new Date(value);
      if (selectedDate > new Date()) return "تاريخ البدء لا يمكن أن يكون في المستقبل";
      return "";
    }
    return "";
  };

  const handleAssignBlur = (field: "userId" | "startedAt") => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const value = field === "userId" ? assignForm.userId : assignForm.startedAt;
    const error = validateAssignField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleAssignChange = (field: "userId" | "startedAt" | "notes", value: any) => {
    setAssignForm((prev) => ({ ...prev, [field]: value }));
    if (touched[field as keyof typeof touched]) {
      const error = validateAssignField(field as keyof ValidationErrors, value);
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const isAssignFieldValid = (field: "userId" | "startedAt"): boolean => {
    if (!touched[field]) return true;
    return !errors[field];
  };

  // ============================================================
  // ===== Validation Handlers (Transfer) =====
  // ============================================================

  const validateTransferField = (field: keyof ValidationErrors, value: any): string => {
    if (field === "newDeanUserId") {
      if (!value) return "يرجى اختيار المستخدم";
      if (isUserAdmin(value)) {
        return "لا يمكن تعيين Admin كعميد";
      }
      if (!currentDean) {
        return "لا يوجد عميد حالياً ليتم نقله";
      }
      if (value === currentDean.userId) {
        return "لا يمكن نقل المنصب إلى العميد الحالي نفسه";
      }
      return "";
    }
    if (field === "transferDate") {
      if (!value) return "تاريخ النقل مطلوب";
      const selectedDate = new Date(value);
      if (selectedDate > new Date()) return "تاريخ النقل لا يمكن أن يكون في المستقبل";
      return "";
    }
    return "";
  };

  const handleTransferBlur = (field: "newDeanUserId" | "transferDate") => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const value = field === "newDeanUserId" ? transferForm.newDeanUserId : transferForm.transferDate;
    const error = validateTransferField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleTransferChange = (field: "newDeanUserId" | "transferDate" | "notes", value: any) => {
    setTransferForm((prev) => ({ ...prev, [field]: value }));
    if (touched[field as keyof typeof touched]) {
      const error = validateTransferField(field as keyof ValidationErrors, value);
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const isTransferFieldValid = (field: "newDeanUserId" | "transferDate"): boolean => {
    if (!touched[field]) return true;
    return !errors[field];
  };

  // ============================================================
  // ===== Handlers =====
  // ============================================================

  const filteredHistory = useMemo(() => {
    return history.filter((item) =>
      item.deanName.toLowerCase().includes(search.toLowerCase())
    );
  }, [history, search]);

  const handleAssign = () => {
    const userIdError = validateAssignField("userId", assignForm.userId);
    const startedAtError = validateAssignField("startedAt", assignForm.startedAt);

    setErrors({ userId: userIdError, startedAt: startedAtError });
    setTouched((prev) => ({ ...prev, userId: true, startedAt: true }));

    if (userIdError || startedAtError) {
      toast.error(userIdError || startedAtError);
      return;
    }

    assignMutation.mutate({
      userId: assignForm.userId!,
      startedAt: assignForm.startedAt,
      notes: assignForm.notes || undefined,
    });
  };

  const handleTransfer = () => {
    const userIdError = validateTransferField("newDeanUserId", transferForm.newDeanUserId);
    const dateError = validateTransferField("transferDate", transferForm.transferDate);

    setErrors({ newDeanUserId: userIdError, transferDate: dateError });
    setTouched((prev) => ({ ...prev, newDeanUserId: true, transferDate: true }));

    if (userIdError || dateError) {
      toast.error(userIdError || dateError);
      return;
    }

    if (!transferForm.newDeanUserId) {
      toast.error("يرجى اختيار المستخدم");
      return;
    }

    transferMutation.mutate({
      newDeanUserId: transferForm.newDeanUserId,
      transferDate: transferForm.transferDate || undefined,
      notes: transferForm.notes || undefined,
    });
  };

  const handleTerminate = () => {
    if (!currentDean) {
      toast.error("لا يوجد عميد حالياً ليتم إنهاء فترته");
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: "إنهاء فترة العميد الحالي",
      message: `هل أنت متأكد من إنهاء فترة العميد الحالي (${currentDean.userName})؟ سيتم إزالة صلاحيات العميد.`,
      variant: "warning",
      icon: faUserGraduate,
      onConfirm: () => {
        terminateMutation.mutate();
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleDelete = (id: number, name: string, isCurrent: boolean) => {
    if (isCurrent) {
      toast.error("لا يمكن حذف سجل العميد الحالي");
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: "حذف سجل العميد",
      message: `هل أنت متأكد من حذف سجل العميد (${name})؟ لا يمكن التراجع عن هذا الإجراء.`,
      variant: "danger",
      icon: faTrash,
      onConfirm: () => {
        deleteMutation.mutate(id);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("ar-SA");
  };

  const getStatusBadge = (isCurrent: boolean) => {
    if (isCurrent) {
      return (
        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[10px]">
          <FontAwesomeIcon icon={faCheckCircle} className="text-[8px]" />
          حالي
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-[10px]">
        <FontAwesomeIcon icon={faClock} className="text-[8px]" />
        سابق
      </span>
    );
  };

  useEffect(() => {
    if (touched.userId && assignForm.userId) {
      const error = validateAssignField("userId", assignForm.userId);
      setErrors((prev) => ({ ...prev, userId: error }));
    }
    if (touched.newDeanUserId && transferForm.newDeanUserId) {
      const error = validateTransferField("newDeanUserId", transferForm.newDeanUserId);
      setErrors((prev) => ({ ...prev, newDeanUserId: error }));
    }
  }, [currentDean]);

  // ============================================================
  // ===== Render =====
  // ============================================================

  if (isAuthLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-3 sm:p-4 mb-3 sm:mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center text-base sm:text-lg flex-shrink-0">
            <FontAwesomeIcon icon={faUniversity} />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-800">تاريخ العمداء</h1>
            <p className="text-[11px] sm:text-xs text-slate-500">إدارة تاريخ العمداء وتعيين عميد جديد</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {currentDean && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-1.5 text-sm">
              <span className="text-emerald-600 font-medium">العميد الحالي:</span>
              <span className="text-emerald-800 font-semibold mr-1">{currentDean.userName}</span>
              <span className="text-emerald-500 text-xs mr-1">({currentDean.daysInOffice} يوم)</span>
            </div>
          )}

          <button
            onClick={handleTerminate}
            disabled={!currentDean || terminateMutation.isPending}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-50 flex items-center gap-1.5"
          >
            <FontAwesomeIcon icon={faTimes} />
            إنهاء الفترة
          </button>

          <button
            onClick={openTransferModal}
            className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            نقل المنصب
          </button>

          <button
            onClick={openAssignModal}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5"
          >
            <FontAwesomeIcon icon={faPlus} />
            تعيين عميد
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-3 sm:mb-4 text-xs sm:text-sm bg-white rounded-2xl border border-blue-100 p-2.5 sm:p-3 shadow-sm">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-slate-400 text-[10px] sm:text-xs">📊</span>
          <span className="text-slate-600 text-[11px] sm:text-xs">الإحصائيات:</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
          <span className="text-slate-500">إجمالي السجلات:</span>
          <span className="font-semibold text-slate-800">{history.length}</span>
        </div>
        <div className="w-px h-3 sm:h-4 bg-slate-200" />
        <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
          <span className="text-emerald-500 text-[8px] sm:text-[10px]">●</span>
          <span className="text-slate-500">حالي:</span>
          <span className="font-semibold text-emerald-600">{history.filter((h) => h.isCurrentDean).length}</span>
        </div>
        <div className="w-px h-3 sm:h-4 bg-slate-200" />
        <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
          <span className="text-gray-500 text-[8px] sm:text-[10px]">●</span>
          <span className="text-slate-500">سابق:</span>
          <span className="font-semibold text-gray-600">{history.filter((h) => !h.isCurrentDean).length}</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-3 sm:p-4 mb-3 sm:mb-4">
        <div className="relative flex-1">
          <FontAwesomeIcon icon={faSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[11px] sm:text-sm" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="البحث باسم العميد..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 sm:py-2 pr-8 sm:pr-10 pl-3 text-xs sm:text-sm outline-none focus:border-blue-400"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
        {loadingHistory ? (
          <div className="h-32 sm:h-40 flex items-center justify-center text-slate-500 text-xs sm:text-sm">جاري تحميل التاريخ...</div>
        ) : filteredHistory.length === 0 ? (
          <div className="h-32 sm:h-40 flex flex-col items-center justify-center text-slate-400 gap-1.5 sm:gap-2">
            <FontAwesomeIcon icon={faHistory} className="text-2xl sm:text-3xl" />
            <p className="text-xs sm:text-sm">لا يوجد سجلات</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs sm:text-sm">
              <thead>
                <tr className="bg-blue-50 text-slate-700">
                  <th className="p-2 sm:p-3 font-semibold whitespace-nowrap">العميد</th>
                  <th className="p-2 sm:p-3 font-semibold whitespace-nowrap hidden md:table-cell">تاريخ البداية</th>
                  <th className="p-2 sm:p-3 font-semibold whitespace-nowrap hidden md:table-cell">تاريخ النهاية</th>
                  <th className="p-2 sm:p-3 font-semibold whitespace-nowrap">المدة</th>
                  <th className="p-2 sm:p-3 font-semibold whitespace-nowrap">الحالة</th>
                  <th className="p-2 sm:p-3 font-semibold whitespace-nowrap">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((item) => (
                  <tr key={item.id} className="border-t border-slate-100 hover:bg-slate-50 transition">
                    <td className="p-2 sm:p-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-[10px] sm:text-xs">
                          {item.deanName.charAt(0)}
                        </div>
                        <span className="font-semibold text-slate-800 text-xs sm:text-sm">{item.deanName}</span>
                      </div>
                    </td>
                    <td className="p-2 sm:p-3 text-slate-600 text-xs hidden md:table-cell">{formatDate(item.startedAt)}</td>
                    <td className="p-2 sm:p-3 text-slate-600 text-xs hidden md:table-cell">{item.endedAt ? formatDate(item.endedAt) : "-"}</td>
                    <td className="p-2 sm:p-3 whitespace-nowrap">
                      <span className="font-medium text-slate-700">{item.daysInOffice} يوم</span>
                    </td>
                    <td className="p-2 sm:p-3 whitespace-nowrap">{getStatusBadge(item.isCurrentDean)}</td>
                    <td className="p-2 sm:p-3 whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(item.id, item.deanName, item.isCurrentDean)}
                        disabled={item.isCurrentDean || deleteMutation.isPending}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl transition flex items-center justify-center ${
                          item.isCurrentDean ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-red-100 text-red-600 hover:bg-red-200"
                        }`}
                        title={item.isCurrentDean ? "لا يمكن حذف العميد الحالي" : "حذف"}
                      >
                        <FontAwesomeIcon icon={faTrash} className="text-[10px] sm:text-sm" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ===== ASSIGN MODAL ===== */}
      {modalOpen && modalType === "assign" && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-4 sm:p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-800">تعيين عميد جديد</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-red-500">
                <FontAwesomeIcon icon={faXmark} className="text-lg" />
              </button>
            </div>

            <div className="space-y-3 sm:space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">اختر المستخدم *</label>
                <select
                  value={assignForm.userId || ""}
                  onChange={(e) => handleAssignChange("userId", e.target.value ? Number(e.target.value) : null)}
                  onBlur={() => handleAssignBlur("userId")}
                  className={`w-full border rounded-xl p-2.5 sm:p-3 text-sm outline-none text-right transition ${
                    !isAssignFieldValid("userId") && touched.userId
                      ? "border-red-500 bg-red-50 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      : "border-slate-200 focus:border-blue-400"
                  }`}
                  disabled={isProcessing}
                >
                  <option value="">اختر المستخدم...</option>
                  {users
                    .filter((user) => !user.roles?.includes(UserRole.ADMIN))
                    .map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.fullName} ({user.email})
                      </option>
                    ))}
                </select>
                {touched.userId && errors.userId && <p className="text-red-500 text-xs mt-1">{errors.userId}</p>}
                {currentDean && (
                  <p className="text-amber-500 text-xs mt-1">⚠️ يوجد عميد حالياً. يجب إنهاء العميد الحالي أولاً</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">تاريخ البدء *</label>
                <input
                  type="date"
                  value={assignForm.startedAt}
                  onChange={(e) => handleAssignChange("startedAt", e.target.value)}
                  onBlur={() => handleAssignBlur("startedAt")}
                  className={`w-full border rounded-xl p-2.5 sm:p-3 text-sm outline-none focus:border-blue-400 transition ${
                    !isAssignFieldValid("startedAt") && touched.startedAt
                      ? "border-red-500 bg-red-50 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      : "border-slate-200"
                  }`}
                  disabled={isProcessing}
                />
                {touched.startedAt && errors.startedAt && <p className="text-red-500 text-xs mt-1">{errors.startedAt}</p>}
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600">ملاحظات</label>
                <textarea
                  value={assignForm.notes}
                  onChange={(e) => handleAssignChange("notes", e.target.value)}
                  rows={2}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-sm outline-none focus:border-blue-400 resize-none"
                  placeholder="ملاحظات (اختياري)"
                  disabled={isProcessing}
                />
              </div>
            </div>

            <button
              disabled={isProcessing || !assignForm.userId || !!currentDean}
              onClick={handleAssign}
              className={`w-full py-2 sm:py-2.5 rounded-xl font-semibold transition text-sm mt-4 sm:mt-5 flex items-center justify-center gap-2 ${
                isProcessing || !assignForm.userId || currentDean
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
              {isProcessing ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  جاري التعيين...
                </>
              ) : (
                "تعيين"
              )}
            </button>
          </div>
        </div>
      )}

      {/* ===== TRANSFER MODAL ===== */}
      {modalOpen && modalType === "transfer" && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-4 sm:p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-800">نقل منصب العميد</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-red-500">
                <FontAwesomeIcon icon={faXmark} className="text-lg" />
              </button>
            </div>

            <div className="space-y-3 sm:space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">العميد الجديد *</label>
                <select
                  value={transferForm.newDeanUserId ?? ""}
                  onChange={(e) => {
                    const value = e.target.value ? Number(e.target.value) : null;
                    handleTransferChange("newDeanUserId", value);
                  }}
                  onBlur={() => handleTransferBlur("newDeanUserId")}
                  className={`w-full border rounded-xl p-2.5 sm:p-3 text-sm outline-none text-right transition ${
                    !isTransferFieldValid("newDeanUserId") && touched.newDeanUserId
                      ? "border-red-500 bg-red-50 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      : "border-slate-200 focus:border-blue-400"
                  }`}
                  disabled={isProcessing}
                >
                  <option value="">اختر المستخدم...</option>
                  {users
                    .filter((user) => {
                      if (user.roles?.includes(UserRole.ADMIN)) return false;
                      if (currentDean && user.id === currentDean.userId) return false;
                      return true;
                    })
                    .map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.fullName} ({user.email})
                      </option>
                    ))}
                </select>
                {touched.newDeanUserId && errors.newDeanUserId && (
                  <p className="text-red-500 text-xs mt-1">{errors.newDeanUserId}</p>
                )}
                {!currentDean && (
                  <p className="text-amber-500 text-xs mt-1">⚠️ لا يوجد عميد حالياً ليتم نقله</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">تاريخ النقل *</label>
                <input
                  type="date"
                  value={transferForm.transferDate}
                  onChange={(e) => handleTransferChange("transferDate", e.target.value)}
                  onBlur={() => handleTransferBlur("transferDate")}
                  className={`w-full border rounded-xl p-2.5 sm:p-3 text-sm outline-none focus:border-blue-400 transition ${
                    !isTransferFieldValid("transferDate") && touched.transferDate
                      ? "border-red-500 bg-red-50 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      : "border-slate-200"
                  }`}
                  disabled={isProcessing}
                />
                {touched.transferDate && errors.transferDate && (
                  <p className="text-red-500 text-xs mt-1">{errors.transferDate}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600">ملاحظات</label>
                <textarea
                  value={transferForm.notes}
                  onChange={(e) => handleTransferChange("notes", e.target.value)}
                  rows={2}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-sm outline-none focus:border-blue-400 resize-none"
                  placeholder="ملاحظات (اختياري)"
                  disabled={isProcessing}
                />
              </div>
            </div>

            <button
              disabled={isProcessing || !transferForm.newDeanUserId || !currentDean}
              onClick={handleTransfer}
              className={`w-full py-2 sm:py-2.5 rounded-xl font-semibold transition text-sm mt-4 sm:mt-5 flex items-center justify-center gap-2 ${
                isProcessing || !transferForm.newDeanUserId || !currentDean
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-yellow-400 hover:bg-yellow-500 text-slate-900"
              }`}
            >
              {isProcessing ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  جاري النقل...
                </>
              ) : (
                "نقل المنصب"
              )}
            </button>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText="تأكيد"
        cancelText="إلغاء"
        variant={confirmModal.variant || "danger"}
        icon={confirmModal.icon}
      />
    </div>
  );
}