const router = require("express").Router();
const User = require("../model/User");
const Content = require("../model/Content");

router.get("/", (req, res) => {
  if (req.isAuthenticated()) {
    const videoData = [];
    Content.find({})
      .sort({ title: "asc" })
      .exec((err, contents) => {
        if (err || !contents)
          return res
            .status(404)
            .send({ code: 404, message: "Resource not found" });
        contents.forEach((val) => {
          videoData.push({
            id: val.contentId,
            title: val.title,
            description: val.description,
            type: val.type,
            price: val.price,
            genre: val.genre,
            tag: val.tag,
            thumbnail: val.thumbnail,
            seriesId: val.seriesId,
            contentSeriesInfo: val.contentSeriesInfo,
            isAvailable: val.isAvailable,
            weeks: val.weeks,
            weeklyStartAt: val.weeklyStartAt,
          });
        });
        res.send(videoData);
      });
  } else {
    res.status(404).send({ code: 404, message: "user is not authenticated" });
  }
});

// render content description, title button w.r.t to the business logic
router.get("/:contentId", (req, res) => {
  if (req.isAuthenticated()) {
    Content.find({ contentId: req.params.contentId }, (err, content) => {
      if (err || !(content && content[0]))
        return res
          .status(404)
          .send({ code: 404, message: "Resource not found" });

      const {
        contentId,
        title,
        description,
        type,
        price,
        thumbnail,
        duration,
        rating,
        contentLanguage,
        ageRestriction,
        genre,
        cast,
        tag,
        seriesId,
        contentSeriesInfo,
        contentUrl,
      } = content[0];
      res.send({
        id: contentId,
        title,
        description,
        type,
        price,
        thumbnail,
        duration,
        rating,
        contentLanguage,
        ageRestriction,
        genre,
        cast,
        tag,
        seriesId,
        contentSeriesInfo,
        contentUrl,
      });
    });
  } else {
    res.status(404).send({ code: 404, message: "user is not authenticated" });
  }
});

module.exports = router;
