const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const Schema = mongoose.Schema;

const accountSchema = new Schema({
  creatorId: { type: String, required: true },
  payId: { type: String, required: true, unique: true },
  lastPayment: { type: Date, required: true },
  amountPaid: { type: Number, required: true },
  bank: Number,
});
accountSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("Account", accountSchema);
