const express = require("express");
var bodyParser = require("body-parser");
const mongoose = require("mongoose");
const route = require("./routes/route.js");
const multer = require('multer')
const app = express();

app.use(bodyParser.json());
app.use(multer().any())
app.use("/", route);

mongoose
  .connect(
    "mongodb+srv://Joy-DB:joy123@cluster0.e8rbz.mongodb.net/Quora",
    { useNewUrlParser: true }
  )
  .then(() => console.log("DB connected & Running"))
  .catch((err) => console.log(err));

app.listen(3000, function () {
  console.log("Express app running on port " +  3000);
});
