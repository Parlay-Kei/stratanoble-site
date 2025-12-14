import chalk from 'chalk';
import { appendFile, mkdir } from 'fs/promises';
import path from 'path';

export enum LogLevel {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG'
}

export class AgentLogger {
  private agentName: string;
  private startTime: Date;
  private logFile: string;

  constructor(agentName: string) {
    this.agentName = agentName;
    this.startTime = new Date();
    this.logFile = path.join(
      process.cwd(),
      'logs',
      'agents',
      `${this.sanitizeName(agentName)}-${this.getTimestamp()}.log`
    );
  }

  private sanitizeName(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '-');
  }

  private getTimestamp(): string {
    return new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  }

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    const duration = Date.now() - this.startTime.getTime();
    return `[${timestamp}] [${this.agentName}] [${level}] [+${duration}ms] ${message}`;
  }

  private getIcon(level: LogLevel): string {
    const icons = {
      [LogLevel.INFO]: 'ℹ️',
      [LogLevel.SUCCESS]: '✅',
      [LogLevel.WARNING]: '⚠️',
      [LogLevel.ERROR]: '❌',
      [LogLevel.DEBUG]: '🔍'
    };
    return icons[level];
  }

  private getColor(level: LogLevel): chalk.Chalk {
    const colors = {
      [LogLevel.INFO]: chalk.blue,
      [LogLevel.SUCCESS]: chalk.green,
      [LogLevel.WARNING]: chalk.yellow,
      [LogLevel.ERROR]: chalk.red,
      [LogLevel.DEBUG]: chalk.gray
    };
    return colors[level];
  }

  async log(level: LogLevel, message: string, data?: any) {
    const formattedMessage = this.formatMessage(level, message);
    const icon = this.getIcon(level);
    const color = this.getColor(level);

    // Console output with color
    console.log(color(`${icon} ${message}`));
    if (data) {
      console.log(color(JSON.stringify(data, null, 2)));
    }

    // File output
    try {
      // Ensure logs directory exists
      const logsDir = path.dirname(this.logFile);
      await mkdir(logsDir, { recursive: true });
      
      await appendFile(
        this.logFile,
        `${formattedMessage}${data ? '\n' + JSON.stringify(data, null, 2) : ''}\n`
      );
    } catch (error) {
      // Fail silently - don't break agent execution
    }
  }

  info(message: string, data?: any) {
    return this.log(LogLevel.INFO, message, data);
  }

  success(message: string, data?: any) {
    return this.log(LogLevel.SUCCESS, message, data);
  }

  warning(message: string, data?: any) {
    return this.log(LogLevel.WARNING, message, data);
  }

  error(message: string, data?: any) {
    return this.log(LogLevel.ERROR, message, data);
  }

  debug(message: string, data?: any) {
    if (process.env.DEBUG === 'true') {
      return this.log(LogLevel.DEBUG, message, data);
    }
  }

  async summary(stats: AgentStats) {
    const duration = Date.now() - this.startTime.getTime();
    const summary = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 AGENT EXECUTION SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Agent: ${this.agentName}
Status: ${stats.success ? '✅ SUCCESS' : '❌ FAILED'}
Duration: ${(duration / 1000).toFixed(2)}s
Actions Taken: ${stats.actionsTaken}
Files Modified: ${stats.filesModified}
Errors: ${stats.errors}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `;

    console.log(stats.success ? chalk.green(summary) : chalk.red(summary));
    await appendFile(this.logFile, summary);
  }
}

export interface AgentStats {
  success: boolean;
  actionsTaken: number;
  filesModified: number;
  errors: number;
}
