const mongoose = require("mongoose");

// Define Address Schema

const addressSchema = mongoose.Schema({
  userid: {
    type: Schema.Types.ObjectId,
    required: true
},  
  recipient_name: { type: String, required: true },
  street_address_line1: { type: String, required: true },
  street_address_line2: { type: String },
  city: { type: String, required: true },
  postal_code: { type: String, required: true },
  mobile : {type: String, required: true},
  is_deleted : {type: Boolean, default : false}
},{timestamps: true});

// Create Address Model
const Address = mongoose.model('addresses', addressSchema);


addressSchema.index({is_deleted: 1})
export default Address;