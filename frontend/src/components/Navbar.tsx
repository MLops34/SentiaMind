import React from 'react';
import {
  Brain,
  Shield,
  LifeBuoy,
  BookOpen,
  LayoutDashboard,
  TrendingUp,
  Heart,
  Globe,
} from 'lucide-react';
import type { UserProfile } from '../types';

interface NavbarProps {
  currentTab: 'journal' | 'dashboard' | 'forecast' | 'wellness';
  onSelectTab: (tab: 'journal' | 'dashboard' | 'forecast' | 'wellness') => void;
  user: UserProfile;
  onOpenCrisis: () => void;
  onChangeCountry: (code: string) => void;
  onOpenCounselorModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  user,
  onOpenCrisis,
  onChangeCountry,
  onOpenCounselorModal,
}) => {
  return (
    <header className="navbar-header">
      <div className="navbar-container">
        {/* Top / Left Section: Brand & Right Actions on Mobile */}
        <div className="navbar-top-row">
          {/* Brand Logo */}
          <div
            onClick={() => onSelectTab('journal')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <div style={{
              position: 'relative',
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6c63ff 0%, #3b82f6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(108, 99, 255, 0.4)',
              flexShrink: 0,
            }}>
              <Brain size={20} color="#ffffff" />
              <span style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                width: '9px',
                height: '9px',
                borderRadius: '50%',
                background: '#10b981',
                border: '2px solid #ffffff',
              }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 700,
                  fontSize: '1.25rem',
                  letterSpacing: '-0.02em',
                  background: 'linear-gradient(to right, #6c63ff, #3b82f6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  SentiaMind
                </span>
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                Daily Journal &amp; Wellness
              </span>
            </div>
          </div>

          {/* Actions on Mobile right or desktop right */}
          <div className="navbar-actions">
            {/* Country Selector */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '4px 6px',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
            }}>
              <Globe size={13} />
              <select
                value={user.country_code}
                onChange={(e) => onChangeCountry(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontFamily: 'inherit',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  outline: 'none',
                }}
                aria-label="Select Country for Crisis Hotlines"
              >
                <option value="IN" style={{ background: '#ffffff' }}>IN</option>
                <option value="US" style={{ background: '#ffffff' }}>US</option>
                <option value="GB" style={{ background: '#ffffff' }}>GB</option>
                <option value="AU" style={{ background: '#ffffff' }}>AU</option>
                <option value="_DEFAULT" style={{ background: '#ffffff' }}>INT</option>
              </select>
            </div>

            {/* Counselor Report Button */}
            <button
              onClick={onOpenCounselorModal}
              className="btn btn-secondary btn-sm"
              title="University Wellness Summary Report"
              style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px' }}
            >
              <Shield size={13} color="var(--brand-primary)" />
              <span style={{ fontSize: '0.75rem' }}>Report</span>
            </button>

            {/* Emergency Crisis SOS Button */}
            <button
              onClick={onOpenCrisis}
              className="btn btn-crisis btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, padding: '5px 10px' }}
              title="Immediate Crisis Hotlines & Safety Support"
            >
              <LifeBuoy size={14} />
              <span style={{ fontSize: '0.75rem' }}>SOS</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Scrollable on mobile) */}
        <nav className="navbar-nav">
          <button
            onClick={() => onSelectTab('journal')}
            className={`btn btn-sm ${currentTab === 'journal' ? 'btn-primary' : 'btn-outline'}`}
            style={{ borderRadius: 'var(--radius-full)', border: 'none', fontSize: '0.825rem' }}
          >
            <BookOpen size={15} />
            <span>Journal</span>
          </button>

          <button
            onClick={() => onSelectTab('dashboard')}
            className={`btn btn-sm ${currentTab === 'dashboard' ? 'btn-primary' : 'btn-outline'}`}
            style={{ borderRadius: 'var(--radius-full)', border: 'none', fontSize: '0.825rem' }}
          >
            <LayoutDashboard size={15} />
            <span>Overview</span>
          </button>

          <button
            onClick={() => onSelectTab('forecast')}
            className={`btn btn-sm ${currentTab === 'forecast' ? 'btn-primary' : 'btn-outline'}`}
            style={{ borderRadius: 'var(--radius-full)', border: 'none', fontSize: '0.825rem' }}
          >
            <TrendingUp size={15} />
            <span>LSTM Forecast</span>
          </button>

          <button
            onClick={() => onSelectTab('wellness')}
            className={`btn btn-sm ${currentTab === 'wellness' ? 'btn-primary' : 'btn-outline'}`}
            style={{ borderRadius: 'var(--radius-full)', border: 'none', fontSize: '0.825rem' }}
          >
            <Heart size={15} />
            <span>Calm & Grounding</span>
          </button>
        </nav>
      </div>
    </header>
  );
};

