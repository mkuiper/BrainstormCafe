# Notes for Claude: Gemini voice implementation (from AgenticBrainstormCafe)

Source repo inspected: /tmp/AgenticBrainstormCafe (VoiceChat.tsx, vite.config.ts).

Key implementation details in AgenticBrainstormCafe:
- Uses the **browser** SDK: `@google/genai` with `GoogleGenAI({ apiKey })` and `ai.live.connect(...)`.
- **Model** used for live audio: `gemini-2.5-flash-native-audio-preview-12-2025`.
- **Audio input**: raw PCM 16 kHz, mono.
  - Captures mic via WebAudio: `AudioContext({ sampleRate: 16000 })`, `ScriptProcessor(4096, 1, 1)`.
  - Converts float32 to int16 and sends with `sendRealtimeInput({ media: { data: base64, mimeType: 'audio/pcm;rate=16000' } })`.
- **Audio output**: PCM 24 kHz, mono.
  - Creates `AudioContext({ sampleRate: 24000 })` and decodes model audio from `inlineData.data`.
  - Schedules playback sequentially with a `nextStartTime` queue.
- **Config** passed to live session:
  - `responseModalities: [Modality.AUDIO]`
  - `inputAudioTranscription: {}` and `outputAudioTranscription: {}` enabled.
  - `speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } }`
- **Message handling**:
  - Stops playback on `serverContent.interrupted`.
  - Uses `serverContent.outputTranscription` + `serverContent.inputTranscription` for transcripts.
  - Reads model audio from `serverContent.modelTurn.parts[0].inlineData.data`.
- API key injected in Vite via `define: { 'process.env.API_KEY': GEMINI_API_KEY }`.

Differences vs BrainStormCafe current server adapter:
- BrainStormCafe uses **server-side WebSocket** (`ws`) to `BidiGenerateContent` and sends **audio/webm** chunks from `MediaRecorder`.
- AgenticBrainstormCafe sends **raw PCM** (`audio/pcm;rate=16000`) via `sendRealtimeInput` (no webm/opus).
- Agentic model is **2.5-flash-native-audio-preview-12-2025**, while BrainStormCafe uses **gemini-2.0-flash-exp**.
- Agentic relies on **SDK’s live.connect** protocol; BrainStormCafe manually crafts `setup` and `realtime_input` messages.
- Agentic reads **input/output transcription** fields; BrainStormCafe only inspects `modelTurn` + `groundingMetadata` for transcripts.

Likely breakpoints to investigate in BrainStormCafe:
- Audio format mismatch (webm/opus vs PCM 16k) when talking to Gemini Live.
- Live API schema mismatch (SDK handles message shape; manual `setup` / `realtime_input` might be off).
- Missing `inputAudioTranscription` / `outputAudioTranscription` in config means no transcripts.
- Model name mismatch (preview audio model vs non-audio model).

Helpful reference files (AgenticBrainstormCafe):
- `components/VoiceChat.tsx`
- `vite.config.ts`
- `constants.tsx` (voice list)
