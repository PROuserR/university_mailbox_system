/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(dashboard)/backup/page.tsx

"use client";

import { useState, useMemo, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDatabase,
  faFile,
  faPlus,
  faTrash,
  faRotateRight,
  faEye,
  faChartBar,
  faClock,
  faCheckCircle,
  faTimesCircle,
  faSpinner,
  faXmark,
  faRefresh,
  faFolderOpen,
  faStop,
  faArrowsLeftRight,
  faDownload,
  faUpload,
  faFileAlt,
  faHardDrive,
  faExclamationTriangle,
  faChevronRight,
  faChevronLeft,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { PERMISSIONS } from "@/lib/permissions";
import {
  useListDatabaseBackups,
  useListFilesBackups,
  useBackupStatistics,
  useCreateDatabaseBackup,
  useDeleteDatabaseBackup,
  useRestoreDatabaseBackup,
  useCreateDailyBackup,
  useCreateMonthlyBackup,
  useCreateAnnualBackup,
  useDeleteFilesBackup,
  useCleanupOldBackups,
  usePreviewFilesBackup,
  useRestoreFilesBackup,
  useRetryFailedRestore,
  useCompareBackups,
} from "@/hooks/useBackup";
import {
  BackupInfoDto,
  BackupType,
  CleanupPolicy,
  RestoreToPathOptions,
  RetryFailedRequest,
  CompareBackupsRequest,
  FileDifference,
  BackupComparisonDto,
  RestoreResultDto,
} from "@/types/api/backup.types";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import toast from "react-hot-toast";

// ============================================================
// ===== Type Guards =====
// ============================================================

function isBackupInfo(obj: unknown): obj is BackupInfoDto {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "id" in obj &&
    "fileName" in obj &&
    "type" in obj
  );
}

// ============================================================
// ===== Main Component =====
// ============================================================

export default function BackupManagementPage() {
  const { isLoading: isAuthLoading, isAuthorized } = useAuthGuard({
    requiredPermissions: [PERMISSIONS.MANAGE_BACKUP],
    redirectTo: "/auth/login",
    unauthorizedPath: "/unauthorized",
  });

  // ===== State =====
    const [activeTab, setActiveTab] = useState<"database" | "files">("database");
  const [currentPage, setCurrentPage] = useState(1);
  const [dbPage, setDbPage] = useState(1);
  const [pageSize] = useState(5);
  const [dbPageSize] = useState(5); 
  
  // ===== Create Backup States =====
  const [createBackupType, setCreateBackupType] = useState<"daily" | "monthly" | "annual">("daily");
  const [backupYear, setBackupYear] = useState<number>(new Date().getFullYear());
  const [backupMonth, setBackupMonth] = useState<number>(new Date().getMonth() + 1);
  const [backupDay, setBackupDay] = useState<number>(new Date().getDate());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // ===== Restore Result State =====
  const [restoreResult, setRestoreResult] = useState<RestoreResultDto | null>(null);
  const [restoreResultModal, setRestoreResultModal] = useState(false);


  
  // ===== Retry State =====
  const [retryModal, setRetryModal] = useState<{
    isOpen: boolean;
    type: BackupType | null;
    backupId: string | null;
    failedFiles: string[];
  }>({
    isOpen: false,
    type: null,
    backupId: null,
    failedFiles: [],
  });
  // ===== Preview State =====
interface PreviewModalState {
  isOpen: boolean;
  type: BackupType | null;
  backupId: string | null;
  selectMode: boolean;
  selectedFiles: string[];
  searchQuery: string;
  page: number;
  pageSize: number;
}

const [previewModal, setPreviewModal] = useState<PreviewModalState>({
  isOpen: false,
  type: null,
  backupId: null,
  selectMode: false,
  selectedFiles: [],
  searchQuery: "",
  page: 1,
  pageSize: 10,
});

  // ===== Compare State =====
  const [compareModal, setCompareModal] = useState<{
    isOpen: boolean;
    backup1Id: string;
    backup2Id: string;
  }>({
    isOpen: false,
    backup1Id: "",
    backup2Id: "",
  });

  // ===== Compare Result State =====
  const [compareResult, setCompareResult] = useState<BackupComparisonDto | null>(null);
  const [compareResultModal, setCompareResultModal] = useState(false);

  // ===== Restore State =====
  const [restoreModal, setRestoreModal] = useState<{
  isOpen: boolean;
  type: BackupType | null;
  backupId: string | null;
  overwrite: boolean;
  dryRun: boolean;
  validateIntegrity: boolean;       
  includePatterns: string[];        
  excludePatterns: string[];        
  specificFiles: string[];          
  includePatternsInput: string;     
  excludePatternsInput: string;     
  specificFilesInput: string;       
}>({
  isOpen: false,
  type: null,
  backupId: null,
  overwrite: true,
  dryRun: false,
  validateIntegrity: true,
  includePatterns: [],
  excludePatterns: [],
  specificFiles: [],
  includePatternsInput: "",
  excludePatternsInput: "",
  specificFilesInput: "",
});

  // ===== Cleanup State =====
  const [cleanupModal, setCleanupModal] = useState<{
    isOpen: boolean;
    dailyRetentionDays: number;
    monthlyRetentionMonths: number;
    annualRetentionYears: number;
    keepPermanent: boolean;
  }>({
    isOpen: false,
    dailyRetentionDays: 30,
    monthlyRetentionMonths: 12,
    annualRetentionYears: 5,
    keepPermanent: false,
  });

  // ===== Confirm Modal =====
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

  // ===== Queries =====
  const { data: dbBackupsAll = [], refetch: refetchDb, isLoading: isDbLoading } = useListDatabaseBackups();
  const { data: filesBackupsData, refetch: refetchFiles, isLoading: isFilesLoading } = useListFilesBackups(currentPage, pageSize);
  const { data: statistics, refetch: refetchStats } = useBackupStatistics();
  const { data: previewData } = usePreviewFilesBackup(
    previewModal.type,
    previewModal.backupId
  );
  // ===== Database Pagination (Frontend) =====
  const dbTotalItems = dbBackupsAll.length;
  const dbTotalPages = Math.ceil(dbTotalItems / dbPageSize) || 1;
  const startIndex = (dbPage - 1) * dbPageSize;
  const endIndex = startIndex + dbPageSize;
  const dbBackups = dbBackupsAll.slice(startIndex, endIndex);
  const hasDbNextPage = dbPage < dbTotalPages;
  const hasDbPrevPage = dbPage > 1;

  // ===== Database Pagination Handlers =====
  const goToDbNextPage = () => {
    if (dbPage < dbTotalPages) {
      setDbPage((prev) => prev + 1);
    }
  };

  const goToDbPrevPage = () => {
    if (dbPage > 1) {
      setDbPage((prev) => prev - 1);
    }
  };

  const goToDbPage = (page: number) => {
    if (page >= 1 && page <= dbTotalPages) {
      setDbPage(page);
    }
  };
  // ===== Mutations =====
  const createDbBackup = useCreateDatabaseBackup(() => {
    refetchDb();
    refetchStats();
  });
  const deleteDbBackup = useDeleteDatabaseBackup(() => {
    refetchDb();
    refetchStats();
  });
  const restoreDbBackup = useRestoreDatabaseBackup(() => {
    refetchDb();
    refetchStats();
  });

  const createDaily = useCreateDailyBackup(() => {
    refetchFiles();
    refetchStats();
    setIsCreateModalOpen(false);
  });
  const createMonthly = useCreateMonthlyBackup(() => {
    refetchFiles();
    refetchStats();
    setIsCreateModalOpen(false);
  });
  const createAnnual = useCreateAnnualBackup(() => {
    refetchFiles();
    refetchStats();
    setIsCreateModalOpen(false);
  });
  const deleteFilesBackup = useDeleteFilesBackup(() => {
    refetchFiles();
    refetchStats();
  });
  const cleanupOld = useCleanupOldBackups(() => {
    refetchFiles();
    refetchStats();
    setCleanupModal((prev) => ({ ...prev, isOpen: false }));
  });

  // ===== Restore Mutations =====
  const restoreFiles = useRestoreFilesBackup((data) => {
    setRestoreResult(data);
    setRestoreResultModal(true);
    setRestoreModal((prev) => ({ ...prev, isOpen: false }));
  });

  // const restoreToPath = useRestoreFilesBackupToPath((data) => {
  //   setRestoreResult(data);
  //   setRestoreResultModal(true);
  //   setRestoreModal((prev) => ({ ...prev, isOpen: false }));
  // });

  const retryRestore = useRetryFailedRestore((data) => {
    toast.success(`تم إعادة محاولة ${data.restoredFiles} ملف بنجاح`, { duration: 3000 });
    setRetryModal((prev) => ({ ...prev, isOpen: false }));
    setRestoreResult(null);
    setRestoreResultModal(false);
    refetchFiles();
    refetchStats();
  });

  const compareBackups = useCompareBackups((data) => {
    setCompareResult(data);
    setCompareResultModal(true);
    setCompareModal((prev) => ({ ...prev, isOpen: false }));
  });

  const isProcessing =
    createDbBackup.isPending ||
    deleteDbBackup.isPending ||
    restoreDbBackup.isPending ||
    createDaily.isPending ||
    createMonthly.isPending ||
    createAnnual.isPending ||
    deleteFilesBackup.isPending ||
    cleanupOld.isPending ||
    restoreFiles.isPending ||
    // restoreToPath.isPending ||
    retryRestore.isPending ||
    compareBackups.isPending;

  // ============================================================
  // ===== Handlers =====
  // ============================================================

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("ar-SA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      Database: "bg-purple-100 text-purple-700",
      Daily: "bg-blue-100 text-blue-700",
      Monthly: "bg-indigo-100 text-indigo-700",
      Annual: "bg-violet-100 text-violet-700",
    };
    const color = colors[type] || "bg-gray-100 text-gray-700";
    return (
      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${color}`}>
        {type}
      </span>
    );
  };

  // ============================================================
  // ===== Pagination Handlers =====
  // ============================================================

  const goToNextPage = () => {
    if (filesBackupsData && currentPage < filesBackupsData.totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= (filesBackupsData?.totalPages || 1)) {
      setCurrentPage(page);
    }
  };

  // ===== Retry Handlers =====
  const handleRetryFailed = () => {
    if (!retryModal.type || !retryModal.backupId || retryModal.failedFiles.length === 0) {
      toast.error("لا توجد ملفات فاشلة لإعادة المحاولة");
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: "إعادة محاولة استعادة الملفات الفاشلة",
      message: `سيتم إعادة محاولة استعادة ${retryModal.failedFiles.length} ملف فاشل. هل أنت متأكد من المتابعة؟`,
      variant: "warning",
      icon: faRotateRight,
      onConfirm: () => {
        retryRestore.mutate({
          type: retryModal.type!,
          backupId: retryModal.backupId!,
          failedFiles: retryModal.failedFiles,
        });
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const openRetryModal = (type: BackupType, backupId: string, failedFiles: string[]) => {
    if (failedFiles.length === 0) {
      toast.success("لا توجد ملفات فاشلة لإعادة المحاولة");
      return;
    }
    setRetryModal({
      isOpen: true,
      type,
      backupId,
      failedFiles,
    });
  };

  const handleRefresh = () => {
    refetchDb();
    refetchFiles();
    refetchStats();
    toast.success("تم تحديث البيانات", { duration: 2000 });
  };

  // ===== Create Backup =====
  const handleOpenCreateModal = (type: "daily" | "monthly" | "annual") => {
    setCreateBackupType(type);
    setIsCreateModalOpen(true);
  };

  const handleCreateBackup = () => {
    if (createBackupType === "daily") {
      createDaily.mutate({ year: backupYear, month: backupMonth, day: backupDay });
    } else if (createBackupType === "monthly") {
      createMonthly.mutate({ year: backupYear, month: backupMonth });
    } else if (createBackupType === "annual") {
      createAnnual.mutate(backupYear);
    }
  };

  // ===== Database Backup =====
  const handleCreateDbBackup = () => {
    setConfirmModal({
      isOpen: true,
      title: "إنشاء نسخة احتياطية لقاعدة البيانات",
      message: "هل أنت متأكد من إنشاء نسخة احتياطية جديدة لقاعدة البيانات؟",
      variant: "success",
      icon: faDatabase,
      onConfirm: () => {
        createDbBackup.mutate();
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleDeleteDbBackup = (id: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: "حذف النسخة الاحتياطية",
      message: `هل أنت متأكد من حذف النسخة الاحتياطية (${name})؟ لا يمكن التراجع عن هذا الإجراء.`,
      variant: "danger",
      icon: faTrash,
      onConfirm: () => {
        deleteDbBackup.mutate(id);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleRestoreDbBackup = (id: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: "استعادة قاعدة البيانات",
      message: `هل أنت متأكد من استعادة قاعدة البيانات من النسخة (${name})؟`,
      variant: "warning",
      icon: faRotateRight,
      onConfirm: () => {
        restoreDbBackup.mutate(id);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // ===== Files Backup =====
  const handleDeleteFilesBackup = (id: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: "حذف النسخة الاحتياطية",
      message: `هل أنت متأكد من حذف النسخة الاحتياطية (${name})؟ لا يمكن التراجع عن هذا الإجراء.`,
      variant: "danger",
      icon: faTrash,
      onConfirm: () => {
        deleteFilesBackup.mutate(id);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // ===== Preview =====
const handlePreview = (type: BackupType, backupId: string) => {
  setPreviewModal({
    isOpen: true,
    type,
    backupId,
    selectMode: false,
    selectedFiles: [],
    searchQuery: "",    
    page: 1,            
    pageSize: 10,       
  });
};
const handleClosePreview = () => {
  setPreviewModal({
    isOpen: false,
    type: null,
    backupId: null,
    selectMode: false,
    selectedFiles: [],
    searchQuery: "",
    page: 1,
    pageSize: 10,
  });
};
// ===== Preview Selection Handlers =====
const toggleFileSelection = (filePath: string) => {
  setPreviewModal((prev) => ({
    ...prev,
    selectedFiles: prev.selectedFiles.includes(filePath)
      ? prev.selectedFiles.filter((f) => f !== filePath)
      : [...prev.selectedFiles, filePath],
  }));
};
const handleSelectFilesFromPreview = () => {
  if (previewModal.selectedFiles.length === 0) {
    toast.error("يرجى اختيار ملف واحد على الأقل");
    return;
  }

  setRestoreModal((prev) => ({
    ...prev,
    specificFiles: [...prev.specificFiles, ...previewModal.selectedFiles],
    isOpen: true,
  }));

  setPreviewModal((prev) => ({
    ...prev,
    isOpen: false,
    selectMode: false,
    selectedFiles: [],
    searchQuery: "",
    page: 1,
  }));
};
// ===== Preview Pagination Handlers =====
const getFilteredPreviewFiles = () => {
  if (!previewData) return [];
  
  const files = previewData.files;
  const searchQuery = previewModal.searchQuery.toLowerCase().trim();
  
  if (!searchQuery) return files;
  
  return files.filter((file) =>
    file.fileName.toLowerCase().includes(searchQuery) ||
    file.filePath.toLowerCase().includes(searchQuery) ||
    file.extension.toLowerCase().includes(searchQuery)
  );
};

const getPaginatedPreviewFiles = () => {
  const filtered = getFilteredPreviewFiles();
  const startIndex = (previewModal.page - 1) * previewModal.pageSize;
  const endIndex = startIndex + previewModal.pageSize;
  return filtered.slice(startIndex, endIndex);
};

const getPreviewTotalPages = () => {
  const filtered = getFilteredPreviewFiles();
  return Math.ceil(filtered.length / previewModal.pageSize);
};

const goToPreviewPage = (page: number) => {
  const totalPages = getPreviewTotalPages();
  if (page >= 1 && page <= totalPages) {
    setPreviewModal((prev) => ({ ...prev, page }));
  }
};
  // ===== Compare =====
  const handleCompare = () => {
    if (!compareModal.backup1Id || !compareModal.backup2Id) {
      toast.error("يرجى اختيار ملفين للمقارنة");
      return;
    }
    compareBackups.mutate({
      backupId1: compareModal.backup1Id,
      backupId2: compareModal.backup2Id,
    });
  };

  const handleOpenRestore = (type: BackupType, backupId: string) => {
  setRestoreModal({
    isOpen: true,
    type,
    backupId,
    overwrite: true,
    dryRun: false,
    validateIntegrity: true,
    includePatterns: [],
    excludePatterns: [],
    specificFiles: [],
    includePatternsInput: "",
    excludePatternsInput: "",
    specificFilesInput: "",
  });
};
const handleRestore = () => {
  if (!restoreModal.type || !restoreModal.backupId) return;

  restoreFiles.mutate({
    type: restoreModal.type,
    backupId: restoreModal.backupId,
    options: {
      overwriteExisting: restoreModal.overwrite,
      dryRun: restoreModal.dryRun,
      validateIntegrity: restoreModal.validateIntegrity,
      includePatterns: restoreModal.includePatterns.length > 0 ? restoreModal.includePatterns : undefined,
      excludePatterns: restoreModal.excludePatterns.length > 0 ? restoreModal.excludePatterns : undefined,
      specificFiles: restoreModal.specificFiles.length > 0 ? restoreModal.specificFiles : undefined,
    },
  });
};
const addIncludePattern = () => {
  if (restoreModal.includePatternsInput.trim()) {
    setRestoreModal((prev) => ({
      ...prev,
      includePatterns: [...prev.includePatterns, prev.includePatternsInput.trim()],
      includePatternsInput: "",
    }));
  }
};

const removeIncludePattern = (index: number) => {
  setRestoreModal((prev) => ({
    ...prev,
    includePatterns: prev.includePatterns.filter((_, i) => i !== index),
  }));
};

const addExcludePattern = () => {
  if (restoreModal.excludePatternsInput.trim()) {
    setRestoreModal((prev) => ({
      ...prev,
      excludePatterns: [...prev.excludePatterns, prev.excludePatternsInput.trim()],
      excludePatternsInput: "",
    }));
  }
};

const removeExcludePattern = (index: number) => {
  setRestoreModal((prev) => ({
    ...prev,
    excludePatterns: prev.excludePatterns.filter((_, i) => i !== index),
  }));
};

const addSpecificFile = () => {
  if (restoreModal.specificFilesInput.trim()) {
    setRestoreModal((prev) => ({
      ...prev,
      specificFiles: [...prev.specificFiles, prev.specificFilesInput.trim()],
      specificFilesInput: "",
    }));
  }
};

const removeSpecificFile = (index: number) => {
  setRestoreModal((prev) => ({
    ...prev,
    specificFiles: prev.specificFiles.filter((_, i) => i !== index),
  }));
};
  // ===== Cleanup =====
  const handleOpenCleanup = () => {
    setCleanupModal((prev) => ({ ...prev, isOpen: true }));
  };

  const handleCleanup = () => {
    const policy: CleanupPolicy = {
      deleteDailyAfterDays: true,
      dailyRetentionDays: cleanupModal.dailyRetentionDays,
      deleteMonthlyAfterMonths: true,
      monthlyRetentionMonths: cleanupModal.monthlyRetentionMonths,
      deleteAnnualAfterYears: true,
      annualRetentionYears: cleanupModal.annualRetentionYears,
      keepPermanentBackups: cleanupModal.keepPermanent,
    };
    cleanupOld.mutate(policy);
  };

  // ============================================================
  // ===== Render =====
  // ============================================================

  if (isAuthLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthorized) {
    return null;
  }

  const filesBackups = filesBackupsData?.items || [];
  const totalPages = filesBackupsData?.totalPages || 0;
  const totalItems = filesBackupsData?.totalCount || 0;

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 p-3 sm:p-4">
      {/* ===== Header ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-3 sm:p-4 mb-3 sm:mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-base sm:text-lg flex-shrink-0">
            <FontAwesomeIcon icon={faDatabase} />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-800">
              إدارة النسخ الاحتياطية
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500">
              إنشاء وإدارة واستعادة النسخ الاحتياطية لقاعدة البيانات والملفات
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isProcessing}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-50 flex items-center gap-1.5"
          >
            <FontAwesomeIcon icon={faRefresh} className={isProcessing ? "animate-spin" : ""} />
            تحديث
          </button>
        </div>
      </div>

      {/* ===== Statistics ===== */}
      {statistics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="bg-white rounded-2xl border border-blue-100 p-3 shadow-sm">
            <p className="text-[10px] text-slate-400">إجمالي نسخ الملفات</p>
            <p className="text-lg sm:text-xl font-bold text-slate-800">{statistics.totalBackups}</p>
          </div>
          <div className="bg-white rounded-2xl border border-blue-100 p-3 shadow-sm">
            <p className="text-[10px] text-slate-400">حجم الملفات الإجمالي</p>
            <p className="text-lg sm:text-xl font-bold text-slate-800">
              {formatSize(statistics.totalSizeBytes)}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-blue-100 p-3 shadow-sm">
            <p className="text-[10px] text-slate-400">آخر نسخة ملفات</p>
            <p className="text-sm font-semibold text-slate-800">
              {statistics.lastBackupDate ? formatDate(statistics.lastBackupDate) : "-"}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-blue-100 p-3 shadow-sm">
            <p className="text-[10px] text-slate-400">نسخ قاعدة البيانات</p>
            <p className="text-lg sm:text-xl font-bold text-purple-600">
              {dbBackups.length}
            </p>
          </div>
        </div>
      )}

      {/* ===== Tabs ===== */}
      <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-1 mb-3 sm:mb-4 flex">
        <button
          onClick={() => setActiveTab("database")}
          className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-medium transition ${
            activeTab === "database"
              ? "bg-blue-500 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <FontAwesomeIcon icon={faDatabase} className="ml-2" />
          قاعدة البيانات
        </button>
        <button
          onClick={() => setActiveTab("files")}
          className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-medium transition ${
            activeTab === "files"
              ? "bg-blue-500 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <FontAwesomeIcon icon={faFile} className="ml-2" />
          الملفات
        </button>
      </div>

  {activeTab === "database" && (
    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
      <div className="p-3 border-b border-slate-100 flex justify-between items-center">
        <span className="text-xs font-medium text-slate-600">
          نسخ قاعدة البيانات ({dbTotalItems})
        </span>
        <button
          onClick={handleCreateDbBackup}
          disabled={isProcessing}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-50 flex items-center gap-1.5"
        >
          <FontAwesomeIcon icon={faPlus} />
          إنشاء نسخة
        </button>
      </div>

      {isDbLoading && dbBackupsAll.length === 0 ? (
        <div className="h-32 flex flex-col items-center justify-center text-slate-400 gap-2">
          <FontAwesomeIcon icon={faSpinner} spin className="text-2xl" />
          <p className="text-sm">جاري التحميل...</p>
        </div>
      ) : dbBackupsAll.length === 0 ? (
        <div className="h-32 flex flex-col items-center justify-center text-slate-400 gap-2">
          <FontAwesomeIcon icon={faDatabase} className="text-3xl" />
          <p className="text-sm">لا توجد نسخ احتياطية لقاعدة البيانات</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs sm:text-sm">
              <thead>
                <tr className="bg-blue-50 text-slate-700">
                  <th className="p-2 sm:p-3 font-semibold whitespace-nowrap">الاسم</th>
                  <th className="p-2 sm:p-3 font-semibold whitespace-nowrap hidden md:table-cell">الحجم</th>
                  <th className="p-2 sm:p-3 font-semibold whitespace-nowrap hidden lg:table-cell">التاريخ</th>
                  <th className="p-2 sm:p-3 font-semibold whitespace-nowrap">النوع</th>
                  <th className="p-2 sm:p-3 font-semibold whitespace-nowrap">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {dbBackups.map((backup) => (
                  <tr key={backup.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="p-2 sm:p-3 whitespace-nowrap">
                      <span className="font-medium text-slate-800 text-xs sm:text-sm">
                        {backup.fileName}
                      </span>
                    </td>
                    <td className="p-2 sm:p-3 text-slate-600 text-xs hidden md:table-cell">
                      {backup.sizeFormatted}
                    </td>
                    <td className="p-2 sm:p-3 text-slate-600 text-xs hidden lg:table-cell">
                      {formatDate(backup.createdAt)}
                    </td>
                    <td className="p-2 sm:p-3 whitespace-nowrap">
                      {getTypeBadge(backup.type)}
                    </td>
                    <td className="p-2 sm:p-3 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleRestoreDbBackup(backup.id, backup.fileName)}
                          disabled={isProcessing}
                          className="w-7 h-7 rounded-xl bg-blue-100 text-blue-600 hover:bg-blue-200 transition flex items-center justify-center disabled:opacity-50"
                          title="استعادة"
                        >
                          <FontAwesomeIcon icon={faRotateRight} className="text-[10px]" />
                        </button>
                        <button
                          onClick={() => handleDeleteDbBackup(backup.id, backup.fileName)}
                          disabled={isProcessing}
                          className="w-7 h-7 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition flex items-center justify-center disabled:opacity-50"
                          title="حذف"
                        >
                          <FontAwesomeIcon icon={faTrash} className="text-[10px]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ===== Database Pagination (Frontend) ===== */}
          {dbTotalPages > 1 && (
            <div className="p-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-500 order-2 sm:order-1">
                عرض {startIndex + 1} - {Math.min(endIndex, dbTotalItems)} من {dbTotalItems}
              </span>
              <div className="flex items-center gap-1 order-1 sm:order-2">
                <button
                  onClick={goToDbPrevPage}
                  disabled={!hasDbPrevPage || isProcessing || isDbLoading}
                  className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition disabled:opacity-50 disabled:cursor-not-allowed text-xs flex items-center gap-1"
                >
                  <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
                  السابق
                </button>

                <div className="flex items-center gap-1">
                  {(() => {
                    const pages = [];
                    const maxVisible = 7;
                    
                    if (dbTotalPages <= maxVisible) {
                      for (let i = 1; i <= dbTotalPages; i++) {
                        pages.push(i);
                      }
                    } else if (dbPage <= 4) {
                      for (let i = 1; i <= 5; i++) pages.push(i);
                      pages.push(-1);
                      pages.push(dbTotalPages);
                    } else if (dbPage >= dbTotalPages - 3) {
                      pages.push(1);
                      pages.push(-1);
                      for (let i = dbTotalPages - 4; i <= dbTotalPages; i++) pages.push(i);
                    } else {
                      pages.push(1);
                      pages.push(-1);
                      for (let i = dbPage - 1; i <= dbPage + 1; i++) pages.push(i);
                      pages.push(-1);
                      pages.push(dbTotalPages);
                    }

                    return pages.map((pageNum, index) => {
                      if (pageNum === -1) {
                        return (
                          <span key={`db-dots-${index}`} className="px-1 text-slate-400 text-xs">
                            ...
                          </span>
                        );
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => goToDbPage(pageNum)}
                          disabled={isProcessing || isDbLoading}
                          className={`w-8 h-8 rounded-lg text-xs font-medium transition ${
                            pageNum === dbPage
                              ? "bg-blue-500 text-white shadow-md"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {pageNum}
                        </button>
                      );
                    });
                  })()}
                </div>

                <button
                  onClick={goToDbNextPage}
                  disabled={!hasDbNextPage || isProcessing || isDbLoading}
                  className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition disabled:opacity-50 disabled:cursor-not-allowed text-xs flex items-center gap-1"
                >
                  التالي
                  <FontAwesomeIcon icon={faChevronLeft} className="text-[10px]" />
                </button>
              </div>
            </div>
          )}

          {dbTotalPages <= 1 && dbTotalItems > 0 && (
            <div className="p-3 border-t border-slate-100 text-center text-xs text-slate-500">
              عرض {dbTotalItems} عنصر
            </div>
          )}
        </>
      )}
    </div>
  )}

      {/* ============================================================ */}
      {/* ===== Files Backups Tab ===== */}
      {/* ============================================================ */}
      {activeTab === "files" && (
        <div>
          {/* ===== Actions ===== */}
          <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-3 mb-3 flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleOpenCreateModal("daily")}
              disabled={isProcessing}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-50 flex items-center gap-1.5"
            >
              <FontAwesomeIcon icon={faPlus} />
              يومي
            </button>
            <button
              onClick={() => handleOpenCreateModal("monthly")}
              disabled={isProcessing}
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-50 flex items-center gap-1.5"
            >
              <FontAwesomeIcon icon={faPlus} />
              شهري
            </button>
            <button
              onClick={() => handleOpenCreateModal("annual")}
              disabled={isProcessing}
              className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-50 flex items-center gap-1.5"
            >
              <FontAwesomeIcon icon={faPlus} />
              سنوي
            </button>
            <div className="flex-1" />
            <button
              onClick={handleOpenCleanup}
              disabled={isProcessing}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-50 flex items-center gap-1.5"
            >
              <FontAwesomeIcon icon={faTrash} />
              تنظيف القديم
            </button>
            <button
              onClick={() => setCompareModal((prev) => ({ ...prev, isOpen: true }))}
              disabled={isProcessing}
              className="bg-teal-500 hover:bg-teal-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-50 flex items-center gap-1.5"
            >
              <FontAwesomeIcon icon={faArrowsLeftRight} />
              مقارنة
            </button>
          </div>

          {/* ===== Table ===== */}
          <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
            {isFilesLoading && filesBackups.length === 0 ? (
              <div className="h-32 flex flex-col items-center justify-center text-slate-400 gap-2">
                <FontAwesomeIcon icon={faSpinner} spin className="text-2xl" />
                <p className="text-sm">جاري التحميل...</p>
              </div>
            ) : filesBackups.length === 0 ? (
              <div className="h-32 flex flex-col items-center justify-center text-slate-400 gap-2">
                <FontAwesomeIcon icon={faFile} className="text-3xl" />
                <p className="text-sm">لا توجد نسخ احتياطية للملفات</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-blue-50 text-slate-700">
                        <th className="p-2 sm:p-3 font-semibold whitespace-nowrap">الاسم</th>
                        <th className="p-2 sm:p-3 font-semibold whitespace-nowrap hidden md:table-cell">الحجم</th>
                        <th className="p-2 sm:p-3 font-semibold whitespace-nowrap hidden lg:table-cell">التاريخ</th>
                        <th className="p-2 sm:p-3 font-semibold whitespace-nowrap">النوع</th>
                        <th className="p-2 sm:p-3 font-semibold whitespace-nowrap">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filesBackups.map((backup) => (
                        <tr key={backup.id} className="border-t border-slate-100 hover:bg-slate-50">
                          <td className="p-2 sm:p-3 whitespace-nowrap">
                            <span className="font-medium text-slate-800 text-xs sm:text-sm">
                              {backup.fileName}
                            </span>
                          </td>
                          <td className="p-2 sm:p-3 text-slate-600 text-xs hidden md:table-cell">
                            {backup.sizeFormatted}
                          </td>
                          <td className="p-2 sm:p-3 text-slate-600 text-xs hidden lg:table-cell">
                            {formatDate(backup.createdAt)}
                          </td>
                          <td className="p-2 sm:p-3 whitespace-nowrap">
                            {getTypeBadge(backup.type)}
                          </td>
                          <td className="p-2 sm:p-3 whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handlePreview(
                                  backup.type === "Daily" ? BackupType.Daily :
                                  backup.type === "Monthly" ? BackupType.Monthly :
                                  BackupType.Annual,
                                  backup.id
                                )}
                                disabled={isProcessing}
                                className="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition flex items-center justify-center disabled:opacity-50"
                                title="معاينة"
                              >
                                <FontAwesomeIcon icon={faEye} className="text-[10px]" />
                              </button>
                              <button
                                onClick={() => handleOpenRestore(
                                  backup.type === "Daily" ? BackupType.Daily :
                                  backup.type === "Monthly" ? BackupType.Monthly :
                                  BackupType.Annual,
                                  backup.id
                                )}
                                disabled={isProcessing}
                                className="w-7 h-7 rounded-xl bg-blue-100 text-blue-600 hover:bg-blue-200 transition flex items-center justify-center disabled:opacity-50"
                                title="استعادة"
                              >
                                <FontAwesomeIcon icon={faDownload} className="text-[10px]" />
                              </button>
                              <button
                                onClick={() => handleDeleteFilesBackup(backup.id, backup.fileName)}
                                disabled={isProcessing}
                                className="w-7 h-7 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition flex items-center justify-center disabled:opacity-50"
                                title="حذف"
                              >
                                <FontAwesomeIcon icon={faTrash} className="text-[10px]" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

               {/* ===== Pagination ===== */}
{(totalPages > 1 || totalItems > pageSize) && (
  <div className="p-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
    <span className="text-xs text-slate-500 order-2 sm:order-1">
      عرض {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalItems)} من {totalItems}
    </span>
    <div className="flex items-center gap-1 order-1 sm:order-2">
      <button
        onClick={goToPrevPage}
        disabled={currentPage === 1 || isProcessing || isFilesLoading}
        className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition disabled:opacity-50 disabled:cursor-not-allowed text-xs flex items-center gap-1"
      >
        <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
        السابق
      </button>

      <div className="flex items-center gap-1">
        {(() => {
          const pagesToShow = Math.min(totalPages, 7);
          const pages = [];
          
          if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
              pages.push(i);
            }
          } else if (currentPage <= 4) {
            for (let i = 1; i <= 5; i++) pages.push(i);
            pages.push(-1); // النقاط
            pages.push(totalPages);
          } else if (currentPage >= totalPages - 3) {
            pages.push(1);
            pages.push(-1); // النقاط
            for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
          } else {
            pages.push(1);
            pages.push(-1); // النقاط
            for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
            pages.push(-1); // النقاط
            pages.push(totalPages);
          }

          return pages.map((pageNum, index) => {
            if (pageNum === -1) {
              return (
                <span key={`dots-${index}`} className="px-1 text-slate-400 text-xs">
                  ...
                </span>
              );
            }
            
            return (
              <button
                key={pageNum}
                onClick={() => goToPage(pageNum)}
                disabled={isProcessing || isFilesLoading}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition ${
                  pageNum === currentPage
                    ? "bg-blue-500 text-white shadow-md"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {pageNum}
              </button>
            );
          });
        })()}
      </div>

      <button
        onClick={goToNextPage}
        disabled={currentPage === totalPages || isProcessing || isFilesLoading}
        className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition disabled:opacity-50 disabled:cursor-not-allowed text-xs flex items-center gap-1"
      >
        التالي
        <FontAwesomeIcon icon={faChevronLeft} className="text-[10px]" />
      </button>
    </div>
  </div>
)}
              </>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ===== Create Backup Modal ===== */}
      {/* ============================================================ */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-4 sm:p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-800">
                إنشاء نسخة {createBackupType === "daily" ? "يومية" : createBackupType === "monthly" ? "شهرية" : "سنوية"}
              </h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-red-500 transition"
              >
                <FontAwesomeIcon icon={faXmark} className="text-lg" />
              </button>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">السنة</label>
                <input
                  type="number"
                  value={backupYear}
                  onChange={(e) => setBackupYear(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-sm outline-none focus:border-blue-400"
                />
              </div>

              {(createBackupType === "daily" || createBackupType === "monthly") && (
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">الشهر</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={backupMonth}
                    onChange={(e) => setBackupMonth(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-sm outline-none focus:border-blue-400"
                  />
                </div>
              )}

              {createBackupType === "daily" && (
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">اليوم</label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={backupDay}
                    onChange={(e) => setBackupDay(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-sm outline-none focus:border-blue-400"
                  />
                </div>
              )}
            </div>

            <button
              onClick={handleCreateBackup}
              disabled={isProcessing}
              className={`w-full py-2 sm:py-2.5 rounded-xl font-semibold transition text-sm mt-4 sm:mt-5 flex items-center justify-center gap-2 ${
                isProcessing
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-emerald-500 hover:bg-emerald-600 text-white"
              }`}
            >
              {isProcessing ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  جاري الإنشاء...
                </>
              ) : (
                "إنشاء"
              )}
            </button>
          </div>
        </div>
      )}

    {previewModal.isOpen && previewData && (
  <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl w-full max-w-4xl p-4 sm:p-6 shadow-xl max-h-[90vh] flex flex-col">
      {/* ===== Header ===== */}
      <div className="flex justify-between items-center mb-3 sm:mb-4 sticky top-0 bg-white z-10 pb-2 border-b border-slate-100">
        <h2 className="text-base sm:text-lg font-bold text-slate-800">
          {previewModal.selectMode ? 'اختر الملفات للاستعادة' : 'معاينة النسخة الاحتياطية'}
        </h2>
        <div className="flex items-center gap-2">
          {previewModal.selectMode && (
            <>
              <button
                onClick={() => {
                  const filtered = getFilteredPreviewFiles();
                  setPreviewModal((prev) => ({
                    ...prev,
                    selectedFiles: filtered.map((f) => f.filePath),
                  }));
                }}
                className="text-xs text-blue-500 hover:text-blue-700"
              >
                اختيار الكل
              </button>
              <button
                onClick={() => {
                  setPreviewModal((prev) => ({
                    ...prev,
                    selectedFiles: [],
                  }));
                }}
                className="text-xs text-red-500 hover:text-red-700"
              >
                إلغاء الكل
              </button>
            </>
          )}
          <button
            onClick={handleClosePreview}
            className="text-slate-400 hover:text-red-500 transition"
          >
            <FontAwesomeIcon icon={faXmark} className="text-lg" />
          </button>
        </div>
      </div>

      {/* ===== إحصائيات ===== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        <div className="bg-slate-50 rounded-xl p-2 text-center">
          <p className="text-[10px] text-slate-400">إجمالي الملفات</p>
          <p className="text-sm font-bold text-slate-800">{previewData.totalFiles}</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-2 text-center">
          <p className="text-[10px] text-slate-400">الحجم الإجمالي</p>
          <p className="text-sm font-bold text-slate-800">{previewData.totalSizeFormatted}</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-2 text-center">
          <p className="text-[10px] text-slate-400">التاريخ</p>
          <p className="text-sm font-bold text-slate-800">{formatDate(previewData.createdAt)}</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-2 text-center">
          <p className="text-[10px] text-slate-400">النوع</p>
          <p className="text-sm font-bold text-slate-800">{previewData.backupType}</p>
        </div>
      </div>

      {/* ===== Search ===== */}
      <div className="mb-3">
        <div className="relative">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"
          />
          <input
            type="text"
            value={previewModal.searchQuery}
            onChange={(e) => {
              setPreviewModal((prev) => ({
                ...prev,
                searchQuery: e.target.value,
                page: 1,
              }));
            }}
            placeholder="البحث في الملفات..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 pr-8 pl-3 text-sm outline-none focus:border-blue-400"
          />
        </div>
        <div className="text-[10px] text-slate-400 mt-1">
          تم العثور على {getFilteredPreviewFiles().length} ملف
        </div>
      </div>

      {/* ===== Table ===== */}
      {getFilteredPreviewFiles().length > 0 ? (
        <>
          <div className="overflow-x-auto flex-1 overflow-y-auto">
            <table className="w-full text-right text-xs">
              <thead className="sticky top-0 bg-blue-50">
                <tr className="text-slate-700">
                  {previewModal.selectMode && (
                    <th className="p-2 font-semibold w-8">#</th>
                  )}
                  <th className="p-2 font-semibold">الملف</th>
                  <th className="p-2 font-semibold">المسار</th>
                  <th className="p-2 font-semibold">الحجم</th>
                  <th className="p-2 font-semibold">الامتداد</th>
                  <th className="p-2 font-semibold">تاريخ التعديل</th>
                </tr>
              </thead>
              <tbody>
                {getPaginatedPreviewFiles().map((file, index) => (
                  <tr
                    key={index}
                    className={`border-t border-slate-100 hover:bg-slate-50 cursor-pointer ${
                      previewModal.selectMode && previewModal.selectedFiles.includes(file.filePath)
                        ? 'bg-blue-50'
                        : ''
                    }`}
                    onClick={() => previewModal.selectMode && toggleFileSelection(file.filePath)}
                  >
                    {previewModal.selectMode && (
                      <td className="p-2 text-center">
                        <input
                          type="checkbox"
                          checked={previewModal.selectedFiles.includes(file.filePath)}
                          onChange={() => toggleFileSelection(file.filePath)}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded border-slate-300 text-blue-500 focus:ring-blue-500"
                        />
                      </td>
                    )}
                    <td className="p-2 text-slate-800">{file.fileName}</td>
                    <td className="p-2 text-slate-500 text-[10px]">{file.filePath}</td>
                    <td className="p-2 text-slate-600">{file.sizeFormatted}</td>
                    <td className="p-2">
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                        {file.extension || "-"}
                      </span>
                    </td>
                    <td className="p-2 text-slate-500 text-[10px]">
                      {file.modifiedAt ? formatDate(file.modifiedAt) : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ===== Pagination ===== */}
          {getPreviewTotalPages() > 1 && (
            <div className="border-t border-slate-100 pt-3 mt-3 flex flex-col sm:flex-row items-center justify-between gap-2">
              <span className="text-[10px] text-slate-500 order-2 sm:order-1">
                عرض {((previewModal.page - 1) * previewModal.pageSize) + 1} - {Math.min(previewModal.page * previewModal.pageSize, getFilteredPreviewFiles().length)} من {getFilteredPreviewFiles().length}
              </span>
              <div className="flex items-center gap-1 order-1 sm:order-2">
                <button
                  onClick={() => goToPreviewPage(previewModal.page - 1)}
                  disabled={previewModal.page === 1}
                  className="px-2 py-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition disabled:opacity-50 disabled:cursor-not-allowed text-xs flex items-center gap-1"
                >
                  <FontAwesomeIcon icon={faChevronRight} className="text-[8px]" />
                </button>
                <span className="text-xs text-slate-600">
                  {previewModal.page} / {getPreviewTotalPages()}
                </span>
                <button
                  onClick={() => goToPreviewPage(previewModal.page + 1)}
                  disabled={previewModal.page === getPreviewTotalPages()}
                  className="px-2 py-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition disabled:opacity-50 disabled:cursor-not-allowed text-xs flex items-center gap-1"
                >
                  <FontAwesomeIcon icon={faChevronLeft} className="text-[8px]" />
                </button>
                <select
                  value={previewModal.pageSize}
                  onChange={(e) => {
                    setPreviewModal((prev) => ({
                      ...prev,
                      pageSize: Number(e.target.value),
                      page: 1,
                    }));
                  }}
                  className="text-xs border border-slate-200 rounded px-1.5 py-0.5 outline-none"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          )}
        </>
      ) : (
        <p className="text-center text-slate-400 py-4">لا توجد ملفات تطابق البحث</p>
      )}

      {/* ===== زر تأكيد الاختيار ===== */}
      {previewModal.selectMode && (
        <div className="mt-3 flex justify-end gap-2 border-t border-slate-100 pt-3">
          <span className="text-xs text-slate-500">
            تم اختيار {previewModal.selectedFiles.length} ملف
          </span>
          <button
            onClick={handleSelectFilesFromPreview}
            disabled={previewModal.selectedFiles.length === 0}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-1.5 rounded-xl text-sm font-medium transition disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faCheckCircle} className="ml-2" />
            تأكيد الاختيار
          </button>
        </div>
      )}
    </div>
  </div>
)}
      {/* ============================================================ */}
      {/* ===== Compare Modal ===== */}
      {/* ============================================================ */}
      {compareModal.isOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-4 sm:p-6 shadow-xl">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-800">مقارنة ملفين</h2>
              <button
                onClick={() => setCompareModal((prev) => ({ ...prev, isOpen: false }))}
                className="text-slate-400 hover:text-red-500 transition"
              >
                <FontAwesomeIcon icon={faXmark} className="text-lg" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">الملف الأول</label>
                <select
                  value={compareModal.backup1Id}
                  onChange={(e) => setCompareModal((prev) => ({ ...prev, backup1Id: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-sm outline-none focus:border-blue-400"
                >
                  <option value="">اختر ملف...</option>
                  {filesBackups.map((b) => (
                    <option key={b.id} value={b.id}>{b.fileName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">الملف الثاني</label>
                <select
                  value={compareModal.backup2Id}
                  onChange={(e) => setCompareModal((prev) => ({ ...prev, backup2Id: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-sm outline-none focus:border-blue-400"
                >
                  <option value="">اختر ملف...</option>
                  {filesBackups.map((b) => (
                    <option key={b.id} value={b.id}>{b.fileName}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleCompare}
              disabled={isProcessing || !compareModal.backup1Id || !compareModal.backup2Id}
              className={`w-full py-2 sm:py-2.5 rounded-xl font-semibold transition text-sm mt-4 flex items-center justify-center gap-2 ${
                isProcessing || !compareModal.backup1Id || !compareModal.backup2Id
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-teal-500 hover:bg-teal-600 text-white"
              }`}
            >
              {isProcessing ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  جاري المقارنة...
                </>
              ) : (
                "مقارنة"
              )}
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ===== Compare Result Modal ===== */}
      {/* ============================================================ */}
      {compareResultModal && compareResult && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl p-4 sm:p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3 sm:mb-4 sticky top-0 bg-white z-10 pb-2 border-b border-slate-100">
              <h2 className="text-base sm:text-lg font-bold text-slate-800">نتيجة المقارنة</h2>
              <button
                onClick={() => {
                  setCompareResultModal(false);
                  setCompareResult(null);
                }}
                className="text-slate-400 hover:text-red-500 transition"
              >
                <FontAwesomeIcon icon={faXmark} className="text-lg" />
              </button>
            </div>

            {/* ===== إحصائيات المقارنة ===== */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4">
              <div className="bg-blue-50 rounded-xl p-2 sm:p-3 text-center">
                <p className="text-[9px] sm:text-[10px] text-slate-400">الملف الأول</p>
                <p className="text-[10px] sm:text-xs font-medium text-slate-700 truncate">
                  {compareResult.backup1Id}
                </p>
                <p className="text-[10px] text-slate-500">
                  {formatDate(compareResult.backup1Date)}
                </p>
              </div>
              <div className="bg-blue-50 rounded-xl p-2 sm:p-3 text-center">
                <p className="text-[9px] sm:text-[10px] text-slate-400">الملف الثاني</p>
                <p className="text-[10px] sm:text-xs font-medium text-slate-700 truncate">
                  {compareResult.backup2Id}
                </p>
                <p className="text-[10px] text-slate-500">
                  {formatDate(compareResult.backup2Date)}
                </p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-2 sm:p-3 text-center">
                <p className="text-[9px] sm:text-[10px] text-slate-400">الملفات</p>
                <p className="text-sm font-bold text-slate-800">
                  {compareResult.totalFilesInBackup1} → {compareResult.totalFilesInBackup2}
                </p>
                <p className="text-[10px] text-slate-500">
                  {compareResult.fileCountDifference > 0 ? `+${compareResult.fileCountDifference}` : compareResult.fileCountDifference}
                </p>
              </div>
              <div className="bg-purple-50 rounded-xl p-2 sm:p-3 text-center">
                <p className="text-[9px] sm:text-[10px] text-slate-400">الحجم</p>
                <p className="text-sm font-bold text-slate-800">
                  {compareResult.sizeDifferenceFormatted}
                </p>
                <p className="text-[10px] text-slate-500">
                  {compareResult.sizeDifference > 0 ? "زيادة" : "نقصان"}
                </p>
              </div>
            </div>

            {/* ===== تفاصيل الفروقات ===== */}
            <div className="space-y-3">
              {/* ===== الملفات الجديدة ===== */}
              {compareResult.newFiles.length > 0 && (
                <div className="border border-emerald-200 rounded-xl overflow-hidden">
                  <div className="bg-emerald-50 px-3 py-2 flex items-center gap-2">
                    <span className="text-emerald-600 font-medium text-xs">
                      🆕 الملفات الجديدة ({compareResult.newFiles.length})
                    </span>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    <table className="w-full text-right text-xs">
                      <thead className="sticky top-0 bg-white">
                        <tr className="text-slate-600 border-b border-slate-100">
                          <th className="p-2 font-medium">الملف</th>
                          <th className="p-2 font-medium">الحجم</th>
                          <th className="p-2 font-medium">تاريخ التعديل</th>
                        </tr>
                      </thead>
                      <tbody>
                        {compareResult.newFiles.map((file: FileDifference, index: number) => (
                          <tr key={index} className="border-b border-slate-50 hover:bg-slate-50">
                            <td className="p-2 text-slate-700 text-[10px]">{file.path}</td>
                            <td className="p-2 text-slate-600">{formatSize(file.size || 0)}</td>
                            <td className="p-2 text-slate-500 text-[10px]">
                              {file.modified ? formatDate(file.modified) : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ===== الملفات المعدلة ===== */}
              {compareResult.modifiedFiles.length > 0 && (
                <div className="border border-yellow-200 rounded-xl overflow-hidden">
                  <div className="bg-yellow-50 px-3 py-2 flex items-center gap-2">
                    <span className="text-yellow-600 font-medium text-xs">
                      ✏️ الملفات المعدلة ({compareResult.modifiedFiles.length})
                    </span>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    <table className="w-full text-right text-xs">
                      <thead className="sticky top-0 bg-white">
                        <tr className="text-slate-600 border-b border-slate-100">
                          <th className="p-2 font-medium">الملف</th>
                          <th className="p-2 font-medium">الحجم القديم</th>
                          <th className="p-2 font-medium">الحجم الجديد</th>
                          <th className="p-2 font-medium">تاريخ التعديل</th>
                        </tr>
                      </thead>
                      <tbody>
                        {compareResult.modifiedFiles.map((file: FileDifference, index: number) => (
                          <tr key={index} className="border-b border-slate-50 hover:bg-slate-50">
                            <td className="p-2 text-slate-700 text-[10px]">{file.path}</td>
                            <td className="p-2 text-slate-600">{formatSize(file.oldSize || 0)}</td>
                            <td className="p-2 text-slate-600">{formatSize(file.newSize || 0)}</td>
                            <td className="p-2 text-slate-500 text-[10px]">
                              {file.modified ? formatDate(file.modified) : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ===== الملفات المحذوفة ===== */}
              {compareResult.deletedFiles.length > 0 && (
                <div className="border border-red-200 rounded-xl overflow-hidden">
                  <div className="bg-red-50 px-3 py-2 flex items-center gap-2">
                    <span className="text-red-600 font-medium text-xs">
                      🗑️ الملفات المحذوفة ({compareResult.deletedFiles.length})
                    </span>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    <table className="w-full text-right text-xs">
                      <thead className="sticky top-0 bg-white">
                        <tr className="text-slate-600 border-b border-slate-100">
                          <th className="p-2 font-medium">الملف</th>
                          <th className="p-2 font-medium">الحجم</th>
                          <th className="p-2 font-medium">تاريخ التعديل</th>
                        </tr>
                      </thead>
                      <tbody>
                        {compareResult.deletedFiles.map((file: FileDifference, index: number) => (
                          <tr key={index} className="border-b border-slate-50 hover:bg-slate-50">
                            <td className="p-2 text-slate-700 text-[10px]">{file.path}</td>
                            <td className="p-2 text-slate-600">{formatSize(file.size || 0)}</td>
                            <td className="p-2 text-slate-500 text-[10px]">
                              {file.modified ? formatDate(file.modified) : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ===== الملفات المتطابقة ===== */}
              {compareResult.sameFiles.length > 0 && (
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-gray-50 px-3 py-2 flex items-center gap-2">
                    <span className="text-gray-600 font-medium text-xs">
                      ✅ الملفات المتطابقة ({compareResult.sameFiles.length})
                    </span>
                  </div>
                  <div className="max-h-32 overflow-y-auto">
                    <table className="w-full text-right text-xs">
                      <thead className="sticky top-0 bg-white">
                        <tr className="text-slate-600 border-b border-slate-100">
                          <th className="p-2 font-medium">الملف</th>
                          <th className="p-2 font-medium">الحجم</th>
                        </tr>
                      </thead>
                      <tbody>
                        {compareResult.sameFiles.map((file: FileDifference, index: number) => (
                          <tr key={index} className="border-b border-slate-50 hover:bg-slate-50">
                            <td className="p-2 text-slate-700 text-[10px]">{file.path}</td>
                            <td className="p-2 text-slate-600">{formatSize(file.size || 0)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {compareResult.newFiles.length === 0 &&
                compareResult.modifiedFiles.length === 0 &&
                compareResult.deletedFiles.length === 0 && (
                  <div className="text-center py-8 text-slate-400">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-3xl mb-2 text-emerald-500" />
                    <p className="text-sm">الملفان متطابقان تماماً</p>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ===== Restore Result Modal ===== */}
      {/* ============================================================ */}
      {restoreResultModal && restoreResult && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-4 sm:p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3 sm:mb-4 sticky top-0 bg-white z-10 pb-2 border-b border-slate-100">
              <h2 className="text-base sm:text-lg font-bold text-slate-800">
                نتيجة الاستعادة
              </h2>
              <button
                onClick={() => {
                  setRestoreResultModal(false);
                  setRestoreResult(null);
                }}
                className="text-slate-400 hover:text-red-500 transition"
              >
                <FontAwesomeIcon icon={faXmark} className="text-lg" />
              </button>
            </div>

            {/* ===== إحصائيات الاستعادة ===== */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4">
              <div className="bg-emerald-50 rounded-xl p-2 text-center">
                <p className="text-[9px] text-slate-400">تم الاستعادة</p>
                <p className="text-sm font-bold text-emerald-600">{restoreResult.restoredFiles}</p>
              </div>
              <div className="bg-yellow-50 rounded-xl p-2 text-center">
                <p className="text-[9px] text-slate-400">تم التخطي</p>
                <p className="text-sm font-bold text-yellow-600">{restoreResult.skippedFiles}</p>
              </div>
              <div className="bg-red-50 rounded-xl p-2 text-center">
                <p className="text-[9px] text-slate-400">فشل</p>
                <p className="text-sm font-bold text-red-600">{restoreResult.failedFiles}</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-2 text-center">
                <p className="text-[9px] text-slate-400">إجمالي الملفات</p>
                <p className="text-sm font-bold text-slate-800">{restoreResult.totalFiles}</p>
              </div>
            </div>

            {/* ===== الملفات الفاشلة ===== */}
            {restoreResult.failedFiles > 0 && restoreResult.failedFilesList.length > 0 && (
              <div className="border border-red-200 rounded-xl overflow-hidden mb-3">
                <div className="bg-red-50 px-3 py-2 flex items-center justify-between">
                  <span className="text-red-600 font-medium text-xs">
                    ❌ الملفات الفاشلة ({restoreResult.failedFilesList.length})
                  </span>
                  <button
                    onClick={() => {
                      let type: BackupType = BackupType.Daily;
                      if (restoreResult.backupType === "Monthly") type = BackupType.Monthly;
                      else if (restoreResult.backupType === "Annual") type = BackupType.Annual;

                      openRetryModal(type, restoreResult.backupId, restoreResult.failedFilesList);
                      setRestoreResultModal(false);
                    }}
                    disabled={isProcessing}
                    className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-lg text-[10px] font-medium transition disabled:opacity-50 flex items-center gap-1"
                  >
                    <FontAwesomeIcon icon={faRotateRight} className="text-[8px]" />
                    إعادة محاولة الفاشل
                  </button>
                </div>
                <div className="max-h-32 overflow-y-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="sticky top-0 bg-white">
                      <tr className="text-slate-600 border-b border-slate-100">
                        <th className="p-2 font-medium">#</th>
                        <th className="p-2 font-medium">الملف</th>
                      </tr>
                    </thead>
                    <tbody>
                      {restoreResult.failedFilesList.map((file, index) => (
                        <tr key={index} className="border-b border-slate-50 hover:bg-slate-50">
                          <td className="p-2 text-slate-400">{index + 1}</td>
                          <td className="p-2 text-slate-700 text-[10px]">{file}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ===== الملفات المستعادة ===== */}
            {restoreResult.restoredFilesList.length > 0 && (
              <div className="border border-emerald-200 rounded-xl overflow-hidden">
                <div className="bg-emerald-50 px-3 py-2">
                  <span className="text-emerald-600 font-medium text-xs">
                    ✅ الملفات المستعادة ({restoreResult.restoredFilesList.length})
                  </span>
                </div>
                <div className="max-h-32 overflow-y-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="sticky top-0 bg-white">
                      <tr className="text-slate-600 border-b border-slate-100">
                        <th className="p-2 font-medium">#</th>
                        <th className="p-2 font-medium">الملف</th>
                      </tr>
                    </thead>
                    <tbody>
                      {restoreResult.restoredFilesList.map((file, index) => (
                        <tr key={index} className="border-b border-slate-50 hover:bg-slate-50">
                          <td className="p-2 text-slate-400">{index + 1}</td>
                          <td className="p-2 text-slate-700 text-[10px]">{file}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ===== Retry Modal (تأكيد إعادة المحاولة) ===== */}
      {/* ============================================================ */}
      {retryModal.isOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-4 sm:p-6 shadow-xl">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-800">
                إعادة محاولة الملفات الفاشلة
              </h2>
              <button
                onClick={() => setRetryModal((prev) => ({ ...prev, isOpen: false }))}
                className="text-slate-400 hover:text-red-500 transition"
              >
                <FontAwesomeIcon icon={faXmark} className="text-lg" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="bg-red-50 rounded-xl p-3 border border-red-200">
                <p className="text-sm text-red-700">
                  <FontAwesomeIcon icon={faTimesCircle} className="ml-2" />
                  عدد الملفات الفاشلة: <strong>{retryModal.failedFiles.length}</strong>
                </p>
              </div>
              <div className="bg-yellow-50 rounded-xl p-3 border border-yellow-200">
                <p className="text-xs text-yellow-700">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="ml-2" />
                  سيتم إعادة محاولة استعادة الملفات الفاشلة. يتطلب هذا الإجراء موافقة العميد.
                </p>
              </div>
              <div className="max-h-32 overflow-y-auto">
                <div className="text-xs text-slate-600">
                  <p className="font-medium mb-1">قائمة الملفات الفاشلة:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-[10px] text-slate-500">
                    {retryModal.failedFiles.slice(0, 10).map((file, index) => (
                      <li key={index} className="truncate">{file}</li>
                    ))}
                    {retryModal.failedFiles.length > 10 && (
                      <li className="text-slate-400">... و {retryModal.failedFiles.length - 10} ملفات أخرى</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setRetryModal((prev) => ({ ...prev, isOpen: false }))}
                className="flex-1 py-2 rounded-xl font-semibold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
              >
                إلغاء
              </button>
              <button
                onClick={handleRetryFailed}
                disabled={isProcessing}
                className="flex-1 py-2 rounded-xl font-semibold text-sm bg-red-500 hover:bg-red-600 text-white transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin />
                    جاري...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faRotateRight} />
                    إعادة المحاولة
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

     {/* ===== Restore Modal ===== */}
{restoreModal.isOpen && (
  <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl w-full max-w-md p-4 sm:p-6 shadow-xl max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-3 sm:mb-4">
        <h2 className="text-base sm:text-lg font-bold text-slate-800">استعادة النسخة الاحتياطية</h2>
        <button
          onClick={() => setRestoreModal((prev) => ({ ...prev, isOpen: false }))}
          className="text-slate-400 hover:text-red-500 transition"
        >
          <FontAwesomeIcon icon={faXmark} className="text-lg" />
        </button>
      </div>

      <div className="space-y-3">
        {/* ===== الخيارات الأساسية ===== */}
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-600">
            <input
              type="checkbox"
              checked={restoreModal.overwrite}
              onChange={(e) => setRestoreModal((prev) => ({ ...prev, overwrite: e.target.checked }))}
              className="rounded border-slate-300"
            />
            استبدال الملفات الموجودة
          </label>
          <label className="flex items-center gap-2 text-xs text-slate-600">
            <input
              type="checkbox"
              checked={restoreModal.dryRun}
              onChange={(e) => setRestoreModal((prev) => ({ ...prev, dryRun: e.target.checked }))}
              className="rounded border-slate-300"
            />
            تجربة بدون تنفيذ
          </label>
          <label className="flex items-center gap-2 text-xs text-slate-600">
            <input
              type="checkbox"
              checked={restoreModal.validateIntegrity}
              onChange={(e) => setRestoreModal((prev) => ({ ...prev, validateIntegrity: e.target.checked }))}
              className="rounded border-slate-300"
            />
            التحقق من التكامل
          </label>
        </div>

        <hr className="border-slate-200" />

        {/* ===== Include Patterns ===== */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            تضمين الملفات (Include Patterns)
            <span className="text-slate-400 text-[10px] mr-1">(اختياري)</span>
          </label>
          <div className="flex gap-1">
            <input
              type="text"
              value={restoreModal.includePatternsInput}
              onChange={(e) => setRestoreModal((prev) => ({ ...prev, includePatternsInput: e.target.value }))}
              placeholder="مثل: *.pdf, *.docx"
              className="flex-1 border border-slate-200 rounded-xl p-2 text-sm outline-none focus:border-blue-400"
              onKeyDown={(e) => e.key === 'Enter' && addIncludePattern()}
            />
            <button
              onClick={addIncludePattern}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 rounded-xl text-xs font-medium transition"
            >
              +
            </button>
          </div>
          {restoreModal.includePatterns.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {restoreModal.includePatterns.map((pattern, index) => (
                <span key={index} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1">
                  {pattern}
                  <button
                    onClick={() => removeIncludePattern(index)}
                    className="text-blue-400 hover:text-red-500"
                  >
                    <FontAwesomeIcon icon={faXmark} className="text-[8px]" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ===== Exclude Patterns ===== */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            استبعاد الملفات (Exclude Patterns)
            <span className="text-slate-400 text-[10px] mr-1">(اختياري)</span>
          </label>
          <div className="flex gap-1">
            <input
              type="text"
              value={restoreModal.excludePatternsInput}
              onChange={(e) => setRestoreModal((prev) => ({ ...prev, excludePatternsInput: e.target.value }))}
              placeholder="مثل: *.tmp, *.log"
              className="flex-1 border border-slate-200 rounded-xl p-2 text-sm outline-none focus:border-blue-400"
              onKeyDown={(e) => e.key === 'Enter' && addExcludePattern()}
            />
            <button
              onClick={addExcludePattern}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 rounded-xl text-xs font-medium transition"
            >
              +
            </button>
          </div>
          {restoreModal.excludePatterns.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {restoreModal.excludePatterns.map((pattern, index) => (
                <span key={index} className="bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1">
                  {pattern}
                  <button
                    onClick={() => removeExcludePattern(index)}
                    className="text-yellow-400 hover:text-red-500"
                  >
                    <FontAwesomeIcon icon={faXmark} className="text-[8px]" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

       {/* ===== Specific Files ===== */}
<div>
  <label className="block text-xs font-medium text-slate-600 mb-1">
    ملفات محددة (Specific Files)
    <span className="text-slate-400 text-[10px] mr-1">(اختياري)</span>
  </label>
  
  {/* ✅ حقل البحث عن الملفات المضافة */}
  <div className="relative mb-1">
    <FontAwesomeIcon
      icon={faSearch}
      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]"
    />
    <input
      type="text"
      value={restoreModal.specificFilesInput}
      onChange={(e) => setRestoreModal((prev) => ({ ...prev, specificFilesInput: e.target.value }))}
      placeholder="ابحث عن ملف محدد أو اكتب مساره..."
      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 pr-7 pl-3 text-sm outline-none focus:border-blue-400"
      onKeyDown={(e) => e.key === 'Enter' && addSpecificFile()}
    />
  </div>
  
  <div className="flex gap-1">
    <input
      type="text"
      value={restoreModal.specificFilesInput}
      onChange={(e) => setRestoreModal((prev) => ({ ...prev, specificFilesInput: e.target.value }))}
      placeholder="مسار ملف محدد"
      className="flex-1 border border-slate-200 rounded-xl p-2 text-sm outline-none focus:border-blue-400"
      onKeyDown={(e) => e.key === 'Enter' && addSpecificFile()}
    />
    <button
      onClick={addSpecificFile}
      className="bg-purple-500 hover:bg-purple-600 text-white px-3 rounded-xl text-xs font-medium transition"
    >
      +
    </button>
  </div>
  
  {/* ✅ زر اختيار من المعاينة */}
  <button
    onClick={() => {
      if (!restoreModal.type || !restoreModal.backupId) {
        toast.error("لا توجد نسخة احتياطية محددة");
        return;
      }
      setRestoreModal((prev) => ({ ...prev, isOpen: false }));
      setPreviewModal({
        isOpen: true,
        type: restoreModal.type,
        backupId: restoreModal.backupId,
        selectMode: true,
        selectedFiles: [],
        searchQuery: "",
        page: 1,
        pageSize: 10,
      });
    }}
    className="text-[10px] text-blue-500 hover:text-blue-700 transition mt-1"
  >
    <FontAwesomeIcon icon={faEye} className="ml-1" />
    اختر من الملفات المعروضة في المعاينة
  </button>
  
  {/* ===== عرض الملفات المضافة مع فلتر بحث ===== */}
  {restoreModal.specificFiles.length > 0 && (
    <div className="mt-2">
      {/* ✅ حقل بحث داخل الملفات المضافة */}
      <div className="relative mb-1">
        <FontAwesomeIcon
          icon={faSearch}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]"
        />
        <input
          type="text"
          placeholder="فلترة الملفات المضافة..."
          className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1 pr-7 pl-2 text-xs outline-none focus:border-blue-400"
          onChange={(e) => {
            // يمكنك إضافة state للبحث داخل specificFiles إذا أردت
          }}
        />
      </div>
      <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
        {restoreModal.specificFiles.map((file, index) => (
          <span key={index} className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1">
            {file}
            <button
              onClick={() => removeSpecificFile(index)}
              className="text-purple-400 hover:text-red-500"
            >
              <FontAwesomeIcon icon={faXmark} className="text-[8px]" />
            </button>
          </span>
        ))}
      </div>
    </div>
  )}
</div>
      </div>

      <button
        onClick={handleRestore}
        disabled={isProcessing}
        className={`w-full py-2 sm:py-2.5 rounded-xl font-semibold transition text-sm mt-4 flex items-center justify-center gap-2 ${
          isProcessing
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-blue-500 hover:bg-blue-600 text-white"
        }`}
      >
        {isProcessing ? (
          <>
            <FontAwesomeIcon icon={faSpinner} spin />
            جاري الاستعادة...
          </>
        ) : (
          "استعادة"
        )}
      </button>
    </div>
  </div>
)}

      {/* ============================================================ */}
      {/* ===== Cleanup Modal ===== */}
      {/* ============================================================ */}
      {cleanupModal.isOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-4 sm:p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-800">تنظيف النسخ القديمة</h2>
              <button
                onClick={() => setCleanupModal((prev) => ({ ...prev, isOpen: false }))}
                className="text-slate-400 hover:text-red-500 transition"
              >
                <FontAwesomeIcon icon={faXmark} className="text-lg" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">الاحتفاظ بالنسخ اليومية (أيام)</label>
                <input
                  type="number"
                  min={1}
                  value={cleanupModal.dailyRetentionDays}
                  onChange={(e) => setCleanupModal((prev) => ({ ...prev, dailyRetentionDays: Number(e.target.value) }))}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-sm outline-none focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">الاحتفاظ بالنسخ الشهرية (أشهر)</label>
                <input
                  type="number"
                  min={1}
                  value={cleanupModal.monthlyRetentionMonths}
                  onChange={(e) => setCleanupModal((prev) => ({ ...prev, monthlyRetentionMonths: Number(e.target.value) }))}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-sm outline-none focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">الاحتفاظ بالنسخ السنوية (سنوات)</label>
                <input
                  type="number"
                  min={1}
                  value={cleanupModal.annualRetentionYears}
                  onChange={(e) => setCleanupModal((prev) => ({ ...prev, annualRetentionYears: Number(e.target.value) }))}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-sm outline-none focus:border-blue-400"
                />
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-600">
                <input
                  type="checkbox"
                  checked={cleanupModal.keepPermanent}
                  onChange={(e) => setCleanupModal((prev) => ({ ...prev, keepPermanent: e.target.checked }))}
                  className="rounded border-slate-300"
                />
                الاحتفاظ بالنسخ الدائمة
              </label>
            </div>

            <button
              onClick={handleCleanup}
              disabled={isProcessing}
              className={`w-full py-2 sm:py-2.5 rounded-xl font-semibold transition text-sm mt-4 flex items-center justify-center gap-2 ${
                isProcessing
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-yellow-500 hover:bg-yellow-600 text-white"
              }`}
            >
              {isProcessing ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  جاري التنظيف...
                </>
              ) : (
                "تنظيف"
              )}
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ===== Confirmation Modal ===== */}
      {/* ============================================================ */}
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