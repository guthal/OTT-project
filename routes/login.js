const router = require("express").Router();
const User = require("../model/User");
const login = require("./login-util");

router.get("/verify", (req, res) => {
  if (req.isAuthenticated()) {
    if (req.user.verified) {
      console.log(`${req.user.username} verification is ${req.user.verified}`);
      if (!req.user.reset) {
        console.log("reset flag: ", req.user.reset);
        User.find({ userId: req.user.userId }, (err, user) => {
          if (err || !user)
            return res
              .status(401)
              .send({ code: 401, message: "User Unauthorized" });
          return res.send({
            userId: req.user.userId,
            username: req.user.username,
            date: req.user.date,
            utype: req.user.utype,
            history: req.user.history,
            fname: req.user.fname,
            lname: req.user.lname,
            watchlist: req.user.watchlist,
          });
        });
      } else {
        res.send(
          "you have to change your password as you had given forgot password"
        );
      }
    } else {
      res.send(
        "you have'nt verified your account please check your email inbox and verify"
      );
    }
  } else {
    res.status(401).send();
  }
});

router.post("/", (req, res) => {
  login(req, res);
});

module.exports = router;
