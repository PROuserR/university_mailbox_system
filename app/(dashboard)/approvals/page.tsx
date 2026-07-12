// app/(dashboard)/approvals/page.tsx

import { Suspense } from 'react';
import ApprovalsContent from './ApprovalsContent';

export default function ApprovalsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>}>
      <ApprovalsContent />
    </Suspense>
  );
}