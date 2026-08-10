import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import ChatGPTConsole from './components/ChatGPTConsole';
import AgentTools from './components/AgentTools';
import FileSystemPanel from './components/FileSystemPanel';
import TrainingPanel from './components/TrainingPanel';
import CustomVoiceStudio from './components/CustomVoiceStudio';
import TelemetryPanel from './components/TelemetryPanel';
import SettingsModal from './components/SettingsModal';
import TerminalModal from './components/TerminalModal';
import CalculatorModal from './components/CalculatorModal';

import { speechEngine } from './services/speech';
import { soundFx } from './services/soundFx';
import { aiAgent } from './services/aiAgent';
import { systemApi } from './services/systemApi';
import { sessionManager } from './services/sessionManager';

export default function App() {
  const [appState, setAppState] = useState('idle'); // 'idle', 'listening', 'processing', 'speaking'
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [activeNav, setActiveNav] = useState('chat'); // 'chat', 'dashboard', 'voice', 'memory', 'files', 'browser', 'settings'
  const [personaMode, setPersonaMode] = useState(localStorage.getItem('wednesday_persona_mode') || 'jarvis');

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  const [activeSession, setActiveSession] = useState(null);
  const [groupedSessions, setGroupedSessions] = useState({ pinned: [], today: [], yesterday: [], past7Days: [], older: [] });

  // Initialize SessionManager
  const reloadSessions = useCallback(() => {
    const current = sessionManager.getActiveSession();
    setActiveSession(current ? { ...current } : null);
    setGroupedSessions(sessionManager.getGroupedSessions(searchQuery));
  }, [searchQuery]);

  useEffect(() => {
    const initSessions = async () => {
      await sessionManager.init();
      reloadSessions();
    };
    initSessions();

    systemApi.onOpenTerminal = () => setIsTerminalOpen(true);
    systemApi.onOpenCalculator = () => setIsCalculatorOpen(true);
  }, [reloadSessions]);

  useEffect(() => {
    reloadSessions();
  }, [searchQuery, reloadSessions]);

  // Speech engine listener callbacks
  useEffect(() => {
    speechEngine.onStateChange = (state) => setAppState(state);

    speechEngine.onResult = (transcript, isFinal) => {
      if (isFinal) {
        setInterimTranscript('');
        handleSendMessage(transcript);
      } else {
        setInterimTranscript(transcript);
      }
    };

    speechEngine.onSpeechStart = () => soundFx.playBeep();
    speechEngine.onSpeechEnd = () => soundFx.playSuccess();
  }, []);

  const handleSendMessage = async (text) => {
    if (!text || !text.trim() || appState === 'processing') return;

    soundFx.playSend();
    setAppState('processing');

    try {
      const currentSession = sessionManager.getActiveSession();
      if (!currentSession) {
        await sessionManager.createNewSession(text);
      }

      const res = await aiAgent.processQuery(text, personaMode);

      if (res && res.reply) {
        await sessionManager.addTurnToActiveSession(text, res.reply);
        reloadSessions();

        const ttsEnabled = localStorage.getItem('wednesday_tts_enabled') !== 'false';
        if (ttsEnabled) {
          speechEngine.speak(res.reply);
        } else {
          setAppState('idle');
        }
      } else {
        setAppState('idle');
      }
    } catch (e) {
      console.error("Query processing error:", e);
      setAppState('idle');
    }
  };

  const handleNewChat = async () => {
    soundFx.playClick();
    await sessionManager.createNewSession();
    reloadSessions();
    setActiveNav('chat');
  };

  const handleSelectSession = async (id) => {
    soundFx.playClick();
    await sessionManager.setActiveSession(id);
    reloadSessions();
    setActiveNav('chat');
  };

  const handleRenameSession = async (id, newTitle) => {
    await sessionManager.renameSession(id, newTitle);
    reloadSessions();
  };

  const handleDeleteSession = async (id) => {
    soundFx.playClick();
    await sessionManager.deleteSession(id);
    reloadSessions();
  };

  const handleTogglePinSession = async (id) => {
    await sessionManager.togglePinSession(id);
    reloadSessions();
  };

  const handleToggleVoiceListening = () => {
    if (isListening) {
      speechEngine.stopListening();
      setIsListening(false);
    } else {
      speechEngine.startListening();
      setIsListening(true);
    }
  };

  const handleSelectNav = (nav) => {
    soundFx.playClick();
    if (nav === 'settings') {
      setIsSettingsOpen(true);
    } else {
      setActiveNav(nav);
    }
  };

  return (
    <div className="professional-app-root">
      {/* Professional Collapsible Sidebar */}
      <Sidebar
        groupedSessions={groupedSessions}
        activeSessionId={activeSession?.id}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onRenameSession={handleRenameSession}
        onDeleteSession={handleDeleteSession}
        onTogglePinSession={handleTogglePinSession}
        collapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        activeNav={activeNav}
        onSelectNav={handleSelectNav}
      />

      {/* Main Workspace Stage */}
      <main className="professional-main-stage">
        {activeNav === 'chat' && (
          <ChatGPTConsole
            activeSession={activeSession}
            messages={activeSession ? activeSession.messages : []}
            interimTranscript={interimTranscript}
            onSendMessage={handleSendMessage}
            isProcessing={appState === 'processing'}
            onStopGeneration={() => setAppState('idle')}
            isVoiceListening={isListening}
            onToggleVoiceListening={handleToggleVoiceListening}
          />
        )}

        {activeNav === 'dashboard' && <AgentTools />}
        {activeNav === 'voice' && <CustomVoiceStudio />}
        {activeNav === 'memory' && <TrainingPanel />}
        {activeNav === 'files' && <FileSystemPanel />}
        {activeNav === 'browser' && <TelemetryPanel />}
      </main>

      {/* Auxiliary Modals */}
      {isSettingsOpen && (
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          personaMode={personaMode}
          onPersonaChange={(p) => {
            setPersonaMode(p);
            localStorage.setItem('wednesday_persona_mode', p);
          }}
        />
      )}
      {isTerminalOpen && <TerminalModal isOpen={isTerminalOpen} onClose={() => setIsTerminalOpen(false)} />}
      {isCalculatorOpen && <CalculatorModal isOpen={isCalculatorOpen} onClose={() => setIsCalculatorOpen(false)} />}
    </div>
  );
}
