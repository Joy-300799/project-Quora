const mongoose = require("mongoose");
const answerSchema = new mongoose.Schema(
  {
    answeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    isDeleted:{type:Boolean, default: false}
  },
  { timestamps: true }
);
module.exports = mongoose.model("Answer", answerSchema);
