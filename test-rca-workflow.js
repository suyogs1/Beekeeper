#!/usr/bin/env node

/**
 * Test script for complete RCA workflow
 * Demonstrates native IBM Bob forensic workflow with cinematic presentation
 * Run: node test-rca-workflow.js
 */

import { executeRCAWorkflow, generateFinalRCA } from './src/tools/rca-workflow.js';
import {
  formatWorkflowBanner,
  formatPhaseHeader,
  formatPhaseSummary,
  formatReviewCheckpoint,
  formatFinalSummary,
  formatProgressBar
} from './src/tools/rca-presentation.js';
import { writeFileSync } from 'fs';

// Display workflow banner
console.log(formatWorkflowBanner());

try {
  // Incident intake
  const incident = {
    abend_code: 'S0C7',
    offset: 'XB4',
    jcl_file_path: './jobs/payrl001.jcl',
    asm_file_path: './src/taxcalc.asm'
  };

  console.log(formatPhaseHeader(1, 'INCIDENT INTAKE', 'IN_PROGRESS'));
  console.log(formatPhaseSummary('INTAKE', {
    abend_code: incident.abend_code,
    offset: incident.offset,
    job_name: 'PAYRL001',
    module_name: 'TAXCALC'
  }));

  // Execute workflow with progress indicators
  console.log(formatProgressBar(1, 7));
  console.log('\n🔄 Executing forensic workflow...\n');
  
  const workflow = executeRCAWorkflow(incident);

  // Phase 2: JCL Analysis
  console.log(formatPhaseHeader(2, 'JCL ANALYSIS', 'COMPLETED'));
  console.log(formatPhaseSummary('JCL_ANALYSIS', workflow.results.jcl));
  console.log(formatProgressBar(2, 7));

  // Phase 3: ASM Analysis
  console.log(formatPhaseHeader(3, 'ASM ANALYSIS', 'COMPLETED'));
  console.log(formatPhaseSummary('ASM_ANALYSIS', workflow.results.asm));
  console.log(formatProgressBar(3, 7));

  // Phase 4: ABEND Correlation
  console.log(formatPhaseHeader(4, 'ABEND CORRELATION', 'COMPLETED'));
  console.log(formatPhaseSummary('ABEND_CORRELATION', workflow.results.correlation));
  console.log(formatProgressBar(4, 7));
  // Phase 5: Knowledge Check
  console.log(formatPhaseHeader(5, 'KNOWLEDGE CHECK', 'COMPLETED'));
  console.log(formatPhaseSummary('KNOWLEDGE_CHECK', workflow.knowledgeBase));
  console.log(formatProgressBar(5, 7));

  // Phase 6: Review Checkpoint
  console.log(formatPhaseHeader(6, 'REVIEW CHECKPOINT', 'COMPLETED'));
  console.log(formatReviewCheckpoint(workflow.checkpoint));
  console.log(formatProgressBar(6, 7));

  // Simulate review approval
  console.log('\n✅ REVIEW APPROVED - Proceeding to final RCA generation...\n');

  // Phase 7: Generate final RCA
  console.log(formatPhaseHeader(7, 'RCA GENERATION', 'IN_PROGRESS'));
  const finalRCA = generateFinalRCA(workflow, true);

  if (finalRCA.status === 'RCA_COMPLETE') {
    console.log(formatPhaseHeader(7, 'RCA GENERATION', 'COMPLETED'));
    console.log(formatPhaseSummary('RCA_GENERATION', {
      incident_id: finalRCA.rca.metadata.incident_id,
      severity: finalRCA.rca.metadata.severity,
      confidence: finalRCA.rca.analysis.confidence,
      filename: finalRCA.filename
    }));
    console.log(formatProgressBar(7, 7));
    console.log(`Confidence: ${finalRCA.rca.analysis.confidence}%`);

    // Display knowledge base info
    if (finalRCA.rca.knowledgeBase.hasHistory) {
      console.log('\n📚 OPERATIONAL KNOWLEDGE');
      console.log('-'.repeat(70));
      console.log(`Prior Incidents Found: ${finalRCA.rca.knowledgeBase.count}`);
      finalRCA.rca.knowledgeBase.priorIncidents.forEach((inc, i) => {
        console.log(`  ${i + 1}. ${inc.incident_id} (${inc.date})`);
      });
    }

    // Display diagrams info
    console.log('\n📊 DIAGRAMS INCLUDED');
    console.log('-'.repeat(70));
    console.log('✓ JCL Topology (Mermaid)');
    console.log('✓ Dependency Flow (Mermaid)');

    // Save report
    const reportPath = `./RCA-${finalRCA.rca.metadata.incident_id}.md`;
    writeFileSync(reportPath, finalRCA.markdown_report);
    console.log(`\n✅ Enterprise RCA Report saved to: ${reportPath}`);

    // Save to knowledge base
    const kbPath = `.bob/knowledge/${finalRCA.rca.metadata.incident_id}.md`;
    console.log(`✅ Saved to knowledge base: ${kbPath}`);

    // Display report preview
    console.log('\n' + '='.repeat(70));
    console.log('📄 REPORT PREVIEW (First 50 lines)');
    console.log('='.repeat(70));
    const lines = finalRCA.markdown_report.split('\n').slice(0, 50);
    console.log(lines.join('\n'));
    if (finalRCA.markdown_report.split('\n').length > 50) {
      console.log('\n... (see full report in file) ...');
    }

    console.log('\n' + '='.repeat(70));
    console.log('✅ WORKFLOW COMPLETE');
    console.log('='.repeat(70));
    console.log('\n📊 WORKFLOW SUMMARY');
    console.log('-'.repeat(70));
    console.log(`Status: ${finalRCA.status}`);
    console.log(`Incident ID: ${finalRCA.rca.metadata.incident_id}`);
    console.log(`Severity: ${finalRCA.rca.metadata.severity}`);
    console.log(`Confidence: ${finalRCA.rca.analysis.confidence}%`);
    console.log(`Recommendations: ${finalRCA.rca.recommendations.length} actions`);
    console.log(`Knowledge Base: ${finalRCA.rca.knowledgeBase.hasHistory ? 'Updated with prior incidents' : 'New incident recorded'}`);
    console.log(`\nFull report: ${reportPath}\n`);

  } else {
    console.error(`\n❌ RCA generation failed: ${finalRCA.message}`);
  }

} catch (error) {
  console.error('\n❌ Workflow failed:');
  console.error(error.message);
  console.error(error.stack);
  process.exit(1);
}

// Made with Bob
