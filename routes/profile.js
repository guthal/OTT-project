const router =require("express").Router();
// const User=require("../model/User");
const Content=require("../model/Content");

router.get("/profile/:userId", (req, res) => {
    if(req.isAuthenticated()&& req.user.utype==(1 || 0) && req.user.userId===req.params.userId){
      Content.find({ userId: req.params.userId }, (err, weeks) => {
        res.render("fm-profile", {
          weeks: weeks,
        });
      });
    }else{
      res.status(500).send({code:500,message:"User not authenticated"});
    }
  });
  
module.exports=router;