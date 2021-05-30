const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const Schema = mongoose.Schema;

const accountSchema = new Schema({
  creatorId: { type: String, required: true, unique: true },
  payId: { type: String, required: true, unique: true },
  lastPayment: Date,
  commission: Number,
  amountPaid: Number,
  bank: Number,
});
accountSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("Account", accountSchema);
