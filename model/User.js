const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require("mongoose-findorcreate");
const Schema = mongoose.Schema;
//user info
const userSchema = new Schema({
  userId: { type: String, required: true, unique: true },
  fname: String,
  lname: String,
  password: String,
  username: { type: String, unique: true },
  dateOfBirth: Date,
  gender: String,
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
  reset: Boolean,
  googleId: String,
  supportUsHistory: [
    {
      orderId: String,
      supportUsDate: Date,
      amount: Number,
    },
  ],
});
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
module.exports = mongoose.model("User", userSchema);
