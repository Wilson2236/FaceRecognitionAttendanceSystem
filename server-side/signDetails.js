// Create records in the "SignInfo" collection to store the UID of users who have already signed their attendance.
const mongoose = require("mongoose");

const SignDetailsSchema = new mongoose.Schema(
  {
    uid: {type: String},
    // date:{type: String}
  },
  {
    collection: "SignInfo",
  }
);

mongoose.model("SignInfo", SignDetailsSchema);