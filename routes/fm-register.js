const router = require("express").Router();
const User = require("../model/User");

router.get("/", function (req, res) {
  if (req.isAuthenticated()) {
    if (req.user.utype === 0) {
      res.send("fm-register");
    } else {
      res.status(404).status("no page exists like that");
    }
  } else {
    res.status(400).send("User not authenticated");
  }
});
//need to access the user and patch some information
//need to test it
router.post("/", (req, res) => {
  if (req.isAuthenticated() && req.user.utype === 0) {
    User.updateOne(
      { username: req.body.username },
      {
        $set: {
          username: req.body.username,
        },
      },
      (err) => {
        if (!err) {
          res.send("Succesfully updated");
        } else {
          res.send(err);
        }
      }
    );
  } else {
    res.status(403).send("forbidden");
  }
});

module.exports = router;
