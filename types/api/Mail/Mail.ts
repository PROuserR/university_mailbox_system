export type Mail = {
    id: number
    title: string;
    content: string;
    issuedDate?: string | undefined;
    senderEntityId: string | undefined
    number: string;
    isProfessional: boolean;
    attachments?: Attachment[] | null;
    totalCount: number;
};