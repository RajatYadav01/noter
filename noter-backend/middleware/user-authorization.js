const jwt = require("jsonwebtoken");
require("dotenv").config({ path: [".env", ".env.example"] });

module.exports = async (request, response, next) => {
  try {
    const authHeader =
      request.header("authorization") || request.header("Authorization");
    const accessToken = authHeader?.replace("Bearer ", "");
    if (!accessToken)
      return response.status(401).json({ message: "Unauthorized" });
    const payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    request.user = payload.userID;
    next();
  } catch (error) {
    console.error(error.message);
    return response.status(403).json({ message: "Forbidden" });
  }
};
