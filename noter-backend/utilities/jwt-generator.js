const jwt = require("jsonwebtoken");

function jwtGenerator(userID, secretKey, expiryTime) {
  const payload = {
    userID: userID,
  };
  return jwt.sign(payload, secretKey, { expiresIn: parseInt(expiryTime, 10) });
}

module.exports = jwtGenerator;
