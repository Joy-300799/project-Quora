const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const orderSchema = new mongoose.Schema(
  {
    description: { type: String, required: true, trim: true },
    tag: [String],
    askedBy: { type: ObjectId, trim: true, ref: "User" },
    deletedAt: { type: Date, default: null },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", orderSchema);
