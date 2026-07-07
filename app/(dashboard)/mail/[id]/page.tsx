// app/(dashboard)/mail/[id]/page.tsx

"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Mail } from "@/types/api/Mail/Mail";
import { apiWrapper } from "@/utils/apiClient";
import MailViewer from "@/components/mail/MailViewer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";

export default function MailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    const [mailData, setMailData] = useState<Mail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!id) return;

        const loadMail = async () => {
            try {
                setLoading(true);
                const res = await apiWrapper.get<{ data: Mail }>(
                    `Correspondences/${id}`
                );
                if (res.success && res.data) {
                    setMailData(res.data.data);
                } else {
                    setError(true);
                    toast.error("فشل تحميل البريد");
                }
            } catch (error) {
                setError(true);
                toast.error("فشل تحميل البريد");
            } finally {
                setLoading(false);
            }
        };

        loadMail();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <FontAwesomeIcon icon={faSpinner} spin className="text-3xl text-blue-600" />
                <span className="mr-3 text-blue-600">جاري تحميل البريد...</span>
            </div>
        );
    }

    if (error || !mailData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <p className="text-red-500 text-lg">فشل تحميل البريد</p>
                <button
                    onClick={() => router.push('/')}
                    className="mt-4 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                    العودة للرئيسية
                </button>
            </div>
        );
    }

    return (
        <MailViewer
            data={mailData}
            onBack={() => {
                router.push('/');
            }}
            onEdit={() => {
                router.push(`/mail/${id}/edit`);
            }}
            onDistribute={() => {
                router.push(`/distribution-page?id=${id}`);
            }}
        />
    );
}