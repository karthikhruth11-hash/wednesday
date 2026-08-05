import React, { useState, useEffect, useCallback, useRef } from 'react';
import './styles/hud.css';
import ArcReactorVisualizer from './components/ArcReactorVisualizer';
import AgentTools from './components/AgentTools';
import FileSystemPanel from './components/FileSystemPanel';
import TrainingPanel from './components/TrainingPanel';
import HandGesturePanel from './components/HandGesturePanel';
import CustomVoiceStudio from './components/CustomVoiceStudio';
import TelemetryPanel from './components/TelemetryPanel';
import ChatGPTConsole from './components/ChatGPTConsole';
import SettingsModal from './components/SettingsModal';
import TerminalModal from './components/TerminalModal';
import CalculatorModal from './components/CalculatorModal';

import { speechEngine } from './services/speech';
import { soundFx } from './services/soundFx';
import { aiAgent } from './services/aiAgent';
import { systemApi } from './services/systemApi';
import {
  Sparkles, Folder, BrainCircuit, Mic, MicOff,
  Send, Menu, Globe, Search, Settings, User, MessageSquare, Activity,
  Terminal, Cpu
} from 'lucide-react';

export default function App() {
  const [appState, setAppState] = useState('idle'); // 'idle', 'listening', 'processing', 'speaking'
  const [isListening, setIsListening] = useState(false);
  const [isHandsFree, setIsHandsFree] = useState(false);
  const [inputText, setInputText] = useState('');
  const [searchBarInput, setSearchBarInput] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [currentMicLang, setCurrentMicLang] = useState(speechEngine.getRecognitionLanguage());
  const [activeGesture, setActiveGesture] = useState(null);
  const [handPos, setHandPos] = useState(null);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState('aichat'); // 'dashboard', 'aichat', 'voice', 'memory', 'files', 'browser', 'settings'
  const [personaMode, setPersonaMode] = useState(localStorage.getItem('wednesday_persona_mode') || 'jarvis');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  useEffect(() => {
    systemApi.onOpenTerminal = () => setIsTerminalOpen(true);
    systemApi.onOpenCalculator = () => setIsCalculatorOpen(true);
  }, []);

  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: "Hello, I'm Wednesday. Welcome, Boss Karthik! ✨ GALAXY CORE active.",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);

  const handleStartWednesday = useCallback(() => {
    soundFx.playListeningChime();
    setIsHandsFree(prev => {
      const nextHandsFree = !prev;
      speechEngine.setContinuousVoiceMode(nextHandsFree);

      if (nextHandsFree) {
        const greeting = "Hello, I'm Wednesday. Welcome, Boss Karthik! ✨ GALAXY CORE active. How can I help you? ⚡";

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
  }, []);

  const handleSendMessage = useCallback(async (text) => {
    if (!text.trim()) return;

    const trimmed = text.trim();
    const clean = trimmed.toLowerCase().replace(/[^a-z0-9\s]/gi, '').trim();

    // 1. Flexible Voice Interception: Stop Speech ("Hey, stop.", "stop speaking", "wednesday stop", etc.)
    const isStopSpeech = (
      clean === 'stop' || clean === 'hey stop' || clean === 'wednesday stop' ||
      clean === 'please stop' || clean === 'stop please' || clean === 'stop speaking' ||
      clean === 'hey stop speaking' || clean === 'stop talking' || clean === 'be quiet' ||
      clean === 'shut up' || clean === 'pause' || clean === 'quiet' || clean === 'silence' ||
      clean === 'mute' ||
      /^(hey\s+|please\s+|wednesday\s+)?(stop|pause|quiet|shut\s*up|silence|mute)(\s+speaking|\s+talking|\s+now|\s+wednesday)?$/i.test(clean)
    );

    if (isStopSpeech) {
      speechEngine.stopSpeaking();
      setAppState('idle');
      setInterimTranscript('');
      soundFx.playClick();
      return;
    }

    // 2. Voice Interception: Pause Microphone
    const isStopMic = (
      clean === 'stop listening' || clean === 'mute mic' || clean === 'turn off mic' ||
      clean === 'stop mic' || clean === 'pause listening' ||
      /^(hey\s+|please\s+|wednesday\s+)?(stop\s+listening|mute\s+mic|turn\s+off\s+mic|pause\s+listening)$/i.test(clean)
    );

    if (isStopMic) {
      speechEngine.stopSpeaking();
      speechEngine.stopListening();
      speechEngine.setContinuousVoiceMode(false);
      setIsHandsFree(false);
      setIsListening(false);
      setAppState('idle');
      setInterimTranscript('');
      soundFx.playClick();
      return;
    }

    // 3. Voice Interception: Clear Chat
    if (clean === 'clear chat' || clean === 'clear history' || clean === 'clean chat' || clean === 'delete messages' || clean === 'clear') {
      speechEngine.stopSpeaking();
      setMessages([
        {
          sender: 'assistant',
          text: "Chat history cleared, Boss Karthik! ✨ Standing by.",
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
      setInputText('');
      setInterimTranscript('');
      soundFx.playClick();
      return;
    }

    const userMsg = {
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setAppState('processing');

    const res = await aiAgent.processQuery(trimmed, personaMode);

    soundFx.playResponseReady();

    const assistantMsg = {
      sender: 'assistant',
      text: res.reply,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, assistantMsg]);

    speechEngine.speak(
      res.spokenReply || res.reply,
      () => setAppState('speaking'),
      () => setAppState('idle'),
      res.speakLang
    );
  }, [personaMode]);

  const lastGestureActionTimeRef = useRef(0);

  // Hand Gesture Action Dispatcher
  const handleGestureDetected = useCallback((data) => {
    if (!data) return;
    const gesture = typeof data === 'object' ? data.gesture : data;
    const isNewGesture = typeof data === 'object' ? data.isNewGesture : true;

    if (typeof data === 'object' && data.handPos) {
      setHandPos(data.handPos);
    }

    if (isNewGesture && gesture && gesture !== 'TRACKING') {
      setActiveGesture(gesture);
      setTimeout(() => setActiveGesture(null), 1500);

      const now = Date.now();
      if (now - lastGestureActionTimeRef.current > 1500) {
        lastGestureActionTimeRef.current = now;

        if (gesture === 'CLOSED_FIST') {
          speechEngine.stopListening();
          setIsListening(false);
          setAppState('idle');
          soundFx.playClick();
        } else if (gesture === 'THUMBS_UP') {
          handleSendMessage('Awesome job Wednesday!');
        } else if (gesture === 'PINCH_OK') {
          handleStartWednesday();
        }
      }
    }
  }, [handleStartWednesday, handleSendMessage]);

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
        handleSendMessage(cleaned);
      }
    };

    speechEngine.onError = () => {
      setIsListening(false);
      setAppState('idle');
      soundFx.playErrorSound();
    };
  }, [appState, handleStartWednesday, handleSendMessage]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    soundFx.playClick();
    handleSendMessage(inputText);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchBarInput.trim()) return;
    soundFx.playClick();
    systemApi.openUrl(`https://www.google.com/search?q=${encodeURIComponent(searchBarInput)}`);
    setSearchBarInput('');
  };

  const centerStageRef = useRef(null);

  const scrollToTop = () => {
    soundFx.playClick();
    centerStageRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    soundFx.playClick();
    centerStageRef.current?.scrollTo({ top: centerStageRef.current.scrollHeight, behavior: 'smooth' });
  };

  return (
    <div className="ascii-app-container" style={{ position: 'relative' }}>
      {/* ✨ FULLSCREEN COSMIC GALAXY ARC REACTOR BACKDROP ✨ */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, opacity: 0.95, pointerEvents: 'none' }}>
        <ArcReactorVisualizer
          state={appState}
          activeGesture={activeGesture}
          handPos={handPos}
        />
      </div>

      {/* Top Header Bar */}
      <header className="ascii-top-header" style={{ position: 'relative', zIndex: 100 }}>
        <div className="top-brand-group">
          <button className="dock-icon-btn" onClick={() => setIsSidebarCollapsed(prev => !prev)} title="Toggle Sidebar">
            <Menu size={18} />
          </button>
          <div className="top-brand-title" style={{ cursor: 'pointer' }} onClick={() => setActiveNav('aichat')}>
            <Sparkles size={20} color="#00f0ff" /> Wednesday AI
          </div>
          {activeNav !== 'aichat' && (
            <button className="btn-stark-submit" onClick={() => setActiveNav('aichat')} style={{ padding: '0.3rem 0.8rem', fontSize: '0.75rem' }}>
              🔙 COME BACK TO CHAT
            </button>
          )}
        </div>

        {/* Search Bar Input */}
        <form onSubmit={handleSearchSubmit} className="top-search-input-box">
          <Search size={14} color="#00f0ff" />
          <input
            type="text"
            placeholder="Search..."
            value={searchBarInput}
            onChange={(e) => setSearchBarInput(e.target.value)}
            style={{ background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '0.8rem', width: '100%' }}
          />
        </form>

        {/* Quick Action Buttons & Settings & User Profile Badge */}
        <div className="top-actions-group">
          <button className="dock-icon-btn" onClick={() => setIsTerminalOpen(true)} title="Open Terminal / CMD">
            <Terminal size={18} color="#00f0ff" />
          </button>
          <button className="dock-icon-btn" onClick={() => setIsCalculatorOpen(true)} title="Open Calculator">
            <Cpu size={18} color="#00f0ff" />
          </button>
          <button className="dock-icon-btn" onClick={() => setIsSettingsOpen(true)} title="Settings">
            <Settings size={18} />
          </button>

          <div className="user-profile-badge">
            <User size={16} color="#00f0ff" />
            <span>Boss Karthik</span>
          </div>
        </div>
      </header>

      {/* Main Body: Left Sidebar + Center Stage */}
      <main className="ascii-main-body" style={{ position: 'relative', zIndex: 10 }}>
        {/* Left Sidebar Navigation Menu */}
        <aside className={`ascii-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
          <button className={`nav-item-btn ${activeNav === 'aichat' ? 'active' : ''}`} onClick={() => setActiveNav('aichat')} style={{ background: activeNav !== 'aichat' ? 'rgba(0,240,255,0.08)' : undefined }}>
            <Sparkles size={18} color="#00f0ff" /> {!isSidebarCollapsed && '🔙 COME BACK TO CHAT'}
          </button>

          <button className={`nav-item-btn ${activeNav === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveNav('dashboard')}>
            <Activity size={18} /> {!isSidebarCollapsed && 'Dashboard'}
          </button>

          <button className={`nav-item-btn ${activeNav === 'aichat' ? 'active' : ''}`} onClick={() => setActiveNav('aichat')}>
            <MessageSquare size={18} /> {!isSidebarCollapsed && 'AI Chat'}
          </button>

          <button className={`nav-item-btn ${activeNav === 'voice' ? 'active' : ''}`} onClick={() => setActiveNav('voice')}>
            <Mic size={18} /> {!isSidebarCollapsed && 'Voice'}
          </button>

          <button className={`nav-item-btn ${activeNav === 'memory' ? 'active' : ''}`} onClick={() => setActiveNav('memory')}>
            <BrainCircuit size={18} /> {!isSidebarCollapsed && 'Memory'}
          </button>

          <button className={`nav-item-btn ${activeNav === 'files' ? 'active' : ''}`} onClick={() => setActiveNav('files')}>
            <Folder size={18} /> {!isSidebarCollapsed && 'Files'}
          </button>

          <button className={`nav-item-btn ${activeNav === 'browser' ? 'active' : ''}`} onClick={() => setActiveNav('browser')}>
            <Globe size={18} /> {!isSidebarCollapsed && 'Browser'}
          </button>

          <button className={`nav-item-btn ${activeNav === 'settings' ? 'active' : ''}`} onClick={() => setIsSettingsOpen(true)}>
            <Settings size={18} /> {!isSidebarCollapsed && 'Settings'}
          </button>
        </aside>

        {/* Center Main Stage with Full Top-to-Bottom Scrolling */}
        <section className="ascii-center-stage" ref={centerStageRef}>
          {/* Floating Scroll Controls */}
          <div style={{ position: 'fixed', right: '25px', top: '70px', zIndex: 120, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <button className="btn-stark-submit" onClick={scrollToTop} style={{ padding: '0.35rem 0.75rem', fontSize: '0.72rem', borderRadius: '16px' }} title="Scroll to Top">
              🔝 TOP
            </button>
            <button className="btn-stark-submit" onClick={scrollToBottom} style={{ padding: '0.35rem 0.75rem', fontSize: '0.72rem', borderRadius: '16px' }} title="Scroll to Bottom">
              ⬇️ BOTTOM
            </button>
          </div>
          {activeNav === 'aichat' && (
            <ChatGPTConsole
              messages={messages}
              interimTranscript={interimTranscript}
              onSendMessage={handleSendMessage}
            />
          )}

          {activeNav === 'dashboard' && <TelemetryPanel soundMuted={false} onToggleSound={() => {}} onOpenSettings={() => setIsSettingsOpen(true)} />}
          {activeNav === 'voice' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <CustomVoiceStudio />
              <HandGesturePanel onGestureDetected={handleGestureDetected} />
            </div>
          )}
          {activeNav === 'memory' && <TrainingPanel />}
          {activeNav === 'files' && <FileSystemPanel />}
          {activeNav === 'browser' && <AgentTools onRunCommand={handleSendMessage} />}
        </section>
      </main>

      {/* Bottom Full-Width Prompt Pill Bar */}
      <form onSubmit={handleSubmit} className="ascii-bottom-bar">
        <input
          type="text"
          className="input-prompt-full"
          placeholder="💬 Ask anything..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />

        {appState === 'speaking' && (
          <button
            type="button"
            className="btn-prompt-icon"
            style={{ background: '#ff0055', color: '#fff', border: '1px solid #ff0055', cursor: 'pointer' }}
            onClick={() => {
              speechEngine.stopSpeaking();
              setAppState('idle');
            }}
            title="Stop Assistant Speaking"
          >
            ⏹️ Stop
          </button>
        )}

        <button
          type="button"
          className={`btn-prompt-icon ${isHandsFree ? 'active' : ''}`}
          onClick={handleStartWednesday}
          title={isHandsFree ? 'Hands-Free Voice ON' : 'Start Hands-Free Voice'}
        >
          <Sparkles size={18} />
        </button>

        <button
          type="button"
          className={`btn-prompt-icon ${isListening ? 'active' : ''}`}
          onClick={() => {
            if (isListening) speechEngine.stopListening();
            else speechEngine.startListening();
          }}
          title={isListening ? 'Stop Listening' : 'Talk Microphone'}
        >
          {isListening ? <MicOff size={18} /> : <Mic size={18} />}
        </button>

        <select
          value={currentMicLang}
          onChange={(e) => {
            const newLang = e.target.value;
            setCurrentMicLang(newLang);
            speechEngine.setRecognitionLanguage(newLang);
          }}
          title="Select Spoken Voice Language"
          style={{
            background: 'rgba(0, 240, 255, 0.12)',
            color: '#00f0ff',
            border: '1px solid rgba(0, 240, 255, 0.4)',
            borderRadius: '16px',
            padding: '0.2rem 0.5rem',
            fontSize: '0.75rem',
            fontFamily: 'Orbitron, sans-serif',
            cursor: 'pointer',
            outline: 'none'
          }}
        >
          <option value="te-IN">🇮🇳 Telugu (తెలుగు)</option>
          <option value="hi-IN">🇮🇳 Hindi (हिंदी)</option>
          <option value="ta-IN">🇮🇳 Tamil (தமிழ்)</option>
          <option value="kn-IN">🇮🇳 Kannada (కన్నడ)</option>
          <option value="ml-IN">🇮🇳 Malayalam (മലയാളం)</option>
          <option value="mr-IN">🇮🇳 Marathi (మరాఠీ)</option>
          <option value="bn-IN">🇮🇳 Bengali (బెంగాలీ)</option>
          <option value="en-US">🇺🇸 English (US)</option>
          <option value="en-IN">🇮🇳 English (IN)</option>
          <option value="es-ES">🇪🇸 Spanish</option>
          <option value="fr-FR">🇫🇷 French</option>
          <option value="de-DE">🇩🇪 German</option>
          <option value="ja-JP">🇯🇵 Japanese</option>
          <option value="ko-KR">🇰🇷 Korean</option>
          <option value="zh-CN">🇨🇳 Chinese</option>
          <option value="ar-SA">🇸🇦 Arabic</option>
          <option value="ru-RU">🇷🇺 Russian</option>
        </select>

        <button type="submit" className="btn-prompt-submit">
          <Send size={14} /> Send
        </button>
      </form>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onPersonaChange={(mode) => setPersonaMode(mode)}
      />

      <TerminalModal
        isOpen={isTerminalOpen}
        onClose={() => setIsTerminalOpen(false)}
        onOpenCalculator={() => setIsCalculatorOpen(true)}
      />

      <CalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />
    </div>
  );
}
