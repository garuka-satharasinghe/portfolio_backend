const express = require("express");
const multer = require("multer");
const app = express();
const port = process.env.PORT || 5000;

require("dotenv").config();
require("./db");

app.use(express.json());

const cors = require("cors");
const cookieParser = require("cookie-parser");
app.use(cors({
  origin: "https://garuka-satharasinghe.vercel.app", 
  credentials: true
}));
app.use(cookieParser());

const Project = require("./Project");
const Blog = require("./Blog");

const authRoutes = require("./routes/auth");
app.use(authRoutes);

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
    const blogsWithBase64Images = blogs.map((blog) => {
      if (blog.img && blog.img.data) {
        return {
          ...blog._doc,
          img: {
            data: blog.img.data.toString("base64"),
            contentType: blog.img.contentType,
          },
        };
      } else {
        return {
          ...blog._doc,
          img: null,
        };
      }
    });
    res.json(blogsWithBase64Images);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/blogs", upload.single("img"), async (req, res) => {
  const blog = new Blog({
    title: req.body.title,
    content: req.body.content,
    link: req.body.link,
    img: req.file ? {
      data: req.file.buffer,
      contentType: req.file.mimetype,
    } : undefined,
  });

  try {
    const newBlog = await blog.save();
    res.status(201).json(newBlog);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.patch("/blogs/:id", upload.single("img"), async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (blog) {
      blog.title = req.body.title || blog.title;
      blog.content = req.body.content || blog.content;
      blog.link = req.body.link || blog.link;
      if (req.file) {
        blog.img = {
          data: req.file.buffer,
          contentType: req.file.mimetype,
        };
      }
      const updatedBlog = await blog.save();
      res.json(updatedBlog);
    } else {
      res.status(404).json({ message: "Blog not found" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete("/blogs/:id", async (req, res) => {
  try {
    const result = await Blog.findByIdAndDelete(req.params.id);
    if (result) {
      res.json({ message: "Blog deleted" });
    } else {
      res.status(404).json({ message: "Blog not found" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
