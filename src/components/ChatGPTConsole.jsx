import React, { useRef, useEffect } from 'react';
import { Bot, User } from 'lucide-react';

function renderFormattedMessage(text) {
  if (!text) return null;

  const masterRegex = /!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s)]+)/g;
  const parts = [];
  let lastIdx = 0;
  let match;

  while ((match = masterRegex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      parts.push(text.substring(lastIdx, match.index));
    }

    if (match[1] !== undefined && match[2]) {
      const altText = match[1] || 'Visual Matrix';
      const imgUrl = match[2];
      parts.push(
        <div
          key={match.index}
          style={{
            marginTop: '0.8rem',
            marginBottom: '0.8rem',
            maxWidth: '480px',
            marginLeft: 'auto',
            marginRight: 'auto',
            borderRadius: '14px',
            overflow: 'hidden',
            border: '1px solid rgba(0, 240, 255, 0.4)',
            boxShadow: '0 4px 20px rgba(0, 240, 255, 0.25)',
            background: 'rgba(2, 8, 20, 0.95)'
          }}
        >
          <img
            src={imgUrl}
            alt={altText}
            loading="lazy"
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: '280px',
              objectFit: 'contain',
              display: 'block',
              margin: '0 auto',
              background: '#020612'
            }}
          />
          <div
            style={{
              padding: '0.4rem 0.8rem',
              background: 'rgba(0, 240, 255, 0.1)',
              color: '#00f0ff',
              fontSize: '0.72rem',
              fontFamily: 'Orbitron, sans-serif',
              borderTop: '1px solid rgba(0, 240, 255, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
              gap: '0.4rem'
            }}
          >
            🖼️ {altText}
          </div>
        </div>
      );
    } else if (match[3] && match[4]) {
      parts.push(
        <a
          key={match.index}
          href={match[4]}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: '#00f0ff',
            textDecoration: 'none',
            fontWeight: 'bold',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            background: 'rgba(0, 240, 255, 0.15)',
            padding: '0.3rem 0.7rem',
            borderRadius: '6px',
            border: '1px solid rgba(0, 240, 255, 0.5)',
            marginTop: '0.3rem',
            boxShadow: '0 0 10px rgba(0, 240, 255, 0.2)'
          }}
        >
          {match[3]} ↗
        </a>
      );
    } else if (match[5]) {
      parts.push(
        <a
          key={match.index}
          href={match[5]}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#00f0ff', textDecoration: 'underline' }}
        >
          {match[5]}
        </a>
      );
    }
    lastIdx = masterRegex.lastIndex;
  }

  if (lastIdx < text.length) {
    parts.push(text.substring(lastIdx));
  }

  return parts;
}

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
              <div style={{ whiteSpace: 'pre-wrap' }}>
                {renderFormattedMessage(msg.text)}
              </div>
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
