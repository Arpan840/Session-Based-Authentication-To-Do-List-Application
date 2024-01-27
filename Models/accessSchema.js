const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const accessSchema = new Schema({
  sessionId: {
    require: true,
    type: String,
  },
  time: {
    type: String,
    require: true,
  },
});

module.exports = mongoose.model("access", accessSchema);
