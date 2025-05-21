const express = require("express");
const router = express.Router();
const { bookSession } = require("../controllers/bookingController");

router.post("/book-session", bookSession);

module.exports = router;