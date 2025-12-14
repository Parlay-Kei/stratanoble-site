import { appendFile, mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';

export class AgentStorage {
  private logsDir = path.join(process.cwd(), 'logs', 'agents');
  private historyFile = path.join(this.logsDir, 'history.jsonl');

  async initialize() {
    await mkdir(this.logsDir, { recursive: true });
  }

  async saveExecution(execution: AgentExecutionRecord) {
    await this.initialize();
    
    // Append to JSONL history file
    await appendFile(
      this.historyFile,
      JSON.stringify(execution) + '\n'
    );

    // Also create individual log file
    const logFile = path.join(
      this.logsDir,
      `${execution.id}.log`
    );
    
    await writeFile(logFile, execution.fullLog);
  }

  async getHistory(limit: number = 50): Promise<AgentExecutionRecord[]> {
    try {
      const content = await readFile(this.historyFile, 'utf-8');
      const lines = content.trim().split('\n');
      
      return lines
        .slice(-limit)
        .map(line => JSON.parse(line))
        .reverse(); // Most recent first
    } catch (error) {
      return [];
    }
  }

  async getStats(): Promise<AgentStatsData> {
    const history = await this.getHistory(1000);
    
    if (history.length === 0) {
      return {
        totalExecutions: 0,
        successRate: 0,
        averageDuration: 0,
        totalActions: 0,
        totalFilesModified: 0
      };
    }
    
    return {
      totalExecutions: history.length,
      successRate: (history.filter(h => h.status === 'success').length / history.length) * 100,
      averageDuration: history.reduce((sum, h) => sum + (h.duration || 0), 0) / history.length,
      totalActions: history.reduce((sum, h) => sum + h.actionsTaken, 0),
      totalFilesModified: history.reduce((sum, h) => sum + h.filesModified, 0)
    };
  }
}

export interface AgentExecutionRecord {
  id: string;
  agentName: string;
  trigger: string;
  status: 'success' | 'failed' | 'running';
  startTime: string;
  endTime?: string;
  duration?: number;
  actionsTaken: number;
  filesModified: number;
  errors: number;
  fullLog: string;
}

export interface AgentStatsData {
  totalExecutions: number;
  successRate: number;
  averageDuration: number;
  totalActions: number;
  totalFilesModified: number;
}
