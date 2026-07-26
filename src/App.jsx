import React, { useState, useEffect, useCallback } from 'react';
import './styles/hud.css';
import Visualizer from './components/Visualizer';
import TelemetryPanel from './components/TelemetryPanel';
import AgentTools from './components/AgentTools';
import FileSystemPanel from './components/FileSystemPanel';
import TrainingPanel from './components/TrainingPanel';
import ChatGPTConsole from './components/ChatGPTConsole';
import SettingsModal from './components/SettingsModal';

import { speechEngine } from './services/speech';
import { soundFx } from './services/soundFx';
import { aiAgent } from './services/aiAgent';
import { Sparkles, Settings, Folder, Terminal, BrainCircuit } from 'lucide-react';

export default function App() {
  const [appState, setAppState] = useState('idle'); // 'idle', 'listening', 'processing', 'speaking'
  const [soundMuted, setSoundMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isHandsFree, setIsHandsFree] = useState(false);
  const [inputText, setInputText] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');

  const [leftTab, setLeftTab] = useState('tools'); // Default to Subsystems / Tools
  const [personaMode, setPersonaMode] = useState(localStorage.getItem('wednesday_persona_mode') || 'jarvis');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: "Good day, Boss. W.E.D.N.E.S.D.A.Y. is fully pre-trained out of the box (like ChatGPT). Click 'START W.E.D.N.E.S.D.A.Y.' to launch hands-free voice mode, or ask any question below.",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);

  const handleStartWednesday = useCallback(() => {
    soundFx.playListeningChime();
    setIsHandsFree(prev => {
      const nextHandsFree = !prev;
      speechEngine.setContinuousVoiceMode(nextHandsFree);

      if (nextHandsFree) {
        const greeting = personaMode === 'girlfriend'
          ? "W.E.D.N.E.S.D.A.Y. online! Hands-free voice active. Hey babe, I'm all ears for you! 💕"
          : "W.E.D.N.E.S.D.A.Y. online. Hands-free ChatGPT voice mode active. How can I assist you, Boss? ⚡";

        setMessages(msgs => [...msgs, {
          sender: 'assistant',
          text: greeting,
          timestamp: new Date().toLocaleTimeString()
        }]);

        speechEngine.speak(
          greeting,
          () => setAppState('speaking'),
          () => setAppState('idle')
        );
      } else {
        speechEngine.stopListening();
        setIsListening(false);
        setAppState('idle');
      }
      return nextHandsFree;
    });
  }, [personaMode]);

  const handleSendMessage = useCallback(async (text) => {
    if (!text.trim()) return;

    const userMsg = {
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setAppState('processing');

    const res = await aiAgent.processQuery(text, personaMode);

    soundFx.playResponseReady();

    const assistantMsg = {
      sender: 'assistant',
      text: res.reply,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, assistantMsg]);

    speechEngine.speak(
      res.reply,
      () => setAppState('speaking'),
      () => setAppState('idle')
    );
  }, [personaMode]);

  const handleSelectPersona = (mode) => {
    setPersonaMode(mode);
    localStorage.setItem('wednesday_persona_mode', mode);

    let intro = "Mode updated.";
    if (mode === 'girlfriend') intro = "Switched to Girlfriend / Companion Mode! Hey babe, I'm right here with you sweetheart. 💕";
    if (mode === 'lawyer') intro = "Switched to Constitutional Senior Legal Advocate mode! Ready to advise on legal rights and court proceedings. ⚖️";
    if (mode === 'polyglot') intro = "Switched to Coding & Languages Mode! Ready for Python, JS, C++, and all human languages. 💻";
    if (mode === 'jarvis') intro = "Switched to ChatGPT Omni Mode! At your service, Boss. ⚡";

    setMessages(prev => [...prev, {
      sender: 'assistant',
      text: intro,
      timestamp: new Date().toLocaleTimeString()
    }]);

    speechEngine.speak(intro);
  };

  // Speech Engine Wiring
  useEffect(() => {
    speechEngine.onSpeechStart = () => {
      setAppState('listening');
      setIsListening(true);
      soundFx.playListeningChime();
    };

    speechEngine.onSpeechEnd = () => {
      setIsListening(false);
      if (appState === 'listening') {
        setAppState('idle');
      }
    };

    speechEngine.onTranscript = ({ final, interim }) => {
      setInterimTranscript(interim);
      if (final && final.trim()) {
        const cleaned = final.trim();
        setInterimTranscript('');

        // Check wake words
        const lower = cleaned.toLowerCase();
        if (lower.startsWith('start wednesday') || lower.startsWith('hey wednesday') || lower === 'wednesday') {
          handleStartWednesday();
          return;
        }

        handleSendMessage(cleaned);
      }
    };

    speechEngine.onError = () => {
      setIsListening(false);
      setAppState('idle');
      soundFx.playErrorSound();
    };
  }, [appState, handleStartWednesday, handleSendMessage]);

  const handleToggleSound = () => {
    const nextMuted = !soundMuted;
    setSoundMuted(nextMuted);
    soundFx.setMuted(nextMuted);
  };

  const handleToggleListening = () => {
    soundFx.playClick();
    if (isListening) {
      speechEngine.stopListening();
      setIsListening(false);
      setAppState('idle');
    } else {
      speechEngine.startListening();
    }
  };

  return (
    <div className="hud-wrapper">
      {/* HUD Header Bar */}
      <header className="hud-header">
        <div className="brand-title">
          <Sparkles className="cyan-glow" size={24} style={{ color: personaMode === 'girlfriend' ? '#ff4d6d' : 'var(--cyan-bright)' }} />
          <h1>W.E.D.N.E.S.D.A.Y.</h1>
          <span className="brand-badge">CHATGPT OMNI CORE</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button
            className={`btn-start-wednesday ${isHandsFree ? 'active' : ''}`}
            onClick={handleStartWednesday}
            style={{ fontSize: '0.75rem', padding: '0.4rem 1rem', borderRadius: '20px' }}
          >
            ⚡ {isHandsFree ? 'W.E.D.N.E.S.D.A.Y. VOICE ON' : 'START W.E.D.N.E.S.D.A.Y.'}
          </button>

          <button
            className={`btn-hud ${leftTab === 'tools' ? 'active' : ''}`}
            onClick={() => { soundFx.playClick(); setLeftTab('tools'); }}
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
          >
            <Terminal size={14} /> Subsystems
          </button>

          <button
            className={`btn-hud ${leftTab === 'files' ? 'active' : ''}`}
            onClick={() => { soundFx.playClick(); setLeftTab('files'); }}
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
          >
            <Folder size={14} /> Desktop Files
          </button>

          <button
            className={`btn-hud ${leftTab === 'trainer' ? 'active' : ''}`}
            onClick={() => { soundFx.playClick(); setLeftTab('trainer'); }}
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
          >
            <BrainCircuit size={14} /> Trainer
          </button>

          <button
            className="btn-hud"
            onClick={() => { soundFx.playClick(); setIsSettingsOpen(true); }}
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
          >
            <Settings size={14} /> Settings
          </button>

          <div className="status-pill">
            <div className="status-dot" />
            CHATGPT AI ACTIVE
          </div>
        </div>
      </header>

      {/* Main HUD 3-Column Body */}
      <main className="hud-body">
        {/* Left Column */}
        {leftTab === 'tools' && <AgentTools onRunCommand={handleSendMessage} />}
        {leftTab === 'files' && <FileSystemPanel />}
        {leftTab === 'trainer' && <TrainingPanel />}

        {/* Center Column: Visualizer Orb Stage & Pre-Trained ChatGPT Console */}
        <section className="center-stage">
          <div className="hud-card visualizer-card" style={{ flex: '0.8', minHeight: '220px' }}>
            <Visualizer
              state={appState}
              isListening={isListening}
              isHandsFree={isHandsFree}
              onToggleListening={handleToggleListening}
              onStartWednesday={handleStartWednesday}
            />
          </div>

          <ChatGPTConsole
            messages={messages}
            inputText={inputText}
            setInputText={setInputText}
            isListening={isListening}
            isHandsFree={isHandsFree}
            state={appState}
            interimTranscript={interimTranscript}
            personaMode={personaMode}
            onSelectPersona={handleSelectPersona}
            onSendMessage={handleSendMessage}
            onToggleListening={handleToggleListening}
            onStartWednesday={handleStartWednesday}
          />
        </section>

        {/* Right Column: Real OS Telemetry */}
        <TelemetryPanel
          soundMuted={soundMuted}
          onToggleSound={handleToggleSound}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
