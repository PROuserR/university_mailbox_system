// context/SidebarContext.tsx

"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface SidebarContextType {
    collapsed: boolean;
    mobileOpen: boolean;
    toggleCollapse: () => void;
    setMobileOpen: (open: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const toggleCollapse = () => setCollapsed(!collapsed);

    return (
        <SidebarContext.Provider value={{ collapsed, mobileOpen, toggleCollapse, setMobileOpen }}>
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (!context) throw new Error("useSidebar must be used within SidebarProvider");
    return context;
}