var express = require('express');
var router = express.Router();

const productHandler = require("../helpers/product-helpers");
const {adminProduct, addProduct}= require("../controller/productController");
const { adminLoginpage, adminLogin, getUsers, deleteUser, userDelete, getAddCoupon, addCoupons, viewCouponList, editcoupon, editCoupon, deleteCoupon, adminDashboard, getAddBanner, addBanner, adminBanner } = require('../controller/adminController');
const { adminOrders } = require('../controller/ordersController');
const { checkAdmin } = require('../middlewares/auth');


router.get("/adminLogin",adminLoginpage);
router.post('/adminLogin',adminLogin);

router.get('/adminDashboard',checkAdmin,adminDashboard);

 router.get('/userOrders',adminOrders);
 router.get('/userCoupons',checkAdmin,viewCouponList);
router.get('/add-coupon',checkAdmin,getAddCoupon)
router.post('/add-coupon',addCoupons);
router.get('/edit-coupon/:id',checkAdmin,editcoupon);
router.post('/edit-coupon/:id',editCoupon);
router.get('/deleteCoupon/:id', checkAdmin,deleteCoupon);
router.get ('/userData',checkAdmin,getUsers);
router.get("/delete-user/:id",checkAdmin, userDelete);
router.get("/add-banner",checkAdmin,getAddBanner);
router.get("/view-banner",checkAdmin, adminBanner);
router.post("/add-banner",addBanner)
module.exports = router;
 