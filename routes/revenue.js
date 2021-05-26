const router = require("express").Router();
const Payment = require("../model/Payment");
const Content = require("../model/Content");

router.post("/", (req, res) => {
  const groupedPurchases = [];

  Payment.find({ creatorId: req.body.creatorId })
    .where("date")
    .gte(req.body.fromDate)
    .lte(req.body.toDate)
    .exec((err, purchases) => {
      if (err || !purchases)
        res.status(400).send("Purchases could not be found");

      purchases.forEach((purchase) => {
        const purchaseItemIndex = groupedPurchases.findIndex(
          (purchaseContent) =>
            purchaseContent.productId === purchase.productId &&
            purchaseContent.purchaseType === purchase.purchaseType
        );

        if (purchaseItemIndex >= 0)
          groupedPurchases[purchaseItemIndex].amount += purchase.amount;
        else
          groupedPurchases.push({
            productId: purchase.productId,
            purchaseType: purchase.purchaseType,
            commission: purchase.commission,
            amount: purchase.amount,
          });
      });
      return res.send(groupedPurchases);
    });
});

module.exports = router;
