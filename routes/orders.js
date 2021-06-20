require("dotenv").config();
const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Payment = require("../model/Payment");
const User = require("../model/User");
const Content = require("../model/Content");
const Series = require("../model/Series");

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

// router.get("/test", async (req, res) => {
//   const { razorpayPaymentId, razorpayOrderId, userId, productId, contentType } =
//     req.body;

//   const data = await User.findOne({ userId: req.body.userId });
//   const there = await data.history.find(
//     (o) => o.productId === req.body.productId
//   );
//   console.log(there);
//   if (there) {
//     User.findOneAndUpdate(
//       { userId: userId, "history.productId": productId },
//       {
//         $set: {
//           // history: {
//           //   productId: productId,
//           //   contentType: contentType,
//           //   date: Date.now(),
//           // },
//           "history.$.date": Date.now(),
//         },
//         $inc: {
//           "history.$.count": 1,
//         },
//       }
//     ).exec((err, content) => {
//       if (err || !content) {
//         return res.status(400).send({ message: err });
//       }
//       console.log("Content: ", content);
//       res.send({
//         msg: "success",
//         orderId: razorpayOrderId,
//         paymentId: razorpayPaymentId,
//       });
//     });
//   } else {
//     User.updateOne(
//       { userId: userId },
//       {
//         $push: {
//           history: {
//             productId: productId,
//             contentType: contentType,
//             date: Date.now(),
//           },
//         },
//         $inc: {
//           count: 1,
//         },
//       }
//     ).exec((err, content) => {
//       if (err || !content) {
//         return res.status(400).send({ message: "Failed to create season" });
//       }
//       res.send({
//         msg: "success",
//         orderId: razorpayOrderId,
//         paymentId: razorpayPaymentId,
//       });
//     });
//   }
// });

router.post("/success", async (req, res) => {
  try {
    const {
      orderCreationId,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
      userId,
      productId,
      amount,
      contentType,
      purchaseType,
    } = req.body;
    let commission;
    if (contentType === "content") {
      const content = await Content.findOne({ contentId: productId });
      commission = purchaseType === "w" ? 0 : content.commission[purchaseType];
    } else {
      const series = await Series.findOne({ "seasons.seasonId": productId });
      const season = series.seasons.find(
        (season) => season.seasonId === productId
      );
      commission = season.commission[purchaseType];
    }

    const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    shasum.update(`${orderCreationId}|${razorpayPaymentId}`);
    const digest = shasum.digest("hex");

    if (digest !== razorpaySignature)
      return res.status(400).json({ msg: "Transaction not legit!" });

    let creatorId;

    if (contentType === "content") {
      const content = await Content.find(
        { contentId: productId },
        (err, product) => {
          if (err || !product) {
            console.log(err);
            return res.status(400).send({ message: "Failed to create season" });
          }
          return product;
        }
      );
      creatorId = content[0].userId;
    } else {
      const series = await Series.find(
        { "seasons.seasonId": productId },
        (err, product) => {
          if (err || !product) {
            console.log(err);
            return res.status(400).send({ message: "Failed to create season" });
          }
          return product;
        }
      );
      creatorId = series[0].userId;
    }

    const newPayment = new Payment({
      payId: razorpayPaymentId,
      productId: productId,
      userId: userId,
      amount: amount / 100,
      date: Date(Date.now()),
      contentType,
      orderId: razorpayOrderId,
      signature: razorpaySignature,
      purchaseType,
      commission,
      creatorId,
      success: true,
    });

    await newPayment.save();

    const data = await User.findOne({ userId: req.body.userId });
    const there = await data.history.find(
      (o) => o.productId === req.body.productId
    );
    // console.log(there);
    if (there) {
      User.findOneAndUpdate(
        { userId: userId, "history.productId": productId },
        {
          $set: {
            "history.$.date": Date.now(),
          },
          $inc: {
            "history.$.count": 1,
          },
        }
      ).exec((err, content) => {
        if (err || !content) {
          return res.status(400).send({ message: err });
        }
        console.log("Content: ", content);
        res.send({
          msg: "success",
          orderId: razorpayOrderId,
          paymentId: razorpayPaymentId,
        });
      });
    } else {
      User.updateOne(
        { userId: userId },
        {
          $push: {
            history: {
              productId: productId,
              contentType: contentType,
              date: Date.now(),
            },
          },
          $inc: {
            count: 1,
          },
        }
      ).exec((err, content) => {
        if (err || !content) {
          return res.status(400).send({ message: "Failed to create season" });
        }
        res.send({
          msg: "success",
          orderId: razorpayOrderId,
          paymentId: razorpayPaymentId,
        });
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

module.exports = router;
