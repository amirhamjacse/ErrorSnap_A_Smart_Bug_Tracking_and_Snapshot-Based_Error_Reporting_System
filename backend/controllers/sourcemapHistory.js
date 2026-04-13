import SourcemapHistory from "../classes/sourcemapHistory.js";

export const getAllHistory = async function (req, res) {
  const { projectId } = req.params;

  try {
    const result = await SourcemapHistory.getByProjectId(projectId);
    res.status(201).json({
      message: "",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch sourcemap history",
      error: error.message,
    });
  }
};
