import React, { useRef, useEffect } from 'react';
import { Mic, MicOff, Send, MessageSquare, Bot, User, Sparkles, Heart, Scale, Code } from 'lucide-react';
import { soundFx } from '../services/soundFx';

export default function ChatGPTConsole({
  messages,
  inputText,
  setInputText,
  isListening,
  isHandsFree,
  state,
  interimTranscript,
  personaMode,
  onSelectPersona,
  onSendMessage,
  onToggleListening,
  onStartWednesday
}) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, interimTranscript]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    soundFx.playClick();
    onSendMessage(inputText);
  };

  const getStatusText = () => {
    if (isHandsFree) {
      switch (state) {
        case 'listening': return '🎙️ LISTENING (HANDS-FREE VOICE)';
        case 'processing': return '🧠 THINKING...';
        case 'speaking': return '🔊 SPEAKING RESPONSE...';
        default: return '🟢 HANDS-FREE VOICE READY';
      }
    }
    switch (state) {
      case 'listening': return '🎙️ LISTENING TO YOUR VOICE...';
      case 'processing': return '🧠 CHATGPT ENGINE THINKING...';
      case 'speaking': return '🔊 SPEAKING RESPONSE...';
      default: return '🟢 PRE-TRAINED AI READY';
    }
  };

  const personaModes = [
    { id: 'jarvis', label: 'ChatGPT Omni AI', icon: Sparkles, color: '#00f0ff' },
    { id: 'girlfriend', label: 'Girlfriend Mode', icon: Heart, color: '#ff4d6d' },
    { id: 'lawyer', label: 'Lawyer & Constitution', icon: Scale, color: '#ffb703' },
    { id: 'polyglot', label: 'Coding & Languages', icon: Code, color: '#a855f7' }
  ];

  return (
    <div className="hud-card transcript-box" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header & Persona Mode Selector */}
      <div className="hud-card-header" style={{ marginBottom: '0.5rem', paddingBottom: '0.4rem', flexWrap: 'wrap', gap: '0.4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="hud-card-title">
            <MessageSquare size={16} /> Pre-Trained ChatGPT Core
          </span>
          {isHandsFree && (
            <span className="voice-mode-badge hands-free">
              <Sparkles size={12} /> HANDS-FREE VOICE
            </span>
          )}
        </div>

        {/* Quick Mode Switcher */}
        <div style={{ display: 'flex', gap: '0.3rem' }}>
          {personaModes.map((m) => {
            const Icon = m.icon;
            const isActive = personaMode === m.id;
            return (
              <button
                key={m.id}
                className={`btn-hud ${isActive ? 'active' : ''}`}
                onClick={() => { soundFx.playClick(); onSelectPersona(m.id); }}
                style={{
                  fontSize: '0.7rem',
                  padding: '0.25rem 0.5rem',
                  borderColor: isActive ? m.color : 'rgba(0,240,255,0.2)',
                  color: isActive ? '#040711' : m.color,
                  background: isActive ? m.color : 'rgba(0,0,0,0.4)'
                }}
              >
                <Icon size={12} /> {m.label}
              </button>
            );
          })}
        </div>

        <span style={{ fontSize: '0.7rem', color: state === 'listening' ? '#ff4d6d' : state === 'speaking' ? '#00f0ff' : '#00ff66', fontFamily: 'Orbitron' }}>
          {getStatusText()}
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="messages-list" style={{ flex: 1, minHeight: '220px', overflowY: 'auto', paddingRight: '0.5rem' }}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`msg-bubble ${msg.sender === 'user' ? 'msg-user' : 'msg-assistant'}`}>
            <div className="msg-meta" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              {msg.sender === 'user' ? <User size={12} /> : <Bot size={12} />}
              {msg.sender === 'user' ? 'YOU' : 'W.E.D.N.E.S.D.A.Y.'} • {msg.timestamp}
            </div>
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{msg.text}</div>
          </div>
        ))}

        {interimTranscript && (
          <div className="msg-bubble msg-user" style={{ opacity: 0.8, fontStyle: 'italic', background: 'rgba(255, 77, 109, 0.2)', border: '1px solid #ff4d6d' }}>
            <div className="msg-meta">SPEAKING NOW...</div>
            {interimTranscript}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Instant ChatGPT Prompt Suggestions */}
      <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', padding: '0.4rem 0', borderTop: '1px dashed var(--border-hud)', marginTop: '0.4rem' }}>
        <button className="btn-hud" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', whiteSpace: 'nowrap' }} onClick={() => onSendMessage('Explain my constitutional fundamental rights')}>
          ⚖️ Constitutional Rights
        </button>
        <button className="btn-hud" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', whiteSpace: 'nowrap' }} onClick={() => onSendMessage('Write a Python web scraper script')}>
          💻 Python Code
        </button>
        <button className="btn-hud" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', whiteSpace: 'nowrap' }} onClick={() => onSendMessage('Open YouTube and play music')}>
          🎵 Play Music
        </button>
        <button className="btn-hud" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', whiteSpace: 'nowrap' }} onClick={() => onSendMessage('How are you feeling today sweetheart?')}>
          💕 Chat Companion
        </button>
      </div>

      {/* Prominent ChatGPT Input & Mic Bar */}
      <form onSubmit={handleSubmit} className="input-form" style={{ marginTop: '0.4rem' }}>
        <button
          type="button"
          className={`btn-start-wednesday ${isHandsFree ? 'active' : ''}`}
          onClick={() => {
            soundFx.playClick();
            if (onStartWednesday) onStartWednesday();
          }}
          style={{ padding: '0.6rem 1rem', fontSize: '0.8rem', whiteSpace: 'nowrap', borderRadius: '6px' }}
        >
          ⚡ {isHandsFree ? 'VOICE MODE ON' : 'START WEDNESDAY'}
        </button>

        <button
          type="button"
          className={`btn-hud ${isListening ? 'active btn-hud-danger' : ''}`}
          onClick={onToggleListening}
          style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}
          title={isListening ? 'Stop Listening' : 'Start Microphone Voice'}
        >
          {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          {isListening ? 'STOP MIC' : 'MIC'}
        </button>

        <input
          type="text"
          className="input-hud"
          placeholder="Ask Wednesday anything (like ChatGPT)..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />

        <button type="submit" className="btn-hud" style={{ padding: '0.6rem 1.2rem' }}>
          <Send size={16} /> Send
        </button>
      </form>
    </div>
  );
}
