// app/(dashboard)/layout.tsx

"use client";

import { usePathname } from "next/navigation";
import useUIModeStore from "@/store/uiModeStore";
import useSidebarToggleStore from "@/store/sidebarToggleStore";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { uiMode } = useUIModeStore();
    const { isSidebarToggleShown } = useSidebarToggleStore();

    const isAuthPage = pathname?.startsWith("/auth");

    // ✅ الصفحات التي يظهر فيها الـ Sidebar في التصميم الكلاسيكي
    const isClassicPage =
        pathname === "/" ||
        pathname === "/distribution" ||
        pathname === "/distribution-page" ||
        pathname?.startsWith("/correspondences") ||
        pathname?.startsWith("/mail/") ||
        pathname === "/mail";

    // ✅ في التصميم الحديث: Sidebar يظهر في كل الصفحات
    // ✅ في التصميم الكلاسيكي: Sidebar يظهر فقط في الصفحات المحددة
    const shouldShowSidebar = !isAuthPage && (
        uiMode === "modern" ||
        (uiMode === "classic" && isClassicPage)
    );

    // ✅ في الموبايل: الـ Sidebar يظهر فقط إذا كان isSidebarToggleShown === true
    const showSidebar = shouldShowSidebar && isSidebarToggleShown;

    return (
        <div className="flex flex-col h-screen">
            <header className="fixed top-0 left-0 z-40 w-full">
                <Navbar />
            </header>

            {shouldShowSidebar ? (
                <div className="flex flex-row-reverse flex-1 pt-16 overflow-hidden">
                    <main className="flex-1 min-w-0 overflow-y-auto">
                        {children}
                    </main>
                    <aside className="h-[calc(100vh-4rem)] w-fit shrink-0 overflow-y-auto">
                        <Sidebar />
                    </aside>
                </div>
            ) : (
                <div className="flex-1 pt-16 overflow-hidden">
                    <main className="w-full h-full overflow-y-auto">
                        {children}
                    </main>
                </div>
            )}
        </div>
    );
}