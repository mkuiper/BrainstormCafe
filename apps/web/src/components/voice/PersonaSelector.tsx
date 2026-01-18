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
      <div className="rounded-lg border border-border bg-card p-3 space-y-3">
        <div>
          <label className="block text-xs text-muted-foreground" htmlFor="persona-tone">
            Tone
          </label>
          <select
            id="persona-tone"
            className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={value.tone}
            onChange={(event) => onChange({ ...value, tone: event.target.value as PersonaSettings['tone'] })}
          >
            {TONE_OPTIONS.map((tone) => (
              <option key={tone} value={tone}>
                {tone}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-muted-foreground" htmlFor="persona-depth">
            Depth
          </label>
          <select
            id="persona-depth"
            className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={value.depth}
            onChange={(event) => onChange({ ...value, depth: event.target.value as PersonaSettings['depth'] })}
          >
            {DEPTH_OPTIONS.map((depth) => (
              <option key={depth} value={depth}>
                {depth}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-muted-foreground" htmlFor="persona-mode">
            Mode
          </label>
          <select
            id="persona-mode"
            className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={value.mode}
            onChange={(event) => onChange({ ...value, mode: event.target.value as PersonaSettings['mode'] })}
          >
            {MODE_OPTIONS.map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
