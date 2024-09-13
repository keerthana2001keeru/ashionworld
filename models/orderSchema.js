const mongoose = require("mongoose");

const orderSchema = mongoose.Schema(
  {
    userid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderid:{
      type: String
    },
    shippingAddress: {
      houseName: {
        type: String,
        required: true,
      },
      street: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      pincode: {
        type: Number,
        required: true,
      },
    },
    products: [
      {
        product_id: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Products",
        },
        quantity: { type: Number, required: true },
        
      },
    ],

    phone: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum:['Pending','Placed','Packed','Out for Delivery','Delivered','Cancelled'],
      default: "pending",
    },
   coupon:{
    code:{type:String},
    discount:{type:Number},
   },
    totalPrice: {
      type: Number,
      required: true,
    },
    payment: {
      paymentType: String,
      paymentId: String,
      paymentStatus: String,
    },
    // placedDate: Date,
    // packedDate: Date,
    // outForDeliveryDate: Date,
    // deliveredDate: Date,
    orderedDate: { type: Date, default: Date.now() },
  }
  // { timestamps: true }
);

const Order = mongoose.model("Orders", orderSchema);

module.exports = Order;
