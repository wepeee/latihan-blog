const mongoose = require("mongoose");
const User = require("../model/user");

mongoose.connect("mongodb://127.0.0.1:27017/wepe");

// const User1 = new User({
//   email: "wepe@gmail.com",
//   password: "123456",
// });

// User1.save().then((user) => {
//   console.log(user);
// });
