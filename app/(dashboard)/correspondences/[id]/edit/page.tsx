// app/(dashboard)/correspondences/[id]/edit/page.tsx

"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CorrespondenceResponse } from "@/types/api/correspondence.types";
import { apiWrapper } from "@/utils/apiClient";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import CorrespondenceEditPage from "@/components/correspondence/CorrespondenceEditPage";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function EditCorrespondencePage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    const { isLoading: isAuthLoading, isAuthorized } = useAuthGuard({
        requiredPermissions: ['EditCorrespondence'],
        redirectTo: '/auth/login',
        unauthorizedPath: '/unauthorized'
    });

    const [correspondenceData, setCorrespondenceData] = useState<CorrespondenceResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!id) return;

        const loadCorrespondence = async () => {
            try {
                setLoading(true);
                const res = await apiWrapper.get<{ data: CorrespondenceResponse }>(
                    `Correspondences/${id}`
                );
                if (res.success && res.data) {
                    setCorrespondenceData(res.data.data);
                } else {
                    setError(true);
                    toast.error("فشل تحميل المراسلة");
                }
            } catch (error) {
                setError(true);
                toast.error("فشل تحميل المراسلة");
            } finally {
                setLoading(false);
            }
        };

        loadCorrespondence();
    }, [id]);

    if (isAuthLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <FontAwesomeIcon icon={faSpinner} spin className="text-3xl text-blue-600" />
                <span className="mr-3 text-blue-600">جاري التحميل...</span>
            </div>
        );
    }

    if (!isAuthorized) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <p className="text-red-500 text-lg">ليس لديك صلاحية لتعديل هذه المراسلة</p>
                <button
                    onClick={() => router.push('/')}
                    className="mt-4 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                    العودة للرئيسية
                </button>
            </div>
        );
    }

    if (error || !correspondenceData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <p className="text-red-500 text-lg">فشل تحميل المراسلة</p>
                <button
                    onClick={() => router.push('/correspondences')}
                    className="mt-4 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                    العودة لقائمة المراسلات
                </button>
            </div>
        );
    }

    return (
        <CorrespondenceEditPage
            correspondence={correspondenceData}
            onBack={() => router.push(`/correspondences?id=${id}`)}
            onSuccess={() => router.push(`/correspondences?id=${id}`)}
        />
    );
}