import React, { useState, useEffect } from 'react';
import {
  Layers,
  Sliders,
} from 'lucide-react';
import type { ForecastResponse } from '../types';
import { api } from '../api/client';
import { ForecastWidget } from '../components/ForecastWidget';

export const ForecastPage: React.FC = () => {
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [threshold, setThreshold] = useState<number>(0.75);

  useEffect(() => {
    api.getForecast().then(setForecast);
  }, []);

  if (!forecast) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading your forecast...
      </div>
    );
  }

  return (
    <div className="responsive-container">
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <h1 style={{ fontSize: '1.85rem', color: 'var(--text-primary)' }}>
            Your Week Ahead
          </h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Based on your journaling patterns, here's how your emotional wellbeing may look over the next 7 days.
        </p>
      </div>

      {/* Main Forecast Widget */}
      <div style={{ marginBottom: '32px' }}>
        <ForecastWidget forecast={forecast} />
      </div>

      {/* Insight Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px',
      }}>
        {/* How it works */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <Layers size={20} color="var(--brand-primary)" />
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>
              How Your Forecast Works
            </h3>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
            SentiaMind analyzes your recent journal entries and identifies emotional patterns over time — like how you tend to feel on certain days of the week. It then uses those patterns to give you a heads-up about potentially stressful days ahead.
          </p>
        </div>

        {/* Alert Sensitivity */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sliders size={20} color="#d97706" />
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                Alert Sensitivity
              </h3>
            </div>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#d97706' }}>
              {Math.round(threshold * 100)}%
            </span>
          </div>

          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: '16px' }}>
            Adjust how early you'd like to be notified. Lower values give earlier gentle nudges; higher values flag only the most intense stress periods.
          </p>

          <input
            type="range"
            min="0.50"
            max="0.95"
            step="0.05"
            value={threshold}
            onChange={(e) => setThreshold(parseFloat(e.target.value))}
            style={{
              width: '100%',
              accentColor: '#d97706',
              cursor: 'pointer',
              marginBottom: '12px',
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>Early (50%)</span>
            <span>Balanced (75%)</span>
            <span>Only High (95%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
