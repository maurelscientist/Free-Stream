import '../globals.css'
import React from 'react'
import Script from 'next/script'
import { defaultLocale } from '../i18n/request'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import ThemeToggle from './components/ThemeToggle'
import WelcomePopup from './components/WelcomePopup'

interface RootLayoutProps {
  children: React.ReactNode
  params?: Promise<{ locale?: string }>
}

const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');}}catch(e){}})();`

export default async function RootLayout({ children, params }: RootLayoutProps) {
  const locale = (await params)?.locale ?? defaultLocale
  const isRTL = locale === 'ar'
  const messages = await getMessages()

  return (
    <html lang={locale} dir={isRTL ? 'rtl' : 'ltr'} translate="no" suppressHydrationWarning>
      <head>
        <Script id="theme-script" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" />
      </head>
      <body className="min-h-screen flex flex-col">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
          <ThemeToggle />
          <WelcomePopup />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
