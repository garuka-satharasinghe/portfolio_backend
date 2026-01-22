const mongoose = require("./db");

const blogSchema = new mongoose.Schema({
  title: String,
  content: String,
  link: String,
  img: {
    data: Buffer,
    contentType: String,
  },
});

const Blog = mongoose.model("Blog", blogSchema);

module.exports = Blog;
