// services/incoming-email.service.ts
import { apiWrapper, extractData, isApiSuccess } from "@/utils/apiClient";
import { ApiResult } from "@/types/api/ApiResult";
import {
    IncomingEmailDto,
    IncomingEmailFilter,
    ApproveIncomingEmailDto,
    ProcessIncomingEmailResultDto,
} from "@/types/api/incoming-email";
import PagedResult from "@/types/api/PagedResponse";

class IncomingEmailService {
    // ===== Process Emails =====
    async processEmails(): Promise<number> {
        const response = await apiWrapper.post<ApiResult<number>>(
            "/IncomingEmails/process"
        );
        if (!isApiSuccess(response)) {
            throw new Error(response?.message || "فشل في معالجة البريد الوارد");
        }
        return extractData(response)!;
    }

    // ===== Get Pending Count =====
    async getPendingCount(): Promise<number> {
        const response = await apiWrapper.get<ApiResult<number>>(
            "/IncomingEmails/pending/count"
        );
        if (!isApiSuccess(response)) {
            return 0;
        }
        return extractData(response) || 0;
    }

    // ===== Get Emails =====
    async getEmails(filter: IncomingEmailFilter): Promise<PagedResult<IncomingEmailDto>> {
        const response = await apiWrapper.get<ApiResult<PagedResult<IncomingEmailDto>>>(
            "/IncomingEmails",
            filter
        );

        if (!isApiSuccess(response)) {
            throw new Error(response?.message || "فشل تحميل البريد الوارد");
        }

        return extractData(response)!;
    }

    // ===== Get Email By Id =====
    async getEmailById(id: number): Promise<IncomingEmailDto> {
        const response = await apiWrapper.get<ApiResult<IncomingEmailDto>>(
            `/IncomingEmails/${id}`
        );
        if (!isApiSuccess(response)) {
            throw new Error(response?.message || "فشل تحميل تفاصيل البريد");
        }
        return extractData(response)!;
    }

    // ===== Approve Email - يعيد ProcessIncomingEmailResultDto =====
    async approveEmail(id: number, data: ApproveIncomingEmailDto): Promise<ProcessIncomingEmailResultDto> {
        const response = await apiWrapper.post<ApiResult<ProcessIncomingEmailResultDto>>(
            `/IncomingEmails/${id}/approve`,
            data
        );
        if (!isApiSuccess(response)) {
            throw new Error(response?.message || "فشل في الموافقة على البريد");
        }
        return extractData(response)!;
    }

    // ===== Reject Email - يعيد ProcessIncomingEmailResultDto =====
    async rejectEmail(id: number, reason?: string): Promise<ProcessIncomingEmailResultDto> {
        const response = await apiWrapper.post<ApiResult<ProcessIncomingEmailResultDto>>(
            `/IncomingEmails/${id}/reject${reason ? `?rejectionReason=${encodeURIComponent(reason)}` : ""}`
        );
        if (!isApiSuccess(response)) {
            throw new Error(response?.message || "فشل في رفض البريد");
        }
        return extractData(response)!;
    }

    // ===== Skip Email - يعيد ProcessIncomingEmailResultDto =====
    async skipEmail(id: number, notes?: string): Promise<ProcessIncomingEmailResultDto> {
        const response = await apiWrapper.post<ApiResult<ProcessIncomingEmailResultDto>>(
            `/IncomingEmails/${id}/skip${notes ? `?notes=${encodeURIComponent(notes)}` : ""}`
        );
        if (!isApiSuccess(response)) {
            throw new Error(response?.message || "فشل في تخطي البريد");
        }
        return extractData(response)!;
    }

    // ===== Reopen Email - يعيد ProcessIncomingEmailResultDto =====
    async reopenEmail(id: number, notes?: string): Promise<ProcessIncomingEmailResultDto> {
        const response = await apiWrapper.post<ApiResult<ProcessIncomingEmailResultDto>>(
            `/IncomingEmails/${id}/reopen${notes ? `?notes=${encodeURIComponent(notes)}` : ""}`
        );
        if (!isApiSuccess(response)) {
            throw new Error(response?.message || "فشل في إعادة فتح البريد");
        }
        return extractData(response)!;
    }

    // ===== Delete Incoming Email - يعيد ProcessIncomingEmailResultDto =====
    async deleteIncomingEmail(id: number): Promise<ProcessIncomingEmailResultDto> {
        const response = await apiWrapper.delete<ApiResult<ProcessIncomingEmailResultDto>>(
            `/IncomingEmails/${id}`
        );
        if (!isApiSuccess(response)) {
            throw new Error(response?.message || "فشل في حذف البريد");
        }
        return extractData(response)!;
    }
}

export const incomingEmailService = new IncomingEmailService();