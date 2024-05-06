import express from "express";
import { upload } from "../middlewares/multer_fileUploads.middleware.js";
import {
  findUser,
  findUserProfile,
  registerUser,
  updateUser,
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.send("working");
});

router.get("/user/:email", findUser);

router.get("/profile/:id", findUserProfile);

router.post(
  "/signup",
  upload.fields([
    { name: "coverImg", maxCount: 1 },
    { name: "profileImg", maxCount: 1 },
  ]),
  registerUser
);

router.patch(
  "/update/:email",
  upload.fields([
    { name: "coverImg", maxCount: 1 },
    { name: "profileImg", maxCount: 1 },
  ]),
  updateUser
);

export default router;
