//const cart = require("../helpers/cart");
const Order = require("../models/orderSchema");

const { logger } = require("../utils/logger");
const orderHandler = require("../helpers/orderHelper");
const userHandler = require("../helpers/userHelper");

// const deleteCart = require("../helpers/cart")



const adminOrders = async function (req, res) {
  const orders = await orderHandler.getAllOrder();
  console.log("oo",orders)
  res.render("admin/orders", { orders: orders });
};



const deleteProductCheckout = async function (req, res) {
  cart.deleteCartProduct(req.session.userid, req.params.id).then(() => {
    res.redirect("/checkout");
  });
};

const postCheckout = async function (req, res) {
  try {
    console.log("checkout",req.body);
    const userId = req.session.userid;
    const user = await userHandler.getCart(userId);
    const cart = user.cart.cart;
    console.log("ccc",cart);
    if (user) {
      // await userHelper.addAddress(req.body, userId);
      if (req.body.payment == "COD") {
        const statuses = {
          orderStatus: "placed",
          payStatus: "pending",
        };
        const newOrder = await orderHandler.createOrder(
          userId,
          req.body.couponId,
          cart,
          req.body,
          statuses
        );
        const updateCoupon = await orderHandler.updateCoupon(
          req.body.couponId,
          userId
        );
        await userHandler.couponRemove(userId)
        res.json(newOrder);
      } else if (req.body.payment == "razorPay") {
        const statuses = {
          orderStatus: "pending",
          payStatus: "pending",
        };

        const order = await orderHandler.createOrder(
          userId,
          req.body.couponId,
          cart,
          req.body,
          statuses
        );
        console.log("object",order);
        if (order) {
          try {
            const orderInstance = await orderHandler.generateRazorPay(
              order._id,
              order.totalPrice
            );
            res.json(orderInstance);
          } catch (error) {
            console.log(error);
          }
        }
      }
    }
  } catch (error) {
    console.log(error);
     logger.error({ message: "error post checkout", error });
  }
};

const verifyPayment = async function (req, res) {
  const userId = req.session.userid;
  const paymentId = req.body["payment[razorpay_payment_id]"];
  const orderId = req.body["payment[razorpay_order_id]"];
  const signature = req.body["payment[razorpay_signature]"];

  let hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
  hmac.update(orderId + "|" + paymentId);
  const generatedSignature = hmac.digest("hex");

  if (generatedSignature == signature) {
    try {
      const orderIdToUpdate = req.body["order[receipt]"];
      // const updatedOrder = await Order.findByIdAndUpdate(
      //   orderIdToUpdate,
      //   { status: "placed" },
      //   { new: true }
      // );
      const statuses = {
        orderStatus: "placed",
        payStatus: "success",
      };
      const updatedOrder = await orderHelper.updateOrder(
        orderIdToUpdate,
        statuses,
        userId,
        orderId
      );
      await userHelper.couponRemove(userId)
      return res.json({ status: true });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ status: "Payment failed" });
    }
  } else {
    logger.log("payment failed: signatures does not match");
    return res
      .status(403)
      .json({ status: "Payment failed: Signatures do not match" });
  }
};

const success = async function (req, res) {
  res.render("user/success");
};

const failed = async function (req, res) {
  res.render("user/failed");
};

const couponGet = async function (req, res) {
  const userId = req.session.userid;
  console.log("ddddddd",userId)
  const user = await userHandler.findUserById(userId);
  if (user.coupon) {
    const code = user.coupon.code;
    console.log("code",code);
    //res.json({ code });
  } else {
    const code = null;
    res.json({ code });
  }
};

const postCoupon = async function (req, res) {
  const userId = req.session.userid;
  const couponCode = req.body.couponId;
  const coupon = await orderHandler.showCoupon(couponCode);
  if (coupon) {
    const updatedCoupon = await userHandler.updateCoupon(
      userId,
      couponCode,
      coupon.discount
    );
    const discount = coupon.discount;
    const code = coupon.code;
    const price = await userHandler.getCart(userId);
    const totalPrice = price.totalPrice - discount;
    res.json({ totalPrice, discount, code });
  } else {
    res.json({ message: "error" });
  }
};

const removeCoupon = async function (req, res) {
  const userId = req.session.userid;
  const couponCode = req.body.couponCode;
  const coupon = await orderHandler.showCoupon(couponCode);
  if (coupon) {
    const removedCoupon = await userHandler.couponRemove(
      userId,
      couponCode,
      coupon.discount
    );
    const price = await userHandler.getCart(userId);
    const totalPrice = price.totalPrice;
    const discount = 0;
    res.json({ totalPrice, discount, couponCode });
  }
};

const orders = async function (req, res) {
  const userId = req.session.userid;
  let isUser = true;
  let orders = await orderHandler.getOrder(userId);
  orders = orders.reverse();
  console.log("orders",orders);
  res.render("user/orders", { orders: orders, isUser });
};

const singleOrder = async function (req, res) {
  const orderId = req.params.id;

  const user = await userHandler.findUserById(req.session.userid);
  const order = await orderHandler.getSingleOrder(orderId);
  res.render("user/single-order", { order: order, user: user, isUser: true });
};

const deleteOrder = async function (req, res) {
  const deletedOrder = await orderHandler.cancelOrder(req.params.id);
  res.redirect("/admin/orders");
};

module.exports = {
  // addToCart,

  // getCheckout,
  deleteProductCheckout,
  postCheckout,
  verifyPayment,
  adminOrders,
  success,
  failed,
  postCoupon,
  orders,
  singleOrder,
  deleteOrder,
  couponGet,
  removeCoupon,
};
