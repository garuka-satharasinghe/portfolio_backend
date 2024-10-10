const express = require("express");
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

const cors = require("cors");
app.use(cors());

require("dotenv").config();
const Project = require("./Project");
const Blog = require("./Blog");

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.get("/projects", async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/projects", async (req, res) => {
  const project = new Project(req.body);

  try {
    const newProject = await project.save();
    res.status(201).json(newProject);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.patch("/projects/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (project) {
      project.set(req.body);
      const updatedProject = await project.save();
      res.json(updatedProject);
    } else {
      res.status(404).json({ message: "Project not found" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete("/projects/:id", async (req, res) => {
  try {
    const result = await Project.findByIdAndDelete(req.params.id);
    if (result) {
      res.json({ message: "Project deleted" });
    } else {
      res.status(404).json({ message: "Project not found" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/blogs", async (req, res) => {
  try {
    const blogs = await Blog.find();
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
