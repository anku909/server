import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
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
    coverImgData: {
      type: Array,
    },
    location: {
      type: String,
    },
    profileImgData: {
      type: Array,
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
