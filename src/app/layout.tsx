import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import { ServiceWorker } from "@/platform/pwa";
import "./globals.css";

const vazirmatn = localFont({
  src: "./fonts/Vazirmatn-Variable.woff2",
  variable: "--font-vazirmatn",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "حسابداری میوه‌فروشی", template: "%s | حسابداری میوه‌فروشی" },
  description: "ثبت خرید، فروش و هزینه‌ی روزانه و دفتر حساب‌ها — آفلاین، روی همین دستگاه",
  applicationName: "حسابداری میوه‌فروشی",
  appleWebApp: { capable: true, title: "میوه‌فروشی", statusBarStyle: "black-translucent" },
  icons: { apple: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/icons/apple-touch-icon.png` },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0d",
  width: "device-width",
  initialScale: 1,
};

/** Applies the saved theme before first paint so there is no flash. */
const themeScript = `try{var t=localStorage.getItem("theme");if(t==="light")document.documentElement.dataset.theme="light"}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable} suppressHydrationWarning>
      <body className="min-h-dvh">
        <Script id="theme" strategy="beforeInteractive">
          {themeScript}
        </Script>
        {children}
        <ServiceWorker />
      </body>
    </html>
  );
}
