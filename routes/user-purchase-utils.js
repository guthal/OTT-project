const User = require("../model/User");
const Content = require("../model/Content");
const Payment = require("../model/Payment");

// Util function
const getUserPurchase = (req, res, contentId) => {
  const contentData = [];
  const purchaseData = [];
  let contentIds;
  return User.find({ userId: req.params.userId }, (err, user) => {
    if (err || !(user && user[0]))
      return res.status(404).send({ code: 404, message: "User not found" });
  })
    .then((user) => {
      contentIds = contentId ? [contentId] : user[0].history;
    })
    .then(() => {
      return Payment.find(
        {
          userId: req.params.userId,
          contentId: contentIds,
        },
        (err, purchase) => {
          if (err || !purchase)
            return res
              .status(404)
              .send({ code: 404, message: "Purchase date not available" });
        }
      );
    })
    .then((purchase) => {
      purchase.map((val) => {
        purchaseData.push({
          purchaseDate: val.date,
          contentId: val.contentId,
          purchaseId: val.payId,
          purchaseType: val.type,
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
    .then((content) => {
      content.map((val) => {
        contentData.push({
          contentId: val.contentId,
          contentTitle: val.title,
          thumbnail: val.thumbnail,
        });
      });
    })
    .then(() => {
      return purchaseData.map((data) => {
        const purchaseContent = contentData.find(
          (content) => content.contentId === data.contentId
        );

        return {
          userId: req.params.userId,
          ...data,
          ...purchaseContent,
        };
      });
    })
    .then((purchasedContentData) => res.status(200).send(purchasedContentData));
};

module.exports = getUserPurchase;
