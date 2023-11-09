import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/ThemeProvider'
import { Toaster } from '@/components/ui/toaster';
import ProModal  from '@/components/ProModal';
import AuthContext from '@/context/AuthContext';
import './globals.css'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Companion.AI",
  description: "Your customised companion",
};




export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {


  return (
    <AuthContext>
      <html lang="en" suppressHydrationWarning>
        <body className={cn("bg-secondary", inter.className)}>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <ProModal />
            {children}
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </AuthContext>
  );
}
