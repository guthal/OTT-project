//jshint esversion:6

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session =require('express-session');
const passport =require('passport');
const passportLocalMongoose=require('passport-local-mongoose');
const { v4, stringify } = require("uuid");
const Schema = mongoose.Schema;
const app = express();
const encrypt = require("mongoose-encryption");
const nodemailer = require("nodemailer");
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());

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

const contentSchema = new Schema({
  contentId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  price: {
    b: Number,
    r: Number,
    w: Number,
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  weeks: Number,
  type: { type: String, required: true },
  genre: { type: Array, required: true },
  tag: { type: String, required: true },
  thumbnail: String,
  start: Date,
  end: String,
  thumbnail: {
    pic2030: { type: String, required: true },
    picsq: { type: String, required: true },
  },
  seriesId: {
    type: String,
    ref: "Series",
  },
  duration: Number,
  ratings: Number,
  contentLanguage: String,
  ageRestriction: String,
  isLandscape: Boolean,
  contentSeriesInfo: {
    seasonID: String,
    seriesName: String,
    seasonNo: Number,
    episodeNo: Number,
    seriesName:String
  },
});
//make tag required later in production
const Content = mongoose.model("Content", contentSchema);

const seriesSchema = new Schema({
  seriesId: String,
  seriesName: String,
  totalSeasons: Number,
  cast: [
    {
      role: String,
      name: String,
    },
  ],
  ratings: Number,
  contentLanguage: String,
  ageRestriction: String,
  genres: Array,
  seasons: Array,
});

const Series = mongoose.model("Series", seriesSchema);

//user info

const userSchema = new Schema({
  userId: String,
  email: { type: String, required: true, unique: true },
  password:String,
  username: { type: String, required: true},
  address:String,
  phone: { type: Number, unique: true },
  office: String,
  city: String,
  state:String,
  zip: Number,
  date: { type: Date, required: true },
  history: [{ type: String, ref: "Content" }],
  utype: { type: Number, required: true },
});
// const secret =process.env.SECRET;
// userSchema.plugin(encrypt,{secret:secret});
//schemas constructors

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const paymentSchema = new Schema({
  payId: String,
  contentId: { type: String, ref: "Content" },
  userId: { type: String, ref: "User" },
  amount: { type: Number, ref: "Content" },
  date: Date,
  type: { type: String, ref: "Content" },
});

const Payment = mongoose.model("Payment", paymentSchema);

app.get("/series", (_req, res) => {
  Series.find({}).exec((err, series) => {
    if (err || !series)
      return res.status(404).send({ code: 404, message: "Resource not found" });

    return res.send(series);
  });
});

app.get("/series/:seriesId/seasons", (req, res) => {
  Series.find({ seriesId: req.params.seriesId }).exec((err, series) => {
    if (err || !series[0])
      return res.status(404).send({ code: 404, message: "Resource not found" });

    const seriesName = series[0].seriesName;
    const seriesId = series[0].seriesId;

    return res.send({
      seriesId,
      seriesName,
      seasons: series[0].seasons,
    });
  });
});

app.get("/series/seasons", (_req, res) => {
  Series.find({}).exec((err, series) => {
    if (err || !series[0])
      return res.status(404).send({ code: 404, message: "Resource not found" });

    const seriesName = series[0].seriesName;
    const seriesId = series[0].seriesId;

    return res.send({
      seriesId,
      seriesName,
      seasons: series[0].seasons,
    });
  });
});

app.get("/series/:seriesId", (req, res) => {
  Series.find({ seriesId: req.params.seriesId }).exec((err, series) => {
    if (err || !series)
      return res.status(404).send({ code: 404, message: "Resource not found" });

    res.send(series);
  });
});

// Get contents of a particular Series
app.get("/series/:seriesId/contents", (req, res) => {
  Content.find({ seriesId: req.params.seriesId })
    .sort({ seasonNo: "asc", episodeNo: "asc" })
    .exec((err, seriesContents) => {
      if (err || !seriesContents)
        return res
          .status(404)
          .send({ code: 404, message: "Resource not found" });

      const data = seriesContents.map((val) => {
        return {
          id: val.contentId,
          title: val.title,
          description: val.description,
          type: val.type,
          price: val.price,
          tag: val.tag,
          thumbnail: val.thumbnail,
          duration: val.duration,
          rating: val.rating,
          contentLanguage: val.contentLanguage,
          ageRestriction: val.ageRestriction,
          genres: val.genres,
          cast: val.cast,
          seriesId: val.seriesId,
          contentSeriesInfo: val.contentSeriesInfo,
        };
      });
      return res.send(data);
    });
});

app.get("/contents", (_req, res) => {
  if(req.isAuthenticated()){
    Content.find({})
      .sort({ title: "asc" })
      .exec((err, contents) => {
        if (err || !contents)
          return res
            .status(404)
            .send({ code: 404, message: "Resource not found" });
        const data = contents.map((val) => {
          return {
            id: val.contentId,
            title: val.title,
            description: val.description,
            type: val.type,
            price: val.price,
            genre: val.genre,
            tag: val.tag,
            thumbnail: val.thumbnail,
            seriesId: val.seriesId,
            contentSeriesInfo: val.contentSeriesInfo,
          };
        });
        res.send(data);
      });
  }else{
    res.status(404).send({code:404,message:"user is not authenticated"});
  }
  
});

// render content description, title button w.r.t to the business logic
app.get("/contents/:contentId", (req, res) => {
  Content.find({ contentId: req.params.contentId }, (err, content) => {
    if (err || !(content && content[0]))
      return res.status(404).send({ code: 404, message: "Resource not found" });

    const {
      contentId,
      title,
      description,
      type,
      price,
      thumbnail,
      duration,
      rating,
      contentLanguage,
      ageRestriction,
      genres,
      cast,
      tag,
      seriesId,
      contentSeriesInfo,
    } = content[0];
    res.send({
      id: contentId,
      title,
      description,
      type,
      price,
      thumbnail,
      duration,
      rating,
      contentLanguage,
      ageRestriction,
      genres,
      cast,
      tag,
      seriesId,
      contentSeriesInfo,
    });
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
//utype 0-admin, 1-makers,2-audience
//"/cretors" is an admin panel
app.get("/creators", (req, res) => {
  User.find({ utype: 0 }, (err, users) => {
    if (err || !users)
      return res.status(400).send({ code: 400, message: "Resource not found" });
    return res.send(users);
  });
});

//weekly streams schema
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

app.get("/fm/register", function (req, res) {
  res.render("fm-register");
});

app.post("/fm/register", (req, res) => {
  const user = new user({
    userId: v4(),
    email: req.body.email,
    user: req.body.user,
    phone: req.body.phone,
    address: req.body.address,
    office: req.body.office || null,
    city: req.body.city,
    state: req.body.state,
    zip: req.body.zip,
    date: Date.now(),
    utype: 1,
  });
  user.save(function (err) {
    if (!err) {
      res.redirect("/contents");
    } else {
      console.log(err);
    }
  });
});


app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  
});

app.post("/register",(req,res)=>{
  User.register(
      ({
        userId:v4(),
        email:req.body.email,
        username:req.body.username,
        phone:req.body.phone,
        date:Date.now(),
        utype:2
      }),
      req.body.password,
      (err,user)=>{
      if (err){
        console.log("there is an error: ",err);
        console.log(req.body.username);
        return res.status(400).send({ code: 400, message: "Resource not found" });
      }else{
        passport.authenticate("local")(req,res,()=>{
          console.log("UserId is: ",req.user.userId);
          res.redirect("/contents");
        })
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
  console.log(`Server started on port ${PORT}.. `);
});
