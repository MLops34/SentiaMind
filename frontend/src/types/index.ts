/**
 * SentiaMind — Shared TypeScript Definitions
 * Aligned with Backend Pydantic Schemas
 */

export interface EmotionScores {
  joy: number;
  sadness: number;
  anxiety: number;
  anger: number;
  fear: number;
  dominant_emotion: 'joy' | 'sadness' | 'anxiety' | 'anger' | 'fear';
  model_confidence: number;
}

export interface HotlineInfo {
  name: string;
  number: string;
  available: string;
}

export interface CrisisResponse {
  crisis_detected: boolean;
  message: string;
  hotlines: HotlineInfo[];
}

export interface JournalCreateRequest {
  content: string;
}

export interface JournalCreateResponse {
  id: string;
  word_count: number;
  created_at: string;
  emotion_scores: EmotionScores;
}

export interface JournalListItem {
  id: string;
  word_count: number;
  created_at: string;
  dominant_emotion?: 'joy' | 'sadness' | 'anxiety' | 'anger' | 'fear';
  preview?: string;
}

export interface JournalDetailResponse {
  id: string;
  content: string;
  word_count: number;
  created_at: string;
  emotion_scores?: EmotionScores;
}

export interface EmotionTrendPoint {
  date: string;
  joy: number;
  sadness: number;
  anxiety: number;
  anger: number;
  fear: number;
  entry_count: number;
}

export interface EmotionSummary {
  period_days: number;
  average_scores: EmotionScores;
  dominant_emotion_overall: string;
  total_entries: number;
  journaling_streak_days: number;
  highest_stress_day?: string | null;
  highest_stress_score?: number | null;
}

export type AlertLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface ForecastDay {
  day_offset: number;
  forecast_date: string;
  predicted_scores: EmotionScores;
  stress_probability: number;
  alert_level: AlertLevel;
}

export interface ForecastResponse {
  generated_at: string;
  forecast_horizon_days: number;
  data_points_used: number;
  days: ForecastDay[];
  model_version: string;
}

export interface StreakResponse {
  current_streak_days: number;
  longest_streak_days: number;
  total_entries: number;
  first_entry_date?: string | null;
  last_entry_date?: string | null;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  country_code: string;
  counselor_consent: boolean;
  is_active: boolean;
  created_at: string;
}

export interface GroundingExercise {
  id: string;
  title: string;
  duration: string;
  description: string;
  type: 'breathing' | 'sensory' | 'cognitive';
}
