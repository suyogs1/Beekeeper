/**
 * Business Impact Agent
 * Generates executive summaries with financial and compliance impact
 */

export function businessImpactAgent(rca, recoveryPlan) {
  console.log('\n💼 BUSINESS IMPACT AGENT');
  console.log('─'.repeat(70));
  console.log('Calculating business impact...\n');
  
  const severity = rca.metadata?.severity || 'UNKNOWN';
  const affectedSystems = rca.analysis?.enterprise_impact || [];
  
  // Calculate financial impact based on severity and affected systems
  let financialImpact = 'Unknown';
  let complianceRisk = 'LOW';
  let reputationRisk = 'LOW';
  
  if (severity === 'CRITICAL') {
    financialImpact = '$250K-$500K per hour';
    complianceRisk = 'HIGH';
    reputationRisk = 'HIGH';
  } else if (severity === 'HIGH') {
    financialImpact = '$100K-$250K per hour';
    complianceRisk = 'MEDIUM';
    reputationRisk = 'MEDIUM';
  } else if (severity === 'MEDIUM') {
    financialImpact = '$25K-$100K per hour';
    complianceRisk = 'LOW';
    reputationRisk = 'LOW';
  } else {
    financialImpact = '<$25K per hour';
    complianceRisk = 'LOW';
    reputationRisk = 'LOW';
  }
  
  // Identify critical business processes
  const criticalProcesses = affectedSystems
    .filter(sys => sys.status === '🔴 BLOCKED')
    .map(sys => sys.system);
  
  // Generate executive summary
  const summary = {
    incident_id: rca.metadata?.incident_id || 'Unknown',
    severity,
    financial_impact: financialImpact,
    compliance_risk: complianceRisk,
    reputation_risk: reputationRisk,
    affected_business_processes: criticalProcesses,
    estimated_recovery_time: recoveryPlan.estimatedRecoveryTime,
    approval_required: recoveryPlan.approvalRequired,
    executive_summary: generateExecutiveSummary(rca, recoveryPlan, criticalProcesses, financialImpact)
  };
  
  console.log('Business Impact Assessment:\n');
  console.log(`💰 Financial Impact: ${financialImpact}`);
  console.log(`⚖️  Compliance Risk: ${complianceRisk}`);
  console.log(`📢 Reputation Risk: ${reputationRisk}`);
  console.log(`🕐 Recovery Time: ${recoveryPlan.estimatedRecoveryTime}`);
  console.log(`\n🎯 Critical Business Processes Affected:`);
  criticalProcesses.forEach(proc => console.log(`   - ${proc}`));
  
  console.log('\n' + '─'.repeat(70));
  console.log('EXECUTIVE SUMMARY');
  console.log('─'.repeat(70));
  console.log(summary.executive_summary);
  console.log('─'.repeat(70) + '\n');
  
  return summary;
}

function generateExecutiveSummary(rca, recoveryPlan, criticalProcesses, financialImpact) {
  const abendCode = rca.metadata?.abend_code || 'Unknown';
  const jobName = rca.metadata?.job_name || 'Unknown';
  const rootCause = rca.analysis?.root_cause?.primary_cause || 'Under investigation';
  
  return `
INCIDENT: ${abendCode} in ${jobName}
STATUS: Production outage affecting ${criticalProcesses.length} critical systems

ROOT CAUSE: ${rootCause}

BUSINESS IMPACT:
- Financial: ${financialImpact} in lost revenue/productivity
- ${criticalProcesses.length} critical business processes blocked
- Compliance and reputation risk elevated

RECOVERY PLAN:
- ${recoveryPlan.totalSteps} remediation steps identified
- Estimated recovery: ${recoveryPlan.estimatedRecoveryTime}
- ${recoveryPlan.approvalRequired ? 'Executive approval required' : 'Team can proceed'}

RECOMMENDATION: ${recoveryPlan.approvalRequired ? 'Immediate executive review and approval' : 'Proceed with recovery plan'}
`.trim();
}

// Made with Bob
