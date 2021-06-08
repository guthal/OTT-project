const router = require("express").Router();
const Payment = require("../model/Payment");
const Content = require("../model/Content");
const Account = require("../model/Account");

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
          groupedPurchases[purchaseItemIndex].totalRevenue += purchase.amount;
          groupedPurchases[purchaseItemIndex].earnings +=
            (1 - purchase.commission) * purchase.amount;
          groupedPurchases[purchaseItemIndex].purchaseCount += 1;
        } else {
          let contentTitle;

          if (purchase.contentType === "content")
            contentTitle = matchedContents.find(
              (content) => content.contentId === purchase.productId
            ).title;
          else {
            const series = matchedContents.find(
              (content) =>
                content.contentSeriesInfo.seasonId === purchase.productId
            ).contentSeriesInfo;

            contentTitle = `${series.seriesName}: ${series.seasonName}`;
          }

          groupedPurchases.push({
            productId: purchase.productId,
            purchaseType: purchase.purchaseType,
            totalRevenue: purchase.amount,
            earnings: (1 - purchase.commission) * purchase.amount,
            contentType: purchase.contentType,
            purchaseCount: 1,
            contentTitle,
          });
        }
      });
      return res.send(
        groupedPurchases.sort((a, b) => {
          if (a.contentTitle > b.contentTitle) return 1;
          return -1;
        })
      );
    });
});

router.get("/summaryContent/:productId", (req, res) => {
  //TODO: add authetication only for creators i.e. utype:1
  Payment.aggregate([
    {
      $match: {
        creatorId: "33b44421-cec7-432b-84e8-d5e17512071f", //TODO: add req.user.creatorId
        productId: req.params.productId,
        date: {
          $gte: new Date(req.body.fromDate + "T00:00:00.000+00:00"),
          $lte: new Date(req.body.toDate + "T23:59:59.000+00:00"),
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
  ]).exec((err, result) => {
    if (err) {
      res.status(400).send(err);
    }
    res.send(result);
  });
});

module.exports = router;
