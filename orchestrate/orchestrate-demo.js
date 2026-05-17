/**
 * Bee-Keeper Orchestration Demo
 * Lightweight watsonx Orchestrate-style workflow
 * 
 * Flow: Alert → Intake → Bee-Keeper RCA → Recovery Planning → Business Summary
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { intakeAgent } from './agents/intake-agent.js';
import { recoveryPlannerAgent } from './agents/recovery-planner.js';
import { businessImpactAgent } from './agents/business-impact.js';
import { executeRCAWorkflow, generateFinalRCA } from '../src/tools/rca-workflow.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cinematic presentation helpers
function printHeader(title) {
  console.log('\n' + '═'.repeat(70));
  console.log(`  ${title}`);
  console.log('═'.repeat(70) + '\n');
}

function printPhase(phase, description) {
  console.log(`\n${'▶'.repeat(3)} PHASE ${phase}: ${description}`);
  console.log('─'.repeat(70));
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function orchestrateIncidentResponse() {
  const startTime = Date.now();
  
  printHeader('🐝 BEE-KEEPER ORCHESTRATION DEMO');
  console.log('watsonx Orchestrate-style Multi-Agent Workflow');
  console.log('Enterprise Mainframe Incident Response\n');
  
  // Phase 1: Alert Ingestion
  printPhase(1, 'ALERT INGESTION');
  const alertPath = path.join(__dirname, 'mock-alert.json');
  const alert = JSON.parse(fs.readFileSync(alertPath, 'utf-8'));
  
  console.log('📨 Incoming Alert:');
  console.log(`   Job: ${alert.job_name}`);
  console.log(`   ABEND: ${alert.abend_code} at offset ${alert.offset}`);
  console.log(`   Severity: ${alert.severity}`);
  console.log(`   Time: ${alert.timestamp}\n`);
  
  await sleep(500);
  
  // Phase 2: Intake Agent
  printPhase(2, 'INTAKE AGENT');
  const intakeResult = intakeAgent(alert);
  
  if (intakeResult.status !== 'VALIDATED') {
    console.error('❌ Alert validation failed. Aborting workflow.');
    return;
  }
  
  await sleep(500);
  
  // Phase 3: Bee-Keeper Forensic Analysis
  printPhase(3, 'BEE-KEEPER FORENSIC ANALYSIS');
  console.log('🐝 Initiating 7-phase RCA workflow...\n');
  
  let workflow, rcaResult;
  try {
    // Execute workflow (phases 1-6)
    workflow = executeRCAWorkflow({
      job_name: alert.job_name,
      abend_code: alert.abend_code,
      offset: alert.offset,
      module_name: alert.module_name,
      jcl_file_path: 'jobs/payrl001.jcl',
      asm_file_path: 'src/taxcalc.asm'
    });
    
    if (workflow.error) {
      console.error('❌ RCA workflow failed:', workflow.error);
      return;
    }
    
    // Auto-approve and generate final RCA (phase 7)
    rcaResult = generateFinalRCA(workflow, true);
    
    if (!rcaResult || rcaResult.status !== 'RCA_COMPLETE') {
      console.error('❌ RCA generation failed:', rcaResult?.message || rcaResult?.status || 'Unknown error');
      return;
    }
  } catch (error) {
    console.error('❌ RCA workflow exception:', error.message);
    console.error(error.stack);
    return;
  }
  
  await sleep(500);
  
  // Phase 4: Recovery Planning
  printPhase(4, 'RECOVERY PLANNING');
  const recoveryPlan = recoveryPlannerAgent(rcaResult.rca);
  
  await sleep(500);
  
  // Phase 5: Business Impact Assessment
  printPhase(5, 'BUSINESS IMPACT ASSESSMENT');
  const businessSummary = businessImpactAgent(rcaResult.rca, recoveryPlan);
  
  // Final Summary
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(1);
  
  printHeader('🎯 ORCHESTRATION COMPLETE');
  console.log(`✅ Workflow executed successfully in ${duration}s\n`);
  
  console.log('📊 WORKFLOW SUMMARY:');
  console.log(`   Phases Completed: 5/5`);
  console.log(`   Incident ID: ${rcaResult.rca.metadata.incident_id}`);
  console.log(`   Confidence: ${rcaResult.rca.metadata.confidence}%`);
  console.log(`   Severity: ${rcaResult.rca.metadata.severity}`);
  console.log(`   Recovery Steps: ${recoveryPlan.totalSteps}`);
  console.log(`   Estimated Recovery: ${recoveryPlan.estimatedRecoveryTime}`);
  console.log(`   Financial Impact: ${businessSummary.financial_impact}\n`);
  
  console.log('📁 ARTIFACTS GENERATED:');
  console.log(`   - RCA Report: .bob/knowledge/${rcaResult.rca.metadata.incident_id}.md`);
  console.log(`   - Recovery Plan: In-memory (${recoveryPlan.totalSteps} steps)`);
  console.log(`   - Business Summary: In-memory\n`);
  
  console.log('🚀 NEXT STEPS:');
  if (businessSummary.approval_required) {
    console.log('   1. Executive review and approval required');
    console.log('   2. Coordinate with change management');
    console.log('   3. Execute recovery plan with monitoring');
  } else {
    console.log('   1. Execute recovery plan');
    console.log('   2. Monitor system stability');
    console.log('   3. Update runbooks');
  }
  
  console.log('\n' + '═'.repeat(70));
  console.log('  Demo Complete - Ready for Hackathon Presentation');
  console.log('═'.repeat(70) + '\n');
  
  return {
    alert,
    intake: intakeResult,
    rca: rcaResult.rca,
    recovery: recoveryPlan,
    business: businessSummary,
    duration
  };
}

// Execute if run directly
// Check if this module is being run directly (works cross-platform)
const isMainModule = process.argv[1] && (
  import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}` ||
  import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}` ||
  import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))
);

if (isMainModule) {
  orchestrateIncidentResponse()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('\n❌ Orchestration failed:', error.message);
      console.error(error.stack);
      process.exit(1);
    });
}

export { orchestrateIncidentResponse };

// Made with Bob
