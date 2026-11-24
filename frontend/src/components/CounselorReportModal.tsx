import React, { useState } from 'react';
import { X, Printer, ShieldCheck } from 'lucide-react';
import type { EmotionSummary, UserProfile } from '../types';

interface CounselorReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  summary: EmotionSummary;
  onUpdateConsent: (consent: boolean) => void;
}

export const CounselorReportModal: React.FC<CounselorReportModalProps> = ({
  isOpen,
  onClose,
  user,
  summary,
  onUpdateConsent,
}) => {
  const [consent, setConsent] = useState<boolean>(user.counselor_consent);

  if (!isOpen) return null;

  const handleToggleConsent = () => {
    const nextVal = !consent;
    setConsent(nextVal);
    onUpdateConsent(nextVal);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px' }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <ShieldCheck size={20} color="#10b981" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                Wellness Summary Report
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Personal overview of your recent reflections
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-sm btn-outline"
            style={{ borderRadius: '50%', width: '32px', height: '32px', padding: 0 }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px' }} id="printable-report">
          {/* Consent Banner */}
          <div style={{
            background: consent ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)',
            border: `1px solid ${consent ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '14px',
          }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: consent ? '#047857' : '#b45309' }}>
                {consent ? 'Sharing Consent Active' : 'Sharing Consent Paused'}
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {consent
                  ? 'Your campus mental health team can view anonymized mood trends to offer proactive care.'
                  : 'Your journal trends are private to you only. No counselors can access these analytics.'}
              </p>
            </div>

            <button
              onClick={handleToggleConsent}
              className={`btn btn-sm ${consent ? 'btn-secondary' : 'btn-primary'}`}
              style={{ flexShrink: 0 }}
            >
              {consent ? 'Opt Out' : 'Enable Consent'}
            </button>
          </div>

          {/* Student Overview Strip */}
          <div className="glass-card" style={{ padding: '16px', marginBottom: '18px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>User</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user.full_name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user.email}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Timeframe</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Last {summary.period_days} Days</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{summary.total_entries} Entries</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Streak</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#059669' }}>{summary.journaling_streak_days} Days Active</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Consistent</div>
              </div>
            </div>
          </div>

          {/* Average Emotion Breakdown */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
              Multi-Dimension Emotional Averages
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '8px',
              textAlign: 'center',
            }}>
              {[
                { label: 'Joy', val: summary.average_scores.joy, color: '#10b981' },
                { label: 'Sadness', val: summary.average_scores.sadness, color: '#3b82f6' },
                { label: 'Anxiety', val: summary.average_scores.anxiety, color: '#f59e0b' },
                { label: 'Anger', val: summary.average_scores.anger, color: '#f43f5e' },
                { label: 'Fear', val: summary.average_scores.fear, color: '#a855f7' },
              ].map((em) => (
                <div key={em.label} style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 4px',
                }}>
                  <div style={{ fontSize: '0.75rem', color: em.color, fontWeight: 600 }}>{em.label}</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                    {Math.round(em.val * 100)}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Clinical Insights */}
          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
          }}>
            <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
              Counselor Advisory Note:
            </strong>
            Overall baseline indicates high self-regulation with recurring anxiety spikes concentrated ahead of weekly project milestones. The student has maintained active reflective journaling and responds positively to grounding exercises.
          </div>

          {/* Action Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-subtle)',
          }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Generated on {new Date().toLocaleDateString()} via SentiaMind Engine
            </span>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handlePrint}
                className="btn btn-secondary btn-sm"
              >
                <Printer size={14} />
                <span>Print / Save PDF</span>
              </button>
              <button
                onClick={onClose}
                className="btn btn-primary btn-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
