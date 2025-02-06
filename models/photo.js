const mongoose = require("mongoose");

const photoSchema = new mongoose.Schema({
  title: String,
  description: String,
  img: {
    data: Buffer,
    contentType: String,
  },
});

module.exports = mongoose.model("Photo", photoSchema);
