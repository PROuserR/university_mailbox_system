/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/useDepartments.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
    getDepartments,
    getActiveDepartments,
    getDepartmentById,
    getDepartmentMembers,
    addDepartmentMember,
    removeDepartmentMember,
    setDepartmentHead,
    removeDepartmentHead,
    getMyDepartment,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    activateDepartment,
    deactivateDepartment,
} from "@/services/departments.service";
import {
    DepartmentDto,
    ActiveDepartmentDto,
    DepartmentMemberDto,
    CreateDepartmentRequest,
    UpdateDepartmentRequest,
} from "@/types/api/department.types";

// ============================================================
// ===== Queries =====
// ============================================================

export const useDepartments = () => {
    return useQuery({
        queryKey: ["departments"],
        queryFn: () => getDepartments(),
        staleTime: 5 * 60 * 1000,
    });
};

export const useActiveDepartments = () => {
    return useQuery({
        queryKey: ["departments", "active"],
        queryFn: () => getActiveDepartments(),
        staleTime: 5 * 60 * 1000,
    });
};

export const useDepartment = (id: number | null) => {
    return useQuery({
        queryKey: ["department", id],
        queryFn: () => getDepartmentById(id!),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    });
};

export const useDepartmentMembers = (departmentId: number | null) => {
    return useQuery({
        queryKey: ["department", departmentId, "members"],
        queryFn: () => getDepartmentMembers(departmentId!),
        enabled: !!departmentId,
        staleTime: 5 * 60 * 1000,
    });
};

export const useMyDepartment = () => {
    return useQuery({
        queryKey: ["department", "my"],
        queryFn: () => getMyDepartment(),
        staleTime: 5 * 60 * 1000,
        retry: false,
    });
};

// ============================================================
// ===== Mutations =====
// ============================================================

export const useCreateDepartment = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateDepartmentRequest) => createDepartment(payload),
        onSuccess: () => {
            toast.success("تم إنشاء القسم بنجاح", { duration: 3000 });
            queryClient.invalidateQueries({ queryKey: ["departments"] });
            queryClient.invalidateQueries({ queryKey: ["departments", "active"] });
            if (onSuccess) onSuccess();
        },
        onError: (error: any) => {
            toast.error(error?.message || "فشل إنشاء القسم", { duration: 3000 });
        },
    });
};

export const useUpdateDepartment = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: UpdateDepartmentRequest }) =>
            updateDepartment(id, payload),
        onSuccess: () => {
            toast.success("تم تحديث القسم بنجاح", { duration: 3000 });
            queryClient.invalidateQueries({ queryKey: ["departments"] });
            queryClient.invalidateQueries({ queryKey: ["departments", "active"] });
            queryClient.invalidateQueries({ queryKey: ["users", "active"] });
            if (onSuccess) onSuccess();
        },
        onError: (error: any) => {
            toast.error(error?.message || "فشل تحديث القسم", { duration: 3000 });
        },
    });
};

export const useDeleteDepartment = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteDepartment(id),
        onSuccess: () => {
            toast.success("تم حذف القسم بنجاح", { duration: 3000 });
            queryClient.invalidateQueries({ queryKey: ["departments"] });
            queryClient.invalidateQueries({ queryKey: ["departments", "active"] });
            if (onSuccess) onSuccess();
        },
        onError: (error: any) => {
            toast.error(error?.message || "فشل حذف القسم", { duration: 3000 });
        },
    });
};

// ============================================================
// ===== Member Mutations =====
// ============================================================

export const useAddDepartmentMember = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ departmentId, userId }: { departmentId: number; userId: number }) =>
            addDepartmentMember(departmentId, userId),
        onSuccess: (_, variables) => {
            toast.success("تم إضافة العضو بنجاح", { duration: 3000 });
            queryClient.invalidateQueries({ queryKey: ["department", variables.departmentId, "members"] });
            queryClient.invalidateQueries({ queryKey: ["departments"] });
            queryClient.invalidateQueries({ queryKey: ["users", "active"] });
            if (onSuccess) onSuccess();
        },
        onError: (error: any) => {
            toast.error(error?.message || "فشل إضافة العضو", { duration: 3000 });
        },
    });
};

export const useRemoveDepartmentMember = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ departmentId, userId }: { departmentId: number; userId: number }) =>
            removeDepartmentMember(departmentId, userId),
        onSuccess: (_, variables) => {
            toast.success("تم إزالة العضو بنجاح", { duration: 3000 });
            queryClient.invalidateQueries({ queryKey: ["department", variables.departmentId, "members"] });
            queryClient.invalidateQueries({ queryKey: ["departments"] });
            queryClient.invalidateQueries({ queryKey: ["users", "active"] });
            if (onSuccess) onSuccess();
        },
        onError: (error: any) => {
            toast.error(error?.message || "فشل إزالة العضو", { duration: 3000 });
        },
    });
};

// ============================================================
// ===== Head Mutations =====
// ============================================================

export const useSetDepartmentHead = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ departmentId, userId }: { departmentId: number; userId: number }) =>
            setDepartmentHead(departmentId, userId),
        onSuccess: (_, variables) => {
            toast.success("تم تعيين رئيس القسم بنجاح", { duration: 3000 });
            queryClient.invalidateQueries({ queryKey: ["departments"] });
            queryClient.invalidateQueries({ queryKey: ["department", variables.departmentId] });
            queryClient.invalidateQueries({ queryKey: ["department", variables.departmentId, "members"] });
            queryClient.invalidateQueries({ queryKey: ["users", "active"] });
            if (onSuccess) onSuccess();
        },
        onError: (error: any) => {
            toast.error(error?.message || "فشل تعيين رئيس القسم", { duration: 3000 });
        },
    });
};

export const useRemoveDepartmentHead = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (departmentId: number) => removeDepartmentHead(departmentId),
        onSuccess: (_, departmentId) => {
            toast.success("تم إزالة رئيس القسم بنجاح", { duration: 3000 });
            queryClient.invalidateQueries({ queryKey: ["departments"] });
            queryClient.invalidateQueries({ queryKey: ["department", departmentId] });
            queryClient.invalidateQueries({ queryKey: ["department", departmentId, "members"] });
            // ✅ تحديث المستخدمين النشطين بعد تغيير الرئيس
            queryClient.invalidateQueries({ queryKey: ["users", "active"] });
            if (onSuccess) onSuccess();
        },
        onError: (error: any) => {
            toast.error(error?.message || "فشل إزالة رئيس القسم", { duration: 3000 });
        },
    });
};

export const useActivateDepartment = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (departmentId: number) => activateDepartment(departmentId),
        onSuccess: () => {
            toast.success("تم تفعيل القسم بنجاح", { duration: 3000 });
            queryClient.invalidateQueries({ queryKey: ["departments"] });
            queryClient.invalidateQueries({ queryKey: ["departments", "active"] });
            if (onSuccess) onSuccess();
        },
        onError: (error: any) => {
            toast.error(error?.message || "فشل تفعيل القسم", { duration: 3000 });
        },
    });
};

export const useDeactivateDepartment = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (departmentId: number) => deactivateDepartment(departmentId),
        onSuccess: () => {
            toast.success("تم تعطيل القسم بنجاح", { duration: 3000 });
            queryClient.invalidateQueries({ queryKey: ["departments"] });
            queryClient.invalidateQueries({ queryKey: ["departments", "active"] });
            // ✅ تحديث المستخدمين النشطين بعد تعطيل القسم (إزالة الأعضاء والرئيس)
            queryClient.invalidateQueries({ queryKey: ["users", "active"] });
            if (onSuccess) onSuccess();
        },
        onError: (error: any) => {
            toast.error(error?.message || "فشل تعطيل القسم", { duration: 3000 });
        },
    });
};