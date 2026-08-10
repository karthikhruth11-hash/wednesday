import React, { useState, useEffect } from 'react';
import { Settings, Key, Bot, X, Save, Volume2, Database } from 'lucide-react';
import { soundFx } from '../services/soundFx';
import { speechEngine } from '../services/speech';
import PersonalitySelector from './PersonalitySelector';

export default function SettingsModal({ isOpen, onClose, onPersonaChange }) {
  const [provider, setProvider] = useState(localStorage.getItem('wednesday_ai_provider') || 'local');
  const [apiKey, setApiKey] = useState(localStorage.getItem('wednesday_api_key') || '');
  const [personaMode, setPersonaMode] = useState(localStorage.getItem('wednesday_persona_mode') || 'jarvis');
  const [voices, setVoices] = useState([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState(localStorage.getItem('wednesday_voice_name') || '');
  const [speechRate, setSpeechRate] = useState(localStorage.getItem('wednesday_speech_rate') || '1.0');
  const [speechPitch, setSpeechPitch] = useState(localStorage.getItem('wednesday_speech_pitch') || '1.0');
  const [micLang, setMicLang] = useState(localStorage.getItem('wednesday_mic_lang') || 'en-US');
  const [customDbType, setCustomDbType] = useState(localStorage.getItem('wednesday_custom_db_type') || 'json');
  const [customDbUri, setCustomDbUri] = useState(localStorage.getItem('wednesday_custom_db_uri') || '');
  const [customDbTable, setCustomDbTable] = useState(localStorage.getItem('wednesday_custom_db_table') || 'wednesday_memory');
  const [savedStatus, setSavedStatus] = useState('');

  const MIC_LANGUAGES = [
    { code: 'en-US', label: '🇺🇸 English (US)' },
    { code: 'en-IN', label: '🇮🇳 English (India)' },
    { code: 'te-IN', label: '🇮🇳 Telugu (తెలుగు)' },
    { code: 'hi-IN', label: '🇮🇳 Hindi (हिंदी)' },
    { code: 'ta-IN', label: '🇮🇳 Tamil (தமிழ்)' },
    { code: 'kn-IN', label: '🇮🇳 Kannada (కన్నడ)' },
    { code: 'ml-IN', label: '🇮🇳 Malayalam (മലയാളം)' },
    { code: 'mr-IN', label: '🇮🇳 Marathi (మరాఠీ)' },
    { code: 'bn-IN', label: '🇮🇳 Bengali (బెంగాలీ)' },
    { code: 'es-ES', label: '🇪🇸 Spanish (Español)' },
    { code: 'fr-FR', label: '🇫🇷 French (Français)' },
    { code: 'de-DE', label: '🇩🇪 German (Deutsch)' },
    { code: 'ja-JP', label: '🇯🇵 Japanese (日本語)' },
    { code: 'ko-KR', label: '🇰🇷 Korean (한국어)' },
    { code: 'zh-CN', label: '🇨🇳 Chinese (中文)' },
    { code: 'ar-SA', label: '🇸🇦 Arabic (العربية)' },
    { code: 'ru-RU', label: '🇷🇺 Russian (Русский)' }
  ];

  useEffect(() => {
    if (isOpen) {
      const available = speechEngine.getAvailableVoices();
      if (available && available.length > 0) {
        setVoices(available);
        if (!selectedVoiceName && available[0]) {
          setSelectedVoiceName(available[0].name);
        }
      } else {
        const timer = setTimeout(() => {
          const recheck = speechEngine.getAvailableVoices();
          setVoices(recheck);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, selectedVoiceName]);

  if (!isOpen) return null;

  const handleTestVoice = () => {
    soundFx.playClick();
    if (selectedVoiceName) {
      speechEngine.setSelectedVoice(selectedVoiceName);
    }
    localStorage.setItem('wednesday_speech_rate', speechRate);
    localStorage.setItem('wednesday_speech_pitch', speechPitch);
    speechEngine.speak("Hello Boss! This is my natural voice. How does it sound?");
  };

  const handleSave = () => {
    soundFx.playClick();
    localStorage.setItem('wednesday_ai_provider', provider);
    localStorage.setItem('wednesday_api_key', apiKey.trim());
    localStorage.setItem('wednesday_persona_mode', personaMode);
    localStorage.setItem('wednesday_custom_db_type', customDbType);
    localStorage.setItem('wednesday_custom_db_uri', customDbUri.trim());
    localStorage.setItem('wednesday_custom_db_table', customDbTable.trim());
    speechEngine.setRecognitionLanguage(micLang);

    if (onPersonaChange) {
      onPersonaChange(personaMode);
    }

    if (selectedVoiceName) {
      speechEngine.setSelectedVoice(selectedVoiceName);
    }
    localStorage.setItem('wednesday_speech_rate', speechRate);
    localStorage.setItem('wednesday_speech_pitch', speechPitch);

    setSavedStatus('Settings & Custom Database Config Saved!');
    setTimeout(() => {
      setSavedStatus('');
      onClose();
    }, 1000);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, width: '100vw', height: '100vh',
        background: 'rgba(4, 7, 17, 0.85)',
        backdropFilter: 'blur(10px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div
        className="hud-card"
        style={{ width: '540px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--cyan-bright)', boxShadow: '0 0 30px rgba(0, 240, 255, 0.3)' }}
      >
        <div className="hud-card-header">
          <span className="hud-card-title">
            <Settings size={18} /> AI Neural Core & Voice Settings
          </span>
          <button
            onClick={() => { soundFx.playClick(); onClose(); }}
            style={{ background: 'none', border: 'none', color: '#ff0055', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Personality Mode Selector */}
          <PersonalitySelector currentMode={personaMode} onSelectMode={setPersonaMode} />

          {/* Intelligence Engine Section */}
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--cyan-bright)', fontFamily: 'Orbitron', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
              <Bot size={14} /> Intelligence Engine Selection
            </label>
            <select
              className="input-hud"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="local">W.E.D.N.E.S.D.A.Y. Autonomous Core (Free - No API Key Needed)</option>
              <option value="groq">Groq Cloud API (Ultra-Fast - Llama 3.3 70B / DeepSeek)</option>
              <option value="gemini">Google Gemini API (Free Tier Keys)</option>
              <option value="openai">OpenAI (ChatGPT / GPT-4o)</option>
              <option value="ollama">Local Ollama LLM (http://localhost:11434)</option>
            </select>
          </div>

          {provider !== 'local' && provider !== 'ollama' && (
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--cyan-bright)', fontFamily: 'Orbitron', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                <Key size={14} /> {provider === 'groq' ? 'Groq Cloud API Key' : provider === 'gemini' ? 'Google Gemini API Key' : 'OpenAI API Key'}
              </label>
              <input
                type="password"
                className="input-hud"
                placeholder={provider === 'groq' ? 'Paste Groq API Key (gsk_...)' : provider === 'gemini' ? 'Paste Gemini API Key (AIzaSy...)' : 'Paste OpenAI API Key (sk-...)'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Stored locally in browser memory.</span>
                {provider === 'groq' && (
                  <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" style={{ color: 'var(--cyan-bright)', textDecoration: 'underline' }}>
                    Get Free Groq Key
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Speech Recognition Input Language */}
          <div style={{ padding: '0.75rem', background: 'rgba(0, 240, 255, 0.04)', border: '1px solid rgba(0, 240, 255, 0.2)', borderRadius: '8px' }}>
            <label style={{ fontSize: '0.8rem', color: '#00f0ff', fontFamily: 'Orbitron', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
              🎙️ Microphone Speech Recognition Language
            </label>
            <select
              className="input-hud"
              value={micLang}
              onChange={(e) => {
                setMicLang(e.target.value);
                speechEngine.setRecognitionLanguage(e.target.value);
              }}
              style={{ width: '100%' }}
            >
              {MIC_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
              Select your spoken language (Telugu, Hindi, Tamil, English, etc.) for Web Speech API transcription.
            </div>
          </div>

          {/* Voice Customization Section (Human vs Robo Voice) */}
          <div style={{ padding: '0.75rem', background: 'rgba(0, 240, 255, 0.04)', border: '1px solid rgba(0, 240, 255, 0.2)', borderRadius: '8px' }}>
            <label style={{ fontSize: '0.8rem', color: '#00f0ff', fontFamily: 'Orbitron', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
              <Volume2 size={16} /> Human Natural Voice & Speech Synthesis
            </label>

            {voices.length > 0 ? (
              <div>
                <select
                  className="input-hud"
                  value={selectedVoiceName}
                  onChange={(e) => setSelectedVoiceName(e.target.value)}
                  style={{ width: '100%', marginBottom: '0.6rem' }}
                >
                  {voices.map((v, i) => (
                    <option key={i} value={v.name}>
                      {v.name} ({v.lang}) {v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Online') ? '✨ (Natural)' : ''}
                    </option>
                  ))}
                </select>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.6rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                      Speech Tempo / Rate: {speechRate}x
                    </div>
                    <input
                      type="range"
                      min="0.7"
                      max="1.5"
                      step="0.05"
                      value={speechRate}
                      onChange={(e) => setSpeechRate(e.target.value)}
                      style={{ width: '100%', accentColor: 'var(--cyan-bright)' }}
                    />
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                      Voice Pitch: {speechPitch}
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="1.5"
                      step="0.05"
                      value={speechPitch}
                      onChange={(e) => setSpeechPitch(e.target.value)}
                      style={{ width: '100%', accentColor: 'var(--cyan-bright)' }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-hud"
                  onClick={handleTestVoice}
                  style={{ fontSize: '0.75rem', padding: '0.3rem 0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Volume2 size={14} /> 🔊 Test Selected Natural Voice
                </button>
              </div>
            ) : (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Loading system speech synthesis voices...
              </div>
            )}
          </div>

          {/* Custom Database Engine Section */}
          <div style={{ padding: '0.75rem', background: 'rgba(0, 240, 255, 0.04)', border: '1px solid rgba(0, 240, 255, 0.2)', borderRadius: '8px', marginTop: '0.75rem' }}>
            <label style={{ fontSize: '0.8rem', color: '#00f0ff', fontFamily: 'Orbitron', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
              <Database size={16} /> Custom Database Integration
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.6rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
                  Database Engine:
                </label>
                <select
                  className="input-hud"
                  value={customDbType}
                  onChange={(e) => setCustomDbType(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="json">📁 Local JSON Database (database.json)</option>
                  <option value="mongodb">🍃 MongoDB (mongodb://...)</option>
                  <option value="sqlite">🗄️ SQLite (wednesday_custom.db)</option>
                  <option value="rest_api">⚡ Custom REST / Webhook API (https://...)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
                  Table / Collection Name:
                </label>
                <input
                  type="text"
                  className="input-hud"
                  placeholder="wednesday_memory"
                  value={customDbTable}
                  onChange={(e) => setCustomDbTable(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
                Database Connection URI / Endpoint URL (Optional):
              </label>
              <input
                type="text"
                className="input-hud"
                placeholder="mongodb://localhost:27017/wednesday OR https://api.yourdb.com/v1"
                value={customDbUri}
                onChange={(e) => setCustomDbUri(e.target.value)}
                style={{ width: '100%' }}
              />
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                Connect your own MongoDB, SQLite, or Custom REST Database URL to store all memory and logs.
              </div>
            </div>
          </div>

          {savedStatus && (
            <div style={{ color: 'var(--green-online)', fontSize: '0.85rem', fontFamily: 'Orbitron', textAlign: 'center' }}>
              {savedStatus}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button className="btn-hud btn-hud-danger" onClick={onClose}>
              Cancel
            </button>
            <button className="btn-hud" onClick={handleSave}>
              <Save size={14} /> Save & Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
