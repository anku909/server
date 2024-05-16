import { User } from "../models/user.models.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary_uploads.utils.js";
import streamifier from "streamifier";

const registerUser = async (req, res) => {
  const body = req.body;
  let { name, phoneNo, userName, email, profileImg, coverImg } = body;

  const isProfileImg = req.files && req.files["profileImg"];
  const isCoverImg = req.files && req.files["coverImg"];

  const profileImgStream = isProfileImg
    ? streamifier.createReadStream(req.files["profileImg"][0].buffer)
    : null;
  const coverImgStream = isCoverImg
    ? streamifier.createReadStream(req.files["coverImg"][0].buffer)
    : null;

  const uploadedProfileImg = isProfileImg
    ? await uploadOnCloudinary(profileImgStream)
    : null;

  const uploadedCoverImg = isCoverImg
    ? await uploadOnCloudinary(coverImgStream)
    : null;

  profileImg =
    profileImg || (uploadedProfileImg ? uploadedProfileImg.secure_url : null);

  coverImg =
    coverImg || (uploadedCoverImg ? uploadedCoverImg.secure_url : null);

  let profileImgData = [
    { profileImg: profileImg },
    { public_id: uploadedProfileImg?.public_id || null },
  ];

  let coverImgData = [
    { coverImg: coverImg },
    { public_id: uploadedCoverImg?.public_id || null },
  ];

  // Create user in the database
  await User.create({
    name,
    phoneNo,
    userName,
    email: email.toLowerCase(),
    profileImgData,
    coverImgData,
  });
  res.status(200).json({ success: "done" });
};

const findUser = async (req, res) => {
  const userEmail = req.params.email;
  const user = await User.findOne({ email: userEmail });

  if (!user) {
    return res.status(400).json({ msg: "User not found" });
  }

  return res.status(200).json(user);
};

const findUserProfile = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error finding user profile:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

const updateUser = async (req, res) => {
  const userEmail = req.params.email;
  const body = req.body;
  const { name, phoneNo, userName, location, bio, gender } = body;

  try {
    const existingUser = await User.findOne({ email: userEmail });

    if (!existingUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    let profileImgUrl = existingUser.profileImg;
    let coverImgUrl = existingUser.coverImg;

    if (req.files) {
      try {
        if (req.files["profileImg"]) {
          const profileImgBuffer = req.files["profileImg"][0].buffer;
          const profileImgStream =
            streamifier.createReadStream(profileImgBuffer);

          profileImgUrl = await uploadOnCloudinary(profileImgStream);

          if (!profileImgUrl) {
            throw new Error("Profile image upload failed");
          }
        }

        if (req.files["coverImg"]) {
          const coverImgBuffer = req.files["coverImg"][0].buffer;
          const coverImgStream = streamifier.createReadStream(coverImgBuffer);

          coverImgUrl = await uploadOnCloudinary(coverImgStream);

          if (!coverImgUrl) {
            throw new Error("Cover image upload failed");
          }
        }
      } catch (error) {
        console.error("Error uploading image to Cloudinary:", error.message);
        throw new Error("Image upload failed");
      }
    }

    // Prepare updateFields object with only the fields that have changed
    const updateFields = {};
    if (name) updateFields.name = name;
    if (phoneNo) updateFields.phoneNo = phoneNo;
    if (userName) updateFields.userName = userName;
    if (location) updateFields.location = location;
    if (bio) updateFields.bio = bio;
    if (gender) updateFields.gender = gender;
    if (profileImgUrl) updateFields.profileImg = profileImgUrl.secure_url;
    if (coverImgUrl) updateFields.coverImg = coverImgUrl.secure_url;

    // Update user document with only the changed fields
    const user = await User.findOneAndUpdate(
      { email: userEmail },
      { $set: updateFields },
      { new: true }
    );

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ msg: "Internal server error" });
  }
};

const findUserandDelete = async (req, res) => {
  const userEmail = req.params.email;

  try {
    const user = await User.findOne({ email: userEmail });
    const profileImgId = user.profileImgData[1]?.public_id;
    const coverImgId = user.coverImgData[1]?.public_id;

    if (profileImgId || coverImgId) {
      // Create an array containing all defined IDs
      const deleteIds = [];
      if (profileImgId) deleteIds.push(profileImgId);

      if (coverImgId) deleteIds.push(coverImgId);

      // Delete images
      await deleteFromCloudinary(deleteIds);
    }

    const deletedUser = await User.findOneAndDelete({ email: userEmail });

    if (deletedUser) {
      res.status(200).json({ message: "User deleted successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

export {
  registerUser,
  findUser,
  updateUser,
  findUserProfile,
  findUserandDelete,
};
