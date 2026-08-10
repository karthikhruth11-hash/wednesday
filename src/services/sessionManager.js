/**
 * Multi-Session & Conversation History Persistence Engine for W.E.D.N.E.S.D.A.Y. AI
 * Handles session storage, automatic title generation, date grouping, search, and pin/rename/delete actions.
 */

import { systemApi } from './systemApi';

class SessionManagerEngine {
  constructor() {
    this.sessions = {}; // { sessionId: { id, title, messages: [], createdAt, updatedAt, pinned: false } }
    this.activeSessionId = null;
    this.isInitialized = false;

    this.init();
  }

  async init() {
    try {
      const stored = await systemApi.db.getData('wednesday_chat_sessions_matrix', null);
      if (stored && typeof stored === 'object' && stored.sessions) {
        this.sessions = stored.sessions;
        this.activeSessionId = stored.activeSessionId || null;
      }
    } catch (e) {
      console.warn("SessionManager init notice:", e);
    }

    // Ensure at least one active session
    if (!this.activeSessionId || !this.sessions[this.activeSessionId]) {
      await this.createNewSession("Welcome to Wednesday");
    }

    this.isInitialized = true;
  }

  async persist() {
    try {
      const payload = {
        sessions: this.sessions,
        activeSessionId: this.activeSessionId
      };
      await systemApi.db.saveData('wednesday_chat_sessions_matrix', payload);
    } catch (e) {
      console.warn("SessionManager persist notice:", e);
    }
  }

  async createNewSession(firstUserQuery = '') {
    const id = `session_${Date.now()}`;
    const timestamp = new Date().toISOString();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let title = 'New Conversation';
    if (firstUserQuery) {
      title = this.generateTitleFromQuery(firstUserQuery);
    }

    const newSession = {
      id,
      title,
      messages: [
        {
          sender: 'assistant',
          text: "Hello, I'm Wednesday. Welcome, Boss Karthik! ✨ GALAXY CORE active. How can I help you today?",
          timestamp: timeStr
        }
      ],
      createdAt: timestamp,
      updatedAt: timestamp,
      pinned: false
    };

    this.sessions[id] = newSession;
    this.activeSessionId = id;
    await this.persist();
    return newSession;
  }

  generateTitleFromQuery(query) {
    if (!query) return 'New Conversation';
    let clean = query.replace(/^(please\s+)?(tell\s+me\s+about|what\s+is|how\s+do|can\s+you|explain|create|write|show)\s+/i, '').trim();
    if (!clean) clean = query.trim();
    const cap = clean.charAt(0).toUpperCase() + clean.slice(1);
    return cap.length > 32 ? cap.substring(0, 32) + '...' : cap;
  }

  getActiveSession() {
    if (!this.activeSessionId || !this.sessions[this.activeSessionId]) {
      const keys = Object.keys(this.sessions);
      if (keys.length > 0) {
        this.activeSessionId = keys[0];
      }
    }
    return this.sessions[this.activeSessionId] || null;
  }

  async setActiveSession(id) {
    if (this.sessions[id]) {
      this.activeSessionId = id;
      await this.persist();
      return this.sessions[id];
    }
    return null;
  }

  async addUserMessageToActiveSession(userMsg) {
    const session = this.getActiveSession();
    if (!session) return null;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (session.title === 'New Conversation' || session.messages.length <= 1) {
      session.title = this.generateTitleFromQuery(userMsg);
    }

    session.messages.push({
      sender: 'user',
      text: userMsg.trim(),
      timestamp: timeStr
    });

    session.updatedAt = new Date().toISOString();
    await this.persist();
    return session;
  }

  async addAssistantReplyToActiveSession(assistantReply) {
    const session = this.getActiveSession();
    if (!session) return null;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    session.messages.push({
      sender: 'assistant',
      text: assistantReply.trim(),
      timestamp: timeStr
    });

    session.updatedAt = new Date().toISOString();
    await this.persist();
    return session;
  }

  async addTurnToActiveSession(userMsg, assistantReply) {
    await this.addUserMessageToActiveSession(userMsg);
    await this.addAssistantReplyToActiveSession(assistantReply);
  }

  async renameSession(id, newTitle) {
    if (this.sessions[id]) {
      this.sessions[id].title = newTitle.trim() || 'Untitled Chat';
      this.sessions[id].updatedAt = new Date().toISOString();
      await this.persist();
    }
  }

  async deleteSession(id) {
    delete this.sessions[id];
    const keys = Object.keys(this.sessions);
    if (keys.length > 0) {
      this.activeSessionId = keys[0];
    } else {
      await this.createNewSession();
    }
    await this.persist();
  }

  async togglePinSession(id) {
    if (this.sessions[id]) {
      this.sessions[id].pinned = !this.sessions[id].pinned;
      await this.persist();
    }
  }

  searchSessions(query) {
    if (!query) return Object.values(this.sessions);
    const lower = query.toLowerCase().trim();
    return Object.values(this.sessions).filter(s =>
      s.title.toLowerCase().includes(lower) ||
      s.messages.some(m => m.text.toLowerCase().includes(lower))
    );
  }

  getGroupedSessions(searchQuery = '') {
    const all = this.searchSessions(searchQuery);

    const pinned = all.filter(s => s.pinned);
    const unpinned = all.filter(s => !s.pinned);

    const now = new Date();
    const today = [];
    const yesterday = [];
    const past7Days = [];
    const older = [];

    unpinned.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    unpinned.forEach(s => {
      const date = new Date(s.updatedAt);
      const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        today.push(s);
      } else if (diffDays === 1) {
        yesterday.push(s);
      } else if (diffDays <= 7) {
        past7Days.push(s);
      } else {
        older.push(s);
      }
    });

    return { pinned, today, yesterday, past7Days, older };
  }
}

export const sessionManager = new SessionManagerEngine();
