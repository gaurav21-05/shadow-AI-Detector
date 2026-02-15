
import { PolicyResult } from "./deterministic_policy_engine.js";

export function generateExecutiveReport(
    results: PolicyResult[],
    scope: string = "Full Organization Audit"
): string {
    const date = new Date().toISOString().split("T")[0];
    const totalViolations = results.length;

    // Count per Risk Level
    const riskCounts = {
        CRITICAL: 0,
        HIGH: 0,
        MEDIUM: 0,
        LOW: 0,
    };

    let totalScore = 0;

    for (const r of results) {
        if (r.risk_level in riskCounts) {
            riskCounts[r.risk_level as keyof typeof riskCounts]++;
        }
        totalScore += r.risk_score;
    }

    const overallRiskScore = totalViolations > 0 ? totalScore / totalViolations : 0;

    let overallRating = "LOW";
    if (overallRiskScore > 85) overallRating = "CRITICAL";
    else if (overallRiskScore > 70) overallRating = "HIGH";
    else if (overallRiskScore > 50) overallRating = "MEDIUM";

    // Build Markdown
    const lines: string[] = [];
    lines.push(`# Executive Governance Report`);
    lines.push(``);
    lines.push(`## Audit Overview`);
    lines.push(`- **Date**: ${date}`);
    lines.push(`- **Scope**: ${scope}`);
    lines.push(``);
    lines.push(`## Risk Summary`);
    lines.push(`- **Total Violations**: ${totalViolations}`);
    lines.push(`- **Critical**: ${riskCounts.CRITICAL}`);
    lines.push(`- **High**: ${riskCounts.HIGH}`);
    lines.push(`- **Medium**: ${riskCounts.MEDIUM}`);
    lines.push(`- **Low**: ${riskCounts.LOW}`);
    lines.push(`- **Overall Risk Score**: ${overallRiskScore.toFixed(2)}`);
    lines.push(`- **Overall Rating**: ${overallRating}`);
    lines.push(``);
    lines.push(`## Incident Breakdown`);
    lines.push(`| Employee | Risk Level | Score | Action | Recommendation |`);
    lines.push(`|---|---|---|---|---|`);

    for (const r of results) {
        lines.push(`| ${r.employee} | ${r.risk_level} | ${r.risk_score} | ${r.immediate_action} | ${r.recommendation} |`);
    }

    lines.push(``);
    lines.push(`## Remediation Plan`);
    lines.push(`**Short-Term Actions**`);
    lines.push(`- Isolate and revoke access for CRITICAL/HIGH risk users immediately.`);
    lines.push(`- Send automated warnings to MEDIUM risk users.`);
    lines.push(``);
    lines.push(`**Long-Term Governance Improvements**`);
    lines.push(`- Conduct mandatory AI security training for repeat offenders.`);
    lines.push(`- Refine DLP rules to catch newer credential patterns.`);

    return lines.join("\n");
}

// Example usage if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    // Mock data
    const mockResults: PolicyResult[] = [
        {
            employee: "Alice",
            risk_level: "CRITICAL",
            risk_score: 95,
            immediate_action: "YES",
            recommendation: "Suspend AI access and escalate to Security Team"
        },
        {
            employee: "Bob",
            risk_level: "HIGH",
            risk_score: 80,
            immediate_action: "YES",
            recommendation: "Notify department head and conduct review"
        },
        {
            employee: "Charlie",
            risk_level: "LOW",
            risk_score: 20,
            immediate_action: "NO",
            recommendation: "Log for record only"
        }
    ];

    console.log(generateExecutiveReport(mockResults));
}
