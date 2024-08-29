var express = require('express');
var router = express.Router();

const productHandler = require("../helpers/product-helpers");
const {adminProduct, addProduct}= require("../controller/productController");
const { adminLoginpage, adminLogin, getUsers, deleteUser, userDelete, getAddCoupon, addCoupons, viewCouponList, editcoupon, editCoupon, deleteCoupon } = require('../controller/adminController');



router.get("/adminLogin",adminLoginpage);
router.post('/adminLogin',adminLogin);
 router.get('/adminDashboard', (req,res)=>{
    return res.render("admin/adminDashboard")
 })
 router.get('/userOrders',(req,res)=>{
   return res.render("admin/orders")
 });
 router.get('/userCoupons',viewCouponList);
router.get('/add-coupon',getAddCoupon)
router.post('/add-coupon',addCoupons);
router.get('/edit-coupon/:id',editcoupon);
router.post('/edit-coupon/:id',editCoupon);
router.get('/deleteCoupon/:id', deleteCoupon);
router.get ('/userData',getUsers);
router.get("/delete-user/:id", userDelete);
module.exports = router;
 