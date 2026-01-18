'use client';

import { PersonaSettings } from '@brainstorm-cafe/shared';

interface PersonaSelectorProps {
  value: PersonaSettings;
  onChange: (value: PersonaSettings) => void;
}

const TONE_OPTIONS: PersonaSettings['tone'][] = ['casual', 'balanced', 'formal'];
const DEPTH_OPTIONS: PersonaSettings['depth'][] = ['brief', 'standard', 'exhaustive'];
const MODE_OPTIONS: PersonaSettings['mode'][] = ['analytical', 'hybrid', 'lateral'];

export default function PersonaSelector({ value, onChange }: PersonaSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">Persona</h3>
      <div className="rounded-lg border border-border bg-card p-3 space-y-4">
        <div>
          <div className="text-xs text-muted-foreground">Tone</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {TONE_OPTIONS.map((tone) => (
              <button
                key={tone}
                type="button"
                aria-pressed={value.tone === tone}
                onClick={() => onChange({ ...value, tone })}
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  value.tone === tone
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-background text-muted-foreground hover:bg-accent'
                }`}
              >
                {tone}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs text-muted-foreground">Depth</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {DEPTH_OPTIONS.map((depth) => (
              <button
                key={depth}
                type="button"
                aria-pressed={value.depth === depth}
                onClick={() => onChange({ ...value, depth })}
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  value.depth === depth
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-background text-muted-foreground hover:bg-accent'
                }`}
              >
                {depth}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs text-muted-foreground">Mode</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {MODE_OPTIONS.map((mode) => (
              <button
                key={mode}
                type="button"
                aria-pressed={value.mode === mode}
                onClick={() => onChange({ ...value, mode })}
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  value.mode === mode
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-background text-muted-foreground hover:bg-accent'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
