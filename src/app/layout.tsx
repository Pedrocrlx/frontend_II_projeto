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
  title: "Grid | Your schedule, organized.",
  description:
    "Grid helps barbershops manage bookings with precision. Create your professional booking page in minutes and stop the scheduling chaos.",
  icons: {
    icon: { url: "/favicon.webp", type: "image/webp" },
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
