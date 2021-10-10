require("dotenv").config();
const router = require("express").Router();
const crypto = require("crypto");
const Razorpay = require("razorpay");
const SupportUs = require("../model/SupportUs");
const User = require("../model/User");

router.post("/create", async (req, res) => {
  try {
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID, // YOUR RAZORPAY KEY
      key_secret: process.env.RAZORPAY_KEY_SECRET, // YOUR RAZORPAY SECRET
    });

    const options = {
      amount: req.body.amount,
      currency: req.body.currency,
      receipt: req.body.receipt,
    };

    const order = await instance.orders.create(options);

    if (!order) return res.status(500).send("Some error occured");

    return res.json(order);
  } catch (error) {
    return res.status(500).send(error);
  }
});

router.post("/success", async (req, res) => {
  const {
    orderCreationId,
    razorpayPaymentId,
    razorpayOrderId,
    razorpaySignature,
    userId,
    amount,
  } = req.body;

  const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
  shasum.update(`${orderCreationId}|${razorpayPaymentId}`);
  const digest = shasum.digest("hex");

  if (digest !== razorpaySignature)
    return res.status(400).json({ msg: "Transaction not legit!" });

  const newSupportUsObj = new SupportUs({
    userId: userId,
    orderId: razorpayOrderId,
    paymentId: razorpayPaymentId,
    amountPaid: amount / 100,
    amountDate: Date(Date.now()),
  });

  await newSupportUsObj.save((err, result) => {
    if (err) {
      return res.send(err);
    }
    User.updateOne(
      { userId: userId },
      {
        $push: {
          supportUsHistory: {
            orderId: result.orderId,
            supportUsDate: result.amountDate,
            amount: result.amountPaid,
          },
        },
      }
    ).exec((err, updated) => {
      if (err || !updated) {
        return res
          .status(400)
          .send({ message: "The amount was not registered to your Profile." });
      }
      return res.status(200).send({ message: "success" });
    });
  });
});

module.exports = router;
