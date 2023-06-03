const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const authRouter = require("./routes/auth-route");
const teamRouter = require("./routes/team-route");

const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/team", teamRouter);

const db = process.env.DATABASE;

async function startServer() {
  const port = process.env.PORT || 8080;
  try {
    const response = await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("database connection successful");
    app.listen(port, () => {
      console.log(`app running on port ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
}
startServer();
