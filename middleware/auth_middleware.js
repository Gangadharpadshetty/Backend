const jwt = require("jsonwebtoken");
const user = require("../models/user_model");

const auth_middleware = async (req, res, next) => {
    try {
        const token = req.header("Authorization");
        if (!token || !token.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized, token not provided or invalid" });
        }
        
        const jsontoken = token.substring(7); // Remove 'Bearer ' prefix
        console.log("Token from auth middleware:", jsontoken); 

        const isverified = jwt.verify(jsontoken, process.env.jwt_sec_key);
        console.log("Verified JWT token:", isverified);

        const userData = await user.findOne({ email: isverified.email }).select({
            password: 0,
        });
        console.log("User data:", userData);
        if (!userData) {
            return res.status(401).json({ message: "Unauthorized, user not found" });
        }
        
        req.user = userData; // Use parsed token without 'Bearer ' prefix
        req.userId = userData._id;
        next();
    } catch (error) {
        console.error("Error in auth middleware:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = auth_middleware;
