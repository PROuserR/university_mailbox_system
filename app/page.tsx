'use client';
import MailList from "@/components/dashboard/MailList";
import MailViewer from "@/components/dashboard/MailViewer";
import { useAuthGuard } from '@/hooks/useAuthGuard';

export default function DashboardPage() {
  useAuthGuard();


  return (
    <main className="flex flex-col h-fit w-screen overflow-hidden gap-12 p-4">
      <div className="flex flex-row-reverse text-right">
        {/* Mail List */}
        <div className="w-full  mx-auto">
          <MailList />
        </div>

        {/* Mail Viewer */}
        {/* <div className="flex-1 bg-white rounded-xl border">
            <MailViewer />
          </div> */}
      </div>
    </main>
  );
}