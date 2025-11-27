import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Human Design Chart Generator",
  description: "Erstelle dein persönliches Human Design Chart",
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
