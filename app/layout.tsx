import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import "./globals.css";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  variable: "--font-heebo",
});

export const metadata: Metadata = {
  title: "מרכז השליטה של העסק שלך",
  description: "מערכת CRM לניהול לידים, המשימות שלי, מסלול המכירה וסגירה יומית למאמנים ויועצים",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body className={heebo.variable}>{children}</body>
    </html>
  );
}
