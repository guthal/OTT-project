const router = require("express").Router();
const Payment = require("../model/Payment");
const Content = require("../model/Content");
const _ = require("lodash");
const User = require("../model/User");
//users
router.post("/", (req, res) => {
  Content.find({ title: _.capitalize(req.body.title) }, (err, result) => {
    res.send(result);
  });
});

//searches for creator by email, by fname, by lname
router.post("/creator", (req, res) => {
  const userData = []; //frontend should send email through body
  if (req.body.email) {
    User.find({ username: req.body.email }, (err, user) => {
      if (user[0].utype == 1) {
        userData.push({
          userId: user[0].userId,
          fname: user[0].fname,
          lname: user[0].lname,
          username: user[0].username,
        });
      }
      res.send(userData);
    });
  } else if (req.body.fname) {
    User.find({ fname: _.capitalize(req.body.fname) }, (err, user) => {
      console.log(user);
      if (user[0].utype == 1) {
        userData.push({
          userId: user[0].userId,
          fname: user[0].fname,
          lname: user[0].lname,
          username: user[0].username,
        });
      }
      res.send(userData);
    });
  } else if (req.body.lname) {
    User.find({ lname: _.capitalize(req.body.lname) }, (err, user) => {
      if (user[0].utype == 1) {
        userData.push({
          userId: user[0].userId,
          fname: user[0].fname,
          lname: user[0].lname,
          username: user[0].username,
        });
      }
      res.send(userData);
    });
  }
});

//need to do autocomplete

module.exports = router;
