var express = require("express");
const router = express.Router();
const {singleProduct,} = require("../controller/productController");
const { checkAuth } = require("../middlewares/auth");
const {
  cart,
  addToCart,
  addProductToCart,
  updateCart,
  deleteCart,
  wishlist,
  addWishlist,
  deleteWishlist,
  logout,
  userLogin,
  userRegister,
  loginPage,
  userProfile,
  showProduct,
  homePage,
  add_address,
  getAddress,
  verifyEmail,
  user_registration,
  resendOTP,
  verifyOTP,
  verify,
  forgotPassword,
  forgotpassword,
  myCoupons,
} = require("../controller/userController");
const { couponGet, postCoupon, removeCoupon } = require("../controller/ordersController");
const { userRegisterValidation, validate } = require("../middlewares/validation");


//home page
router.get("/", homePage);
//login 
router.get("/login", loginPage);
router.post("/login", userLogin);
//register
router.get("/register", userRegister);
router.post("/registration",userRegisterValidation,validate, user_registration);
router.get('/verify',verify)
router.post('/verify-otp', verifyOTP);
router.get("/resendOtp",resendOTP)
router.get('/forgot-password',forgotpassword)
router.post('/forgot-password',forgotPassword)
router.get("/myaccount", userProfile);
router.get('/mycoupons',myCoupons);
//shop
router.get("/shop", showProduct);
router.get("/addToCart/:id", addToCart);
router.get("/addProductToCart/:id", addProductToCart);
//cart
router.get("/cart",checkAuth,cart);
router.post("/updateCart", updateCart);
router.get("/deleteCartProduct/:id", deleteCart);
//wishlist
router.get("/wishlist",checkAuth, wishlist);
router.get("/addWishlist/:id",checkAuth, addWishlist);
router.get("/deleteWishlistProduct/:id", deleteWishlist);
//address
router.get("/add_address", add_address);
router.put("/user/getAddress", getAddress)
//logout
router.get("/logout", logout);
module.exports = router;
