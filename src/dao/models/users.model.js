import mongoose from "mongoose";

const userCollection = "users";

const userSchema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  email: String,
  age: Number,
  password: String,
  role: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  cart: {
    type: mongoose.Types.ObjectId,
    ref: "carts",
  },
});

const userModel = mongoose.model(userCollection, userSchema);

export default userModel;
