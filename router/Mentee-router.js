const express = require('express');
const router = express.Router();
const {
  getAllMentees,
  getMenteeById
} = require('../controllers/Mentee_controller');

// Route to get all mentees
router.get('/mentees', getAllMentees);

// Route to get a mentee by ID
router.get('/mentees/:id', getMenteeById);

module.exports = router;

