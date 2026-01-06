const adminMiddleware = async (req, res, next) => {
  try {
    const isAdmin = req.user && req.user.isadmin;

    if (!isAdmin) {
      return res
        .status(403)
        .json({ message: "Access denied. User is not an admin." });
    }

    // If user is an admin, proceed to the next middleware
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = adminMiddleware;
