/**
 * W.E.D.N.E.S.D.A.Y. PRO AI Agent Engine with Multi-Persona Mode & Universal Action Routing
 */

import { systemApi } from './systemApi';
import { trainingEngine } from './trainingEngine';
import { autoMlEngine } from './autoMlEngine';
import { omniscientKnowledgeEngine } from './omniscientKnowledgeEngine';

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

  // Universal Natural Language System Intent Router with Persona Support & Auto ML Learning
  async processQuery(query, personaMode = 'jarvis') {
    const rawQuery = query.trim();
    const lower = rawQuery.toLowerCase();
    let result = null;

    // 0. INSTANT OMNISCIENT KNOWLEDGE LOOKUP (ZERO DELAY)
    const instantAns = omniscientKnowledgeEngine.findInstantAnswer(rawQuery);
    if (instantAns) {
      result = {
        reply: instantAns,
        toolUsed: 'OMNISCIENT_CORE'
      };
    }

    // 0. CHECK USER-TRAINED COMMANDS FIRST!
    const trainedMatch = trainingEngine.findMatch(rawQuery);
    if (trainedMatch) {
      if (trainedMatch.actionType === 'LAUNCH_APP' && trainedMatch.actionValue) {
        await systemApi.launchApp(trainedMatch.actionValue);
      } else if (trainedMatch.actionType === 'OPEN_URL' && trainedMatch.actionValue) {
        await systemApi.openUrl(trainedMatch.actionValue);
      }
      result = {
        reply: trainedMatch.response,
        toolUsed: 'TRAINED_COMMAND'
      };
    }

    // 1. UNIVERSAL CLOSE / SHUTDOWN PROCESS HANDLER
    if (lower === 'close' || lower === 'close process' || lower === 'stop process' || lower === 'exit' || lower === 'shutdown' || lower === 'turn off') {
      speechEngine.stopSpeaking();
      speechEngine.stopListening();
      result = {
        reply: personaMode === 'girlfriend' ? 'Closing active processes. Bye babe! 💕' : 'Closing active processes and shutting down. Have a great day, Boss Karthik! ⚡',
        toolUsed: 'SHUTDOWN_PROCESS'
      };
    }

    // 2. UNIVERSAL OPEN-ANYTHING ROUTER (WEBSITES, APPS, DESKTOP TOOLS)
    if (!result && lower.startsWith('open ')) {
      const target = lower.replace(/^open\s+/i, '').trim();

      const commonSites = {
        'youtube': 'https://www.youtube.com',
        'google': 'https://www.google.com',
        'github': 'https://www.github.com',
        'wikipedia': 'https://www.wikipedia.org',
        'spotify': 'https://open.spotify.com',
        'instagram': 'https://www.instagram.com',
        'whatsapp': 'https://web.whatsapp.com',
        'facebook': 'https://www.facebook.com',
        'twitter': 'https://www.x.com',
        'x': 'https://www.x.com',
        'netflix': 'https://www.netflix.com',
        'maps': 'https://maps.google.com',
        'gmail': 'https://mail.google.com'
      };

      if (commonSites[target]) {
        await systemApi.openUrl(commonSites[target]);
        result = {
          reply: personaMode === 'girlfriend' ? `Opening ${target} for you babe!` : `Opening ${target}, Boss Karthik. 🌐`,
          toolUsed: 'OPEN_URL'
        };
      } else if (target.includes('.') || target.includes('www') || target.includes('http')) {
        await systemApi.openUrl(target);
        result = {
          reply: `Opening ${target}, Boss Karthik. 🌐`,
          toolUsed: 'OPEN_URL'
        };
      } else {
        // Desktop App or generic URL fallback
        const appRes = await systemApi.launchApp(target);
        if (!appRes.success || appRes.message.includes('requires running')) {
          await systemApi.openUrl(`https://www.google.com/search?q=${encodeURIComponent(target)}`);
        }
        result = {
          reply: `Opening ${target}, Boss Karthik.`,
          toolUsed: 'OPEN_APP_OR_WEB'
        };
      }
    }

    // 2. DIRECT INSTANT KNOWLEDGE PRE-MATCHES (GREETINGS, FORMULAS, STATUS)
    const cleanP = lower.replace(/[^a-z0-9\s]/gi, '').trim();
    if (!result && (cleanP === 'hi' || cleanP === 'hii' || cleanP === 'hello' || cleanP === 'hey' || cleanP === 'hey wednesday')) {
      result = {
        reply: personaMode === 'girlfriend'
          ? "Hii babe! I'm right here with you sweetheart. How can I help you today? 💕"
          : "Hello, Boss Karthik! W.E.D.N.E.S.D.A.Y. SIGMA Core online and ready. How can I assist you today? ⚡",
        toolUsed: 'DIRECT_KNOWLEDGE'
      };
    }

    if (!result && cleanP.includes('how are you')) {
      result = {
        reply: "I am doing great, Boss Karthik! All SIGMA Arc Reactor core systems are 100% online and running smoothly. ⚡",
        toolUsed: 'DIRECT_KNOWLEDGE'
      };
    }

    if (!result && (cleanP.includes('water formula') || cleanP.includes('formula of water'))) {
      result = {
        reply: "H₂O",
        toolUsed: 'DIRECT_KNOWLEDGE'
      };
    }

    // 3. CREATE FOLDER OR FILE COMMANDS
    if (!result && (lower.includes('create folder') || lower.includes('make folder') || lower.includes('create directory'))) {
      const folderName = rawQuery.replace(/(create folder|make folder|create directory|folder|named|called)/gi, '').trim() || 'New_Folder';
      const res = await systemApi.createDir(`Desktop/${folderName}`);
      result = {
        reply: res.success ? (personaMode === 'girlfriend' ? `Created folder "${folderName}" on Desktop for you babe!` : `Folder "${folderName}" created on Desktop, Boss Karthik.`) : `Failed to create folder: ${res.error}`,
        toolUsed: 'CREATE_DIR'
      };
    }

    // 4. DESKTOP APPLICATION LAUNCHING
    if (!result) {
      const appKeywords = {
        'notepad': 'notepad',
        'calculator': 'calculator',
        'calc': 'calculator',
        'explorer': 'explorer',
        'files': 'explorer',
        'terminal': 'terminal',
        'command prompt': 'cmd',
        'prompt': 'cmd',
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
        if (lower.includes(key)) {
          const res = await systemApi.launchApp(appName);
          result = {
            reply: res.success ? (personaMode === 'girlfriend' ? `Opening ${key} for you sweetheart!` : `Opening ${key} on desktop, Boss Karthik.`) : `Error opening ${key}: ${res.error}`,
            toolUsed: 'LAUNCH_APP'
          };
          break;
        }
      }
    }

    // 5. MULTI-PERSONA AI ENGINE CHAT (GIRLFRIEND, LAWYER, POLYGLOT, JARVIS)
    if (!result) {
      const provider = localStorage.getItem('wednesday_ai_provider') || 'jarvis';
      const apiKey = localStorage.getItem('wednesday_api_key') || '';

      const llmRes = await systemApi.sendAIChat(rawQuery, apiKey, provider, personaMode);
      if (llmRes && llmRes.success && llmRes.reply) {
        result = {
          reply: llmRes.reply,
          toolUsed: 'MULTI_PERSONA_AI'
        };
      }
    }

    if (!result) {
      result = {
        reply: `I have processed your request for "${rawQuery}", Boss Karthik. Is there anything specific you would like me to analyze further?`,
        toolUsed: 'GENERAL'
      };
    }

    // AUTONOMOUS CONTINUOUS MACHINE LEARNING
    autoMlEngine.learnFromInteraction(rawQuery, result.reply, personaMode, result.toolUsed);

    return result;
  }
}

export const aiAgent = new AIAgentEngine();
