//jshint esversion:6

require("dotenv").config();
const express = require("express");

// const bodyParser = require("body-parser");
// const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");
// const passportLocalMongoose=require('passport-local-mongoose');
// const { v4, stringify } = require("uuid");
const Schema = mongoose.Schema;
const app = express();
const encrypt = require("mongoose-encryption");
const nodemailer = require("nodemailer");
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: process.env.DOMAIN,
  })
);

//models import
const User = require("./model/User");
const Content = require("./model/Content");
const Series = require("./model/Series");
const Payment = require("./model/Payment");

//import routes
const authRoute = require("./routes/auth");
const contentRoute = require("./routes/contents");
const creatorRoute = require("./routes/creators");
const seriesRoute = require("./routes/series");
const loginRoute = require("./routes/login");
const logoutRoute = require("./routes/logout");
const fmRegisterRoute = require("./routes/fm-register");
const contentUploadRoute = require("./routes/content-upload");
const userPurchaseRoute = require("./routes/user-purchase");
const profileRoute = require("./routes/profile");
const orderRoute = require("./routes/orders");

app.use(
  session({
    secret: process.env.SECRET,
    name: "sid",
    resave: false,
    saveUninitialized: false,
    // rolling: false,
    cookie: {
      maxAge: 1000 * 60 * 30,
      sameSite: true,
      // secure: true,
    },
  })
);

//initializing passport
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(
  `mongodb+srv://${process.env.MONGO}:${process.env.MONGO_PASS}@cluster0.sesb2.mongodb.net/${process.env.WEB}?retryWrites=true&w=majority`,
  { useNewUrlParser: true, useUnifiedTopology: true }
);

mongoose.set("useCreateIndex", true);

// mongodb://localhost:27017/contentUpload

// app.use(function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "http://localhost:3000*");
//   res.header("Access-Control-Allow-Credentials", true);
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );
//   next();
// });

passport.use(User.createStrategy());

// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

//Route middleware
app.use("/contents", contentRoute);
app.use("/register", authRoute);
app.use("/creators", creatorRoute);
app.use("/series", seriesRoute);
app.use("/login", loginRoute);
app.use("/fm/register", fmRegisterRoute);
app.use("/content-upload", contentUploadRoute);
app.use("/user-purchase", userPurchaseRoute);
app.use("/profile", profileRoute);
app.use("/logout", logoutRoute);
app.use("/orders", orderRoute);

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
app.listen(port, () => {
  console.log("server running at port: ", port);
});

// const PORT = process.env.PORT || 3001;
// app.listen(PORT, function () {
//   console.log(`Server started on port ${PORT}.. `);
// });
