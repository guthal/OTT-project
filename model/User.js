const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const Schema = mongoose.Schema;
//user info
const userSchema = new Schema({
  userId: { type: String, required: true, unique: true },
  fname: { type: String, required: true },
  lname: { type: String, required: true },
  password: String,
  username: { type: String, required: true, unique: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, required: true },
  address: String,
  phone: { type: Number, unique: true },
  office: String,
  city: String,
  state: String,
  zip: Number,
  pan: String,
  bank: Number,
  date: { type: Date, required: true },
  history: [
    {
      contentType: String,
      productId: String,
      date: Date,
      count: Number,
    },
  ],
  watchlist: [{ type: String }],
  utype: { type: Number, required: true },
  verified: { type: Boolean, required: true },
  reset: { type: Boolean, required: true },
});
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
