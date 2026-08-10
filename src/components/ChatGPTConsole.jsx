import React, { useRef, useEffect, useState } from 'react';
import { Bot, User, Copy, Check } from 'lucide-react';

function CodeBlock({ code, language }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = code;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      style={{
        margin: '0.8rem 0',
        borderRadius: '10px',
        overflow: 'hidden',
        border: '1px solid rgba(0, 240, 255, 0.35)',
        background: '#040b18',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.4rem 0.8rem',
          background: 'rgba(0, 240, 255, 0.12)',
          borderBottom: '1px solid rgba(0, 240, 255, 0.2)',
          fontSize: '0.75rem',
          fontFamily: 'Orbitron, monospace',
          color: '#00f0ff'
        }}
      >
        <span>💻 {language ? language.toUpperCase() : 'CODE'}</span>
        <button
          type="button"
          onClick={handleCopy}
          style={{
            background: copied ? 'rgba(34, 197, 94, 0.25)' : 'rgba(0, 240, 255, 0.15)',
            color: copied ? '#4ade80' : '#00f0ff',
            border: `1px solid ${copied ? '#22c55e' : 'rgba(0, 240, 255, 0.4)'}`,
            borderRadius: '6px',
            padding: '0.2rem 0.6rem',
            fontSize: '0.7rem',
            fontFamily: 'Orbitron, monospace',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            transition: 'all 0.2s ease'
          }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Copied!' : 'Copy Code'}
        </button>
      </div>

      <pre
        style={{
          margin: 0,
          padding: '0.8rem 1rem',
          fontSize: '0.82rem',
          fontFamily: 'Consolas, Monaco, "Courier New", monospace',
          color: '#e2e8f0',
          overflowX: 'auto',
          lineHeight: '1.5'
        }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}

function TextSection({ text }) {
  if (!text) return null;
  const lines = text.split('\n');

  return lines.map((line, lineIdx) => {
    // Markdown Image
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

    // Markdown Link
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

    // Headings (### or ##)
    if (line.startsWith('### ') || line.startsWith('## ') || line.startsWith('# ')) {
      const headingText = line.replace(/^#+\s*/, '');
      return (
        <h4 key={lineIdx} style={{ color: '#00f0ff', fontFamily: 'Orbitron, sans-serif', marginTop: '0.6rem', marginBottom: '0.3rem' }}>
          {headingText}
        </h4>
      );
    }

    // Bullet list items
    if (line.trim().startsWith('• ') || line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const bulletText = line.trim().replace(/^([•\-*])\s*/, '');
      return (
        <div key={lineIdx} style={{ paddingLeft: '1rem', marginBottom: '0.3rem', lineHeight: '1.6', position: 'relative' }}>
          <span style={{ color: '#00f0ff', marginRight: '0.5rem' }}>•</span>
          {renderInlineFormatting(bulletText)}
        </div>
      );
    }

    return (
      <div key={lineIdx} style={{ marginBottom: '0.35rem', lineHeight: '1.6' }}>
        {renderInlineFormatting(line)}
      </div>
    );
  });
}

function renderInlineFormatting(line) {
  const parts = line.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, partIdx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={partIdx} style={{ color: '#00f0ff', fontWeight: '700' }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

function renderFormattedMessage(text) {
  if (!text) return null;

  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  const elements = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    const textBefore = text.substring(lastIndex, match.index);
    if (textBefore) {
      elements.push(<TextSection key={`text_${lastIndex}`} text={textBefore} />);
    }

    const lang = match[1] || 'code';
    const code = match[2].trim();
    elements.push(<CodeBlock key={`code_${match.index}`} code={code} language={lang} />);

    lastIndex = match.index + match[0].length;
  }

  const remainingText = text.substring(lastIndex);
  if (remainingText) {
    elements.push(<TextSection key={`text_${lastIndex}`} text={remainingText} />);
  }

  return elements;
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
              <div>
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
