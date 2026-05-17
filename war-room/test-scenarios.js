/**
 * Bee-Keeper War Room - Scenario Validation Script
 * Tests all 4 incident scenarios for demo readiness
 */

import { scenarios } from './src/data/scenarios.js';

console.log('🐝 Bee-Keeper War Room - Scenario Validation\n');
console.log('='.repeat(60));

let allValid = true;

Object.entries(scenarios).forEach(([key, scenario]) => {
  console.log(`\n📋 Testing Scenario: ${key}`);
  console.log('-'.repeat(60));
  
  const checks = {
    'Scenario ID': !!scenario.id,
    'Scenario name': !!scenario.name,
    'Metadata': !!scenario.metadata,
    'ABEND code': !!scenario.metadata?.abend_code,
    'Job name': !!scenario.metadata?.job_name,
    'Module name': !!scenario.metadata?.module_name,
    'Severity': !!scenario.metadata?.severity,
    'Confidence': typeof scenario.metadata?.confidence === 'number',
    'Root cause': !!scenario.rootCause?.primary,
    'Contributing factors': Array.isArray(scenario.rootCause?.contributing) && scenario.rootCause.contributing.length > 0,
    'Enterprise impact': Array.isArray(scenario.enterpriseImpact) && scenario.enterpriseImpact.length > 0,
    'Recommendations': Array.isArray(scenario.recommendations) && scenario.recommendations.length > 0,
    'Mermaid diagram': !!scenario.mermaidDiagram && scenario.mermaidDiagram.includes('graph'),
    'Workflow phases': Array.isArray(scenario.workflow) && scenario.workflow.length === 7,
  };
  
  let scenarioValid = true;
  Object.entries(checks).forEach(([check, passed]) => {
    const status = passed ? '✅' : '❌';
    console.log(`  ${status} ${check}`);
    if (!passed) {
      scenarioValid = false;
      allValid = false;
    }
  });
  
  if (scenarioValid) {
    console.log(`\n  ✅ Scenario ${key} is VALID`);
  } else {
    console.log(`\n  ❌ Scenario ${key} has ISSUES`);
  }
});

console.log('\n' + '='.repeat(60));
if (allValid) {
  console.log('✅ All scenarios are valid and demo-ready!');
  console.log('\n🚀 Ready for hackathon presentation');
  process.exit(0);
} else {
  console.log('❌ Some scenarios have validation issues');
  console.log('\n⚠️  Fix issues before demo');
  process.exit(1);
}

// Made with Bob