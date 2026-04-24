import Project from "../classes/project.js";
import ProjectTeam from "../classes/projectTeam.js";
import Errorlog from "../classes/errorlog.js";

const GEMINI_MODEL = "models/gemini-2.5-flash";
const GEMINI_API_BASES = ["https://generativelanguage.googleapis.com/v1beta"];
const GEMINI_MODEL_CANDIDATES = [
  "models/gemini-2.5-flash",
  "models/gemini-2.5-pro",
  "models/gemini-2.0-flash",
  "models/gemini-2.0-flash-001",
];

let cachedGeminiBase = "";
let cachedGeminiModel = "";

function normalizeModelName(model) {
  return String(model || "")
    .trim()
    .replace(/^models\//, "");
}

function buildModelCandidates() {
  const ordered = [];
  const seen = new Set();

  if (cachedGeminiModel) {
    ordered.push(cachedGeminiModel);
    seen.add(cachedGeminiModel);
  }

  for (const candidate of GEMINI_MODEL_CANDIDATES) {
    const normalized = normalizeModelName(candidate);
    if (!normalized || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    ordered.push(normalized);
  }

  return ordered;
}

function shouldTryNextModel(status, bodyText) {
  if (status === 404 || status === 429 || status === 503) {
    return true;
  }

  const text = String(bodyText || "").toLowerCase();
  return (
    text.includes("resource exhausted") ||
    text.includes("rate limit") ||
    text.includes("quota") ||
    text.includes("busy") ||
    text.includes("temporarily unavailable")
  );
}

async function callGemini({ apiBase, model, prompt, apiKey }) {
  const response = await fetch(
    `${apiBase}/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      }),
    },
  );

  const bodyText = await response.text();

  return {
    ok: response.ok,
    status: response.status,
    bodyText,
  };
}

function extractJsonText(text) {
  const trimmed = String(text || "").trim();
  const fenced = trimmed.match(/```json\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }

  const block = trimmed.match(/\{[\s\S]*\}/);
  return block?.[0]?.trim() || trimmed;
}

function parseJsonSafely(text, label) {
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`Gemini returned invalid JSON in ${label}`);
  }
}

async function generateGeminiExplanation(error) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key is not configured");
  }

  const prompt = `You are a senior software engineer analyzing a runtime error.
Return JSON only with these keys:
{
  "summary": string,
  "likely_cause": string,
  "explanation": string,
  "confidence": number,
  "key_signals": string[],
  "what_to_check": string[],
  "suggested_fixes": [
    {
      "title": string,
      "description": string,
      "risk_level": "low" | "medium" | "high",
      "implementation_steps": string[],
      "code_snippet": string
    }
  ]
}
Keep it concise and specific.

Error details:
- Message: ${error?.message || "Unknown"}
- Source: ${error?.source || "Unknown"}
- Line: ${error?.lineno ?? "unknown"}
- Column: ${error?.colno ?? "unknown"}
- Browser: ${error?.browser || "Unknown"}
- OS: ${error?.os || "Unknown"}
- Environment: ${error?.environment || "production"}
- Stack: ${(error?.stack || "").slice(0, 5000)}
`;

  const modelCandidates = buildModelCandidates();
  const baseCandidates = [...GEMINI_API_BASES];

  if (cachedGeminiBase) {
    baseCandidates.unshift(cachedGeminiBase);
  }

  let lastNon404Failure = "";

  for (const apiBase of baseCandidates) {
    for (const model of modelCandidates) {
      const result = await callGemini({ apiBase, model, prompt, apiKey });

      if (!result.ok) {
        console.error("Gemini error:", {
          apiBase,
          model,
          status: result.status,
          body: result.bodyText,
        });
      }

      if (result.ok) {
        cachedGeminiBase = apiBase;
        cachedGeminiModel = model;

        const payload = parseJsonSafely(
          result.bodyText || "{}",
          "response body",
        );
        const contentText =
          payload?.candidates?.[0]?.content?.parts?.[0]?.text || "";

        if (!contentText) {
          throw new Error("Gemini returned an empty response");
        }

        const parsed = parseJsonSafely(
          extractJsonText(contentText),
          "model content",
        );
        const suggestedFixes = Array.isArray(parsed.suggested_fixes)
          ? parsed.suggested_fixes
              .filter((fix) => fix && typeof fix === "object")
              .map((fix) => ({
                title: String(fix.title || "Untitled fix"),
                description: String(fix.description || ""),
                risk_level:
                  fix.risk_level === "high" || fix.risk_level === "medium"
                    ? fix.risk_level
                    : "low",
                implementation_steps: Array.isArray(fix.implementation_steps)
                  ? fix.implementation_steps.map((step) => String(step))
                  : [],
                code_snippet: String(fix.code_snippet || ""),
              }))
          : [];

        return {
          model,
          generated_at: new Date().toISOString(),
          summary: String(parsed.summary || ""),
          likely_cause: String(parsed.likely_cause || ""),
          explanation: String(parsed.explanation || ""),
          confidence: Number(parsed.confidence) || 0,
          key_signals: Array.isArray(parsed.key_signals)
            ? parsed.key_signals.map((signal) => String(signal))
            : [],
          what_to_check: Array.isArray(parsed.what_to_check)
            ? parsed.what_to_check.map((item) => String(item))
            : [],
          suggested_fixes: suggestedFixes,
        };
      }

      if (!shouldTryNextModel(result.status, result.bodyText)) {
        lastNon404Failure = `status=${result.status}`;
        break;
      }
    }
  }

  if (lastNon404Failure) {
    throw new Error(`Gemini request failed (${lastNon404Failure})`);
  }

  throw new Error(
    `Gemini model not available. Tried: ${modelCandidates.join(", ")}`,
  );
}

export const getErrorAnalysis = async (req, res) => {
  try {
    const { errorId } = req.params;

    if (!errorId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const error = await Errorlog.selectById(errorId);
    if (!error) {
      return res.status(404).json({ message: "Error not found" });
    }

    const team = await ProjectTeam.selectByProjectIdUserId(
      error.project_id,
      req.errorsnapUser?.id,
    );

    if (!team) {
      return res.status(403).json({ message: "Access denied" });
    }

    const project = await Project.getById(error.project_id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    let analysis = null;

    try {
      analysis = await generateGeminiExplanation(error);
    } catch (analysisError) {
      console.error("Error generating analysis:", analysisError);
      return res
        .status(500)
        .json({ message: "Failed to generate error analysis" });
    }

    return res.status(200).json({
      message: "",
      data: {
        ...analysis,
        error_id: error.id,
        project_id: error.project_id,
        browser: error.browser,
        os: error.os,
        environment: error.environment,
      },
    });
  } catch (error) {
    console.error("Error preparing analysis request:", error);
    return res
      .status(500)
      .json({ message: "Failed to generate error analysis" });
  }
};
