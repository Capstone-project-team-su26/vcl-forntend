import { Geist, Geist_Mono } from "next/font/google";
import DataSourceDevTools from "@/shared/components/DataSourceDevTools";
import { SITE_DESCRIPTION, SITE_NAME } from "@/shared/constants/site";
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

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <DataSourceDevTools />
      </body>
    </html>
  );
}
