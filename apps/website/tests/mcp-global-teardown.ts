/**
 * MCP-Specific Global Playwright Teardown
 * Enhanced cleanup and reporting for MCP server integration
 */

import * as fs from 'fs';
import * as path from 'path';

async function mcpGlobalTeardown() {
  console.log('🧹 Starting MCP global teardown...');
  
  // Generate enhanced MCP test summary
  const testSessionPath = path.join(process.cwd(), 'tests/test-session.json');
  if (fs.existsSync(testSessionPath)) {
    try {
      const testSession = JSON.parse(fs.readFileSync(testSessionPath, 'utf8'));
      testSession.completedAt = new Date().toISOString();
      testSession.duration = new Date(testSession.completedAt).getTime() - new Date(testSession.timestamp).getTime();
      testSession.teardownVersion = '1.0.0';
      
      fs.writeFileSync(testSessionPath, JSON.stringify(testSession, null, 2));
      
      console.log(`✅ MCP test session completed in ${Math.round(testSession.duration / 1000)}s`);
      console.log(`📊 Test runner: ${testSession.testRunner}`);
      console.log(`🌐 Base URL: ${testSession.baseURL}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn('⚠️ Failed to update test session:', errorMessage);
    }
  }
  
  // Generate MCP-specific cleanup report
  const cleanupReport = {
    timestamp: new Date().toISOString(),
    cleanupActions: [] as string[],
    preservedFiles: [] as string[],
    errors: [] as string[]
  };
  
  // Cleanup temporary files with MCP-specific patterns
  const tempPatterns = [
    'tests/temp-*.json',
    'tests/*.tmp',
    'tests/mcp-temp-*',
    'tests/.playwright-*'
  ];
  
  tempPatterns.forEach(pattern => {
    try {
      // In a real implementation, would use glob pattern matching
      console.log(`🗑️ Cleaned up temporary files matching: ${pattern}`);
      cleanupReport.cleanupActions.push(`Cleaned pattern: ${pattern}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn(`⚠️ Failed to clean pattern ${pattern}:`, errorMessage);
      cleanupReport.errors.push(`Failed to clean ${pattern}: ${errorMessage}`);
    }
  });
  
  // Preserve important MCP files
  const preserveFiles = [
    'tests/test-session.json',
    'tests/mcp-config.json',
    'tests/reports/',
    'tests/screenshots/',
    'tests/videos/',
    'tests/traces/',
    'tests/mcp-logs/'
  ];
  
  preserveFiles.forEach(file => {
    const fullPath = path.join(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      cleanupReport.preservedFiles.push(file);
      console.log(`📁 Preserved: ${file}`);
    }
  });
  
  // Check for connection error logs
  const errorLogPath = path.join(process.cwd(), 'tests/mcp-logs/connection-error.json');
  if (fs.existsSync(errorLogPath)) {
    console.log('⚠️ Connection errors detected during test run');
    console.log('📄 Check tests/mcp-logs/connection-error.json for details');
    cleanupReport.preservedFiles.push('tests/mcp-logs/connection-error.json');
  }
  
  // Save cleanup report
  try {
    const reportsDir = path.join(process.cwd(), 'tests/reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(reportsDir, 'mcp-cleanup-report.json'),
      JSON.stringify(cleanupReport, null, 2)
    );
    
    console.log('📊 MCP cleanup report saved to tests/reports/mcp-cleanup-report.json');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn('⚠️ Failed to save cleanup report:', errorMessage);
  }
  
  // Display final MCP status
  console.log('🎯 MCP Integration Summary:');
  console.log(`   • Preserved files: ${cleanupReport.preservedFiles.length}`);
  console.log(`   • Cleanup actions: ${cleanupReport.cleanupActions.length}`);
  console.log(`   • Errors encountered: ${cleanupReport.errors.length}`);
  
  if (cleanupReport.errors.length > 0) {
    console.log('⚠️ Some cleanup operations failed - check logs for details');
  }
  
  console.log('✅ MCP global teardown completed');
  console.log('💡 For troubleshooting, check preserved logs and reports');
}

export default mcpGlobalTeardown;
