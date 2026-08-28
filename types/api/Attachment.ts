// types/api/Attachment.ts

export type Attachment = {
    id: number;
    fileName: string;
    fileIdentifier: string;
    fileSize: number;
    mimeType: string | null;
    isPrimary: boolean;
    uploadedAt: string;
    uploadedBy: string;
    attachmentType: string;
    contentId?: string | null;    
    isInline?: boolean;            
    updatedAt: string | null;
    createdAt: string | null;
};