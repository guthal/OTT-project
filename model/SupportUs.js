const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const supportUsSchema = new Schema({
  userId: { type: String, required: true },
  orderId: { type: String, required: true },
  paymentId: { type: String, required: true, unique: true },
  amountPaid: { type: Number, required: true },
  amountDate: Date,
});

module.exports = mongoose.model("SupportUs", supportUsSchema);
