// types/api/Attachment.ts

export type Attachment = {
    id: number;
    fileName: string;
    filePath: string;
    fileSize: number;        
    mimeType: string | null; 
    isPrimary: boolean;      
    uploadedAt: string;      
    uploadedBy: string;      
    downloadUrl: string | null; 
};