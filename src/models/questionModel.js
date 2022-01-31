const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const questionSchema = new mongoose.Schema(
  {
    description: { type: String, required: true, trim: true },
    tag: [String],
    askedBy: { type: ObjectId, trim: true, ref: "Project6_Users" },
    deletedAt: { type: Date },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project6_Questions", questionSchema);