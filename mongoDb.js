import mongoose from "mongoose";

const connectMongoDb = async (url) => {
  try {
    await mongoose.connect(url);
    console.log("MongoDb Connected");
  } catch (error) {
    console.log("Failed to connect to MongoDB", error);
  }
};

export { connectMongoDb };
