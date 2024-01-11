// storing user details
const mongoose = require("mongoose");

const UserDetailsSchema = new mongoose.Schema(
  {
    fname: String,
    lname: String,
    email: {type: String, unique: true},
    id: {type: String, unique: true},
    password: String,
    userType: String,
    image1: {type: Buffer},
    image2: {type: Buffer},
    image3: {type: Buffer},
    descriptions:{type:Array},
    attendance: {type: Number}
  },
  {
    collection: "UserInfo",
  }
);

mongoose.model("UserInfo", UserDetailsSchema);
