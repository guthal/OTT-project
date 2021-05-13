const mongoose=require("mongoose"); 
const passportLocalMongoose=require('passport-local-mongoose');
const Schema = mongoose.Schema;
//user info
const userSchema = new Schema({
    userId: {type:String,required:true,unique:true},
    email: { type: String, required: true,unique:true},
    password:String,
    username: { type: String, required: true},
    address:String,
    phone: { type: Number,unique:true},
    office: String,
    city: String,
    state:String,
    zip: Number,
    date: { type: Date, required: true },
    history: [{ type: String, ref: "Content" }],
    utype: { type: Number, required: true },
});
userSchema.plugin(passportLocalMongoose);

module.exports=  mongoose.model("User", userSchema);