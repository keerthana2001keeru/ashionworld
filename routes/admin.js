var express = require('express');
var router = express.Router();
const productHandler = require("../helpers/product-helpers");
const {adminProduct, addProduct}= require("../controller/productController");
const { adminLoginpage, adminLogin, getUsers, deleteUser, userDelete, getAddCoupon, addCoupons, viewCouponList, editcoupon, editCoupon, deleteCoupon, adminDashboard, getAddBanner, addBanner, adminBanner, getUserNavbar, userNavbar } = require('../controller/adminController');
const { adminOrders } = require('../controller/ordersController');
const { checkAdmin } = require('../middlewares/auth');
const Order = require('../models/orderSchema');
const { updateUserStatus } = require('../helpers/userHelper');


//admin login
router.get("/adminLogin",adminLoginpage);
router.post('/adminLogin',adminLogin);
//admin dashboard
router.get('/adminDashboard',adminDashboard);
//user logo
router.get('/userNavbar',checkAdmin,getUserNavbar);
router.post('/userNavbar',checkAdmin,userNavbar)
//user orders
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
router.post("/add-banner",addBanner) ;
// Route to update order status
// router.post('/updateOrderStatus', async (req, res) => {
//     try {
//       const { orderId, status } = req.body;
  
//       // Update the order status in the database
//       await Order.findByIdAndUpdate(orderId, { status });
  
//       res.json({ success: true, message: 'Order status updated successfully!' });
//     } catch (error) {
//       res.status(500).json({ success: false, message: 'Error updating order status' });
//     }
//   });
  
  // Route to get shipping address (optional for AJAX)
//   router.get('/getShippingAddress/:orderId', async (req, res) => {
//     try {
//       const order = await Order.findById(req.params.orderId);
  
//       res.json({ success: true, address: order.shippingAddress });
//     } catch (error) {
//       res.status(500).json({ success: false, message: 'Error fetching shipping address' });
//     }
//   });
  router.post('/order/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
  console.log("object",req.body);
    try {
      await Order.findByIdAndUpdate(id, { status });
      //res.json({ success: true });
      res.redirect('/admin/userOrders')
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to update order status' });
    }
  });
  
module.exports = router;
 