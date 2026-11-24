import React from 'react';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  AlertOctagon,
  Sparkles,
} from 'lucide-react';
import type { ForecastResponse, AlertLevel } from '../types';

interface ForecastWidgetProps {
  forecast: ForecastResponse;
}

export const ForecastWidget: React.FC<ForecastWidgetProps> = ({ forecast }) => {
  const getAlertStyle = (level: AlertLevel) => {
    switch (level) {
      case 'low':
        return {
          bg: 'rgba(16, 185, 129, 0.12)',
          border: 'rgba(16, 185, 129, 0.3)',
          color: '#10b981',
          icon: <CheckCircle size={14} />,
          label: 'Low Stress',
        };
      case 'moderate':
        return {
          bg: 'rgba(245, 158, 11, 0.12)',
          border: 'rgba(245, 158, 11, 0.3)',
          color: '#f59e0b',
          icon: <AlertTriangle size={14} />,
          label: 'Moderate Stress',
        };
      case 'high':
        return {
          bg: 'rgba(249, 115, 22, 0.15)',
          border: 'rgba(249, 115, 22, 0.4)',
          color: '#f97316',
          icon: <AlertTriangle size={14} />,
          label: 'High Stress Alert',
        };
      case 'critical':
        return {
          bg: 'rgba(239, 68, 68, 0.2)',
          border: 'rgba(239, 68, 68, 0.5)',
          color: '#ef4444',
          icon: <AlertOctagon size={14} />,
          label: 'Critical Peak Anticipated',
        };
    }
  };

  // Find day with highest stress
  const peakDay = [...forecast.days].sort((a, b) => b.stress_probability - a.stress_probability)[0];

  const getWeekday = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Insight Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(108, 99, 255, 0.08) 0%, rgba(6, 182, 212, 0.06) 100%)',
        border: '1px solid rgba(108, 99, 255, 0.2)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'var(--brand-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--brand-glow)',
          }}>
            <TrendingUp size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)' }}>
                7-Day Stress Forecast
              </h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Helps you prepare ahead for high-stress days and plan restorative breaks.
            </p>
          </div>
        </div>

        {peakDay && (
          <div style={{
            background: '#fff',
            border: `1px solid ${getAlertStyle(peakDay.alert_level).color}44`,
            borderRadius: 'var(--radius-md)',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <AlertTriangle size={18} color={getAlertStyle(peakDay.alert_level).color} />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Anticipated Busy Peak</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {getWeekday(peakDay.forecast_date)} ({peakDay.forecast_date.slice(5)}) • {Math.round(peakDay.stress_probability * 100)}% Stress Risk
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 7-Day Timeline Cards Grid */}
      <div className="forecast-timeline-grid">
        {forecast.days.map((day) => {
          const alert = getAlertStyle(day.alert_level);
          const percent = Math.round(day.stress_probability * 100);

          return (
            <div
              key={day.day_offset}
              className="glass-card"
              style={{
                padding: '16px 12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                border: `1px solid ${day.alert_level === 'critical' || day.alert_level === 'high' ? alert.border : 'var(--border-subtle)'}`,
                background: day.alert_level === 'critical' ? 'rgba(239, 68, 68, 0.08)' : undefined,
              }}
            >
              {/* Day offset & Weekday */}
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {day.day_offset === 1 ? 'Tomorrow' : `+${day.day_offset} Days`}
              </span>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '2px 0 6px 0' }}>
                {getWeekday(day.forecast_date)}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                {day.forecast_date.slice(5)}
              </span>

              {/* Stress Probability Circle Gauge */}
              <div style={{
                position: 'relative',
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: `conic-gradient(${alert.color} ${percent * 3.6}deg, rgba(0, 0, 0, 0.08) 0deg)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px auto',
              }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                }}>
                  {percent}%
                </div>
              </div>

              {/* Alert Chip */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-full)',
                  background: alert.bg,
                  color: alert.color,
                  border: `1px solid ${alert.border}`,
                }}
              >
                {alert.icon}
                <span>{alert.label.split(' ')[0]}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Proactive Coping Recommendations */}
      <div className="glass-card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Sparkles size={18} color="var(--brand-primary)" />
          <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
            Proactive Coping Recommendations
          </h4>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '14px',
        }}>
          <div style={{
            background: 'var(--bg-secondary)',
            padding: '14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}>
            <strong style={{ color: 'var(--brand-primary)', fontSize: '0.9rem', display: 'block', marginBottom: '4px' }}>
              🛡️ Pre-emptive Workload Pacing
            </strong>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              Based on your predicted stress curve peaking on {peakDay ? getWeekday(peakDay.forecast_date) : 'Friday'}, break down major deliverables into smaller 25-minute Pomodoro sprints before the rush.
            </p>
          </div>

          <div style={{
            background: 'var(--bg-secondary)',
            padding: '14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}>
            <strong style={{ color: '#10b981', fontSize: '0.9rem', display: 'block', marginBottom: '4px' }}>
              🌿 Planned Recovery Buffers
            </strong>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              Block out 30 minutes for an unplugged outdoor walk or our guided 4-7-8 breathing pacer at least 24 hours prior to anticipated deadline clusters.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
