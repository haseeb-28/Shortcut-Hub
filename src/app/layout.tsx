import type { Metadata } from "next";
import { MotionConfig } from "framer-motion";
// @ts-ignore: allow side-effect CSS import without type declarations
import "./globals.css";

import { CategoryProvider } from "@/context/CategoryContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { NavigationSplash } from "@/components/NavigationSplash";

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              'try{var t=localStorage.getItem("shortcut-hub-theme");document.documentElement.dataset.theme=t==="light"||t==="dark"?t:(matchMedia("(prefers-color-scheme: light)").matches?"light":"dark")}catch(e){document.documentElement.dataset.theme=matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}',
          }}
        />
      </head>
      <body>
        <MotionConfig reducedMotion="user">
          <ThemeProvider>
            <CategoryProvider>
              <NavigationSplash />
              {children}
            </CategoryProvider>
          </ThemeProvider>
        </MotionConfig>
      </body>
    </html>
  );
}