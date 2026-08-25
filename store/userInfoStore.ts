// store/userInfoStore.ts
import { create } from 'zustand'
import { persist } from "zustand/middleware";
import { CurrentUserResponse } from '@/types/api/user';

type UserInfoStore = {
    id: number
    setId: (id: number) => void
    firstname: string
    setFirstname: (firstname: string) => void
    lastname: string
    setLastname: (lastname: string) => void
    email: string
    setEmail: (email: string) => void
    role: string
    setRole: (role: string) => void
    roles: string[]
    setRoles: (roles: string[]) => void
    phone: string | null
    setPhone: (phone: string | null) => void
    isActive: boolean
    setIsActive: (isActive: boolean) => void
    isPermanentReceiver: boolean
    setIsPermanentReceiver: (isPermanentReceiver: boolean) => void
    isHeadOfDepartment: boolean
    setIsHeadOfDepartment: (isHeadOfDepartment: boolean) => void
    departmentId: number | null
    setDepartmentId: (departmentId: number | null) => void
    profileImageUrl: string | null
    setProfileImageUrl: (url: string | null) => void
    isLoggedIn: boolean
    setIsLoggedIn: (isLoggedIn: boolean) => void
    delegatedPermissions: string[]
    setDelegatedPermissions: (permissions: string[]) => void
    setUser: (user: CurrentUserResponse) => void
    clearUser: () => void
}

const userInfoStore = create<UserInfoStore>()(
    persist(
        (set) => ({
            id: 0,
            firstname: "",
            lastname: "",
            email: "",
            role: "",
            roles: [],
            phone: null,
            isActive: true,
            isPermanentReceiver: false,
            isHeadOfDepartment: false,
            departmentId: null,
            profileImageUrl: null,
            isLoggedIn: false,
            delegatedPermissions: [],
            
            setId: (id) => set({ id }),
            setFirstname: (firstname) => set({ firstname }),
            setLastname: (lastname) => set({ lastname }),
            setEmail: (email) => set({ email }),
            setRole: (role) => set({ role }),
            setRoles: (roles) => set({ roles }),
            setPhone: (phone) => set({ phone }),
            setIsActive: (isActive) => set({ isActive }),
            setIsPermanentReceiver: (isPermanentReceiver) => set({ isPermanentReceiver }),
            setIsHeadOfDepartment: (isHeadOfDepartment) => set({ isHeadOfDepartment }),
            setDepartmentId: (departmentId) => set({ departmentId }),
            setProfileImageUrl: (profileImageUrl) => set({ profileImageUrl }),
            setIsLoggedIn: (isLoggedIn) => set({ isLoggedIn }),
            setDelegatedPermissions: (permissions) => set({ delegatedPermissions: permissions }),
            
            setUser: (user: CurrentUserResponse) => {
                const primaryRole = user.roles.includes('Dean') ? 'Dean' 
                    : user.roles.includes('Admin') ? 'Admin' 
                    : user.roles.includes('Employee') ? 'Employee' 
                    : user.roles[0] || 'User';
                
                set({
                    id: user.id,
                    firstname: user.firstName,
                    lastname: user.lastName,
                    email: user.email,
                    role: primaryRole,
                    roles: user.roles,
                    phone: user.phone || null,
                    isActive: user.isActive,
                    isPermanentReceiver: user.isPermanentReceiver,
                    isHeadOfDepartment: user.isHeadOfDepartment,
                    departmentId: user.departmentId || null,
                    profileImageUrl: user.profileImageUrl || null,
                    isLoggedIn: true,
                });
            },
            
            clearUser: () => set({ 
                id: 0, 
                firstname: "", 
                lastname: "", 
                email: "", 
                role: "", 
                roles: [],
                phone: null,
                isActive: true,
                isPermanentReceiver: false,
                isHeadOfDepartment: false,
                departmentId: null,
                profileImageUrl: null,
                isLoggedIn: false,
                delegatedPermissions: []
            }),
        }),
        {
            name: "auth-storage",
        }
    )
);

export default userInfoStore;