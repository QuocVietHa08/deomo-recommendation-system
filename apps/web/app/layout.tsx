import "./globals.css";
import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { TailwindIndicator } from "@/components/tailwind-indicator";

export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "VinoBuzz",
  description: "Your AI sommelier — find the perfect wine for any occasion.",
  icons: {
    icon: ["/favicon.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(fontSans.variable, "bg-background font-sans")}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <TailwindIndicator />
        </ThemeProvider>
      </body>
    </html>
  );
}
