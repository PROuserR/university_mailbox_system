/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/useUsers.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
    getUsers,
    createUser,
    updateUser,
    resetUserPassword,
    activateUser,
    deactivateUser,
    setPermanentReceiver,
    removePermanentReceiver,
    getActiveUsers,
} from "@/services/users.service";
import {
    CreateUserRequest,
    UpdateUserRequest,
    ResetUserPasswordRequest,
    UserResponse,
} from "@/types/api/user";

// ============================================================
// ===== Query - Get Users =====
// ============================================================

export const useUsers = () => {
    return useQuery({
        queryKey: ["users"],
        queryFn: () => getUsers(),
        staleTime: 0,
        refetchOnWindowFocus: true,
        refetchOnMount: true,
    });
};

export const useActiveUsers = () => {
    return useQuery({
        queryKey: ["users", "active"],
        queryFn: () => getActiveUsers(),
    });
};
// ============================================================
// ===== Mutation - Create User =====
// ============================================================

export const useCreateUser = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateUserRequest) => createUser(payload),
        onSuccess: (data: UserResponse) => {
            toast.success("تم إضافة المستخدم بنجاح", { duration: 3000 });
            queryClient.invalidateQueries({ queryKey: ["users"] });
            if (onSuccess) onSuccess();
        },
        onError: (error: any) => {
            toast.error(error?.message || "فشل إضافة المستخدم", { duration: 3000 });
        },
    });
};

// ============================================================
// ===== Mutation - Update User =====
// ============================================================

export const useUpdateUser = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: UpdateUserRequest }) =>
            updateUser(id, payload),
        onSuccess: (data: UserResponse) => {
            toast.success("تم تعديل المستخدم بنجاح", { duration: 3000 });
            queryClient.invalidateQueries({ queryKey: ["users"] });
            if (onSuccess) onSuccess();
        },
        onError: (error: any) => {
            toast.error(error?.message || "فشل تعديل المستخدم", { duration: 3000 });
        },
    });
};

// ============================================================
// ===== Mutation - Reset Password =====
// ============================================================

export const useResetUserPassword = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: ResetUserPasswordRequest) => resetUserPassword(payload),
        onSuccess: () => {
            toast.success("تم إعادة تعيين كلمة المرور بنجاح", { duration: 3000 });
            queryClient.invalidateQueries({ queryKey: ["users"] });
            if (onSuccess) onSuccess();
        },
        onError: (error: any) => {
            toast.error(error?.message || "فشل إعادة تعيين كلمة المرور", { duration: 3000 });
        },
    });
};

// ============================================================
// ===== Mutation - Toggle Active =====
// ============================================================

export const useToggleActive = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
            isActive ? deactivateUser(id) : activateUser(id),
        onSuccess: (_, variables) => {
            toast.success(variables.isActive ? "تم تعطيل المستخدم" : "تم تفعيل المستخدم", { duration: 3000 });
            queryClient.invalidateQueries({ queryKey: ["users"] });
            if (onSuccess) onSuccess();
        },
        onError: (error: any) => {
            toast.error(error?.message || "فشل تغيير الحالة", { duration: 3000 });
        },
    });
};

// ============================================================
// ===== Mutation - Toggle Permanent Receiver =====
// ============================================================

export const useTogglePermanentReceiver = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, isPermanentReceiver }: { id: number; isPermanentReceiver: boolean }) =>
            isPermanentReceiver ? removePermanentReceiver(id) : setPermanentReceiver(id),
        onSuccess: (_, variables) => {
            toast.success(
                variables.isPermanentReceiver
                    ? "تم إزالة المستخدم من المستلمين الدائمين"
                    : "تم إضافة المستخدم للمستلمين الدائمين",
                { duration: 3000 }
            );
            queryClient.invalidateQueries({ queryKey: ["users"] });
            if (onSuccess) onSuccess();
        },
        onError: (error: any) => {
            toast.error(error?.message || "فشل تغيير حالة الاستقبال الدائم", { duration: 3000 });
        },
    });
};