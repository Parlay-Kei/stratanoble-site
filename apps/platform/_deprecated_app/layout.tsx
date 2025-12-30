import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from './providers'

export const metadata: Metadata = {
  title: 'ACHIEVERY Platform | Strata Noble',
  description: 'Transform daily activities into meaningful progress - Part of the Strata Noble ecosystem',
  other: {
    // iOS Smart App Banner
    'apple-itunes-app': 'app-id=ACHIEVERY_APP_ID, app-argument=achievery://dashboard',
    // Android App Install Banner
    'google-play-app': 'app-id=com.stratanoble.achievery',
    // Deep linking support
    'al:ios:app_store_id': 'ACHIEVERY_APP_ID',
    'al:ios:app_name': 'ACHIEVERY',
    'al:ios:url': 'achievery://dashboard',
    'al:android:package': 'com.stratanoble.achievery',
    'al:android:app_name': 'ACHIEVERY',
    'al:android:url': 'achievery://dashboard',
    'al:web:url': 'https://stratanoble.com/achievery',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Google Analytics */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-0TGKD1S1HB"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-0TGKD1S1HB');
            `,
          }}
        />
      </head>
      <body className="antialiased bg-gray-50 text-gray-900 font-sans">
        <AuthProvider>
          {children}
        </AuthProvider>
        {/* Progressive Web App Support */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Progressive Web App Installation
              let deferredPrompt;
              
              window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                deferredPrompt = e;
                
                // Show custom install button if needed
                const installBtn = document.getElementById('pwa-install');
                if (installBtn) {
                  installBtn.style.display = 'block';
                  installBtn.addEventListener('click', async () => {
                    if (deferredPrompt) {
                      deferredPrompt.prompt();
                      const { outcome } = await deferredPrompt.userChoice;
                      if (outcome === 'accepted') {
                        gtag('event', 'pwa_install', { method: 'achievery_platform' });
                      }
                      deferredPrompt = null;
                    }
                  });
                }
              });
              
              // Handle app installation
              window.addEventListener('appinstalled', () => {
                gtag('event', 'pwa_installed', { source: 'achievery_platform' });
                deferredPrompt = null;
              });
            `,
          }}
        />
      </body>
    </html>
  )
}
