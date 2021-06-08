const Payment = require("../model/Payment");

const invoice = async (req, res) => {
  //TODO: add authetication only for creators i.e. utype:1
  try {
    const payment = await Payment.aggregate([
      {
        $match: {
          creatorId: "33b44421-cec7-432b-84e8-d5e17512071f", //TODO: add req.user.creatorId
          productId: req.params.productId,
          date: {
            $gte: new Date(req.body.fromDate),
            $lte: new Date(req.body.toDate),
          },
        },
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: { format: "%Y-%m-%d", date: "$date" },
            },
            purchaseType: "$purchaseType",
          },
          sumAmount: {
            $sum: "$amount",
          },
        },
      },
    ]);
    return res.send(payment);
  } catch (e) {
    return res.status(400).send(e.message);
  }
  // .exec((err, result) => {
  //   if (err) {
  //     res.status(400).send(err);
  //   }
  //   console.log(result);
  //   return result;
  // });
};

module.exports = invoice;
