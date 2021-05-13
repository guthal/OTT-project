const mongoose=require("mongoose"); 
const Schema = mongoose.Schema;
const seriesSchema = new Schema({
    seriesId: String,
    seriesName: String,
    totalSeasons: Number,
    cast: [
      {
        role: String,
        name: String,
      },
    ],
    ratings: Number,
    contentLanguage: String,
    ageRestriction: String,
    genres: Array,
    seasons: Array,
  });

  module.exports=  mongoose.model("Series", seriesSchema);