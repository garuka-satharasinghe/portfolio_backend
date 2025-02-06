const express = require("express");
const multer = require("multer");
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

const cors = require("cors");
app.use(cors());

require("dotenv").config();
const Project = require("./Project");
const Blog = require("./Blog");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.get("/projects", async (req, res) => {
  try {
    const projects = await Project.find();
    const projectsWithBase64Images = projects.map((project) => {
      if (project.img && project.img.data) {
        console.log(
          "Converting image data to Base64 for project:",
          project.name
        );
        return {
          ...project._doc,
          img: {
            data: project.img.data.toString("base64"),
            contentType: project.img.contentType,
          },
        };
      } else {
        console.log("No image data found for project:", project.name);
        return {
          ...project._doc,
          img: null,
        };
      }
    });
    res.json(projectsWithBase64Images);
  } catch (err) {
    console.error("Error fetching projects:", err);
    res.status(500).json({ message: err.message });
  }
});

app.post("/projects", upload.single("img"), async (req, res) => {
  const project = new Project({
    name: req.body.name,
    description: req.body.description,
    link: req.body.link,
    img: {
      data: req.file.buffer,
      contentType: req.file.mimetype,
    },
  });

  try {
    const newProject = await project.save();
    res.status(201).json(newProject);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.patch("/projects/:id", upload.single("img"), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (project) {
      project.name = req.body.name || project.name;
      project.description = req.body.description || project.description;
      project.link = req.body.link || project.link;
      if (req.file) {
        project.img = {
          data: req.file.buffer,
          contentType: req.file.mimetype,
        };
      }
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
