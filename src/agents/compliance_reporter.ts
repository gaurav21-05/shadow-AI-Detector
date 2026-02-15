// ─────────────────────────────────────────────────
// Agent: Compliance_Reporter
// Role: Executive Compliance Report Generator
// ─────────────────────────────────────────────────

import { PolicyDecision } from "./policy_enforcer.js";
import { RiskLevel } from "./risk_analyzer.js";

export interface ComplianceReport {
    report_title: string;
    generated_at: string;
    overall_risk_score: RiskLevel;
    total_logs_analyzed: number;
    violation_summary: {
        total_violations: number;
        critical: number;
        high: number;
        medium: number;
        low: number;
    };
    critical_incidents: {
        log_id: string;
        employee: string;
        reason: string;
        mitigation: string;
        access_restriction: string;
    }[];
    recommended_actions: string[];
    executive_summary: string;
    detailed_findings: PolicyDecision[];
}

function calculateOverallRisk(decisions: PolicyDecision[]): RiskLevel {
    if (decisions.some((d) => d.risk_level === "CRITICAL")) return "CRITICAL";
    if (decisions.some((d) => d.risk_level === "HIGH")) return "HIGH";
    if (decisions.some((d) => d.risk_level === "MEDIUM")) return "MEDIUM";
    return "LOW";
}

export function generateComplianceReport(
    decisions: PolicyDecision[]
): ComplianceReport {
    const critical = decisions.filter((d) => d.risk_level === "CRITICAL");
    const high = decisions.filter((d) => d.risk_level === "HIGH");
    const medium = decisions.filter((d) => d.risk_level === "MEDIUM");
    const low = decisions.filter((d) => d.risk_level === "LOW");
    const violations = decisions.filter((d) => d.risk_level !== "LOW");

    const overallRisk = calculateOverallRisk(decisions);

    const criticalIncidents = [...critical, ...high].map((d) => ({
        log_id: d.log_id,
        employee: d.employee,
        reason: d.reason,
        mitigation: d.suggested_mitigation,
        access_restriction: d.access_restriction,
    }));

    const recommendedActions: string[] = [];

    if (critical.length > 0) {
        recommendedActions.push(
            "URGENT: Rotate all exposed credentials immediately."
        );
        recommendedActions.push(
            "Initiate Incident Response for credential exposure events."
        );
    }
    if (high.length > 0) {
        recommendedActions.push(
            "Enforce mandatory PII handling retraining for flagged employees."
        );
        recommendedActions.push(
            "Contact AI vendors to purge PII from training/log pipelines."
        );
    }
    if (medium.length > 0) {
        recommendedActions.push(
            "Review AI usage policy and reinforce data classification guidelines."
        );
    }
    if (violations.length > 0) {
        recommendedActions.push(
            "Deploy a DLP (Data Loss Prevention) layer to intercept sensitive data before it reaches AI models."
        );
        recommendedActions.push(
            "Conduct organization-wide AI security awareness training."
        );
    }

    const violationPct =
        decisions.length > 0
            ? Math.round((violations.length / decisions.length) * 100)
            : 0;

    const executiveSummary = `Audit analyzed ${decisions.length} AI usage log(s). ${violations.length} violation(s) detected (${violationPct}% non-compliant). Overall risk: ${overallRisk}. ${critical.length} critical incident(s) require immediate remediation. ${high.length} high-severity incident(s) involve PII exposure. Immediate organizational action is required to mitigate ongoing risk.`;

    return {
        report_title: "Shadow AI Detector — Executive Compliance Report",
        generated_at: new Date().toISOString(),
        overall_risk_score: overallRisk,
        total_logs_analyzed: decisions.length,
        violation_summary: {
            total_violations: violations.length,
            critical: critical.length,
            high: high.length,
            medium: medium.length,
            low: low.length,
        },
        critical_incidents: criticalIncidents,
        recommended_actions: recommendedActions,
        executive_summary: executiveSummary,
        detailed_findings: decisions,
    };
}
