let ejs = require("ejs");
let pdf = require("html-pdf");
let path = require("path");
const Payment = require("../model/Payment");
const Content = require("../model/Content");
const nodemailer = require("nodemailer");
const { getMaxListeners } = require("../model/Payment");
const fs = require("fs");

const pdfGen = (req, res) => {
  const contentInfo = [];
  return (
    Payment.aggregate(
      [
        {
          $match: {
            creatorId: "f19e82a0-12ab-4890-8955-4d81abc1b7d6", //TODO: req.body.creatorId
            date: {
              $gte: new Date("2021-05-01T00:00:00.000+00:00"),
              $lte: new Date("2021-06-06T23:59:59.000+00:00"),
            },
          },
        },
        {
          $project: {
            productId: 1,
            date: 1,
            purchaseType: 1,
            amount: 1,
            commission: 1,
            commissiongen: { $multiply: ["$commission", "$amount"] },
            revenue: { $sum: "$amount" },
          },
        },
        {
          $project: {
            productId: 1,
            date: 1,
            purchaseType: 1,
            amount: 1,
            earnings: { $subtract: ["$revenue", "$commissiongen"] },
            revenue: { $sum: "$amount" },
          },
        },
        {
          $group: {
            _id: {
              productId: "$productId",
              date: {
                $dateToString: { format: "%Y-%m-%d", date: "$date" },
              },
              purchaseType: "$purchaseType",
            },
            revenue: {
              $sum: "$revenue",
            },
            earnings: {
              $sum: "$earnings",
            },
          },
        },
      ],
      (err, result) => {
        if (err || !result) {
          return res.status(400).send({ message: "no information" });
        }
      }
    )
      // .exec((err, result) => {
      //   if (err) {
      //     return res.status(400).send(err);
      //   }
      //   console.log("result: ", result);
      //   return result;
      // })
      .then((result, err) => {
        // console.log("result: ", result[0]._id.date);
        if (err) {
          return res.status(400).send(err);
        }
        result.map((val) => {
          contentInfo.push({
            productId: val._id.productId,
            date: val._id.date,
            purchaseType: val._id.purchaseType,
            revenue: val.revenue,
            earnings: val.earnings,
          });
        });
        console.log("contetnt Info: ", contentInfo);
        // console.log(contentInfo[0].title);
        ejs.renderFile(
          path.join(__dirname, "../views/", "template.ejs"),
          { payment: contentInfo },
          (err, data) => {
            if (err) {
              res.send(err);
            } else {
              let options = {
                height: "11.25in",
                width: "8.5in",
                header: {
                  height: "20mm",
                },
                footer: {
                  height: "20mm",
                },
              };
              pdf
                .create(data, options)
                .toFile("../ott-project/reportearn4.pdf", function (err, data) {
                  //TODO: add req.body.username append username and from date and To date to the filename
                  if (err) {
                    return res.send(err);
                  } else {
                    return res.send({ status: "success", data: data });
                  }
                });
            }
          }
        );
      })
      .then(() => {
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
          to: "hpm34524@eoopy.com" || "vg931697@gmail.com", // TODO: email receiver
          subject: "Nodemailer - Test",
          text: "Wooohooo it works!!",
          attachments: [
            { filename: "reportearn4.pdf", path: "./reportearn4.pdf" }, // TODO: replace it with your own image
          ],
        };

        // Step 3
        transporter.sendMail(mailOptions, (err, data) => {
          if (err) {
            return console.log("Error occurs:", err);
          }
          fs.unlink("../ott-project/reportearn4.pdf", (err) => {
            if (err) {
              throw err;
            }
            res.send({
              code: "success",
              message: "email sent and file deleted",
            });
          });
        });
      })
  );
};

module.exports = pdfGen;
