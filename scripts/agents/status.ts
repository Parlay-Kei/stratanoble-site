#!/usr/bin/env node

import chalk from 'chalk';
import { AgentStorage } from './storage';
import Table from 'cli-table3';

async function showStatus() {
  const storage = new AgentStorage();
  
  console.log(chalk.bold.cyan('\n🤖 AGENT SYSTEM STATUS\n'));

  // Get recent history
  const history = await storage.getHistory(10);
  const stats = await storage.getStats();

  // Statistics table
  const statsTable = new Table({
    head: ['Metric', 'Value'],
    colWidths: [30, 20]
  });

  statsTable.push(
    ['Total Executions', stats.totalExecutions.toString()],
    ['Success Rate', `${stats.successRate.toFixed(1)}%`],
    ['Avg Duration', `${(stats.averageDuration / 1000).toFixed(2)}s`],
    ['Total Actions', stats.totalActions.toString()],
    ['Files Modified', stats.totalFilesModified.toString()]
  );

  console.log(statsTable.toString());

  // Recent executions
  console.log(chalk.bold('\n📋 Recent Executions:\n'));

  if (history.length === 0) {
    console.log(chalk.gray('  No agent executions yet\n'));
    return;
  }

  const executionsTable = new Table({
    head: ['Agent', 'Status', 'Time', 'Actions'],
    colWidths: [25, 12, 20, 10]
  });

  for (const exec of history.slice(0, 10)) {
    const statusIcon = exec.status === 'success' ? '✅' : 
                       exec.status === 'failed' ? '❌' : '⚙️';
    
    const timeAgo = getRelativeTime(exec.startTime);
    
    executionsTable.push([
      exec.agentName,
      `${statusIcon} ${exec.status}`,
      timeAgo,
      exec.actionsTaken.toString()
    ]);
  }

  console.log(executionsTable.toString());

  // Active agents
  const activeAgents = history.filter(h => h.status === 'running');
  if (activeAgents.length > 0) {
    console.log(chalk.bold.yellow(`\n⚙️  ${activeAgents.length} Active Agent(s):\n`));
    activeAgents.forEach(agent => {
      console.log(`   ${agent.agentName} - Running for ${getRelativeTime(agent.startTime)}`);
    });
  }

  console.log();
}

function getRelativeTime(timestamp: string): string {
  const seconds = Math.round((Date.now() - new Date(timestamp).getTime()) / 1000);
  
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)}h ago`;
  return `${Math.round(seconds / 86400)}d ago`;
}

showStatus().catch(error => {
  console.error(chalk.red('Error fetching agent status:'), error);
  process.exit(1);
});
