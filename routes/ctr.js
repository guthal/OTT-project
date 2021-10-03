const router = require("express").Router();
const Ctr = require("../model/Ctr");
const User = require("../model/Ctr");
router.get("/", async (req, res) => {
  if (req.isAuthenticated()) {
    const uniqueClick = await Ctr.exists({
      userId: req.body.creatorId,
      adsType: req.body.ads,
      page: req.body.page,
      date: Date.now(),
    });
    // in date it will pass time Which will fail the logic so pass only date except for time
    if (uniqueClick) {
      Ctr.create(
        {
          userId: req.body.creatorId,
          adsType: req.body.ads,
          page: req.body.page,
          date: Date.now(),
        },
        (err, ctr) => {
          if (err || !ctr) {
            return res
              .status(400)
              .send({ message: "Failed to update content" });
          }
          return res.send({ content });
        }
      );
    }
  }
});
module.exports = router;
