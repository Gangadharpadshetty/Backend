const express = require("express");
const router = express.Router();
 const contactform = require("../controllers/contact_controller");
router.route('/contact').post(contactform);
module.exports = router;
