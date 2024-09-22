const adminHandler = require("../helpers/adminHelper");
const userHandler = require("../helpers/userHelper");
const crypto = require("crypto")
const { logger } = require("../utils/logger");
const transporter = require("../middlewares/mailer");
const productHandler = require("../helpers/product-helpers");
const bcrypt = require("bcrypt");
const { generateToken, verifyToken } = require("../middlewares/token");
const {sendOTP} =require( "../services/otpSender");
const sendEmail = require("../services/sendEmail");

const homePage = async function (req,res){
  const products = await productHandler.getHomeProducts();
  let isUser = false;
  let wishlistCount = 0;
  let cartCount= 0;
  if (req.session.user) {
    let isUser = true;
    wishlistCount = req.session.user.wishlist.length;
    cartCount = req.session.user.cart.length;
    res.render("user/index", {isUser, products, user:req.session.user, wishlistCount,cartCount });
  } else {
    res.render("user/index", { products });
  }
}

const loginPage = function (req, res) {
 res.setHeader("Cache-Control", "no-cache, no-store , must-revalidate");
  if (req.session.user) {
    return res.redirect("/");
  } 
  else{
   return res.render("user/login", {formData:{}});
}};

const userLogin = async function (req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await userHandler.findUserByEmail(email);
    const currentUser = user;
    if (currentUser) {
      const passwordMatch = await bcrypt.compare(
        password,
        currentUser.password
      );
      if (passwordMatch) {
        req.session.user = user ;
        req.session.loggedIn = true;
        req.session.userid=user._id;
        req.session.email=currentUser.email;
        console.log(req.session.email);
        req.session.username = currentUser.fullName;
        return res.redirect( "/");
      } else {
        return res.render("user/login", { errorMessage: "Invalid password",formData:req.body });
      }
    } else {
      return res.render("user/login", { errorMessage: "User not found" , formData:req.body});
    }
  } catch (err) {
    next(err);
  }
}
 
const userRegister = function (req, res) {
  res.setHeader("Cache-Control", "no-cache, no-store , must-revalidate");
  if (req.session.loggedIn) {
    return res.redirect("/");
  } else {
    return res.render("user/register",{formData:{}});
  }
  
};

const user_registration = async function (req, res, next) {
  
  const { fullName, email, password, phone } = req.body;
 
  // Check if a user is already exist with this email
  const user = await userHandler.findUserByEmail(email);
  if (user && user.isVerified == true) { 
        logger.info("user already exists");
        res.render("user/register", {
           errorMessage: "user already exists, kindly login",
           formData:req.body
        });
      }
  try {
    // Sending otp to the user provided email
    const otp = await sendOTP(email);
    // storing the info inside session
    req.session.signupInfo = { email, password, fullName, phone };
    // Creating timeout 90 second
    let expireTime = Date.now() + 5 * 60 * 1000;
    // Store it in the session
    req.session.emailOTP = { otp, expireTime };
   // res.json({ error: null });
   res.render('user/verify')
  } catch (err) {
    next(err);
  }
};

 const verify = function (req, res) {
   if (req.session.user) {
     res.redirect("/");
   } else {
     res.render("user/verify");
   }
 };

const verifyOTP = async (req, res, next) => {
  const { otpvalue } = req.body;
  
  // Retrieve OTP and expire time from session
  const sessionOTP = req.session.emailOTP?.otp;
  const expireTime = req.session.emailOTP?.expireTime;
  
  if (!sessionOTP || !expireTime) {
      return res.status(400).render('user/verify', { errorMessage: "OTP expired, please resend." });
  }

  // Check if OTP has expired
  if (Date.now() > expireTime) {
    req.session.emailOTP = null;
      return res.status(400).render('user/verify', { errorMessage: "OTP expired, please resend." });
  }

  // Check if the provided OTP matches the session OTP
  if (otpvalue === sessionOTP) {
   try{
      const { email, password, fullName, phone } = req.session.signupInfo;
      const hashedPassword = await bcrypt.hash(password, 10);
             const newUser = await userHandler.createUser({
               fullName,
               phone,
               email,
               hashedPassword,
             });
      //await userHandler.createUser({ email, password, fullName, phone });
      req.session.signupInfo = null;
      req.session.emailOTP = null;
      //successMessage: "Registration successful!"
      return res.redirect('/login');
  } catch (error){
    return next(error);
  }
}else {
      // Invalid OTP
      return res.status(400).render('user/verify', { errorMessage: "Invalid OTP, please try again." });
  }
};

const resendOTP = async (req, res, next) => {
  const { email } = req.session.signupInfo;
  try {
      const newOTP = await sendOTP(email);
      let newExpireTime = Date.now() + 5 * 60 * 1000;
      req.session.emailOTP = { otp: newOTP, expireTime: newExpireTime };
      res.status(200).render('user/verify', { successMessage: "OTP resent successfully." });
  } catch (err) {
      next(err);
  }
};
const forgotpassword=function (req,res){
  if (req.session.user) {
    res.redirect("/");
  } else {
    res.render("user/forgot-password");
  }
}

const forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  console.log("emao",email)
  const user = await userHandler.findUserByEmail(email);

  if (!user) {
    return res.status(400).render('admin/forgot-password', { errorMessage: 'Email not found' });
  }

  const resetToken = userHandler.generateResetToken();
  const resetExpires = Date.now() + 3600000; // 1 hour from now
console.log("yyy",user.id)
  await userHandler.saveResetToken(user.id, resetToken, resetExpires);

  const resetURL = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
  await sendEmail({
    to: user.email,
    subject: 'Password Reset Request',
    text: `You can reset your password using this link: ${resetURL}`,
  });

  res.render('user/forgot-password', { successMessage: 'Check your email for the password reset link' });
};
const resetpassword = async (req, res, next) => {
  const { token } = req.params;
  try {
    // Find the user by reset token
    const user = await userHandler.findUserByResetToken(token);
    if (!user) {
      return res.render('user/reset-password', { errorMessage: 'Invalid or expired token' });
    }

    // Render the password reset form
    res.render('user/reset-password', { token });
  } catch (err) {
    next(err);
  }
}


const resetPassword = async (req, res, next) => {
  const { token } = req.params;
  const { newPassword } = req.body;
console.log("object",newPassword);
  try {
    // Find the user by the reset token
    const user = await userHandler.findUserByResetToken(token);
    console.log("user",user)
    if (!user) {
      return res.render('user/reset-password', { errorMessage: 'Invalid or expired token' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password and clear the reset token
    await userHandler.updatePassword(user._id, hashedPassword);
    await userHandler.clearResetToken(user._id);

    // Redirect to login page with success message
    res.render('user/login', { successMessage: 'Password reset successful! You can now log in.' });
  } catch (err) {
    next(err);
  }
}



const myCoupons = async function (req, res) {
  const coupons = await adminHandler.getAllCoupons();
  res.render("user/myCoupons", { coupons: coupons });
  console.log("cou",coupons);
};
const showProduct = async function (req, res) {
  try {
    const keyword = req.query.keyword;
    const category = req.query.category;
    const minPrice = req.query.minPrice;
    const maxPrice = req.query.maxPrice;
    const sizes = req.query.sizes; // Assuming sizes are passed as an array

    let filter = {};
    let products;

    if (keyword) {
      // Search for products if a keyword is provided
      products = await productHandler.productSearch(keyword);
    } else {
      // Show all products if no keyword is provided
      products = await productHandler.getAllProducts();
    }

    let isUser = true;
    let wishlistCount = 0;
    let cartCount = 0;

    if (req.session.user) {
      isUser = true;
      wishlistCount = req.session.user.wishlist.length;
      cartCount = req.session.user.cart.length;
    }

    res.render("user/shop", { products: products, isUser, wishlistCount, cartCount });
  } catch (error) {
    console.error("Error displaying products:", error);
    res.status(500).json({ message: "Error displaying products." });
  }
};

const userProfile = async function (req, res) {
  try {
    const email = req.session.email;
    //console.log("rr",req.session.email);
    const user = await userHandler.findUserByEmail(email);
    
    if (req.session.user) {
      console.log(req.session.user);
      let isUser = true;
     // console.log("useeeeeeeeeeeer",user);
     return res.render("user/myaccount", {user });
    } else {
      return res.render("user/myaccount", { user});
    }
  } catch (err) {
    logger.error({ message: err.message });
  }
};

const cart = async function (req, res) {
  const userId = req.session.userid;
  if (userId) {
    let isUser = true;
    const cart = await userHandler.getCart(userId);
   
    let wishlistCount = req.session.user.wishlist.length;
  let cartCount = req.session.user.cart.length;
    if (cart) {
      const newCart = cart.cart;
      if (newCart.cart) {
        const cartLength = newCart.cart.length;
//console.log("ll",cartLength)
//console.log("cart",cart)
        res.render("user/cart", {
          isUser,
          length: cartLength,
          wishlistCount,
          cartCount,
          cart: newCart.cart,
          totalPrice: cart.totalPrice,
        });
      

      } else {
        res.render("user/cart", {
          
          isUser,
        });
      }
    }
  } else {
    const cart = req.session.cart;
    if (cart) {
      let cartItems = [];
      let totalPrice = 0;
      for (const item of cart) {
        let items = await productHandler.getProduct(item.productId);
        let quantity = item.quantity;
        cartItems.push({ productId: items, quantity: quantity });
        totalPrice += item.quantity * items.price;
      }
      const quantity = cart.quantity;
      const cartLength = cartItems.length;
      res.render("user/cart", {
      
        length: cartLength,
        cart: cartItems,

        totalPrice: totalPrice,
      });
    } else {
      res.render("user/cart");
    }
  }
};
  
  const addToCart = async function (req, res) {
    const userId = req.session.userid;
    if (userId) {
      const cart = await userHandler.addItemsToCart(userId, req.params.id);
      return res.redirect("/shop" );
    } else {
      if (!req.session.cart) {
        req.session.cart = [];
      }
      const existingItemIndex = req.session.cart.findIndex((cartItem) => {
        return cartItem.productId == req.params.id;
      });
      if (existingItemIndex !== -1) {
        req.session.cart[existingItemIndex].quantity += 1;
      } else {
        const cart = {
          productId: req.params.id,
          quantity: 1,
        };
        req.session.cart.push(cart);
      }
      const carts = req.session.cart;
      return res.redirect("/shop" );
    }
  };
  
  const addProductToCart = async function (req, res) {
    try {
      const userId = req.session.userid;
      if (userId) {
        const cart = await userHandler.addItemsToCart(userId, req.params.id);
        
        if (cart) {
          
          res.redirect("/wishlist");
        }
      } else {
        if (!req.session.cart) {
          req.session.cart = [];
        }
        const existingItemIndex = req.session.cart.findIndex((cartItem) => {
          return cartItem.productId == req.params.id;
        });
        if (existingItemIndex !== -1) {
          req.session.cart[existingItemIndex].quantity += 1;
        } else {
          const cart = {
            productId: req.params.id,
            quantity: 1,
          };
          req.session.cart.push(cart);
        }
        const carts = req.session.cart;
  
        res.redirect("/wishlist");
      }
    } catch (err) {
     // logger.error({ message: err });
    }
  };
  
  const updateCart = async function (req, res) {
    try {
      let { proId, count } = req.body;
    //  console.log("pro",proId,count)
      count = parseInt(count);
      const userId = req.session.userid;
      if (userId) {
        const updatedCart = await userHandler.updateCart(proId, count, userId);
        console.log("upcart",updateCart)
        if (updatedCart) {
          const totalPrice = await userHandler.getCart(userId);
          res.json({ totalPrice: totalPrice.totalPrice, updatedCart });
        }
      } else {
      }
    } catch (error) {
      console.log(error);
      //logger.error({ message: "update cart failed", error });
    }
  };
  const deleteCart = async function (req, res) {
    try {
      const userId = req.session.userid;
      if (userId) {
        const newDeletedCart = await userHandler.cartDelete(
          req.session.userid,
          req.params.id
        );
        res.redirect("/cart");
      } else {
        let cart = req.session.cart;
        if (cart) {
          const existingProductIndex = cart.findIndex((cartItem) => {
            return cartItem.productId == req.params.id;
          });
          const newCart = cart.splice(existingProductIndex, 1);
          req.session.cart = cart;
          res.redirect("/cart");
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  const wishlist = async function (req, res) {
const page = parseInt(req.query.page)||1;
const limit=8;
   
    const userId = req.session.userid;
    const wishlistData = await userHandler.getWishlist(userId,page,limit);
    const wishlistItems = wishlistData.items;
    const totalItems = wishlistData.totalItems;
    let wishlistCount = req.session.user.wishlist.length;
    let cartCount = req.session.user.cart.length;
    let isUser = true;
  const totalPages = Math.ceil(totalItems/limit);
  console.log("wish",wishlistItems)
  //res.json(wishlistItems)
  const updatedWishlistItems = wishlistItems.map(item => {
    item.product_id.image = item.product_id.image.map(img => img/productImages/ + img); // Add base URL to each image
   
  });
  console.log("object",updatedWishlistItems)
     res.render("user/wishlist", { items: wishlistItems,updatedWishlistItems, isUser: isUser ,
      wishlistCount ,cartCount,
     currentPage:page,
   totalPages:totalPages});
  }
  
  const addWishlist = async function (req, res) {
    //console.log("ww",req.params)
    const proId = req.params.id;
    const userId = req.session.userid;
   // console.log("userId",req.session.userid)
    const addedWishlist = await userHandler.wishlistAdd(userId, proId);
     return res.redirect("/shop" );
    // res.json({ addedWishlist });
  };
  
  const deleteWishlist = async function (req, res) {
    const proId = req.params.id;
    const userId = req.session.userid;
    const deletedWishlist = await userHandler.wishlistDelete(userId, proId);
   return res.redirect("/wishlist");
  };
 
  
//  const checkout = async function (req,res,next){
//   return res.render("user/checkout");
//  }
 const getAddress = async function (req, res) {
  try {
    const userid = req.session.userid;
    const addressess = await userHelper.getUserAddress(userid);
    const user = await userHelper.findUserById(userid);
    const username = user.name;
    res.json({ addressess, username });
  } catch (error) {
    logger.error({ message: error });
  }
};
const add_address = async function (req, res) {
  try {
    const email = req.session.email;
    const user = await userHelper.findUser(email);
    let isUser = true;
    res.render("user/add-address", { user, isUser });
  } catch (error) {
    logger.error({ message: error });
  }
};

const addAddress = async function (req, res) {
  try {
    const data = req.body;
    const userId = req.session.userid;
    const address = await userHelper.addAddress(data, userId);
  } catch (error) {
    logger.error({ message: err });
  }
};

const edit_address = async function (req, res) {
  try {
    const userId = req.session.userid;
    const addressId = req.params.id;
    const data = await userHelper.getAddress(userId, addressId);
    const address = data.address;
    const user = data.user;
    let isUser = true;
    res.render("user/edit-address", { user, address, isUser });
  } catch (err) {
    logger.error({ message: `couldn't get the address ${err}` });
  }
};

const editAddress = async function (req, res) {
  try {
    const userId = req.session.userid;
    const addressId = req.params.id;
    const address = req.body;
    const updatedAddress = userHelper.editAddress(userId, addressId, address);
  } catch (error) {
    logger.error({ message: `couldn't get the address ${err}` });
  }
};

const delete_address = async function (req, res) {
  const userId = req.session.userid;
  const adderssId = req.params.id;
  const deleteAddress = userHelper.deleteAddress(userId, adderssId);
  if (deleteAddress) {
    res.redirect("/user/edit_profile");
  } else {
    logger.error({ message: `couldn't get the address ${err}` });
  }
};
  const logout = async function (req, res) {
    req.session.destroy();
    res.redirect("/");
  };
// const verifyEmail = async function (req, res) {
//   const token = req.query.token;
//   const cartItems = req.session.cart;
//   const decoded = verifyToken(token);
//   const dbToken = await userHandler.findToken(token);
//   if (!decoded) {
//     return res.status(401).json({ error: "Invalid token" });
//   }
//   if (dbToken) {
//     res.render("user/error");
//   }
//   const email = decoded.email;
//   const verifyUser = await userHandler.updateUserStatus(email);
//   if (verifyUser) {
//     const addedToken = await userHandler.addToken(token); 
//     req.session.user = true;
//     req.session.userid = verifyUser._id;
//     req.session.email = verifyUser.email;
//     req.session.isVerified = verifyUser.isVerified;
//     if (cartItems) {
//       for (const item of cartItems) {
//         const saveCart = await userHandler.addCartGuest(
//           req.session.userid,
//           item.productId,
//           item.quantity
//         );
//       }
//     }
//     res.redirect("/");
//   } else {
//     logger.error({ message: "invalid token" });
//   }
// };
// const showProduct = async function (req, res) {
//   const products = await productHandler.getAllProducts();
//  console.log("pp",products);
// //  console.log("oo",products.image)
//     let isUser = true;
//     let wishlistCount = 0;
//     let cartCount= 0;
//     if (req.session.user) {
//       wishlistCount = req.session.user.wishlist.length;
//       cartCount = req.session.user.cart.length;
   
//     res.render("user/shop", { products: products, isUser ,wishlistCount,cartCount});
//     }else{
//       res.render("user/shop", { products: products, isUser });
//     }
//     // res.render("user/products", { products: products });
  
// };

  module.exports={
    updateCart,
    cart,
    addProductToCart,
    addToCart,
    deleteCart,
    wishlist,
    addWishlist,
    deleteWishlist,
    logout,
    loginPage,
    userLogin,user_registration,
    verifyOTP,
    userRegister,
    resendOTP,
    //user_registration,
    verify,
    forgotPassword,
    //verifyEmail,
    //verifyEmail,
    userProfile,
    homePage,
   showProduct,
   getAddress,
   add_address,
   addAddress,
   edit_address,
   editAddress,
   delete_address,
   forgotpassword,
   myCoupons,
   resetPassword,
   resetpassword,
  }