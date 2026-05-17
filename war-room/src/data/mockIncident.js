export const mockIncident = {
  metadata: {
    incident_id: 'INC-S0C7-2026-05-15T18-55-04',
    timestamp: '2026-05-15T18:55:04.000Z',
    abend_code: 'S0C7',
    offset: "X'B4'",
    job_name: 'PAYRL001',
    module_name: 'TAXCALC',
    severity: 'CRITICAL',
    confidence: 73
  },
  
  rootCause: {
    category: 'DATA_EXCEPTION',
    primary: 'Invalid numeric data in PACK operation at X\'B4\'',
    contributing: [
      {
        factor: 'MISSING_STEPLIB',
        description: 'Step TAXCALC missing STEPLIB - may have loaded incorrect version of TAXCALC'
      },
      {
        factor: 'KNOWN_RISK_AREA',
        description: 'PACK instruction with external data - risk of S0C7 ABEND if source contains invalid numeric data'
      }
    ]
  },
  
  blastRadius: {
    criticalPath: true,
    downstreamCount: 1,
    impactedJobs: ['POSTJOB01'],
    enterpriseImpact: [
      {
        system: 'Payroll Export',
        status: 'BLOCKED',
        impact: 'Employee payment files not generated',
        businessImpact: 'Payroll processing halted'
      },
      {
        system: 'Tax Summary Generation',
        status: 'BLOCKED',
        impact: 'Tax withholding reports unavailable',
        businessImpact: 'Compliance reporting delayed'
      },
      {
        system: 'GL Posting',
        status: 'BLOCKED',
        impact: 'General ledger entries not posted',
        businessImpact: 'Financial close delayed'
      },
      {
        system: 'HR Reconciliation',
        status: 'DELAYED',
        impact: 'Employee records out of sync',
        businessImpact: 'HR data integrity issues'
      },
      {
        system: 'Downstream Reporting',
        status: 'DELAYED',
        impact: 'Executive dashboards stale',
        businessImpact: 'Management visibility impaired'
      }
    ]
  },
  
  forensicDetails: {
    instruction: {
      label: 'TAXCALC',
      instruction: 'PACK',
      lineNumber: 45,
      offset: "X'B4'",
      matchType: 'exact'
    },
    matchingRisk: {
      severity: 'HIGH',
      type: 'S0C7_RISK',
      message: 'PACK instruction with external data - risk of S0C7 ABEND if source contains invalid numeric data',
      recommendation: 'Validate source data before PACK operation or add error handling'
    },
    jclIssues: [
      {
        type: 'MISSING_STEPLIB',
        message: 'Step TAXCALC missing STEPLIB - may have loaded incorrect version of TAXCALC'
      }
    ]
  },
  
  recommendations: [
    {
      priority: 'IMMEDIATE',
      action: 'Validate source data before PACK operation or add error handling',
      rationale: 'Prevents S0C7 ABEND from invalid numeric data'
    },
    {
      priority: 'HIGH',
      action: 'Add STEPLIB DD statement to TAXCALC pointing to correct program library',
      rationale: 'Ensures correct module version is loaded'
    },
    {
      priority: 'MEDIUM',
      action: 'Implement comprehensive error handling around packed decimal operations',
      rationale: 'Improves resilience and error recovery'
    },
    {
      priority: 'LOW',
      action: 'Add logging before critical operations to aid future troubleshooting',
      rationale: 'Enhances observability for future incidents'
    }
  ],
  
  workflow: {
    phases: [
      { id: 1, name: 'Intake', status: 'completed', timestamp: '2026-05-15T18:55:04.000Z' },
      { id: 2, name: 'JCL Analysis', status: 'completed', timestamp: '2026-05-15T18:55:05.000Z' },
      { id: 3, name: 'ASM Analysis', status: 'completed', timestamp: '2026-05-15T18:55:06.000Z' },
      { id: 4, name: 'ABEND Correlation', status: 'completed', timestamp: '2026-05-15T18:55:07.000Z' },
      { id: 5, name: 'Knowledge Check', status: 'completed', timestamp: '2026-05-15T18:55:08.000Z' },
      { id: 6, name: 'Review', status: 'completed', timestamp: '2026-05-15T18:55:09.000Z' },
      { id: 7, name: 'RCA Generated', status: 'completed', timestamp: '2026-05-15T18:55:10.000Z' }
    ],
    currentPhase: 7,
    requiresApproval: true,
    approved: true
  },
  
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
};

// Made with Bob
