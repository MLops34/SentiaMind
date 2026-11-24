import React, { useState } from 'react';
import type { EmotionTrendPoint } from '../types';

interface EmotionChartProps {
  data: EmotionTrendPoint[];
}

export const EmotionChart: React.FC<EmotionChartProps> = ({ data }) => {
  const [activeEmotions, setActiveEmotions] = useState({
    joy: true,
    sadness: true,
    anxiety: true,
    anger: false,
    fear: false,
  });

  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
        No entries yet. Start writing in your journal to see your mood trends here.
      </div>
    );
  }

  const emotionConfigs = [
    { key: 'joy' as const, label: 'Joy', color: 'var(--emotion-joy)', hex: '#10b981' },
    { key: 'sadness' as const, label: 'Sadness', color: 'var(--emotion-sadness)', hex: '#3b82f6' },
    { key: 'anxiety' as const, label: 'Anxiety', color: 'var(--emotion-anxiety)', hex: '#f59e0b' },
    { key: 'anger' as const, label: 'Anger', color: 'var(--emotion-anger)', hex: '#f43f5e' },
    { key: 'fear' as const, label: 'Fear', color: 'var(--emotion-fear)', hex: '#a855f7' },
  ];

  const toggleEmotion = (key: keyof typeof activeEmotions) => {
    setActiveEmotions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // SVG Chart Geometry
  const width = 740;
  const height = 280;
  const padding = { top: 30, right: 30, bottom: 40, left: 45 };

  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const pointsCount = data.length;
  const getX = (index: number) => padding.left + (index / (pointsCount - 1)) * plotWidth;
  const getY = (val: number) => padding.top + plotHeight - val * plotHeight;

  // Generate smooth SVG path
  const makePath = (key: 'joy' | 'sadness' | 'anxiety' | 'anger' | 'fear') => {
    if (data.length < 2) return '';
    return data.reduce((acc, pt, i) => {
      const x = getX(i);
      const y = getY(pt[key]);
      if (i === 0) return `M ${x},${y}`;

      const prevX = getX(i - 1);
      const prevY = getY(data[i - 1][key]);
      const cp1X = prevX + (x - prevX) / 2;
      const cp1Y = prevY;
      const cp2X = prevX + (x - prevX) / 2;
      const cp2Y = y;
      return `${acc} C ${cp1X},${cp1Y} ${cp2X},${cp2Y} ${x},${y}`;
    }, '');
  };

  // Area under path
  const makeArea = (key: 'joy' | 'sadness' | 'anxiety' | 'anger' | 'fear') => {
    const linePath = makePath(key);
    if (!linePath) return '';
    const lastX = getX(data.length - 1);
    const firstX = getX(0);
    const baselineY = getY(0);
    return `${linePath} L ${lastX},${baselineY} L ${firstX},${baselineY} Z`;
  };

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      {/* Emotion Legend & Toggles */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '16px',
      }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Click an emotion to toggle visibility:
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {emotionConfigs.map((cfg) => {
            const isActive = activeEmotions[cfg.key];
            return (
              <button
                key={cfg.key}
                onClick={() => toggleEmotion(cfg.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: `1px solid ${isActive ? cfg.hex : 'var(--border-subtle)'}`,
                  background: isActive ? `${cfg.hex}18` : 'var(--bg-secondary)',
                  color: isActive ? cfg.hex : 'var(--text-muted)',
                  transition: 'all 0.2s ease',
                }}
              >
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: isActive ? cfg.hex : 'var(--text-muted)',
                }} />
                {cfg.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* SVG Container */}
      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: 'auto', minWidth: '550px', overflow: 'visible' }}
          onMouseLeave={() => setHoverIndex(null)}
        >
          {/* Background Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1.0].map((level) => {
            const y = getY(level);
            return (
              <g key={level}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="rgba(0, 0, 0, 0.08)"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  fill="var(--text-muted)"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {Math.round(level * 100)}%
                </text>
              </g>
            );
          })}

          {/* Paths & Areas for Active Emotions */}
          {emotionConfigs.map((cfg) => {
            if (!activeEmotions[cfg.key]) return null;
            return (
              <g key={cfg.key}>
                {/* Subtle gradient area */}
                <path
                  d={makeArea(cfg.key)}
                  fill={cfg.hex}
                  opacity={0.07}
                />
                {/* Curved line */}
                <path
                  d={makePath(cfg.key)}
                  fill="none"
                  stroke={cfg.hex}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ filter: `drop-shadow(0 2px 8px ${cfg.hex}44)` }}
                />
              </g>
            );
          })}

          {/* Vertical Guides & Data Points */}
          {data.map((pt, i) => {
            const x = getX(i);
            const isHovered = hoverIndex === i;

            return (
              <g key={i}>
                {/* Vertical hover line */}
                {isHovered && (
                  <line
                    x1={x}
                    y1={padding.top}
                    x2={x}
                    y2={height - padding.bottom}
                    stroke="rgba(0, 0, 0, 0.18)"
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                  />
                )}

                {/* X-axis Date tick */}
                {(i % 2 === 0 || i === data.length - 1) && (
                  <text
                    x={x}
                    y={height - padding.bottom + 20}
                    textAnchor="middle"
                    fill="var(--text-muted)"
                    fontSize="10"
                  >
                    {pt.date.slice(5)}
                  </text>
                )}

                {/* Circles for active emotions */}
                {emotionConfigs.map((cfg) => {
                  if (!activeEmotions[cfg.key]) return null;
                  const y = getY(pt[cfg.key]);
                  return (
                    <circle
                      key={cfg.key}
                      cx={x}
                      cy={y}
                      r={isHovered ? 5 : 3}
                      fill={cfg.hex}
                      stroke="#ffffff"
                      strokeWidth={1.5}
                      style={{ transition: 'r 0.15s ease' }}
                    />
                  );
                })}

                {/* Invisible hover trigger column */}
                <rect
                  x={x - plotWidth / (pointsCount * 2)}
                  y={padding.top}
                  width={plotWidth / pointsCount}
                  height={plotHeight}
                  fill="transparent"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoverIndex(i)}
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Floating Tooltip when hovering a point */}
      {hoverIndex !== null && data[hoverIndex] && (
        <div style={{
          position: 'absolute',
          top: '40px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#fff',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 16px',
          boxShadow: 'var(--shadow-lg)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          pointerEvents: 'none',
          zIndex: 10,
        }}>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Date</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {data[hoverIndex].date}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            {emotionConfigs.map((cfg) => {
              if (!activeEmotions[cfg.key]) return null;
              const val = Math.round(data[hoverIndex][cfg.key] * 100);
              return (
                <div key={cfg.key}>
                  <div style={{ fontSize: '0.75rem', color: cfg.hex, fontWeight: 600 }}>
                    {cfg.label}
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {val}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
