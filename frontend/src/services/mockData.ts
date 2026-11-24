/**
 * SentiaMind — Realistic Mock Data & Local NLP Inference Simulation
 * Enables immediate out-of-the-box exploration, demo mode, and offline resilience.
 */

import type {
  EmotionScores,
  EmotionSummary,
  EmotionTrendPoint,
  ForecastDay,
  ForecastResponse,
  JournalDetailResponse,
  StreakResponse,
  UserProfile,
} from '../types';

export const INITIAL_USER: UserProfile = {
  id: 'usr-9283-sentia',
  email: 'alex.morgan@university.edu',
  full_name: 'Alex Morgan',
  country_code: 'IN',
  counselor_consent: true,
  is_active: true,
  created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
};

export const INITIAL_JOURNALS: JournalDetailResponse[] = [
  {
    id: 'jrn-101',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    content: "Wrapped up my machine learning presentation today! Professor Davis loved the empirical evaluation on neural attention mechanisms. Such an overwhelming wave of relief and accomplishment after pulling late nights all week with Maya and Liam.",
    word_count: 36,
    emotion_scores: {
      joy: 0.84,
      sadness: 0.04,
      anxiety: 0.08,
      anger: 0.01,
      fear: 0.03,
      dominant_emotion: 'joy',
      model_confidence: 0.93,
    },
  },
  {
    id: 'jrn-102',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    content: "Heart pounding throughout the afternoon. Got the email about the midterm distribution curve and my project deadline clashes with my lab duty shift tomorrow. Trying to prioritize tasks but my chest feels tight and I couldn't focus during lecture.",
    word_count: 42,
    emotion_scores: {
      joy: 0.05,
      sadness: 0.18,
      anxiety: 0.68,
      anger: 0.04,
      fear: 0.05,
      dominant_emotion: 'anxiety',
      model_confidence: 0.88,
    },
  },
  {
    id: 'jrn-103',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    content: "Struggling to find the motivation to leave my dorm room today. It was raining all morning and I skipped breakfast. Felt disconnected from everyone at the dining hall, like I'm moving in slow motion while everyone else has their life figured out.",
    word_count: 43,
    emotion_scores: {
      joy: 0.03,
      sadness: 0.74,
      anxiety: 0.14,
      anger: 0.03,
      fear: 0.06,
      dominant_emotion: 'sadness',
      model_confidence: 0.91,
    },
  },
  {
    id: 'jrn-104',
    created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    content: "Group partner dropped out of our capstone sprint without any notice, dumping the backend integration on me 48 hours before review. It feels so disrespectful and unfair when everyone is supposed to carry equal weight.",
    word_count: 37,
    emotion_scores: {
      joy: 0.02,
      sadness: 0.12,
      anxiety: 0.22,
      anger: 0.61,
      fear: 0.03,
      dominant_emotion: 'anger',
      model_confidence: 0.85,
    },
  },
  {
    id: 'jrn-105',
    created_at: new Date(Date.now() - 11 * 86400000).toISOString(),
    content: "Sudden dread about post-graduation life. Looked at hiring market statistics and internship rejections. What if none of the research I've spent three years on matters? Terrified of letting my family down.",
    word_count: 34,
    emotion_scores: {
      joy: 0.04,
      sadness: 0.22,
      anxiety: 0.26,
      anger: 0.02,
      fear: 0.46,
      dominant_emotion: 'fear',
      model_confidence: 0.86,
    },
  },
];

// Generate 14-day continuous trend points
export function generateMockTrendPoints(): EmotionTrendPoint[] {
  const points: EmotionTrendPoint[] = [];
  const now = new Date();

  // Pattern simulates a student's emotional cycle across two weeks
  const patterns = [
    { joy: 0.72, sadness: 0.10, anxiety: 0.12, anger: 0.03, fear: 0.03 },
    { joy: 0.65, sadness: 0.14, anxiety: 0.15, anger: 0.04, fear: 0.02 },
    { joy: 0.40, sadness: 0.20, anxiety: 0.32, anger: 0.05, fear: 0.03 },
    { joy: 0.25, sadness: 0.22, anxiety: 0.45, anger: 0.04, fear: 0.04 },
    { joy: 0.15, sadness: 0.25, anxiety: 0.52, anger: 0.05, fear: 0.03 },
    { joy: 0.35, sadness: 0.18, anxiety: 0.38, anger: 0.06, fear: 0.03 },
    { joy: 0.68, sadness: 0.12, anxiety: 0.14, anger: 0.03, fear: 0.03 },
    { joy: 0.75, sadness: 0.08, anxiety: 0.11, anger: 0.03, fear: 0.03 },
    { joy: 0.52, sadness: 0.15, anxiety: 0.25, anger: 0.05, fear: 0.03 },
    { joy: 0.28, sadness: 0.28, anxiety: 0.38, anger: 0.03, fear: 0.03 },
    { joy: 0.12, sadness: 0.32, anxiety: 0.48, anger: 0.05, fear: 0.03 },
    { joy: 0.10, sadness: 0.24, anxiety: 0.58, anger: 0.04, fear: 0.04 },
    { joy: 0.42, sadness: 0.18, anxiety: 0.34, anger: 0.03, fear: 0.03 },
    { joy: 0.82, sadness: 0.05, anxiety: 0.09, anger: 0.02, fear: 0.02 },
  ];

  for (let i = 13; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    const pat = patterns[13 - i];
    points.push({
      date: d.toISOString().split('T')[0],
      joy: pat.joy,
      sadness: pat.sadness,
      anxiety: pat.anxiety,
      anger: pat.anger,
      fear: pat.fear,
      entry_count: 1 + Math.floor(Math.random() * 2),
    });
  }

  return points;
}

// Generate 7-Day LSTM Predictive Forecast
export function generateMockForecast(): ForecastResponse {
  const days: ForecastDay[] = [];
  const now = new Date();

  const forecastData = [
    { offset: 1, stress: 0.22, alert: 'low' as const, joy: 0.72, sadness: 0.10, anxiety: 0.12, anger: 0.03, fear: 0.03 },
    { offset: 2, stress: 0.34, alert: 'low' as const, joy: 0.60, sadness: 0.15, anxiety: 0.18, anger: 0.04, fear: 0.03 },
    { offset: 3, stress: 0.58, alert: 'moderate' as const, joy: 0.38, sadness: 0.20, anxiety: 0.34, anger: 0.05, fear: 0.03 },
    { offset: 4, stress: 0.76, alert: 'high' as const, joy: 0.20, sadness: 0.25, anxiety: 0.46, anger: 0.05, fear: 0.04 },
    { offset: 5, stress: 0.84, alert: 'critical' as const, joy: 0.12, sadness: 0.26, anxiety: 0.52, anger: 0.06, fear: 0.04 }, // e.g. Midterm Friday
    { offset: 6, stress: 0.45, alert: 'moderate' as const, joy: 0.48, sadness: 0.18, anxiety: 0.28, anger: 0.03, fear: 0.03 },
    { offset: 7, stress: 0.26, alert: 'low' as const, joy: 0.74, sadness: 0.10, anxiety: 0.12, anger: 0.02, fear: 0.02 },
  ];

  for (const item of forecastData) {
    const d = new Date(now.getTime() + item.offset * 86400000);
    days.push({
      day_offset: item.offset,
      forecast_date: d.toISOString().split('T')[0],
      predicted_scores: {
        joy: item.joy,
        sadness: item.sadness,
        anxiety: item.anxiety,
        anger: item.anger,
        fear: item.fear,
        dominant_emotion: item.joy > item.anxiety ? 'joy' : 'anxiety',
        model_confidence: 0.88,
      },
      stress_probability: item.stress,
      alert_level: item.alert,
    });
  }

  return {
    generated_at: now.toISOString(),
    forecast_horizon_days: 7,
    data_points_used: 14,
    days,
    model_version: 'Sentia-LSTM-v2.1',
  };
}

export function generateMockSummary(): EmotionSummary {
  return {
    period_days: 14,
    average_scores: {
      joy: 0.46,
      sadness: 0.17,
      anxiety: 0.29,
      anger: 0.04,
      fear: 0.04,
      dominant_emotion: 'joy',
      model_confidence: 0.91,
    },
    dominant_emotion_overall: 'joy',
    total_entries: 18,
    journaling_streak_days: 9,
    highest_stress_day: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
    highest_stress_score: 0.68,
  };
}

export function generateMockStreak(): StreakResponse {
  return {
    current_streak_days: 9,
    longest_streak_days: 14,
    total_entries: 23,
    first_entry_date: new Date(Date.now() - 32 * 86400000).toISOString().split('T')[0],
    last_entry_date: new Date().toISOString().split('T')[0],
  };
}

/**
 * Local DistilBERT-like inference simulation
 * Analyzes semantic lexicon in text and computes a normalized 5-dimension emotion vector.
 */
export function simulateLocalEmotionInference(text: string): EmotionScores {
  const lower = text.toLowerCase();

  const joyKeywords = ['happy', 'relieved', 'great', 'love', 'excited', 'awesome', 'good', 'grateful', 'proud', 'accomplished', 'smile', 'laugh', 'peace', 'wonderful', 'joy', 'fun', 'celebrate'];
  const sadnessKeywords = ['sad', 'lonely', 'cry', 'crying', 'empty', 'hopeless', 'disconnected', 'depressed', 'unhappy', 'grief', 'miss', 'gloomy', 'numb', 'heavy', 'down'];
  const anxietyKeywords = ['anxious', 'stress', 'worried', 'nervous', 'panic', 'overwhelmed', 'tight', 'pressure', 'deadline', 'exam', 'heart pounding', 'rush', 'shaky', 'racing', 'tension'];
  const angerKeywords = ['angry', 'mad', 'furious', 'pissed', 'annoyed', 'frustrated', 'unfair', 'irritated', 'hateful', 'rage', 'disrespect', 'resent'];
  const fearKeywords = ['afraid', 'terrified', 'scared', 'dread', 'frightened', 'horrified', 'panic', 'threat', 'unsafe', 'nightmare'];

  let joyScore = 0.1;
  let sadnessScore = 0.1;
  let anxietyScore = 0.1;
  let angerScore = 0.05;
  let fearScore = 0.05;

  joyKeywords.forEach(k => { if (lower.includes(k)) joyScore += 0.35; });
  sadnessKeywords.forEach(k => { if (lower.includes(k)) sadnessScore += 0.35; });
  anxietyKeywords.forEach(k => { if (lower.includes(k)) anxietyScore += 0.35; });
  angerKeywords.forEach(k => { if (lower.includes(k)) angerScore += 0.35; });
  fearKeywords.forEach(k => { if (lower.includes(k)) fearScore += 0.35; });

  const total = joyScore + sadnessScore + anxietyScore + angerScore + fearScore;
  const joy = Number((joyScore / total).toFixed(3));
  const sadness = Number((sadnessScore / total).toFixed(3));
  const anxiety = Number((anxietyScore / total).toFixed(3));
  const anger = Number((angerScore / total).toFixed(3));
  const fear = Number((fearScore / total).toFixed(3));

  const scores = [
    { emotion: 'joy' as const, val: joy },
    { emotion: 'sadness' as const, val: sadness },
    { emotion: 'anxiety' as const, val: anxiety },
    { emotion: 'anger' as const, val: anger },
    { emotion: 'fear' as const, val: fear },
  ];

  scores.sort((a, b) => b.val - a.val);

  return {
    joy,
    sadness,
    anxiety,
    anger,
    fear,
    dominant_emotion: scores[0].emotion,
    model_confidence: Number((0.82 + Math.random() * 0.14).toFixed(2)),
  };
}
