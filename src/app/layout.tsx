import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
export const metadata: Metadata = {
  title: "Auth Template",
  description: "Powered by RadianOS & Better Auth",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="antialiased"
      >
        <ThemeProvider
        attribute="class"
        defaultTheme="system"
        >
        {children}
        </ThemeProvider>
          <Toaster />
      </body>
    </html>
  );
}
