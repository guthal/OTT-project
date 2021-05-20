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
            seasonId: season.seasonId,
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
      .then(() => {
        return res.send({ message: "success" });
      })
      .catch((err) => {
        res.status(400).send(err.message);
      });
  }
});

module.exports = router;
