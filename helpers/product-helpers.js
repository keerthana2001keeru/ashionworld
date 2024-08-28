
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
        const product=await products.findOne({_id:proId}).lean();
        return product;
    },
    getAllProducts:async function(){
        const allproducts= await products.find().lean();
        return allproducts;
    },
    editProduct: async function (proId, body) {
        const editProduct = await products.findByIdAndUpdate(proId, body, {
          new: true,
        });
        return editProduct;
      },
    
      deleteProduct: async function (proId) {
        const deleteProduct = await products.findByIdAndDelete(proId);
        return deleteProduct;
      },
      productSearch: async function (data) {
        const result = await products.find({
          name: { $regex: `^${data}`, $options: "i" },
        }).lean();
        return result;
      },



}