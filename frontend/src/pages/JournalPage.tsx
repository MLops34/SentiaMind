import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Sparkles,
  BookOpen,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import type { JournalCreateResponse, JournalDetailResponse } from '../types';
import { api } from '../api/client';
import { checkCrisis } from '../services/crisisEngine';

interface JournalPageProps {
  onJournalSubmitted: (res: JournalCreateResponse) => void;
  onOpenCrisisWithTrigger: () => void;
  onSelectJournal: (j: JournalDetailResponse) => void;
}

export const JournalPage: React.FC<JournalPageProps> = ({
  onJournalSubmitted,
  onOpenCrisisWithTrigger,
  onSelectJournal,
}) => {
  const [content, setContent] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [lastResult, setLastResult] = useState<JournalCreateResponse | null>(null);
  const [journals, setJournals] = useState<JournalDetailResponse[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const baseContentRef = useRef<string>('');

  // Load existing journals
  useEffect(() => {
    api.listJournals().then(setJournals);
  }, [lastResult]);

  // Clean up recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {
          // ignore
        }
      }
    };
  }, []);

  const stopVoice = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.warn('Error stopping speech recognition:', e);
      }
      recognitionRef.current = null;
    }
    setIsRecording(false);
  };

  const startVoice = async () => {
    setVoiceError(null);

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError(
        'Speech Recognition is not supported in this browser. Please use Google Chrome, Microsoft Edge, or Safari.'
      );
      return;
    }

    // Explicitly test/prompt for audio permission first
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Release the test stream immediately so recognition engine can own the mic
        stream.getTracks().forEach((track) => track.stop());
      }
    } catch (err: any) {
      console.warn('Microphone permission/device error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setVoiceError(
          'Microphone permission is blocked. Click the lock/settings icon next to the URL in your browser address bar and set Microphone to "Allow".'
        );
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setVoiceError(
          'No microphone device detected. Please connect a microphone or headset to your device.'
        );
      } else {
        setVoiceError(`Microphone access error: ${err.message || err.name}`);
      }
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      baseContentRef.current = content.trim();

      recognition.onstart = () => {
        setIsRecording(true);
        setVoiceError(null);
      };

      recognition.onresult = (event: any) => {
        let sessionTranscript = '';
        for (let i = 0; i < event.results.length; ++i) {
          sessionTranscript += event.results[i][0].transcript;
        }
        const base = baseContentRef.current;
        setContent(base ? `${base} ${sessionTranscript}` : sessionTranscript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error event:', event.error);
        if (event.error === 'not-allowed') {
          setVoiceError(
            'Microphone access denied. Please click the site permissions icon in your browser address bar and choose "Allow" for Microphone.'
          );
          stopVoice();
        } else if (event.error === 'network') {
          setVoiceError(
            'Speech service network unreachable. If you are using Brave Browser, enable "Use Google Services for speech recognition" in brave://settings/privacy, or open this site in Google Chrome.'
          );
          stopVoice();
        } else if (event.error === 'audio-capture') {
          setVoiceError('No microphone available to capture audio.');
          stopVoice();
        } else if (event.error === 'no-speech') {
          // Normal pause in speaking, do not crash
        } else {
          setVoiceError(`Voice recognition error: ${event.error}`);
          stopVoice();
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.warn('Failed to start speech recognition:', err);
      setVoiceError(
        `Could not initialize speech recognition: ${err.message || 'Please check browser mic permissions.'}`
      );
      setIsRecording(false);
    }
  };

  const toggleVoice = () => {
    if (isRecording) {
      stopVoice();
    } else {
      startVoice();
    }
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  // Real-time subtle crisis check while typing
  const liveCrisisCheck = checkCrisis(content);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (wordCount < 3) {
      setErrorMsg('Please write at least a few words so the AI can detect your emotional nuance.');
      return;
    }

    setErrorMsg(null);

    // Crisis Safeguard check
    if (liveCrisisCheck.triggered) {
      onOpenCrisisWithTrigger();
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.submitJournal({ content });
      setLastResult(res);
      setContent('');
      onJournalSubmitted(res);
    } catch (err: any) {
      if (err?.crisis_detected) {
        onOpenCrisisWithTrigger();
      } else {
        setErrorMsg('Could not save your journal entry. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="responsive-container" style={{ maxWidth: '1180px' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.85rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
          Daily Journal
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Write or speak freely. Your reflections are private and help bring clarity to your day.
        </p>
      </div>

      <div className="responsive-2col">
        {/* Left Column: Journaling Canvas */}
        <div>
          <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '24px', position: 'relative' }}>
            {/* Top Toolbar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
              paddingBottom: '12px',
              borderBottom: '1px solid var(--border-subtle)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Today's Journal Entry
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  ({wordCount} words)
                </span>
              </div>

              {/* Voice Input Button */}
              <button
                type="button"
                onClick={toggleVoice}
                className={`btn btn-sm ${isRecording ? 'btn-crisis' : 'btn-outline'}`}
                style={{
                  borderRadius: 'var(--radius-full)',
                  gap: '6px',
                  animation: isRecording ? 'pulseGlow 1.5s infinite' : 'none',
                }}
              >
                {isRecording ? (
                  <>
                    <MicOff size={14} />
                    <span>Listening... (Tap to Stop)</span>
                  </>
                ) : (
                  <>
                    <Mic size={14} color="var(--brand-primary)" />
                    <span>Voice Journal</span>
                  </>
                )}
              </button>
            </div>

            {/* Live Audio Visualizer bar when recording */}
            {isRecording && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                padding: '10px 0',
                marginBottom: '12px',
                background: 'rgba(239, 68, 68, 0.08)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
              }}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: '4px',
                      background: '#ef4444',
                      borderRadius: '2px',
                      animation: `waveBar 0.8s ease-in-out infinite alternate`,
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
                <span style={{ fontSize: '0.8rem', color: '#dc2626', marginLeft: '10px' }}>
                  Transcribing spoken thoughts in real-time...
                </span>
              </div>
            )}

            {/* Voice Error Notification */}
            {voiceError && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '12px',
              }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <AlertCircle size={18} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#dc2626' }}>
                      Microphone Issue
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.5 }}>
                      {voiceError}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setVoiceError(null)}
                  className="btn btn-sm btn-outline"
                  style={{ padding: '2px 8px', fontSize: '0.75rem', borderRadius: 'var(--radius-full)' }}
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Textarea */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="How are you really doing right now? What thoughts or worries have occupied your mind today? Write as much or as little as you need..."
              rows={8}
              style={{
                width: '100%',
                background: '#fff',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-sans)',
                fontSize: '1rem',
                lineHeight: 1.6,
                padding: '16px',
                resize: 'vertical',
                outline: 'none',
                marginBottom: '16px',
                transition: 'border-color 0.2s ease',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--brand-primary)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border-subtle)')}
            />

            {/* Live Crisis Warning preview if triggered */}
            {liveCrisisCheck.triggered && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626', fontSize: '0.85rem' }}>
                  <AlertCircle size={16} />
                  <span>We notice crisis language in your entry. Instant help is ready.</span>
                </div>
                <button
                  type="button"
                  onClick={onOpenCrisisWithTrigger}
                  className="btn btn-crisis btn-sm"
                >
                  View Hotlines
                </button>
              </div>
            )}

            {errorMsg && (
              <div style={{ color: 'var(--alert-critical)', fontSize: '0.85rem', marginBottom: '14px' }}>
                {errorMsg}
              </div>
            )}

            {/* Bottom Actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                disabled={isSubmitting || wordCount === 0}
                className="btn btn-primary"
                style={{ opacity: isSubmitting || wordCount === 0 ? 0.6 : 1 }}
              >
                {isSubmitting ? (
                  <>
                    <Sparkles size={16} className="spinning" />
                    <span>Saving reflection...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Save Journal Entry</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Submission Feedback & Emotion Breakdown Card */}
          {lastResult && (
            <div
              className="glass-card"
              style={{
                marginTop: '20px',
                padding: '20px 24px',
                border: '1px solid rgba(5, 150, 105, 0.25)',
                background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.08) 0%, rgba(255, 255, 255, 0.95) 100%)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={18} color="#059669" />
                  <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                    Entry Saved &amp; Mood Checked
                  </h3>
                </div>
                <span className={`badge badge-${lastResult.emotion_scores.dominant_emotion}`} style={{ textTransform: 'capitalize' }}>
                  Primary Mood: {lastResult.emotion_scores.dominant_emotion}
                </span>
              </div>

              {/* Progress bars for 5 dimensions */}
              <div className="responsive-emotions-grid">
                {[
                  { key: 'joy', label: 'Joy', val: lastResult.emotion_scores.joy, color: '#10b981' },
                  { key: 'sadness', label: 'Sadness', val: lastResult.emotion_scores.sadness, color: '#3b82f6' },
                  { key: 'anxiety', label: 'Anxiety', val: lastResult.emotion_scores.anxiety, color: '#f59e0b' },
                  { key: 'anger', label: 'Anger', val: lastResult.emotion_scores.anger, color: 'var(--alert-critical)' },
                  { key: 'fear', label: 'Fear', val: lastResult.emotion_scores.fear, color: '#a855f7' },
                ].map((item) => (
                  <div key={item.key} style={{ background: 'var(--bg-secondary)', padding: '10px 6px', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '0.75rem', color: item.color, fontWeight: 600 }}>{item.label}</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: '2px 0 4px 0' }}>
                      {Math.round(item.val * 100)}%
                    </div>
                    <div style={{ height: '4px', background: 'rgba(0, 0, 0, 0.07)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.round(item.val * 100)}%`, height: '100%', background: item.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Encrypted Past Journals Drawer */}
        <div>
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={18} color="var(--brand-primary)" />
                <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                  Journal Archive
                </h3>
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {journals.length} Saved Entries
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '560px', overflowY: 'auto' }}>
              {journals.map((j) => {
                const dom = j.emotion_scores?.dominant_emotion || 'joy';
                return (
                  <div
                    key={j.id}
                    onClick={() => onSelectJournal(j)}
                    className="glass-card glass-card-interactive"
                    style={{
                      padding: '14px 16px',
                      cursor: 'pointer',
                      background: '#fff',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        <Calendar size={12} />
                        <span>{new Date(j.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <span className={`badge badge-${dom}`} style={{ fontSize: '0.68rem', textTransform: 'capitalize' }}>
                        {dom}
                      </span>
                    </div>

                    <p style={{
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.5,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}>
                      {j.content}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', fontSize: '0.75rem', color: 'var(--brand-primary)' }}>
                      <span>{j.word_count} words • Decrypt</span>
                      <ChevronRight size={14} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
