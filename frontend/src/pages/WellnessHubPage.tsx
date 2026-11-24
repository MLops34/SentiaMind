import React, { useState } from 'react';
import {
  Heart,
  Eye,
  Hand,
  Volume2,
  Flower2,
  Smile,
  CheckCircle,
  Sparkles,
  LifeBuoy,
} from 'lucide-react';
import { BreathingPacer } from '../components/BreathingPacer';

interface WellnessHubPageProps {
  onOpenCrisis: () => void;
}

export const WellnessHubPage: React.FC<WellnessHubPageProps> = ({ onOpenCrisis }) => {
  // 5-4-3-2-1 Grounding State
  const [sensoryStep, setSensoryStep] = useState<number>(0);

  const sensorySteps = [
    {
      num: 5,
      title: 'Acknowledge 5 things you can SEE around you',
      desc: 'Look around your room or desk. Notice a pen, a shadow on the wall, the texture of your screen, a plant, or light through a window.',
      icon: <Eye size={24} color="#3b82f6" />,
      color: '#3b82f6',
    },
    {
      num: 4,
      title: 'Acknowledge 4 things you can TOUCH or FEEL',
      desc: 'Feel the pressure of your feet on the ground, your fingers on the keyboard, the fabric of your sweater, or the cool air on your skin.',
      icon: <Hand size={24} color="#10b981" />,
      color: '#10b981',
    },
    {
      num: 3,
      title: 'Acknowledge 3 things you can HEAR',
      desc: 'Listen closely. Notice the faint hum of a fan, distant birds or footsteps, or your own slow breath.',
      icon: <Volume2 size={24} color="#f59e0b" />,
      color: '#f59e0b',
    },
    {
      num: 2,
      title: 'Acknowledge 2 things you can SMELL',
      desc: 'Notice the smell of fresh coffee, pencil wood, your sweater, or take a gentle deep breath of ambient fresh air.',
      icon: <Flower2 size={24} color="#a855f7" />,
      color: '#a855f7',
    },
    {
      num: 1,
      title: 'Acknowledge 1 thing you APPRECIATE about yourself',
      desc: 'Say gently to yourself: "I am doing the best I can today, and that is enough. I am worthy of rest."',
      icon: <Smile size={24} color="#ec4899" />,
      color: '#ec4899',
    },
  ];

  return (
    <div className="responsive-container">
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: '1.85rem', color: 'var(--text-primary)' }}>
            Wellness & Calm Tools
          </h1>
          <span className="badge badge-joy" style={{ fontSize: '0.75rem' }}>
            <Heart size={11} /> Feel Better Now
          </span>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Simple, calming exercises to help you slow down, breathe, and feel more grounded whenever you need it.
        </p>
      </div>

      <div className="responsive-wellness-split">
        {/* Left Column: 4-7-8 Breathing Pacer */}
        <div>
          <div className="glass-card" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
              Guided Breathing
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
              Follow the 4-7-8 pattern — breathe in for 4 seconds, hold for 7, then slowly exhale for 8. This gentle rhythm helps calm your mind and body.
            </p>
            <BreathingPacer />
          </div>
        </div>

        {/* Right Column: 5-4-3-2-1 Sensory Grounding Tool */}
        <div>
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                5-4-3-2-1 Grounding
              </h2>
              <span className="badge badge-neutral">
                Step {sensoryStep + 1} of 5
              </span>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Feeling overwhelmed? Use your senses to anchor yourself back to the present moment.
            </p>

            {/* Current Step Card */}
            <div style={{
              background: '#fff',
              border: `1px solid ${sensorySteps[sensoryStep].color}44`,
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              textAlign: 'center',
              marginBottom: '20px',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: `${sensorySteps[sensoryStep].color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
              }}>
                {sensorySteps[sensoryStep].icon}
              </div>

              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
                {sensorySteps[sensoryStep].title}
              </h3>

              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '420px', margin: '0 auto 20px auto' }}>
                {sensorySteps[sensoryStep].desc}
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                {sensoryStep > 0 && (
                  <button
                    onClick={() => setSensoryStep((s) => s - 1)}
                    className="btn btn-secondary btn-sm"
                  >
                    Previous Step
                  </button>
                )}

                {sensoryStep < 4 ? (
                  <button
                    onClick={() => setSensoryStep((s) => s + 1)}
                    className="btn btn-primary btn-sm"
                    style={{ background: sensorySteps[sensoryStep].color }}
                  >
                    I found them, Next →
                  </button>
                ) : (
                  <button
                    onClick={() => setSensoryStep(0)}
                    className="btn btn-primary btn-sm"
                    style={{ background: '#10b981' }}
                  >
                    <CheckCircle size={14} /> Complete & Reset
                  </button>
                )}
              </div>
            </div>

            {/* Step Indicators */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {sensorySteps.map((s, idx) => (
                <div
                  key={s.num}
                  onClick={() => setSensoryStep(idx)}
                  style={{
                    flex: 1,
                    height: '6px',
                    borderRadius: '3px',
                    background: idx <= sensoryStep ? s.color : 'var(--bg-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Cognitive Reframing & Crisis Card Row */}
      <div style={{
        marginTop: '28px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px',
      }}>
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Sparkles size={18} color="var(--brand-primary)" />
            <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>
              Cognitive Reframe: Exam & Academic Stress
            </h3>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <p style={{ marginBottom: '8px' }}>
              <strong>Unhelpful Thought:</strong> "If I don't get an A in this subject, my future is ruined."
            </p>
            <p style={{ color: '#10b981' }}>
              <strong>Balanced Reframe:</strong> "One exam or assignment is just one data point. My capacity to learn, adapt, and grow is what matters far more in the long run."
            </p>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '24px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <LifeBuoy size={18} color="#ef4444" />
            <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>
              Immediate Help is Always Available
            </h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
            If breathing and grounding are not enough and you feel unsafe or in overwhelming pain, please reach out directly to verified campus and national helplines.
          </p>
          <button
            onClick={onOpenCrisis}
            className="btn btn-crisis btn-sm"
          >
            Access Emergency Helplines
          </button>
        </div>
      </div>
    </div>
  );
};
