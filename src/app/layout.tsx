import { getLocale, getMessages, getTranslations } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Merriweather } from 'next/font/google';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-jakarta',
});

const merriweather = Merriweather({
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-merriweather',
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Layout');
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${jakarta.variable} ${merriweather.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <NextIntlClientProvider messages={messages} locale={locale}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
