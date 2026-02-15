// ─────────────────────────────────────────────────
// Orchestrator: Central AI Governance Pipeline
// ─────────────────────────────────────────────────
// Workflow:
//   1. Receive logs from fetch_ai_usage_logs
//   2. Send logs → Risk_Analyzer
//   3. Send results → Policy_Enforcer
//   4. Send evaluation → Compliance_Reporter
//   5. Return final compliance report
// ─────────────────────────────────────────────────

import { UsageLog, analyzeRisk } from "./agents/risk_analyzer.js";
import { enforcePolicy } from "./agents/policy_enforcer.js";
import {
    generateComplianceReport,
    ComplianceReport,
} from "./agents/compliance_reporter.js";

export interface OrchestrationResult {
    success: boolean;
    steps_completed: string[];
    report: ComplianceReport;
}

export function runGovernanceAudit(logs: UsageLog[]): OrchestrationResult {
    const steps: string[] = [];

    // ── Step 1: Logs received ──────────────────────
    steps.push(`[Step 1] fetch_ai_usage_logs → Received ${logs.length} log(s).`);

    // ── Step 2: Risk_Analyzer ──────────────────────
    const riskClassifications = analyzeRisk(logs);
    const violations = riskClassifications.filter((r) => r.risk_level !== "LOW");
    steps.push(
        `[Step 2] Risk_Analyzer → Classified ${riskClassifications.length} log(s). ${violations.length} violation(s) found.`
    );

    // ── Step 3: Policy_Enforcer ────────────────────
    const policyDecisions = enforcePolicy(riskClassifications);
    const immediateActions = policyDecisions.filter(
        (p) => p.immediate_action_required
    );
    steps.push(
        `[Step 3] Policy_Enforcer → ${policyDecisions.length} decision(s) issued. ${immediateActions.length} require immediate action.`
    );

    // ── Step 4: Compliance_Reporter ────────────────
    const report = generateComplianceReport(policyDecisions);
    steps.push(
        `[Step 4] Compliance_Reporter → Executive report generated. Overall risk: ${report.overall_risk_score}.`
    );

    // ── Step 5: Return ─────────────────────────────
    steps.push(`[Step 5] Pipeline complete. Returning final report.`);

    return {
        success: true,
        steps_completed: steps,
        report,
    };
}
