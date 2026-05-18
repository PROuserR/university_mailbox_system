import { NotificationItem } from "./NotificationItem"

export type NotificationsResponse = {
    isSuccess: boolean
    data: {
        unreadCount: number
        items: NotificationItem[]
        totalCount: number
        pageNumber: number
        pageSize: number
        totalPages: number
        hasPreviousPage: boolean
        hasNextPage: boolean
    }
    message: string
    errors: string[] | null
    statusCode: number
}