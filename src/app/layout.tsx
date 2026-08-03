import type { Metadata } from "next";
// @ts-ignore: allow side-effect CSS import without type declarations
import "./globals.css";

import { CategoryProvider } from "@/context/CategoryContext";

export const metadata: Metadata = {
  title: "Shortcut Hub",
  description: "Your personal shortcut launchpad",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CategoryProvider>
          {children}
        </CategoryProvider>
      </body>
    </html>
  );
}