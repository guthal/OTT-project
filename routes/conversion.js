const router = require("express").Router();
const User = require("../model/User");
const Content = require("../model/Content");
const Payment = require("../model/Payment");
const moment = require("moment");

router.get("/pay", (req, res) => {
  Payment.find({}, (err, result) => {
    // console.log("result Date: ", result[0].date.getFullYear());
    var date =
      result[0].date.getFullYear() +
      "-" +
      (result[0].date.getMonth() + 1) +
      "-" +
      result[0].date.getDate();
    if (parseInt(moment(date, "YYYY-MM-DD").fromNow()) <= 2) {
      console.log(
        "relative time: ",
        parseInt(moment(date, "YYYY-MM-DD").fromNow())
      );
    } else {
      console.log("not too old");
    }
  });
});

router.get("/", (req, res) => {
  Content.find({ type: "w" }).exec((err, content) => {
    const data = content.map((expires) => {
      //   console.log("dates: ", expires.start);
      var dates =
        expires.start.getFullYear() +
        "-" +
        (expires.start.getMonth() + 1) +
        "-" +
        expires.start.getDate();
      const stuff = moment(dates, "YYYY-MM-DD").fromNow();
      //   console.log(`${expires.title} is ${stuff.search("hours")}`);
      if (stuff.search("hour") != -1) {
        date = parseInt(moment(dates, "YYYY-MM-DD").fromNow()) * 0.0417;
      } else {
        date = parseInt(moment(dates, "YYYY-MM-DD").fromNow());
      }
      if (date >= expires.weeks * 7) {
        const expired = moment(dates, "YYYY-MM-DD").fromNow();
        return {
          contentId: expires.contentId,
          creatorId: expires.creatorId,
          title: expires.title,
          thumbnail: expires.thumbnail,
          expired: expired,
        };
      } else if (expires.weeks * 7 - date <= 7) {
        const remaining = expires.weeks * 7 - date;
        return {
          contentId: expires.contentId,
          creatorId: expires.creatorId,
          title: expires.title,
          thumbnail: expires.thumbnail,
          remaining: remaining,
        };
      }
    });
    res.send(data);
  });
});

module.exports = router;
