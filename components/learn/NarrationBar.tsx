
import React from 'react';
import { Pause, Play, Repeat } from 'lucide-react';
import { useGuidedTour } from '../../state/GuidedTourContext';
import { curriculum, totalSteps } from '../../content/curriculum';

/**
 * Audio controls for whichever lesson is currently mounted. Renders inside
 * LearnPage so it appears on every /learn/* step; playback state itself
 * lives in GuidedTourContext so it survives navigation between lessons.
 */
const NarrationBar: React.FC<{ stepId: string }> = ({ stepId }) => {
  const { isPlaying, autoAdvance, currentStepId, play, pause, toggleAutoAdvance } = useGuidedTour();
  const step = curriculum.find((s) => s.id === stepId);
  if (!step) return null;

  const isCurrent = currentStepId === stepId;
  const playing = isCurrent && isPlaying;

  return (
    <div className="glass-card p-3 flex items-center gap-3 text-sm">
      <button
        type="button"
        onClick={() => (playing ? pause() : play())}
        aria-label={playing ? 'Pause narration' : 'Play narration'}
        className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-[var(--color-accent)] text-white hover:opacity-90 transition-opacity"
      >
        {playing ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
      </button>
      <div className="min-w-0">
        <p className="font-semibold text-slate-800 truncate">Listen: {step.title}</p>
        <p className="text-xs text-slate-400">
          Step {step.step} of {totalSteps} · audio narration
        </p>
      </div>
      <button
        type="button"
        onClick={toggleAutoAdvance}
        aria-pressed={autoAdvance}
        title={autoAdvance ? 'Auto-advance to next lesson: on' : 'Auto-advance to next lesson: off'}
        className={`ml-auto shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-[var(--radius-sm)] text-xs font-medium transition-colors ${
          autoAdvance
            ? 'bg-[color-mix(in_srgb,var(--color-accent)_15%,transparent)] text-[var(--color-accent-700)]'
            : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <Repeat size={14} className={autoAdvance ? '' : 'opacity-40'} />
        Auto-advance
      </button>
    </div>
  );
};

export default NarrationBar;
