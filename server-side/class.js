const mongoose = require("mongoose");

const ClassSchema = new mongoose.Schema(
  {
    classNumber: {type: String}
  },
  {
    collection: "Class",
  }
);

mongoose.model("Class", ClassSchema);