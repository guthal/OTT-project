require("dotenv").config();
const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const mongoose = require("mongoose");
const Payment = require("../model/Payment");
const User = require("../model/User");

const router = express.Router();

// const Payment = mongoose.model('Payment', PaymentDetailsSchema);

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

    res.json(order);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/success", async (req, res) => {
  try {
    const {
      orderCreationId,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
      userId,
      contentId,
      amount,
      type,
    } = req.body;

    const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    shasum.update(`${orderCreationId}|${razorpayPaymentId}`);
    const digest = shasum.digest("hex");

    if (digest !== razorpaySignature)
      return res.status(400).json({ msg: "Transaction not legit!" });

    const newPayment = new Payment({
      payId: razorpayPaymentId,
      contentId: contentId,
      userId: userId,
      amount: amount / 100,
      date: Date(Date.now()),
      contentType: "test", // need to work on this
      orderId: razorpayOrderId,
      signature: razorpaySignature,
      type: type,
      success: true,
    });

    await newPayment.save();

    User.updateOne(
      { userId: userId },
      {
        $push: {
          history: contentId,
        },
      }
    ).exec((err, series) => {
      if (err || !series) {
        console.log(err);
        return res.status(400).send({ message: "Failed to create season" });
      }
      res.send({
        msg: "success",
        orderId: razorpayOrderId,
        paymentId: razorpayPaymentId,
      });
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
