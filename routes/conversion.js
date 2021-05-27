const router = require("express").Router();
const Content = require("../model/Content");
const Series = require("../model/Series");
const _ = require("lodash");
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

router.get("/availability", (req, res) => {
  const contentAvailability = [];
  Content.find({ isAvailable: false }, (err, contents) => {
    contents.forEach((available) => {
      console.log(
        "available content: ",
        _.isEmpty(available.contentSeriesInfo.seasonId)
      );
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

module.exports = router;
