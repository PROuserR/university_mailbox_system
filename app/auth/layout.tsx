// app/auth/layout.tsx

import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Authentication",
    description: "Login and authentication pages",
};

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen w-full">
            {children}
        </div>
    );
}