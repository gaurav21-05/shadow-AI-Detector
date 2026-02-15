
// Import agents directly to avoid potential circular dependencies or re-export issues in orchestrator
import { UsageLog, analyzeRisk } from "../agents/risk_analyzer.js";
import { enforcePolicy } from "../agents/policy_enforcer.js";
import { generateComplianceReport } from "../agents/compliance_reporter.js";
import { analyzeTrends } from "../agents/trend_analyst.js";
import fs from "fs";
import path from "path";

// Mock Data Load
const mockLogs: UsageLog[] = [
    {
        id: `log-daily-${Date.now()}`,
        timestamp: new Date().toISOString(),
        model: "gpt-4",
        user_id: "user-123",
        employee_name: "John Doe",
        prompt: "Generate a list of AWS keys for testing.",
        response: "Here are some fake keys: AKIA...",
        tokens_input: 50,
        tokens_output: 50,
        cost: 0.01,
    }
];

console.log(`[Daily Scan] Starting governance audit for ${new Date().toISOString()}...`);

// Reconstruct pipeline logic locally for the script
const riskClassifications = analyzeRisk(mockLogs);
const policyDecisions = enforcePolicy(riskClassifications);
const report = generateComplianceReport(policyDecisions);
const trends = analyzeTrends(report);

console.log(`[Daily Scan] Completed.`);
console.log(`- Overall Risk: ${report.overall_risk_score}`);
console.log(`- Trend: ${trends.risk_trend}`);
console.log(`- History Size: ${trends.history_length}`);

if (report.overall_risk_score === "CRITICAL") {
    console.error("!!! CRITICAL ALERT: Immediate action required. Users may have been suspended.");
}

const LOG_DIR = path.resolve(process.cwd(), "logs");
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR);
fs.writeFileSync(path.join(LOG_DIR, `scan-${Date.now()}.json`), JSON.stringify({ report, trends }, null, 2));
