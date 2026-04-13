import { nanoid } from "nanoid";
import path from "path";
import fs from "fs";
import ErrorsnapDb from "../classes/errorsnapdb.js";
import Project from "../classes/project.js";
import ProjectTeam from "../classes/projectTeam.js";
import Errorlog from "../classes/errorlog.js";

export const addProject = async (req, res) => {
  const user_id = req.errorsnapUser?.id;
  const { name, description = "" } = req.body;

  if (!name || !user_id) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const id = nanoid(8);
  const values = {
    id,
    user_id,
    name,
    description,
  };

  const prevProject = await Project.getProjectWithName(name);
  if (prevProject) {
    res.status(201).json({ message: "Already added a project with same name" });
    return;
  }

  try {
    const projectInserted = await ErrorsnapDb.insert("project", values);

    if (projectInserted) {
      const projectTeamInserted = await ProjectTeam.insert({
        project_id: id,
        user_id,
      });

      if (projectTeamInserted) {
        res.status(201).json({ message: "Project added successfully" });
      }
    }
  } catch (error) {
    res.status(500).json({ message: "Project add failed!" });
  }
};

export const getUserProjects = async (req, res) => {
  const filter = req.query?.filterBy ?? "";

  try {
    const results = await Project.getUserProjects(filter);
    res.status(201).json({ message: "", data: results });
  } catch (error) {
    res.status(500).json({ message: "Project get failed!" });
  }
};

export const getProjectById = async (req, res) => {
  const { projectId } = req.params;

  if (!projectId) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const isProjectMember = await ProjectTeam.isProjectMember(projectId);
  if (!isProjectMember.length) {
    return res.status(404).json({ message: "Project not found!" });
  }

  try {
    const results = await Project.getById(projectId);
    res.status(201).json({ message: "", data: results });
  } catch (error) {
    res.status(500).json({ message: "Project get failed!" });
  }
};

export const getUserProjectById = async (req, res) => {
  const { projectId } = req.params;

  try {
    const results = await Project.getUserProjectById(projectId);
    res.status(201).json({ message: "", data: results });
  } catch (error) {
    res.status(500).json({ message: "Project get failed!" });
  }
};

function deleteProjectSourceMaps(project) {
  const sourceMapsPath = path.join(
    "source-maps",
    String(project?.user_id),
    String(project?.id)
  );

  if (fs.existsSync(sourceMapsPath)) {
    fs.rmSync(sourceMapsPath, { recursive: true, force: true });
  }
}

export const deleteProject = async (req, res) => {
  const { projectId } = req.params;

  //check if this project is a logged in user project
  const project = await Project.getUserProjectById(projectId);
  if (!project.length) {
    return res.status(500).json({ message: "Project not found!" });
  }

  try {
    await Project.delete(projectId);

    // delete project errors
    await Errorlog.delete(projectId);

    // delete team members
    await ProjectTeam.deleteTeam(projectId);

    // delete source maps
    deleteProjectSourceMaps(project[0]);

    res.status(201).json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Project delete failed!" });
  }
};
