import multer from "multer";
import path from "path";
import fs from "fs";
import Project from "../classes/project.js";
import SourcemapHistory from "../classes/sourcemapHistory.js";

export const upload = multer({
  dest: "temp-uploads/",
  fileFilter: function (req, file, cb) {
    if (file.originalname.endsWith(".map")) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
});

export const uploadSourceMaps = async function (req, res) {
  const projectId = req.body.projectId;

  if (!projectId) {
    return res.status(400).json({ message: "Missing projectId field" });
  }

  const project = await Project.getById(projectId);
  if (!project) {
    return res.status(400).json({ message: "No project found" });
  }

  const finalPath = path.join(
    "source-maps",
    String(project?.user_id),
    String(project?.id)
  );
  // delete previous source maps if they exist
  if (fs.existsSync(finalPath)) {
    fs.readdirSync(finalPath).forEach((file) => {
      const filePath = path.join(finalPath, file);
      if (fs.lstatSync(filePath).isFile()) {
        fs.unlinkSync(filePath);
      }
    });
  }
  fs.mkdirSync(finalPath, { recursive: true });

  const movedFiles = req.files.map((file) => {
    const destPath = path.join(finalPath, file.originalname);
    fs.renameSync(file.path, destPath);
    return {
      originalname: file.originalname,
      path: destPath.replace(/\\/g, "/"),
    };
  });

  await SourcemapHistory.create({
    project_id: projectId,
  });

  res.status(200).json({
    message: "Source maps uploaded successfully!",
    files: movedFiles,
  });
};
