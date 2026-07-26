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
import {
  Sparkles, Settings, Folder, Terminal, BrainCircuit, Hand, Mic, MicOff,
  Send, Menu, X, Heart, Scale, Code, Bot, Activity
} from 'lucide-react';

export default function App() {
  const [appState, setAppState] = useState('idle'); // 'idle', 'listening', 'processing', 'speaking'
  const [soundMuted, setSoundMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isHandsFree, setIsHandsFree] = useState(false);
  const [inputText, setInputText] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [activeGesture, setActiveGesture] = useState(null);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState('gestures'); // 'gestures', 'custom_voice', 'tools', 'files', 'trainer', 'telemetry'
  const [personaMode, setPersonaMode] = useState(localStorage.getItem('wednesday_persona_mode') || 'jarvis');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: "Good day, Boss. Welcome to W.E.D.N.E.S.D.A.Y. Official Omni AI Canvas. Start hands-free voice mode, test webcam hand gestures, or ask any question below.",
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
    } else if (gesture === 'SWIPE_RIGHT' || gesture === 'SWIPE_LEFT') {
      setIsDrawerOpen(prev => !prev);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    soundFx.playClick();
    handleSendMessage(inputText);
  };

  const personas = [
    { id: 'jarvis', label: 'ChatGPT Omni', icon: Sparkles, color: '#06b6d4' },
    { id: 'girlfriend', label: 'Girlfriend', icon: Heart, color: '#f43f5e' },
    { id: 'lawyer', label: 'Lawyer', icon: Scale, color: '#f59e0b' },
    { id: 'polyglot', label: 'Coding', icon: Code, color: '#8b5cf6' }
  ];

  return (
    <div className="app-canvas">
      {/* Floating Glass Header */}
      <header className="canvas-header">
        <div className="brand-section">
          <Bot size={24} color={personaMode === 'girlfriend' ? '#f43f5e' : 'var(--accent-cyan)'} />
          <h1 className="brand-name">W.E.D.N.E.S.D.A.Y.</h1>
          <span className="pill-badge">CHATGPT OMNI</span>
        </div>

        {/* Persona Pill Group */}
        <div className="persona-pill-group">
          {personas.map((p) => {
            const Icon = p.icon;
            const isActive = personaMode === p.id;
            return (
              <button
                key={p.id}
                className={`btn-persona ${isActive ? 'active' : ''}`}
                onClick={() => { soundFx.playClick(); handleSelectPersona(p.id); }}
                style={{ background: isActive ? p.color : 'transparent' }}
              >
                <Icon size={12} /> {p.label}
              </button>
            );
          })}
        </div>

        <div className="header-actions">
          <button
            className={`btn-start-wednesday ${isHandsFree ? 'active' : ''}`}
            onClick={handleStartWednesday}
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.9rem', borderRadius: '20px' }}
          >
            ⚡ {isHandsFree ? 'VOICE ON' : 'START WEDNESDAY'}
          </button>

          <button
            className="btn-icon-pill"
            onClick={() => { soundFx.playClick(); setIsSettingsOpen(true); }}
            title="Settings"
          >
            <Settings size={16} />
          </button>

          <button
            className={`btn-icon-pill ${isDrawerOpen ? 'active' : ''}`}
            onClick={() => { soundFx.playClick(); setIsDrawerOpen(prev => !prev); }}
            title="Toggle Side Drawer"
          >
            {isDrawerOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </header>

      {/* Main AI Conversation Stream Stage */}
      <main className="main-stage">
        {/* Central Fluid Siri/ChatGPT Voice Orb Visualizer */}
        <div className="orb-stage">
          <Visualizer
            state={appState}
            isListening={isListening}
            isHandsFree={isHandsFree}
            activeGesture={activeGesture}
          />
        </div>

        {/* Stream Messages Area */}
        <ChatGPTConsole
          messages={messages}
          interimTranscript={interimTranscript}
          onSendMessage={handleSendMessage}
        />
      </main>

      {/* Bottom Floating Prompt Bar */}
      <div className="bottom-prompt-container">
        <form onSubmit={handleSubmit} className="prompt-bar-floating">
          <button
            type="button"
            className={`btn-icon-pill ${isHandsFree ? 'active' : ''}`}
            onClick={handleStartWednesday}
            title={isHandsFree ? 'Hands-Free Voice ON' : 'Start Hands-Free Voice'}
            style={{ borderColor: isHandsFree ? '#f43f5e' : 'var(--accent-cyan)' }}
          >
            <Sparkles size={16} />
          </button>

          <button
            type="button"
            className={`btn-icon-pill ${isListening ? 'active' : ''}`}
            onClick={handleToggleListening}
            title={isListening ? 'Stop Listening' : 'Talk Microphone'}
          >
            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
          </button>

          <input
            type="text"
            className="input-prompt"
            placeholder="Ask Wednesday anything (like ChatGPT)..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />

          <button
            type="button"
            className={`btn-icon-pill ${drawerTab === 'gestures' && isDrawerOpen ? 'active' : ''}`}
            onClick={() => {
              soundFx.playClick();
              setDrawerTab('gestures');
              setIsDrawerOpen(true);
            }}
            title="Hand Gesture Camera AI"
          >
            <Hand size={16} />
          </button>

          <button type="submit" className="btn-submit-pill">
            <Send size={14} /> Send
          </button>
        </form>
      </div>

      {/* Retractable Glass Side Drawer */}
      <aside className={`side-drawer ${isDrawerOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <span className="drawer-title">
            <Sparkles size={16} /> W.E.D.N.E.S.D.A.Y. Subsystem Drawer
          </span>
          <button
            onClick={() => setIsDrawerOpen(false)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Side Drawer Navigation Tabs */}
        <div className="drawer-tabs">
          <button className={`drawer-tab-btn ${drawerTab === 'gestures' ? 'active' : ''}`} onClick={() => setDrawerTab('gestures')}>
            <Hand size={13} /> Gestures AI
          </button>
          <button className={`drawer-tab-btn ${drawerTab === 'custom_voice' ? 'active' : ''}`} onClick={() => setDrawerTab('custom_voice')}>
            <Mic size={13} /> Voice Studio
          </button>
          <button className={`drawer-tab-btn ${drawerTab === 'tools' ? 'active' : ''}`} onClick={() => setDrawerTab('tools')}>
            <Terminal size={13} /> Subsystems
          </button>
          <button className={`drawer-tab-btn ${drawerTab === 'files' ? 'active' : ''}`} onClick={() => setDrawerTab('files')}>
            <Folder size={13} /> Desktop Files
          </button>
          <button className={`drawer-tab-btn ${drawerTab === 'trainer' ? 'active' : ''}`} onClick={() => setDrawerTab('trainer')}>
            <BrainCircuit size={13} /> Trainer
          </button>
          <button className={`drawer-tab-btn ${drawerTab === 'telemetry' ? 'active' : ''}`} onClick={() => setDrawerTab('telemetry')}>
            <Activity size={13} /> Telemetry
          </button>
        </div>

        {/* Side Drawer Active Content View */}
        <div className="drawer-content">
          {drawerTab === 'gestures' && <HandGesturePanel onGestureDetected={handleGestureDetected} />}
          {drawerTab === 'custom_voice' && <CustomVoiceStudio />}
          {drawerTab === 'tools' && <AgentTools onRunCommand={handleSendMessage} />}
          {drawerTab === 'files' && <FileSystemPanel />}
          {drawerTab === 'trainer' && <TrainingPanel />}
          {drawerTab === 'telemetry' && (
            <TelemetryPanel
              soundMuted={soundMuted}
              onToggleSound={handleToggleSound}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />
          )}
        </div>
      </aside>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
