const mongoose = require('mongoose');

// Define the schema for the Mentee
const menteeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    job_description: {
      type: String,
      required: [true, 'Job description is required'],
      trim: true,
    },
    price_per_hour: {
      type: Number,
      required: [true, 'Price per hour is required'],
      min: [0, 'Price must be a positive number'],
    },
    image: {
      type: String,
      default: 'https://i.ibb.co/smqKv9k/default-avatar.png', // Default image if none is provided
    },
  },
  {
    collection: 'Mentees', // MongoDB collection name
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }
);

// Create the model based on the schema
const Mentee = mongoose.model('Mentee', menteeSchema);

module.exports = Mentee; // Export the model to be used elsewhere
