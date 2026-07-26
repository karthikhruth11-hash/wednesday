import React, { useState, useEffect, useCallback } from 'react';
import './styles/hud.css';
import ArcReactorVisualizer from './components/ArcReactorVisualizer';
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
import {
  Sparkles, Folder, Terminal, BrainCircuit, Hand, Mic, MicOff,
  Send, Menu, X, Globe, Atom
} from 'lucide-react';

export default function App() {
  const [appState, setAppState] = useState('idle'); // 'idle', 'listening', 'processing', 'speaking'
  const [isListening, setIsListening] = useState(false);
  const [isHandsFree, setIsHandsFree] = useState(false);
  const [inputText, setInputText] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [activeGesture, setActiveGesture] = useState(null);
  const [handPos, setHandPos] = useState(null);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState('cosmic');
  const [personaMode] = useState(localStorage.getItem('wednesday_persona_mode') || 'jarvis');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState('');

  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: "Welcome, our Boss Karthik! W.E.D.N.E.S.D.A.Y. SIGMA Galaxy Arc Reactor Core online and ready for your command.",
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
        const greeting = "Welcome, our Boss Karthik! W.E.D.N.E.S.D.A.Y. SIGMA Galaxy Arc Reactor core online. How can I assist you today, Boss? ⚡";

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

    if (gesture === 'CLOSED_FIST') {
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

  return (
    <div className="jarvis-workspace">
      {/* Top Header with Atomic Power Core & Voice Selector */}
      <header className="jarvis-top-header">
        <div className="atomic-power-badge">
          <Atom size={22} color="#00f0ff" style={{ animation: 'spin 8s linear infinite' }} />
          <span>⚛️ ATOMIC POWER CORE: 100% ONLINE</span>
        </div>

        {/* Voice Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(0,0,0,0.5)', padding: '0.3rem 0.6rem', borderRadius: '20px', border: '1px solid var(--border-hud)' }}>
          <Mic size={14} color="#00f0ff" />
          <select
            value={selectedVoiceName}
            onChange={handleVoiceChange}
            style={{ background: 'transparent', border: 'none', color: '#00f0ff', fontFamily: 'Orbitron', fontSize: '0.72rem', outline: 'none', cursor: 'pointer' }}
          >
            {availableVoices.map((v, i) => (
              <option key={i} value={v.name} style={{ background: '#041024', color: '#fff' }}>
                {v.name} ({v.lang})
              </option>
            ))}
          </select>
        </div>

        <button className={`btn-start-wednesday ${isHandsFree ? 'active' : ''}`} onClick={handleStartWednesday} style={{ fontSize: '0.75rem', padding: '0.4rem 1rem', borderRadius: '20px' }}>
          ⚡ {isHandsFree ? 'VOICE ON' : 'START WEDNESDAY'}
        </button>

        <button className="dock-icon-btn" onClick={() => setIsDrawerOpen(prev => !prev)} title="Toggle Drawer">
          <Menu size={16} />
        </button>
      </header>

      {/* Center Stage: Big Galaxy Arc Reactor Core & Chat Console */}
      <main className="jarvis-main-body">
        {/* Massive 3D Galaxy Arc Reactor Sphere */}
        <div className="big-galaxy-arc-card">
          <ArcReactorVisualizer
            state={appState}
            activeGesture={activeGesture}
            handPos={handPos}
          />
        </div>

        {/* Floating Output Console */}
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
          >
            <Sparkles size={16} />
          </button>

          <button
            type="button"
            className={`btn-stark-icon ${isListening ? 'active' : ''}`}
            onClick={() => {
              if (isListening) speechEngine.stopListening();
              else speechEngine.startListening();
            }}
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
              setDrawerTab('gestures');
              setIsDrawerOpen(true);
            }}
          >
            <Hand size={16} />
          </button>

          <button type="submit" className="btn-stark-submit">
            <Send size={14} /> Send
          </button>
        </form>
      </main>

      {/* Bottom Status Bar */}
      <footer className="bottom-system-bar">
        <div>SYSTEM STATUS: ATOMIC GALAXY ONLINE</div>
        <div>BOSS KARTHIK COMMAND CORE</div>
      </footer>

      {/* Subsystem Side Drawer */}
      <aside className={`stark-drawer ${isDrawerOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.6rem', borderBottom: '1px solid var(--border-hud)' }}>
          <span style={{ fontFamily: 'Orbitron', fontSize: '0.85rem', color: '#00f0ff', fontWeight: 'bold' }}>
            <Sparkles size={16} /> Subsystem Drawer
          </span>
          <button onClick={() => setIsDrawerOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

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
