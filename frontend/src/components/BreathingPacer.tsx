import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Wind } from 'lucide-react';

interface BreathingPacerProps {
  compact?: boolean;
}

export const BreathingPacer: React.FC<BreathingPacerProps> = ({ compact = false }) => {
  const [isActive, setIsActive] = useState<boolean>(true);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [timer, setTimer] = useState<number>(4);
  const [cyclesCompleted, setCyclesCompleted] = useState<number>(0);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev > 1) {
          return prev - 1;
        }

        // Transition to next phase
        if (phase === 'inhale') {
          setPhase('hold');
          return 7;
        } else if (phase === 'hold') {
          setPhase('exhale');
          return 8;
        } else {
          setPhase('inhale');
          setCyclesCompleted((c) => c + 1);
          return 4;
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, phase]);

  const resetPacer = () => {
    setIsActive(false);
    setPhase('inhale');
    setTimer(4);
    setCyclesCompleted(0);
  };

  const getPhaseInstruction = () => {
    switch (phase) {
      case 'inhale':
        return { label: 'Inhale deeply', tip: 'Breathe in slowly through your nose...', color: '#10b981' };
      case 'hold':
        return { label: 'Hold breath', tip: 'Keep air calm inside your chest...', color: '#6366f1' };
      case 'exhale':
        return { label: 'Exhale slowly', tip: 'Release fully through your mouth with a gentle whoosh...', color: '#06b6d4' };
    }
  };

  const instruction = getPhaseInstruction();

  // Circle scaling based on phase
  let scale = 1;
  if (phase === 'inhale') scale = 1.35;
  if (phase === 'hold') scale = 1.35;
  if (phase === 'exhale') scale = 0.95;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: compact ? '16px' : '28px',
      background: 'var(--bg-secondary)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border-subtle)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: compact ? '12px' : '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Wind size={18} color="var(--brand-primary)" />
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            4-7-8 Parasympathetic Breathing
          </span>
        </div>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Cycles: {cyclesCompleted}
        </span>
      </div>

      {/* Breathing Animated Orb */}
      <div style={{
        position: 'relative',
        width: compact ? '140px' : '200px',
        height: compact ? '140px' : '200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '16px 0',
      }}>
        {/* Outer Glow Halo */}
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${instruction.color}33 0%, transparent 70%)`,
          transform: `scale(${scale * 1.2})`,
          transition: phase === 'exhale' ? 'transform 8s ease-out' : phase === 'inhale' ? 'transform 4s ease-in' : 'none',
        }} />

        {/* Inner Pulsing Circle */}
        <div style={{
          width: compact ? '110px' : '150px',
          height: compact ? '110px' : '150px',
          borderRadius: '50%',
          background: `radial-gradient(circle at 30% 30%, ${instruction.color} 0%, #ffffff 100%)`,
          boxShadow: `0 0 35px ${instruction.color}66`,
          transform: `scale(${scale})`,
          transition: phase === 'exhale' ? 'transform 8s ease-out' : phase === 'inhale' ? 'transform 4s ease-in' : 'transform 0.5s ease',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          userSelect: 'none',
        }}>
          <span style={{
            fontSize: compact ? '2rem' : '2.8rem',
            fontWeight: 800,
            fontFamily: 'Outfit, sans-serif',
            lineHeight: 1,
          }}>
            {timer}s
          </span>
          <span style={{
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontWeight: 600,
            marginTop: '4px',
            opacity: 0.9,
          }}>
            {phase}
          </span>
        </div>
      </div>

      {/* Instruction Tip */}
      <div style={{ textAlign: 'center', minHeight: '44px', marginBottom: '16px' }}>
        <p style={{ fontSize: '1rem', fontWeight: 600, color: instruction.color }}>
          {instruction.label}
        </p>
        <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
          {instruction.tip}
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => setIsActive(!isActive)}
          className="btn btn-secondary btn-sm"
          style={{ minWidth: '90px' }}
        >
          {isActive ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Resume</>}
        </button>
        <button
          onClick={resetPacer}
          className="btn btn-outline btn-sm"
          title="Reset timer"
        >
          <RotateCcw size={14} />
        </button>
      </div>
    </div>
  );
};
