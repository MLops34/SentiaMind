import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { CrisisModal } from './components/CrisisModal';
import { JournalHistoryModal } from './components/JournalHistoryModal';
import { CounselorReportModal } from './components/CounselorReportModal';
import { JournalPage } from './pages/JournalPage';
import { DashboardPage } from './pages/DashboardPage';
import { ForecastPage } from './pages/ForecastPage';
import { WellnessHubPage } from './pages/WellnessHubPage';
import type {
  EmotionSummary,
  JournalCreateResponse,
  JournalDetailResponse,
  UserProfile,
} from './types';
import { api } from './api/client';
import { Brain, Heart, Shield, Lock } from 'lucide-react';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'journal' | 'dashboard' | 'forecast' | 'wellness'>('journal');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [summary, setSummary] = useState<EmotionSummary | null>(null);

  // Modals state
  const [isCrisisOpen, setIsCrisisOpen] = useState<boolean>(false);
  const [crisisTriggeredFromText, setCrisisTriggeredFromText] = useState<boolean>(false);
  const [selectedJournal, setSelectedJournal] = useState<JournalDetailResponse | null>(null);
  const [isCounselorOpen, setIsCounselorOpen] = useState<boolean>(false);

  // Load user profile & summary on mount
  useEffect(() => {
    api.getUserProfile().then(setUser);
    api.getSummary().then(setSummary);
  }, []);

  const handleChangeCountry = async (code: string) => {
    if (!user) return;
    const updated = await api.updateUserProfile({ country_code: code });
    setUser(updated);
  };

  const handleUpdateConsent = async (consent: boolean) => {
    if (!user) return;
    const updated = await api.updateUserProfile({ counselor_consent: consent });
    setUser(updated);
  };

  const handleDeleteJournal = async (id: string) => {
    await api.deleteJournal(id);
    const updatedSummary = await api.getSummary();
    setSummary(updatedSummary);
  };

  const handleJournalSubmitted = async (_res: JournalCreateResponse) => {
    const updatedSummary = await api.getSummary();
    setSummary(updatedSummary);
  };

  const handleOpenCrisisModal = (triggered: boolean = false) => {
    setCrisisTriggeredFromText(triggered);
    setIsCrisisOpen(true);
  };

  if (!user || !summary) {
    return (
      <div className="loading-screen">
        <div className="loading-indicator">
          <span className="loading-spinner" />
          <span>Initializing SentiaMind Wellness Environment...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        user={user}
        onOpenCrisis={() => handleOpenCrisisModal(false)}
        onChangeCountry={handleChangeCountry}
        onOpenCounselorModal={() => setIsCounselorOpen(true)}
      />

      {/* Main Page Body */}
      <main style={{ flex: 1, paddingBottom: '40px' }}>
        {currentTab === 'journal' && (
          <JournalPage
            onJournalSubmitted={handleJournalSubmitted}
            onOpenCrisisWithTrigger={() => handleOpenCrisisModal(true)}
            onSelectJournal={(j) => setSelectedJournal(j)}
          />
        )}

        {currentTab === 'dashboard' && (
          <DashboardPage
            onNavigateToJournal={() => setCurrentTab('journal')}
            onNavigateToForecast={() => setCurrentTab('forecast')}
            onSelectJournal={(j) => setSelectedJournal(j)}
          />
        )}

        {currentTab === 'forecast' && (
          <ForecastPage />
        )}

        {currentTab === 'wellness' && (
          <WellnessHubPage
            onOpenCrisis={() => handleOpenCrisisModal(false)}
          />
        )}
      </main>

      {/* Global Modals */}
      <CrisisModal
        isOpen={isCrisisOpen}
        countryCode={user.country_code}
        onClose={() => setIsCrisisOpen(false)}
        detectedTrigger={crisisTriggeredFromText}
      />

      <JournalHistoryModal
        journal={selectedJournal}
        onClose={() => setSelectedJournal(null)}
        onDelete={handleDeleteJournal}
      />

      <CounselorReportModal
        isOpen={isCounselorOpen}
        onClose={() => setIsCounselorOpen(false)}
        user={user}
        summary={summary}
        onUpdateConsent={handleUpdateConsent}
      />

      {/* Footer */}
      <footer style={{
        background: '#ffffff',
        borderTop: '1px solid var(--border-subtle)',
        padding: '24px 20px',
        marginTop: 'auto',
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.02)',
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Brain size={18} color="var(--brand-primary)" />
              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                SentiaMind
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                • Mental Health &amp; Wellbeing Companion
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '540px' }}>
              SentiaMind provides supportive emotional tracking and stress insights. It is a wellness tool and is not a substitute for professional medical care.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Shield size={14} color="#059669" /> Safe &amp; Confidential
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Lock size={14} color="var(--brand-primary)" /> End-to-End Encrypted
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Heart size={14} color="#e11d48" /> Compassionate Care
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
