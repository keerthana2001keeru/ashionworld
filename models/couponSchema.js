const mongoose = require("mongoose");

const couponSchema = mongoose.Schema({
  coupon_name: {
    type: String,
    required: true,
  },
  coupon_code: { 
    type: String, 
    required: true, 
    uppercase: true 
  },
  description: {
     type: String,
      required: true
     },
  // discount_type: {
  //   type: String,
  //   enum: ["free_shipping", "percentage", "fixed_amount"],
  // },
  discount_value: { 
    type: Number 
  },
  // minimum_purchase_value: {
  //    type: Number,
  //     required: true,
  //      default: 0 
  //     },
  // maximum_purchase_value: {
  //    type: Number, 
  //    required: true, 
  //    default: 0 
  //   },
  valid_till: Date,
  isActive: { 
    type: Boolean, default: false 
  },

  // lastUpdated: {
  //   type: Date,
  //   default: Date.now(),
  // },
  // usedUsers: {
  //   type: [mongoose.Schema.Types.ObjectId],
  //   ref: "Users",
  // },
  // expire: {
  //   type: Date,
  //   required: true,
  // },
}
,{timestamps: true});

module.exports = mongoose.model("Coupons", couponSchema);
