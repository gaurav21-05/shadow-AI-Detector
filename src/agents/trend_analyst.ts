
import {
    AuditRecord,
    getAuditHistory,
    saveAuditRecord,
} from "../data/store.js";
import { ComplianceReport } from "./compliance_reporter.js";

export interface TrendAnalysis {
    current_risk: string;
    previous_risk: string | null;
    risk_trend: "IMPROVING" | "WORSENING" | "STABLE";
    violations_change: number;
    history_length: number;
}

export function analyzeTrends(latestReport: ComplianceReport): TrendAnalysis {
    const history = getAuditHistory();
    const previous = history.length > 0 ? history[history.length - 1] : null;

    // Save current audit to history
    const currentRecord: AuditRecord = {
        timestamp: latestReport.generated_at,
        overall_risk_score: latestReport.overall_risk_score,
        violation_count: latestReport.violation_summary.total_violations,
        critical_incidents: latestReport.violation_summary.critical,
    };
    saveAuditRecord(currentRecord);

    if (!previous) {
        return {
            current_risk: latestReport.overall_risk_score,
            previous_risk: null,
            risk_trend: "STABLE",
            violations_change: 0,
            history_length: 1,
        };
    }

    const currentViolations = latestReport.violation_summary.total_violations;
    const prevViolations = previous.violation_count;

    let trend: "IMPROVING" | "WORSENING" | "STABLE" = "STABLE";
    if (currentViolations < prevViolations) trend = "IMPROVING";
    else if (currentViolations > prevViolations) trend = "WORSENING";

    return {
        current_risk: latestReport.overall_risk_score,
        previous_risk: previous.overall_risk_score,
        risk_trend: trend,
        violations_change: currentViolations - prevViolations,
        history_length: history.length + 1,
    };
}
