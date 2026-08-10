/**
 * W.E.D.N.E.S.D.A.Y. PRO AI Agent Engine with Multi-Persona Mode & Universal Action Routing
 */

import { systemApi } from './systemApi';
import { trainingEngine } from './trainingEngine';
import { autoMlEngine } from './autoMlEngine';
import { omniscientKnowledgeEngine } from './omniscientKnowledgeEngine';
import { speechEngine } from './speech';

const LANG_MAP = {
  // Telugu aliases
  telugu: { code: 'te', name: 'Telugu', locale: 'te-IN' },
  telgu: { code: 'te', name: 'Telugu', locale: 'te-IN' },
  telguu: { code: 'te', name: 'Telugu', locale: 'te-IN' },
  teluguu: { code: 'te', name: 'Telugu', locale: 'te-IN' },
  telugoo: { code: 'te', name: 'Telugu', locale: 'te-IN' },

  // Hindi aliases
  hindi: { code: 'hi', name: 'Hindi', locale: 'hi-IN' },
  hindhi: { code: 'hi', name: 'Hindi', locale: 'hi-IN' },
  hindii: { code: 'hi', name: 'Hindi', locale: 'hi-IN' },
  hindu: { code: 'hi', name: 'Hindi', locale: 'hi-IN' },

  // Tamil aliases
  tamil: { code: 'ta', name: 'Tamil', locale: 'ta-IN' },
  tamill: { code: 'ta', name: 'Tamil', locale: 'ta-IN' },
  tamizh: { code: 'ta', name: 'Tamil', locale: 'ta-IN' },

  // Kannada aliases
  kannada: { code: 'kn', name: 'Kannada', locale: 'kn-IN' },
  kanada: { code: 'kn', name: 'Kannada', locale: 'kn-IN' },

  // Malayalam aliases
  malayalam: { code: 'ml', name: 'Malayalam', locale: 'ml-IN' },
  malyalam: { code: 'ml', name: 'Malayalam', locale: 'ml-IN' },

  // Marathi aliases
  marathi: { code: 'mr', name: 'Marathi', locale: 'mr-IN' },

  // Bengali aliases
  bengali: { code: 'bn', name: 'Bengali', locale: 'bn-IN' },

  // Spanish aliases
  spanish: { code: 'es', name: 'Spanish', locale: 'es-ES' },
  spanis: { code: 'es', name: 'Spanish', locale: 'es-ES' },
  espanol: { code: 'es', name: 'Spanish', locale: 'es-ES' },

  // French aliases
  french: { code: 'fr', name: 'French', locale: 'fr-FR' },
  frensh: { code: 'fr', name: 'French', locale: 'fr-FR' },

  // German aliases
  german: { code: 'de', name: 'German', locale: 'de-DE' },
  germn: { code: 'de', name: 'German', locale: 'de-DE' },

  // Japanese aliases
  japanese: { code: 'ja', name: 'Japanese', locale: 'ja-JP' },
  japanes: { code: 'ja', name: 'Japanese', locale: 'ja-JP' },
  japanees: { code: 'ja', name: 'Japanese', locale: 'ja-JP' },
  japnese: { code: 'ja', name: 'Japanese', locale: 'ja-JP' },
  japan: { code: 'ja', name: 'Japanese', locale: 'ja-JP' },

  // Korean aliases
  korean: { code: 'ko', name: 'Korean', locale: 'ko-KR' },
  korea: { code: 'ko', name: 'Korean', locale: 'ko-KR' },

  // Italian aliases
  italian: { code: 'it', name: 'Italian', locale: 'it-IT' },
  italy: { code: 'it', name: 'Italian', locale: 'it-IT' },

  // Russian aliases
  russian: { code: 'ru', name: 'Russian', locale: 'ru-RU' },
  russia: { code: 'ru', name: 'Russian', locale: 'ru-RU' },

  // Chinese aliases
  chinese: { code: 'zh', name: 'Chinese', locale: 'zh-CN' },
  chines: { code: 'zh', name: 'Chinese', locale: 'zh-CN' },
  china: { code: 'zh', name: 'Chinese', locale: 'zh-CN' },

  // Arabic aliases
  arabic: { code: 'ar', name: 'Arabic', locale: 'ar-SA' },
  arab: { code: 'ar', name: 'Arabic', locale: 'ar-SA' },

  // Portuguese aliases
  portuguese: { code: 'pt', name: 'Portuguese', locale: 'pt-PT' }
};

async function translateText(text, targetLangName) {
  const langKey = targetLangName.toLowerCase().trim();
  let langObj = LANG_MAP[langKey];

  if (!langObj) {
    const matchedKey = Object.keys(LANG_MAP).find(k => langKey.includes(k) || k.includes(langKey));
    if (matchedKey) langObj = LANG_MAP[matchedKey];
  }

  if (langObj) {
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${langObj.code}&dt=t&q=${encodeURIComponent(text)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data && data[0]) {
          const translatedStr = data[0].map(item => item[0]).join('');
          if (translatedStr) {
            return {
              translatedText: translatedStr,
              langName: langObj.name,
              locale: langObj.locale
            };
          }
        }
      }
    } catch {
      // Fallback to LLM translation if fetch fails
    }
  }

  // LLM fallback
  const llmRes = await systemApi.sendAIChat(`Translate the following text into ${targetLangName}. Output ONLY the translated text without extra formatting, explanations, or quotes:\n\n${text}`);
  return {
    translatedText: llmRes && llmRes.reply ? llmRes.reply.trim().replace(/^["']|["']$/g, '') : text,
    langName: targetLangName,
    locale: 'en-US'
  };
}

export class AIAgentEngine {
  constructor() {
    this.tasks = JSON.parse(localStorage.getItem('wednesday_tasks') || '[]');
    this.activeTranslationLang = localStorage.getItem('wednesday_active_trans_lang') || null;
    this.activeTopic = localStorage.getItem('wednesday_active_topic') || null;
    this.chatHistory = [];
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

    // Active Topic Context Resolution
    let effectiveQuery = rawQuery;
    const isNewTopicTrigger = (
      lower.startsWith('tell me about') ||
      lower.startsWith('what is') ||
      lower.startsWith('what are') ||
      lower.startsWith('who is') ||
      lower.startsWith('who was') ||
      lower.startsWith('explain') ||
      lower.startsWith('describe') ||
      lower.startsWith('history of')
    );

    if (isNewTopicTrigger) {
      const extractedTopic = rawQuery
        .replace(/^(please\s+)?(tell\s+me\s+about\s+the|tell\s+me\s+about|tell\s+me|what\s+is|what\s+are|who\s+is|who\s+was|explain|describe|history\s+of)\s+/i, '')
        .replace(/\?$/g, '')
        .trim();
      if (extractedTopic && extractedTopic.length > 2) {
        this.activeTopic = extractedTopic;
        localStorage.setItem('wednesday_active_topic', extractedTopic);
      }
    } else if (this.activeTopic) {
      const isFollowUp = (
        lower.includes('it') || lower.includes('its') || lower.includes('this') || lower.includes('that') ||
        lower.includes('subtopic') || lower.includes('sub topic') || lower.includes('subtopics') ||
        lower.includes('types') || lower.includes('example') || lower.includes('code') ||
        lower.includes('function') || lower.includes('variable') || lower.includes('data type') ||
        lower.includes('more detail') || lower.includes('next') || lower.includes('more about') ||
        lower.includes('tell me more') || lower.includes('what else') || lower.includes('how does')
      );

      if (isFollowUp && !lower.includes(this.activeTopic.toLowerCase())) {
        effectiveQuery = `${rawQuery} in ${this.activeTopic}`;
      }
    }

    // -2. INSTANT VOICE CONTROL COMMAND INTERCEPTION
    const cleanCmd = lower.replace(/[^a-z0-9\s]/gi, '').trim();
    const isStopSpeechCmd = (
      cleanCmd === 'stop' || cleanCmd === 'hey stop' || cleanCmd === 'wednesday stop' ||
      cleanCmd === 'please stop' || cleanCmd === 'stop please' || cleanCmd === 'stop speaking' ||
      cleanCmd === 'hey stop speaking' || cleanCmd === 'stop talking' || cleanCmd === 'be quiet' ||
      cleanCmd === 'shut up' || cleanCmd === 'pause' || cleanCmd === 'quiet' || cleanCmd === 'silence' ||
      cleanCmd === 'mute' ||
      /^(hey\s+|please\s+|wednesday\s+)?(stop|pause|quiet|shut\s*up|silence|mute)(\s+speaking|\s+talking|\s+now|\s+wednesday)?$/i.test(cleanCmd)
    );

    if (isStopSpeechCmd) {
      speechEngine.stopSpeaking();
      return {
        reply: personaMode === 'girlfriend' ? 'Stopped speaking babe! 💕' : 'Stopped speaking, Boss Karthik. ⚡',
        toolUsed: 'STOP_SPEECH'
      };
    }

    const isStopMicCmd = (
      cleanCmd === 'stop listening' || cleanCmd === 'mute mic' || cleanCmd === 'turn off mic' || cleanCmd === 'pause mic' ||
      /^(hey\s+|please\s+|wednesday\s+)?(stop\s+listening|mute\s+mic|turn\s+off\s+mic|pause\s+listening)$/i.test(cleanCmd)
    );

    if (isStopMicCmd) {
      speechEngine.stopListening();
      speechEngine.setContinuousVoiceMode(false);
      return {
        reply: personaMode === 'girlfriend' ? 'Paused microphone listening babe! 💕' : 'Paused microphone listening, Boss Karthik. ⚡',
        toolUsed: 'PAUSE_MIC'
      };
    }

    // -1. AUTOMATIC API KEY PASTE DETECTION (Groq: gsk_..., OpenAI: sk-..., Gemini: AIza...)
    const groqKeyMatch = rawQuery.match(/\b(gsk_[A-Za-z0-9_-]{20,})\b/);
    const openAiKeyMatch = rawQuery.match(/\b(sk-proj-[A-Za-z0-9_-]{20,}|sk-[A-Za-z0-9_-]{20,})\b/);
    const geminiKeyMatch = rawQuery.match(/\b(AIzaSy[A-Za-z0-9_-]{30,})\b/);

    if (groqKeyMatch) {
      const key = groqKeyMatch[1];
      localStorage.setItem('wednesday_api_key', key);
      localStorage.setItem('wednesday_ai_provider', 'groq');
      return {
        reply: personaMode === 'girlfriend'
          ? `Yay babe! Groq API Key (\`${key.substring(0, 8)}...\`) saved & activated! Powered by Llama-3.3 70B AI reasoning. 💕`
          : `⚡ Groq Cloud API Key (\`${key.substring(0, 8)}...\`) saved & activated! W.E.D.N.E.S.D.A.Y. is now powered by ultra-fast Llama-3.3 70B AI reasoning. Ask me anything, Boss Karthik!`,
        toolUsed: 'API_KEY_CONFIGURED'
      };
    }
    if (openAiKeyMatch) {
      const key = openAiKeyMatch[1];
      localStorage.setItem('wednesday_api_key', key);
      localStorage.setItem('wednesday_ai_provider', 'openai');
      return {
        reply: personaMode === 'girlfriend'
          ? `OpenAI Key (\`${key.substring(0, 6)}...\`) saved babe! Powered by GPT-4o. 💕`
          : `⚡ OpenAI API Key (\`${key.substring(0, 6)}...\`) saved & activated! W.E.D.N.E.S.D.A.Y. is now powered by ChatGPT GPT-4o. Ask me anything, Boss Karthik!`,
        toolUsed: 'API_KEY_CONFIGURED'
      };
    }
    if (geminiKeyMatch) {
      const key = geminiKeyMatch[1];
      localStorage.setItem('wednesday_api_key', key);
      localStorage.setItem('wednesday_ai_provider', 'gemini');
      return {
        reply: personaMode === 'girlfriend'
          ? `Google Gemini Key (\`${key.substring(0, 8)}...\`) saved babe! 💕`
          : `⚡ Google Gemini API Key (\`${key.substring(0, 8)}...\`) saved & activated! W.E.D.N.E.S.D.A.Y. is now powered by Gemini 2.5 Flash. Ask me anything, Boss Karthik!`,
        toolUsed: 'API_KEY_CONFIGURED'
      };
    }

    // 0.0 LIVE CONTINUOUS TRANSLATION MODE ROUTER (ON / OFF / MODE SWITCH)
    const isStopTrans = lower.includes('stop translation') || lower.includes('exit translation') || lower.includes('stop translating') || lower.includes('off translation') || lower === 'stop translate';
    if (isStopTrans) {
      this.activeTranslationLang = null;
      localStorage.removeItem('wednesday_active_trans_lang');
      return {
        reply: personaMode === 'girlfriend'
          ? "Exited Live Translation Mode babe! Switched back to normal chat mode. 💕"
          : "Exited Live Translation Mode. Switched back to normal mode, Boss Karthik. ⚡",
        toolUsed: 'TRANSLATION_MODE_TOGGLE'
      };
    }

    const knownLanguages = Object.keys(LANG_MAP);
    const foundLangKey = knownLanguages.find(l => lower.includes(l));
    const langObjMatch = foundLangKey ? LANG_MAP[foundLangKey] : null;

    const transTriggers = [
      'translate', 'translet', 'transelete', 'translat', 'transalate',
      'tranlate', 'translte', 'traslate', 'trnsulate', 'convert', 'change to',
      'say in', 'speak in', 'how to say'
    ];
    const isTransAction = transTriggers.some(t => lower.includes(t));

    const isActivateTransMode = (
      lower.startsWith('translate into') ||
      lower.startsWith('translate in') ||
      lower.startsWith('translet into') ||
      lower.startsWith('transelete into') ||
      lower.startsWith('translet in') ||
      lower.startsWith('start translation') ||
      lower.startsWith('convert into') ||
      lower.startsWith('convert in') ||
      (foundLangKey && (lower === `translate into ${foundLangKey}` || lower === `translate in ${foundLangKey}` || lower === `translate ${foundLangKey}` || lower === `translet ${foundLangKey}` || lower === `transelete ${foundLangKey}`))
    );

    if (isActivateTransMode && langObjMatch) {
      this.activeTranslationLang = langObjMatch.name;
      localStorage.setItem('wednesday_active_trans_lang', langObjMatch.name);
      return {
        reply: personaMode === 'girlfriend'
          ? `Live Continuous Translation Mode ON! Anything you say now will be automatically translated into ${langObjMatch.name} babe! 💕\n\n(Say "stop translation" anytime to exit).`
          : `Live Continuous Translation Mode ON! Anything you say now will be automatically translated into ${langObjMatch.name}, Boss Karthik! 🌐\n\n(Say "stop translation" anytime to exit).`,
        spokenReply: `Live Translation Mode active for ${langObjMatch.name}`,
        toolUsed: 'TRANSLATION_MODE_TOGGLE'
      };
    }

    // REAL-TIME ACCURATE DATE, TIME & OS TELEMETRY INTENT ROUTER
    const isDateQuery = (
      lower.includes('date') || lower.includes('day is today') || lower.includes('what day is it') || lower.includes('what day') ||
      lower.includes('today date') || lower.includes('todays date') || lower.includes("today's date") ||
      lower.includes('current date') || lower.includes('tell me date') || lower.includes('tell me today date')
    ) && !lower.includes('update') && !lower.includes('validate') && !lower.includes('candidate');

    const isTimeQuery = (
      lower.includes('what is the time') || lower.includes('what time') || lower.includes('current time') ||
      lower.includes('tell me time') || lower.includes('time now') || lower.includes('clock') || lower === 'time'
    ) && !lower.includes('runtime') && !lower.includes('uptime') && !lower.includes('anime') && !lower.includes('timer') && !lower.includes('sometimes');

    const isOsQuery = (
      lower.includes('os') || lower.includes('operating system') || lower.includes('my os') ||
      lower.includes('system info') || lower.includes('system information') || lower.includes('pc info') ||
      lower.includes('hardware') || lower.includes('telemetry') || lower.includes('specs') || lower.includes('pc specs')
    ) && !lower.includes('close') && !lower.includes('cosmos') && !lower.includes('microsoft');

    if (!result && (isDateQuery || isTimeQuery || isOsQuery)) {
      const info = systemApi.getSystemClockAndOSInfo();
      let replyMsg = '';
      let spokenMsg = '';

      if (isOsQuery) {
        replyMsg = personaMode === 'girlfriend'
          ? `Here is your OS & laptop hardware telemetry status babe! 💻\n\n` +
            `• **Operating System**: **${info.osName}**\n` +
            `• **Current System Date**: **${info.dateStr}**\n` +
            `• **Current Local Time**: **${info.timeStr}** (${info.tzStr})\n` +
            `• **CPU Hardware**: **${info.cores}-Core High-Performance Processor**\n` +
            `• **Physical RAM**: **${info.ramGB} GB RAM**\n` +
            `• **Primary User**: **Boss Karthik** 💕`
          : `⚡ **W.E.D.N.E.S.D.A.Y. OS & System Telemetry Status**:\n\n` +
            `• **Operating System**: **${info.osName}**\n` +
            `• **Current System Date**: **${info.dateStr}**\n` +
            `• **Current System Clock**: **${info.timeStr}** (${info.tzStr})\n` +
            `• **CPU Architecture**: **${info.cores}-Core Processor**\n` +
            `• **System Memory**: **${info.ramGB} GB RAM**\n` +
            `• **Host User**: **Boss Karthik** ⚡`;
        spokenMsg = `Your system is running ${info.osName}. Today is ${info.dateStr}, and the current time is ${info.timeStr}.`;
      } else if (isDateQuery && isTimeQuery) {
        replyMsg = personaMode === 'girlfriend'
          ? `Today is **${info.dateStr}**, and the current time is **${info.timeStr}** (${info.tzStr}) babe! 📅🕒`
          : `Today is **${info.dateStr}**, and the current time is **${info.timeStr}** (${info.tzStr}), Boss Karthik! 📅🕒`;
        spokenMsg = `Today is ${info.dateStr}, and the current time is ${info.timeStr}`;
      } else if (isDateQuery) {
        replyMsg = personaMode === 'girlfriend'
          ? `Today is **${info.dateStr}** babe! 📅`
          : `Today is **${info.dateStr}**, Boss Karthik! 📅`;
        spokenMsg = `Today is ${info.dateStr}`;
      } else {
        replyMsg = personaMode === 'girlfriend'
          ? `The current time is **${info.timeStr}** (${info.tzStr}) babe! 🕒`
          : `The current time is **${info.timeStr}** (${info.tzStr}), Boss Karthik! 🕒`;
        spokenMsg = `The current time is ${info.timeStr}`;
      }

      return {
        reply: replyMsg,
        spokenReply: spokenMsg,
        toolUsed: 'REALTIME_DATE_TIME_OS'
      };
    }

    // 0. INSTANT OMNISCIENT KNOWLEDGE LOOKUP (ZERO DELAY)
    if (!this.activeTranslationLang) {
      const instantAns = omniscientKnowledgeEngine.findInstantAnswer(rawQuery);
      if (instantAns) {
        result = {
          reply: instantAns,
          toolUsed: 'OMNISCIENT_CORE'
        };
      }
    }

    // 0. CHECK USER-TRAINED COMMANDS FIRST!
    if (!result && !this.activeTranslationLang) {
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
    }

    // Negative / Anti-Tab Phrase Guard
    const isNegativeTabCmd = (
      lower.includes('not asking') ||
      lower.includes("don't open") ||
      lower.includes('dont open') ||
      lower.includes('stop opening') ||
      lower.includes('no tab') ||
      lower.includes('do not open') ||
      lower.includes('not open') ||
      lower.includes('without opening') ||
      lower.includes('dont launch') ||
      lower.includes("don't launch")
    );

    // Information / Question Query Guard (Do not launch apps when asking for information/questions!)
    const isInfoOrQuestionQuery = (
      lower.startsWith('tell me') ||
      lower.startsWith('tell ') ||
      lower.startsWith('what ') ||
      lower.startsWith('what is') ||
      lower.startsWith("what's") ||
      lower.startsWith('what are') ||
      lower.startsWith('what do') ||
      lower.startsWith('what can') ||
      lower.startsWith('who ') ||
      lower.startsWith('who is') ||
      lower.startsWith('who made') ||
      lower.startsWith('who created') ||
      lower.startsWith('who founded') ||
      lower.startsWith('who owns') ||
      lower.startsWith('how ') ||
      lower.startsWith('how to') ||
      lower.startsWith('how do') ||
      lower.startsWith('how does') ||
      lower.startsWith('how can') ||
      lower.startsWith('how works') ||
      lower.startsWith('explain') ||
      lower.startsWith('describe') ||
      lower.startsWith('details') ||
      lower.startsWith('info') ||
      lower.startsWith('information') ||
      lower.startsWith('meaning') ||
      lower.startsWith('definition') ||
      lower.startsWith('why ') ||
      lower.startsWith('why is') ||
      lower.startsWith('why do') ||
      lower.startsWith('why does') ||
      lower.startsWith('why use') ||
      lower.startsWith('is ') ||
      lower.startsWith('can ') ||
      lower.startsWith('could ') ||
      lower.startsWith('would ') ||
      lower.startsWith('should ') ||
      lower.startsWith('do ') ||
      lower.startsWith('does ') ||
      lower.startsWith('give me') ||
      lower.startsWith('show details') ||
      lower.startsWith('show info') ||
      lower.includes('tell me') ||
      lower.includes('details about') ||
      lower.includes('info about') ||
      lower.includes('information about') ||
      lower.includes('what is') ||
      lower.includes('how to use') ||
      lower.includes('how does') ||
      lower.includes('who created') ||
      lower.includes('who made') ||
      lower.includes('who founded')
    ) && !lower.startsWith('open ') && !lower.startsWith('launch ') && !lower.startsWith('start ') && !lower.startsWith('run ') && !lower.startsWith('play ');

    // Dedicated YouTube Command Router (Handles explicit open/play/search commands ONLY)
    const hasYtAction = (
      lower === 'youtube' || lower === 'yt' ||
      lower.startsWith('open youtube') || lower.startsWith('launch youtube') ||
      (lower.startsWith('play ') && lower.includes('youtube')) ||
      (lower.startsWith('search ') && lower.includes('youtube')) ||
      (lower.startsWith('watch ') && lower.includes('youtube')) ||
      lower.includes('on youtube') || lower.includes('in youtube') || lower.includes('open in youtube') ||
      lower.includes('youtube search') || lower.includes('search on youtube') || lower.includes('play on youtube') ||
      (lower.startsWith('youtube ') && !isInfoOrQuestionQuery) ||
      (lower.startsWith('yt ') && !isInfoOrQuestionQuery)
    );
    const isExplicitYtCmd = !isNegativeTabCmd && !isInfoOrQuestionQuery && hasYtAction;

    if (!result && isExplicitYtCmd) {
      let ytTarget = rawQuery
        .replace(/^(please\s+)?(open|launch|start|show|play|search|find|look\s+up)\s+/i, '')
        .replace(/^(in\s+youtube|on\s+youtube|open\s+in\s+youtube)\s+/i, '')
        .replace(/\s+(on|in|at|using|via)\s+youtube$/i, '')
        .replace(/\s+(on|in|at)\s+yt$/i, '')
        .replace(/^youtube\s+(and\s+)?(search|play|for|show|open)?\s*/i, '')
        .replace(/^yt\s+(and\s+)?(search|play|for|show|open)?\s*/i, '')
        .replace(/\s*channel\s*/gi, ' ')
        .trim();

      if (ytTarget.toLowerCase() === 'youtube' || ytTarget.toLowerCase() === 'yt' || !ytTarget) {
        await systemApi.launchApp('youtube');
        const ytUrl = 'https://www.youtube.com';
        result = {
          reply: personaMode === 'girlfriend'
            ? `Opening YouTube App on PC for you babe! 📺\n\n👉 [Click here to open YouTube Web](${ytUrl})`
            : `Opening YouTube App on PC, Boss Karthik! 📺\n\n👉 [Click here to open YouTube Web](${ytUrl})`,
          toolUsed: 'YOUTUBE_OPEN'
        };
      } else {
        const ytSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(ytTarget)}`;
        await systemApi.openUrl(ytSearchUrl);
        result = {
          reply: personaMode === 'girlfriend'
            ? `Opening YouTube search for "${ytTarget}" babe! 📺\n\n👉 [Click here to open YouTube search](${ytSearchUrl})`
            : `Opening YouTube search for "${ytTarget}", Boss Karthik! 📺\n\n👉 [Click here to open YouTube search](${ytSearchUrl})`,
          toolUsed: 'YOUTUBE_SEARCH'
        };
      }
    }

    // Dedicated Google Command Router (Handles explicit open/search commands ONLY)
    const hasGoogleAction = (
      lower === 'google' ||
      lower.startsWith('open google') || lower.startsWith('launch google') || lower.startsWith('google search ') ||
      lower.includes('in google search') || lower.includes('on google search') || lower.includes('open in google') || lower.includes('search on google') ||
      (lower.startsWith('google ') && !isInfoOrQuestionQuery)
    );
    const isExplicitGoogleCmd = !isNegativeTabCmd && !isInfoOrQuestionQuery && hasGoogleAction;

    if (!result && isExplicitGoogleCmd) {
      let gTarget = rawQuery
        .replace(/^(please\s+)?(open|launch|start|show|play|search|find|look\s+up)\s+/i, '')
        .replace(/^(in\s+google|on\s+google|open\s+in\s+google)\s+/i, '')
        .replace(/\s+(on|in|at|using|via)\s+google$/i, '')
        .replace(/^google\s+(and\s+)?(search|for|show|open)?\s*/i, '')
        .trim();

      if (gTarget.toLowerCase() === 'google' || !gTarget) {
        await systemApi.launchApp('google');
        const googleUrl = 'https://www.google.com';
        result = {
          reply: personaMode === 'girlfriend'
            ? `Opening Google App/Browser on PC for you babe! 🌐\n\n👉 [Click here to open Google Web](${googleUrl})`
            : `Opening Google App/Browser on PC, Boss Karthik! 🌐\n\n👉 [Click here to open Google Web](${googleUrl})`,
          toolUsed: 'GOOGLE_OPEN'
        };
      } else {
        const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(gTarget)}`;
        await systemApi.openUrl(googleSearchUrl);
        result = {
          reply: personaMode === 'girlfriend'
            ? `Opening Google search for "${gTarget}" babe! 🌐\n\n👉 [Click here to open Google search](${googleSearchUrl})`
            : `Opening Google search for "${gTarget}", Boss Karthik! 🌐\n\n👉 [Click here to open Google search](${googleSearchUrl})`,
          toolUsed: 'GOOGLE_SEARCH'
        };
      }
    }

    // Dedicated Spotify Command Router (Handles explicit open/play commands ONLY)
    const hasSpotifyAction = (
      lower === 'spotify' ||
      lower.startsWith('open spotify') || lower.startsWith('launch spotify') ||
      (lower.startsWith('play ') && lower.includes('spotify')) ||
      (lower.startsWith('listen to ') && lower.includes('spotify')) ||
      lower.includes('on spotify') || lower.includes('in spotify') || lower.includes('open in spotify') || lower.includes('play on spotify') ||
      (lower.startsWith('spotify ') && !isInfoOrQuestionQuery)
    );
    const isExplicitSpotifyCmd = !isNegativeTabCmd && !isInfoOrQuestionQuery && hasSpotifyAction;

    if (!result && isExplicitSpotifyCmd) {
      let sTarget = rawQuery
        .replace(/^(please\s+)?(open|launch|start|show|play|sing|search|listen\s+to)\s+/i, '')
        .replace(/^(in\s+spotify|on\s+spotify|open\s+in\s+spotify)\s+/i, '')
        .replace(/\s+(on|in|at|using|via)\s+spotify$/i, '')
        .replace(/^spotify\s+(and\s+)?(play|search|for|show|open)?\s*/i, '')
        .replace(/\s+songs?$/i, '')
        .trim();

      if (sTarget.toLowerCase() === 'spotify' || !sTarget) {
        await systemApi.launchApp('spotify');
        const spotifyUrl = 'https://open.spotify.com';
        result = {
          reply: personaMode === 'girlfriend'
            ? `Opening Spotify Desktop App on PC for you babe! 🎵\n\n👉 [Click here to open Spotify Web](${spotifyUrl})`
            : `Opening Spotify Desktop App on PC, Boss Karthik! 🎵\n\n👉 [Click here to open Spotify Web](${spotifyUrl})`,
          toolUsed: 'SPOTIFY_OPEN'
        };
      } else {
        const spotifySearchUrl = `https://open.spotify.com/search/${encodeURIComponent(sTarget)}`;
        await systemApi.openUrl(spotifySearchUrl);
        result = {
          reply: personaMode === 'girlfriend'
            ? `Playing "${sTarget}" on Spotify for you babe! 🎵\n\n👉 [Click here to listen on Spotify](${spotifySearchUrl})`
            : `Playing "${sTarget}" on Spotify, Boss Karthik! 🎵\n\n👉 [Click here to listen on Spotify](${spotifySearchUrl})`,
          toolUsed: 'SPOTIFY_PLAY'
        };
      }
    }

    // Dedicated WhatsApp Command Router (Handles explicit open/chat commands ONLY)
    const hasWhatsAppAction = (
      lower === 'whatsapp' || lower === 'whats app' ||
      lower.startsWith('open whatsapp') || lower.startsWith('launch whatsapp') || lower.startsWith('start whatsapp') ||
      lower.includes('chat with') || lower.includes('send message to') ||
      (lower.includes('message') && (lower.includes('whatsapp') || lower.includes('whats app'))) ||
      lower.includes('on whatsapp') || lower.includes('in whatsapp') || lower.includes('whatsapp web') ||
      (lower.startsWith('open ') && (lower.includes('whatsapp') || lower.includes('whats app'))) ||
      (lower.startsWith('launch ') && (lower.includes('whatsapp') || lower.includes('whats app'))) ||
      (lower.startsWith('whatsapp ') && !isInfoOrQuestionQuery) ||
      (lower.startsWith('whats app ') && !isInfoOrQuestionQuery)
    );
    const isExplicitWhatsAppCmd = !isNegativeTabCmd && !isInfoOrQuestionQuery && hasWhatsAppAction;

    if (!result && isExplicitWhatsAppCmd) {
      let wTarget = rawQuery
        .replace(/^(please\s+)?(open|launch|start|show|chat\s+with|message|send\s+message\s+to)\s+/i, '')
        .replace(/^(in\s+whatsapp|on\s+whatsapp|open\s+in\s+whatsapp)\s+/i, '')
        .replace(/\s+(on|in|at|using|via)\s+(whatsapp|whats\s+app)$/i, '')
        .replace(/^(whatsapp|whats\s+app)\s+(for|to|contact)?\s*/i, '')
        .trim();

      let waUrl = 'https://web.whatsapp.com';
      const phoneDigits = wTarget.replace(/[^0-9]/g, '');

      if (phoneDigits.length >= 10) {
        waUrl = `https://web.whatsapp.com/send?phone=${phoneDigits}`;
      }

      await systemApi.launchApp('whatsapp');

      if (wTarget.toLowerCase() === 'whatsapp' || wTarget.toLowerCase() === 'whats app' || !wTarget) {
        result = {
          reply: personaMode === 'girlfriend'
            ? `Opening WhatsApp Desktop App on PC for you babe! 💬\n\n👉 [Click here to open WhatsApp Web](${waUrl})`
            : `Opening WhatsApp Desktop App on PC, Boss Karthik! 💬\n\n👉 [Click here to open WhatsApp Web](${waUrl})`,
          toolUsed: 'WHATSAPP_OPEN'
        };
      } else {
        result = {
          reply: personaMode === 'girlfriend'
            ? `Opening WhatsApp App for contact "${wTarget}" babe! 💬\n\n👉 [Click here to chat on WhatsApp](${waUrl})`
            : `Opening WhatsApp App for contact "${wTarget}", Boss Karthik! 💬\n\n👉 [Click here to chat on WhatsApp](${waUrl})`,
          toolUsed: 'WHATSAPP_CONTACT'
        };
      }
    }

    // Dedicated Instagram Command Router (Handles explicit open/view commands ONLY)
    const hasInstagramAction = (
      lower === 'instagram' || lower === 'insta' ||
      lower.startsWith('open instagram') || lower.startsWith('launch instagram') || lower.startsWith('open insta') ||
      lower.includes('on instagram') || lower.includes('in instagram') || lower.includes('open in instagram') || lower.includes('view profile') ||
      (lower.startsWith('instagram ') && !isInfoOrQuestionQuery) ||
      (lower.startsWith('insta ') && !isInfoOrQuestionQuery)
    );
    const isExplicitInstagramCmd = !isNegativeTabCmd && !isInfoOrQuestionQuery && hasInstagramAction;

    if (!result && isExplicitInstagramCmd) {
      let instaTarget = rawQuery
        .replace(/^(please\s+)?(open|launch|start|show)\s+/i, '')
        .replace(/^(in\s+instagram|on\s+instagram|open\s+in\s+instagram)\s+/i, '')
        .replace(/\s+(on|in|at|using|via)\s+(instagram|insta)$/i, '')
        .replace(/^(instagram|insta)\s*/i, '')
        .trim();

      await systemApi.launchApp('instagram');
      const instaUrl = 'https://www.instagram.com';

      if (!instaTarget || instaTarget.toLowerCase() === 'instagram' || instaTarget.toLowerCase() === 'insta') {
        result = {
          reply: personaMode === 'girlfriend'
            ? `Opening Instagram App on PC for you babe! 📸\n\n👉 [Click here to open Instagram Web](${instaUrl})`
            : `Opening Instagram App on PC, Boss Karthik! 📸\n\n👉 [Click here to open Instagram Web](${instaUrl})`,
          toolUsed: 'INSTAGRAM_OPEN'
        };
      } else {
        const profileUrl = `https://www.instagram.com/${encodeURIComponent(instaTarget)}`;
        await systemApi.openUrl(profileUrl);
        result = {
          reply: personaMode === 'girlfriend'
            ? `Opening Instagram profile for "${instaTarget}" babe! 📸\n\n👉 [Click here to view Instagram profile](${profileUrl})`
            : `Opening Instagram profile for "${instaTarget}", Boss Karthik! 📸\n\n👉 [Click here to view Instagram profile](${profileUrl})`,
          toolUsed: 'INSTAGRAM_PROFILE'
        };
      }
    }

    // Dedicated Notepad & PC Dictation Command Router (Handles explicit open/write commands ONLY)
    const hasNotepadAction = (
      lower === 'notepad' || lower === 'note pad' ||
      lower.startsWith('open notepad') || lower.startsWith('launch notepad') || lower.startsWith('start notepad') ||
      lower.includes('write in notepad') || lower.includes('type in notepad') || lower.includes('dictate') || lower.includes('in notepad') || lower.includes('on notepad') ||
      (lower.startsWith('notepad ') && !isInfoOrQuestionQuery) ||
      (lower.startsWith('note pad ') && !isInfoOrQuestionQuery)
    );
    const isExplicitNotepadCmd = !isNegativeTabCmd && !isInfoOrQuestionQuery && hasNotepadAction;

    if (!result && isExplicitNotepadCmd) {
      let noteText = rawQuery
        .replace(/^(please\s+)?(open|launch|start)\s+/i, '')
        .replace(/^(notepad|note\s+pad)\s+(in\s+pc\s+)?(and\s+)?(write|print|type)?\s*/i, '')
        .replace(/\s+(in|on)\s+(notepad|note\s+pad|pc)$/i, '')
        .replace(/^(write|print|type)\s+/i, '')
        .trim();

      if (noteText.toLowerCase() === 'notepad' || noteText.toLowerCase() === 'in pc' || !noteText) {
        noteText = 'Note by Boss Karthik - ' + new Date().toLocaleString();
      }

      await systemApi.launchApp('notepad');

      const blob = new Blob([noteText], { type: 'text/plain;charset=utf-8' });
      const noteUrl = URL.createObjectURL(blob);

      result = {
        reply: personaMode === 'girlfriend'
          ? `Opening Notepad on your PC babe! 📝\n\n**Dictated Content**:\n\`\`\`text\n${noteText}\n\`\`\`\n👉 [Click here to download text note](${noteUrl})`
          : `Opening Notepad on your PC, Boss Karthik! 📝\n\n**Dictated Content**:\n\`\`\`text\n${noteText}\n\`\`\`\n👉 [Click here to download text note](${noteUrl})`,
        toolUsed: 'NOTEPAD_DICTATE'
      };
    }

    // 0.1 PRO MULTI-LANGUAGE TRANSLATOR ENGINE (EXPLICIT TRANSLATION COMMANDS ONLY)
    const isExplicitTranslateReq = isTransAction || lower.startsWith('translate ') || lower.startsWith('convert ') || lower.startsWith('how to say ');

    if (!result && (this.activeTranslationLang || isExplicitTranslateReq)) {
      let targetLang = foundLangKey ? (LANG_MAP[foundLangKey]?.name || foundLangKey) : (this.activeTranslationLang || 'Telugu');
      let textToTranslate = null;

      // Pattern 1: "(translate/translet/transelete/convert/etc) <text> (into/to/in) <lang>"
      const match1 = rawQuery.match(/(?:convert|translate|translet|transelete|translat|transalate|tranlate|translte|traslate|change|say|speak)\s+(.+?)\s+(?:into|to|in)\s+([a-zA-Z]+)$/i);
      // Pattern 2: "(translate/translet/transelete/convert/etc) (into/to/in) <lang>[:\s]+<text>"
      const match2 = rawQuery.match(/(?:convert|translate|translet|transelete|translat|transalate|tranlate|translte|traslate|change|say|speak)\s+(?:into|to|in)\s+([a-zA-Z]+)[:\s]+(.+)$/i);

      if (match1) {
        textToTranslate = match1[1].trim();
        targetLang = match1[2].trim();
      } else if (match2) {
        targetLang = match2[1].trim();
        textToTranslate = match2[2].trim();
      } else if (foundLangKey) {
        const cleanText = rawQuery
          .replace(/(?:convert|translate|translet|transelete|translat|transalate|tranlate|translte|traslate|change|say|speak|how\s+to\s+say)/gi, '')
          .replace(new RegExp(`(?:into|to|in)\\s+${foundLangKey}`, 'gi'), '')
          .replace(new RegExp(`${foundLangKey}`, 'gi'), '')
          .trim();
        textToTranslate = cleanText || rawQuery;
      } else if (this.activeTranslationLang) {
        textToTranslate = rawQuery
          .replace(/(?:convert|translate|translet|transelete|translat|transalate|tranlate|translte|traslate|change|say|speak)/gi, '')
          .trim() || rawQuery;
      }

      if (targetLang && textToTranslate && textToTranslate.length > 0) {
        const translationRes = await translateText(textToTranslate, targetLang);
        result = {
          reply: personaMode === 'girlfriend'
            ? `Here is "${textToTranslate}" in ${translationRes.langName} babe! 💕\n\n👉 **${translationRes.translatedText}**`
            : `Translated "${textToTranslate}" to ${translationRes.langName}, Boss Karthik:\n\n👉 **${translationRes.translatedText}**`,
          spokenReply: translationRes.translatedText,
          speakLang: translationRes.locale,
          toolUsed: 'MULTI_LANGUAGE_TRANSLATOR'
        };
      }
    }

    // 0.5 MUSIC & PLAY SONG COMMAND ENGINE
    if (!result && (lower.startsWith('play ') || lower.startsWith('sing ') || lower.includes('play song') || lower.includes('play music') || lower.includes('listen to'))) {
      let songQuery = rawQuery
        .replace(/^(please\s+)?(play\s+song|play\s+music|play|sing\s+song|sing|listen\s+to)\s+/i, '')
        .trim();

      if (!songQuery || songQuery.toLowerCase() === 'songs' || songQuery.toLowerCase() === 'music' || songQuery.toLowerCase() === 'some songs' || songQuery.toLowerCase() === 'some music') {
        songQuery = 'top trending songs';
      }

      let platform = 'YouTube';
      let playUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(songQuery)}`;

      if (lower.includes('on spotify') || lower.startsWith('spotify ')) {
        platform = 'Spotify';
        songQuery = songQuery.replace(/\s+on\s+spotify$/i, '').replace(/^spotify\s+/i, '').trim();
        playUrl = `https://open.spotify.com/search/${encodeURIComponent(songQuery)}`;
      } else if (lower.includes('on youtube')) {
        songQuery = songQuery.replace(/\s+on\s+youtube$/i, '').trim();
      }

      await systemApi.openUrl(playUrl);
      result = {
        reply: personaMode === 'girlfriend'
          ? `Playing "${songQuery}" for you babe on ${platform}! 🎵\n\n👉 [Click here to listen on ${platform}](${playUrl})`
          : `Playing "${songQuery}" on ${platform}, Boss Karthik! 🎵\n\n👉 [Click here to listen on ${platform}](${playUrl})`,
        toolUsed: 'PLAY_SONG'
      };
    }

    // 1. UNIVERSAL CLOSE / SHUTDOWN PROCESS HANDLER
    if (!result && (lower === 'close' || lower === 'close process' || lower === 'stop process' || lower === 'exit' || lower === 'shutdown' || lower === 'turn off')) {
      speechEngine.stopSpeaking();
      speechEngine.stopListening();
      result = {
        reply: personaMode === 'girlfriend' ? 'Closing active processes. Bye babe! 💕' : 'Closing active processes and shutting down. Have a great day, Boss Karthik! ⚡',
        toolUsed: 'SHUTDOWN_PROCESS'
      };
    }

    // 1.5 PRO LAPTOP DESKTOP FOLDER CREATOR (WITH TYPO & FLEXIBLE PHRASING)
    const folderKeywords = ['folder', 'floder', 'foler', 'directory', 'dir'];
    const locationKeywords = ['desktop', 'home page', 'laptop'];
    const hasFolderWord = folderKeywords.some(k => lower.includes(k));
    const hasCreateWord = lower.includes('create') || lower.includes('make') || lower.includes('build') || lower.includes('add');

    if (!result && (hasCreateWord && (hasFolderWord || locationKeywords.some(k => lower.includes(k))))) {
      let folderName = '';

      // Match explicit "name is <x>", "name: <x>", "named <x>", "called <x>", "floder name is <x>"
      const nameMatch = rawQuery.match(/(?:folder|floder|foler|dir|directory)?\s*(?:name\s+(?:is|was)|named|called)[:\s]+(.+)$/i);
      if (nameMatch && nameMatch[1]) {
        folderName = nameMatch[1]
          .replace(/\b(folder|floder|foler|directory|dir)\b/gi, '')
          .replace(/(on|in|at)\s+(my\s+)?(desktop|laptop\s+home\s+page|laptop|home\s+page)/gi, '')
          .trim();
      }

      if (!folderName) {
        folderName = rawQuery
          .replace(/^(please\s+)?(create|make|build|add)\s+/i, '')
          .replace(/(a\s+)?(folder|floder|foler|directory|dir)\s+/gi, '')
          .replace(/(on|in|at)\s+(my\s+)?(desktop|laptop\s+home\s+page|laptop|home\s+page)\s+/gi, '')
          .replace(/(name\s+(was|is)|named|called)/gi, '')
          .replace(/\s+on\s+(my\s+)?(desktop|laptop\s+home\s+page|laptop|home\s+page)$/gi, '')
          .replace(/\s*(folder|floder|foler|directory|dir)\s*/gi, '')
          .trim();
      }

      if (!folderName || folderName.toLowerCase() === 'folder' || folderName.toLowerCase() === 'floder') {
        folderName = 'tuesday';
      }

      folderName = folderName.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');

      const res = await systemApi.createDir(`Desktop/${folderName}`);
      result = {
        reply: res.success
          ? (personaMode === 'girlfriend'
            ? `Created folder "${folderName}" on your laptop Desktop for you babe! 📁`
            : `Created folder "${folderName}" directly on your laptop Desktop home page, Boss Karthik! 📁`)
          : `Failed to create folder: ${res.error}`,
        toolUsed: 'CREATE_DESKTOP_DIR'
      };
    }

    // 2. UNIVERSAL OPEN-ANYTHING ROUTER (WEBSITES, APPS, DESKTOP TOOLS)
    const isExplicitOpenCmd = !isNegativeTabCmd && !isInfoOrQuestionQuery && (
      lower.startsWith('open ') ||
      lower.startsWith('launch ') ||
      lower.startsWith('start ') ||
      lower.startsWith('run ') ||
      lower.startsWith('go to ') ||
      lower === 'youtube' ||
      lower === 'google' ||
      lower === 'github' ||
      lower === 'spotify' ||
      lower === 'instagram' ||
      lower === 'wikipedia' ||
      lower === 'copilot' ||
      lower === 'whatsapp'
    );

    if (!result && isExplicitOpenCmd) {
      let target = lower.replace(/^(please\s+)?(open|launch|start|run)\s+/i, '').trim();
      if (lower === 'youtube' || lower === 'open youtube') target = 'youtube';
      else if (lower === 'google' || lower === 'open google') target = 'google';
      else if (lower === 'spotify' || lower === 'open spotify') target = 'spotify';
      else if (lower === 'github' || lower === 'open github') target = 'github';
      else if (lower === 'wikipedia' || lower === 'open wikipedia') target = 'wikipedia';
      else if (lower === 'instagram' || lower === 'open instagram') target = 'instagram';
      else if (lower === 'copilot' || lower === 'open copilot' || lower === 'copilt' || lower === 'open copilt') target = 'copilot';

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
        'gmail': 'https://mail.google.com',
        'copilot': 'https://copilot.microsoft.com',
        'ms copilot': 'https://copilot.microsoft.com',
        'copilt': 'https://copilot.microsoft.com'
      };

      const knownAppsMap = {
        'whatsapp': 'whatsapp',
        'whats app': 'whatsapp',
        'instagram': 'instagram',
        'insta': 'instagram',
        'spotify': 'spotify',
        'youtube': 'youtube',
        'yt': 'youtube',
        'google': 'google',
        'discord': 'discord',
        'telegram': 'telegram',
        'copilot': 'copilot',
        'ms copilot': 'copilot',
        'copilt': 'copilot',
        'word': 'word',
        'msword': 'word',
        'ms word': 'word',
        'excel': 'excel',
        'msexcel': 'excel',
        'ms excel': 'excel',
        'powerpoint': 'powerpoint',
        'ppt': 'powerpoint',
        'zoom': 'zoom',
        'vlc': 'vlc',
        'steam': 'steam',
        'cmd': 'cmd',
        'command prompt': 'cmd',
        'prompt': 'cmd',
        'terminal': 'terminal',
        'powershell': 'powershell',
        'file manager': 'file manager',
        'my file manager': 'my file manager',
        'file explorer': 'file explorer',
        'explorer': 'explorer',
        'files': 'files',
        'my files': 'my files',
        'downloads': 'downloads',
        'my downloads': 'downloads',
        'documents': 'documents',
        'my documents': 'documents',
        'desktop': 'desktop',
        'my desktop': 'desktop',
        'calculator': 'calc',
        'calc': 'calc',
        'notepad': 'notepad',
        'paint': 'paint',
        'task manager': 'taskmgr',
        'taskmgr': 'taskmgr',
        'control panel': 'control',
        'settings': 'settings',
        'pc settings': 'settings',
        'vscode': 'vscode',
        'vs code': 'vscode',
        'code': 'vscode',
        'snipping tool': 'snipping tool',
        'screenshot': 'snipping tool',
        'lock': 'lock',
        'lock pc': 'lock'
      };

      if (knownAppsMap[target]) {
        const appRes = await systemApi.launchApp(knownAppsMap[target]);
        result = {
          reply: appRes.success
            ? (personaMode === 'girlfriend'
              ? `Opening ${target} app directly on your PC babe! ⚡`
              : `Launching ${target} app directly on your PC, Boss Karthik! ⚡`)
            : `Error opening ${target}: ${appRes.error}`,
          toolUsed: 'LAUNCH_APP'
        };
      } else if (commonSites[target]) {
        const siteUrl = commonSites[target];
        await systemApi.openUrl(siteUrl);
        result = {
          reply: personaMode === 'girlfriend'
            ? `Opening ${target} directly for you babe! 🌐`
            : `Opening ${target} directly, Boss Karthik! 🌐`,
          toolUsed: 'OPEN_URL'
        };
      } else if (target.includes('.') || target.includes('www') || target.includes('http')) {
        let siteUrl = target;
        if (!siteUrl.startsWith('http://') && !siteUrl.startsWith('https://')) siteUrl = `https://${siteUrl}`;
        await systemApi.openUrl(siteUrl);
        result = {
          reply: `Opening ${target} directly, Boss Karthik! 🌐`,
          toolUsed: 'OPEN_URL'
        };
      } else {
        // Desktop App or generic URL fallback
        const appRes = await systemApi.launchApp(target);
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(target)}`;
        if (!appRes.success || appRes.message.includes('requires running')) {
          await systemApi.openUrl(searchUrl);
        }
        result = {
          reply: `Opening ${target} directly, Boss Karthik! ⚡`,
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

    // 4. DESKTOP APPLICATION LAUNCHING FALLBACK (EXPLICIT OPEN / LAUNCH COMMANDS ONLY)
    if (!result && !isNegativeTabCmd && !isInfoOrQuestionQuery) {
      const hasLaunchPrefix = lower.startsWith('open ') || lower.startsWith('launch ') || lower.startsWith('start ') || lower.startsWith('run ') || lower.startsWith('go to ');

      const appKeywords = {
        'my file manager': 'my file manager',
        'file manager': 'file manager',
        'file explorer': 'file explorer',
        'explorer': 'explorer',
        'my files': 'my files',
        'files': 'files',
        'command prompt': 'cmd',
        'prompt': 'cmd',
        'cmd': 'cmd',
        'terminal': 'terminal',
        'powershell': 'powershell',
        'notepad': 'notepad',
        'calculator': 'calculator',
        'calc': 'calculator',
        'paint': 'paint',
        'control panel': 'control',
        'chrome': 'chrome',
        'browser': 'browser',
        'vs code': 'vscode',
        'vscode': 'vscode',
        'task manager': 'taskmgr',
        'taskmgr': 'taskmgr',
        'settings': 'settings'
      };

      for (const [key, appName] of Object.entries(appKeywords)) {
        if ((hasLaunchPrefix && lower.includes(key)) || lower === key) {
          const res = await systemApi.launchApp(appName);
          result = {
            reply: res.success ? (personaMode === 'girlfriend' ? `Opening ${key} for you sweetheart!` : `Opening ${key} on desktop, Boss Karthik. ⚡`) : `Error opening ${key}: ${res.error}`,
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
      const fallbackReply = systemApi.generateAutonomousKnowledge(rawQuery, personaMode);
      result = {
        reply: fallbackReply,
        toolUsed: 'AUTONOMOUS_SYNTHESIZER'
      };
    }

    // AUTONOMOUS CONTINUOUS MACHINE LEARNING
    autoMlEngine.learnFromInteraction(rawQuery, result.reply, personaMode, result.toolUsed);

    if (result && result.reply) {
      result.reply = ensureResponseHasImage(result.reply, rawQuery);
    }

    return result;
  }
}

function isExplicitImageRequest(prompt) {
  if (!prompt) return false;
  const lower = prompt.toLowerCase().trim();
  return (
    lower.includes('image') ||
    lower.includes('photo') ||
    lower.includes('picture') ||
    lower.includes('wallpaper') ||
    lower.includes('visual of') ||
    lower.includes('draw ') ||
    lower.includes('generate image') ||
    lower.includes('generate photo') ||
    lower.includes('show me a picture') ||
    lower.includes('show picture') ||
    lower.includes('show image') ||
    lower.includes('show photo') ||
    lower.includes('look like')
  );
}

function ensureResponseHasImage(reply, prompt) {
  if (!reply) return reply;

  // ONLY attach an image if the user explicitly requested an image/photo/picture!
  if (!isExplicitImageRequest(prompt)) {
    return reply;
  }

  if (/!\[.*?\]\(https?:\/\/[^\s)]+\)/.test(reply)) {
    return reply;
  }

  const topic = prompt
    .replace(/^(show me|generate|draw|create|make|give me|get me|find|display)?\s*(a|an|the)?\s*(image|photo|picture|wallpaper|visual|drawing)?\s*(of|for|about)?\s*/i, '')
    .replace(/\?$/g, '').trim() || prompt.trim();

  const capTopic = topic ? (topic.charAt(0).toUpperCase() + topic.slice(1)) : 'Photo';
  const encodedTopic = encodeURIComponent(topic || 'nature');

  // Realistic photography prompt without AI girl / anime artifacts
  const imageUrl = `https://image.pollinations.ai/prompt/real%20authentic%20photography%20high%20resolution%20detailed%20photo%20of%20${encodedTopic}%20no%20anime%20no%20cgi%20realistic?width=800&height=450&nologo=true`;

  const imageMarkdown = `![${capTopic} Photo](${imageUrl})\n\n`;
  return imageMarkdown + reply;
}

export const aiAgent = new AIAgentEngine();

