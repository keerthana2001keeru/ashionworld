//const multer = require('multer');
const productHandler = require("../helpers/product-helpers");
const {upload} = require("../middlewares/multer");

const getAddProduct = function (req, res) {
  res.render("admin/add-product");
};

const addProduct = async function (req, res) {
  //const { upload } = require("../middlewares/multer");
  const uploadMiddleware = upload();

  uploadMiddleware(req, res, async (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error uploading file.");
    }
console.log(req.body);
console.log(req.files);
    const fileNames = req.files.map(file=>file.filename);
    const addedProduct = await productHandler.addProduct(req.body, fileNames);
    if (addedProduct) {
      res.redirect("/add-product");
    }
  });
};



const adminProduct = async function (req, res) {
    const products = await productHandler.getAllProducts();
    
    // const images = products?.image[0]
    // products.images = images
    res.render("admin/view-products", { products: products });
    console.log("prd",products)
  };
  
  const showProduct = async function (req, res) {
    const products = await productHandler.getAllProducts();
   console.log("pp",products);
  //  console.log("oo",products.image)
      let isUser = true;
      res.render("user/shop", { products: products, isUser });
  
      // res.render("user/products", { products: products });
    
  };

  const singleProduct = async function (req, res) {
    const productId = req.params.id;
    const product = await productHandler.getProduct(productId);
   console.log("pro",product);
      let isUser = true;
     return res.render("user/detailProduct", { product, isUser });
  
      // res.render("user/product", { product });
    }
    const searchProduct = async function (req, res) {
      try {
        const data = req.body.search;
        const products = await productHandler.productSearch(data)
        if(products.length>=1){
         
            let isUser = true;
            res.render("user/products", { products: products, isUser });
          
            // res.render("user/products", { products: products });
          }
        else{
          const noProduct = true
         
            let isUser = true
            res.render("user/products", { isUser, noProduct });
    
       
            res.render("user/products", { noProduct });
          }
        }
       catch (error) {
        logger.error({ message: "error searching product" });
      }
    };
    const editproduct = async function (req, res) {
      const proId = req.params.id;
      const product = await productHandler.getProduct(proId);
      res.render("admin/edit-product", { product: product });
    };
    const editProduct = async function (req, res) {
      try {
        const editedProduct = await productHandler.editProduct(
          req.params.id,
          req.body
        );
    
        if (editedProduct) {
          res.redirect("/view-products");
        }
      } catch (err) {
        res.status(404);
        console.log(err);
      }
    };
    const deleteProduct = async function (req, res) {
      try {
        const deletedProduct = await productHandler.deleteProduct(req.params.id);
        if (deletedProduct) {
          res.redirect("/view-products");
        }
      } catch (err) {
        res.status(404);
        res.json("error deleting product");
      }
    };

  module.exports ={
    addProduct,
    getAddProduct,
    adminProduct,
     showProduct,
    singleProduct,
    searchProduct,
    editProduct,
    editproduct,
    deleteProduct
    
  }