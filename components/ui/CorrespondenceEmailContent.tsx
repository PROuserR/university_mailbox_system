// components/correspondence/CorrespondenceEmailContent.tsx

"use client";

import { EmailContent } from "@/components/ui/EmailContent";
import { CorrespondenceResponse } from "@/types/api/correspondence.types";

interface CorrespondenceEmailContentProps {
    correspondence: CorrespondenceResponse;
    className?: string;
    height?: string | number;
}

export function CorrespondenceEmailContent({
    correspondence,
    className = "",
    height = "100%",
}: CorrespondenceEmailContentProps) {
    // ✅ تحويل المرفقات إلى الصيغة المطلوبة مع الحفاظ على جميع البيانات
    const attachments = correspondence.attachments?.map((att) => ({
        id: att.id,
        fileName: att.fileName,
        fileSize: att.fileSize,
        contentType: att.mimeType || "application/octet-stream",
        fileIdentifier: att.fileIdentifier || "",
        isInline: att.isInline || false,
        contentId: att.contentId || undefined,
        uploadedBy: att.uploadedBy,
        uploadedAt: att.uploadedAt,
        isPrimary: att.isPrimary,
    })) || [];

    return (
        <EmailContent
            html={correspondence.content || undefined}
            text={correspondence.content || undefined}
            attachments={attachments}
            className={className}
            height={height}
        />
    );
}