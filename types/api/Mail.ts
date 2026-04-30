export type Mail = {
    id: number
    title: string;
    content: string;
    issuedDate?: string | undefined;
    number: string;
    isProfessional: boolean;
    attachments?: Attachment[];
    totalCount: number;
};