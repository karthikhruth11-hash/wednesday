import React, { useRef, useEffect } from 'react';
import { Bot, User } from 'lucide-react';

function renderFormattedMessage(text) {
  if (!text) return null;

  const lines = text.split('\n');
  return lines.map((line, lineIdx) => {
    // Check if line contains markdown image
    const imgMatch = line.match(/!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/);
    if (imgMatch) {
      const altText = imgMatch[1] || 'Visual Matrix';
      const imgUrl = imgMatch[2];
      return (
        <div
          key={lineIdx}
          style={{
            marginTop: '0.8rem',
            marginBottom: '0.8rem',
            maxWidth: '520px',
            marginLeft: 'auto',
            marginRight: 'auto',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '1px solid rgba(0, 240, 255, 0.4)',
            boxShadow: '0 4px 25px rgba(0, 240, 255, 0.25)',
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
              maxHeight: '320px',
              objectFit: 'cover',
              display: 'block',
              margin: '0 auto',
              background: '#020612'
            }}
          />
          <div
            style={{
              padding: '0.5rem 1rem',
              background: 'rgba(0, 240, 255, 0.1)',
              color: '#00f0ff',
              fontSize: '0.75rem',
              fontFamily: 'Orbitron, sans-serif',
              borderTop: '1px solid rgba(0, 240, 255, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
          >
            🖼️ {altText}
          </div>
        </div>
      );
    }

    // Check if line contains markdown link [text](url)
    const linkMatch = line.match(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/);
    if (linkMatch) {
      return (
        <div key={lineIdx} style={{ margin: '0.4rem 0' }}>
          <a
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#00f0ff',
              textDecoration: 'none',
              fontWeight: 'bold',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(0, 240, 255, 0.15)',
              padding: '0.4rem 0.9rem',
              borderRadius: '8px',
              border: '1px solid rgba(0, 240, 255, 0.5)',
              boxShadow: '0 0 12px rgba(0, 240, 255, 0.25)'
            }}
          >
            👉 {linkMatch[1]} ↗
          </a>
        </div>
      );
    }

    if (!line.trim()) {
      return <div key={lineIdx} style={{ height: '0.5rem' }} />;
    }

    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <div key={lineIdx} style={{ marginBottom: '0.35rem', lineHeight: '1.6' }}>
        {parts.map((part, partIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={partIdx} style={{ color: '#00f0ff', fontWeight: '700' }}>
                {part.slice(2, -2)}
              </strong>
            );
          }
          return part;
        })}
      </div>
    );
  });
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
