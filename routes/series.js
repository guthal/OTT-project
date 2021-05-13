const router =require("express").Router();
const Content=require("../model/Content");
const Series=require("../model/Series");

router.get("/", (_req, res) => {
    Series.find({}).exec((err, series) => {
      if (err || !series)
        return res.status(404).send({ code: 404, message: "Resource not found" });
  
      return res.send(series);
    });
  });
  
router.get("/:seriesId/seasons", (req, res) => {
    Series.find({ seriesId: req.params.seriesId }).exec((err, series) => {
      if (err || !series[0])
        return res.status(404).send({ code: 404, message: "Resource not found" });
  
      const seriesName = series[0].seriesName;
      const seriesId = series[0].seriesId;
  
      return res.send({
        seriesId,
        seriesName,
        seasons: series[0].seasons,
      });
    });
  });
  
router.get("/seasons", (_req, res) => {
    Series.find({}).exec((err, series) => {
      if (err || !series[0])
        return res.status(404).send({ code: 404, message: "Resource not found" });
  
      const seriesName = series[0].seriesName;
      const seriesId = series[0].seriesId;
  
      return res.send({
        seriesId,
        seriesName,
        seasons: series[0].seasons,
      });
    });
  });
  
router.get("/:seriesId", (req, res) => {
    Series.find({ seriesId: req.params.seriesId }).exec((err, series) => {
      if (err || !series)
        return res.status(404).send({ code: 404, message: "Resource not found" });
  
      res.send(series);
    });
  });
  
  // Get contents of a particular Series
router.get("/:seriesId/contents", (req, res) => {
    Content.find({ seriesId: req.params.seriesId })
      .sort({ seasonNo: "asc", episodeNo: "asc" })
      .exec((err, seriesContents) => {
        if (err || !seriesContents)
          return res
            .status(404)
            .send({ code: 404, message: "Resource not found" });
  
        const data = seriesContents.map((val) => {
          return {
            id: val.contentId,
            title: val.title,
            description: val.description,
            type: val.type,
            price: val.price,
            tag: val.tag,
            thumbnail: val.thumbnail,
            duration: val.duration,
            rating: val.rating,
            contentLanguage: val.contentLanguage,
            ageRestriction: val.ageRestriction,
            genres: val.genres,
            cast: val.cast,
            seriesId: val.seriesId,
            contentSeriesInfo: val.contentSeriesInfo,
          };
        });
        return res.send(data);
      });
  });
  
module.exports=router;