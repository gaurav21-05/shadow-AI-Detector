
import { RiskResult } from "./deterministic_risk_engine.js";

export interface PolicyResult {
    employee: string;
    risk_level: string;
    risk_score: number;
    immediate_action: string;
    recommendation: string;
}

export function applyDeterministicPolicy(riskResult: RiskResult): PolicyResult {
    let immediate_action = "NO";
    let recommendation = "Log for record only";

    switch (riskResult.risk_level) {
        case "CRITICAL":
            immediate_action = "YES";
            recommendation = "Suspend AI access and escalate to Security Team";
            break;
        case "HIGH":
            immediate_action = "YES";
            recommendation = "Notify department head and conduct review";
            break;
        case "MEDIUM":
            immediate_action = "NO";
            recommendation = "Issue warning and monitor activity";
            break;
        case "LOW":
            immediate_action = "NO";
            recommendation = "Log for record only";
            break;
    }

    return {
        employee: riskResult.employee,
        risk_level: riskResult.risk_level,
        risk_score: riskResult.risk_score,
        immediate_action,
        recommendation,
    };
}

// Example usage if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    // Mock inputs based on previous engine's output structure
    const examples: RiskResult[] = [
        { employee: "Alice", risk_level: "CRITICAL", risk_score: 95, reason: "Credential exposure" },
        { employee: "Bob", risk_level: "HIGH", risk_score: 80, reason: "Salary data" },
        { employee: "Charlie", risk_level: "MEDIUM", risk_score: 60, reason: "Internal data" },
        { employee: "Dave", risk_level: "LOW", risk_score: 20, reason: "Public data" },
    ];

    console.log(JSON.stringify(examples.map(applyDeterministicPolicy), null, 2));
}
