import React, { useRef, useEffect } from 'react';
import { Bot, User } from 'lucide-react';

export default function ChatGPTConsole({
  messages,
  interimTranscript,
  onSendMessage
}) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, interimTranscript]);

  const suggestions = [
    { label: '⚖️ Constitutional Rights', prompt: 'Explain my constitutional fundamental rights' },
    { label: '💻 Python Code Scraper', prompt: 'Write a Python web scraper script' },
    { label: '🎵 Play Music on YouTube', prompt: 'Open YouTube and play music' },
    { label: '💕 Chat Companion', prompt: 'How are you feeling today sweetheart?' }
  ];

  return (
    <div style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {/* Quick Suggestion Chips */}
      <div className="suggestion-chips">
        {suggestions.map((s, i) => (
          <button key={i} className="suggestion-chip" onClick={() => onSendMessage(s.prompt)}>
            {s.label}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="chat-stream">
        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-bubble ${msg.sender === 'user' ? 'user-msg' : 'assistant-msg'}`}>
            <div className={`avatar-icon ${msg.sender === 'user' ? 'user-avatar' : 'assistant-avatar'}`}>
              {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>

            <div className="bubble-content">
              <div className="bubble-meta">
                {msg.sender === 'user' ? 'YOU' : 'W.E.D.N.E.S.D.A.Y.'} • {msg.timestamp}
              </div>
              <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
            </div>
          </div>
        ))}

        {interimTranscript && (
          <div className="chat-bubble user-msg" style={{ opacity: 0.85 }}>
            <div className="avatar-icon user-avatar"><User size={16} /></div>
            <div className="bubble-content" style={{ borderStyle: 'dashed', borderColor: '#f43f5e' }}>
              <div className="bubble-meta" style={{ color: '#f43f5e' }}>SPEAKING NOW...</div>
              <div style={{ fontStyle: 'italic' }}>{interimTranscript}</div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
