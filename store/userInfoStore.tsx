import { create } from 'zustand'

type UserInfoStore = {
    firstname: string
    setFirstname: (firstname:string) => void
    lastname: string
    setLastname: (lastname:string) => void
    email: string
    setEmail: (email:string) => void
}

const userInfoStore = create<UserInfoStore>()((set) => ({
    firstname: "",
    lastname: "",
    email: "",
    setFirstname: (value) => set((state) => ({ firstname: value })),
    setLastname: (value) => set((state) => ({ lastname: value })),
    setEmail: (value) => set((state) => ({ email: value }))
}))

export default userInfoStore;