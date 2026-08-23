"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import useUserInfoStore from "@/store/userInfoStore";
import CorrespondencesPage from "./correspondences/page";

export default function DashboardPage() {
  useAuthGuard();
  const router = useRouter();
  const { role } = useUserInfoStore();

  useEffect(() => {
    if (!role) return;
    if (role === "User") {
      router.push("/distribution");
    }
  }, [role, router]);

  // Modern mode only - always show CorrespondencesPage
  return <CorrespondencesPage />;
}