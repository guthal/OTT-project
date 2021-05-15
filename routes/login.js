const router =require("express").Router();
const User=require("../model/User");
const passport =require('passport');
const session =require('express-session');
const app=require("../expressapp");

router.post("/", async(req, res) => {
    const userName=await User.findOne({username:req.body.username});
  if(!userName) {
      console.log("session data: ",req.session);
      return res.status(401).send("email does not xists")
    }else{
    const user=new User({
      username:req.body.username,
      password:req.body.password
    })
    req.login(user,(err)=>{
      if(err){
        console.log("%s user has error %s ",user,err);
      }else{
        passport.authenticate("local")(req,res,()=>{
          console.log("user who logged in :",user);
          //should map the response 
          //but will do it after the proper user is registered  
          res.send(req.user);
        });
      }
    })
  }
});
  
module.exports=router;