const mongoose = require("mongoose");

const products = require("../models/productSchema");

module.exports={
    addProduct: async function (body,fileNames) {
        const { name, brand, category, price,description, countInStock } = body;
        const productAdd = await products.create({
          name: name,
          brand: brand,
          category: category,
          description: description,
          price: price,
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
    getAllProducts:async function(){
        const allproducts= await products.find().lean();
        return allproducts;
    },
    getHomeProducts:async function(){
      const allproducts= await products.find().lean();
      return allproducts;
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