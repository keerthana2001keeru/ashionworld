const mongoose = require("mongoose");

const bannerSchema = mongoose.Schema({
  
     image: [
     {
      type: String,
         required: true,
      }],
 
  },
   { timestamps: true }
);

const Banner = mongoose.model("Banner", bannerSchema);
module.exports = Banner;