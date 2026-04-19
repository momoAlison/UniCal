import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "UniCal AI - Intelligent Calendar",
    description: "UniCal AI - Your intelligent scheduling assistant",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" style={{ height: "100%" }}>
            <body style={{ height: "100%", overflow: "hidden" }}>
                {children}
            </body>
        </html>
    );
}
