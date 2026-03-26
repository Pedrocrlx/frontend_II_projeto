import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { I18nProvider } from "@/contexts/I18nContext";
import { ReduxProvider } from "@/contexts/ReduxProvider";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://gridschedule.com"),
  title: {
    default: "Grid | Your schedule, organized.",
    template: "%s | Grid",
  },
  description:
    "Grid helps barbershops manage bookings with precision. Create your professional booking page in minutes and stop the scheduling chaos.",
  applicationName: "Grid",
  keywords: [
    "barbershop",
    "booking system",
    "appointment scheduling",
    "barber management",
    "salon software",
    "online booking",
  ],
  authors: [{ name: "Grid Team" }],
  creator: "Grid",
  publisher: "Grid",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: { url: "/favicon.webp", type: "image/webp" },
    shortcut: "/favicon.webp",
    apple: "/favicon.webp",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://gridschedule.com",
    siteName: "Grid",
    title: "Grid | Your schedule, organized.",
    description: "Professional booking platform for barbershops. Manage appointments with precision.",
  },
  twitter: {
    card: "summary",
    creator: "@gridschedule",
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    // Add your verification codes here when you have them
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="a37a797a-91c4-4bcd-a887-ccf311f2a15d"
        ></script>
      </head>
      <body
        className={`${plusJakartaSans.variable} font-sans antialiased overflow-x-hidden`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <ReduxProvider>
            <AuthProvider>
              <I18nProvider>{children}</I18nProvider>
            </AuthProvider>
          </ReduxProvider>
        </ThemeProvider>
        <Toaster richColors />
      </body>
    </html>
  );
}
