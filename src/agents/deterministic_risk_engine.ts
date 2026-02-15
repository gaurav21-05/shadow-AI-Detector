
export interface RiskResult {
    employee: string;
    risk_level: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
    risk_score: number;
    reason: string;
}

export function classifyRiskDeterministic(
    employee: string,
    data_type: string
): RiskResult {
    let risk_level: RiskResult["risk_level"] = "LOW";
    let risk_score = 20;
    let reason = "Standard data type.";

    if (data_type.includes("Credential")) {
        risk_level = "CRITICAL";
        risk_score = 95;
        reason = "Critical credential exposure detected.";
    } else if (
        data_type.includes("Salary") ||
        data_type.includes("HR") ||
        data_type.includes("Confidential")
    ) {
        risk_level = "HIGH";
        risk_score = 80;
        reason = "High sensitivity data (HR/Salary/Confidential) detected.";
    } else if (data_type.includes("Internal")) {
        risk_level = "MEDIUM";
        risk_score = 60;
        reason = "Internal data classification detected.";
    }

    return {
        employee,
        risk_level,
        risk_score,
        reason,
    };
}

// Example usage if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const examples = [
        { emp: "Alice", type: "AWS Credential Key" },
        { emp: "Bob", type: "Salary Report 2024" },
        { emp: "Charlie", type: "Internal Memo" },
        { emp: "Dave", type: "Public Website Content" },
    ];

    console.log(JSON.stringify(examples.map(e => classifyRiskDeterministic(e.emp, e.type)), null, 2));
}
