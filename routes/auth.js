const router = require("express").Router();
const User = require("../model/User");
const { v4 } = require("uuid");
const login = require("./login-util");
const nodemailer = require("nodemailer");

router.post("/", async (req, res) => {
  const userName = await User.findOne({ username: req.body.username });
  if (userName) return res.status(400).send("email already exists");

  await User.register(
    {
      userId: v4(),
      fname: req.body.fname,
      lname: req.body.lname,
      username: req.body.username,
      dateOfBirth: req.body.dateOfBirth,
      gender: req.body.gender,
      date: Date(Date.now()),
      utype: 2,
      verified: 0,
      reset: 0,
    },
    req.body.password,
    (err, user) => {
      if (err) {
        return res
          .status(400)
          .send({ code: 400, message: "Resource not found" });
      }
      // res.send(user);
      //mailing
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
        to: user.username, // TODO: email receiver
        subject: "Nodemailer - Test",
        html: `<h2>welcome ${user.fname} to Avscope</h2> <br> <h4>here is your verification link ${process.env.DOMAIN}/signup/email-verify/${user.userId}</h4>`,
        // text: "Wooohooo it works!!",
        //need to change the domain link later to avscope.in
      };

      // Step 3
      transporter.sendMail(mailOptions, (err, data) => {
        if (err) {
          return console.log("Error occurs:", err);
        }
        res.send(
          "please check your email account for verification and click on the given link!!"
        );
      });
      // login(req, res);
    }
  );
});

router.get("/verify/:id", async (req, res) => {
  const data = await User.find({ userId: req.params.id });
  if (data[0].verified) {
    res.send(`you are already verified ${data[0].fname}`);
  } else {
    await User.updateOne(
      { userId: data[0].userId },
      {
        $set: {
          verified: 1,
        },
      },
      err => {
        if (!err) {
          res.send(
            `thanks for the verification ${data[0].fname} you can now log back in ${err}`
          ); //or else redirect the user to the main page
        } else {
          res.send("Error: ", err);
        }
      }
    );
  }
});

module.exports = router;
