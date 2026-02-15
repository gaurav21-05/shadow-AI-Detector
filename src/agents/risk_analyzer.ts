// ─────────────────────────────────────────────────
// Agent: Risk_Analyzer
// Role: Corporate AI Security Analyst
// ─────────────────────────────────────────────────

export interface UsageLog {
    id: string;
    timestamp: string;
    model: string;
    user_id: string;
    employee_name: string;
    prompt: string;
    response: string;
    tokens_input: number;
    tokens_output: number;
    cost: number;
}

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface RiskClassification {
    log_id: string;
    employee: string;
    risk_level: RiskLevel;
    reason: string;
    flagged_patterns: string[];
}

// Sensitive patterns to detect
const CRITICAL_PATTERNS = [
    { regex: /AKIA[0-9A-Z]{16}/gi, label: "AWS Access Key" },
    { regex: /[A-Za-z0-9/+=]{40}/gi, label: "Potential Secret Key" },
    { regex: /ghp_[A-Za-z0-9]{36}/gi, label: "GitHub Personal Access Token" },
    { regex: /sk-[A-Za-z0-9]{48}/gi, label: "OpenAI API Key" },
    { regex: /password\s*[:=]\s*\S+/gi, label: "Hardcoded Password" },
];

const HIGH_PATTERNS = [
    { regex: /\b\d{3}-\d{2}-\d{4}\b/g, label: "SSN (Social Security Number)" },
    { regex: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, label: "Credit Card Number" },
    { regex: /\b[A-Z]{2}\d{2}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{2}\b/gi, label: "IBAN" },
];

const MEDIUM_PATTERNS = [
    { regex: /\b(confidential|strictly\s+confidential|internal\s+only|do\s+not\s+share)\b/gi, label: "Confidentiality Marker" },
    { regex: /\b(acquisition|merger|valuation|due\s+diligence)\b/gi, label: "M&A Related Content" },
    { regex: /\b(trade\s+secret|proprietary|nda)\b/gi, label: "Proprietary Information" },
];

function detectPatterns(
    text: string,
    patterns: { regex: RegExp; label: string }[]
): string[] {
    const found: string[] = [];
    for (const p of patterns) {
        if (p.regex.test(text)) {
            found.push(p.label);
        }
        p.regex.lastIndex = 0; // reset stateful regex
    }
    return found;
}

export function analyzeRisk(logs: UsageLog[]): RiskClassification[] {
    return logs.map((log) => {
        const fullText = `${log.prompt} ${log.response}`;

        const criticalHits = detectPatterns(fullText, CRITICAL_PATTERNS);
        const highHits = detectPatterns(fullText, HIGH_PATTERNS);
        const mediumHits = detectPatterns(fullText, MEDIUM_PATTERNS);

        const allFlags = [...criticalHits, ...highHits, ...mediumHits];

        let risk_level: RiskLevel = "LOW";
        let reason = "No sensitive data detected. Standard AI interaction.";

        if (criticalHits.length > 0) {
            risk_level = "CRITICAL";
            reason = `Credential/Secret Leakage: ${criticalHits.join(", ")} detected in prompt.`;
        } else if (highHits.length > 0) {
            risk_level = "HIGH";
            reason = `PII Exposure: ${highHits.join(", ")} found in prompt content.`;
        } else if (mediumHits.length > 0) {
            risk_level = "MEDIUM";
            reason = `Confidential Information: ${mediumHits.join(", ")} referenced in conversation.`;
        }

        return {
            log_id: log.id,
            employee: log.employee_name,
            risk_level,
            reason,
            flagged_patterns: allFlags,
        };
    });
}
