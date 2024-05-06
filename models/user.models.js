import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
    },
    gender: {
      type: String,
    },
    phoneNo: {
      type: Number,
    },
    userName: {
      type: String,
    },
    email: {
      type: String,
      required: true,
    },
    coverImg: {
      type: String,
    },
    location: {
      type: String,
    },
    profileImg: {
      type: String,
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
