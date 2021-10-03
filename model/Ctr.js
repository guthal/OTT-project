const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const Schema = mongoose.Schema;

const ctrSchema = new Schema({
  //   adsId: { type: String, required: true },
  userId: { type: String, required: true, unique: true },
  adsType: { type: String, required: true },
  page: { type: String, required: true },
  date: { type: Date, required: true },
});

ctrSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("Ctr", ctrSchema);
