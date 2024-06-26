const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const Schema = mongoose.Schema;

const accountSchema = new Schema({
  creatorId: { type: String, required: true },
  payId: { type: String, required: true, unique: true },
  lastPayment: Date,
  amountPaid: { type: Number, required: true },
  bank: Number,
  remark: String, //TODO: make required true in production
});
accountSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("Account", accountSchema);
