// app/layout.tsx

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import Providers from "./tanStackQueryProvider";

// ✅ FontAwesome
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
config.autoAddCss = false;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "University Mailbox System",
  description: "University Mailbox System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      dir="rtl"
      data-scroll-behavior="smooth"
    >
      <body className="min-h-screen bg-white">
        <Providers>
          {children}
          {/* ✅ Toaster داخل Providers بعد children */}
          <Toaster 
            position="top-center"
            reverseOrder={false}
            gutter={8}
            containerClassName=""
            containerStyle={{}}
            toastOptions={{
              // ✅ خيارات عامة للـ Toast
              duration: 5000,
              style: {
                background: '#363636',
                color: '#fff',
                padding: '16px',
                borderRadius: '8px',
                fontSize: '14px',
                maxWidth: '500px',
              },
              // ✅ خيارات للـ Success
              success: {
                duration: 4000,
                style: {
                  background: '#10b981',
                  color: '#fff',
                },
                icon: '✅',
              },
              // ✅ خيارات للـ Error
              error: {
                duration: 6000,
                style: {
                  background: '#ef4444',
                  color: '#fff',
                },
                icon: '❌',
              },
              // ✅ خيارات للـ Loading
              loading: {
                duration: 3000,
                style: {
                  background: '#3b82f6',
                  color: '#fff',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}