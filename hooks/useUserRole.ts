/* eslint-disable react-hooks/set-state-in-effect */
// hooks/useUserRole.ts
"use client";

import { useEffect, useState } from "react";
import userInfoStore from "@/store/userInfoStore";
import { authService } from "@/services/auth.service";

export function useUserRole() {
    const { 
        id,
        role, 
        roles,
        firstname, 
        lastname, 
        email, 
        isLoggedIn,
        isHeadOfDepartment,
        isPermanentReceiver,
        departmentId,
        setUser,
        clearUser,
    } = userInfoStore();
    
    const [loading, setLoading] = useState(!isLoggedIn);

    useEffect(() => {
        if (isLoggedIn && role) {
            setLoading(false);
            return;
        }

        const fetchUser = async () => {
            setLoading(true);
            try {
                const user = await authService.getCurrentUser();
                setUser(user);
            } catch (error) {
                console.error("Failed to fetch user", error);
                clearUser();
            } finally {
                setLoading(false);
            }
        };
        
        fetchUser();
    }, [isLoggedIn, role, setUser, clearUser]);

    const isDean = roles.includes('Dean');
    const isAdmin = roles.includes('Admin');
    const isEmployee = roles.includes('Employee');

    return {
        userId: id,
        role,
        roles,
        firstname,
        lastname,
        email,
        isLoggedIn,
        loading,
        isPermanentReceiver,
        isHeadOfDepartment: isHeadOfDepartment || false,
        departmentId: departmentId || null,
        isDean,
        isAdmin,
        isEmployee,
        hasRole: (roleToCheck: string) => roles.includes(roleToCheck),
    };
}