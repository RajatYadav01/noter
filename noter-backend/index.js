const express = require("express");
require("dotenv").config({ path: [".env", ".env.example"] });
const cors = require("cors");
const cookieParser = require("cookie-parser");
const databaseConnection = require("./services/database-connection");

const app = express();

app.use(
  cors({
    origin: [process.env.FRONTEND_HOST_URL],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/api/user", require("./routes/user"));
app.use("/api/note", require("./routes/note"));
app.use("/data", express.static("data"));

databaseConnection();

const PORT = process.env.PORT || process.env.ALTERNATIVE_PORT;

app.listen(PORT, () => {
  console.log(`Node server is running at port number: ${PORT}`);
});
