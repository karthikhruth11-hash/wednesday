/**
 * W.E.D.N.E.S.D.A.Y. Custom Command & Neural Memory Training Engine
 * Stores user-trained voice triggers, custom responses, and system actions.
 */

class NeuralTrainingEngine {
  constructor() {
    this.trainedCommands = JSON.parse(localStorage.getItem('wednesday_trained_commands') || '[]');
    this.customPersonality = localStorage.getItem('wednesday_custom_personality') || 'Call user Boss and respond as J.A.R.V.I.S.';

    // Default pre-trained commands
    if (this.trainedCommands.length === 0) {
      this.trainedCommands = [
        { id: 1, trigger: 'protocol alpha', actionType: 'LAUNCH_APP', actionValue: 'chrome', response: 'Initiating Protocol Alpha: Opening web browser.' },
        { id: 2, trigger: 'who is your creator', actionType: 'SPEAK', actionValue: '', response: 'I was created and trained by you, Boss.' },
        { id: 3, trigger: 'deploy workspace', actionType: 'LAUNCH_APP', actionValue: 'vscode', response: 'Deploying workspace environment: Launching VS Code.' }
      ];
      this.save();
    }
  }

  save() {
    localStorage.setItem('wednesday_trained_commands', JSON.stringify(this.trainedCommands));
  }

  addTrainedCommand(trigger, response, actionType = 'SPEAK', actionValue = '') {
    const newCmd = {
      id: Date.now(),
      trigger: trigger.toLowerCase().trim(),
      response: response.trim(),
      actionType,
      actionValue: actionValue.trim()
    };
    this.trainedCommands.unshift(newCmd);
    this.save();
    return newCmd;
  }

  deleteCommand(id) {
    this.trainedCommands = this.trainedCommands.filter(c => c.id !== id);
    this.save();
  }

  setPersonality(instruction) {
    this.customPersonality = instruction;
    localStorage.setItem('wednesday_custom_personality', instruction);
  }

  // Check if a user query matches any trained trigger
  findMatch(query) {
    const q = query.toLowerCase().trim();
    return this.trainedCommands.find(c => q.includes(c.trigger) || c.trigger.includes(q));
  }
}

export const trainingEngine = new NeuralTrainingEngine();
