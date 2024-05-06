import express from "express";
import cors from "cors";
import { connectMongoDb } from "./mongodb.js";
import router from "./routes/routes.js";
import { config } from "dotenv";
config();

const app = express();
const PORT = process.env.PORT || 3000;
const url = process.env.MONGODB_URI;

// cors middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// importing mongodb function
connectMongoDb(url);

// importing routes

app.use("/api", router);

app.get("/", (req, res) => {
  res.send("server running");
});

// server setup
app.listen(PORT, () => {
  console.log("server running");
});
