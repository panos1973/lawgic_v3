import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'
import SideNavbar from '@/components/navs/side-navbar'
import TopNavbar from '@/components/navs/top-navbar'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import MobileNavbar from '@/components/navs/mobile-navbar'
import Favicon from './favicon.ico'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Lawgic',
  description: 'Lawbot',
  icons: [{ rel: 'icon', url: Favicon.src }],
}

export default async function RootLayout({
  children,
  params: { locale },
}: Readonly<{
  children: React.ReactNode
  params: { locale: string }
}>) {
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages()
  return (
    <ClerkProvider>
      <html
        lang={locale}
        suppressHydrationWarning
      >
        {/* <head>
          <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        </head> */}
        <body className={inter.className}>
          <NextIntlClientProvider messages={messages}>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem
              disableTransitionOnChange
            >
              <TopNavbar />
              <div className="flex flex-col md:flex-row">
                <div className="hidden md:block">
                  <SideNavbar />
                </div>
                <div className="w-full h-[83svh]">{children}</div>
                <div className="md:hidden w-full  ">
                  <MobileNavbar />
                </div>
              </div>
              <Toaster position="bottom-center" />
            </ThemeProvider>
          </NextIntlClientProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
