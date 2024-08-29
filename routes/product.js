const express = require("express");
const router = express.Router();


const productHandler = require("../helpers/product-helpers");
const {addProduct,getAddProduct, singleProduct,searchProduct, adminProduct, editproduct, editProduct, deleteProduct}= require("../controller/productController");


router.get('/add-product', getAddProduct);
   
router.post("/add-product",addProduct);

router.get("/view-products", adminProduct);
router.get("/editProduct/:id", editproduct);

router.post("/edit_product/:id", editProduct);
router.get("/deleteProduct/:id", deleteProduct);

//router.get("/shopDetails", singleProduct);
router.get("/product/:id", singleProduct) ; 
router.post("/user/search", searchProduct) ;
     




module.exports= router;