const mongoose = require("mongoose");

const logoSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
  },
  path: {
    type: String,
    required: true,
  },
  uploadDate: {
    type: Date,
    default: Date.now,
  },
});

const Logo = mongoose.model("Logo", logoSchema);
module.exports = Logo;
