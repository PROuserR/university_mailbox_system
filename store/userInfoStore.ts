import { create } from 'zustand'
import { persist } from "zustand/middleware";

type UserInfoStore = {
    firstname: string
    setFirstname: (firstname: string) => void
    lastname: string
    setLastname: (lastname: string) => void
    email: string
    setEmail: (email: string) => void
    role: string
    setRole: (role: string) => void
}


const useUserInfoStore = create<UserInfoStore>()(
    persist(
        (set) => ({
            firstname: "",
            lastname: "",
            email: "",
            role: "",
            setFirstname: (firstname) => set({ firstname }),
            setLastname: (lastname) => set({ lastname }),
            setEmail: (email) => set({ email }),
            setRole: (role) => set({ role }),
        }),
        {
            name: "auth-storage", // key in localStorage
        }
    )
);

export default useUserInfoStore;