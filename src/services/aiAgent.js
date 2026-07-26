/**
 * W.E.D.N.E.S.D.A.Y. PRO AI Agent Engine with Multi-Persona Mode & Universal Action Routing
 */

import { systemApi } from './systemApi';
import { trainingEngine } from './trainingEngine';

export class AIAgentEngine {
  constructor() {
    this.tasks = JSON.parse(localStorage.getItem('wednesday_tasks') || '[]');
  }

  saveTasks() {
    localStorage.setItem('wednesday_tasks', JSON.stringify(this.tasks));
  }

  addTask(title) {
    const newTask = { id: Date.now(), title, completed: false, time: new Date().toLocaleTimeString() };
    this.tasks.unshift(newTask);
    this.saveTasks();
    return newTask;
  }

  toggleTask(id) {
    this.tasks = this.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    this.saveTasks();
  }

  clearTasks() {
    this.tasks = [];
    this.saveTasks();
  }

  executeCode(code) {
    let logs = [];
    const customConsole = {
      log: (...args) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ')),
      error: (...args) => logs.push(`[ERR] ${args.join(' ')}`),
      warn: (...args) => logs.push(`[WARN] ${args.join(' ')}`),
    };

    try {
      const runFn = new Function('console', code);
      const result = runFn(customConsole);
      if (result !== undefined) logs.push(`=> ${JSON.stringify(result)}`);
      return { success: true, output: logs.join('\n') || 'Code executed successfully.' };
    } catch (err) {
      return { success: false, output: `Runtime Error: ${err.message}` };
    }
  }

  // Universal Natural Language System Intent Router with Persona Support
  async processQuery(query, personaMode = 'jarvis') {
    const rawQuery = query.trim();
    const lower = rawQuery.toLowerCase();

    // 0. CHECK USER-TRAINED COMMANDS FIRST!
    const trainedMatch = trainingEngine.findMatch(rawQuery);
    if (trainedMatch) {
      if (trainedMatch.actionType === 'LAUNCH_APP' && trainedMatch.actionValue) {
        await systemApi.launchApp(trainedMatch.actionValue);
      } else if (trainedMatch.actionType === 'OPEN_URL' && trainedMatch.actionValue) {
        await systemApi.openUrl(trainedMatch.actionValue);
      }
      return {
        reply: trainedMatch.response,
        toolUsed: 'TRAINED_COMMAND'
      };
    }

    // 1. OPEN WEBSITES / SEARCH GOOGLE & YOUTUBE
    if (lower.startsWith('open youtube') || lower === 'youtube') {
      await systemApi.openUrl('https://www.youtube.com');
      return { reply: personaMode === 'girlfriend' ? 'Opening YouTube for you babe!' : 'Opening YouTube, Boss.', toolUsed: 'OPEN_URL' };
    }
    if (lower.startsWith('open google') || lower === 'google') {
      await systemApi.openUrl('https://www.google.com');
      return { reply: personaMode === 'girlfriend' ? 'Opening Google for you sweetheart!' : 'Opening Google, Boss.', toolUsed: 'OPEN_URL' };
    }
    if (lower.includes('play') && lower.includes('on youtube')) {
      const searchTerm = rawQuery.replace(/(play|on youtube|search)/gi, '').trim();
      const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchTerm)}`;
      await systemApi.openUrl(ytUrl);
      return { reply: personaMode === 'girlfriend' ? `Playing "${searchTerm}" on YouTube for you babe!` : `Playing "${searchTerm}" on YouTube, Boss.`, toolUsed: 'OPEN_URL' };
    }

    // 2. CREATE FOLDER OR FILE COMMANDS
    if (lower.includes('create folder') || lower.includes('make folder') || lower.includes('create directory')) {
      const folderName = rawQuery.replace(/(create folder|make folder|create directory|folder|named|called)/gi, '').trim() || 'New_Folder';
      const res = await systemApi.createDir(`Desktop/${folderName}`);
      return {
        reply: res.success ? (personaMode === 'girlfriend' ? `Created folder "${folderName}" on Desktop for you babe!` : `Folder "${folderName}" created on Desktop, Boss.`) : `Failed to create folder: ${res.error}`,
        toolUsed: 'CREATE_DIR'
      };
    }

    // 3. DESKTOP APPLICATION LAUNCHING
    const appKeywords = {
      'notepad': 'notepad',
      'calculator': 'calculator',
      'calc': 'calculator',
      'explorer': 'explorer',
      'files': 'explorer',
      'terminal': 'terminal',
      'cmd': 'cmd',
      'paint': 'paint',
      'control panel': 'control',
      'chrome': 'chrome',
      'browser': 'browser',
      'vs code': 'vscode',
      'vscode': 'vscode',
      'task manager': 'taskmgr'
    };

    for (const [key, appName] of Object.entries(appKeywords)) {
      if (lower.startsWith(`open ${key}`) || lower === `open ${key}` || lower.startsWith(`launch ${key}`)) {
        const res = await systemApi.launchApp(appName);
        return {
          reply: res.success ? (personaMode === 'girlfriend' ? `Opening ${key} for you sweetheart!` : `Opening ${key} on desktop, Boss.`) : `Error opening ${key}: ${res.error}`,
          toolUsed: 'LAUNCH_APP'
        };
      }
    }

    // 4. MULTI-PERSONA AI ENGINE CHAT (GIRLFRIEND, LAWYER, POLYGLOT, JARVIS)
    const provider = localStorage.getItem('wednesday_ai_provider') || 'jarvis';
    const apiKey = localStorage.getItem('wednesday_api_key') || '';

    const llmRes = await systemApi.sendAIChat(rawQuery, apiKey, provider, personaMode);
    if (llmRes.success && llmRes.reply) {
      return {
        reply: llmRes.reply,
        toolUsed: 'MULTI_PERSONA_AI'
      };
    }

    return {
      reply: `Processing command "${rawQuery}". Action executed via W.E.D.N.E.S.D.A.Y. neural core.`,
      toolUsed: 'GENERAL'
    };
  }
}

export const aiAgent = new AIAgentEngine();
