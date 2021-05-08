//jshint esversion:6

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const { v4, stringify } = require("uuid");
const Schema = mongoose.Schema;
const app = express();
const encrypt = require("mongoose-encryption");
const nodemailer = require("nodemailer");
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());
mongoose.connect(
  `mongodb+srv://${process.env.MONGO}:${process.env.MONGO_PASS}@cluster0.sesb2.mongodb.net/${process.env.WEB}?retryWrites=true&w=majority`,
  { useNewUrlParser: true, useUnifiedTopology: true }
);
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
  creatorId: { type: String, required: true },
  price: {
    buy: Number,
    rent: Number,
    ticket: Number,
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  weeks: Number,
  type: { type: String, required: true },
  genre: { type: String, required: true },
  tag: { type: String, required: true },
  thumbnail: String,
  start: Date,
  end: String,
  thumbnail: {
    pic2030: { type: String, required: true },
    picsq: { type: String, required: true },
  },
});
//make tag required later in production
const Content = mongoose.model("Content", contentSchema);

//creator info

const creatorSchema = new Schema({
  creatorId: String,
  email: { type: String, required: true, unique: true },
  creator: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  phone: { type: Number, unique: true },
  office: String,
  city: String,
  state: { type: String, required: true },
  zip: { type: Number, required: true },
  date: { type: Date, required: false },
  history: [{ type: String, ref: "Content" }],
  utype: { type: Number, required: true },
});
// const secret =process.env.SECRET;
// creatorSchema.plugin(encrypt,{secret:secret});
//schemas constructors
const Creator = mongoose.model("Creator", creatorSchema);

app.get("/contents", (req, res) => {
  Content.find({}, (err, contents) => {
    if (err || !content)
      res.status(404).send({ code: 404, message: "Resource not found" });

    //passing the whole data as response need to see if it's good practice
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
      };
    });
    res.send(data);
  });
});

// render content description, title button w.r.t to the business logic
app.get("/contents/:contentId", (req, res) => {
  Content.find({ contentId: req.params.contentId }, (err, content) => {
    if (err || !(contentId && contentId[0]))
      res.status(404).send({ code: 404, message: "Resource not found" });

    const {
      contentId,
      title,
      description,
      type,
      price,
      thumbnail,
      tag,
    } = content[0];
    res.send({
      id: contentId,
      title,
      description,
      type,
      price,
      thumbnail,
      tag,
    });
  });
});
// test with this user f524e638-0c83-42f8-b954-0da734c41fa5
//passing the whole content as response need to see how to send only the reqired ones
app.get("/history/:creatorId", (req, res) => {
  Creator.find({ creatorId: req.params.creatorId }, (err, history) => {
    if (err || !(history && history[0]))
      res.status(404).send({ code: 404, message: "Resource not found" });

    const contents = history[0].history;
    Content.find({ contentId: contents }, (err, content) => {
      const data = content.map((val) => {
        return {
          id: val.contentId,
          title: val.title,
          desc: val.description,
          type: val.type,
          price: val.price,
          thumbnail: val.thumbnail,
        };
      });
      res.send(data);
    });
  });
});

app.get("/upload", (req, res) => {
  Creator.find({}, function (err, creators) {
    res.render("upload", {
      creators: creators,
    });
  });
});

//weekly streams schema

app.get("/upload/content/:creatorId", (req, res) => {
  Creator.findOne({ creatorId: req.params.creatorId }, function (err, content) {
    res.render("weekly", {
      content: content.creatorId,
    });
  });
});

app.get("/profile/:creatorId", (req, res) => {
  Content.find({ creatorId: req.params.creatorId }, (err, weeks) => {
    res.render("fm-profile", {
      weeks: weeks,
    });
  });
});

app.post("/upload/week/:creatorId", (req, res) => {
  // console.log(req.path+" this is the creator Id");

  const d = new Date();
  d.setDate(d.getDate() + req.body.weeks * 7);
  const endDate = d.toString;
  // console.log(d+" value of d");
  // console.log(Date(endDate.toString())+" value of end date");
  // console.log(Date.now()+" Time of today");

  const content = new Content({
    contentId: v4(),
    creatorId: req.body.creatorId,
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
    console.log("creatorId is: " + req.body.creatorId);
    if (err) {
      console.log(err);
    } else {
      res.redirect("/");
    }
  });
});

app.get("/upload/br/:creatorId", (req, res) => {});

app.post("/upload/br/:creatorId", (req, res) => {
  const content = new Content({
    contentId: v4(),
    creatorId: req.body.creatorId,
    buy: req.body.buy,
    rent: req.body.rent,
    title: req.body.title,
    description: req.body.description,
    genre: req.body.genre,
    start: Date.now(),
    tag: req.body.tag,
    type: req.body.type,
  });
  content.save((err) => {
    console.log("creatorId is: " + req.body.creatorId);
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
  const creator = new Creator({
    creatorId: v4(),
    email: req.body.email,
    creator: req.body.creator,
    phone: req.body.phone,
    address: req.body.address,
    office: req.body.office || null,
    city: req.body.city,
    state: req.body.state,
    zip: req.body.zip,
    date: Date.now(),
    utype: 1,
  });
  creator.save(function (err) {
    if (!err) {
      res.redirect("/contents");
    } else {
      console.log(err);
    }
  });
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  const audience = new Audience({
    email: req.body.email,
  });
  audience.save((err) => {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/");
    }
  });
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  function generateOTP() {
    // Declare a digits variable
    // which stores all digits
    var digits = "0123456789";
    let OTP = "";
    for (let i = 0; i < 5; i++) {
      OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
  }

  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASS,
    },
  });

  var mailOptions = {
    from: process.env.EMAIL,
    to: "vg931697@gmail.com",
    subject: "login OTP for AVscope",
    text: "here is you OTP" + generateOTP(),
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
