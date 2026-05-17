/**
 * JCL Parser - Lightweight regex-based JCL analysis
 * Extracts job structure, steps, and dependencies for forensic analysis
 */

import { readFileSync } from 'fs';

/**
 * Parse JCL file and extract topology information
 * @param {string} filePath - Path to JCL file
 * @returns {Object} Parsed JCL topology
 */
export function parseJCL(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  const topology = {
    jobName: extractJobName(lines),
    steps: extractSteps(lines),
    datasets: extractDatasets(lines),
    issues: detectIssues(lines),
    metadata: {
      totalLines: lines.length,
      commentLines: lines.filter(l => l.trim().startsWith('//*')).length
    }
  };

  return topology;
}

/**
 * Extract job name from JCL
 */
function extractJobName(lines) {
  const jobLine = lines.find(line => {
    const trimmed = line.trim();
    return trimmed.startsWith('//') && 
           trimmed.includes('JOB') && 
           !trimmed.startsWith('//*');
  });

  if (jobLine) {
    const match = jobLine.match(/^\/\/(\w+)\s+JOB/);
    return match ? match[1] : 'UNKNOWN';
  }
  return 'UNKNOWN';
}

/**
 * Extract execution steps from JCL
 */
function extractSteps(lines) {
  const steps = [];
  let currentStep = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip comments and empty lines
    if (line.startsWith('//*') || !line) continue;

    // Detect EXEC PGM statement
    const execMatch = line.match(/^\/\/(\w+)\s+EXEC\s+PGM=(\w+)/);
    if (execMatch) {
      if (currentStep) {
        steps.push(currentStep);
      }
      
      currentStep = {
        stepName: execMatch[1],
        program: execMatch[2],
        ddStatements: [],
        hasSteplib: false,
        lineNumber: i + 1
      };
      continue;
    }

    // Collect DD statements for current step
    if (currentStep && line.startsWith('//')) {
      const ddMatch = line.match(/^\/\/(\w+)\s+DD/);
      if (ddMatch) {
        const ddName = ddMatch[1];
        const dsn = extractDSN(line);
        
        currentStep.ddStatements.push({
          name: ddName,
          dsn: dsn,
          lineNumber: i + 1
        });

        if (ddName === 'STEPLIB') {
          currentStep.hasSteplib = true;
        }
      }
    }
  }

  // Add last step
  if (currentStep) {
    steps.push(currentStep);
  }

  return steps;
}

/**
 * Extract DSN from DD statement
 */
function extractDSN(line) {
  const dsnMatch = line.match(/DSN=([^,\s]+)/);
  return dsnMatch ? dsnMatch[1] : null;
}

/**
 * Extract all datasets referenced in JCL
 */
function extractDatasets(lines) {
  const datasets = new Set();
  
  for (const line of lines) {
    if (line.includes('DSN=')) {
      const dsn = extractDSN(line);
      if (dsn) {
        datasets.add(dsn);
      }
    }
  }

  return Array.from(datasets);
}

/**
 * Detect common issues in JCL
 */
function detectIssues(lines) {
  const issues = [];
  const steps = extractSteps(lines);

  // Check for missing STEPLIB
  for (const step of steps) {
    if (!step.hasSteplib && step.program !== 'IEFBR14' && step.program !== 'SORT') {
      issues.push({
        severity: 'HIGH',
        type: 'MISSING_STEPLIB',
        step: step.stepName,
        program: step.program,
        message: `Step ${step.stepName} (${step.program}) missing STEPLIB - may cause S806 ABEND`,
        lineNumber: step.lineNumber,
        recommendation: `Add STEPLIB DD statement pointing to program library`
      });
    }
  }

  return issues;
}

/**
 * Generate Mermaid diagram for job flow
 */
export function generateMermaidDiagram(topology) {
  const { jobName, steps, issues } = topology;
  
  let diagram = 'graph TD\n';
  diagram += `    START([${jobName}]) --> STEP1\n`;

  // Add steps
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const stepId = `STEP${i + 1}`;
    const nextStepId = i < steps.length - 1 ? `STEP${i + 2}` : 'END';
    
    // Check if step has issues
    const hasIssue = issues.some(issue => issue.step === step.stepName);
    const style = hasIssue ? ':::error' : ':::success';
    
    diagram += `    ${stepId}["${step.stepName}<br/>${step.program}"]${style}\n`;
    
    if (i < steps.length - 1) {
      diagram += `    ${stepId} --> ${nextStepId}\n`;
    } else {
      diagram += `    ${stepId} --> END([Complete])\n`;
    }
  }

  // Add styling
  diagram += '\n    classDef success fill:#90EE90,stroke:#006400,stroke-width:2px\n';
  diagram += '    classDef error fill:#FFB6C6,stroke:#8B0000,stroke-width:2px\n';

  return diagram;
}

/**
 * Generate concise operational summary
 */
export function generateSummary(topology) {
  const { jobName, steps, datasets, issues } = topology;
  
  const summary = {
    job: jobName,
    stepCount: steps.length,
    datasetCount: datasets.length,
    issueCount: issues.length,
    criticalIssues: issues.filter(i => i.severity === 'HIGH').length,
    status: issues.length > 0 ? 'ISSUES_DETECTED' : 'CLEAN',
    steps: steps.map(s => ({
      name: s.stepName,
      program: s.program,
      hasSteplib: s.hasSteplib,
      ddCount: s.ddStatements.length
    }))
  };

  return summary;
}

// Made with Bob
