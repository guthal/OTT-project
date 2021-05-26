const router = require("express").Router();
const Content = require("../model/Content");
const moment = require("moment");

router.get("/", (req, res) => {
  Content.find({ type: "w" }).exec((err, content) => {
    const weeklyContent = [];
    content.forEach((expires) => {
      var dates =
        expires.start.getFullYear() +
        "-" +
        (expires.start.getMonth() + 1) +
        "-" +
        expires.start.getDate();
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

router.get("/");

module.exports = router;
