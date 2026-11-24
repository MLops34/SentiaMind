import React, { useState } from 'react';
import {
  HeartHandshake,
  Phone,
  X,
  ExternalLink,
  ShieldCheck,
  Building2,
  Wind,
} from 'lucide-react';
import { getCrisisResponse } from '../services/crisisEngine';
import { BreathingPacer } from './BreathingPacer';

interface CrisisModalProps {
  isOpen: boolean;
  countryCode: string;
  onClose: () => void;
  detectedTrigger?: boolean;
}

export const CrisisModal: React.FC<CrisisModalProps> = ({
  isOpen,
  countryCode,
  onClose,
  detectedTrigger = false,
}) => {
  const [showBreathing, setShowBreathing] = useState<boolean>(false);

  if (!isOpen) return null;

  const crisisData = getCrisisResponse(countryCode);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          border: '1px solid rgba(239, 68, 68, 0.4)',
          boxShadow: '0 20px 60px rgba(239, 68, 68, 0.25), 0 0 30px rgba(0, 0, 0, 0.9)',
          maxWidth: '680px',
        }}
      >
        {/* Header Alert Strip */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, rgba(185, 28, 28, 0.15) 100%)',
          padding: '20px 24px',
          borderBottom: '1px solid rgba(239, 68, 68, 0.25)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(239, 68, 68, 0.5)',
              flexShrink: 0,
            }}>
              <HeartHandshake size={24} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                {detectedTrigger ? 'You are not alone. Help is here right now.' : 'Emergency & Crisis Resources'}
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#dc2626', marginTop: '3px' }}>
                {detectedTrigger
                  ? 'Our safeguard system detected emotional distress signals. We care deeply about your wellbeing.'
                  : 'Immediate, confidential support available 24/7 at zero cost.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-sm btn-outline"
            style={{ borderRadius: '50%', width: '32px', height: '32px', padding: 0 }}
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px' }}>
          {/* Privacy & Safety Guarantee */}
          <div style={{
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '20px',
          }}>
            <ShieldCheck size={18} color="#10b981" />
            <span style={{ fontSize: '0.825rem', color: '#047857' }}>
              <strong>Zero-Stigma Policy:</strong> When crisis safeguards trigger, raw journal content is intentionally discarded and NOT stored to persistent databases. Your privacy and safety are completely protected.
            </span>
          </div>

          {/* Quick Action: Grounding Pacer Toggle */}
          <div style={{ marginBottom: '20px' }}>
            <button
              onClick={() => setShowBreathing(!showBreathing)}
              className="btn btn-secondary btn-sm"
              style={{ width: '100%', justifyContent: 'space-between', padding: '10px 16px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Wind size={16} color="var(--brand-primary)" />
                <span style={{ fontWeight: 600 }}>
                  {showBreathing ? 'Hide Calming Breathing Pacer' : 'Need an immediate moment to breathe? Try 4-7-8 Breathing'}
                </span>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--brand-primary)' }}>
                {showBreathing ? '▲ Close' : '▼ Expand'}
              </span>
            </button>

            {showBreathing && (
              <div style={{ marginTop: '12px' }}>
                <BreathingPacer compact />
              </div>
            )}
          </div>

          {/* Verified Hotlines Section */}
          <h3 style={{ fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            Verified Helplines ({countryCode.toUpperCase()} & Emergency)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
            {crisisData.hotlines.map((hotline, idx) => {
              const isUrl = hotline.number.startsWith('http');
              return (
                <div
                  key={idx}
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      {hotline.name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Availability: {hotline.available}
                    </div>
                  </div>

                  <div>
                    {isUrl ? (
                      <a
                        href={hotline.number}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary btn-sm"
                      >
                        <ExternalLink size={14} />
                        <span>Visit Resource</span>
                      </a>
                    ) : (
                      <a
                        href={`tel:${hotline.number.replace(/[^0-9+]/g, '')}`}
                        className="btn btn-primary btn-sm"
                        style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                      >
                        <Phone size={14} />
                        <span>Call {hotline.number}</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Campus Wellness Center Information */}
          <div style={{
            background: 'rgba(108, 99, 255, 0.08)',
            border: '1px solid rgba(108, 99, 255, 0.2)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 18px',
            marginBottom: '20px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--brand-primary)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px' }}>
              <Building2 size={16} />
              <span>University Campus Support & Counseling Center</span>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Most campus student health centers maintain 24-hour on-call counselors and walk-in crisis triage. If you are on or near campus, please consider visiting your Student Wellness Pavilion or calling Campus Safety.
            </p>
          </div>

          {/* Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              onClick={onClose}
              className="btn btn-secondary"
              style={{ fontSize: '0.9rem' }}
            >
              I feel safe & want to close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
