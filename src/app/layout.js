import localFont from "next/font/local";
import "./globals.css";
import SessionWrapper from "@/components/SessionWrapper";
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import {Toaster} from '@/components/ui/sonner';
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "Kabootar",
  description:
    "This is the Insta comment reply handler in which it will reply to the comments on the specific post. which is meant to give essential reply according to their comment.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionWrapper>
          <ThemeProvider>            
              {children}
              <Toaster position = "top-right" richColors />
          </ThemeProvider>
        </SessionWrapper>
      </body>
    </html>
  );
}
