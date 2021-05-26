const router = require("express").Router();
const Payment = require("../model/Payment");
const Content = require("../model/Content");

router.post("/", async (req, res) => {
  const groupedPurchases = [];

  const matchedContents = await Content.find();

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

        if (purchaseItemIndex >= 0) {
          groupedPurchases[purchaseItemIndex].amount += purchase.amount;
          groupedPurchases[purchaseItemIndex].purchaseCount += 1;
        } else {
          const contentTitle =
            purchase.contentType === "content"
              ? matchedContents.find(
                  (content) => content.contentId === purchase.productId
                ).title
              : matchedContents.find(
                  (content) =>
                    content.contentSeriesInfo.seasonId === purchase.productId
                ).contentSeriesInfo.seasonName;
          groupedPurchases.push({
            productId: purchase.productId,
            purchaseType: purchase.purchaseType,
            commission: purchase.commission,
            amount: purchase.amount,
            contentType: purchase.contentType,
            purchaseCount: 1,
            contentTitle,
          });
        }
      });
      return res.send(groupedPurchases);
    });
});

module.exports = router;
