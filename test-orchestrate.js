/**
 * Simple test for orchestration demo
 */

import { orchestrateIncidentResponse } from './orchestrate/orchestrate-demo.js';

console.log('Starting orchestration test...\n');

try {
  const result = await orchestrateIncidentResponse();
  console.log('\n✅ Test completed successfully');
  console.log('Result:', JSON.stringify(result, null, 2));
} catch (error) {
  console.error('\n❌ Test failed:', error.message);
  console.error(error.stack);
  process.exit(1);
}

// Made with Bob
