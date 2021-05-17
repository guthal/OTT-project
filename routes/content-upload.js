const router = require("express").Router();
const User = require("../model/User");
const Content = require("../model/Content");
const Series = require("../model/Series");
const { v4 } = require("uuid");

router.post("/", (req, res) => {
  const action = req.body[0].action;

  const getType = (purchaseType) => {
    if (purchaseType.buy > 0 && purchaseType.rent > 0) return "br";
    if (purchaseType.buy > 0) return "b";
    if (purchaseType.rent > 0) return "r";
    if (purchaseType.weekly > 0) return "w";
  };

  if (action === "create_content") {
    Content.create(
      {
        contentId: v4(),
        cast: req.body[0].cast,
        genre: req.body[0].genres,
        contentUrl: req.body[0].contentUrl,
        userId: req.body[0].creatorId,
        description: req.body[0].description,
        title: req.body[0].title,
        thumbnail: req.body[0].thumbnailUrl,
        type: getType(req.body[0].purchaseType),
        price: {
          b: Number(req.body[0].purchaseType.buy),
          r: Number(req.body[0].purchaseType.rent),
          w: Number(req.body[0].purchaseType.weekly),
        },
        tag: "tag",
      },
      (err, content) => {
        if (err || !content) {
          console.log(err);
          return res.status(400).send({ message: "Failed to create Content" });
        }
        return res.send({ content });
      }
    );
  } else if (action === "create_series") {
    Series.create(
      {
        seriesId: v4(),
        userId: req.body[0].creatorId,
        seriesName: req.body[0].title,
        description: req.body[0].description,
        cast: req.body[0].cast,
        seasons: [],
        genre: req.body[0].genres,
        thumbnail: req.body[0].thumbnailUrl,
      },
      (err, series) => {
        if (err || !series) {
          console.log(err);
          return res.status(400).send({ message: "Failed to create Series" });
        }
        return res.send({ series });
      }
    );
  } else if (action === "create_season") {
    Series.updateOne(
      { seriesId: req.body[0].seriesId },
      {
        $set: { totalSeasons: 1 },
        $push: {
          seasons: {
            seasonId: v4(),
            seasonNo: req.body[0].seasonNo,
            title: req.body[0].title,
            description: req.body[0].description,
            thumbnail: req.body[0].thumbnailUrl,
            startContentId: "",
            type: getType(req.body[0].purchaseType),
            price: {
              b: Number(req.body[0].purchaseType.buy),
              r: Number(req.body[0].purchaseType.rent),
              w: Number(req.body[0].purchaseType.weekly),
            },
          },
        },
      }
    ).exec((err, series) => {
      if (err || !series) {
        console.log(err);
        return res.status(400).send({ message: "Failed to create season" });
      }
      return res.send({ series });
    });
  } else if (action === "create_episode") {
    let currentEpisodeNo;
    Content.find({ seriesId: req.body[0].seriesId })
      .then((contents) => {
        const episodeList = contents
          .filter(
            (content) =>
              content.contentSeriesInfo.seasonNo === req.body[0].seasonNo
          )
          .map((content) => content.contentSeriesInfo.episodeNo);
        currentEpisodeNo = Math.max(...episodeList, 0);
      })
      .then(() => {
        return Series.findOne({ seriesId: req.body[0].seriesId });
      })
      .then((series) => {
        const seasons = series.seasons;
        const season = seasons.find(
          (season) => season.seasonNo === req.body[0].seasonNo
        );
        return season;
      })
      .then((season) => {
        return Content.create({
          contentId: v4(),
          cast: req.body[0].cast,
          genre: req.body[0].genres,
          contentUrl: req.body[0].contentUrl,
          userId: req.body[0].creatorId,
          description: req.body[0].description,
          title: req.body[0].title,
          thumbnail: req.body[0].thumbnailUrl,
          type: season.type,
          price: season.price,
          seriesId: req.body[0].seriesId,
          contentSeriesInfo: {
            seasonNo: req.body[0].seasonNo,
            episodeNo: currentEpisodeNo + 1,
          },
        });
      })
      .then((content) => {
        if (content.contentSeriesInfo.episodeNo === 1) {
          return Series.findOneAndUpdate(
            {
              seriesId: req.body[0].seriesId,
              "seasons.seasonNo": req.body[0].seasonNo,
            },
            {
              $set: { "seasons.$.startContentId": content.contentId },
            }
          );
        } else return Promise.resolve();
      })
      .then((content) => {
        res.send(content);
      })
      .catch((err) => {
        res.status(400).send(err.message);
      });
  }
});

router
  .route("/content/:userId")
  .get((req, res) => {
    if (req.isAuthenticated() && req.user.utype == 0) {
      User.findOne({ userId: req.params.userId }, function (err, content) {
        res.render("weekly", {
          content: content.userId,
        });
      });
    } else {
      res.status(404).send("404 error page not found");
    }
  })
  .post((req, res) => {
    // console.log(req.path+" this is the user Id");
    if (req.isAuthenticated() && req.user.utype == 0) {
      const content = new Content({
        contentId: v4(),
        userId: req.body[0].userId,
        ticket: req.body[0].ticket,
        title: req.body[0].title,
        description: req.body[0].description,
        weeks: req.body[0].weeks,
        genre: req.body[0].genre,
        start: Date.now(),
        end: endDate.toString(),
        tag: req.body[0].tag,
        type: req.body[0].type,
      });
      content.save((err) => {
        console.log("userId is: " + req.body[0].userId);
        if (err) {
          console.log(err);
        } else {
          res.redirect("/");
        }
      });
    }
  });

module.exports = router;
