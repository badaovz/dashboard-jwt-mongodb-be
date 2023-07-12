const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      require: true,
      min: 4,
      max: 30,
      unique: true,
    },
    email: {
      type: String,
      require: true,
      max: 50,
      unique: true,
    },
    phone: {
      type: String,
      require: true,
      min: 9,
      max: 11,
    },
    img: {
      type: String,
      require: true,
    },
    address: {
      type: String,
      require: true,
      max: 50,
    },
    country: {
      type: String,
      require: true,
      max: 30,
    },
    status: {
      type: String,
      require: true,
      max: 20,
    },
    age: {
      type: Number,
      require: true,
      max: 200,
    },
    password: {
      type: String,
      require: true,
      min: 6,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);