const router = require("express").Router();
const User = require("../model/User");
const Content = require("../model/Content");

router.get("/", (req, res) => {
  Content.find({ type: "w" }).exec((err, content) => {
    // console.log(content);
    content.map((expires) => {
      //   console.log("expires: ", expires.date);
    });
  });
});

module.exports = router;
