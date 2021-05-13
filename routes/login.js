const router =require("express").Router();
const User=require("../model/User");

router.get("/", (req, res) => {
    res.render("login");
  });
  
router.post("/", (req, res) => {
    const user=new User({
      username:req.body.username,
      password:req.body.password
    });
    req.login(user,(err)=>{
      if(err){
        console.log("%s user has error %s ",user,err);
      }else{
        passport.authenticate("local")(req,res,()=>{
          console.log("user who logged in :",user);
          res.send("success: ");
        });
      }
    })
  });
  
module.exports=router;