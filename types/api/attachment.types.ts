// src/types/api/attachment.types.ts

export type Attachment = {
    id: number;
    fileName: string;
    filePath: string;
    fileSize: number;
    mimeType: string; 
    isPrimary: boolean;
    uploadedAt: string;
    uploadedBy: string;
    downloadUrl: string | null;
};