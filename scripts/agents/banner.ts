import chalk from 'chalk';
import boxen from 'boxen';

export function showAgentStartBanner(agentName: string, trigger: string) {
  const banner = boxen(
    chalk.bold.cyan(`🤖 AUTONOMOUS AGENT ACTIVATED\n\n`) +
    chalk.white(`Agent: ${chalk.yellow(agentName)}\n`) +
    chalk.white(`Trigger: ${chalk.yellow(trigger)}\n`) +
    chalk.white(`Time: ${chalk.yellow(new Date().toLocaleString())}`),
    {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'cyan'
    }
  );
  
  console.log('\n' + banner + '\n');
}

export function showAgentCompleteBanner(agentName: string, stats: any) {
  const status = stats.success ? 
    chalk.green.bold('✅ COMPLETED') : 
    chalk.red.bold('❌ FAILED');
  
  const banner = boxen(
    chalk.bold(`🤖 AGENT EXECUTION ${status}\n\n`) +
    chalk.white(`Agent: ${chalk.yellow(agentName)}\n`) +
    chalk.white(`Duration: ${chalk.yellow(stats.duration)}\n`) +
    chalk.white(`Actions: ${chalk.yellow(stats.actionsTaken)}\n`) +
    chalk.white(`Modified: ${chalk.yellow(stats.filesModified)} files`),
    {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: stats.success ? 'green' : 'red'
    }
  );
  
  console.log('\n' + banner + '\n');
}

export function showProgressBar(current: number, total: number, label: string) {
  const percentage = Math.round((current / total) * 100);
  const barLength = 30;
  const filledLength = Math.round((barLength * current) / total);
  const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
  
  process.stdout.write(`\r${label} [${bar}] ${percentage}% (${current}/${total})`);
  
  if (current === total) {
    process.stdout.write('\n');
  }
}
