import Project from "../classes/project.js";
import ProjectTeam from "../classes/projectTeam.js";
import Errorlog from "../classes/errorlog.js";

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";

/**
 * Generate code fix suggestions using Gemini API
 */
async function generateGeminiFixes(error) {
  if (!API_KEY) {
    return fallbackFixAnalysis(error);
  }

  try {
    const fixPrompt = `You are an expert software engineer. Analyze this runtime error and suggest practical code fixes.

Error Details:
- Message: ${error.message}
- Source: ${error.source}
- Line: ${error.lineno}, Column: ${error.colno}
- Browser: ${error.browser}
- OS: ${error.os}
- Environment: ${error.environment}
- Stack: ${error.stackTrace}

Provide fix suggestions in JSON format ONLY (no markdown, no extra text). Return exactly this structure:
{
  "fixes": [
    {
      "title": "Fix title/heading",
      "description": "What this fix does",
      "code_snippet": "const code = 'example';",
      "explanation": "Why this fix works",
      "risk_level": "low|medium|high",
      "implementation_steps": ["Step 1", "Step 2"],
      "affected_areas": ["area1", "area2"]
    }
  ],
  "root_cause": "Brief root cause analysis",
  "prevention_tips": ["Tip 1", "Tip 2"],
  "overall_difficulty": "easy|medium|hard"
}

Return valid JSON only.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fixPrompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 2000,
          },
        }),
      }
    );

    if (!response.ok) {
      console.error("Gemini API error:", response.status, response.statusText);
      return fallbackFixAnalysis(error);
    }

    const data = await response.json();
    const jsonText = extractJsonText(
      data.candidates?.[0]?.content?.parts?.[0]?.text || ""
    );
    const parsed = JSON.parse(jsonText);

    return {
      ...parsed,
      model: "Gemini AI",
      is_fallback: false,
    };
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return fallbackFixAnalysis(error);
  }
}

/**
 * Fallback fix analysis when Gemini is unavailable
 */
function fallbackFixAnalysis(error) {
  const message = error.message || "";
  const source = error.source || "";
  const fixes = [];

  // Null reference error
  if (message.includes("cannot read") || message.includes("undefined")) {
    fixes.push({
      title: "Add null/undefined check",
      description: "Verify the variable exists before accessing its properties",
      code_snippet:
        'if (variable && variable.property) {\n  // Use variable.property\n}',
      explanation: "Prevents access to undefined properties",
      risk_level: "low",
      implementation_steps: [
        "Check variable existence before use",
        "Use optional chaining (?.) if targeting modern browsers",
        "Add fallback values where needed",
      ],
      affected_areas: ["Null handling", "Error prevention"],
    });
  }

  // Type error
  if (message.includes("is not a function")) {
    fixes.push({
      title: "Verify function type",
      description: "Ensure the variable is actually a function before calling",
      code_snippet:
        'if (typeof variable === "function") {\n  variable();\n}',
      explanation: "Checks if variable is callable before invocation",
      risk_level: "low",
      implementation_steps: [
        "Add type check before calling",
        "Verify API/library exports",
        "Check import statements",
      ],
      affected_areas: ["Type checking", "Function calls"],
    });
  }

  // Syntax error
  if (message.includes("Unexpected token")) {
    fixes.push({
      title: "Fix syntax error",
      description: "Review the JavaScript syntax near the error location",
      code_snippet: "// Check brackets, parentheses, and semicolons\n// Use an editor with syntax highlighting",
      explanation: "Syntax errors prevent code execution",
      risk_level: "high",
      implementation_steps: [
        "Check matching brackets and parentheses",
        "Verify semicolons if required",
        "Use a linter (ESLint) to catch these early",
      ],
      affected_areas: ["Syntax", "Code structure"],
    });
  }

  // Generic suggestion
  if (fixes.length === 0) {
    fixes.push({
      title: "Review error context",
      description: "Check the error message and stack trace for clues",
      code_snippet:
        "// Add console.log for debugging\nconsole.log('Debug info:', errorContext);",
      explanation: "Logging helps identify the exact failure point",
      risk_level: "low",
      implementation_steps: [
        "Add console logs around the error location",
        "Check browser/server logs",
        "Review recent code changes",
      ],
      affected_areas: ["Debugging", "Error investigation"],
    });
  }

  return {
    fixes,
    root_cause: "Based on error pattern analysis (AI unavailable)",
    prevention_tips: [
      "Use TypeScript for type safety",
      "Add unit tests for edge cases",
      "Use a linter to catch errors early",
    ],
    overall_difficulty: "medium",
    model: "Heuristic Analysis",
    is_fallback: true,
  };
}

/**
 * Extract JSON from text response
 */
function extractJsonText(text) {
  // Try to find JSON block first
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch && jsonMatch[1]) {
    return jsonMatch[1].trim();
  }

  // Try to find raw JSON object
  const rawJsonMatch = text.match(/\{[\s\S]*\}/);
  if (rawJsonMatch) {
    return rawJsonMatch[0];
  }

  return text;
}

/**
 * Controller: Get fix suggestions for an error
 */
export async function getFixSuggestions(req, res) {
  try {
    const { errorId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Fetch error
    const errorLog = await Errorlog.selectById(errorId);
    if (!errorLog) {
      return res.status(404).json({ error: "Error not found" });
    }

    // Verify user has access to this project
    const teamMember = await ProjectTeam.selectByProjectIdUserId(
      errorLog.project_id,
      userId
    );
    if (!teamMember) {
      return res
        .status(403)
        .json({ error: "Access denied to this project" });
    }

    // Generate fixes
    const fixSuggestions = await generateGeminiFixes(errorLog);

    return res.status(200).json({
      success: true,
      data: fixSuggestions,
    });
  } catch (error) {
    console.error("Fix suggestion error:", error);
    return res.status(500).json({
      error: "Failed to generate fix suggestions",
      details: error.message,
    });
  }
}
