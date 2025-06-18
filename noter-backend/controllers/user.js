require("dotenv").config({ path: [".env", ".env.example"] });
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const jwtGenerator = require("../utilities/jwt-generator");
const User = require("../models/user");

const newUser = async (request, response) => {
  try {
    const { name, emailAddress, password } = request.body;
    const user = await User.findOne({ emailAddress: emailAddress });
    if (user)
      return response.status(409).json({
        message: "User already exists with the entered email address",
      });

    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const bcryptPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ name, emailAddress, password: bcryptPassword });
    await newUser.save();

    return response.status(201).json({
      message: "Sign up successful",
    });
  } catch (error) {
    console.error(error.message);
    return response.status(500).json({ message: "Internal server error" });
  }
};

const authenticate = async (request, response) => {
  try {
    const { emailAddress, password } = request.body;
    const user = await User.findOne({ emailAddress: emailAddress });
    if (!user)
      return response.status(404).json({
        message:
          "User does not exist. Please check if the entered email address is correct.",
      });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return response
        .status(401)
        .json({ message: "Email address or password is incorrect." });

    const accessToken = jwtGenerator(
      user.id,
      process.env.ACCESS_TOKEN_SECRET,
      process.env.ACCESS_TOKEN_EXPIRY_TIME
    );
    const refreshToken = jwtGenerator(
      user.id,
      process.env.REFRESH_TOKEN_SECRET,
      process.env.REFRESH_TOKEN_EXPIRY_TIME
    );

    const isLocalServer = process.env.BACKEND_HOST_URL?.includes("localhost");

    response.cookie("token", refreshToken, {
      withCredentials: true,
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: !isLocalServer,
      sameSite: isLocalServer ? "Lax" : "None",
    });

    return response.status(200).json({
      message: "Logged in successfully",
      token: accessToken,
      user: {
        id: user._id,
        name: user.name,
      },
    });
  } catch (error) {
    console.error(error.message);
    response.status(500).json({ message: "Internal server error" });
  }
};

const refresh = async (request, response) => {
  try {
    const cookies = request.cookies;
    if (!cookies?.token)
      return response.status(401).json({ message: "Unauthorized" });

    const refreshToken = cookies.token;
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
        if (err) {
          response.clearCookie("token", {
            withCredentials: true,
            httpOnly: true,
          });
          return response.status(403).json({ message: "Forbidden" });
        } else {
          const userID = decoded.userID;
          const user = await User.findById(userID);
          if (!user)
            return response.status(401).json({ message: "Unauthorized" });
          const accessToken = jwtGenerator(
            user.id,
            process.env.ACCESS_TOKEN_SECRET,
            process.env.ACCESS_TOKEN_EXPIRY_TIME
          );

          return response.status(200).json({
            token: accessToken,
            user: {
              id: user._id,
              name: user.name,
            },
          });
        }
      }
    );
  } catch (error) {
    console.error(error.message);
    return response.status(500).json({ message: "Internal server error" });
  }
};

const resetPassword = async (request, response) => {
  try {
    const { emailAddress, password } = request.body;
    const user = await User.findOne({ emailAddress: emailAddress });
    if (!user)
      return response.status(404).json({
        message:
          "User does not exist. Please check if the entered email address is correct.",
      });

    let bcryptPassword;
    if (password !== "") {
      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      bcryptPassword = await bcrypt.hash(password, salt);
    }

    if (bcryptPassword) {
      user.password = bcryptPassword;
      user.updatedAt = Date.now();
      await user.save();
    }

    return response.status(201).json({
      message: "Password reset successful",
    });
  } catch (error) {
    console.error(error.message);
    return response.status(500).json({ message: "Internal server error" });
  }
};

const logout = async (request, response) => {
  try {
    const cookies = request.cookies;
    if (!cookies?.token)
      return response.status(401).json({ message: "Unauthorized" });

    response.clearCookie("token", {
      withCredentials: true,
      httpOnly: true,
    });

    return response.status(200).json({
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error(error.message);
    response.status(500).json({ message: "Internal server error" });
  }
};

const getUser = async (request, response) => {
  try {
    const { id } = request.query;
    const user = await User.findOne({ _id: id });
    if (!user)
      return response.status(404).json({
        message: "User not found.",
      });

    return response.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        emailAddress: user.emailAddress,
      },
    });
  } catch (error) {
    console.error(error.message);
    return response.status(500).json({ message: "Internal server error" });
  }
};

const updateUser = async (request, response) => {
  try {
    const { id, name, emailAddress, password } = request.body;
    const user = await User.findOne({ _id: id });
    if (!user)
      return response.status(404).json({
        message: "User not found.",
      });

    let bcryptPassword;
    if (password !== "") {
      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      bcryptPassword = await bcrypt.hash(password, salt);
    }

    const newUserDetails = {
      name: name,
      emailAddress: emailAddress,
      password: bcryptPassword,
      updatedAt: Date.now(),
    };
    Object.keys(newUserDetails).forEach(
      (i) => newUserDetails[i] == "" && delete newUserDetails[i]
    );

    const updatedUser = await User.findOneAndUpdate(
      { _id: id },
      newUserDetails,
      { new: true }
    );

    return response.status(201).json({
      message: "User details updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        emailAddress: updatedUser.emailAddress,
      },
    });
  } catch (error) {
    console.error(error.message);
    return response.status(500).json({ message: "Internal server error" });
  }
};

const deleteUser = async (request, response) => {
  try {
    const { id } = request.query;
    const user = await User.findOne({ _id: id });
    if (!user)
      return response.status(404).json({
        message: "User not found.",
      });

    await User.findByIdAndDelete(id);

    return response.status(200).json({
      message: "User successfully deleted",
    });
  } catch (error) {
    console.error(error.message);
    return response.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  newUser,
  authenticate,
  refresh,
  logout,
  getUser,
  updateUser,
  resetPassword,
  deleteUser,
};
