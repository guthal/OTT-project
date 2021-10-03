const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const contentSchema = new Schema({
  contentId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, required: true },
  genre: Array,
  tag: { type: String },
  thumbnail: String,
  createdAt: Date,
  isAvailable: Boolean,
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
  commission: {
    b: Number,
    r: Number,
    w: Number,
  },
  weeklyInfo: {
    //TODO:add insertion in backend
    weeklyStartAt: Date,
    weeks: Number,
    streamingCost: Number,
  },
  contentUrl: String,
  contentLanguage: String,
  ageRestriction: String,
  language: String,
  subtitleLanguage: String,
  certificate: String,
  contentSeriesInfo: {
    seasonId: String,
    seriesName: String,
    seasonNo: Number,
    episodeNo: Number,
    seasonName: String,
  },
});
//make tag required later in production

module.exports = mongoose.model("Content", contentSchema);
