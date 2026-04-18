import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "UniCal AI - 独角兽智能日历",
    description: "UniCal AI - 你的智能日程管理助理",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="zh" style={{ height: "100%" }}>
            <body style={{ height: "100%", overflow: "hidden" }}>
                {children}
            </body>
        </html>
    );
}
