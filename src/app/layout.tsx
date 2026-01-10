import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from '@/components/layout/theme-provider';
import { FirebaseClientProvider } from '@/firebase/client-provider';

export const metadata: Metadata = {
  title: 'Cyber Architect | Flutter & IoT Systems Architect',
  description: 'Portfolio of a specialized Flutter & IoT Systems Architect, showcasing high-end projects and technical expertise.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className={cn(
        "font-body antialiased",
        "bg-background text-foreground"
      )}>
        <FirebaseClientProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
