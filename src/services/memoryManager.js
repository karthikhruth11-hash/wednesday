/**
 * Advanced Multi-Tier Memory Engine for W.E.D.N.E.S.D.A.Y.
 * Short-Term Memory (Session/Recent)
 * Long-Term Memory (Cross-Session Preferences, Facts, Decisions)
 * Project Memory (Active Project State, Tasks, Progress)
 */

import { systemApi } from './systemApi';

class MemoryManagerEngine {
  constructor() {
    this.shortTermHistory = []; // Recent conversation turns [{ role, content, timestamp, id, emotion }]
    this.longTermKnowledge = []; // User facts, preferences, decisions [{ key, value, category, timestamp }]
    this.projectMemory = {}; // Active projects { projectName: { status, currentTask, previousWork, nextSteps, lastUpdated } }
    this.activeProject = null;
    this.isInitialized = false;

    this.init();
  }

  async init() {
    try {
      const stored = await systemApi.db.getData('wednesday_memory_matrix', null);
      if (stored) {
        if (Array.isArray(stored.shortTermHistory)) this.shortTermHistory = stored.shortTermHistory;
        if (Array.isArray(stored.longTermKnowledge)) this.longTermKnowledge = stored.longTermKnowledge;
        if (stored.projectMemory && typeof stored.projectMemory === 'object') this.projectMemory = stored.projectMemory;
        if (stored.activeProject) this.activeProject = stored.activeProject;
      }
    } catch (e) {
      console.warn("Memory initialization notice:", e);
    }
    this.isInitialized = true;
  }

  async persist() {
    try {
      const payload = {
        shortTermHistory: this.shortTermHistory.slice(-50), // keep recent 50 turns
        longTermKnowledge: this.longTermKnowledge.slice(-100),
        projectMemory: this.projectMemory,
        activeProject: this.activeProject
      };
      await systemApi.db.saveData('wednesday_memory_matrix', payload);
    } catch (e) {
      console.warn("Memory persist notice:", e);
    }
  }

  /**
   * Log a new conversation turn into Short-Term & Long-Term Memory
   */
  async recordInteraction(userMsg, assistantReply, metadata = {}) {
    if (!userMsg || !assistantReply) return;

    const timestamp = new Date().toISOString();
    const readableTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const turnId = `turn_${Date.now()}`;

    const turn = {
      id: turnId,
      timestamp,
      readableTime,
      userMsg: userMsg.trim(),
      assistantReply: assistantReply.trim(),
      emotion: metadata.emotion || 'neutral',
      toolUsed: metadata.toolUsed || 'CHAT'
    };

    this.shortTermHistory.push(turn);
    if (this.shortTermHistory.length > 50) {
      this.shortTermHistory.shift();
    }

    // Extract potential long-term facts or project references
    this.extractFactsAndProjects(userMsg, assistantReply);

    await this.persist();
    return turn;
  }

  /**
   * Extract key user preferences, facts, and project names from conversation
   */
  extractFactsAndProjects(userMsg, assistantReply) {
    const lower = userMsg.toLowerCase();

    // Project detection
    const projectMatch = lower.match(/(?:my project|project name|building|working on|create|developing)\s+(?:is\s+)?["']?([a-zA-Z0-9_\-\s]+)["']?/i);
    if (projectMatch && projectMatch[1]) {
      const projName = projectMatch[1].replace(/^(a|an|the)\s+/i, '').trim();
      if (projName.length > 2 && !['code', 'app', 'system', 'thing', 'it', 'something'].includes(projName)) {
        this.activeProject = projName;
        if (!this.projectMemory[projName]) {
          this.projectMemory[projName] = {
            name: projName,
            status: 'in_progress',
            currentTask: userMsg,
            previousWork: [userMsg],
            nextSteps: 'Continue development and refinements.',
            lastUpdated: new Date().toISOString()
          };
        } else {
          this.projectMemory[projName].currentTask = userMsg;
          this.projectMemory[projName].previousWork.push(userMsg);
          this.projectMemory[projName].lastUpdated = new Date().toISOString();
        }
      }
    }

    // User preference detection
    if (lower.includes('my name is') || lower.includes('call me')) {
      const nameMatch = userMsg.match(/(?:my name is|call me)\s+([a-zA-Z]+)/i);
      if (nameMatch) {
        this.addLongTermFact('userName', nameMatch[1], 'user_profile');
      }
    }
  }

  addLongTermFact(key, value, category = 'general') {
    const existingIdx = this.longTermKnowledge.findIndex(k => k.key === key);
    const item = { key, value, category, timestamp: new Date().toISOString() };
    if (existingIdx >= 0) {
      this.longTermKnowledge[existingIdx] = item;
    } else {
      this.longTermKnowledge.push(item);
    }
  }

  /**
   * Retrieve relevant context for a query (Short-Term, Long-Term, Project)
   */
  getRelevantContext(query) {
    const lower = (query || '').toLowerCase().trim();
    let snippets = [];

    // 1. Check if user asks for continuity or reference ("yesterday", "where we stopped", "continue", "previous code")
    const isContinuityReq = (
      lower.includes('yesterday') ||
      lower.includes('stopped') ||
      lower.includes('continue') ||
      lower.includes('last time') ||
      lower.includes('previous') ||
      lower.includes('earlier') ||
      lower.includes('before') ||
      lower.includes('code we created') ||
      lower.includes('project')
    );

    if (isContinuityReq && this.shortTermHistory.length > 0) {
      const recent = this.shortTermHistory.slice(-5);
      const recentSummary = recent.map(t => `User: "${t.userMsg}" -> W.E.D.N.E.S.D.A.Y.: "${t.assistantReply.substring(0, 150)}..."`).join('\n');
      snippets.push(`[RECALL: RECENT CONVERSATION HISTORY]:\n${recentSummary}`);
    }

    // 2. Project Memory Context
    if (this.activeProject && this.projectMemory[this.activeProject]) {
      const proj = this.projectMemory[this.activeProject];
      snippets.push(`[ACTIVE PROJECT MEMORY: ${proj.name}]: Status: ${proj.status}, Current Task: "${proj.currentTask}", Last Active: ${new Date(proj.lastUpdated).toLocaleDateString()}`);
    }

    // 3. Keyword-matched Long Term Facts
    const matchedFacts = this.longTermKnowledge.filter(f => lower.includes(f.key.toLowerCase()) || lower.includes(String(f.value).toLowerCase()));
    if (matchedFacts.length > 0) {
      const factsStr = matchedFacts.map(f => `${f.key}: ${f.value}`).join(', ');
      snippets.push(`[USER PREFERENCES & KNOWN FACTS]: ${factsStr}`);
    }

    return snippets.join('\n\n');
  }

  getShortTermTurns(limit = 10) {
    return this.shortTermHistory.slice(-limit);
  }

  getActiveProject() {
    return this.activeProject ? this.projectMemory[this.activeProject] : null;
  }

  clearShortTerm() {
    this.shortTermHistory = [];
    this.persist();
  }
}

export const memoryManager = new MemoryManagerEngine();
