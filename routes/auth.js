const router =require("express").Router();
const User=require("../model/User");
const { v4, stringify } = require("uuid");
const passport =require('passport');

router.post("/",async (req,res)=>{

    const emailExist=await User.findOne({email:req.body.email});
    if(emailExist) return res.status(400).send("email already exists");

    await User.register(
        ({
          userId:v4(),
          email:req.body.email,
          username:req.body.username,
          date:Date.now(),
          utype:2
        }),
        req.body.password,
        (err,user)=>{
        if (err){
          console.log("there is an error: ",err);
          console.log(req.body.username);
          return res.status(400).send({ code: 400, message: "Resource not found" });
        }else{
          passport.authenticate("local")(req,res,()=>{
            console.log("UserId is: %s, user utype: %i",req.user.userId,req.user.utype);
            res.redirect("/contents");
          })
      }
    });
  });

  module.exports=router;
  