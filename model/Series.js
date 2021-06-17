const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const seriesSchema = new Schema({
  userId: String,
  seriesId: { type: String, required: true, unique: true },
  seriesName: String,
  description: String,
  totalSeasons: Number,
  cast: Array,
  ratings: Number,
  contentLanguage: String,
  createdAt: Date,
  ageRestriction: String,
  genre: Array,
  type: String,
  language: String,
  subtitleLanguage: String,
  category: String,
  price: {
    b: Number,
    r: Number,
    w: Number,
  },
  seasons: Array, //need to add isAvailable flag into season array and commission
  thumbnail: String,
});

module.exports = mongoose.model("Series", seriesSchema);
