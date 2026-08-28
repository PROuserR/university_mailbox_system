// services/outgoing-email.service.ts
import { apiWrapper, extractData, isApiSuccess } from "@/utils/apiClient";
import { ApiResult } from "@/types/api/ApiResult";
import {
    OutgoingEmailHistoryDto,
    OutgoingEmailFilterDto,
    SendOutgoingEmailDto,
    ResendOutgoingEmailDto,
    UpdateFailedEmailDto,
    OutgoingEmailResultDto,
    EmailBatchResultDto,
    OutgoingEmailStatisticsDto,
} from "@/types/api/outgoing-email";
import PagedResult from "@/types/api/PagedResponse";

class OutgoingEmailService {
    // ===== Send Email =====
    async sendEmail(data: SendOutgoingEmailDto): Promise<OutgoingEmailResultDto> {
        const response = await apiWrapper.post<ApiResult<OutgoingEmailResultDto>>(
            "/OutgoingEmails/send",
            data
        );
        if (!isApiSuccess(response)) {
            throw new Error(response?.message || "فشل إرسال البريد");
        }
        return extractData(response)!;
    }

    // ===== Send Batch =====
    async sendBatch(requests: SendOutgoingEmailDto[]): Promise<EmailBatchResultDto> {
        const response = await apiWrapper.post<ApiResult<EmailBatchResultDto>>(
            "/OutgoingEmails/send-batch",
            requests
        );
        if (!isApiSuccess(response)) {
            throw new Error(response?.message || "فشل إرسال البريد المجمع");
        }
        return extractData(response)!;
    }

    // ===== Resend Email =====
    async resendEmail(emailHistoryId: number, data: ResendOutgoingEmailDto): Promise<OutgoingEmailResultDto> {
        const response = await apiWrapper.post<ApiResult<OutgoingEmailResultDto>>(
            `/OutgoingEmails/${emailHistoryId}/resend`,
            data
        );
        if (!isApiSuccess(response)) {
            throw new Error(response?.message || "فشل إعادة إرسال البريد");
        }
        return extractData(response)!;
    }

    // ===== Process Failed Emails =====
    async processFailedEmails(): Promise<number> {
        const response = await apiWrapper.post<ApiResult<number>>(
            "/OutgoingEmails/process-failed"
        );
        if (!isApiSuccess(response)) {
            throw new Error(response?.message || "فشل معالجة البريد الفاشل");
        }
        return extractData(response)!;
    }

    // ===== Update Failed Email =====
    async updateFailedEmail(data: UpdateFailedEmailDto): Promise<OutgoingEmailResultDto> {
        const response = await apiWrapper.put<ApiResult<OutgoingEmailResultDto>>(
            "/OutgoingEmails/failed/update",
            data
        );
        if (!isApiSuccess(response)) {
            throw new Error(response?.message || "فشل تحديث البريد الفاشل");
        }
        return extractData(response)!;
    }

    // ===== Get Email History =====
    async getEmailHistory(correspondenceId: number): Promise<OutgoingEmailHistoryDto[]> {
        const response = await apiWrapper.get<ApiResult<OutgoingEmailHistoryDto[]>>(
            `/OutgoingEmails/history/${correspondenceId}`
        );
        if (!isApiSuccess(response)) {
            throw new Error(response?.message || "فشل تحميل سجل البريد");
        }
        return extractData(response) || [];
    }

    // ===== Get Email History By Id =====
    async getEmailHistoryById(emailHistoryId: number): Promise<OutgoingEmailHistoryDto> {
        const response = await apiWrapper.get<ApiResult<OutgoingEmailHistoryDto>>(
            `/OutgoingEmails/history/detail/${emailHistoryId}`
        );
        if (!isApiSuccess(response)) {
            throw new Error(response?.message || "فشل تحميل تفاصيل البريد");
        }
        return extractData(response)!;
    }

    // ===== Test Connection =====
    async testConnection(): Promise<boolean> {
        const response = await apiWrapper.post<ApiResult<boolean>>(
            "/OutgoingEmails/test-connection"
        );
        if (!isApiSuccess(response)) {
            throw new Error(response?.message || "فشل اختبار الاتصال");
        }
        return extractData(response) || false;
    }

    // ===== Get Sent Emails =====
    async getSentEmails(filter: OutgoingEmailFilterDto): Promise<PagedResult<OutgoingEmailHistoryDto>> {
        const response = await apiWrapper.get<ApiResult<PagedResult<OutgoingEmailHistoryDto>>>(
            "/OutgoingEmails/sent",
            filter
        );
        if (!isApiSuccess(response)) {
            throw new Error(response?.message || "فشل تحميل البريد الصادر");
        }
        return extractData(response)!;
    }

    // ===== Get Pending Retry =====
    async getPendingRetry(): Promise<OutgoingEmailHistoryDto[]> {
        const response = await apiWrapper.get<ApiResult<OutgoingEmailHistoryDto[]>>(
            "/OutgoingEmails/pending-retry"
        );
        if (!isApiSuccess(response)) {
            throw new Error(response?.message || "فشل تحميل البريد المنتظر");
        }
        return extractData(response) || [];
    }

    // ===== Get Statistics =====
    async getStatistics(): Promise<OutgoingEmailStatisticsDto> {
        const response = await apiWrapper.get<ApiResult<OutgoingEmailStatisticsDto>>(
            "/OutgoingEmails/statistics"
        );
        if (!isApiSuccess(response)) {
            throw new Error(response?.message || "فشل تحميل الإحصائيات");
        }
        return extractData(response)!;
    }

    // ===== Delete Email History =====
    async deleteEmailHistory(emailHistoryId: number): Promise<void> {
        const response = await apiWrapper.delete<ApiResult<void>>(
            `/OutgoingEmails/${emailHistoryId}`
        );
        if (!isApiSuccess(response)) {
            throw new Error(response?.message || "فشل حذف سجل البريد");
        }
    }
}

export const outgoingEmailService = new OutgoingEmailService();