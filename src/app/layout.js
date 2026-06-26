import { Geist, Geist_Mono } from "next/font/google";
import DataSourceDevTools from "@/app/components/DataSourceDevTools";
import ClientRootExtras from "@/app/components/ClientRootExtras";
import ThemeProvider from "@/app/components/ThemeProvider";
import ThemeToggle from "@/app/components/ThemeToggle";
import { SITE_DESCRIPTION, SITE_NAME } from "@/utils/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
};

const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem("vcl:theme");
    var dark =
      stored === "dark" ||
      (stored !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (dark) document.documentElement.classList.add("dark");
  } catch (e) {}
})();
`;

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-ink">
        <ThemeProvider>
          <ClientRootExtras />
          {children}
          <ThemeToggle />
          <DataSourceDevTools />
        </ThemeProvider>
      </body>
    </html>
  );
}
