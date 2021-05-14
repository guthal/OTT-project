const router =require("express").Router();
const User=require("../model/User");
const Content=require("../model/Content");

router
.route("/content/:userId")
.get((req, res) => {
  if(req.isAuthenticated() && req.user.utype==0){
    User.findOne({ userId: req.params.userId }, function (err, content) {
      res.render("weekly", {
        content: content.userId,
      });
    });
  }else{
    res.status(404).send("404 error page not found");
  }
})
.post((req, res) => {
    // console.log(req.path+" this is the user Id");
  if(req.isAuthenticated() && req.user.utype==0){
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
  }
});

module.exports=router;