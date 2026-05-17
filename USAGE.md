# 🐝 Bee-Keeper Usage Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Test the Parser

```bash
npm test
```

This will analyze the sample JCL file (`jobs/payrl001.jcl`) and display:
- Job summary
- Step analysis
- Issue detection
- Mermaid diagram
- Dataset inventory

### 3. Start MCP Server

```bash
npm start
```

The server will run on stdio and be available to Bob via the MCP protocol.

## Using with IBM Bob

### Tool: `inspect_jcl_topology`

**Purpose**: Analyze JCL job structure, detect issues, and generate operational insights.

**Input Parameters**:
- `file_path` (required): Path to JCL file (relative or absolute)

**Example Request**:

```json
{
  "tool": "inspect_jcl_topology",
  "arguments": {
    "file_path": "./jobs/payrl001.jcl"
  }
}
```

**Example Response**:

```json
{
  "status": "ANALYZED",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "summary": {
    "job": "PAYRL001",
    "stepCount": 3,
    "datasetCount": 10,
    "issueCount": 1,
    "criticalIssues": 1,
    "status": "ISSUES_DETECTED"
  },
  "topology": {
    "jobName": "PAYRL001",
    "steps": [
      {
        "stepName": "SORTDATA",
        "program": "SORT",
        "hasSteplib": true,
        "ddStatements": [...]
      },
      {
        "stepName": "TAXCALC",
        "program": "TAXCALC",
        "hasSteplib": false,
        "ddStatements": [...]
      },
      {
        "stepName": "GENRPT",
        "program": "RPTGEN",
        "hasSteplib": true,
        "ddStatements": [...]
      }
    ],
    "datasets": [
      "PROD.LOAD.LIB",
      "SYS1.LINKLIB",
      "PAYROLL.EMPLOYEE.DATA",
      ...
    ],
    "issues": [
      {
        "severity": "HIGH",
        "type": "MISSING_STEPLIB",
        "step": "TAXCALC",
        "program": "TAXCALC",
        "message": "Step TAXCALC (TAXCALC) missing STEPLIB - may cause S806 ABEND",
        "lineNumber": 29,
        "recommendation": "Add STEPLIB DD statement pointing to program library"
      }
    ]
  },
  "mermaid_diagram": "graph TD\n    START([PAYRL001]) --> STEP1\n    ...",
  "insights": [
    "⚠️ 1 issue(s) detected requiring attention",
    "🔴 1 critical issue(s) - immediate action required",
    "📊 3 execution steps identified",
    "💾 10 unique datasets referenced"
  ],
  "recommendations": [
    {
      "severity": "HIGH",
      "step": "TAXCALC",
      "issue": "Step TAXCALC (TAXCALC) missing STEPLIB - may cause S806 ABEND",
      "action": "Add STEPLIB DD statement pointing to program library"
    }
  ]
}
```

## Understanding the Output

### Status Field
- `ANALYZED`: Analysis completed successfully
- `ISSUES_DETECTED`: Problems found requiring attention
- `CLEAN`: No issues detected

### Summary Section
Provides high-level metrics:
- **job**: Job name from JCL
- **stepCount**: Number of execution steps
- **datasetCount**: Unique datasets referenced
- **issueCount**: Total issues found
- **criticalIssues**: High-severity issues requiring immediate action

### Topology Section
Detailed job structure:
- **steps**: Array of execution steps with programs and DD statements
- **datasets**: All datasets referenced in the job
- **issues**: Detected problems with severity, location, and recommendations

### Mermaid Diagram
Visual flow representation:
- Green boxes: Steps without issues
- Red boxes: Steps with detected issues
- Shows execution flow from start to completion

### Insights
Human-readable summary of key findings:
- Issue counts and severity
- Step and dataset metrics
- Critical alerts

### Recommendations
Actionable items prioritized by severity:
- What the issue is
- Where it occurs
- How to fix it

## Common Use Cases

### 1. Pre-Production Validation

```bash
# Analyze job before deployment
node test-parser.js
```

Check for:
- Missing STEPLIB references
- Invalid dataset names
- Structural issues

### 2. Incident Analysis

When a job fails:
1. Run `inspect_jcl_topology` on the JCL
2. Review detected issues
3. Check recommendations
4. Correlate with ABEND codes

### 3. Code Review

Before merging JCL changes:
1. Parse both old and new versions
2. Compare issue counts
3. Verify new issues aren't introduced
4. Review Mermaid diagrams for flow changes

## Sample JCL File

The repository includes `jobs/payrl001.jcl` with:
- 3 execution steps (SORT, TAXCALC, RPTGEN)
- Deliberate missing STEPLIB in TAXCALC step
- Realistic dataset references
- Inline control statements

This demonstrates:
- Issue detection capabilities
- Mermaid diagram generation
- Enterprise-grade analysis output

## Troubleshooting

### Parser Errors

**Problem**: "Cannot read file"
**Solution**: Verify file path is correct and file exists

**Problem**: "No steps found"
**Solution**: Ensure JCL has valid EXEC PGM statements

### MCP Server Issues

**Problem**: Server not responding
**Solution**: Check `.bob/mcp.json` configuration and restart server

**Problem**: Tool not found
**Solution**: Verify server is running and registered with Bob

## Next Steps

1. Analyze your own JCL files
2. Integrate with CI/CD pipelines
3. Build custom issue detection rules
4. Extend parser for additional JCL constructs

---

**Need Help?** Check `AGENTS.md` for development guidelines and `README.md` for architecture details.