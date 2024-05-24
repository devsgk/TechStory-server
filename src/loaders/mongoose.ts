import mongoose from "mongoose";

export default async function mongooseLoader() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "techstory",
    });
    console.log("connected to database");
  } catch (error) {
    console.error(error);
  }
}
