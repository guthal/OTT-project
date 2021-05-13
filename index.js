//jshint esversion:6

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session =require('express-session');
const passport =require('passport');
// const passportLocalMongoose=require('passport-local-mongoose');
const { v4, stringify } = require("uuid");
const Schema = mongoose.Schema;
const app = express();
const encrypt = require("mongoose-encryption");
const nodemailer = require("nodemailer");
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());

//models import
const User=require("./model/User");
const Content=require("./model/Content");
const Series=require("./model/Series");
const Payment=require("./model/Payment");

//import routes
const authRoute=require('./routes/auth');
const contentRoute=require('./routes/contents');
const creatorRoute=require('./routes/creators');
const seriesRoute=require('./routes/series');
const loginRoute=require('./routes/login');
const fmRegisterRoute=require('./routes/fm-register');

app.use(session({
  secret:process.env.SECRET,
  resave:false,
  saveUninitialized:false
}))
//initializing passport
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(
  `mongodb+srv://${process.env.MONGO}:${process.env.MONGO_PASS}@cluster0.sesb2.mongodb.net/${process.env.WEB}?retryWrites=true&w=majority`,
  { useNewUrlParser: true, useUnifiedTopology: true }
);

mongoose.set("useCreateIndex",true);

// mongodb://localhost:27017/contentUpload

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

passport.use(User.createStrategy());

// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

passport.serializeUser(function(user, done) {
  console.log("serialize code: ",user)
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    console.log("Deserialize code: ",id)
    done(err, user);
  });
});



// Util function
const getUserPurchase = (req, res, contentId) => {
  const contentData = [];
  const purchaseData = [];
  let contentIds;
  return User.find({ userId: req.params.userId }, (err, user) => {
    if (err || !(user && user[0]))
      return res.status(404).send({ code: 404, message: "User not found" });
  })
    .then((user) => {
      contentIds = contentId ? [contentId] : user[0].history;
    })
    .then(() => {
      return Payment.find(
        {
          userId: req.params.userId,
          contentId: contentIds,
        },
        (err, purchase) => {
          if (err || !purchase)
            return res
              .status(404)
              .send({ code: 404, message: "Purchase date not available" });
        }
      );
    })
    .then((purchase) => {
      purchase.map((val) => {
        purchaseData.push({
          purchaseDate: val.date,
          contentId: val.contentId,
          purchaseId: val.payId,
          purchaseType: val.type,
          purchasePrice: val.amount,
        });
      });
    })
    .then(() => {
      return Content.find({ contentId: contentIds }, (err, content) => {
        if (err || !content)
          return res
            .status(404)
            .send({ code: 404, message: "Content not found" });
      });
    })
    .then((content) => {
      content.map((val) => {
        contentData.push({
          contentId: val.contentId,
          contentTitle: val.title,
          thumbnail: val.thumbnail,
        });
      });
    })
    .then(() => {
      return purchaseData.map((data) => {
        const purchaseContent = contentData.find(
          (content) => content.contentId === data.contentId
        );

        return {
          userId: req.params.userId,
          ...data,
          ...purchaseContent,
        };
      });
    })
    .then((purchasedContentData) => res.status(200).send(purchasedContentData));
};

// test with this user f524e638-0c83-42f8-b954-0da734c41fa5
//passing the whole content as response need to see how to send only the reqired ones
app.get("/user-purchase/:userId", (req, res) => {
  getUserPurchase(req, res);
});

app.get("/user-purchase/:userId/contents/:contentId", (req, res) => {
  getUserPurchase(req, res, req.params.contentId);
});

app.get("/upload/content/:userId", (req, res) => {
  User.findOne({ userId: req.params.userId }, function (err, content) {
    res.render("weekly", {
      content: content.userId,
    });
  });
});

app.get("/profile/:userId", (req, res) => {
  if(req.isAuthenticated()&& req.user.utype==1 && req.user.userId===req.params.userId){
    Content.find({ userId: req.params.userId }, (err, weeks) => {
      res.render("fm-profile", {
        weeks: weeks,
      });
    });
  }else{
    res.status(500).send({code:500,message:"User not authenticated"});
  }
});

app.post("/upload/content/:userId", (req, res) => {
  // console.log(req.path+" this is the user Id");

  const d = new Date();
  d.setDate(d.getDate() + req.body.hours * 7);
  const endDate = d.toString;
  // console.log(d+" value of d");
  // console.log(Date(endDate.toString())+" value of end date");
  // console.log(Date.now()+" Time of today");

  const content = new Content({
    contentId: v4(),
    userId: req.body.userId,
    ticket: req.body.ticket,
    title: req.body.title,
    description: req.body.description,
    weeks: req.body.weeks,
    genre: req.body.genre,
    start: Date.now(),
    end: endDate.toString(),
    tag: req.body.tag,
    type: req.body.type,
  });
  content.save((err) => {
    console.log("userId is: " + req.body.userId);
    if (err) {
      console.log(err);
    } else {
      res.redirect("/");
    }
  });
});

//Route middleware
app.use('/contents',contentRoute);
app.use('/register',authRoute);
app.use("/creators",creatorRoute);
app.use("/series",seriesRoute);
app.use("/login",loginRoute);
app.use("/fm/register",fmRegisterRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
  console.log(`Server started on port ${PORT}.. `);
});
