const router = require("express").Router();
const getUserPurchase = require("./user-purchase-utils");

// test with this user f524e638-0c83-42f8-b954-0da734c41fa5
//passing the whole content as response need to see how to send only the reqired ones
router.get("/:userId", (req, res) => {
  if (req.isAuthenticated() && req.user.userId === req.params.userId) {
    getUserPurchase(req, res);
  } else {
    res.send("User not authenticated");
  }
});

router.get("/:userId/contents/:contentId", (req, res) => {
  if (req.isAuthenticated() && req.user.userId === req.params.userId) {
    getUserPurchase(req, res, req.params.contentId);
  } else {
    res.send("User not authenticated");
  }
});

module.exports = router;
