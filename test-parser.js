#!/usr/bin/env node

/**
 * Test script for JCL parser
 * Run: node test-parser.js
 */

import { parseJCL, generateMermaidDiagram, generateSummary } from './src/tools/jcl-parser.js';

console.log('🐝 Bee-Keeper JCL Parser Test\n');
console.log('=' .repeat(60));

try {
  // Parse the sample JCL file
  const filePath = './jobs/payrl001.jcl';
  console.log(`\n📄 Parsing: ${filePath}\n`);
  
  const topology = parseJCL(filePath);
  const summary = generateSummary(topology);
  const mermaidDiagram = generateMermaidDiagram(topology);
  
  // Display summary
  console.log('📊 SUMMARY');
  console.log('-'.repeat(60));
  console.log(`Job Name: ${summary.job}`);
  console.log(`Status: ${summary.status}`);
  console.log(`Steps: ${summary.stepCount}`);
  console.log(`Datasets: ${summary.datasetCount}`);
  console.log(`Issues: ${summary.issueCount} (${summary.criticalIssues} critical)`);
  
  // Display steps
  console.log('\n🔧 STEPS');
  console.log('-'.repeat(60));
  summary.steps.forEach((step, i) => {
    const steplibStatus = step.hasSteplib ? '✓' : '✗';
    console.log(`${i + 1}. ${step.name} (${step.program})`);
    console.log(`   STEPLIB: ${steplibStatus} | DD Statements: ${step.ddCount}`);
  });
  
  // Display issues
  if (topology.issues.length > 0) {
    console.log('\n⚠️  ISSUES DETECTED');
    console.log('-'.repeat(60));
    topology.issues.forEach((issue, i) => {
      console.log(`${i + 1}. [${issue.severity}] ${issue.type}`);
      console.log(`   Step: ${issue.step} (${issue.program})`);
      console.log(`   Line: ${issue.lineNumber}`);
      console.log(`   Message: ${issue.message}`);
      console.log(`   Fix: ${issue.recommendation}`);
      console.log();
    });
  }
  
  // Display Mermaid diagram
  console.log('📈 MERMAID DIAGRAM');
  console.log('-'.repeat(60));
  console.log(mermaidDiagram);
  
  // Display datasets
  console.log('\n💾 DATASETS');
  console.log('-'.repeat(60));
  topology.datasets.forEach((ds, i) => {
    console.log(`${i + 1}. ${ds}`);
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Test completed successfully!\n');
  
} catch (error) {
  console.error('\n❌ Test failed:');
  console.error(error.message);
  console.error(error.stack);
  process.exit(1);
}

// Made with Bob
