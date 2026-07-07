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

    // ✅ الـ Sidebar يظهر فقط في الصفحة الرئيسية (/)
    const showSidebar = pathname === "/";

    return (
        <div className="flex flex-col min-h-screen">
            <header className="fixed top-0 left-0 z-40 w-full">
                <Navbar />
            </header>

            {showSidebar ? (
                <div className="flex flex-row pt-16" style={{ direction: 'ltr' }}>
                    <main className="flex-1 min-w-0" style={{ direction: 'ltr' }}>
                        {children}
                    </main>

                    {/* Sidebar - على اليسار (في LTR) */}
                    <aside className="h-[calc(100vh-4rem)] w-fit shrink-0" style={{ direction: 'ltr' }}>
                        <Sidebar />
                    </aside>
                </div>
            ) : (
                <div className="pt-16">
                    <main className="w-full" style={{ direction: 'rtl' }}>
                        {children}
                    </main>
                </div>
            )}
        </div>
    );
}