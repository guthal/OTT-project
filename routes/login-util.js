const User = require("../model/User");
const passport = require("passport");

const login = async (req, res) => {
    const userName = await User.findOne({ username: req.body.username });
    console.log("login entered here");
    if (!userName) {
      return res.status(401).send("Email does not Exist");
    } else {
      const user = new User({
        username: req.body.username,
        password: req.body.password,
      });
      req.login(user, err => {
        if (err) {
          console.log("%s user has error %s ", user, err);
          res.status(401).send("Unauthorised");
        } else {
          passport.authenticate("local")(req, res, () => {
            console.log("user who logged in :", user);
            //should map the response
            //but will do it after the proper user is registered
            res.send(req.user);
          });
        }
      });
    }
  };

  module.exports=login;