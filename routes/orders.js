const express = require("express");
const { couponGet, postCoupon, removeCoupon, postCheckout, success, orders, singleOrder, adminOrders } = require("../controller/ordersController");
const router = express.Router();

router.put("/user/getCoupon", couponGet)

router.post("/user/applyCoupon",  postCoupon);
router.post("/user/removeCoupon", removeCoupon);
router.post("/postCheckout", postCheckout);
router.get("/user/success", success);
router.get("/orders", orders);
router.get("/orders/:id",  singleOrder);


module.exports = router;