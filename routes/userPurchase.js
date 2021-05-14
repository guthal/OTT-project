const router =require("express").Router();
const User=require("../model/User");
const Content=require("../model/Content");
const Payment=require("../model/Payment");


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
  
  // test with this user f524e638-0c83-42f8-b954-0da734c41fa5
  //passing the whole content as response need to see how to send only the reqired ones
router.get("/:userId", (req, res) => {
  if(req.isAuthenticated() && req.user.userId===req.params.userId){
    getUserPurchase(req, res);
  }else{
    res.send("User not authenticated");
  }
});
  
router.get("/:userId/contents/:contentId", (req, res) => {
  if(req.isAuthenticated() && req.user.userId===req.params.userId){
    getUserPurchase(req, res, req.params.contentId);
  }else{
    res.send("User not authenticated");
  }
});
  
module.exports=router;