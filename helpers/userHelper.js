
const bcrypt = require("bcrypt");
const Token = require("../models/token");
const { User } = require("../models/userSchema");
const crypto = require("crypto")


async function updateUserById(userId, updateData) {
  return await User.findByIdAndUpdate(
    { _id: userId },
    { $set: updateData },
    { new: true }
  );
}



async function searchUsers(keyword) {
  try {
    return await User.find({
      fullName: { $regex: `^${keyword}`, $options: "i" },
      isDeleted: false,
    }).lean();
  } catch (error) {
    throw new Error("Error searching users: " + error.message);
  }
}

module.exports = {
  updateUserById,
  searchUsers,
};

module.exports={
   findUserById :async function (id) {
    try {
      return await User.findById(id).lean();
    } catch (error) {
      throw new Error("Error finding user by ID: " + error.message);
    }
  },
  getAllUsers : async function() {
 
    const users = await User.find({ isDeleted: false }).lean();
     console.log("users",users);
    const totalUsers = await User.countDocuments({ isDeleted: false });
  
    return {
      users,
      totalUsers
      
    };
    // return await User.find({isDeleted:false}).lean();
  }
,  
 findUsersWithPagination :   async function (query, limit, skip) {
    return await User.find(query).limit(limit).skip(skip).lean();
  },
   countUsers:async function (query) {
    return await User.countDocuments(query);
  },
  deleteUserById: async function (userId) {
    try{
      return await User.findByIdAndUpdate(userId, { isDeleted: true });
    }catch(error){
      throw new Error( error.message);
    }
    },
  findUserByEmail: async function(email) {
   // console.log(email)
    try{
    return await User.findOne({ email: email, isDeleted: false , isVerified:true});
    }catch(error){
      throw new Error("Error finding user by email: " + error.message);
  }},
  addToken: async function (token) {
    const tokenAdd = await Token.create({ token });
    return tokenAdd;
  },

  findToken: async function (token) {
    const dbToken = await Token.findOne({ token: token });
    return dbToken;
  },
  createUser:async function ({ fullName, phone, email, hashedPassword }) {
    if (!hashedPassword) {
      throw new Error("Password is required");
    }
    
    const password = hashedPassword;
   
    return await User.create({
      fullName,
      phone,
      email,
      password,
      isDeleted: false,
      isVerified:true
    });
  },
  editUser: async function (userData, id) {
    const { name, phone } = userData;
    const user = await User.findByIdAndUpdate(
      id,
      { name, phone },
      { new: true }
    );
    if (user) return user;
  },
  updateUserStatus: async function (email) {
    const result = await User.findOneAndUpdate(
      { email: email },
      { $set: { isVerified: true } },
      { new: true }
    );
    return result;
  },
  deleteUser: async function(userId){
    const user = await User.findByIdAndDelete(userId);
    if(user){
      const deletedUser = await DeletedUser.create({
        name: user.name,
        email: user.email,
        phone: user.phone,
      })
      return user;
    }
  },

  passReset: async function (password, id) {
    const result = await User.findOneAndUpdate(
      { _id: id },
      { $set: { password: password } },
      { new: true }
    );
    return result;
  },
getCart: async function (userId) {
    const cart = await User.findOne({ _id: userId })
      .populate("cart.product_id")
      .lean();
    if (cart.cart) {
      let totalPrice = 0;
      for (const cartItem of cart.cart) {
        if (cartItem.product_id && cartItem.product_id.price) {
          totalPrice += cartItem.quantity * cartItem.product_id.price;
        }
      }

      return { cart, totalPrice };
    } else {
      return { cart };
    }
  },

  addItemsToCart: async function (userId, proId) {
    const user = await User.findOne({ _id: userId });
    if (!user) {
      logger.log({ message: "user not found" });
    }
    const existingItemIndex = user.cart.findIndex(
      (cartItem) => cartItem.product_id.toString() == proId
    );

    if (existingItemIndex !== -1) {
      user.cart[existingItemIndex].quantity += 1;
    } else {
      user.cart.push({ product_id: proId, quantity: 1 });
    }
    const newCart = await User.updateOne({ _id: userId }, { cart: user.cart });
    return newCart;
  },

  addCartGuest: async function (userId, proId, quantity) {
    const user = await User.findOne({ _id: userId });
    const existingItemIndex = user.cart.findIndex(
      (cartItem) => cartItem.product_id.toString() == proId
    );
    if (existingItemIndex !== -1) {
      user.cart[existingItemIndex].quantity += quantity;
    } else {
      user.cart.push({ product_id: proId, quantity: quantity });
    }
    const newCart = await User.updateOne({ _id: userId }, { cart: user.cart });
  },

  updateCart: async function (proId, count, userId) {
    try {
      const user = await User.findOne({ _id: userId });
      if (!user) {
        logger.error({ message: "cart not found" });
      }

      const cartItem = await User.cart.find((item) => item.product_id == proId);
      const currentQuantity = cartItem ? cartItem.quantity : 0;
      const updatedCount = Math.max(currentQuantity + count, 1);
      const updatedCart = await User.updateOne(
        { _id: userId, "cart.product_id": proId },
        { $set: { "cart.$.quantity": updatedCount } }
      );

      if (updatedCount == 0) {
        const newCart = await User.updateOne(
          { _id: userId },
          { $pull: { cart: { product_id: proId } } },
          { new: true }
        );
      } else {
        //logger.error("error deleting cart");
      }

      const updatedUserCart = await User.findOne({ _id: userId });
      return updatedUserCart;
    } catch (error) {
      //logger.error("cart updation failed");
    }
  },
  cartDelete: async function (userId, proId) {
    try {
      const cart = await User.findOne({ _id: userId });
      if (cart) {
        const deletedCart = await User.updateOne(
          { _id: userId },
          { $pull: { cart: { product_id: proId } } },
          { new: true }
        );
        return deletedCart;
      } else {
       console.log({ message: "cart not found" });
      }
    } catch (error) {}
  },
  deleteCartAfterOrder: async function (userId) {
    try {
      const cart = await User.findOneAndUpdate(
        { _id: userId },
        { $unset: { cart: 1 } },
        { new: true }
      );
      return cart;
    } catch (error) {
      logger.error({ message: "error deleting cart" });
    }
  },
  getWishlist: async function (userId, page, limit) {
    const skip = (page -1)* limit;
    const wishlist = await User.findOne({ _id: userId })
      .populate({
        path:"wishlist.product_id",
      options:{
        skip:skip,
        limit:limit
      }
      })
      .lean();
const totalItems = wishlist.wishlist.length;
    return{

    items: wishlist.wishlist,
    totalItems
    };
  },

  wishlistAdd: async function (userId, proId) {
    const user = await User.findOne({ _id: userId });
    const index = user.wishlist.findIndex(
      (item) => item.product_id.toString() === proId.toString()
    );

    if (index === -1) {
      user.wishlist.push({ product_id: proId });
    } else {
      user.wishlist.splice(index, 1);
    }

    const updatedUser = await user.save();
    return updatedUser;
  },

  wishlistDelete: async function (userId, proId) {
    const delWishlist = await User.updateOne(
      { _id: userId },
      { $pull: { wishlist: { product_id: proId } } },
      { new: true }
    );
    const user = await User.findOne({ _id: userId });
    return delWishlist;
  },

  updateCoupon: async function (userid, code, discount) {
    try {
      const coupon = await User.updateOne(
        { _id: userid },
        { "coupon.code": code, "coupon.discount": discount },
        { new: true }
      );
    } catch (error) {
      console.log(error);
    }
  },

  couponRemove: async function (userid, code, discount) {
    try {
      const updatedUser = await User.findOneAndUpdate(
        { _id: userid },
        { $unset: { coupon: 1 } },
        { new: true }
      );
      return updatedUser;
    } catch (error) {
      console.log(error);
    }
  },
saveResetToken: async function (userId, resetToken, resetExpires) {
  try {
    console.log("object",userId)
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    await User.findByIdAndUpdate(userId, {
      resetPasswordToken: hashedToken,
      resetPasswordExpires: resetExpires,
    });
  } catch (err) {
    throw new Error('Error saving reset token');
  }
},
 findUserByResetToken : async function(resetToken) {
  try {
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }, // Ensure token is not expired
    });
   // console.log("rrr",user);
    return user;  // Returns user object if the token is valid and not expired
  } catch (err) {
    throw new Error('Error finding user by reset token');
  }
},
updatePassword : async function (userId, hashedPassword) {
  console.log("hash",hashedPassword)
  console.log("userid",userId)
  try {
    await User.findByIdAndUpdate(userId, {
      password: hashedPassword,
      resetPasswordToken: null,  // Clear the reset token after password update
      resetPasswordExpires: null,
    });
  } catch (err) {
    throw new Error('Error updating password');
  }
},
 generateResetToken : () =>{
  return crypto.randomBytes(32).toString('hex');  // Generate a random token
},
 clearResetToken : async function (userId)  {
  try {
    await User.findByIdAndUpdate(userId, {
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });
  } catch (err) {
    throw new Error('Error clearing reset token');
  }
}



};