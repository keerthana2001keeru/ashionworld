const express = require("express");
const { couponGet, postCoupon, removeCoupon, postCheckout, success, orders, singleOrder, adminOrders, downloadInvoice } = require("../controller/ordersController");
const { checkAuth } = require("../middlewares/auth");
const router = express.Router();

router.put("/user/getCoupon",checkAuth, couponGet)

router.post("/user/applyCoupon",checkAuth,  postCoupon);
router.post("/user/removeCoupon",checkAuth, removeCoupon);
router.post("/postCheckout", postCheckout);
router.get("/user/success",checkAuth, success);
router.get("/orders",checkAuth, orders);
router.get("/orders/:id", checkAuth, singleOrder);
router.get('/downloadInvoice/:orderId',downloadInvoice);

module.exports = router;