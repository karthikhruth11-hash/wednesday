import React, { useState, useEffect, useCallback } from 'react';
import './styles/hud.css';
import ArcReactorVisualizer from './components/ArcReactorVisualizer';
import TelemetryPanel from './components/TelemetryPanel';
import AgentTools from './components/AgentTools';
import FileSystemPanel from './components/FileSystemPanel';
import TrainingPanel from './components/TrainingPanel';
import HandGesturePanel from './components/HandGesturePanel';
import CustomVoiceStudio from './components/CustomVoiceStudio';
import CosmicKnowledgePanel from './components/CosmicKnowledgePanel';
import ChatGPTConsole from './components/ChatGPTConsole';
import SettingsModal from './components/SettingsModal';

import { speechEngine } from './services/speech';
import { soundFx } from './services/soundFx';
import { aiAgent } from './services/aiAgent';
import { systemApi } from './services/systemApi';
import {
  Sparkles, Folder, Terminal, BrainCircuit, Hand, Mic, MicOff,
  Send, Menu, X, Code, Activity, CloudSun, Globe,
  Atom, Search, BatteryCharging, Gauge, Compass, Video, Tv
} from 'lucide-react';

export default function App() {
  const [appState, setAppState] = useState('idle'); // 'idle', 'listening', 'processing', 'speaking'
  const [soundMuted, setSoundMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isHandsFree, setIsHandsFree] = useState(false);
  const [inputText, setInputText] = useState('');
  const [searchBarInput, setSearchBarInput] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [activeGesture, setActiveGesture] = useState(null);
  const [handPos, setHandPos] = useState(null);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState('gestures');
  const [personaMode, setPersonaMode] = useState(localStorage.getItem('wednesday_persona_mode') || 'jarvis');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Natural Human Voice Selector State
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState('');

  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: "Welcome, our Boss Karthik! W.E.D.N.E.S.D.A.Y. SIGMA Arc Reactor core online and ready for your command.",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);

  useEffect(() => {
    const voices = speechEngine.getAvailableVoices();
    setAvailableVoices(voices);
    if (speechEngine.selectedVoice) {
      setSelectedVoiceName(speechEngine.selectedVoice.name);
    }
  }, []);

  const handleVoiceChange = (e) => {
    const vName = e.target.value;
    setSelectedVoiceName(vName);
    speechEngine.setSelectedVoice(vName);
    soundFx.playClick();
  };

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

  const handleTopSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchBarInput.trim()) return;
    soundFx.playClick();
    systemApi.openUrl(`https://www.google.com/search?q=${encodeURIComponent(searchBarInput)}`);
    setSearchBarInput('');
  };

  const handleDriveClick = (driveLetter) => {
    soundFx.playClick();
    systemApi.launchApp('explorer');
    handleSendMessage(`Open Disk Drive ${driveLetter}`);
  };

  const handleAppDockClick = (appName, url) => {
    soundFx.playClick();
    if (url) systemApi.openUrl(url);
    else systemApi.launchApp(appName);
  };

  return (
    <div className="jarvis-workspace">
      {/* 1-to-1 Top Header Bar */}
      <header className="jarvis-top-header">
        <div className="top-atom-badge">
          <Atom size={20} color="#00f0ff" />
          <div style={{ fontSize: '0.75rem', fontFamily: 'Orbitron', color: '#00f0ff' }}>
            4.5 G <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>RAM</span>
          </div>
          <BatteryCharging size={14} color="#00ff66" />
        </div>

        {/* Top Google Search Bar */}
        <form onSubmit={handleTopSearchSubmit} className="top-search-bar">
          <Search size={14} color="#00f0ff" />
          <input
            type="text"
            placeholder="Google Search..."
            value={searchBarInput}
            onChange={(e) => setSearchBarInput(e.target.value)}
            style={{ background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '0.75rem', width: '100%' }}
          />
        </form>

        {/* Top Chevron Badges Navigation */}
        <div className="top-chevron-group">
          <button className="chevron-btn active" onClick={() => handleSendMessage('Hello Wednesday')}>
            J.A.R.V.I.S
          </button>

          <button className="chevron-btn" onClick={() => { setDrawerTab('telemetry'); setIsDrawerOpen(true); }}>
            System
          </button>

          <button className="chevron-btn" onClick={() => { setDrawerTab('files'); setIsDrawerOpen(true); }}>
            OS Files
          </button>

          <button className="chevron-btn" onClick={() => { setDrawerTab('trainer'); setIsDrawerOpen(true); }}>
            Backup
          </button>

          <button className="chevron-btn" onClick={() => { setDrawerTab('tools'); setIsDrawerOpen(true); }}>
            Downloads
          </button>
        </div>

        {/* Natural Human Voice Selector Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(0,0,0,0.5)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-hud)' }}>
          <Mic size={14} color="#00f0ff" />
          <select
            value={selectedVoiceName}
            onChange={handleVoiceChange}
            style={{ background: 'transparent', border: 'none', color: '#00f0ff', fontFamily: 'Orbitron', fontSize: '0.7rem', outline: 'none', cursor: 'pointer' }}
          >
            {availableVoices.map((v, i) => (
              <option key={i} value={v.name} style={{ background: '#041024', color: '#fff' }}>
                {v.name} ({v.lang})
              </option>
            ))}
          </select>
        </div>

        {/* Top Speedometer Gauge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', fontFamily: 'Orbitron', color: '#00f0ff' }}>
            <Gauge size={16} color="#00f0ff" /> 00100 KM/H
          </div>

          <button className={`btn-start-wednesday ${isHandsFree ? 'active' : ''}`} onClick={handleStartWednesday} style={{ fontSize: '0.72rem', padding: '0.3rem 0.8rem', borderRadius: '20px' }}>
            ⚡ {isHandsFree ? 'VOICE ON' : 'START WEDNESDAY'}
          </button>

          <button className="dock-icon-btn" onClick={() => setIsDrawerOpen(prev => !prev)} title="Toggle Subsystem Drawer">
            <Menu size={16} />
          </button>
        </div>
      </header>

      {/* Main 3-Column Body */}
      <main className="jarvis-main-body">
        {/* Left Column: Telemetry & Interactive Drive Cards */}
        <aside className="left-panel-jarvis">
          {/* CPU & Memory Telemetry Graph Box */}
          <div className="hud-box-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#00f0ff', fontFamily: 'Orbitron', marginBottom: '0.4rem' }}>
              <span>CPU FREQUENCY</span>
              <span>4333 MHz</span>
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>
              LAN IP: 192.168.100.100 • OS: Windows 11 x64
            </div>
          </div>

          {/* Interactive Drive Status Cards */}
          <div className="drive-card" onClick={() => handleDriveClick('D')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 'bold', color: '#fff' }}>
              <span>DRIVE D:\ (223.2 GB)</span>
              <span style={{ color: '#00f0ff' }}>63% USED</span>
            </div>
            <div className="drive-progress-bar">
              <div className="drive-progress-fill" style={{ width: '63%' }} />
            </div>
          </div>

          <div className="drive-card" onClick={() => handleDriveClick('E')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 'bold', color: '#fff' }}>
              <span>DRIVE E:\ (184.8 GB)</span>
              <span style={{ color: '#00f0ff' }}>47% USED</span>
            </div>
            <div className="drive-progress-bar">
              <div className="drive-progress-fill" style={{ width: '47%' }} />
            </div>
          </div>

          <div className="drive-card" onClick={() => handleDriveClick('F')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 'bold', color: '#fff' }}>
              <span>DRIVE F:\ (321.5 GB)</span>
              <span style={{ color: '#00f0ff' }}>35% USED</span>
            </div>
            <div className="drive-progress-bar">
              <div className="drive-progress-fill" style={{ width: '35%' }} />
            </div>
          </div>

          {/* Vertical Social & App Dock */}
          <div className="app-dock-vertical">
            <button className="dock-icon-btn" onClick={() => handleAppDockClick('youtube', 'https://youtube.com')} title="Open YouTube">
              <Video size={16} />
            </button>
            <button className="dock-icon-btn" onClick={() => handleAppDockClick('google', 'https://google.com')} title="Open Google">
              <Globe size={16} />
            </button>
            <button className="dock-icon-btn" onClick={() => handleAppDockClick('facebook', 'https://facebook.com')} title="Open Facebook">
              <Tv size={16} />
            </button>
            <button className="dock-icon-btn" onClick={() => handleAppDockClick('notepad')} title="Open Notepad">
              <Code size={16} />
            </button>
            <button className="dock-icon-btn" onClick={() => handleAppDockClick('calculator')} title="Open Calculator">
              <Activity size={16} />
            </button>
          </div>

          {/* Radar & Status Badge */}
          <div style={{ padding: '0.5rem', background: 'rgba(0,240,255,0.03)', border: '1px dashed var(--border-hud)', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Compass size={20} color="#00f0ff" style={{ animation: 'spin 10s linear infinite' }} />
            <div>
              <div style={{ fontFamily: 'Orbitron', fontSize: '0.7rem', color: '#00f0ff', fontWeight: 'bold' }}>
                ADVENTURE RADAR 11/55
              </div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-dim)' }}>
                Boss Karthik Command Core
              </div>
            </div>
          </div>
        </aside>

        {/* Center Stage: Hazard Arc Reactor Eye Hub + ChatGPT Stream */}
        <section className="center-stage-jarvis">
          {/* Hazard Arc Reactor Eye Core Visualizer */}
          <div className="arc-reactor-eye-box">
            <ArcReactorVisualizer
              state={appState}
              activeGesture={activeGesture}
              handPos={handPos}
            />
          </div>

          {/* Floating ChatGPT Stream Console */}
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

        {/* Right Column: Weather 6°C, Calendar May 2014, Network Monitor */}
        <aside className="right-panel-jarvis">
          {/* Weather 6°C Card */}
          <div className="hud-box-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
              <CloudSun size={24} color="#00f0ff" />
              <div>
                <div style={{ fontFamily: 'Orbitron', fontSize: '1.1rem', color: '#00f0ff', fontWeight: 'bold' }}>6°C</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Rain Shower / Windy</div>
              </div>
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', lineHeight: '1.4' }}>
              Humidity: 100% • Visibility: 11.5 km • Sunrise: 5:45 AM • Sunset: 8:59 PM
            </div>
          </div>

          {/* Calendar Widget (May 2014) & CPU Dial */}
          <div className="hud-box-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontFamily: 'Orbitron', fontSize: '0.8rem', color: '#00f0ff', fontWeight: 'bold' }}>MAY 2026</div>
              <div style={{ fontSize: '0.65rem', color: '#00ff66', fontFamily: 'Orbitron' }}>CPU 14%</div>
            </div>

            <div className="calendar-grid-hud">
              <div>SU</div><div>MO</div><div>TU</div><div>WE</div><div>TH</div><div>FR</div><div>SA</div>
              <div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div><div>7</div>
              <div>8</div><div>9</div><div>10</div><div>11</div><div>12</div><div>13</div><div>14</div>
              <div>15</div><div>16</div><div>17</div><div>18</div><div>19</div><div>20</div><div>21</div>
              <div>22</div><div>23</div><div>24</div><div>25</div><div className="today">26</div><div>27</div><div>28</div>
            </div>
          </div>

          {/* Network & IP Monitor Card */}
          <div className="hud-box-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#00f0ff', fontFamily: 'Orbitron', marginBottom: '0.3rem' }}>
              <span>NETWORK TRAFFIC</span>
              <span style={{ color: '#00ff66' }}>30% CAPACITY</span>
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              IP: 192.168.100.100 • LAN: Active<br />
              ⬇️ DOWNLOAD: 2.3 KB/s • ⬆️ UPLOAD: 1.5 KB/s
            </div>
          </div>

          {/* Telemetry Component */}
          <TelemetryPanel
            soundMuted={soundMuted}
            onToggleSound={handleToggleSound}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        </aside>
      </main>

      {/* Bottom System Usage Bar */}
      <footer className="bottom-system-bar">
        <div>SYSTEM STATUS: OPTIMAL</div>
        <div>D:/ 309.8 M Used • C:/ 118.7 G Used</div>
        <div>BOSS KARTHIK OMNI CORE</div>
      </footer>

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
          <button className={`drawer-tab-btn ${drawerTab === 'cosmic' ? 'active' : ''}`} onClick={() => setDrawerTab('cosmic')}>
            <Globe size={13} /> Cosmic Core
          </button>
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
          {drawerTab === 'cosmic' && <CosmicKnowledgePanel />}
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
