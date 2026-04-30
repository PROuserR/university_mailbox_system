import { Mail } from "./Mail"

export type MailPageResponse = {
    data: {
        items: Mail[]
        totalCount: number
    }
}