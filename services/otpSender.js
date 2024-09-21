const nodemailer=require('nodemailer');
const otpGenerator= require('otp-generator');
const dotenv = require('dotenv');
dotenv.config();


async function sendOTP(email) {
    const otp = otpGenerator.generate(6, { 
        upperCaseAlphabets: false, 
        digits: true, 
        lowerCaseAlphabets: false, 
        specialChars: false 
    });
    
    let obj = {
        htmltext: `<p>OTP ,This is from WATCHFREAK , please enter the OTP to verify email</p><h3>${otp}</h3>`,
        subject: "Verify OTP"
    };

    try {
        const response = await sendMail(email, obj);
        
        return otp;
    } catch (err) {
        
        throw err;
    }
}

async function sendOrderSuccessmsg(email, username,orderid) {
    let obj = {
        subject: "Order confirmation",
        htmltext: `<h2>Order Confirmation</h2>
                   <p>Hi ${username}</p>
                   <p>Thank you for your order ! <br>Your order id is ${orderid}. We're excited to let
                   you know that your order has been successfully placed.</p>`
    };

    try {
        const response = await sendMail(email, obj);
        
        return response;
    } catch (err) {
        
        throw err;
    }
}

async function emailChangesConfirmation(email,newemail ,username) {
    let obj = {
        subject: "Your email address has been changd",
        htmltext: `<p>Hello ${username}</p>
                   <p>This is to inform you that the email address associated with your
                    account has been changed from ${email} to ${newemail}.
                    If you did not make this change, please contact our support team immediately.</p>
                   <p>Best regards,</p>
                   <p>HELIO the watch store</p>`

            
    };

    try {
        const response = await sendMail(email, obj);
        
        return response;
    } catch (err) {
        
        return err;
    }
}

async function sendMail(email, info) {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        }
    });

    const mailOptions = {
        from: "process.env.EMAIL_USER",
        to: email,
        subject: info.subject,
        html: info.htmltext
    };

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                reject(error);
            } else {
                resolve(info);
            }
        });
    });
}

module.exports= { sendOTP, sendOrderSuccessmsg , emailChangesConfirmation};
