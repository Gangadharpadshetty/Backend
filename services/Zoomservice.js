// ✅ services/zoomService.js
const jwt = require("jsonwebtoken");
const axios = require("axios");
require("dotenv").config();

const ZOOM_API_KEY = process.env.ZOOM_API_KEY;
const ZOOM_API_SECRET = process.env.ZOOM_API_SECRET;

const generateZoomJWT = () => {
  const payload = {
    iss: ZOOM_API_KEY,
    exp: Math.floor(Date.now() / 1000) + 60 * 5,
  };
  return jwt.sign(payload, ZOOM_API_SECRET);
};

const createZoomMeeting = async (topic, startTime) => {
  const token = generateZoomJWT();
  const response = await axios.post(
    "https://api.zoom.us/v2/users/me/meetings",
    {
      topic,
      type: 2,
      start_time: startTime,
      duration: 60,
      timezone: "Asia/Kolkata",
      settings: { join_before_host: true },
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data.join_url;
};

module.exports = { createZoomMeeting }; const handleConnect = (id) => {
  navigate(`/booking/${id}`);
};