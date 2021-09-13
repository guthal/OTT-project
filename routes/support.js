const router = require("express").Router();
const Account = require("../model/Account");

router.post("/", (req, res) => {
  //TODO: add authentication to this backend
  Account({
    creatorId: req.body.creatorId,
    payId: req.body.payId,
    lastPayment: req.body.lastPayment,
    amountPaid: req.body.amountPaid,
    remark: "donation",
  }).save((err, result) => {
    if (err) {
      res.send(err);
    }
    res.status(200).send("success");
  });
});

module.exports = router;
