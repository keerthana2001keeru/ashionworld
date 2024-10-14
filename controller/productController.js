
//const products = require("../models/productSchema");
const productHandler = require("../helpers/product-helpers");
const {upload} = require("../middlewares/multer");
//const {uploadreview} = require("../middlewares/reviewMulter");
const orderHandler = require("../helpers/orderHelper");
const userHandler = require("../helpers/userHelper");


const getAddProduct = function (req, res) {
  res.render("admin/add-product");
};

const addProduct = async function (req, res) {
  
  const uploadMiddleware = upload();
console.log(uploadMiddleware)
  uploadMiddleware(req, res, async (err) => {
    console.log(req.body)
    if (err) {
      console.log("ddddddddddd")
      console.error(err);
      return res.status(500).send("Error uploading file.");
    }
//console.log("rr",req.body);
console.log(req.files);
    const fileNames = req.files.map(file=>file.filename);
    const addedProduct = await productHandler.addProduct(req.body, fileNames);
    console.log("object")
    if (addedProduct) {
      res.redirect("/add-product");
    }
  });
};

const searchProduct = async function (req, res) {
  try {
    const keyword = req.query.keyword;
    
    if (!keyword) {
      return res.json([]); 
      // Return an empty array if no keyword is provided
    }

    const products = await productHandler.productSearch(keyword);

    res.json(products); 
     // Send the JSON response back to the AJAX call
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
   
  };
  
  const singleProduct = async function (req, res) {
    const productId = req.params.id;
    const product = await productHandler.getProduct(productId);
    const relatedProduct= await productHandler.getRelatedProducts(productId);
   
      let isUser = true;
     return res.render("user/detailProduct", { product, isUser,relatedProduct:relatedProduct });
  
      
    }
   
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

    const submitReview = async (req, res) => {
  
      const uploadMiddleware = uploadreview();
      uploadMiddleware(req, res, async (err) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Error uploading file.");
        }
        const { productId, rating, comment } = req.body;
      
  
    try{
    
        
        const product = await products.findById(productId);
       
        if (!product) {
          return res.status(404).json({ message: "Product not found" });
        }
        const fileNames =req.files ? req.files.map(file=>file.filename): [];
      const review = {
        user: req.session.user._id,
        name: req.session.user.fullName,
        rating: Number(rating),
        comment: comment,
        image: fileNames.length>0 ? fileNames : [],
      };

      product.reviews.push(review);
      product.numReviews = product.reviews.length;
      // Calculate average rating
      product.avgRating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;
      await product.save();
 
      res.redirect('/')
    } 
    catch (error) {
      console.error("Error submitting review:", error);
      res.status(500).json({ message: "Error submitting review." });
    }
   
    })
  }
    const getCheckout = async function (req, res) {
      const userId = req.session.userid;
      let isUser = true;
      let user = await userHandler.getCart(userId);
     //console.log("user",user)
     
      let coupon = await orderHandler.getCoupon(user.totalPrice);
     console.log("coupon",coupon)
       if (user.cart.coupon) {
         const eligibleCoupon = await orderHandler.showCoupon(user.cart.coupon.code);
        if(user.totalPrice < eligibleCoupon.totalPrice){
           user = await userHandler.couponRemove(userId)
           coupon = []
        }
       }

      if (user.cart.cart) {
        let totalPrice;
    
        const address = user.cart.address[0];
    
        if (coupon.length < 1) {
          totalPrice = user.totalPrice;
       
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
   
   
    
  module.exports ={
    addProduct,
    getAddProduct,
    adminProduct,
    getCheckout,
   
    singleProduct,
    searchProduct,
    editProduct,
    editproduct,
    deleteProduct,
    submitReview,
    
  }