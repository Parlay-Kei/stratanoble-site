/**
 * Jest Integration Test Sequencer
 * 
 * Ensures integration-contract.test.ts runs FIRST.
 * If it fails, no other integration tests run.
 * 
 * This makes failure cheap and obvious.
 */

const Sequencer = require('@jest/test-sequencer').default;

class IntegrationTestSequencer extends Sequencer {
  sort(tests) {
    // Clone the array to avoid mutating the original
    const testsArray = Array.from(tests);
    
    // Find the integration contract test
    const contractTest = testsArray.find(
      (test) => test.path.includes('integration-contract.test')
    );
    
    // Find all other tests
    const otherTests = testsArray.filter(
      (test) => !test.path.includes('integration-contract.test')
    );
    
    // Contract test runs FIRST, then all others
    if (contractTest) {
      return [contractTest, ...otherTests];
    }
    
    // If no contract test found, run in default order
    return testsArray;
  }
}

module.exports = IntegrationTestSequencer;
