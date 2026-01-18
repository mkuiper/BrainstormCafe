'use client';

const GEMINI_VOICES = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'] as const;

export type GeminiVoiceName = (typeof GEMINI_VOICES)[number];

interface GeminiVoiceSelectorProps {
  selected: GeminiVoiceName;
  onChange: (voice: GeminiVoiceName) => void;
}

export default function GeminiVoiceSelector({ selected, onChange }: GeminiVoiceSelectorProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Gemini Voice</h3>
      <div className="rounded-lg border border-border bg-card p-3">
        <label className="block text-xs text-muted-foreground" htmlFor="gemini-voice-select">
          Voice selection applies to Gemini Live only.
        </label>
        <select
          id="gemini-voice-select"
          className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          value={selected}
          onChange={(event) => onChange(event.target.value as GeminiVoiceName)}
        >
          {GEMINI_VOICES.map((voice) => (
            <option key={voice} value={voice}>
              {voice}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
