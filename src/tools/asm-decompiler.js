/**
 * ASM Decompiler - Lightweight Assembler forensic analysis
 * Extracts high-level logic and identifies risk areas for incident analysis
 */

import { readFileSync } from 'fs';

/**
 * Decompile Assembler source file
 * @param {string} filePath - Path to ASM file
 * @returns {Object} Decompiled analysis
 */
export function decompileASM(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  const analysis = {
    moduleName: extractModuleName(lines),
    labels: extractLabels(lines),
    operations: extractOperations(lines),
    dataAreas: extractDataAreas(lines),
    risks: identifyRisks(lines),
    offsets: calculateOffsets(lines)
  };

  return analysis;
}

/**
 * Extract module name from CSECT
 */
function extractModuleName(lines) {
  for (const line of lines) {
    const match = line.match(/^(\w+)\s+CSECT/);
    if (match) return match[1];
  }
  return 'UNKNOWN';
}

/**
 * Extract labels and their purposes
 */
function extractLabels(lines) {
  const labels = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Match label at start of line (not comment, not continuation)
    const match = line.match(/^(\w+)\s+(DS|DC|EQU|CSECT|USING|SAVE|L|ZAP|PACK|CP|MP|DP|AP|MVC|UNPK|OI|WTO|B|BE|RETURN)/);
    if (match) {
      const label = match[1];
      const instruction = match[2];
      
      // Get comment if present
      let purpose = '';
      const commentMatch = line.match(/\*\s*(.+)$/);
      if (commentMatch) {
        purpose = commentMatch[1].trim();
      } else {
        // Look for comment in previous lines
        for (let j = i - 1; j >= Math.max(0, i - 3); j--) {
          const prevLine = lines[j].trim();
          if (prevLine.startsWith('*') && !prevLine.startsWith('***')) {
            purpose = prevLine.substring(1).trim();
            break;
          }
        }
      }
      
      labels.push({
        name: label,
        lineNumber: i + 1,
        instruction,
        purpose: purpose || inferPurpose(label, instruction)
      });
    }
  }
  
  return labels;
}

/**
 * Infer purpose from label name
 */
function inferPurpose(label, instruction) {
  const purposes = {
    'INIT': 'Initialize working storage',
    'LOAD': 'Load data from input',
    'CALC': 'Perform calculation',
    'STORE': 'Store results to output',
    'RETURN': 'Return to caller',
    'ERROR': 'Error handling',
    'CHECK': 'Validation check'
  };
  
  for (const [key, value] of Object.entries(purposes)) {
    if (label.toUpperCase().includes(key)) {
      return value;
    }
  }
  
  return `${instruction} operation`;
}

/**
 * Extract operations and categorize them
 */
function extractOperations(lines) {
  const operations = {
    packedDecimal: [],
    dataMovement: [],
    branches: [],
    arithmetic: [],
    io: []
  };
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;
    
    // Packed decimal operations
    if (/\b(PACK|UNPK|ZAP|CP|AP|SP|MP|DP)\b/.test(line)) {
      const match = line.match(/^\w*\s+(PACK|UNPK|ZAP|CP|AP|SP|MP|DP)\s+(.+)/);
      if (match) {
        operations.packedDecimal.push({
          lineNumber: lineNum,
          operation: match[1],
          operands: match[2].trim(),
          description: describePackedOp(match[1], match[2])
        });
      }
    }
    
    // Data movement
    if (/\b(MVC|L|LA|ST|LR)\b/.test(line)) {
      const match = line.match(/^\w*\s+(MVC|L|LA|ST|LR)\s+(.+)/);
      if (match) {
        operations.dataMovement.push({
          lineNumber: lineNum,
          operation: match[1],
          operands: match[2].trim(),
          description: describeDataMove(match[1], match[2])
        });
      }
    }
    
    // Branch instructions
    if (/\b(B|BE|BNE|BH|BL|BC|BCR)\b/.test(line)) {
      const match = line.match(/^\w*\s+(B|BE|BNE|BH|BL|BC|BCR)\s+(.+)/);
      if (match) {
        operations.branches.push({
          lineNumber: lineNum,
          operation: match[1],
          target: match[2].trim(),
          description: describeBranch(match[1], match[2])
        });
      }
    }
    
    // I/O operations
    if (/\b(WTO|GET|PUT|READ|WRITE)\b/.test(line)) {
      const match = line.match(/^\w*\s+(WTO|GET|PUT|READ|WRITE)\s+(.+)/);
      if (match) {
        operations.io.push({
          lineNumber: lineNum,
          operation: match[1],
          operands: match[2].trim()
        });
      }
    }
  }
  
  return operations;
}

/**
 * Describe packed decimal operation
 */
function describePackedOp(op, operands) {
  const descriptions = {
    'PACK': `Convert zoned decimal to packed: ${operands}`,
    'UNPK': `Convert packed to zoned decimal: ${operands}`,
    'ZAP': `Zero and add packed: ${operands}`,
    'CP': `Compare packed decimals: ${operands}`,
    'AP': `Add packed decimals: ${operands}`,
    'SP': `Subtract packed decimals: ${operands}`,
    'MP': `Multiply packed decimals: ${operands}`,
    'DP': `Divide packed decimals: ${operands}`
  };
  return descriptions[op] || `${op} operation`;
}

/**
 * Describe data movement operation
 */
function describeDataMove(op, operands) {
  const descriptions = {
    'MVC': `Move character data: ${operands}`,
    'L': `Load register: ${operands}`,
    'LA': `Load address: ${operands}`,
    'ST': `Store register: ${operands}`,
    'LR': `Load register from register: ${operands}`
  };
  return descriptions[op] || `${op} operation`;
}

/**
 * Describe branch operation
 */
function describeBranch(op, target) {
  const descriptions = {
    'B': `Unconditional branch to ${target}`,
    'BE': `Branch if equal to ${target}`,
    'BNE': `Branch if not equal to ${target}`,
    'BH': `Branch if high to ${target}`,
    'BL': `Branch if low to ${target}`
  };
  return descriptions[op] || `Conditional branch to ${target}`;
}

/**
 * Extract data area definitions
 */
function extractDataAreas(lines) {
  const dataAreas = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^(\w+)\s+DS\s+(\w+)|^(\w+)\s+DC\s+(.+)/);
    
    if (match) {
      const name = match[1] || match[3];
      const type = match[2] || match[4];
      
      dataAreas.push({
        name,
        type,
        lineNumber: i + 1,
        description: describeDataArea(name, type)
      });
    }
  }
  
  return dataAreas;
}

/**
 * Describe data area purpose
 */
function describeDataArea(name, type) {
  if (name.includes('WORK')) return 'Working storage area';
  if (name.includes('SAVE')) return 'Register save area';
  if (name.includes('PK') || type.includes('PL')) return 'Packed decimal field';
  if (name.includes('REC')) return 'Record area';
  if (name.includes('TBL')) return 'Table or array';
  return 'Data storage';
}

/**
 * Identify forensic risk areas
 */
function identifyRisks(lines) {
  const risks = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;
    
    // S0C7 Risk: PACK instruction with potential invalid data
    if (/\bPACK\b/.test(line)) {
      const match = line.match(/PACK\s+(\w+),(.+)/);
      if (match) {
        // Check for comment indicating risk
        const hasRiskComment = lines.slice(Math.max(0, i - 3), i + 1)
          .some(l => /RISK|S0C7|INVALID|NON-NUMERIC/i.test(l));
        
        if (hasRiskComment || line.includes('RATETBL') || line.includes('EXTERNAL')) {
          risks.push({
            severity: 'HIGH',
            type: 'S0C7_RISK',
            lineNumber: lineNum,
            offset: calculateLineOffset(i),
            instruction: 'PACK',
            message: 'PACK instruction with external data - risk of S0C7 ABEND if source contains invalid numeric data',
            recommendation: 'Validate source data before PACK operation or add error handling'
          });
        }
      }
    }
    
    // S0C4 Risk: Memory access without bounds checking
    if (/\b(MVC|L|ST)\b/.test(line) && /0\(\d+,R\d+\)/.test(line)) {
      const hasOffsetCalc = /\d+\(R\d+\)/.test(line);
      if (hasOffsetCalc) {
        risks.push({
          severity: 'MEDIUM',
          type: 'S0C4_RISK',
          lineNumber: lineNum,
          offset: calculateLineOffset(i),
          instruction: line.match(/\b(MVC|L|ST)\b/)[1],
          message: 'Memory access with calculated offset - potential S0C4 if offset exceeds bounds',
          recommendation: 'Verify offset calculations and add bounds checking'
        });
      }
    }
    
    // Division by zero risk
    if (/\bDP\b/.test(line)) {
      risks.push({
        severity: 'MEDIUM',
        type: 'DIVIDE_BY_ZERO',
        lineNumber: lineNum,
        offset: calculateLineOffset(i),
        instruction: 'DP',
        message: 'Division operation - verify divisor is not zero',
        recommendation: 'Add zero check before division'
      });
    }
  }
  
  return risks;
}

/**
 * Calculate approximate offset for line (simplified)
 */
function calculateLineOffset(lineIndex) {
  // Simplified: assume ~4 bytes per instruction
  const offset = lineIndex * 4;
  return `X'${offset.toString(16).toUpperCase().padStart(2, '0')}'`;
}

/**
 * Calculate offsets for key instructions
 */
function calculateOffsets(lines) {
  const offsets = [];
  let currentOffset = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Track instructions that generate code
    if (/^\w+\s+(L|LA|ST|MVC|PACK|UNPK|ZAP|CP|AP|SP|MP|DP|B|BE|WTO)/.test(line)) {
      const match = line.match(/^(\w+)\s+(\w+)/);
      if (match) {
        offsets.push({
          label: match[1],
          instruction: match[2],
          offset: `X'${currentOffset.toString(16).toUpperCase().padStart(2, '0')}'`,
          lineNumber: i + 1
        });
        currentOffset += 4; // Simplified: 4 bytes per instruction
      }
    }
  }
  
  return offsets;
}

/**
 * Generate pseudo-code summary
 */
export function generatePseudoCode(analysis) {
  const { moduleName, labels, operations } = analysis;
  
  let pseudoCode = `MODULE ${moduleName}\n\n`;
  
  // Group operations by label
  const labelOps = new Map();
  
  for (const label of labels) {
    labelOps.set(label.name, []);
  }
  
  // Add operations to their sections
  for (const category of Object.values(operations)) {
    for (const op of category) {
      // Find closest preceding label
      const label = labels.reverse().find(l => l.lineNumber < op.lineNumber);
      if (label && labelOps.has(label.name)) {
        labelOps.get(label.name).push(op);
      }
    }
  }
  
  // Generate pseudo-code
  for (const label of labels) {
    if (label.name === moduleName) continue;
    
    pseudoCode += `SECTION ${label.name}:\n`;
    pseudoCode += `  // ${label.purpose}\n`;
    
    const ops = labelOps.get(label.name) || [];
    if (ops.length > 0) {
      for (const op of ops.slice(0, 3)) { // Limit to first 3 ops per section
        pseudoCode += `  ${op.description || op.operation}\n`;
      }
      if (ops.length > 3) {
        pseudoCode += `  ... (${ops.length - 3} more operations)\n`;
      }
    }
    pseudoCode += '\n';
  }
  
  return pseudoCode;
}

/**
 * Generate operational explanation
 */
export function generateExplanation(analysis) {
  const { moduleName, labels, operations, risks } = analysis;
  
  const explanation = {
    overview: `${moduleName} is an Assembler module with ${labels.length} logical sections`,
    purpose: inferModulePurpose(moduleName, labels),
    workflow: generateWorkflow(labels),
    dataProcessing: describeDataProcessing(operations),
    riskAssessment: summarizeRisks(risks)
  };
  
  return explanation;
}

/**
 * Infer module purpose from name and labels
 */
function inferModulePurpose(name, labels) {
  if (name.includes('TAX')) return 'Tax calculation and processing';
  if (name.includes('PAY')) return 'Payroll processing';
  if (name.includes('CALC')) return 'Mathematical calculations';
  
  const purposes = labels.map(l => l.purpose).join(' ');
  if (purposes.includes('calculate')) return 'Calculation module';
  if (purposes.includes('process')) return 'Data processing module';
  
  return 'General purpose processing module';
}

/**
 * Generate workflow description
 */
function generateWorkflow(labels) {
  return labels
    .filter(l => !l.name.match(/CSECT|USING|SAVEAREA/))
    .map(l => `${l.name}: ${l.purpose}`)
    .join(' → ');
}

/**
 * Describe data processing
 */
function describeDataProcessing(operations) {
  const summary = {
    packedDecimalOps: operations.packedDecimal.length,
    dataMovements: operations.dataMovement.length,
    branches: operations.branches.length
  };
  
  let description = '';
  if (summary.packedDecimalOps > 0) {
    description += `Performs ${summary.packedDecimalOps} packed decimal operations (financial calculations). `;
  }
  if (summary.dataMovements > 0) {
    description += `Includes ${summary.dataMovements} data movement operations. `;
  }
  if (summary.branches > 0) {
    description += `Contains ${summary.branches} conditional branches (decision logic).`;
  }
  
  return description || 'Basic data processing';
}

/**
 * Summarize risks
 */
function summarizeRisks(risks) {
  if (risks.length === 0) {
    return 'No significant forensic risks detected';
  }
  
  const highRisks = risks.filter(r => r.severity === 'HIGH').length;
  const mediumRisks = risks.filter(r => r.severity === 'MEDIUM').length;
  
  let summary = `${risks.length} potential risk area(s) identified: `;
  if (highRisks > 0) summary += `${highRisks} HIGH severity, `;
  if (mediumRisks > 0) summary += `${mediumRisks} MEDIUM severity`;
  
  return summary;
}

// Made with Bob
