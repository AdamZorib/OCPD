import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/ui";

export const metadata: Metadata = {
  title: "OCPD Insurance Platform",
  description: "Platforma ubezpieczeń odpowiedzialności cywilnej przewoźnika drogowego",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <div className="app-layout">
          <Sidebar />
          <main className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
