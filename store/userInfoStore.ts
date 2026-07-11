import { create } from 'zustand'
import { persist } from "zustand/middleware";

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
    profileImageUrl: string | null
    setProfileImageUrl: (url: string | null) => void
    isLoggedIn: boolean
    setIsLoggedIn: (isLoggedIn: boolean) => void
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
            profileImageUrl: null,
            isLoggedIn: false,
            
            setId: (id) => set({ id }),
            setFirstname: (firstname) => set({ firstname }),
            setLastname: (lastname) => set({ lastname }),
            setEmail: (email) => set({ email }),
            setRole: (role) => set({ role }),
            setRoles: (roles) => set({ roles }),
            setPhone: (phone) => set({ phone }),
            setIsActive: (isActive) => set({ isActive }),
            setIsPermanentReceiver: (isPermanentReceiver) => set({ isPermanentReceiver }),
            setProfileImageUrl: (profileImageUrl) => set({ profileImageUrl }),
            setIsLoggedIn: (isLoggedIn) => set({ isLoggedIn }),
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
                profileImageUrl: null,
                isLoggedIn: false 
            }),
        }),
        {
            name: "auth-storage",
        }
    )
);

export default userInfoStore;