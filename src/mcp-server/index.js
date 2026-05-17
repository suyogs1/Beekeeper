#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { parseJCL, generateMermaidDiagram, generateSummary } from '../tools/jcl-parser.js';
import { decompileASM, generatePseudoCode, generateExplanation } from '../tools/asm-decompiler.js';
import { traceABEND, generateMarkdownRCA } from '../tools/abend-tracer.js';
import { executeRCAWorkflow, generateFinalRCA } from '../tools/rca-workflow.js';
import { resolve } from 'path';

/**
 * Bee-Keeper MCP Server
 * Enterprise forensic intelligence layer for IBM Bob
 * Phase 1: Real JCL parsing with regex-based extraction
 */

// Tool definitions
const TOOLS = {
  inspect_jcl_topology: {
    name: 'inspect_jcl_topology',
    description: 'Analyze JCL job topology and dependencies. Parses JCL file to extract job structure, steps, datasets, and detect issues. Returns structured JSON, Mermaid diagram, and operational summary.',
    inputSchema: {
      type: 'object',
      properties: {
        file_path: {
          type: 'string',
          description: 'Path to JCL file (relative to workspace or absolute)'
        }
      },
      required: ['file_path']
    }
  },
  // Placeholder tools for Phase 2+
  fetch_mainframe_telemetry: {
    name: 'fetch_mainframe_telemetry',
    description: '[PLACEHOLDER] Fetch real-time mainframe telemetry data including CPU, memory, I/O metrics.',
    inputSchema: {
      type: 'object',
      properties: {
        system_id: { type: 'string', description: 'Mainframe system identifier' },
        metric_type: { type: 'string', description: 'Type of telemetry metric' }
      },
      required: ['system_id']
    }
  },
  decompile_asm_logic: {
    name: 'decompile_asm_logic',
    description: 'Decompile Assembler source to high-level logic. Extracts labels, operations, data areas, identifies forensic risks (S0C7, S0C4), and generates pseudo-code with operational explanations for incident analysis.',
    inputSchema: {
      type: 'object',
      properties: {
        file_path: {
          type: 'string',
          description: 'Path to Assembler source file (relative to workspace or absolute)'
        }
      },
      required: ['file_path']
    }
  },
  trace_abend_memory: {
    name: 'trace_abend_memory',
    description: 'Correlate ABEND information with forensic analysis to generate Root Cause Analysis. Combines JCL topology, ASM decompilation, and ABEND details to produce confidence-scored RCA with blast radius assessment and remediation recommendations.',
    inputSchema: {
      type: 'object',
      properties: {
        abend_code: {
          type: 'string',
          description: 'ABEND code (e.g., S0C4, S0C7, S806)'
        },
        offset: {
          type: 'string',
          description: 'Memory offset where ABEND occurred (e.g., X\'48\', XB4, 0x48)'
        },
        jcl_file_path: {
          type: 'string',
          description: 'Path to JCL file for topology analysis'
        },
        asm_file_path: {
          type: 'string',
          description: 'Path to Assembler source file for decompilation'
        }
      },
      required: ['abend_code', 'offset', 'jcl_file_path', 'asm_file_path']
    }
  },
  generate_rca_report: {
    name: 'generate_rca_report',
    description: '[PLACEHOLDER] Generate comprehensive Root Cause Analysis report from collected forensic data.',
    inputSchema: {
      type: 'object',
      properties: {
        incident_id: { type: 'string', description: 'Incident identifier' },
        format: { type: 'string', description: 'Report format: markdown, json, pdf' }
      },
      required: ['incident_id']
    }
  }
};

/**
 * Format analysis results for enterprise consumption
 */
function formatAnalysisResults(topology, mermaidDiagram, summary) {
  const { jobName, steps, datasets, issues } = topology;
  
  // Build insights
  const insights = [];
  
  if (issues.length > 0) {
    insights.push(`⚠️ ${issues.length} issue(s) detected requiring attention`);
    const criticalCount = issues.filter(i => i.severity === 'HIGH').length;
    if (criticalCount > 0) {
      insights.push(`🔴 ${criticalCount} critical issue(s) - immediate action required`);
    }
  } else {
    insights.push('✓ No issues detected - job structure appears valid');
  }
  
  insights.push(`📊 ${steps.length} execution steps identified`);
  insights.push(`💾 ${datasets.length} unique datasets referenced`);
  
  // Build recommendations
  const recommendations = [];
  for (const issue of issues) {
    recommendations.push({
      severity: issue.severity,
      step: issue.step,
      issue: issue.message,
      action: issue.recommendation
    });
  }
  
  return {
    status: 'ANALYZED',
    timestamp: new Date().toISOString(),
    summary,
    topology: {
      jobName,
      steps: steps.map(s => ({
        stepName: s.stepName,
        program: s.program,
        hasSteplib: s.hasSteplib,
        ddStatements: s.ddStatements.map(dd => ({
          name: dd.name,
          dsn: dd.dsn
        }))
      })),
      datasets,
      issues
    },
    mermaid_diagram: mermaidDiagram,
    insights,
    recommendations
  };
}

// Create MCP server instance
const server = new Server(
  {
    name: 'bee-keeper',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: Object.values(TOOLS)
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'inspect_jcl_topology': {
        const filePath = args.file_path;
        if (!filePath) {
          throw new Error('file_path is required');
        }
        
        // Resolve file path (support relative and absolute paths)
        const resolvedPath = resolve(filePath);
        
        // Parse JCL file
        const topology = parseJCL(resolvedPath);
        const mermaidDiagram = generateMermaidDiagram(topology);
        const summary = generateSummary(topology);
        
        // Format results
        const results = formatAnalysisResults(topology, mermaidDiagram, summary);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(results, null, 2)
            }
          ]
        };
      }

      case 'decompile_asm_logic': {
        const filePath = args.file_path;
        if (!filePath) {
          throw new Error('file_path is required');
        }
        
        // Resolve file path
        const resolvedPath = resolve(filePath);
        
        // Decompile ASM file
        const analysis = decompileASM(resolvedPath);
        const pseudoCode = generatePseudoCode(analysis);
        const explanation = generateExplanation(analysis);
        
        // Format results
        const results = formatDecompilationResults(analysis, pseudoCode, explanation);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(results, null, 2)
            }
          ]
        };
      }

      case 'trace_abend_memory': {
        const { abend_code, offset, jcl_file_path, asm_file_path } = args;
        
        if (!abend_code || !offset || !jcl_file_path || !asm_file_path) {
          throw new Error('abend_code, offset, jcl_file_path, and asm_file_path are required');
        }
        
        // Parse JCL topology
        const jclPath = resolve(jcl_file_path);
        const jclTopology = parseJCL(jclPath);
        const jclSummary = generateSummary(jclTopology);
        const jclResults = formatAnalysisResults(jclTopology, '', jclSummary);
        
        // Decompile ASM
        const asmPath = resolve(asm_file_path);
        const asmAnalysis = decompileASM(asmPath);
        
        // Trace ABEND and generate RCA
        const rcaAnalysis = traceABEND(abend_code, offset, asmAnalysis, jclResults);
        const markdownRCA = generateMarkdownRCA(rcaAnalysis);
        
        // Format results
        const results = {
          status: 'RCA_COMPLETE',
          timestamp: new Date().toISOString(),
          abend: {
            code: rcaAnalysis.abendCode,
            offset: rcaAnalysis.offset,
            confidence: rcaAnalysis.confidence
          },
          rootCause: rcaAnalysis.rootCause,
          blastRadius: rcaAnalysis.blastRadius,
          narrative: rcaAnalysis.narrative,
          recommendations: rcaAnalysis.recommendations,
          forensicDetails: rcaAnalysis.forensicDetails,
          markdown_report: markdownRCA
        };
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(results, null, 2)
            }
          ]
        };
      }

      case 'fetch_mainframe_telemetry':
      case 'generate_rca_report': {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                status: 'PLACEHOLDER',
                message: `Tool '${name}' is not yet implemented. This is a Phase 2+ feature.`,
                requested_args: args
              }, null, 2)
            }
          ]
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            error: error.message,
            tool: name
          }, null, 2)
        }
      ],
      isError: true
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Bee-Keeper MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});

// Made with Bob
