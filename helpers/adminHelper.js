const { addCoupon } = require("../controller/adminController");
const Coupons = require("../models/couponSchema");
const Admin = require("../models/adminSchema");
const bcrypt = require("bcrypt");
const products = require("../models/productSchema");
async function findAdminByEmail(email) {
  try {
    return await Admin.findOne({ email: email });
  } catch (error) {
    throw new Error("Error finding admin by email: " + error.message);
  }
 
}
async function getAllProducts(){
  const allproducts= await products.find().lean();
  return allproducts;
}
 async function addCouponto(body) {
  console.log("body",body)
  const couponAdd = await Coupons.create({
    coupon_name: body.coupon_name,
    coupon_code: body.coupon_code,
    description: body.description,
    discount_value: body.discount_value,
    valid_till: body.valid_till,
  });
  return couponAdd;
}
 async function getCoupon(couId){
  const coupon= await Coupons.findOne({_id:couId}).lean();
  return coupon;
}

async function  getAllCoupons(){
    const coupons= await Coupons.find().lean();
    return coupons;

}
 async function editCoupon (couId,body) {
  const editCoupon = await Coupons.findByIdAndUpdate(couId, body, {
    new: true,
  });
  return editCoupon;
}

 async function deleteCoupon (couId) {
  const deleteCoupon = await Coupons.findByIdAndDelete(couId);
  return deleteCoupon;
}

module.exports = {
  findAdminByEmail,
  addCouponto,
  getAllCoupons,
  editCoupon,
  getCoupon,
  deleteCoupon,
  getAllProducts,
};
