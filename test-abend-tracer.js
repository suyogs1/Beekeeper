#!/usr/bin/env node

/**
 * Test script for ABEND tracer
 * Demo scenario: PAYRL001 job, S0C7 ABEND, TAXCALC module, offset X'B4'
 * Run: node test-abend-tracer.js
 */

import { parseJCL, generateSummary } from './src/tools/jcl-parser.js';
import { decompileASM } from './src/tools/asm-decompiler.js';
import { traceABEND, generateMarkdownRCA } from './src/tools/abend-tracer.js';
import { writeFileSync } from 'fs';

console.log('🐝 Bee-Keeper ABEND Tracer Test\n');
console.log('=' .repeat(70));
console.log('\n📋 DEMO SCENARIO');
console.log('-'.repeat(70));
console.log('Job: PAYRL001');
console.log('ABEND Code: S0C7 (Data Exception)');
console.log('Offset: X\'B4\'');
console.log('Module: TAXCALC');
console.log('Contributing Factor: Missing STEPLIB in TAXCALC step\n');

try {
  // Step 1: Parse JCL topology
  console.log('🔍 Step 1: Analyzing JCL Topology...');
  const jclPath = './jobs/payrl001.jcl';
  const jclTopology = parseJCL(jclPath);
  const jclSummary = generateSummary(jclTopology);
  console.log(`✓ JCL Analysis Complete: ${jclSummary.job}`);
  console.log(`  - Steps: ${jclSummary.stepCount}`);
  console.log(`  - Issues: ${jclSummary.issueCount} (${jclSummary.criticalIssues} critical)`);
  
  // Step 2: Decompile ASM module
  console.log('\n🔍 Step 2: Decompiling Assembler Module...');
  const asmPath = './src/taxcalc.asm';
  const asmAnalysis = decompileASM(asmPath);
  console.log(`✓ ASM Decompilation Complete: ${asmAnalysis.moduleName}`);
  console.log(`  - Sections: ${asmAnalysis.labels.length}`);
  console.log(`  - Operations: ${Object.values(asmAnalysis.operations).flat().length}`);
  console.log(`  - Risks: ${asmAnalysis.risks.length}`);
  
  // Step 3: Trace ABEND and generate RCA
  console.log('\n🔍 Step 3: Correlating ABEND with Forensic Analysis...');
  const abendCode = 'S0C7';
  const offset = 'XB4';  // Can also use X'B4', 0xB4, etc.
  
  const jclResults = {
    topology: {
      jobName: jclTopology.jobName,
      steps: jclTopology.steps,
      datasets: jclTopology.datasets,
      issues: jclTopology.issues,
      dependencies: {
        upstream: ['PREJOB01', 'PREJOB02'],
        downstream: ['POSTJOB01'],
        critical_path: true
      }
    }
  };
  
  const rcaAnalysis = traceABEND(abendCode, offset, asmAnalysis, jclResults);
  console.log(`✓ RCA Analysis Complete`);
  console.log(`  - Confidence: ${rcaAnalysis.confidence}%`);
  console.log(`  - Root Cause Category: ${rcaAnalysis.rootCause.category}`);
  console.log(`  - Contributing Factors: ${rcaAnalysis.rootCause.contributing.length}`);
  
  // Display results
  console.log('\n' + '='.repeat(70));
  console.log('📊 ROOT CAUSE ANALYSIS RESULTS');
  console.log('='.repeat(70));
  
  console.log('\n🎯 CONFIDENCE SCORE');
  console.log('-'.repeat(70));
  console.log(`${rcaAnalysis.confidence}% confidence in root cause determination`);
  
  console.log('\n🔴 ROOT CAUSE');
  console.log('-'.repeat(70));
  console.log(`Category: ${rcaAnalysis.rootCause.category}`);
  console.log(`Primary: ${rcaAnalysis.rootCause.primary}`);
  console.log(`Severity: ${rcaAnalysis.rootCause.severity}`);
  
  if (rcaAnalysis.rootCause.contributing.length > 0) {
    console.log('\nContributing Factors:');
    rcaAnalysis.rootCause.contributing.forEach((factor, i) => {
      console.log(`  ${i + 1}. ${factor.factor}`);
      console.log(`     ${factor.description}`);
      console.log(`     Impact: ${factor.impact}`);
    });
  }
  
  console.log('\n💥 BLAST RADIUS');
  console.log('-'.repeat(70));
  console.log(`Severity: ${rcaAnalysis.blastRadius.severity}`);
  console.log(`Critical Path: ${rcaAnalysis.blastRadius.criticalPath ? 'YES ⚠️' : 'No'}`);
  console.log(`Downstream Jobs Affected: ${rcaAnalysis.blastRadius.downstreamCount}`);
  if (rcaAnalysis.blastRadius.impactedJobs.length > 0) {
    console.log(`Impacted Jobs: ${rcaAnalysis.blastRadius.impactedJobs.join(', ')}`);
  }
  
  console.log('\n📖 FORENSIC NARRATIVE');
  console.log('-'.repeat(70));
  rcaAnalysis.narrative.forEach(section => {
    console.log(`\n${section.title}:`);
    console.log(`  ${section.content}`);
  });
  
  console.log('\n🔧 FORENSIC DETAILS');
  console.log('-'.repeat(70));
  if (rcaAnalysis.forensicDetails.instruction) {
    const inst = rcaAnalysis.forensicDetails.instruction;
    console.log(`Instruction at Offset:`);
    console.log(`  Label: ${inst.label}`);
    console.log(`  Instruction: ${inst.instruction}`);
    console.log(`  Line: ${inst.lineNumber}`);
    console.log(`  Offset: ${inst.offset}`);
    console.log(`  Match Type: ${inst.matchType}`);
  }
  
  if (rcaAnalysis.forensicDetails.matchingRisk) {
    const risk = rcaAnalysis.forensicDetails.matchingRisk;
    console.log(`\nMatching Risk:`);
    console.log(`  Type: ${risk.type}`);
    console.log(`  Severity: ${risk.severity}`);
    console.log(`  Message: ${risk.message}`);
    console.log(`  Recommendation: ${risk.recommendation}`);
  }
  
  if (rcaAnalysis.forensicDetails.jclIssues && rcaAnalysis.forensicDetails.jclIssues.length > 0) {
    console.log(`\nJCL Issues:`);
    rcaAnalysis.forensicDetails.jclIssues.forEach(issue => {
      console.log(`  - ${issue.type}: ${issue.message}`);
      console.log(`    Contribution: ${issue.contribution}`);
    });
  }
  
  console.log('\n✅ REMEDIATION RECOMMENDATIONS');
  console.log('-'.repeat(70));
  rcaAnalysis.recommendations.forEach((rec, i) => {
    console.log(`\n${i + 1}. [${rec.priority}] ${rec.action}`);
    console.log(`   Rationale: ${rec.rationale}`);
  });
  
  // Generate Markdown RCA
  console.log('\n📄 GENERATING MARKDOWN RCA REPORT...');
  const markdownRCA = generateMarkdownRCA(rcaAnalysis);
  const outputPath = './RCA-PAYRL001-S0C7.md';
  writeFileSync(outputPath, markdownRCA);
  console.log(`✓ Markdown RCA saved to: ${outputPath}`);
  
  console.log('\n' + '='.repeat(70));
  console.log('✅ ABEND Trace completed successfully!\n');
  
  // Display summary
  console.log('📋 SUMMARY');
  console.log('-'.repeat(70));
  console.log(`ABEND: ${abendCode} at offset ${rcaAnalysis.offset}`);
  console.log(`Confidence: ${rcaAnalysis.confidence}%`);
  console.log(`Root Cause: ${rcaAnalysis.rootCause.primary}`);
  console.log(`Severity: ${rcaAnalysis.blastRadius.severity}`);
  console.log(`Recommendations: ${rcaAnalysis.recommendations.length} actions identified`);
  console.log(`\nFull RCA report available in: ${outputPath}\n`);
  
} catch (error) {
  console.error('\n❌ Test failed:');
  console.error(error.message);
  console.error(error.stack);
  process.exit(1);
}

// Made with Bob
