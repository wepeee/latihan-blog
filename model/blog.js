const mongoose = require("mongoose");

// Skema Blog
const Blog = mongoose.model("Blog", {
  title: {
    type: String,
    required: [true, "Title is required"], // Tambahkan pesan error opsional
  },
  detail: {
    type: String,
    required: true, // Pesan error opsional
  },
  author: {
    type: String,
    required: [true, "Author is required"], // Pesan error opsional
  },
});

module.exports = Blog;
