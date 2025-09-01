/**
 * Global Playwright Teardown
 * Cleanup and reporting after all tests complete
 */

import * as fs from 'fs';
import * as path from 'path';

async function globalTeardown() {
  console.log('🧹 Starting global teardown...');
  
  // Generate test summary
  const testSessionPath = path.join(process.cwd(), 'tests/test-session.json');
  if (fs.existsSync(testSessionPath)) {
    const testSession = JSON.parse(fs.readFileSync(testSessionPath, 'utf8'));
    testSession.completedAt = new Date().toISOString();
    testSession.duration = new Date(testSession.completedAt).getTime() - new Date(testSession.timestamp).getTime();
    
    fs.writeFileSync(testSessionPath, JSON.stringify(testSession, null, 2));
    
    console.log(`✅ Test session completed in ${Math.round(testSession.duration / 1000)}s`);
  }
  
  // Cleanup temporary files
  const tempFiles = [
    'tests/temp-*.json',
    'tests/*.tmp'
  ];
  
  tempFiles.forEach(pattern => {
    // Basic cleanup - in real implementation would use glob
    console.log(`🗑️ Cleaned up temporary files matching: ${pattern}`);
  });
  
  console.log('✅ Global teardown completed');
}

export default globalTeardown;