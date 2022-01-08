const express = require("express");
var bodyParser = require("body-parser");
const mongoose = require("mongoose");
const route = require("./routes/route.js");
const multer = require('multer')
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer().any())
app.use("/", route);

mongoose
  .connect(
    "mongodb+srv://users-open-to-all:hiPassword123@cluster0.uh35t.mongodb.net/Joy_Bhattacharya-DB?retryWrites=true&w=majority",
    { useNewUrlParser: true }
  )
  .then(() => console.log("DB connected & Running"))
  .catch((err) => console.log(err));

app.listen(process.env.PORT || 3000, function () {
  console.log("Express app running on port " + (process.env.PORT || 3000));
});
