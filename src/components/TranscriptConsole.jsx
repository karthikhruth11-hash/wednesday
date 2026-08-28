import React, { useRef, useEffect } from 'react';
import { Mic, MicOff, Send, MessageSquare, Bot, User } from 'lucide-react';
import { soundFx } from '../services/soundFx';

export default function TranscriptConsole({
  messages,
  inputText,
  setInputText,
  isListening,
  state,
  interimTranscript,
  onSendMessage,
  onToggleListening
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
    switch (state) {
      case 'listening': return '🎙️ LISTENING TO YOUR VOICE...';
      case 'processing': return '🧠 THINKING & GENERATING ANSWER...';
      case 'speaking': return '🔊 SPEAKING RESPONSE...';
      default: return '🟢 READY FOR VOICE OR TEXT';
    }
  };

  return (
    <div className="hud-card transcript-box" style={{ flex: 1, minHeight: '260px', display: 'flex', flexDirection: 'column' }}>
      <div className="hud-card-header" style={{ marginBottom: '0.5rem', paddingBottom: '0.4rem' }}>
        <span className="hud-card-title">
          <MessageSquare size={16} /> Neural Voice & Chat Console
        </span>
        <span style={{ fontSize: '0.75rem', color: state === 'listening' ? '#ff4d6d' : state === 'speaking' ? '#00f0ff' : '#00ff66', fontFamily: 'Orbitron' }}>
          {getStatusText()}
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="messages-list" style={{ flex: 1, minHeight: '130px', maxHeight: '180px', overflowY: 'auto' }}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`msg-bubble ${msg.sender === 'user' ? 'msg-user' : 'msg-assistant'}`}>
            <div className="msg-meta" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              {msg.sender === 'user' ? <User size={12} /> : <Bot size={12} />}
              {msg.sender === 'user' ? 'YOU' : 'W.E.D.N.E.S.D.A.Y.'} • {msg.timestamp}
            </div>
            <div>{msg.text}</div>
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

      {/* Prominent Chat & Mic Form */}
      <form onSubmit={handleSubmit} className="input-form" style={{ marginTop: '0.5rem' }}>
        <button
          type="button"
          className={`btn-hud ${isListening ? 'active btn-hud-danger' : ''}`}
          onClick={onToggleListening}
          style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}
          title={isListening ? 'Stop Listening' : 'Start Microhone Voice'}
        >
          {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          {isListening ? 'STOP MIC' : 'TALK (MIC)'}
        </button>

        <input
          type="text"
          className="input-hud"
          placeholder="Type any question or command here to talk with Wednesday..."
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
