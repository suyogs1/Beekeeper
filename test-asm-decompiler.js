#!/usr/bin/env node

/**
 * Test script for ASM decompiler
 * Run: node test-asm-decompiler.js
 */

import { decompileASM, generatePseudoCode, generateExplanation } from './src/tools/asm-decompiler.js';

console.log('🐝 Bee-Keeper ASM Decompiler Test\n');
console.log('=' .repeat(70));

try {
  // Decompile the sample ASM file
  const filePath = './src/taxcalc.asm';
  console.log(`\n📄 Decompiling: ${filePath}\n`);
  
  const analysis = decompileASM(filePath);
  const pseudoCode = generatePseudoCode(analysis);
  const explanation = generateExplanation(analysis);
  
  // Display module info
  console.log('📦 MODULE INFORMATION');
  console.log('-'.repeat(70));
  console.log(`Name: ${analysis.moduleName}`);
  console.log(`Sections: ${analysis.labels.length}`);
  console.log(`Operations: ${Object.values(analysis.operations).flat().length}`);
  console.log(`Data Areas: ${analysis.dataAreas.length}`);
  console.log(`Risks: ${analysis.risks.length}`);
  
  // Display labels/sections
  console.log('\n🏷️  LOGICAL SECTIONS');
  console.log('-'.repeat(70));
  analysis.labels.slice(0, 10).forEach((label, i) => {
    console.log(`${i + 1}. ${label.name} (Line ${label.lineNumber})`);
    console.log(`   Purpose: ${label.purpose}`);
  });
  if (analysis.labels.length > 10) {
    console.log(`   ... and ${analysis.labels.length - 10} more sections`);
  }
  
  // Display operations summary
  console.log('\n⚙️  OPERATIONS SUMMARY');
  console.log('-'.repeat(70));
  console.log(`Packed Decimal: ${analysis.operations.packedDecimal.length}`);
  console.log(`Data Movement: ${analysis.operations.dataMovement.length}`);
  console.log(`Branches: ${analysis.operations.branches.length}`);
  console.log(`I/O Operations: ${analysis.operations.io.length}`);
  
  // Display key operations
  if (analysis.operations.packedDecimal.length > 0) {
    console.log('\n📊 KEY PACKED DECIMAL OPERATIONS:');
    analysis.operations.packedDecimal.slice(0, 3).forEach(op => {
      console.log(`  Line ${op.lineNumber}: ${op.operation} - ${op.description}`);
    });
  }
  
  // Display forensic risks
  if (analysis.risks.length > 0) {
    console.log('\n⚠️  FORENSIC RISK ANALYSIS');
    console.log('-'.repeat(70));
    analysis.risks.forEach((risk, i) => {
      console.log(`${i + 1}. [${risk.severity}] ${risk.type}`);
      console.log(`   Location: Line ${risk.lineNumber}, Offset ${risk.offset}`);
      console.log(`   Instruction: ${risk.instruction}`);
      console.log(`   Risk: ${risk.message}`);
      console.log(`   Fix: ${risk.recommendation}`);
      console.log();
    });
  } else {
    console.log('\n✓ No forensic risks detected');
  }
  
  // Display key offsets
  console.log('\n📍 KEY INSTRUCTION OFFSETS');
  console.log('-'.repeat(70));
  analysis.offsets.slice(0, 8).forEach(offset => {
    console.log(`${offset.offset}: ${offset.label} (${offset.instruction}) - Line ${offset.lineNumber}`);
  });
  
  // Display pseudo-code
  console.log('\n💻 PSEUDO-CODE REPRESENTATION');
  console.log('-'.repeat(70));
  console.log(pseudoCode);
  
  // Display operational explanation
  console.log('📖 OPERATIONAL EXPLANATION');
  console.log('-'.repeat(70));
  console.log(`Overview: ${explanation.overview}`);
  console.log(`Purpose: ${explanation.purpose}`);
  console.log(`\nWorkflow:`);
  console.log(`  ${explanation.workflow}`);
  console.log(`\nData Processing:`);
  console.log(`  ${explanation.dataProcessing}`);
  console.log(`\nRisk Assessment:`);
  console.log(`  ${explanation.riskAssessment}`);
  
  console.log('\n' + '='.repeat(70));
  console.log('✅ Decompilation completed successfully!\n');
  
} catch (error) {
  console.error('\n❌ Test failed:');
  console.error(error.message);
  console.error(error.stack);
  process.exit(1);
}

// Made with Bob
