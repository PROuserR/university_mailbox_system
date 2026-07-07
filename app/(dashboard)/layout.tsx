// app/(dashboard)/layout.tsx

"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const showSidebar =
        pathname === "/" ||
        pathname === "/distribution-page" ||
        pathname?.startsWith("/mail/");

    return (
        <div className="flex flex-col h-screen">
            <header className="fixed top-0 left-0 z-40 w-full">
                <Navbar />
            </header>

            {showSidebar ? (
                // ✅ RTL مع Sidebar على اليمين
                <div className="flex flex-row-reverse flex-1 pt-16 overflow-hidden">
                    {/* المحتوى */}
                    <main className="flex-1 min-w-0 overflow-y-auto">
                        {children}
                    </main>

                    {/* Sidebar على اليمين */}
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