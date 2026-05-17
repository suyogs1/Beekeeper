/**
 * Recovery Planner Agent
 * Generates actionable recovery plans from RCA recommendations
 */

export function recoveryPlannerAgent(rca) {
  console.log('\n🛠️ RECOVERY PLANNER AGENT');
  console.log('─'.repeat(70));
  console.log('Analyzing RCA recommendations...\n');
  
  // Extract recommendations from RCA
  const recommendations = rca.analysis?.recommendations || rca.recommendations || [];
  
  // Build recovery plan with time estimates
  const recoverySteps = recommendations.map((rec, index) => {
    let estimatedTime = '1-2 hours';
    let riskLevel = 'MEDIUM';
    
    switch (rec.priority) {
      case 'IMMEDIATE':
        estimatedTime = '15-30 minutes';
        riskLevel = 'HIGH';
        break;
      case 'HIGH':
        estimatedTime = '1-2 hours';
        riskLevel = 'MEDIUM';
        break;
      case 'MEDIUM':
        estimatedTime = '2-4 hours';
        riskLevel = 'LOW';
        break;
      case 'LOW':
        estimatedTime = '4-8 hours';
        riskLevel = 'LOW';
        break;
    }
    
    return {
      step: index + 1,
      priority: rec.priority,
      action: rec.action,
      rationale: rec.rationale,
      estimatedTime,
      riskLevel
    };
  });
  
  // Calculate total recovery time
  const immediateCount = recoverySteps.filter(s => s.priority === 'IMMEDIATE').length;
  const highCount = recoverySteps.filter(s => s.priority === 'HIGH').length;
  const totalHours = (immediateCount * 0.5) + (highCount * 1.5) + 2;
  
  const plan = {
    incident_id: rca.metadata?.incident_id || 'Unknown',
    severity: rca.metadata?.severity || 'UNKNOWN',
    steps: recoverySteps,
    totalSteps: recoverySteps.length,
    estimatedRecoveryTime: `${Math.ceil(totalHours)} hours`,
    overallRisk: rca.metadata?.severity === 'CRITICAL' ? 'HIGH' : 'MEDIUM',
    approvalRequired: rca.metadata?.severity === 'CRITICAL'
  };
  
  console.log('Recovery Plan Generated:\n');
  recoverySteps.forEach(step => {
    console.log(`${step.step}. [${step.priority}] ${step.action}`);
    console.log(`   Time: ${step.estimatedTime} | Risk: ${step.riskLevel}`);
  });
  
  console.log(`\n📊 Recovery Summary:`);
  console.log(`   Total Steps: ${plan.totalSteps}`);
  console.log(`   Estimated Time: ${plan.estimatedRecoveryTime}`);
  console.log(`   Overall Risk: ${plan.overallRisk}`);
  console.log(`   Approval Required: ${plan.approvalRequired ? 'YES' : 'NO'}\n`);
  
  console.log(`→ Routing to Business Impact Agent...\n`);
  
  return plan;
}

// Made with Bob
