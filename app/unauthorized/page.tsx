// app/unauthorized/page.tsx
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faArrowRight, faHome, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

export default function UnauthorizedPage() {
  const router = useRouter();

  const handleGoBack = () => {
    const redirectPath = sessionStorage.getItem('redirectAfterAuth');
    if (redirectPath) {
      sessionStorage.removeItem('redirectAfterAuth');
      router.push(redirectPath);
    } else {
      router.back();
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        {/* أيقونة */}
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-100">
          <FontAwesomeIcon icon={faLock} className="h-12 w-12 text-red-600" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900">غير مصرح</h1>
        <p className="mt-3 text-gray-600">
          ليس لديك الصلاحية اللازمة للوصول إلى هذه الصفحة أو تنفيذ هذا الإجراء.
        </p>

        <div className="mt-4 text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
          <p>💡 إذا كنت تعتقد أن لديك الصلاحية، حاول:</p>
          <ul className="mt-2 list-disc list-inside text-right">
            <li>تحديث الصفحة</li>
            <li>تسجيل الخروج وتسجيل الدخول مرة أخرى</li>
            <li>التواصل مع العميد أو الإدمن</li>
          </ul>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={handleGoBack}
            className="flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
            العودة
          </Button>

          <Button
            variant="outline"
            onClick={() => router.push('/')}
            className="flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faHome} className="h-4 w-4" />
            الرئيسية
          </Button>
        </div>
      </div>
    </div>
  );
}