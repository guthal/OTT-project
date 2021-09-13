const router = require("express").Router();
const User = require("../model/User");
const { v4 } = require("uuid");

router.post("/", async (req, res) => {
  const user = await User.exists({ dateOfBirth: req.body.dateOfBirth });
  if (user) {
    res.status(200).send("User exists");
  } else {
    User({
      dateOfBirth: req.body.dateOfBirth,
      gender: req.body.gender,
    }).save((err, result) => {
      if (err) {
        res.send(err);
      }
      res.status(200).send("success");
    });
  }
});

module.exports = router;
