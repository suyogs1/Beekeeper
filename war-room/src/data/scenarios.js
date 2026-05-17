/**
 * Bee-Keeper War Room - Incident Scenarios
 * Pre-loaded enterprise ABEND scenarios for demo switching
 */

export const scenarios = {
  payrl001: {
    id: 'payrl001',
    name: 'PAYRL001 - S0C7 Packed Decimal Failure',
    metadata: {
      incident_id: 'INC-S0C7-2026-05-15T14-23-45',
      timestamp: '2026-05-15T14:23:45.123Z',
      abend_code: 'S0C7',
      offset: "X'B4'",
      job_name: 'PAYRL001',
      module_name: 'TAXCALC',
      severity: 'CRITICAL',
      confidence: 81
    },
    rootCause: {
      primary: 'Invalid numeric data in PACK operation at X\'B4\'',
      contributing: [
        'Step TAXCALC missing STEPLIB - loaded incorrect module version',
        'PACK instruction with external data - S0C7 risk materialized'
      ]
    },
    enterpriseImpact: [
      { system: 'Payroll Export', status: 'BLOCKED', impact: 'Employee payment files not generated' },
      { system: 'Tax Summary', status: 'BLOCKED', impact: 'Tax withholding reports unavailable' },
      { system: 'GL Posting', status: 'BLOCKED', impact: 'General ledger entries not posted' },
      { system: 'HR Reconciliation', status: 'DELAYED', impact: 'Employee records out of sync' },
      { system: 'Reporting', status: 'DELAYED', impact: 'Executive dashboards stale' }
    ],
    recommendations: [
      { priority: 'IMMEDIATE', action: 'Validate source data before PACK operation', status: 'pending' },
      { priority: 'HIGH', action: 'Add STEPLIB DD statement to TAXCALC step', status: 'pending' },
      { priority: 'MEDIUM', action: 'Implement error handling for packed decimal operations', status: 'pending' },
      { priority: 'LOW', action: 'Add diagnostic logging before critical operations', status: 'pending' }
    ],
    workflow: [
      { phase: 'Alert Ingestion', status: 'complete', timestamp: '14:23:45' },
      { phase: 'JCL Analysis', status: 'complete', timestamp: '14:24:12' },
      { phase: 'ASM Decompile', status: 'complete', timestamp: '14:24:38' },
      { phase: 'ABEND Correlation', status: 'complete', timestamp: '14:25:05' },
      { phase: 'Knowledge Check', status: 'complete', timestamp: '14:25:22' },
      { phase: 'Review Checkpoint', status: 'complete', timestamp: '14:25:45' },
      { phase: 'RCA Generation', status: 'complete', timestamp: '14:26:10' }
    ],
    mermaidDiagram: `graph TB
    subgraph UP["⬆️ Upstream Dependencies"]
        U1[PREJOB01]:::upstream
        U2[PREJOB02]:::upstream
    end

    subgraph FAIL["❌ Failed Job 🔴 CRITICAL PATH"]
        MAIN["PAYRL001<br/>ABEND: S0C7"]:::failed
    end

    subgraph DOWN["⬇️ Enterprise Impact"]
        D1[Payroll Export]:::blocked
        D2[Tax Summary]:::blocked
        D3[GL Posting]:::blocked
        D4[HR Reconciliation]:::delayed
        D5[Reporting]:::delayed
    end

    U1 -->|Success| MAIN
    U2 -->|Success| MAIN
    MAIN -.->|BLOCKED| D1
    MAIN -.->|BLOCKED| D2
    MAIN -.->|BLOCKED| D3
    MAIN -.->|DELAYED| D4
    MAIN -.->|DELAYED| D5

    classDef failed fill:#ff6b6b,stroke:#c92a2a,stroke-width:4px,color:#fff
    classDef blocked fill:#ffd43b,stroke:#fab005,stroke-width:3px
    classDef delayed fill:#ffe066,stroke:#fcc419,stroke-width:2px
    classDef upstream fill:#51cf66,stroke:#37b24d,stroke-width:2px`
  },

  payproc2: {
    id: 'payproc2',
    name: 'PAYPROC2 - S806 Missing Load Module',
    metadata: {
      incident_id: 'INC-S806-2026-05-14T09-15-22',
      timestamp: '2026-05-14T09:15:22.456Z',
      abend_code: 'S806',
      offset: 'N/A',
      job_name: 'PAYPROC2',
      module_name: 'BENECALC',
      severity: 'HIGH',
      confidence: 95
    },
    rootCause: {
      primary: 'Program BENECALC not found in system search path',
      contributing: [
        'Step BENEFITS missing STEPLIB DD statement',
        'New program deployed without updating JCL',
        'Program library not in LINKLIST'
      ]
    },
    enterpriseImpact: [
      { system: 'Benefits Processing', status: 'BLOCKED', impact: 'Employee benefits not calculated' },
      { system: 'Payroll Integration', status: 'BLOCKED', impact: 'Deductions not applied' },
      { system: 'HR Portal', status: 'DELAYED', impact: 'Benefits enrollment delayed' }
    ],
    recommendations: [
      { priority: 'IMMEDIATE', action: 'Add STEPLIB pointing to SYS1.PROD.LOADLIB', status: 'pending' },
      { priority: 'HIGH', action: 'Update JCL deployment checklist', status: 'pending' },
      { priority: 'MEDIUM', action: 'Add automated STEPLIB verification in CI/CD', status: 'pending' },
      { priority: 'LOW', action: 'Document library search order in runbook', status: 'pending' }
    ],
    workflow: [
      { phase: 'Alert Ingestion', status: 'complete', timestamp: '09:15:22' },
      { phase: 'JCL Analysis', status: 'complete', timestamp: '09:15:45' },
      { phase: 'ASM Decompile', status: 'skipped', timestamp: 'N/A' },
      { phase: 'ABEND Correlation', status: 'complete', timestamp: '09:16:12' },
      { phase: 'Knowledge Check', status: 'complete', timestamp: '09:16:28' },
      { phase: 'Review Checkpoint', status: 'complete', timestamp: '09:16:45' },
      { phase: 'RCA Generation', status: 'complete', timestamp: '09:17:05' }
    ],
    mermaidDiagram: `graph TB
    subgraph UP["⬆️ Upstream Dependencies"]
        U1[PAYRL001]:::upstream
        U2[EMPDATA]:::upstream
    end

    subgraph FAIL["❌ Failed Job"]
        MAIN["PAYPROC2<br/>ABEND: S806"]:::failed
    end

    subgraph DOWN["⬇️ Enterprise Impact"]
        D1[Benefits Processing]:::blocked
        D2[Payroll Integration]:::blocked
        D3[HR Portal]:::delayed
    end

    U1 -->|Success| MAIN
    U2 -->|Success| MAIN
    MAIN -.->|BLOCKED| D1
    MAIN -.->|BLOCKED| D2
    MAIN -.->|DELAYED| D3

    classDef failed fill:#ff6b6b,stroke:#c92a2a,stroke-width:4px,color:#fff
    classDef blocked fill:#ffd43b,stroke:#fab005,stroke-width:3px
    classDef delayed fill:#ffe066,stroke:#fcc419,stroke-width:2px
    classDef upstream fill:#51cf66,stroke:#37b24d,stroke-width:2px`
  },

  memcalc: {
    id: 'memcalc',
    name: 'MEMCALC - S0C4 Invalid Memory Access',
    metadata: {
      incident_id: 'INC-S0C4-2026-05-13T16-42-11',
      timestamp: '2026-05-13T16:42:11.789Z',
      abend_code: 'S0C4',
      offset: "X'1C8'",
      job_name: 'MEMCALC',
      module_name: 'ADDRVAL',
      severity: 'CRITICAL',
      confidence: 78
    },
    rootCause: {
      primary: 'Protection exception - attempted access outside allocated region',
      contributing: [
        'Loop counter exceeded array dimensions',
        'No boundary checking on record count',
        'Memory corruption from previous operation'
      ]
    },
    enterpriseImpact: [
      { system: 'Customer Database', status: 'BLOCKED', impact: 'Customer updates suspended' },
      { system: 'Order Processing', status: 'BLOCKED', impact: 'New orders cannot be processed' },
      { system: 'Billing System', status: 'BLOCKED', impact: 'Invoice generation halted' },
      { system: 'CRM Integration', status: 'DELAYED', impact: 'Customer data sync delayed' },
      { system: 'Analytics', status: 'DELAYED', impact: 'Customer reports unavailable' }
    ],
    recommendations: [
      { priority: 'IMMEDIATE', action: 'Add boundary checking for record count', status: 'pending' },
      { priority: 'HIGH', action: 'Implement register validation before address calculation', status: 'pending' },
      { priority: 'MEDIUM', action: 'Add memory corruption detection', status: 'pending' },
      { priority: 'LOW', action: 'Enhanced logging for pointer operations', status: 'pending' }
    ],
    workflow: [
      { phase: 'Alert Ingestion', status: 'complete', timestamp: '16:42:11' },
      { phase: 'JCL Analysis', status: 'complete', timestamp: '16:42:35' },
      { phase: 'ASM Decompile', status: 'complete', timestamp: '16:43:08' },
      { phase: 'ABEND Correlation', status: 'complete', timestamp: '16:43:42' },
      { phase: 'Knowledge Check', status: 'complete', timestamp: '16:44:05' },
      { phase: 'Review Checkpoint', status: 'complete', timestamp: '16:44:30' },
      { phase: 'RCA Generation', status: 'complete', timestamp: '16:45:00' }
    ],
    mermaidDiagram: `graph TB
    subgraph UP["⬆️ Upstream Dependencies"]
        U1[CUSTLOAD]:::upstream
        U2[DATAPREP]:::upstream
    end

    subgraph FAIL["❌ Failed Job 🔴 CRITICAL PATH"]
        MAIN["MEMCALC<br/>ABEND: S0C4"]:::failed
    end

    subgraph DOWN["⬇️ Enterprise Impact"]
        D1[Customer Database]:::blocked
        D2[Order Processing]:::blocked
        D3[Billing System]:::blocked
        D4[CRM Integration]:::delayed
        D5[Analytics]:::delayed
    end

    U1 -->|Success| MAIN
    U2 -->|Success| MAIN
    MAIN -.->|BLOCKED| D1
    MAIN -.->|BLOCKED| D2
    MAIN -.->|BLOCKED| D3
    MAIN -.->|DELAYED| D4
    MAIN -.->|DELAYED| D5

    classDef failed fill:#ff6b6b,stroke:#c92a2a,stroke-width:4px,color:#fff
    classDef blocked fill:#ffd43b,stroke:#fab005,stroke-width:3px
    classDef delayed fill:#ffe066,stroke:#fcc419,stroke-width:2px
    classDef upstream fill:#51cf66,stroke:#37b24d,stroke-width:2px`
  },

  allocjob: {
    id: 'allocjob',
    name: 'ALLOCJOB - B37 Dataset Space Failure',
    metadata: {
      incident_id: 'INC-B37-2026-05-12T11-08-33',
      timestamp: '2026-05-12T11:08:33.234Z',
      abend_code: 'B37',
      offset: 'N/A',
      job_name: 'ALLOCJOB',
      module_name: 'N/A',
      severity: 'MEDIUM',
      confidence: 92
    },
    rootCause: {
      primary: 'Dataset PROD.REPORTS.MONTHLY exceeded allocated space',
      contributing: [
        'Primary allocation too small for monthly volume',
        'No secondary allocation defined',
        'Report volume increased 40% month-over-month',
        'No proactive space monitoring alerts'
      ]
    },
    enterpriseImpact: [
      { system: 'Monthly Reporting', status: 'BLOCKED', impact: 'Executive reports not generated' },
      { system: 'Compliance Reports', status: 'DELAYED', impact: 'Regulatory filings delayed' }
    ],
    recommendations: [
      { priority: 'IMMEDIATE', action: 'Increase primary allocation to 1000 CYL', status: 'pending' },
      { priority: 'HIGH', action: 'Add secondary allocation of 200 CYL', status: 'pending' },
      { priority: 'MEDIUM', action: 'Implement automated space monitoring', status: 'pending' },
      { priority: 'LOW', action: 'Update capacity planning procedures', status: 'pending' }
    ],
    workflow: [
      { phase: 'Alert Ingestion', status: 'complete', timestamp: '11:08:33' },
      { phase: 'JCL Analysis', status: 'complete', timestamp: '11:08:55' },
      { phase: 'ASM Decompile', status: 'skipped', timestamp: 'N/A' },
      { phase: 'ABEND Correlation', status: 'complete', timestamp: '11:09:18' },
      { phase: 'Knowledge Check', status: 'complete', timestamp: '11:09:35' },
      { phase: 'Review Checkpoint', status: 'complete', timestamp: '11:09:50' },
      { phase: 'RCA Generation', status: 'complete', timestamp: '11:10:10' }
    ],
    mermaidDiagram: `graph TB
    subgraph UP["⬆️ Upstream Dependencies"]
        U1[DATAPREP]:::upstream
        U2[RPTCALC]:::upstream
    end

    subgraph FAIL["❌ Failed Job"]
        MAIN["ALLOCJOB<br/>ABEND: B37"]:::failed
    end

    subgraph DOWN["⬇️ Enterprise Impact"]
        D1[Monthly Reporting]:::blocked
        D2[Compliance Reports]:::delayed
    end

    U1 -->|Success| MAIN
    U2 -->|Success| MAIN
    MAIN -.->|BLOCKED| D1
    MAIN -.->|DELAYED| D2

    classDef failed fill:#ff6b6b,stroke:#c92a2a,stroke-width:4px,color:#fff
    classDef blocked fill:#ffd43b,stroke:#fab005,stroke-width:3px
    classDef delayed fill:#ffe066,stroke:#fcc419,stroke-width:2px
    classDef upstream fill:#51cf66,stroke:#37b24d,stroke-width:2px`
  }
};

export const scenarioList = [
  { id: 'payrl001', label: 'PAYRL001 - S0C7 Packed Decimal', severity: 'CRITICAL' },
  { id: 'payproc2', label: 'PAYPROC2 - S806 Missing Module', severity: 'HIGH' },
  { id: 'memcalc', label: 'MEMCALC - S0C4 Memory Access', severity: 'CRITICAL' },
  { id: 'allocjob', label: 'ALLOCJOB - B37 Space Failure', severity: 'MEDIUM' }
];

// Made with Bob
