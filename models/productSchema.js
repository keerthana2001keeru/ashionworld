const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
     image: [
     {
      type: String,
         required: true,
      }],
    
    brand: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    price: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
    },
     specification: {
       type: String,
     
    },
    description: {
      type: String,
    },
    countInStock: {
      type: Number,
      required: true,
      min: [1, "Quantity must be above 1"],
      default: 0,
    },
    reviews: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        name: String, // Reviewer name
        rating: { type: Number, required: true },
        comment: {type:[String]},
        // reviewImage:{type:String} ,
        date: { type: Date, default: Date.now },
      },
    ],
    avgRating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },   
  },
   { timestamps: true }
);

const Product = mongoose.model("Products", productSchema);
module.exports = Product;