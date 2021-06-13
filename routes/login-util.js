const User = require("../model/User");
const passport = require("passport");

const login = async (req, res) => {
  const userName = await User.findOne({ username: req.body.username });
  if (!userName) {
    return res.status(401).send("Email does not Exist");
  } else {
    const user = new User({
      username: req.body.username,
      password: req.body.password,
    });
    req.login(user, err => {
      if (err) {
        res.status(401).send("Unauthorised");
      } else {
        passport.authenticate("local")(req, res, () => {
          User.find({ userId: req.user.userId }, (err, userData) => {
            if (err || !userData)
              return res
                .status(401)
                .send({ code: 401, message: "User Unauthorized" });
            res.send({
              userId: req.user.userId,
              username: req.user.username,
              date: req.user.date,
              utype: req.user.utype,
              history: req.user.history,
              verified: req.user.verified,
              fname: userData[0].fname,
              lname: userData[0].lname,
            });
          });
        });
      }
    });
  }
};

module.exports = login;
