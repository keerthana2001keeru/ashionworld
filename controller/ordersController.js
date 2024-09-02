//const cart = require("../helpers/cart");
const Order = require("../models/orderSchema");

const { logger } = require("../utils/logger");
const orderHandler = require("../helpers/orderHelper");
const userHandler = require("../helpers/userHelper");

// const deleteCart = require("../helpers/cart")

/*************************************************CART*************************************************************/

const adminOrders = async function (req, res) {
  const orders = await orderHandler.getAllOrder();
  console.log("oo",orders)
  res.render("admin/orders", { orders: orders });
};

///////////////////////////////////////////////////////////////CHECKOUT/////////////////////////////////////////////////////

// const getCheckout = async function (req, res) {
//   const userId = req.session.userid;
//   let isUser = true;
//   let user = await userHandler.getCart(userId);
//   console.log("user",user)
//   let coupon = await orderHandler.getCoupon(user.totalPrice);
//   if (user.cart.coupon) {
//     const eligibleCoupon = await orderHandler.showCoupon(user.cart.coupon.code);
//     if(user.totalPrice < eligibleCoupon.totalPrice){
//       user = await userHandler.couponRemove(userId)
//       coupon = []
//     }
//   }
//   console.log("tt",user.totalPrice)
//   if (user.cart.cart) {
//     let totalPrice;

//     const address = user.cart.address[0];
//     console.log("tt",user.totalPrice)
//     if (coupon.length < 1) {
//       totalPrice = user.totalPrice;
//       console.log("tt",totalPrice)
//       const subTotal = totalPrice;
//       const discount = 0;
//       if (totalPrice < 500) {
//         res.render("user/checkout", {
//           isUser,
//           user: user,
//           totalPrice,
//           message: "cannot order below ₹500",
//         });
//       } else {
//         res.render("user/checkout", {
//           isUser,
//           user: user,
//           totalPrice,
//           subTotal,
//           address,
//           discount,
//         });
//       }
//     } else {
//       //  coupon = coupon[0]
//       if (user.cart.coupon) {
//         totalPrice = user.totalPrice - user.cart.coupon.discount;
//         const subTotal = user.totalPrice;
//         const code = user.cart.coupon.code;
//         const discount = user.cart.coupon.discount;
//         // const discount = coupon[0].discount
//         res.render("user/checkout", {
//           isUser,
//           user: user,
//           totalPrice,
//           subTotal,
//           address,
//           coupon,
//           couponCode: code,
//           discount,
//         });
//       } else {
//         totalPrice = user.totalPrice;
//         const subTotal = totalPrice;
//         discount = 0;
//         res.render("user/checkout", {
//           isUser,
//           user: user,
//           totalPrice,
//           subTotal,
//           address,
//           coupon,
//           discount,
//         });
//       }
//     }
//   } else {
//     res.redirect("/cart");
//   }
// };

const deleteProductCheckout = async function (req, res) {
  cart.deleteCartProduct(req.session.userid, req.params.id).then(() => {
    res.redirect("/checkout");
  });
};

const postCheckout = async function (req, res) {
  try {
    const userId = req.session.userid;
    const user = await userHandler.getCart(userId);
    const cart = user.cart.cart;
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
    // logger.error({ message: "error post checkout", error });
  }
};

const verifyPayment = async function (req, res) {
  const userId = req.session.userid;
  const paymentId = req.body["payment[razorpay_payment_id]"];
  const orderId = req.body["payment[razorpay_order_id]"];
  const signature = req.body["payment[razorpay_signature]"];

  let hmac = crypto.createHmac("sha256", process.env.KEY_SECRET);
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
