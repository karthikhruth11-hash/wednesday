/**
 * Error-Tolerant Input & Tanglish Processor for W.E.D.N.E.S.D.A.Y.
 * Handles typos, phonetic spellings, chat abbreviations, Telugu-English (Tanglish) mix,
 * and extracts continuity & project intent commands.
 */

export class InputProcessor {
  /**
   * Process raw user input to infer true intended meaning and extract command flags.
   */
  static processInput(rawInput) {
    if (!rawInput || typeof rawInput !== 'string') {
      return {
        normalizedIntent: '',
        cleanQuery: '',
        isContinuityReq: false,
        isCodeOnlyReq: false,
        isTanglish: false
      };
    }

    const trimmed = rawInput.trim();
    const lower = trimmed.toLowerCase();

    // 1. Tanglish (Telugu-English) Detection & Translation Mapping
    const tanglishMap = {
      'na ': 'my ',
      'naa ': 'my ',
      'nadi ': 'my ',
      'nakosam ': 'for me ',
      'gurinchi': 'about',
      'cheyali': 'want to do/add',
      'cheyyi': 'do',
      'kavali': 'need',
      'yela': 'how',
      'enti': 'what',
      'eppudu': 'when',
      'ekkada': 'where',
      'enduku': 'why',
      'chudu': 'show/check',
      'chudu ': 'show ',
      'cheppu': 'tell me',
      ' ra': '',
      ' mama': '',
      ' bro': ''
    };

    let isTanglish = false;
    let tanglishNormalized = lower;
    for (const [key, val] of Object.entries(tanglishMap)) {
      if (tanglishNormalized.includes(key)) {
        isTanglish = true;
        tanglishNormalized = tanglishNormalized.replaceAll(key, val);
      }
    }

    // Common Typo & Chat Shortcut Replacements (Silent Normalization)
    const typoReplacements = [
      [/\b(wht|wat|wt|whut)\b/gi, 'what'],
      [/\b(abot|abou|abut|ovut)\b/gi, 'about'],
      [/\b(u|uu|yu|yuo)\b/gi, 'you'],
      [/\b(whit)\b/gi, 'what'],
      [/\b(cod|cde)\b/gi, 'code'],
      [/\b(numbr|nmbr|numb)\b/gi, 'number'],
      [/\b(pls|plz|plse)\b/gi, 'please'],
      [/\b(thx|tnx|thanx)\b/gi, 'thanks'],
      [/\b(tommorow|tomorow|tomm|tommow)\b/gi, 'tomorrow'],
      [/\b(yestday|yesterdy|yest)\b/gi, 'yesterday'],
      [/\b(continew|contineu|contnu)\b/gi, 'continue'],
      [/\b(memry|memoey|memri)\b/gi, 'memory'],
      [/\b(projct|projec|projt)\b/gi, 'project']
    ];

    let normalizedText = lower;
    for (const [pattern, replacement] of typoReplacements) {
      normalizedText = normalizedText.replace(pattern, replacement);
    }

    // Specific phrase matches
    if (lower.includes('whit abou ovut') || lower.includes('wht abot u')) {
      normalizedText = 'what about you';
    } else if (lower.includes('i want python cod for add two numbr')) {
      normalizedText = 'i want python code for adding two numbers';
    } else if (lower.includes('na personal agent lo memory add cheyali')) {
      normalizedText = 'i want to add memory to my personal agent';
    }

    // 2. Continuity / Reference Command Detection
    const isContinuityReq = (
      lower.includes('yesterday i asked') ||
      lower.includes('what did i ask') ||
      lower.includes('continue from where we stopped') ||
      lower.includes('continue that project') ||
      lower.includes('continue my personal agent project') ||
      lower.includes('use the code we created earlier') ||
      lower.includes('continue from last time')
    );

    // 3. Code-Only Request Flag
    const isCodeOnlyReq = (
      lower === 'code only' ||
      lower === 'only code' ||
      lower.startsWith('code only') ||
      lower.endsWith('code only') ||
      lower.includes('just give code')
    );

    return {
      rawInput: trimmed,
      normalizedIntent: normalizedText,
      cleanQuery: normalizedText.charAt(0).toUpperCase() + normalizedText.slice(1),
      isContinuityReq,
      isCodeOnlyReq,
      isTanglish
    };
  }
}
