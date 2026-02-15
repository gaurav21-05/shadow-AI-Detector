import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { UsageLog } from "./agents/risk_analyzer.js";
import { runGovernanceAudit } from "./orchestrator.js";
import { getAuditHistory } from "./data/store.js";
import { getUserStatusMap } from "./data/store.js";

// Create an MCP server
const server = new McpServer({
    name: "shadow-ai-detector",
    version: "1.0.0",
});

// ─────────────────────────────────────────────────
// Mock AI Usage Logs (Security Scenarios)
// ─────────────────────────────────────────────────
const mockLogs: UsageLog[] = [
    {
        id: "log-001",
        timestamp: "2023-10-27T10:00:00Z",
        model: "gpt-4",
        user_id: "user-123",
        employee_name: "John Doe",
        prompt:
            "Can you help me write a function to calculate the Fibonacci sequence in Python?",
        response:
            'Certainly! Here is a simple Python function:\n\n```python\ndef fibonacci(n):\n    if n <= 1:\n        return n\n    else:\n        return fibonacci(n-1) + fibonacci(n-2)\n```',
        tokens_input: 150,
        tokens_output: 300,
        cost: 0.03,
    },
    {
        id: "log-002",
        timestamp: "2023-10-27T10:30:00Z",
        model: "gpt-3.5-turbo",
        user_id: "user-456",
        employee_name: "Sarah Smith",
        prompt:
            "I need to format this customer list. Here is the data: Name: Alice, Phone: 555-0123, SSN: 123-45-6789. Name: Bob, Phone: 555-0199, SSN: 987-65-4321.",
        response:
            "I can help with that. However, I noticed you included sensitive PII (SSN).\n\n| Name | Phone |\n|---|---|\n| Alice | 555-0123 |\n| Bob | 555-0199 |",
        tokens_input: 50,
        tokens_output: 100,
        cost: 0.002,
    },
    {
        id: "log-003",
        timestamp: "2023-10-28T09:15:00Z",
        model: "gpt-4",
        user_id: "user-789",
        employee_name: "Mike Jones",
        prompt:
            "Here is the AWS access key for the production database: AKIAIOSFODNN7EXAMPLE. The secret key is wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY. Please debug why the connection involves a timeout.",
        response:
            "I cannot process that request as it contains exposed AWS credentials. You should immediately rotate these keys.",
        tokens_input: 500,
        tokens_output: 200,
        cost: 0.045,
    },
    {
        id: "log-004",
        timestamp: "2023-10-28T14:20:00Z",
        model: "gpt-4",
        user_id: "user-101",
        employee_name: "Emily Davis",
        prompt:
            "Draft an email to the team about the upcoming 'Project Chimera' acquisition. It's strictly confidential and not public until next week. Mention the 50M valuation.",
        response:
            "Subject: Confidential Update: Project Chimera Acquisition\n\nTeam, I'm writing to share important news regarding the upcoming acquisition...",
        tokens_input: 200,
        tokens_output: 250,
        cost: 0.02,
    },
    {
        id: "log-005",
        timestamp: "2023-10-29T11:00:00Z",
        model: "gpt-3.5-turbo",
        user_id: "user-123",
        employee_name: "John Doe",
        prompt:
            "Summarize this meeting note: 'discussed release schedule for v2.0, no major blockers'.",
        response:
            "Meeting Summary:\n- Topic: v2.0 Release Schedule\n- Status: On track, no major blockers flagged.",
        tokens_input: 40,
        tokens_output: 60,
        cost: 0.001,
    },
];

// ─────────────────────────────────────────────────
// Tool 1: fetch_ai_usage_logs
// ─────────────────────────────────────────────────
server.tool(
    "fetch_ai_usage_logs",
    {
        start_date: z
            .string()
            .optional()
            .describe("Filter logs starting from this date (ISO 8601 format)"),
        end_date: z
            .string()
            .optional()
            .describe("Filter logs ending at this date (ISO 8601 format)"),
        user_id: z.string().optional().describe("Filter logs by user ID"),
    },
    async ({ start_date, end_date, user_id }) => {
        let filteredLogs = [...mockLogs];

        if (start_date) {
            filteredLogs = filteredLogs.filter((log) => log.timestamp >= start_date);
        }
        if (end_date) {
            filteredLogs = filteredLogs.filter((log) => log.timestamp <= end_date);
        }
        if (user_id) {
            filteredLogs = filteredLogs.filter((log) => log.user_id === user_id);
        }

        return {
            content: [
                {
                    type: "text" as const,
                    text: JSON.stringify(filteredLogs, null, 2),
                },
            ],
        };
    }
);

// ─────────────────────────────────────────────────
// Tool 2: run_governance_audit
// Orchestrates the full pipeline:
//   fetch_ai_usage_logs → Risk_Analyzer → Policy_Enforcer → Compliance_Reporter
// ─────────────────────────────────────────────────
server.tool(
    "run_governance_audit",
    {
        start_date: z
            .string()
            .optional()
            .describe("Filter logs starting from this date (ISO 8601 format)"),
        end_date: z
            .string()
            .optional()
            .describe("Filter logs ending at this date (ISO 8601 format)"),
        user_id: z.string().optional().describe("Filter logs by user ID"),
    },
    async ({ start_date, end_date, user_id }) => {
        // Step 1: Fetch logs (same filtering logic)
        let filteredLogs: UsageLog[] = [...mockLogs];

        if (start_date) {
            filteredLogs = filteredLogs.filter((log) => log.timestamp >= start_date);
        }
        if (end_date) {
            filteredLogs = filteredLogs.filter((log) => log.timestamp <= end_date);
        }
        if (user_id) {
            filteredLogs = filteredLogs.filter((log) => log.user_id === user_id);
        }

        // Steps 2–5: Run the full orchestrated pipeline
        const result = runGovernanceAudit(filteredLogs);

        return {
            content: [
                {
                    type: "text" as const,
                    text: JSON.stringify(result, null, 2),
                },
            ],
        };
    }
);

// ── Tool 3: get_risk_trends ──────────────────────
server.tool(
    "get_risk_trends",
    {},
    async () => {
        const history = getAuditHistory();
        return {
            content: [
                {
                    type: "text" as const,
                    text: JSON.stringify(history, null, 2),
                },
            ],
        };
    }
);

// ── Tool 4: get_user_status ──────────────────────
server.tool(
    "get_user_status",
    {},
    async () => {
        const statusMap = getUserStatusMap();
        return {
            content: [
                {
                    type: "text" as const,
                    text: JSON.stringify(statusMap, null, 2),
                },
            ],
        };
    }
);

// Start the server using stdio transport
const transport = new StdioServerTransport();
server.connect(transport);
