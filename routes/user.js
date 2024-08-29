var express = require("express");
const {
  singleProduct,
} = require("../controller/productController");

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
  checkout,
  userRegister,
  user_registration,
  loginPage,
  verifyEmail,
  verify,
  userProfile,
  showProduct,
  homePage,

} = require("../controller/userController");

const router = express.Router();

router.get("/", homePage);
//   res.render("index", { title: "ecommerce" });
// });

router.get("/login", loginPage);
router.post("/login", userLogin);

router.get("/register", userRegister);
router.post("/registration", user_registration);

router.get('/verify-email', verifyEmail);
router.get('/verify', verify);

// router.get("/myaccount", (req, res) => {
//   res.render("user/myaccount");
// });
router.get("/myaccount", userProfile);



router.get("/checkout", checkout);
router.get("/cart",cart);
router.get("/shop", showProduct);
router.get("/addToCart/:id", addToCart);
router.get("/addProductToCart/:id", addProductToCart);
router.post("/updateCart", updateCart);
router.get("/deleteCartProduct/:id", deleteCart);
router.get("/wishlist",checkAuth, wishlist);
router.get("/addWishlist/:id",checkAuth, addWishlist);
router.get("/deleteWishlistProduct/:id", deleteWishlist);
router.get("/logout", logout);
module.exports = router;
