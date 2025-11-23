import type { Metadata } from "next";
import "../styles/globals.css";
import AuthProvider from "@/components/AuthProvider";

export const metadata: Metadata = {
    title: "HelpDesk Pro",
    description: "Premium IT Service Management",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR">
            <body>
                <AuthProvider>
                    <div className="min-h-screen bg-surface-950 text-surface-50">
                        {children}
                    </div>
                </AuthProvider>
            </body>
        </html>
    );
}
