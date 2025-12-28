import { NextResponse } from 'next/server';
import { readdir, readFile } from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const logsDir = path.join(process.cwd(), '..', '..', 'logs', 'agents');
    
    // Read all log files
    const files = await readdir(logsDir);
    const logFiles = files.filter(f => f.endsWith('.log'));
    
    // Parse executions from logs
    const executions = await Promise.all(
      logFiles.slice(-20).map(async (file) => {
        const content = await readFile(path.join(logsDir, file), 'utf-8');
        return parseLogFile(file, content);
      })
    );

    // Sort by start time (most recent first)
    executions.sort((a, b) => 
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );

    return NextResponse.json({ executions });
  } catch (error) {
    console.error('Failed to read agent activity:', error);
    return NextResponse.json({ executions: [] });
  }
}

function parseLogFile(filename: string, content: string) {
  const lines = content.split('\n');
  const firstLine = lines[0];
  const lastLine = lines[lines.length - 2];

  // Extract timestamp from first line
  const timestampMatch = firstLine.match(/\[(.*?)\]/);
  const startTime = timestampMatch ? timestampMatch[1] : new Date().toISOString();

  // Extract agent name from filename
  const agentName = filename.split('-').slice(0, -6).join(' ')
    .split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  // Determine status
  const status = content.includes('✅ SUCCESS') ? 'success' :
                 content.includes('❌ FAILED') ? 'failed' : 'running';

  // Extract stats
  const actionsTaken = (content.match(/Actions Taken: (\d+)/)?.[1] || '0');
  const filesModified = (content.match(/Files Modified: (\d+)/)?.[1] || '0');
  const errors = (content.match(/Errors: (\d+)/)?.[1] || '0');

  // Calculate duration
  const endTimeMatch = lastLine.match(/\[(.*?)\]/);
  const endTime = endTimeMatch ? endTimeMatch[1] : undefined;
  const duration = endTime ? 
    new Date(endTime).getTime() - new Date(startTime).getTime() : undefined;

  return {
    id: filename.replace('.log', ''),
    agentName,
    trigger: 'auto',
    status,
    startTime,
    endTime,
    duration,
    actionsTaken: parseInt(actionsTaken),
    filesModified: parseInt(filesModified),
    errors: parseInt(errors)
  };
}
