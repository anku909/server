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

const allowedOrigins = [
  "http://localhost:5173",
  "https://social-media-login-signup-project.vercel.app/login",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Check if the request origin is in the allowedOrigins array or is undefined (for non-browser requests)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true); // Allow the request
      } else {
        callback(new Error("Not allowed by CORS")); // Block the request
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], // Allow all HTTP methods
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: allowedOrigins,
  })
);

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
