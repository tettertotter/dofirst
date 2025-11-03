export const metadata = {
  title: 'DoFirst',
  description: 'Focus on what matters today',
  applicationName: 'DoFirst',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'DoFirst',
  },
  formatDetection: {
    telephone: false,
  },
  themeColor: '#667eea',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  manifest: '/manifest.json',
  icons: {
    shortcut: '/icon-192.png',
    apple: [
      { url: '/icon-192.png' },
      { url: '/icon-152.png', sizes: '152x152' },
      { url: '/icon-192.png', sizes: '180x180' },
      { url: '/icon-192.png', sizes: '167x167' },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{
        margin: 0,
        padding: 0,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale'
      }}>
        {children}
      </body>
    </html>
  );
}
