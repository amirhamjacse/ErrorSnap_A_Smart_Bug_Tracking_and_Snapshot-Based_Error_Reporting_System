import Project from "../classes/project.js";
import ProjectTeam from "../classes/projectTeam.js";
import Errorlog from "../classes/errorlog.js";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";

function fallbackAnalysis(error) {
  const stack = String(error?.stack || "");
  const message = String(error?.message || "Unknown error");
  const source = error?.source || "Unknown source";
  const browser = error?.browser || "Unknown browser";
  const os = error?.os || "Unknown OS";

  const likelyCause =
    stack.toLowerCase().includes("cannot read") ||
    stack.toLowerCase().includes("undefined")
      ? "The code is likely reading a value before it exists or accessing a missing property."
      : stack.toLowerCase().includes("network")
      ? "The request or API call may be failing because the backend, URL, or CORS configuration is unavailable."
      : "The error appears to come from a runtime exception in the referenced source file.";

  return {
    model: "heuristic-fallback",
    used_fallback: true,
    generated_at: new Date().toISOString(),
    summary: `This error is happening in ${source} on ${browser} / ${os}.`,
    likely_cause: likelyCause,
    explanation: `The reported message is "${message}". Review the stack trace and the code at ${source} near line ${error?.lineno || "unknown"} and column ${error?.colno || "unknown"}.`,
    confidence: 55,
    key_signals: [
      `Browser: ${browser}`,
      `OS: ${os}`,
      `Environment: ${error?.environment || "production"}`,
      `Source: ${source}`,
    ],
    fix_steps: [
      "Inspect the exact code path referenced in the stack trace.",
      "Check for null, undefined, or missing async data before use.",
      "Reproduce the issue with the same browser and environment.",
      "Verify the deployment or API response if the error is network-related.",
    ],
    what_to_check: [
      `Line ${error?.lineno || "unknown"} and column ${error?.colno || "unknown"} in ${source}`,
      "Recent code changes in the same file or feature area",
      "Whether a dependency or API response changed recently",
    ],
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

async function generateGeminiExplanation(error) {
  if (!process.env.GEMINI_API_KEY) {
    return fallbackAnalysis(error);
  }

  const prompt = `You are a senior software engineer explaining a runtime error to a developer.
Return JSON only with these keys:
{
  "summary": string,
  "likely_cause": string,
  "explanation": string,
  "confidence": number,
  "key_signals": string[],
  "fix_steps": string[],
  "what_to_check": string[]
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
- Stack: ${error?.stack || "No stack available"}
`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`,
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
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini request failed with status ${response.status}`);
    }

    const payload = await response.json();
    const contentText = payload?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const parsed = JSON.parse(extractJsonText(contentText));
    const fallback = fallbackAnalysis(error);

    return {
      model: GEMINI_MODEL,
      used_fallback: false,
      generated_at: new Date().toISOString(),
      summary: parsed.summary || fallback.summary,
      likely_cause: parsed.likely_cause || fallback.likely_cause,
      explanation: parsed.explanation || fallback.explanation,
      confidence: Number(parsed.confidence) || 70,
      key_signals: Array.isArray(parsed.key_signals) ? parsed.key_signals : fallback.key_signals,
      fix_steps: Array.isArray(parsed.fix_steps) ? parsed.fix_steps : fallback.fix_steps,
      what_to_check: Array.isArray(parsed.what_to_check) ? parsed.what_to_check : fallback.what_to_check,
    };
  } catch (error) {
    return fallbackAnalysis(error);
  }
}

export const getErrorExplanation = async (req, res) => {
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
      req.errorsnapUser?.id
    );

    if (!team) {
      return res.status(403).json({ message: "Access denied" });
    }

    const project = await Project.getById(error.project_id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const analysis = await generateGeminiExplanation(error);

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
    console.error("Error generating explanation:", error);
    return res.status(500).json({ message: "Failed to generate explanation" });
  }
};
