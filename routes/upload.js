const router =require("express").Router();
const User=require("../model/User");
const Content=require("../model/Content");

router
.route("/content/:userId")
.get((req, res) => {
    User.findOne({ userId: req.params.userId }, function (err, content) {
      res.render("weekly", {
        content: content.userId,
      });
    });
})
.post((req, res) => {
    // console.log(req.path+" this is the user Id");
  
    const d = new Date();
    d.setDate(d.getDate() + req.body.hours * 7);
    const endDate = d.toString;
    // console.log(d+" value of d");
    // console.log(Date(endDate.toString())+" value of end date");
    // console.log(Date.now()+" Time of today");
  
    const content = new Content({
      contentId: v4(),
      userId: req.body.userId,
      ticket: req.body.ticket,
      title: req.body.title,
      description: req.body.description,
      weeks: req.body.weeks,
      genre: req.body.genre,
      start: Date.now(),
      end: endDate.toString(),
      tag: req.body.tag,
      type: req.body.type,
    });
    content.save((err) => {
      console.log("userId is: " + req.body.userId);
      if (err) {
        console.log(err);
      } else {
        res.redirect("/");
      }
    });
  });
  
  module.exports=router;