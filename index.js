//jshint esversion:6

require("dotenv").config();
const express = require("express");

// const bodyParser = require("body-parser");
// const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");
const MongoStore = require("connect-mongo");
// const passportLocalMongoose=require('passport-local-mongoose');
// const { v4, stringify } = require("uuid");
const Schema = mongoose.Schema;
const app = express();
const encrypt = require("mongoose-encryption");
const nodemailer = require("nodemailer");
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());
// app.use(
//   cors({
//     credentials: true,
//     origin: process.env.DEVELOPMENT || process.env.DOMAIN,
//   })
// );

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
const watchListRoute = require("./routes/watchlist");
const conversionRoute = require("./routes/conversion");
const revenueRoute = require("./routes/revenue");
const searchRoute = require("./routes/search");
const accountRoute = require("./routes/account");

const mongoUrl = `mongodb+srv://${process.env.MONGO}:${process.env.MONGO_PASS}@cluster0.sesb2.mongodb.net/${process.env.WEB}?retryWrites=true&w=majority`;

//Route middleware
try {
  app.set("trust proxy", 1); // trust first proxy

  const sessionOptions = {
    secret: process.env.SECRET,
    name: "sid",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: mongoUrl }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 5,
    },
  };
  if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
    sessionOptions.cookie.secure = true;
    sessionOptions.cookie.sameSite = "none";
    sessionOptions.proxy = true;
  }

  app.use(session(sessionOptions));

  //initializing passport
  app.use(passport.initialize());
  app.use(passport.session());

  app.use(
    cors({
      credentials: true,
      origin: process.env.DEVELOPMENT || process.env.DOMAIN,
    })
  );

  mongoose.connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

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
  app.use("/contents", contentRoute);
  app.use("/register", authRoute);
  app.use("/creators", creatorRoute);
  app.use("/series", seriesRoute);
  app.use("/login", loginRoute);
  app.use("/fm-register", fmRegisterRoute);
  app.use("/content-upload", contentUploadRoute);
  app.use("/user-purchase", userPurchaseRoute);
  app.use("/profile", profileRoute);
  app.use("/logout", logoutRoute);
  app.use("/orders", orderRoute);
  app.use("/watchlist", watchListRoute);
  app.use("/conversion", conversionRoute);
  app.use("/revenue", revenueRoute);
  app.use("/search", searchRoute);
  app.use("/account", accountRoute); //need to pass creatorId in params

  let port = process.env.PORT;
  if (port == null || port == "") {
    port = 8000;
  }
  app.listen(port, () => {
    console.log("server running at port: ", port);
  });
} catch (e) {
  console.log(e.message);
}
