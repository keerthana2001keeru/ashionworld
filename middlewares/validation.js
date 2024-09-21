const { check, validationResult } = require('express-validator');

const userRegisterValidation = [
  check('fullName')
    .isLength({ min: 3, max: 64 })
    .withMessage('Full name must be between 3 and 64 characters long.')
    .trim()
    .not().isEmpty()
    .withMessage('Full name is required.'),
  check('phone')
    .isLength({ min: 8, max: 12 })
    .withMessage('Phone number must be between 8 and 12 digits.')
    .isNumeric()
    .withMessage('Phone number must contain only digits.')
    .trim()
    .not().isEmpty()
    .withMessage('Phone number is required.'),
  check('email')
    .isEmail()
    .withMessage('Please provide a valid email.')
    .trim()
    .not().isEmpty()
    .withMessage('Email is required.'),
  check('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long.')
    .not().isEmpty()
    .withMessage('Password is required.')
];


const userUpdateValidate = [
  check('fullName')
    .isLength({ min: 3, max: 64 })
    .withMessage('Full name must be between 3 and 64 characters long.')
    .trim()
    .not().isEmpty()
    .withMessage('Full name is required.'),
  check('phone')
    .isLength({ min: 8, max: 12 })
    .withMessage('Phone number must be between 8 and 12 digits.')
    .isNumeric()
    .withMessage('Phone number must contain only digits.')
    .trim()
    .not().isEmpty()
    .withMessage('Phone number is required.'),
  check('email')
    .isEmail()
    .withMessage('Please provide a valid email.')
    .trim()
    .not().isEmpty()
    .withMessage('Email is required.'),
 
];
// const adminRegisterValidation = [
//   check('fullName')
//     .isLength({ min: 3, max: 64 })
//     .withMessage('Full name must be between 3 and 64 characters long.')
//     .trim()
//     .not().isEmpty()
//     .withMessage('Full name is required.'),
//   check('phone')
//     .isLength({ min: 8, max: 12 })
//     .withMessage('Phone number must be between 8 and 12 digits.')
//     .isNumeric()
//     .withMessage('Phone number must contain only digits.')
//     .trim()
//     .not().isEmpty()
//     .withMessage('Phone number is required.'),
//   check('email')
//     .isEmail()
//     .withMessage('Please provide a valid email.')
//     .trim()
//     .not().isEmpty()
//     .withMessage('Email is required.'),
//   check('password')
//     .isLength({ min: 6 })
//     .withMessage('Password must be at least 6 characters long.')
//     .not().isEmpty()
//     .withMessage('Password is required.')
// ];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render('user/register', { errorMessage: errors.array()[0].msg ,formData:req.body});
  }
  next();
};
const validatee = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render('adduser', { errorMessage: errors.array()[0].msg ,formData:req.body});
  }
  next();
};
const validat = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render('editUser', { errorMessage: errors.array()[0].msg ,data:req.body});
  }
  next();
};

module.exports = { userRegisterValidation, validate ,validatee,validat,userUpdateValidate};
