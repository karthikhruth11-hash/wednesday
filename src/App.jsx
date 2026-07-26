import React, { useState, useEffect, useCallback } from 'react';
import './styles/hud.css';
import ArcReactorVisualizer from './components/ArcReactorVisualizer';
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
  Send, Menu, X, Heart, Scale, Code, Bot, Activity, Cpu, HardDrive, Zap, CloudSun, Globe
} from 'lucide-react';

export default function App() {
  const [appState, setAppState] = useState('idle'); // 'idle', 'listening', 'processing', 'speaking'
  const [soundMuted, setSoundMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isHandsFree, setIsHandsFree] = useState(false);
  const [inputText, setInputText] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [activeGesture, setActiveGesture] = useState(null);
  const [handPos, setHandPos] = useState(null);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState('gestures'); // 'gestures', 'custom_voice', 'tools', 'files', 'trainer', 'telemetry'
  const [personaMode, setPersonaMode] = useState(localStorage.getItem('wednesday_persona_mode') || 'jarvis');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: "Welcome, our Boss Karthik! W.E.D.N.E.S.D.A.Y. SIGMA Arc Reactor core online and ready for your command.",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleStartWednesday = useCallback(() => {
    soundFx.playListeningChime();
    setIsHandsFree(prev => {
      const nextHandsFree = !prev;
      speechEngine.setContinuousVoiceMode(nextHandsFree);

      if (nextHandsFree) {
        const greeting = personaMode === 'girlfriend'
          ? "Welcome, our Boss Karthik! Hey babe, SIGMA Arc Reactor active, I'm all yours sweetheart! 💕"
          : "Welcome, our Boss Karthik! W.E.D.N.E.S.D.A.Y. SIGMA Arc Reactor core online. How can I assist you today, Boss? ⚡";

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

    let intro = "Welcome, our Boss Karthik! Persona mode updated.";
    if (mode === 'girlfriend') intro = "Welcome, our Boss Karthik! Switched to Companion Mode. Hey babe, I'm right here with you sweetheart! 💕";
    if (mode === 'lawyer') intro = "Welcome, our Boss Karthik! Switched to Legal Advocate Mode. Ready for court proceedings and legal rights. ⚖️";
    if (mode === 'polyglot') intro = "Welcome, our Boss Karthik! Switched to Coding & Languages Mode. Ready for Python, JS, and all code! 💻";
    if (mode === 'jarvis') intro = "Welcome, our Boss Karthik! W.E.D.N.E.S.D.A.Y. SIGMA Omni Core online. ⚡";

    setMessages(prev => [...prev, {
      sender: 'assistant',
      text: intro,
      timestamp: new Date().toLocaleTimeString()
    }]);

    speechEngine.speak(intro);
  };

  // Hand Gesture Action Dispatcher
  const handleGestureDetected = useCallback((data) => {
    const gesture = typeof data === 'object' ? data.gesture : data;
    if (typeof data === 'object' && data.handPos) {
      setHandPos(data.handPos);
    }

    if (gesture && gesture !== 'TRACKING') {
      setActiveGesture(gesture);
      setTimeout(() => setActiveGesture(null), 1500);
    }

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
    { id: 'jarvis', label: 'SIGMA Omni', icon: Sparkles, color: '#00f0ff' },
    { id: 'girlfriend', label: 'Girlfriend', icon: Heart, color: '#f43f5e' },
    { id: 'lawyer', label: 'Lawyer', icon: Scale, color: '#ffb703' },
    { id: 'polyglot', label: 'Coding', icon: Code, color: '#a855f7' }
  ];

  return (
    <div className="stark-workspace">
      {/* Top Holographic Header Bar */}
      <header className="stark-header">
        <div className="stark-brand">
          <Bot size={26} color="#00f0ff" />
          <h1 className="sigma-logo-title">SIGMA INDUSTRIES</h1>
          <span className="sigma-badge">ARC REACTOR v4.2</span>
        </div>

        {/* Live Clock & Persona Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{ fontFamily: 'Orbitron', fontSize: '0.8rem', color: '#00f0ff', background: 'rgba(0,240,255,0.08)', padding: '0.25rem 0.75rem', borderRadius: '4px', border: '1px solid rgba(0,240,255,0.3)' }}>
            ⏰ {currentTime}
          </div>

          <div style={{ display: 'flex', gap: '0.3rem', background: 'rgba(0,0,0,0.5)', padding: '0.2rem', borderRadius: '6px', border: '1px solid var(--border-hud)' }}>
            {personas.map((p) => {
              const Icon = p.icon;
              const isActive = personaMode === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => { soundFx.playClick(); handleSelectPersona(p.id); }}
                  style={{
                    fontSize: '0.72rem',
                    fontFamily: 'Orbitron',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '4px',
                    border: 'none',
                    background: isActive ? p.color : 'transparent',
                    color: isActive ? '#020813' : '#94a3b8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    fontWeight: 'bold'
                  }}
                >
                  <Icon size={12} /> {p.label}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            className={`btn-start-wednesday ${isHandsFree ? 'active' : ''}`}
            onClick={handleStartWednesday}
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.9rem', borderRadius: '20px' }}
          >
            ⚡ {isHandsFree ? 'VOICE ON' : 'START WEDNESDAY'}
          </button>

          <button
            className="btn-stark-icon"
            onClick={() => { soundFx.playClick(); setIsSettingsOpen(true); }}
            title="Settings"
          >
            <Settings size={16} />
          </button>

          <button
            className={`btn-stark-icon ${isDrawerOpen ? 'active' : ''}`}
            onClick={() => { soundFx.playClick(); setIsDrawerOpen(prev => !prev); }}
            title="Toggle Subsystem Drawer"
          >
            {isDrawerOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </header>

      {/* Main 3-Column Stark Arc Reactor Workspace */}
      <main className="stark-body">
        {/* Left Column: Circular Telemetry Gauges */}
        <aside className="telemetry-column-left">
          {/* CPU Circular Gauge Dial */}
          <div className="circular-gauge-card">
            <div className="gauge-circle-outer">
              <div className="gauge-circle-inner">
                <Cpu size={18} color="#00f0ff" />
                <span className="gauge-value">74%</span>
              </div>
            </div>
            <span className="gauge-label">CPU CORE METRICS</span>
          </div>

          {/* RAM & SWAP Circular Gauge Dial */}
          <div className="circular-gauge-card">
            <div className="gauge-circle-outer" style={{ borderColor: '#a855f7' }}>
              <div className="gauge-circle-inner" style={{ borderColor: '#a855f7' }}>
                <Activity size={18} color="#a855f7" />
                <span className="gauge-value" style={{ color: '#a855f7' }}>75%</span>
              </div>
            </div>
            <span className="gauge-label">RAM / SWAP MEMORY</span>
          </div>

          {/* 100% Energy Arc Reactor Dial */}
          <div className="circular-gauge-card">
            <div className="gauge-circle-outer" style={{ borderColor: '#00ff66' }}>
              <div className="gauge-circle-inner" style={{ borderColor: '#00ff66' }}>
                <Zap size={18} color="#00ff66" />
                <span className="gauge-value" style={{ color: '#00ff66' }}>100%</span>
              </div>
            </div>
            <span className="gauge-label">SIGMA ENERGY CORE</span>
          </div>

          {/* Disk Storage Circular Gauge */}
          <div className="circular-gauge-card">
            <div className="gauge-circle-outer" style={{ borderColor: '#ffb703' }}>
              <div className="gauge-circle-inner" style={{ borderColor: '#ffb703' }}>
                <HardDrive size={18} color="#ffb703" />
                <span className="gauge-value" style={{ color: '#ffb703', fontSize: '0.85rem' }}>100GB</span>
              </div>
            </div>
            <span className="gauge-label">STORAGE DISK FREE</span>
          </div>

          {/* SIGMA EXPO Watermark Badge */}
          <div style={{ padding: '0.6rem', background: 'rgba(0,240,255,0.03)', border: '1px dashed var(--border-hud)', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Orbitron', fontSize: '0.7rem', color: '#00f0ff', letterSpacing: '2px', fontWeight: 'bold' }}>
              SIGMA EXPO 2026
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>
              BOSS KARTHIK COMMAND CORE
            </div>
          </div>
        </aside>

        {/* Center Stage: Arc Reactor Visualizer + ChatGPT Stream */}
        <section className="center-arc-stage">
          {/* Rotating Holographic Arc Reactor Core */}
          <div className="arc-reactor-card">
            <ArcReactorVisualizer
              state={appState}
              activeGesture={activeGesture}
              handPos={handPos}
            />
          </div>

          {/* ChatGPT Stream Console */}
          <ChatGPTConsole
            messages={messages}
            interimTranscript={interimTranscript}
            onSendMessage={handleSendMessage}
          />

          {/* Floating Bottom Prompt Bar */}
          <form onSubmit={handleSubmit} className="bottom-prompt-stark">
            <button
              type="button"
              className={`btn-stark-icon ${isHandsFree ? 'active' : ''}`}
              onClick={handleStartWednesday}
              title={isHandsFree ? 'Hands-Free Voice ON' : 'Start Hands-Free Voice'}
            >
              <Sparkles size={16} />
            </button>

            <button
              type="button"
              className={`btn-stark-icon ${isListening ? 'active' : ''}`}
              onClick={handleToggleListening}
              title={isListening ? 'Stop Listening' : 'Talk Microphone'}
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>

            <input
              type="text"
              className="input-stark"
              placeholder="Ask Wednesday anything, Boss Karthik..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />

            <button
              type="button"
              className={`btn-stark-icon ${drawerTab === 'gestures' && isDrawerOpen ? 'active' : ''}`}
              onClick={() => {
                soundFx.playClick();
                setDrawerTab('gestures');
                setIsDrawerOpen(true);
              }}
              title="Hand Gesture Camera AI"
            >
              <Hand size={16} />
            </button>

            <button type="submit" className="btn-stark-submit">
              <Send size={14} /> Send
            </button>
          </form>
        </section>

        {/* Right Column: Weather Forecast & Audio Waveform Telemetry */}
        <aside className="telemetry-column-right">
          {/* Universal Galaxy & Earth Status Telemetry Radar */}
          <div className="circular-gauge-card" style={{ alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem', width: '100%' }}>
              <Globe size={22} color="#00f0ff" />
              <div>
                <div style={{ fontFamily: 'Orbitron', fontSize: '0.85rem', color: '#00f0ff', fontWeight: 'bold' }}>GALAXY RADAR CORE</div>
                <div style={{ fontSize: '0.65rem', color: '#00ff66' }}>● SATELLITES 100% ONLINE</div>
              </div>
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              Space Weather: Solar Flux 142 • Kp=1 (Quiet)<br />
              Orbital Sync: ISS & James Webb L2 Streams Active
            </div>
          </div>

          {/* Live Weather Forecast Widget */}
          <div className="circular-gauge-card" style={{ alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem', width: '100%' }}>
              <CloudSun size={24} color="#00f0ff" />
              <div>
                <div style={{ fontFamily: 'Orbitron', fontSize: '1rem', color: '#00f0ff', fontWeight: 'bold' }}>13°C</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Global Weather Sync</div>
              </div>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', lineHeight: '1.4' }}>
              Humidity: 77% • Wind: 3 km/h • Sunset: 10:18 PM
            </div>
          </div>

          {/* Telemetry Hardware Metrics Card */}
          <TelemetryPanel
            soundMuted={soundMuted}
            onToggleSound={handleToggleSound}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        </aside>
      </main>

      {/* Retractable Glass Side Drawer */}
      <aside className={`stark-drawer ${isDrawerOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.6rem', borderBottom: '1px solid var(--border-hud)' }}>
          <span style={{ fontFamily: 'Orbitron', fontSize: '0.85rem', color: '#00f0ff', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Sparkles size={16} /> SIGMA Subsystem Drawer
          </span>
          <button onClick={() => setIsDrawerOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        {/* Side Drawer Tabs */}
        <div style={{ display: 'flex', gap: '0.3rem', overflowX: 'auto', paddingBottom: '0.3rem' }}>
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
            <BrainCircuit size={13} /> Auto ML
          </button>
        </div>

        {/* Drawer Content */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {drawerTab === 'gestures' && <HandGesturePanel onGestureDetected={handleGestureDetected} />}
          {drawerTab === 'custom_voice' && <CustomVoiceStudio />}
          {drawerTab === 'tools' && <AgentTools onRunCommand={handleSendMessage} />}
          {drawerTab === 'files' && <FileSystemPanel />}
          {drawerTab === 'trainer' && <TrainingPanel />}
        </div>
      </aside>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
