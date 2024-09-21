import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/users.js";
import dotenv from 'dotenv';
dotenv.config()
function passportGoogleOauth(passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.CALLBACK_URL,
      },
      function (accessToken, refreshToken, profile, cb) {
        
        User.findOne({ email: profile.emails.value })
          .then((user) => {
            if (user) {
              return cb(null, user);
            } else {
              User.create({
                username: profile.displayName,
                email: profile._json.email,
                mobile: null,
                password: null,
              })
                .then((user) => {
                  cb(null, { username: user.username, email: user.email, _id: user._id});
                })
                .catch((err) => {
                  cb(err, null);
                });
            }
          })
          .catch((err) => {
            cb(err, null);
          });
      }
    )
  );

  passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
      
      return cb(null, user._id);
    });
  });

  passport.deserializeUser((id, cb) => {
    User.findById(id, { password: 0 })
      .then((user) => {
       
        cb(null, user);
      })
      .catch((err) => {
        cb(err);
      });
  });
}

export default passportGoogleOauth;
