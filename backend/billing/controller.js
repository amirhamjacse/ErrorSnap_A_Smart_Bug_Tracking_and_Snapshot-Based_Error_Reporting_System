import Project from "../classes/project.js";
import ProjectTeam from "../classes/projectTeam.js";
import ProjectApiKey from "../apiKeys/projectApiKey.js";
import UsageMeter from "./usageMeter.js";
import Stripe from "stripe";

const BILLING_PRICING = {
  currency: "USD",
  errors_per_1000: 0.5,
  sessions_per_1000: 0.2,
  api_calls_per_10000: 0.3,
};

const STRIPE_PLAN_CATALOG = {
  growth: {
    code: "growth",
    name: "Growth",
    amount: 2900,
    currency: "usd",
    interval: "month",
  },
  scale: {
    code: "scale",
    name: "Scale",
    amount: 9900,
    currency: "usd",
    interval: "month",
  },
};

function normalizeBaseUrl(value) {
  if (!value || typeof value !== "string") {
    return "";
  }

  return value.trim().replace(/\/$/, "");
}

function getFrontendBaseUrl(req) {
  const originFromRequest = normalizeBaseUrl(req.headers?.origin);
  if (originFromRequest) {
    return originFromRequest;
  }

  const frontendFromEnv = normalizeBaseUrl(process.env.FRONTEND_URL);
  if (frontendFromEnv) {
    return frontendFromEnv;
  }

  return "http://localhost:5173";
}

function toMoney(value) {
  return Math.round(Number(value || 0) * 100) / 100;
}

function calculateEstimatedCost(usage) {
  const errorsCost =
    (Number(usage?.errors_logged || 0) / 1000) * BILLING_PRICING.errors_per_1000;
  const sessionsCost =
    (Number(usage?.sessions_recorded || 0) / 1000) *
    BILLING_PRICING.sessions_per_1000;
  const apiCallsCost =
    (Number(usage?.api_calls || 0) / 10000) * BILLING_PRICING.api_calls_per_10000;

  const total = errorsCost + sessionsCost + apiCallsCost;

  return {
    errors: toMoney(errorsCost),
    sessions: toMoney(sessionsCost),
    api_calls: toMoney(apiCallsCost),
    total: toMoney(total),
  };
}

function getPeriodKeyFromQuery(queryValue) {
  const periodKey = String(queryValue || "").trim();
  if (!periodKey) {
    return UsageMeter.getPeriodKey();
  }

  const isValid = /^\d{4}-\d{2}$/.test(periodKey);
  if (!isValid) {
    return UsageMeter.getPeriodKey();
  }

  return periodKey;
}

const csvEscape = (value) => {
  const plainValue = value === null || typeof value === "undefined" ? "" : String(value);
  const escaped = plainValue.replace(/"/g, '""');
  return `"${escaped}"`;
};

async function resolveProjectByIngestionPayload({ apiKey, projectId }) {
  if (apiKey) {
    const apiKeyResult = await ProjectApiKey.consume(apiKey);
    if (!apiKeyResult.ok) {
      return {
        ok: false,
        status: apiKeyResult.status,
        message: apiKeyResult.message,
      };
    }

    const project = await Project.getById(apiKeyResult.projectId);
    if (!project?.id) {
      return {
        ok: false,
        status: 404,
        message: "Project not found",
      };
    }

    return {
      ok: true,
      project,
    };
  }

  if (!projectId) {
    return {
      ok: false,
      status: 400,
      message: "Missing projectId or apiKey",
    };
  }

  const project = await Project.getById(projectId);
  if (!project?.id) {
    return {
      ok: false,
      status: 404,
      message: "Project not found",
    };
  }

  return {
    ok: true,
    project,
  };
}

export const recordSessionStart = async (req, res) => {
  const { apiKey, projectId, sessionId } = req.body;

  if (!apiKey && !projectId) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const resolved = await resolveProjectByIngestionPayload({ apiKey, projectId });
  if (!resolved.ok) {
    return res.status(resolved.status).json({ message: resolved.message });
  }

  try {
    const effectiveProjectId = resolved.project.id;
    const periodKey = UsageMeter.getPeriodKey();

    await UsageMeter.incrementMetric(effectiveProjectId, "api_calls", 1, periodKey);

    if (sessionId) {
      await UsageMeter.registerSession(effectiveProjectId, sessionId, periodKey);
    }

    return res.status(201).json({
      message: "Session usage tracked",
      data: {
        projectId: effectiveProjectId,
        periodKey,
      },
    });
  } catch (error) {
    console.error("Error tracking session usage:", error);
    return res.status(500).json({ message: "Unable to track session usage" });
  }
};

export const getBillingSummary = async (req, res) => {
  const { projectId } = req.params;

  if (!projectId) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const isProjectMember = await ProjectTeam.isProjectMember(projectId);
  if (!isProjectMember.length) {
    return res.status(404).json({ message: "Project not found!" });
  }

  try {
    const periodKey = getPeriodKeyFromQuery(req.query?.periodKey);
    const usage = await UsageMeter.getSummary(projectId, periodKey);
    const estimate = calculateEstimatedCost(usage);

    return res.status(200).json({
      message: "",
      data: {
        project_id: projectId,
        period_key: periodKey,
        usage: {
          errors_logged: Number(usage.errors_logged || 0),
          sessions_recorded: Number(usage.sessions_recorded || 0),
          api_calls: Number(usage.api_calls || 0),
        },
        pricing: BILLING_PRICING,
        estimate,
      },
    });
  } catch (error) {
    console.error("Error getting billing summary:", error);
    return res.status(500).json({ message: "Error getting billing summary" });
  }
};

export const exportBillingUsageCsv = async (req, res) => {
  const { projectId } = req.params;

  if (!projectId) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const isProjectMember = await ProjectTeam.isProjectMember(projectId);
  if (!isProjectMember.length) {
    return res.status(404).json({ message: "Project not found!" });
  }

  try {
    const periodKey = getPeriodKeyFromQuery(req.query?.periodKey);
    const rows = await UsageMeter.getHistory(projectId, periodKey);

    const header = [
      "project_id",
      "period_key",
      "errors_logged",
      "sessions_recorded",
      "api_calls",
      "estimated_errors_cost",
      "estimated_sessions_cost",
      "estimated_api_calls_cost",
      "estimated_total_cost",
      "currency",
      "created_at",
      "updated_at",
    ];

    const bodyRows = rows.map((row) => {
      const estimate = calculateEstimatedCost(row);
      return [
        row.project_id,
        row.period_key,
        Number(row.errors_logged || 0),
        Number(row.sessions_recorded || 0),
        Number(row.api_calls || 0),
        estimate.errors,
        estimate.sessions,
        estimate.api_calls,
        estimate.total,
        BILLING_PRICING.currency,
        row.created_at,
        row.updated_at,
      ]
        .map(csvEscape)
        .join(",");
    });

    const csv = [header.map(csvEscape).join(","), ...bodyRows].join("\n");
    const suffix = periodKey ? `-${periodKey}` : "-all";
    const fileName = `billing-usage-${projectId}${suffix}-${Date.now()}.csv`;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename=\"${fileName}\"`);
    return res.status(200).send(csv);
  } catch (error) {
    console.error("Error exporting billing usage:", error);
    return res.status(500).json({ message: "Error exporting billing usage" });
  }
};

export const getBillingHistory = async (req, res) => {
  const { projectId } = req.params;

  if (!projectId) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const isProjectMember = await ProjectTeam.isProjectMember(projectId);
  if (!isProjectMember.length) {
    return res.status(404).json({ message: "Project not found!" });
  }

  try {
    const limit = Number(req.query?.limit) > 0 ? Number(req.query.limit) : 12;
    const rows = await UsageMeter.getHistory(projectId, null, limit);

    const data = rows.map((row) => ({
      project_id: row.project_id,
      period_key: row.period_key,
      usage: {
        errors_logged: Number(row.errors_logged || 0),
        sessions_recorded: Number(row.sessions_recorded || 0),
        api_calls: Number(row.api_calls || 0),
      },
      pricing: BILLING_PRICING,
      estimate: calculateEstimatedCost(row),
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));

    return res.status(200).json({
      message: "",
      data,
    });
  } catch (error) {
    console.error("Error getting billing history:", error);
    return res.status(500).json({ message: "Error getting billing history" });
  }
};

export const createCheckoutSession = async (req, res) => {
  const { projectId, planCode } = req.body || {};

  if (!projectId || !planCode) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const normalizedPlanCode = String(planCode).trim().toLowerCase();
  const selectedPlan = STRIPE_PLAN_CATALOG[normalizedPlanCode];

  if (!selectedPlan) {
    return res.status(400).json({
      message: "Invalid paid plan selected",
    });
  }

  const isProjectMember = await ProjectTeam.isProjectMember(projectId);
  if (!isProjectMember.length) {
    return res.status(404).json({ message: "Project not found!" });
  }

  try {
    const project = await Project.getById(projectId);
    const frontendBaseUrl = getFrontendBaseUrl(req);

    // Demo fallback: allow end-to-end purchase flow without Stripe setup.
    if (!process.env.STRIPE_SECRET_KEY) {
      const demoCheckoutId = `demo_${Date.now()}`;
      const demoSuccessUrl = `${frontendBaseUrl}/billing/success?projectId=${encodeURIComponent(
        projectId
      )}&plan=${encodeURIComponent(normalizedPlanCode)}&session_id=${encodeURIComponent(
        demoCheckoutId
      )}&demo=1`;

      return res.status(200).json({
        message: "Stripe key missing. Running in demo payment mode.",
        data: {
          id: demoCheckoutId,
          url: demoSuccessUrl,
          demo: true,
        },
      });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: selectedPlan.currency,
            unit_amount: selectedPlan.amount,
            recurring: {
              interval: selectedPlan.interval,
            },
            product_data: {
              name: `ErrorSnap ${selectedPlan.name} Plan`,
              description: `Project ${project?.name || projectId} - ${selectedPlan.name} monthly subscription`,
            },
          },
        },
      ],
      success_url: `${frontendBaseUrl}/billing/success?projectId=${encodeURIComponent(
        projectId
      )}&plan=${encodeURIComponent(normalizedPlanCode)}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendBaseUrl}/billing/cancel?projectId=${encodeURIComponent(
        projectId
      )}&plan=${encodeURIComponent(normalizedPlanCode)}`,
      metadata: {
        projectId: String(projectId),
        planCode: normalizedPlanCode,
        userId: String(req.errorsnapUser?.id || ""),
      },
    });

    return res.status(200).json({
      message: "",
      data: {
        id: session.id,
        url: session.url,
      },
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return res.status(500).json({ message: "Unable to create checkout session" });
  }
};
