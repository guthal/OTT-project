const router =require("express").Router();
const User=require("../model/User");

router.get("/", function (req, res) {
  if(req.isAuthenticated()){
    if(req.user.utype===0){
      res.send("fm-register")
    }else{
      res.status(404).status("no page exists like that");
    }
  }else{
    res.status(400).send("User not authenticated")
  }
});
  
router.post("/", (req, res) => {
  if(req.isAuthenticated() && req.user.utype===0){
    const user = new User({
      userId: v4(),
      email: req.body.email,
      user: req.body.user,
      phone: req.body.phone,
      address: req.body.address,
      office: req.body.office || null,
      city: req.body.city,
      state: req.body.state,
      zip: req.body.zip,
      date: Date.now(),
      utype: 1,
    });
    user.save(function (err) {
      if (!err) {
        res.redirect("/contents");
      } else {
        console.log(err);
      }
    });
   }
});
  
module.exports=router;