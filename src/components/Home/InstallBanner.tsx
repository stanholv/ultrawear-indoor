import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// @ts-ignore
import { Download, Share, X } from 'lucide-react';

const DISMISS_KEY = 'pwa-banner-dismissed';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  // iOS Safari
  (window.navigator as any).standalone === true;

const isIOS = () =>
  /iphone|ipad|ipod/i.test(window.navigator.userAgent) &&
  !(window.navigator as any).MSStream;

export const InstallBanner = () => {
  const [visible, setVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHelp, setShowIosHelp] = useState(false);

  useEffect(() => {
    // Only on mobile, not already installed, not previously dismissed.
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (!isMobile || isStandalone() || localStorage.getItem(DISMISS_KEY)) return;

    // Android / Chromium: capture the install prompt.
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // iOS has no beforeinstallprompt — show manual instructions instead.
    if (isIOS()) setVisible(true);

    // Hide once the app gets installed.
    const installed = () => setVisible(false);
    window.addEventListener('appinstalled', installed);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installed);
    };
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, '1');
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      if (outcome === 'accepted') setVisible(false);
    } else if (isIOS()) {
      setShowIosHelp(v => !v);
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="install-banner"
          style={{
            background: 'var(--color-secondary)',
            color: 'white',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--spacing-md) var(--spacing-lg)',
            marginBottom: 'var(--spacing-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-md)',
            border: '1px solid var(--color-primary)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div style={{
            flexShrink: 0, width: '40px', height: '40px',
            borderRadius: 'var(--radius-sm)', background: 'var(--color-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Download size={20} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>App nu beschikbaar 🎉</div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>
              {showIosHelp
                ? 'Tik op het deel-icoon en kies “Zet op beginscherm”.'
                : 'Installeer Ultrawear Indoor op je startscherm.'}
            </div>
          </div>

          <button
            onClick={handleInstall}
            style={{
              flexShrink: 0, display: 'flex', alignItems: 'center', gap: '6px',
              background: 'var(--color-primary)', color: 'white', border: 'none',
              borderRadius: 'var(--radius-sm)', padding: '8px 14px',
              fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
            }}
          >
            {isIOS() ? <Share size={16} /> : <Download size={16} />}
            {isIOS() ? 'Hoe?' : 'Installeren'}
          </button>

          <button
            onClick={dismiss}
            aria-label="Sluiten"
            style={{
              flexShrink: 0, background: 'none', border: 'none',
              color: 'rgba(255,255,255,0.6)', cursor: 'pointer', padding: '4px',
            }}
          >
            <X size={18} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
