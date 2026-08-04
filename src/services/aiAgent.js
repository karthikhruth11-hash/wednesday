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

    // 0.1 PRO MULTI-LANGUAGE TRANSLATOR ENGINE (ONE-SHOT & CONTINUOUS ACTIVE MODE)
    if (!result && (this.activeTranslationLang || isTransAction || (foundLangKey && (lower.includes('in ') || lower.includes('into ') || lower.includes('to ')))) ) {
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

    // 0.2 PRO YOUTUBE CHANNEL & TOPIC SEARCH ENGINE
    const isYtMentioned = lower.includes('youtube') || lower.includes('yt') || lower.includes('channel');
    const isGenericOnlyYoutube = (lower === 'open youtube' || lower === 'youtube' || lower === 'open yt' || lower === 'yt');

    if (!result && isYtMentioned && !isGenericOnlyYoutube) {
      let ytQuery = rawQuery
        .replace(/^(please\s+)?(open\s+youtube\s+channel|open\s+channel|open\s+youtube\s+and\s+search|open\s+youtube\s+for|open\s+youtube\s+topic|open\s+youtube|open|search\s+on\s+youtube|search\s+youtube|search|show\s+on\s+youtube|show|play\s+on\s+youtube|play\s+channel|play)\s+/i, '')
        .replace(/\s+channel(\s+(on|in)\s+youtube)?$/i, '')
        .replace(/\s+(on|in)\s+youtube$/i, '')
        .replace(/^youtube\s+/i, '')
        .trim();

      if (!ytQuery && lower.includes('channel')) {
        ytQuery = rawQuery.replace(/\s*channel\s*/gi, '').replace(/^(open|play|show|search)\s+/gi, '').trim();
      }

      if (ytQuery && ytQuery.toLowerCase() !== 'youtube' && ytQuery.toLowerCase() !== 'open') {
        const isChannel = lower.includes('channel');
        const searchQuery = isChannel ? `${ytQuery} channel` : ytQuery;
        const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;

        await systemApi.openUrl(ytUrl);
        result = {
          reply: personaMode === 'girlfriend'
            ? `Opening YouTube for ${isChannel ? 'channel' : 'search'} "${ytQuery}" babe! 📺`
            : `Opening YouTube ${isChannel ? 'channel' : 'search'} "${ytQuery}", Boss Karthik! 📺`,
          toolUsed: 'YOUTUBE_PRO_SEARCH'
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
          ? `Playing "${songQuery}" for you babe on ${platform}! 🎵`
          : `Playing "${songQuery}" on ${platform}, Boss Karthik! 🎵`,
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
    if (!result && (lower.includes('youtube') || lower.includes('google') || lower.includes('github') || lower.includes('spotify') || lower.includes('wikipedia') || lower.includes('instagram') || lower.startsWith('open '))) {
      let target = lower.replace(/^(please\s+)?open\s+/i, '').trim();
      if (lower === 'youtube' || lower === 'open youtube') target = 'youtube';
      if (lower.includes('google') && !lower.includes('search')) target = 'google';
      if (lower.includes('spotify') && !lower.includes('play')) target = 'spotify';
      if (lower.includes('github')) target = 'github';
      if (lower.includes('wikipedia')) target = 'wikipedia';
      if (lower.includes('instagram')) target = 'instagram';

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

      const knownAppsMap = {
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

      if (commonSites[target]) {
        await systemApi.openUrl(commonSites[target]);
        result = {
          reply: personaMode === 'girlfriend' ? `Opening ${target} for you babe!` : `Opening ${target}, Boss Karthik. 🌐`,
          toolUsed: 'OPEN_URL'
        };
      } else if (knownAppsMap[target]) {
        const appRes = await systemApi.launchApp(knownAppsMap[target]);
        result = {
          reply: appRes.success
            ? (personaMode === 'girlfriend' ? `Opening ${target} for you babe!` : `Opening ${target} on PC, Boss Karthik. ⚡`)
            : `Error opening ${target}: ${appRes.error}`,
          toolUsed: 'LAUNCH_APP'
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
          reply: `Opening ${target}, Boss Karthik. ⚡`,
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

    // 4. DESKTOP APPLICATION LAUNCHING FALLBACK
    if (!result) {
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
        if (lower.includes(key)) {
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

