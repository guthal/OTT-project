const router = require("express").Router();
const User = require("../model/User");
const Content = require("../model/Content");

router.get("/", (req, res) => {
  if (req.isAuthenticated()) {
    console.log("user who logged into contents: ", req.user);
    Content.find({})
      .sort({ title: "asc" })
      .exec((err, contents) => {
        if (err || !contents)
          return res
            .status(404)
            .send({ code: 404, message: "Resource not found" });
        const data = contents.map(val => {
          return {
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
          };
        });
        res.send(data);
      });
  } else {
    console.log(req.isAuthenticated()); //false
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
        genres,
        cast,
        tag,
        seriesId,
        contentSeriesInfo,
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
        genres,
        cast,
        tag,
        seriesId,
        contentSeriesInfo,
      });
    });
  } else {
    console.log(req.isAuthenticated()); //false
    res.status(404).send({ code: 404, message: "user is not authenticated" });
  }
});

module.exports = router;
