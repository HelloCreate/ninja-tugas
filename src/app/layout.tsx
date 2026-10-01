import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ninja Tugas - Manajemen Tugas Mahasiswa",
  description: "Aplikasi pengatur tugas kuliah dengan Cloudflare D1 & R2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}