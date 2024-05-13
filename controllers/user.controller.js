import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary_uploads.utils.js";

const registerUser = async (req, res) => {
  const body = req.body;
  let { name, phoneNo, userName, email, profileImg, coverImg } = body;

  const isProfileImgFile = req.files && req.files["profileImg"];
  const isCoverImgFile = req.files && req.files["coverImg"];

  // Get local paths of uploaded images
  const profileImgLocalPath = isProfileImgFile
    ? req.files["profileImg"][0].path
    : null;
  const coverImgLocalPath = isCoverImgFile
    ? req.files["coverImg"][0].path
    : null;

  // If profileImg is a file, upload it to Cloudinary
  const uploadedProfileImg = isProfileImgFile
    ? await uploadOnCloudinary(profileImgLocalPath)
    : null;

  // If coverImg is a file, upload it to Cloudinary
  const uploadedCoverImg = isCoverImgFile
    ? await uploadOnCloudinary(coverImgLocalPath)
    : null;

  // If profileImg is provided by the client, use it; otherwise, use the uploaded URL
  profileImg =
    profileImg || (uploadedProfileImg ? uploadedProfileImg.secure_url : null);

  // If coverImg is provided by the client, use it; otherwise, use the uploaded URL
  coverImg =
    coverImg || (uploadedCoverImg ? uploadedCoverImg.secure_url : null);

  // Create user in the database
  await User.create({
    name,
    phoneNo,
    userName,
    email: email.toLowerCase(),
    coverImg,
    profileImg,
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
      // Upload profile image if exists
      if (req.files["profileImg"]) {
        profileImgUrl = await uploadOnCloudinary(
          req.files["profileImg"][0].path
        );
        if (!profileImgUrl) throw new Error("Profile image upload failed");
      }

      // Upload cover image if exists
      if (req.files["coverImg"]) {
        coverImgUrl = await uploadOnCloudinary(req.files["coverImg"][0].path);
        if (!coverImgUrl) throw new Error("Cover image upload failed");
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
