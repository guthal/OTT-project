const router = require("express").Router();
const Payment = require("../model/Payment");
const Content = require("../model/Content");

// router.post("/", async (req, res) => {
//   const groupedPurchases = [];

//   const matchedContents = await Content.find();

//   Payment.find({ creatorId: req.body.creatorId })
//     .where("date")
//     .gte(req.body.fromDate)
//     .lte(req.body.toDate)
//     .exec((err, purchases) => {
//       if (err || !purchases)
//         res.status(400).send("Purchases could not be found");

//       purchases.forEach((purchase) => {
//         const purchaseItemIndex = groupedPurchases.findIndex(
//           (purchaseContent) =>
//             purchaseContent.productId === purchase.productId &&
//             purchaseContent.purchaseType === purchase.purchaseType
//         );

//         if (purchaseItemIndex >= 0) {
//           groupedPurchases[purchaseItemIndex].totalRevenue += purchase.amount;
//           groupedPurchases[purchaseItemIndex].earnings +=
//             (1 - purchase.commission) * purchase.amount;
//           groupedPurchases[purchaseItemIndex].purchaseCount += 1;
//         } else {
//           let contentTitle;

//           if (purchase.contentType === "content")
//             contentTitle = matchedContents.find(
//               (content) => content.contentId === purchase.productId
//             ).title;
//           else {
//             const series = matchedContents.find(
//               (content) =>
//                 content.contentSeriesInfo.seasonId === purchase.productId
//             ).contentSeriesInfo;

//             contentTitle = `${series.seriesName}: ${series.seasonName}`;
//           }

//           groupedPurchases.push({
//             productId: purchase.productId,
//             purchaseType: purchase.purchaseType,
//             totalRevenue: purchase.amount,
//             earnings: (1 - purchase.commission) * purchase.amount,
//             contentType: purchase.contentType,
//             purchaseCount: 1,
//             contentTitle,
//           });
//         }
//       });
//       return res.send(
//         groupedPurchases.sort((a, b) => {
//           if (a.contentTitle > b.contentTitle) return 1;
//           return -1;
//         })
//       );
//     });
// });

router.post("/", async (req, res) => {});

// retrieves latest date of last paid to the respective creator
// $group{
//   _id: "req.params.creatorId",
//   latest: {
//     "$last": "$date"
//   }
// }

module.exports = router;
