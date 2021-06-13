const router = require("express").Router();
const User = require("../model/User");
const nodemailer = require("nodemailer");

router.post("/", async (req, res) => {
  //TODO: add isAuthenticated
  // add a flag to reset password
  //mailing
  const userExist = await User.findOne({ username: req.body.username });
  if (userExist) {
    if (!userExist.reset) {
      await User.updateOne(
        { username: req.body.username },
        {
          $set: {
            reset: 1,
          },
        },
        err => {
          if (!err) {
            res.send(`please check the email inbox so you can now log back in`); //or else redirect the user to the main page
          } else {
            res.send("Error: ", err);
          }
        }
      );
      let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL || "abc@gmail.com", // TODO: your gmail account
          pass: process.env.PASSWORD || "1234", // TODO: your gmail password
        },
      });

      // Step 2
      let mailOptions = {
        from: process.env.EMAIL, // TODO: email sender
        to: req.body.username, // TODO: email receiver
        subject: "Nodemailer - Test",
        html: `<h2>Hello!! </h2> <br> <h4>here is your reset link please click to change the password ${process.env.DOMAIN}/forgot-password/reset/${userExist.userId}</h4>`,
        // text: "Wooohooo it works!!",
        //need to change the domain link later to avscope.in
      };

      // Step 3
      transporter.sendMail(mailOptions, (err, data) => {
        if (err) {
          return console.log("Error occurs:", err);
        }
        res.send("reset link sent");
      });
    } else {
      res.send("link sent already");
    }
  } else {
    res.send("non-existent username");
  }
});

router.post("/reset/:id", async (req, res) => {
  //TODO: add isAuthenticated
  const data = await User.findOne({ userId: req.params.id });
  //TODO: check for asyn await
  if (data.reset) {
    data.setPassword(req.body.newPassword, () => {
      data.save();
      // res.status(200).json({ message: "password reset successful" });
    });
    User.updateOne(
      { userId: data.userId },
      {
        $set: {
          reset: 0,
        },
      },
      err => {
        if (!err) {
          res
            .status(200)
            .send({ message: "password reset and flag set to false" });
        }
      }
    );
  } else {
    res.send("please go back to your login"); //redirect to login
  }
});

module.exports = router;
