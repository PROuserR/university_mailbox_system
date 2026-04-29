export type Mail = {
    title: string;
    content: string;
    issuedDate?: string | undefined;
    attachments?: Attachment[];
};