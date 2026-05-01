// app/(dashboard)/admin/document-types/page.tsx
"use client";

import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useDocumentTypes, useDocumentTypeOperations } from "@/hooks/useDocumentType";
import { DocumentTypeTable } from "@/components/document-type";

export default function DocumentTypesPage() {
  // useAuthGuard();

  const { documentTypes, loading, refetch, setDocumentTypes } = useDocumentTypes();
  const { isLoading, create, update, delete: remove, activate, deactivate } = useDocumentTypeOperations();

  const handleCreate = async (name: string) => {
    const tempId = Date.now();
    setDocumentTypes(prev => [...prev, {
      id: tempId,
      name: name,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: null,
    }]);
    
    try {
      await create({ name });
      await refetch();
    } catch (error) {
      await refetch();
    }
  };

  const handleEdit = async (id: number, name: string) => {
    setDocumentTypes(prev => prev.map(entity => 
      entity.id === id ? { ...entity, name: name } : entity
    ));
    
    try {
      await update(id, { name });
      setTimeout(() => refetch(), 100);
    } catch (error) {
      await refetch();
    }
  };

  const handleActivate = async (id: number) => {
    setDocumentTypes(prev => prev.map(entity => 
      entity.id === id ? { ...entity, isActive: true } : entity
    ));
    
    try {
      await activate(id);
      setTimeout(() => refetch(), 100);
    } catch (error) {
      await refetch();
    }
  };

  const handleDeactivate = async (id: number) => {
    setDocumentTypes(prev => prev.map(entity => 
      entity.id === id ? { ...entity, isActive: false } : entity
    ));
    
    try {
      await deactivate(id);
      setTimeout(() => refetch(), 100);
    } catch (error) {
      await refetch();
    }
  };

  const handleDelete = async (id: number) => {
    setDocumentTypes(prev => prev.filter(entity => entity.id !== id));
    
    try {
      await remove(id);
    } catch (error) {
      await refetch();
    }
  };

  return (
    <div className="flex-1 overflow-hidden p-2 md:p-4 lg:p-6" dir="rtl">
      <div className="mb-3 md:mb-4">
        <h1 className="text-base md:text-lg lg:text-xl font-bold text-gray-800">
          إدارة أنواع الوثائق
        </h1>
        <p className="text-[11px] md:text-xs text-gray-500 mt-0.5">
          إضافة وتعديل وحذف أنواع الوثائق (قرار, تعميم, فاكس, تقرير, إعلان وزاري...)
        </p>
      </div>

      <DocumentTypeTable
        documentTypes={documentTypes}
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