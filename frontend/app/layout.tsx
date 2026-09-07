import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Human Design Business-Energie | Silke Stupperich",
  description: "Entdecke deine Human Design Business-Energie: wie du arbeitest, entscheidest und auf andere wirkst.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className="min-h-screen bg-white">{children}</body>
    </html>
  );
}
