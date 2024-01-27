const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const user = new Schema({
  name: {
    type: String,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    default: 0,
    min: [18, "Age must be above or equal to 18"],
  },
});
module.exports = mongoose.model("user", user);
