"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useUIModeStore from "@/store/uiModeStore";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import useUserInfoStore from "@/store/userInfoStore";
import MailList from "@/components/mail/MailList";
import CorrespondencesPage from "./correspondences/page";

export default function DashboardPage() {
  useAuthGuard();
  const router = useRouter();
  const { role } = useUserInfoStore();
  const { uiMode } = useUIModeStore();

  useEffect(() => {
    if (!role) return;
    if (role === "User") {
      router.push("/distribution");
    }
  }, [role, router]);

  if (uiMode === "modern") {
    return <CorrespondencesPage />;
  }

  return (
    <main className="flex flex-col h-fit w-full overflow-hidden gap-12">
      <div className="flex flex-row-reverse text-right">
        <div className="w-full mx-auto">
          <MailList />
        </div>
      </div>
    </main>
  );
}
