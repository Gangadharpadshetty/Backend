// controllers/bookingController.js

const Booking = require("../models/Booking");
const Mentee = require("../models/Mentee-model");
const { createZoomMeeting } = require("../services/zoomService");
const Razorpay = require("razorpay");

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create a payment order
exports.createPaymentOrder = async (req, res) => {
  try {
    const { menteeId } = req.body;

    if (!menteeId) {
      return res.status(400).json({ error: "menteeId is required" });
    }

    const mentee = await Mentee.findById(menteeId);
    if (!mentee) {
      return res.status(404).json({ error: "Mentee not found" });
    }

    const amountInPaise = mentee.price_per_hour * 100;

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    });

    res.status(200).json({ order });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ error: "Failed to create payment order" });
  }
};

// Book a session after payment confirmation
exports.bookSession = async (req, res) => {
  try {
    const {
      menteeId,
      userName,
      userEmail,
      selectedTime,
      razorpayPaymentId,
      razorpayOrderId,
    } = req.body;

    // Validate required fields
    if (
      !menteeId ||
      !userName ||
      !userEmail ||
      !selectedTime ||
      !razorpayPaymentId ||
      !razorpayOrderId
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const mentee = await Mentee.findById(menteeId);
    if (!mentee) {
      return res.status(404).json({ error: "Mentee not found" });
    }

    // Optional: Verify Razorpay payment signature here for added security

    // Create a Zoom meeting
    const meeting = await createZoomMeeting(
      `Session with ${mentee.name}`,
      new Date(selectedTime)
    );

    // Save the booking details
    const booking = new Booking({
      mentee: menteeId,
      userName,
      userEmail,
      selectedTime,
      zoomLink: meeting.join_url,
      paymentId: razorpayPaymentId,
      orderId: razorpayOrderId,
    });

    await booking.save();

    res.status(201).json({
      message: "Session booked successfully",
      zoomLink: meeting.join_url,
    });
  } catch (error) {
    console.error("Error booking session:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
