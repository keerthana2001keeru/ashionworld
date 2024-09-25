const mongoose = require("mongoose");

const couponSchema = mongoose.Schema({
  coupon_name: {
    type: String,
    required: true,
  },
  coupon_code: { 
    type: String, 
    required: true,
    unique:true, 
    uppercase: true 
  },
  totalPrice: {
    type: Number,
  },
  description: {
     type: String,
      required: true
     },
     lastUpdatedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
    lastUpdated: {
      type: Date,
      default: Date.now(),
    },
    usedUsers: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Users",
    },
 
  discount_value: { 
    type: Number 
  },
 
  valid_till: {
    type: Date,
    required:true
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },

 
}
,{timestamps: true});

module.exports = mongoose.model("Coupons", couponSchema);
