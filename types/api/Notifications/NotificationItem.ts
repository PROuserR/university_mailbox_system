export type NotificationItem = {
    id: number
    title: string
    message: string
    type: "Info" | "Success" | "Warning" | "Error"
    isRead: boolean
    link: string | null
    createdAt: string
    readAt: string | null
}