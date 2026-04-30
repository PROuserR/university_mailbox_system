// app/dashboard/admin/page.tsx
"use client";

import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useSenderEntities, useSenderEntityOperations } from "@/hooks/useSenderEntity";
import { SenderEntityTable } from "@/components/sender-entity";
import { useState } from "react";

export default function SenderEntitiesPage() {
  useAuthGuard();

  const { entities, loading, refetch, setEntities  } = useSenderEntities();
  const { isLoading, create, update, delete: remove, activate, deactivate } = useSenderEntityOperations();

 // ✅ الإضافة مع تحديث محلي فوري
  const handleCreate = async (name: string) => {
    const tempId = Date.now(); // ID مؤقت
    setEntities(prev => [...prev, {
      id: tempId,
      name: name,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: null,
    }]);
    
    try {
      await create({ name });
      await refetch(); // جلب الـ ID الحقيقي من الخادم
    } catch (error) {
      await refetch();
    }
  };

  const handleEdit = async (id: number, name: string) => {
    // تحديث الواجهة فوراً (Optimistic Update)
    setEntities(prev => prev.map(entity => 
      entity.id === id ? { ...entity, name: name } : entity
    ));
    
    try {
      await update(id, { name });
      // ✅ بعد نجاح الطلب، جلب البيانات للتأكد (اختياري، في الخلفية)
      setTimeout(() => refetch(), 100);
    } catch (error) {
      // في حالة الخطأ، نرجع البيانات القديمة
      await refetch();
    }
  };

  const handleActivate = async (id: number) => {
    setEntities(prev => prev.map(entity => 
      entity.id === id ? { ...entity, isActive: true } : entity
    ));
    
    try {
      await activate(id);
      setTimeout(() => refetch(), 100);
    } catch (error) {
      await refetch();
    }
  };

  // ✅ إلغاء التفعيل مع تحديث محلي فوري
  const handleDeactivate = async (id: number) => {
    setEntities(prev => prev.map(entity => 
      entity.id === id ? { ...entity, isActive: false } : entity
    ));
    
    try {
      await deactivate(id);
      setTimeout(() => refetch(), 100);
    } catch (error) {
      await refetch();
    }
  };

  // ✅ الحذف مع تحديث محلي فوري
  const handleDelete = async (id: number) => {
    setEntities(prev => prev.filter(entity => entity.id !== id));
    
    try {
      await remove(id);
    } catch (error) {
      await refetch();
    }
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