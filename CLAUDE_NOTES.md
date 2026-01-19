# Claude notes: Gemini voice + persona work (Jan 18, 2026)

## What changed (high level)
- Gemini voice streaming aligned to AgenticBrainstormCafe: PCM input/output, preview audio model, input/output transcription enabled.
- Added Gemini voice picker and persona controls in the UI.
- Persona settings now influence Gemini + OpenAI Realtime + WebSpeech (AIService).
- Transcript merging improved to avoid partial chunk overwrites.

## Gemini voice alignment
- Model: `gemini-2.5-flash-native-audio-preview-12-2025`.
- Input: raw PCM 16k mono (`audio/pcm;rate=16000`).
- Output: PCM 24k mono; client plays via WebAudio queue.
- Transcription: `input_audio_transcription` + `output_audio_transcription` enabled in setup.

Key files:
- `apps/server/src/services/voice/adapters/GeminiLiveAdapter.ts`
  - Uses PCM input, preview model, transcription fields.
  - Accepts voice name from `config.settings.voiceId`.
  - Appends persona line to system instruction.
- `apps/web/src/components/voice/VoiceControl.tsx`
  - Gemini uses WebAudio PCM capture (ScriptProcessor) not MediaRecorder/webm.
  - Passes voice + persona in `VoiceConfig.settings`.
- `apps/web/src/hooks/useVoiceSession.ts`
  - Plays Gemini PCM output (24k) + merges partial transcripts.

## Persona controls
- UI: `apps/web/src/components/voice/PersonaSelector.tsx` (horizontal button rows).
- Config panel wires `persona` state and passes to `VoiceControl`.
- Shared types: `packages/shared/src/types/voice.ts` adds `PersonaSettings` and `persona` inside `VoiceSettings`.

Provider wiring:
- Gemini: system instruction appends `Tone/Depth/Mode`.
- OpenAI Realtime: session instructions appended with persona line.
- WebSpeech: `AIService.generateResponse` accepts optional persona; WebSpeechAdapter passes persona in.

## Gemini voice list
- `apps/web/src/components/voice/GeminiVoiceSelector.tsx` provides choices: Puck, Charon, Kore, Fenrir, Zephyr.

## Cleanup
- Removed accidental `.logs-*` files and added `.logs-*` to `.gitignore`.

## Recent commits
- Improve Gemini voice streaming and add voice selection.
- Remove dev logs and ignore future log artifacts.
- Add persona controls and pass to Gemini system prompt.
- Render persona controls as radios and apply to providers.
