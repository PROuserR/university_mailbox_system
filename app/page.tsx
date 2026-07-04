'use client';
import Sidebar from "@/components/layout/Sidebar";
import MailList from "@/components/mail/MailList";
import { useAuthGuard } from '@/hooks/useAuthGuard';
import useUserInfoStore from "@/store/userInfoStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  useAuthGuard();
  const router = useRouter();
  const {
    role,
  } = useUserInfoStore();

  useEffect(() => {
    if (!role) return; // Wait until role is loaded

    if (role != "Dean") {
      router.push("/distribution")
    }
    if (role != "Employee") {
      router.push("/distribution")
    }

  }, [])

  return (
    <main className="flex flex-col h-fit w-full overflow-hidden gap-12">
      <div className="flex flex-row-reverse text-right">
        {/* Fixed Sidebar */}
        <aside className="h-[calc(100vh-4rem)] w-fit">
          <Sidebar />
        </aside>
        {/* Mail List */}
        <div className="w-full  mx-auto">
          <MailList />
        </div>
      </div>
    </main>
  );
}