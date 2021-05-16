const router = require("express").Router();
const User = require("../model/User");
const { v4, stringify } = require("uuid");
const passport = require("passport");
const login = require("./login-util");

router.post("/", async (req, res) => {
  const userName = await User.findOne({ username: req.body.username });
  if (userName) return res.status(400).send("email already exists");

  await User.register(
    {
      userId: v4(),
      fname: req.body.fname,
      lname: req.body.lname,
      username: req.body.username,
      date: Date.now(),
      utype: 2,
    },
    req.body.password,
    (err, user) => {
      if (err) {
        console.log("there is an error: ", err);
        return res
          .status(400)
          .send({ code: 400, message: "Resource not found" });
      }
      login(req, res);
    }
  );
});

module.exports = router;
