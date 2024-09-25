
const Coupons = require("../models/couponSchema");
const Admin = require("../models/adminSchema");
const bcrypt = require("bcrypt");
const products = require("../models/productSchema");

 




module.exports = {
findAdminByEmailId: async function(id) {
  try {
    return await Admin.findOne({email:id}).lean();
  } catch (error) {
    throw new Error("Error finding admin by email: " + error.message);
  }
 
},

 getAllProducts: async function(){
  const allproducts= await products.find().lean();
  return allproducts;
},
 getCoupon :async function(couId){
  const coupon= await Coupons.findOne({_id:couId}).lean();
  return coupon;
},
  getAllCoupons: async function(){
  const coupon= await Coupons.find().lean();
  return coupon;

},
editCoupon :async function(couId,body) {
const editCoupon = await Coupons.findByIdAndUpdate(couId, body, {
  new: true,
});
return editCoupon;
},

 deleteCoupon:async function (couId) {
const deleteCoupon = await Coupons.findByIdAndDelete(couId);
return deleteCoupon;
},
addCouponto:async function(body) {
  //console.log("body",body)
  const couponAdd = await Coupons.create({
    coupon_name: body.coupon_name,
    coupon_code: body.coupon_code,
    description: body.description,
    discount_value: body.discount_value,
    valid_till: body.valid_till,
  });
  return couponAdd;
}
}