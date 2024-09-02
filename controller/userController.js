
const userHandler = require("../helpers/userHelper");
const crypto = require("crypto")
const { logger } = require("../utils/logger");
const transporter = require("../middlewares/mailer");
const productHandler = require("../helpers/product-helpers");
const bcrypt = require("bcrypt");
const { generateToken, verifyToken } = require("../middlewares/token");

const homePage = async function (req,res){
  const products = await productHandler.getAllProducts();
  let isUser = false;
  let wishlistCount = 0;
  let cartCount= 0;
  if (req.session.user) {
    let isUser = true;
    wishlistCount = req.session.user.wishlist.length;
    cartCount = req.session.user.cart.length;
    console.log("user",req.session.user)
    console.log("ooooo",products)
    
    res.render("index", {isUser, products, user:req.session.user, wishlistCount,cartCount });
  } else {
    res.render("index", { products });
  }
}


const loginPage = function (req, res) {
  // res.setHeader("Cache-Control", "no-cache, no-store , must-revalidate");
  if (req.session.user) {
    
    return res.redirect("/");
  } 
  else{
   return res.render("user/login", {formData:{}});
}};

const userLogin = async function (req, res, next) {
  try {
    const { email, password } = req.body;
//console.log(req.body);
    const user = await userHandler.findUserByEmail(email);
    //console.log("user",user);
    const currentUser = user;
    if (currentUser) {
      // Compare the plain text password with the hashed password using bcrypt
      const passwordMatch = await bcrypt.compare(
        password,
        currentUser.password
      );

      if (passwordMatch) {
        req.session.user = user ;
     
        console.log("session",req.session.user)
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
  // const cartItems = req.session.cart;
 
 
  //         if (cartItems) {
  //           for (const item of cartItems) {
  //             const saveCart = await userHelper.addCartGuest(
  //               user._id,
  //               item.productId,
  //               item.quantity
  //             );
  //           }
  //         }
  //        
  //   
  

 

const userRegister = function (req, res) {
  res.setHeader("Cache-Control", "no-cache, no-store , must-revalidate");
  if (req.session.loggedIn) {
    return res.redirect("/");
  } else {
    return res.render("user/register",{formData:{}});
  }
  
};

const user_registration = async function (req, res) {
  const { fullName, phone, email, password } = req.body;

 // const email = req.body.email;
  const user = await userHandler.findUserByEmail(email);
  if (user && user.isVerified == true) { 
    logger.info("user already exists");
    res.render("user/register", {
      errorMessage: "user already exists, kindly login",
      formData:req.body
    });
  } else {
    const token = generateToken(email);
    const verificationUrl = `http://localhost:3000/verify-email?token=${token}`;
    const mailOption = {
      from: "process.env.EMAIL_USER",
      to: email,
      subject: "Email Verification",
      html: `<h3>Click <a href="${verificationUrl}">Verify Email</a> to verify your email.</h3>`,
    };
    transporter.sendMail(mailOption, async (error, info) => {
      if (error) logger.error({ message: `error sending mail ${error}` });
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await userHandler.createUser({
        fullName,
        phone,
        email,
        hashedPassword,
      });
      logger.info("email sent");
      res.redirect("/verify");
    }); 
  }
};
const verify = function (req, res) {
  if (req.session.user) {
    res.redirect("/");
  } else {
    res.render("user/verify");
  }
};

const verifyEmail = async function (req, res) {
  const token = req.query.token;
  const cartItems = req.session.cart;
  const decoded = verifyToken(token);
  const dbToken = await userHandler.findToken(token);
  if (!decoded) {
    return res.status(401).json({ error: "Invalid token" });
  }
  if (dbToken) {
    res.render("user/error");
  }
  const email = decoded.email;
  const verifyUser = await userHandler.updateUserStatus(email);
  if (verifyUser) {
    const addedToken = await userHandler.addToken(token); 
    req.session.user = true;
    req.session.userid = verifyUser._id;
    req.session.email = verifyUser.email;
    req.session.isVerified = verifyUser.isVerified;
    if (cartItems) {
      for (const item of cartItems) {
        const saveCart = await userHandler.addCartGuest(
          req.session.userid,
          item.productId,
          item.quantity
        );
      }
    }
    res.redirect("/");
  } else {
    logger.error({ message: "invalid token" });
  }
};
const showProduct = async function (req, res) {
  const products = await productHandler.getAllProducts();
 console.log("pp",products);
//  console.log("oo",products.image)
    let isUser = true;
    let wishlistCount = 0;
    let cartCount= 0;
    if (req.session.user) {
      wishlistCount = req.session.user.wishlist.length;
      cartCount = req.session.user.cart.length;
   
    res.render("user/shop", { products: products, isUser ,wishlistCount,cartCount});
    }else{
      res.render("user/shop", { products: products, isUser });
    }
    // res.render("user/products", { products: products });
  
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

    let wishlistCount = req.session.user.wishlist.length;
    let cartCount = req.session.user.cart.length;
    const userId = req.session.userid;
    const wishlistItems = await userHandler.getWishlist(userId);
    let isUser = true;
   console.log("wishlsititems",wishlistItems);
    res.render("user/wishlist", { items: wishlistItems, isUser: isUser ,wishlistCount ,cartCount});
  };
  
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
    userLogin,
  
    userRegister,
    user_registration,
    verify,
    verifyEmail,
    userProfile,
    homePage,
   showProduct,
   getAddress,
   add_address,
   addAddress,
   edit_address,
   editAddress,
   delete_address,
  }