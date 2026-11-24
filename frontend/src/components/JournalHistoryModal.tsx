import React from 'react';
import { X, Calendar, FileText, Lock, Trash2 } from 'lucide-react';
import type { JournalDetailResponse } from '../types';

interface JournalHistoryModalProps {
  journal: JournalDetailResponse | null;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export const JournalHistoryModal: React.FC<JournalHistoryModalProps> = ({
  journal,
  onClose,
  onDelete,
}) => {
  if (!journal) return null;

  const emotionConfigs = [
    { key: 'joy' as const, label: 'Joy', color: 'var(--emotion-joy)', hex: '#10b981' },
    { key: 'sadness' as const, label: 'Sadness', color: 'var(--emotion-sadness)', hex: '#3b82f6' },
    { key: 'anxiety' as const, label: 'Anxiety', color: 'var(--emotion-anxiety)', hex: '#f59e0b' },
    { key: 'anger' as const, label: 'Anger', color: 'var(--emotion-anger)', hex: '#f43f5e' },
    { key: 'fear' as const, label: 'Fear', color: 'var(--emotion-fear)', hex: '#a855f7' },
  ];

  const scores = journal.emotion_scores;

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '650px' }}
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
              background: 'rgba(108, 99, 255, 0.15)',
              border: '1px solid rgba(108, 99, 255, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Lock size={18} color="var(--brand-primary)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                Journal Entry
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <span><Calendar size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />{formatDate(journal.created_at)}</span>
                <span>•</span>
                <span><FileText size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />{journal.word_count} words</span>
              </div>
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

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {/* Dominant Emotion Badge */}
          {scores && (
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Main Mood:</span>
                <span className={`badge badge-${scores.dominant_emotion}`} style={{ textTransform: 'capitalize' }}>
                  {scores.dominant_emotion}
                </span>
              </div>
            </div>
          )}

          {/* Journal Text Body */}
          <div style={{
            background: '#fff',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            fontSize: '0.975rem',
            lineHeight: 1.7,
            color: 'var(--text-primary)',
            whiteSpace: 'pre-wrap',
            marginBottom: '24px',
            maxHeight: '260px',
            overflowY: 'auto',
            boxShadow: 'var(--shadow-sm)',
          }}>
            {journal.content}
          </div>

          {/* 5-Dimension Emotion Score Bars */}
          {scores && (
            <div>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '14px', letterSpacing: '0.02em' }}>
                Mood Breakdown
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {emotionConfigs.map((cfg) => {
                  const scoreVal = scores[cfg.key];
                  const percentage = Math.round(scoreVal * 100);
                  return (
                    <div key={cfg.key}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', marginBottom: '4px' }}>
                        <span style={{ color: cfg.hex, fontWeight: 600 }}>{cfg.label}</span>
                        <span style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{percentage}%</span>
                      </div>
                      <div style={{
                        width: '100%',
                        height: '8px',
                        background: 'rgba(0, 0, 0, 0.07)',
                        borderRadius: '4px',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          width: `${percentage}%`,
                          height: '100%',
                          background: cfg.hex,
                          borderRadius: '4px',
                          boxShadow: `0 0 10px ${cfg.hex}66`,
                          transition: 'width 0.4s ease',
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div style={{
            marginTop: '28px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete this encrypted journal entry?')) {
                  onDelete(journal.id);
                  onClose();
                }
              }}
              className="btn btn-sm btn-outline"
              style={{ color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.3)' }}
            >
              <Trash2 size={14} />
              <span>Delete Entry</span>
            </button>

            <button
              onClick={onClose}
              className="btn btn-secondary btn-sm"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
