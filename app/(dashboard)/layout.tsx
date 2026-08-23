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
    const isAuthPage = pathname?.startsWith("/auth");

    return (
        <div className="flex flex-col h-screen">
            <header className="fixed top-0 left-0 z-40 w-full">
                <Navbar />
            </header>

            {!isAuthPage ? (
                <div className="flex flex-row-reverse flex-1 pt-16 overflow-hidden">
                    <main className="flex-1 min-w-0 overflow-y-auto">
                        {children}
                    </main>
                    <aside className="h-[calc(100vh-4rem)] shrink-0 overflow-y-auto">
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