const router = require("express").Router();
const User = require("../model/User");
const passport = require("passport");
const login = require("./login-util");
// router.get("/", (req, res) => {
//   res.render("login");
// });

router.get("/verify", (req, res) => {
  // try {
  //   console.log("verify endpoint: ");
  //   res.send("hey");

  // } catch (error) {
  //   console.log(error);
  // }
  if (req.isAuthenticated()) {
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
        fname: user[0].fname,
        lname: user[0].lname,
      });
    });
  } else {
    res.status(401).send();
  }
});

router.post("/", (req, res) => {
  // return res.send("login bypassed");
  login(req, res);
});

module.exports = router;
// module.exports = login;
