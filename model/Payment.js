const mongoose=require("mongoose"); 
const Schema = mongoose.Schema;
const paymentSchema = new Schema({
    payId: {type:String,required:true},
    contentId: { type: String, ref: "Content" },
    userId: { type: String, ref: "User" },
    amount: {type:Number,required:true},
    date: {type:Date,required:true},
    orderId: {type:String,required:true},
    signature:{type:String,required:true},
    type: {type:String,required:true},
    success: {type:Boolean,required:true}
  });

  module.exports = mongoose.model("Payment", paymentSchema);