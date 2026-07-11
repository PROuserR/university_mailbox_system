/* eslint-disable @typescript-eslint/no-explicit-any */
// components/mail/MailList.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSortAmountDown,
  faSortAmountUp,
  faSpinner,
  faInbox,
  faTrash,
  faBuilding,
  faFile,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";

import { apiWrapper } from "@/utils/apiClient";
import { Mail } from "@/types/api/Mail/Mail";
import { MailPageResponse } from "@/types/api/Mail/MailPageResponse";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";
import MailCard from "./MailCard";
import MailListLoader from "@/components/ui/MailListLoader";
import MailListError from "@/components/ui/MailListError";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { useDocumentTypes, useSenderEntities } from "@/hooks/useCorrespondence";
import useMailFilterStore from "@/store/mailFilterStore"; // ✅ إضافة

export default function MailList() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { filter: filterFromStore } = useMailFilterStore();

  const { data: documentTypesData } = useDocumentTypes();
  const { data: senderEntitiesData } = useSenderEntities();

  const documentTypes = documentTypesData || [];
  const senderEntities = senderEntitiesData || [];

  const [sortBy, setSortBy] = useState("CreatedAt");
  const [sortOrderDESC, setSortOrderDESC] = useState(true);
  const [documentTypeId, setDocumentTypeId] = useState<number | undefined>(undefined);
  const [senderEntityId, setSenderEntityId] = useState<number | undefined>(undefined);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // =========================
  // FETCH MAILS
  // =========================

  const fetchMails = async (pageParam: number): Promise<MailPageResponse> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params: any = {
      PageSize: 12,
      Page: pageParam,
      SortBy: sortBy,
      SortOrderDESC: sortOrderDESC,
    };

   if (filterFromStore && filterFromStore !== "") {
  if (filterFromStore === "Professional") {
    params.IsProfessional = true;
  } else {
    params.MainType = filterFromStore;
  }
}
    if (documentTypeId) {
      params.DocumentTypeId = documentTypeId;
    }

    if (senderEntityId) {
      params.SenderEntityId = senderEntityId;
    }

    const res = await apiWrapper.get<{ data: MailPageResponse }>(
      "/Correspondences/paged",
      params
    );

    if (!res.success || !res.data) {
      throw new Error("Failed to fetch mails");
    }

    return res.data.data;
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteQuery<MailPageResponse>({
    queryKey: ["mails", sortBy, sortOrderDESC, filterFromStore, documentTypeId, senderEntityId],
    queryFn: ({ pageParam = 1 }) => fetchMails(pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.flatMap((p) => p.items).length;
      return loaded < lastPage.totalCount ? allPages.length + 1 : undefined;
    },
  });

  const mailList = data?.pages.flatMap((page) => page.items) ?? [];

  const bottomRef = useInfiniteScroll({
    onBottom: fetchNextPage,
    isLoading: isFetchingNextPage,
    hasMore: !!hasNextPage,
    dataLength: mailList.length,
  });

  // =========================
  // DELETE MAIL
  // =========================

  const handleDeleteClick = (id: string) => {
    setDeleteTargetId(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;

    try {
      const res = await apiWrapper.delete(`Correspondences/${deleteTargetId}`);

      if (res.success) {
        queryClient.setQueryData(
          ["mails", sortBy, sortOrderDESC, filterFromStore, documentTypeId, senderEntityId],
          (oldData: any) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              pages: oldData.pages.map((page: MailPageResponse) => ({
                ...page,
                items: page.items.filter(
                  (mail: Mail) => String(mail.id) !== deleteTargetId
                ),
                totalCount: page.totalCount - 1,
              })),
            };
          }
        );
        toast.success("تم حذف البريد بنجاح");
      } else {
        toast.error(res.error || "لا يمكن حذف البريد بعد توزيعه");
      }
    } catch (error) {
      toast.error("فشل حذف البريد");
    } finally {
      setDeleteTargetId(null);
      setDeleteModalOpen(false);
    }
  };

  // =========================
  // OPEN / EDIT MAIL
  // =========================

  const openMail = (mail: Mail) => {
    router.push(`/mail/${mail.id}`);
  };

  const editMail = (mail: Mail) => {
    router.push(`/mail/${mail.id}/edit`);
  };

  // =========================
  // RENDER
  // =========================

  if (isLoading) return <MailListLoader />;
  if (isError) return <MailListError onRetry={() => refetch()} />;

  return (
    <div className="flex flex-col h-full w-full bg-gray-50">
      {/* ===== شريط الفلتر والترتيب ===== */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 sticky top-0 z-10">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {/* ✅ عرض الفلتر النشط من الـ Sidebar */}
            <div className="flex items-center gap-1 bg-blue-50 border border-blue-200 rounded-lg px-2 py-1">
              <span className="text-xs text-blue-600 font-medium">
                {filterFromStore ? (
                  <>
                    <FontAwesomeIcon icon={faInbox} className="ml-1" />
                    {filterFromStore === "Incoming" && "وارد"}
                    {filterFromStore === "Outgoing" && "صادر"}
                    {filterFromStore === "Internal" && "داخلي"}
                    {filterFromStore === "Professional" && "مهني"}
                  </>
                ) : (
                  "جميع الرسائل"
                )}
              </span>
            </div>

            {/* ✅ فلتر نوع الوثيقة */}
            <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1">
              <FontAwesomeIcon icon={faFile} className="text-blue-500 text-xs" />
              <select
                value={documentTypeId || ""}
                onChange={(e) => setDocumentTypeId(e.target.value ? Number(e.target.value) : undefined)}
                className="text-sm bg-transparent outline-none text-gray-600 cursor-pointer max-w-[120px]"
              >
                <option value="">نوع الوثيقة</option>
                {documentTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            {/* ✅ فلتر الجهة المرسلة */}
            <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1">
              <FontAwesomeIcon icon={faBuilding} className="text-blue-500 text-xs" />
              <select
                value={senderEntityId || ""}
                onChange={(e) => setSenderEntityId(e.target.value ? Number(e.target.value) : undefined)}
                className="text-sm bg-transparent outline-none text-gray-600 cursor-pointer max-w-[120px]"
              >
                <option value="">الجهة المرسلة</option>
                {senderEntities.map((entity) => (
                  <option key={entity.id} value={entity.id}>
                    {entity.name}
                  </option>
                ))}
              </select>
            </div>

            {/* ✅ الترتيب */}
            <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm bg-transparent outline-none text-gray-600 cursor-pointer"
              >
                <option value="CreatedAt">التاريخ</option>
                <option value="Title">العنوان</option>
                <option value="Number">الرقم</option>
                <option value="SenderEntity">الجهة المرسلة</option>
              </select>
              <button
                onClick={() => setSortOrderDESC(!sortOrderDESC)}
                className="text-blue-600 p-1 hover:bg-blue-50 rounded transition"
              >
                <FontAwesomeIcon
                  icon={sortOrderDESC ? faSortAmountDown : faSortAmountUp}
                />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1 text-sm text-gray-500">
            <FontAwesomeIcon icon={faInbox} className="text-blue-500" />
            <span>البريد</span>
            <span className="text-gray-300 mx-1">|</span>
            <span className="font-medium text-gray-700">{mailList.length}</span>
          </div>
        </div>
      </div>

      {/* ===== قائمة البريد ===== */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {mailList.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-lg font-medium">لا توجد رسائل</p>
            {filterFromStore && (
              <p className="text-sm text-gray-400">
                الفلتر: {filterFromStore === "Incoming" && "وارد"}
                {filterFromStore === "Outgoing" && "صادر"}
                {filterFromStore === "Internal" && "داخلي"}
                {filterFromStore === "Professional" && "مهني"}
              </p>
            )}
          </div>
        ) : (
          mailList.map((mail, index) => (
            <MailCard
              key={mail.id}
              mail={mail}
              index={index}
              onClick={openMail}
              onEdit={editMail}
              onDelete={() => handleDeleteClick(String(mail.id))}
              isDeleting={deleteTargetId === String(mail.id)}
              editable={true}
            />
          ))
        )}

        <ConfirmationModal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setDeleteTargetId(null);
          }}
          onConfirm={confirmDelete}
          title="حذف المراسلة"
          message="هل أنت متأكد من حذف هذه المراسلة؟ لا يمكن التراجع عن هذا الإجراء."
          confirmText="نعم، احذف"
          cancelText="إلغاء"
          variant="danger"
          icon={faTrash}
        />

        <div ref={bottomRef} className="py-2">
          {isFetchingNextPage && (
            <div className="flex justify-center items-center gap-2 text-blue-600 py-2">
              <FontAwesomeIcon icon={faSpinner} spin />
              <span className="text-sm">جاري تحميل المزيد...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}