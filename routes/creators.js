//utype 0-admin, 1-makers,2-audience
//"/cretors" is an admin panel
const router =require("express").Router();
const User=require("../model/User");

router.get("/", (req, res) => {
    User.find({ utype: 1 }, (err, users) => {
      if (err || !users)
        return res.status(400).send({ code: 400, message: "Resource not found" });
      return res.send(users);
    });
  });
  
module.exports=router;