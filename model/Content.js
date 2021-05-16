const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const contentSchema = new Schema({
  contentId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  price: {
    b: Number,
    r: Number,
    w: Number,
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  weeks: Number,
  type: { type: String, required: true },
  genre: Array,
  tag: { type: String },
  thumbnail: String,
  start: Date,
  end: String,
  seriesId: {
    type: String,
    ref: "Series",
  },
  price: {
    b: Number,
    r: Number,
    w: Number,
  },
  cast: Array,
  duration: Number,
  ratings: Number,
  contentLanguage: String,
  ageRestriction: String,
  contentSeriesInfo: {
    seasonID: String,
    seriesName: String,
    seasonNo: Number,
    episodeNo: Number,
    seriesName: String,
  },
});
//make tag required later in production

module.exports = mongoose.model("Content", contentSchema);
