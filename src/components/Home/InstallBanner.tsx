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
  (window.navigator as any).standalone === true;

const isIOS = () =>
  /iphone|ipad|ipod/i.test(window.navigator.userAgent) &&
  !(window.navigator as any).MSStream;

export const InstallBanner = () => {
  const [visible, setVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    // Mobile only, not already installed, not previously dismissed.
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (!isMobile || isStandalone() || localStorage.getItem(DISMISS_KEY)) return;

    // Show on any mobile device — don't wait for beforeinstallprompt (which is
    // unreliable / Android-only). The install button adapts to what's available.
    setVisible(true);

    // Pick up an install prompt captured early in index.html, or future ones.
    const existing = (window as any).__deferredPrompt as BeforeInstallPromptEvent | undefined;
    if (existing) setDeferredPrompt(existing);

    const onReady = () => setDeferredPrompt((window as any).__deferredPrompt ?? null);
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setVisible(false);

    window.addEventListener('pwa-prompt-ready', onReady);
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('pwa-prompt-ready', onReady);
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
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
    } else {
      // No native prompt (iOS, or Android before the event) — show how-to.
      setShowHelp(v => !v);
    }
  };

  const helpText = isIOS()
    ? 'Tik op het deel-icoon en kies “Zet op beginscherm”.'
    : 'Open het browsermenu (⋮) en kies “App installeren”.';

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
              {showHelp ? helpText : 'Installeer Ultrawear Indoor op je startscherm.'}
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
            {deferredPrompt ? <Download size={16} /> : <Share size={16} />}
            {deferredPrompt ? 'Installeren' : 'Hoe?'}
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
