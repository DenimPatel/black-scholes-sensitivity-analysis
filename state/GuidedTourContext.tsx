
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { curriculum, stepByPath, stepById } from '../content/curriculum';

const STORAGE_KEY = 'bs-guided-tour-progress-v1';

interface StoredProgress {
  completedIds: string[];
  autoAdvance: boolean;
}

const loadProgress = (): StoredProgress => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { completedIds: [], autoAdvance: true };
    const parsed = JSON.parse(raw);
    return {
      completedIds: Array.isArray(parsed.completedIds) ? parsed.completedIds : [],
      autoAdvance: typeof parsed.autoAdvance === 'boolean' ? parsed.autoAdvance : true,
    };
  } catch {
    return { completedIds: [], autoAdvance: true };
  }
};

interface GuidedTourContextValue {
  isPlaying: boolean;
  autoAdvance: boolean;
  completedIds: string[];
  currentStepId: string | undefined;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  startTour: () => void;
  play: () => void;
  pause: () => void;
  toggleAutoAdvance: () => void;
  markComplete: (id: string) => void;
  handleAudioEnded: () => void;
}

const GuidedTourContext = createContext<GuidedTourContextValue | undefined>(undefined);

export const GuidedTourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement>(null);

  const initial = useMemo(loadProgress, []);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(initial.autoAdvance);
  const [completedIds, setCompletedIds] = useState<string[]>(initial.completedIds);

  const currentStep = stepByPath(location.pathname);
  const currentStepId = currentStep?.id;

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ completedIds, autoAdvance }));
    } catch {
      // localStorage may be unavailable (private browsing, quota); progress just won't persist.
    }
  }, [completedIds, autoAdvance]);

  // Load and, if the tour is running, autoplay the audio for whichever lesson we land on.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentStep) return;
    audio.src = currentStep.audioSrc;
    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep?.audioSrc]);

  const markComplete = useCallback((id: string) => {
    setCompletedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const play = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const startTour = useCallback(() => {
    const first = curriculum[0];
    if (location.pathname !== first.path) {
      navigate(first.path);
    }
    // The audio element's src is (re)assigned by the effect above once location settles;
    // play() is invoked from there via the isPlaying flag.
    setIsPlaying(true);
  }, [location.pathname, navigate]);

  const toggleAutoAdvance = useCallback(() => setAutoAdvance((v) => !v), []);

  const handleAudioEnded = useCallback(() => {
    if (currentStepId) markComplete(currentStepId);
    const current = currentStepId ? stepById(currentStepId) : undefined;
    if (!current) return;
    const nextIndex = current.step; // step is 1-indexed, so this is the next step's array index
    const next = curriculum[nextIndex];
    if (autoAdvance && next) {
      // The browser fires 'pause' just before 'ended', which would otherwise clear this;
      // re-assert it so the src-change effect knows to autoplay the next lesson.
      setIsPlaying(true);
      navigate(next.path);
    } else {
      setIsPlaying(false);
    }
  }, [autoAdvance, currentStepId, navigate, markComplete]);

  const value: GuidedTourContextValue = {
    isPlaying,
    autoAdvance,
    completedIds,
    currentStepId,
    audioRef,
    startTour,
    play,
    pause,
    toggleAutoAdvance,
    markComplete,
    handleAudioEnded,
  };

  return (
    <GuidedTourContext.Provider value={value}>
      {children}
      {/* Single shared <audio> element for the whole tour, controlled by the context above. */}
      <audio ref={audioRef} onEnded={handleAudioEnded} onPause={() => setIsPlaying(false)} preload="none" />
    </GuidedTourContext.Provider>
  );
};

export const useGuidedTour = (): GuidedTourContextValue => {
  const ctx = useContext(GuidedTourContext);
  if (!ctx) throw new Error('useGuidedTour must be used within a GuidedTourProvider');
  return ctx;
};
