import { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { scenarios, scenarioList } from './data/scenarios';

// Initialize Mermaid
mermaid.initialize({
  startOnLoad: true,
  theme: 'dark',
  themeVariables: {
    darkMode: true,
    background: '#0a0e1a',
    primaryColor: '#3b82f6',
    primaryTextColor: '#e5e7eb',
    primaryBorderColor: '#1f2937',
    lineColor: '#9ca3af',
    secondaryColor: '#10b981',
    tertiaryColor: '#f59e0b',
  },
});

function App() {
  const [selectedScenario, setSelectedScenario] = useState('payrl001');
  const [incident, setIncident] = useState(scenarios.payrl001);
  const mermaidRef = useRef(null);

  useEffect(() => {
    // Update incident when scenario changes
    setIncident(scenarios[selectedScenario]);
  }, [selectedScenario]);

  useEffect(() => {
    // Re-render Mermaid diagram when incident changes
    if (mermaidRef.current) {
      mermaidRef.current.removeAttribute('data-processed');
      mermaid.contentLoaded();
    }
  }, [incident]);

  const handleScenarioChange = (e) => {
    setSelectedScenario(e.target.value);
  };

  const { metadata, rootCause, enterpriseImpact, recommendations, workflow, mermaidDiagram } = incident;

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'CRITICAL': return 'text-war-room-critical';
      case 'HIGH': return 'text-war-room-warning';
      case 'MEDIUM': return 'text-war-room-accent';
      default: return 'text-war-room-success';
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'CRITICAL': return 'status-badge status-critical';
      case 'HIGH': return 'status-badge status-warning';
      case 'MEDIUM': return 'status-badge status-success';
      default: return 'status-badge status-success';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'BLOCKED': return '🔴';
      case 'DELAYED': return '🟡';
      default: return '🟢';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'IMMEDIATE': return 'text-war-room-critical';
      case 'HIGH': return 'text-war-room-warning';
      case 'MEDIUM': return 'text-war-room-accent';
      default: return 'text-war-room-text-dim';
    }
  };

  return (
    <div className="min-h-screen max-h-screen overflow-hidden flex flex-col p-4 md:p-6 gap-4 md:gap-6">
      {/* Header with Scenario Selector */}
      <header className="border-b border-war-room-border pb-4 flex-shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="text-3xl">🐝</div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-war-room-accent">Bee-Keeper War Room</h1>
              <p className="text-xs md:text-sm text-war-room-text-dim">Enterprise Incident Response Command Center</p>
            </div>
          </div>
          
          {/* Scenario Selector */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex-1 min-w-[250px]">
              <label className="text-xs text-war-room-text-dim block mb-1">Incident Scenario</label>
              <select 
                value={selectedScenario}
                onChange={handleScenarioChange}
                className="w-full bg-war-room-bg border border-war-room-border rounded px-3 py-2 text-sm focus:outline-none focus:border-war-room-accent transition-colors"
              >
                {scenarioList.map(scenario => (
                  <option key={scenario.id} value={scenario.id}>
                    {scenario.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="text-xs text-war-room-text-dim">Incident ID</div>
                <div className="text-xs md:text-sm font-mono">{metadata.incident_id}</div>
              </div>
              <div className={getSeverityBadge(metadata.severity)}>
                {metadata.severity}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid Layout - Scrollable */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 pb-6">
          {/* LEFT PANEL - Incident Metadata */}
          <div className="lg:col-span-3 space-y-4 md:space-y-6">
            <div className="panel animate-fade-in">
              <div className="panel-header">
                <span>📊</span>
                <span>Incident Metadata</span>
              </div>
              <div className="space-y-3">
                <div className="metric-card">
                  <div className="text-xs text-war-room-text-dim">ABEND Code</div>
                  <div className="text-2xl font-bold text-war-room-critical">{metadata.abend_code}</div>
                </div>
                <div className="metric-card">
                  <div className="text-xs text-war-room-text-dim">Offset</div>
                  <div className="text-xl font-mono text-war-room-accent">{metadata.offset}</div>
                </div>
                <div className="metric-card">
                  <div className="text-xs text-war-room-text-dim">Job Name</div>
                  <div className="text-lg font-mono">{metadata.job_name}</div>
                </div>
                <div className="metric-card">
                  <div className="text-xs text-war-room-text-dim">Module</div>
                  <div className="text-lg font-mono">{metadata.module_name}</div>
                </div>
                <div className="metric-card">
                  <div className="text-xs text-war-room-text-dim">Confidence Score</div>
                  <div className="flex items-baseline gap-2">
                    <div className="text-2xl font-bold text-war-room-warning">{metadata.confidence}%</div>
                    <div className="text-xs text-war-room-text-dim">correlation</div>
                  </div>
                </div>
                <div className="metric-card">
                  <div className="text-xs text-war-room-text-dim">Timestamp</div>
                  <div className="text-sm">{new Date(metadata.timestamp).toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>

          {/* CENTER PANEL - Mermaid Diagram */}
          <div className="lg:col-span-6 space-y-4 md:space-y-6">
            <div className="panel animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="panel-header">
                <span>🎯</span>
                <span>Dependency Flow & Blast Radius</span>
              </div>
              <div className="bg-war-room-bg rounded-lg p-4 md:p-6 border border-war-room-border overflow-x-auto">
                <div ref={mermaidRef} className="mermaid min-w-[600px]">
                  {mermaidDiagram}
                </div>
              </div>
            </div>

            {/* Enterprise Impact Table */}
            <div className="panel animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="panel-header">
                <span>💥</span>
                <span>Enterprise Impact Assessment</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-war-room-border">
                      <th className="text-left py-2 px-3 text-war-room-text-dim font-semibold">System</th>
                      <th className="text-left py-2 px-3 text-war-room-text-dim font-semibold">Status</th>
                      <th className="text-left py-2 px-3 text-war-room-text-dim font-semibold">Business Impact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enterpriseImpact.map((impact, i) => (
                      <tr key={i} className="border-b border-war-room-border/50 hover:bg-war-room-bg transition-colors">
                        <td className="py-3 px-3 font-mono">{impact.system}</td>
                        <td className="py-3 px-3">
                          <span className="flex items-center gap-2">
                            <span>{getStatusIcon(impact.status)}</span>
                            <span className={impact.status === 'BLOCKED' ? 'text-war-room-critical' : 'text-war-room-warning'}>
                              {impact.status}
                            </span>
                          </span>
                        </td>
                        <td className="py-3 px-3 text-war-room-text-dim">{impact.impact}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL - RCA & Remediation */}
          <div className="lg:col-span-3 space-y-4 md:space-y-6">
            <div className="panel animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="panel-header">
                <span>🔴</span>
                <span>Root Cause</span>
              </div>
              <div className="space-y-3">
                <div className="bg-war-room-bg p-3 rounded border border-war-room-critical/30">
                  <div className="text-sm font-semibold text-war-room-critical mb-2">{rootCause.primary}</div>
                </div>
                <div>
                  <div className="text-xs text-war-room-text-dim mb-2">Contributing Factors:</div>
                  <div className="space-y-2">
                    {rootCause.contributing.map((factor, i) => (
                      <div key={i} className="bg-war-room-bg p-2 rounded border border-war-room-border text-xs">
                        <div className="text-war-room-text-dim">{factor}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="panel animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="panel-header">
                <span>✅</span>
                <span>Remediation Plan</span>
              </div>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {recommendations.map((rec, i) => (
                  <div key={i} className="bg-war-room-bg p-3 rounded border border-war-room-border hover:border-war-room-accent transition-colors">
                    <div className="flex items-start gap-2">
                      <div className={`text-xs font-bold ${getPriorityColor(rec.priority)}`}>
                        {rec.priority}
                      </div>
                    </div>
                    <div className="text-sm mt-1">{rec.action}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <div className="panel-header">
                <span>📋</span>
                <span>Review Status</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-war-room-text-dim">Requires Approval</span>
                  <span className="text-war-room-warning">YES</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-war-room-text-dim">Status</span>
                  <span className="text-war-room-success">✓ APPROVED</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-war-room-text-dim">Critical Path</span>
                  <span className={metadata.severity === 'CRITICAL' ? 'text-war-room-critical' : 'text-war-room-text-dim'}>
                    {metadata.severity === 'CRITICAL' ? 'YES ⚠️' : 'NO'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM PANEL - Workflow Timeline */}
        <div className="panel animate-fade-in mb-6" style={{ animationDelay: '0.6s' }}>
          <div className="panel-header">
            <span>⏱️</span>
            <span>Workflow Progression</span>
          </div>
          <div className="overflow-x-auto">
            <div className="flex items-center justify-between gap-2 md:gap-4 mt-4 min-w-[600px]">
              {workflow.map((phase, i) => (
                <div key={i} className="flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-xs md:text-sm
                      ${phase.status === 'complete' ? 'bg-war-room-success text-white' : 
                        phase.status === 'skipped' ? 'bg-war-room-border text-war-room-text-dim' : 
                        'bg-war-room-warning text-white'}`}>
                      {phase.status === 'complete' ? '✓' : phase.status === 'skipped' ? '−' : i + 1}
                    </div>
                    <div className="text-xs mt-2 text-center font-semibold">{phase.phase}</div>
                    <div className="text-xs text-war-room-text-dim mt-1">
                      {phase.timestamp}
                    </div>
                  </div>
                  {i < workflow.length - 1 && (
                    <div className={`h-1 mt-5 -mx-1 ${phase.status === 'complete' ? 'bg-war-room-success' : 'bg-war-room-border'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

// Made with Bob
