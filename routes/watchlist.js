const router = require("express").Router();
const Content = require("../model/Content");
const User = require("../model/User");

router.get("/:userId", (req, res) => {
  if (req.isAuthenticated()) {
    let watchlist;
    const watchlistData = [];
    return User.findOne({ userId: req.params.userId }, (err, userData) => {
      if (err || !userData) {
        return res.status(404).send({ code: 404, message: "User not found" });
      }
    })
      .then(userData => {
        watchlist = userData.watchlist;
      })
      .then(() => {
        return Content.find({ contentId: watchlist }, (err, content) => {
          if (err || !content)
            return res
              .status(404)
              .send({ code: 404, message: "Content not available" });
        });
      })
      .then(contents => {
        contents.forEach(content => {
          watchlistData.push({
            contentId: content.contentId,
            contentTitle: content.title,
            thumbnail: content.thumbnail,
          });
        });
      })
      .then(() => {
        res.status(200).send(watchlistData);
      });
  } else {
    res.status(401).send({ code: 401, message: "User not Authenticated" });
  }
});

router.post("/:userId", (req, res) => {
  if (req.isAuthenticated()) {
    User.find(
      {
        userId: req.params.userId,
        watchlist: {
          $in: req.body.contentId,
        },
      },
      (err, userData) => {
        return userData;
      }
    )
      .then(userData => {
        if (userData[0]) {
          return res.status(400).send("Content Already in Watchlist");
        }
        User.updateOne(
          { userId: req.params.userId },
          {
            $push: {
              watchlist: req.body.contentId,
            },
          },
          (err, watchlistData) => {
            if (err || !watchlistData) {
              return res
                .status(404)
                .send({ code: 404, message: "User not Found" });
            }
            return res.status(200).send("Added to your Watchlist");
          }
        );
      })
      .catch(err => {
        res.status(400).send(err.message);
      });
  } else {
    return res
      .status(401)
      .send({ code: 401, message: "User not Authenticated" });
  }
});

router.delete("/:userId/content/:contentId", (req, res) => {
  if (req.isAuthenticated()) {
    User.findOneAndUpdate(
      { userId: req.params.userId },
      {
        $pull: {
          watchlist: req.params.contentId,
        },
      },
      (err, userData) => {
        if (err || !userData) {
          return res.status(400).send("Could not delete");
        }
        return res.status(200).send("Deleted Successfully");
      }
    );
  }
});

module.exports = router;
