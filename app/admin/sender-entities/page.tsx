// app/dashboard/admin/page.tsx
"use client";

import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useSenderEntities, useSenderEntityOperations } from "@/hooks/useSenderEntity";
import { SenderEntityTable } from "@/components/sender-entity";

export default function SenderEntitiesPage() {
  useAuthGuard();

  const { entities, loading, refetch } = useSenderEntities();
  const { isLoading, create, update, delete: remove, activate, deactivate } = useSenderEntityOperations();

  const handleCreate = async (name: string) => {
    await create({ name });
    refetch();
  };

  const handleEdit = async (id: number, name: string) => {
    await update(id, { name });
    refetch();
  };

  const handleDelete = async (id: number) => {
    await remove(id);
    refetch();
  };

  const handleActivate = async (id: number) => {
    await activate(id);
    refetch();
  };

  const handleDeactivate = async (id: number) => {
    await deactivate(id);
    refetch();
  };

  return (
    <div className="flex-1 overflow-hidden p-4 md:p-6 lg:p-8" dir="rtl">
      {/* Header - Responsive */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">
          إدارة الجهات المرسلة
        </h1>
        <p className="text-sm md:text-base text-gray-500 mt-1 md:mt-2">
          إضافة وتعديل وحذف الجهات التي ترسل المراسلات (رئاسة الجامعة، الكليات، الجهات الخارجية...)
        </p>
      </div>

      {/* Table - Responsive */}
      <SenderEntityTable
        entities={entities}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onActivate={handleActivate}
        onDeactivate={handleDeactivate}
        onCreate={handleCreate}
        isOperationsLoading={isLoading}
      />
    </div>
  );
}