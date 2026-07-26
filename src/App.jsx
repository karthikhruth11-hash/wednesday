import React, { useState, useEffect, useCallback } from 'react';
import './styles/hud.css';
import Visualizer from './components/Visualizer';
import TelemetryPanel from './components/TelemetryPanel';
import AgentTools from './components/AgentTools';
import FileSystemPanel from './components/FileSystemPanel';
import TrainingPanel from './components/TrainingPanel';
import HandGesturePanel from './components/HandGesturePanel';
import CustomVoiceStudio from './components/CustomVoiceStudio';
import ChatGPTConsole from './components/ChatGPTConsole';
import SettingsModal from './components/SettingsModal';

import { speechEngine } from './services/speech';
import { soundFx } from './services/soundFx';
import { aiAgent } from './services/aiAgent';
import { Sparkles, Settings, Folder, Terminal, BrainCircuit, Hand, Mic } from 'lucide-react';

export default function App() {
  const [appState, setAppState] = useState('idle'); // 'idle', 'listening', 'processing', 'speaking'
  const [soundMuted, setSoundMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isHandsFree, setIsHandsFree] = useState(false);
  const [inputText, setInputText] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [activeGesture, setActiveGesture] = useState(null);

  const [leftTab, setLeftTab] = useState('tools'); // 'tools', 'files', 'trainer', 'gestures', 'custom_voice'
  const [personaMode, setPersonaMode] = useState(localStorage.getItem('wednesday_persona_mode') || 'jarvis');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: "Good day, Boss. W.E.D.N.E.S.D.A.Y. is fully pre-trained and upgraded with Real-Time Webcam Hand Gesture Control and Custom Voice Studio. Enable camera gestures or start voice mode below.",
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

  // Hand Gesture Action Dispatcher
  const handleGestureDetected = useCallback((gesture) => {
    setActiveGesture(gesture);
    setTimeout(() => setActiveGesture(null), 1500);

    if (gesture === 'PEACE_SIGN') {
      const modes = ['jarvis', 'girlfriend', 'lawyer', 'polyglot'];
      const nextIndex = (modes.indexOf(personaMode) + 1) % modes.length;
      handleSelectPersona(modes[nextIndex]);
    } else if (gesture === 'CLOSED_FIST') {
      speechEngine.stopListening();
      setIsListening(false);
      setAppState('idle');
      soundFx.playClick();
    } else if (gesture === 'THUMBS_UP') {
      handleSendMessage('Awesome job Wednesday!');
    } else if (gesture === 'PINCH_OK') {
      handleStartWednesday();
    } else if (gesture === 'SWIPE_RIGHT') {
      setLeftTab(prev => {
        const tabs = ['tools', 'files', 'trainer', 'gestures', 'custom_voice'];
        return tabs[(tabs.indexOf(prev) + 1) % tabs.length];
      });
    } else if (gesture === 'SWIPE_LEFT') {
      setLeftTab(prev => {
        const tabs = ['tools', 'files', 'trainer', 'gestures', 'custom_voice'];
        return tabs[(tabs.indexOf(prev) - 1 + tabs.length) % tabs.length];
      });
    }
  }, [personaMode, handleStartWednesday, handleSendMessage]);

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
          <span className="brand-badge">ULTRA OMNI CORE</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          <button
            className={`btn-start-wednesday ${isHandsFree ? 'active' : ''}`}
            onClick={handleStartWednesday}
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.9rem', borderRadius: '20px' }}
          >
            ⚡ {isHandsFree ? 'VOICE ON' : 'START WEDNESDAY'}
          </button>

          <button
            className={`btn-hud ${leftTab === 'tools' ? 'active' : ''}`}
            onClick={() => { soundFx.playClick(); setLeftTab('tools'); }}
            style={{ fontSize: '0.72rem', padding: '0.35rem 0.7rem' }}
          >
            <Terminal size={13} /> Subsystems
          </button>

          <button
            className={`btn-hud ${leftTab === 'gestures' ? 'active' : ''}`}
            onClick={() => { soundFx.playClick(); setLeftTab('gestures'); }}
            style={{ fontSize: '0.72rem', padding: '0.35rem 0.7rem', borderColor: leftTab === 'gestures' ? '#00f0ff' : 'rgba(0,240,255,0.3)' }}
          >
            <Hand size={13} color="#00f0ff" /> Hand Gestures
          </button>

          <button
            className={`btn-hud ${leftTab === 'custom_voice' ? 'active' : ''}`}
            onClick={() => { soundFx.playClick(); setLeftTab('custom_voice'); }}
            style={{ fontSize: '0.72rem', padding: '0.35rem 0.7rem', borderColor: leftTab === 'custom_voice' ? '#ff4d6d' : 'rgba(255,77,109,0.3)' }}
          >
            <Mic size={13} color="#ff4d6d" /> My Voice Studio
          </button>

          <button
            className={`btn-hud ${leftTab === 'files' ? 'active' : ''}`}
            onClick={() => { soundFx.playClick(); setLeftTab('files'); }}
            style={{ fontSize: '0.72rem', padding: '0.35rem 0.7rem' }}
          >
            <Folder size={13} /> Desktop Files
          </button>

          <button
            className={`btn-hud ${leftTab === 'trainer' ? 'active' : ''}`}
            onClick={() => { soundFx.playClick(); setLeftTab('trainer'); }}
            style={{ fontSize: '0.72rem', padding: '0.35rem 0.7rem' }}
          >
            <BrainCircuit size={13} /> Trainer
          </button>

          <button
            className="btn-hud"
            onClick={() => { soundFx.playClick(); setIsSettingsOpen(true); }}
            style={{ fontSize: '0.72rem', padding: '0.35rem 0.7rem' }}
          >
            <Settings size={13} /> Settings
          </button>

          <div className="status-pill">
            <div className="status-dot" />
            AI & GESTURES ACTIVE
          </div>
        </div>
      </header>

      {/* Main HUD 3-Column Body */}
      <main className="hud-body">
        {/* Left Column */}
        {leftTab === 'tools' && <AgentTools onRunCommand={handleSendMessage} />}
        {leftTab === 'gestures' && <HandGesturePanel onGestureDetected={handleGestureDetected} />}
        {leftTab === 'custom_voice' && <CustomVoiceStudio />}
        {leftTab === 'files' && <FileSystemPanel />}
        {leftTab === 'trainer' && <TrainingPanel />}

        {/* Center Column: Visualizer Orb Stage & Pre-Trained ChatGPT Console */}
        <section className="center-stage">
          <div className="hud-card visualizer-card" style={{ flex: '0.8', minHeight: '220px' }}>
            <Visualizer
              state={appState}
              isListening={isListening}
              isHandsFree={isHandsFree}
              activeGesture={activeGesture}
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
