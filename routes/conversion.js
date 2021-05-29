const router = require("express").Router();
const Content = require("../model/Content");
const Series = require("../model/Series");
const _ = require("lodash");
const moment = require("moment");
const { updateOne } = require("../model/Content");

router.get("/", (req, res) => {
  Content.find({ type: "w" }).exec((err, content) => {
    const weeklyContent = [];
    content.forEach((expires) => {
      var dates =
        expires.weeklyStartAt.getFullYear() +
        "-" +
        (expires.weeklyStartAt.getMonth() + 1) +
        "-" +
        expires.weeklyStartAt.getDate();
      const stuff = moment(dates, "YYYY-MM-DD").fromNow();
      if (stuff.search("hour") != -1) {
        date = parseInt(moment(dates, "YYYY-MM-DD").fromNow()) * 0.0417;
      } else {
        date = parseInt(moment(dates, "YYYY-MM-DD").fromNow());
      }
      if (date >= expires.weeks * 7) {
        const expired = moment(dates, "YYYY-MM-DD").fromNow();
        weeklyContent.push({
          contentId: expires.contentId,
          creatorId: expires.creatorId,
          title: expires.title,
          thumbnail: expires.thumbnail,
          expired: expired,
        });
      } else if (expires.weeks * 7 - date <= 7) {
        const remaining = expires.weeks * 7 - date;
        weeklyContent.push({
          contentId: expires.contentId,
          creatorId: expires.creatorId,
          title: expires.title,
          thumbnail: expires.thumbnail,
          remaining: remaining,
        });
      }
    });
    res.send(weeklyContent);
  });
});

//create post endpoint for conversion
router.post("/:productId", async (req, res) => {
  const getPurchaseType = () => {
    if (req.body.price.b >= 0 && req.body.price.r >= 0) return "br";
    if (req.body.price.b >= 0) return "b";
    if (req.body.price.r >= 0) return "r";
    if (req.body.price.w >= 0) return "w";
  };
  try {
    const updateData = {
      price: req.body.price,
      type: getPurchaseType(),
    };

    if (req.body.weeks) {
      updateData.weeks = req.body.weeks;
      updateData.weeklyStartAt = new Date();
    }
    let updatedContent;
    updatedContent = await Content.findOneAndUpdate(
      { contentId: req.params.productId },
      {
        $set: updateData,
      },
      { new: true }
    );

    if (!updatedContent) {
      throw new Error("incorrect content Id");
    }
    res.send(updatedContent);
  } catch (e) {
    console.log(e.message);
    res.status(400).send("Content Couldn't be updated");
  }
});

router.get("/availability", (req, res) => {
  const contentAvailability = [];
  Content.find({ isAvailable: false }, (err, contents) => {
    contents.forEach((available) => {
      if (available.contentSeriesInfo.seasonId) {
        contentAvailability.push({
          contentSeriesInfo: available.contentSeriesInfo,
          contentId: available.contentId,
          thumbnail: available.thumbnail,
          title: available.title,
          description: available.description,
        });
      } else {
        contentAvailability.push({
          contentId: available.contentId,
          thumbnail: available.thumbnail,
          title: available.title,
          description: available.description,
        });
      }
    });
    res.send(contentAvailability);
  });
});

router.post("/availability/:productId", async (req, res) => {
  try {
    let updatedContent;
    if (req.body.contentType === "content") {
      updatedContent = await Content.findOneAndUpdate(
        { contentId: req.params.productId },
        {
          $set: { isAvailable: req.body.isAvailable },
        },
        { new: true }
      );
    } else if (req.body.contentType === "series") {
      updatedContent = await Series.findOneAndUpdate(
        {
          "seasons.seasonId": req.params.productId,
        },
        {
          $set: { "seasons.$.isAvailable": req.body.isAvailable },
        },
        { new: true }
      );
    }
    if (!updatedContent) {
      throw new Error("incorrect content Id");
    }
    res.send(updatedContent);
  } catch (e) {
    console.log(e.message);
    res.status(400).send("Content Couldn't be updated");
  }
});

module.exports = router;
