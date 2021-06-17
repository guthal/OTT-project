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
        contentUrl: req.body[0].contentUrl[0].URL,
        createdAt: new Date(),
        weeks: req.body[0].weeks || 0,
        userId: req.body[0].creatorId,
        description: req.body[0].description,
        isAvailable: false,
        commission: req.body[0].commission || { b: 0, r: 0 },
        title: req.body[0].title,
        thumbnail: req.body[0].thumbnailUrl,
        type: getType(req.body[0].purchaseType),
        price: {
          b: Number(req.body[0].purchaseType.buy),
          r: Number(req.body[0].purchaseType.rent),
          w: Number(req.body[0].purchaseType.weekly),
        },
        tag: "tag",
        language: req.body[0].language,
        subtitleLanguage: req.body[0].subtitleLanguage,
        certificate: req.body[0].certificate,
      },
      (err, content) => {
        if (err || !content) {
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
        createdAt: new Date(),
        cast: req.body[0].cast,
        seasons: [],
        genre: req.body[0].genres,
        thumbnail: req.body[0].thumbnailUrl,
        language: req.body[0].language,
        subtitleLanguage: req.body[0].subtitleLanguage,
        certificate: req.body[0].certificate,
      },
      (err, series) => {
        if (err || !series) {
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
            isAvailable: false,
            title: req.body[0].title,
            description: req.body[0].description,
            thumbnail: req.body[0].thumbnailUrl,
            startContentId: "",
            commission: req.body[0].commission || { b: 0, r: 0 }, //dont forget to remove the b:0 r:0
            type: getType(req.body[0].purchaseType),
            createdAt: new Date(),
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

        return Content.create({
          contentId: v4(),
          cast: series.cast,
          genre: series.genre,
          contentUrl: req.body[0].contentUrl[0].URL,
          userId: req.body[0].creatorId,
          description: req.body[0].description,
          createdAt: new Date(),
          title: req.body[0].title,
          thumbnail: req.body[0].thumbnailUrl,
          type: season.type,
          price: season.price,
          seriesId: req.body[0].seriesId,
          contentSeriesInfo: {
            seasonId: season.seasonId,
            seasonNo: req.body[0].seasonNo,
            seasonName: season.title,
            seriesName: series.seriesName,
            episodeNo: currentEpisodeNo + 1,
          },
          language: series.language,
          subtitleLanguage: series.subtitleLanguage,
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
