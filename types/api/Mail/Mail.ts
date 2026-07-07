import { Attachment } from "../Attachment";
export type Mail = {
    id: number;
    number: string;
    mainType: string;
    isProfessional: boolean;
    documentType: string;
    documentTypeId: number;

    senderEntity: string | null;
    senderEntityId: number | string| null;
    senderReference: string | null;

    title: string;
    content: string | null;

    issuedDate: string;
    receivedDate: string | null;
    sentDate: string | null;
    notes: string | null;
    status: string;

    attachments: Attachment[];

    totalReceivers: number;
    readCount: number;

    createdBy: string;
    createdAt: string;
    updatedAt: string | null;
};