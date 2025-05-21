const { Schema, model } = require("mongoose");

const bookingSchema = new Schema(
  {
    mentee: { type: Schema.Types.ObjectId, ref: "Mentee", required: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    selectedTime: { type: Date, required: true },
    zoomLink: { type: String },
  },
  { timestamps: true }
);

module.exports = model("Booking", bookingSchema);
