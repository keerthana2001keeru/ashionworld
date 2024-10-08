const Razorpay = require("razorpay");
const Order = require("../models/orderSchema");
const userHandler = require("../helpers/userHelper");
const User = require("../models/userSchema");
const Product = require("../models/productSchema");
const Coupons = require("../models/couponSchema");
const { logger } = require("../utils/logger");

 var instance = new Razorpay({
   key_id: process.env.RAZORPAY_KEY_ID,
   key_secret: process.env.RAZORPAY_KEY_SECRET,
 });

module.exports = {
 
  getOrder: async function (userId) {
    const order = await Order.find({ userid: userId })

      .populate("products")
      .lean();
  
      order.forEach(order => {
        order.products.forEach(product => {
         
        });
      });
      
    return order;
  },

  getAllOrder: async function () {
    const orders = await Order.find().populate("userid").lean();
    orders.forEach((order) => {
      if (order.userid && order.userid.name) {
      }
    });

    return orders;
  },

  getSingleOrder: async function (orderId) {
    const order = await Order.findOne({ _id: orderId })
      .populate("products.product_id")
      .lean();
    const names = order.products.map((product) => {
      product.product_id;
    });

    const proName = await Product.findOne({ _id: names });
    return order;
  },

  createOrder: async function (userId, couponId, cart, body, statuses) {
    try {
      const userCart = await userHandler.getCart(userId);
      const cart = userCart.cart.cart;
      const productsToAdd = cart.map((product) => ({
        product_id: product.product_id._id,
        quantity: product.quantity,
      }));
      let coupon;
      if (couponId) {
        coupon = await this.showCoupon(couponId);
      }
      const orderId = Math.floor(Math.random() * 1000000000 + 1);

      let order;
      if (coupon == null) {
         order = await Order.create({
          userid: userId,
          orderid: orderId,
          shippingAddress: {
            houseName: body.houseName,
            street: body.street,
            city: body.city,
            pincode: body.pincode,
          },
          products: productsToAdd,
          phone: body.phone,
          status: statuses.orderStatus,
          totalPrice: body.totalPrice,
          payment: {
            paymentType: body.payment,
            paymentStatus: statuses.payStatus,
          },
          
        });
      } else {
         order = await Order.create({
          userid: userId,
          orderid: orderId,
          shippingAddress: {
            houseName: body.houseName,
            street: body.street,
            city: body.city,
            pincode: body.pincode,
          },
          products: productsToAdd,
          phone: body.phone,
          status: statuses.orderStatus,
          totalPrice: body.totalPrice,
          payment: {
            paymentType: body.payment,
            paymentStatus: statuses.payStatus,
          },
          coupon: {
            code: coupon.code,
            discount: coupon.discount,
          },
        });
      }
      if (order.payment.paymentType == "COD") {
        try {
          const updatedCart = await userHandler.deleteCartAfterOrder(userId);
          return order;
        } catch (error) {
          logger.error({ message: "order failed" });
        }
      } else {
        return order;
      }
    } catch (error) {
      console.log(error);
      logger.error("error", error.message);
    }
  },

  generateRazorPay: async function (orderId, totalPrice) {
    return new Promise((resolve, reject) => {
      try {
        let options = {
          amount: totalPrice * 100,
          currency: "INR",
          receipt: orderId,
        };
        instance.orders.create(options, function (err, order) {
          if (err) {
            logger.log(err);
          } else {
            resolve(order);
          }
        });
      } catch (err) {
        logger.log(err);
        reject(err);
      }
    });
  },

  updateOrder: async function (Id, statuses, userId, orderId) {
    const updatedOrder = await Order.findByIdAndUpdate(
      Id,
      {
        $set: {
          orderid: orderId,
          status: statuses.orderStatus,
          payment: {
            paymentType: "razorPay",
            paymentStatus: statuses.payStatus,
          },
        },
      },
      { new: true }
    );
    const updatedCart = await userHandler.deleteCartAfterOrder(userId);
    return updatedOrder;
  },

  
  getCoupon: async function (price) {
   
    const coupons = await Coupons.find().lean();
    const matchCoupon = coupons.filter((coupon) => {
      return (price >= coupon.discount_value) ;
    });
    return matchCoupon;
  },

  showCoupon: async function (couponId) {
    try{
console.log("object",couponId)
      const coupon = await Coupons.findOne({ coupon_code: couponId });
      return coupon;
    }catch(error){
      console.log(error)
    }
  },

  updateCoupon: async function (couponId, userId) {
    try {
      const coupon = await this.showCoupon(couponId);
      const updatedCoupon = await Coupons.findByIdAndUpdate(
        coupon,
        {
          $set: {
            lastUpdatedUser: userId,
            lastUpdated: new Date(),
          },
          $push: { usedUsers: userId },
        },
        { new: true }
      );
    } catch (error) {
      logger.error({ message: "error updating coupon" + error.message });
    }
  },
  orderUpdate: async function (action, orderId) {
    const updateOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        $set: {
          status: action,
        },
      },
      { new: true }
    );
    return updateOrder;
  },

  filterOrder: async function (lower, higher) {
    const orders = await Order.find({
      totalPrice: { $gt: lower, $lt: higher },
    })
      .populate("userid")
      .lean();
    return orders;
  },

  filterOrderType: async function (payType) {
    const orders = await Order.find({
      "payment.paymentType": payType,
    })
      .populate("userid")
      .lean();
    return orders;
  },

  dateFilter: async function (date, endDate) {
    const orders = await Order.find({
      orderedDate: {
        $gte: date,
        $lte: endDate,
      },
    })
      .populate("userid")
      .lean();
    return orders;
  },

  filterOrderStatus: async function (status) {
    const orders = await Order.find({
      status: status,
    })
      .populate("userid")
      .lean();
    return orders;
  },
};
