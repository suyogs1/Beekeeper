/**
 * RCA Workflow Presentation Layer
 * Cinematic, enterprise-grade progress indicators for IBM Bob
 */

/**
 * Format workflow phase header
 */
export function formatPhaseHeader(phaseNumber, phaseName, status = 'IN_PROGRESS') {
  const statusIcons = {
    'IN_PROGRESS': '🔄',
    'COMPLETED': '✅',
    'FAILED': '❌'
  };
  
  const icon = statusIcons[status] || '⏳';
  const separator = '─'.repeat(70);
  
  return `
${separator}
${icon} PHASE ${phaseNumber}: ${phaseName.toUpperCase()}
${separator}`;
}

/**
 * Format phase summary
 */
export function formatPhaseSummary(phase, data) {
  switch (phase) {
    case 'INTAKE':
      return `
📥 Incident Details Validated
   ABEND: ${data.abend_code} at ${data.offset}
   Job: ${data.job_name}
   Module: ${data.module_name}
`;

    case 'JCL_ANALYSIS':
      return `
📊 JCL Topology Analyzed
   Job: ${data.summary?.job || 'Unknown'}
   Steps: ${data.summary?.stepCount || data.steps?.length || 0}
   Issues: ${data.issues?.length || 0}
   ${data.issues?.length > 0 ? `⚠️  ${data.issues[0].type}` : '✓ No issues detected'}
`;

    case 'ASM_ANALYSIS':
      return `
🔬 Assembler Module Decompiled
   Module: ${data.moduleName || 'Unknown'}
   Sections: ${data.sections?.length || data.labels?.length || 0}
   Risks: ${data.risks?.length || 0}
   ${data.risks?.length > 0 ? `⚠️  ${data.risks[0].type}` : '✓ No risks detected'}
`;

    case 'ABEND_CORRELATION':
      return `
🎯 ABEND Correlation Complete
   Confidence: ${data.confidence}%
   Severity: ${data.rootCause.severity}
   Root Cause: ${data.rootCause.category}
   ${data.blastRadius.criticalPath ? '🔴 CRITICAL PATH IMPACT' : ''}
`;

    case 'KNOWLEDGE_CHECK':
      return `
📚 Knowledge Base Searched
   Prior Incidents: ${data.count}
   ${data.hasHistory ? `⚠️  Recurring pattern detected` : '✓ First occurrence'}
`;

    case 'REVIEW_CHECKPOINT':
      return `
🔍 Review Checkpoint Generated
   Confidence: ${data.summary.confidence}%
   Severity: ${data.summary.severity}
   Requires Approval: ${data.requiresApproval ? 'YES' : 'NO'}
   ${data.requiresApproval ? '⏸️  Awaiting review approval...' : ''}
`;

    case 'RCA_GENERATION':
      return `
📄 Enterprise RCA Report Generated
   Incident ID: ${data.incident_id}
   Severity: ${data.severity}
   Confidence: ${data.confidence}%
   Report: ${data.filename}
`;

    default:
      return '';
  }
}

/**
 * Format review checkpoint for approval
 */
export function formatReviewCheckpoint(checkpoint) {
  const { summary, findings, recommendations, requiresApproval } = checkpoint;
  
  return `
╔════════════════════════════════════════════════════════════════════╗
║                     🔍 REVIEW CHECKPOINT                           ║
╚════════════════════════════════════════════════════════════════════╝

📊 INCIDENT SUMMARY
${'-'.repeat(70)}
ABEND Code:        ${summary.abend}
Offset:            ${summary.offset}
Confidence:        ${summary.confidence}%
Severity:          ${summary.severity}
Prior Incidents:   ${summary.priorIncidents}

🔎 KEY FINDINGS
${'-'.repeat(70)}
JCL Issues:        ${findings.jcl_issues}
ASM Risks:         ${findings.asm_risks}
Root Cause:        ${findings.root_cause}
Blast Radius:      ${findings.blast_radius}

📋 RECOMMENDED ACTIONS
${'-'.repeat(70)}
${recommendations.map((r, i) => `${i + 1}. [${r.priority}] ${r.action}`).join('\n')}

${requiresApproval ? `
⚠️  APPROVAL REQUIRED
${'-'.repeat(70)}
Reason: ${summary.severity === 'CRITICAL' ? 'CRITICAL severity' : 'Confidence < 70%'}

Proceed with final RCA generation? (yes/no)
` : `
✅ AUTO-APPROVED
${'-'.repeat(70)}
Proceeding to final RCA generation...
`}`;
}

/**
 * Format final RCA summary
 */
export function formatFinalSummary(rca) {
  const { metadata, analysis } = rca;
  
  return `
╔════════════════════════════════════════════════════════════════════╗
║                  ✅ RCA WORKFLOW COMPLETE                          ║
╚════════════════════════════════════════════════════════════════════╝

📋 INCIDENT DETAILS
${'-'.repeat(70)}
Incident ID:       ${metadata.incident_id}
Timestamp:         ${new Date(metadata.timestamp).toLocaleString()}
Job:               ${metadata.job_name}
Module:            ${metadata.module_name}
Severity:          ${metadata.severity}
Confidence:        ${analysis.confidence}%

📊 ANALYSIS RESULTS
${'-'.repeat(70)}
Root Cause:        ${analysis.rootCause.primary}
Contributing:      ${analysis.rootCause.contributing.length} factors
Recommendations:   ${analysis.recommendations.length} actions
Diagrams:          ${analysis.diagrams ? 'Included' : 'Not generated'}

💥 ENTERPRISE IMPACT
${'-'.repeat(70)}
Critical Path:     ${analysis.blastRadius.criticalPath ? 'YES ⚠️' : 'NO'}
Downstream Jobs:   ${analysis.blastRadius.downstreamCount}
Systems Affected:  ${analysis.blastRadius.enterpriseImpact?.length || 0}

📄 DELIVERABLES
${'-'.repeat(70)}
✓ Enterprise RCA Report (Markdown)
✓ Mermaid Dependency Diagrams
✓ Knowledge Base Entry
✓ Remediation Action Plan

Full report saved to: ${rca.filename || 'RCA-' + metadata.incident_id + '.md'}
`;
}

/**
 * Format workflow progress bar
 */
export function formatProgressBar(currentPhase, totalPhases = 7) {
  const phases = [
    'Intake',
    'JCL Analysis',
    'ASM Analysis',
    'ABEND Correlation',
    'Knowledge Check',
    'Review',
    'RCA Generation'
  ];
  
  const progress = Math.floor((currentPhase / totalPhases) * 100);
  const barLength = 50;
  const filledLength = Math.floor((progress / 100) * barLength);
  const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
  
  return `
Progress: [${bar}] ${progress}%
Phase ${currentPhase}/${totalPhases}: ${phases[currentPhase - 1]}
`;
}

/**
 * Format error message
 */
export function formatError(phase, error) {
  return `
╔════════════════════════════════════════════════════════════════════╗
║                     ❌ WORKFLOW ERROR                              ║
╚════════════════════════════════════════════════════════════════════╝

Phase:    ${phase}
Error:    ${error.message}

${error.stack ? `Stack Trace:\n${error.stack}` : ''}

Workflow terminated. Partial results may be available.
`;
}

/**
 * Format workflow banner
 */
export function formatWorkflowBanner() {
  return `
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║              🐝 BEE-KEEPER FORENSIC WORKFLOW                       ║
║                                                                    ║
║           Enterprise Mainframe Incident Analysis                   ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
`;
}

/**
 * Format compact phase transition
 */
export function formatPhaseTransition(fromPhase, toPhase) {
  return `
${fromPhase} ✓ → ${toPhase} 🔄
`;
}

// Made with Bob
