const router =require("express").Router();
const User=require("../model/User");

router.get("/", function (req, res) {
    res.render("fm-register");
  });
  
router.post("/", (req, res) => {
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
  });
  
module.exports=router;