// app/(dashboard)/distribution-page/page.tsx

import { Suspense } from "react";
import DistributionPageClient from "./DistributionPageClient";

// ✅ Loading Fallback
function LoadingFallback() {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-blue-600">جاري التحميل...</span>
            </div>
        </div>
    );
}

export default function DistributionPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <DistributionPageClient />
        </Suspense>
    );
}