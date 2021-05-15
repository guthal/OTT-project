//utype 0-admin, 1-makers,2-audience
//"/cretors" is an admin panel
const router = require("express").Router();
const User = require("../model/User");

router.get("/", (req, res) => {
  if (req.isAuthenticated()) {
    if (req.user.utype === 0) {
      User.find({ utype: 1 }, (err, users) => {
        if (err || !users)
          return res
            .status(400)
            .send({ code: 400, message: "Resource not found" });
        return res.send(users);
      });
    } else {
      res.status(403).send();
    }
  } else {
    res.send("user not authenticated");
  }
});

module.exports = router;
