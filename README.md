# 🐝 Bee-Keeper

**Enterprise Forensic Intelligence Layer for IBM Bob**

Bee-Keeper provides deep mainframe forensic analysis capabilities through an MCP (Model Context Protocol) server, enabling Bob to diagnose, analyze, and troubleshoot complex mainframe systems with precision.

## 🎯 Mission

Transform mainframe diagnostics from reactive troubleshooting to proactive intelligence gathering. Bee-Keeper bridges the gap between legacy mainframe systems and modern AI-powered analysis.

## 📁 Project Structure

```
/bee-keeper
├── /src
│   ├── /jobs              # Job analysis modules
│   ├── /mcp-server        # MCP server implementation
│   └── /tools             # Forensic tool implementations
├── /.bob
│   ├── /rules             # Bob behavior rules
│   ├── /knowledge         # Domain knowledge base
│   ├── /orchestrate       # Orchestration configs
│   ├── /bob_sessions      # Session artifacts
│   └── mcp.json           # MCP server registration
├── package.json
├── README.md
└── AGENTS.md
```

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Running the MCP Server

```bash
npm start
```

### Development Mode (with auto-reload)

```bash
npm run dev
```

### Testing the Tools

```bash
# Test JCL parser
npm run test:jcl

# Test ASM decompiler
npm run test:asm

# Test ABEND tracer (RCA generation)
npm run test:rca

# Run all tests
npm test
# Test RCA workflow
npm run test:workflow

# Test orchestration demo
npm run orchestrate
```

### Bob Integration

The MCP server is automatically registered with Bob via `.bob/mcp.json`. Once running, Bob can access all Bee-Keeper tools.

## 🛠️ Available Tools

### Phase 1 (Active)

#### `inspect_jcl_topology`
Analyze JCL job topology, dependencies, and execution flow
- **Input**: `file_path` - Path to JCL file (relative or absolute)
- **Output**: Structured JSON with job analysis, Mermaid diagram, and issue detection
- **Features**:
  - Regex-based JCL parsing
  - Step and dataset extraction
  - STEPLIB validation
  - Issue detection (missing libraries, etc.)
  - Mermaid flow diagram generation
  - Enterprise-grade operational summaries

#### `decompile_asm_logic`
Decompile Assembler source to high-level logic representation
- **Input**: `file_path` - Path to Assembler source file (relative or absolute)
- **Output**: Structured JSON with forensic analysis, pseudo-code, and risk assessment
- **Features**:
  - Lightweight regex-based parsing
  - Label and operation extraction
  - Packed decimal operation analysis
  - S0C7/S0C4 risk detection
  - Offset reference tracking
  - Pseudo-code generation
  - Plain English operational explanations
  - Enterprise-ready incident analysis

#### `trace_abend_memory`
Correlate ABEND information with forensic analysis to generate Root Cause Analysis
- **Input**:
  - `abend_code` - ABEND code (e.g., S0C7, S0C4, S806)
  - `offset` - Memory offset where ABEND occurred
  - `jcl_file_path` - Path to JCL file for topology analysis
  - `asm_file_path` - Path to Assembler source for decompilation
- **Output**: Comprehensive RCA with confidence scoring, blast radius, and remediation plan
- **Features**:
  - Offset-to-instruction correlation
  - JCL topology integration
  - ASM risk correlation
  - Confidence scoring (0-100%)
  - Blast radius calculation
  - Downstream impact assessment
  - Forensic narrative generation
  - Markdown RCA report
  - Prioritized remediation recommendations

### Phase 2+ (Planned)

- **`fetch_mainframe_telemetry`** - Real-time system metrics and performance data
- **`decompile_asm_logic`** - Assembler module decompilation and analysis
- **`trace_abend_memory`** - Memory state analysis at ABEND occurrence
- **`generate_rca_report`** - Comprehensive root cause analysis reports

## 📊 Example Usage

### Via Bob MCP Interface

```javascript
{
  "tool": "inspect_jcl_topology",
  "arguments": {
    "file_path": "./jobs/payrl001.jcl"
  }
}
```

### Direct Parser Test

```bash
node test-parser.js
```

**Sample Output:**
```
📊 SUMMARY
Job Name: PAYRL001
Status: ISSUES_DETECTED
Steps: 3
Datasets: 10
Issues: 1 (1 critical)

⚠️  ISSUES DETECTED
1. [HIGH] MISSING_STEPLIB
   Step: TAXCALC (TAXCALC)
   Message: Step TAXCALC (TAXCALC) missing STEPLIB - may cause S806 ABEND
   Fix: Add STEPLIB DD statement pointing to program library

📈 MERMAID DIAGRAM
graph TD
    START([PAYRL001]) --> STEP1
    STEP1["SORTDATA<br/>SORT"]:::success
    STEP2["TAXCALC<br/>TAXCALC"]:::error
    STEP3["GENRPT<br/>RPTGEN"]:::success
```

**Full JSON Response:**
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
    "steps": [...],
    "datasets": [...],
    "issues": [...]
  },
  "mermaid_diagram": "graph TD...",
  "insights": [
    "⚠️ 1 issue(s) detected requiring attention",
    "🔴 1 critical issue(s) - immediate action required"
  ],
  "recommendations": [...]
}
```

## 🎭 Orchestration Demo

Bee-Keeper includes a lightweight **watsonx Orchestrate-style** multi-agent workflow demonstration that showcases enterprise incident response coordination.

### Running the Orchestration Demo

```bash
npm run orchestrate
```

### Workflow Architecture

The orchestration demo implements a **5-phase linear workflow**:

```
Alert → Intake → Bee-Keeper RCA → Recovery Planning → Business Impact
```

**Phase 1: Alert Ingestion**
- Receives mainframe ABEND alert
- Extracts incident metadata

**Phase 2: Intake Agent**
- Validates alert completeness
- Classifies severity (CRITICAL/HIGH/MEDIUM/LOW)
- Routes to appropriate handler

**Phase 3: Bee-Keeper Forensic Analysis**
- Executes 7-phase RCA workflow
- Analyzes JCL topology
- Decompiles assembler code
- Correlates ABEND to code location
- Generates confidence-scored root cause

**Phase 4: Recovery Planner Agent**
- Extracts RCA recommendations
- Estimates recovery time per action
- Calculates overall risk level
- Determines approval requirements

**Phase 5: Business Impact Agent**
- Calculates financial impact
- Assesses compliance/reputation risk
- Identifies affected business processes
- Generates executive summary

### Demo Output

The orchestration demo produces:
- **Cinematic console output** with phase headers and progress indicators
- **Structured JSON results** for each agent
- **Enterprise RCA report** saved to `.bob/knowledge/`
- **Recovery plan** with time estimates and risk levels
- **Executive summary** with business impact assessment

### Sample Execution Time

Target: **~2 seconds** for complete 5-phase workflow (optimized for hackathon demo)

### Orchestration Agents

All agents are **rule-based** (no AI/ML) for demo reliability:

- **`intake-agent.js`** - Alert validation and classification
- **`recovery-planner.js`** - Recovery plan generation from RCA
- **`business-impact.js`** - Financial and compliance impact assessment

The core **Bee-Keeper RCA workflow** provides real forensic analysis with:
- 73-85% confidence scoring
- Enterprise blast radius assessment
- Mermaid diagram generation
- Knowledge base continuity


## 🏗️ Architecture

Bee-Keeper uses a modular architecture optimized for:

- **Speed**: Minimal overhead, fast response times
- **Reliability**: Robust error handling and graceful degradation
- **Extensibility**: Easy addition of new forensic tools
- **Integration**: Seamless Bob MCP protocol compliance

## 📝 Development Guidelines

See [`AGENTS.md`](./AGENTS.md) for detailed agent behavior, communication style, and architectural principles.

## 🔧 Configuration

MCP server configuration is managed in `.bob/mcp.json`:

```json
{
  "mcpServers": {
    "bee-keeper": {
      "command": "node",
      "args": ["src/mcp-server/index.js"]
    }
  }
}
```

## 📈 Roadmap

- **Phase 1**: Foundation + Mock Data ✅
- **Phase 2**: Live Mainframe Integration
- **Phase 3**: Advanced Analytics & ML
- **Phase 4**: Predictive Diagnostics

## 🤝 Contributing

This is a hackathon project optimized for rapid iteration and demo reliability. Focus on:

1. Clean, minimal code
2. Fast execution
3. Clear documentation
4. Mermaid diagrams for architecture

## 📄 License

MIT

---

**Built for IBM Bob Hackathon** | **Mainframe Forensics Reimagined**