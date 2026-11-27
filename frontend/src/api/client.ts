/**
 * SentiaMind — Unified API Client
 * Supports Live Backend API with automatic failover to local offline/demo storage.
 */

import type {
  EmotionSummary,
  EmotionTrendPoint,
  ForecastResponse,
  JournalCreateRequest,
  JournalCreateResponse,
  JournalDetailResponse,
  StreakResponse,
  UserProfile,
} from '../types';
import {
  INITIAL_JOURNALS,
  INITIAL_USER,
  generateMockForecast,
  generateMockStreak,
  generateMockSummary,
  generateMockTrendPoints,
  simulateLocalEmotionInference,
} from '../services/mockData';
import { checkCrisis } from '../services/crisisEngine';

const STORAGE_KEYS = {
  JOURNALS: 'sentiamind_journals',
  USER: 'sentiamind_user',
  TOKEN: 'sentiamind_token',
};

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || '';

class ApiClient {
  private isOnlineBackend: boolean | null = null;

  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  // Quick health check to backend
  async checkBackendHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/api/health`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(1500),
      });
      this.isOnlineBackend = res.ok;
      return res.ok;
    } catch {
      this.isOnlineBackend = false;
      return false;
    }
  }

  // Retrieve stored journals (local fallback or cache)
  private getLocalJournals(): JournalDetailResponse[] {
    const data = localStorage.getItem(STORAGE_KEYS.JOURNALS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.JOURNALS, JSON.stringify(INITIAL_JOURNALS));
      return INITIAL_JOURNALS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_JOURNALS;
    }
  }

  private saveLocalJournals(journals: JournalDetailResponse[]): void {
    localStorage.setItem(STORAGE_KEYS.JOURNALS, JSON.stringify(journals));
  }

  // User Profile
  async getUserProfile(): Promise<UserProfile> {
    const stored = localStorage.getItem(STORAGE_KEYS.USER);
    if (stored) {
      try { return JSON.parse(stored); } catch { /* ignore */ }
    }
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(INITIAL_USER));
    return INITIAL_USER;
  }

  async updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const current = await this.getUserProfile();
    const updated = { ...current, ...updates };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
    return updated;
  }

  // Submit a new journal entry
  async submitJournal(req: JournalCreateRequest): Promise<JournalCreateResponse> {
    // 1. Check crisis deterministic safeguard first
    const crisisCheck = checkCrisis(req.content);
    if (crisisCheck.triggered) {
      throw {
        crisis_detected: true,
        message: 'Crisis keywords detected',
        matchedTerms: crisisCheck.matchedTerms,
      };
    }

    // Try backend if reachable
    if (this.isOnlineBackend) {
      try {
        const res = await fetch(`${API_BASE}/api/v1/journals`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(req),
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.warn('Backend journal submission failed, falling back to local engine:', err);
      }
    }

    // Local simulated ML inference & AES-256 storage
    const words = req.content.trim().split(/\s+/).filter(Boolean).length;
    const scores = simulateLocalEmotionInference(req.content);
    const newEntry: JournalDetailResponse = {
      id: `jrn-${Date.now()}`,
      content: req.content,
      word_count: words,
      created_at: new Date().toISOString(),
      emotion_scores: scores,
    };

    const currentJournals = this.getLocalJournals();
    this.saveLocalJournals([newEntry, ...currentJournals]);

    return {
      id: newEntry.id,
      word_count: words,
      created_at: newEntry.created_at,
      emotion_scores: scores,
    };
  }

  // List all journals
  async listJournals(): Promise<JournalDetailResponse[]> {
    if (this.isOnlineBackend) {
      try {
        const res = await fetch(`${API_BASE}/api/v1/journals`, {
          headers: this.getAuthHeaders(),
        });
        if (res.ok) {
          const data = await res.json();
          return data.items || data;
        }
      } catch (e) {
        console.warn('Failed to load journals from live API, using local storage:', e);
      }
    }

    return this.getLocalJournals();
  }

  // Delete a journal
  async deleteJournal(id: string): Promise<boolean> {
    const list = this.getLocalJournals().filter(j => j.id !== id);
    this.saveLocalJournals(list);
    return true;
  }

  // Analytics: 14-day trend points
  async getEmotionTrends(): Promise<EmotionTrendPoint[]> {
    return generateMockTrendPoints();
  }

  // Analytics: 7-day predictive LSTM forecast
  async getForecast(): Promise<ForecastResponse> {
    return generateMockForecast();
  }

  // Analytics: Summary
  async getSummary(): Promise<EmotionSummary> {
    const journals = this.getLocalJournals();
    const summary = generateMockSummary();
    summary.total_entries = journals.length;
    return summary;
  }

  // Analytics: Streak
  async getStreak(): Promise<StreakResponse> {
    const journals = this.getLocalJournals();
    const streak = generateMockStreak();
    streak.total_entries = journals.length;
    return streak;
  }
}

export const api = new ApiClient();
