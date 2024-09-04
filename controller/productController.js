//const multer = require('multer');
const productHandler = require("../helpers/product-helpers");
const {upload} = require("../middlewares/multer");
const orderHandler = require("../helpers/orderHelper");
const userHandler = require("../helpers/userHelper");
const getAddProduct = function (req, res) {
  res.render("admin/add-product");
};

const addProduct = async function (req, res) {
  //const { upload } = require("../middlewares/multer");
  const uploadMiddleware = upload();

  uploadMiddleware(req, res, async (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error uploading file.");
    }
console.log(req.body);
console.log(req.files);
    const fileNames = req.files.map(file=>file.filename);
    const addedProduct = await productHandler.addProduct(req.body, fileNames);
    if (addedProduct) {
      res.redirect("/add-product");
    }
  });
};

// const searchProduct = async function (req, res) {
//   try {
//     // Get the search keyword from the query string (GET request)
//     const keyword = req.query.keyword;
//     let isUser=true;
//     let wishlistCount = 0;
// let cartCount = 0;
//     if (!keyword) {
//       const allProducts = await productHandler.getAllProducts();
//      if(req.session.user){
//       wishlistCount=req.session.user.wishlist.length;
//       cartCount= req.session.user.cart.length;
//      }
//      return res.render("user/shop",{products:allProducts,isUser,wishlistCount,cartCount})
//       // return res.json([]); // Return an empty array if no keyword is provided
//     }
   
//     // Search products in the database that match the keyword
//     const products = await productHandler.productSearch(keyword);
//     if (req.session.user) {
//       wishlistCount = req.session.user.wishlist.length;
//       cartCount = req.session.user.cart.length;
//     }
//     // Return the matching products as JSON
//      //res.json(products);
//     res.render("user/shop",{products:products, isUser, wishlistCount,cartCount})
//   } catch (error) {
//     console.error("Error searching for products:", error);
//     res.status(500).json({ message: "Error searching for products." });
//   }
// };

const searchProduct = async function (req, res) {
  try {
    const keyword = req.query.keyword;
    
    if (!keyword) {
      return res.json([]); // Return an empty array if no keyword is provided
    }

    const products = await productHandler.productSearch(keyword);

    res.json(products);  // Send the JSON response back to the AJAX call
  } catch (error) {
    console.error("Error searching for products:", error);
    res.status(500).json({ message: "Error searching for products." });
  }
};

const adminProduct = async function (req, res) {
    const products = await productHandler.getAllProducts();
    
    // const images = products?.image[0]
    // products.images = images
    res.render("admin/view-products", { products: products });
   // console.log("prd",products)
  };
  
 

  const singleProduct = async function (req, res) {
    const productId = req.params.id;
    const product = await productHandler.getProduct(productId);
  // console.log("prooooo",product);
      let isUser = true;
     return res.render("user/detailProduct", { product, isUser });
  
      // res.render("user/product", { product });
    }
    // const searchProduct = async function (req, res) {
    //   try {
    //     const data = req.body.search;
    //     const products = await productHandler.productSearch(data)
    //     if(products.length>=1){
         
    //         let isUser = true;
    //         res.render("user/products", { products: products, isUser });
          
    //         // res.render("user/products", { products: products });
    //       }
    //     else{
    //       const noProduct = true
         
    //         let isUser = true
    //         res.render("user/products", { isUser, noProduct });
    
       
    //         res.render("user/products", { noProduct });
    //       }
    //     }
    //    catch (error) {
    //     logger.error({ message: "error searching product" });
    //   }
    // };
    const editproduct = async function (req, res) {
      const proId = req.params.id;
      const product = await productHandler.getProduct(proId);
      res.render("admin/edit-product", { product: product });
    };
    const editProduct = async function (req, res) {
      try {
        const editedProduct = await productHandler.editProduct(
          req.params.id,
          req.body
        );
    
        if (editedProduct) {
          res.redirect("/view-products");
        }
      } catch (err) {
        res.status(404);
        console.log(err);
      }
    };
    const deleteProduct = async function (req, res) {
      try {
        const deletedProduct = await productHandler.deleteProduct(req.params.id);
        if (deletedProduct) {
          res.redirect("/view-products");
        }
      } catch (err) {
        res.status(404);
        res.json("error deleting product");
      }
    };
    const getCheckout = async function (req, res) {
      const userId = req.session.userid;
      let isUser = true;
      let user = await userHandler.getCart(userId);
      console.log("user",user)
      let coupon = await orderHandler.getCoupon(user.totalPrice);
      if (user.cart.coupon) {
        const eligibleCoupon = await orderHandler.showCoupon(user.cart.coupon.code);
        if(user.totalPrice < eligibleCoupon.totalPrice){
          user = await userHandler.couponRemove(userId)
          coupon = []
        }
      }
      console.log("tt",user.totalPrice)
      if (user.cart.cart) {
        let totalPrice;
    
        const address = user.cart.address[0];
    
        if (coupon.length < 1) {
          totalPrice = user.totalPrice;
          console.log("tot",totalPrice)
          const subTotal = totalPrice;
          const discount = 0;
          if (totalPrice < 500) {
            res.render("user/checkout", {
              isUser,
              user: user,
              totalPrice,
              message: "cannot order below ₹500",
            });
          } else {
            res.render("user/checkout", {
              isUser,
              user: user,
              totalPrice,
              subTotal,
              address,
              discount,
            });
          }
        } else {
          //  coupon = coupon[0]
          if (user.cart.coupon) {
            totalPrice = user.totalPrice - user.cart.coupon.discount;
            const subTotal = user.totalPrice;
            const code = user.cart.coupon.code;
            const discount = user.cart.coupon.discount;
            // const discount = coupon[0].discount
            res.render("user/checkout", {
              isUser,
              user: user,
              totalPrice,
              subTotal,
              address,
              coupon,
              couponCode: code,
              discount,
            });
          } else {
            totalPrice = user.totalPrice;
            const subTotal = totalPrice;
            discount = 0;
            res.render("user/checkout", {
              isUser,
              user: user,
              totalPrice,
              subTotal,
              address,
              coupon,
              discount,
            });
          }
        }
      } else {
        res.redirect("/cart");
      }
    };
    
    const deleteProductCheckout = async function (req, res) {
      cart.deleteCartProduct(req.session.userid, req.params.id).then(() => {
        res.redirect("/checkout");
      });
    };
    
    const postCheckout = async function (req, res) {
      try {
        const userId = req.session.userid;
        const user = await userHelper.getCart(userId);
        const cart = user.cart.cart;
        if (user) {
          // await userHelper.addAddress(req.body, userId);
          if (req.body.payment == "COD") {
            const statuses = {
              orderStatus: "placed",
              payStatus: "pending",
            };
            const newOrder = await orderHelper.createOrder(
              userId,
              req.body.couponId,
              cart,
              req.body,
              statuses
            );
            const updateCoupon = await orderHelper.updateCoupon(
              req.body.couponId,
              userId
            );
            await userHelper.couponRemove(userId)
            res.json(newOrder);
          } else if (req.body.payment == "razorPay") {
            const statuses = {
              orderStatus: "pending",
              payStatus: "pending",
            };
    
            const order = await orderHelper.createOrder(
              userId,
              req.body.couponId,
              cart,
              req.body,
              statuses
            );
            if (order) {
              try {
                const orderInstance = await orderHelper.generateRazorPay(
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
    
  module.exports ={
    addProduct,
    getAddProduct,
    adminProduct,
    getCheckout,
    deleteProductCheckout,
    postCheckout,
    singleProduct,
    searchProduct,
    editProduct,
    editproduct,
    deleteProduct
    
  }