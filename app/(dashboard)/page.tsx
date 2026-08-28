// app/(dashboard)/page.tsx

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import useUserInfoStore from "@/store/userInfoStore";

export default function DashboardPage() {
  const router = useRouter();
  const { role, isLoggedIn } = useUserInfoStore();
  
  const { isLoading: isAuthLoading, isAuthorized } = useAuthGuard({
    redirectTo: '/auth/login',
    unauthorizedPath: '/unauthorized'
  });

  useEffect(() => {
    if (isAuthLoading) return;
    
    if (!isAuthorized) return;

    if (role === "Admin") {
      router.push("/users");
      return;
    }

    if (role) {
      router.push("/distribution?tab=inbox");
      return;
    }
    
  }, [role, router, isAuthLoading, isAuthorized]);

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <p className="text-gray-500">جاري التوجيه...</p>
    </div>
  );
}