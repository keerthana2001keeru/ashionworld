const mongoose = require("mongoose");

const products = require("../models/productSchema");

module.exports={
    addProduct: async function (body,fileNames) {
        const { name, brand, category, price,description, countInStock,color,specification } = body;
        const productAdd = await products.create({
          name: name,
          brand: brand,
          category: category,
          description: description,
          price: price,
          color:color,
          specification:specification,
          countInStock: countInStock,
          image: fileNames.map(fileName => fileName),
        });
        return productAdd
      },
    getProduct: async function(proId){
      if (mongoose.Types.ObjectId.isValid(proId)) {
        const product=await products.findOne({_id: new mongoose.Types.ObjectId(proId) }).lean();
        return product;
      }else{
        throw new Error("Invalid Product ID");
    }},
    getRelatedProducts:async function (proId){
      if (mongoose.Types.ObjectId.isValid(proId)) {
        const currentProduct = await products.findOne({ _id: new mongoose.Types.ObjectId(proId) }).lean();
        if (!currentProduct) {
            throw new Error("Product not found");
        }
        const relatedProducts = await products.find({
          _id: { $ne: new mongoose.Types.ObjectId(proId) }, // exclude the current product
          $or: [
              { category: currentProduct.category },
              { brand: currentProduct.brand },
              { color: currentProduct.color }
          ]
      }).limit(2);
        return relatedProducts;
      }else{
        throw new Error("Invalid Product ID");
    }},
    getAllProducts:async function(){
        const allproducts= await products.find().lean();
        return allproducts;
    },
    getHomeProducts: async function(limit = 4) {
      const latestProducts = await products.find().sort({ createdAt: -1 }).limit(limit).lean();
      return latestProducts;
  },
  
    editProduct: async function (proId, body) {
      if (mongoose.Types.ObjectId.isValid(proId)) {
        const editProduct = await products.findByIdAndUpdate(proId, body, {
          new: true,
        });
        return editProduct;
      }else{
        throw new Error("invalid product Id");
      }
      },
    
      deleteProduct: async function (proId) {
        if (mongoose.Types.ObjectId.isValid(proId)) {
        const deleteProduct = await products.findByIdAndDelete(proId);
        return deleteProduct;
      }else{
        throw new Error("Invalid product ID");
      }},
    

     productSearch : async function (keyword) {
        try {
          // Use MongoDB's regex to perform a case-insensitive search in the product name and description fields
          const searchRegex = new RegExp(keyword, 'i');
      
          // Search for products that match the keyword in name, description, or category
          const searchResults = await products.find({
            $or: [
              { name: { $regex: searchRegex } },
              { description: { $regex: searchRegex } },
              { category: { $regex: searchRegex } },
            ]
          }).lean();
      
          return searchResults;
        } catch (error) {
          console.error("Error searching products:", error);
          return [];
        }
      }
      

}