const router = require("express").Router();
const User = require("../model/User");
const { v4 } = require("uuid");

router.post("/doB-gender", async (req, res) => {
  await User.updateOne(
    { userId: req.body.userId },
    {
      $set: {
        dateOfBirth: req.body.dateOfBirth,
        gender: req.body.gender,
      },
    }
  ).exec((err, updated) => {
    if (err || !updated) {
      return res
        .status(400)
        .send({ message: "Date Of Birth, Gender not updated" });
    }
    return res.status(200).send({ message: "success" });
  });
});

module.exports = router;
