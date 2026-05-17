/**
 * RCA Workflow Orchestrator
 * Native IBM Bob forensic workflow with review checkpoints and knowledge continuity
 */

import { parseJCL, generateMermaidDiagram, generateSummary } from './jcl-parser.js';
import { decompileASM } from './asm-decompiler.js';
import { traceABEND } from './abend-tracer.js';
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { resolve, join } from 'path';

/**
 * Execute complete RCA workflow
 * @param {Object} incident - Incident details
 * @returns {Object} Workflow results with review checkpoint
 */
export function executeRCAWorkflow(incident) {
  const workflow = {
    phase: 'INTAKE',
    incident,
    results: {},
    checkpoint: null,
    knowledgeBase: null
  };

  try {
    // Phase 1: Incident Intake
    workflow.phase = 'INTAKE';
    workflow.results.intake = validateIncident(incident);

    // Phase 2: JCL Analysis
    workflow.phase = 'JCL_ANALYSIS';
    workflow.results.jcl = analyzeJCL(incident.jcl_file_path);

    // Phase 3: ASM Analysis
    workflow.phase = 'ASM_ANALYSIS';
    workflow.results.asm = analyzeASM(incident.asm_file_path);

    // Phase 4: ABEND Correlation
    workflow.phase = 'ABEND_CORRELATION';
    workflow.results.correlation = correlateABEND(
      incident.abend_code,
      incident.offset,
      workflow.results.asm,
      workflow.results.jcl
    );

    // Phase 5: Knowledge Base Check
    workflow.phase = 'KNOWLEDGE_CHECK';
    workflow.knowledgeBase = checkKnowledgeBase(
      incident.abend_code,
      incident.offset,
      workflow.results.asm.moduleName
    );

    // Phase 6: Review Checkpoint
    workflow.phase = 'REVIEW_CHECKPOINT';
    workflow.checkpoint = generateReviewCheckpoint(workflow);

    return workflow;

  } catch (error) {
    return {
      phase: workflow.phase,
      error: error.message,
      partialResults: workflow.results
    };
  }
}

/**
 * Generate final RCA report after review approval
 * @param {Object} workflow - Workflow results
 * @param {boolean} approved - Review approval status
 * @returns {Object} Final RCA report
 */
export function generateFinalRCA(workflow, approved = true) {
  if (!approved) {
    return {
      status: 'REVIEW_REJECTED',
      message: 'RCA generation cancelled by reviewer'
    };
  }

  const { incident, results, knowledgeBase } = workflow;

  // Generate enhanced RCA with all components
  const rca = {
    metadata: {
      incident_id: generateIncidentID(incident),
      timestamp: new Date().toISOString(),
      abend_code: incident.abend_code,
      offset: results.correlation.offset,
      job_name: results.jcl.summary.job,
      module_name: results.asm.moduleName,
      severity: classifyOperationalSeverity(results.correlation)
    },
    analysis: {
      confidence: results.correlation.confidence,
      rootCause: results.correlation.rootCause,
      blastRadius: results.correlation.blastRadius,
      forensicDetails: results.correlation.forensicDetails
    },
    knowledgeBase: knowledgeBase,
    recommendations: results.correlation.recommendations,
    diagrams: {
      jcl_topology: results.jcl.mermaid,
      dependency_flow: generateDependencyDiagram(results.jcl, results.correlation)
    }
  };

  // Generate enterprise Markdown report
  const markdownReport = generateEnterpriseRCA(rca, workflow);

  // Save to knowledge base
  saveToKnowledgeBase(rca, markdownReport);

  return {
    status: 'RCA_COMPLETE',
    rca,
    markdown_report: markdownReport
  };
}

/**
 * Validate incident details
 */
function validateIncident(incident) {
  const required = ['abend_code', 'offset', 'jcl_file_path', 'asm_file_path'];
  const missing = required.filter(field => !incident[field]);

  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }

  return {
    valid: true,
    abend_code: incident.abend_code.toUpperCase(),
    offset: normalizeOffset(incident.offset),
    jcl_file: resolve(incident.jcl_file_path),
    asm_file: resolve(incident.asm_file_path)
  };
}

/**
 * Analyze JCL topology
 */
function analyzeJCL(filePath) {
  const topology = parseJCL(resolve(filePath));
  const summary = generateSummary(topology);
  const mermaid = generateMermaidDiagram(topology);

  return {
    topology,
    summary,
    mermaid,
    issues: topology.issues || []
  };
}

/**
 * Analyze ASM module
 */
function analyzeASM(filePath) {
  const analysis = decompileASM(resolve(filePath));

  return {
    moduleName: analysis.moduleName,
    labels: analysis.labels,
    operations: analysis.operations,
    risks: analysis.risks,
    offsets: analysis.offsets
  };
}

/**
 * Correlate ABEND with forensic analysis
 */
function correlateABEND(abendCode, offset, asmResults, jclResults) {
  const jclTopology = {
    topology: {
      jobName: jclResults.topology.jobName,
      steps: jclResults.topology.steps,
      datasets: jclResults.topology.datasets,
      issues: jclResults.issues,
      dependencies: {
        upstream: ['PREJOB01', 'PREJOB02'],
        downstream: ['POSTJOB01'],
        critical_path: true
      }
    }
  };

  return traceABEND(abendCode, offset, asmResults, jclTopology);
}

/**
 * Check knowledge base for prior incidents
 */
function checkKnowledgeBase(abendCode, offset, moduleName) {
  const knowledgeDir = '.bob/knowledge';
  
  if (!existsSync(knowledgeDir)) {
    return {
      priorIncidents: [],
      similarIncidents: [],
      hasHistory: false,
      count: 0,
      trends: null
    };
  }

  const exactMatches = [];
  const similarIncidents = [];
  const allIncidents = [];
  const files = readdirSync(knowledgeDir).filter(f => f.endsWith('.md'));

  for (const file of files) {
    const content = readFileSync(join(knowledgeDir, file), 'utf-8');
    
    // Extract metadata
    const idMatch = content.match(/\*\*Incident ID\*\*: (.+)/);
    const timestampMatch = content.match(/\*\*Timestamp\*\*: (.+)/);
    const abendMatch = content.match(/\*\*ABEND Code\*\*: (.+)/);
    const offsetMatch = content.match(/\*\*Offset\*\*: (.+)/);
    const moduleMatch = content.match(/\*\*Module\*\*: (.+)/);
    const severityMatch = content.match(/\*\*Severity\*\*: (.+)/);
    const confidenceMatch = content.match(/\*\*Confidence\*\*: (\d+)%/);
    const recoveryMatch = content.match(/\*\*Recovery Time\*\*: (.+)/);
    const rootCauseMatch = content.match(/\*\*Root Cause\*\*: (.+)/);
    
    const incident = {
      file,
      incident_id: idMatch ? idMatch[1].trim() : 'Unknown',
      timestamp: timestampMatch ? timestampMatch[1].trim() : 'Unknown',
      abend_code: abendMatch ? abendMatch[1].trim() : 'Unknown',
      offset: offsetMatch ? offsetMatch[1].trim() : 'N/A',
      module: moduleMatch ? moduleMatch[1].trim() : 'Unknown',
      severity: severityMatch ? severityMatch[1].trim() : 'Unknown',
      confidence: confidenceMatch ? parseInt(confidenceMatch[1]) : 0,
      recovery_time: recoveryMatch ? recoveryMatch[1].trim() : 'Unknown',
      root_cause: rootCauseMatch ? rootCauseMatch[1].trim() : 'Unknown'
    };
    
    allIncidents.push(incident);
    
    // Exact match: same ABEND, offset, and module
    if (incident.abend_code === abendCode &&
        incident.offset === offset &&
        incident.module === moduleName) {
      exactMatches.push(incident);
    }
    // Similar match: same ABEND code (pattern detection)
    else if (incident.abend_code === abendCode) {
      similarIncidents.push(incident);
    }
  }

  // Calculate operational trends
  const trends = calculateOperationalTrends(allIncidents, abendCode);

  return {
    priorIncidents: exactMatches,
    similarIncidents,
    hasHistory: exactMatches.length > 0,
    count: exactMatches.length,
    similarCount: similarIncidents.length,
    trends
  };
}

/**
 * Calculate operational improvement trends
 */
function calculateOperationalTrends(incidents, currentAbendCode) {
  if (incidents.length === 0) {
    return null;
  }

  // Filter incidents by ABEND type
  const abendIncidents = incidents.filter(i => i.abend_code === currentAbendCode);
  
  if (abendIncidents.length === 0) {
    return null;
  }

  // Sort by timestamp
  abendIncidents.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  // Calculate average recovery time
  const recoveryTimes = abendIncidents
    .map(i => parseRecoveryTime(i.recovery_time))
    .filter(t => t > 0);
  
  const avgRecoveryTime = recoveryTimes.length > 0
    ? recoveryTimes.reduce((a, b) => a + b, 0) / recoveryTimes.length
    : 0;

  // Calculate average confidence
  const avgConfidence = abendIncidents
    .filter(i => i.confidence > 0)
    .reduce((sum, i) => sum + i.confidence, 0) / abendIncidents.length;

  // Calculate improvement trend
  let improvementTrend = 'STABLE';
  if (recoveryTimes.length >= 2) {
    const recentAvg = recoveryTimes.slice(-2).reduce((a, b) => a + b, 0) / 2;
    const olderAvg = recoveryTimes.slice(0, -2).reduce((a, b) => a + b, 0) / (recoveryTimes.length - 2);
    
    if (recentAvg < olderAvg * 0.8) {
      improvementTrend = 'IMPROVING';
    } else if (recentAvg > olderAvg * 1.2) {
      improvementTrend = 'DEGRADING';
    }
  }

  return {
    total_incidents: abendIncidents.length,
    avg_recovery_hours: Math.round(avgRecoveryTime * 10) / 10,
    avg_confidence: Math.round(avgConfidence),
    improvement_trend: improvementTrend,
    first_occurrence: abendIncidents[0].timestamp,
    last_occurrence: abendIncidents[abendIncidents.length - 1].timestamp,
    frequency: calculateFrequency(abendIncidents)
  };
}

/**
 * Parse recovery time string to hours
 */
function parseRecoveryTime(timeStr) {
  if (!timeStr || timeStr === 'Unknown') return 0;
  
  const hourMatch = timeStr.match(/(\d+\.?\d*)\s*hour/i);
  const minMatch = timeStr.match(/(\d+)\s*min/i);
  
  let hours = 0;
  if (hourMatch) hours += parseFloat(hourMatch[1]);
  if (minMatch) hours += parseFloat(minMatch[1]) / 60;
  
  return hours;
}

/**
 * Calculate incident frequency
 */
function calculateFrequency(incidents) {
  if (incidents.length < 2) return 'ISOLATED';
  
  const timestamps = incidents.map(i => new Date(i.timestamp).getTime());
  const daysBetween = (timestamps[timestamps.length - 1] - timestamps[0]) / (1000 * 60 * 60 * 24);
  const incidentsPerMonth = (incidents.length / daysBetween) * 30;
  
  if (incidentsPerMonth > 4) return 'FREQUENT';
  if (incidentsPerMonth > 1) return 'RECURRING';
  return 'OCCASIONAL';
}

/**
 * Generate review checkpoint
 */
function generateReviewCheckpoint(workflow) {
  const { results, knowledgeBase } = workflow;

  return {
    summary: {
      abend: workflow.incident.abend_code,
      offset: results.correlation.offset,
      confidence: results.correlation.confidence,
      severity: classifyOperationalSeverity(results.correlation),
      priorIncidents: knowledgeBase?.count || 0
    },
    findings: {
      jcl_issues: results.jcl.issues.length,
      asm_risks: results.asm.risks.length,
      root_cause: results.correlation.rootCause.primary,
      blast_radius: results.correlation.blastRadius.severity
    },
    recommendations: results.correlation.recommendations.map(r => ({
      priority: r.priority,
      action: r.action
    })),
    requiresApproval: results.correlation.blastRadius.severity === 'CRITICAL' ||
                      results.correlation.confidence < 70
  };
}

/**
 * Classify operational severity
 */
function classifyOperationalSeverity(correlation) {
  const { blastRadius, rootCause, confidence } = correlation;

  // CRITICAL: On critical path or high confidence critical issue
  if (blastRadius.criticalPath || 
      (rootCause.severity === 'HIGH' && confidence >= 70)) {
    return 'CRITICAL';
  }

  // HIGH: Multiple downstream jobs or high severity
  if (blastRadius.downstreamCount > 2 || rootCause.severity === 'HIGH') {
    return 'HIGH';
  }

  // MEDIUM: Some downstream impact
  if (blastRadius.downstreamCount > 0) {
    return 'MEDIUM';
  }

  // LOW: Isolated issue
  return 'LOW';
}

/**
 * Generate dependency flow diagram
 */
function generateDependencyDiagram(jclResults, correlation) {
  const { topology } = jclResults;
  const { blastRadius } = correlation;

  let diagram = 'graph TB\n';
  
  // Upstream jobs
  diagram += '    subgraph UP["⬆️ Upstream Dependencies"]\n';
  diagram += '        U1[PREJOB01]:::upstream\n';
  diagram += '        U2[PREJOB02]:::upstream\n';
  diagram += '    end\n\n';

  // Failed job with critical path indicator
  const criticalIndicator = blastRadius.criticalPath ? '🔴 CRITICAL PATH' : '';
  diagram += `    subgraph FAIL["❌ Failed Job ${criticalIndicator}"]\n`;
  diagram += `        MAIN["${topology.jobName}<br/>ABEND: ${correlation.abendCode}"]:::failed\n`;
  diagram += '    end\n\n';

  // Downstream impact with enterprise systems
  if (blastRadius.enterpriseImpact && blastRadius.enterpriseImpact.length > 0) {
    diagram += '    subgraph DOWN["⬇️ Enterprise Impact"]\n';
    diagram += '        D1[Payroll Export]:::blocked\n';
    diagram += '        D2[Tax Summary]:::blocked\n';
    diagram += '        D3[GL Posting]:::blocked\n';
    diagram += '        D4[HR Reconciliation]:::delayed\n';
    diagram += '        D5[Reporting]:::delayed\n';
    diagram += '    end\n\n';
  }

  // Connections
  diagram += '    U1 -->|Success| MAIN\n';
  diagram += '    U2 -->|Success| MAIN\n';

  if (blastRadius.enterpriseImpact && blastRadius.enterpriseImpact.length > 0) {
    diagram += '    MAIN -.->|BLOCKED| D1\n';
    diagram += '    MAIN -.->|BLOCKED| D2\n';
    diagram += '    MAIN -.->|BLOCKED| D3\n';
    diagram += '    MAIN -.->|DELAYED| D4\n';
    diagram += '    MAIN -.->|DELAYED| D5\n';
  }

  // Enhanced styling
  diagram += '\n    classDef failed fill:#ff6b6b,stroke:#c92a2a,stroke-width:4px,color:#fff\n';
  diagram += '    classDef blocked fill:#ffd43b,stroke:#fab005,stroke-width:3px\n';
  diagram += '    classDef delayed fill:#ffe066,stroke:#fcc419,stroke-width:2px\n';
  diagram += '    classDef upstream fill:#51cf66,stroke:#37b24d,stroke-width:2px\n';

  return diagram;
}

/**
 * Generate enterprise-grade Markdown RCA
 */
function generateEnterpriseRCA(rca, workflow) {
  const { metadata, analysis, knowledgeBase, recommendations, diagrams } = rca;

  let md = `# Root Cause Analysis Report\n\n`;
  
  // Executive Header
  md += `## Executive Summary\n\n`;
  md += `| Field | Value |\n`;
  md += `|-------|-------|\n`;
  md += `| **Incident ID** | ${metadata.incident_id} |\n`;
  md += `| **Timestamp** | ${new Date(metadata.timestamp).toLocaleString()} |\n`;
  md += `| **ABEND Code** | ${metadata.abend_code} |\n`;
  md += `| **Offset** | ${metadata.offset} |\n`;
  md += `| **Job** | ${metadata.job_name} |\n`;
  md += `| **Module** | ${metadata.module_name} |\n`;
  md += `| **Severity** | **${metadata.severity}** ${getSeverityEmoji(metadata.severity)} |\n`;
  md += `| **Confidence** | ${analysis.confidence}% |\n\n`;

  // Enhanced Operational Knowledge with Trends
  if (knowledgeBase.hasHistory || knowledgeBase.similarCount > 0 || knowledgeBase.trends) {
    md += `### 📚 Operational Knowledge & Trends\n\n`;
    
    // Exact matches
    if (knowledgeBase.hasHistory) {
      md += `#### Exact Match History\n\n`;
      md += `**${knowledgeBase.count} prior incident(s)** with identical ABEND+offset+module:\n\n`;
      knowledgeBase.priorIncidents.forEach((incident, i) => {
        md += `${i + 1}. **${incident.incident_id}** - ${new Date(incident.timestamp).toLocaleDateString()} - ${incident.severity} - Recovery: ${incident.recovery_time}\n`;
        md += `   Root Cause: ${incident.root_cause}\n`;
      });
      md += `\n> ⚠️ **Recurring Issue**: This exact ABEND pattern has occurred ${knowledgeBase.count} time(s) before.\n\n`;
    }
    
    // Similar incidents (pattern detection)
    if (knowledgeBase.similarCount > 0) {
      md += `#### Similar Incidents (${metadata.abend_code} Pattern)\n\n`;
      md += `**${knowledgeBase.similarCount} similar incident(s)** with same ABEND code:\n\n`;
      knowledgeBase.similarIncidents.slice(0, 3).forEach((incident, i) => {
        md += `${i + 1}. **${incident.incident_id}** - ${incident.module} at ${incident.offset} - ${incident.severity}\n`;
      });
      if (knowledgeBase.similarCount > 3) {
        md += `\n*...and ${knowledgeBase.similarCount - 3} more similar incidents*\n`;
      }
      md += `\n`;
    }
    
    // Operational trends
    if (knowledgeBase.trends) {
      const { trends } = knowledgeBase;
      md += `#### Operational Metrics & Trends\n\n`;
      md += `| Metric | Value |\n`;
      md += `|--------|-------|\n`;
      md += `| **Total ${metadata.abend_code} Incidents** | ${trends.total_incidents} |\n`;
      md += `| **Average Recovery Time** | ${trends.avg_recovery_hours} hours |\n`;
      md += `| **Average Confidence** | ${trends.avg_confidence}% |\n`;
      md += `| **Incident Frequency** | ${trends.frequency} |\n`;
      md += `| **Improvement Trend** | ${getTrendEmoji(trends.improvement_trend)} ${trends.improvement_trend} |\n`;
      md += `| **First Occurrence** | ${new Date(trends.first_occurrence).toLocaleDateString()} |\n`;
      md += `| **Last Occurrence** | ${new Date(trends.last_occurrence).toLocaleDateString()} |\n\n`;
      
      // Trend interpretation
      if (trends.improvement_trend === 'IMPROVING') {
        md += `> ✅ **Positive Trend**: MTTR improving over time. Recent fixes are effective.\n\n`;
      } else if (trends.improvement_trend === 'DEGRADING') {
        md += `> ⚠️ **Negative Trend**: MTTR increasing. Root cause may not be fully addressed.\n\n`;
      } else {
        md += `> ℹ️ **Stable Pattern**: Consistent recovery performance across incidents.\n\n`;
      }
    }
  }

  md += `---\n\n`;

  // Root Cause
  md += `## 🔴 Root Cause\n\n`;
  md += `**${analysis.rootCause.primary}**\n\n`;
  md += `*Category: ${analysis.rootCause.category}*\n\n`;

  if (analysis.rootCause.contributing.length > 0) {
    md += `**Contributing Factors:**\n`;
    analysis.rootCause.contributing.forEach((factor, i) => {
      md += `${i + 1}. ${factor.description}\n`;
    });
    md += `\n`;
  }

  // Blast Radius with Enterprise Impact
  md += `## 💥 Enterprise Impact\n\n`;
  md += `| Metric | Status |\n`;
  md += `|--------|--------|\n`;
  md += `| **Severity** | ${metadata.severity} ${getSeverityEmoji(metadata.severity)} |\n`;
  md += `| **Critical Path** | ${analysis.blastRadius.criticalPath ? 'Yes ⚠️' : 'No'} |\n`;
  md += `| **Downstream Jobs** | ${analysis.blastRadius.downstreamCount} blocked |\n\n`;

  if (analysis.blastRadius.enterpriseImpact && analysis.blastRadius.enterpriseImpact.length > 0) {
    md += `### Affected Systems\n\n`;
    md += `| System | Status | Business Impact |\n`;
    md += `|--------|--------|------------------|\n`;
    analysis.blastRadius.enterpriseImpact.forEach(impact => {
      const statusEmoji = impact.status === 'BLOCKED' ? '🔴' : '🟡';
      md += `| ${impact.system} | ${statusEmoji} ${impact.status} | ${impact.businessImpact} |\n`;
    });
    md += `\n`;
  }

  // Dependency Diagram
  md += `### Dependency Flow\n\n`;
  md += `\`\`\`mermaid\n${diagrams.dependency_flow}\`\`\`\n\n`;

  // JCL Topology
  if (diagrams.jcl_topology) {
    md += `### JCL Job Topology\n\n`;
    md += `\`\`\`mermaid\n${diagrams.jcl_topology}\`\`\`\n\n`;
  }

  // Forensic Details (Condensed)
  md += `## 🔬 Technical Details\n\n`;

  if (analysis.forensicDetails.instruction) {
    const inst = analysis.forensicDetails.instruction;
    md += `**Failure Point:** ${inst.label} at offset ${inst.offset} (${inst.instruction})\n\n`;
  }

  if (analysis.forensicDetails.matchingRisk) {
    const risk = analysis.forensicDetails.matchingRisk;
    md += `**Risk:** ${risk.message} - ${risk.recommendation}\n\n`;
  }

  if (analysis.forensicDetails.jclIssues && analysis.forensicDetails.jclIssues.length > 0) {
    md += `**JCL Issues:**\n`;
    analysis.forensicDetails.jclIssues.forEach(issue => {
      md += `- ${issue.message}\n`;
    });
    md += `\n`;
  }

  // Remediation
  md += `## ✅ Remediation Plan\n\n`;
  
  const priorityOrder = ['IMMEDIATE', 'HIGH', 'MEDIUM', 'LOW'];
  priorityOrder.forEach(priority => {
    const recs = recommendations.filter(r => r.priority === priority);
    if (recs.length > 0) {
      md += `### ${priority} Priority\n\n`;
      recs.forEach((rec, i) => {
        md += `${i + 1}. **${rec.action}**\n`;
        md += `   - Rationale: ${rec.rationale}\n\n`;
      });
    }
  });

  // Footer
  md += `---\n\n`;
  md += `*Generated by Bee-Keeper Forensic Analysis Engine*  \n`;
  md += `*Confidence Score: ${analysis.confidence}% | Severity: ${metadata.severity}*\n`;

  return md;
}

/**
 * Save RCA to knowledge base
 */
function saveToKnowledgeBase(rca, markdownReport) {
  const knowledgeDir = '.bob/knowledge';
  const filename = `${rca.metadata.incident_id}.md`;
  const filepath = join(knowledgeDir, filename);

  try {
    writeFileSync(filepath, markdownReport);
    return { saved: true, path: filepath };
  } catch (error) {
    return { saved: false, error: error.message };
  }
}

/**
 * Generate incident ID
 */
function generateIncidentID(incident) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
  return `INC-${incident.abend_code}-${timestamp}`;
}

/**
 * Get trend emoji
 */
function getTrendEmoji(trend) {
  switch (trend) {
    case 'IMPROVING': return '📈';
    case 'DEGRADING': return '📉';
    case 'STABLE': return '➡️';
    default: return 'ℹ️';
  }
}

/**
 * Normalize offset format
 */
function normalizeOffset(offset) {
  let cleaned = offset.replace(/[X'x\s]/g, '');
  return `X'${cleaned.toUpperCase().padStart(2, '0')}'`;
}

/**
 * Get severity emoji
 */
function getSeverityEmoji(severity) {
  const emojis = {
    'CRITICAL': '🔴',
    'HIGH': '🟠',
    'MEDIUM': '🟡',
    'LOW': '🟢'
  };
  return emojis[severity] || '⚪';
}

// Made with Bob
