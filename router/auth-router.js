const express = require("express");
const router = express.Router();
const {Register,home,login,User}= require("../controllers/auth-controller.js");
const validate = require("../middleware/valid_middleware.js");
const {signupSchema,LoginSchema} = require("../validator/auth_valid.js");
const authmiddleware= require("../middleware/auth_middleware")
router.route('/register').post(validate(signupSchema),Register);
router.route('/').get(home);
router.route('/login').post(validate(LoginSchema),login);
router.route('/User').get(authmiddleware, User);
module.exports = router;
