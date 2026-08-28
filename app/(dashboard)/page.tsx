// app/(dashboard)/page.tsx

/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import useUserInfoStore from "@/store/userInfoStore";

export default function DashboardPage() {
  const router = useRouter();
  const { role } = useUserInfoStore();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (authLoading) return;
    if (!isAuthenticated()) {
      router.push("/auth/login");
      return;
    }
    if (isRedirecting) return;

    if (role === "Admin") {
      setIsRedirecting(true);
      router.push("/users");
      return;
    }

    if (role) {
      setIsRedirecting(true);
      router.push("/distribution?tab=inbox");
      return;
    }
    
  }, [role, router, authLoading, isAuthenticated, isRedirecting, mounted]);

  if (!mounted || authLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated()) {
    return null;
  }

  if (isRedirecting) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <p className="text-gray-500">جاري التوجيه...</p>
    </div>
  );
}