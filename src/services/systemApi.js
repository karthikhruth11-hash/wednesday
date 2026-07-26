/**
 * Frontend Client API Service for W.E.D.N.E.S.D.A.Y. Backend (http://localhost:3001)
 */

const API_BASE = typeof window !== 'undefined' ? `${window.location.origin}/api` : 'http://localhost:3001/api';

export const systemApi = {
  async launchApp(appName) {
    try {
      const res = await fetch(`${API_BASE}/system/launch-app`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appName })
      });
      return await res.json();
    } catch {
      return { success: false, error: 'Backend server not responding.' };
    }
  },

  async openUrl(url) {
    try {
      const res = await fetch(`${API_BASE}/system/open-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      return await res.json();
    } catch {
      return { success: false, error: 'Backend server not responding.' };
    }
  },

  async createDir(dirPath) {
    try {
      const res = await fetch(`${API_BASE}/system/create-dir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dirPath })
      });
      return await res.json();
    } catch {
      return { success: false, error: 'Backend server not responding.' };
    }
  },

  async execCommand(command) {
    try {
      const res = await fetch(`${API_BASE}/system/exec`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command })
      });
      return await res.json();
    } catch {
      return { success: false, error: 'Backend server not responding.' };
    }
  },

  async getTelemetry() {
    try {
      const res = await fetch(`${API_BASE}/system/telemetry`);
      return await res.json();
    } catch {
      return null;
    }
  },

  async listFiles(dirPath = 'desktop') {
    try {
      const res = await fetch(`${API_BASE}/files/list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dirPath })
      });
      return await res.json();
    } catch {
      return { success: false, error: 'Backend server not responding.' };
    }
  },

  async readFile(filePath) {
    try {
      const res = await fetch(`${API_BASE}/files/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath })
      });
      return await res.json();
    } catch {
      return { success: false, error: 'Backend server not responding.' };
    }
  },

  async writeFile(filePath, content) {
    try {
      const res = await fetch(`${API_BASE}/files/write`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath, content })
      });
      return await res.json();
    } catch {
      return { success: false, error: 'Backend server not responding.' };
    }
  },

  async openFile(filePath) {
    try {
      const res = await fetch(`${API_BASE}/files/open`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath })
      });
      return await res.json();
    } catch {
      return { success: false, error: 'Backend server not responding.' };
    }
  },

  // Send Prompt with Active Persona Mode
  async sendAIChat(prompt, apiKey = '', provider = 'jarvis', personaMode = 'jarvis') {
    try {
      const res = await fetch(`${API_BASE}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, apiKey, provider, personaMode })
      });
      return await res.json();
    } catch {
      return { success: false, error: 'Backend server not responding.' };
    }
  }
};
