// app/(dashboard)/page.tsx
'use client';
import MailList from "@/components/dashboard/MailList";
import { useAuthGuard } from '@/hooks/useAuthGuard';

export default function DashboardPage() {
  useAuthGuard();

  return (
    <main className="flex flex-col h-full w-full p-4">
      <div className="flex flex-row-reverse text-right">
        <div className="w-full mx-auto">
          <MailList />
        </div>
      </div>
    </main>
  );
}