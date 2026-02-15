
import { RiskClassification, RiskLevel } from "./risk_analyzer.js";
import { updateUserStatus } from "../data/store.js";

export interface PolicyDecision {
    log_id: string;
    employee: string;
    user_id: string;
    risk_level: RiskLevel;
    reason: string;
    immediate_action_required: boolean;
    suggested_mitigation: string;
    access_restriction: string;
}

const POLICY_RULES: Record<
    RiskLevel,
    {
        immediate_action: boolean;
        mitigation: string;
        access_restriction: string;
    }
> = {
    CRITICAL: {
        immediate_action: true,
        mitigation:
            "IMMEDIATE credential rotation. Trigger Incident Response process. Full forensic audit of affected systems. Mandatory security retraining.",
        access_restriction:
            "IMMEDIATE SUSPENSION of all AI tool access and affected system privileges.",
    },
    HIGH: {
        immediate_action: true,
        mitigation:
            "Purge PII from AI provider logs. Notify Data Protection Officer. Mandatory PII handling retraining within 48 hours.",
        access_restriction:
            "Suspend AI tool access pending completion of retraining program.",
    },
    MEDIUM: {
        immediate_action: false,
        mitigation:
            "Manager review of conversation logs. Remind employee of data classification policy. Document incident.",
        access_restriction:
            "Enable enhanced logging and real-time monitoring for this user.",
    },
    LOW: {
        immediate_action: false,
        mitigation: "No action required.",
        access_restriction: "No restrictions. Standard access maintained.",
    },
};

export function enforcePolicy(
    classifications: RiskClassification[]
): PolicyDecision[] {
    return classifications.map((c) => {
        const rule = POLICY_RULES[c.risk_level];

        // Auto-Enforcement Logic
        if (c.risk_level === "CRITICAL" || c.risk_level === "HIGH") {
            updateUserStatus(c.user_id, "SUSPENDED");
        }

        return {
            log_id: c.log_id,
            employee: c.employee,
            user_id: c.user_id,
            risk_level: c.risk_level,
            reason: c.reason,
            immediate_action_required: rule.immediate_action,
            suggested_mitigation: rule.mitigation,
            access_restriction: rule.access_restriction,
        };
    });
}
