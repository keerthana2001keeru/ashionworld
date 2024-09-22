const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
 
recipient_name: { 
  type: String,
   required: true 
},
street_address_line1: {
   type: String,
    required: true
   }, 
street_address_line2: { 
  type: String 
},
city: {
   type: String,
    required: true
   },
postal_code: {
   type: String,
    required: true
   },
mobile : {
  type: String,
   required: true
  },
is_deleted : {
  type: Boolean,
   default : false
  }
},{timestamps: true});



const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "please enter your name"],
      minlength: [3, "Full name must be at least 3 characters long"],
      maxlength: [64, "Full name cannot be longer than 64 characters"],
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function (v) {
          return /^[0-9]{8,12}$/.test(v) && !/^0+$/.test(v);
        },
        message: "Phone number must be between 8 to 12 digits and cannot be all zeros"
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minLength: [3, "please enter a valid email"],
      maxLength: [64, "Please enter a valid email"],
      validate: {
        validator: function (v) {
          return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
        },
        message: "Please enter a valid email",
      },
    },
    password: {
      type: String,
      required: true,
      minLength: [4, "Password should be greater than 4 characters"],
    },
    resetPasswordToken:{
      type:String,
    },
    resetPasswordExpires:{
      type:Date
    },
    googleId: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    
    status: {
      type: String,
      default: "active",
    },
    address: [addressSchema],
    role: {
      type: String,
      default: "user",
    },
    cart: [
      {
        product_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Products",
          index: true,
        },
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],
    wishlist: [
      {
        product_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Products",
        },
      },
    ],
    coupon: {
      code: String,
      discount: Number
    },
    isVerified:{
      type: Boolean,
      default: true  
    },
  },
  { timestamps: true }
);

   
  

//const Address = mongoose.model("Address", addressSchema);
const User =  mongoose.model("User", userSchema)
module.exports = { User };

