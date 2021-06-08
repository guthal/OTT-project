const router = require("express").Router();
const User = require("../model/User");
const Payment = require("../model/Payment");
const Account = require("../model/Account");

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
router.post("/", async (req, res) => {
  if (req.isAuthenticated() && req.user.utype === 0) {
    await User.updateOne(
      { username: req.body.username },
      {
        $set: {
          address: req.body.address,
          office: req.body.office,
          city: req.body.city,
          state: req.body.state,
          zip: req.body.zipcode,
          phone: req.body.phone,
          bank: req.body.bankAccount,
          pan: req.body.panCard,
          utype: 1,
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
    const user = await User.find({ username: req.body.username });
    const noPay = await Account.exists({ creatorId: user.userId });
    console.log("user: ", user);
    if (!noPay) {
      await Account({
        creatorId: user.userId,
        payId: "initial transaction",
        lastPayment: Date.now(),
        amountPaid: 0,
        remark: "initial transaction",
      }).save((err, result) => {
        if (err) {
          res.send(err);
        }
        res.status(200).send("success");
      });
    } else {
      res.status(400).send("no need to update transaction is done"); //TODO: need to add a proper status code
    }
  } else {
    res.status(403).send("forbidden");
  }
});

router.get("/update/:creatorId", async (req, res) => {
  //TODO: add isAuthenticated for testing we have'nt put
  //check if the user is a creator First
  const verify = await User.exists({ userId: req.params.creatorId });
  const noPay = await Account.exists({ creatorId: req.params.creatorId });
  console.log("No pay value: ", noPay);
  if (verify) {
    if (!noPay) {
      await Account({
        creatorId: req.params.creatorId,
        payId: "initial transaction",
        lastPayment: Date.now(),
        amountPaid: 0,
        remark: "initial transaction",
      }).save((err, result) => {
        if (err) {
          res.send(err);
        }
        res.status(200).send("success");
      });
    } else {
      res.send("no need to update transaction is done"); //TODO: need to add a proper status code
    }
  } else {
    res.send("Not a verified user");
  }
});

module.exports = router;
