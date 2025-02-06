const mongoose = require("./db");

const projectSchema = new mongoose.Schema({
  name: String,
  description: String,
  link: String,
  img: {
    data: Buffer,
    contentType: String,
  },
});

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
