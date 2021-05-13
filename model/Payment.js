const mongoose=require("mongoose"); 
const Schema = mongoose.Schema;
const paymentSchema = new Schema({
    payId: String,
    contentId: { type: String, ref: "Content" },
    userId: { type: String, ref: "User" },
    amount: { type: Number, ref: "Content" },
    date: Date,
    type: { type: String, ref: "Content" },
  });

  module.exports = mongoose.model("Payment", paymentSchema);