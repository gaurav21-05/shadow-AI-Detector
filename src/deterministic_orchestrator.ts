
import { classifyRiskDeterministic } from "./agents/deterministic_risk_engine.js";
import { applyDeterministicPolicy, PolicyResult } from "./agents/deterministic_policy_engine.js";
import { generateExecutiveReport } from "./agents/deterministic_reporting_engine.js";
import { UsageLog } from "./agents/risk_analyzer.js";

// Mock fetch function (in a real scenario, this would call a database or API)
async function fetch_ai_usage_logs(): Promise<UsageLog[]> {
    // Return some mock logs that trigger different rules
    return [
        {
            id: "log-1",
            timestamp: new Date().toISOString(),
            model: "gpt-4",
            user_id: "u1",
            employee_name: "Alice",
            prompt: "Here is the AWS Credential Key for the prod DB",
            response: "...",
            tokens_input: 10,
            tokens_output: 10,
            cost: 0.001
        },
        {
            id: "log-2",
            timestamp: new Date().toISOString(),
            model: "claude-3",
            user_id: "u2",
            employee_name: "Bob",
            prompt: "Draft a Salary increase letter for the team",
            response: "...",
            tokens_input: 10,
            tokens_output: 10,
            cost: 0.001
        },
        {
            id: "log-3",
            timestamp: new Date().toISOString(),
            model: "gemini-pro",
            user_id: "u3",
            employee_name: "Charlie",
            prompt: "Summarize this public news article",
            response: "...",
            tokens_input: 10,
            tokens_output: 10,
            cost: 0.001
        }
    ];
}

export async function runDeterministicGovernance(): Promise<string> {
    // 1. Fetch Logs
    const logs = await fetch_ai_usage_logs();

    // 2. Risk Analyzer
    const policyResults: PolicyResult[] = [];

    for (const log of logs) {
        // We use the prompt + response or just prompt as "data_type" proxy for this deterministic engine
        // The user prompt implied passing "data_type" strings like "Credential", "Salary"
        // So we scan the content to simulate that extraction or pass the prompt itself if it contains the keywords
        const content = log.prompt + " " + log.response;

        const riskResult = classifyRiskDeterministic(log.employee_name, content);

        // 3. Policy Enforcer
        const policyResult = applyDeterministicPolicy(riskResult);
        policyResults.push(policyResult);
    }

    // 4. Compliance Reporter
    const report = generateExecutiveReport(policyResults);

    // 5. Return Report
    return report;
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runDeterministicGovernance().then(report => console.log(report));
}
