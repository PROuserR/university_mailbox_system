import { create } from 'zustand'
import { persist } from "zustand/middleware";

type UserInfoStore = {
    firstname: string
    setFirstname: (firstname: string) => void
    lastname: string
    setLastname: (lastname: string) => void
    email: string
    setEmail: (email: string) => void
}


const userInfoStore = create<UserInfoStore>()(
    persist(
        (set) => ({
            firstname: "",
            lastname: "",
            email: "",
            setFirstname: (firstname) => set({ firstname }),
            setLastname: (lastname) => set({ lastname }),
            setEmail: (email) => set({ email }),
        }),
        {
            name: "auth-storage", // key in localStorage
        }
    )
);

export default userInfoStore;