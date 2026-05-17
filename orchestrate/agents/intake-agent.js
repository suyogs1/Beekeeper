/**
 * Incident Intake Agent
 * Validates and classifies incoming mainframe alerts
 */

export function intakeAgent(alert) {
  console.log('\n🤖 INCIDENT INTAKE AGENT');
  console.log('─'.repeat(70));
  
  // Validate required fields
  if (!alert.abend_code || !alert.job_name) {
    console.log('❌ Validation failed: Missing required fields\n');
    return { 
      status: 'INVALID', 
      message: 'Missing required fields: abend_code or job_name' 
    };
  }
  
  // Classify severity based on ABEND code
  let severity = 'MEDIUM';
  if (alert.abend_code.startsWith('S0C')) {
    severity = 'CRITICAL';
  } else if (alert.abend_code.startsWith('S8')) {
    severity = 'HIGH';
  }
  
  // Determine routing
  const requiresForensics = severity === 'CRITICAL' || severity === 'HIGH';
  
  console.log(`✓ Alert validated`);
  console.log(`✓ Alert ID: ${alert.alert_id}`);
  console.log(`✓ Severity: ${severity}`);
  console.log(`✓ ABEND Type: ${alert.abend_code}`);
  console.log(`✓ Forensic analysis: ${requiresForensics ? 'REQUIRED' : 'Optional'}\n`);
  
  if (requiresForensics) {
    console.log(`→ Routing to Bee-Keeper Forensics Agent...\n`);
  }
  
  return { 
    status: 'VALIDATED', 
    severity, 
    route: requiresForensics ? 'forensics' : 'standard',
    alert
  };
}

// Made with Bob
