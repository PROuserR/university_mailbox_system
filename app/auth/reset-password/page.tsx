// app/auth/reset-password/page.tsx

import { Suspense } from "react";
import ResetPasswordClient from "./ResetPasswordClient";

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-blue-600 text-sm">جاري التحميل...</div>
            </div>
        }>
            <ResetPasswordClient />
        </Suspense>
    );
}