import notifier from 'node-notifier';
import path from 'path';

export class AgentNotifier {
  private iconPath = path.join(process.cwd(), 'public', 'favicon.ico');

  notifyStart(agentName: string, trigger: string) {
    notifier.notify({
      title: '🤖 Agent Activated',
      message: `${agentName} started (${trigger})`,
      icon: this.iconPath,
      sound: false,
      wait: false
    });
  }

  notifySuccess(agentName: string, stats: any) {
    notifier.notify({
      title: '✅ Agent Completed',
      message: `${agentName}: ${stats.actionsTaken} actions, ${stats.filesModified} files modified`,
      icon: this.iconPath,
      sound: true,
      wait: false
    });
  }

  notifyFailure(agentName: string, error: string) {
    notifier.notify({
      title: '❌ Agent Failed',
      message: `${agentName}: ${error}`,
      icon: this.iconPath,
      sound: true,
      wait: true,
      actions: ['View Logs', 'Dismiss']
    });
  }

  notifyWarning(agentName: string, warning: string) {
    notifier.notify({
      title: '⚠️ Agent Warning',
      message: `${agentName}: ${warning}`,
      icon: this.iconPath,
      sound: false,
      wait: false
    });
  }
}
