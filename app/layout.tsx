import type React from "react"
import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { SupabaseAuthProvider } from "@/contexts/supabase-auth-context"
import { Toaster } from "@/components/ui/toaster"
import { ErrorBoundary } from "@/components/error-boundary"
import { Suspense } from "react"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  /* Updated variable name to match CSS configuration */
  variable: "--font-inter",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  /* Updated variable name to match CSS configuration */
  variable: "--font-jetbrains-mono",
})

export const metadata: Metadata = {
  title: "TaskFlow - Premium Task Management",
  description: "Modern task management system with glassmorphism design",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        <Suspense fallback={null}>
          <ErrorBoundary>
            <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
              <SupabaseAuthProvider>
                {children}
                <Toaster />
              </SupabaseAuthProvider>
            </ThemeProvider>
          </ErrorBoundary>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
