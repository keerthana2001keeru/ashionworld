const express = require("express");
const router = express.Router();


const productHandler = require("../helpers/product-helpers");
const {addProduct,getAddProduct, singleProduct,searchProduct, adminProduct, editproduct, editProduct, deleteProduct, getCheckout, submitReview}= require("../controller/productController");
const { checkAdmin } = require("../middlewares/auth");


router.get('/add-product',checkAdmin, getAddProduct);
   
router.post("/add-product",checkAdmin,addProduct);

router.get("/view-products",checkAdmin, adminProduct);
router.get("/editProduct/:id",checkAdmin, editproduct);

router.post("/edit_product/:id", editProduct);
router.get("/deleteProduct/:id", deleteProduct);

//router.get("/shopDetails", singleProduct);
router.get("/product/:id", singleProduct) ; 
router.post("/user/search", searchProduct) ;
     
router.get("/checkout", getCheckout);

router.get('/search',searchProduct);

router.post('/submitReview',submitReview)

module.exports= router;