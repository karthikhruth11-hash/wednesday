import React from 'react';
import { Sparkles, Code, BookOpen, Cpu, Search, Compass } from 'lucide-react';

export default function WelcomeScreen({ onSelectPrompt }) {
  const cards = [
    {
      icon: <Code size={20} className="card-icon cyan" />,
      title: "Write Code",
      subtitle: "Python web scrapers, React apps, DB queries",
      prompt: "Write a Python script for a web scraper"
    },
    {
      icon: <BookOpen size={20} className="card-icon purple" />,
      title: "Explain a Concept",
      subtitle: "Machine learning, quantum computing, legal rights",
      prompt: "Explain how machine learning models work in simple terms"
    },
    {
      icon: <Cpu size={20} className="card-icon emerald" />,
      title: "Build Something",
      subtitle: "Personal AI agents, APIs, automation workflows",
      prompt: "Help me design a personal AI agent system"
    },
    {
      icon: <Search size={20} className="card-icon amber" />,
      title: "Analyze Files",
      subtitle: "Code debugging, document review, data summary",
      prompt: "How can I analyze and debug my code efficiently?"
    }
  ];

  return (
    <div className="welcome-screen-container">
      <div className="welcome-header">
        <div className="welcome-badge">
          <Sparkles size={14} /> W.E.D.N.E.S.D.A.Y. GALAXY CORE v2.5
        </div>
        <h1 className="welcome-title">
          How can <span className="gradient-text">Wednesday</span> help you today?
        </h1>
        <p className="welcome-subtitle">
          Ask questions, request code, manage continuous memory projects, or explore autonomous workflows.
        </p>
      </div>

      <div className="welcome-cards-grid">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className="welcome-card"
            onClick={() => onSelectPrompt(card.prompt)}
          >
            <div className="welcome-card-header">
              {card.icon}
              <Compass size={14} className="card-arrow" />
            </div>
            <h3 className="card-title">{card.title}</h3>
            <p className="card-subtitle">{card.subtitle}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
