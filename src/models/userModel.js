const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fname: { type: String, required: true,trim:true },
    lname: { type: String, required: true ,trim:true},
    email: { type: String, required: true, unique: true,trim:true },
    phone: { type: String, unique: true ,trim:true},
    password: { type: String, required: true}, //encrypted password by hashing
    creditScore :{type:Number, default:500}
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
