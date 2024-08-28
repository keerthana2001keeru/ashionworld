const mongoose =require("mongoose")
const adminSchema = new mongoose.Schema({
 name:{
    type:String,
    required:true,
    trim:true,
    minlength: [3, "Full name must be at least 3 characters long"],
    maxlength: [64, "Full name cannot be longer than 64 characters"]
  
 },
  email:{
    type:String,
    required:true,
    trim:true,
   
  },
  password:{
    type:String,
    required:true
  },
 
})

module.exports = mongoose.model("Admin", adminSchema);
