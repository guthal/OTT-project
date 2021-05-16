const router = require("express").Router();
const User = require("../model/User");
const passport = require("passport");
const login= require("./login-util")
// router.get("/", (req, res) => {
//   res.render("login");
// });




router.get("/verify",(req,res)=>{
  // try {
  //   console.log("verify endpoint: ");
  //   res.send("hey");
    
  // } catch (error) {
  //   console.log(error);
  // }
  console.log("hey")
  console.log(req.isAuthenticated());
  if(req.isAuthenticated()){
      User.findById({userId:req.user.userId},(err,user)=>{
        if (err || !(user))
        return res
          .status(401)
          .send({ code: 401, message: "User Unauthorized" });
      })
      return res.send({...req.user,
        fname: user.fname,
        lname: user.lname
      })
  }else{
    res.status(401).send();
  }
});

router.post("/", (req, res) => {
  // return res.send("login bypassed");
  login(req, res);
});



module.exports = router;
// module.exports = login;
