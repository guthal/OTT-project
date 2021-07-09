const User = require("../model/User");
const Content = require("../model/Content");
const Payment = require("../model/Payment");
const Series = require("../model/Series");

// Util function
const getUserPurchase = (req, res, productId) => {
  const productData = [];
  const purchaseData = [];
  let seasonIds = [];
  let contentIds = [];
  return User.find({ userId: req.params.userId }, (err, user) => {
    if (err || !(user && user[0]))
      return res.status(404).send({ code: 404, message: "User not found" });
  })
    .then(user => {
      const seasonProducts = user[0].history
        .filter(product => product.contentType === "series")
        .map(product => product.productId);
      const contentProducts = user[0].history
        .filter(product => product.contentType === "content")
        .map(product => product.productId);

      if (productId) {
        if (seasonProducts.includes(productId)) seasonIds.push(productId);
        else if (contentProducts.includes(productId))
          contentIds.push(productId);
      } else {
        seasonIds = seasonProducts;
        contentIds = contentProducts;
      }
    })
    .then(() => {
      return Payment.find(
        {
          userId: req.params.userId,
          productId: [...contentIds, ...seasonIds],
        },
        (err, purchase) => {
          if (err || !purchase)
            return res
              .status(404)
              .send({ code: 404, message: "Purchase date not available" });
        }
      );
    })
    .then(purchase => {
      purchase.map(val => {
        purchaseData.push({
          purchaseDate: val.date,
          productId: val.productId,
          purchaseId: val.payId,
          purchaseType: val.purchaseType,
          contentType: val.contentType,
          purchasePrice: val.amount,
        });
      });
    })
    .then(() => {
      return Content.find({ contentId: contentIds }, (err, content) => {
        if (err || !content)
          return res
            .status(404)
            .send({ code: 404, message: "Content not found" });
      });
    })
    .then(content => {
      content.forEach(val => {
        productData.push({
          productId: val.contentId,
          productType: "content",
          contentTitle: val.title,
          thumbnail: val.thumbnail,
        });
      });
    })
    .then(() => {
      return Series.find(
        { "seasons.seasonId": { $in: seasonIds } },
        (err, series) => {
          if (err || !series)
            return res
              .status(404)
              .send({ code: 404, message: "Content not found" });
        }
      );
    })
    .then(series => {
      const seasonsList = [];
      series.forEach(eachSeries => {
        eachSeries.seasons.forEach(season => {
          seasonsList.push(season);
        });
      });

      return seasonsList;
    })
    .then(seasonsList => {
      seasonsList.forEach(season => {
        productData.push({
          productId: season.seasonId,
          productType: "series",
          contentTitle: season.title,
          thumbnail: season.thumbnail,
        });
      });
    })

    .then(() => {
      return purchaseData.map(data => {
        const purchaseContent = productData.find(
          content => content.productId === data.productId
        );

        return {
          userId: req.params.userId,
          ...data,
          ...purchaseContent,
        };
      });
    })
    .then(purchasedContentData => res.status(200).send(purchasedContentData));
};

module.exports = getUserPurchase;
