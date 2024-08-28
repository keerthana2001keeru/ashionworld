const nodemailer = require('nodemailer')
require('dotenv').config()
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})

module.exports = transporter;


// require('dotenv').config()
// const nodemailer = require("nodemailer")
// const {EMAIL_USER,EMAIL_PASS} = process.env

// const transporter = nodemailer.createTransport({ 
//   service:"Gmail",
//   auth:{
//     user:EMAIL_USER,
//     pass:EMAIL_PASS
//   }
// })

// module.exports = transporter;