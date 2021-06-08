const router = require("express").Router();
const Account = require("../model/Account");
const User = require("../model/User");

router.post("/:creatorId", async (req, res) => {
  const data = await User.findOne(
    // TODO: add exists query for this Endpoint
    { userId: req.params.creatorId, utype: 1 },
    (err, user) => {
      if (err) {
        console.log(err);
        res.status(400).send("not a creator");
      }
    }
  );
  if (data) {
    await Account({
      creatorId: data.userId,
      payId: req.body.payId,
      lastPayment: Date.now(),
      amountPaid: req.body.amountPaid,
    }).save((err, result) => {
      if (err) {
        res.send(err);
      }
      res.status(200).send("success");
    });
  } else {
    res.status(400).send("not a creator");
  }
});

router.get("/last-pay/:creatorId", (req, res) => {
  Account.aggregate([
    {
      $group: {
        _id: req.params.creatorId,
        lastPayDate: {
          $last: "$lastPayment",
        },
      },
    },
  ]).exec((err, result) => {
    if (err) {
      res.status(400).send(err);
    }
    res.send(result);
  });
});

module.exports = router;
