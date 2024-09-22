const userHandler = require("../helpers/userHelper");
const adminHandler = require("../helpers/adminHelper");
const bcrypt = require("bcrypt");
const { User } = require("../models/userSchema");
const fs = require('fs');
const path = require('path');
const Logo = require('../models/navbarSchema');
const adminLoginpage = function (req, res,next) {
  try{
  if (req.session.admin) {
    return res.redirect("/admin/adminDashboard");
  } else { 
    console.log("admin")
    return res.render("admin/adminLogin", {formData:{}});
  }
} catch (err) {
  next(err);
}
};
async function adminLogin(req, res, next) {
  try {
    const { email, password } = req.body;
    const admin = await adminHandler.findAdminByEmailId(email);

    if (admin) {
      // Compare the plain text password with the hashed password using bcrypt
      const passwordMatch = await bcrypt.compare(password, admin.password);

      if (passwordMatch) {
        req.session.admin = admin;
        req.session.loggedIn = true;
        req.session.username = admin.fullName;
        return res.redirect("/admin/adminDashboard");
      } else {
        return res.render("admin/adminLogin", { errorMessage: "Invalid password",formData:req.body });
      }
    } else {
      return res.render("admin/adminLogin", { errorMessage: "Admin not found",formData:req.body });
    }
  } catch (err) {
    next(err);
  }
}
async function adminDashboard(req, res, next) {
  res.setHeader("Cache-Control", "no-cache, no-store , must-revalidate");
  try {
      if (req.session.admin) {
        return res.render("admin/adminDashboard");
      }
       else {
        return res.redirect("/admin/adminLogin",{formData:{}});
      }
  } catch (err) {
    next(err);
  }
}
const adminBanner = async function (req, res) {
  const products = await adminHandler.getAllProducts();
  
  // const images = products?.image[0]
  // products.images = images
  res.render("admin/view-banners", { products: products });
 // console.log("prd",products)
};
const getAddBanner = function (req, res) {
  res.render("admin/add-banner");
};
const addBanner = async function (req, res) {
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
      res.redirect("/admin/add-banner");
    }
  });
};
const getUserNavbar = function (req, res) {
  res.render("admin/add-logo");
};
const userNavbar = async function (req, res) {
  console.log(req.files)
    try {
      if (!req.files || !req.files.logo) {
        return res.status(400).send('No file uploaded.');
      }
 
      const logo = req.files.logo;
      const uploadPath = path.join(__dirname, '../public/img/', logo.name);
  
      // Move the file to the desired directory
      logo.mv(uploadPath, async (err) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Error uploading file.');
        }
  
        // Save the logo information to the database
        const newLogo = new Logo({
          filename: logo.name,
          path: '/public/img/' + logo.name,
        });
  
        await newLogo.save();
  res.render('admin/add-logo')
      
      });
    } catch (error) {
      console.error("Error uploading logo:", error);
      res.status(500).json({ message: "Error uploading logo." });
    }
  };
  
  
  

async function userDelete(req, res, next) {
  try {

    const userId = req.params.id;
    console.log(userId);
    const deletedUser = await userHandler.deleteUserById(userId);
    console.log("de",deletedUser);
    if (deletedUser) {
     return  res.redirect("/admin/userData");
    } else {
      res.send("failed to delete");
    }
  } catch (err) {
    next(err);
  }
}
const deleteUser = async function (req, res,next) {
  try {
    const deleteUser = await userHandler.deleteUser(req.params.id);
    if (deleteUser) {
      res.redirect("/admin/users");
    }
  } catch (err) {
    res.status(404);
    console.log(err);
  }
};


async function searching(req, res, next) {
  try {
    const word = req.body.keyword;
    const allUsers = await userHandler.searchUsers(word);

    res.render("admin", { user: allUsers });
  } catch (err) {
    next(err);
  }
}



async function userEdit(req, res, next) {
  try {
    const userId = req.params.id;
    const user = await userHandler.findUserById(userId);
    res.render("editUser", { data: user });
  } catch (err) {
    next(err);
  }
}
async function updateEdit(req, res, next) {
  try {
    const { fullName, phone, email } = req.body;
    const userId = req.params.id;
    if (!fullName || !phone || !email) {
      return res.render("editUser", {
        // errorMessage: "All fields required",
        data: req.body,
      });
    }
    console.log("hhh",userId)
    const updateUser = await userHandler.updateUserById(userId, {
      fullName,
      phone,
      email,
      
    });
    if (updateUser) {
       res.redirect("/admin");
    }
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.render("editUser", { errorMessage: err.message, data :req.body});
    }
    next(err);
  }
}

const userAddPage = (req, res) => {
  res.render("adduser");
};
async function userAdd(req, res, next) {
  try {
    const { fullName, phone, email, password } = req.body;

    if (!fullName || !phone || !email || !password) {
      return res.render("adduser", { formData: req.body });
    }

    const existingUser = await userHandler.findUserByEmail(email);
    if (existingUser) {
      return res.render("adduser", {
        errorMessage: "User already exists",
        formData: req.body
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userHandler.createUser({
      fullName,
      phone,
      email,
      hashedPassword
    });

    req.session.user = user;
    // req.session.loggedIn = true;
    req.session.fullName = fullName;
    if (user) {
      req.user = user;
      return res.redirect("/admin");
    }
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.render("addUser", {
        errorMessage: err.message,
        formData: req.body
      });
    }
    next(err);
  }
}
const getUsers = async function (req, res) {
  const users = await userHandler.getAllUsers();
 
  res.render("admin/users", { users: users.users });
  //console.log("users",users)
};
const getAddCoupon = async function (req, res) {
  res.render("admin/add-coupon");
};

const addCoupons = async function (req, res) {
  console.log("req",req.body);
  const addedCoupon = adminHandler.addCouponto(req.body);
  if(addedCoupon){
    res.redirect("/admin/add-coupon");
  }
};

const viewCouponList = async function (req, res) {
  const coupons = await adminHandler.getAllCoupons();
  res.render("admin/coupons", { coupons: coupons });

};
const editcoupon = async function (req, res) {
  const couId = req.params.id;
  const coupon = await adminHandler.getCoupon(couId);
  res.render("admin/edit-coupon", { coupon: coupon });
  console.log("co",coupon);
};
const editCoupon = async function (req, res) {
  try {
    console.log("rr",req.body);
    const editedCoupon = await adminHandler.editCoupon(
      req.params.id,
      req.body
    );

    if (editedCoupon) {
      res.redirect("/admin/userCoupons");
    }
  } catch (err) {
    res.status(404);
    console.log(err);
  }
};
const deleteCoupon = async function (req, res) {
  try {
    const deletedCoupon = await adminHandler.deleteCoupon(req.params.id);
    if (deletedCoupon) {
      res.redirect("/admin/userCoupons");
    }
  } catch (err) {
    res.status(404);
    res.json("error deleting coupon");
  }
};

module.exports = {

  userDelete,
  deleteUser,
  searching,
  userEdit,
  updateEdit,
  userAddPage,
  userAdd,
  adminLoginpage,
  adminLogin,
  getAddCoupon,
  getUsers,
  addCoupons,
  viewCouponList,
  editCoupon,
  editcoupon,
  deleteCoupon,
  adminDashboard,
  getAddBanner,
  addBanner,
  adminBanner,
  getUserNavbar,
  userNavbar,
};
