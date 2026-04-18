import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "UniCal AI - 智能日历助理",
    description: "UniCal AI - 你的智能日程管理助理",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="zh">
            <body>{children}</body>
        </html>
    );
}
