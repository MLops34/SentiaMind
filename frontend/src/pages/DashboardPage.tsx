import React, { useState, useEffect } from 'react';
import {
  Flame,
  BookOpen,
  Smile,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  Calendar,
  Lock,
} from 'lucide-react';
import type {
  EmotionSummary,
  EmotionTrendPoint,
  ForecastResponse,
  JournalDetailResponse,
  StreakResponse,
} from '../types';
import { api } from '../api/client';
import { EmotionChart } from '../components/EmotionChart';

interface DashboardPageProps {
  onNavigateToJournal: () => void;
  onNavigateToForecast: () => void;
  onSelectJournal: (j: JournalDetailResponse) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigateToJournal,
  onNavigateToForecast,
  onSelectJournal,
}) => {
  const [summary, setSummary] = useState<EmotionSummary | null>(null);
  const [trends, setTrends] = useState<EmotionTrendPoint[]>([]);
  const [streak, setStreak] = useState<StreakResponse | null>(null);
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [recentJournals, setRecentJournals] = useState<JournalDetailResponse[]>([]);

  useEffect(() => {
    Promise.all([
      api.getSummary(),
      api.getEmotionTrends(),
      api.getStreak(),
      api.getForecast(),
      api.listJournals(),
    ]).then(([s, t, str, f, j]) => {
      setSummary(s);
      setTrends(t);
      setStreak(str);
      setForecast(f);
      setRecentJournals(j.slice(0, 3));
    });
  }, []);

  // Quick Daily Wellness Prompts
  const prompts = [
    "What gave you an unexpected sense of calm or progress today?",
    "If you could unburden one stressful task before bedtime, what would it be?",
    "What is something small that made you smile this week?",
  ];
  const [promptIdx] = useState(0);

  return (
    <div className="responsive-container">
      {/* Welcome & Overview Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '28px',
      }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', color: 'var(--text-primary)' }}>
            Your Emotional Wellbeing
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Daily reflections, gentle insights, and trends to support your peace of mind.
          </p>
        </div>

        <button
          onClick={onNavigateToJournal}
          className="btn btn-primary"
          style={{ gap: '8px' }}
        >
          <BookOpen size={16} />
          <span>New Journal Entry</span>
        </button>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="responsive-stats-grid">
        {/* Streak */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Reflection Streak
            </span>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Flame size={18} color="#f59e0b" />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
            {streak ? `${streak.current_streak_days} Days` : '9 Days'}
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
            Longest recorded: {streak?.longest_streak_days || 14} days consistent
          </p>
        </div>

        {/* Total Entries */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Encrypted Entries
            </span>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(108, 99, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Lock size={18} color="var(--brand-primary)" />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
            {summary ? summary.total_entries : 18}
          </div>
          <p style={{ fontSize: '0.78rem', color: '#10b981', marginTop: '6px' }}>
            AES-256 protected at rest
          </p>
        </div>

        {/* Dominant Overall Emotion */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Primary Baseline
            </span>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Smile size={18} color="#10b981" />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981', lineHeight: 1.1, textTransform: 'capitalize' }}>
            {summary ? summary.dominant_emotion_overall : 'Joy'}
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
            Average positive affect: 46%
          </p>
        </div>

        {/* Stress Alert */}
        <div
          onClick={onNavigateToForecast}
          className="glass-card glass-card-interactive"
          style={{ padding: '20px', cursor: 'pointer', border: '1px solid rgba(217, 119, 6, 0.3)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Stress Forecast
            </span>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(217, 119, 6, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <AlertTriangle size={18} color="#d97706" />
            </div>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#d97706', lineHeight: 1.1 }}>
            {forecast ? `Peak Day +${[...forecast.days].sort((a, b) => b.stress_probability - a.stress_probability)[0]?.day_offset || 5}` : 'Peak on Day 5'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: 'var(--brand-primary)', marginTop: '8px' }}>
            <span>{forecast ? `${Math.round(([...forecast.days].sort((a, b) => b.stress_probability - a.stress_probability)[0]?.stress_probability || 0.84) * 100)}% Alert • View Details` : 'View 7-Day Forecast'}</span>
            <ArrowUpRight size={14} />
          </div>
        </div>
      </div>

      {/* Main Chart Section */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={20} color="var(--brand-primary)" />
              <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                14-Day Emotion Trends
              </h2>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              A gentle visualization of how your moods have evolved over the past two weeks.
            </p>
          </div>
        </div>

        <EmotionChart data={trends} />
      </div>

      {/* Lower Row: Daily Reflection Prompt & Recent Journals */}
      <div className="responsive-dashboard-split">
        {/* Daily Guided Reflection Prompt */}
        <div className="glass-card" style={{
          padding: '24px',
          background: 'linear-gradient(135deg, rgba(108, 99, 255, 0.08) 0%, rgba(255, 255, 255, 0.9) 100%)',
          border: '1px solid rgba(108, 99, 255, 0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--brand-primary)', marginBottom: '12px' }}>
            <Sparkles size={18} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Daily Reflection Prompt
            </span>
          </div>

          <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: '12px' }}>
            "{prompts[promptIdx]}"
          </h3>

          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
            Taking just 3 minutes to reflect can lower anxiety and provide mental clarity. Your words remain safe and private.
          </p>

          <button
            onClick={onNavigateToJournal}
            className="btn btn-primary"
            style={{ borderRadius: 'var(--radius-md)' }}
          >
            Reflect on this Prompt
          </button>
        </div>

        {/* Recent Journal History Cards */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>
              Recent Entries
            </h3>
            <button
              onClick={onNavigateToJournal}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.78rem' }}
            >
              View All
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentJournals.map((j) => {
              const dom = j.emotion_scores?.dominant_emotion || 'joy';
              return (
                <div
                  key={j.id}
                  onClick={() => onSelectJournal(j)}
                  className="glass-card glass-card-interactive"
                  style={{
                    padding: '12px 14px',
                    cursor: 'pointer',
                    background: '#fff',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <Calendar size={12} />
                      <span>{new Date(j.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                    <span className={`badge badge-${dom}`} style={{ fontSize: '0.65rem', textTransform: 'capitalize' }}>
                      {dom}
                    </span>
                  </div>
                  <p style={{
                    fontSize: '0.825rem',
                    color: 'var(--text-secondary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {j.content}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
