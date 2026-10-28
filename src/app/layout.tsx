import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProvider } from '@/lib/context';

export const metadata: Metadata = {
  title: 'SIP Karanghaur - Sistem Data Kependudukan Desa',
  description:
    'Aplikasi Progressive Web App (PWA) Sistem Informasi Data Kependudukan Desa Karanghaur berbasis batas wilayah RT/RW/Dusun',
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-slate-900 text-slate-800 antialiased selection:bg-blue-500 selection:text-white">
        <AppProvider>
          {children}
        </AppProvider>

        {/* Strict Mobile & Desktop Anti-Zoom Guard (Pinch, Double-Tap, Ctrl+Wheel) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Prevent iOS Safari & mobile pinch-to-zoom gestures
                document.addEventListener('gesturestart', function(e) {
                  e.preventDefault();
                }, { passive: false });
                document.addEventListener('gesturechange', function(e) {
                  e.preventDefault();
                }, { passive: false });
                document.addEventListener('gestureend', function(e) {
                  e.preventDefault();
                }, { passive: false });

                // Prevent multi-touch pinch zoom on Android / iOS
                document.addEventListener('touchmove', function(e) {
                  if (e.touches && e.touches.length > 1) {
                    e.preventDefault();
                  }
                }, { passive: false });

                // Prevent double-tap to zoom on mobile
                var lastTouchEnd = 0;
                document.addEventListener('touchend', function(e) {
                  var now = Date.now();
                  if (now - lastTouchEnd <= 300) {
                    e.preventDefault();
                  }
                  lastTouchEnd = now;
                }, { passive: false });

                // Prevent Ctrl + Wheel zoom on desktop/trackpad
                document.addEventListener('wheel', function(e) {
                  if (e.ctrlKey) {
                    e.preventDefault();
                  }
                }, { passive: false });

                // Prevent Ctrl/Cmd + (+/-/0) keyboard zoom
                document.addEventListener('keydown', function(e) {
                  if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '=' || e.key === '0')) {
                    e.preventDefault();
                  }
                }, { passive: false });

                // Force update any stale Service Worker so old sw.js FetchEvent errors are cleared immediately
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.getRegistrations().then(function(regs) {
                    regs.forEach(function(reg) {
                      reg.update();
                    });
                  }).catch(function() {});
                }
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
