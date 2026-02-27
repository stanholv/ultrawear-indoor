import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Link2, Star } from 'lucide-react';
import { SpelerKoppelingPanel } from './SpelerKoppelingPanel';

type AdminTab = 'spelers' | 'reviews';

const TABS: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
  { id: 'spelers', label: 'Speler Koppelingen', icon: <Link2 size={18} /> },
  { id: 'reviews', label: 'Reviews', icon: <Star size={18} /> },
];

export const AdminPage = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('spelers');

  return (
    <div className="container" style={{ padding: 'var(--spacing-xl)' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

        {/* Header */}
        <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
          <div className="card-header">
            <h1 className="card-title">
              <Shield size={28} /> Admin Dashboard
            </h1>
            <p className="page-subtitle" style={{ margin: 0 }}>Beheer spelers en reviews</p>
          </div>
        </div>

        {/* Tab navigatie */}
        <div style={{
          display: 'flex',
          gap: 'var(--spacing-sm)',
          marginBottom: 'var(--spacing-xl)',
          borderBottom: '2px solid var(--color-border)',
          paddingBottom: 'var(--spacing-sm)',
          flexWrap: 'wrap',
        }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-sm)',
                padding: 'var(--spacing-sm) var(--spacing-lg)',
                background: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-surface)',
                color: activeTab === tab.id ? 'white' : 'var(--color-text-secondary)',
                border: activeTab === tab.id ? 'none' : '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                fontWeight: activeTab === tab.id ? '700' : '500',
                fontSize: '0.9rem',
                transition: 'all var(--transition-fast)',
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab: Speler Koppelingen */}
        {activeTab === 'spelers' && (
          <motion.div key="spelers" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <SpelerKoppelingPanel />
          </motion.div>
        )}

        {/* Tab: Reviews (placeholder voor v2.6) */}
        {activeTab === 'reviews' && (
          <motion.div key="reviews" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card">
            <div className="card-header">
              <h2 className="card-title"><Star size={22} /> Review Moderatie</h2>
            </div>
            <div style={{ padding: 'var(--spacing-2xl)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
              <Star size={48} color="var(--color-border)" style={{ marginBottom: 'var(--spacing-md)' }} />
              <div style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: 'var(--spacing-sm)' }}>
                Komt eraan in v2.6
              </div>
              <div style={{ fontSize: '0.875rem' }}>
                Hier kan je straks reviews bekijken en modereren.
              </div>
            </div>
          </motion.div>
        )}

      </motion.div>
    </div>
  );
};
